package com.archibus.app.helpdesk.mobile.maintenance.service.impl;

import static com.archibus.app.common.mobile.util.FieldNameConstantsCommon.*;
import static com.archibus.app.common.mobile.util.FieldNameConstantsMaintenance.*;
import static com.archibus.app.common.mobile.util.ServiceConstants.*;
import static com.archibus.app.common.mobile.util.TableNameConstants.*;

import java.util.*;

import org.springframework.util.StringUtils;

import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.eventhandler.ondemandwork.WorkRequestHandler;
import com.archibus.jobmanager.EventHandlerContext;

/**
 * Provides supporting methods related to synchronizing the data in the Other Costs tables. Supports
 * the MaintenanceMobileService class.
 *
 * @author Constantine Kriezis
 * @since 21.1
 *
 */
@SuppressWarnings({ "PMD.AvoidUsingSql" })
final class MaintenanceMobileCostsUpdate {

    /**
     * Hide default constructor.
     */
    private MaintenanceMobileCostsUpdate() {
    }

    /**
     * Create work request cost records from the cost sync table.
     *
     * @param wrId - Work Request Code
     * @param mobWrId - Mobile Work Request Code
     */
    static void createOtherCostRecords(final int wrId, final int mobWrId) {
        final DataSource datasource =
                DataSourceFactory.createDataSourceForFields(WR_OTHER_SYNC_TABLE,
                    WR_OTHER_SYNC_FIELDS);
        datasource.setContext();
        datasource.setMaxRecords(0);

        datasource.addRestriction(Restrictions.eq(WR_OTHER_SYNC_TABLE, MOB_WR_ID, mobWrId));

        final List<DataRecord> records = datasource.getRecords();

        for (final DataRecord record : records) {
            insertOtherCostRecord(record, wrId);

            record.setValue(WR_OTHER_SYNC_TABLE + SQL_DOT + WR_ID, wrId);
            record.setValue(WR_OTHER_SYNC_TABLE + SQL_DOT + MOB_IS_CHANGED, 0);
            record.setValue(WR_OTHER_SYNC_TABLE + SQL_DOT + LAST_MODIFIED,
                System.currentTimeMillis());
            record.setValue(WR_OTHER_SYNC_TABLE + SQL_DOT + DELETED, 0);
            datasource.saveRecord(record);
        }
    }

    /**
     * Update the cost records in the transaction table where the records have changed on the
     * client.
     * 
     * @param userName - User Name
     * @param modifiedRequestCodes - set of work request codes that have been previously modified.
     *            Only update the cost data associated with the record if the code is not contained
     *            in the set.
     */
    static void updateCostRecords(final String userName, final Set<Integer> modifiedRequestCodes) {
        final DataSource costSyncDs =
                DataSourceFactory.createDataSourceForFields(WR_OTHER_SYNC_TABLE,
                    WR_OTHER_SYNC_FIELDS);
        costSyncDs.setContext();
        costSyncDs.setMaxRecords(0);

        costSyncDs.addRestriction(Restrictions.eq(WR_OTHER_SYNC_TABLE, MOB_IS_CHANGED, 1));
        costSyncDs.addRestriction(Restrictions.eq(WR_OTHER_SYNC_TABLE, MOB_LOCKED_BY, userName));

        final List<DataRecord> records = costSyncDs.getRecords();

        for (final DataRecord costSyncRecord : records) {

            final int wrId = costSyncRecord.getInt(WR_OTHER_SYNC_TABLE + SQL_DOT + WR_ID);

            // Check if there is a corresponding cost record
            final DataSource costDs =
                    DataSourceFactory.createDataSourceForFields(WR_OTHER_TABLE, WR_OTHER_FIELDS);

            costDs.addRestriction(Restrictions.eq(WR_OTHER_TABLE, WR_ID, wrId));

            costDs.addRestriction(Restrictions.eq(WR_OTHER_TABLE, DATE_USED,
                costSyncRecord.getDate(WR_OTHER_SYNC_TABLE + SQL_DOT + DATE_USED)));

            costDs.addRestriction(Restrictions.eq(WR_OTHER_TABLE, OTHER_RS_TYPE,
                costSyncRecord.getString(WR_OTHER_SYNC_TABLE + SQL_DOT + OTHER_RS_TYPE)));

            // Get any cost record that meets the restriction
            final DataRecord costRecord = costDs.getRecord();

            // If there is no cost record insert a new one, else update the existing one
            if (costRecord == null) {
                insertOtherCostRecord(costSyncRecord, wrId);
            } else {
                final DataRecord updateRecord = updateCostRecord(costSyncRecord, costRecord);
                costDs.saveRecord(updateRecord);
            }

            // Update the Work Request costs if this work request is not contained in the list of
            // modified wr records
            if (!modifiedRequestCodes.contains(wrId)) {
                final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
                new WorkRequestHandler().recalculateCosts(context, wrId);
                new WorkRequestHandler().recalculateEstCosts(context, wrId);
            }

            costSyncRecord.setValue(WR_OTHER_SYNC_TABLE + SQL_DOT + LAST_MODIFIED,
                System.currentTimeMillis());
            costSyncRecord.setValue(WR_OTHER_SYNC_TABLE + SQL_DOT + MOB_IS_CHANGED, 0);
            costSyncRecord.setValue(WR_OTHER_SYNC_TABLE + SQL_DOT + DELETED, 0);
            costSyncDs.saveRecord(costSyncRecord);
        }
    }

    /**
     * Create new work request cost records from the cost sync table.
     *
     * @param cfUser - User name of craftsperson
     */
    static void createOtherCostSyncRecords(final String cfUser) {
        insertNewCostSyncRecords(cfUser, WR_OTHER_FIELDS);
    }

    /**
     * Inserts the cost records into the sync table.
     *
     * @param userName - User name
     * @param commonFields - fields in both the transaction and sync table.
     */
    private static void insertNewCostSyncRecords(final String userName, final String[] commonFields) {
        final String fields = StringUtils.arrayToCommaDelimitedString(commonFields);
        final String selectFields =
                fields + "," + System.currentTimeMillis() + ",0,'" + userName + "',0";
        final String insertFields = fields + ",last_modified,deleted,mob_locked_by,mob_is_changed";

        final String sql =
                "INSERT INTO wr_other_sync("
                        + insertFields
                        + ") SELECT "
                        + selectFields
                        + SQL_FROM
                        + WR_OTHER_TABLE
                        + " WHERE EXISTS"
                        + " (SELECT 1 FROM wr_sync WHERE wr_other.wr_id = wr_sync.wr_id AND wr_sync.mob_locked_by='"
                        + userName
                        + "'"
                        + ") AND NOT EXISTS(SELECT 1 FROM wr_other_sync WHERE wr_other_sync.wr_id=wr_other.wr_id AND wr_other_sync.mob_locked_by='"
                        + userName + "' "
                        + " AND wr_other_sync.date_used=wr_other.date_used AND wr_other_sync.other_rs_type=wr_other.other_rs_type)";

        SqlUtils.executeUpdate(WR_OTHER_SYNC_TABLE, sql);
    }

    /**
     * Insert a work request cost record from a cost sync record.
     *
     * @param record - Other Cost Sync record
     * @param wrId - Work Request Code
     */
    static void insertOtherCostRecord(final DataRecord record, final int wrId) {
        final DataSource datasource =
                DataSourceFactory.createDataSourceForFields(WR_OTHER_TABLE, WR_OTHER_FIELDS);

        final DataRecord newRecord = datasource.createNewRecord();

        final String[] textFields = { DESCRIPTION, OTHER_RS_TYPE, UNITS_USED };
        for (final String fieldName : textFields) {
            newRecord.setValue(WR_OTHER_TABLE + SQL_DOT + fieldName,
                record.getString(WR_OTHER_SYNC_TABLE + SQL_DOT + fieldName));
        }

        final String[] doubleFields = { COST_ESTIMATED, COST_TOTAL, QTY_USED };
        for (final String fieldName : doubleFields) {
            newRecord.setValue(WR_OTHER_TABLE + SQL_DOT + fieldName,
                record.getDouble(WR_OTHER_SYNC_TABLE + SQL_DOT + fieldName));
        }

        newRecord.setValue(WR_OTHER_TABLE + SQL_DOT + DATE_USED,
            record.getDate(WR_OTHER_SYNC_TABLE + SQL_DOT + DATE_USED));

        newRecord.setValue(WR_OTHER_TABLE + SQL_DOT + WR_ID, wrId);

        datasource.saveRecord(newRecord);

    }

    /**
     * Update a work request cost record from a cost sync record.
     *
     * @param costSyncRecord - Cost Sync record
     * @param costRecord - Cost record
     * @return costRecord - Cost record
     */
    static DataRecord updateCostRecord(final DataRecord costSyncRecord, final DataRecord costRecord) {

        // Only update secondary fields
        final String[] textFields = { DESCRIPTION, UNITS_USED };
        for (final String fieldName : textFields) {
            costRecord.setValue(WR_OTHER_TABLE + SQL_DOT + fieldName,
                costSyncRecord.getString(WR_OTHER_SYNC_TABLE + SQL_DOT + fieldName));
        }

        final String[] doubleFields = { COST_ESTIMATED, COST_TOTAL, QTY_USED };
        for (final String fieldName : doubleFields) {
            costRecord.setValue(WR_OTHER_TABLE + SQL_DOT + fieldName,
                costSyncRecord.getDouble(WR_OTHER_SYNC_TABLE + SQL_DOT + fieldName));
        }

        return costRecord;
    }

    /**
     * Insert a cost sync record from a cost record.
     *
     * @param record - Cost record
     * @param wrId - Work Request Code
     * @param cfUser - User name of craftsperson
     */
    static void insertOtherCostSyncRecord(final DataRecord record, final int wrId,
            final String cfUser) {
        final DataSource datasource =
                DataSourceFactory.createDataSourceForFields(WR_OTHER_SYNC_TABLE,
                    WR_OTHER_SYNC_FIELDS);

        final DataRecord newRecord = datasource.createNewRecord();

        final String[] textFields = { DESCRIPTION, OTHER_RS_TYPE, UNITS_USED };
        for (final String fieldName : textFields) {
            newRecord.setValue(WR_OTHER_SYNC_TABLE + SQL_DOT + fieldName,
                record.getString(WR_OTHER_TABLE + SQL_DOT + fieldName));
        }

        final String[] doubleFields = { COST_ESTIMATED, COST_TOTAL, QTY_USED };
        for (final String fieldName : doubleFields) {
            newRecord.setValue(WR_OTHER_SYNC_TABLE + SQL_DOT + fieldName,
                record.getDouble(WR_OTHER_TABLE + SQL_DOT + fieldName));
        }

        newRecord.setValue(WR_OTHER_SYNC_TABLE + SQL_DOT + DATE_USED,
            record.getDate(WR_OTHER_TABLE + SQL_DOT + DATE_USED));

        newRecord.setValue(WR_OTHER_SYNC_TABLE + SQL_DOT + WR_ID, wrId);

        newRecord.setValue(WR_OTHER_SYNC_TABLE + SQL_DOT + MOB_LOCKED_BY, cfUser);

        datasource.saveRecord(newRecord);

        // TODO (VT) Why commit?
        datasource.commit();
    }
}