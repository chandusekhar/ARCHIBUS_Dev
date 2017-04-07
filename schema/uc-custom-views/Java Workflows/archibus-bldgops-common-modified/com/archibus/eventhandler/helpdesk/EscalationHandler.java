package com.archibus.eventhandler.helpdesk;

import java.sql.Date;
import java.sql.Time;
import java.util.Iterator;
import java.util.List;

import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.eventhandler.steps.Escalation;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.*;

/**
 * 
 * Handles scheduled workflowrule to start escalations
 * 
 */

public class EscalationHandler extends HelpdeskEventHandlerBase {

    /**
     * 
     * Scheduled workflow rule for SLA escalations.
     * 
     * <p>
     * This workflow rule is set as 'Scheduled' workflow rule. Can run each 15 minutes to check if
     * there are escalations to be fired on Response and Completion.
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Check escalations for response</li>
     * <li>Check escalations for completion</li>
     * </ol>
     * </p>
     * 
     * @param context Workflow rule execution context
     * 
     * @see #runEscalation(EventHandlerContext, int)
     * 
     */
    public void runSLAEscalations(EventHandlerContext context) {
        // Response escalations
        runEscalation(context, Constants.ESCALATION_RESPONSE);

        // Completion escalations
        runEscalation(context, Constants.ESCALATION_COMPLETE);
                
        this.log.info("Escalation rule called at " + new Date(System.currentTimeMillis()));
    }

    /**
     * Run Escalations.
     * 
     * Check all request records for escalation.
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Create and execute sql query (depending on current db system)</li>
     * <li>Iterate over records found</li>
     * <li>Create escalation records in helpdesk_step_log and send escalation email if necessary</li>
     * </ol>
     * </p>
     * 
     * <p>
     * <b>SQL:</b> Query to retrieve records to send escalations for: (for Sybase)
     * <p>
     * Escalation for response (Sybase): <div>SELECT activity_log_id, manager FROM activity_log
     * <br />
     * WHERE date_issued IS NULL <br />
     * AND date_escalation_response + time_escalation_response &lt;= <i>current date+time</i><br />
     * AND escalated_response IS NULL</div>
     * </p>
     * <p>
     * Escalation for completion (Sybase): <div>SELECT activity_log_id, manager FROM activity_log<br />
     * WHERE date_completed IS NULL <br />
     * AND date_escalation_completion + time_escalation_completion &lt;= <i>current date+time</i><br />
     * AND escalated_completion IS NULL</div>
     * 
     * <div>UPDATE activity_log SET escalated_response = 1 WHERE activity_log_id = ?</div>
     * <div>UPDATE activity_log SET escalated_completion = 1 WHERE activity_log_id = ?</div>
     * 
     * @param context Workflow rule execution context
     * @param type {@link com.archibus.eventhandler.helpdesk.Constants#ESCALATION_RESPONSE} or
     *            {@link com.archibus.eventhandler.helpdesk.Constants#ESCALATION_COMPLETE}
     */

    private void runEscalation(EventHandlerContext context, int type) {
       
        StringBuffer sql = new StringBuffer(" activity_type LIKE 'SERVICE DESK%' AND ");
        
        // String date = Common.getCurrentLocalDate(null, null, null, null);
        java.sql.Date currentLocalDate = Utility.currentDate();
        long millSecondsTime = currentLocalDate.getTime();
        // extends one day base one current day due to timezone issue.Because it cannot get the time zone in this schedule wfr, so extends one day for the sql query to avoid miss some items
        //Guo(2011-03-24) Fix KB3030870. 
        millSecondsTime += 24 * 60 * 60 * 1000;
        currentLocalDate.setTime(millSecondsTime);
        
        String date = currentLocalDate.toString();
        String time = Utility.currentTime().toString();
        
        String date_time = formatSqlDateTime(context, date, time);
        if (isSqlServer(context)) {
            if (type == Constants.ESCALATION_RESPONSE) {
                sql.append("date_issued IS NULL AND DateAdd(mi, datepart(mi, time_escalation_response),DateAdd(hh, datepart(hh, time_escalation_response), date_escalation_response  ) )	 <= "
                                + date_time + " AND escalated_response = 0");
            } else if (type == Constants.ESCALATION_COMPLETE) {
                sql.append("date_completed IS NULL AND DateAdd(mi, datepart(mi, time_escalation_completion),DateAdd(hh, datepart(hh, time_escalation_completion), date_escalation_completion  ) )	 <= "
                                + date_time + " AND escalated_completion = 0");
            }
        } else if (isOracle(context)) {
            if (type == Constants.ESCALATION_RESPONSE) {
                sql.append("date_issued IS NULL AND TO_DATE ( TO_CHAR(NVL(date_escalation_response,TO_DATE('2000/01/01','YYYY/MM/DD')), 'YYYY/MM/DD') || ' ' || TO_CHAR(time_escalation_response, 'HH24:MI') , 'YYYY/MM/DD HH24:MI'  ) <= "
                                + date_time + " AND escalated_response = 0" +
                                " AND date_escalation_response IS NOT NULL" +
                                " AND time_escalation_response IS NOT NULL");
            } else if (type == Constants.ESCALATION_COMPLETE) {
                sql.append("date_completed IS NULL AND TO_DATE ( TO_CHAR(NVL(date_escalation_completion,TO_DATE('2000/01/01','YYYY/MM/DD')), 'YYYY/MM/DD') || ' ' || TO_CHAR(time_escalation_completion, 'HH24:MI') , 'YYYY/MM/DD HH24:MI'  ) <= "
                                + date_time + " AND escalated_completion = 0" +
                                " AND date_escalation_completion IS NOT NULL" +
                                " AND time_escalation_completion IS NOT NULL");
            }
        } else {
            if (type == Constants.ESCALATION_RESPONSE) {
                sql.append("date_issued IS NULL AND date_escalation_response + time_escalation_response <= "
                                + date_time + " AND escalated_response = 0");
            } else if (type == Constants.ESCALATION_COMPLETE) {
                sql.append("date_completed IS NULL AND date_escalation_completion + time_escalation_completion <= "
                                + date_time + " AND escalated_completion = 0");
            }
        }
        
        String[] fieldNames = {
            "activity_log_id", 
            "date_escalation_response",
            "time_escalation_response",
            "date_escalation_completion", 
            "time_escalation_completion",
            "site_id", 
            "bl_id"};
            
        List records = EventHandlerBase.selectDbRecords(context, Constants.ACTION_ITEM_TABLE, fieldNames, sql.toString());
 
        // if no records found, no escalations have to be sent
        if (!records.isEmpty()) {
            
            for (Iterator it = records.iterator(); it.hasNext();) {
                Object[] record = (Object[]) it.next();
                
                //
                try {
                    runEscalationForRecord(context,record,type);
                } catch (Exception e) {
                    // KB3042424 - move on to other requests and not exit if it finds a problem such as this one (missing step)
                    // 1. log
                    String errorReport = ExceptionBase.printStackTraceToString(e);
                    this.log.error(errorReport);
                    // 2. ignore exception to continue next request
                }
            }
        }
    }
    
    /**
     * Run escalation for single record.
     */
    private void runEscalationForRecord(EventHandlerContext context, Object[] record,  int type) {
        //KB#3030758: Update SLA implementation to use LocalDateTimeUtil methods            
        LocalDateTime localDateTime =  LocalDateTimeStore.get();
        
        String siteId = notNull(record[5]);
        String blId = notNull(record[6]);
        
        Date activityLogCurrentLocalDate = localDateTime.currentLocalDate(null, null, siteId, blId);
        Time activityLogCurrentLocalTime = localDateTime.currentLocalTime(null, null, siteId, blId);
        
        if (type == Constants.ESCALATION_COMPLETE) {
            Date activityLogDate = EventHandlerBase.getDateValue(context, record[3]);
            Time activityLogTime = EventHandlerBase.getTimeValue(context, record[4]);
            
            if (!(compareDateTime(activityLogCurrentLocalDate, activityLogCurrentLocalTime, activityLogDate, activityLogTime) > 0)) {
                return;
            }
        } else {
            Date activityLogDate = EventHandlerBase.getDateValue(context, record[1]);
            Time activityLogTime = EventHandlerBase.getTimeValue(context, record[2]);
            
            if (!(compareDateTime(activityLogCurrentLocalDate, activityLogCurrentLocalTime, activityLogDate, activityLogTime) > 0)) {
                return;
            }
        }
        
        Integer id = getIntegerValue(context, record[0]);
        String stepName = type == Constants.ESCALATION_COMPLETE ? Escalation.STEP_ESCALATION_FOR_COMPLETION
                : Escalation.STEP_ESCALATION_FOR_RESPONSE;
            
        Escalation escalationStep = new Escalation(context, Constants.HELPDESK_ACTIVITY_ID,
                id.intValue(), stepName);
        escalationStep.invoke();
    }
    
    /**
     * Compare current date and current time with target date and target time.
     * if (current date + current time) > (target date + target time) return 1, 
     * if (current date + current time) = (target date + target time) return 0,
     * if (current date + current time) < (target date + target time) return -1,
     * 
     * @param currentDate
     * @param currentTime
     * @param targetDate
     * @param targetTime
     * @return
     */
    private int compareDateTime(Date currentDate, Time currentTime, Date  targetDate, Time  targetTime) {
        Date newCurrentDate = new Date(currentDate.getYear(), currentDate.getMonth(), currentDate.getDate());
        Time newCurrentTime = new Time(currentTime.getHours(), currentTime.getMinutes(), currentTime.getSeconds());
        
        long newCurrentDateTime = newCurrentDate.getTime() + newCurrentTime.getTime();
        
        Date targetCurrentDate = new Date(targetDate.getYear(), targetDate.getMonth(), targetDate.getDate());
        Time targetCurrentTime = new Time(targetTime.getHours(), targetTime.getMinutes(), targetTime.getSeconds());
        
        long newTargetDateTime = targetCurrentDate.getTime() + targetCurrentTime.getTime();
        
        if (newCurrentDateTime > newTargetDateTime) {
            return 1;
        } else if (newCurrentDateTime < newTargetDateTime){
            return -1;
        }
        
        return 0;
    }
}
