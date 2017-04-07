package ca.ucalgary.eventhandler.common;

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

public class UCAppaReport extends EventHandlerBase {
    public void calculateAppaData(String interval, String period, String date_start, String date_end) {
        EventHandlerContext context = ContextStore.get().getEventHandlerContext(); 

        //java.sql.Date startDate = getDateValue(context, restriction.get("date_start"));
        //java.sql.Date endDate = getDateValue(context, restriction.get("date_end"));
        
		String getAppaSql = "SELECT uc_appa_report_section_id, uc_appa_report_def_id, sql_text FROM uc_appa_report_defs WHERE active = 1 AND sql_text IS NOT NULL";
    	List appaSqlTextList = selectDbRecords(context, getAppaSql);

		for (Iterator it = appaSqlTextList.iterator(); it.hasNext();) {
            Object[] staging_record = (Object[]) it.next();
            String uc_appa_report_section_id = notNull(staging_record[0]);
            String uc_appa_report_def_id = notNull(staging_record[1]);
            String sql_text = notNull(staging_record[2]);
            sql_text = sql_text.replaceAll("\\{date_start\\}", date_start);
            sql_text = sql_text.replaceAll("\\{date_end\\}", date_end);

            try {
            	List entryList = selectDbRecords(context, sql_text);
            	if (!entryList.isEmpty()) {
	            	String entry = notNull(((Object[])entryList.get(0))[0]);
	            	
	            	Map ucAppaValues = new HashMap();
	            	ucAppaValues.put("uc_appa_report_section_id", uc_appa_report_section_id);
	            	ucAppaValues.put("uc_appa_report_def_id", uc_appa_report_def_id);
	            	ucAppaValues.put("interval", interval);
	            	ucAppaValues.put("period", period);
	            	ucAppaValues.put("entry", entry);
	    	    	ucAppaValues.put("is_calculated", "1");
	
	                executeDbSave(context, "uc_appa_report_data", ucAppaValues);
	                executeDbCommit(context);            		
            	}

            }
            catch (Exception ex) {
            	log.error("calculateAppaData: Sql failed: "+sql_text);
            }
		}
    }
    
    public void autoUpdateAppaValues(EventHandlerContext context) {
    	log.info("autoUpdateAppaValues: String autoUpdateAppaValues");
    	// Recalculate each month from the beginning (2010)
    	 Calendar today = Calendar.getInstance();
    	 int currentYear = today.get(Calendar.YEAR);
    	 int currentMonth = today.get(Calendar.MONTH);
    	 
    	 for (int i = 2010; i <= currentYear; i++) {
    		for (int j = 0; i < 12; j++) {
    			Calendar endOfMonth = Calendar.getInstance();
    			endOfMonth.set(i, j, 1);
    			int endDay = endOfMonth.getActualMaximum(Calendar.DAY_OF_MONTH);
    			String date_start = Integer.toString(i) + "-" + String.format("%02d",j) + "-01";
    			String date_end = Integer.toString(i) + "-" + String.format("%02d",j) + "-" + String.format("%02d",endDay);
    	
    			calculateAppaData("Monthly", "AUTO "+Integer.toString(i)+"-"+String.format("%02d",j), date_start, date_end);
    			if (i == currentYear && j == currentMonth ) {
    				break;
    			}
    		}
    	 } 
    }
    
    public void createManualAppaEntries(String interval, String period) {
        EventHandlerContext context = ContextStore.get().getEventHandlerContext(); 
        
		String getMissingAppaSql = "SELECT uc_appa_report_section_id, uc_appa_report_def_id FROM uc_appa_report_defs defs WHERE active = 1 AND NOT EXISTS (SELECT 1 FROM uc_appa_report_data d WHERE d.uc_appa_report_section_id = defs.uc_appa_report_section_id AND d.uc_appa_report_def_id = defs.uc_appa_report_def_id AND d.interval = "+
			literal(context, interval)+" AND d.period = "+literal(context,period)+")";
    	List createAppaEntryList = selectDbRecords(context, getMissingAppaSql);

		for (Iterator it = createAppaEntryList.iterator(); it.hasNext();) {
            Object[] staging_record = (Object[]) it.next();
            String uc_appa_report_section_id = notNull(staging_record[0]);
            String uc_appa_report_def_id = notNull(staging_record[1]);
            
	    	Map ucAppaValues = new HashMap();
	    	ucAppaValues.put("uc_appa_report_section_id", uc_appa_report_section_id);
	    	ucAppaValues.put("uc_appa_report_def_id", uc_appa_report_def_id);
	    	ucAppaValues.put("interval", interval);
	    	ucAppaValues.put("period", period);
	    	ucAppaValues.put("is_calculated", "0");
	
	        executeDbSave(context, "uc_appa_report_data", ucAppaValues);
		}

        executeDbCommit(context);   
    }
}

