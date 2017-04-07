package com.archibus.app.helpdesk.mobile.maintenance.service.impl;

import static com.archibus.app.common.mobile.util.FieldNameConstantsCommon.*;
import static com.archibus.app.common.mobile.util.FieldNameConstantsMaintenance.*;
import static com.archibus.app.common.mobile.util.ServiceConstants.*;
import static com.archibus.app.common.mobile.util.TableNameConstants.*;

import java.util.List;

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
 * Provides supporting methods related to synchronizing the data in the parts tables. Supports the
 * MaintenanceMobileService class.
 *
 * @author Constantine Kriezis
 * @since 21.1
 *
 */
@SuppressWarnings({ "PMD.AvoidUsingSql" })
final class MaintenanceMobilePartsUpdate {

    /**
     * Hide default constructor.
     */
    private MaintenanceMobilePartsUpdate() {
    }

    /**
     * Create new part records from the part sync table.
     *
     * @param wrId - Work Request Code
     * @param mobWrId - Mobile Work Request Code
     */
    static void createPartRecords(final int wrId, final int mobWrId) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();

        final DataSource datasource =
                DataSourceFactory.createDataSourceForFields(WRPT_SYNC_TABLE, WRPT_SYNC_FIELDS);
        datasource.setContext();
        datasource.setMaxRecords(0);

        datasource.addRestriction(Restrictions.eq(WRPT_SYNC_TABLE, MOB_WR_ID, mobWrId));

        final List<DataRecord> records = datasource.getRecords();

        for (final DataRecord record : records) {

            insertUpdatePartRecord(record, wrId, context);
            record.setValue(WRPT_SYNC_TABLE + SQL_DOT + WR_ID, wrId);
            record.setValue(WRPT_SYNC_TABLE + SQL_DOT + MOB_IS_CHANGED, 0);
            record.setValue(WRPT_SYNC_TABLE + SQL_DOT + LAST_MODIFIED, System.currentTimeMillis());
            datasource.saveRecord(record);
        }

    }

    /**
     * Update part records for records that have been modified on the client.
     *
     * @param userName - User name.
     */
    static void updatePartRecords(final String userName) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();

        final DataSource partSyncDs =
                DataSourceFactory.createDataSourceForFields(WRPT_SYNC_TABLE, WRPT_SYNC_FIELDS);
        partSyncDs.setContext();
        partSyncDs.setMaxRecords(0);

        partSyncDs.addRestriction(Restrictions.eq(WRPT_SYNC_TABLE, MOB_IS_CHANGED, 1));
        partSyncDs.addRestriction(Restrictions.eq(WRPT_SYNC_TABLE, MOB_LOCKED_BY, userName));

        final List<DataRecord> records = partSyncDs.getRecords();

        // Go through all the part sync records for this work request
        for (final DataRecord partSyncRecord : records) {
            final int wrId = partSyncRecord.getInt(WRPT_SYNC_TABLE + SQL_DOT + WR_ID);
            // The wr costs are calculated by the saveWorkRequestPart function. There is
            // no need to calculate the costs here.
            insertUpdatePartRecord(partSyncRecord, wrId, context);

            partSyncRecord.setValue(WRPT_SYNC_TABLE + SQL_DOT + MOB_IS_CHANGED, 0);
            partSyncRecord.setValue(WRPT_SYNC_TABLE + SQL_DOT + LAST_MODIFIED,
                System.currentTimeMillis());
            partSyncRecord.setValue(WRPT_SYNC_TABLE + SQL_DOT + DELETED, 0);
            partSyncDs.saveRecord(partSyncRecord);

        }
    }

    /**
     * Create new part sync records from the part table.
     *
     * @param cfUser - Craftsperson's User Name
     */
    static void createPartSyncRecords(final String cfUser) {
        insertNewPartSyncRecords(cfUser, WRPT_FIELDS);
    }

    /**
     * Inserts records into the part sync table.
     * 
     * @param userName - User name.
     * @param commonFields - fields shared between the sync and transaction table.
     */
    private static void insertNewPartSyncRecords(final String userName, final String[] commonFields) {
        final String fields = StringUtils.arrayToCommaDelimitedString(commonFields);
        final String selectFields =
                fields + "," + System.currentTimeMillis() + ",0,'" + userName + "',0";
        final String insertFields = fields + ",last_modified,deleted,mob_locked_by,mob_is_changed";

        final String sql =
                "INSERT INTO wrpt_sync("
                        + insertFields
                        + ") SELECT "
                        + selectFields
                        + SQL_FROM
                        + WRPT_TABLE
                        + " WHERE EXISTS(SELECT 1 FROM wr_sync WHERE wrpt.wr_id = wr_sync.wr_id AND wr_sync.mob_locked_by='"
                        + userName
                        + "'"
                        + ") AND NOT EXISTS(SELECT 1 FROM wrpt_sync WHERE wrpt_sync.wr_id=wrpt.wr_id AND wrpt_sync.mob_locked_by='"
                        + userName + "' "
                        + " AND wrpt_sync.part_id=wrpt.part_id AND wrpt_sync.date_assigned=wrpt.date_assigned AND wrpt_sync.time_assigned=wrpt.time_assigned)";

        SqlUtils.executeUpdate(WRPT_SYNC_TABLE, sql);
    }

    /**
     * Insert part record from part sync record.
     *
     * @param record - Part Sync Record
     * @param wrId - Work Request Code
     * @param context - context
     */
    static void insertUpdatePartRecord(final DataRecord record, final int wrId,
            final EventHandlerContext context) {

        final JSONObject jsonPartRecord = buildWRPTJSONRecord(record, wrId, context);
        new WorkRequestHandler().saveWorkRequestPartForMPSL(jsonPartRecord);
    }

    /**
     * Insert part sync record from part record.
     *
     * @param record - Part Record
     * @param wrId - Work Request Code
     * @param cfUser - Craftsperson's User Name
     */
    static void insertPartSyncRecord(final DataRecord record, final Integer wrId,
            final String cfUser) {
        final DataSource datasource =
                DataSourceFactory.createDataSourceForFields(WRPT_SYNC_TABLE, WRPT_SYNC_FIELDS);

        final DataRecord newRecord = datasource.createNewRecord();

        final String[] textFields = { COMMENTS, PART_ID, STATUS };
        for (final String fieldName : textFields) {
            newRecord.setValue(WRPT_SYNC_TABLE + SQL_DOT + fieldName,
                record.getString(WRPT_TABLE + SQL_DOT + fieldName));
        }

        final String[] doubleFields =
            { COST_ACTUAL, COST_ESTIMATED, QTY_ACTUAL, QTY_ESTIMATED, QTY_PICKED };
        for (final String fieldName : doubleFields) {
            newRecord.setValue(WRPT_SYNC_TABLE + SQL_DOT + fieldName,
                record.getDouble(WRPT_TABLE + SQL_DOT + fieldName));
        }

        newRecord.setValue(WRPT_SYNC_TABLE + SQL_DOT + DATE_ASSIGNED,
            record.getDate(WRPT_TABLE + SQL_DOT + DATE_ASSIGNED));

        newRecord.setValue(WRPT_SYNC_TABLE + SQL_DOT + TIME_ASSIGNED,
            record.getValue(WRPT_TABLE + SQL_DOT + TIME_ASSIGNED));

        newRecord.setValue(WRPT_SYNC_TABLE + SQL_DOT + STORAGE_LOCATION_ID,
            record.getValue(WRPT_TABLE + SQL_DOT + STORAGE_LOCATION_ID));

        newRecord.setValue(WRPT_SYNC_TABLE + SQL_DOT + WR_ID, wrId);

        newRecord.setValue(WRPT_SYNC_TABLE + SQL_DOT + MOB_LOCKED_BY, cfUser);

        datasource.saveRecord(newRecord);

        // TODO (VT) Why commit?
        datasource.commit();
    }

    /**
     *
     * Builds a JSON Record to pass to the saveWorkRequestPart rule. This is not saving the status
     * code as this is only updated in Web Central
     *
     * @param record - Work Request Part Sync Record
     * @param wrId - Work Request ID
     * @param context - context
     * @return jsonRecord
     */
    static JSONObject buildWRPTJSONRecord(final DataRecord record, final int wrId,
            final EventHandlerContext context) {

        final JSONObject jsonRecord = new JSONObject();

        jsonRecord.put(WRPT_TABLE + SQL_DOT + WR_ID, wrId);

        jsonRecord.put(WRPT_TABLE + SQL_DOT + PART_ID,
            record.getString(WRPT_SYNC_TABLE + SQL_DOT + PART_ID));

        jsonRecord.put(WRPT_TABLE + SQL_DOT + DATE_ASSIGNED,
            record.getDate(WRPT_SYNC_TABLE + SQL_DOT + DATE_ASSIGNED));


        final String timeAssigned =
                EventHandlerBase.formatFieldValue(context,
                    record.getValue(WRPT_SYNC_TABLE + SQL_DOT + TIME_ASSIGNED), "java.sql.Time",
                    "time_assigned", false);

        jsonRecord.put(WRPT_TABLE + SQL_DOT + TIME_ASSIGNED, timeAssigned);

        jsonRecord.put(WRPT_TABLE + SQL_DOT + QTY_ESTIMATED,
            record.getDouble(WRPT_SYNC_TABLE + SQL_DOT + QTY_ESTIMATED));

        jsonRecord.put(WRPT_TABLE + SQL_DOT + QTY_ACTUAL,
            record.getDouble(WRPT_SYNC_TABLE + SQL_DOT + QTY_ACTUAL));

        jsonRecord.put(WRPT_TABLE + SQL_DOT + QTY_PICKED,
            record.getDouble(WRPT_SYNC_TABLE + SQL_DOT + QTY_PICKED));

        jsonRecord.put(WRPT_TABLE + SQL_DOT + COST_ESTIMATED,
            record.getDouble(WRPT_SYNC_TABLE + SQL_DOT + COST_ESTIMATED));

        jsonRecord.put(WRPT_TABLE + SQL_DOT + COST_ACTUAL,
            record.getDouble(WRPT_SYNC_TABLE + SQL_DOT + COST_ACTUAL));

        jsonRecord.put(WRPT_TABLE + SQL_DOT + STORAGE_LOCATION_ID,
            record.getString(WRPT_SYNC_TABLE + SQL_DOT + STORAGE_LOCATION_ID));
        // KB#3051024 Work Request Part Comments Values are not Written to the Web Central Table
        jsonRecord.put(WRPT_TABLE + SQL_DOT + COMMENTS,
            record.getString(WRPT_SYNC_TABLE + SQL_DOT + COMMENTS));
        return jsonRecord;
    }
}