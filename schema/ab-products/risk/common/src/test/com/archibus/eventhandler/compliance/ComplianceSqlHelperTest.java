package com.archibus.eventhandler.compliance;

import java.util.*;

import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.eventhandler.EventHandlerBase;

/**
 * 
 * ComplianceSqlHelper test class .
 * <p>
 * 
 * @since 20.3
 */
public class ComplianceSqlHelperTest extends DataSourceTestBase {
    
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
     * Define String messageTitle.
     */
    private static String messageTitle = "";
    
    /**
     * Define String messageTitle.
     */
    private static String messageBody = "";
    
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
     * Define String TITLE.
     */
    private static final String TITLE = "title";
    
    /**
     * Define String BODY.
     */
    private static final String BODY = "body";
    
    /**
     * Define String message1.
     */
    // @translatable
    private static String message1 = "Success";
    
    /**
     * Define String message2.
     */
    // @translatable
    private static String message2 = "Fail";
    
    /**
     * Define String equals2355.
     */
    private static String equals2355 = " = 2355";
    
    /**
     * Define String equals.
     */
    private static String equals = "=";
    
    /**
     * Define StringBuilder inSqlOfSelectedIds.
     */
    private static StringBuilder inSqlOfSelectedIds = new StringBuilder();
    
    /**
     * Define number 192.
     */
    private final static int Number192 = 192;
    
    /**
     * Define String IS_NOT_NULL.
     */
    private final static String IS_NOT_NULL = " is not null";
    
    /**
     * Difine String AND.
     */
    private final static String AND = " and ";
    
    /**
     * 
     * Test cleanUpLocations method of ComplianceSqlHelper class .
     */
    public static void testCleanUpLocations() {
        
        ComplianceSqlHelper.cleanUpLocations();
        
        final StringBuilder sql = new StringBuilder();
        sql.append(" SELECT * FROM compliance_locations WHERE ");
        sql.append(" NOT EXISTS (select 1 from activity_log ");
        sql.append("    WHERE activity_log.location_id=compliance_locations.location_id )");
        sql.append(" AND NOT EXISTS (select 1 from regloc ");
        sql.append("    WHERE regloc.location_id=compliance_locations.location_id )");
        sql.append(" AND NOT EXISTS (select 1 from regviolation ");
        sql.append("    WHERE regviolation.location_id=compliance_locations.location_id )");
        sql.append(" AND NOT EXISTS (select 1 from docs_assigned ");
        sql.append("    WHERE docs_assigned.location_id=compliance_locations.location_id )");
        sql.append(" AND NOT EXISTS (select 1 from ls_comm ");
        sql.append("    WHERE ls_comm.location_id=compliance_locations.location_id )");
        final String[] flds = new String[] { " location_id" };
        final List<DataRecord> records =
                SqlUtils.executeQuery(Constant.COMPLIANCE_LOCATIONS, flds, sql.toString());
        
        decideIfSuccess(records, message1, message2);
        
    }
    
    /**
     * Test deleteEvents method of class ComplianceSqlHelper.
     */
    public static void testDeleteEvents() {
        
        ComplianceSqlHelper.deleteEvents(Constant.ACTIVITY_LOG_ACTIVITY_LOG_ID + equals2355);
        final List<DataRecord> records =
                ComplianceUtility.getDataSourceEvent().getRecords(
                    Constant.ACTIVITY_LOG_ACTIVITY_LOG_ID + equals2355);
        
        decideIfSuccess(records, message1, message2);
    }
    
    /**
     * Test deleteNotifications method of class ComplianceSqlHelper.
     */
    public static void testDeleteNotifications() {
        final int eventId = createNotifications();
        ComplianceSqlHelper.deleteNotifications(Constant.ACTIVITY_LOG_ACTIVITY_LOG_ID + equals
                + eventId);
        
        final DataSource notificationDs =
                DataSourceFactory.createDataSourceForFields(Constant.NOTIFICATIONS,
                    EventHandlerBase.getAllFieldNames(ContextStore.get().getEventHandlerContext(),
                        Constant.NOTIFICATIONS));
        final List<DataRecord> records =
                notificationDs.getRecords(Constant.NOTIFICATIONS + Constant.DOT
                        + Constant.ACTIVITY_LOG_ID + equals + eventId);
        
        decideIfSuccess(records, message1, message2);
    }
    
    /**
     * Test deleteNotificationsByEvent method of class ComplianceSqlHelper.
     */
    public static void testDeleteNotificationsByEvent() {
        final int eventId = createNotifications();
        ComplianceSqlHelper.deleteNotificationsByEvent(String.valueOf(eventId));
        
        final DataSource notificationDs =
                DataSourceFactory.createDataSourceForFields(Constant.NOTIFICATIONS,
                    EventHandlerBase.getAllFieldNames(ContextStore.get().getEventHandlerContext(),
                        Constant.NOTIFICATIONS));
        final List<DataRecord> records =
                notificationDs.getRecords(Constant.NOTIFICATIONS + Constant.DOT
                        + Constant.ACTIVITY_LOG_ID + equals + eventId);
        
        decideIfSuccess(records, message1, message2);
    }
    
    /**
     * Test deleteReglocs method of class ComplianceSqlHelper.
     * 
     * @restriction test delete regloc by the restriction .
     */
    public static void testDeleteReglocs(final String restriction) {
        ComplianceSqlHelper.deleteReglocs(Constant.REGLOC + Constant.DOT + Constant.LOCATION_ID
                + IS_NOT_NULL);
        final DataSource recordDS = ComplianceUtility.getDataSourceRegloc();
        final List<DataRecord> records = recordDS.getRecords();
        decideIfSuccess(records, message1, message2);
    }
    
    /**
     * Test getMaxMatchedCompliancelocId method of class ComplianceSqlHelper.
     * 
     * @param restriction.
     */
    public static void testGetMaxMatchedCompliancelocId(final String restriction) {
        final int locationId =
                ComplianceSqlHelper.getMaxMatchedCompliancelocId(Constant.COMPLIANCE_LOCATIONS
                        + Constant.DOT + Constant.LOCATION_ID + equals + Number192);
        if (Number192 == locationId) {
            System.out.print(message1);
        } else {
            System.out.print(message2);
        }
    }
    
    /**
     * Test removeRequirementsAssignmentOfProgram1 method of class ComplianceSqlHelper.
     */
    public static void testRemoveRequirementsAssignmentOfProgram1() {
        final DataSource regNotifyDs = ComplianceUtility.getDataSourceRegNotify();
        final DataSource eventDs =
                DataSourceFactory.createDataSourceForFields(Constant.ACTIVITY_LOG, new String[] {
                        Constant.REGULATION, Constant.REG_PROGRAM, Constant.REG_REQUIREMENT });
        
        final int eventId = createNotifications();
        
        final DataRecord event = eventDs.getRecord(Constant.ACTIVITY_LOG_ID + " = " + eventId);
        String program = "";
        String regulation = "";
        if (event != null) {
            program = event.getString(Constant.ACTIVITY_LOG_REG_PROGRAM);
            regulation = event.getString(Constant.ACTIVITY_LOG_REGULATION);
        }
        List<DataRecord> records = null;
        
        ComplianceSqlHelper.removeRequirementsAssignmentOfProgram(regulation, program, TEMPLATE1);
        
        records =
                regNotifyDs.getRecords(Constant.REG_REQUIREMENT + IS_NOT_NULL + AND
                        + Constant.REG_PROGRAM + "='" + program + "'  " + AND + Constant.REGULATION
                        + "= '" + regulation + "' " + AND + " template_id = '" + TEMPLATE1 + "'  ");
        
        decideIfSuccess(records, message1, message2);
    }
    
    /**
     * Test removeRequirementsAssignmentOfProgram2 method of class ComplianceSqlHelper.
     */
    public static void testRemoveRequirementsAssignmentOfProgram2() {
        final DataSource regNotifyDs = ComplianceUtility.getDataSourceRegNotify();
        final DataSource eventDs =
                DataSourceFactory.createDataSourceForFields(Constant.ACTIVITY_LOG, new String[] {
                        Constant.REGULATION, Constant.REG_PROGRAM, Constant.REG_REQUIREMENT });
        
        final int eventId = createNotifications();
        
        final DataRecord event = eventDs.getRecord(Constant.ACTIVITY_LOG_ID + "  =" + eventId);
        String program = "";
        String regulation = "";
        if (event != null) {
            program = event.getString(Constant.ACTIVITY_LOG_REG_PROGRAM);
            regulation = event.getString(Constant.ACTIVITY_LOG_REGULATION);
        }
        List<DataRecord> records = null;
        
        ComplianceSqlHelper.removeRequirementsAssignmentOfProgram(regulation, program,
            inSqlOfSelectedIds);
        
        records =
                regNotifyDs.getRecords(Constant.REG_REQUIREMENT + IS_NOT_NULL + AND
                        + Constant.REG_PROGRAM + "='" + program + "' " + AND + Constant.REGULATION
                        + "= '" + regulation + "' and template_id IN "
                        + inSqlOfSelectedIds.toString() + "  ");
        decideIfSuccess(records, message1, message2);
    }
    
    /**
     * Test toggleNotifications method of class ComplianceSqlHelper.
     */
    public static void testToggleNotifications() {
        
        final int eventId = createNotifications();
        
        final DataSource notificationDs =
                DataSourceFactory.createDataSourceForFields(Constant.NOTIFICATIONS,
                    EventHandlerBase.getAllFieldNames(ContextStore.get().getEventHandlerContext(),
                        Constant.NOTIFICATIONS));
        
        // get event by id
        final DataSource eventDs =
                DataSourceFactory.createDataSourceForFields(Constant.ACTIVITY_LOG, new String[] {
                        Constant.REGULATION, Constant.REG_PROGRAM, Constant.REG_REQUIREMENT });
        final DataRecord event = eventDs.getRecord("activity_log_id=" + eventId);
        
        // get program and regulation from event
        String program = "";
        String regulation = "";
        String requirement = "";
        if (event != null) {
            requirement = event.getString(Constant.ACTIVITY_LOG_REG_REQUIREMENT);
            program = event.getString(Constant.ACTIVITY_LOG_REG_PROGRAM);
            regulation = event.getString(Constant.ACTIVITY_LOG_REGULATION);
        }
        
        ComplianceSqlHelper.toggleNotifications(regulation, program, requirement, 1);
        
        final List<DataRecord> records =
                notificationDs.getRecords(Constant.NOTIFICATIONS + Constant.DOT
                        + Constant.ACTIVITY_LOG_ID + equals + eventId + AND
                        + Constant.NOTIFICATIONS + Constant.DOT + Constant.IS_ACTIVE + equals + 1);
        
        decideIfSuccess(records, message2, message1);
        
    }
    
    /**
     * Create Notifications data.
     * 
     * @return event Id.
     */
    private static int createNotifications() {
        final int eventId = createEventRecordForRequirement();
        
        messageTitle = createMessage(TITLE);
        messageBody = createMessage(BODY);
        createNotifyTemplate(messageTitle, messageBody, TEMPLATE1);
        
        final java.util.List<String> templates = new ArrayList<String>();
        templates.add(TEMPLATE1);
        
        inSqlOfSelectedIds = ComplianceUtility.getStringBuilderFromList(templates);
        
        final Map<String, String> key = new HashMap<String, String>();
        key.put(REG_REQUIREMENT, CHK_INSTRUMENT_CALIBRATIONS);
        key.put(REG_PROGRAM, INSTALLATION_PERMIT);
        key.put(REGULATION, CAA);
        
        final ComplianceNotifyProcessor c = new ComplianceNotifyProcessor();
        c.assignNotifyTemplatesForRequirement(templates, inSqlOfSelectedIds, key);
        
        new ComplianceNotifyProcessor().createNotifications(String.valueOf(eventId));
        return eventId;
    }
    
    /**
     * 
     * Create Event Record ForRequirement.
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
     * Decide If Success.
     * 
     * @param records .
     * @param m1 .
     * @param m2 .
     */
    private static void decideIfSuccess(final List<DataRecord> records, final String m1,
            final String m2) {
        if (records.isEmpty()) {
            System.out.print(m1);
        } else {
            System.out.print(m2);
        }
        
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
     * @param messageTitle for title record .
     * @param messageBody for body record .
     * @param template for temple record .
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
    
}
