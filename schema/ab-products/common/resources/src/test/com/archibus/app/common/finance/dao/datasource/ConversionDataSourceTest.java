package com.archibus.app.common.finance.dao.datasource;

import java.util.*;

import com.archibus.app.common.finance.domain.Conversion;
import com.archibus.datasource.DataSourceTestBase;
import com.archibus.model.config.ExchangeRateType;

/**
 * 
 * Test class for ConversionDataSource class.
 * <p>
 * 
 * 
 * @author Ioan Draghici
 * @since 21.3
 * 
 */
public class ConversionDataSourceTest extends DataSourceTestBase {
    /**
     * Field.
     */
    private final String destinationCurrency = "EUR";
    
    /**
     * Field.
     */
    private final String exchangeRateType = ExchangeRateType.BUDGET.toString();
    
    /**
     * Field.
     */
    private final String sourceCurrency = "USD";
    
    /**
     * Field.
     */
    private final Date toDate = new Date();
    
    /**
     * Test method for <code>ConversionDataSource.getExchangeRates</code> method.
     * 
     */
    public void testGetExchangeRates() {
        final ConversionDataSource conversionDAO = new ConversionDataSource();
        
        final List<Conversion> exchangeRates =
                conversionDAO.getExchangeRates(this.destinationCurrency);
        
        assertTrue("getExchangeRates ", !exchangeRates.isEmpty());
    }
    
    /**
     * Test method for <code>ConversionDataSource.getExchangeRatesOfType</code> method.
     * 
     */
    public void testGetExchangeRatesOfType() {
        final ConversionDataSource conversionDAO = new ConversionDataSource();
        
        final List<Conversion> exchangeRates =
                conversionDAO.getExchangeRatesOfType(this.destinationCurrency,
                    this.exchangeRateType);
        assertTrue("getExchangeRatesOfType ", !exchangeRates.isEmpty());
    }
    
    /**
     * Test method for <code>ConversionDataSource.getExchangeRatesOfTypeForCurrency</code> method.
     * 
     */
    public void testGetExchangeRatesOfTypeForCurrency() {
        final ConversionDataSource conversionDAO = new ConversionDataSource();
        
        final List<Conversion> exchangeRates =
                conversionDAO.getExchangeRatesOfTypeForCurrency(this.destinationCurrency,
                    this.sourceCurrency, this.exchangeRateType);
        assertTrue("getExchangeRatesOfTypeForCurrency ", !exchangeRates.isEmpty());
    }
    
    /**
     * Test method for
     * <code>ConversionDataSource.getExchangeRatesOfTypeForCurrencyAndDateRange</code> method.
     * 
     */
    public void testGetExchangeRatesOfTypeForCurrencyAndDateRange() {
        final ConversionDataSource conversionDAO = new ConversionDataSource();
        
        final List<Conversion> exchangeRates =
                conversionDAO.getExchangeRatesOfTypeForCurrencyAndDateRange(
                    this.destinationCurrency, this.sourceCurrency, this.exchangeRateType, null,
                    this.toDate);
        
        assertTrue("getExchangeRatesOfTypeForCurrencyAndDateRange ", !exchangeRates.isEmpty());
        
    }
    
    @Override
    protected String[] getConfigLocations() {
        return new String[] { "context\\core\\core-infrastructure.xml", "appContext-test.xml",
                "conversionDataSource.xml" };
    }
}
