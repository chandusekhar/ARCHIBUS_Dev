package com.archibus.eventhandler.eam.receipt.mobile.impl;

import static com.archibus.app.common.mobile.space.DataSourceUtilities.importFieldValue;
import static com.archibus.app.common.mobile.util.FieldNameConstantsCommon.*;
import static com.archibus.app.common.mobile.util.ServiceConstants.SQL_DOT;
import static com.archibus.app.common.mobile.util.TableNameConstants.*;

import java.util.List;

import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.eventhandler.eam.receipt.AssetReceiptService;
import com.archibus.eventhandler.eam.receipt.mobile.IAssetReceiptMobileService;
import com.archibus.model.view.datasource.ClauseDef.Operation;
import com.archibus.model.view.datasource.ParsedRestrictionDef;

/**
 * Implementation of the Asset Management Workflow Rule Service for mobile asset receipt
 * application.
 * <p>
 * Registered in the ARCHIBUS Workflow Rules table as 'AbAssetManagement-AssetReceiptMobileService'.
 * <p>
 * Provides methods for searching assets and synchronization between sync table (eq_sync) and
 * inventory table (eq).
 * <p>
 * Invoked by mobile client.
 *
 * @author Ana Paduraru
 * @since 22.1
 */
public class AssetReceiptMobileService implements IAssetReceiptMobileService {
    /**
     * Constant: mob_action value 'ERROR'.
     */
    private static final String ERROR = "ERROR";

    /**
     * Constant: mob_action value 'DELETE'.
     */
    private static final String DELETE = "DELETE";

    /** {@inheritDoc} */
    @Override
    public boolean completeReceiptEq(final String userName) {
        boolean existsEq = false;
        boolean allRecordsSaved = true;
        DataRecord eqRecord = null;

        final DataSource eqSyncDatasource =
                DataSourceFactory.createDataSourceForFields(EQ_SYNC_TABLE, EQ_SYNC_FIELDS);
        eqSyncDatasource.setContext();
        eqSyncDatasource.setMaxRecords(0);

        final ParsedRestrictionDef eqSyncRestriction = new ParsedRestrictionDef();
        eqSyncRestriction.addClause(EQ_SYNC_TABLE, MOB_LOCKED_BY, userName, Operation.EQUALS);
        final List<DataRecord> eqSyncRecords = eqSyncDatasource.getRecords(eqSyncRestriction);

        final DataSource eqDatasource =
                DataSourceFactory.createDataSourceForFields(EQ_TABLE, EQ_FIELDS);
        // loop through all the equipment sync records
        for (final DataRecord eqSyncRecord : eqSyncRecords) {
            if (DELETE
                .equalsIgnoreCase(eqSyncRecord.getString(EQ_SYNC_TABLE + SQL_DOT + MOB_ACTION))) {
                eqSyncDatasource.deleteRecord(eqSyncRecord);
                continue;
            }

            existsEq = new AssetReceiptService().verifyExistsAsset("eq",
                eqSyncRecord.getString(EQ_SYNC_TABLE + SQL_DOT + EQ_ID));
            if (existsEq) {
                allRecordsSaved = false;
                eqSyncRecord.setValue(EQ_SYNC_TABLE + SQL_DOT + MOB_ACTION, ERROR);
                eqSyncDatasource.updateRecord(eqSyncRecord);
            } else {
                // new record, does not exist in the eq table
                eqRecord = eqDatasource.createNewRecord();
                for (final String fieldName : EQ_FIELDS) {
                    importFieldValue(EQ_SYNC_TABLE, eqSyncRecord, EQ_TABLE, eqRecord, fieldName);
                }

                // save the record
                eqDatasource.saveRecord(eqRecord);

                // If the update or insert succeeds, delete the record from the eq_sync table
                eqSyncDatasource.deleteRecord(eqSyncRecord);
            }

        }

        return allRecordsSaved;
    }

    /** {@inheritDoc} */
    @Override
    public void saveNewEquipmentStandards(final String userName) {
        final DataSource eqstdSyncDatasource =
                DataSourceFactory.createDataSourceForFields(EQSTD_SYNC_TABLE, EQSTD_SYNC_FIELDS);
        eqstdSyncDatasource.setContext();
        eqstdSyncDatasource.setMaxRecords(0);

        final ParsedRestrictionDef eqstdSyncRestriction = new ParsedRestrictionDef();
        eqstdSyncRestriction.addClause(EQSTD_SYNC_TABLE, MOB_LOCKED_BY, userName, Operation.EQUALS);
        eqstdSyncRestriction.addClause(EQSTD_SYNC_TABLE, MOB_IS_CHANGED, 1, Operation.EQUALS);
        final List<DataRecord> eqstdSyncRecords =
                eqstdSyncDatasource.getRecords(eqstdSyncRestriction);

        final DataSource eqstdDatasource =
                DataSourceFactory.createDataSourceForFields(EQSTD_TABLE, EQSTD_FIELDS);
        ParsedRestrictionDef eqstdRestriction;
        List<DataRecord> eqstdRecords;
        DataRecord eqstdRecord;

        // loop through all the equipment standard sync records
        for (final DataRecord eqstdSyncRecord : eqstdSyncRecords) {
            eqstdRestriction = new ParsedRestrictionDef();
            eqstdRestriction.addClause(EQSTD_TABLE, EQ_STD,
                eqstdSyncRecord.getString(EQSTD_SYNC_TABLE + SQL_DOT + EQ_STD), Operation.EQUALS);
            eqstdRecords = eqstdDatasource.getRecords(eqstdRestriction);

            if (eqstdRecords.isEmpty()) {
                eqstdRecord = eqstdDatasource.createNewRecord();
                for (final String fieldName : EQSTD_FIELDS) {
                    importFieldValue(EQSTD_SYNC_TABLE, eqstdSyncRecord, EQSTD_TABLE, eqstdRecord,
                        fieldName);
                }

                // save the record
                eqstdDatasource.saveRecord(eqstdRecord);

                eqstdSyncRecord.setValue(EQSTD_SYNC_TABLE + SQL_DOT + MOB_IS_CHANGED, 0);
                eqstdSyncDatasource.updateRecord(eqstdSyncRecord);
            }
        }
    }

    /**
     * {@inheritDoc}
     *
     * <p>
     * Suppress PMD warning "AvoidUsingSql" in this method.
     * <p>
     * Justification: Case #2: Statement with INSERT ... SELECT pattern.
     */
    @Override
    @SuppressWarnings("PMD.AvoidUsingSql")
    public void copyEqStdToSyncTable(final String userName) {
        // INSERT INTO eqstd_sync (eqstd_sync.eq_std, eqstd_sync.description,
        // eqstd_sync.mob_locked_by) SELECT eqstd.eq_std, eqstd.description,
        // 'TRAM' FROM eqstd WHERE eqstd.eq_std NOT IN(SELECT eqstd_sync.eq_std from eqstd_sync
        // WHERE
        // mob_locked_by='TRAM')
        final String sql = String.format(
            "INSERT INTO eqstd_sync (eqstd_sync.eq_std, eqstd_sync.description, eqstd_sync.mob_locked_by) "
                    + "SELECT eqstd.eq_std, eqstd.description, %s FROM eqstd "
                    + "WHERE eqstd.eq_std NOT IN(SELECT eqstd_sync.eq_std from eqstd_sync WHERE eqstd_sync.mob_locked_by=%s)",
            SqlUtils.formatValueForSql(userName), SqlUtils.formatValueForSql(userName));

        SqlUtils.executeUpdate(EQSTD_SYNC_TABLE, sql);
    }
}
