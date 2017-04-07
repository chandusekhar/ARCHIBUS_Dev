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
 * Provides supporting methods related to synchronizing the data in the Labor tables. Supports the
 * MaintenanceMobileService class.
 *
 * @author Constantine Kriezis
 * @since 21.1
 *
 */
@SuppressWarnings({ "PMD.AvoidUsingSql" })
final class MaintenanceMobileLaborUpdate {

    /**
     * Hide default constructor.
     */
    private MaintenanceMobileLaborUpdate() {
    }

    /**
     * Create labor records from the labor sync table.
     *
     * @param wrId - Work Request Code
     * @param mobWrId - Mobile Work Request Code
     */
    static void createLaborRecords(final int wrId, final int mobWrId) {
        final DataSource datasource =
                DataSourceFactory.createDataSourceForFields(WRCF_SYNC_TABLE, WRCF_SYNC_FIELDS);
        datasource.setContext();
        datasource.setMaxRecords(0);

        datasource.addRestriction(Restrictions.eq(WRCF_SYNC_TABLE, MOB_WR_ID, mobWrId));

        final List<DataRecord> records = datasource.getRecords();

        for (final DataRecord record : records) {
            insertLaborRecord(record, wrId);

            record.setValue(WRCF_SYNC_TABLE + SQL_DOT + WR_ID, wrId);
            record.setValue(WRCF_SYNC_TABLE + SQL_DOT + MOB_IS_CHANGED, 0);
            record.setValue(WRCF_SYNC_TABLE + SQL_DOT + LAST_MODIFIED, System.currentTimeMillis());
            record.setValue(WRCF_SYNC_TABLE + SQL_DOT + DELETED, 0);
            datasource.saveRecord(record);
        }
    }

    /**
     * Update labor records where the labor records have been modified on the client.
     *
     * @param userName - User Name
     * @param cfId - craftsperson code of the user.
     * @param modifiedRequestCodes - requests that have been previously updated. Only update the
     *            costs associated with the labor record if the request is not contained in the set.
     */
    static void updateLaborRecords(final String userName, final String cfId,
            final Set<Integer> modifiedRequestCodes) {

        final DataSource laborSyncDs =
                DataSourceFactory.createDataSourceForFields(WRCF_SYNC_TABLE, WRCF_SYNC_FIELDS);
        laborSyncDs.setContext();
        laborSyncDs.setMaxRecords(0);

        laborSyncDs.addRestriction(Restrictions.eq(WRCF_SYNC_TABLE, MOB_IS_CHANGED, 1));
        laborSyncDs.addRestriction(Restrictions.eq(WRCF_SYNC_TABLE, MOB_LOCKED_BY, userName));

        final List<DataRecord> records = laborSyncDs.getRecords();
        final WorkRequestHandler handler = new WorkRequestHandler();

        for (final DataRecord laborSyncRecord : records) {
            int laborSyncWrId = laborSyncRecord.getInt(WRCF_SYNC_TABLE + SQL_DOT + WR_ID);
            if (laborSyncWrId == 0) {
                final int mobWrId = laborSyncRecord.getInt(WRCF_SYNC_TABLE + SQL_DOT + MOB_WR_ID);
                laborSyncWrId = MaintenanceMobileUtility.getWrIdFromSyncTable(mobWrId);
            }

            final DataSource laborDs =
                    DataSourceFactory.createDataSourceForFields(WRCF_TABLE, WRCF_FIELDS);

            laborDs.addRestriction(Restrictions.eq(WRCF_TABLE, WR_ID, laborSyncWrId));

            laborDs.addRestriction(Restrictions.eq(WRCF_TABLE, CF_ID,
                laborSyncRecord.getString(WRCF_SYNC_TABLE + SQL_DOT + CF_ID)));

            laborDs.addRestriction(Restrictions.eq(WRCF_TABLE, DATE_ASSIGNED,
                laborSyncRecord.getDate(WRCF_SYNC_TABLE + SQL_DOT + DATE_ASSIGNED)));

            laborDs.addRestriction(Restrictions.eq(WRCF_TABLE, TIME_ASSIGNED,
                laborSyncRecord.getValue(WRCF_SYNC_TABLE + SQL_DOT + TIME_ASSIGNED)));

            // Select the mob_step_action and status from the wr_sync record for each wrcf_sync
            // record
            final DataSource wrcfDs =
                    DataSourceFactory.createDataSourceForFields(WR_SYNC_TABLE, new String[] {
                            WR_ID, MOB_STEP_ACTION, STATUS });
            wrcfDs.addRestriction(Restrictions.eq(WR_SYNC_TABLE, WR_ID, laborSyncWrId));
            wrcfDs.addRestriction(Restrictions.eq(WR_SYNC_TABLE, MOB_LOCKED_BY, userName));
            final DataRecord wrcfRecord = wrcfDs.getRecord();
            String mobStepAction = "";
            if (wrcfRecord != null) {
                mobStepAction = wrcfRecord.getString(WR_SYNC_TABLE + SQL_DOT + MOB_STEP_ACTION);
            }

            // Get any labor record that meets the restriction
            final DataRecord laborRecord = laborDs.getRecord();

            // If there is no labor record create a new one from the sync record
            // If there is a labor record that corresponds to the sync record update its non primary
            // key values from the sync record
            if (laborRecord == null) {
                boolean insertNew = true;

                // For Self Assign actions we insert only if the request is not already issued and
                // only if there are hours assigned by the craftsperson as part of the self assign
                if ("selfAssignWorkRequest".equals(mobStepAction)) {
                    insertNew = checkInsertNewForSeflAssign(laborSyncWrId);
                }

                if (insertNew && laborSyncWrId > 0) {
                    insertLaborRecord(laborSyncRecord, laborSyncWrId);
                }

            } else {

                checkReturnCf(laborSyncRecord, cfId, mobStepAction);

                final DataRecord updatedLaborRecord =
                        updateLaborRecord(laborSyncRecord, laborRecord);

                laborDs.saveRecord(updatedLaborRecord);
            }

            // Update the Work Request costs if this work request is not contained in the list of
            // modified wr records
            if (!modifiedRequestCodes.contains(laborSyncWrId)) {
                final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
                new WorkRequestHandler().recalculateCosts(context, laborSyncWrId);
                new WorkRequestHandler().recalculateEstCosts(context, laborSyncWrId);
            }

            laborSyncRecord.setValue(WRCF_SYNC_TABLE + SQL_DOT + LAST_MODIFIED,
                System.currentTimeMillis());
            laborSyncRecord.setValue(WRCF_SYNC_TABLE + SQL_DOT + DELETED, 0);
            laborSyncRecord.setValue(WRCF_SYNC_TABLE + SQL_DOT + MOB_IS_CHANGED, 0);
            laborSyncDs.saveRecord(laborSyncRecord);
            
            handler.updateWrStatusFromWrcf(laborSyncWrId);
        }
        
        
    }
    
    /**
     * check return from cf and set the wrcf.status to Returned. 
     * @param laborSyncRecord laborSyncRecord
     * @param cfId cfId
     * @param mobStepAction mobStepAction
     */
    private static void checkReturnCf(final DataRecord laborSyncRecord, final String cfId,
            final String mobStepAction) {
        if ("returnCf".equals(mobStepAction)
                && cfId.equals(laborSyncRecord.getString(WRCF_SYNC_TABLE + SQL_DOT + CF_ID))) {
            laborSyncRecord.setValue(WRCF_SYNC_TABLE + SQL_DOT + STATUS, "Returned");
        }
    }

    /**
     * Check insert new or not For SeflAssign.
     *
     * @param wrId work request code
     * @return return false if not issued or there is no actual hours
     */
    private static boolean checkInsertNewForSeflAssign(final int wrId) {
        boolean insertNew = true;

        if (DataStatistics.getInt(WR_TABLE, WR_ID, "count",
            "wr.status IN ('R','A','AA') and wr_id = " + wrId) == 0) {
            insertNew = false;
        }
        return insertNew;
    }

    /**
     * Copies the labor records from the wrcf table to the sync table.
     *
     * @param userName - User name
     */
    static void createLaborSyncRecords(final String userName) {
        insertNewLaborSyncRecords(userName, WRCF_FIELDS);
    }

    /**
     * Inserts the labor records into the sync table.
     * 
     * @param userName - User name
     * @param commonFields - fields shared between the wrcf and wrcf_sync tables.
     */
    private static void insertNewLaborSyncRecords(final String userName, final String[] commonFields) {
        final String fields = StringUtils.arrayToCommaDelimitedString(commonFields);
        final String selectFields =
                fields + SQL_COMMA + System.currentTimeMillis() + ",0,"
                        + SqlUtils.formatValueForSql(userName) + ",0";
        final String insertFields =
                fields + SQL_COMMA + LAST_MODIFIED + SQL_COMMA + DELETED + SQL_COMMA
                + MOB_LOCKED_BY + SQL_COMMA + MOB_IS_CHANGED;

        final String sql =
                "INSERT INTO wrcf_sync("
                        + insertFields
                        + ") SELECT "
                        + selectFields
                        + SQL_FROM
                        + WRCF_TABLE
                        + " WHERE EXISTS(SELECT 1 FROM wr_sync WHERE wrcf.wr_id = wr_sync.wr_id AND wr_sync.mob_locked_by='"
                        + userName
                        + "'"
                        + ") AND NOT EXISTS(SELECT 1 FROM wrcf_sync WHERE wrcf_sync.wr_id=wrcf.wr_id AND wrcf_sync.cf_id=wrcf.cf_id AND wrcf_sync.mob_locked_by='"
                        + userName + "' "
                        + " AND wrcf_sync.date_assigned=wrcf.date_assigned AND wrcf_sync.time_assigned=wrcf.time_assigned)";

        SqlUtils.executeUpdate(WRCF_SYNC_TABLE, sql);
    }

    /**
     * Insert a new labor record from a mobile labor sync record.
     *
     * @param record - Labor Sync record
     * @param wrId - Work Request Code
     * @return work request id of the new record.
     */
    static int insertLaborRecord(final DataRecord record, final int wrId) {
        // First get the craftsperson so we can get the hourly rates to calculate the costs when
        // inserting the labor record
        final String cfId = record.getString(WRCF_SYNC_TABLE + SQL_DOT + CF_ID);

        // Get the craftsperson hourly rates in an array
        final double[] ratesArray = getCfRatesArray(cfId);

        final Double rateHourly = ratesArray[0];
        final Double rateOver = ratesArray[1];
        final Double rateDouble = ratesArray[2];

        final DataSource datasource =
                DataSourceFactory.createDataSourceForFields(WRCF_TABLE, WRCF_FIELDS);

        final DataRecord newRecord = datasource.createNewRecord();

        newRecord.setValue(WRCF_TABLE + SQL_DOT + CF_ID, cfId);

        newRecord.setValue(WRCF_TABLE + SQL_DOT + WR_ID, wrId);

        final String[] textFields = { WORK_TYPE, COMMENTS };
        for (final String fieldName : textFields) {
            newRecord.setValue(WRCF_TABLE + SQL_DOT + fieldName,
                record.getString(WRCF_SYNC_TABLE + SQL_DOT + fieldName));
        }

        final String[] dateFields = { DATE_ASSIGNED, DATE_END, DATE_START };
        for (final String fieldName : dateFields) {
            newRecord.setValue(WRCF_TABLE + SQL_DOT + fieldName,
                record.getDate(WRCF_SYNC_TABLE + SQL_DOT + fieldName));
        }

        final String[] timeFields = { TIME_ASSIGNED, TIME_END, TIME_START };
        for (final String fieldName : timeFields) {
            newRecord.setValue(WRCF_TABLE + SQL_DOT + fieldName,
                record.getValue(WRCF_SYNC_TABLE + SQL_DOT + fieldName));
        }

        // These fields will always be non-null.
        final double hoursStraight = record.getDouble(WRCF_SYNC_TABLE + SQL_DOT + HOURS_STRAIGHT);

        final double hoursOver = record.getDouble(WRCF_SYNC_TABLE + SQL_DOT + HOURS_OVER);

        final double hoursDouble = record.getDouble(WRCF_SYNC_TABLE + SQL_DOT + HOURS_DOUBLE);

        final double hoursEst = record.getDouble(WRCF_SYNC_TABLE + SQL_DOT + HOURS_EST);

        final double costStraight = hoursStraight * rateHourly;
        final double costOver = hoursOver * rateOver;
        final double costDouble = hoursDouble * rateDouble;
        final double costEstimated = hoursEst * rateHourly;

        newRecord.setValue(WRCF_TABLE + SQL_DOT + HOURS_OVER, hoursOver);

        newRecord.setValue(WRCF_TABLE + SQL_DOT + HOURS_DOUBLE, hoursDouble);

        newRecord.setValue(WRCF_TABLE + SQL_DOT + HOURS_STRAIGHT, hoursStraight);

        newRecord.setValue(WRCF_TABLE + SQL_DOT + HOURS_EST, hoursEst);

        newRecord.setValue(WRCF_TABLE + SQL_DOT + HOURS_TOTAL, hoursStraight + hoursOver
            + hoursDouble);

        newRecord.setValue(WRCF_TABLE + SQL_DOT + COST_ESTIMATED, costEstimated);

        newRecord.setValue(WRCF_TABLE + SQL_DOT + COST_OVER, costOver);

        newRecord.setValue(WRCF_TABLE + SQL_DOT + COST_DOUBLE, costDouble);

        newRecord.setValue(WRCF_TABLE + SQL_DOT + COST_STRAIGHT, costStraight);

        newRecord.setValue(WRCF_TABLE + SQL_DOT + COST_TOTAL, costStraight + costOver + costDouble);

        final DataRecord insertedRecord = datasource.saveRecord(newRecord);

        return insertedRecord.getInt(WRCF_TABLE + SQL_DOT + WR_ID);

    }

    /**
     * Update the fields in a labor record from the updated values in the corresponding labor sync
     * record.
     *
     * @param laborSyncRecord - Labor Sync record
     * @param laborRecord - Labor record to update
     * @return laborRecord - Updated labor record
     */
    static DataRecord updateLaborRecord(final DataRecord laborSyncRecord,
            final DataRecord laborRecord) {

        // Get the craftsperson hourly rates in an array
        final double[] ratesArray =
                getCfRatesArray(laborSyncRecord.getString(WRCF_SYNC_TABLE + SQL_DOT + CF_ID));

        final Double rateHourly = ratesArray[0];
        final Double rateOver = ratesArray[1];
        final Double rateDouble = ratesArray[2];

        laborRecord.setValue(WRCF_TABLE + SQL_DOT + COMMENTS,
            laborSyncRecord.getString(WRCF_SYNC_TABLE + SQL_DOT + COMMENTS));

        laborRecord.setValue(WRCF_TABLE + SQL_DOT + DATE_END,
            laborSyncRecord.getDate(WRCF_SYNC_TABLE + SQL_DOT + DATE_END));

        laborRecord.setValue(WRCF_TABLE + SQL_DOT + DATE_START,
            laborSyncRecord.getDate(WRCF_SYNC_TABLE + SQL_DOT + DATE_START));

        // // These fields will always be non-null.
        final double hoursDouble =
                laborSyncRecord.getDouble(WRCF_SYNC_TABLE + SQL_DOT + HOURS_DOUBLE);

        final double hoursOver = laborSyncRecord.getDouble(WRCF_SYNC_TABLE + SQL_DOT + HOURS_OVER);

        final double hoursStraight =
                laborSyncRecord.getDouble(WRCF_SYNC_TABLE + SQL_DOT + HOURS_STRAIGHT);

        final double hoursEst = laborSyncRecord.getDouble(WRCF_SYNC_TABLE + SQL_DOT + HOURS_EST);

        // Calculate the labor costs
        final double costStraight = hoursStraight * rateHourly;
        final double costOver = hoursOver * rateOver;
        final double costDouble = hoursDouble * rateDouble;

        laborRecord.setValue(WRCF_TABLE + SQL_DOT + HOURS_OVER, hoursOver);

        laborRecord.setValue(WRCF_TABLE + SQL_DOT + HOURS_DOUBLE, hoursDouble);

        laborRecord.setValue(WRCF_TABLE + SQL_DOT + HOURS_STRAIGHT, hoursStraight);

        laborRecord.setValue(WRCF_TABLE + SQL_DOT + HOURS_EST, hoursEst);

        laborRecord.setValue(WRCF_TABLE + SQL_DOT + HOURS_TOTAL, hoursStraight + hoursOver
            + hoursDouble);

        laborRecord.setValue(WRCF_TABLE + SQL_DOT + HOURS_DIFF, hoursStraight + hoursOver
            + hoursDouble - hoursEst);

        laborRecord.setValue(WRCF_TABLE + SQL_DOT + COST_OVER, costOver);

        laborRecord.setValue(WRCF_TABLE + SQL_DOT + COST_DOUBLE, costDouble);

        laborRecord.setValue(WRCF_TABLE + SQL_DOT + COST_STRAIGHT, costStraight);

        laborRecord.setValue(WRCF_TABLE + SQL_DOT + COST_TOTAL, costStraight + costOver
            + costDouble);

        laborRecord.setValue(WRCF_TABLE + SQL_DOT + TIME_END,
            laborSyncRecord.getValue(WRCF_SYNC_TABLE + SQL_DOT + TIME_END));

        laborRecord.setValue(WRCF_TABLE + SQL_DOT + TIME_START,
            laborSyncRecord.getValue(WRCF_SYNC_TABLE + SQL_DOT + TIME_START));

        laborRecord.setValue(WRCF_TABLE + SQL_DOT + WORK_TYPE,
            laborSyncRecord.getString(WRCF_SYNC_TABLE + SQL_DOT + WORK_TYPE));
        laborRecord.setValue(WRCF_TABLE + SQL_DOT + STATUS,
            laborSyncRecord.getString(WRCF_SYNC_TABLE + SQL_DOT + STATUS));

        return laborRecord;
    }

    /**
     * Insert a new labor sync record from a labor record.
     *
     * @param record - Labor record
     * @param wrId - Work Request Code
     * @param cfUser - User name of craftsperson
     */
    static void insertLaborSyncRecord(final DataRecord record, final int wrId, final String cfUser) {
        final DataSource datasource =
                DataSourceFactory.createDataSourceForFields(WRCF_SYNC_TABLE, WRCF_SYNC_FIELDS);

        final DataRecord newRecord = datasource.createNewRecord();

        final String[] textFields = { CF_ID, STATUS, COMMENTS, WORK_TYPE };
        for (final String fieldName : textFields) {
            newRecord.setValue(WRCF_SYNC_TABLE + SQL_DOT + fieldName,
                record.getString(WRCF_TABLE + SQL_DOT + fieldName));
        }

        final String[] dateFields = { DATE_ASSIGNED, DATE_END, DATE_START };
        for (final String fieldName : dateFields) {
            newRecord.setValue(WRCF_SYNC_TABLE + SQL_DOT + fieldName,
                record.getDate(WRCF_TABLE + SQL_DOT + fieldName));
        }

        final String[] doubleFields =
            { HOURS_DOUBLE, HOURS_OVER, HOURS_STRAIGHT, HOURS_TOTAL, HOURS_EST };
        for (final String fieldName : doubleFields) {
            newRecord.setValue(WRCF_SYNC_TABLE + SQL_DOT + fieldName,
                record.getDouble(WRCF_TABLE + SQL_DOT + fieldName));
        }

        final String[] timeFields = { TIME_ASSIGNED, TIME_END, TIME_START };
        for (final String fieldName : timeFields) {
            newRecord.setValue(WRCF_SYNC_TABLE + SQL_DOT + fieldName,
                record.getValue(WRCF_TABLE + SQL_DOT + fieldName));
        }

        newRecord.setValue(WRCF_SYNC_TABLE + SQL_DOT + WR_ID, wrId);

        newRecord.setValue(WRCF_SYNC_TABLE + SQL_DOT + MOB_LOCKED_BY, cfUser);

        datasource.saveRecord(newRecord);

        // TODO (VT) Why commit?
        datasource.commit();
    }

    /**
     * Get the Craftsperson's hourly rates.
     *
     * @param cfId - Craftsperson Code
     * @return ratesArray - Array with the hourly rates
     */
    static double[] getCfRatesArray(final String cfId) {

        final DataSource cfdatasource =
                DataSourceFactory.createDataSourceForFields(CF_TABLE, CF_FIELDS);

        cfdatasource.addRestriction(Restrictions.eq(CF_TABLE, CF_ID, cfId));

        final DataRecord cfRecord = cfdatasource.getRecord();

        final Double rateHourly = cfRecord.getDouble(CF_TABLE + SQL_DOT + RATE_HOURLY);

        final Double rateOver = cfRecord.getDouble(CF_TABLE + SQL_DOT + RATE_OVER);

        final Double rateDouble = cfRecord.getDouble(CF_TABLE + SQL_DOT + RATE_DOUBLE);

        final double[] ratesArray = { rateHourly, rateOver, rateDouble };

        return ratesArray;
    }
}