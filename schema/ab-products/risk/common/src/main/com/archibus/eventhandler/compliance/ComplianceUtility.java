package com.archibus.eventhandler.compliance;

import java.text.*;
import java.util.*;

import org.json.*;

import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.JobBase;
import com.archibus.model.view.datasource.ParsedRestrictionDef;
import com.archibus.utility.StringUtil;

/**
 * Compliance Common Handler.
 *
 *
 * @author ASC-BJ:Zhang Yi
 */
public class ComplianceUtility extends JobBase {

    /**
     * string "values".
     *
     */
    private static final String VALUES = "values";

    /**
     * string "TEMPLATE_ID".
     *
     */
    private static final String TEMPLATE_ID = "template_id";

    /**
     * Clear the record to only keep pk field value.
     *
     * @param record JSONObject passed from client, possibly are Regulation record/Program
     *            Record/Requirement record.
     *
     * @return record only contains pk fields
     */
    public static JSONObject clearUselessFields(final JSONObject record) {
        if (record != null) {
            final JSONObject values = record.getJSONObject(VALUES);
            final JSONObject newValues = new JSONObject();
            for (final Iterator<String> it = values.keys(); it.hasNext();) {
                final String key = it.next();

                if (key.endsWith(".regulation") || key.endsWith(".reg_program")
                        || key.endsWith(".reg_requirement")) {
                    newValues.put(key, values.get(key));
                } else {
                    continue;
                }
            }
            record.put(VALUES, newValues);
        }
        return record;
    }

    /**
     * @return datasource of table activity_log.
     *
     */
    public static DataSource getDataSourceEvent() {
        return DataSourceFactory
            .createDataSourceForFields("activity_log", new String[] { "activity_log_id",
                    "activity_log.regulation", "activity_log.reg_program",
                    "activity_log.reg_requirement", "activity_log.activity_type",
                    "activity_log.action_title", "activity_log.date_required",
                    "activity_log.date_scheduled_end", "activity_log.date_scheduled",
                    "activity_log.manager", "activity_log.description", "activity_log.status",
                    "activity_log.vn_id", "activity_log.contact_id", "activity_log.hcm_labeled",
                    "activity_log.project_id", "activity_log.comments", "activity_log.location_id",
                    "activity_log.satisfaction_notes", "activity_log.assessment_id",
                    "activity_log.site_id", "activity_log.bl_id", "activity_log.fl_id",
                    "activity_log.rm_id", "activity_log.eq_id", "activity_log.requestor",
                    "activity_log.phone_requestor", "activity_log.prob_type",
                    "activity_log.priority", "activity_log.pr_id" });
    }

    /**
     * @return datasource of table requirement join reg_program.
     *
     */
    public static DataSource getDataSourceProgram() {
        return DataSourceFactory.createDataSourceForFields("regprogram", new String[] {
                "regprogram.regulation", "regprogram.reg_program", "regprogram.project_id" });
    }

    /**
     * Return regloc datasource.
     *
     * @return DataSource regloc datasource
     */
    public static DataSource getDataSourceRegloc() {
        final DataSource datasource = DataSourceFactory.createDataSource();

        datasource.addTable(Constant.REGLOC, DataSource.ROLE_MAIN);
        datasource.addField(Constant.REGLOC, Constant.LOCATION_ID);
        datasource.addField(Constant.REGLOC, Constant.REGULATION);
        datasource.addField(Constant.REGLOC, Constant.REG_PROGRAM);
        datasource.addField(Constant.REGLOC, Constant.REG_REQUIREMENT);

        return datasource;
    }

    /**
     * Return regloc join compliance_locations datasource.
     *
     * @return DataSource regloc datasource
     */
    public static DataSource getDataSourceRegLocJoinComplianceLoc() {
        final DataSource datasource = DataSourceFactory.createDataSource();

        datasource.addTable(Constant.REGLOC, DataSource.ROLE_MAIN);
        datasource.addTable(Constant.COMPLIANCE_LOCATIONS, DataSource.ROLE_STANDARD);
        datasource.addField(Constant.REGLOC, Constant.LOCATION_ID);
        datasource.addField(Constant.REGLOC, Constant.REGULATION);
        datasource.addField(Constant.REGLOC, Constant.REG_PROGRAM);
        datasource.addField(Constant.REGLOC, Constant.REG_REQUIREMENT);
        datasource.addField(Constant.COMPLIANCE_LOCATIONS, Constant.LOCATION_ID);
        datasource.addField(Constant.COMPLIANCE_LOCATIONS, "geo_region_id");
        datasource.addField(Constant.COMPLIANCE_LOCATIONS, "bl_id");
        datasource.addField(Constant.COMPLIANCE_LOCATIONS, "city_id");
        datasource.addField(Constant.COMPLIANCE_LOCATIONS, "county_id");
        datasource.addField(Constant.COMPLIANCE_LOCATIONS, "ctry_id");
        datasource.addField(Constant.COMPLIANCE_LOCATIONS, "em_id");
        datasource.addField(Constant.COMPLIANCE_LOCATIONS, "eq_id");
        datasource.addField(Constant.COMPLIANCE_LOCATIONS, "eq_std");
        datasource.addField(Constant.COMPLIANCE_LOCATIONS, "fl_id");
        datasource.addField(Constant.COMPLIANCE_LOCATIONS, "lat");
        datasource.addField(Constant.COMPLIANCE_LOCATIONS, "lon");
        datasource.addField(Constant.COMPLIANCE_LOCATIONS, "pr_id");
        datasource.addField(Constant.COMPLIANCE_LOCATIONS, "regn_id");
        datasource.addField(Constant.COMPLIANCE_LOCATIONS, "rm_id");
        datasource.addField(Constant.COMPLIANCE_LOCATIONS, "site_id");
        datasource.addField(Constant.COMPLIANCE_LOCATIONS, "state_id");

        return datasource;
    }

    /**
     * @return datasource of table regnotify.
     *
     */
    public static DataSource getDataSourceRegNotify() {
        return DataSourceFactory.createDataSourceForFields(Constant.REGNOTIFY, new String[] {
                "is_active", Constant.REG_PROGRAM, Constant.REGULATION, Constant.REG_REQUIREMENT,
                Constant.REGNOTIFY_ID, TEMPLATE_ID });

    }

    /**
     * @return datasource of table requirement join reg_program.
     *
     */
    public static DataSource getDataSourceRequirement() {
        return DataSourceFactory.createDataSourceForFields(Constant.REGREQUIREMENT, new String[] {
                "regrequirement.regulation", "regrequirement.reg_program",
                "regrequirement.reg_requirement", "regrequirement.date_initial",
                "regrequirement.date_end", "regrequirement.recurring_rule",
                "regrequirement.sched_loc", "regrequirement.date_start",
                "regrequirement.event_title", "regrequirement.event_sched_buffer",
                "regrequirement.event_duration", "regrequirement.em_id", "regrequirement.vn_id",
                "regrequirement.description", "regrequirement.summary",
                "regrequirement.contact_id", "regrequirement.hold_reason",
                "regrequirement.date_recurrence_end", "regrequirement.regreq_type",
                "regrequirement.priority", "regrequirement.comp_level", "regrequirement.status" });
    }

    /**
     * @return a String list composed of template ids retrieved from database.
     *
     * @param regnotifyDs DataSource of table regnotify
     * @param restriction restriction to table regnotify
     */
    public static List<String> getSelectedTemplateIdsFromDB(final DataSource regnotifyDs,
        final ParsedRestrictionDef restriction) {

        final List<DataRecord> records = regnotifyDs.getRecords(restriction);

        final List<String> templateIds = new ArrayList<String>();

        for (final DataRecord record : records) {
            final String templateId = record.getString(Constant.REGNOTIFY_TEMPLATE_ID);
            if (StringUtil.notNullOrEmpty(templateId)) {
                templateIds.add(templateId);
            }
        }
        return templateIds;
    }

    /**
     * @return a String list composed of template ids retrieved from a JSONArray.
     *
     * @param templates JSONArray from client contians selected tempate ids
     */
    public static List<String> getSelectedTemplateIdsFromJSSONArray(final JSONArray templates) {

        final List<String> templateIds = new ArrayList<String>();

        for (int i = 0; i < templates.length(); i++) {
            final String templateId = templates.optString(i);
            if (!StringUtil.isNullOrEmpty(templateId)) {
                templateIds.add(templateId);
            }
        }
        return templateIds;
    }

    /**
     * @return a StringBuilder constructed from a String list, used for IN sql clause.
     *
     * @param list String list
     */
    public static StringBuilder getStringBuilderFromList(final List<String> list) {

        final StringBuilder stringBuilder = new StringBuilder("(");

        int count = 0;
        for (final String str : list) {
            if (count++ > 0) {
                stringBuilder.append(",");
            }
            stringBuilder.append(Constant.LEFT_SINGLE_QUOTATION);
            stringBuilder.append(str);
            stringBuilder.append(Constant.LEFT_SINGLE_QUOTATION);
        }
        stringBuilder.append(")");
        return stringBuilder;
    }

    /**
     * @return boolean value of given activity parameter that defined in database as '1' or '0'.
     *
     * @param parameter String activity parameter name
     */
    public static boolean loadBooleanActivityParameter(final String parameter) {
        boolean value = false;
        // Prepare needed activity parameters in below process
        final String paraValue =
                EventHandlerBase.getActivityParameterString(ContextStore.get()
                    .getEventHandlerContext(), "AbRiskCompliance", parameter);
        if (StringUtil.notNullOrEmpty(paraValue) && "1".equals(paraValue)) {
            value = true;
        }
        return value;
    }

    /**
     *
     * Get Messages Table Ds.
     *
     * @return Messages table DataSource
     */
    public static DataSource getMessagesDs() {
        return DataSourceFactory.createDataSourceForFields("messages", new String[] { "message_id",
                "description", "message_text", "activity_id", "referenced_by", "transfer_status",
                "is_rich_msg_format", "customized" });
    }

    /**
     * Get Notify Templates Ds.
     *
     * @return notify_templates table DataSource
     */
    public static DataSource getNotifyTemplatesDs() {
        return DataSourceFactory.createDataSourceForFields("notify_templates", new String[] {
                TEMPLATE_ID, "notify_subject_id", "notify_message_id", "notify_recipients" });
    }

    /**
     * Strip the time values from a Date object.
     *
     * @param dateWithTime Date to strip time from
     * @return Date
     */
    public static Date getDateWithoutTime(final Date dateWithTime) {
        // kb 3037289 - Compare dates without times
        final DateFormat dFormat = new SimpleDateFormat("yyyy-MM-dd", Locale.US);
        Date dateWithZeroTime;
        try {
            dateWithZeroTime = dFormat.parse(dFormat.format(dateWithTime));
        } catch (final ParseException ex) {
            dateWithZeroTime = dateWithTime;
        }
        return dateWithZeroTime;
    }

}
