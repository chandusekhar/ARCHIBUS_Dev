// 2010/08/25  ISSUE 290 : autoCloseWorkRequests (Skip requests with wo_id IS NULL which is causing the closeWorkRequests workflow to fail)

package ca.ucalgary.eventhandler.workrequest;

import java.io.UnsupportedEncodingException;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

import javax.mail.MessagingException;

import org.json.JSONArray;
import org.json.JSONObject;

import com.archibus.context.ContextStore;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;

//import ca.ucalgary.eventhandler.email.*;

public class UCWorkRequestHandler extends EventHandlerBase {
	
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
    	int daysPastExp = 9999;
    	
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
    	
    	if (context.parameterExistsNotEmpty("daysPastExp")) {
    		daysPastExp = context.getInt("daysPastExp");
    	}
    	else {
    		// get it from the database
    		Object daysPastExpDB = selectDbValue(context, "afm_activity_params", "param_value",
    				"activity_id = 'AbBldgOpsOnDemandWork' AND param_id = 'UC_SCHED_CLOSE_DAYSPASTEXP'");
    		daysPastExp = Integer.parseInt(daysPastExpDB.toString());
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
                "OR (status IN ('Exp') AND date_expired < GETDATE()-"+daysPastExp+") "+
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
                try {
	                if (records.length() > 20) {
	             		woClose.closeWorkRequests(records);
	             		records = new JSONArray();
	                }
                }
                catch (Exception ex) {
                	records = new JSONArray();
                }
    		}
    	}
    	
    	// Send rest of the records
 		woClose.closeWorkRequests(records);
    	
    	// Run the archive routine on the closed work requests for work orders where all wr
 		// are in the Clo state.
 		List wo_to_close = selectDbRecords(context, "wo", new String[] { "wo_id" },
 				"wo_id IN (SELECT wo_id FROM wr WHERE status IN ('Clo', 'Exp') AND NOT EXISTS(SELECT 1 FROM wr iwr WHERE iwr.wo_id = wr.wo_id AND iwr.status NOT IN ('Clo', 'Exp')))");
  
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
                try {
	                if (records.length() > 20) {
	             		woClose.closeWorkOrders(records);
	             		records = new JSONArray();
	                }
                }
                catch (Exception ex) {
                	records = new JSONArray();
                }
    		}
    	}
    	
    	// Send rest of the records
 		woClose.closeWorkOrders(records);
 		
        log.info("Routine autoCloseWorkRequests complete.");
        
    	return;
    }
    
    /**
     * Transfers all non-imported records from the uc_wrcf_staging
     * table to the wrcf table and update (through OTB workflow) all
     * hours and costs.
     * 
     * @param context
     */
    public void transferWrCfFromStaging(EventHandlerContext context) {
        
    	String stagingSql = "SELECT wr_id, cf_id, date_assigned, time_assigned, hours_straight, hours_over, hours_double, date_entered, time_entered, is_fwc FROM uc_wrcf_staging WHERE imported = 0 AND ((ISNULL(hours_double,0) = 0 AND ISNULL(hours_over,0) = 0 AND notes_needed = 0 AND sub_needed = 0 AND parts_needed = 0 AND is_new = 0) OR approved_by IS NOT NULL) ORDER BY date_entered, time_entered";
    	List staging_records = selectDbRecords(context, stagingSql);

    	// Current DateTime
    	java.sql.Date currentDateTime = new java.sql.Date(Calendar.getInstance().getTime().getTime());
    	
    	// call the saveWorkCraftsperson workflow with our list of records
		com.archibus.eventhandler.ondemandwork.WorkRequestHandler wrHandler = new com.archibus.eventhandler.ondemandwork.WorkRequestHandler();

        // Add records into wrcf
		for (Iterator it = staging_records.iterator(); it.hasNext();) {
            Object[] wrcf_record = (Object[]) it.next();
            Integer wr_id = getIntegerValue(context, wrcf_record[0]);
            String cf_id = notNull(wrcf_record[1]);
            java.sql.Date date_assigned = getDateValue(context, wrcf_record[2]);
            java.sql.Time time_assigned = getTimeValue(context, wrcf_record[3]);
            Double hours_straight = wrcf_record[4] == null ? null : Double.parseDouble(wrcf_record[4].toString());
            Double hours_over = wrcf_record[5] == null ? null : Double.parseDouble(wrcf_record[5].toString());
            Double hours_double = wrcf_record[6] == null ? null : Double.parseDouble(wrcf_record[6].toString());
            java.sql.Date date_entered = getDateValue(context, wrcf_record[7]);
            java.sql.Time time_entered = getTimeValue(context, wrcf_record[8]);
            Integer is_fwc = getIntegerValue(context, wrcf_record[9]);
            
            String time_assigned_formatted = time_assigned.toString();
            StringBuilder b = new StringBuilder(time_assigned_formatted);
            b.replace(time_assigned_formatted.lastIndexOf(":"), time_assigned_formatted.lastIndexOf(":") + 1, "." );
            b.append("." + String.format("%03d",Long.valueOf(time_assigned.getTime() % 1000)));
            time_assigned_formatted = b.toString();


            String time_entered_formatted = time_entered.toString();
            b = new StringBuilder(time_entered_formatted);
            b.replace(time_entered_formatted.lastIndexOf(":"), time_entered_formatted.lastIndexOf(":") + 1, "." );
            b.append("." + String.format("%03d", Long.valueOf(time_entered.getTime() % 1000)));
            time_entered_formatted =  b.toString();
            
            JSONObject wrcfRecord = new JSONObject();
            wrcfRecord.put("wrcf.wr_id", wr_id);
            wrcfRecord.put("wrcf.cf_id", cf_id);
            wrcfRecord.put("wrcf.date_assigned", date_assigned);
            wrcfRecord.put("wrcf.time_assigned", time_assigned_formatted);
            wrcfRecord.put("wrcf.hours_straight", hours_straight);
            wrcfRecord.put("wrcf.hours_double", hours_double);
            wrcfRecord.put("wrcf.hours_over", hours_over);
            wrcfRecord.put("wrcf.date_start", date_entered);
            wrcfRecord.put("wrcf.time_start", time_entered_formatted);
            wrcfRecord.put("wrcf.hours_est", 0);
            
            
            try {
	        	Map wrcfValues = new HashMap();
	        	wrcfValues.put("wr_id", wr_id);
	        	wrcfValues.put("cf_id", cf_id);
	        	wrcfValues.put("date_assigned", date_assigned);
	        	wrcfValues.put("time_assigned", time_assigned);
	        	wrcfValues.put("hours_straight", hours_straight);
	        	wrcfValues.put("hours_double", hours_double);
	        	wrcfValues.put("hours_over", hours_over);
	        	wrcfValues.put("date_start", date_entered);
	        	wrcfValues.put("time_start", time_entered);
	        	wrcfValues.put("entry_type", "Timecard");
	
	            executeDbSave(context, "wrcf", wrcfValues);
	            executeDbCommit(context);
            
            	wrHandler.saveWorkRequestCraftsperson(wrcfRecord);
            	
            	Map stagingValues = new HashMap();
            	stagingValues.put("wr_id", wr_id);
            	stagingValues.put("cf_id", cf_id);
            	stagingValues.put("date_assigned", date_assigned);
            	stagingValues.put("time_assigned", time_assigned);
            	stagingValues.put("imported", 1);

                executeDbSave(context, "uc_wrcf_staging", stagingValues);
                executeDbCommit(context);
            }
            catch (Exception ex) {
            	log.error("transferWrCfFromStaging: Importing of ("+wr_id.toString()+ ", " + cf_id + ") failed.");
            }
            
            // If is_fwc flag is set, and wr status in I, HL, HA, PC, update status to fwc
            if (is_fwc == 1) {
            	// query wr status
                String status = notNull(selectDbValue(context, "wr", "status", "wr_id = "
                        + wr_id.toString() + " AND status IN ('I','HL','HA','PC','Exp')"));
            	
                if (!status.equals("")) {
                    // Save audit record (also get the afm_user_name)
                    String afm_user_name = notNull(selectDbValue(context, "afm_users", "user_name", "email = (SELECT email FROM cf WHERE cf_id = "
                            + literal(context, cf_id) + ")"));
                    
                    // If no afm.user_name found, put in the cf_id.
                    if ("".equals(afm_user_name)) {
                    	afm_user_name = cf_id;
                    }
                    
                	Map auditValues = new HashMap();
                	auditValues.put("wr_id", wr_id);
                	auditValues.put("status_new", "FWC");
                	auditValues.put("status_old", status);
                	auditValues.put("date_modified", currentDateTime);
                	auditValues.put("afm_user_name", afm_user_name);
                	auditValues.put("from_mobile", 1);
                	      
                    executeDbSave(context, "uc_wr_audit", auditValues);
                    executeDbCommit(context); 
                    
                    // Update status
                    /*
                	Map wrValues = new HashMap();
                	wrValues.put("wr_id", wr_id);
                	wrValues.put("status", "FWC");
                	wrValues.put("date_fwc", currentDateTime);

                    executeDbSave(context, "wr", wrValues);
                    executeDbCommit(context);                  
                    */
                    
                    JSONObject wrRecord = new JSONObject();
                    wrRecord.put("wr.wr_id", wr_id);
                    wrRecord.put("wr.status", status);
                    
                    wrHandler.updateWorkRequestStatus(wr_id.toString(), wr_id.toString(), wr_id.toString(), wrRecord, "FWC");
                }
            }
		}
		
		// Change all records that are FWC with exceptions back to Issued status
		/* BRG - 20130312 Removed setting status back on exception
		String exceptionSql = "SELECT DISTINCT u.wr_id, wr.status FROM uc_wrcf_staging u INNER JOIN wr ON u.imported = 0 AND NOT ((ISNULL(u.hours_double,0) = 0 AND ISNULL(u.hours_over,0) = 0 AND notes_needed = 0 AND sub_needed = 0 AND parts_needed = 0 AND is_new = 0) OR u.approved_by IS NOT NULL) AND u.wr_id = wr.wr_id AND wr.status = 'FWC'";
    	List exceptionRecords = selectDbRecords(context, exceptionSql);

		for (Iterator it = exceptionRecords.iterator(); it.hasNext();) {
            Object[] staging_record = (Object[]) it.next();
            Integer wr_id = getIntegerValue(context, staging_record[0]);
            String status = notNull(staging_record[1]);
            
            // Save audit record (also get the afm_user_name)
            String afm_user_name = notNull(selectDbValue(context, "afm_users", "user_name", "email = (SELECT email FROM cf WHERE cf_id = "
            		+ "(SELECT TOP 1 cf_id FROM uc_wrcf_staging u WHERE u.wr_id = "+ wr_id.toString()+" AND u.imported = 0 AND NOT ((ISNULL(u.hours_double,0) = 0 AND ISNULL(u.hours_over,0) = 0 AND notes_needed = 0 AND sub_needed = 0 AND parts_needed = 0 AND is_new = 0) OR u.approved_by IS NOT NULL) ORDER BY date_entered, time_entered))"));

            // If no afm.user_name found, put in the cf_id.
            if ("".equals(afm_user_name)) {
            	afm_user_name = cf_id;
            }
            
        	Map auditValues = new HashMap();
        	auditValues.put("wr_id", wr_id);
        	auditValues.put("status_new", "I");
        	auditValues.put("status_old", status);
        	auditValues.put("date_modified", currentDateTime);
        	auditValues.put("afm_user_name", afm_user_name);
        	auditValues.put("from_mobile", 1);
        	      
            executeDbSave(context, "uc_wr_audit", auditValues);
            executeDbCommit(context); 
            
            JSONObject wrRecord = new JSONObject();
            wrRecord.put("wr.wr_id", wr_id);
            wrRecord.put("wr.status", status);
            
            wrHandler.updateWorkRequestStatus(wr_id.toString(), wr_id.toString(), wr_id.toString(), wrRecord, "I");
		}
		*/
		
    }
    
    /*
    public void sendWrEmail(int wr_id, String emailTo) {
    	EventHandlerContext context = ContextStore.get().getEventHandlerContext();
    	BrgMessage message = new BrgMessage(context);
    	
    	String activityId = "AbBldgOpsOnDemandWork";
    	String referencedBy = "SEND_WR_EMAIL_WFR";
    	
        message.setActivityId(activityId);
        message.setReferencedBy(referencedBy);

        //String link = getWebCentralPath(context) + "/"+ getActivityParameterString(context, Constants.ONDEMAND_ACTIVITY_ID,"CF_VIEW");
        //String link = getWebCentralPath(context);
        String link = "http://afm.ucalgary.ca";
        Map dataModel = null;

        dataModel = BrgMessageHelper.getRequestDatamodel(context, "wr", "wr_id", wr_id);

        dataModel.put("link", link);

        //String email = notNull(selectDbValue(context, "em", "email", "em_id = "
        //        + literal(context, em_id)));

        if (emailTo != null && !emailTo.equals("")) {
            message.setBodyMessageId("WRMANAGER_EMAIL_BODY");
            message.setSubjectMessageId("WRMANAGER_EMAIL_SUBJECT");

            if(message.isBodyRichFormatted() || message.isSubjectRichFormatted()){
                message.setDataModel(dataModel);
            }
            if(!message.isBodyRichFormatted()){
                message.setBodyArguments(new Object[]{link});
            }
            message.format();

            message.setMailTo(emailTo);
            message.setMailFrom("test.afm@ucalgary.ca");
            //message.setNameto(em_id);

            //message.sendMessage();
            try {
				BrgMessageHelper.sendMessage(context, message, null);
			} catch (UnsupportedEncodingException e) {
				e.printStackTrace();
			} catch (MessagingException e) {
				e.printStackTrace();
			}
        }

    }
  	*/
    
    public void approveWrOtherStaging(JSONArray stagingIdList, int updateWrStatus) {
    	EventHandlerContext context = ContextStore.get().getEventHandlerContext();
    	    	
    	// Current DateTime
    	java.sql.Date currentDateTime = new java.sql.Date(Calendar.getInstance().getTime().getTime());
 
		com.archibus.eventhandler.ondemandwork.WorkRequestHandler wrHandler = new com.archibus.eventhandler.ondemandwork.WorkRequestHandler();
    	
        for (int i = 0; i < stagingIdList.length(); i++) {
        	int stagingId = stagingIdList.getInt(i);
        	
        	// query for the record
            Object[] stagingRecord = selectDbValues(context, "uc_wr_other_staging", new String[] { "uc_wr_other_staging_id", "wr_id", "other_rs_type", "date_requested", "qty_used", "description", "cf_id" },
                    "uc_wr_other_staging_id = " + Integer.toString(stagingId));
        	
            Integer wr_id = getIntegerValue(context, stagingRecord[1]);
            String other_rs_type = notNull(stagingRecord[2]);
            java.sql.Date date_requested = getDateValue(context, stagingRecord[3]);
            Double qty_used = Double.parseDouble(stagingRecord[4].toString());
            String description = notNull(stagingRecord[5]);
            String cf_id = notNull(stagingRecord[6]);
            
            java.sql.Date date_used = (java.sql.Date) currentDateTime.clone();
            
            // find the next available date for date_used
            Object[] wrOtherCheck = null;
            do {
                String date = formatSqlFieldValue(context, date_used, "java.sql.Date", "date_used");
            	wrOtherCheck = selectDbValues(context, "wr_other", new String[] { "wr_id" },
                        "wr_id = " + Integer.toString(wr_id) + " AND other_rs_type = " + literal(context, other_rs_type) + " AND date_used = " + date);
            	
            	if (wrOtherCheck != null) {
            		// record exists, increase by 1.
	            	Calendar cal = Calendar.getInstance();
	            	cal.setTime(date_used);
	            	cal.add(Calendar.DATE, 1);
	            	
	            	date_used.setTime(cal.getTimeInMillis());
            	}
            } while (wrOtherCheck != null);
            
        	// Write wr_other record
        	Map wrOtherValues = new HashMap();
        	wrOtherValues.put("wr_id", wr_id);
        	wrOtherValues.put("other_rs_type", other_rs_type);
        	wrOtherValues.put("date_used", date_used);
        	
        	wrOtherValues.put("qty_used", qty_used);
        	wrOtherValues.put("description", description);
        	      
            executeDbSave(context, "wr_other", wrOtherValues);
            
            // Write the dates back to the staging record
        	Map stagingWriteback = new HashMap();
        	stagingWriteback.put("uc_wr_other_staging_id", stagingId);
        	stagingWriteback.put("date_approved", currentDateTime);
        	stagingWriteback.put("date_used", date_used);
        	stagingWriteback.put("status", "A");
        	      
            executeDbSave(context, "uc_wr_other_staging", stagingWriteback);
            
            // update audit and wr status.
            String afm_user_name = notNull(selectDbValue(context, "afm_users", "user_name", "email = (SELECT email FROM cf WHERE cf_id = "+literal(context, cf_id)+")"));
            
            String wr_status = notNull(selectDbValue(context, "wr", "status", "wr_id = "+Integer.toString(wr_id)));
            
            if (!wr_status.equals("HP")) {
	        	Map auditValues = new HashMap();
	        	auditValues.put("wr_id", wr_id);
	        	auditValues.put("status_new", "HP");
	        	auditValues.put("status_old", wr_status);
	        	auditValues.put("date_modified", currentDateTime);
	        	auditValues.put("afm_user_name", afm_user_name);
	        	      
	            executeDbSave(context, "uc_wr_audit", auditValues);
	            executeDbCommit(context); 
	            
	            JSONObject wrRecord = new JSONObject();
	            wrRecord.put("wr.wr_id", wr_id);
	            wrRecord.put("wr.status", wr_status);
	            
	            wrHandler.updateWorkRequestStatus(Integer.toString(wr_id), Integer.toString(wr_id), Integer.toString(wr_id), wrRecord, "HP");
            }
        }
    }
}
