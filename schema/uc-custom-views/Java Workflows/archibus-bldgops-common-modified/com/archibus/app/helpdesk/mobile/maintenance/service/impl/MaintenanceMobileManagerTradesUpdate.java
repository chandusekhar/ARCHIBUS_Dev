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
 * Provides supporting methods related to synchronizing the data in the Trades tables. Supports the
 * MaintenanceMobileService class.
 *
 * @author Constantine Kriezis
 * @since 21.3
 *
 */
@SuppressWarnings({ "PMD.AvoidUsingSql" })
final class MaintenanceMobileManagerTradesUpdate {

    /**
     * Hide default constructor.
     */
    private MaintenanceMobileManagerTradesUpdate() {
    }

    /**
     * Updates the trade records that have been modified on the client.
     *
     * @param userName - User name.
     * @param modifiedRequestCodes - set of request codes for requests that have been previously
     *            modified. Only update the cost data for requests that are not contained in the
     *            list.
     */
    static void updateTradeRecords(final String userName, final Set<Integer> modifiedRequestCodes) {
        final DataSource tradeSyncDs =
                DataSourceFactory.createDataSourceForFields(WRTR_SYNC_TABLE, WRTR_SYNC_FIELDS);
        tradeSyncDs.setContext();
        tradeSyncDs.setMaxRecords(0);

        // Restrict to all trade records for a work request that have a change in the mobile data.
        tradeSyncDs.addRestriction(Restrictions.eq(WRTR_SYNC_TABLE, MOB_IS_CHANGED, 1));
        tradeSyncDs.addRestriction(Restrictions.eq(WRTR_SYNC_TABLE, MOB_LOCKED_BY, userName));

        final List<DataRecord> records = tradeSyncDs.getRecords();

        // Go through all the trade sync records for this work request code
        for (final DataRecord tradeSyncRecord : records) {

            final DataSource tradeDs =
                    DataSourceFactory.createDataSourceForFields(WRTR_TABLE, WRTR_FIELDS);

            int wrId = tradeSyncRecord.getInt(WRTR_SYNC_TABLE + SQL_DOT + WR_ID);
            if (wrId == 0) {
                final int mobWrId = tradeSyncRecord.getInt(WRTR_SYNC_TABLE + SQL_DOT + MOB_WR_ID);
                wrId = MaintenanceMobileUtility.getWrIdFromSyncTable(mobWrId);
            }

            tradeDs.addRestriction(Restrictions.eq(WRTR_TABLE, WR_ID, wrId));

            tradeDs.addRestriction(Restrictions.eq(WRTR_TABLE, TR_ID,
                tradeSyncRecord.getString(WRTR_SYNC_TABLE + SQL_DOT + TR_ID)));

            // Get any trade record that meets the restriction
            final DataRecord tradeRecord = tradeDs.getRecord();

            // If there is no trade record create a new one from the sync record
            // If there is a trade record that corresponds to the sync record update its non primary
            // key values from the sync record
            if (tradeRecord == null) {
                insertTradeRecord(tradeSyncRecord, wrId);
            } else {
                final DataRecord updatedTradeRecord =
                        updateTradeRecord(tradeSyncRecord, tradeRecord);

                tradeDs.saveRecord(updatedTradeRecord);
            }

            // Update costs
            // TODO: Do we need to calculate costs for wrtr records?
            if (!modifiedRequestCodes.contains(wrId)) {
                final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
                new WorkRequestHandler().recalculateCosts(context, wrId);
                new WorkRequestHandler().recalculateEstCosts(context, wrId);
            }

            tradeSyncRecord.setValue(WRTR_SYNC_TABLE + SQL_DOT + WR_ID, wrId);
            tradeSyncRecord.setValue(WRTR_SYNC_TABLE + SQL_DOT + MOB_IS_CHANGED, 0);
            tradeSyncRecord.setValue(WRTR_SYNC_TABLE + SQL_DOT + LAST_MODIFIED,
                System.currentTimeMillis());
            tradeSyncDs.saveRecord(tradeSyncRecord);
        }
    }

    /**
     * Create the trade records in the trade sync table.
     * 
     * @param mobUser - User name.
     */
    static void createTradeSyncRecords(final String mobUser) {
        insertNewTradeSyncRecords(mobUser, WRTR_FIELDS);
    }

    /**
     * Inserts the records into the trade sync table.
     * 
     * @param userName - User name.
     * @param commonFields - fields shared between the sync and transaction tables.
     */
    private static void insertNewTradeSyncRecords(final String userName, final String[] commonFields) {

        final String fields = StringUtils.arrayToCommaDelimitedString(commonFields);
        final String selectFields =
                fields + "," + System.currentTimeMillis() + ",0,'" + userName + "',0";
        final String insertFields = fields + ",last_modified,deleted,mob_locked_by,mob_is_changed";

        final String sql =
                "INSERT INTO wrtr_sync("
                        + insertFields
                        + ") SELECT "
                        + selectFields
                        + SQL_FROM
                        + WRTR_TABLE
                        + " WHERE EXISTS"
                        + " (SELECT 1 FROM wr_sync WHERE wrtr.wr_id = wr_sync.wr_id AND wr_sync.mob_locked_by="
                        + SqlUtils.formatValueForSql(userName)
                        + ") AND NOT EXISTS(SELECT 1 FROM wrtr_sync where wrtr_sync.wr_id=wrtr.wr_id AND wrtr_sync.tr_id = wrtr.tr_id AND wrtr_sync.mob_locked_by='"
                         + userName + "' "
                        + ")";

        SqlUtils.executeUpdate(WRTR_SYNC_TABLE, sql);

    }

    /**
     * Insert a new trade record from a mobile trade sync record.
     *
     * @param record - Trade Sync record
     * @param wrId - Work Request Code
     */
    static void insertTradeRecord(final DataRecord record, final int wrId) {
        // First get the trade so we can get the hourly rates to calculate the costs when
        // inserting the trade record
        final String trId = record.getString(WRTR_SYNC_TABLE + SQL_DOT + TR_ID);

        // Get the trade's hourly rate. Note that we are only calculating the straight rate.
        final Double rateHourly = getTrRate(trId);

        final DataSource datasource =
                DataSourceFactory.createDataSourceForFields(WRTR_TABLE, WRTR_FIELDS);

        final DataRecord newRecord = datasource.createNewRecord();

        // Set the primary key fields for the wrtr table
        newRecord.setValue(WRTR_TABLE + SQL_DOT + TR_ID, trId);
        newRecord.setValue(WRTR_TABLE + SQL_DOT + WR_ID, wrId);

        // Set the date_assigned field as per the value in the mobile
        final String[] dateFields = { DATE_ASSIGNED };
        for (final String fieldName : dateFields) {
            newRecord.setValue(WRTR_TABLE + SQL_DOT + fieldName,
                record.getDate(WRTR_SYNC_TABLE + SQL_DOT + fieldName));
        }

        // Set the time_assigned field as per the value in the mobile
        final String[] timeFields = { TIME_ASSIGNED };
        for (final String fieldName : timeFields) {
            newRecord.setValue(WRTR_TABLE + SQL_DOT + fieldName,
                record.getValue(WRTR_SYNC_TABLE + SQL_DOT + fieldName));
        }

        // Get value of estimated trade hours
        final double hoursEst = record.getDouble(WRTR_SYNC_TABLE + SQL_DOT + HOURS_EST);

        // Calculate estimated cost
        final double costEstimated = hoursEst * rateHourly;

        // Set the hours_est field
        newRecord.setValue(WRTR_TABLE + SQL_DOT + HOURS_EST, hoursEst);

        // Set the cost_estimated field
        newRecord.setValue(WRTR_TABLE + SQL_DOT + COST_ESTIMATED, costEstimated);

        datasource.saveRecord(newRecord);

    }

    /**
     * Update the fields in a trade record from the updated values in the corresponding trade sync
     * record.
     *
     * @param tradeSyncRecord - Trade Sync record
     * @param tradeRecord - Trade record to update
     * @return tradeRecord - Updated Trade record
     */
    static DataRecord updateTradeRecord(final DataRecord tradeSyncRecord,
            final DataRecord tradeRecord) {

        // Get the trade's hourly rate. Note that we are only calculating the straight rate.
        final Double rateHourly =
                getTrRate(tradeSyncRecord.getString(WRTR_SYNC_TABLE + SQL_DOT + TR_ID));

        // Get the updated estimated trade hours
        final double hoursEst = tradeSyncRecord.getDouble(WRTR_SYNC_TABLE + SQL_DOT + HOURS_EST);

        // Calculate the estimated trade costs
        final double costEstimated = hoursEst * rateHourly;

        tradeRecord.setValue(WRTR_TABLE + SQL_DOT + HOURS_EST, hoursEst);

        tradeRecord.setValue(WRTR_TABLE + SQL_DOT + COST_ESTIMATED, costEstimated);

        return tradeRecord;
    }

    /**
     * Insert a new trade sync record from a trade record.
     *
     * @param record - Trade record
     * @param wrId - Work Request Code
     * @param mobUser - User name of craftsperson
     */
    static void insertTradeSyncRecord(final DataRecord record, final int wrId, final String mobUser) {
        final DataSource datasource =
                DataSourceFactory.createDataSourceForFields(WRTR_SYNC_TABLE, WRTR_SYNC_FIELDS);

        final DataRecord newRecord = datasource.createNewRecord();

        final String[] textFields = { TR_ID };
        for (final String fieldName : textFields) {
            newRecord.setValue(WRTR_SYNC_TABLE + SQL_DOT + fieldName,
                record.getString(WRTR_TABLE + SQL_DOT + fieldName));
        }

        final String[] dateFields = { DATE_ASSIGNED };
        for (final String fieldName : dateFields) {
            newRecord.setValue(WRTR_SYNC_TABLE + SQL_DOT + fieldName,
                record.getDate(WRTR_TABLE + SQL_DOT + fieldName));
        }

        final String[] doubleFields = { HOURS_EST, COST_ESTIMATED };
        for (final String fieldName : doubleFields) {
            newRecord.setValue(WRTR_SYNC_TABLE + SQL_DOT + fieldName,
                record.getDouble(WRTR_TABLE + SQL_DOT + fieldName));
        }

        final String[] timeFields = { TIME_ASSIGNED };
        for (final String fieldName : timeFields) {
            newRecord.setValue(WRTR_SYNC_TABLE + SQL_DOT + fieldName,
                record.getValue(WRTR_TABLE + SQL_DOT + fieldName));
        }

        newRecord.setValue(WRTR_SYNC_TABLE + SQL_DOT + WR_ID, wrId);

        newRecord.setValue(WRTR_SYNC_TABLE + SQL_DOT + MOB_LOCKED_BY, mobUser);

        datasource.saveRecord(newRecord);

    }

    /**
     * Get the Trade's hourly rate.
     *
     * @param trId - Trade Code
     * @return rateHourly - String with the straight hourly rate
     */
    static double getTrRate(final String trId) {

        final DataSource trDataSource =
                DataSourceFactory.createDataSourceForFields(TR_TABLE, TR_FIELDS);

        trDataSource.addRestriction(Restrictions.eq(TR_TABLE, TR_ID, trId));

        final DataRecord trRecord = trDataSource.getRecord();

        final Double rateHourly = trRecord.getDouble(TR_TABLE + SQL_DOT + RATE_HOURLY);

        return rateHourly;
    }
}