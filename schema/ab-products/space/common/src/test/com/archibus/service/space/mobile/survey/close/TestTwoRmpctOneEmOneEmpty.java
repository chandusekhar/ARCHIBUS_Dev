package com.archibus.service.space.mobile.survey.close;

import static com.archibus.app.common.mobile.util.ServiceConstants.ACTION_DELETE;
import static com.archibus.service.space.mobile.survey.TestConstants.*;

import com.archibus.service.space.*;
import com.archibus.service.space.mobile.survey.AbstractSurveyTest;

/**
 * Tests for close survey for room with 2 records – 1 empty record, 1 with employee.
 * 
 * @author Ana Paduraru
 * 
 */
public class TestTwoRmpctOneEmOneEmpty extends AbstractSurveyTest {
    /** {@inheritDoc} */
    @Override
    public void onSetUp() throws Exception {
        super.onSetUp();
        
        // add a new room record, which automatically adds a new rmpct record
        addNewRoomRecordWithCapEm(2);
        
        new SpaceService().synchronizeSharedRooms();
        
        // set initial values for rmpct records
        setValuesToRmpctRecord(0, null, null, EM_ID_VALUE, null, null);
    }
    
    /**
     * Change existing employee.
     */
    public void testChangeEmToRoomWithOneEmOneEmptyRmpct() {
        // set the rmpctmob_sync records
        addNewRmpctSyncRecord(BL_ID_VALUE, FL_ID_VALUE, RM_ID_VALUE, null, null, EM_ID_VALUE, null,
            null, ACTION_DELETE);
        addNewRmpctSyncRecord(BL_ID_VALUE, FL_ID_VALUE, RM_ID_VALUE, null, null,
            SECOND_EM_ID_VALUE, null, null, SpaceConstants.ACTION_INSERT);
        
        // close the survey
        this.spaceOccupancyService.closeSurvey(SURVEY_ID_VALUE, MOBILE_USER_VALUE);
        
        // verify the records were added
        verifyInsertedRecord(2, 0, null, null, null, null, null);
        verifyInsertedRecord(2, 1, null, null, SECOND_EM_ID_VALUE, null, null);
    }
    
    /**
     * Add another employee transaction.
     */
    public void testAddNewEmToRoomWithOneEmOneEmptyRmpct() {
        // set the rmpctmob_sync records
        addNewRmpctSyncRecord(BL_ID_VALUE, FL_ID_VALUE, RM_ID_VALUE, null, null,
            SECOND_EM_ID_VALUE, null, null, SpaceConstants.ACTION_INSERT);
        
        // close the survey
        this.spaceOccupancyService.closeSurvey(SURVEY_ID_VALUE, MOBILE_USER_VALUE);
        
        // verify the records were added
        verifyInsertedRecord(2, 0, null, null, EM_ID_VALUE, null, null);
        verifyInsertedRecord(2, 1, null, null, SECOND_EM_ID_VALUE, null, null);
    }
    
    /**
     * Delete existing employee transaction.
     */
    public void testDeleteEmToRoomWithOneEmOneEmptyRmpct() {
        // set the rmpctmob_sync records
        addNewRmpctSyncRecord(BL_ID_VALUE, FL_ID_VALUE, RM_ID_VALUE, null, null, EM_ID_VALUE, null,
            null, ACTION_DELETE);
        
        // close the survey
        this.spaceOccupancyService.closeSurvey(SURVEY_ID_VALUE, MOBILE_USER_VALUE);
        
        // verify the records were added
        verifyInsertedRecord(2, 0, null, null, null, null, null);
        verifyInsertedRecord(2, 1, null, null, null, null, null);
    }
    
    /**
     * Add one division.
     */
    public void testAddDvToRoomWithOneEmOneEmptyRmpct() {
        // set the rmpctmob_sync records
        addNewRmpctSyncRecord(BL_ID_VALUE, FL_ID_VALUE, RM_ID_VALUE, DV_ID_VALUE, DP_ID_VALUE,
            null, null, null, SpaceConstants.ACTION_INSERT);
        
        // close the survey
        this.spaceOccupancyService.closeSurvey(SURVEY_ID_VALUE, MOBILE_USER_VALUE);
        
        // verify the records were added
        // In 21.2 release, the division is set for both records
        verifyInsertedRecord(2, 0, DV_ID_VALUE, DP_ID_VALUE, EM_ID_VALUE, null, null);
        verifyInsertedRecord(2, 1, DV_ID_VALUE, DP_ID_VALUE, null, null, null);
    }
    
    /**
     * Add two divisions.
     */
    public void testAddTwoDvToRoomWithOneEmOneEmptyRmpct() {
        // set the rmpctmob_sync records
        addNewRmpctSyncRecord(BL_ID_VALUE, FL_ID_VALUE, RM_ID_VALUE, DV_ID_VALUE, DP_ID_VALUE,
            null, null, null, SpaceConstants.ACTION_INSERT);
        addNewRmpctSyncRecord(BL_ID_VALUE, FL_ID_VALUE, RM_ID_VALUE, SECOND_DV_ID_VALUE,
            SECOND_DP_ID_VALUE, null, null, null, SpaceConstants.ACTION_INSERT);
        
        // close the survey
        this.spaceOccupancyService.closeSurvey(SURVEY_ID_VALUE, MOBILE_USER_VALUE);
        
        // verify the records were added
        // In 21.2 release, the first division is set for both records
        verifyInsertedRecord(2, 0, DV_ID_VALUE, DP_ID_VALUE, EM_ID_VALUE, null, null);
        verifyInsertedRecord(2, 1, DV_ID_VALUE, DP_ID_VALUE, null, null, null);
    }
}
