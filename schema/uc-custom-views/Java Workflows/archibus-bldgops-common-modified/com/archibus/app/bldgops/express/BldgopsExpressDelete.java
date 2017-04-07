package com.archibus.app.bldgops.express;

import java.util.List;

import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;

/**
 * Class holds methods for deleting records for Bldgops Express Application.
 * 
 * <p>
 * History:
 * <li>21.2: Add for 21.2 Bldgops Express.
 * 
 * @author Zhang Yi
 * 
 * 
 */
public final class BldgopsExpressDelete {
    
    /**
     * Indicates the table name 'helpdesk_step_log'.
     * 
     */
    private static final String HELPDESK_STEP_LOG = "helpdesk_step_log";
    
    /**
     * Indicates the field name 'activity_id'.
     * 
     */
    private static final String ACTIVITY_ID = "activity_id";
    
    /**
     * Indicates the field name 'status'.
     * 
     */
    private static final String STATUS = "status";
    
    /**
     * Indicates the field name 'step_order'.
     * 
     */
    private static final String STEP_ORDER = "step_order";
    
    /**
     * Indicates the field name 'date_response'.
     * 
     */
    private static final String DATE_RESPONSE = "date_response";
    
    /**
     * Constructor method for removing warning: 'Utility classes should not have a public or default
     * constructor'.
     * 
     */
    private BldgopsExpressDelete() {
        
    }
    
    /**
     * Delete existing duplicated 'Dispatch' step or 'Request Approved' steps for the AA status when
     * WorkReqeustOnly=1.
     * 
     * Justification: Case #2.2: Statement with DELETE ... WHERE pattern.
     */
    public static void deleteDuplicatedWfStepsForStatusAA() {
        
        // kb#3043802: use normal API but not SQL to delete useless and duplicated afm_wf_steps
        // records for avoiding the sql error on ORACLE/MS-SQL.
        
        /*
         * final StringBuilder sql = new StringBuilder(); sql.append(" delete from afm_wf_steps ");
         * sql.append(" WHERE activity_id='AbBldgOpsOnDemandWork' and status='AA' "); sql.append(
         * "  and exists (select 1 from afm_wf_steps ${sql.as} w where w.status='A' and w.step = afm_wf_steps.step and w.activity_id='AbBldgOpsOnDemandWork') "
         * );
         * 
         * SqlUtils.executeUpdate(AFM_WF_STEPS, sql.toString());
         */
        final DataSource wfStepsDs =
                DataSourceFactory.createDataSourceForFields("afm_wf_steps", new String[] {
                        ACTIVITY_ID, STATUS, STEP_ORDER, DATE_RESPONSE });
        
        final StringBuilder restriction = new StringBuilder();
        restriction.append("     activity_id='AbBldgOpsOnDemandWork' and status='AA'    ");
        restriction
            .append("     and exists (select 1 from afm_wf_steps ${sql.as} w where w.status='A' and w.step = afm_wf_steps.step and w.activity_id='AbBldgOpsOnDemandWork')  ");
        
        final List<DataRecord> wfSteps = wfStepsDs.getRecords(restriction.toString());
        
        for (final DataRecord wfStep : wfSteps) {
            
            wfStepsDs.deleteRecord(wfStep);
        }
        
    }
    
    /**
     * 
     * KB#3043398: If more than one step shows as pending for a work request status, then remove the
     * one with the higher step ordering sequence.
     * 
     */
    public static void deleteDuplicatedPendingSteps() {
        
        final DataSource pendingStepsDs =
                DataSourceFactory.createDataSourceForFields(HELPDESK_STEP_LOG, new String[] {
                        ACTIVITY_ID, STATUS, STEP_ORDER, DATE_RESPONSE });
        pendingStepsDs.addSort(HELPDESK_STEP_LOG, STEP_ORDER, DataSource.SORT_DESC);
        
        final StringBuilder restriction = new StringBuilder();
        restriction.append("     date_response is null   ");
        restriction.append("     AND   activity_id='AbBldgOpsOnDemandWork' ");
        restriction.append("     AND ( select count(1) from helpdesk_step_log ${sql.as} h  ");
        restriction
            .append("                  where h.status=helpdesk_step_log.status and h.activity_id=helpdesk_step_log.activity_id ");
        restriction.append("           and h.date_response is null ");
        restriction.append("           and h.field_name=helpdesk_step_log.field_name");
        restriction.append("           and h.pkey_value=helpdesk_step_log.pkey_value )>1 ");
        restriction
            .append("     AND helpdesk_step_log.step_order!= ( select min(h.step_order) from helpdesk_step_log ${sql.as} h  ");
        restriction
            .append("                  where h.status=helpdesk_step_log.status and h.activity_id=helpdesk_step_log.activity_id  ");
        restriction.append("           and h.date_response is null  ");
        restriction.append("           and h.field_name=helpdesk_step_log.field_name ");
        restriction.append("           and h.pkey_value=helpdesk_step_log.pkey_value  ) ");
        
        final List<DataRecord> pendingSteps = pendingStepsDs.getRecords(restriction.toString());
        
        for (final DataRecord pendingStep : pendingSteps) {
            
            pendingStepsDs.deleteRecord(pendingStep);
        }
    }
    
    /**
     * 
     * KB#3044227 & KB#3044209: Delete all the helpdesk_step_log records that are created after
     * creating work orders.
     * 
     * @param maxStepLogId max step_log_id value
     */
    public static void deleteDuplicatedPendingStepsAfterCreateWorkOrder(final int maxStepLogId) {
        
        final DataSource pendingStepsDs =
                DataSourceFactory.createDataSourceForFields(HELPDESK_STEP_LOG, new String[] {
                        ACTIVITY_ID, STATUS, DATE_RESPONSE });
        
        final StringBuilder restriction = new StringBuilder();
        restriction.append(" helpdesk_step_log.step_log_id>" + maxStepLogId);
        
        final List<DataRecord> pendingSteps = pendingStepsDs.getRecords(restriction.toString());
        
        for (final DataRecord pendingStep : pendingSteps) {
            
            pendingStepsDs.deleteRecord(pendingStep);
        }
    }
    
}
