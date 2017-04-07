package com.archibus.service.space.mobile.survey.close;

import static com.archibus.app.common.mobile.util.ServiceConstants.ACTION_DELETE;
import static com.archibus.service.space.mobile.survey.TestConstants.*;

import com.archibus.service.space.*;
import com.archibus.service.space.mobile.survey.AbstractSurveyTest;

/**
 * Tests for close survey for room with 2 records – 2 employee records with distinct divisions.
 * 
 * @author Ana Paduraru
 * 
 */
public class TestTwoRmpctTwoEmDistinctDv extends AbstractSurveyTest {
    /** {@inheritDoc} */
    @Override
    public void onSetUp() throws Exception {
        super.onSetUp();
        
        // add a new room record, which automatically adds a new rmpct record
        addNewRoomRecordWithCapEm(2);
        
        new SpaceService().synchronizeSharedRooms();
        
        // set initial values for rmpct records
        setValuesToRmpctRecord(0, DV_ID_VALUE, DP_ID_VALUE, EM_ID_VALUE, 1, 1);
        setValuesToRmpctRecord(1, SECOND_DV_ID_VALUE, SECOND_DP_ID_VALUE, SECOND_EM_ID_VALUE, 0, 1);
    }
    
    /**
     * Change employees.
     */
    public void testChangeEmTransToRoomWithTwoEmAndDistinctDvRmpct() {
        final String thirdEmId = "ADAMS, DEAN";
        final String forthEmId = "DOE, JOHN";
        
        // set the rmpctmob_sync records
        addNewRmpctSyncRecord(BL_ID_VALUE, FL_ID_VALUE, RM_ID_VALUE, DV_ID_VALUE, DP_ID_VALUE,
            EM_ID_VALUE, 1, 1, ACTION_DELETE);
        addNewRmpctSyncRecord(BL_ID_VALUE, FL_ID_VALUE, RM_ID_VALUE, SECOND_DV_ID_VALUE,
            SECOND_DP_ID_VALUE, SECOND_EM_ID_VALUE, 0, 1, ACTION_DELETE);
        addNewRmpctSyncRecord(BL_ID_VALUE, FL_ID_VALUE, RM_ID_VALUE, null, null, thirdEmId, null,
            1, SpaceConstants.ACTION_INSERT);
        addNewRmpctSyncRecord(BL_ID_VALUE, FL_ID_VALUE, RM_ID_VALUE, null, null, forthEmId, null,
            0, SpaceConstants.ACTION_INSERT);
        
        // close the survey
        this.spaceOccupancyService.closeSurvey(SURVEY_ID_VALUE, MOBILE_USER_VALUE);
        
        // verify the records were added
        verifyInsertedRecord(2, 0, DV_ID_VALUE, DP_ID_VALUE, thirdEmId, 1, 1);
        verifyInsertedRecord(2, 1, SECOND_DV_ID_VALUE, SECOND_DP_ID_VALUE, forthEmId, 0, 0);
    }
    
    /**
     * Delete employees.
     */
    public void testDeleteEmTransToRoomWithTwoEmAndDistinctDvRmpct() {
        // set the rmpctmob_sync records
        addNewRmpctSyncRecord(BL_ID_VALUE, FL_ID_VALUE, RM_ID_VALUE, DV_ID_VALUE, DP_ID_VALUE,
            EM_ID_VALUE, 1, 1, ACTION_DELETE);
        addNewRmpctSyncRecord(BL_ID_VALUE, FL_ID_VALUE, RM_ID_VALUE, SECOND_DV_ID_VALUE,
            SECOND_DP_ID_VALUE, SECOND_EM_ID_VALUE, 0, 1, ACTION_DELETE);
        
        // close the survey
        this.spaceOccupancyService.closeSurvey(SURVEY_ID_VALUE, MOBILE_USER_VALUE);
        
        // verify the records were added
        verifyInsertedRecord(2, 0, DV_ID_VALUE, DP_ID_VALUE, null, 1, null);
        verifyInsertedRecord(2, 1, SECOND_DV_ID_VALUE, SECOND_DP_ID_VALUE, null, 0, null);
    }
    
}
