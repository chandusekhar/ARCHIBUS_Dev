package com.archibus.app.solution.workflow;

import java.util.*;

import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.eventhandler.CommonHandlers.CommonHandlers;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.servletx.utility.UrlHelper;
import com.archibus.utility.Utility;

/**
 * Event handler class that implements all workflow rules for the Help Desk activity example.
 */
public class SolutionsWorkflowHandlers extends EventHandlerBase {
    
    /**
     * Table name.
     */
    private static final String TABLE_ACTIVITY_LOG = "activity_log";
    
    /**
     * Field name.
     */
    private static final String FIELD_ACTIVITY_LOG_ID = "activity_log_id";
    
    /**
     * Field name.
     */
    private static final String FIELD_CREATED_BY = "created_by";
    
    /**
     * Field name.
     */
    private static final String FIELD_STATUS = "status";
    
    /**
     * Status = rejected.
     */
    private static final String STATUS_REJECTED = "REJECTED";
    
    /**
     * Status = planned.
     */
    private static final String STATUS_PLANNED = "PLANNED";
    
    /**
     * Status = completed.
     */
    private static final String STATUS_COMPLETED = "COMPLETED";
    
    /**
     * Status = scheduled.
     */
    private static final String STATUS_SCHEDULED = "SCHEDULED";
    
    /**
     * Period.
     */
    private static final String PERIOD = ".";
    
    /**
     * Equals.
     */
    private static final String EQUALS = " = ";
    
    /**
     * Activity parameter name.
     */
    private static final String PARAMETER_AUTO_NOTIFY_REQUESTOR = "AutoNotifyRequestor";
    
    /**
     * Constants for localizeMessage() function. Define the primary keys used to find localized
     * messages in the messages table.
     */
    private static final String ACTIVITY_ID = "AbSolutionsWorkflow";
    
    /**
     * Assign message ID.
     */
    private static final String NOTIFY_ASSIGNEE_ASSIGN = "NOTIFY_ASSIGNEE_ASSIGN";
    
    /**
     * Approve message ID.
     */
    private static final String NOTIFY_REQUESTOR_APPROVE = "NOTIFY_REQUESTOR_APPROVE";
    
    /**
     * Complete message ID.
     */
    private static final String NOTIFY_REQUESTOR_COMPLETE = "NOTIFY_REQUESTOR_COMPLETE";
    
    /**
     * Reject message ID.
     */
    private static final String NOTIFY_REQUESTOR_REJECT = "NOTIFY_REQUESTOR_REJECT";
    
    /**
     * ReferencedBy key.
     */
    private static final String REFERENCED_BY = "HELPDESK_WFR";
    
    /**
     * Auto-approve threshold.
     */
    private static final double AUTO_APPROVE_THRESHOLD = 500.0;
    
    /**
     * Message subject.
     */
    private static final String SUBJECT_APPROVED = "Help Desk Request - Approved";
    
    /**
     * Message subject.
     */
    private static final String SUBJECT_ASSIGNED = "Help Desk Request - Assigned";
    
    /**
     * Message subject.
     */
    private static final String SUBJECT_COMPLETED = "Help Desk Request - Completed";
    
    /**
     * Message subject.
     */
    private static final String SUBJECT_REJECTED = "Help Desk Request - Rejected";
    
    /**
     * Approves Help Desk request.
     * 
     * @param context The workflow rule context.
     */
    public void helpDeskApprove(final EventHandlerContext context) {
        final DataSource dataSource = createDataSourceForSave();
        final DataRecord record = dataSource.createRecordFromContext();
        record.setValue(TABLE_ACTIVITY_LOG + PERIOD + FIELD_STATUS, STATUS_SCHEDULED);
        record.setValue(TABLE_ACTIVITY_LOG + ".date_issued", Utility.currentDate());
        record.setValue(TABLE_ACTIVITY_LOG + ".date_scheduled", Utility.currentDate());
        record
            .setValue(TABLE_ACTIVITY_LOG + ".approved_by", ContextStore.get().getUser().getName());
        dataSource.saveRecord(record);
        
        // notify the original request creator
        final int notifyRequestor = getActivityParameterInt(context, ACTIVITY_ID,
            PARAMETER_AUTO_NOTIFY_REQUESTOR).intValue();
        if (notifyRequestor > 0) {
            // get the created_by field value from the DB record
            final String activityLogId = (String) record.getValue(TABLE_ACTIVITY_LOG + PERIOD
                    + FIELD_ACTIVITY_LOG_ID);
            final String createdBy = (String) selectDbValue(context, TABLE_ACTIVITY_LOG,
                FIELD_CREATED_BY, FIELD_ACTIVITY_LOG_ID + EQUALS + activityLogId);
            
            final String message = localizeMessage(context, ACTIVITY_ID, REFERENCED_BY,
                NOTIFY_REQUESTOR_APPROVE, null);
            notifyEmployee(context, SUBJECT_APPROVED, message, createdBy);
        }
        
        // notify the person to whom the request is assigned
        final int notifyAssignee = getActivityParameterInt(context, ACTIVITY_ID,
            "AutoNotifyAssignee").intValue();
        if (notifyAssignee > 0) {
            final String assignedTo = (String) record.getValue("activity_log.assigned_to");
            
            String message = localizeMessage(context, ACTIVITY_ID, REFERENCED_BY,
                NOTIFY_ASSIGNEE_ASSIGN, null);
            
            {
                // add link to WebCentral view with restriction for activity_log_id
                String link = getWebCentralPath(context);
                link += "/" + getActivityParameterString(context, ACTIVITY_ID, "VIEW_VIEW");
                
                final Map<String, Object> parameters = new HashMap<String, Object>();
                parameters.put(FIELD_ACTIVITY_LOG_ID,
                    record.getValue(TABLE_ACTIVITY_LOG + PERIOD + FIELD_ACTIVITY_LOG_ID));
                link += UrlHelper.toUrlParameters(parameters);
                
                message += link;
            }
            
            notifyEmployee(context, SUBJECT_ASSIGNED, message, assignedTo);
        }
    }
    
    /**
     * Marks specified Help Desk request as COMPLETED.
     * 
     * @param context The workflow rule context.
     */
    public void helpDeskComplete(final EventHandlerContext context) {
        final DataSource dataSource = createDataSourceForSave();
        final DataRecord record = dataSource.createRecordFromContext();
        record.setValue(TABLE_ACTIVITY_LOG + PERIOD + FIELD_STATUS, STATUS_COMPLETED);
        record.setValue(TABLE_ACTIVITY_LOG + ".date_completed", Utility.currentDate());
        dataSource.saveRecord(record);
        
        // notify the original request creator
        final int notify = getActivityParameterInt(context, ACTIVITY_ID,
            PARAMETER_AUTO_NOTIFY_REQUESTOR).intValue();
        if (notify > 0) {
            // get the created_by field value from the DB record
            final String activityLogId = (String) record.getValue(TABLE_ACTIVITY_LOG + PERIOD
                    + FIELD_ACTIVITY_LOG_ID);
            final String createdBy = (String) selectDbValue(context, TABLE_ACTIVITY_LOG,
                FIELD_CREATED_BY, FIELD_ACTIVITY_LOG_ID + EQUALS + activityLogId);
            
            final String message = localizeMessage(context, ACTIVITY_ID, REFERENCED_BY,
                NOTIFY_REQUESTOR_COMPLETE, null);
            notifyEmployee(context, SUBJECT_COMPLETED, message, createdBy);
        }
    }
    
    /**
     * Creates a new Help Desk request in the activity_log table. Sets the status field to PLANNED.
     * Sets the created_by field to the current user ID.
     * 
     * @param context The workflow rule context.
     */
    public void helpDeskPlanRequest(final EventHandlerContext context) {
        final DataSource dataSource = createDataSourceForSave();
        final DataRecord record = dataSource.createRecordFromContext();
        record.setNew(true);
        
        // override the status and created_by fields
        record.setValue(TABLE_ACTIVITY_LOG + PERIOD + FIELD_STATUS, STATUS_PLANNED);
        record.setValue(TABLE_ACTIVITY_LOG + ".created_by", ContextStore.get().getUser().getName());
        
        // save new record and return saved record with generated PK value to the form
        final DataRecord savedRecord = dataSource.saveRecord(record);
        context.setResponse(savedRecord);
    }
    
    /**
     * Rejects specified Help Desk request.
     * 
     * @param context The workflow rule context.
     */
    public void helpDeskReject(final EventHandlerContext context) {
        final DataSource dataSource = createDataSourceForSave();
        final DataRecord record = dataSource.createRecordFromContext();
        record.setValue(TABLE_ACTIVITY_LOG + ".status", STATUS_REJECTED);
        dataSource.saveRecord(record);
        
        // notify the original request creator
        final int notify = getActivityParameterInt(context, ACTIVITY_ID,
            PARAMETER_AUTO_NOTIFY_REQUESTOR).intValue();
        if (notify > 0) {
            // get the created_by field value from the DB record
            final String activityLogId = (String) record.getValue("activity_log.activity_log_id");
            final String createdBy = (String) selectDbValue(context, TABLE_ACTIVITY_LOG,
                FIELD_CREATED_BY, "activity_log_id = " + activityLogId);
            
            final String message = localizeMessage(context, ACTIVITY_ID, REFERENCED_BY,
                NOTIFY_REQUESTOR_REJECT, null);
            notifyEmployee(context, SUBJECT_REJECTED, message, createdBy);
        }
    }
    
    /**
     * Sets the status of specified Help Desk request to REQUESTED or SCHEDULED, depending on the
     * cost_estimated value.
     * 
     * @param context The workflow rule context.
     */
    public void helpDeskRequest(final EventHandlerContext context) {
        final DataSource dataSource = createDataSourceForSave();
        final DataRecord record = dataSource.createRecordFromContext();
        
        // decide what status value to use
        final Double costEstimated = (Double) record.getValue("activity_log.cost_estimated");
        final int autoApprove = getActivityParameterInt(context, ACTIVITY_ID, "AutoApprove")
            .intValue();
        final String status = autoApprove > 0
                && costEstimated.doubleValue() < AUTO_APPROVE_THRESHOLD ? STATUS_SCHEDULED
                : "REQUESTED";
        
        // override the status, created_by and date_requested fields
        record.setValue("activity_log.status", status);
        record.setValue("activity_log.created_by", ContextStore.get().getUser().getName());
        record.setValue("activity_log.date_requested", Utility.currentDate());
        
        // update record
        dataSource.saveRecord(record);
    }
    
    // ----------------------- helper methods -----------------------------------------------------
    
    /**
     * Helper method that creates DataSource instance that can be used to save action items.
     * 
     * @return The data source.
     */
    private DataSource createDataSourceForSave() {
        final String[] fieldNames = { FIELD_ACTIVITY_LOG_ID, "activity_type", "action_title",
                "cost_estimated", FIELD_STATUS, FIELD_CREATED_BY, "approved_by", "completed_by",
                "assigned_to", "date_requested", "date_scheduled", "date_issued", "date_completed",
                "doc", "description" };
        return DataSourceFactory.createDataSourceForFields(TABLE_ACTIVITY_LOG, fieldNames, false);
    }
    
    /**
     * Helper method. Sends email notification to the Help Desk requestor.
     * 
     * @param context The workflow rule context.
     * @param subject Email subject.
     * @param message Email message.
     * @param requestor Requestor name.
     */
    private void notifyEmployee(final EventHandlerContext context, final String subject,
            final String message, final String requestor) {
        // add notification parameters to the context
        context.addResponseParameter("notifySubject", subject);
        context.addResponseParameter("notifyBody", message);
        context.addResponseParameter("notifyIdentityTable", "em");
        context.addResponseParameter("notifyId", requestor);
        
        // call common handler to send a notification
        final CommonHandlers handler = new CommonHandlers();
        handler.notifyUsingArchibusIdentity(context);
    }
}
