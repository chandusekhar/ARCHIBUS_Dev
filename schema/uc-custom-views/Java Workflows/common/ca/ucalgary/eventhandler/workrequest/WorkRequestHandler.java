package ca.ucalgary.eventhandler.workrequest;

import java.util.Iterator;
import java.util.List;

import org.json.JSONArray;
import org.json.JSONObject;

import com.archibus.eventhandler.*;
//import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.*;

public class WorkRequestHandler extends EventHandlerBase {

/**
	 *	updateEQ_date_touch() Created by aso 10.09.2010
	 *
     *  Description of the Method 
     *
     *@param  context            Description of the Parameter
     *@exception  ExceptionBase  Description of the Exception
	 *	
	 *	update eq.date_touch when wr is completed
     */

    public void updateEqDateTouch(EventHandlerContext context) {
	// get a list of Work Request ID from input parameter map   
		try {
	
			String eqID = (String) context.getParameter("eq_id");
				
			//empty the em_print field where em_print = em_id
			String sql = "update eq set date_touch = sysdate where eq_id=" + literal(context,eqID);
			executeDbSql(context, sql, false);
			executeDbCommit(context);
			
        
		} 
		catch (Throwable t) {
			handleError(context, "BrgCommon", t);
		}
        
    
    }

   /**
	 *	updateWR_Status() Created by aso 06.27.2008
	 *
     *  Description of the Method 
     *
     *@param  context            Description of the Parameter
     *@exception  ExceptionBase  Description of the Exception
	 *	
	 *	update wr.status and em_print
     */

    public void updateWR_Status(EventHandlerContext context) {
	// get a list of Work Request ID from input parameter map   
	try {
	
			JSONArray wrID_Array = context.getJSONArray("wr_id");
			String emID = (String) context.getParameter("em_id");
			
			//prepare a wr list that will going to the 'In' statement
			String wr_list = "";
			if(wrID_Array.length() > 0){
		    for(int i=0;i<wrID_Array.length();i++){
				
				if(wrID_Array.get(i).equals("empty"))
					break;
				wr_list = wr_list +"'"+wrID_Array.get(i)+"'";
				
				if(i != wrID_Array.length()-1)
					wr_list = wr_list+",";
				}
			}
				
			//empty the em_print field where em_print = em_id
			String sql = "update wr set em_print= null where em_print=" + literal(context, emID);
			executeDbSql(context, sql, false);
			executeDbCommit(context);
			
			//update status to I and em_print = em_id where wr_id in the wr_list
			sql = "update wr set status = CASE when status = 'AA' then 'I'else status end, em_print =" + literal(context, emID) +" where wr_id in ("+wr_list+") ";
			System.out.println(sql);
			System.out.println();
			executeDbSql(context, sql, false);
			executeDbCommit(context);
			
        
		} catch (Throwable t) {
			handleError(context, "BrgCommon", t);
		}
        
    
    }
	
	/**
     * Handles all exceptions that may happenduring WFR execution. 
     * @param context
     * @param messageId
     * @param t
     */
    void handleError(EventHandlerContext context, String messageId, Throwable t) {
        // prepare localized error message
        String errorMessage = localizeMessage(context, "AbSolutionsMyAdn", "BrgCommon_PMS", messageId, null);

        // attach it to the WFR response
        context.addResponseParameter("message", errorMessage);

        // log additional error details if available
        this.log.error(errorMessage, t);

        // re-throw the exception for the Workflow Rule Container
        if (t instanceof ExceptionBase) {
            throw (ExceptionBase) t;
        }
        throw new ExceptionBase(errorMessage, t);
    }

	
    /**
     * Automatically closes any Completed/Stopped/Cancelled/Rejected
     * using the stock Archibus workflow that is past the specified number of days
     * from the date_completed.
     * 
     * @param context
     */
    public void autoCloseWorkRequests(EventHandlerContext context) {
    	log.info("Running autoCloseWorkRequests");
    	
    	int daysPastCom = 9999;
    	int daysPastReq = 9999;
    	
    	if (context.parameterExistsNotEmpty("daysPastCom")) {
    		daysPastCom = context.getInt("daysPastCom");
    	}
    	else {
    		// get it from the database
    		Object daysPastComDB = selectDbValue(context, "afm_activity_params", "param_value",
    				"activity_id = 'AbBldgOpsOnDemandWork' AND param_id = 'UC_SCHED_CLOSE_DAYSPASTCOM'");
    		daysPastCom = Integer.parseInt(daysPastComDB.toString());
    	}
    	
    	if (context.parameterExistsNotEmpty("daysPastReq")) {
    		daysPastReq = context.getInt("daysPastReq");
    	}
    	else {
    		// get it from the database
    		Object daysPastReqDB = selectDbValue(context, "afm_activity_params", "param_value",
    				"activity_id = 'AbBldgOpsOnDemandWork' AND param_id = 'UC_SCHED_CLOSE_DAYSPASTREQ'");
    		daysPastReq = Integer.parseInt(daysPastReqDB.toString());
    	}
    	
    	// Retrieve records that are ready to closed and date_completed past the
    	// specified period.
    	// 2010/08/25 - (ISSUE 290) Added wo_id IS NOT NULL to restriction.  NULL wo_id's were
    	//              causing the closeWorkRequests workflow to fail.
    	// 2012/05/16 - Remove the Clo status and moved that to a separate routine as it was
    	//              causing the routine to fail if one of the requests in the same wo
    	//              archived a Clo request when it was already in the list.
        List wr_records = selectDbRecords(context, "wr", new String[] { "wr_id" },
        		"wo_id IS NOT NULL AND "+
                "((status IN ('Rej','S','Can') AND date_requested < GETDATE()-"+daysPastReq+") "+
                "OR (status IN ('Com') AND date_completed < GETDATE()-"+daysPastCom+"))");

    	// call the closeWorkRequests workflow with our list of records
		com.archibus.eventhandler.ondemandwork.WorkRequestHandler woClose = new com.archibus.eventhandler.ondemandwork.WorkRequestHandler();

        
        // Add all returned wr to the records to be closed
    	JSONArray records = new JSONArray();
    	if (!wr_records.isEmpty()) {
    		for (Iterator it = wr_records.iterator(); it.hasNext();) {
                Object[] wr_record = (Object[]) it.next();
                Integer wr_id = getIntegerValue(context, wr_record[0]);
                JSONObject record = new JSONObject();
                record.put("wr.wr_id", wr_id.intValue());
                records.put(record);
                
                // Send to workflow 20 at a time
                if (records.length() > 20) {
             		woClose.closeWorkRequests(records);
             		records = new JSONArray();
                }
    		}
    	}
    	
    	// Send rest of the records
 		woClose.closeWorkRequests(records);
    	
    	// Run the archive routine on the closed work requests for work orders where all wr
 		// are in the Clo state.
 		List wo_to_close = selectDbRecords(context, "wo", new String[] { "wo_id" },
 				"wo_id IN (SELECT wo_id FROM wr WHERE status = 'Clo' AND NOT EXISTS(SELECT 1 FROM wr iwr WHERE iwr.wo_id = wr.wo_id AND iwr.status <> 'Clo'))");
  
        // Add all returned wr to the records to be closed
 		records = new JSONArray();
    	if (!wo_to_close.isEmpty()) {
    		for (Iterator it = wo_to_close.iterator(); it.hasNext();) {
                Object[] wo_record = (Object[]) it.next();
                Integer wo_id = getIntegerValue(context, wo_record[0]);
                JSONObject record = new JSONObject();
                record.put("wo.wo_id", wo_id.intValue());
                records.put(record);
                
                // Send to workflow 20 at a time
                if (records.length() > 20) {
             		woClose.closeWorkOrders(records);
             		records = new JSONArray();
                }
    		}
    	}
    	
    	// Send rest of the records
 		woClose.closeWorkOrders(records);
 		
        log.info("Routine autoCloseWorkRequests complete.");
        
    	return;
    }
}
	

