package com.archibus.service.space.mobile.survey.close;

import static com.archibus.app.common.mobile.util.ServiceConstants.ACTION_DELETE;
import static com.archibus.service.space.mobile.survey.TestConstants.*;

import com.archibus.service.space.SpaceConstants;
import com.archibus.service.space.mobile.survey.AbstractSurveyTest;

/**
 * Tests for close survey for room claimed by division and occupied by employee(room with cap_em=1,
 * 1 active rmpct record with dv_id and em_id not null).
 * 
 * @author Ana Paduraru
 * 
 */
public class TestOneRmpctWithDvAndEm extends AbstractSurveyTest {
    /** {@inheritDoc} */
    @Override
    public void onSetUp() throws Exception {
        super.onSetUp();
        
        // insert records that are assumed to exist in database
        addNewRoomRecordWithCapEm(1);
        
        // set initial values for rmpct records
        setValuesToRmpctRecord(0, DV_ID_VALUE, DP_ID_VALUE, EM_ID_VALUE, null, null);
    }
    
    /**
     * Add another employee (exceed cap_em).
     */
    public void testAddEmployeeToDivisionAndEmployeeAllocatedRoom() {
        // set the rmpctmob_sync records
        addNewRmpctSyncRecord(BL_ID_VALUE, FL_ID_VALUE, RM_ID_VALUE, null, null,
            SECOND_EM_ID_VALUE, null, null, SpaceConstants.ACTION_INSERT);
        
        // close the survey
        this.spaceOccupancyService.closeSurvey(SURVEY_ID_VALUE, MOBILE_USER_VALUE);
        
        // verify the record was added
        verifyInsertedRecord(2, 0, null, null, SECOND_EM_ID_VALUE, null, null);
        verifyInsertedRecord(2, 1, DV_ID_VALUE, DP_ID_VALUE, EM_ID_VALUE, null, null);
        
    }
    
    /**
     * Change employee.
     */
    public void testChangeEmployeeToDivisionAndEmployeeAllocatedRoom() {
        // set the rmpctmob_sync records
        addNewRmpctSyncRecord(BL_ID_VALUE, FL_ID_VALUE, RM_ID_VALUE, DV_ID_VALUE, DP_ID_VALUE,
            EM_ID_VALUE, null, null, ACTION_DELETE);
        addNewRmpctSyncRecord(BL_ID_VALUE, FL_ID_VALUE, RM_ID_VALUE, null, null,
            SECOND_EM_ID_VALUE, null, null, SpaceConstants.ACTION_INSERT);
        
        // close the survey
        this.spaceOccupancyService.closeSurvey(SURVEY_ID_VALUE, MOBILE_USER_VALUE);
        
        // verify the record was added
        verifyInsertedRecord(1, 0, DV_ID_VALUE, DP_ID_VALUE, SECOND_EM_ID_VALUE, null, null);
        
    }
    
    /**
     * Delete employee.
     */
    public void testDeleteEmployeeToDivisionAndEmployeeAllocatedRoom() {
        // set the rmpctmob_sync records
        addNewRmpctSyncRecord(BL_ID_VALUE, FL_ID_VALUE, RM_ID_VALUE, null, null, EM_ID_VALUE, null,
            null, ACTION_DELETE);
        
        // close the survey
        this.spaceOccupancyService.closeSurvey(SURVEY_ID_VALUE, MOBILE_USER_VALUE);
        
        // verify the record was added
        verifyInsertedRecord(1, 0, DV_ID_VALUE, DP_ID_VALUE, null, null, null);
    }
    
}
