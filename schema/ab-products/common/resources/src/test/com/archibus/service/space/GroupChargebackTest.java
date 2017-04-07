package com.archibus.service.space;

import com.archibus.datasource.DataSourceTestBase;
import com.archibus.utility.ExceptionBase;

/**
 * Group Chargeback calculations.
 * 
 * @author @author Shi Lei
 */
public class GroupChargebackTest extends DataSourceTestBase {
    
    /**
     * Test PerformChargeback.
     */
    public void testPerformChargeback() {
        try {
            
            GroupChargeback.performChargeback();
            
        } catch (final ExceptionBase exceptionBase) {
            fail(exceptionBase.getLocalizedMessage());
        }
    }
}
