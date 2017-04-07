package com.archibus.service.space.mobile.survey.close;

import static com.archibus.app.common.mobile.util.ServiceConstants.ACTION_DELETE;
import static com.archibus.service.space.mobile.survey.TestConstants.*;

import com.archibus.service.space.SpaceConstants;
import com.archibus.service.space.mobile.survey.AbstractSurveyTest;

/**
 * Tests for close survey for room claimed by division (room with cap_em=1, 1 active rmpct record
 * with dv_id and dp_id not null and em_id null).
 * 
 * @author Ana Paduraru
 * 
 */
public class TestOneRmpctOneDv extends AbstractSurveyTest {
    /** {@inheritDoc} */
    @Override
    public void onSetUp() throws Exception {
        super.onSetUp();
        
        // add a new room record, which automatically adds a new rmpct record
        addNewRoomRecordWithCapEm(1);
        
        // set initial values for rmpct records
        setValuesToRmpctRecord(0, DV_ID_VALUE, DP_ID_VALUE, null, null, null);
    }
    
    /**
     * Add one employee transaction.
     */
    public void testAddEmployeeToDivisionClaimedRoom() {
        // set the rmpctmob_sync records
        addNewRmpctSyncRecord(BL_ID_VALUE, FL_ID_VALUE, RM_ID_VALUE, null, null, EM_ID_VALUE, null,
            null, SpaceConstants.ACTION_INSERT);
        
        // close the survey
        this.spaceOccupancyService.closeSurvey(SURVEY_ID_VALUE, MOBILE_USER_VALUE);
        
        // verify the record was added
        verifyInsertedRecord(1, 0, DV_ID_VALUE, DP_ID_VALUE, EM_ID_VALUE, null, null);
    }
    
    /**
     * Change the department.
     */
    public void testChangeDepartmentToDivisionClaimedRoom() {
        final String newDpId = "SALES";
        
        // set the rmpctmob_sync records
        addNewRmpctSyncRecord(BL_ID_VALUE, FL_ID_VALUE, RM_ID_VALUE, DV_ID_VALUE, DP_ID_VALUE,
            null, null, null, ACTION_DELETE);
        addNewRmpctSyncRecord(BL_ID_VALUE, FL_ID_VALUE, RM_ID_VALUE, DV_ID_VALUE, newDpId, null,
            null, null, SpaceConstants.ACTION_INSERT);
        
        // close the survey
        this.spaceOccupancyService.closeSurvey(SURVEY_ID_VALUE, MOBILE_USER_VALUE);
        
        // verify the record was added
        verifyInsertedRecord(1, 0, DV_ID_VALUE, newDpId, null, null, null);
    }
    
    /**
     * Change the division.
     */
    public void testChangeDivisionDepartmentToDivisionClaimedRoom() {
        // set the rmpctmob_sync records
        addNewRmpctSyncRecord(BL_ID_VALUE, FL_ID_VALUE, RM_ID_VALUE, DV_ID_VALUE, DP_ID_VALUE,
            null, null, null, ACTION_DELETE);
        addNewRmpctSyncRecord(BL_ID_VALUE, FL_ID_VALUE, RM_ID_VALUE, SECOND_DV_ID_VALUE,
            SECOND_DP_ID_VALUE, null, null, null, SpaceConstants.ACTION_INSERT);
        
        // close the survey
        this.spaceOccupancyService.closeSurvey(SURVEY_ID_VALUE, MOBILE_USER_VALUE);
        
        // verify the record was added
        verifyInsertedRecord(1, 0, SECOND_DV_ID_VALUE, SECOND_DP_ID_VALUE, null, null, null);
    }
    
    /**
     * Change the division and set dp_id null.
     */
    public void testChangeDivisionToDivisionClaimedRoom() {
        // set the rmpctmob_sync records
        addNewRmpctSyncRecord(BL_ID_VALUE, FL_ID_VALUE, RM_ID_VALUE, DV_ID_VALUE, DP_ID_VALUE,
            null, null, null, ACTION_DELETE);
        addNewRmpctSyncRecord(BL_ID_VALUE, FL_ID_VALUE, RM_ID_VALUE, SECOND_DV_ID_VALUE, null,
            null, null, null, SpaceConstants.ACTION_INSERT);
        
        // close the survey
        this.spaceOccupancyService.closeSurvey(SURVEY_ID_VALUE, MOBILE_USER_VALUE);
        
        // verify the records were added
        // // setting the dp_id null inserts also an empty record:
        // The difference appears from call of method
        // SpaceTransactioinDepartment.updateRmpctRecordsFromDpServiceRequest
        // The first record is empty
        verifyInsertedRecord(2, 0, null, null, null, null, null);
        verifyInsertedRecord(2, 1, SECOND_DV_ID_VALUE, null, null, null, null);
    }
    
    /**
     * Delete the division.
     */
    public void testDeleteDivisionToDivisionClaimedRoom() {
        // set the rmpctmob_sync records
        addNewRmpctSyncRecord(BL_ID_VALUE, FL_ID_VALUE, RM_ID_VALUE, DV_ID_VALUE, DP_ID_VALUE,
            null, null, null, ACTION_DELETE);
        
        // close the survey
        this.spaceOccupancyService.closeSurvey(SURVEY_ID_VALUE, MOBILE_USER_VALUE);
        
        // verify the record was added
        verifyInsertedRecord(1, 0, null, null, null, null, null);
    }
    
}
