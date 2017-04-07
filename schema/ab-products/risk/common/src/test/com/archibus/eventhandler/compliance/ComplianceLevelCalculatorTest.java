package com.archibus.eventhandler.compliance;

import com.archibus.datasource.DataSourceTestBase;
import com.archibus.utility.ExceptionBase;

/**
 * Provides TODO. Define test class for ComplianceLevelCalculator class. -
 * <p>
 * 
 * Used by TODO to TODO. Managed by Spring, has prototype TODO singleton scope. Configured in TODO
 * file.
 * 
 * @since 20.3
 * 
 */
public class ComplianceLevelCalculatorTest extends DataSourceTestBase {
    
    /**
     * Test Create ComplianceLocations.
     */
    public static final void testCreateComplianceLocations() {
        
        try {
            ComplianceLevelCalculator.calculateCompLevel();
            
        } catch (final ExceptionBase exceptionBase) {
            fail(exceptionBase.getLocalizedMessage());
        }
    }
    
}
