package com.brg.eventhandler.pm;

import java.util.Calendar;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import org.json.JSONArray;
import org.json.JSONObject;

import com.archibus.datasource.DataSource;
import com.archibus.datasource.DataSourceFactory;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;

public class UCPMHandler extends EventHandlerBase {
	final private String[] MONTHS = {"jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"};

    /**
     * Auto Cancels (Reject in UofC nomenclature) generated PMs
     * according to rules defined in the uc_pms_cal table.
     * 
     * These parameters need to be set in the afm_activity_params table:
     *   UC_RUN_AUTO_CANCEL : Only auto-updates if set to Y.
     *   UC_AUTO_CANCEL_NOTES : This string will be put into the wr.cf_notes of canceled requests.
     * 
     * This routine only check for requests created on the same day.
     * 
     * @param context
     */ 
    public void autoCancelPM(EventHandlerContext context) {
    	log.info("Running AutoCancel PM routine");
    	
    	String autoCancel = getActivityParameterString(context, 
    		    "AbBldgOpsPM", "UC_RUN_AUTO_CANCEL");

    	String autoCancelMessage = getActivityParameterString(context, 
    		    "AbBldgOpsPM", "UC_AUTO_CANCEL_NOTES");
    	   	
    	if (autoCancel != null && autoCancel.equals("Y")) {
    		JSONArray recordsToCan = new JSONArray();
    		
    		// determine which wr's need to be auto canceled.
			// check each month's PM for possible auto cancellation.  It's possible to generate
			// a few months in advance.
			for(int m = 1; m <= 12; m++) {
	    		// retrieve records for canceling
	    		String sql = "SELECT wr_id FROM wr LEFT OUTER JOIN uc_pms_cal ON wr.pms_id = uc_pms_cal.pms_id "
	    			       + "WHERE wr.pms_id IS NOT NULL AND prob_type = 'PREVENTIVE MAINT'" // pm's only.
	    			       + "  AND wr.status IN ('A','R','AA')"			// can only cancel these statuses.
	    			       + "  AND DATEDIFF(day, date_requested, GETDATE()) = 0 "	// requested today.
	    			       + "  AND DATEPART(mm,date_assigned) = " + m		// date to perform equal to reject_flag month.
	    				   + "  AND " + MONTHS[m-1] + "_status = 2";		// reject flag.
	    		List records = selectDbRecords(context, sql);

	    		// insert into the JSONArray to pass into the cancel workflow.
	    		for (Iterator it = records.iterator(); it.hasNext(); ) {
	    			Object[] record = (Object[]) it.next();
		
		    		Integer id = getIntegerValue(context, record[0]);
		    		JSONObject wrToCan = new JSONObject();
		    		wrToCan.put("wr.wr_id", id);
		    		
		        	if (autoCancelMessage != null) {
			    		// update the cf_notes
		                Map<String,Object> values = new HashMap<String,Object>();
		                values.put("wr_id", new Integer(id));
		                values.put("cf_notes", autoCancelMessage);
		                executeDbSave(context, "wr", values);
		        	}
		        	
		    		recordsToCan.put(wrToCan);
	    		}
			}
			
            executeDbCommit(context);
            
    		// send the records to the cancel work request rule.
            context.addResponseParameter("records", recordsToCan);
            runWorkflowRule(context, "AbBldgOpsOnDemandWork-cancelWorkRequests", false);
    	}
    	else {
        	log.error("autoCancelPM: UC_RUN_AUTO_CANCEL Flag not set to 'Y' in afm_activity_params.");
    	}
    }
    
    /**
     * Sets the current freq to 1 (active) or 4 (inactive) for next month
     * according to rules defined in the uc_pms_cal table.
     * 
     * These parameters need to be set in the afm_activity_params table:
     *   UC_RUN_SET_ACTIVE : Only auto-updates if set to Y.
     * 
     * Only the pms records that are set to interval_type = 'm' are affected.
     * 
     * @param context
     */ 
    public void setPMActive(EventHandlerContext context) {
    	log.info("Running Set PM Active routine");
    	
    	String autoActive = getActivityParameterString(context, 
    		    "AbBldgOpsPM", "UC_RUN_SET_ACTIVE");	
    	
    	if (autoActive != null && autoActive.equals("Y")) {
    		Calendar cal = Calendar.getInstance();
    		int month = cal.get(Calendar.MONTH);
    		
    		String sql = "UPDATE pms SET interval_freq = CASE "+MONTHS[month]+"_status WHEN 1 THEN 1 WHEN 2 THEN 1 ELSE 4 END "
    			       + "FROM pms p LEFT OUTER JOIN uc_pms_cal c ON p.pms_id = c.pms_id "
    			       + "WHERE interval_type = 'm'";

    		executeDbSql(context, sql, false);
    		executeDbCommit(context);
    	}
    	else {
           	log.error("setPMActive: UC_RUN_SET_ACTIVE Flag not set to 'Y' in afm_activity_params.");
    	}
    }
    
    public void updateWrAcId(EventHandlerContext context) {
    	log.info("Running Account Code Assignment routine");

        // For all account codes that will be assigned, insert into the ac
        // table if it does not already exist
        String sqlInsertAc = "INSERT INTO ac (ac_id) "+
        	"SELECT DISTINCT wr_ac_id FROM wr, uc_prm_gen_account_code_v gac "+
        	"WHERE wr.pms_id = gac.pms_id AND wr.status IN ('AA', 'I') AND (wr.ac_id IS NULL or wr.ac_id = gac.pmp_ac_id) AND gac.wr_ac_id IS NOT NULL "+
        	"AND NOT EXISTS (SELECT 1 FROM ac WHERE ac.ac_id = gac.wr_ac_id)";

        executeDbSql(context, sqlInsertAc, false);
        
        // Update the wr ac_ids
        String sqlUpdateWrAc = "UPDATE wr SET ac_id = gac.wr_ac_id FROM wr, uc_prm_gen_account_code_v gac "+
        	"WHERE wr.pms_id = gac.pms_id AND wr.status IN ('AA', 'I') AND (wr.ac_id IS NULL or wr.ac_id = gac.pmp_ac_id) AND gac.wr_ac_id IS NOT NULL "+
        	"AND EXISTS (SELECT 1 FROM ac WHERE ac.ac_id = gac.wr_ac_id)";
        
        executeDbSql(context, sqlUpdateWrAc, false);
        
        // Update the wr requestor
        String sqlUpdateWrReq = "UPDATE wr SET requestor = 'AFMMAINT' WHERE EXISTS (SELECT 1 FROM em WHERE em_id = 'AFMMAINT') AND requestor IS NULL AND prob_type = 'PREVENTIVE MAINT' AND pms_id IS NOT NULL";
        
        executeDbSql(context, sqlUpdateWrReq, false);
        
        // Default tr_id to CSC if blank
        String sqlUpdateWrTr = "UPDATE wr SET tr_id = 'CCC' WHERE tr_id IS NULL AND prob_type = 'PREVENTIVE MAINT' AND pms_id IS NOT NULL";
        
        executeDbSql(context, sqlUpdateWrTr, false);  

		String sqlUpdateWrWt = "UPDATE wr set work_team_id = isnull(wt,'CCC') from(select wr.*,pmp.work_team_id wt from wr inner join pmp on wr.pmp_id=pmp.pmp_id and wr.work_team_id ='TBD' AND prob_type = 'PREVENTIVE MAINT')wr";
        
        executeDbSql(context, sqlUpdateWrWt, false);        
        
        // Update the PMs to Single Funding for the floors that are marked as SF.
        String sqlUpdateWrSF = "UPDATE WR SET charge_type='Single Funding' FROM wr,fl WHERE wr.bl_id = fl.bl_id AND wr.fl_id = fl.fl_id AND wr.requestor='AFMMAINT' AND fl.option1 = 'SF' AND CONVERT(VARCHAR,wr.date_requested,101)=CONVERT(VARCHAR,GETDATE(),101)";
        
        executeDbSql(context, sqlUpdateWrSF, false);
        
        executeDbCommit(context);
    }
    
}
