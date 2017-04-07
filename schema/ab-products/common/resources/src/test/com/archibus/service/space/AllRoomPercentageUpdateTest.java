package com.archibus.service.space;

import java.util.Date;

import com.archibus.datasource.DataSourceTestBase;
import com.archibus.jobmanager.*;
import com.archibus.utility.*;

/**
 * Test AllRoomPercentageUpdate class.
 * 
 * @author Shi Lei
 */
public class AllRoomPercentageUpdateTest extends DataSourceTestBase {
    
    /**
     * Define variable BL_ID.
     */
    private static final String BL_ID = "Hq";
    
    /**
     * Define variable FL_ID.
     */
    private static final String FL_ID = "18";
    
    /**
     * Define variable RM_ID.
     */
    private static final String RM_ID = "116";
    
    /**
     * Get dateFrom .
     */
    private final Date dateFrom = Utility.currentDate();
    
    /**
     * Define variable requestDate.
     */
    private final Date requestDate = Utility.currentDate();
    
    /**
     * Get date to.
     */
    private final Date dateTo = Utility.currentDate();
    
    /**
     * Get default job status.
     */
    private final JobStatus jobStatus = new Job().getStatus();
    
    /**
     * Inner class for implements extends JobBase.
     */
    class Job extends JobBase {
        @Override
        public JobStatus getStatus() {
            return this.status;
        }
    }
    
    /**
     * Test updatePercentageOfSpace().
     */
    public void testUpdatePercentageOfSpace() {
        try {
            
            AllRoomPercentageUpdate.updatePercentageOfSpace(this.requestDate, BL_ID, FL_ID, RM_ID);
            
        } catch (final ExceptionBase exceptionBase) {
            fail(exceptionBase.getLocalizedMessage());
        }
    }
    
    /**
     * Test UpdateSpace().
     */
    public void testUpdateSpace() {
        try {
            
            AllRoomPercentageUpdate.updateSpace(this.jobStatus);
            
        } catch (final ExceptionBase exceptionBase) {
            fail(exceptionBase.getLocalizedMessage());
        }
    }
    
    /**
     * Test updateSpaceTime().
     */
    public void testUpdateSpaceTime() {
        try {
            
            AllRoomPercentageUpdate.updateSpaceTime(this.dateFrom, this.dateTo, this.jobStatus);
            
        } catch (final ExceptionBase exceptionBase) {
            fail(exceptionBase.getLocalizedMessage());
        }
    }
    
    /**
     * Test synchronizeRoomPercentages().
     */
    public void testSynchronizeRoomPercentages() {
        try {
            
            AllRoomPercentageUpdate.synchronizeRoomPercentages();
            
        } catch (final ExceptionBase exceptionBase) {
            fail(exceptionBase.getLocalizedMessage());
        }
    }
}
