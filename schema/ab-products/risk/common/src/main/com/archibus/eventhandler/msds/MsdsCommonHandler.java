package com.archibus.eventhandler.msds;

import java.io.*;
import java.net.*;
import java.text.MessageFormat;
import java.util.*;

import org.apache.log4j.Logger;
import org.json.*;

import com.archibus.app.common.bulkprint.BulkPrintService;
import com.archibus.context.ContextStore;
import com.archibus.datasource.data.DataRecord;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.*;
import com.archibus.service.DocumentService;
import com.archibus.utility.StringUtil;

/**
 * MSDS Common Handler.
 * 
 * 
 * @author ASC-BJ:Zhang Yi
 */
public class MsdsCommonHandler extends JobBase {
    
    /**
     * Indicates the table field.
     */
    private static final String MSDS_DATA_MSDS_ID = "msds_data.msds_id";
    
    /**
     * Indicates the string 'jsonExpression' .
     */
    private static final String JSON_EXPRESSION = "jsonExpression";
    
    /**
     * Logger to write messages to archibus.log.
     */
    private final Logger logger = Logger.getLogger(this.getClass());
    
    /**
     * Set manifest number to all waste out records contained in array.
     * 
     * @param remoteURL string url
     * @param msdsId String msds code
     * @param isNew boolean sign indicate if check in new file to current msds data or update an
     *            existed version
     */
    public void downloadMsds(final String msdsId, final String remoteURL, final boolean isNew) {
        
        // get document service object
        final DocumentService documentService =
                (DocumentService) ContextStore.get().getBean("documentService");
        
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        
        // make sure the URL value is present
        if (StringUtil.notNullOrEmpty(remoteURL) && remoteURL.length() > 0
                && !"http://".equalsIgnoreCase(remoteURL)) {
            // Instantiate the URL object using the URL that was passed in
            try {
                URLEncoder.encode(remoteURL, "UTF-8");
                final URL remoteFile = new URL(StringUtil.replace(remoteURL, " ", "%20"));
                
                // get file name from the URL
                final String remoteFileName = remoteFile.getFile().trim();
                
                // Open the connection
                final URLConnection urlConnection = remoteFile.openConnection();
                
                // determine if remote url contains content or not
                if (urlConnection.getContentType() == null) {
                    
                    context.addResponseParameter(JSON_EXPRESSION, "null");
                    this.logger.info("Remote content is null.");
                    
                } else {
                    MsdsCommonUtil.checkInFile(this.logger, documentService, msdsId,
                        remoteFileName, urlConnection, isNew);
                    
                }
            } catch (final UnsupportedEncodingException e) {
                
                final String errorMessage =
                        MessageFormat.format("Set enconding to remote url error.\nRoot cause: {0}",
                            e.getMessage());
                MsdsCommonUtil.logExceptionMessageAndThrowExceptionBase(this.logger, errorMessage,
                    context);
                
            } catch (final MalformedURLException e) {
                
                final String errorMessage =
                        MessageFormat.format("Remote URL Malformed error.\nRoot cause: {0}",
                            e.getMessage());
                MsdsCommonUtil.logExceptionMessageAndThrowExceptionBase(this.logger, errorMessage,
                    context);
                
            } catch (final IOException e) {
                
                final String errorMessage =
                        MessageFormat
                            .format(
                                "Open remote connection or get remote file stream encounters error.\nRoot cause: {0}",
                                e.getMessage());
                MsdsCommonUtil.logExceptionMessageAndThrowExceptionBase(this.logger, errorMessage,
                    context);
                
            }
        }
        
    }
    
    /**
     * Print documents of multiple selected msds data record to merged pdf files.
     * 
     * @param dataRecords JSON array of selected multiple msds data records
     * @param printableRestriction Restriction to print on cover page
     */
    public void printMsdsDocuments(final JSONArray dataRecords,
            final List<Map<String, Object>> printableRestriction) {
        
        // clean duplicated msds_data record
        final List<DataRecord> printRecords = new ArrayList<DataRecord>();
        for (int i = 0; i < dataRecords.length(); i++) {
            final DataRecord msdsDataRecord =
                    DataRecord.createRecordFromJSON(dataRecords.getJSONObject(i));
            final int msdsId = msdsDataRecord.getInt(MSDS_DATA_MSDS_ID);
            boolean foundDuplicate = false;
            for (final DataRecord record : printRecords) {
                if (record.getInt(MSDS_DATA_MSDS_ID) == msdsId) {
                    foundDuplicate = true;
                    break;
                }
            }
            if (!foundDuplicate) {
                printRecords.add(msdsDataRecord);
            }
        }
        
        // print msds_data records
        final BulkPrintService bulkPrintService =
                new BulkPrintService("msds_data", "doc", printRecords, 0, printableRestriction,
                    "ab-msds-rpt-print-cover-page.axvw");
        
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final JobManager.ThreadSafe jobManager = EventHandlerBase.getJobManager(context);
        final String jobId = jobManager.startJob(bulkPrintService);
        
        // add the status to the response
        final JSONObject result = new JSONObject();
        result.put("jobId", jobId);
        
        // get the job status from the job id
        final JobStatus status = jobManager.getJobStatus(jobId);
        result.put("jobStatus", status.toString());
        
        context.addResponseParameter(JSON_EXPRESSION, result.toString());
        
    }
    
}
