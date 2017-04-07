package com.archibus.app.bldgops.express;

import java.util.List;

import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.eventhandler.steps.StatusConverter;
import com.archibus.model.view.datasource.ClauseDef.Operation;
import com.archibus.model.view.datasource.ClauseDef.RelativeOperation;
import com.archibus.model.view.datasource.*;

/**
 * Class holds methods for update logic of Bldgops Express Application.
 * 
 * <p>
 * History:
 * <li>21.2: Add for 21.2 Bldgops Express.
 * 
 * @author Zhang Yi
 * 
 * 
 */
public final class BldgopsExpressSlaStepUpdate {
    
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
     * Indicates the field name 'activity_type'.
     * 
     */
    private static final String ACTIVITY_TYPE = "activity_type";
    
    /**
     * Indicates the field name 'ordering_seq'.
     * 
     */
    private static final String ORDERING_SEQ = "ordering_seq";
    
    /**
     * Indicates the field name 'priority'.
     * 
     */
    private static final String PRIORITY = "priority";
    
    /**
     * Indicates the field name 'step_order'.
     * 
     */
    private static final String STEP_ORDER = "step_order";
    
    /**
     * Indicates the field name 'step_type'.
     * 
     */
    private static final String STEP_TYPE = "step_type";
    
    /**
     * Indicates the field name 'step'.
     * 
     */
    private static final String STEP = "step";
    
    /**
     * Indicates the field name 'status'.
     * 
     */
    private static final String STATUS = "status";
    
    /**
     * Indicates the field name 'date_response'.
     * 
     */
    private static final String DATE_RESPONSE = "date_response";
    
    /**
     * Indicates the field name 'activity_id'.
     * 
     */
    private static final String ACTIVITY_ID = "activity_id";
    
    /**
     * Indicates the activity type 'SERVICE DESK - MAINTENANCE'.
     * 
     */
    private static final String MAINTENANCE = "SERVICE DESK - MAINTENANCE";
    
    /**
     * Indicates the constant string "AbBldgOpsOnDemandWork".
     * 
     */
    private static final String ACTIVITY_OD = "AbBldgOpsOnDemandWork";
    
    /**
     * Indicates the constant string "AbBldgOpsHelpDesk".
     * 
     */
    private static final String ACTIVITY_SD = "AbBldgOpsHelpDesk";
    
    /**
     * Indicates the status value 'AA'.
     * 
     */
    private static final String STATUS_AA = "AA";
    
    /**
     * Indicates the table-field name 'helpdesk_sla_steps.activity_id'.
     * 
     */
    private static final String HELPDESK_SLA_ACTIVITY_ID = "helpdesk_sla_steps.activity_id";
    
    /**
     * Indicates the table-field name 'helpdesk_sla_steps.step_type'.
     * 
     */
    private static final String HELPDESK_SLA_STEP_TYPE = "helpdesk_sla_steps.step_type";
    
    /**
     * Indicates the table-field name 'helpdesk_sla_steps.priority'.
     * 
     */
    private static final String HELPDESK_SLA_PRIORITY = "helpdesk_sla_steps.priority";
    
    /**
     * Indicates the table-field name 'helpdesk_sla_steps.ordering_seq'.
     * 
     */
    private static final String HELPDESK_SLA_ORDERING_SEQ = "helpdesk_sla_steps.ordering_seq";
    
    /**
     * Indicates the table-field name 'helpdesk_sla_steps.step_order'.
     * 
     */
    private static final String HELPDESK_SLA_STEPS_STEP_ORDER = "helpdesk_sla_steps.step_order";
    
    /**
     * Indicates the table-field name 'helpdesk_sla_steps.step'.
     * 
     */
    private static final String HELPDESK_SLA_STEPS_STEP = "helpdesk_sla_steps.step";
    
    /**
     * Indicates the table-field name 'helpdesk_sla_steps.status'.
     * 
     */
    private static final String HELPDESK_SLA_STEPS_STATUS = "helpdesk_sla_steps.status";
    
    /**
     * Constructor method for removing warning: 'Utility classes should not have a public or default
     * constructor'.
     * 
     */
    private BldgopsExpressSlaStepUpdate() {
        
    }
    
    /**
     * 
     * Update existing SLA steps, in either SLA definitions or in pending steps, to go against the
     * Work Request instead of the Service Request.
     * 
     */
    public static void updateSlaStepsFromHelpDeskToOnDemand() {
        
        updateStepOrderGroupByStatus();
        
        // firstly use SQL to update the steps from AbBldgOpsHelpDesk to AbBldgOpsOnDemandWork that
        // have not existed duplicated primary keys
        BldgopsExpressSqlHelper.updateSlaStepsFromHelpDeskToOnDemand();
        
        // secondly change the step_order of steps that could not be update due to duplicated
        // primary keys in above method, and then perform the update operation successfully.
        // updateSlaStepsDuplicatedFromHelpDeskToOnDemand();
    }
    
    /**
     * 
     * Update the sla steps that could not be updated from AbBldgOpsHelpDesk to
     * AbBldgOpsOnDemandWork due to duplicated primary keys.
     * 
     */
    public static void updateStepOrderGroupByStatus() {
        
        final StringBuilder restriction = new StringBuilder();
        restriction.append(" activity_id='AbBldgOpsHelpDesk' ");
        restriction.append(" AND    activity_type='SERVICE DESK - MAINTENANCE' ");
        restriction.append(" AND    step_order=1 ");
        restriction.append(" AND    EXISTS (  ");
        restriction.append("         select 1 from helpdesk_sla_steps ${sql.as} h ");
        restriction
            .append("                where h.activity_id='AbBldgOpsOnDemandWork' and h.activity_type='SERVICE DESK - MAINTENANCE' ");
        restriction
            .append("                      and h.ordering_seq=helpdesk_sla_steps.ordering_seq and h.priority=helpdesk_sla_steps.priority ");
        restriction.append("               and h.status=");
        restriction.append(BldgopsExpressSqlHelper.getStatusConvertSql(HELPDESK_SLA_STEPS_STATUS))
            .append("               )");
        
        final DataSource slaStepsDs =
                DataSourceFactory.createDataSourceForFields(HELPDESK_SLA_STEPS, new String[] {
                        ACTIVITY_ID, ACTIVITY_TYPE, ORDERING_SEQ, PRIORITY, STATUS, STEP_ORDER,
                        STEP_TYPE });
        slaStepsDs.addSort(HELPDESK_SLA_STEPS, STATUS, DataSource.SORT_DESC);
        slaStepsDs.addSort(HELPDESK_SLA_STEPS, STEP_ORDER, DataSource.SORT_DESC);
        
        final List<DataRecord> sdSteps = slaStepsDs.getRecords(restriction.toString());
        
        for (final DataRecord sdStep : sdSteps) {
            
            adjustStepOrderOfSlaStepsForSameStatus(sdStep);
            
        }
    }
    
    /**
     * 
     * If there are different steps defined for the same status, but some for the Service Request
     * and some for the Work Request adjust their step order.
     * 
     * @param sdStep DataRecord helpdesk_sla_steps record that has the activity_id
     *            'AbBldgOpsHelpDesk'.
     * 
     */
    private static void adjustStepOrderOfSlaStepsForSameStatus(final DataRecord sdStep) {
        
        final DataSource slaStepsDs =
                DataSourceFactory.createDataSourceForFields(HELPDESK_SLA_STEPS, new String[] {
                        ACTIVITY_ID, ACTIVITY_TYPE, ORDERING_SEQ, PRIORITY, STATUS, STEP_ORDER,
                        STEP_TYPE, STEP });
        if ("APPROVED".equals(sdStep.getString(HELPDESK_SLA_STEPS_STATUS))) {
            // The Service Request steps come first for status Approved/A, and the Work Request
            // steps come afterward. Re-order the steps of the Work Request status by putting them
            // after the steps for the Service Request status.
            slaStepsDs.addSort(HELPDESK_SLA_STEPS, ACTIVITY_ID, DataSource.SORT_DESC);
            
        } else {
            
            // The Work Request steps come first for statuses Completed/Com, Rejected, Stopped, and
            // Canceled. Re-order the steps of the Service Request status by putting them after the
            // steps of the Work Request status.
            slaStepsDs.addSort(HELPDESK_SLA_STEPS, ACTIVITY_ID, DataSource.SORT_ASC);
        }
        slaStepsDs.addSort(HELPDESK_SLA_STEPS, STEP_ORDER, DataSource.SORT_DESC);
        
        final ParsedRestrictionDef resDef = new ParsedRestrictionDef();
        
        resDef.addClause(HELPDESK_SLA_STEPS, ACTIVITY_TYPE, MAINTENANCE, Operation.EQUALS);
        
        resDef.addClause(HELPDESK_SLA_STEPS, ORDERING_SEQ,
            sdStep.getValue(HELPDESK_SLA_ORDERING_SEQ), Operation.EQUALS);
        
        resDef.addClause(HELPDESK_SLA_STEPS, PRIORITY, sdStep.getValue(HELPDESK_SLA_PRIORITY),
            Operation.EQUALS);
        
        resDef.addClause(HELPDESK_SLA_STEPS, STATUS,
            StatusConverter.getWorkRequestStatus(sdStep.getString(HELPDESK_SLA_STEPS_STATUS)),
            Operation.EQUALS, RelativeOperation.AND_BRACKET);
        resDef.addClause(HELPDESK_SLA_STEPS, ACTIVITY_ID, ACTIVITY_OD, Operation.EQUALS);
        
        resDef.addClause(HELPDESK_SLA_STEPS, STATUS, sdStep.getString(HELPDESK_SLA_STEPS_STATUS),
            Operation.EQUALS, RelativeOperation.OR);
        resDef.addClause(HELPDESK_SLA_STEPS, ACTIVITY_ID, ACTIVITY_SD, Operation.EQUALS);
        
        final List<DataRecord> slaSteps = slaStepsDs.getRecords(resDef);
        int startOrder = slaSteps.size();
        
        for (final DataRecord slaStep : slaSteps) {
            
            updateStepOrderOfPendingSteps(slaStep, startOrder);
            
            slaStep.setValue(HELPDESK_SLA_STEPS_STEP_ORDER, startOrder--);
            slaStepsDs.saveRecord(slaStep);
            
        }
    }
    
    /**
     * 
     * KB#3043398: If more than one step shows as pending for a work request status, then remove the
     * one with the higher step ordering sequence.
     * 
     * @param slaStep DataRecord helpdesk_sla_steps record that has almost same primary keys as
     *            other existed steps except for the activity_id is 'AbBldgOpsHelpDesk'.
     * @param newStepOrder int step order adjusted.
     * 
     */
    private static void updateStepOrderOfPendingSteps(final DataRecord slaStep,
            final int newStepOrder) {
        
        final DataSource slaStepLogDs =
                DataSourceFactory.createDataSourceForFields(HELPDESK_STEP_LOG, new String[] {
                        ACTIVITY_ID, STATUS, STEP_ORDER, DATE_RESPONSE, STEP_TYPE, STEP });
        
        final ParsedRestrictionDef resDef = new ParsedRestrictionDef();
        
        resDef.addClause(HELPDESK_STEP_LOG, ACTIVITY_ID,
            slaStep.getString(HELPDESK_SLA_ACTIVITY_ID), Operation.EQUALS);
        
        resDef.addClause(HELPDESK_STEP_LOG, STEP_TYPE, slaStep.getValue(HELPDESK_SLA_STEP_TYPE),
            Operation.EQUALS);
        
        resDef.addClause(HELPDESK_STEP_LOG, STEP, slaStep.getValue(HELPDESK_SLA_STEPS_STEP),
            Operation.EQUALS);
        
        resDef.addClause(HELPDESK_STEP_LOG, STATUS, slaStep.getValue(HELPDESK_SLA_STEPS_STATUS),
            Operation.EQUALS);
        
        resDef.addClause(HELPDESK_STEP_LOG, STEP_ORDER,
            slaStep.getValue(HELPDESK_SLA_STEPS_STEP_ORDER), Operation.EQUALS);
        
        resDef.addClause(HELPDESK_STEP_LOG, DATE_RESPONSE, null, Operation.IS_NULL);
        
        final List<DataRecord> slaStepLogs = slaStepLogDs.getRecords(resDef);
        for (final DataRecord stepLog : slaStepLogs) {
            
            stepLog.setValue(HELPDESK_STEP_LOG + "." + STEP_ORDER, newStepOrder);
            slaStepLogDs.updateRecord(stepLog);
        }
        
    }
    
    /**
     * 
     * Update the sla steps that could not be updated from 'A' to 'AA' status due to duplicated
     * primary keys.
     * 
     */
    public static void updateSlaStepsDuplicatedForWorkRequestOnly() {
        
        final StringBuilder restriction = new StringBuilder();
        
        restriction.append("       status='A'  ");
        restriction.append("       AND EXISTS ( select 1 from helpdesk_sla_steps ${sql.as} h  ");
        restriction
            .append("                           where h.status='AA' and h.step_order=helpdesk_sla_steps.step_order ");
        restriction
            .append("                                 and h.priority=helpdesk_sla_steps.priority  and h.ordering_seq=helpdesk_sla_steps.ordering_seq ");
        restriction
            .append("                                 and h.activity_type=helpdesk_sla_steps.activity_type");
        restriction
            .append("                                 and h.activity_id=helpdesk_sla_steps.activity_id      )");
        
        final DataSource slaStepsDs =
                DataSourceFactory.createDataSourceForFields(HELPDESK_SLA_STEPS, new String[] {
                        ACTIVITY_ID, ACTIVITY_TYPE, ORDERING_SEQ, PRIORITY, STATUS, STEP_ORDER,
                        STEP_TYPE });
        slaStepsDs.addSort(HELPDESK_SLA_STEPS, STATUS, DataSource.SORT_DESC);
        slaStepsDs.addSort(HELPDESK_SLA_STEPS, STEP_ORDER, DataSource.SORT_DESC);
        
        final List<DataRecord> sdSteps = slaStepsDs.getRecords(restriction.toString());
        for (final DataRecord sdStep : sdSteps) {
            
            adjustStepOrderOfOnDemandSteps(slaStepsDs, sdStep);
            
            sdStep.setValue(HELPDESK_SLA_STEPS_STATUS, STATUS_AA);
            slaStepsDs.saveRecord(sdStep);
        }
    }
    
    /**
     * 
     * Increasing the step_orders of 'AbBldgOpsOnDemandWork' steps that almost be duplicated with
     * given sla step except for different status.
     * 
     * @param stepDs helpdesk_sla_steps DataSource.
     * @param step DataRecord helpdesk_sla_steps record that has almost same primary keys as other
     *            existed steps except for the activity_id is 'AbBldgOpsHelpDesk'.
     * 
     */
    private static void adjustStepOrderOfOnDemandSteps(final DataSource stepDs,
            final DataRecord step) {
        
        final ParsedRestrictionDef resDef = new ParsedRestrictionDef();
        
        resDef.addClause(HELPDESK_SLA_STEPS, ACTIVITY_ID, ACTIVITY_OD, Operation.EQUALS);
        resDef.addClause(HELPDESK_SLA_STEPS, ACTIVITY_TYPE, MAINTENANCE, Operation.EQUALS);
        resDef.addClause(HELPDESK_SLA_STEPS, ORDERING_SEQ,
            step.getValue(HELPDESK_SLA_ORDERING_SEQ), Operation.EQUALS);
        resDef.addClause(HELPDESK_SLA_STEPS, PRIORITY, step.getValue(HELPDESK_SLA_PRIORITY),
            Operation.EQUALS);
        resDef.addClause(HELPDESK_SLA_STEPS, STATUS, STATUS_AA, Operation.EQUALS,
            RelativeOperation.AND_BRACKET);
        resDef.addClause(HELPDESK_SLA_STEPS, STATUS, 'A', Operation.EQUALS, RelativeOperation.OR);
        
        final List<DataRecord> odSteps = stepDs.getRecords(resDef);
        int startOrder = 1;
        for (final DataRecord odStep : odSteps) {
            
            odStep.setValue(HELPDESK_SLA_STEPS_STEP_ORDER, odSteps.size() + 1 - startOrder);
            startOrder++;
            
            odStep.setValue(HELPDESK_SLA_STEPS_STATUS, STATUS_AA);
            
            stepDs.saveRecord(odStep);
        }
    }
}
