import java.util.*;

import com.archibus.eventhandler.*;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.context.ContextStore;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.SqlUtils;

import com.archibus.utility.ExceptionBase;

/**
 * BasicRules_AdvanceSampleDataDates.java: Advance date fields in sample data.
 * 
 * Advance date fields in all activities by the number of days calculated by the difference between today's date and the date
 * stored in the activity parameter AbSystemAdministration.DateSampleDatesLastUpdated.
 *
 * All date fields in the schema are updated EXCEPT date fields in afm_* tables and date fields specified in fields_not_to_update_list
 * variable below.
 *
 * KB# 3034905: EH&S and MSDS require sample data that is particularly sensitive to date ranges. 
 * To my understanding the EH&S and MSDS data needs to be updated about every month. 
 * For Windows C/S we have a script for advancing date data (C:\Program Files\Afm19\Projects\Hq\AfmAdvanceDates.abs) 
 * which is somewhat imperfect in that the code requires the full list of fields and we only have the ability to 
 * shift all of the dates by a number of years. (Also it only can be run from Win C/S and currently does not run.)
 * For Web C it would be advantageous to add a Basic Rule, which Sys Admins can execute which advances the 
 * date values of date fields for all applications.
 * <p>
 * History:
 * <li>20.1 Initial implementation (February 12-15, 2012).
 *
 * @param context: Event handler context.
 * @author Angel Delacruz
 *
 */
 
public class BasicRules_AdvanceSampleDataDates extends BasicRuleBase {

  public void handle() {
    // BEGIN RULE
       
    /** 
     * This is the list of fields that ARE NOT to be updated.  This exception list approach is used because most fields
     * will be updated, therefore the exclude list is much smaller than the include list.
     * To add additional fields, find the line for the table and insert the field.  If there is no line for the table, 
     * insert one before the last line.
     * Date fields which are part of an FK should be excluded. The following query detects such tables that contain such fields:
     *
		 * SELECT afm_flds.table_name, field_name, ref_table
		 * FROM afm.afm_flds, afm.afm_tbls 
		 * WHERE afm_tbls.table_name = afm_flds.table_name AND is_sql_view = 0 AND afm_flds.ref_table IN (
		 * SELECT afm_flds.table_name
		 * FROM afm.afm_flds, afm.afm_tbls 
		 * WHERE afm_tbls.table_name = afm_flds.table_name AND is_sql_view = 0 AND primary_key>0 
		 * AND afm_flds.table_name NOT LIKE 'afm_%' AND data_type = 9)  
		 * ORDER BY afm_flds.table_name, field_name 
		 *
		 * NOTE:  On MSSQL and Oracle, we cannot advance dates where date field is part of PK for records that are referenced by an FK.
		 *        This is due to the fact that cascading updates are not properly supported on those db engines, only Sybase cascades.
		 *				Currently (20.3), there are no tables with this issue.  
    */
    String fields_not_to_update_list = " 1=1"
    	+ " AND (afm_flds.table_name<>'msds_data' OR field_name NOT IN ('date_issued','date_supersedes','date_replaced'))"
    	+ " AND (afm_flds.table_name<>'msds_h_data' OR field_name NOT IN ('date_issued','date_supersedes','date_replaced'))"
    	+ " AND (afm_flds.table_name<>'energy_bl_svc_period')"
			+ " AND (afm_flds.table_name<>'energy_chart_point')"
			+ " AND (afm_flds.table_name<>'energy_time_period')"
			+ " AND (afm_flds.table_name<>'bl' OR field_name<>'energy_baseline_year')"
			+ " AND (afm_flds.table_name<>'bill')"
			+ " AND (afm_flds.table_name<>'bill_archive')"
                        + " AND (afm_flds.table_name NOT LIKE 'bas_%')"
    	;
    
    String fieldsUpdateSQLerr = "";  // comma separated list of fields not updated due to SQL error
    
    EventHandlerContext context = ContextStore.get().getEventHandlerContext();
    
    // The activity parameter 'DateSampleDatesLastUpdated' is used to determine number of days to advance the date fields
		String DateSampleDatesLastUpdatedStr = EventHandlerBase.getActivityParameterString(context, "AbSystemAdministration", "DateSampleDatesLastUpdated");
             
    // Get the fields to update.  Include only date fields (data_type=9).  Exclude obvious FKs
    // Exclude tables named afm_*, exclude view tables, exclude fields listed in {fields_not_to_update_list} variable above 
    // If you wish to exclude calculated date fields, add " AND afm_type<>2070" to WHERE clause.
    String[] flds = new String[] { "table_name", "field_name" };
    String dateAfmFieldsSQL = "SELECT afm_flds.table_name, field_name FROM afm.afm_flds, afm.afm_tbls" 
			+ " WHERE afm_tbls.table_name = afm_flds.table_name AND is_sql_view = 0" 
			+ " AND (ref_table IS NULL OR validate_data=0)"  // Exclude obvious Foreign Keys
			+ " AND afm_flds.table_name NOT LIKE 'afm_%' AND data_type = 9 AND (" + fields_not_to_update_list + ")"
			+ " ORDER BY afm_flds.table_name, field_name";
        
    List<DataRecord> dateAfmFieldsRecords = SqlUtils.executeQuery("afm_flds", flds, dateAfmFieldsSQL);

    //  If activity parameter is missing or empty, or if no records to update, abort processing
		if (DateSampleDatesLastUpdatedStr==null || DateSampleDatesLastUpdatedStr=="" || dateAfmFieldsRecords==null) {
			if (dateAfmFieldsRecords==null) 
			  log.debug("BasicRules_AdvanceSampleDataDates: Could not find any date fields to advance\n");
			else log.debug("BasicRules_AdvanceSampleDataDates: Activity Parameter 'DateSampleDatesLastUpdated' is empty or does not exist\n");
			return;
		}   

  	log.debug("BasicRules_AdvanceSampleDataDates: Updating " + dateAfmFieldsRecords.size() + " date fields\n");
		
		// For each date field, advance the date by (today's date - DateSampleDatesLastUpdated) days
    for (DataRecord afmFieldsRecord : dateAfmFieldsRecords) {
      String tableName = afmFieldsRecord.getString("afm_flds.table_name");
      String fieldName = afmFieldsRecord.getString("afm_flds.field_name");
      String advanceDatesSQL = "UPDATE " + tableName + " SET " + fieldName + " = "
    				+ EventHandlerBase.formatSqlAddDaysToExpression(context, fieldName, "(" + EventHandlerBase.formatSqlDaysBetween(context, "${sql.date('" 
    				+ DateSampleDatesLastUpdatedStr + "')}", "${sql.currentDate}")+")")
    				+ " WHERE " + fieldName + " IS NOT NULL";
    				
    	/* If db server is Sybase, use ORDER BY clause to update most recent dates first, in case date field is part of PK
    	 This will avoid rare but possible error with duplicate PK if older dates are advanced first and new date happens to match
    	 an existing date in the table.  ORDER BY clause in UPDATE statement is only supported by Sybase. On MSSQL and Oracle,
    	 we just have to cross fingers and hope, although the probability is low that we will encounter this situation
    	 Note:  We discovered that the clause below fails on Sybase because the db option ANSI_UPDATE_CONSTRAINTS is set to CURSORS
    	 in canonic db, it must be set to OFF.  If this changes in a future canonic, we can reenable this clause
    	*/
    	// if (SqlUtils.isSybase()) advanceDatesSQL += " ORDER BY " + fieldName + " DESC";
    			
    	//log.debug("BasicRules_AdvanceSampleDataDates: " + advanceDatesSQL);
    	
    	try {
    	  SqlUtils.executeUpdate(tableName, advanceDatesSQL);
    	}
    	catch (final ExceptionBase e) {
    		log.debug(e.toStringForLogging());
    		fieldsUpdateSQLerr += tableName + "." + fieldName + ", ";
      }
    	// break;  // For testing, remove for production
    }

		// Update the activity parameter (AbSystemAdministration->DateSampleDatesLastUpdated) value with today's date
   	SqlUtils.executeUpdate("afm_activity_params", "UPDATE afm_activity_params SET param_value = ${sql.currentDate}"
   					+ " WHERE activity_id='AbSystemAdministration' and param_id='DateSampleDatesLastUpdated'");
   				
   	if (fieldsUpdateSQLerr != "") {  // At least one field had a SQL update error, show message with list
   	  throw new ExceptionBase(fieldsUpdateSQLerr);
  	}	
   

// END RULE
  }
}