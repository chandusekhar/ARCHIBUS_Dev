package com.archibus.eventhandler.compliance;

import com.archibus.datasource.DataSourceTestBase;
import com.archibus.utility.ExceptionBase;

/**
 * Provides TODO. Define test class for ComplianceUtility class.
 * 
 * @since 20.3
 * 
 */
public class ComplianceUtilityTest extends DataSourceTestBase {
    
    /**
     * Test GetDataSourceEvent.
     */
    public static final void testGetDataSourceEvent() {
        
        try {
            ComplianceUtility.getDataSourceEvent();
            
        } catch (final ExceptionBase exceptionBase) {
            fail(exceptionBase.getLocalizedMessage());
        }
    }
    
    /**
     * Test GetDataSourceRegLocJoinComplianceLoc.
     */
    public static final void testGetDataSourceRegLocJoinComplianceLoc() {
        
        try {
            ComplianceUtility.getDataSourceRegLocJoinComplianceLoc();
            
        } catch (final ExceptionBase exceptionBase) {
            fail(exceptionBase.getLocalizedMessage());
        }
    }
    
    /**
     * Test testGetDataSourceRegNotify.
     */
    public static final void testGetDataSourceRegNotify() {
        
        try {
            ComplianceUtility.getDataSourceRegNotify();
            
        } catch (final ExceptionBase exceptionBase) {
            fail(exceptionBase.getLocalizedMessage());
        }
    }
    
    /**
     * Test GetDataSourceRequirement.
     */
    public static final void testGetDataSourceRequirement() {
        
        try {
            ComplianceUtility.getDataSourceRequirement();
            
        } catch (final ExceptionBase exceptionBase) {
            fail(exceptionBase.getLocalizedMessage());
        }
    }
    
}
