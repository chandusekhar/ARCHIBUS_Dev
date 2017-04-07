package com.archibus.app.bldgops.express;

import java.util.List;

import junit.framework.Assert;

import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;

/**
 * Test Class for BldgopsExpressUpdate.
 * 
 * <p>
 * History:
 * <li>21.2: Add for 21.2 Bldgops Express.
 * 
 * @author Zhang Yi
 * 
 * 
 */
public final class TestBldgopsExpressUpdate extends DataSourceTestBase {
    
    /**
     * 
     * Call SpaceExpressAssignment to Commit Space assignments.
     * 
     */
    public void testUpdateSLAStepsToWorkRequest() {
        
        // verify that all wfr steps of help desk is copied to on demand
        Assert.assertTrue(this.afterCopyWfrStepsFromHelpDeskToOnDemand().isEmpty());
        
        // verify that all sla steps of help desk is copied to on demand
        Assert.assertTrue(this.afterCopySlaStepsFromHelpDeskToOnDemand().isEmpty());
        
        // verify that all steps of help desk is copied to on demand
        Assert.assertTrue(this.afterCreateWorkRequestIfNotExistsForServiceRequest().isEmpty());
        
        // verify that all pending steps of help desk is changed to on demand
        Assert.assertTrue(this.afterAttachPendingStepsOfServiceRequestToWorkRequest().isEmpty());
        
        // verify that all SLA step definitions on the Work Request Status �A� are changed to be
        // steps on the Work Request Status �AA�
        Assert.assertTrue(this.getDuplicateSlaStepStatus().size() == this
            .afterConvertSlaStepStatus().size());
        
        // verify that all pending step definitions on the Work Request Status �A� are changed to be
        // steps on the Work Request Status �AA�
        Assert.assertTrue(this.afterConvertPendingSlaStepStatus().isEmpty());
    }
    
    /**
     * @return help desk wfr steps.
     */
    public List<DataRecord> afterCopyWfrStepsFromHelpDeskToOnDemand() {
        
        BldgopsExpressSqlHelper.copyWfrStepsFromHelpDeskToOnDemand();
        
        // query
        final StringBuilder sql = new StringBuilder();
        sql.append(" SELECT 1 ${sql.as} num1 FROM afm_wf_steps WHERE afm_wf_steps.activity_id='AbBldgOpsHelpDesk' ");
        final List<DataRecord> result =
                SqlUtils.executeQuery("afm_wf_steps", new String[] { "num1" }, sql.toString());
        
        return result;
    }
    
    /**
     * @return help desk sla steps.
     */
    public List<DataRecord> afterCopySlaStepsFromHelpDeskToOnDemand() {
        
        BldgopsExpressSqlHelper.updateSlaStepsFromHelpDeskToOnDemand();
        
        // query help desk sla steps
        final StringBuilder sql = new StringBuilder();
        sql.append(" SELECT 1 ${sql.as} num2 FROM helpdesk_sla_steps WHERE helpdesk_sla_steps.activity_id='AbBldgOpsHelpDesk' ");
        sql.append(" AND    helpdesk_sla_steps.activity_type='SERVICE DESK � MAINTENANCE' ");
        final List<DataRecord> result =
                SqlUtils
                    .executeQuery("helpdesk_sla_steps", new String[] { "num2" }, sql.toString());
        
        return result;
    }
    
    /**
     * @return service requests without work requests.
     */
    public List<DataRecord> afterCreateWorkRequestIfNotExistsForServiceRequest() {
        
        BldgopsExpressSqlHelper.createWorkRequestIfNotExistsForServiceRequest();
        
        // query service requests without work requests
        final StringBuilder sql = new StringBuilder();
        sql.append(" SELECT 1 ${sql.as} num3 FROM activity_log ");
        sql.append(" WHERE  activity_log.activity_type='SERVICE DESK � MAINTENANCE' ");
        sql.append(" AND NOT EXISTS ( select 1 from wr ${sql.as} w where w.activity_log_id=activity_log.activity_log_id ) ");
        final List<DataRecord> result =
                SqlUtils.executeQuery("activity_log", new String[] { "num3" }, sql.toString());
        
        return result;
    }
    
    /**
     * @return service requests pending steps.
     */
    public List<DataRecord> afterAttachPendingStepsOfServiceRequestToWorkRequest() {
        
        BldgopsExpressSqlHelper.attachPendingStepsOfServiceRequestToWorkRequest();
        
        // query service requests pending steps
        final StringBuilder sql = new StringBuilder();
        sql.append(" SELECT 1 ${sql.as} num4 FROM helpdesk_step_log ");
        sql.append(" WHERE  helpdesk_step_log.date_response IS NULL ");
        sql.append(" AND    helpdesk_step_log.table_name='activity_log' ");
        sql.append(" AND    helpdesk_step_log.field_name='activity_log_id' ");
        sql.append(" AND    EXISTS ( select 1 from activity_log where helpdesk_step_log.pkey_value=activity_log.activity_log_id ) ");
        
        final List<DataRecord> result =
                SqlUtils.executeQuery("helpdesk_step_log", new String[] { "num4" }, sql.toString());
        
        return result;
    }
    
    /**
     * @return SLA step definitions on the Work Request Status �A� that already have the similar SLA
     *         steps on the Work Request Status �AA�.
     */
    private List<DataRecord> getDuplicateSlaStepStatus() {
        
        final StringBuilder sql = new StringBuilder();
        sql.append(" SELECT 1 ${sql.as} num7 from helpdesk_sla_steps  WHERE  status='A' ");
        sql.append(" AND    EXISTS ( select 1 from helpdesk_sla_steps ${sql.as} h where h.status='AA' and h.step_order=helpdesk_sla_steps.step_order ");
        sql.append("        and h.priority=helpdesk_sla_steps.priority  and h.ordering_seq=helpdesk_sla_steps.ordering_seq ");
        sql.append("        and h.activity_type=helpdesk_sla_steps.activity_type");
        sql.append("        and h.activity_id=helpdesk_sla_steps.activity_id )");
        
        final List<DataRecord> result =
                SqlUtils
                    .executeQuery("helpdesk_sla_steps", new String[] { "num7" }, sql.toString());
        
        return result;
    }
    
    /**
     * @return SLA step definitions on the Work Request Status �A�.
     */
    public List<DataRecord> afterConvertSlaStepStatus() {
        
        BldgopsExpressSqlHelper.convertSlaStepStatusToAA();
        
        // query SLA step definitions on the Work Request Status �A�
        final StringBuilder sql = new StringBuilder();
        sql.append(" SELECT 1 ${sql.as} num5 FROM helpdesk_sla_steps  WHERE  status='A' and step_status='A' ");
        
        final List<DataRecord> result =
                SqlUtils
                    .executeQuery("helpdesk_sla_steps", new String[] { "num5" }, sql.toString());
        
        return result;
    }
    
    /**
     * @return pending step definitions on the Work Request Status �A�.
     */
    public List<DataRecord> afterConvertPendingSlaStepStatus() {
        
        BldgopsExpressSqlHelper.convertPendingSlaStepStatus(0);
        
        // query pending step definitions on the Work Request Status �A�
        final StringBuilder sql = new StringBuilder();
        sql.append(" SELECT 1 ${sql.as} num6 FROM helpdesk_step_log ");
        sql.append(" WHERE  date_response IS NULL AND status='A' ");
        sql.append(" AND    table_name='wr' AND field_name='wr_id' ");
        
        final List<DataRecord> result =
                SqlUtils.executeQuery("helpdesk_step_log", new String[] { "num6" }, sql.toString());
        
        return result;
    }
    
}
