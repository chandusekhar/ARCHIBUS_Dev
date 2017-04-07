package com.archibus.service.space.mobile.survey;

import static com.archibus.app.common.mobile.util.FieldNameConstantsCommon.*;
import static com.archibus.app.common.mobile.util.ServiceConstants.ACTION_DELETE;
import static com.archibus.app.common.mobile.util.TableNameConstants.*;
import static com.archibus.service.space.mobile.survey.TestConstants.*;

import java.util.List;

import org.apache.cxf.common.util.StringUtils;

import com.archibus.app.reservation.domain.TimePeriod;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.model.view.datasource.ClauseDef.Operation;
import com.archibus.model.view.datasource.*;
import com.archibus.service.space.SpaceConstants;
import com.archibus.service.space.helper.SpaceTransactionUtil;
import com.archibus.service.space.mobile.ISpaceOccupancyMobileService;
import com.archibus.service.space.mobile.impl.SpaceOccupancyMobileService;
import com.archibus.utility.Utility;

public abstract class AbstractSurveyTest extends DataSourceTestBase {
    
    /**
     * Object of the tested class.
     */
    public final ISpaceOccupancyMobileService spaceOccupancyService =
            new SpaceOccupancyMobileService();
    
    /** {@inheritDoc} */
    @Override
    public void onTearDown() {
        // delete the rmpct, rm and activity_log records
        deleteCurrentRecords();
    }
    
    /**
     * Add a new record in the rm table.
     * 
     * @param capEm value for cap_em field
     */
    public static void addNewRoomRecordWithCapEm(final int capEm) {
        final DataSource dataSource = getRmDataSource();
        final DataRecord record = dataSource.createNewRecord();
        
        record.setValue(RM_TABLE + SpaceConstants.DOT + BL_ID, BL_ID_VALUE);
        record.setValue(RM_TABLE + SpaceConstants.DOT + FL_ID, FL_ID_VALUE);
        record.setValue(RM_TABLE + SpaceConstants.DOT + RM_ID, RM_ID_VALUE);
        record.setValue(RM_TABLE + SpaceConstants.DOT + CAP_EM, capEm);
        
        record.setValue(RM_TABLE + SpaceConstants.DOT + DV_ID, DV_ID_VALUE);
        record.setValue(RM_TABLE + SpaceConstants.DOT + DP_ID, DP_ID_VALUE);
        
        // set room as occupiable
        record.setValue(RM_TABLE + SpaceConstants.DOT + RM_CAT, "OFFICE");
        record.setValue(RM_TABLE + SpaceConstants.DOT + RM_TYPE, "OFFICE");
        
        dataSource.saveRecord(record);
    }
    
    /**
     * Add new record in the rmpctmob_sync table.
     * 
     * @param blId value for bl_id field
     * @param flId value for fl_id field
     * @param rmId value for rm_id field
     * @param dvId value for dv_id field
     * @param dpId value for dp_id field
     * @param emId value for em_id field
     * @param primaryRm value for primary_rm field
     * @param primaryEm value for primary_em field
     * @param action action value
     */
    public static void addNewRmpctSyncRecord(final String blId, final String flId,
            final String rmId, final String dvId, final String dpId, final String emId,
            final Integer primaryRm, final Integer primaryEm, final String action) {
        final DataSource rmpctSyncDataSource =
                DataSourceFactory.createDataSourceForFields(RMPCT_MOB_SYNC_TABLE,
                    RMPCT_MOB_SYNC_FIELDS);
        final DataRecord rmpctSyncRecord = rmpctSyncDataSource.createNewRecord();
        
        rmpctSyncRecord.setValue(RMPCT_MOB_SYNC_TABLE + SpaceConstants.DOT + SURVEY_ID,
            SURVEY_ID_VALUE);
        rmpctSyncRecord.setValue(RMPCT_MOB_SYNC_TABLE + SpaceConstants.DOT + MOB_LOCKED_BY,
            MOBILE_USER_VALUE);
        rmpctSyncRecord.setValue(RMPCT_MOB_SYNC_TABLE + SpaceConstants.DOT + BL_ID, blId);
        rmpctSyncRecord.setValue(RMPCT_MOB_SYNC_TABLE + SpaceConstants.DOT + FL_ID, flId);
        rmpctSyncRecord.setValue(RMPCT_MOB_SYNC_TABLE + SpaceConstants.DOT + RM_ID, rmId);
        rmpctSyncRecord.setValue(RMPCT_MOB_SYNC_TABLE + SpaceConstants.DOT + DATE_START,
            Utility.currentDate());
        rmpctSyncRecord.setValue(RMPCT_MOB_SYNC_TABLE + SpaceConstants.DOT + ACTION, action);
        
        if (ACTION_DELETE.equals(action)) {
            rmpctSyncRecord.setValue(RMPCT_MOB_SYNC_TABLE + SpaceConstants.DOT + DATE_END,
                Utility.currentDate());
        }
        
        if (!StringUtils.isEmpty(dvId)) {
            rmpctSyncRecord.setValue(RMPCT_MOB_SYNC_TABLE + SpaceConstants.DOT + DV_ID, dvId);
        }
        
        if (!StringUtils.isEmpty(dpId)) {
            rmpctSyncRecord.setValue(RMPCT_MOB_SYNC_TABLE + SpaceConstants.DOT + DP_ID, dpId);
        }
        
        if (!StringUtils.isEmpty(emId)) {
            rmpctSyncRecord.setValue(RMPCT_MOB_SYNC_TABLE + SpaceConstants.DOT + EM_ID, emId);
        }
        
        if (primaryRm != null) {
            rmpctSyncRecord.setValue(RMPCT_MOB_SYNC_TABLE + SpaceConstants.DOT + PRIMARY_RM,
                primaryRm);
        }
        
        if (primaryEm != null) {
            rmpctSyncRecord.setValue(RMPCT_MOB_SYNC_TABLE + SpaceConstants.DOT + PRIMARY_EM,
                primaryEm);
        }
        
        rmpctSyncDataSource.saveRecord(rmpctSyncRecord);
        rmpctSyncDataSource.commit();
    }
    
    /**
     * Assert that a specific numberOfRecords exist in the rmpct table and the record at
     * indexOfRecord has the specified values for dv_id, dp_id and em_id.
     * 
     * @param numberOfRecords number of rmpct records
     * @param indexOfRecord index for the rmpct record of interest
     * @param dvId value for dv_id field
     * @param dpId value for dp_id field
     * @param emId value for em_id field
     * @param primaryRm value for primary_rm field
     * @param primaryEm value for primary_em field
     * @return the rmpct record of interest
     */
    public static void verifyInsertedRecord(final int numberOfRecords, final int indexOfRecord,
            final String dvId, final String dpId, final String emId, final Integer primaryRm,
            final Integer primaryEm) {
        final List<DataRecord> rmpctRecords = obtainCurrentRmpctRecords();
        final DataRecord insertedRecord = rmpctRecords.get(indexOfRecord);
        
        DataSourceTestBase.assertFalse(
            "Existing rmpct record was deleted and the new record wasn't inserted.",
            rmpctRecords.isEmpty());
        DataSourceTestBase.assertEquals(
            "Existing rmpct record should be deleted since it's start date is today. The count is not "
                    + numberOfRecords + ".", numberOfRecords, rmpctRecords.size());
        if (dvId == null) {
            DataSourceTestBase.assertNull("The division is not null.",
                insertedRecord.getString(RMPCT_TABLE + SpaceConstants.DOT + DV_ID));
        } else {
            DataSourceTestBase.assertEquals("The division is not correct.", dvId,
                insertedRecord.getString(RMPCT_TABLE + SpaceConstants.DOT + DV_ID));
        }
        
        if (dpId == null) {
            DataSourceTestBase.assertNull("The department is not null.",
                insertedRecord.getString(RMPCT_TABLE + SpaceConstants.DOT + DP_ID));
        } else {
            DataSourceTestBase.assertEquals("The department is not correct.", dpId,
                insertedRecord.getString(RMPCT_TABLE + SpaceConstants.DOT + DP_ID));
        }
        
        if (emId == null) {
            DataSourceTestBase.assertNull("The employee value is not null.",
                insertedRecord.getString(RMPCT_TABLE + SpaceConstants.DOT + EM_ID));
        } else {
            DataSourceTestBase.assertEquals("The employee is not correct.", emId,
                insertedRecord.getString(RMPCT_TABLE + SpaceConstants.DOT + EM_ID));
        }
        
        if (primaryRm != null) {
            DataSourceTestBase.assertEquals("The primary room value is not correct.",
                (int) primaryRm,
                insertedRecord.getInt(RMPCT_TABLE + SpaceConstants.DOT + PRIMARY_RM));
        }
        
        if (primaryEm != null) {
            DataSourceTestBase.assertEquals("The primary employee location value is not correct.",
                (int) primaryEm,
                insertedRecord.getInt(RMPCT_TABLE + SpaceConstants.DOT + PRIMARY_EM));
        }
        
        DataSourceTestBase.assertEquals(
            "The start date is not today.",
            TimePeriod.clearTime(Utility.currentDate()),
            TimePeriod.clearTime(insertedRecord.getDate(RMPCT_TABLE + SpaceConstants.DOT
                    + DATE_START)));
        DataSourceTestBase.assertNull("The end date is not null.",
            insertedRecord.getDate(RMPCT_TABLE + SpaceConstants.DOT + DATE_END));
    }
    
    /**
     * Get the list of rmpct records for the default bl_id, fl_id, rm_id.
     * 
     * @return list of records
     */
    public static List<DataRecord> obtainCurrentRmpctRecords() {
        final ParsedRestrictionDef restriction =
                getBlFlRmRestriction(RMPCT_TABLE, BL_ID_VALUE, FL_ID_VALUE, RM_ID_VALUE);
        final DataSource rmpctDataSource = SpaceTransactionUtil.getRmpctDataSource();
        return rmpctDataSource.getRecords(restriction);
    }
    
    /**
     * Restore database by deleting inserted rmpct, rm, surveyrm_sync, and activity_log records.
     * 
     */
    public static void deleteCurrentRecords() {
        final List<DataRecord> rmpctRecords = obtainCurrentRmpctRecords();
        // final List<DataRecord> rmpctRecords = getCurrentRmpctRecords();
        for (final DataRecord rmpctRecord : rmpctRecords) {
            final int activityLogId =
                    rmpctRecord.getInt(RMPCT_TABLE + SpaceConstants.DOT + ACTIVITY_LOG_ID);
            
            if (activityLogId != 0) {
                final DataSource activityLogDataSource =
                        SpaceTransactionUtil.getActivityDataSource();
                activityLogDataSource.addRestriction(Restrictions.eq(ACTIVITY_LOG_TABLE,
                    ACTIVITY_LOG_ID, activityLogId));
                final DataRecord activityLogRecord = activityLogDataSource.getRecord();
                if (activityLogRecord != null) {
                    activityLogDataSource.deleteRecord(activityLogRecord);
                    activityLogDataSource.commit();
                }
            }
            
            final ParsedRestrictionDef restriction =
                    getBlFlRmRestriction(SURVEY_RM_SYNC_TABLE, BL_ID_VALUE, FL_ID_VALUE, "");
            final DataSource roomSyncDataSource = getRoomSyncDataSource();
            final List<DataRecord> roomSyncRecords = roomSyncDataSource.getRecords(restriction);
            for (final DataRecord roomSyncRecord : roomSyncRecords) {
                roomSyncDataSource.deleteRecord(roomSyncRecord);
                roomSyncDataSource.commit();
            }
            
            final DataSource rmDataSource = getRmDataSource();
            final ParsedRestrictionDef rmRestriction =
                    getBlFlRmRestriction(RM_TABLE, BL_ID_VALUE, FL_ID_VALUE, RM_ID_VALUE);
            final List<DataRecord> rmRecords = rmDataSource.getRecords(rmRestriction);
            for (final DataRecord rmRecord : rmRecords) {
                rmDataSource.deleteRecord(rmRecord);
                rmDataSource.commit();
            }
        }
        
    }
    
    /**
     * Get a DataSource for rm table.
     * 
     * @return the DataSource object
     */
    public static DataSource getRmDataSource() {
        final String[] fieldNames = { BL_ID, FL_ID, RM_ID, CAP_EM, RM_CAT, RM_TYPE, DV_ID, DP_ID };
        return DataSourceFactory.createDataSourceForFields(RM_TABLE, fieldNames);
    }
    
    /**
     * Set default, not null values for division, department and/or employee for current rmpct
     * record for the default room.
     * 
     * @param indexOfRecord index for the rmpct record of interest
     * @param dvId value for dv_id field
     * @param dpId value for dp_id field
     * @param emId value for em_id field
     */
    public static void setValuesToRmpctRecord(final int indexOfRecord, final String dvId,
            final String dpId, final String emId, final Integer primaryRm, final Integer primaryEm) {
        final DataSource rmpctDataSource = SpaceTransactionUtil.getRmpctDataSource();
        final List<DataRecord> rmpctRecords = obtainCurrentRmpctRecords();
        final DataRecord rmpctRecord = rmpctRecords.get(indexOfRecord);
        
        if (dvId != null) {
            rmpctRecord.setValue(RMPCT_TABLE + SpaceConstants.DOT + DV_ID, dvId);
        }
        if (dpId != null) {
            rmpctRecord.setValue(RMPCT_TABLE + SpaceConstants.DOT + DP_ID, dpId);
        }
        if (emId != null) {
            rmpctRecord.setValue(RMPCT_TABLE + SpaceConstants.DOT + EM_ID, emId);
        }
        if (primaryRm != null) {
            rmpctRecord.setValue(RMPCT_TABLE + SpaceConstants.DOT + PRIMARY_RM, primaryRm);
        }
        if (primaryEm != null) {
            rmpctRecord.setValue(RMPCT_TABLE + SpaceConstants.DOT + PRIMARY_EM, primaryEm);
        }
        
        rmpctDataSource.saveRecord(rmpctRecord);
        rmpctDataSource.commit();
    }
    
    /**
     * Obtain the DataSource for surveyrm_sync table, including fields dv_id and dp_id.
     * 
     * @return DataSource object
     */
    protected static DataSource getRoomSyncDataSource() {
        // add dv_id and dp_id to surveyrm_sync datasource
        final int roomSurveySyncFieldsNumber = SPACE_OCCUP_ROOM_SURVEY_SYNC_FIELDS.length;
        final String[] roomSurveySyncFields = new String[roomSurveySyncFieldsNumber + 2];
        System.arraycopy(SPACE_OCCUP_ROOM_SURVEY_SYNC_FIELDS, 0, roomSurveySyncFields, 0,
            roomSurveySyncFieldsNumber);
        roomSurveySyncFields[roomSurveySyncFieldsNumber] = DV_ID;
        roomSurveySyncFields[roomSurveySyncFieldsNumber + 1] = DP_ID;
        
        return DataSourceFactory.createDataSourceForFields(SURVEY_RM_SYNC_TABLE,
            roomSurveySyncFields);
    }
    
    /**
     * Obtain restriction for a specific table with clauses for bl_id, fl_id and rm_id. Room id
     * value can be empty and no clause will be added for it.
     * 
     * @param tableName tabel name
     * @param blId buiding code value
     * @param flId floor code value
     * @param rmId room code value
     * @return restriction object
     */
    protected static ParsedRestrictionDef getBlFlRmRestriction(final String tableName,
            final String blId, final String flId, final String rmId) {
        final ParsedRestrictionDef restriction = new ParsedRestrictionDef();
        restriction.addClause(tableName, BL_ID, blId, Operation.EQUALS);
        restriction.addClause(tableName, FL_ID, flId, Operation.EQUALS);
        if (!StringUtils.isEmpty(rmId)) {
            restriction.addClause(tableName, RM_ID, rmId, Operation.EQUALS);
        }
        return restriction;
    }
}
