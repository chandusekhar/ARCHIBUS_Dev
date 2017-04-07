package com.archibus.service.cost;

import com.archibus.datasource.DataSourceTestBase;

public class TestIntegrationCostService extends DataSourceTestBase {
    CostService service;
    
    // public void testCalculateCashFlowProjectionsFromRecurringCosts() {
    // Date dateStart = new GregorianCalendar(2007, 0, 1).getTime();
    // Date dateEnd = new GregorianCalendar(2008, 11, 31).getTime();
    // String calculationPeriod = Period.MONTH;
    // String calculationType = CostProjection.CALCTYPE_NETINCOME;
    //
    // Map<String, String> config = new HashMap<String, String>();
    // config.put("vat", "total");
    // config.put("type", "user");
    // config.put("code", "GBP");
    // config.put("rateType", "Budget");
    // CurrencyVatRequestParameters currencyVatParameters =
    // new CurrencyVatRequestParameters(config);
    //
    // CostProjection projection =
    // this.getService().calculateCashFlowProjection("bl", dateStart, dateEnd,
    // calculationPeriod, calculationType, false, true, true, true, null, null, null,
    // currencyVatParameters);
    //
    // System.out.println(projection);
    //
    // List assetIds = projection.getAssetIds();
    // assertNotNull(assetIds);
    // assertTrue(assetIds.contains("HQ"));
    // assertFalse(assetIds.contains("JFK A"));
    //
    // List periods = projection.getPeriodsForAsset("HQ");
    // assertNotNull(periods);
    //
    // // call the service with both dates set to null - should not throw exceptions
    // {
    // this.service.calculateCashFlowProjection("bl", null, null, calculationPeriod,
    // calculationType, false, true, true, true, null, null, null, currencyVatParameters);
    // }
    // }
    //
    public void testCalculateChargebackCosts() {
        this.getService().calculateChargebackCosts(null, true, true);
    }
    
    /**
     * @return the service
     */
    public CostService getService() {
        return this.service;
    }
    
    /**
     * @param service the service to set
     */
    public void setService(final CostService service) {
        this.service = service;
    }
}
