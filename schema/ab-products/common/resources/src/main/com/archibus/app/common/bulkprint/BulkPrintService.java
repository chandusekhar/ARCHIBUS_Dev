package com.archibus.app.common.bulkprint;

import java.io.*;
import java.util.*;

import com.archibus.context.ContextStore;
import com.archibus.datasource.data.DataRecord;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.ext.pdflivecycle.PdfFormExportJob;
import com.archibus.ext.report.ReportUtility;
import com.archibus.ext.report.docx.DocxUtility;
import com.archibus.jobmanager.*;
import com.archibus.jobmanager.JobStatus.JobResult;
import com.archibus.service.DocumentService;
import com.archibus.utility.*;
import com.aspose.words.Document;

/**
 * Provides Bulk Print Functionality to workflow rules that need to print multiple documents to a
 * merged one with specified output document type.
 * 
 * @author ZY
 * @since 20.1
 * 
 */
public class BulkPrintService extends JobBase {
    
    /**
     * Constant: Char: ".".
     */
    private static final String DOT = ".";
    
    /**
     * Constant: "100" - job's progressing percentage base.
     */
    private static final int HUNDRED = 100;
    
    /**
     * Constant: Title shown on job view for the links of generated pdf files.
     */
    // @translatable
    private static final String TITLE_JOB_RESULT = "Printed PDF file(s)";
    
    /**
     * Records to print documents.
     */
    private final List<InputStream> docList = new ArrayList<InputStream>();
    
    /**
     * Boolean indicator for using or not a cover page.
     */
    private boolean hasCover;
    
    /**
     * Name of the support view for cover page.
     */
    private String coverPageViewName;
    
    /**
     * Restriction to print on cover page.
     */
    private List<Map<String, Object>> printableRestriction;
    
    /**
     * Field Name.
     */
    private final String fieldName;
    
    /**
     * Limited putput file size.
     */
    private final long limitSize;
    
    /**
     * Records to print documents.
     */
    private final List<DataRecord> records;
    
    /**
     * Table Name.
     */
    private final String tableName;
    
    /**
     * Public Constructor: create a BulkPrintService instance by passing into parameters for service
     * initializing.
     * 
     * 
     * @param tableName table name
     * @param fieldName field name
     * @param records list of records
     * @param limitSize output document size limit
     */
    public BulkPrintService(final String tableName, final String fieldName,
            final List<DataRecord> records, final long limitSize) {
        
        super();
        
        PdfFormExportJob.loadPdfKitLibraryLicense();
        
        this.tableName = tableName;
        this.fieldName = fieldName;
        this.records = records;
        this.limitSize = limitSize;
        
    }
    
    /**
     * Public Constructor: create a BulkPrintService instance with cover page by passing into
     * parameters for service initializing.
     * 
     * 
     * @param tableName table name
     * @param fieldName field name
     * @param records list of records
     * @param limitSize output document size limit
     * @param printableRestriction restriction to print on cover page
     * @param coverPageViewName name of view used for cover page
     */
    public BulkPrintService(final String tableName, final String fieldName,
            final List<DataRecord> records, final long limitSize,
            final List<Map<String, Object>> printableRestriction, final String coverPageViewName) {
        
        super();
        
        PdfFormExportJob.loadPdfKitLibraryLicense();
        
        this.tableName = tableName;
        this.fieldName = fieldName;
        this.records = records;
        this.limitSize = limitSize;
        this.hasCover = true;
        this.printableRestriction = printableRestriction;
        this.coverPageViewName = coverPageViewName;
    }
    
    /**
     * Public interface: after BulkPrintService instance object is created, run the print documents
     * job.
     */
    @Override
    public void run() {
        
        this.status.setTotalNumber(HUNDRED);
        this.status.setCurrentNumber(0);
        this.status.setResult(new JobResult(EventHandlerBase.localizeString(ContextStore.get()
            .getEventHandlerContext(), TITLE_JOB_RESULT, this.getClass().getName())));
        
        this.printDocumentsToPdf();
        
        this.status.setCode(JobStatus.JOB_COMPLETE);
    }
    
    /**
     * Private method: Retrieve documents from input document records and print them to local PDF
     * files, then return file links list to response result.
     * 
     * Justification: KB#3034281 will un-deprecate the method getTablePkFieldNames, or provide a
     * replacement API.
     */
    @SuppressWarnings({ "deprecation" })
    private void printDocumentsToPdf() {
        
        final DocumentProcess documentProcess = new DocumentProcess();
        
        final int step = this.records.isEmpty() ? 0 : HUNDRED / this.records.size();
        
        // get ARCHIBUS document service instance
        final DocumentService documentService =
                (DocumentService) ContextStore.get().getBean("documentService");
        
        // get primary key of transfered table
        final String[] pkNames =
                EventHandlerBase.getTablePkFieldNames(ContextStore.get().getEventHandlerContext(),
                    this.tableName);
        
        final Map<String, String> keys = new HashMap<String, String>();
        
        // add cover page
        if (this.hasCover) {
            final String filePath = ReportUtility.getReportFilesStorePath(ContextStore.get());
            final String recordsRestriction = getRecordsRestriction();
            final String fileFullName =
                    new DocumentProcess().buildCoverPage(this.printableRestriction,
                        this.coverPageViewName, recordsRestriction);
            try {
                final Document doc = DocxUtility.getDocument(new File(fileFullName));
                
                DocxUtility.saveDocument(doc, fileFullName, filePath,
                    DocxUtility.OutputFileType.PDF);
                
                this.docList.add(new FileInputStream(fileFullName));
            } catch (final FileNotFoundException e) {
                final ExceptionBase exception =
                        ExceptionBaseFactory.newNonTranslatableException(
                            "Error when create output pdf file", null);
                
                exception.setNested(e);
            }
        }
        
        for (final DataRecord record : this.records) {
            
            // A long run job should be stoppable
            if (this.status.isStopRequested()) {
                break;
            }
            
            // prepare key-values map.
            for (final String pkey : pkNames) {
                keys.put(pkey, record.getValue(this.tableName + DOT + pkey).toString());
            }
            
            // get document file name
            final String docName = record.getString(this.tableName + DOT + this.fieldName);
            
            // if file exists then process the document
            if (StringUtil.notNullOrEmpty(docName)) {
                
                documentProcess.processSingleDocument(this.docList, this.tableName, this.fieldName,
                    documentService, keys, docName);
                
            }
            this.status.setCurrentNumber(this.status.getCurrentNumber() + step);
        }
        
        new PdfPrinter().outputPdf(this.docList, this.status, this.limitSize);
    }
    
    /**
     * Private method: Obtain restriction from input document records.
     * 
     * @return SQL restriction
     * 
     *         Justification: KB#3034281 will un-deprecate the method getTablePkFieldNames, or
     *         provide a replacement API.
     */
    @SuppressWarnings({ "deprecation" })
    private String getRecordsRestriction() {
        String restriction = " 1=1 ";
        // get primary key of transfered table
        final String[] pkNames =
                EventHandlerBase.getTablePkFieldNames(ContextStore.get().getEventHandlerContext(),
                    this.tableName);
        String values = "";
        for (final String pkey : pkNames) {
            for (final DataRecord record : this.records) {
                values += record.getValue(this.tableName + DOT + pkey).toString() + ",";
            }
            // remove the last ',' character
            if (values.length() >= 2) {
                values = values.substring(0, values.length() - 1);
                restriction += "AND " + pkey + " IN (" + values + ") ";
            }
        }
        return restriction;
    }
}
