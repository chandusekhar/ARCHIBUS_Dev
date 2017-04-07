package com.archibus.eventhandler.ehs;

import java.util.*;

import com.archibus.datasource.DataSourceTestBase;

/**
 * JUnit test class.
 * 
 * @author Ioan Draghici
 * 
 */

public class EnvironmentalHealthSafetyServiceTest extends DataSourceTestBase {
    
    final EnvironmentalHealthSafetyService mainClassHandler =
            new EnvironmentalHealthSafetyService();
    
    /**
     * Assign training to employee.
     */
    public void testAssignMonitoringToEmployee() {
        
        final List<String> employeeIds = new ArrayList<String>();
        employeeIds.add("AI");
        final Date initialDate = new Date();
        final List<Integer> monitoringIds = new ArrayList<Integer>();
        monitoringIds.add(1);
        final String incidentId = "";
        
        this.mainClassHandler.assignMonitoringsToEmployees(monitoringIds, employeeIds, initialDate,
            incidentId);
    }
    
    /**
     * Test assign ppe to employee.
     */
    public void testAssignPPEToEmployee() {
        
        final List<String> employeeIds = new ArrayList<String>();
        employeeIds.add("AI");
        final String blId = "HQ";
        final String flId = "18";
        final String rmId = "106";
        final String incidentId = "";
        final Date deliveryDate = new Date();
        final List<String> ppeIds = new ArrayList<String>();
        ppeIds.add("CLOGS");
        
        this.mainClassHandler.assignPPEsToEmployees(ppeIds, employeeIds, deliveryDate, blId, flId,
            rmId, incidentId);
    }
    
    /**
     * Assign training to employee.
     */
    public void testAssignTrainingToEmployee() {
        
        final List<String> employeeIds = new ArrayList<String>();
        employeeIds.add("AI");
        final Date initialDate = new Date();
        final List<String> trainings = new ArrayList<String>();
        trainings.add("TR_PROG_22");
        trainings.add("TR_PROG_21");
        final String incidentId = "";
        
        this.mainClassHandler.assignTrainingToEmployees(trainings, employeeIds, initialDate,
            incidentId);
    }
}
