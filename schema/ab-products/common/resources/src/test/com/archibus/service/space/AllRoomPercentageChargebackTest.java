package com.archibus.service.space;

import com.archibus.datasource.DataSourceTestBase;
import com.archibus.jobmanager.*;
import com.archibus.utility.ExceptionBase;

/**
 * Test AllRoomPercentageChargeback class Provides.
 * 
 * @author Shi Lei
 * @since 20.1
 * 
 */
public class AllRoomPercentageChargebackTest extends DataSourceTestBase {
    
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
     * Test Perform Chargeback.
     */
    public void testPerformChargeback() {
        final JobBase job = new Job();
        try {
            
            AllRoomPercentageChargeback.performChargeback(job.getStatus());
            
        } catch (final ExceptionBase exceptionBase) {
            fail(exceptionBase.getLocalizedMessage());
        }
    }
}
