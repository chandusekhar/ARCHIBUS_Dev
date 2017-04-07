package com.archibus.eventhandler.AssetDepreciation;

import org.json.JSONObject;

import com.archibus.context.ContextStore;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.*;

/**
 * This event handler implements business logic related to Asset management.
 * 
 * @author Ana Paduraru
 * */
public class AssetHandler extends EventHandlerBase {
    /**
     * null as a string.
     */
    private static final String NULL_STRING = "null";
    
    /**
     * create paginated report for furniture standard inventory.
     * 
     * @param blIdP building id
     * @param flIdP floor id
     * @param rmIdP room id
     * @param viewTitle view title
     */
    public void onPaginatedReport(final String blIdP, final String flIdP, final String rmIdP,
            final String viewTitle) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        String blId = blIdP;
        String flId = flIdP;
        String rmId = rmIdP;
        
        if (NULL_STRING.equals(blId)) {
            blId = "";
        }
        if (NULL_STRING.equals(flId)) {
            flId = "";
        }
        if (NULL_STRING.equals(rmId)) {
            rmId = "";
        }
        final AssetPaginatedReportGenerator assetPaginatedReportGenerator = new AssetPaginatedReportGenerator(
            blId, flId, rmId, viewTitle);
        startJob(context, assetPaginatedReportGenerator);
    }
    
    /**
     * Start a job and return status as result.
     * 
     * @param context event handler context
     * @param job job
     */
    private void startJob(final EventHandlerContext context, final Job job) {
        final JobManager.ThreadSafe jobManager = getJobManager(context);
        final String jobId = jobManager.startJob(job);
        
        // add the status to the response
        final JSONObject result = new JSONObject();
        result.put("jobId", jobId);
        
        // get the job status from the job id
        final JobStatus status = jobManager.getJobStatus(jobId);
        result.put("jobStatus", status.toString());
        
        context.addResponseParameter("jsonExpression", result.toString());
    }
}
