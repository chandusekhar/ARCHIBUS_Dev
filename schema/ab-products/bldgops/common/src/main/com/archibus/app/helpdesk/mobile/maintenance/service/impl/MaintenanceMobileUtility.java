package com.archibus.app.helpdesk.mobile.maintenance.service.impl;

import static com.archibus.app.common.mobile.util.FieldNameConstantsCommon.*;
import static com.archibus.app.common.mobile.util.FieldNameConstantsMaintenance.*;
import static com.archibus.app.common.mobile.util.ServiceConstants.*;
import static com.archibus.app.common.mobile.util.TableNameConstants.*;

import java.util.*;

import org.json.JSONObject;

import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.eventhandler.sla.ServiceLevelAgreement;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.*;

/**
 * Bldgops Express Utility class.
 *
 * <p>
 * History:
 * <li>21.2: Add for 21.2 Bldgops Express.
 *
 * @author Zhang Yi
 *
 */
public final class MaintenanceMobileUtility {

    /**
     * Constructor method for removing warning: 'Utility classes should not have a public or default
     * constructor'.
     *
     */
    private MaintenanceMobileUtility() {

    }

    /**
     *
     * Checks to see if there is a pending action based on work request status being Com, HA, HP or
     * HL an.
     *
     * @param status - Work Request Status
     * @return true or false based on conditional check
     */
    static boolean pendingManagerAction(final String status) {
        return "S".equals(status) || "HA".equals(status) || "HP".equals(status)
                || "HL".equals(status);
    }

    /**
     *
     * Builds a JSON Record to pass to the saveRequest workflow rule.
     *
     * @param record - Work Request Sync Record
     * @param wrId - Work Request Code
     * @return jsonRecord
     */
    static JSONObject buildJSONRecordForApprovalSave(final DataRecord record, final int wrId) {

        final JSONObject jsonRecord = new JSONObject();

        copyJSONValues(record, wrId, jsonRecord);

        return jsonRecord;
    }

    /**
     * reset priority if not valid.
     *
     * @param jsonRecord jsonRecord
     */
    static void resetPriorityIfNotValid(final JSONObject jsonRecord) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        try {
            new ServiceLevelAgreement(context,
                EventHandlerBase.stripPrefix(EventHandlerBase.filterWithPrefix(
                    EventHandlerBase.fromJSONObject(jsonRecord), WR_TABLE + SQL_DOT)));
        } catch (final ExceptionBase e) {
            jsonRecord.put(WR_TABLE + SQL_DOT + PRIORITY, 1);
        }
    }

    /**
     * copy JSON values.
     *
     * @param record record
     * @param wrId work request code
     * @param jsonRecord jsonRecord
     */
    static void copyJSONValues(final DataRecord record, final int wrId,
            final JSONObject jsonRecord) {
        jsonRecord.put(WR_TABLE + SQL_DOT + ACTIVITY_LOG_ID, getActivityLogId(wrId));

        final String blId = record.getString(WR_SYNC_TABLE + SQL_DOT + BL_ID);
        jsonRecord.put(WR_TABLE + SQL_DOT + BL_ID, StringUtil.notNull(blId));

        if (StringUtil.notNullOrEmpty(blId)) {
            jsonRecord.put(WR_TABLE + SQL_DOT + SITE_ID, StringUtil.notNull(getSiteId(blId)));
        }

        jsonRecord.put(WR_TABLE + SQL_DOT + FL_ID,
            StringUtil.notNull(record.getString(WR_SYNC_TABLE + SQL_DOT + FL_ID)));
        jsonRecord.put(WR_TABLE + SQL_DOT + RM_ID,
            StringUtil.notNull(record.getString(WR_SYNC_TABLE + SQL_DOT + RM_ID)));
        jsonRecord.put(WR_TABLE + SQL_DOT + DV_ID,
            StringUtil.notNull(record.getString(WR_SYNC_TABLE + SQL_DOT + DV_ID)));
        jsonRecord.put(WR_TABLE + SQL_DOT + DP_ID,
            StringUtil.notNull(record.getString(WR_SYNC_TABLE + SQL_DOT + DP_ID)));
        jsonRecord.put(WR_TABLE + SQL_DOT + EQ_ID,
            StringUtil.notNull(record.getString(WR_SYNC_TABLE + SQL_DOT + EQ_ID)));
        jsonRecord.put(WR_TABLE + SQL_DOT + DESCRIPTION,
            StringUtil.notNull(record.getString(WR_SYNC_TABLE + SQL_DOT + DESCRIPTION)));
        jsonRecord.put(WR_TABLE + SQL_DOT + PROB_TYPE,
            StringUtil.notNull(record.getString(WR_SYNC_TABLE + SQL_DOT + PROB_TYPE)));
        jsonRecord.put(WR_TABLE + SQL_DOT + PRIORITY,
            Integer.toString(record.getInt(WR_SYNC_TABLE + SQL_DOT + PRIORITY)));
        jsonRecord.put(WR_TABLE + SQL_DOT + ACTIVITY_TYPE, SERVICE_DESK_MAINTENANCE_VALUE);

        resetPriorityIfNotValid(jsonRecord);
    }

    /**
     *
     * Build a JSON Record to pass to the Estimate and Approve workflow rule.
     *
     * @param record - Work Request Sync Record
     * @param wrId - Work Request Code
     * @return jsonRecord
     */
    static JSONObject buildJSONRecordForApprovalStatus(final DataRecord record, final int wrId) {

        final JSONObject jsonRecord = new JSONObject();

        copyJSONValues(record, wrId, jsonRecord);

        jsonRecord.put(WR_TABLE + SQL_DOT + WR_ID,
            Integer.toString(record.getInt(WR_SYNC_TABLE + SQL_DOT + WR_ID)));

        jsonRecord.put(WR_STEP_WAITING_TABLE + SQL_DOT + STEP_LOG_ID,
            Integer.toString(record.getInt(WR_SYNC_TABLE + SQL_DOT + STEP_LOG_ID)));

        return jsonRecord;
    }

    /**
     *
     * Builds a JSON Record to pass to the Reject workflow rule.
     *
     * @param record - Work Request Sync Record
     * @return jsonRecord
     */
    static JSONObject buildJSONRecordForRejection(final DataRecord record) {

        final JSONObject jsonRecord = new JSONObject();

        jsonRecord.put(WR_TABLE + SQL_DOT + WR_ID,
            Integer.toString(record.getInt(WR_SYNC_TABLE + SQL_DOT + WR_ID)));
        jsonRecord.put(WR_TABLE + SQL_DOT + ACTIVITY_TYPE, SERVICE_DESK_MAINTENANCE_VALUE);

        jsonRecord.put(WR_STEP_WAITING_TABLE + SQL_DOT + STEP_LOG_ID,
            Integer.toString(record.getInt(WR_SYNC_TABLE + SQL_DOT + STEP_LOG_ID)));

        return jsonRecord;
    }

    /**
     *
     * Builds a JSON Record to pass to the closeWorkRequests rule.
     *
     * @param record - Work Request Sync Record
     * @return jsonRecord
     */
    static JSONObject buildJSONRecordForClose(final DataRecord record) {

        final JSONObject jsonRecord = new JSONObject();

        jsonRecord.put(WR_TABLE + SQL_DOT + WR_ID,
            Integer.toString(record.getInt(WR_SYNC_TABLE + SQL_DOT + WR_ID)));
        jsonRecord.put(WR_TABLE + SQL_DOT + ACTIVITY_TYPE, SERVICE_DESK_MAINTENANCE_VALUE);

        return jsonRecord;
    }

    /**
     *
     * Builds a JSON Record to pass to the issueWorkRequests rule.
     *
     * @param record - Work Request Sync Record
     * @param wrId - Work Request Code
     * @return jsonRecord
     */
    static JSONObject buildJSONRecordForIssue(final DataRecord record, final int wrId) {

        final JSONObject jsonRecord = new JSONObject();

        jsonRecord.put(WR_TABLE + SQL_DOT + WR_ID, record.getInt(WR_SYNC_TABLE + SQL_DOT + WR_ID));

        final int woId = getWoId(wrId);
        jsonRecord.put(WR_TABLE + SQL_DOT + WO_ID, woId);

        return jsonRecord;
    }

    /**
     *
     * Builds a JSON Record to pass to the completeEstimation and completeScheduling workflow rule.
     *
     * @param record - Work Request Sync Record
     * @return jsonRecord
     */
    static JSONObject buildJSONRecordForCompleteEstimateScheduleStep(final DataRecord record) {

        final JSONObject jsonRecord = new JSONObject();

        jsonRecord.put(WR_TABLE + SQL_DOT + WR_ID,
            Integer.toString(record.getInt(WR_SYNC_TABLE + SQL_DOT + WR_ID)));
        jsonRecord.put(WR_STEP_WAITING_TABLE + SQL_DOT + STEP_LOG_ID,
            Integer.toString(record.getInt(WR_SYNC_TABLE + SQL_DOT + STEP_LOG_ID)));

        return jsonRecord;
    }

    /**
     *
     * Builds a JSON Record to pass to the completeEstimation and completeScheduling workflow rule.
     * Same fields as called in - getSelectedWrRecordsForWFR
     *
     * @param record - Work Request Sync Record
     * @param userComments - Comments
     * @return jsonRecord
     */
    static JSONObject buildJSONRecordForApprovalStep(final DataRecord record,
            final String userComments) {

        final JSONObject jsonRecord = new JSONObject();

        // activity_log.activity_log_id not added to jsonRecord
        jsonRecord.put(WR_TABLE + SQL_DOT + WR_ID,
            Integer.toString(record.getInt(WR_SYNC_TABLE + SQL_DOT + WR_ID)));
        jsonRecord.put(WR_TABLE + SQL_DOT + ACTIVITY_TYPE, SERVICE_DESK_MAINTENANCE_VALUE);

        jsonRecord.put(WR_STEP_WAITING_TABLE + SQL_DOT + WR_ID,
            Integer.toString(record.getInt(WR_SYNC_TABLE + SQL_DOT + WR_ID)));

        jsonRecord.put(WR_STEP_WAITING_TABLE + SQL_DOT + STEP_LOG_ID,
            Integer.toString(record.getInt(WR_SYNC_TABLE + SQL_DOT + STEP_LOG_ID)));

        jsonRecord.put(WR_STEP_WAITING_TABLE + SQL_DOT + COMMENTS, userComments);

        return jsonRecord;
    }

    /**
     *
     * Builds a JSON Record to pass to the verifyWorkRequest workflow rule.
     *
     * @param record - Work Request Sync Record
     * @param userComments - Comments
     * @return jsonRecord
     */
    static JSONObject buildJSONRecordForVerifyStep(final DataRecord record,
            final String userComments) {

        final JSONObject jsonRecord = new JSONObject();

        // activity_log.activity_log_id not added to jsonRecord
        jsonRecord.put(WR_TABLE + SQL_DOT + WR_ID,
            Integer.toString(record.getInt(WR_SYNC_TABLE + SQL_DOT + WR_ID)));

        jsonRecord.put(WR_STEP_WAITING_TABLE + SQL_DOT + WR_ID,
            Integer.toString(record.getInt(WR_SYNC_TABLE + SQL_DOT + WR_ID)));

        jsonRecord.put(WR_STEP_WAITING_TABLE + SQL_DOT + STEP_LOG_ID,
            Integer.toString(record.getInt(WR_SYNC_TABLE + SQL_DOT + STEP_LOG_ID)));

        jsonRecord.put(WR_STEP_WAITING_TABLE + SQL_DOT + COMMENTS, userComments);

        return jsonRecord;
    }

    /**
     * Get the site id.
     *
     * @param blId - Building Code
     * @return siteId - Site Code
     */
    static String getSiteId(final String blId) {

        final DataSource bldatasource =
                DataSourceFactory.createDataSourceForFields(BL_TABLE, BL_FIELDS);

        bldatasource.addRestriction(Restrictions.eq(BL_TABLE, BL_ID, blId));

        final DataRecord blRecord = bldatasource.getRecord();

        final String siteId = blRecord.getString(BL_TABLE + SQL_DOT + SITE_ID);

        return siteId;
    }

    /**
     *
     * Gets activity_log_id value from wr table.
     *
     * @param wrId - Work Request
     * @return activity log id
     */
    static String getActivityLogId(final int wrId) {
        // Create the data source for the work request table to get activity_log_id
        final DataSource datasource = DataSourceFactory.createDataSource().addTable(WR_TABLE);
        datasource.addField(ACTIVITY_LOG_ID);
        datasource.addField(WR_ID);
        datasource.addRestriction(Restrictions.eq(WR_TABLE, WR_ID, wrId));

        // Get the work request record
        final DataRecord wrRecord = datasource.getRecord();
        return Integer.toString(wrRecord.getInt(WR_TABLE + SQL_DOT + ACTIVITY_LOG_ID));
    }

    /**
     *
     * Gets wo_id value from wr table.
     *
     * @param wrId - Work Request
     * @return wo_id
     */
    static Integer getWoId(final int wrId) {
        // Create the data source for the work request table to get activity_log_id
        final DataSource datasource = DataSourceFactory.createDataSource().addTable(WR_TABLE);
        datasource.addField(WO_ID);
        datasource.addField(WR_ID);
        datasource.addRestriction(Restrictions.eq(WR_TABLE, WR_ID, wrId));

        // Get the work request record
        final DataRecord wrRecord = datasource.getRecord();
        return wrRecord.getInt(WR_TABLE + SQL_DOT + WO_ID);
    }

    /**
     * Returns String value of the field, or empty string if the value is null.
     *
     * @param record the record to get the field value from
     * @param fieldName full field name (table.field)
     * @return Field value or empty string
     */
    static String getFieldStringValueOrEmpty(final DataRecord record, final String fieldName) {
        String fieldValue = "";

        if (record.getString(fieldName) != null) {
            fieldValue = record.getString(fieldName);
        }

        return fieldValue;
    }

    /**
     * set text values.
     *
     * @param record record
     * @param wrRecord wrRecord
     * @param textFields textFields
     */
    static void setTextValues(final DataRecord record, final DataRecord wrRecord,
            final String[] textFields) {
        for (final String fieldName : textFields) {
            wrRecord.setValue(WR_TABLE + SQL_DOT + fieldName,
                record.getString(WR_SYNC_TABLE + SQL_DOT + fieldName) == null ? ""
                        : record.getString(WR_SYNC_TABLE + SQL_DOT + fieldName));
        }
    }

    /**
     * set date values.
     *
     * @param record record
     * @param wrRecord wrRecord
     * @param dateFields dateFields
     */
    static void setDateValues(final DataRecord record, final DataRecord wrRecord,
            final String[] dateFields) {
        for (final String fieldName : dateFields) {
            wrRecord.setValue(WR_TABLE + SQL_DOT + fieldName,
                record.getDate(WR_SYNC_TABLE + SQL_DOT + fieldName));
        }
    }

    /**
     * Retrieves the wr_id from the wr_sync table using the mob_wr_id value.
     *
     * @param mobWrId - request id set on the client.
     * @return - the wr_id value.
     */
    static int getWrIdFromSyncTable(final int mobWrId) {
        int wrId = 0;
        final String[] fields = { AUTO_NUMBER, WR_ID, MOB_WR_ID };
        final DataSource datasource =
                DataSourceFactory.createDataSourceForFields(WR_SYNC_TABLE, fields);
        datasource.addRestriction(Restrictions.eq(WR_SYNC_TABLE, MOB_WR_ID, mobWrId));

        final DataRecord record = datasource.getRecord();
        if (record != null) {
            wrId = record.getInt(WR_SYNC_TABLE + SQL_DOT + WR_ID);
        }
        return wrId;
    }

    /**
     * Returns the list of document fields where the associated doc_isnew field is true.
     *
     * @param docFieldNames the document fields contained in the sync table.
     * @param record to inpsect
     * @return array of document fields
     */
    static String[] getDocumentFieldsToCopy(final String[] docFieldNames, final DataRecord record) {

        final List<String> fieldsToCopy = new ArrayList<String>();
        for (final String fieldName : docFieldNames) {
            final int isNew = record.getInt(WR_SYNC_TABLE + SQL_DOT + fieldName + "_isnew");
            if (isNew == 1) {
                fieldsToCopy.add(fieldName);
            }
        }

        return fieldsToCopy.toArray(new String[fieldsToCopy.size()]);
    }

}
