package com.archibus.service.cost;

import com.archibus.datasource.DataSourceTestBase;
import com.archibus.model.config.ExchangeRateType;
import com.ibm.icu.util.Calendar;

/**
 * Test class for ExchangeRateUtilities.
 * <p>
 * 
 * 
 * @author Ioan Draghici
 * @since 21.3
 * 
 */

public class ExchangeRateUtilitiesTest extends DataSourceTestBase {
    
    /**
     * Load exchange rates of type to destination currency.
     * 
     */
    public void testLoadExchangeRates() {
        final String destinationCurrency = "EUR";
        final ExchangeRateUtil exchangeRateUtilities =
                new ExchangeRateUtil(true, destinationCurrency);
        exchangeRateUtilities.loadExchangeRates();
        assertTrue("Exchange rates loaded", !exchangeRateUtilities.isEmpty());
    }
    
    /**
     * Test method for getExchangeRateForCurrency.
     * 
     */
    public void testGetExchangeRateForCurrency() {
        final String destinationCurrency = "EUR";
        final String sourceCurrency = "GBP";
        
        final ExchangeRateUtil exchangeRateUtilities =
                new ExchangeRateUtil(true, destinationCurrency);
        exchangeRateUtilities.loadExchangeRatesFromCurrency(sourceCurrency);
        
        final double factor =
                exchangeRateUtilities.getExchangeRateForCurrency(sourceCurrency,
                    ExchangeRateType.BUDGET);
        
        assertEquals("1.18", String.valueOf(factor));
    }
    
    /**
     * Test method for getExchangeRateForCurrencyAndDate.
     * 
     */
    public void testGetExchangeRateForCurrencyAndDate() {
        final String destinationCurrency = "EUR";
        final String sourceCurrency = "GBP";
        final Calendar conversionDate = Calendar.getInstance();
        conversionDate.set(Integer.valueOf("2005"), Integer.valueOf("3"), Integer.valueOf("2"));
        
        final ExchangeRateUtil exchangeRateUtilities =
                new ExchangeRateUtil(true, destinationCurrency);
        exchangeRateUtilities.loadExchangeRatesFromCurrency(sourceCurrency);
        
        final double factor =
                exchangeRateUtilities.getExchangeRateForCurrencyAndDate(sourceCurrency,
                    ExchangeRateType.BUDGET, conversionDate.getTime());
        
        assertEquals("1.41", String.valueOf(factor));
    }
    
    @Override
    protected String[] getConfigLocations() {
        return new String[] { "context\\core\\core-infrastructure.xml", "appContext-test.xml",
                "conversionDataSource.xml" };
    }
}
