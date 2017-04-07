package com.archibus.app.bldgops.express;

import java.util.List;

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
public final class BldgopsExpressUpdate {
    
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
     * Indicates the field name 'grouping'.
     * 
     */
    private static final String GROUPING = "grouping";
    
    /**
     * Indicates the table name 'helpdesk_sla_request'.
     * 
     */
    private static final String HELPDESK_SLA_REQUEST = "helpdesk_sla_request";
    
    /**
     * Constructor method for removing warning: 'Utility classes should not have a public or default
     * constructor'.
     * 
     */
    private BldgopsExpressUpdate() {
        
    }
    
    /**
     * Move 'Dispatch' step to the AA status when WorkReqeustOnly=1, else move it back to status A.
     * 
     * @param workRequestsOnly int '1' or '0' to indicate if user choose 'work request only' on
     *            client side.
     */
    public static void updateDsipatchStepByWorkRequestsOnly(final int workRequestsOnly) {
        
        if (workRequestsOnly == 1) {
            
            // kb#3044076: comment below calling of method for fixing helpdesk_sla_step records
            // missing.
            // KB#3043780
            // BldgopsExpressDelete.deleteDuplicatedWfStepsForStatusAA();
            
            attachStepsToStatusAA();
            
        } else {
            
            attachStepsToStatusA();
            BldgopsExpressSqlHelper.restoreSlaStepsToStatusA();
        }
    }
    
    /**
     * Update current work request records that are in the 'A' status to the 'AA' status when
     * WorkReqeustOnly=1, else restore back to status 'A'.
     * 
     * @param workRequestsOnly int '1' or '0' to indicate if user choose 'work request only' on
     *            client side.
     */
    public static void updateOpenRequestStatus(final int workRequestsOnly) {
        
        final StringBuilder sql = new StringBuilder();
        
        if (workRequestsOnly == 1) {
            
            sql.append(" Update wr set status = 'AA' ");
            sql.append(" Where status = 'A' and activity_type='SERVICE DESK - MAINTENANCE' ");
            SqlUtils.executeUpdate("wr", sql.toString());
        }
    }
    
    /**
     * Find the highest number in the grouping field and then start with the next highest number to
     * update the grouping field for the existed SLAs of 'SERVICE DESK - MAINTENANCE'.
     * 
     */
    public static void updateSlaGrouping() {
        
        final DataSource slaRequestDs =
                DataSourceFactory.createDataSourceForFields(HELPDESK_SLA_REQUEST, new String[] {
                        "activity_type", GROUPING });
        
        final List<DataRecord> slaList =
                slaRequestDs.getRecords(" activity_type='"
                        + "SERVICE DESK - MAINTENANCE' and grouping=0 ");
        
        int maxGroupingNumber = DataStatistics.getIntWithoutVpa(HELPDESK_SLA_REQUEST, GROUPING, "MAX", "");
        
        for (final DataRecord sla : slaList) {
            
            sla.setValue("helpdesk_sla_request.grouping", ++maxGroupingNumber);
            slaRequestDs.updateRecord(sla);
            
        }
    }
    
    /**
     * Update 'autocreate_wo' from 'No' to 'Yes' for the Existing SLAs which activity_type is
     * 'SERVICE DESK - MAINTENANCE'.
     * 
     * @param workRequestsOnly int '1' or '0' to indicate if user choose 'work request only' on
     *            client side.
     */
    public static void updateSlaToAutoCreateWo(final int workRequestsOnly) {
        
        final StringBuilder sql = new StringBuilder();
        
        if (workRequestsOnly == 1) {
            
            sql.append(" Update helpdesk_sla_response set autocreate_wo = 1 ");
            sql.append(" Where autocreate_wo = 0 and activity_type='SERVICE DESK - MAINTENANCE' ");
            
        } else {
            
            sql.append(" Update helpdesk_sla_response set autocreate_wo = 0 ");
            sql.append(" Where autocreate_wo = 1 and activity_type='SERVICE DESK - MAINTENANCE' and ordering_seq = 1 ");
        }
        
        SqlUtils.executeUpdate("helpdesk_sla_response", sql.toString());
    }
    
    /**
     * Move 'Dispatch' step and 'Request Approved' steps to the AA status when WorkReqeustOnly=1.
     * 
     */
    private static void attachStepsToStatusAA() {
        
        // kb#3043802: use normal API but not SQL to delete useless and duplicated afm_wf_steps
        // records for avoiding the sql error on ORACLE/MS-SQL.
        /*
         * final StringBuilder sql = new StringBuilder();
         * sql.append(" UPDATE afm_wf_steps SET status = 'AA'  ");
         * sql.append(" WHERE activity_id='AbBldgOpsOnDemandWork'   ");
         * sql.append("  and status= 'A' ");
         * sql.append("  and not exists (select 1 from afm_wf_steps ${sql.as} w where w.status='AA' "
         * );
         * sql.append(" and w.step = afm_wf_steps.step and w.activity_id='AbBldgOpsOnDemandWork') "
         * );
         * 
         * SqlUtils.executeUpdate(AFM_WF_STEPS, sql.toString());
         */
        
        final DataSource wfStepsDs = DataSourceFactory.createDataSourceForTable(AFM_WF_STEPS);
        
        final StringBuilder restriction = new StringBuilder();
        restriction.append("     activity_id='AbBldgOpsOnDemandWork' and status='A'    ");
        restriction
            .append("     and not exists (select 1 from afm_wf_steps ${sql.as} w where w.status='AA' and w.step = afm_wf_steps.step and w.activity_id='AbBldgOpsOnDemandWork')  ");
        
        final List<DataRecord> wfSteps = wfStepsDs.getRecords(restriction.toString());
        
        for (final DataRecord wfStep : wfSteps) {
            
            wfStep.setValue(AFM_WF_STEPS_STATUS, "AA");
            wfStepsDs.saveRecord(wfStep);
        }
        
    }
    
    /**
     * Move 'Dispatch' step and 'Request Approved' steps to the A status when WorkReqeustOnly=0.
     * 
     */
    private static void attachStepsToStatusA() {
        
        // kb#3043802: use normal API but not SQL to delete useless and duplicated afm_wf_steps
        // records for avoiding the sql error on ORACLE/MS-SQL.
        /*
         * final StringBuilder sql = new StringBuilder();
         * sql.append(" UPDATE afm_wf_steps SET status = 'A'  ");
         * sql.append(" WHERE activity_id='AbBldgOpsOnDemandWork'  ");
         * sql.append("  and status= 'AA' ");
         * sql.append("  and not exists (select 1 from afm_wf_steps ${sql.as} w where w.status='A'"
         * );
         * sql.append("  and w.step = afm_wf_steps.step and w.activity_id='AbBldgOpsOnDemandWork') "
         * );
         * 
         * SqlUtils.executeUpdate(AFM_WF_STEPS, sql.toString());
         */
        final DataSource wfStepsDs = DataSourceFactory.createDataSourceForTable(AFM_WF_STEPS);
        
        final StringBuilder restriction = new StringBuilder();
        restriction.append("     activity_id='AbBldgOpsOnDemandWork' and status='AA'    ");
        restriction
            .append("     and not exists (select 1 from afm_wf_steps ${sql.as} w where w.status='A' and w.step = afm_wf_steps.step and w.activity_id='AbBldgOpsOnDemandWork')  ");
        
        final List<DataRecord> wfSteps = wfStepsDs.getRecords(restriction.toString());
        
        for (final DataRecord wfStep : wfSteps) {
            
            wfStep.setValue(AFM_WF_STEPS_STATUS, "A");
            wfStepsDs.saveRecord(wfStep);
        }
    }
}
