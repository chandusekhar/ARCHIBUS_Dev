package com.archibus.app.assessment.mobile.service.impl;

import static com.archibus.app.common.mobile.util.FieldNameConstantsCommon.*;
import static com.archibus.app.common.mobile.util.ServiceConstants.SQL_DOT;
import static com.archibus.app.common.mobile.util.TableNameConstants.ACTIVITY_LOG_SYNC_TABLE;

import java.util.List;

import com.archibus.app.assessment.mobile.service.IAssessmentMobileService;
import com.archibus.app.common.mobile.util.ActivityLogUtilities;
import com.archibus.datasource.DataSource;
import com.archibus.datasource.data.DataRecord;
import com.archibus.model.view.datasource.ClauseDef.Operation;
import com.archibus.model.view.datasource.*;

/**
 * Implementation of the Assessment Workflow Rule Service for mobile Condition Assessment
 * application.
 * <p>
 * Registered in the ARCHIBUS Workflow Rules table as 'AbCapitalPlanningCA-AssessmentMobileService'.
 * <p>
 * Provides methods for synchronization between sync table (activity_log_sync) and inventory table
 * (activity_log)
 * <p>
 * Invoked by mobile client.
 *
 * @author Cristina Moldovan
 * @since 21.2
 *
 *
 */
public class AssessmentMobileService implements IAssessmentMobileService {

    /**
     * {@inheritDoc}.
     *
     * <p>
     * Step 1: Get new mobile work onto Web Central (inventory table: activity_log) added by the
     * assessor AND Update existing mobile work data (overwrite Web Central)
     *
     * Step 2: Delete all sync data (activity_log_sync table) for the user to refresh mobile in the
     * last step
     *
     * Step 3: Get all Web Central assigned work back to the sync table
     *
     */
    @Override
    public void syncWorkData(final String userName, final boolean fullSync) {

        /*
         * Get new mobile work added by the assessor AND Update existing mobile work data and
         * overwrite Web Central
         */
        syncFromMobileNewOrExistingAssignedWork(userName);

        // Delete all sync data for the user to refresh mobile in the last step
        if (fullSync) {
            deleteSyncWork(userName);
        }

        // Get all Web Central assigned work back to the sync table
        syncFromWebCentralNewAssignedWork(userName);

    }

    /**
     *
     * Get new mobile work (activity_log_sync.activity_log_id is null) added by the assessor AND
     * Update existing mobile work data and overwrite Web Central.
     *
     * @param userName The assessor's user name
     */
    private void syncFromMobileNewOrExistingAssignedWork(final String userName) {
        final DataSource datasource =
                ActivityLogUtilities
                    .createActivityLogSyncDataSource(DataSourceQueries.COMMON_COPY_FIELD_NAMES);

        datasource.addField(ACTIVITY_LOG_SYNC_TABLE, AUTO_NUMBER);
        datasource.setContext();
        datasource.setMaxRecords(0);

        final ParsedRestrictionDef sqlRestriction = new ParsedRestrictionDef();
        sqlRestriction
            .addClause(ACTIVITY_LOG_SYNC_TABLE, MOB_LOCKED_BY, userName, Operation.EQUALS);

        sqlRestriction.addClause(ACTIVITY_LOG_SYNC_TABLE, MOB_IS_CHANGED, "1", Operation.EQUALS);

        final List<DataRecord> records = datasource.getRecords(sqlRestriction);

        for (final DataRecord record : records) {
            final int activityLogId =
                    record.getInt(ACTIVITY_LOG_SYNC_TABLE + SQL_DOT + ACTIVITY_LOG_ID);
            if (activityLogId > 0) {
                // update condition assessment item
                DataSourceUtilities.updateActivityLogRecord(record,
                    DataSourceQueries.COMMON_COPY_FIELD_NAMES, true, true);
            } else {
                // insert condition assessment item
                final int newActivityLogId =
                        DataSourceUtilities.insertActivityLogRecord(record,
                            DataSourceQueries.COMMON_COPY_FIELD_NAMES, true, true);

                record.setValue(ACTIVITY_LOG_SYNC_TABLE + SQL_DOT + ACTIVITY_LOG_ID,
                    newActivityLogId);
            }
            record.setValue(ACTIVITY_LOG_SYNC_TABLE + SQL_DOT + MOB_IS_CHANGED, 0);
            record.setValue(ACTIVITY_LOG_SYNC_TABLE + SQL_DOT + LAST_MODIFIED,
                System.currentTimeMillis());

            datasource.saveRecord(record);
        }
    }

    /**
     * Delete all sync data for the user to refresh mobile in the last step.
     *
     * @param userName The assessor's user name
     */
    private void deleteSyncWork(final String userName) {
        DataSourceUtilities.deleteSyncWork(userName);
    }

    /**
     * Get all Web Central assigned work back to the sync table.
     *
     * @param userName The assessor's user name
     */
    private void syncFromWebCentralNewAssignedWork(final String userName) {
        DataSourceUtilities.syncFromWebCentralNewAssignedWork(userName);

    }

}
