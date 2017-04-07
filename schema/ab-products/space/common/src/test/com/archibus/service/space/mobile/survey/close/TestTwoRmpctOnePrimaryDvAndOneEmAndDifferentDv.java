package com.archibus.service.space.mobile.survey.close;

import static com.archibus.app.common.mobile.util.ServiceConstants.ACTION_DELETE;
import static com.archibus.service.space.mobile.survey.TestConstants.*;

import com.archibus.service.space.*;
import com.archibus.service.space.mobile.survey.AbstractSurveyTest;

/**
 * Tests for close survey for room with 2 records – 1 primary room division record, 1 with employee
 * and another division not primary.
 * 
 * @author Ana Paduraru
 * 
 */
public class TestTwoRmpctOnePrimaryDvAndOneEmAndDifferentDv extends AbstractSurveyTest {
    /** {@inheritDoc} */
    @Override
    public void onSetUp() throws Exception {
        super.onSetUp();
        
        // add a new room record, which automatically adds a new rmpct records
        addNewRoomRecordWithCapEm(2);
        
        new SpaceService().synchronizeSharedRooms();
        
        // set initial values for rmpct records
        setValuesToRmpctRecord(0, DV_ID_VALUE, DP_ID_VALUE, EM_ID_VALUE, 1, null);
        setValuesToRmpctRecord(1, SECOND_DV_ID_VALUE, SECOND_DP_ID_VALUE, null, 0, null);
    }
    
    /**
     * Change secondary division.
     */
    public void testChangeSecondaryDvToRoomWithOnePrimaryDvAndOneEmAndDifferentDvRmpct() {
        final String thirdDvId = "FACILITIES";
        final String thirdDpId = "DESIGN";
        
        // set the rmpctmob_sync records
        addNewRmpctSyncRecord(BL_ID_VALUE, FL_ID_VALUE, RM_ID_VALUE, SECOND_DV_ID_VALUE,
            SECOND_DP_ID_VALUE, null, 0, null, ACTION_DELETE);
        addNewRmpctSyncRecord(BL_ID_VALUE, FL_ID_VALUE, RM_ID_VALUE, thirdDvId, thirdDpId, null, 0,
            null, SpaceConstants.ACTION_INSERT);
        
        // close the survey
        this.spaceOccupancyService.closeSurvey(SURVEY_ID_VALUE, MOBILE_USER_VALUE);
        
        // verify the records were added
        verifyInsertedRecord(2, 0, DV_ID_VALUE, DP_ID_VALUE, EM_ID_VALUE, 1, null);
        // In 21.2 release the primary_rm value is set to 1, not to 0 as it is inserted
        verifyInsertedRecord(2, 1, thirdDvId, thirdDpId, null, null, null);
    }
    
    /**
     * Change primary room department.
     */
    public void testChangePrimaryDpToRoomWithOnePrimaryDvAndOneEmAndDifferentDvRmpct() {
        final String newDpId = "SALES";
        
        // set the rmpctmob_sync records
        addNewRmpctSyncRecord(BL_ID_VALUE, FL_ID_VALUE, RM_ID_VALUE, DV_ID_VALUE, DP_ID_VALUE,
            null, 1, null, ACTION_DELETE);
        addNewRmpctSyncRecord(BL_ID_VALUE, FL_ID_VALUE, RM_ID_VALUE, DV_ID_VALUE, newDpId, null, 1,
            null, SpaceConstants.ACTION_INSERT);
        
        // close the survey
        this.spaceOccupancyService.closeSurvey(SURVEY_ID_VALUE, MOBILE_USER_VALUE);
        
        // verify the records were added
        verifyInsertedRecord(2, 0, SECOND_DV_ID_VALUE, SECOND_DP_ID_VALUE, null, 0, null);
        verifyInsertedRecord(2, 1, DV_ID_VALUE, newDpId, EM_ID_VALUE, 1, null);
    }
    
    /**
     * Delete primary room division.
     */
    public void testDeletePrimaryDvToRoomWithOnePrimaryDvAndOneEmAndDifferentDvRmpct() {
        // set the rmpctmob_sync records
        addNewRmpctSyncRecord(BL_ID_VALUE, FL_ID_VALUE, RM_ID_VALUE, DV_ID_VALUE, DP_ID_VALUE,
            null, 1, null, ACTION_DELETE);
        
        // close the survey
        this.spaceOccupancyService.closeSurvey(SURVEY_ID_VALUE, MOBILE_USER_VALUE);
        
        // verify the records were added
        verifyInsertedRecord(2, 0, SECOND_DV_ID_VALUE, SECOND_DP_ID_VALUE, null, 0, null);
        verifyInsertedRecord(2, 1, null, null, EM_ID_VALUE, 1, null);
    }
    
    /**
     * Delete primary room division and employee.
     */
    public void testDeletePrimaryDvAndEmToRoomWithOnePrimaryDvAndOneEmAndDifferentDvRmpct() {
        // set the rmpctmob_sync records
        addNewRmpctSyncRecord(BL_ID_VALUE, FL_ID_VALUE, RM_ID_VALUE, DV_ID_VALUE, DP_ID_VALUE,
            null, 1, null, ACTION_DELETE);
        addNewRmpctSyncRecord(BL_ID_VALUE, FL_ID_VALUE, RM_ID_VALUE, null, null, EM_ID_VALUE, 1,
            null, ACTION_DELETE);
        
        // close the survey
        this.spaceOccupancyService.closeSurvey(SURVEY_ID_VALUE, MOBILE_USER_VALUE);
        
        // verify the records were added
        // In 21.2 release deleting the primary division changes both records.
        verifyInsertedRecord(2, 0, SECOND_DV_ID_VALUE, SECOND_DP_ID_VALUE, null, 0, null);
        verifyInsertedRecord(2, 1, null, null, null, 1, null);
    }
    
    /**
     * Change employee.
     */
    public void testChangeEmToRoomWithOnePrimaryDvAndOneEmAndDifferentDvRmpct() {
        // set the rmpctmob_sync records
        addNewRmpctSyncRecord(BL_ID_VALUE, FL_ID_VALUE, RM_ID_VALUE, null, null, EM_ID_VALUE, 1,
            null, ACTION_DELETE);
        addNewRmpctSyncRecord(BL_ID_VALUE, FL_ID_VALUE, RM_ID_VALUE, null, null,
            SECOND_EM_ID_VALUE, 1, null, SpaceConstants.ACTION_INSERT);
        
        // close the survey
        this.spaceOccupancyService.closeSurvey(SURVEY_ID_VALUE, MOBILE_USER_VALUE);
        
        // verify the records were added
        // In 21.2 release the employee is added to the secondary division record
        verifyInsertedRecord(2, 0, DV_ID_VALUE, DP_ID_VALUE, null, 1, null);
        verifyInsertedRecord(2, 1, SECOND_DV_ID_VALUE, SECOND_DP_ID_VALUE, SECOND_EM_ID_VALUE, 0,
            null);
    }
    
    /**
     * Delete employee.
     */
    public void testDeleteEmToRoomWithOnePrimaryDvAndOneEmAndDifferentDvRmpct() {
        // set the rmpctmob_sync records
        addNewRmpctSyncRecord(BL_ID_VALUE, FL_ID_VALUE, RM_ID_VALUE, null, null, EM_ID_VALUE, 1,
            null, ACTION_DELETE);
        
        // close the survey
        this.spaceOccupancyService.closeSurvey(SURVEY_ID_VALUE, MOBILE_USER_VALUE);
        
        // verify the records were added
        verifyInsertedRecord(2, 0, SECOND_DV_ID_VALUE, SECOND_DP_ID_VALUE, null, 0, null);
        verifyInsertedRecord(2, 1, DV_ID_VALUE, DP_ID_VALUE, null, 1, null);
    }
}
