package com.archibus.app.bldgops.express;

import com.archibus.datasource.*;

/**
 * Bldgops Express Helper Class contains methods using SQL.
 * 
 * 
 * @author ASC-BJ:Zhang Yi
 * 
 *         Justification: Please see particular case of justification in each method's comment.
 * 
 *         Suppress Warning "PMD.TooManyMethods". Justification: This is a utility class, and the
 *         methods here belong together.
 */
@SuppressWarnings({ "PMD.AvoidUsingSql", "PMD.TooManyMethods" })
public final class BldgopsExpressSqlHelper {
    
    /**
     * Indicates the table name 'helpdesk_sla_steps'.
     * 
     */
    private static final String HELPDESK_SLA_STEPS = "helpdesk_sla_steps";
    
    /**
     * Indicates the table name 'helpdesk_step_log'.
     * 
     */
    private static final String HELPDESK_STEP_LOG = "helpdesk_step_log";
    
    /**
     * Indicates the table name 'afm_wf_steps'.
     * 
     */
    private static final String AFM_WF_STEPS = "afm_wf_steps";
    
    /**
     * Indicates the table-field name 'afm_wf_steps.status'.
     * 
     */
    private static final String AFM_WF_STEPS_STATUS = "afm_wf_steps.status";
    
    /**
     * Indicates the table-field name 'helpdesk_sla_steps.status'.
     * 
     */
    private static final String HELPDESK_SLA_STEPS_STATUS = "helpdesk_sla_steps.status";
    
    /**
     * Indicates the table-field name 'helpdesk_step_log.status'.
     * 
     */
    private static final String HELPDESK_STEP_LOG_STATUS = "helpdesk_step_log.status";
    
    /**
     * Indicates the table name 'afm_ptasks'.
     * 
     */
    private static final String AFM_PTASKS = "afm_ptasks";
    
    /**
     * Indicates the table name 'afm_activity_params'.
     * 
     */
    private static final String AFM_ACTIVITY_PARAMS = "afm_activity_params";
    
    /**
     * Constructor.
     * 
     */
    private BldgopsExpressSqlHelper() {
        
    }
    
    /**
     * Copy all relevant steps from activity_id AbBldgOpsHelpDesk to activity_id
     * AbBldgOpsOnDemandWork in afm_wf_steps.
     * 
     * Justification: Case #2.2: Statement with UPDATE ... WHERE pattern.
     */
    public static void copyWfrStepsFromHelpDeskToOnDemand() {
        
        final StringBuilder sql = new StringBuilder();
        
        final StringBuffer fields = BldgopsExpressUtility.getFieldsListString(AFM_WF_STEPS);
        
        final String newFields =
                fields
                    .toString()
                    .replaceAll("activity_id", "'AbBldgOpsOnDemandWork'")
                    .replaceAll(", status,",
                        " ,  " + getStatusConvertSql(AFM_WF_STEPS_STATUS).toString() + " ,")
                    .replaceAll(", status_after,",
                        ",  " + getStatusConvertSql("afm_wf_steps.status_after").toString() + ",");
        
        sql.append(" INSERT INTO afm_wf_steps (");
        sql.append(fields);
        sql.append(" ) SELECT ");
        sql.append(newFields);
        sql.append("  FROM afm_wf_steps  ");
        sql.append(" WHERE  afm_wf_steps.activity_id='AbBldgOpsHelpDesk' and afm_wf_steps.status!='CREATED' ");
        sql.append(" AND NOT EXISTS ( select 1 from afm_wf_steps ${sql.as} w where w.status=")
            .append(getStatusConvertSql(AFM_WF_STEPS_STATUS));
        sql.append("                and w.activity_id= 'AbBldgOpsOnDemandWork'  ");
        sql.append("                and w.step = afm_wf_steps.step )");
        
        SqlUtils.executeUpdate(AFM_WF_STEPS, sql.toString());
    }
    
    /**
     * Associate the SLA steps of AbBldgOpsHelpDesk with AbBldgOpsOnDemandWork.
     * 
     * Justification: Case #2.2: Statement with UPDATE ... WHERE pattern.
     */
    public static void updateSlaStepsFromHelpDeskToOnDemand() {
        // firstly update necessary AbBldgOpsHelpDesk steps
        final StringBuilder sql = new StringBuilder();
        sql.append(
            " UPDATE helpdesk_sla_steps SET helpdesk_sla_steps.activity_id='AbBldgOpsOnDemandWork',  helpdesk_sla_steps.status=")
            .append(getStatusConvertSql(HELPDESK_SLA_STEPS_STATUS));
        sql.append(" WHERE  helpdesk_sla_steps.activity_id='AbBldgOpsHelpDesk' ");
        sql.append(" AND    helpdesk_sla_steps.activity_type='SERVICE DESK - MAINTENANCE' ");
        sql.append(" AND    NOT EXISTS (  ");
        sql.append("                    select 1 from helpdesk_sla_steps ${sql.as} h ");
        sql.append("                             where h.activity_id='AbBldgOpsOnDemandWork' and h.activity_type='SERVICE DESK - MAINTENANCE' ");
        sql.append("                                   and h.ordering_seq=helpdesk_sla_steps.ordering_seq and h.priority=helpdesk_sla_steps.priority ");
        sql.append("                                   and h.step_order=helpdesk_sla_steps.step_order ");
        sql.append("                                   and h.status=");
        sql.append(getStatusConvertSql(HELPDESK_SLA_STEPS_STATUS)).append(")");
        
        SqlUtils.executeUpdate(HELPDESK_SLA_STEPS, sql.toString());
    }
    
    /**
     * @return 'case ... when' sql for converting status from Service Request to Work Request.
     * 
     * @param fieldName String: table-field name
     */
    public static String getStatusConvertSql(final String fieldName) {
        
        final StringBuilder statusConvertSql = new StringBuilder();
        statusConvertSql.append("( case ");
        
        statusConvertSql.append(" when ").append(fieldName).append("='REQUESTED' then 'R' ");
        statusConvertSql.append("  when  ").append(fieldName).append("='APPROVED' then 'A' ");
        statusConvertSql.append(" when  ").append(fieldName).append("='REJECTED' then 'Rej' ");
        statusConvertSql.append("  when   ").append(fieldName).append("='CANCELLED' then 'Can' ");
        statusConvertSql.append("  when     ").append(fieldName).append("='IN PROGRESS' then 'I' ");
        statusConvertSql.append("when ").append(fieldName).append("='IN PROCESS-H' then 'HL' ");
        statusConvertSql.append("  when       ").append(fieldName).append("='STOPPED' then 'S' ");
        statusConvertSql.append("  when ").append(fieldName).append("='COMPLETED' then 'Com' ");
        statusConvertSql.append("  when        ").append(fieldName).append("='CLOSED' then 'Clo' ");
        statusConvertSql.append("  else ").append(fieldName).append("  ");
        
        statusConvertSql.append(" end)");
        
        return statusConvertSql.toString();
    }
    
    /**
     * Create an associated wr record for any existing activity_log items of activity_type 'SERVICE
     * DESK - MAINTENANCE' that do not yet have an associated wr record.
     * 
     * Justification: Case #2.1 : Statement with INSERT ... SELECT pattern.
     */
    public static void createWorkRequestIfNotExistsForServiceRequest() {
        
        final StringBuilder sql = new StringBuilder();
        sql.append(" INSERT INTO wr(activity_type, activity_log_id, requestor, phone, site_id, bl_id, fl_id, rm_id, ");
        sql.append("                eq_id, prob_type, description, date_requested, time_requested,priority, dv_id, dp_id, manager, dispatcher ) ");
        sql.append(" SELECT activity_type, activity_log_id, requestor, phone_requestor, site_id, bl_id, fl_id, rm_id, ");
        sql.append("                eq_id, prob_type, description, date_requested, time_requested,priority, dv_id, dp_id, manager, dispatcher ");
        sql.append(" FROM activity_log WHERE  activity_log.activity_type='SERVICE DESK - MAINTENANCE' ");
        sql.append("                   AND NOT EXISTS ( select 1 from wr ${sql.as} w where w.activity_log_id=activity_log.activity_log_id ) ");
        
        SqlUtils.executeUpdate("wr", sql.toString());
    }
    
    /**
     * Change all pending steps for maintenance service requests that have a step defined as a
     * service request steps to work request steps.
     * 
     * Justification: Case #2.2: Statement with UPDATE ... WHERE pattern.
     */
    public static void attachPendingStepsOfServiceRequestToWorkRequest() {
        
        final StringBuilder sql = new StringBuilder();
        sql.append(" UPDATE helpdesk_step_log ");
        sql.append(" SET activity_id='AbBldgOpsOnDemandWork', table_name='wr',  field_name='wr_id',");
        sql.append(" pkey_value= ( select wr.wr_id from wr where wr.activity_log_id=helpdesk_step_log.pkey_value ), ");
        sql.append(" status=").append(getStatusConvertSql(HELPDESK_STEP_LOG_STATUS));
        sql.append(" WHERE  helpdesk_step_log.date_response IS NULL ");
        sql.append(" AND    helpdesk_step_log.table_name='activity_log' ");
        sql.append(" AND    helpdesk_step_log.field_name='activity_log_id' ");
        sql.append(" AND    EXISTS ( select 1 from activity_log where helpdesk_step_log.pkey_value=activity_log.activity_log_id ) ");
        sql.append(" AND    NOT EXISTS ( select 1 from helpdesk_step_log h where h.table_name='wr' and  h.field_name='wr_id' ");
        sql.append("                            and h.step_type=helpdesk_step_log.step_type and  h.step= helpdesk_step_log.step ");
        sql.append("                            and h.activity_id='AbBldgOpsOnDemandWork' and  h.date_response IS NULL ");
        sql.append("                            and h.status=");
        sql.append(getStatusConvertSql(HELPDESK_STEP_LOG_STATUS));
        sql.append(" and h.pkey_value=");
        sql.append("(select wr.wr_id from wr where wr.activity_log_id=helpdesk_step_log.pkey_value))");
        
        SqlUtils.executeUpdate(HELPDESK_STEP_LOG, sql.toString());
    }
    
    /**
     * Change current SLA step definitions on the Work Request Status 'A' to be steps on the Work
     * Request Status 'AA'.
     * 
     * Justification: Case #2.2: Statement with UPDATE ... WHERE pattern.
     */
    public static void convertSlaStepStatusToAA() {
        
        // Before re-attach SLA steps from status 'A' to 'AA' when WorkRequestsOnly=1, ensure that a
        // corresponding step record exists in table afm_wf_steps. If it doesn’t, then insert a
        // record
        StringBuilder sql = new StringBuilder();
        sql.append(" INSERT INTO afm_wf_steps (activity_id, status, step, step_type) ");
        sql.append(" SELECT DISTINCT activity_id, 'AA', step, step_type FROM helpdesk_sla_steps ");
        sql.append(" WHERE   status='A' ");
        sql.append(" AND NOT EXISTS ( select 1 from afm_wf_steps ${sql.as} w where w.status='AA' ");
        sql.append("                and w.activity_id= helpdesk_sla_steps.activity_id  ");
        sql.append("                and w.step = helpdesk_sla_steps.step ");
        sql.append("                and w.step_type=helpdesk_sla_steps.step_type )");
        SqlUtils.executeUpdate(HELPDESK_SLA_STEPS, sql.toString());
        
        // kb#3043174: also set translation strings for newly inserted steps
        sql = new StringBuilder();
        sql.append(" UPDATE afm_wf_steps set step_ch= ( select distinct s.step_ch from afm_wf_steps ${sql.as} s where s.step_ch is not null and s.step=afm_wf_steps.step ), ");
        sql.append("                         step_nl= ( select distinct s.step_nl from afm_wf_steps ${sql.as} s where s.step_nl is not null and s.step=afm_wf_steps.step ), ");
        sql.append("                         step_it= ( select distinct s.step_it from afm_wf_steps ${sql.as} s where s.step_it is not null and s.step=afm_wf_steps.step ), ");
        sql.append("                         step_fr= ( select distinct s.step_fr from afm_wf_steps ${sql.as} s where s.step_fr is not null and s.step=afm_wf_steps.step ), ");
        sql.append("                         step_es= ( select distinct s.step_es from afm_wf_steps ${sql.as} s where s.step_es is not null and s.step=afm_wf_steps.step ), ");
        sql.append("                         step_de= ( select distinct s.step_de from afm_wf_steps ${sql.as} s where s.step_de is not null and s.step=afm_wf_steps.step ) ");
        sql.append(" WHERE  afm_wf_steps.step_ch is null and afm_wf_steps.step_nl is null and afm_wf_steps.step_it is null and ");
        sql.append("        afm_wf_steps.step_fr is null and afm_wf_steps.step_es is null and afm_wf_steps.step_de is null ");
        SqlUtils.executeUpdate(HELPDESK_SLA_STEPS, sql.toString());
        
        // kb#3042773: must adjust the step_order firstly before the status 'A' to 'AA'.
        // and secondly change the step_order of steps that could not be update due to duplicated
        // primary keys in above, as well as perform the update operation successfully.
        BldgopsExpressSlaStepUpdate.updateSlaStepsDuplicatedForWorkRequestOnly();
        
        // then firstly use SQL to update the steps from 'A' status to 'AA' that
        // have not existed duplicated primary keys
        sql = new StringBuilder();
        sql.append(" UPDATE helpdesk_sla_steps ");
        sql.append(" SET status='AA' ");
        sql.append(" WHERE  status='A'  ");
        sql.append(" AND NOT EXISTS ( select 1 from helpdesk_sla_steps ${sql.as} h where h.status='AA' and h.step_order=helpdesk_sla_steps.step_order ");
        sql.append("                and h.priority=helpdesk_sla_steps.priority  and h.ordering_seq=helpdesk_sla_steps.ordering_seq ");
        sql.append("                and h.activity_type=helpdesk_sla_steps.activity_type");
        sql.append("                and h.activity_id=helpdesk_sla_steps.activity_id )");
        SqlUtils.executeUpdate(HELPDESK_SLA_STEPS, sql.toString());
        
        // comment out the delete code since all sla steps should be updated successfully from 'A'
        // to 'AA' status.
        /*
         * sql = new StringBuilder(); sql.append(" DELETE FROM helpdesk_sla_steps ");
         * sql.append(" WHERE  status='A' "); sql.append(
         * " AND EXISTS ( select 1 from helpdesk_sla_steps ${sql.as} h where h.status='AA' and h.step_order=helpdesk_sla_steps.step_order "
         * ); sql.append(
         * "               and h.priority=helpdesk_sla_steps.priority  and h.ordering_seq=helpdesk_sla_steps.ordering_seq "
         * ); sql.append("               and h.activity_type=helpdesk_sla_steps.activity_type");
         * sql.append("               and h.activity_id=helpdesk_sla_steps.activity_id )");
         * SqlUtils.executeUpdate(HELPDESK_SLA_STEPS, sql.toString());
         */
    }
    
    /**
     * Adjust current pending SLA steps of the Work Request to Status 'A' or 'AA' by
     * workRequestsOnly.
     * 
     * Justification: Case #2.2: Statement with UPDATE ... WHERE pattern.
     * 
     * @param workRequestsOnly int '1' or '0' to indicate if user choose 'work request only' on
     *            client side.
     */
    public static void convertPendingSlaStepStatus(final int workRequestsOnly) {
        
        String newStatus = "'A'";
        String oldStatus = "'AA'";
        if (workRequestsOnly == 1) {
            final String status = newStatus;
            newStatus = oldStatus;
            oldStatus = status;
        }
        
        final StringBuilder sql = new StringBuilder();
        sql.append(" UPDATE helpdesk_step_log  SET status=").append(newStatus);
        sql.append(" WHERE  date_response IS NULL AND status=").append(oldStatus);
        sql.append(" AND    table_name='wr' AND field_name='wr_id' ");
        
        SqlUtils.executeUpdate(HELPDESK_STEP_LOG, sql.toString());
    }
    
    /**
     * Update probtype.prob_class from N/A To 'On Demand Work'.
     * 
     * Justification: Case #2.2: Statement with UPDATE ... WHERE pattern.
     */
    public static void updateProblemClass() {
        
        final StringBuilder sql = new StringBuilder();
        sql.append(" UPDATE probtype SET probtype.prob_class = 'OD' ");
        sql.append(" WHERE  probtype.prob_class = 'N/A' ");
        
        SqlUtils.executeUpdate("probtype", sql.toString());
    }
    
    /**
     * KB3042114 -Update notification view link in application parameters table.
     * 
     * Justification: Case #2.2: Statement with UPDATE ... WHERE pattern.
     */
    public static void updateNotificationLink() {
        
        // update existing notification view link to 'ab-bldgops-console.axvw'
        final StringBuilder sql = new StringBuilder();
        sql.append(" UPDATE afm_activity_params SET afm_activity_params.param_value= 'ab-bldgops-console.axvw' ");
        sql.append(" WHERE  afm_activity_params.activity_id = 'AbBldgOpsOnDemandWork' and afm_activity_params.param_id like '%_View' ");
        sql.append(" and afm_activity_params.param_id !='Closed_View'");
        SqlUtils.executeUpdate(AFM_ACTIVITY_PARAMS, sql.toString());
        
        // if there are no Survey_View for AbBldgOpsOnDemandWork, insert a new one with value
        // 'ab-bldgops-console.axvw'
        if (DataStatistics
            .getInt(
                AFM_ACTIVITY_PARAMS,
                "param_id",
                "count",
                "afm_activity_params.activity_id = 'AbBldgOpsOnDemandWork' and afm_activity_params.param_id='Survey_View'") == 0) {
            
            SqlUtils
                .executeUpdate(
                    AFM_ACTIVITY_PARAMS,
                    "INSERT INTO afm_activity_params (activity_id,param_id,param_value,description) values('AbBldgOpsOnDemandWork','Survey_View','ab-bldgops-console.axvw','Survey view file')");
            
        }
    }
    
    /**
     * Move helpdesk sla steps 'Dispatch' and 'Request Approved' to the A status when
     * WorkReqeustOnly=0.
     * 
     * Justification: Case #2.2: Statement with UPDATE ... WHERE pattern.
     */
    public static void restoreSlaStepsToStatusA() {
        
        final StringBuilder sql = new StringBuilder();
        sql.append(" UPDATE helpdesk_sla_steps SET status = 'A' ");
        sql.append(" WHERE  ( step = 'Dispatch' or step ='Request Approved' ) and activity_id='AbBldgOpsOnDemandWork'  ");
        
        SqlUtils.executeUpdate(HELPDESK_SLA_STEPS, sql.toString());
    }
    
    /**
     * Update ptasks to point to new views of Building Operation Console.
     * 
     * Justification: Case #2.2: Statement with UPDATE ... WHERE pattern.
     */
    public static void updateAfmPtaskEntryForBldgopsConsole() {
        
        StringBuilder sql = new StringBuilder();
        sql.append(" Update afm_ptasks set task_file = 'ab-bldgops-sla.axvw' ");
        sql.append(" Where task_file = 'ab-helpdesk-sla-create-tabs.axvw' and (activity_id = 'AbBldgOpsOnDemandWork' or activity_id = 'AbBldgOpsPM') ");
        
        SqlUtils.executeUpdate(AFM_PTASKS, sql.toString());
        
        sql = new StringBuilder();
        sql.append(" Update afm_ptasks set task_file = 'ab-bldgops-express-manager-search-tabs.axvw' ");
        sql.append(" Where task_file = 'ab-helpdesk-manager-search-tabs.axvw' and (activity_id = 'AbBldgOpsOnDemandWork' or activity_id = 'AbBldgOpsPM') ");
        
        SqlUtils.executeUpdate(AFM_PTASKS, sql.toString());
        
    }
    
    /**
     * Set Value for field 'step_status_result'/'step_status_rejected' of Dispatch step
     * 
     * Justification: Case #2.2: Statement with UPDATE ... WHERE pattern.
     */
    public static void setValueOfDispatchWrStep() {
        
        final StringBuilder sql = new StringBuilder();
        sql.append(" Update afm_wf_steps set step_status_result = 'dispatched', step_status_rejected='rejected' ");
        sql.append(" Where step = 'Dispatch' and step_status_result='none' and step_status_rejected = 'none' ");
        
        SqlUtils.executeUpdate(AFM_WF_STEPS, sql.toString());
        
    }
    
    /**
     * Copy cf.work_team_id to table cf_work_team record as a record.
     * 
     * Justification: Case #2.2: Statement with UPDATE ... WHERE pattern.
     */
    public static void copyCfWorkTeam() {
        
        final StringBuilder sql = new StringBuilder();
        
        sql.append(" INSERT INTO cf_work_team (cf_id,work_team_id)");
        sql.append("   SELECT cf_id,work_team_id FROM cf");
        sql.append("     WHERE  cf.work_team_id is not null and not exists(select 1 from cf_work_team where");
        sql.append("        cf_work_team.cf_id = cf.cf_id and cf_work_team.work_team_id = cf.work_team_id)");
        SqlUtils.executeUpdate("cf_work_team", sql.toString());
    }
    
    /**
     * Copy helpdesk_sla_request。ordering_seq values to helpdesk_sla_request。match_ordering_seq.
     * 
     * Justification: Case #2.2: Statement with UPDATE ... WHERE pattern.
     */
    public static void copyMatchOrderingSeq() {
        final StringBuilder sql = new StringBuilder();
        sql.append(" UPDATE helpdesk_sla_request SET match_ordering_seq = ordering_seq");
        sql.append("   WHERE match_ordering_seq IS NULL");
        SqlUtils.executeUpdate("helpdesk_sla_request", sql.toString());
    }
    
    /**
     * Copy final existed pending steps at the end of the upgrade progress so that the new one's
     * step_log_id bigger than any not pending steps; meanwhile to remove the original ones for
     * avoiding duplication.
     * 
     * Justification: Case #2.1 : Statement with INSERT ... SELECT pattern.
     */
    public static void adjustPendingSteps() {
        
        StringBuilder sql = new StringBuilder();
        final StringBuffer fields = BldgopsExpressUtility.getFieldsListString(HELPDESK_STEP_LOG);
        
        final String fieldsNameList = fields.toString().replaceAll("step_log_id,", " ");
        final int maxStepLogId = DataStatistics.getIntWithoutVpa(HELPDESK_STEP_LOG, "step_log_id", "MAX");
        
        sql.append(" INSERT INTO helpdesk_step_log (");
        sql.append(fieldsNameList);
        sql.append(") SELECT ");
        sql.append(fieldsNameList);
        sql.append("  FROM helpdesk_step_log   ");
        sql.append(" WHERE  date_response IS NULL and  activity_id='AbBldgOpsOnDemandWork' ");
        SqlUtils.executeUpdate(HELPDESK_STEP_LOG, sql.toString());
        
        sql = new StringBuilder();
        sql.append(" DELETE FROM helpdesk_step_log WHERE date_response IS NULL and activity_id='AbBldgOpsOnDemandWork' ");
        sql.append(" and step_log_id <=" + maxStepLogId);
        
        SqlUtils.executeUpdate(HELPDESK_STEP_LOG, sql.toString());
        
    }
}
