package com.archibus.eventhandler.steps;

import java.sql.*;
import java.sql.Date;
import java.util.*;

import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.eventhandler.helpdesk.*;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.*;

/**
 * 
 * <p>
 * This is an abstract class implementing the <code>Step</code> interface.<br>
 * It is the base class for for every step implementation. This can be used for any activity (or
 * workflow table)
 * 
 * <p>
 * The name of the class corresponds to the <code>step_type</code> in the database.<br>
 * This is the default package used to implement the default step implementations.<br>
 * 
 * @see StepManager
 * @see StepManagerImpl
 * 
 * 
 */
public abstract class StepImpl extends HelpdeskEventHandlerBase implements Step {
    
    public static final int MANAGER = 2;
    
    public static final int SUBSTITUTE_CF = 4;
    
    public static final int SUBSTITUTE_EM = 3;
    
    public static final int SUBSTITUTE_MANAGER = 5;
    
    public static final int AFM_ROLE = 6;
    
    public static final int USER = 1;
    
    /**
     * Activity id
     */
    protected String activity_id;
    
    /**
     * Craftsperson code
     */
    protected String cf_id;
    
    protected String comments;
    
    /**
     * Condition for this step to be executed, defined in the Service Level Agreement
     */
    protected String condition;
    
    /**
     * Workflow rule execution context
     */
    protected EventHandlerContext context;
    
    /**
     * Date step created
     */
    protected Date creationDate;
    
    /**
     * Time step created
     */
    protected Time creationTime;
    
    /**
     * Employee code
     */
    protected String em_id;
    
    /**
     * AFM ROLE
     */
    protected String afmRole;
    
    /**
     * Email address of person executing the step
     */
    protected String email;
    
    /**
     * Step ended
     */
    protected boolean ended;
    
    /**
     * Primary key field
     */
    protected String fieldName;
    
    /**
     * Primary key value
     */
    protected int id;
    
    /**
     * Step in progress (waiting for response)
     */
    protected boolean inProgress;
    
    /**
     * Multiple steps required (for approvals)
     */
    protected boolean multiple;
    
    /**
     * Notify Responspible
     */
    protected boolean notifyResponsible;
    
    /**
     * Response date
     */
    protected Date responseDate;
    
    /**
     * Response time
     */
    protected Time responseTime;
    
    /**
     * Role name, can be resolved to a list of employees
     */
    protected String role;
    
    /**
     * (Basic) status after, can be null if no status change required
     */
    protected String statusAfter;
    
    /**
     * (Basic) status before
     */
    protected String statusBefore;
    
    /**
     * Step code
     */
    protected String stepCode;
    
    /**
     * Step log id
     */
    protected int stepLogId;
    
    /**
     * Step name
     */
    protected String stepName;
    
    /**
     * Step order
     */
    protected int stepOrder;
    
    /**
     * Step status before
     */
    protected String stepStatusBefore;
    
    /**
     * Step status after reject or decline
     */
    protected String stepStatusRejected;
    
    /**
     * Step status after confirm or accept
     */
    protected String stepStatusResult;
    
    /**
     * tablename + fieldName + id + stepOrder define a step instance (once instance for multiple
     * logged items)
     */
    /**
     * Table of request record
     */
    protected String tableName;
    
    /**
     * Step type
     */
    protected String type;
    
    /**
     * Vendor code
     */
    protected String vn_id;
    
    /**
     * Constructor with no arguments, used by factory method<br>
     * Use the init method to initialize parameters
     * 
     */
    public StepImpl() {
        super();
    }
    
    /**
     * Extra data for this step is included in values and used to {@link #setProperties(Map) set
     * properties}.
     * 
     * <p>
     * This constructor has a Map of property values retrieved from the database
     * 
     * @param context Workflow rule execution context
     * @param activity_id Activity id
     * @param id Primary key value
     * @param values Extra step properties
     */
    public StepImpl(final EventHandlerContext context, final String activity_id, final int id,
            final Map<String, Object> values) {
        super();
        this.context = context;
        this.activity_id = activity_id;
        this.id = id;
        // set property values (values for every record field)
        setProperties(values);
    }
    
    /**
     * This constructor retrieves data according to the step type.
     * 
     * <p>
     * 
     * 
     * @param context Workflow rule execution context
     * @param activity_id Activity id
     * @param id Primary key value
     * @param stepType step type
     * @param stepName step name
     * 
     *            <p>
     *            This is the standard constructor method. All parameters are supplied to identify
     *            the step. The workflow table etc. are looked up using the <code>activity_id</code>
     * 
     *            {@link #getDataForStep()}
     * @param EventHandlerContext context
     * @param String activity_id
     * @param String stepType
     * @param String stepName
     */
    public StepImpl(final EventHandlerContext context, final String activity_id, final int id,
            final String stepType, final String stepName) {
        super();
        this.context = context;
        this.activity_id = activity_id;
        this.id = id;
        this.type = stepType;
        this.stepName = stepName;
        getDataForStep();
    }
    
    /**
     * The <code>type</code> must be set.
     * 
     * @param type step type
     */
    public StepImpl(final String type) {
        this.type = type;
    }
    
    /**
     * Response actions.<br>
     * These actions should be overriden by the actual classes<br>
     * When not overridden , they will throw an exception for illegal action
     * 
     * @param stepLogId Id of step
     * @param comment comment
     * @param user name of current user
     */
    
    public void accept(final int stepLogId, final String comment, final String user) {
        // @translatable
        final String errorMessage = localizeString(this.context, "Illegal action");
        throw new ExceptionBase(errorMessage, true);
    }
    
    /**
     * Check the condition specified for this step.
     * <p>
     * Pseudo-code:
     * <ol>
     * <li>Get the record with the id combined with the SQL condition</li>
     * <li>Check for resulting record</li>
     * </ol>
     * </p>
     * <p>
     * SQL: <div>SELECT <i>fieldName</i> FROM <i>tableName</i> <br />
     * WHERE <i>fieldName</i> = <i>id</i> AND <i>condition</i>
     * </p>
     */
    public boolean checkCondition() {
        if (this.condition == null) {
            return true;
        }
        
        final String where = this.fieldName + "=" + this.id + " AND (" + this.condition + ") ";
        
        final Integer id =
                getIntegerValue(this.context,
                    selectDbValue(this.context, this.tableName, this.fieldName, where));
        
        if (id == null) {
            return false;
        }
        
        return id.intValue() > 0;
    }
    
    public boolean checkRequired() {
        return true;
    }
    
    public void confirm(final int stepLogId, final String comment, final String user) {
        // @translatable
        final String errorMessage = localizeString(this.context, "Illegal action");
        throw new ExceptionBase(errorMessage, true);
    }
    
    /**
     * Create a message object to be sent.
     * 
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Create Message object</li>
     * <li>Set the stepcode for the message to be used in the link</li>
     * <li>Load parameters for the message text from the messages table</li>
     * <li>Format message body text with the message link</li>
     * </ol>
     * </p>
     * 
     * @param String stepCode
     * @param stepCode step code to use in the message
     * @return message
     */
    public Message createMessage(final String stepCode) {
        final Message message = new Message(this.context);
        
        message.setActivityId(this.activity_id);
        message.setReferencedBy("SENDEMAIL_" + this.type.toUpperCase() + "_STEPMGR");
        message.setBodyMessageId("SENDEMAIL_TEXT");
        message.setSubjectMessageId("SENDEMAIL_TITLE");
        
        if (message.isBodyRichFormatted() || message.isSubjectRichFormatted()) {
            final Map<String, Object> dataModel = getDataModel();
            if (StringUtil.notNullOrEmpty(stepCode)) {
                this.stepCode = stepCode;
                message.setStepCode(stepCode);
                dataModel.put("link", dataModel.get("link") + "?code=" + stepCode);
            }
            message.setDataModel(dataModel);
        }
        if (!message.isBodyRichFormatted()) {// only original body contained {?} parameters
            final String viewFile =
                    getActivityParameterString(this.context, this.activity_id,
                        this.type.toUpperCase() + "_VIEW");
            final StringBuffer link =
                    new StringBuffer(getWebCentralPath(this.context) + "/" + viewFile);
            if (StringUtil.notNullOrEmpty(stepCode)) {
                link.append("?code=" + stepCode);
            }
            final Object[] args = new Object[] { link.toString() };
            message.setBodyArguments(args);
        }
        
        message.format();
        return message;
    }
    
    /**
     * Create a message to send to the substitute(s) of the responsible for the step, when the step
     * is invoked.
     * 
     * @param stepCode step_code of the step
     * @return message
     */
    public Message createMessageForSubstitutes(final String stepCode) {
        final Message message = new Message(this.context);
        
        message.setActivityId(this.activity_id);
        message.setReferencedBy("SENDEMAIL_" + this.type.toUpperCase() + "_SUBSTITUTE_STEPMGR");
        message.setBodyMessageId("SENDEMAIL_TEXT");
        message.setSubjectMessageId("SENDEMAIL_TITLE");
        
        if (message.isBodyRichFormatted() || message.isSubjectRichFormatted()) {
            final Map<String, Object> dataModel = getDataModel();
            if (StringUtil.notNullOrEmpty(stepCode)) {
                this.stepCode = stepCode;
                message.setStepCode(stepCode);
                dataModel.put("link", dataModel.get("link") + "?code=" + stepCode);
            }
            message.setDataModel(dataModel);
        }
        if (!message.isBodyRichFormatted()) {
            final String viewFile =
                    getActivityParameterString(this.context, this.activity_id,
                        this.type.toUpperCase() + "_VIEW");
            final StringBuffer link =
                    new StringBuffer(getWebCentralPath(this.context) + "/" + viewFile);
            if (StringUtil.notNullOrEmpty(stepCode)) {
                link.append("?code=" + stepCode);
            }
            final Object[] args = new Object[] { link.toString() };
            message.setBodyArguments(args);
        }
        
        message.format();
        return message;
    }
    
    public void decline(final int stepLogId, final String comment, final String user) {
        // @translatable
        final String errorMessage = localizeString(this.context, "Illegal action");
        throw new ExceptionBase(errorMessage, true);
    }
    
    public void forward(final int stepLogId, String comment, final String user,
            final String forwardToEmId) {
        final int check = checkUser(user, stepLogId);
        comment = formatCommentPrefix(check, comment);
        updateStep(stepLogId, Constants.STEP_STATUS_FORWARD, comment);
    }
    
    public String getActivity_id() {
        return this.activity_id;
    }
    
    public String getCf_id() {
        return this.cf_id;
    }
    
    public String getComments() {
        return this.comments;
    }
    
    /**
     * @param Map<String,Object>
     * @return
     */
    public Map<String, Object> getDataModel() {
        final String viewFile =
                getActivityParameterString(this.context, this.activity_id, this.type.toUpperCase()
                        + "_VIEW");
        
        final Map<String, Object> dataModel =
                MessageHelper.getRequestDatamodel(this.context, this.tableName, this.fieldName,
                    this.id);
        dataModel.put("link", getWebCentralPath(this.context) + "/" + viewFile);
        dataModel.put("step", getProperties());
        
        return dataModel;
    }
    
    public String getEmId() {
        return this.em_id;
    }
    
    public String getFieldName() {
        return this.fieldName;
    }
    
    public int getId() {
        return this.id;
    }
    
    public String getRole() {
        return this.role;
    }
    
    /**
     * 
     * Get status of the current request record
     * 
     * @return request status
     */
    public String getStatus() {
        return (String) selectDbValue(this.context, this.tableName, "status", this.fieldName + "="
                + this.id);
    }
    
    public String getStatusAfter() {
        return this.statusAfter;
    }
    
    public String getStatusBefore() {
        return this.statusBefore;
    }
    
    public int getStepLogId() {
        return this.stepLogId;
    }
    
    public String getStepName() {
        return this.stepName;
    }
    
    public int getStepOrder() {
        return this.stepOrder;
    }
    
    public String getStepStatusRejected() {
        return this.stepStatusRejected;
    }
    
    public String getStepStatusResult() {
        return this.stepStatusResult;
    }
    
    public String getTableName() {
        return this.tableName;
    }
    
    public String getType() {
        return this.type;
    }
    
    public String getVnId() {
        return this.vn_id;
    }
    
    /**
     * Return true is this step has ended
     */
    public boolean hasEnded() {
        return this.ended;
    }
    
    /**
     * Initialize object when the default constructor is used<br />
     * Extra data for this step is included in values and used to {@link #setProperties(Map) set
     * properties} Other data is filled in according to the steptype ({@link #getDataForStep()
     * getDataForStep}
     * 
     * @param context Workflow rule execution context
     * @param activity_id Activity id
     * @param id Primary key value
     * @param values map of values
     */
    public void init(final EventHandlerContext context, final String activity_id, final int id,
            final Map<String, Object> values) {
        this.context = context;
        this.activity_id = activity_id;
        this.id = id;
        setProperties(values);
        getDataForStep();
    }
    
    /**
     * Return true if this step is in progress (waiting for response)
     */
    public boolean inProgress() {
        return this.inProgress;
    }
    
    /**
     * Invoke this step
     */
    public void invoke() {
        if (!checkCondition()) {
            setStepEnded(true);
            return;
        }
        if (this.role != null) {
            final List<String> ems =
                    HelpdeskRoles.getEmployeesFromHelpdeskRole(this.context, this.role,
                        this.tableName, this.fieldName, this.id);
            for (final Iterator<String> it = ems.iterator(); it.hasNext();) {
                this.em_id = it.next();
                final String stepCode = logStep();
                
                if (this.isNotifyResponsible()) {
                    final Message message = createMessage(stepCode);
                    message.setMailTo(getEmailAddress(this.context, this.em_id));
                    message.format();
                    sendRequest(message);
                    
                    // KB 3023429 - also notify substitute(s) of the responsible (EC 2012/07/10)
                    final List<String> substitutes =
                            StepHandler.getWorkflowEmSubstitutes(this.context, this.em_id,
                                this.type);
                    if (!substitutes.isEmpty()) {
                        notifyEmSubstitutes(substitutes);
                    }
                }
            }
        } else {
            final String stepCode = logStep();
            if (this.isNotifyResponsible()) {
                final Message message = createMessage(stepCode);
                if (this.afmRole != null) {
                    final List<String> ems = this.getEmployeesFromAfmRole(this.afmRole);
                    for (final Iterator<String> it = ems.iterator(); it.hasNext();) {
                        this.em_id = it.next();
                        if (this.isNotifyResponsible()) {
                            message.setMailTo(getEmailAddress(this.context, this.em_id));
                            message.format();
                            sendRequest(message);
                        }
                    }
                }else { 
                    if (this.em_id != null) {
                            message.setMailTo(getEmailAddress(this.context, this.em_id));
                            
                            // KB 3023429 - also notify substitute(s) of the responsible employee (EC
                            // 2012/07/10)
                            final List<String> substitutes =
                                    StepHandler.getWorkflowEmSubstitutes(this.context, this.em_id,
                                        this.type);
                            if (!substitutes.isEmpty()) {
                                notifyEmSubstitutes(substitutes);
                            }
                        } else if (this.vn_id != null) {
                            message.setMailTo(getEmailAddress(this.context, "vn", "vn_id", this.vn_id));
                        } else if (this.cf_id != null) {
                            message.setMailTo(getEmailAddress(this.context, "cf", "cf_id", this.cf_id));
                            
                            // KB 3023429 - also notify substitute(s) of the responsible craftsperson(EC
                            // 2012/07/10)
                            final List<String> substitutes =
                                    StepHandler.getWorkflowCfSubstitutes(this.context, this.cf_id,
                                        this.type);
                            if (!substitutes.isEmpty()) {
                                notifyCfSubstitutes(substitutes);
                            }
                            
                        } else {
                            // @translatable
                            final String errorMessage = "No user found for [{0}]";
                            final Object[] args = { this.type };
                            throw new ExceptionBase(errorMessage, args, true);
                        }
                        message.format();
                        sendRequest(message);
            }
          }
        }
    }
    
    public boolean isNotifyResponsible() {
        return this.notifyResponsible;
    }
    
    public void reissue(final int stepLogId, final String comment, final String user) {
        // @translatable
        final String errorMessage = localizeString(this.context, "Illegal action");
        throw new ExceptionBase(errorMessage, true);
    }
    
    public void reject(final int stepLogId, final String comment, final String user) {
        // @translatable
        final String errorMessage = localizeString(this.context, "Illegal action");
        throw new ExceptionBase(errorMessage, true);
    }
    
    /**
     * Send the message.
     * 
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Check the mailto address</li>
     * <li>Update step log table (message sent)</li>
     * <li>Send the message</li>
     * </ol>
     * </p>
     * 
     * @param message Message to send
     */
    public void sendRequest(final Message message) {
        final String update =
                "UPDATE " + Constants.STEP_LOG_TABLE + " SET email_sent = 1 WHERE step_code = "
                        + literal(this.context, this.stepCode);
        executeDbSql(this.context, update, true);
        // KB3032268, add commit after update to avoid eror that lock record
        //executeDbCommit(this.context);
        this.inProgress = true;
        message.sendMessage();
    }
    
    public void setCf_id(final String cf_id) {
        this.cf_id = cf_id;
    }
    
    public void setComments(final String comments) {
        this.comments = comments;
    }
    
    public void setContext(final EventHandlerContext context) {
        this.context = context;
    }
    
    public void setEmId(final String em_id) {
        this.em_id = em_id;
    }
    
    public void setFieldName(final String fieldName) {
        this.fieldName = fieldName;
    }
    
    public void setId(final int id) {
        this.id = id;
    }
    
    public void setNotifyResponsible(final boolean notifyResponsible) {
        this.notifyResponsible = notifyResponsible;
    }
    
    /**
     * Copy the map values to the step instance
     * 
     * @param values Map of values Values:
     *            <ul>
     *            <li>status</li>
     *            <li>status_before</li>
     *            <li>status_after</li>
     *            <li>step_status</li>
     *            <li>condition</li>
     *            <li>em_id</li>
     *            <li>vn_id</li>
     *            <li>role</li>
     *            <li>step_type</li>
     *            <li>step</li>
     *            <li>multiple_required</li>
     *            <li>step_order</li>
     *            <li>date_response</li>
     *            <li>time_response</li>
     *            </ul>
     */
    public void setProperties(final Map<String, Object> values) {
        
        if (values.containsKey("status")) {
            this.statusBefore = (String) values.get("status");
        }
        if (values.containsKey("status_before")) {
            this.statusBefore = (String) values.get("status_before");
        }
        if (values.containsKey("status_after")) {
            this.statusAfter = (String) values.get("status_after");
        }
        if (values.containsKey("step_status")) {
            this.stepStatusBefore = (String) values.get("step_status");
        }
        
        if (values.containsKey("condition")) {
            this.condition = (String) values.get("condition");
        }
        if (values.containsKey("role_name")) {
            this.afmRole = (String) values.get("role_name");
        }
        if (values.containsKey("em_id")) {
            this.em_id = (String) values.get("em_id");
        }
        if (values.containsKey("vn_id")) {
            this.vn_id = (String) values.get("vn_id");
        }
        if (values.containsKey("cf_id")) {
            this.cf_id = (String) values.get("cf_id");
        }
        if (values.containsKey("role")) {
            this.role = (String) values.get("role");
        }
        
        if (values.containsKey("step_type")) {
            this.type = (String) values.get("step_type");
        }
        if (values.containsKey("step")) {
            this.stepName = (String) values.get("step");
        }
        if (values.containsKey("multiple_required")) {
            this.multiple =
                    getIntegerValue(this.context, values.get("multiple_required")).intValue() > 0;
        }
        if (values.containsKey("step_order")) {
            this.stepOrder = getIntegerValue(this.context, values.get("step_order")).intValue();
        }
        if (values.containsKey("step_log_id")) {
            this.stepLogId = getIntegerValue(this.context, values.get("step_log_id")).intValue();
        }
        
        if (values.containsKey("step_code")) {
            this.stepCode = (String) values.get("step_code");
        }
        
        if (values.containsKey("notify_responsible")) {
            this.notifyResponsible =
                    getIntegerValue(this.context, values.get("notify_responsible")).intValue() > 0;
        } else if (values.containsKey("email_sent")) {
            this.notifyResponsible =
                    getIntegerValue(this.context, values.get("email_sent")).intValue() > 0;
        }
        
        if (values.containsKey("date_response")) {
            if (values.get("date_response") != null) {
                this.inProgress = false;
                this.ended = true;
                this.responseDate = getDateValue(this.context, values.get("date_response"));
                this.responseTime = getTimeValue(this.context, values.get("time_response"));
            } else {
                this.inProgress = true;
                this.ended = false;
                this.responseDate = null;
                this.responseTime = null;
            }
        }
    }
    
    public void setRole(final String role) {
        this.role = role;
    }
    
    public void setStatusAfter(final String statusAfter) {
        this.statusAfter = statusAfter;
    }
    
    public void setStatusBefore(final String statusBefore) {
        this.statusBefore = statusBefore;
    }
    
    public void setStepLogId(final int stepLogId) {
        this.stepLogId = stepLogId;
    }
    
    public void setStepName(final String step) {
        this.stepName = step;
    }
    
    public void setStepStatusRejected(final String stepStatusRejected) {
        this.stepStatusRejected = stepStatusRejected;
    }
    
    public void setStepStatusResult(final String stepStatusResult) {
        this.stepStatusResult = stepStatusResult;
    }
    
    public void setTableName(final String tableName) {
        this.tableName = tableName;
    }
    
    public void setType(final String type) {
        this.type = type;
    }
    
    public void setVnId(final String vn_id) {
        this.vn_id = vn_id;
    }
    
    /**
     * Check if the user is authorized to perform the action.<br>
     * 
     * <p>
     * Whenever a response on a <code>Action</code> or <code>Acceptance</code> is received this
     * checks if the user is authorized to perform this action. If not an exception is thrown.
     * 
     * KB 3023429 - also substitute(s) of the responsible and substitute(s) of the service desk
     * manager are allowed to execute the step (EC 2012/07/10)
     * 
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get the user name for this step from the log table</li>
     * <li>Check if the current user matches the one specified in the step log table</li>
     * <li>If not check if the current user is substitute of the responsible for the step</li>
     * <li>If not check if the current user is service desk manager for the request</li>
     * <li>If not check if the current user is substitute of the service desk manager for the
     * request</li>
     * </ol>
     * </p>
     * 
     * @param user user name (afm_users.user_name)
     * @param stepLogId step log id
     * 
     * @return whether the user is the responsible for the step, a substitute of the responsible,
     *         the service desk manager of the request or a substitute of the service desk manager
     * 
     */
    protected int checkUser(final String user, final int stepLogId) {
        final Object[] tmp =
                selectDbValues(this.context, Constants.STEP_LOG_TABLE, new String[] { "user_name",
                        "em_id", "cf_id", "table_name", "field_name", "pkey_value" , "role_name"},
                    "step_log_id = " + stepLogId);
        final String userName = notNull(tmp[0]);
        final String emId = notNull(tmp[1]);
        final String cfId = notNull(tmp[2]);
        final String afm_role = notNull(tmp[6]);
        
        final DataSource requestDS =
                DataSourceFactory.createDataSourceForFields(this.tableName, new String[] {
                        "manager", this.fieldName });
        final DataRecord requestRecord =
                requestDS.getRecord(this.tableName + "." + this.fieldName + "=" + this.id);
        final String manager = requestRecord.getString(this.tableName + ".manager");
        final DataSource userDS =
                DataSourceFactory.createDataSourceForFields("afm_users", new String[] {
                        "user_name", "email" });
        final DataRecord userRecord =
                userDS.getRecord("email = (SELECT email FROM em WHERE em_id = "
                        + literal(this.context, manager) + ")");
        final String managerUser = userRecord.getString("afm_users.user_name");
        
        if (userName.equalsIgnoreCase(user.trim()) || userName == null || user.equals("SYSTEM")) {
            return USER;
        } else {
            if (StringUtil.notNullOrEmpty(afm_role)
                    && afm_role.equalsIgnoreCase(this.getAfmRoleOfUser(user))) {
                return AFM_ROLE;
            }else if (StringUtil.notNullOrEmpty(emId)
                    && StepHandler.checkWorkflowEmSubstitute(this.context, emId, this.type)) {
                return SUBSTITUTE_EM;
            } else if (StringUtil.notNullOrEmpty(cfId)
                    && StepHandler.checkWorkflowCfSubstitute(this.context, cfId, this.type)) {
                this.cf_id = cfId;
                SqlUtils.executeUpdate(Constants.STEP_LOG_TABLE,
                    "Update helpdesk_step_log set user_name='" + user + "' where step_log_id =  "
                            + stepLogId);
                return SUBSTITUTE_CF;
            } else if (StringUtil.notNullOrEmpty(managerUser)
                    && managerUser.equalsIgnoreCase(user.trim())) {
                return MANAGER;
            } else if (StringUtil.notNullOrEmpty(manager)
                    && StepHandler.checkWorkflowEmSubstitute(this.context, manager, "manager")) {
                return SUBSTITUTE_MANAGER;
            } else {
                // @translatable
                final String errorMessage =
                        "Illegal user {0} for step {1} database userName={2} and id={3}";
                final Object[] args = { user, this.type, userName, new Integer(this.id) };
                throw new ExceptionBase(errorMessage, args, true);
            }
        }
    }
    
    /**
     * Get afm role of the given user
     * 
     * @param user user name
     * @return afm role name
     */
    protected String getAfmRoleOfUser(final String user) {
        final DataSource userDS =
                DataSourceFactory.createDataSourceForFields("afm_users", new String[] {
                        "user_name", "role_name" });
        final DataRecord userRecord = userDS.getRecord("user_name=" + literal(this.context, user));
        if (userRecord != null) {
            return userRecord.getString("afm_users.role_name");
        } else {
            return "";
        }
    }
    
    /**
     * Format (prefix) the comments of the user responding to a step based on his 'role'
     * (responsible, substitute, service desk manager or substitute of the service desk manager).
     * 
     * @param checkUser
     * @param comment
     * @return new comments
     */
    protected String formatCommentPrefix(final int checkUser, final String comment) {
        String prefix = null;
        if (checkUser == StepImpl.SUBSTITUTE_EM) {
            // @translatable
            prefix = localizeString(this.context, "Step performed by substitute of " + this.em_id);
        } else if (checkUser == StepImpl.SUBSTITUTE_CF) {
            // @translatable
            prefix = localizeString(this.context, "Step performed by substitute of " + this.cf_id);
        } else if (checkUser == StepImpl.MANAGER) {
            // @translatable
            prefix = localizeString(this.context, "Step performed by Service Desk Manager");
        } else if (checkUser == StepImpl.SUBSTITUTE_MANAGER) {
            // @translatable
            prefix =
                    localizeString(this.context,
                        "Step performed by substitute of Service Desk Manager");
        }
        if (prefix != null) {
            if (StringUtil.notNullOrEmpty(comment)) {
                return prefix + " :: " + comment;
            } else {
                return prefix;
            }
            
        } else {
            return comment;
        }
    }
    
    /**
     * Format where clause for SQL query to get step record using step order (for each status a new
     * step order sequence is started)
     * 
     * @return where clause for SQL query
     */
    protected String formatWhere() {
        return "table_name = " + literal(this.context, this.tableName) + " AND field_name= "
                + literal(this.context, this.fieldName) + " AND pkey_value = " + this.id
                + " AND status = " + literal(this.context, this.statusBefore)
                + " AND step_order = " + this.stepOrder;
    }
    
    /**
     * Get data from step definition.
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get table and primary key field name using activity id</li>
     * <li>Get data from step definition table</li>
     * </ol>
     * </p>
     * <p>
     * <b>SQL:</b> <div>SELECT workflow_table FROM afm_activities WHERE activity_id = ?</div>
     * <div>SELECT status FROM activity_log WHERE activity_log_id = ?</div> <div>SELECT
     * step_status_result, step_status_rejected FROM afm_wf_steps WHERE activity_id = ? AND status =
     * ? AND step = ?</div>
     * </p>
     */
    protected void getDataForStep() {
        if (this.activity_id == null) {
            // @translatable
            final String errorMessage = "No activity defined executing step [{0}]";
            final Object[] args = { this.stepName };
            throw new ExceptionBase(errorMessage, args, true);
        } else if (this.activity_id != null) {
            // get the table name from activities
            final String table_name =
                    (String) selectDbValue(this.context, "afm_activities", "workflow_table",
                        "activity_id = " + literal(this.context, this.activity_id));
            this.tableName = table_name.trim();
            this.fieldName =
                    com.archibus.eventhandler.EventHandlerBase.getTablePkFieldNames(this.context,
                        this.tableName)[0];
        }
        
        if (this.statusBefore == null) {
            this.statusBefore =
                    Common.getStatusValue(this.context, this.tableName, this.fieldName, this.id);
        }
        
        final String[] fields = { "step_status_result", "step_status_rejected", "status_after" };
        
        final String where =
                "activity_id = " + literal(this.context, this.activity_id) + " AND status="
                        + literal(this.context, this.statusBefore) + " AND step = "
                        + literal(this.context, this.stepName);
        final Object[] values = selectDbValues(this.context, "afm_wf_steps", fields, where);
        
        if (values != null) {
            this.stepStatusResult = (String) values[0]; // approved, ...
            this.stepStatusRejected = (String) values[1]; // rejected or declined
            this.statusAfter = (String) values[2];
        } else {
            // @translatable
            final String errorMessage = "Step not found where [{0}]";
            final Object[] args = { where };
            throw new ExceptionBase(errorMessage, args, true);
        }
        
    }
    
    /**
     * This logs the step to the database, inserting a new record in <code>helpdesk_step_log</code><br />
     * The stepcode is always created; this is a unique reference string used in e-mail messages
     * 
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Create unique step code</li>
     * <li>Get step field values</li>
     * <li>Add record to the step log table</li>
     * <li>Default the step end is set to false</li>
     * </ol>
     * 
     * 2008-7-23 bv: added restriction for max value
     * 
     * @return unique code for this step (for use in email message)
     */
    protected String logStep() {
        final String uuid = Common.generateUUID();
        this.stepCode = uuid;
        
        final Map<String, Object> values = new HashMap<String, Object>();
        values.put("activity_id", this.activity_id);
        values.put("table_name", this.tableName);
        values.put("field_name", this.fieldName);
        values.put("pkey_value", new Integer(this.id));
        
        if (this.afmRole != null) {
            values.put("role_name", this.afmRole);
        }
        
        if (this.em_id != null) {
            values.put("em_id", this.em_id);
            final String user_name =
                    (String) selectDbValue(this.context, "afm_users", "user_name", "email = "
                            + literal(this.context, getEmailAddress(this.context, this.em_id)));
            values.put("user_name", user_name);
        }
        
        if (this.vn_id != null) {
            values.put("vn_id", this.vn_id);
            final String user_name =
                    (String) selectDbValue(
                        this.context,
                        "afm_users",
                        "user_name",
                        "email IN (SELECT email FROM vn WHERE vn_id = "
                                + literal(this.context, this.vn_id) + ")");
            values.put("user_name", user_name);
        }
        
        if (this.cf_id != null) {
            values.put("cf_id", this.cf_id);
            final String user_name =
                    (String) selectDbValue(
                        this.context,
                        "afm_users",
                        "user_name",
                        "email = (SELECT email FROM cf WHERE cf_id = "
                                + literal(this.context, this.cf_id) + ")");
            values.put("user_name", user_name);
        }
        
        values.put("step_type", this.type);
        values.put("step", this.stepName);
        values.put("status", this.statusBefore);
        
        final Map<String, String> map =
                Common.getSiteBuildingIds(this.tableName, this.fieldName, String.valueOf(this.id));
        
        values.put(
            "date_created",
            LocalDateTimeStore.get().currentLocalDate(null, null, map.get("siteId"),
                map.get("blId")));
        values.put(
            "time_created",
            LocalDateTimeStore.get().currentLocalTime(null, null, map.get("siteId"),
                map.get("blId")));
        
        // when ended this is the timestamp, else NULL
        values.put("date_response", this.responseDate);
        values.put("time_response", this.responseTime);
        
        values.put("step_code", this.stepCode);
        values.put("condition", this.condition);
        
        values.put("comments", this.comments);
        
        values.put("step_order", new Integer(this.stepOrder));
        
        values.put("multiple_required", this.multiple ? new Integer(1) : new Integer(0));
        
        this.log.debug("LOG STEP " + values + " " + this.stepStatusResult);
        
        if("return".equals(this.type) || "change".equals(this.type)) {
            values.put("user_name", ContextStore.get().getUser().getName());
        }
        
        executeDbAdd(this.context, Constants.STEP_LOG_TABLE, values);
        //executeDbCommit(this.context);
        this.stepLogId =
                Common.getMaxId(this.context, "helpdesk_step_log", "step_log_id",
                    getRestrictionFromValues(values));
        return this.stepCode;
    }
    
    /**
     * Notify substitutes of the craftsperson responsible for the step.
     * 
     * @param substitutes
     */
    protected void notifyCfSubstitutes(final List<String> substitutes) {
        final Message message = createMessageForSubstitutes(this.stepCode);
        for (final String substituteCfId : substitutes) {
            message.setMailTo(getEmailAddressForCraftsperson(this.context, substituteCfId));
            message.format();
            message.sendMessage();
        }
    }
    
    /**
     * Notify substitutes of the employee responsible for the step.
     * 
     * @param substitutes
     */
    protected void notifyEmSubstitutes(final List<String> substitutes) {
        final Message message = createMessageForSubstitutes(this.stepCode);
        for (final String substituteEmId : substitutes) {
            message.setMailTo(getEmailAddress(this.context, substituteEmId));
            message.format();
            message.sendMessage();
        }
        
    }
    
    /**
     * Sets the step work flow to ended or waiting for response. When a step is ended, the
     * date_response and time_response are set in the log table When waiting for response these
     * fields are null
     * 
     * @param ended true or false
     */
    protected void setStepEnded(final boolean ended) {
        if (ended) {
            this.ended = true;
            this.inProgress = false;
            final Map<String, String> map =
                    Common.getSiteBuildingIds(this.tableName, this.fieldName,
                        String.valueOf(this.id));
            
            this.responseDate =
                    LocalDateTimeStore.get().currentLocalDate(null, null, map.get("siteId"),
                        map.get("blId"));
            this.responseTime =
                    LocalDateTimeStore.get().currentLocalTime(null, null, map.get("siteId"),
                        map.get("blId"));
        } else {
            this.ended = false;
            // this.inProgress = true;
            this.responseDate = null;
            this.responseTime = null;
            
            // update step status of request record
            final Map<String, Object> values = new HashMap<String, Object>();
            values.put(this.fieldName, new Integer(this.id));
            values.put("step_status", Constants.STEP_STATUS_WAITING);
            executeDbSave(this.context, this.tableName, values);
            //executeDbCommit(this.context);
        }
    }
    
    /**
     * Update the step log table with actual values
     * 
     * @param stepLogId Id of the step to update
     * @param stepStatusAfter new step status
     * @param comments update comments
     */
    protected void updateStep(final int stepLogId, final String stepStatusAfter,
            final String comments) {
        setStepEnded(true);
        
        final Map<String, Object> values = new HashMap<String, Object>();
        values.put("step_log_id", new Integer(stepLogId));
        values.put("comments", comments);
        values.put("date_response", this.responseDate);
        values.put("time_response", this.responseTime);
        values.put("step_status_result", stepStatusAfter);
        
        //log the current user if the response type is afm role
        if (StringUtil.notNullOrEmpty(this.afmRole)) {
            values.put("user_name", ContextStore.get().getUser().getName());
        }
        
        // KB 3023429 - if step executed by substitute, replace em_id or cf_id by current user (EC
        // 2012/07/10)
        if (StringUtil.notNullOrEmpty(this.em_id)) {
            values.put("em_id", ContextStore.get().getUser().getEmployee().getId());
        }
        if (StringUtil.notNullOrEmpty(this.cf_id)) {
            values.put("cf_id", getCfIdForCurrentUser());
        }
        executeDbSave(this.context, Constants.STEP_LOG_TABLE, values);
        //executeDbCommit(this.context);
    }
    
    private Map<String, Object> getProperties() {
        final Map<String, Object> result = new HashMap<String, Object>();
        
        final Object[] record =
                selectDbValues(
                    this.context,
                    Constants.STEP_LOG_TABLE,
                    Constants.STEP_LOG_FIELDS,
                    "step_log_id = " + this.stepLogId + " OR step_code = "
                            + literal(this.context, this.stepCode));
        if (record != null) {
            for (int i = 0; i < Constants.STEP_LOG_FIELDS.length; i++) {
                if (Constants.STEP_LOG_FIELDS[i].equals("step_type")) {
                    final Map<String, String> valueText = new HashMap<String, String>();
                    valueText.put("value", (String) record[i]);
                    valueText.put(
                        "text",
                        getEnumFieldDisplayedValue(this.context, Constants.STEP_LOG_TABLE,
                            Constants.STEP_LOG_FIELDS[i], (String) record[i]));
                    result.put(Constants.STEP_LOG_FIELDS[i], valueText);
                } else if (Constants.STEP_LOG_FIELDS[i].equals("step_status_result")) {
                    final Map<String, String> valueText = new HashMap<String, String>();
                    if (StringUtil.notNullOrEmpty(record[i])) {
                        valueText.put("value", (String) record[i]);
                        valueText.put(
                            "text",
                            getEnumFieldDisplayedValue(this.context, Constants.STEP_LOG_TABLE,
                                Constants.STEP_LOG_FIELDS[i], (String) record[i]));
                    } else {
                        valueText.put("value", this.stepStatusResult);
                        valueText.put(
                            "text",
                            getEnumFieldDisplayedValue(this.context, Constants.STEP_LOG_TABLE,
                                Constants.STEP_LOG_FIELDS[i], this.stepStatusResult));
                    }
                    result.put(Constants.STEP_LOG_FIELDS[i], valueText);
                } else if (Constants.STEP_LOG_FIELDS[i].equals("status")) {
                    final Map<String, String> valueText = new HashMap<String, String>();
                    valueText.put("value", (String) record[i]);
                    valueText.put(
                        "text",
                        getEnumFieldDisplayedValue(this.context, this.tableName,
                            Constants.STEP_LOG_FIELDS[i], (String) record[i]));
                    result.put(Constants.STEP_LOG_FIELDS[i], valueText);
                } else if (Constants.STEP_LOG_FIELDS[i].equals("condition")
                        && StringUtil.notNullOrEmpty(record[i])) {
                    final String[] tmp = ((String) record[i]).split(" ");
                    final String field = tmp[0].trim();
                    final String title =
                            com.archibus.eventhandler.EventHandlerBase
                                .getFieldMultiLineHeadingsAsString(this.context, this.tableName,
                                    field, " ");
                    result.put("condition", title + " " + tmp[1] + " " + tmp[2]);
                } else {
                    result.put(Constants.STEP_LOG_FIELDS[i], record[i]);
                }
            }
        }
        
        return result;
    }
    
    /**
     * Return restriction from values
     * 
     * @param values
     * @return
     */
    private String getRestrictionFromValues(final Map<String, Object> values) {
        final StringBuffer sb = new StringBuffer();
        
        if (values.containsKey("step_code")) {
            sb.append("step_code = " + literal(this.context, notNull(values.get("step_code"))));
        }
        
        return sb.toString();
    }
    
    /**
     * Get employee list from afm role
     * 
     * @param afmRole  afm role name
     * @return employee name list
     */
    public List<String> getEmployeesFromAfmRole(final String afmRole) {
        DataSource emDS = DataSourceFactory.createDataSource().addTable("em").addField("em_id");
        List<DataRecord> emRecords = emDS.getRecords("exists(select 1 from afm_users where em.email = afm_users.email and afm_users.role_name='"+afmRole+"')");
        
        List<String> emList = new ArrayList<String>();
        for(DataRecord emRecord : emRecords) {
            emList.add(emRecord.getString("em.em_id"));
        }
        
        return emList;
    }
}
