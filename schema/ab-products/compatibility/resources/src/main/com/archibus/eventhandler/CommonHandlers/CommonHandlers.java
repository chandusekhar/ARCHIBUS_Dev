package com.archibus.eventhandler.CommonHandlers;

import java.util.*;

import org.json.*;

import com.archibus.config.Version;
import com.archibus.context.ContextStore;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.*;
import com.archibus.security.*;
import com.archibus.utility.*;

/**
 * This event handler implements Common Workflow Rules Copyright (c) 2005, ARCHIBUS, Inc.
 * 
 * @author Antoni Ansarov
 * @created August 1, 2005
 * @version 1.0
 */
public class CommonHandlers extends EventHandlerBase {
    /**
     * Constants for context keys specific to this class.
     */
    
    /**
     * Description of the Field
     */
    public final static String KEY_SQL_QUERY = "sqlQuery";
    
    /**
     * Description of the Field
     */
    public final static String KEY_UPDATED_RECORDS_REQUIRED = "updatedRecordsRequired";
    
    // //////////////////////////////////////////////////////////////////////////////////////////
    // ////////////////// EMAIL SUPPORT METHODS ////////////////////////////////////////////////
    // //////////////////////////////////////////////////////////////////////////////////////////
    
    /**
     * Sends email message to recipent(s) specified by SQL query. The query must return 0 or more
     * rows, each containing email address as a first column. Only the first column is used.
     * 
     * @param context Workflow rule execution context.
     * @exception ExceptionBase If message could not be sent or email address(es) could not
     *                retrieved.
     */
    public void notify(final EventHandlerContext context) {
        // from: administrator's email address and host
        final String from = getEmailFrom(context);
        final String host = getEmailHost(context);
        final String port = getEmailPort(context);
        
        final String activityId = context.getString("activityId", null);
        
        String notifySubject = (String) context.getParameter("notifySubject");
        notifySubject = expandParameters(context, notifySubject);
        
        String notifyBody = (String) context.getParameter("notifyBody");
        notifyBody = expandParameters(context, notifyBody);
        
        String notifyEmailAddress = "";
        if (context.parameterExists("notifyEmailAddress")) {
            notifyEmailAddress = (String) context.getParameter("notifyEmailAddress");
        }
        
        notifyEmailAddress = expandParameters(context, notifyEmailAddress);
        
        String notifyEmailAddressSqlQuery = "";
        if (context.parameterExists("notifyEmailAddressSqlQuery")) {
            notifyEmailAddressSqlQuery =
                    (String) context.getParameter("notifyEmailAddressSqlQuery");
        }
        
        if (StringUtil.notNullOrEmpty(notifyEmailAddressSqlQuery)) {
            notifyEmailAddressSqlQuery = expandParameters(context, notifyEmailAddressSqlQuery);
        }
        
        String notifyCcEmailAddress = "";
        if (context.parameterExists("notifyCcEmailAddress")) {
            notifyCcEmailAddress = (String) context.getParameter("notifyCcEmailAddress");
        }
        notifyCcEmailAddress = expandParameters(context, notifyCcEmailAddress);
        
        String notifyBccEmailAddress = "";
        if (context.parameterExists("notifyBccEmailAddress")) {
            notifyBccEmailAddress = (String) context.getParameter("notifyBccEmailAddress");
        }
        notifyBccEmailAddress = expandParameters(context, notifyBccEmailAddress);
        
        ArrayList notifyCcEmailAddresses = null;
        if (StringUtil.notNull(notifyCcEmailAddress).length() > 0) {
            notifyCcEmailAddresses = new ArrayList();
            notifyCcEmailAddresses.add(notifyCcEmailAddress);
        }
        
        ArrayList notifyBccEmailAddresses = null;
        if (StringUtil.notNull(notifyBccEmailAddress).length() > 0) {
            notifyBccEmailAddresses = new ArrayList();
            notifyBccEmailAddresses.add(notifyBccEmailAddress);
        }
        
        if (StringUtil.notNullOrEmpty(notifyEmailAddress)) {
            // use supplied email address
            sendEmail(notifyBody, from, host, port, notifySubject, notifyEmailAddress,
                notifyCcEmailAddresses, notifyBccEmailAddresses, null, null, null, null, activityId);
            
        } else if (StringUtil.notNullOrEmpty(notifyEmailAddressSqlQuery)) {
            // retrieve the list of recipoents from the database
            final List rows = selectDbRecords(context, notifyEmailAddressSqlQuery);
            for (int i = 0; i < rows.size(); i++) {
                final Object[] values = (Object[]) rows.get(i);
                final String email = (String) values[0];
                sendEmail(notifyBody, from, host, port, notifySubject, email,
                    notifyCcEmailAddresses, notifyBccEmailAddresses, null, null, null, null,
                    activityId);
            }
        } else {
            // @non-translatable
            throw new ExceptionBase(
                "notify: either notifyEmailAddress or notifyEmailAddressSqlQuery input parameter must be specified");
        }
    }
    
    /**
     * Use this rule to send email to a user that is in one of the ARCHIBUS identity tables: A/FM
     * User (afm_users), Employee or Contractor (em), Craftsperson (cf), Contacts (contacts), or
     * Vendor (vn). The rule will look up the email address from the system given the identity table
     * name and primary key.
     * 
     * @param context Description of the Parameter
     * @param response Description of the Parameter
     * @exception ExceptionBase Description of the Exception
     */
    public void notifyUsingArchibusIdentity(final EventHandlerContext context) {
        
        /*
         * Operates the same as the Notify rule, except that you do not specify an email address but
         * rather an identity table and a pkey value. The handler uses that pkey to lookup the email
         * address.
         */
        final String activityId = context.getString("activityId", null);
        
        String notifyId = (String) context.getParameter("notifyId");
        notifyId = expandParameters(context, notifyId);
        
        String notifyIdentityTable = (String) context.getParameter("notifyIdentityTable");
        notifyIdentityTable = expandParameters(context, notifyIdentityTable);
        
        String notifySubject = (String) context.getParameter("notifySubject");
        notifySubject = expandParameters(context, notifySubject);
        
        String notifyBody = (String) context.getParameter("notifyBody");
        notifyBody = expandParameters(context, notifyBody);
        
        String recipient = "";
        if (notifyIdentityTable.equalsIgnoreCase("cf")) {
            recipient = getEmailAddress(context, "em", "em_id", notifyId);
            
            if (StringUtil.notNull(recipient).length() == 0) {
                recipient = getEmailAddress(context, "vendor", "vendor_id", notifyId);
            }
            
            if (StringUtil.notNull(recipient).length() == 0) {
                recipient = getEmailAddress(context, "afm_users", "user_name", notifyId);
            }
            
        } else if (notifyIdentityTable.equalsIgnoreCase("em")) {
            recipient = getEmailAddress(context, notifyIdentityTable, "em_id", notifyId);
        } else if (notifyIdentityTable.equalsIgnoreCase("contact")) {
            recipient = getEmailAddress(context, notifyIdentityTable, "contact_id", notifyId);
        } else if (notifyIdentityTable.equalsIgnoreCase("visitors")) {
            recipient = getEmailAddress(context, notifyIdentityTable, "visitor_id", notifyId);
        } else if (notifyIdentityTable.equalsIgnoreCase("afm_users")) {
            recipient = getEmailAddress(context, notifyIdentityTable, "user_name", notifyId);
        } else if (notifyIdentityTable.equalsIgnoreCase("vn")) {
            recipient = getEmailAddress(context, notifyIdentityTable, "vn_id", notifyId);
        }
        
        // from: administrator's email address and host
        final String from = getEmailFrom(context);
        final String host = getEmailHost(context);
        final String port = getEmailPort(context);
        final String userId = getEmailUserId(context);
        final String password = getEmailPassword(context);
        
        sendEmail(notifyBody, from, host, port, notifySubject, recipient, null, null, userId,
            password, null, null, activityId);
    }
    
    /**
     * Use this rule when you need to perform a database update that is not an update, delete, or
     * insert from an edit form.
     * 
     * @param context Description of the Parameter
     * @param response Description of the Parameter
     * @exception ExceptionBase Description of the Exception
     */
    public void executeSQL(final EventHandlerContext context) {
        final boolean updatedRecordsRequired =
                StringUtil.toBoolean(context.getParameter(KEY_UPDATED_RECORDS_REQUIRED));
        
        String sqlQuery = null;
        
        // if Oracle
        if (isOracle(context) && context.parameterExists("sqlQueryOracle")) {
            // get SQL from the context
            sqlQuery = (String) context.getParameter("sqlQueryOracle");
        }
        
        // get SQL from the context
        if (context.parameterExists(KEY_SQL_QUERY)) {
            sqlQuery = (String) context.getParameter(KEY_SQL_QUERY);
        }
        
        // expand #Parameter and #SqlParameter macros.
        sqlQuery = expandParameters(context, sqlQuery);
        
        if (this.log.isDebugEnabled()) {
            this.log.debug("SQL=[" + sqlQuery + "]");
        }
        
        executeDbSql(context, sqlQuery, updatedRecordsRequired);
    }
    
    /**
     * Use this rule to combine other rules to be handled in sequence. For instance, suppose you
     * have one workflow rule that save a record and sets a status. You have another rule that
     * notifies the requestor that the request has been received. This rule can pull the inputs
     * needed for both of t hese rules and then chain them together.
     * 
     * @param context Description of the Parameter
     * @param response Description of the Parameter
     * @exception ExceptionBase Description of the Exception
     */
    public void chainRule(final EventHandlerContext context) {
        final WorkflowRulesContainer.Immutable container = getWorkflowRulesContainer(context);
        
        final String ASYNC_POSTFIX = "-Asynchronous";
        
        boolean found = true;
        int i = 1;
        while (found) {
            final String ruleKey = "chainedRule" + Integer.toString(i);
            
            if (context.parameterExists(ruleKey)) {
                String ruleName = (String) context.getParameter(ruleKey);
                
                boolean asynchronous = false;
                if (notNull(ruleName).indexOf(ASYNC_POSTFIX) != -1) {
                    asynchronous = true;
                    
                    // remove async postix from the rule name
                    ruleName = ruleName.substring(0, ruleName.indexOf(ASYNC_POSTFIX));
                }
                
                final EventHandlerContext chainedRuleContext =
                        getContextForChainedRule(context, ruleKey);
                
                container.runRule(ruleName, chainedRuleContext, asynchronous);
                
            } else {
                found = false;
            }
            
            i++;
        }
    }
    
    /**
     * Use this event handler when you want to execute a regular AddNew or Save action from an edit
     * form, but you also additionally want to: Update a status value. For instance, you want to
     * save a set of values from a Request form, but change the wr.status from �Created � Not
     * Submitted� to �Requested�. Update a default value. For instance, you have an edit form that
     * shows only Document Template records. You want the Add New button to save any new record the
     * user enters, but to also set �afm_docs.is_template to 1� so that the new record will always
     * have the right template categorization and will always appear in the view when it is
     * refreshed.
     * 
     * @param context Description of the Parameter
     * @param response Description of the Parameter
     * @exception ExceptionBase Description of the Exception
     */
    public void saveRecordOverridingValues(final EventHandlerContext context) {
        
        /*
         * tableNameToUpdate � Table name to update namesOfFieldsToUpdate � Semi-colon delimited
         * list of fields to update valuesOfFieldsToUpdate � Semi-colon delimited list of values to
         * update typesOfFieldsToUpdate � Semi-colon delimited list of field types
         */
        
        final String tableNameToUpdate = (String) context.getParameter("tableNameToOverride");
        final String namesOfFieldsToUpdate =
                (String) context.getParameter("namesOfFieldsToOverride");
        
        String valuesOfFieldsToUpdate = (String) context.getParameter("valuesOfFieldsToOverride");
        // Expand macros .
        valuesOfFieldsToUpdate = expandParameters(context, valuesOfFieldsToUpdate);
        
        final String typesOfFieldsToUpdate =
                (String) context.getParameter("typesOfFieldsToOverride");
        
        final Map fieldValues = new HashMap(context.getParameters("fields"));
        
        // Handle setting multiple values with semi-colon delimited field and value lists
        final StringTokenizer fields = new StringTokenizer(namesOfFieldsToUpdate, ";");
        final StringTokenizer values = new StringTokenizer(valuesOfFieldsToUpdate, ";");
        final StringTokenizer types = new StringTokenizer(typesOfFieldsToUpdate, ";");
        
        // Currently it's not an error if one list is longer than the rest
        while (fields.hasMoreTokens() && values.hasMoreTokens() && types.hasMoreTokens()) {
            final String fieldName = fields.nextToken();
            final String fieldVal = values.nextToken();
            final String fieldType = types.nextToken();
            
            final Object fieldValueObject =
                    parseFieldValue(context, fieldVal, fieldType, fieldName);
            if (fieldValueObject != null) {
                fieldValues.put(tableNameToUpdate + "." + fieldName, fieldValueObject);
            }
        }
        
        if (this.log.isDebugEnabled()) {
            this.log.debug("Table=[" + tableNameToUpdate + "], values=[" + fieldValues + "]");
        }
        
        // Strip the �table.� Prefix from the elements in the map so the result will be
        // able to be passed to executeDbSave().
        final Map valuesStripped = stripPrefix(fieldValues);
        
        executeDbSave(context, tableNameToUpdate, valuesStripped);
    }
    
    /**
     * Returns information about the currently logged in user.
     * 
     * @param context
     */
    public void getUserInfo(final EventHandlerContext context) {
        final JSONObject userInfo = new JSONObject();
        
        final UserAccount.Immutable userAccount = getUserAccount(context);
        final UserRole.Immutable userRole = getUserRole(context);
        
        userInfo.put("user_name", userAccount.getAttribute("/*/preferences/@user_name"));
        userInfo.put("role_name", userRole.getName());
        userInfo.put("email", userAccount.getAttribute("/*/preferences/@email"));
        userInfo.put("locale", userAccount.getAttribute("/*/preferences/@locale"));
        
        userInfo.put("colorScheme", userAccount.getColorScheme());
        userInfo.put("projectName", ContextStore.get().getProject().getName());
        userInfo.put("serverVersion", new Version().getVersion());
        userInfo.put("languageExtension",
            userAccount.getAttribute("/*/preferences/userAccount/@dbExtension"));
        
        final JSONArray groups = new JSONArray();
        for (final String group : userRole.getGroups()) {
            groups.put(group);
        }
        userInfo.put("groups", groups);
        
        final JSONObject employeeInfo = new JSONObject();
        employeeInfo.put("em_id", userAccount.getAttribute("/*/preferences/@em_em_id"));
        employeeInfo.put("em_number", userAccount.getAttribute("/*/preferences/@em_em_number"));
        employeeInfo.put("phone", userAccount.getAttribute("/*/preferences/@em_phone"));
        employeeInfo.put("bl_id", userAccount.getAttribute("/*/preferences/@em_bl_id"));
        employeeInfo.put("fl_id", userAccount.getAttribute("/*/preferences/@em_fl_id"));
        employeeInfo.put("rm_id", userAccount.getAttribute("/*/preferences/@em_rm_id"));
        employeeInfo.put("dv_id", userAccount.getAttribute("/*/preferences/@em_dv_id"));
        employeeInfo.put("dp_id", userAccount.getAttribute("/*/preferences/@em_dp_id"));
        userInfo.put("Employee", employeeInfo);
        
        final JSONObject buildingInfo = new JSONObject();
        buildingInfo.put("site_id", userAccount.getAttribute("/*/preferences/@em_site_id"));
        buildingInfo.put("ctry_id", userAccount.getAttribute("/*/preferences/@em_ctry_id"));
        employeeInfo.put("Building", buildingInfo);
        
        context.addResponseParameter("jsonExpression", userInfo.toString());
    }
    
}
