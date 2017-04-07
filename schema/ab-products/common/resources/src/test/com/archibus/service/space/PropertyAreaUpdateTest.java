package com.archibus.service.space;

import com.archibus.datasource.DataSourceTestBase;
import com.archibus.utility.ExceptionBase;

/**
 * Test PropertyAreaUpdate class.
 * 
 * 
 * @author @author Shi Lei
 */
public class PropertyAreaUpdateTest extends DataSourceTestBase {
    
    /**
     * 
     * Test updateBuildingAndPropertyAreas().
     */
    public void testUpdateBuildingAndPropertyAreas() {
        try {
            
            PropertyAreaUpdate.updateBuildingAndPropertyAreas();
            
        } catch (final ExceptionBase exceptionBase) {
            fail(exceptionBase.getLocalizedMessage());
        }
    }
    
}
