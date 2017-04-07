package com.archibus.app.bldgops.express;

import java.text.SimpleDateFormat;
import java.util.*;

import com.archibus.context.*;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.ext.report.*;
import com.archibus.ext.report.docx.DocxUtility;
import com.archibus.jobmanager.*;
import com.archibus.jobmanager.JobStatus.JobResult;

/**
 * Paginate Report Generator of Work request details.
 * 
 * 
 * <p>
 * History:
 * <li>21.2: Add for 21.2 Bldgops Express.
 * 
 * @author Zhang Yi
 * 
 * 
 */
public class BldgopsExpressPrinter extends JobBase {
    
    /**
     * Job title of report Work Request details.
     */
    // @translatable
    private static final String JOB_TITLE = "Work Request Details";
    
    /**
     * Constant number 100.
     */
    private static final int ONE_HUNDRED = 100;
    
    /**
     * Paginate view name of report Work Request details.
     */
    private static final String DETAILS_AXVW_NAME = "ab-bldgops-console-wr-details-print.axvw";
    
    /**
     * Paginate view name of report Work Request details plan.
     */
    private static final String DETAILS_PLAN_AXVW_NAME =
            "ab-bldgops-console-wr-details-plan-print.axvw";
    
    /**
     * Name prefix of generated report files.
     */
    private static final String REPORT_FILE_NAME_PREFIX = "Work-Requests-Details-";
    
    /**
     * Constant number 80, indicate the completion percentage after build all work request's report
     * file.
     */
    private static final int PERCENT_AFTER_BUILD_REPORT = 80;
    
    /**
     * Work Request Ids.
     */
    private final List<String> workRequestIds;
    
    /**
     * Work Request Details Paginate Report View name.
     */
    private final String viewName;
    
    /**
     * Type of generated report file: 'DOCX' or 'PDF'.
     */
    private final String reportType;
    
    /**
     * Context.
     */
    private final Context context;
    
    /**
     * String of current date.
     */
    private final String dateString;
    
    /**
     * Extension name of generated report files.
     */
    private final String extensionFileName;
    
    /**
     * Step percentage for creating report.
     */
    private final int createReportStep;
    
    /**
     * 
     * Constructor: initial properties.
     * 
     * @param workRequestIds List of work request ids.
     * @param viewName String paginate report name.
     * @param reportType String output type of report file: DOCX or PDF.
     */
    public BldgopsExpressPrinter(final List<String> workRequestIds, final String viewName,
            final String reportType) {
        
        super();
        
        this.reportType = reportType;
        this.viewName = viewName;
        this.workRequestIds = workRequestIds;
        
        this.context = ContextStore.get();
        this.dateString = this.getCurrentDateString();
        this.extensionFileName = "." + reportType.toLowerCase();
        
        this.createReportStep = PERCENT_AFTER_BUILD_REPORT / workRequestIds.size();
    }
    
    @Override
    public void run() {
        
        this.status.setTotalNumber(ONE_HUNDRED);
        this.status.setCurrentNumber(0);
        this.status.setResult(new JobResult(EventHandlerBase.localizeString(ContextStore.get()
            .getEventHandlerContext(), JOB_TITLE, BldgopsExpressPrinter.class.getName())));
        
        // create all report files and get their names list
        final List<String> fileNames = createReportFiles();
        
        // merge all single files of each work request.
        mergeAllFiles(fileNames);
        
        this.status.setCurrentNumber(ONE_HUNDRED);
        this.status.setCode(JobStatus.JOB_COMPLETE);
    }
    
    /**
     * Create report file(s) and return their names list according to passed into axvw name.
     * 
     * @return file names of created report files
     */
    private List<String> createReportFiles() {
        
        final List<String> fileNames = new ArrayList<String>();
        
        if (DETAILS_AXVW_NAME.equalsIgnoreCase(this.viewName)) {
            
            getDetailReportFileNames(fileNames);
            
        } else if (DETAILS_PLAN_AXVW_NAME.equalsIgnoreCase(this.viewName)) {
            
            getDetailPlanReportFileNames(fileNames);
        }
        
        return fileNames;
    }
    
    /**
     * Create report file(s) from the paginate report 'Work Request Details'.
     * 
     * @param fileNames List file names of created report files
     */
    private void getDetailPlanReportFileNames(final List<String> fileNames) {
        
        final PaginatedReportsBuilder builder = new PaginatedReportsBuilder();
        final Map<String, Object> wrIdResctriction = new HashMap<String, Object>();
        
        final String wrRes =
                BldgopsExpressUtility.getInConditionClauseFromStringList(this.workRequestIds);
        wrIdResctriction.put("wrRes", wrRes);
        
        final com.archibus.ext.report.docx.Report report =
                new com.archibus.ext.report.docx.Report();
        report.setTitle(EventHandlerBase.localizeString(
            ContextStore.get().getEventHandlerContext(), JOB_TITLE,
            BldgopsExpressPrinter.class.getName()));
        
        // set restriction to report
        report.setPatameters(wrIdResctriction);
        
        builder.buildDocxFromView(this.context, report, this.viewName, null);
        
        fileNames.add(report.getFileFullName());
        
        this.status.setCurrentNumber(PERCENT_AFTER_BUILD_REPORT);
    }
    
    /**
     * Create report file from the paginate report 'Work Request Details Plan'.
     * 
     * @param fileNames List file names of created report files
     */
    private void getDetailReportFileNames(final List<String> fileNames) {
        
        final PaginatedReportsBuilder builder = new PaginatedReportsBuilder();
        // generating report files by loop through work request
        
        int count = 0;
        for (final String wrId : this.workRequestIds) {
            
            final Map<String, Object> wrIdResctriction = new HashMap<String, Object>();
            wrIdResctriction.put("wrWrId", Integer.valueOf(wrId));
            
            final com.archibus.ext.report.docx.Report report =
                    new com.archibus.ext.report.docx.Report();
            
            report.setTitle(EventHandlerBase.localizeString(ContextStore.get()
                .getEventHandlerContext(), JOB_TITLE, BldgopsExpressPrinter.class.getName())
                    + ": " + wrId);
            
            // set restriction to report
            report.setPatameters(wrIdResctriction);
            
            builder.buildDocxFromView(this.context, report, this.viewName, null);
            
            fileNames.add(report.getFileFullName());
            
            this.status.setCurrentNumber((++count) * this.createReportStep);
        }
    }
    
    /**
     * Merge report file of each work request into one single file.
     * 
     * @param fileNames List<String> report file names list
     */
    private void mergeAllFiles(final List<String> fileNames) {
        
        if (fileNames.size() <= ONE_HUNDRED) {
            
            // generate one partial file for no more than 100 work requests
            generateSinglePartialFile(fileNames);
            
        } else {
            
            // generate multiple partial files for more than 100 work requests
            generateMultiplePartialFiles(fileNames);
        }
    }
    
    /**
     * @return string of current date.
     * 
     */
    private String getCurrentDateString() {
        
        final Date currentDate = new Date();
        final SimpleDateFormat dateFormat = new SimpleDateFormat();
        dateFormat.applyPattern("yyyy-MM-dd");
        
        return dateFormat.format(currentDate);
    }
    
    /**
     * Generate the only details report file for all work requests.
     * 
     * @param fileNames List<String> report file names list
     */
    private void generateSinglePartialFile(final List<String> fileNames) {
        
        final String fileName = REPORT_FILE_NAME_PREFIX + this.dateString + this.extensionFileName;
        final String outputFileName =
                ReportUtility.getReportFilesStorePath(this.context) + fileName;
        
        this.generateFile(fileNames, outputFileName);
        
        this.status.setResult(new JobResult(EventHandlerBase.localizeString(ContextStore.get()
            .getEventHandlerContext(), JOB_TITLE, BldgopsExpressPrinter.class.getName()), fileName,
            this.context.getContextPath() + ReportUtility.getPerUserReportFilesPath(this.context)
                    + fileName));
    }
    
    /**
     * Generate multiple details report files for all work requests.
     * 
     * @param fileNames List<String> report file names list
     */
    private void generateMultiplePartialFiles(final List<String> fileNames) {
        
        final int partialsCount =
                fileNames.size() / ONE_HUNDRED + fileNames.size() % ONE_HUNDRED == 0 ? 0 : 1;
        
        /**
         * Step percentage for creating partial report files.
         */
        final int createPartialStep = (ONE_HUNDRED - PERCENT_AFTER_BUILD_REPORT) / partialsCount;
        
        for (int i = 0; i < partialsCount; i++) {
            
            // calculate start index and end index of partial list in total list
            final int startIndex = i * 100;
            final int endIndex =
                    i == (partialsCount - 1) ? fileNames.size() : (i + 1) * ONE_HUNDRED;
            
            final List<String> partialFiles = fileNames.subList(startIndex, endIndex);
            
            final String fileName =
                    REPORT_FILE_NAME_PREFIX + this.dateString + "-part" + i
                            + this.extensionFileName;
            final String outputFileName =
                    ReportUtility.getReportFilesStorePath(this.context) + fileName;
            
            this.generateFile(partialFiles, outputFileName);
            
            this.status.addPartialResult(new JobResult("", fileName, this.context.getContextPath()
                    + ReportUtility.getPerUserReportFilesPath(this.context) + fileName));
            
            this.status.setCurrentNumber(PERCENT_AFTER_BUILD_REPORT + createPartialStep * (i + 1));
        }
        
    }
    
    /**
     * Append report files of list to specified output file type.
     * 
     * @param fileNames List<String> report file names list
     * @param outputFileName String output file's full names
     */
    private void generateFile(final List<String> fileNames, final String outputFileName) {
        
        if ("PDF".equalsIgnoreCase(this.reportType)) {
            
            // generate pdf file
            ReportUtility.appendDocxFiles(fileNames, outputFileName, "",
                DocxUtility.OutputFileType.PDF);
            
        } else {
            // generate docx file
            ReportUtility.appendDocxFiles(fileNames, outputFileName);
        }
        
    }
    
}
