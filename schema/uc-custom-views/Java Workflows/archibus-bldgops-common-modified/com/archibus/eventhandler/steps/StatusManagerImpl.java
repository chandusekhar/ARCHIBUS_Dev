package com.archibus.eventhandler.steps;

import java.util.HashMap;
import java.util.Map;

import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.eventhandler.helpdesk.Common;
import com.archibus.eventhandler.helpdesk.Constants;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.*;

/**
 * 
 * Status Manager (can be used for any activity)
 */

public class StatusManagerImpl extends EventHandlerBase implements StatusManager {

    // don't make it final, so it can be overridden
    private static String REJECTED_STATUS = "REJECTED";

    /**
     * Workflow rule execution context
     */
    protected EventHandlerContext context;

    /**
     * Table of request record
     */
    protected String tableName;

    /**
     * Primary key field
     */
    protected String fieldName;

    /**
     * Primary key value
     */
    protected int id;

    /**
     * Activity_id (afm_activities)
     */
    protected String activity_id;

    public StatusManagerImpl() {
        super();
    }

    public StatusManagerImpl(String activity_id) {
        super();
        this.activity_id = activity_id;
    }

    /**
     * This constructors retrieves tableName and fieldName from the database according to the given
     * <code>activity_id</code>.
     * 
     * <b>SQL:</b> <div>SELECT workflow_table FROM afm_activities WHERE activity_id=?</div>
     * 
     * @param context Workflow rule execution context
     * @param activity_id activity
     * @param id primary key value
     */
    public StatusManagerImpl(EventHandlerContext context, String activity_id, int id) {
        this.context = context;
        this.activity_id = activity_id;

        this.tableName = notNull(selectDbValue(context, "afm_activities", "workflow_table",
            "activity_id = " + literal(context, this.activity_id)));
        this.fieldName = notNull(com.archibus.eventhandler.EventHandlerBase.getTablePkFieldNames(
            context, this.tableName)[0]);

        this.id = id;
    }

    /**
     * Initialize when default constructor (no params) is used.<br/>
     * 
     * <p>
     * Always use the init method when a factory method is used to create an instance of a manager
     * class. The workflow table is retrieved from <code>afm_activities</code> table. The primary
     * key can be found
     * 
     * <b>SQL:</b> <div>SELECT workflow_table FROM afm_activities WHERE activity_id=?</div>
     * 
     * @param context Workflow rule execution context
     * @param activity_id activity
     * @param id primary key value
     */
    public void init(EventHandlerContext context, String activity_id, int id) throws ExceptionBase {
        this.context = context;
        this.activity_id = activity_id;

        this.tableName = notNull(selectDbValue(context, "afm_activities", "workflow_table",
            "activity_id = " + literal(context, this.activity_id)));
        this.fieldName = notNull(com.archibus.eventhandler.EventHandlerBase.getTablePkFieldNames(
            context, this.tableName)[0]);

        this.id = id;
    }

    /**
     * Update status of a workflow record, when no date field is applied.<br/>
     * 
     * @param status New basic status
     * 
     */
    public void updateStatus(String status) {
        Map values = new HashMap();
        values.put(this.fieldName, new Integer(this.id));
        values.put("status", status);
        executeDbSave(this.context, this.tableName, values);
        //executeDbCommit(this.context);
    }

    /**
     * Update status and specified date field of a workflow record.<br/>
     * 
     * @param status New basic status
     * @param dateField Field to set to current date (e.g. date_approved)
     * 
     */
    public void updateStatus(String status, String dateField, String timeField) {
        Map values = new HashMap();
        values.put(this.fieldName, new Integer(this.id));
        values.put("status", status);

        Map<String, String> map = Common.getSiteBuildingIds(this.tableName, this.fieldName,
            String.valueOf(this.id));

        if (dateField != null) {
            values.put(dateField,
                LocalDateTimeStore.get().currentLocalDate(null, null, map.get("siteId"), map.get("blId")));
        }
        if (timeField != null) {
            values.put(timeField,
                LocalDateTimeStore.get().currentLocalTime(null, null, map.get("siteId"), map.get("blId")));
        }

        executeDbSave(this.context, this.tableName, values);
        //executeDbCommit(this.context);
    }

    /**
     * 
     * @see com.archibus.eventhandler.steps.StatusManager#rejectRequest()
     */
    public void rejectRequest() {
        String status = "REJECTED";
        if (this.tableName.equals("wr")) {
            status = StatusConverter.getWorkRequestStatus(status);
        }

        updateStatus(status);
    }

    /**
     * 
     * @see com.archibus.eventhandler.steps.StatusManager#issueRequest()
     */
    public void issueRequest() {
        String status = "IN PROGRESS";
        if (this.tableName.equals("wr")) {
            status = StatusConverter.getWorkRequestStatus(status);
        }

        updateStatus(status);
    }

    /**
     * Update the <code>step_status</code> in the workflow table.<br/>
     * 
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Update record in the workflow table with new step status</li>
     * <li>If new step status is not null,
     * {@link com.archibus.eventhandler.steps.StepManager#init(EventHandlerContext, String, int)
     * initialize step manager} and
     * {@link com.archibus.eventhandler.steps.StepManager#invokeNextStep() invoke next step} in the
     * workflow</li>
     * </ol>
     * </p>
     * <p>
     * 
     * @param step_status step status value
     * @see WorkflowFactory#getStepManager(EventHandlerContext, String, int)
     * 
     */
    public void updateStepStatus(String step_status) {
        Map values = new HashMap();
        values.put("step_status", step_status);
        values.put(this.fieldName, new Integer(this.id));
        executeDbSave(this.context, this.tableName, values);
        //executeDbCommit(this.context);

        if (step_status != null && !step_status.equals(Constants.STEP_STATUS_NULL)) {
            StepManager stepManager = WorkflowFactory.getStepManager(this.context,
                this.activity_id, this.id);
            stepManager.invokeNextStep();
        }
    }

    public String getRejectedStatus() {
        return REJECTED_STATUS;
    }
}
