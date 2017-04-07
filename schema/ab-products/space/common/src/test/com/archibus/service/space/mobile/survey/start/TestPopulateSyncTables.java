package com.archibus.service.space.mobile.survey.start;

import static com.archibus.app.common.mobile.util.FieldNameConstantsCommon.*;
import static com.archibus.app.common.mobile.util.TableNameConstants.*;
import static com.archibus.service.space.mobile.survey.TestConstants.*;

import java.util.List;

import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.model.view.datasource.ParsedRestrictionDef;
import com.archibus.service.space.SpaceConstants;
import com.archibus.service.space.mobile.impl.SpaceOccupancyMobileService;
import com.archibus.service.space.mobile.survey.AbstractSurveyTest;
import com.archibus.utility.Utility;

public class TestPopulateSyncTables extends AbstractSurveyTest {
    /**
     * Object of the tested class.
     */
    final SpaceOccupancyMobileService spaceOccupancyService = new SpaceOccupancyMobileService();
    
    /** {@inheritDoc} */
    @Override
    public void onSetUp() throws Exception {
        super.onSetUp();
        
        // add the surveymob_sync record
        final DataSource surveySyncDataSource =
                DataSourceFactory.createDataSourceForFields(SURVEY_MOB_SYNC_TABLE, new String[] {
                        SURVEY_ID, "survey_type", SURVEY_DATE });
        final DataRecord surveySyncRecord = surveySyncDataSource.createNewRecord();
        surveySyncRecord.setValue(SURVEY_MOB_SYNC_TABLE + SpaceConstants.DOT + SURVEY_ID,
            SURVEY_ID_VALUE);
        surveySyncRecord.setValue(SURVEY_MOB_SYNC_TABLE + SpaceConstants.DOT + "survey_type",
            "Occupancy");
        surveySyncRecord.setValue(SURVEY_MOB_SYNC_TABLE + SpaceConstants.DOT + SURVEY_DATE,
            Utility.currentDate());
        surveySyncDataSource.saveRecord(surveySyncRecord);
        
        addNewRoomRecordWithCapEm(1);
        // setValuesToRmpctRecord(0, DV_ID_VALUE, DP_ID_VALUE, null, 1, null);
    }
    
    public void testCopyRoomsToSyncTable() {
        this.spaceOccupancyService.copyRoomsToSyncTable(SURVEY_ID_VALUE, MOBILE_USER_VALUE,
            BL_ID_VALUE, FL_ID_VALUE);
        
        final ParsedRestrictionDef restriction =
                getBlFlRmRestriction(SURVEY_RM_SYNC_TABLE, BL_ID_VALUE, FL_ID_VALUE, RM_ID_VALUE);
        final DataSource roomSyncDataSource = getRoomSyncDataSource();
        final List<DataRecord> roomSyncRecords = roomSyncDataSource.getRecords(restriction);
        
        assertEquals("The record was not added in the sync table.", 1, roomSyncRecords.size());
        final DataRecord roomSyncRecord = roomSyncRecords.get(0);
        assertEquals("The division is not correct.", DV_ID_VALUE,
            roomSyncRecord.getString(SURVEY_RM_SYNC_TABLE + SpaceConstants.DOT + DV_ID));
        assertEquals("The department is not correct.", DP_ID_VALUE,
            roomSyncRecord.getString(SURVEY_RM_SYNC_TABLE + SpaceConstants.DOT + DP_ID));
        assertEquals("The survey id is not correct.", SURVEY_ID_VALUE,
            roomSyncRecord.getString(SURVEY_RM_SYNC_TABLE + SpaceConstants.DOT + SURVEY_ID));
        assertEquals("The room category is not correct.", "OFFICE",
            roomSyncRecord.getString(SURVEY_RM_SYNC_TABLE + SpaceConstants.DOT + RM_CAT));
        assertEquals("The room type is not correct.", "OFFICE",
            roomSyncRecord.getString(SURVEY_RM_SYNC_TABLE + SpaceConstants.DOT + RM_TYPE));
    }
    
    public void testCopyRoomTransToSyncTable() {
        this.spaceOccupancyService.copyRoomTransToSyncTable(SURVEY_ID_VALUE, MOBILE_USER_VALUE,
            BL_ID_VALUE, FL_ID_VALUE);
        
        ParsedRestrictionDef restriction =
                getBlFlRmRestriction(RMPCT_TABLE, BL_ID_VALUE, FL_ID_VALUE, RM_ID_VALUE);
        final DataSource rmpctDataSource =
                DataSourceFactory.createDataSourceForFields(RMPCT_TABLE, RMPCT_FIELDS);
        final List<DataRecord> rmpctRecords = rmpctDataSource.getRecords(restriction);
        
        restriction =
                getBlFlRmRestriction(RMPCT_MOB_SYNC_TABLE, BL_ID_VALUE, FL_ID_VALUE, RM_ID_VALUE);
        final DataSource rmpctSyncDataSource =
                DataSourceFactory.createDataSourceForFields(RMPCT_MOB_SYNC_TABLE,
                    RMPCT_MOB_SYNC_FIELDS);
        final List<DataRecord> rmpctSyncRecords = rmpctSyncDataSource.getRecords(restriction);
        
        assertEquals("The room records were not copied in the sync table.", rmpctRecords.size(),
            rmpctSyncRecords.size());
        
        final DataRecord rmpctRecord = rmpctRecords.get(0);
        final DataRecord rmpctSyncRecord = rmpctSyncRecords.get(0);
        
        assertEquals("The survey id is not correct.", SURVEY_ID_VALUE,
            rmpctSyncRecord.getString(RMPCT_MOB_SYNC_TABLE + SpaceConstants.DOT + SURVEY_ID));
        
        assertEquals("The division id is not correct.",
            rmpctRecord.getString(RMPCT_TABLE + SpaceConstants.DOT + DV_ID),
            rmpctSyncRecord.getString(RMPCT_MOB_SYNC_TABLE + SpaceConstants.DOT + DV_ID));
        assertEquals("The department id is not correct.",
            rmpctRecord.getString(RMPCT_TABLE + SpaceConstants.DOT + DP_ID),
            rmpctSyncRecord.getString(RMPCT_MOB_SYNC_TABLE + SpaceConstants.DOT + DP_ID));
        assertEquals("The employee id is not correct.",
            rmpctRecord.getString(RMPCT_TABLE + SpaceConstants.DOT + EM_ID),
            rmpctSyncRecord.getString(RMPCT_MOB_SYNC_TABLE + SpaceConstants.DOT + EM_ID));
        assertEquals("The percentage is not correct.",
            rmpctRecord.getInt(RMPCT_TABLE + SpaceConstants.DOT + PCT_ID) + "",
            rmpctSyncRecord.getString(RMPCT_MOB_SYNC_TABLE + SpaceConstants.DOT + PCT_ID));
        assertEquals("The primary room value is not correct.",
            rmpctRecord.getInt(RMPCT_TABLE + SpaceConstants.DOT + PRIMARY_RM),
            rmpctSyncRecord.getInt(RMPCT_MOB_SYNC_TABLE + SpaceConstants.DOT + PRIMARY_RM));
        assertEquals("The primary employee location value is not correct.",
            rmpctRecord.getInt(RMPCT_TABLE + SpaceConstants.DOT + PRIMARY_EM),
            rmpctSyncRecord.getInt(RMPCT_MOB_SYNC_TABLE + SpaceConstants.DOT + PRIMARY_EM));
    }
}
