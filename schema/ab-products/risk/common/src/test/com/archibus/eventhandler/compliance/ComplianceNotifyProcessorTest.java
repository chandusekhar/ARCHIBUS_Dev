package com.archibus.eventhandler.compliance;

import java.util.*;

import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.model.view.datasource.ClauseDef.Operation;
import com.archibus.model.view.datasource.*;

/**
 * Provides TODO. Define test class for ComplianceCommonHandler class. - if it has behavior
 * 
 * @since 20.1
 * 
 */
public class ComplianceNotifyProcessorTest extends DataSourceTestBase {
    
    /**
     * Define String MESSAGETITLE1.
     */
    private static final String MESSAGETITLE1 = "messagetitle1";
    
    /**
     * Define String MESSAGETITLE1.
     */
    private static final String MESSAGEBODY1 = "messagebody1";
    
    /**
     * Define String MESSAGEBODY1.
     */
    private static final String SUBJECT_LINE = "Subject Line";
    
    /**
     * Define String SUBJECT_LINE.
     */
    private static final String MESSAGE_BODY = "Message Body";
    
    /**
     * Define String MESSAGE_BODY.
     */
    private static final String MESSAGES_REFERENCED_BY = "messages.referenced_by";
    
    /**
     * Define String MESSAGES_REFERENCED_BY.
     */
    private static final String MESSAGES_CODE = "messages.message_id";
    
    /**
     * Define String MESSAGES_CODE.
     */
    private static final String MESSAGES_DESCRIPTION = "messages.description";
    
    /**
     * Define String MESSAGES_DESCRIPTION.
     */
    private static final String MESSAGES_MESSAGE_TEXT = "messages.message_text";
    
    /**
     * Define String MESSAGES_MESSAGE_TEXT.
     */
    private static final String NOTIFY_TEMPLATES_NOTIFY_TEMPLATE_ID =
            "notify_templates.template_id";
    
    /**
     * Define String NOTIFY_TEMPLATES_NOTIFY_TEMPLATE_ID.
     */
    private static final String NOTIFY_TEMPLATES_NOTIFY_SUBJECT_ID =
            "notify_templates.notify_subject_id";
    
    /**
     * Define String NOTIFY_TEMPLATES_NOTIFY_SUBJECT_ID.
     */
    private static final String NOTIFY_TEMPLATES_NOTIFY_MESSAGE_ID =
            "notify_templates.notify_message_id";
    
    /**
     * Define String NOTIFY_TEMPLATES_NOTIFY_MESSAGE_ID.
     */
    private static final String NOTIFY_TEMPLATES_NOTIFY_RECIPIENTS_ID =
            "notify_templates.notify_recipients";
    
    /**
     * Define String NOTIFY_TEMPLATES_NOTIFY_RECIPIENTS_ID.
     */
    private static final String TEMPLATE1 = "TEMPLATE1";
    
    /**
     * Define String NOTIFY_TEMPLATES_NOTIFY_RECIPIENTS_ID.
     */
    private static final String TEMPLATE2 = "TEMPLATE2";
    
    /**
     * Define String messageTitle.
     */
    private static String messageTitle = "";
    
    /**
     * Define String messageTitle.
     */
    private static String messageBody = "";
    
    /**
     * Define String messageTitle.
     */
    private static final int nine = 9;
    
    /**
     * Define String ersanwuwu.
     */
    private static final int ersanwuwu = 2355;
    
    /**
     * Define String NPDES_PERMIT.
     */
    private static final String NPDES_PERMIT = "NPDES PERMIT";
    
    /**
     * Define String NPDES_Permits.
     */
    private static final String NPDES_PERMITS = "NPDES Permits";
    
    /**
     * Define String REG_PROGRAM.
     */
    private static final String REG_PROGRAM = "reg_program";
    
    /**
     * Define String REGULATION.
     */
    private static final String REGULATION = "regulation";
    
    /**
     * Define String REG_REQUIREMENT.
     */
    private static final String REG_REQUIREMENT = "reg_requirement";
    
    /**
     * Define String INSTALLATION_PERMIT.
     */
    private static final String INSTALLATION_PERMIT = "INSTALLATION PERMIT";
    
    /**
     * Define String CHK_INSTRUMENT_CALIBRATIONS.
     */
    private static final String CHK_INSTRUMENT_CALIBRATIONS = "CHK INSTRUMENT CALIBRATIONS";
    
    /**
     * Define String CAA.
     */
    private static final String CAA = "CAA";
    
    /**
     * Define String EVENT_ID.
     */
    private static final String EVENT_ID = "event_id";
    
    /**
     * Define String TITLE.
     */
    private static final String TITLE = "title";
    
    /**
     * Define String BODY.
     */
    private static final String BODY = "body";
    
    /**
     * Compliance Management Common Handler Class.
     * 
     */
    public static void testCreateNotifications() {
        
        final int eventId = createEventRecordForRequirement();
        
        messageTitle = createMessage(TITLE);
        messageBody = createMessage(BODY);
        createNotifyTemplate(messageTitle, messageBody, TEMPLATE1);
        new ComplianceNotifyProcessor().createNotifications(String.valueOf(eventId));
        
        final DataSource notificationDs =
                DataSourceFactory.createDataSourceForFields(Constant.NOTIFICATIONS,
                    EventHandlerBase.getAllFieldNames(ContextStore.get().getEventHandlerContext(),
                        "notifications"));
        
        final ParsedRestrictionDef restriction = new ParsedRestrictionDef();
        restriction.addClause(Constant.NOTIFICATIONS, EVENT_ID, eventId, Operation.EQUALS);
        
        final List<DataRecord> records = notificationDs.getRecords(restriction);
        // @translatable
        final String message1 = "Create Notifications Success";
        
        // @translatable
        final String message2 = "Create Notifications Fail";
        if (!records.isEmpty()) {
            
            System.out.print(message1);
        } else {
            System.out.print(message2);
        }
        
    }
    
    /**
     * 
     * Create EventRecord For Requirement.
     * 
     * @return activity Log Id
     */
    private static int createEventRecordForRequirement() {
        final DataSource activityLogDs = ComplianceUtility.getDataSourceEvent();
        
        final DataRecord event = activityLogDs.getRecord();
        event.setValue("activity_log.regulation", CAA);
        event.setValue("activity_log.reg_program", INSTALLATION_PERMIT);
        event.setValue("activity_log.reg_requirement", CHK_INSTRUMENT_CALIBRATIONS);
        
        activityLogDs.saveRecord(event);
        final int activityLogId =
                activityLogDs.getRecord().getInt(Constant.ACTIVITY_LOG_ACTIVITY_LOG_ID);
        return activityLogId;
    }
    
    /**
     * 
     * create Message record of messages table.
     * 
     * @param type title or body
     * @return messages record.
     */
    private static String createMessage(final String type) {
        final DataSource messageDs = ComplianceUtility.getMessagesDs();
        final DataRecord messageRecord = messageDs.createNewRecord();
        String message = "";
        messageRecord.setValue("messages.activity_id", "AbRiskCompliance");
        
        if (TITLE.equals(type)) {
            
            messageRecord.setValue(MESSAGES_REFERENCED_BY, SUBJECT_LINE);
            messageRecord.setValue(MESSAGES_CODE, MESSAGETITLE1);
            messageRecord.setValue(MESSAGES_REFERENCED_BY, MESSAGETITLE1);
            messageRecord.setValue(MESSAGES_DESCRIPTION, MESSAGETITLE1);
            messageRecord.setValue(MESSAGES_MESSAGE_TEXT, MESSAGETITLE1);
            message = MESSAGETITLE1;
        } else {
            
            messageRecord.setValue(MESSAGES_REFERENCED_BY, MESSAGE_BODY);
            messageRecord.setValue(MESSAGES_CODE, MESSAGEBODY1);
            messageRecord.setValue(MESSAGES_REFERENCED_BY, MESSAGEBODY1);
            messageRecord.setValue(MESSAGES_DESCRIPTION, MESSAGEBODY1);
            messageRecord.setValue(MESSAGES_MESSAGE_TEXT, MESSAGEBODY1);
            message = MESSAGEBODY1;
        }
        
        messageDs.saveRecord(messageRecord);
        
        return message;
    }
    
    /**
     * Create notify template.
     * 
     * @param messageTitle for title record
     * @param messageBody for body record
     */
    private static void createNotifyTemplate(final String messageTitle, final String messageBody,
            final String template) {
        final DataSource notifyTemplate = ComplianceUtility.getNotifyTemplatesDs();
        final DataRecord notifyTemplateRecord = notifyTemplate.createNewRecord();
        notifyTemplateRecord.setValue(NOTIFY_TEMPLATES_NOTIFY_TEMPLATE_ID, template);
        notifyTemplateRecord.setValue(NOTIFY_TEMPLATES_NOTIFY_SUBJECT_ID, messageTitle);
        notifyTemplateRecord.setValue(NOTIFY_TEMPLATES_NOTIFY_MESSAGE_ID, messageBody);
        notifyTemplateRecord.setValue(NOTIFY_TEMPLATES_NOTIFY_RECIPIENTS_ID, "abbot@tgd.com;");
    }
    
    /**
     * 
     * Test AssignNotifyTemplatesForNull method.
     */
    public final void testAssignNotifyTemplatesForNull() {
        
        createNotifyTemplate(messageTitle, messageBody, TEMPLATE2);
        
        final java.util.List<String> templates = new ArrayList<String>();
        templates.add(TEMPLATE2);
        
        final StringBuilder inSqlOfSelectedIds =
                ComplianceUtility.getStringBuilderFromList(templates);
        
        final ComplianceNotifyProcessor c = new ComplianceNotifyProcessor();
        
        c.assignNotifyTemplatesForNull(templates, inSqlOfSelectedIds);
        
        final ParsedRestrictionDef restriction = new ParsedRestrictionDef();
        
        restriction.addClause(Constant.REGNOTIFY, REG_PROGRAM, null, Operation.IS_NULL);
        
        final DataSource regNotifyDs = ComplianceUtility.getDataSourceRegNotify();
        
        final List<DataRecord> records = regNotifyDs.getRecords(restriction);
        
        // @translatable
        final String message1 = "Assign Notify Template Success";
        
        // @translatable
        final String message2 = "Assign Notify Template  Fail";
        
        if (!records.isEmpty()) {
            
            System.out.print(message1);
        } else {
            System.out.print(message2);
        }
        
    }
    
    /**
     * Test AssignNotifyTemplatesForProgram method.
     */
    public final void testAssignNotifyTemplatesForProgram() {
        
        final java.util.List<String> templates = new ArrayList<String>();
        templates.add(TEMPLATE1);
        
        final StringBuilder inSqlOfSelectedIds =
                ComplianceUtility.getStringBuilderFromList(templates);
        
        final Map<String, String> key = new HashMap<String, String>();
        key.put(REG_PROGRAM, NPDES_PERMIT);
        key.put(REGULATION, NPDES_PERMITS);
        
        final ComplianceNotifyProcessor c = new ComplianceNotifyProcessor();
        
        c.assignNotifyTemplatesForProgram(templates, inSqlOfSelectedIds, key);
        
        final ParsedRestrictionDef restriction = new ParsedRestrictionDef();
        
        restriction.addClause(Constant.REGNOTIFY, REG_PROGRAM, NPDES_PERMIT, Operation.EQUALS);
        restriction.addClause(Constant.REGNOTIFY, REGULATION, NPDES_PERMITS, Operation.EQUALS);
        
        final DataSource regNotifyDs = ComplianceUtility.getDataSourceRegNotify();
        
        final List<DataRecord> records = regNotifyDs.getRecords(restriction);
        
        // @translatable
        final String message1 = "Assign Notify Templates Success";
        
        // @translatable
        final String message2 = "Assign Notify Templates Fail";
        
        if (!records.isEmpty()) {
            
            System.out.print(message1);
        } else {
            System.out.print(message2);
        }
        
    }
    
    /**
     * Test AssignNotifyTemplatesForRequirement method.
     */
    public final void testAssignNotifyTemplatesForRequirement() {
        
        final java.util.List<String> templates = new ArrayList<String>();
        templates.add(TEMPLATE1);
        
        final StringBuilder inSqlOfSelectedIds =
                ComplianceUtility.getStringBuilderFromList(templates);
        
        final Map<String, String> key = new HashMap<String, String>();
        key.put(REG_REQUIREMENT, CHK_INSTRUMENT_CALIBRATIONS);
        key.put(REG_PROGRAM, INSTALLATION_PERMIT);
        key.put(REGULATION, CAA);
        
        final ComplianceNotifyProcessor c = new ComplianceNotifyProcessor();
        c.assignNotifyTemplatesForRequirement(templates, inSqlOfSelectedIds, key);
        
        final ParsedRestrictionDef restriction = new ParsedRestrictionDef();
        restriction.addClause(Constant.REGNOTIFY, REG_REQUIREMENT, CHK_INSTRUMENT_CALIBRATIONS,
            Operation.EQUALS);
        restriction.addClause(Constant.REGNOTIFY, REG_PROGRAM, INSTALLATION_PERMIT,
            Operation.EQUALS);
        restriction.addClause(Constant.REGNOTIFY, REGULATION, CAA, Operation.EQUALS);
        
        final DataSource regNotifyDs = ComplianceUtility.getDataSourceRegNotify();
        final List<DataRecord> records = regNotifyDs.getRecords(restriction);
        
        // @translatable
        final String message1 = "Save Notifications Success";
        
        // @translatable
        final String message2 = "Save Fail";
        
        if (!records.isEmpty()) {
            
            System.out.print(message1);
        } else {
            System.out.print(message2);
        }
    }
    
}
