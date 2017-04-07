package com.archibus.service.space.mobile.survey.close;

import static com.archibus.service.space.mobile.survey.TestConstants.*;

import com.archibus.service.space.SpaceConstants;
import com.archibus.service.space.mobile.survey.AbstractSurveyTest;

/**
 * Tests for close survey for empty room (room with cap_em=1, 1 active rmpct record with dv_id and
 * em_id null).
 * 
 * @author Ana Paduraru
 * 
 */
public class TestOneRmpctEmptyRoom extends AbstractSurveyTest {
    /** {@inheritDoc} */
    @Override
    public void onSetUp() throws Exception {
        super.onSetUp();
        
        // insert records that are assumed to exist in database
        addNewRoomRecordWithCapEm(1);
    }
    
    /**
     * Add one division transaction.
     */
    public void testAddDivisionToEmptyRoom() {
        // set the rmpctmob_sync record
        addNewRmpctSyncRecord(BL_ID_VALUE, FL_ID_VALUE, RM_ID_VALUE, DV_ID_VALUE, DP_ID_VALUE,
            null, null, null, SpaceConstants.ACTION_INSERT);
        
        // close the survey
        this.spaceOccupancyService.closeSurvey(SURVEY_ID_VALUE, MOBILE_USER_VALUE);
        
        verifyInsertedRecord(1, 0, DV_ID_VALUE, DP_ID_VALUE, null, null, null);
    }
    
    /**
     * Add one employee transaction.
     */
    public void testAddEmployeeToEmptyRoom() {
        // set the rmpctmob_sync record
        addNewRmpctSyncRecord(BL_ID_VALUE, FL_ID_VALUE, RM_ID_VALUE, null, null, EM_ID_VALUE, null,
            null, SpaceConstants.ACTION_INSERT);
        
        // close the survey
        this.spaceOccupancyService.closeSurvey(SURVEY_ID_VALUE, MOBILE_USER_VALUE);
        
        verifyInsertedRecord(1, 0, null, null, EM_ID_VALUE, null, null);
    }
    
    /**
     * Add one division transaction and one employee transaction.
     */
    public void testAddDivisionAndEmployeeToEmptyRoom() {
        // set the rmpctmob_sync records
        addNewRmpctSyncRecord(BL_ID_VALUE, FL_ID_VALUE, RM_ID_VALUE, DV_ID_VALUE, DP_ID_VALUE,
            null, null, null, SpaceConstants.ACTION_INSERT);
        addNewRmpctSyncRecord(BL_ID_VALUE, FL_ID_VALUE, RM_ID_VALUE, null, null, EM_ID_VALUE, null,
            null, SpaceConstants.ACTION_INSERT);
        
        // close the survey
        this.spaceOccupancyService.closeSurvey(SURVEY_ID_VALUE, MOBILE_USER_VALUE);
        
        // verify the record was added
        verifyInsertedRecord(1, 0, DV_ID_VALUE, DP_ID_VALUE, EM_ID_VALUE, null, null);
    }
}
