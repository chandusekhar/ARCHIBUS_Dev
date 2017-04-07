package com.archibus.eventhandler.clean;

import org.json.JSONObject;

import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.eventhandler.helpdesk.RequestHandler;
import com.archibus.utility.ExceptionBase;

/**
 * Request methods.
 * 
 * @author Ioan Draghici
 * 
 */
public class ServiceRequestHandler extends CommonsHandler {
    /**
     * "Generated Service Request [{0}] cannot be submitted due to system error".
     */
    private static final String SUBMIT_SERVICE_REQUEST_ERROR =
            "Generated Service Request [{0}] cannot be submitted due to system error";
    
    /**
     * Activity log table name.
     */
    private static final String ACTIVITY_LOG_TABLE = "activity_log";
    
    /**
     * Activity log primary key field name.
     */
    private static final String ACTIVITY_LOG_PK_FIELD = "activity_log_id";
    
    /**
     * Submit created service request to helpdesk.
     * 
     * @param requestId service request id
     */
    protected void submitServiceRequest(final String requestId) {
        final String[] fields =
                { ACTIVITY_LOG_PK_FIELD, "assessment_id", "activity_type", "bl_id", "fl_id",
                        "rm_id", "site_id", "prob_type", "date_required", "date_scheduled",
                        "cost_estimated", "hours_est_baseline", "description", "dv_id", "dp_id",
                        "phone_requestor", "ac_id", "priority", "created_by", "requestor",
                        "assessed_by", "assigned_to", "hcm_abate_by" };
        final DataSource dsActivityLog =
                DataSourceFactory.createDataSourceForFields(ACTIVITY_LOG_TABLE, fields);
        dsActivityLog.addRestriction(Restrictions.eq(ACTIVITY_LOG_TABLE, ACTIVITY_LOG_PK_FIELD,
            Integer.valueOf(requestId)));
        final DataRecord recRequest = dsActivityLog.getRecord();
        final JSONObject jsonRecord = EventHandlerBase.toJSONObject(recordToMap(recRequest));
        
        final RequestHandler requestHandler = new RequestHandler();
        
        try {
            requestHandler.submitRequest(requestId, jsonRecord);
        } catch (final ExceptionBase exception) {
            throw exception;
            // CHECKSTYLE:OFF: Suppress IllegalCatch warning. Justification: third-party API method
            // TODO: (VT): Which method throws Throwable? RequestHandler.submitRequest() is supposed
            // to throw ExceptionBase.
        } catch (final Throwable exception) {
            // CHECKSTYLE:ON
            // @translatable
            final String errorMessage = SUBMIT_SERVICE_REQUEST_ERROR;
            
            final ExceptionBase newException = new ExceptionBase(null, exception);
            newException.setPattern(errorMessage);
            newException.setTranslatable(true);
            final Object[] args = { requestId };
            newException.setArgs(args);
            throw newException;
        }
    }
}
