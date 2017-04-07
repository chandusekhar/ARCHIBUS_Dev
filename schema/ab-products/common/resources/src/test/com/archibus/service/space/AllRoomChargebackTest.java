package com.archibus.service.space;

import com.archibus.datasource.DataSourceTestBase;
import com.archibus.utility.ExceptionBase;

/**
 * All Room Chargeback calculations.
 * 
 * <p>
 * 
 * @author Shi Lei
 */
public class AllRoomChargebackTest extends DataSourceTestBase {
    
    /**
     * Test PerformChargeback().
     */
    public void testPerformChargeback() {
        try {
            
            AllRoomChargeback.performChargeback();
            
        } catch (final ExceptionBase exceptionBase) {
            fail(exceptionBase.getLocalizedMessage());
        }
        
    }
}
