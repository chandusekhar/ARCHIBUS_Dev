package com.archibus.app.bldgops.express;

import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.jobmanager.EventHandlerContext;

/**
 * Class to determine if there's any reason to run the WFR useBldgsOperationConsole.
 * 
 * <p>
 * History:
 * <li>21.2: Add for 21.2 Bldgops Express.
 * 
 * @author Zhang Yi
 * 
 * 
 */
public final class BldgopsExpressFinder {
    
    /**
     * Indicates the string 'jsonExpression' .
     * 
     */
    private static final String JSON_EXPRESSION = "jsonExpression";
    
    /**
     * DataSource of table helpdesk_sla_steps.
     */
    private final DataSource slaStepDS = DataSourceFactory.createDataSourceForFields(
        "helpdesk_sla_steps", new String[] { "activity_id", "activity_type", "status" });
    
    /**
     * DataSource of table helpdesk_step_log.
     */
    private final DataSource slaStepLogDS = DataSourceFactory.createDataSourceForFields(
        "helpdesk_step_log", new String[] { "date_response", "table_name", "pkey_value" });
    
    /**
     * DataSource of table helpdesk_step_log.
     */
    private final DataSource wrDS = DataSourceFactory.createDataSourceForFields("wr",
        new String[] { "activity_log_id" });
    
    /**
     * 
     * Determine if there's any reason to run the WFR updateSLAStepsToWorkRequest.
     * 
     * @param workRequestsOnly int '1' or '0' to indicate if use the work request only.
     */
    public void detectUpdateSLAStepsToWorkRequest(final int workRequestsOnly) {
        
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        
        boolean found =
                this.lookForSlaStepOfServiceRequest()
                        || this.lookForWorkRequestNotForServiceRequest()
                        || this.lookForStepLogOfServiceRequest();
        
        if (workRequestsOnly == 1) {
            found =
                    found && this.lookForStepsWorkRequestOnly()
                            && this.lookForStepLogsWorkRequestOnly();
        }
        
        // If found any record related to Service Desk then return 'yes', else return 'no'.
        if (found) {
            context.addResponseParameter(JSON_EXPRESSION, "yes");
        } else {
            context.addResponseParameter(JSON_EXPRESSION, "no");
        }
    }
    
    /**
     * look for "SLA steps defined for Service Request statuses".
     * 
     * @return boolean indicate if the record exists
     */
    private boolean lookForSlaStepOfServiceRequest() {
        
        final DataRecord record =
                this.slaStepDS
                    .getRecord("activity_id = 'AbBldgOpsHelpDesk' AND activity_type = 'SERVICE DESK - MAINTENANCE' ");
        
        return record == null ? false : true;
        
    }
    
    /**
     * look for "Work Requests do not exist for a maintenance service request".
     * 
     * @return boolean indicate if the record exists
     */
    private boolean lookForWorkRequestNotForServiceRequest() {
        
        final DataRecord record =
                this.wrDS
                    .getRecord(" exists ( select 1 from activity_log where activity_log.activity_type = 'SERVICE DESK - MAINTENANCE' "
                            + "and activity_log.activity_log_id=wr.activity_log_id ) ");
        
        return record == null ? false : true;
        
    }
    
    /**
     * look for "Pending steps defined for Service Request statuses".
     * 
     * @return boolean indicate if the record exists
     */
    private boolean lookForStepLogOfServiceRequest() {
        
        final DataRecord record =
                this.slaStepLogDS
                    .getRecord(" date_response is null and table_name='activity_log' and exists ( select 1 from activity_log where activity_log.activity_type = 'SERVICE DESK - MAINTENANCE' "
                            + "and activity_log.activity_log_id=pkey_value ) ");
        
        return record == null ? false : true;
        
    }
    
    /**
     * look for
     * "SLA Steps defined for Work Request Status 'A', when it should change to status 'AA' for Work Request Only mode"
     * .
     * 
     * @return boolean indicate if the record exists
     */
    private boolean lookForStepsWorkRequestOnly() {
        
        final DataRecord record = this.slaStepDS.getRecord(" status='A' ");
        
        return record == null ? false : true;
        
    }
    
    /**
     * look for
     * "Pending steps defined for Work Request Status 'A', when it should change to status 'AA' for Work Request Only mode"
     * .
     * 
     * @return boolean indicate if the record exists
     */
    private boolean lookForStepLogsWorkRequestOnly() {
        
        final DataRecord record =
                this.slaStepLogDS.getRecord(" date_response is null and status='A' ");
        
        return record == null ? false : true;
        
    }
    
}
