package com.archibus.service.space;

import com.archibus.datasource.DataSourceTestBase;
import com.archibus.jobmanager.*;
import com.archibus.utility.ExceptionBase;

/**
 * Test class for class AllRoomAreaUpdate.
 * 
 * 
 * @author Shi Lei
 * @since 20.3
 * 
 */
public class AllRoomAreaUpdateTest extends DataSourceTestBase {
    
    /**
     * Inner class for implements extends JobBase.
     * 
     */
    class Job extends JobBase {
        @Override
        public JobStatus getStatus() {
            return this.status;
        }
    }
    
    /**
     * Test AllRoomAreaUpdate class updateAreaTotals() method .
     */
    public void testAllRoomAreaUpdate() {
        try {
            
            AllRoomAreaUpdate.updateAreaTotals(new Job().getStatus());
            
        } catch (final ExceptionBase exceptionBase) {
            fail(exceptionBase.getLocalizedMessage());
        }
    }
    
    /**
     * Test AllRoomAreaUpdate class addNonoccupiableRoomCategories() method .
     * testAddNonoccupiableRoomCategories.
     */
    public void testAddNonoccupiableRoomCategories() {
        try {
            
            AllRoomAreaUpdate.addNonoccupiableRoomCategories(new Job().getStatus());
            
        } catch (final ExceptionBase exceptionBase) {
            fail(exceptionBase.getLocalizedMessage());
        }
    }
    
}