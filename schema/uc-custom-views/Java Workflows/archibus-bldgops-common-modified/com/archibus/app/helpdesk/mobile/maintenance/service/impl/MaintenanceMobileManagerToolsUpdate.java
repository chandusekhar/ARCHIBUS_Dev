package com.archibus.app.helpdesk.mobile.maintenance.service.impl;

import static com.archibus.app.common.mobile.util.FieldNameConstantsCommon.*;
import static com.archibus.app.common.mobile.util.FieldNameConstantsMaintenance.*;
import static com.archibus.app.common.mobile.util.ServiceConstants.*;
import static com.archibus.app.common.mobile.util.TableNameConstants.*;

import java.util.*;

import org.json.JSONObject;
import org.springframework.util.StringUtils;

import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.eventhandler.ondemandwork.WorkRequestHandler;
import com.archibus.jobmanager.EventHandlerContext;

/**
 * Provides supporting methods related to synchronizing the data in the Tools tables. Supports the
 * MaintenanceMobileService class.
 *
 * @author Constantine Kriezis
 * @since 21.3
 *
 */
@SuppressWarnings({ "PMD.AvoidUsingSql" })
final class MaintenanceMobileManagerToolsUpdate {

    /**
     * Time format.
     */
    private static final String TIME_FORMAT = "java.sql.Time";

    /**
     * Hide default constructor.
     */
    private MaintenanceMobileManagerToolsUpdate() {
    }

    /**
     * Create new tool records from the tool sync table.
     *
     * @param wrId - Work Request Code
     * @param mobWrId - Mobile Work Request Code
     */
    static void createToolRecords(final int wrId, final int mobWrId) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();

        final DataSource datasource =
                DataSourceFactory.createDataSourceForFields(WRTL_SYNC_TABLE, WRTL_SYNC_FIELDS);
        datasource.setContext();
        datasource.setMaxRecords(0);

        datasource.addRestriction(Restrictions.eq(WRTL_SYNC_TABLE, MOB_WR_ID, mobWrId));

        final List<DataRecord> records = datasource.getRecords();

        for (final DataRecord record : records) {
            insertUpdateToolRecord(record, wrId, context);

            record.setValue(WRTL_SYNC_TABLE + SQL_DOT + WR_ID, wrId);
            record.setValue(WRTL_SYNC_TABLE + SQL_DOT + MOB_IS_CHANGED, 0);
            record.setValue(WRTL_SYNC_TABLE + SQL_DOT + LAST_MODIFIED, System.currentTimeMillis());
            datasource.saveRecord(record);
        }
    }

    /**
     * Insert tool record from tool sync record.
     *
     * @param record - Tool Sync Record
     * @param wrId - Work Request Code
     * @param context - context
     */
    static void insertUpdateToolRecord(final DataRecord record, final int wrId,
            final EventHandlerContext context) {

        final JSONObject jsonToolRecord = buildWRTLJSONRecord(record, wrId, context);
        new WorkRequestHandler().saveWorkRequestTool(jsonToolRecord);
    }

    /**
     *
     * Builds a JSON Record to pass to the saveWorkRequestTool rule. This is not saving the status
     * code as this is only updated in Web Central
     *
     * @param record - Work Request Tool Sync Record
     * @param wrId - Work Request ID
     * @param context - context
     * @return jsonRecord
     */
    static JSONObject buildWRTLJSONRecord(final DataRecord record, final int wrId,
            final EventHandlerContext context) {

        final JSONObject jsonRecord = new JSONObject();

        jsonRecord.put(WRTL_TABLE + SQL_DOT + WR_ID, wrId);

        jsonRecord.put(WRTL_TABLE + SQL_DOT + TOOL_ID,
            record.getString(WRTL_SYNC_TABLE + SQL_DOT + TOOL_ID));

        jsonRecord.put(WRTL_TABLE + SQL_DOT + DATE_ASSIGNED,
            record.getDate(WRTL_SYNC_TABLE + SQL_DOT + DATE_ASSIGNED));

        final String timeAssigned =
                EventHandlerBase.formatFieldValue(context,
                    record.getValue(WRTL_SYNC_TABLE + SQL_DOT + TIME_ASSIGNED), TIME_FORMAT,
                    "time_assigned", false);

        jsonRecord.put(WRTL_TABLE + SQL_DOT + TIME_ASSIGNED, timeAssigned);
        final String timeStart =
                EventHandlerBase.formatFieldValue(context,
                    record.getValue(WRTL_SYNC_TABLE + SQL_DOT + TIME_START), TIME_FORMAT,
                    "time_start", false);
        final String timeEnd =
                EventHandlerBase.formatFieldValue(context,
                    record.getValue(WRTL_SYNC_TABLE + SQL_DOT + TIME_END), TIME_FORMAT, "time_end",
                    false);

        jsonRecord.put(WRTL_TABLE + SQL_DOT + TIME_START, timeStart);

        jsonRecord.put(WRTL_TABLE + SQL_DOT + TIME_END, timeEnd);

        jsonRecord.put(WRTL_TABLE + SQL_DOT + DATE_START,
            record.getDate(WRTL_SYNC_TABLE + SQL_DOT + DATE_START));

        jsonRecord.put(WRTL_TABLE + SQL_DOT + DATE_END,
            record.getDate(WRTL_SYNC_TABLE + SQL_DOT + DATE_END));

        jsonRecord.put(WRTL_TABLE + SQL_DOT + HOURS_EST,
            record.getDouble(WRTL_SYNC_TABLE + SQL_DOT + HOURS_EST));
        jsonRecord.put(WRTL_TABLE + SQL_DOT + HOURS_STRAIGHT,
            record.getDouble(WRTL_SYNC_TABLE + SQL_DOT + HOURS_STRAIGHT));

        return jsonRecord;
    }

    /**
     * Insert or update the wrtl records.
     *
     * @param userName - User name
     * @param modifiedRequestCodes set of work requests codes for work requests that have been
     *            previously modified. We update the tool cost only if the request is not in the
     *            set.
     */
    static void updateToolRecords(final String userName, final Set<Integer> modifiedRequestCodes) {
        final DataSource toolSyncDs =
                DataSourceFactory.createDataSourceForFields(WRTL_SYNC_TABLE, WRTL_SYNC_FIELDS);
        toolSyncDs.setContext();
        toolSyncDs.setMaxRecords(0);

        // Restrict to all tool records for a work request that have a change in the mobile data.
        toolSyncDs.addRestriction(Restrictions.eq(WRTL_SYNC_TABLE, MOB_IS_CHANGED, "1"));
        toolSyncDs.addRestriction(Restrictions.eq(WRTL_SYNC_TABLE, MOB_LOCKED_BY, userName));

        final List<DataRecord> records = toolSyncDs.getRecords();

        for (final DataRecord toolSyncRecord : records) {

            final DataSource toolDs =
                    DataSourceFactory.createDataSourceForFields(WRTL_TABLE, WRTL_FIELDS);

            final int wrId = toolSyncRecord.getInt(WRTL_SYNC_TABLE + SQL_DOT + WR_ID);
            toolDs.addRestriction(Restrictions.eq(WRTL_TABLE, WR_ID, wrId));

            toolDs.addRestriction(Restrictions.eq(WRTL_TABLE, TOOL_ID,
                toolSyncRecord.getString(WRTL_SYNC_TABLE + SQL_DOT + TOOL_ID)));

            // Get any tool record that meets the restriction
            final DataRecord toolRecord = toolDs.getRecord();

            // If there is no tool record create a new one from the sync record
            // If there is a tool record that corresponds to the sync record update its non primary
            // key values from the sync record
            if (toolRecord == null) {
                insertToolRecord(toolSyncRecord, wrId);
            } else {
                final DataRecord updatedToolRecord = updateToolRecord(toolSyncRecord, toolRecord);
                toolDs.saveRecord(updatedToolRecord);
            }

            // Update costs
            if (!modifiedRequestCodes.contains(wrId)) {
                final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
                new WorkRequestHandler().recalculateCosts(context, wrId);
                new WorkRequestHandler().recalculateEstCosts(context, wrId);
            }

            toolSyncRecord.setValue(WRTL_SYNC_TABLE + SQL_DOT + LAST_MODIFIED,
                System.currentTimeMillis());
            toolSyncRecord.setValue(WRTL_SYNC_TABLE + SQL_DOT + DELETED, 0);
            toolSyncRecord.setValue(WRTL_SYNC_TABLE + SQL_DOT + MOB_IS_CHANGED, 0);
            toolSyncDs.saveRecord(toolSyncRecord);

        }
    }

    /**
     * Create tool sync records from tool records for a specific work request id.
     *
     * @param mobUser - User name of craftsperson
     */
    static void createToolSyncRecords(final String mobUser) {
        insertNewToolSyncRecords(mobUser, WRTL_FIELDS);
    }

    /**
     * Inserts the tool records into the sync table.
     * 
     * @param userName - User Name
     * @param commonFields - fields shared between the sync and transaction table.
     */
    private static void insertNewToolSyncRecords(final String userName, final String[] commonFields) {
        final String fields = StringUtils.arrayToCommaDelimitedString(commonFields);
        final String selectFields =
                fields + "," + System.currentTimeMillis() + ",0,'" + userName + "',0";
        final String insertFields = fields + ",last_modified,deleted,mob_locked_by,mob_is_changed";

        final String sql =
                "INSERT INTO wrtl_sync("
                        + insertFields
                        + ") SELECT "
                        + selectFields
                        + SQL_FROM
                        + WRTL_TABLE
                        + " WHERE EXISTS"
                        + " (SELECT 1 FROM wr_sync WHERE wrtl.wr_id = wr_sync.wr_id AND wr_sync.mob_locked_by='"
                        + userName
                        + "'"
                        + ") AND NOT EXISTS(SELECT 1 FROM wrtl_sync WHERE wrtl_sync.wr_id=wrtl.wr_id AND wrtl_sync.tool_id=wrtl.tool_id AND wrtl_sync.mob_locked_by='"
                        + userName + "' "
                        + " AND wrtl_sync.date_assigned=wrtl.date_assigned AND wrtl_sync.time_assigned=wrtl.time_assigned)";

        SqlUtils.executeUpdate(WRTL_TABLE, sql);
    }

    /**
     * Insert a new tool record from a mobile tool sync record.
     *
     * @param record - Tool Sync record
     * @param wrId - Work Request Code
     */
    static void insertToolRecord(final DataRecord record, final int wrId) {
        // First get the tool so we can get the hourly rates to calculate the costs when
        // inserting the tool record
        final String tlId = record.getString(WRTL_SYNC_TABLE + SQL_DOT + TOOL_ID);

        // Get the tool's hourly rate. Note that we are only calculating the straight rate.
        final Double rateHourly = getToolRate(tlId);

        final DataSource datasource =
                DataSourceFactory.createDataSourceForFields(WRTL_TABLE, WRTL_FIELDS);

        final DataRecord newRecord = datasource.createNewRecord();

        // Set the primary key fields for the wrtl table
        newRecord.setValue(WRTL_TABLE + SQL_DOT + TOOL_ID, tlId);
        newRecord.setValue(WRTL_TABLE + SQL_DOT + WR_ID, wrId);

        // Set the date fields as per the values in the mobile
        final String[] dateFields = { DATE_ASSIGNED, DATE_END, DATE_START };
        for (final String fieldName : dateFields) {
            newRecord.setValue(WRTL_TABLE + SQL_DOT + fieldName,
                record.getDate(WRTL_SYNC_TABLE + SQL_DOT + fieldName));
        }

        // Set the time field as per the values in the mobile
        final String[] timeFields = { TIME_ASSIGNED, TIME_END, TIME_START };
        for (final String fieldName : timeFields) {
            newRecord.setValue(WRTL_TABLE + SQL_DOT + fieldName,
                record.getValue(WRTL_SYNC_TABLE + SQL_DOT + fieldName));
        }

        final String[] doubleFields = { HOURS_EST, HOURS_STRAIGHT };
        for (final String fieldName : doubleFields) {
            newRecord.setValue(WRTL_TABLE + SQL_DOT + fieldName,
                record.getDouble(WRTL_SYNC_TABLE + SQL_DOT + fieldName));
        }

        // Get value of estimated tool hours and straight hours
        final double hoursEst = record.getDouble(WRTL_SYNC_TABLE + SQL_DOT + HOURS_EST);
        final double hoursStraight = record.getDouble(WRTL_SYNC_TABLE + SQL_DOT + HOURS_STRAIGHT);

        // Calculate estimated cost and straight cost
        final double costEstimated = hoursEst * rateHourly;
        final double costStraight = hoursStraight * rateHourly;

        // Set the estimated cost, the straight cost, and the total cost
        newRecord.setValue(WRTL_TABLE + SQL_DOT + COST_ESTIMATED, costEstimated);
        newRecord.setValue(WRTL_TABLE + SQL_DOT + COST_STRAIGHT, costStraight);

        // Total tool hours and total tool cost is equal to the straight hours and straight cost on
        // the mobile
        newRecord.setValue(WRTL_TABLE + SQL_DOT + HOURS_TOTAL, hoursStraight);
        newRecord.setValue(WRTL_TABLE + SQL_DOT + COST_TOTAL, costStraight);

        datasource.saveRecord(newRecord);

    }

    /**
     * Update the fields in a tool record from the updated values in the corresponding tool sync
     * record.
     *
     * @param toolSyncRecord - Tool Sync record
     * @param toolRecord - Tool record to update
     * @return toolRecord - Updated Tool record
     */
    static DataRecord updateToolRecord(final DataRecord toolSyncRecord, final DataRecord toolRecord) {

        // Set the date fields as per the values in the mobile
        final String[] dateFields = { DATE_END, DATE_START };
        for (final String fieldName : dateFields) {
            toolRecord.setValue(WRTL_TABLE + SQL_DOT + fieldName,
                toolSyncRecord.getDate(WRTL_SYNC_TABLE + SQL_DOT + fieldName));
        }

        // Set the time field as per the values in the mobile
        final String[] timeFields = { TIME_END, TIME_START };
        for (final String fieldName : timeFields) {
            toolRecord.setValue(WRTL_TABLE + SQL_DOT + fieldName,
                toolSyncRecord.getValue(WRTL_SYNC_TABLE + SQL_DOT + fieldName));
        }

        // Get the tool's hourly rate. Note that we are only calculating the straight rate.
        final Double rateHourly =
                getToolRate(toolSyncRecord.getString(WRTL_SYNC_TABLE + SQL_DOT + TOOL_ID));

        // Get the updated estimated tool hours and the straight hours
        final double hoursEst = toolSyncRecord.getDouble(WRTL_SYNC_TABLE + SQL_DOT + HOURS_EST);
        final double hoursStraight =
                toolSyncRecord.getDouble(WRTL_SYNC_TABLE + SQL_DOT + HOURS_STRAIGHT);

        // Calculate the estimated tool and straight tool costs
        final double costEstimated = hoursEst * rateHourly;
        final double costStraight = hoursStraight * rateHourly;

        // Set the user entered values for estimated hours and straight hours in the tool record
        toolRecord.setValue(WRTL_TABLE + SQL_DOT + HOURS_EST, hoursEst);
        toolRecord.setValue(WRTL_TABLE + SQL_DOT + HOURS_STRAIGHT, hoursStraight);
        toolRecord.setValue(WRTL_TABLE + SQL_DOT + HOURS_TOTAL, hoursStraight);

        // Set the calculated values for estimated cost, straight cost, the total costs
        toolRecord.setValue(WRTL_TABLE + SQL_DOT + COST_ESTIMATED, costEstimated);
        toolRecord.setValue(WRTL_TABLE + SQL_DOT + COST_STRAIGHT, costStraight);
        toolRecord.setValue(WRTL_TABLE + SQL_DOT + COST_TOTAL, costStraight);

        return toolRecord;
    }

    /**
     * Insert a new tool sync record from a tool record.
     *
     * @param record - Tool record
     * @param wrId - Work Request Code
     * @param mobUser - User name of craftsperson
     */
    static void insertToolSyncRecord(final DataRecord record, final int wrId, final String mobUser) {
        final DataSource datasource =
                DataSourceFactory.createDataSourceForFields(WRTL_SYNC_TABLE, WRTL_SYNC_FIELDS);

        final DataRecord newRecord = datasource.createNewRecord();

        final String[] textFields = { TOOL_ID };
        for (final String fieldName : textFields) {
            newRecord.setValue(WRTL_SYNC_TABLE + SQL_DOT + fieldName,
                record.getString(WRTL_TABLE + SQL_DOT + fieldName));
        }

        final String[] dateFields = { DATE_ASSIGNED, DATE_END, DATE_START };
        for (final String fieldName : dateFields) {
            newRecord.setValue(WRTL_SYNC_TABLE + SQL_DOT + fieldName,
                record.getDate(WRTL_TABLE + SQL_DOT + fieldName));
        }

        // Assume that costs are calculated in Web Central
        final String[] doubleFields =
                { HOURS_EST, HOURS_STRAIGHT, COST_ESTIMATED, COST_STRAIGHT, COST_TOTAL };
        for (final String fieldName : doubleFields) {
            newRecord.setValue(WRTL_SYNC_TABLE + SQL_DOT + fieldName,
                record.getDouble(WRTL_TABLE + SQL_DOT + fieldName));
        }

        final String[] timeFields = { TIME_ASSIGNED, TIME_END, TIME_START };
        for (final String fieldName : timeFields) {
            newRecord.setValue(WRTL_SYNC_TABLE + SQL_DOT + fieldName,
                record.getValue(WRTL_TABLE + SQL_DOT + fieldName));
        }

        newRecord.setValue(WRTL_SYNC_TABLE + SQL_DOT + WR_ID, wrId);

        newRecord.setValue(WRTL_SYNC_TABLE + SQL_DOT + MOB_LOCKED_BY, mobUser);

        datasource.saveRecord(newRecord);

    }

    /**
     * Get the Tool's hourly rate.
     *
     * @param tlId - Tool Code
     * @return rateHourly - String with the straight hourly rate
     */
    private static double getToolRate(final String tlId) {

        final DataSource tlDataSource =
                DataSourceFactory.createDataSourceForFields(TL_TABLE, TL_FIELDS);

        tlDataSource.addRestriction(Restrictions.eq(TL_TABLE, TOOL_ID, tlId));

        final DataRecord tlRecord = tlDataSource.getRecord();

        final String toolType = tlRecord.getString(TL_TABLE + SQL_DOT + TOOL_TYPE);

        Double rateHourly = 0.0;

        if (toolType != null && !(toolType.length() == 0)) {

            final DataSource ttDataSource =
                    DataSourceFactory.createDataSourceForFields(TT_TABLE, TT_FIELDS);

            ttDataSource.addRestriction(Restrictions.eq(TT_TABLE, TOOL_TYPE, toolType));

            final DataRecord ttRecord = ttDataSource.getRecord();

            rateHourly = ttRecord.getDouble(TT_TABLE + SQL_DOT + RATE_HOURLY);
        }
        return rateHourly;
    }
}