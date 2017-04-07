package com.archibus.app.common.bulkprint;

import java.io.*;
import java.util.*;

import org.directwebremoting.io.FileTransfer;

import com.archibus.context.ContextStore;
import com.archibus.ext.report.*;
import com.archibus.ext.report.docx.DocxUtility;
import com.archibus.service.DocumentService;
import com.archibus.utility.ExceptionBase;
import com.aspose.words.Document;

/**
 * Document Processing Class used for BulkPrintService.
 *
 * @author ZY
 * @since 20.1
 *
 */
public class DocumentProcess {
    
    /**
     * Document title used in cover page.
     */
    // @translatable
    private static final String DOC_TITLE = "Safety Data Sheets";
    
    /**
     * Constant: Error message for exception when get input-stream from document field of type
     * doc/docx/pdf.
     */
    // @translatable
    private static final String MESSAGE_GET_INPUTSTREAM_ERROR =
            "Could not get InputStream from document field of docx/pdf type";
    
    /**
     * Process individual document file: either simply add input-stream of pdf file to list or
     * firstly convert doc/docx to pdf then add its input-stream to list.
     *
     *
     * @param docList document list contains processed document.
     * @param tableName table name.
     * @param fieldName field name.
     * @param documentService Document Service OBJECT
     * @param keys output document size limit
     * @param docName output document size limit
     *
     */
    public void processSingleDocument(final List<InputStream> docList, final String tableName,
            final String fieldName, final DocumentService documentService,
            final Map<String, String> keys, final String docName) {
        
        // get latest document file version
        final String version = BulkPrintHelper.getLastDocumentVersion(keys, tableName, fieldName);
        
        final FileTransfer fileTransfer =
                documentService.checkOut(keys, tableName, fieldName, "0", false, docName, version);
        final ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        try {
            // load document file
            fileTransfer.getOutputStreamLoader().load(outputStream);
            
            // if document is "pdf"
            if (docName.toUpperCase().endsWith(".PDF")) {
                
                // add new input stream from pdf document to list
                docList.add(new ByteArrayInputStream(outputStream.toByteArray()));
                
                // if document is doc/docx,
            } else if (docName.toUpperCase().endsWith(".DOCX")
                    || docName.toUpperCase().endsWith(".DOC")) {
                
                // get document object by doc field's content
                final Document doc =
                        DocxUtility
                            .getDocument(new ByteArrayInputStream(outputStream.toByteArray()));
                
                // output document to pdf format file
                final String filePath = ReportUtility.getReportFilesStorePath(ContextStore.get());
                final String fileFullName = filePath + docName;
                DocxUtility.saveDocument(doc, fileFullName, filePath,
                    DocxUtility.OutputFileType.PDF);
                
                // get input-stream from the pdf file and added it to list
                docList.add(new FileInputStream(fileFullName));
                
            }
            
        } catch (final IOException e) {
            // @non-translatable
            throw new ExceptionBase(null, docName + ": " + MESSAGE_GET_INPUTSTREAM_ERROR, e);
        }
    }
    
    /**
     * Process cover page and return document's full name.
     *
     * @param printableRestriction Restriction to print on cover page
     * @param coverPageViewName Name of the support view for cover page
     * @param recordsRestriction Restriction from input document records
     * @return cover page full name
     */
    public String buildCoverPage(final List<Map<String, Object>> printableRestriction,
            final String coverPageViewName, final String recordsRestriction) {
        final PaginatedReportsBuilder builder = new PaginatedReportsBuilder();
        
        final com.archibus.ext.report.docx.Report report =
                new com.archibus.ext.report.docx.Report();
        report.setTitle(DOC_TITLE);
        report.setPrintRestriction(true);
        report.setPrintableRestriction(printableRestriction);
        final Map<String, Object> parameters = new HashMap<String, Object>();
        parameters.put("restriction", recordsRestriction);
        report.setPatameters(parameters);
        builder.buildDocxFromView(ContextStore.get(), report, coverPageViewName, null);
        
        return report.getFileFullName();
    }
}
