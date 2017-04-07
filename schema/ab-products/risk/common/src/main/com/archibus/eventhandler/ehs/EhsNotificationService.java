package com.archibus.eventhandler.ehs;

import java.util.*;

import com.archibus.config.IActivityParameterManager;
import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.jobmanager.*;
import com.archibus.servletx.utility.UrlHelper;
import com.archibus.utility.StringUtil;

/**
 * Send email notifications.
 *
 * @author Ioan Draghici
 *
 */
public class EhsNotificationService extends JobBase {
    /**
     * Constant: activity id.
     */
    private static final String ACTIVITY_ID = "AbRiskEHS";

    /**
     * Field name "bl_id".
     */
    private static final String BL_ID = "bl_id";

    /**
     * Notification category: Incident.
     */
    private static final String CATEGORY_INCIDENT = "Incident";

    /**
     * Notification category: MedMonitoring.
     */
    private static final String CATEGORY_MED_MONITORING = "MedMonitoring";

    /**
     * Notification category: PPE.
     */
    private static final String CATEGORY_PPE = "PPE";

    /**
     * Notification category: Training.
     */
    private static final String CATEGORY_TRAINING = "Training";

    /**
     * ",".
     */
    private static final String COMMA = ",";

    /**
     * Field name.
     */
    private static final String DATE_ACTUAL = "date_actual";

    /**
     * Field name.
     */
    private static final String DATE_DELIVERED = "date_delivered";

    /**
     * Field name "date_incident".
     */
    private static final String DATE_INCIDENT = "date_incident";

    /**
     * "DELETED".
     */
    private static final String DELETED = "DELETED";

    /**
     * Constant "description".
     */
    private static final String DESCRIPTION = "description";

    /**
     * Constant ".".
     */
    private static final String DOT = ".";

    /**
     * Field name "em.email".
     */
    private static final String EM_EMAIL = "em.email";

    /**
     * Field name.
     */
    private static final String EM_ID = "em_id";

    /**
     * Table name "em".
     */
    private static final String EM_TABLE = "em";

    /**
     * ",".
     */
    private static final String EMAIL_SEPARATOR = ";";

    /**
     * Field name "fl_id".
     */
    private static final String FL_ID = "fl_id";

    /**
     * Field name.
     */
    private static final String INCIDENT_ID = "incident_id";

    /**
     * Field name.
     */
    private static final String MEDICAL_MONITORING_ID = "medical_monitoring_id";

    /**
     * "UPDATED".
     */
    private static final String NEW = "NEW";

    /**
     * Messages text.
     */
    private static final String NOTIFY_TYPE_CATEGORY_TEXT = "NOTIFY_type_category_TEXT";

    /**
     * Messages title.
     */
    private static final String NOTIFY_TYPE_CATEGORY_TITLE = "NOTIFY_type_category_TITLE";

    /**
     * "_2".
     */
    private static final String PART_2 = "_2";

    /**
     * Field name.
     */
    private static final String PPE_TYPE_ID = "ppe_type_id";

    /**
     * Field name "pr_id".
     */
    private static final String PR_ID = "pr_id";

    /**
     * "'".
     */
    private static final String QUOTE = "'";

    /**
     * Constant: referenced by.
     */
    private static final String REFERENCED_BY = "NOTIFICATION_WFR";

    /**
     * Constant: referenced by incidents.
     */
    private static final String REFERENCED_BY_INCIDENT = "NOTIFICATION_INCIDENTS_WFR";

    /**
     * Field name "rm_id".
     */
    private static final String RM_ID = "rm_id";

    /**
     * Field name "safety_officer".
     */
    private static final String SAFETY_OFFICER = "safety_officer";

    /**
     * Field name "site_id".
     */
    private static final String SITE_ID = "site_id";

    /**
     * Field name.
     */
    private static final String TRAINING_ID = "training_id";

    /**
     * Notification type: Delete.
     */
    private static final String TYPE_DELETE = "Delete";

    /**
     * Notification type: New.
     */
    private static final String TYPE_NEW = "New";

    /**
     * Notification type: Update.
     */
    private static final String TYPE_UPDATE = "Update";

    /**
     * "UPDATED".
     */
    private static final String UPDATED = "UPDATED";
    
    /** prefix for lookup activity parameter link. */
    private static final String PREFIX = "AbRiskEHS-Notify";

    /** suffix for lookup activity parameter link. */
    private static final String SUFFIX = "Link";

    /**
     * Notification category.
     */
    private final String category;

    /**
     * List or recurring dates.
     */
    private List<Date> dates;

    /**
     * Runtime variable: fields.
     */
    private String[] fields;

    /**
     * New values object.
     */
    private Map<String, Object> newValues;

    /**
     * Old values object.
     */
    private Map<String, Object> oldValues;

    /**
     * Primary key object.
     */
    private Map<String, String> primaryKey;

    /**
     * Runtime variable: table names.
     */
    private String[] tables;

    /**
     * Notification type.
     */
    private final String type;

    /**
     * Constructor.
     *
     * @param type notification type
     * @param category notification category
     */
    public EhsNotificationService(final String type, final String category) {
        super();
        this.type = type;
        this.category = category;
        if (CATEGORY_TRAINING.equals(category)) {
            this.tables = new String[] { "ehs_training_results" };
            this.fields = new String[] { TRAINING_ID, EM_ID, DATE_ACTUAL };
        } else if (CATEGORY_PPE.equals(category)) {
            this.tables = new String[] { "ehs_em_ppe_types" };
            this.fields = new String[] { PPE_TYPE_ID, EM_ID, DATE_DELIVERED, BL_ID, FL_ID, RM_ID };
        } else if (CATEGORY_MED_MONITORING.equals(category)) {
            this.tables = new String[] { "ehs_medical_mon_results", "ehs_medical_monitoring" };
            this.fields =
                    new String[] { MEDICAL_MONITORING_ID, EM_ID, DATE_ACTUAL, "monitoring_type",
                    DESCRIPTION };
        } else if (CATEGORY_INCIDENT.equals(category)) {
            this.tables = new String[] { "ehs_incidents" };
            this.fields =
                    new String[] { INCIDENT_ID, DATE_INCIDENT, "incident_type",
                    "injury_category_id", SITE_ID, PR_ID, BL_ID, FL_ID, RM_ID, DESCRIPTION,
                    SAFETY_OFFICER };
        }
    }

    @Override
    public void run() {

        final String subjectId = this.getSubjectId(this.type, this.category);
        final List<String> bodyId = this.getBodyId(this.type, this.category);

        // prepare data model object.
        final Map<String, Object> dataModel = getDataModel();

        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();

        List<String> emIds = new ArrayList<String>();
        final List<String> attachments = new ArrayList<String>();
        final EhsNotificationMessage ehsNotificationMessage = new EhsNotificationMessage(context);
        ehsNotificationMessage.setActivityId(ACTIVITY_ID);
        if (CATEGORY_INCIDENT.equals(this.category)) {
            ehsNotificationMessage.setReferencedBy(REFERENCED_BY_INCIDENT);
            final IncidentsHandler incidentHandler = new IncidentsHandler();
            emIds = incidentHandler.getSafetyOfficers(this.newValues);
            final String attachFile =
                    incidentHandler
                    .getRedlineDoc(Integer.valueOf(this.primaryKey.get(INCIDENT_ID)));
            if (StringUtil.notNullOrEmpty(attachFile)) {
                attachments.add(attachFile);
            }
        } else {
            ehsNotificationMessage.setReferencedBy(REFERENCED_BY);
            emIds.add(this.primaryKey.get(EM_ID));
        }

        // get recipient email
        final String email = getRecipientEmail(emIds);
        if (email != null && email.length() != 0) {
            ehsNotificationMessage.setSubjectId(subjectId);
            ehsNotificationMessage.setBodyId(bodyId);
            ehsNotificationMessage.setDataModel(dataModel);
            ehsNotificationMessage.setMailTo(email);
            if (!attachments.isEmpty()) {
                ehsNotificationMessage.setAttachments(attachments);
            }
        }
        ehsNotificationMessage.sendMessage();

    }

    /**
     * @param dates the dates to set
     */
    public void setDates(final List<Date> dates) {
        this.dates = dates;
    }

    /**
     * @param newValues the newValues to set
     */
    public void setNewValues(final Map<String, Object> newValues) {
        this.newValues = newValues;
    }

    /**
     * @param oldValues the oldValues to set
     */
    public void setOldValues(final Map<String, Object> oldValues) {
        this.oldValues = oldValues;
    }

    /**
     * @param primaryKey the primaryKey to set
     */
    public void setPrimaryKey(final Map<String, String> primaryKey) {
        this.primaryKey = primaryKey;
    }

    /**
     * Get notification body id's.
     *
     * @param notificationType notification type
     * @param notificationCategory notification category
     * @return id list
     */
    private List<String> getBodyId(final String notificationType, final String notificationCategory) {
        final String textCode = NOTIFY_TYPE_CATEGORY_TEXT;
        final String secondCode = PART_2;
        final List<String> bodyId = new ArrayList<String>();
        if (TYPE_NEW.equals(notificationType)) {
            final String bodyCode = getMessageId(textCode, NEW, notificationCategory);
            bodyId.add(bodyCode);
            if (CATEGORY_INCIDENT.equals(this.category)) {
                bodyId.add(bodyCode + secondCode);
            }
        } else if (TYPE_UPDATE.equals(notificationType)) {
            final String bodyCode = getMessageId(textCode, UPDATED, notificationCategory);
            bodyId.add(bodyCode);
            if (CATEGORY_PPE.equals(notificationCategory)
                    || CATEGORY_INCIDENT.equals(notificationCategory)) {
                bodyId.add(bodyCode + secondCode);
            }
        } else if (TYPE_DELETE.equals(notificationType)) {
            final String bodyCode = getMessageId(textCode, DELETED, notificationCategory);
            bodyId.add(bodyCode);
            if (CATEGORY_PPE.equals(notificationCategory)
                    || CATEGORY_INCIDENT.equals(notificationCategory)) {
                bodyId.add(bodyCode + secondCode);
            }
        }
        return bodyId;
    }

    /**
     * Prepare data model object.
     *
     * @return object
     */
    private Map<String, Object> getDataModel() {
        final Map<String, Object> result = new HashMap<String, Object>();
        // add field values
        final Map<String, Object> values = new HashMap<String, Object>();
        for (final String fieldName : this.fields) {
            if (this.newValues.containsKey(fieldName)) {
                values.put(fieldName, this.newValues.get(fieldName));
            } else {
                values.put(fieldName, "");
            }
        }

        String dateField = DATE_ACTUAL;
        if (CATEGORY_PPE.equals(this.category)) {
            dateField = DATE_DELIVERED;
        } else if (CATEGORY_INCIDENT.equals(this.category)) {
            dateField = DATE_INCIDENT;
        }
        // we must update old date field
        if (TYPE_UPDATE.equals(this.type)) {
            if (this.oldValues.containsKey(dateField)) {
                values.put(dateField, SqlUtils.normalizeValueForSql(this.oldValues.get(dateField))
                    .toString());
            } else {
                values.put(dateField, "");
            }
        }

        // add values to data model
        for (final String tableName : this.tables) {
            result.put(tableName, values);
        }

        // add steps to data model
        final List<Map<String, Object>> steps = getDataModelSteps(dateField);

        result.put("steps", steps);

        // add link
        final String hyperlink = getHyperlink(this.category, this.primaryKey);
        result.put("link", hyperlink);

        return result;
    }

    /**
     * Get step list for email data model.
     *
     * @param dateField date field name
     * @return list of objects
     */
    private List<Map<String, Object>> getDataModelSteps(final String dateField) {
        final List<Map<String, Object>> result = new ArrayList<Map<String, Object>>();
        if (this.dates == null && (TYPE_UPDATE.equals(this.type) || TYPE_DELETE.equals(this.type))) {
            final Map<String, Object> step = new HashMap<String, Object>();
            step.put(dateField, SqlUtils.normalizeValueForSql(this.newValues.get(dateField))
                .toString());
            result.add(step);
        } else if (this.dates != null) {
            for (final Date date : this.dates) {
                final Map<String, Object> step = new HashMap<String, Object>();
                step.put(dateField, SqlUtils.normalizeValueForSql(date).toString());
                result.add(step);
            }
        }
        return result;
    }

    /**
     * Prepares the employee list for sql.
     *
     * @param employeeIds List of employee ids
     * @return String Employee Ids separated by comma
     */
    private String getEmployeesForSql(final List<String> employeeIds) {
        String emIds = "";
        final Iterator<String> emIdsIt = employeeIds.iterator();
        while (emIdsIt.hasNext()) {
            final String value = emIdsIt.next().toString();
            emIds += "".equals(emIds) ? "" : COMMA;
            emIds += QUOTE + SqlUtils.makeLiteralOrBlank(value) + QUOTE;
        }
        return emIds;
    }

    /**
     * Get notification hyperlink.
     *
     * Use parameter when the view is defined as activity parameter or use default one.
     *
     * @param categoryCode category code
     * @param pkValues primary key object
     * @return hyperlink value
     */
    private String getHyperlink(final String categoryCode, final Map<String, String> pkValues) {
        
        final IActivityParameterManager activityParameters =
                ContextStore.get().getProject().getActivityParameterManager();

        String reportName = null;
        if (CATEGORY_TRAINING.equals(categoryCode)) {
            final String link = activityParameters.getParameterValue(PREFIX + "Training" + SUFFIX);
            reportName =
                    (StringUtil.notNullOrEmpty(link)) ? link : "ab-ehs-rpt-training-details.axvw";

        } else if (CATEGORY_PPE.equals(categoryCode)) {
            final String link = activityParameters.getParameterValue(PREFIX + "Ppe" + SUFFIX);
            reportName = (StringUtil.notNullOrEmpty(link)) ? link : "ab-ehs-rpt-ppe-details.axvw";

        } else if (CATEGORY_MED_MONITORING.equals(categoryCode)) {
            final String link =
                    activityParameters.getParameterValue(PREFIX + "MedicalMonitoring" + SUFFIX);
            reportName =
                    (StringUtil.notNullOrEmpty(link)) ? link
                            : "ab-ehs-rpt-medical-monitoring-details.axvw";

        } else if (CATEGORY_INCIDENT.equals(categoryCode)) {
            final String link = activityParameters.getParameterValue(PREFIX + "Incident" + SUFFIX);
            reportName =
                    (StringUtil.notNullOrEmpty(link)) ? link
                            : "ab-ehs-incident-details-dialog.axvw";
        }

        final String contextPath = ContextStore.get().getContextPath();
        final String requestURL = ContextStore.get().getRequestURL();

        final String urlAddress =
                requestURL.substring(0, requestURL.indexOf(contextPath) + contextPath.length());

        return urlAddress + "/" + reportName + UrlHelper.toUrlParameters(pkValues);
    }

    /**
     * Format message id - replace type and category.
     *
     * @param messageId current message id
     * @param typeCode current type
     * @param categoryCode current category
     * @return string
     */
    private String getMessageId(final String messageId, final String typeCode,
            final String categoryCode) {
        String result = messageId.replaceAll("type", typeCode);
        result = result.replaceAll("category", categoryCode);
        return result.toUpperCase();
    }

    /**
     * Get recipient email.
     *
     * @param employeeIds employee codes, comma separated
     * @return email address
     */
    private String getRecipientEmail(final List<String> employeeIds) {
        String emails = "";
        final String emailIdFull = EM_EMAIL;
        final String tableName = EM_TABLE;
        final String[] fieldNames = { "email" };

        String restriction = null;
        final String emIds = getEmployeesForSql(employeeIds);
        if (StringUtil.notNullOrEmpty(emIds)) {
            restriction = tableName + DOT + EM_ID + " IN (" + emIds + ")";

            final DataSource dataSource =
                    DataSourceFactory.createDataSourceForFields(tableName, fieldNames);
            dataSource.setDistinct(true);
            final List<DataRecord> records = dataSource.getRecords(restriction);
            for (final DataRecord record : records) {
                if (record.valueExists(emailIdFull)) {
                    emails +=
                            (StringUtil.notNullOrEmpty(emails) ? EMAIL_SEPARATOR : "")
                            + record.getString(emailIdFull);
                }
            }
        }
        return emails;
    }

    /**
     * Get notification subject code.
     *
     * @param notificationType notification type
     * @param notificationCategory notification category
     * @return subject code
     */
    private String getSubjectId(final String notificationType, final String notificationCategory) {
        String subjectId = "";
        final String titleCode = NOTIFY_TYPE_CATEGORY_TITLE;
        if (TYPE_NEW.equals(notificationType)) {
            subjectId = getMessageId(titleCode, notificationType, notificationCategory);
        } else if (TYPE_UPDATE.equals(notificationType)) {
            subjectId = getMessageId(titleCode, UPDATED, notificationCategory);
        } else if (TYPE_DELETE.equals(notificationType)) {
            subjectId = getMessageId(titleCode, DELETED, notificationCategory);
        }
        return subjectId;
    }

}
