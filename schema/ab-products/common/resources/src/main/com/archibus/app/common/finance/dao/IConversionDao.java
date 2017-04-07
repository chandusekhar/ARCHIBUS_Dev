package com.archibus.app.common.finance.dao;

import java.util.*;

import com.archibus.core.dao.IDao;

/**
 * 
 * Provides common methods to load afm conversions that match specified criteria.
 * <p>
 * 
 * 
 * @author Ioan Draghici
 * @since 21.3
 * 
 * @param <Conversion> type of persistent object
 */
public interface IConversionDao<Conversion> extends IDao<Conversion> {
    /**
     * Returns all exchange rates to destination currency.
     * 
     * @param destinCurrency destination currency
     * @return List<Conversion> list with exchange rates
     */
    List<Conversion> getExchangeRates(final String destinCurrency);
    
    /**
     * Returns all exchange rates of specified type to destination currency.
     * 
     * @param destinCurrency destination currency
     * @param exchangeRateType exchange rate type
     * @return List<Conversion> list with exchange rate type.
     */
    List<Conversion> getExchangeRatesOfType(final String destinCurrency,
            final String exchangeRateType);
    
    /**
     * Returns all exchange rates of specified type from source currency to destination currency.
     * 
     * @param destinCurrency destination currency
     * @param sourceCurrency source currency
     * @param exchangeRateType exchange rate type
     * @return List<Conversion> list with exchange rate type.
     */
    List<Conversion> getExchangeRatesOfTypeForCurrency(final String destinCurrency,
            final String sourceCurrency, final String exchangeRateType);
    
    /**
     * Returns all exchange rates of specified type from source currency to destination currency for
     * specified date range.
     * 
     * @param destinCurrency destination currency
     * @param sourceCurrency source currency
     * @param exchangeRateType exchange rate type
     * @param fromDate time range start date
     * @param toDate time range end date
     * @return List<Conversion> list with exchange rate type.
     */
    List<Conversion> getExchangeRatesOfTypeForCurrencyAndDateRange(final String destinCurrency,
            final String sourceCurrency, final String exchangeRateType, final Date fromDate,
            final Date toDate);
}
