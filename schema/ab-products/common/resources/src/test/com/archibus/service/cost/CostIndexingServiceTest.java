package com.archibus.service.cost;

import java.util.Date;

import com.archibus.datasource.DataSourceTestBase;

/**
 * Test class for Cost Indexing Service.
 * 
 * @author Ioan Draghici
 * @since 20.1
 * 
 */
public class CostIndexingServiceTest extends DataSourceTestBase {
    
    /**
     * Cost indexing service.
     * 
     */
    private final CostIndexingService classHandler = new CostIndexingService();
    
    /**
     * Test index costs method.
     */
    public void testIndexCosts() {
        this.classHandler.applyIndexes();
    }
    
    /**
     * Test index cost for specified date.
     */
    public void testIndexCostForDate() {
        final Date dateIndexing = new Date();
        this.classHandler.applyIndexesForDate(dateIndexing);
    }
    
}
