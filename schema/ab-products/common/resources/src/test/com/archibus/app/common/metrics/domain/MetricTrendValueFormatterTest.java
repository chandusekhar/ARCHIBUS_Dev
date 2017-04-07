package com.archibus.app.common.metrics.domain;

import java.util.*;

import com.archibus.datasource.DataSourceTestBase;
import com.archibus.model.config.*;
import com.archibus.model.config.Currency;

/**
 * Test for MetricTrendValueFormatter.
 * 
 * @author Sergey Kuramshin
 * @since 21.2
 */
public class MetricTrendValueFormatterTest extends DataSourceTestBase {
    
    /**
     * Test for formatMetricValue();
     */
    public void testFormatMetricValue() {
        MetricTrendValueFormatter formatter = createFormatter("N", "0", "{0} years");
        assertEquals("100 years", formatter.formatMetricValue(100));
        assertEquals("100 years", formatter.formatMetricValue(100.5));
        
        formatter = createFormatter("P", "0", "{0}");
        assertEquals("0%", formatter.formatMetricValue(0));
        assertEquals("50%", formatter.formatMetricValue(0.5));
        assertEquals("100%", formatter.formatMetricValue(1));
        
        formatter = createFormatter("A", "2", "{0}");
        assertEquals("9.29 m�", formatter.formatMetricValue(100));
        
        formatter = createFormatter("A", "H", "{0}");
        assertEquals("9H m�", formatter.formatMetricValue(10000));
        
        formatter = createFormatter("A", "K", "{0}");
        assertEquals("9K m�", formatter.formatMetricValue(100000));
        
        formatter = createFormatter("A", "M", "{0}");
        assertEquals("9M m�", formatter.formatMetricValue(100000000));
        
        formatter = createFormatter("B", "1", "{0}");
        assertEquals("EUR100.0", formatter.formatMetricValue(100));
    }
    
    /**
     * Test for formatDecimals().
     */
    public void testFormatDecimals() {
        MetricTrendValueFormatter formatter = createFormatter("2");
        assertEquals("100.00", formatter.formatDecimals(100));
        assertEquals("100.12", formatter.formatDecimals(100.12345));
        
        formatter = createFormatter("1");
        assertEquals("100.0", formatter.formatDecimals(100));
        assertEquals("100.1", formatter.formatDecimals(100.12345));
        
        formatter = createFormatter("0");
        assertEquals("100", formatter.formatDecimals(100));
        assertEquals("100", formatter.formatDecimals(100.12345));
        
        formatter = createFormatter("H");
        assertEquals("1H", formatter.formatDecimals(100));
        assertEquals("1H", formatter.formatDecimals(100.12345));
        
        formatter = createFormatter("K");
        assertEquals("1K", formatter.formatDecimals(1000));
        assertEquals("1K", formatter.formatDecimals(1000.12345));
        
        formatter = createFormatter("M");
        assertEquals("1M", formatter.formatDecimals(1000000));
        assertEquals("1M", formatter.formatDecimals(1000000.12345));
        
        formatter = createFormatter("B");
        assertEquals("1B", formatter.formatDecimals(1000000000));
        assertEquals("1B", formatter.formatDecimals(1000000000.12345));
    }
    
    /**
     * Helper method.
     * 
     * @param decimals The decimals.
     * @return The formatter.
     */
    private MetricTrendValueFormatter createFormatter(final String decimals) {
        final Metric metric = new Metric();
        metric.setNumericFormat("N");
        metric.setDecimals(decimals);
        
        return createFormatter(metric);
    }
    
    /**
     * Helper method.
     * 
     * @param numericFormat The numeric format.
     * @param decimals The decimals.
     * @param displayFormat The display format.
     * @return The formatter.
     */
    private MetricTrendValueFormatter createFormatter(final String numericFormat,
            final String decimals, final String displayFormat) {
        final Metric metric = new Metric();
        metric.setNumericFormat(numericFormat);
        metric.setDecimals(decimals);
        metric.setDisplayFormat(displayFormat);
        
        return createFormatter(metric);
    }
    
    /**
     * Helper method.
     * 
     * @param metric The metric.
     * @return The formatter.
     */
    private MetricTrendValueFormatter createFormatter(final Metric metric) {
        final UnitsProperties areaUnits = new UnitsProperties(Units.Metric, Measure.AREA);
        final UnitsProperties baseAreaUnits = new UnitsProperties(Units.Imperial, Measure.AREA);
        final Currency userCurrency = new Currency("EUR");
        final Currency budgetCurrency = new Currency("USD");
        final CurrencyConversions currencyConversions = new CurrencyConversions();
        currencyConversions.setBudgetCurrency(budgetCurrency);
        final List<CurrencyConversion> currencyConversionsList =
                new ArrayList<CurrencyConversion>();
        currencyConversionsList.add(new CurrencyConversion(budgetCurrency, userCurrency, 1.5,
            new Date(), ExchangeRateType.BUDGET));
        currencyConversions.setConversions(currencyConversionsList);
        final MetricTrendValueFormatter formatter =
                new MetricTrendValueFormatter(metric, Locale.getDefault(), areaUnits,
                    baseAreaUnits, userCurrency, currencyConversions);
        return formatter;
    }
    
    @Override
    protected String[] getConfigLocations() {
        return new String[] { "context\\core\\core-infrastructure.xml", "appContext-test.xml",
                "metricDataSource.xml" };
    }
}
