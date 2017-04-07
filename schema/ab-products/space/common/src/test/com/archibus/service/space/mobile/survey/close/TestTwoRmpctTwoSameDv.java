package com.archibus.service.space.mobile.survey.close;

import static com.archibus.app.common.mobile.util.ServiceConstants.ACTION_DELETE;
import static com.archibus.service.space.mobile.survey.TestConstants.*;

import com.archibus.service.space.*;
import com.archibus.service.space.mobile.survey.AbstractSurveyTest;

/**
 * Tests for close survey for room with 2 records – 2 division records - 1 with a primary room
 * division, 1 with a secondary room division, same division.
 * 
 * @author Ana Paduraru
 * 
 */
public class TestTwoRmpctTwoSameDv extends AbstractSurveyTest {
    /** {@inheritDoc} */
    @Override
    public void onSetUp() throws Exception {
        super.onSetUp();
        
        // add a new room record, which automatically adds a new rmpct record
        addNewRoomRecordWithCapEm(2);
        
        new SpaceService().synchronizeSharedRooms();
        
        // set initial values for rmpct records
        setValuesToRmpctRecord(0, DV_ID_VALUE, DP_ID_VALUE, null, 1, null);
        setValuesToRmpctRecord(1, DV_ID_VALUE, DP_ID_VALUE, null, 0, null);
    }
    
    /**
     * Add 2 employee transactions.
     */
    public void testAddTwoEmTransToRoomWithTwoDvRmpct() {
        // set the rmpctmob_sync records
        addNewRmpctSyncRecord(BL_ID_VALUE, FL_ID_VALUE, RM_ID_VALUE, null, null, EM_ID_VALUE, null,
            null, SpaceConstants.ACTION_INSERT);
        addNewRmpctSyncRecord(BL_ID_VALUE, FL_ID_VALUE, RM_ID_VALUE, null, null,
            SECOND_EM_ID_VALUE, null, null, SpaceConstants.ACTION_INSERT);
        
        // close the survey
        this.spaceOccupancyService.closeSurvey(SURVEY_ID_VALUE, MOBILE_USER_VALUE);
        
        // verify the records were added
        verifyInsertedRecord(2, 0, DV_ID_VALUE, DP_ID_VALUE, EM_ID_VALUE, 1, null);
        verifyInsertedRecord(2, 1, DV_ID_VALUE, DP_ID_VALUE, SECOND_EM_ID_VALUE, 0, null);
    }
    
    /**
     * Change the primary room division.
     */
    public void testChangePrimaryDvToRoomWithTwoDvRmpct() {
        // set the rmpctmob_sync records
        addNewRmpctSyncRecord(BL_ID_VALUE, FL_ID_VALUE, RM_ID_VALUE, DV_ID_VALUE, DP_ID_VALUE,
            null, 1, null, ACTION_DELETE);
        addNewRmpctSyncRecord(BL_ID_VALUE, FL_ID_VALUE, RM_ID_VALUE, SECOND_DV_ID_VALUE,
            SECOND_DP_ID_VALUE, null, 1, null, SpaceConstants.ACTION_INSERT);
        
        // close the survey
        this.spaceOccupancyService.closeSurvey(SURVEY_ID_VALUE, MOBILE_USER_VALUE);
        
        // verify the records were added
        // In 21.2 release changing the primary division changes both records
        verifyInsertedRecord(2, 0, SECOND_DV_ID_VALUE, SECOND_DP_ID_VALUE, null, 1, null);
        verifyInsertedRecord(2, 1, SECOND_DV_ID_VALUE, SECOND_DP_ID_VALUE, null, 1, null);
    }
    
    /**
     * Delete the primary room division.
     */
    public void testDeletePrimaryDvToRoomWithTwoDvRmpct() {
        // set the rmpctmob_sync records
        addNewRmpctSyncRecord(BL_ID_VALUE, FL_ID_VALUE, RM_ID_VALUE, DV_ID_VALUE, DP_ID_VALUE,
            null, 1, null, ACTION_DELETE);
        
        // close the survey
        this.spaceOccupancyService.closeSurvey(SURVEY_ID_VALUE, MOBILE_USER_VALUE);
        
        // verify the records were added
        // In 21.2 release deleting the primary division deletes both records
        verifyInsertedRecord(2, 0, null, null, null, null, null);
        verifyInsertedRecord(2, 1, null, null, null, null, null);
    }
    
    /**
     * Delete both division transaction records.
     */
    public void testDeleteBothDvToRoomWithTwoDvRmpct() {
        // set the rmpctmob_sync records
        addNewRmpctSyncRecord(BL_ID_VALUE, FL_ID_VALUE, RM_ID_VALUE, DV_ID_VALUE, DP_ID_VALUE,
            null, 1, null, ACTION_DELETE);
        addNewRmpctSyncRecord(BL_ID_VALUE, FL_ID_VALUE, RM_ID_VALUE, DV_ID_VALUE, DP_ID_VALUE,
            null, 0, null, ACTION_DELETE);
        
        // close the survey
        this.spaceOccupancyService.closeSurvey(SURVEY_ID_VALUE, MOBILE_USER_VALUE);
        
        // verify the records were added
        verifyInsertedRecord(2, 0, null, null, null, null, null);
        verifyInsertedRecord(2, 1, null, null, null, null, null);
    }
    
}
