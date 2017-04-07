package com.archibus.app.bldgops.express;

import java.util.List;

import junit.framework.Assert;

import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;

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
public class TestBldgopsExpressSqlHelper extends DataSourceTestBase {
    
    /**
     * Test method for
     * {@link com.archibus.app.bldgops.express.BldgopsExpressSqlHelper#copyWfrStepsFromHelpDeskToOnDemand()}
     * .
     */
    public void testCopyWfrStepsFromHelpDeskToOnDemand() {
        
        BldgopsExpressSqlHelper.copyWfrStepsFromHelpDeskToOnDemand();
        
        // query help desk wfr steps
        final StringBuilder sql = new StringBuilder();
        sql.append(" SELECT 1 ${sql.as} num1 FROM afm_wf_steps WHERE afm_wf_steps.activity_id='AbBldgOpsHelpDesk' ");
        final List<DataRecord> result =
                SqlUtils.executeQuery("afm_wf_steps", new String[] { "num1" }, sql.toString());
        
        // verify that all wfr steps of help desk is copied to on demand
        Assert.assertTrue(result.isEmpty());
        
    }
    
    /**
     * Test method for
     * {@link com.archibus.app.bldgops.express.BldgopsExpressSqlHelper#copySlaStepsFromHelpDeskToOnDemand()}
     * .
     */
    public void testCopySlaStepsFromHelpDeskToOnDemand() {
        
        BldgopsExpressSqlHelper.updateSlaStepsFromHelpDeskToOnDemand();
        
        // query help desk sla steps
        final StringBuilder sql = new StringBuilder();
        sql.append(" SELECT 1 ${sql.as} num2 FROM helpdesk_sla_steps WHERE helpdesk_sla_steps.activity_id='AbBldgOpsHelpDesk' ");
        sql.append(" AND    helpdesk_sla_steps.activity_type='SERVICE DESK � MAINTENANCE' ");
        final List<DataRecord> result =
                SqlUtils
                    .executeQuery("helpdesk_sla_steps", new String[] { "num2" }, sql.toString());
        
        // verify that all sla steps of help desk is copied to on demand
        Assert.assertTrue(result.isEmpty());
        
    }
    
    /**
     * Test method for
     * {@link com.archibus.app.bldgops.express.BldgopsExpressSqlHelper#createWorkRequestIfNotExistsForServiceRequest()}
     * .
     */
    public void testCreateWorkRequestIfNotExistsForServiceRequest() {
        
        BldgopsExpressSqlHelper.createWorkRequestIfNotExistsForServiceRequest();
        
        // query service requests without work requests
        final StringBuilder sql = new StringBuilder();
        sql.append(" SELECT 1 ${sql.as} num3 FROM activity_log ");
        sql.append(" WHERE  activity_log.activity_type='SERVICE DESK � MAINTENANCE' ");
        sql.append(" AND NOT EXISTS ( select 1 from wr ${sql.as} w where w.activity_log_id=activity_log.activity_log_id ) ");
        final List<DataRecord> result =
                SqlUtils.executeQuery("activity_log", new String[] { "num3" }, sql.toString());
        
        // verify that all steps of help desk is copied to on demand
        Assert.assertTrue(result.isEmpty());
        
    }
    
    /**
     * Test method for
     * {@link com.archibus.app.bldgops.express.BldgopsExpressSqlHelper#attachPendingStepsOfServiceRequestToWorkRequest()}
     * .
     */
    public void testAttachPendingStepsOfServiceRequestToWorkRequest() {
        
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
        
        // verify that all pending steps of help desk is changed to on demand
        Assert.assertTrue(result.isEmpty());
        
    }
    
    /**
     * Test method for
     * {@link com.archibus.app.bldgops.express.BldgopsExpressSqlHelper#convertSlaStepStatus()} .
     */
    public void testConvertSlaStepStatus() {
        
        BldgopsExpressSqlHelper.convertSlaStepStatusToAA();
        
        // query SLA step definitions on the Work Request Status �A�
        final StringBuilder sql = new StringBuilder();
        sql.append(" SELECT 1 ${sql.as} num5 FROM helpdesk_sla_steps  WHERE  status='A' or step_status='A' ");
        
        final List<DataRecord> result =
                SqlUtils
                    .executeQuery("helpdesk_sla_steps", new String[] { "num5" }, sql.toString());
        
        // verify that all SLA step definitions on the Work Request Status �A� are changed to be
        // steps on the Work Request Status �AA�
        Assert.assertTrue(result.isEmpty());
        
    }
    
    /**
     * Test method for
     * {@link com.archibus.app.bldgops.express.BldgopsExpressSqlHelper#convertPendingSlaStepStatus()}
     * .
     */
    public void testConvertPendingSlaStepStatus() {
        
        BldgopsExpressSqlHelper.convertPendingSlaStepStatus(0);
        
        // query pending step definitions on the Work Request Status �A�
        final StringBuilder sql = new StringBuilder();
        sql.append(" SELECT 1 ${sql.as} num6 FROM helpdesk_step_log ");
        sql.append(" WHERE  date_response IS NULL AND status='A' ");
        sql.append(" AND    table_name='wr' AND field_name='wr_id' ");
        
        final List<DataRecord> result =
                SqlUtils.executeQuery("helpdesk_step_log", new String[] { "num6" }, sql.toString());
        
        // verify that all pending step definitions on the Work Request Status �A� are changed to be
        // steps on the Work Request Status �AA�
        Assert.assertTrue(result.isEmpty());
        
    }
    
}
