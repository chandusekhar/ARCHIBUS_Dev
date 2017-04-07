package com.archibus.service.space;

import com.archibus.datasource.DataSourceTestBase;
import com.archibus.jobmanager.*;
import com.archibus.utility.ExceptionBase;

/**
 * EmployUpdate class' test class.
 * 
 * @author Shi lei
 * 
 */
public class EmployeeUpdateTest extends DataSourceTestBase {
    
    /**
     * Define a jobStatus variable which type is JobStatus.
     */
    private final JobStatus jobStatus = new Job().getStatus();
    
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
     * test UpdateEmployeeHeadcounts().
     */
    public void testUpdateEmployeeHeadcounts() {
        try {
            
            EmployeeUpdate.updateEmployeeHeadcounts();
            
        } catch (final ExceptionBase exceptionBase) {
            fail(exceptionBase.getLocalizedMessage());
        }
    }
    
    /**
     * Test InferRoomDepartmentsFromEmployees().
     * 
     */
    public void testInferRoomDepartmentsFromEmployees() {
        
        try {
            
            EmployeeUpdate.inferRoomDepartmentsFromEmployees(" 1=1 ", this.jobStatus);
            
        } catch (final ExceptionBase exceptionBase) {
            fail(exceptionBase.getLocalizedMessage());
        }
    }
}
