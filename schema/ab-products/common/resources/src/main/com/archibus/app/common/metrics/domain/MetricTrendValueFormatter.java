package com.archibus.app.common.metrics.domain;

import java.text.MessageFormat;
import java.util.Locale;

import com.archibus.model.config.*;
import com.archibus.utility.StringUtil;
import com.ibm.icu.text.NumberFormat;

/**
 * 
 * Provides methods to formats metric trend values using metric formatting properties.
 * <p>
 * 
 * @author Sergey Kuramshin
 * @since 21.2
 */
public class MetricTrendValueFormatter {
    
    /**
     * Conversion factor.
     */
    public static final int FACTOR_100 = 100;
    
    /**
     * Conversion factor.
     */
    private static final int FACTOR_1000 = 1000;
    
    /**
     * Conversion factor.
     */
    private static final int FACTOR_1000000 = 1000000;
    
    /**
     * Conversion factor.
     */
    private static final int FACTOR_1000000000 = 1000000000;
    
    /**
     * The numeric format to use.
     */
    private final MetricNumericFormat metricNumericFormat;
    
    /**
     * The decimals to use.
     */
    private final MetricDecimals metricDecimals;
    
    /**
     * The display format to use.
     */
    private final String metricDisplayFormat;
    
    /**
     * The display format to use when the base area units are metric.
     */
    private final String metricDisplayFormatMetric;
    
    /**
     * The locale to use when formatting numeric values.
     */
    private final Locale locale;
    
    /**
     * The units to use when formatting area values.
     */
    private final UnitsProperties areaUnits;
    
    /**
     * The base area units for the project.
     */
    private final UnitsProperties baseAreaUnits;
    
    /**
     * The currency to use when formatting cost values.
     */
    private final Currency currency;
    
    /**
     * The currency conversions to use when formatting cost values.
     */
    private final CurrencyConversions currencyConversions;
    
    /**
     * Constructor.
     * 
     * @param metric The metric with formatting properties.
     * @param locale The locale to use for formatting.
     * @param areaUnits The units to use when formatting area values.
     * @param baseAreaUnits The base area units.
     * @param currency The currency to use when formatting cost values.
     * @param currencyConversions The currency conversions to use when formatting cost values.
     */
    public MetricTrendValueFormatter(final Metric metric, final Locale locale,
            final UnitsProperties areaUnits, final UnitsProperties baseAreaUnits,
            final Currency currency, final CurrencyConversions currencyConversions) {
        this.metricNumericFormat = MetricNumericFormat.fromString(metric.getNumericFormat());
        this.metricDecimals = MetricDecimals.fromString(metric.getDecimals());
        this.metricDisplayFormat = metric.getDisplayFormat();
        this.metricDisplayFormatMetric = metric.getDisplayFormatMetric();
        this.locale = locale;
        this.areaUnits = areaUnits;
        this.baseAreaUnits = baseAreaUnits;
        this.currency = currency;
        this.currencyConversions = currencyConversions;
    }
    
    /**
     * Converts numeric value to a formatted string using specified numeric format and decimals.
     * 
     * @param value The value.
     * @return The formatted value.
     */
    public String formatMetricValue(final double value) {
        String result = "";
        
        if (this.metricNumericFormat == MetricNumericFormat.NUMBER) {
            result = formatDecimals(value);
            
        } else if (this.metricNumericFormat == MetricNumericFormat.PERCENTAGE) {
            final NumberFormat percentFormat = NumberFormat.getPercentInstance(this.locale);
            percentFormat.setMaximumFractionDigits(0);
            result = percentFormat.format(value);
            
        } else if (this.metricNumericFormat == MetricNumericFormat.BASE_UNIT_AREA) {
            double areaValue = value;
            if (!this.baseAreaUnits.getUnits().equals(this.areaUnits.getUnits())) {
                areaValue = value / this.areaUnits.getConversionFactor();
            }
            final String formattedAreaValue = formatDecimals(areaValue);
            final String areaTitle = this.areaUnits.getTitle();
            result = MessageFormat.format("{0} {1}", formattedAreaValue, areaTitle);
            
        } else if (this.metricNumericFormat == MetricNumericFormat.BUDGET_CURRENCY) {
            final double exchangeRate =
                    this.currencyConversions
                        .getExchangeRateFromBudgetToUser(ExchangeRateType.BUDGET);
            final double moneyValue = value / exchangeRate;
            final String formattedMoneyValue = formatDecimals(moneyValue);
            final String currencySymbol = this.currency.getSymbol();
            if (moneyValue >= 0) {
                result = MessageFormat.format("{0}{1}", currencySymbol, formattedMoneyValue);
            } else {
                result =
                        MessageFormat.format("-{0}{1}", currencySymbol,
                            formattedMoneyValue.substring(1));
            }
        }
        
        result = formatDisplay(result);
        
        return result;
    }
    
    /**
     * Converts numeric value to a formatted string using specified display format.
     * 
     * @param value The value.
     * @return The formatted value.
     */
    private String formatDisplay(final String value) {
        String formattedValue = value;
        
        String formatPattern = this.metricDisplayFormat;
        
        if (StringUtil.notNullOrEmpty(this.metricDisplayFormatMetric)
                && this.baseAreaUnits.getUnits() == Units.Metric) {
            formatPattern = this.metricDisplayFormatMetric;
        }
        
        if (StringUtil.notNullOrEmpty(formatPattern)) {
            formattedValue = MessageFormat.format(formatPattern, value);
        }
        
        return formattedValue;
    }
    
    /**
     * Converts numeric value to a formatted string using decimals.
     * 
     * @param value The value.
     * @return The formatted value.
     */
    public String formatDecimals(final double value) {
        String result = "";
        
        // The number of decimals.
        int decimals = 0;
        // The factor to divide the value by.
        int factor = 1;
        // The numeric symbol, e.g. K for thousands.
        String symbol = "";
        
        if (this.metricDecimals == MetricDecimals.ONE_PLACE) {
            decimals = 1;
            
        } else if (this.metricDecimals == MetricDecimals.TWO_PLACES) {
            decimals = 2;
            
        } else if (this.metricDecimals == MetricDecimals.HUNDREDS) {
            factor = FACTOR_100;
            symbol = "H";
            
        } else if (this.metricDecimals == MetricDecimals.THOUSANDS) {
            factor = FACTOR_1000;
            symbol = "K";
            
        } else if (this.metricDecimals == MetricDecimals.MILLIONS) {
            factor = FACTOR_1000000;
            symbol = "M";
            
        } else if (this.metricDecimals == MetricDecimals.BILLIONS) {
            factor = FACTOR_1000000000;
            symbol = "G";
        }
        
        final NumberFormat format = NumberFormat.getInstance(this.locale);
        format.setMaximumFractionDigits(decimals);
        format.setMinimumFractionDigits(decimals);
        result = format.format(value / factor) + symbol;
        
        return result;
    }
    
}
