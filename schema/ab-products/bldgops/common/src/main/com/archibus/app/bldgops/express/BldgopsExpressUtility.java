package com.archibus.app.bldgops.express;

import java.util.List;

import org.json.JSONObject;

import com.archibus.context.ContextStore;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.*;

/**
 * Bldgops Express Utility class.
 * 
 * <p>
 * History:
 * <li>21.2: Add for 21.2 Bldgops Express.
 * 
 * @author Zhang Yi
 * 
 */
public final class BldgopsExpressUtility {
    
    /**
     * Constructor method for removing warning: 'Utility classes should not have a public or default
     * constructor'.
     * 
     */
    private BldgopsExpressUtility() {
        
    }
    
    /**
     * 
     * Construct a String format of In Condition Clause of Work Request's code.
     * 
     * @param workRequestIds List of work request's code
     * 
     * @return In Condition clause
     */
    public static String getInConditionClauseFromStringList(final List<String> workRequestIds) {
        
        final StringBuilder wrRes = new StringBuilder();
        wrRes.append(" 1=1 AND wr.wr_id IN ( ");
        
        // generating report files by loop through work request
        for (final Object wrId : workRequestIds) {
            
            wrRes.append(wrId);
            wrRes.append(",");
        }
        final int indexOfLastChar = wrRes.length() - 1;
        wrRes.replace(indexOfLastChar, indexOfLastChar + 1, ")");
        
        return wrRes.toString();
    }
    
    /**
     * 
     * Start a job and return result to client.
     * 
     * @param job Job instance
     * 
     */
    public static void runJob(final Job job) {
        
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        
        final JobManager.ThreadSafe jobManager = EventHandlerBase.getJobManager(context);
        final String jobId = jobManager.startJob(job);
        
        // add the status to the response
        final JSONObject result = new JSONObject();
        result.put("jobId", jobId);
        
        // get the job status from the job id
        final JobStatus status = jobManager.getJobStatus(jobId);
        result.put("jobStatus", status.toString());
        
        context.addResponseParameter("jsonExpression", result.toString());
        
    }
    
    /**
     * 
     * @return all the fields name from given table in a string list format.
     * 
     * @param table StringBuffer table name|
     * 
     */
    public static StringBuffer getFieldsListString(final String table) {
        final String[] fieldsList =
                com.archibus.eventhandler.EventHandlerBase.getAllFieldNames(ContextStore.get()
                    .getEventHandlerContext(), table);
        final StringBuffer fields = new StringBuffer();
        for (final String element : fieldsList) {
            if (fields.length() > 0) {
                fields.append(", ");
            }
            fields.append(element);
        }
        return fields;
    }
    
}
