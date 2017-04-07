package com.archibus.service.cost;

import java.util.*;

import com.archibus.datasource.DataSourceTestBase;

/**
 * Test class for cost service.
 * <p>
 * 
 * 
 * @author Ioan Draghici
 * @since 21.2
 * 
 */
public class CostServiceTest extends DataSourceTestBase {
    
    /**
     * Class handler.
     */
    private final CostService serviceHandler = new CostService();
    
    /**
     * Test method for convertCostForVATAndMC.
     * 
     */
    public void testConvertCostForVATAndMC() {
        final Date dateStart = new GregorianCalendar(2007, 0, 1).getTime();
        final Date dateEnd = new GregorianCalendar(2008, 11, 31).getTime();
        final Configuration configuration = new Configuration();
        configuration.setDefaultDateStart(dateStart);
        configuration.setDefaultDateEnd(dateEnd);
        this.serviceHandler.setConfiguration(configuration);
        
        final List<Integer> costIds = new ArrayList<Integer>();
        final List<String> costType = new ArrayList<String>();
        costIds.add(35);
        costType.add("cost_tran_recur");
        costIds.add(26);
        costType.add("cost_tran_recur");
        costIds.add(39);
        costType.add("cost_tran_recur");
        costIds.add(28);
        costType.add("cost_tran_sched");
        costIds.add(26);
        costType.add("cost_tran_sched");
        
        this.serviceHandler.convertCostForVATAndMC(costIds, costType);
        
    }
    
    /**
     * Test method for getVatPercentValue.
     * 
     */
    public void testGetVatPercentValue() {
        final String countryId = "BEL";
        final String costCategoryId = "BUILDING - LIFE SAFETY";
        final String leaseId = "001";
        
        final double vatPercent =
                this.serviceHandler.getVatPercentValue(costCategoryId, countryId, leaseId);
        assertEquals(21.00, vatPercent, 0.0);
        
    }
    
    @Override
    protected String[] getConfigLocations() {
        return new String[] { "context\\core\\core-infrastructure.xml", "appContext-test.xml",
                "conversionDataSource.xml" };
    }
}
