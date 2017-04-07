package com.archibus.app.common.bulkprint;

import java.io.*;
import java.util.*;

import com.archibus.context.ContextStore;
import com.archibus.ext.report.ReportUtility;
import com.archibus.jobmanager.*;
import com.archibus.jobmanager.JobStatus.JobResult;
import com.archibus.utility.*;
import com.aspose.pdf.kit.PdfFileEditor;

/**
 * PDF File Printer class: output documents to pdf file(s) and put link to jab status.
 * 
 * @author ZY
 * @since 20.1
 * 
 */
public class PdfPrinter {
    
    /**
     * Constant: Error message for exception when merge individual pdf files to one.
     */
    // @translatable
    private static final String MESSAGE_MERGE_PDF_ERROR = "Could not merge the pdf file(s).";
    
    /**
     * Constant: suffix string indicates the pdf format.
     */
    private static final String PDF_SUFFIX = ".pdf";
    
    /**
     * Process the whole Inputstream list retrieve from all documents records and print them to
     * single PDF file or multiple PDF files(if total file size is over limit).
     * 
     * @param docList input stream list of documents
     * @param status job status
     * @param limitSize file's max size
     */
    public void outputPdf(final List<InputStream> docList, final JobStatus status,
            final long limitSize) {
        
        // initial total size limit
        final long totalLimit = limitSize > 0 ? limitSize : BulkPrintHelper.getSizeLimit();
        
        long totalSize = 0;
        
        // initial path to locate generated pdf file(s)
        final String filePath = ReportUtility.getReportFilesStorePath(ContextStore.get());
        
        // initial input-stream list that will be used to output a single pdf file within the size
        // limit
        List<InputStream> tempList = new ArrayList<InputStream>();
        
        // initial Aspose PDF Editor object
        final PdfFileEditor editor = new PdfFileEditor();
        
        try {
            // for each input-stream of PDF type files
            for (final InputStream ins : docList) {
                
                // if total size by adding current pdf file over the size limit
                if (totalLimit > 0 && totalSize > 0 && (ins.available() + totalSize) > totalLimit) {
                    
                    // output current input-stream list to a singel pdf file
                    this.outputSinglePdfFile(filePath, tempList, editor, status);
                    
                    // reset total size and input-stream list
                    totalSize = 0;
                    tempList = new ArrayList<InputStream>();
                    
                    // if size is not over the limit
                } else {
                    // add current input-stream to list
                    tempList.add(ins);
                    // adjust total size of whole input-stream list
                    totalSize = totalSize + ins.available();
                    
                }
            }
            
            // at final step output current input-stream list to a singel pdf file
            this.outputSinglePdfFile(filePath, tempList, editor, status);
            
        } catch (final IOException originalException) {
            
            final ExceptionBase exception =
                    ExceptionBaseFactory.newNonTranslatableException(MESSAGE_MERGE_PDF_ERROR, null);
            
            exception.setNested(originalException);
            
            throw exception;
        }
        
    }
    
    /**
     * Private method: Output a single PDF document from input-stream list, and return file links
     * into result.
     * 
     * @param filePath local path for output file
     * @param tempList input-stream list
     * @param editor Aspose PdfFileEditor Object
     * @param status job status
     * 
     */
    private void outputSinglePdfFile(final String filePath, final List<InputStream> tempList,
            final PdfFileEditor editor, final JobStatus status) {
        
        // initial file name from current time in millisecond
        final String fileName = new Date().getTime() + PDF_SUFFIX;
        
        // new a local file output stream
        FileOutputStream outputStream;
        try {
            outputStream = new FileOutputStream(filePath + fileName);
            
            // initial a input-stream array
            final InputStream[] docs = new InputStream[tempList.size()];
            
            try {
                
                // by Aspose PDF api to merge all input-streams of list and output a singel pdf file
                editor.concatenate(tempList.toArray(docs), outputStream);
                
                // CHECKSTYLE:OFF Suppress IllegalCatch warning. Justification: third-party API
                // method throws a checked Exception, which needs to be wrapped in ExceptionBase
            } catch (final Exception originalException) {
                // CHECKSTYLE:ON
                
                final ExceptionBase exception =
                        ExceptionBaseFactory.newNonTranslatableException(
                            "Error when merge pdf files", null);
                
                exception.setNested(originalException);
                
                throw exception;
            } finally {
                // close file output stream
                outputStream.close();
                
            }
            
            // add generated pdf file link to job's result which will be shown in job result view
            status.addPartialResult(new JobResult("", fileName, ContextStore.get().getContextPath()
                    + ReportUtility.getPerUserReportFilesPath(ContextStore.get()) + fileName));
            
        } catch (final FileNotFoundException e) {
            final ExceptionBase exception =
                    ExceptionBaseFactory.newNonTranslatableException(
                        "Error when create output pdf file", null);
            
            exception.setNested(e);
            
            throw exception;
        } catch (final IOException e) {
            final ExceptionBase exception =
                    ExceptionBaseFactory.newNonTranslatableException(
                        "Error when finalize and close output pdf file", null);
            
            exception.setNested(e);
        }
    }
    
}
