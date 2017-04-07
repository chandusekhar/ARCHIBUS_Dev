package com.archibus.eventhandler.compliance;

import java.util.*;

import org.json.*;

import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.JobBase;
import com.archibus.model.view.datasource.ClauseDef.Operation;
import com.archibus.model.view.datasource.ClauseDef.RelativeOperation;
import com.archibus.model.view.datasource.*;
import com.archibus.utility.StringUtil;

/**
 * Compliance Common Handler.
 * 
 * 
 * @author ASC-BJ:Zhang Yi
 */
public class ComplianceNotifyProcessor extends JobBase {
    
    /**
     * create Compliance Location for regulations or programs or compliance requirement.
     * 
     */
    private final DataSource regnotifyDs;
    
    /**
     * Constructor.
     * 
     */
    public ComplianceNotifyProcessor() {
        super();
        
        this.regnotifyDs = ComplianceUtility.getDataSourceRegNotify();
        
    }
    
    /**
     * Create Notification records.
     * 
     * @param eventId Event ID
     */
    public void createNotifications(final String eventId) {
        
        // get event by id
        final DataSource eventDs =
                DataSourceFactory.createDataSourceForFields(Constant.ACTIVITY_LOG, new String[] {
                        Constant.REGULATION, Constant.REG_PROGRAM, Constant.REG_REQUIREMENT });
        final DataRecord event = eventDs.getRecord("activity_log_id=" + eventId);
        
        // get program and regulation from event
        String program = "";
        String regulation = "";
        if (event != null) {
            program = event.getString(Constant.ACTIVITY_LOG_REG_PROGRAM);
            regulation = event.getString(Constant.ACTIVITY_LOG_REGULATION);
        }
        
        final DataSource notificationDs =
                DataSourceFactory.createDataSourceForFields(Constant.NOTIFICATIONS,
                    EventHandlerBase.getAllFieldNames(ContextStore.get().getEventHandlerContext(),
                        "notifications"));
        //
        final ParsedRestrictionDef restriction = new ParsedRestrictionDef();
        
        // Application-wide: (is_active=true AND reg_program IS NULL)
        // Notifications for the event’s requirement or Compliance Program of the event’s
        // requirement.
        // (is_active=true AND activity_log.regulation,reg_program
        // =regnotify.regulation,reg_program )
        restriction.addClause(Constant.REGNOTIFY, Constant.IS_ACTIVE, 1, Operation.EQUALS);
        restriction.addClause(Constant.REGNOTIFY, Constant.REG_PROGRAM, null, Operation.IS_NULL,
            RelativeOperation.AND_BRACKET);
        restriction.addClause(Constant.REGNOTIFY, Constant.REG_PROGRAM, program, Operation.EQUALS,
            RelativeOperation.OR);
        restriction
            .addClause(Constant.REGNOTIFY, Constant.REGULATION, regulation, Operation.EQUALS);
        // loop thorough all matched regnotify records
        final List<DataRecord> notifyList =
                ComplianceUtility.getDataSourceRegNotify().getRecords(restriction);
        for (final DataRecord record : notifyList) {
            
            createSingleNotification(eventId, notificationDs, record);
            
        }
    }
    
    /**
     * assign selected templates to activity defaults, programs, or requirements.
     * 
     * @param templates List of notification template ids
     * @param records list of records of requirement or programs
     * @param assignTo assignTo is ‘requirement? if pkey is a reg_requirement, ‘program? if pkey is
     *            a reg_program
     */
    public void createNotifyTemplateAssignments(final List<String> templates,
            final JSONArray records, final String assignTo) {
        
        for (int i = 0; i < records.length(); i++) {
            // for each JSON object represents a record from client side, need to remove useless
            // no-pk fields; this is partly for avoiding a core issue when convert a JSON to a
            // DataReocrd with un-null date value.
            final JSONObject record = records.getJSONObject(i);
            ComplianceUtility.clearUselessFields(record);
            
            if (Constant.REQUIREMENT.equalsIgnoreCase(assignTo)) {
                this.createRegNotifyRecords(templates, Constant.REGREQUIREMENT,
                    DataRecord.createRecordFromJSON(record));
                
            } else if (Constant.PROGRAM.equalsIgnoreCase(assignTo)) {
                
                this.createRegNotifyRecords(templates, Constant.REGPROGRAM,
                    DataRecord.createRecordFromJSON(record));
            }
            
        }
        
    }
    
    /**
     * create regnotify records.
     * 
     * @param selectedIdList List of selected template ids
     * @param assignTo assign to program or requirement
     * @param key key record
     */
    private void createRegNotifyRecords(final List<String> selectedIdList, final String assignTo,
            final DataRecord key) {
        String regulation;
        String program;
        String requirement = "";
        for (final String templateId : selectedIdList) {
            
            regulation = key.getString(assignTo + Constant.DOT + Constant.REGULATION);
            program = key.getString(assignTo + Constant.DOT + Constant.REG_PROGRAM);
            
            final ParsedRestrictionDef restriction = new ParsedRestrictionDef();
            
            restriction.addClause(Constant.REGNOTIFY, "template_id", templateId, Operation.EQUALS);
            restriction.addClause(Constant.REGNOTIFY, Constant.REGULATION, regulation,
                Operation.EQUALS);
            restriction.addClause(Constant.REGNOTIFY, Constant.REG_PROGRAM, program,
                Operation.EQUALS);
            
            if (assignTo.equalsIgnoreCase(Constant.REGREQUIREMENT)) {
                
                requirement = key.getString(assignTo + Constant.DOT + Constant.REG_REQUIREMENT);
                restriction.addClause(Constant.REGNOTIFY, Constant.REG_REQUIREMENT, requirement,
                    Operation.EQUALS, RelativeOperation.AND_BRACKET);
                
                // When assigning a requirement to a template, if the template is already assigned
                // to the requirement's program, do not assign it to the requirement
                restriction.addClause(Constant.REGNOTIFY, Constant.REG_REQUIREMENT, "",
                    Operation.IS_NULL, RelativeOperation.OR);
            } else if (assignTo.equalsIgnoreCase(Constant.REGPROGRAM)) {
                
                restriction.addClause(Constant.REGNOTIFY, Constant.REG_REQUIREMENT, "",
                    Operation.IS_NULL);
                
                // When assign a template to a program, remove from regnotify all current
                // assignments of the template to any of the program's requirements
                ComplianceSqlHelper.removeRequirementsAssignmentOfProgram(regulation, program,
                    templateId);
            }
            
            if (this.regnotifyDs.getRecords(restriction).isEmpty()) {
                final DataRecord record = this.regnotifyDs.createNewRecord();
                record.setValue(Constant.REGNOTIFY_TEMPLATE_ID, templateId);
                record
                    .setValue(Constant.REGNOTIFY + Constant.DOT + Constant.REGULATION, regulation);
                record.setValue(Constant.REGNOTIFY + Constant.DOT + Constant.REG_PROGRAM, program);
                
                if (assignTo.equalsIgnoreCase(Constant.REGREQUIREMENT)) {
                    record.setValue(Constant.REGNOTIFY + Constant.DOT + Constant.REG_REQUIREMENT,
                        requirement);
                }
                this.regnotifyDs.saveRecord(record);
            }
            
        }
    }
    
    /**
     * Create a single Notification record.
     * 
     * @param eventId Event ID
     * @param notificationDs notification datasource
     * @param record regnotify record
     */
    private void createSingleNotification(final String eventId, final DataSource notificationDs,
            final DataRecord record) {
        
        final String templateId = record.getString("regnotify.template_id");
        
        // if there isn’t already a record in notifications table with is_active=1 AND
        // template_id=regnotify.template_id
        // AND activity_log_id = eventid
        if (notificationDs.getRecord(" is_active=1 and activity_log_id=" + eventId
                + " and template_id='" + templateId + "' ") == null) {
            
            // Create new notifications table record
            final DataRecord notification = notificationDs.createNewRecord();
            notification.setValue("notifications.template_id", templateId);
            notification.setValue("notifications.activity_log_id", Integer.valueOf(eventId));
            notificationDs.saveRecord(notification);
        }
    }
    
    /**
     * append template ids related clauses.
     * 
     * @param selectedIds List of assigned template ids.
     * @param assignedIds List of selected template ids
     * @param deleteForNull string builder
     * 
     *            Justification: Case#2.3 : Statement with DELETE ... pattern.
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    private static void appendTemplateSqlClauses(final StringBuilder selectedIds,
            final StringBuilder assignedIds, final StringBuilder deleteForNull) {
        deleteForNull.append(" delete from regnotify where  1=1 ");
        if (assignedIds.length() > 2) {
            deleteForNull.append(" and template_id  in  ");
            deleteForNull.append(assignedIds.toString());
        }
        if (selectedIds.length() > 2) {
            
            deleteForNull.append(" and template_id not in  ");
            deleteForNull.append(selectedIds.toString());
        }
    }
    
    /**
     * Assigns selected templates to activity defaults, programs, or requirements.
     * 
     * @param templates List of notification template ids
     * @param assignTo String : assignTo is ‘requirement' if pkey is a reg_requirement; ‘program' if
     *            pkey is a reg_program; and NULL if pkey is NULL Activity Log ID
     * @param key key value
     */
    public void assignNotifyTemplates(final List<String> templates, final String assignTo,
            final Map<String, String> key) {
        
        final StringBuilder inSqlOfSelectedIds =
                ComplianceUtility.getStringBuilderFromList(templates);
        
        if (StringUtil.isNullOrEmpty(assignTo) || key.isEmpty()) {
            
            this.assignNotifyTemplatesForNull(templates, inSqlOfSelectedIds);
            
        } else if (Constant.REQUIREMENT.equalsIgnoreCase(assignTo)) {
            this.assignNotifyTemplatesForRequirement(templates, inSqlOfSelectedIds, key);
            
        } else if (Constant.PROGRAM.equalsIgnoreCase(assignTo)) {
            
            this.assignNotifyTemplatesForProgram(templates, inSqlOfSelectedIds, key);
            
        }
        
    }
    
    /**
     * assigns selected templates to null programs and requirements.
     * 
     * @param selectedIdList List of selected template ids
     * @param selectedIds String constructed string used for in clause.
     * 
     */
    public void assignNotifyTemplatesForNull(final List<String> selectedIdList,
            final StringBuilder selectedIds) {
        
        final ParsedRestrictionDef restriction = new ParsedRestrictionDef();
        restriction.addClause(Constant.REGNOTIFY, "reg_program", null, Operation.IS_NULL);
        
        final List<String> assignedIdList =
                ComplianceUtility.getSelectedTemplateIdsFromDB(this.regnotifyDs, restriction);
        final StringBuilder assignedIds =
                ComplianceUtility.getStringBuilderFromList(assignedIdList);
        
        if (selectedIds.length() > 2 || assignedIds.length() > 2) {
            final StringBuilder deleteForNull = new StringBuilder();
            appendTemplateSqlClauses(selectedIds, assignedIds, deleteForNull);
            
            // add restriction to only delete records in regnotify reg_program is null
            deleteForNull.append("  AND regnotify.reg_program IS NULL ");
            
            SqlUtils.executeUpdate(Constant.REGNOTIFY, deleteForNull.toString());
            
            createRegNotifyRecords(selectedIdList, assignedIdList, null);
        }
    }
    
    /**
     * assigns selected templates to program.
     * 
     * @param selectedIdList List of selected template ids
     * @param selectedIds String constructed string used for in clause.
     * @param key key value
     * 
     */
    public void assignNotifyTemplatesForProgram(final List<String> selectedIdList,
            final StringBuilder selectedIds, final Map<String, String> key) {
        
        final ParsedRestrictionDef restriction = new ParsedRestrictionDef();
        restriction.addClause(Constant.REGNOTIFY, Constant.REG_PROGRAM,
            key.get(Constant.REG_PROGRAM), Operation.EQUALS);
        restriction.addClause(Constant.REGNOTIFY, Constant.REGULATION,
            key.get(Constant.REGULATION), Operation.EQUALS);
        restriction.addClause(Constant.REGNOTIFY, Constant.REG_REQUIREMENT, "", Operation.IS_NULL);
        
        final List<String> assignedIdList =
                ComplianceUtility.getSelectedTemplateIdsFromDB(this.regnotifyDs, restriction);
        
        final StringBuilder assignedIds =
                ComplianceUtility.getStringBuilderFromList(assignedIdList);
        final StringBuilder deleteForNull = new StringBuilder();
        
        appendTemplateSqlClauses(selectedIds, assignedIds, deleteForNull);
        
        // add restriction to only delete records in regnotify where regulation;reg_program = pkey
        // and reg_requirement IS NULL
        deleteForNull.append(" AND regnotify.regulation='");
        deleteForNull.append(key.get(Constant.REGULATION));
        deleteForNull.append("' AND regnotify.reg_program='");
        deleteForNull.append(key.get(Constant.REG_PROGRAM));
        deleteForNull.append("' AND regnotify.reg_requirement IS NULL ");
        
        SqlUtils.executeUpdate(Constant.REGNOTIFY, deleteForNull.toString());
        
        // When assign a template to a program, remove from regnotify all current
        // assignments of the template to any of the program's requirements
        if (selectedIds.length() > 2) {
            ComplianceSqlHelper.removeRequirementsAssignmentOfProgram(key.get(Constant.REGULATION),
                key.get(Constant.REG_PROGRAM), selectedIds);
        }
        
        this.createRegNotifyRecords(selectedIdList, assignedIdList, key);
    }
    
    /**
     * assigns selected templates to requirement.
     * 
     * @param selectedIdList List of selected template ids
     * @param selectedIds String constructed string used for in clause.
     * @param key key value
     * 
     */
    public void assignNotifyTemplatesForRequirement(final List<String> selectedIdList,
            final StringBuilder selectedIds, final Map<String, String> key) {
        
        final ParsedRestrictionDef restriction = new ParsedRestrictionDef();
        restriction.addClause(Constant.REGNOTIFY, Constant.REG_PROGRAM,
            key.get(Constant.REG_PROGRAM), Operation.EQUALS);
        restriction.addClause(Constant.REGNOTIFY, Constant.REGULATION,
            key.get(Constant.REGULATION), Operation.EQUALS);
        restriction.addClause(Constant.REGNOTIFY, Constant.REG_REQUIREMENT,
            key.get(Constant.REG_REQUIREMENT), Operation.EQUALS);
        
        final List<String> assignedIdList =
                ComplianceUtility.getSelectedTemplateIdsFromDB(this.regnotifyDs, restriction);
        
        final StringBuilder assignedIds =
                ComplianceUtility.getStringBuilderFromList(assignedIdList);
        
        final StringBuilder deleteForNull = new StringBuilder();
        appendTemplateSqlClauses(selectedIds, assignedIds, deleteForNull);
        
        // add restriction to only delete records in regnotify where
        // regulation;reg_program;reg_requirement = pkey
        deleteForNull.append("  AND regnotify.regulation='");
        deleteForNull.append(key.get(Constant.REGULATION));
        deleteForNull.append("'  AND regnotify.reg_program='");
        deleteForNull.append(key.get(Constant.REG_PROGRAM));
        deleteForNull.append("' AND regnotify.reg_requirement='");
        deleteForNull.append(key.get(Constant.REG_REQUIREMENT));
        deleteForNull.append("'  ");
        
        SqlUtils.executeUpdate(Constant.REGNOTIFY, deleteForNull.toString());
        
        this.createRegNotifyRecords(selectedIdList, assignedIdList, key);
    }
    
    /**
     * create regnotify records.
     * 
     * @param selectedIdList List of selected template ids
     * @param assignedIdList List of already assigned template ids. * @param pkField key field name
     * @param pkValue key field value
     */
    private void createRegNotifyRecords(final List<String> selectedIdList,
            final List<String> assignedIdList, final Map<String, String> pkValue) {
        for (final String templateId : selectedIdList) {
            if (!assignedIdList.contains(templateId)) {
                final DataRecord record = this.regnotifyDs.createNewRecord();
                record.setValue(Constant.REGNOTIFY_TEMPLATE_ID, templateId);
                if (pkValue != null) {
                    for (final String fieldName : pkValue.keySet()) {
                        record.setValue(Constant.REGNOTIFY + Constant.DOT + fieldName,
                            pkValue.get(fieldName));
                        
                    }
                }
                this.regnotifyDs.saveRecord(record);
            }
        }
    }
}
