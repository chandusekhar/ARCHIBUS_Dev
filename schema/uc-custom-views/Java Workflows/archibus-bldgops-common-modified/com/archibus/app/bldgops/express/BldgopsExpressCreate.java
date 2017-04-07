package com.archibus.app.bldgops.express;

import java.util.List;

import org.apache.log4j.Logger;

import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.eventhandler.ondemandwork.WorkRequestHandler;
import com.archibus.jobmanager.EventHandlerContext;

/**
 * Class holds methods for creating records for Bldgops Express Application.
 * 
 * <p>
 * History:
 * <li>21.2: Add for 21.2 Bldgops Express.
 * 
 * @author Zhang Yi
 * 
 * 
 */
public final class BldgopsExpressCreate {
    
    /**
     * Indicates the table name 'activity_log'.
     * 
     */
    private static final String ACTIVITY_LOG = "activity_log";
    
    /**
     * Indicates the field name 'activity_log_id'.
     * 
     */
    private static final String ACTIVITY_LOG_ID = "activity_log_id";
    
    /**
     * Indicates the table-field name 'activity_log.activity_log_id'.
     * 
     */
    private static final String ACTIVITY_LOG_ACTIVITY_LOG_ID = "activity_log.activity_log_id";
    
    /**
     * Constructor method for removing warning: 'Utility classes should not have a public or default
     * constructor'.
     * 
     */
    private BldgopsExpressCreate() {
        
    }
    
    /**
     * Create an associated wr record for any existing activity_log items of activity_type 'SERVICE
     * DESK - MAINTENANCE' that do not yet have an associated wr record.
     * 
     * @return service request id list that failed to create according work request
     */
    public static String createWorkRequestIfNotExistsForServiceRequest() {
        
        final DataSource activityLogDs =
                DataSourceFactory.createDataSourceForFields(ACTIVITY_LOG,
                    new String[] { ACTIVITY_LOG_ID });
        
        final List<DataRecord> records =
                activityLogDs
                    .getRecords(" activity_log.activity_type='SERVICE DESK - MAINTENANCE' AND activity_log.wr_id is null AND NOT EXISTS ( select 1 from wr ${sql.as} w where w.activity_log_id=activity_log.activity_log_id ) ");
        
        final WorkRequestHandler handler = new WorkRequestHandler();
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        
        final StringBuilder errorId = new StringBuilder();
        for (final DataRecord record : records) {
            
            final int activityLogId = record.getInt(ACTIVITY_LOG_ACTIVITY_LOG_ID);
            
            try {
                
                handler.createWorkRequestFromActionItem(context, activityLogId, true);
                
                // CHECKSTYLE:OFF : Suppress IllegalCatch warning. Justification: business
                // logic requires to log the error and alert to user on client side, not to
                // break the whole logic running progress.
            } catch (final Exception excep) {
                // CHECKSTYLE:ON
                
                errorId.append(activityLogId);
                errorId.append(",");
                Logger.getLogger(BldgopsExpressCreate.class).info(excep.getMessage());
                continue;
            }
        }
        
        return errorId.length() > 0 ? String.valueOf(errorId.toString().substring(0,
            errorId.length() - 1)) : "";
    }
    
    /**
     * Create an associated wo record for any existing activity_log items of activity_type 'SERVICE
     * DESK - MAINTENANCE' and is pending on status 'AA' and do not yet have an associated wo
     * record.
     * 
     */
    public static void createWorkOrderIfNotExistsForServiceRequest() {
        
        final int maxStepLogId = DataStatistics.getIntWithoutVpa("helpdesk_step_log", "step_log_id", "MAX");
        
        final DataSource activityLogDs =
                DataSourceFactory.createDataSourceForFields(ACTIVITY_LOG,
                    new String[] { ACTIVITY_LOG_ID });
        
        final StringBuilder restriction = new StringBuilder();
        
        // kb#3044156: only create work orders for the service requests that their work requests
        // having no work orders.
        restriction.append("       activity_log.activity_type='SERVICE DESK - MAINTENANCE' ");
        restriction
            .append("              AND EXISTS ( select 1 from wr ${sql.as} w where w.activity_log_id=activity_log.activity_log_id  ");
        
        restriction.append("                       and w.status='A' and w.wo_id is null ) ");
        
        final List<DataRecord> records = activityLogDs.getRecords(restriction.toString());
        
        final WorkRequestHandler handler = new WorkRequestHandler();
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        for (final DataRecord record : records) {
            final int activityLogId = record.getInt(ACTIVITY_LOG_ACTIVITY_LOG_ID);
            handler.createWorkOrderFromActionItem(context, activityLogId);
        }
        
        // KB#3044227 & KB#3044209: Delete all the helpdesk_step_log records that are created after
        // creating work orders.
        BldgopsExpressDelete.deleteDuplicatedPendingStepsAfterCreateWorkOrder(maxStepLogId);
        
    }
}
