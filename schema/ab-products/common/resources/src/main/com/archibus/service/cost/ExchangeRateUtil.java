package com.archibus.service.cost;

import java.math.BigDecimal;
import java.util.*;

import com.archibus.app.common.finance.dao.datasource.ConversionDataSource;
import com.archibus.app.common.finance.domain.Conversion;
import com.archibus.context.ContextStore;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.model.config.ExchangeRateType;
import com.archibus.utility.StringUtil;

/**
 * 
 * Exchange rates utility class.
 * 
 * @author Ioan Draghici
 * @since 21.3
 * 
 */
public class ExchangeRateUtil {
    
    /**
     * Error message.
     */
    // @translatable
    private static final String MESSAGE_EXCHANGE_RATE_NOT_DEFINED =
            "Exchange rate of type %s, from [%s] to [%s] is not defined (%s). Default value of 1 was used in calculation.";
    
    /**
     * Destination currency code.
     */
    private final String destinationCurrency;
    
    /**
     * Exchange rate type.
     */
    private ExchangeRateType exchangeRateType;
    
    /**
     * Exchange rate date.
     */
    private Date exchangeRateDate;
    
    /**
     * If MC and VAT is enabled.
     */
    private final boolean isMcAndVatEnabled;
    
    /**
     * Map with exchange rates.
     * <p>
     * Source currency is key in outer Map.
     * <p>
     * Exchange rate type is key in inner Map.
     * <p>
     * Conversion date is key in SortedMap.
     * 
     */
    private Map<String, Map<String, SortedMap<Date, Double>>> exchangeRates;
    
    /**
     * Object with missing exchange rates (outer key - exchange rate type, middle key - source
     * currency, inner key - destination currency ).
     */
    private final Map<String, Map<String, Map<String, List<Date>>>> missingExchangeRates;
    
    /**
     * Constructor specifying destination currency.
     * 
     * @param isMcEnabled if MC and VAt is enabled
     * @param destinCurrency destination currency
     */
    public ExchangeRateUtil(final boolean isMcEnabled, final String destinCurrency) {
        this.isMcAndVatEnabled = isMcEnabled;
        this.destinationCurrency = destinCurrency;
        this.missingExchangeRates = new HashMap<String, Map<String, Map<String, List<Date>>>>();
    }
    
    /**
     * Constructor specifying destination currency and exchange rate type.
     * 
     * @param isMcEnabled if MC and VAt is enabled
     * @param destinCurrency destination currency
     * @param exchangeRateType exchange rate type
     */
    public ExchangeRateUtil(final boolean isMcEnabled, final String destinCurrency,
            final ExchangeRateType exchangeRateType) {
        this.isMcAndVatEnabled = isMcEnabled;
        this.destinationCurrency = destinCurrency;
        this.exchangeRateType = exchangeRateType;
        this.missingExchangeRates = new HashMap<String, Map<String, Map<String, List<Date>>>>();
    }
    
    /**
     * Load exchange rates to destination currency.
     * 
     */
    public void loadExchangeRates() {
        loadExchangeRatesFromCurrency(null);
    }
    
    /**
     * Load exchange rates from source currency to destination currency.
     * 
     * @param sourceCurrency source currency.
     */
    public void loadExchangeRatesFromCurrency(final String sourceCurrency) {
        if (this.isMcAndVatEnabled) {
            this.exchangeRates = new HashMap<String, Map<String, SortedMap<Date, Double>>>();
            final List<Conversion> exchRates =
                    getExchangeRates(this.destinationCurrency, sourceCurrency,
                        this.exchangeRateType, new Date());
            
            final Iterator<Conversion> itExchRates = exchRates.iterator();
            while (itExchRates.hasNext()) {
                addExchangeRateToMap(itExchRates.next());
            }
        }
    }
    
    /**
     * Return last exchange rate of specified type for source currency.
     * 
     * @param sourceCurrency source currency
     * @param exchRateType exchange rate type
     * @return double
     */
    public double getExchangeRateForCurrency(final String sourceCurrency,
            final ExchangeRateType exchRateType) {
        double result = BigDecimal.ONE.doubleValue();
        if (this.isMcAndVatEnabled && !sourceCurrency.equals(this.destinationCurrency)) {
            if (this.exchangeRates.containsKey(sourceCurrency)
                    && this.exchangeRates.get(sourceCurrency).containsKey(exchRateType.toString())) {
                final Date conversionDate =
                        this.exchangeRates.get(sourceCurrency).get(exchRateType.toString())
                            .lastKey();
                result =
                        this.exchangeRates.get(sourceCurrency).get(exchRateType.toString())
                            .get(conversionDate);
            } else {
                addMissingRate(exchRateType.toString(), sourceCurrency, this.destinationCurrency,
                    resetTime(new Date()));
            }
        }
        return result;
    }
    
    /**
     * Return exchange rate of specified type for source currency and conversion date.
     * 
     * @param sourceCurrency source currency
     * @param exchRateType exchange rate type
     * @param conversionDate conversion date
     * @return double
     */
    public double getExchangeRateForCurrencyAndDate(final String sourceCurrency,
            final ExchangeRateType exchRateType, final Date conversionDate) {
        double result = BigDecimal.ONE.doubleValue();
        if (this.isMcAndVatEnabled) {
            if (this.exchangeRates.containsKey(sourceCurrency)
                    && this.exchangeRates.get(sourceCurrency).containsKey(exchRateType.toString())
                    && !this.exchangeRates.get(sourceCurrency).get(exchRateType.toString())
                        .headMap(conversionDate).isEmpty()) {
                final SortedMap<Date, Double> rates =
                        this.exchangeRates.get(sourceCurrency).get(exchRateType.toString())
                            .headMap(conversionDate);
                this.exchangeRateDate = rates.lastKey();
                result = rates.get(rates.lastKey());
            } else {
                addMissingRate(exchRateType.toString(), sourceCurrency, this.destinationCurrency,
                    resetTime(conversionDate));
            }
        }
        return result;
    }
    
    /**
     * Getter for the exchangeRateDate property.
     * 
     * @see exchangeRateDate
     * @return the exchangeRateDate property.
     */
    public Date getExchangeRateDate() {
        return this.exchangeRateDate;
    }
    
    /**
     * True if exchange rate map is empty.
     * 
     * @return boolean
     */
    public boolean isEmpty() {
        return this.exchangeRates.isEmpty();
    }
    
    /**
     * Return list with missing exchange rates messages.
     * 
     * @return List<String>
     */
    public List<String> getMissingExchangeRates() {
        final List<String> messages = new ArrayList<String>();
        final Iterator<String> itExchangeRateType = this.missingExchangeRates.keySet().iterator();
        if (itExchangeRateType.hasNext()) {
            final String exchRateType = itExchangeRateType.next();
            getMissingExchangeRatesForExchRateType(messages, exchRateType);
        }
        
        return messages;
    }
    
    /**
     * Get missing exchange rates localized messaged for exchange rate type.
     * 
     * @param messages list with messages
     * @param exchRateType exchange rate type
     */
    private void getMissingExchangeRatesForExchRateType(final List<String> messages,
            final String exchRateType) {
        final Iterator<String> itSrcCurrency =
                this.missingExchangeRates.get(exchRateType).keySet().iterator();
        if (itSrcCurrency.hasNext()) {
            final String srcCurrency = itSrcCurrency.next();
            final Iterator<String> itDestCurrency =
                    this.missingExchangeRates.get(exchRateType).get(srcCurrency).keySet()
                        .iterator();
            if (itDestCurrency.hasNext()) {
                final String destCurrency = itDestCurrency.next();
                final List<Date> destDates =
                        this.missingExchangeRates.get(exchRateType).get(srcCurrency)
                            .get(destCurrency);
                String message = getLocalizedMessage(MESSAGE_EXCHANGE_RATE_NOT_DEFINED);
                message =
                        String.format(message, exchRateType, srcCurrency, destCurrency,
                            formatDates(destDates));
                messages.add(message);
            }
        }
    }
    
    /**
     * Add current exchange rate to map object.
     * 
     * @param conversion exchange rate object
     */
    private void addExchangeRateToMap(final Conversion conversion) {
        final String sourceCurrency = conversion.getSourceUnits();
        final Date conversionDate = conversion.getDateConversion();
        final Double exchangeRate = conversion.getFactor();
        final String exchRateType = conversion.getExchangeRateType();
        // if is new source currency
        final boolean isNewSrc = !this.exchangeRates.containsKey(sourceCurrency);
        if (isNewSrc) {
            final Map<String, SortedMap<Date, Double>> map =
                    new HashMap<String, SortedMap<Date, Double>>();
            this.exchangeRates.put(sourceCurrency, map);
        }
        
        // if is new exchange rate type
        final boolean isNewType = !this.exchangeRates.get(sourceCurrency).containsKey(exchRateType);
        if (isNewType) {
            final SortedMap<Date, Double> sortedMap = new TreeMap<Date, Double>();
            this.exchangeRates.get(sourceCurrency).put(exchRateType, sortedMap);
        }
        
        this.exchangeRates.get(sourceCurrency).get(exchRateType).put(conversionDate, exchangeRate);
    }
    
    /**
     * Read exchange rates from database.
     * 
     * @param destinCurrency destination currency
     * @param sourceCurrency source currency
     * @param exchRateType exchange rate type
     * @param toDate until date
     * @return List<Conversion>
     */
    private List<Conversion> getExchangeRates(final String destinCurrency,
            final String sourceCurrency, final ExchangeRateType exchRateType, final Date toDate) {
        final ConversionDataSource conversionDataSource = new ConversionDataSource();
        String type = null;
        if (StringUtil.notNullOrEmpty(exchRateType)) {
            type = exchRateType.toString();
        }
        return conversionDataSource.getExchangeRatesOfTypeForCurrencyAndDateRange(destinCurrency,
            sourceCurrency, type, null, toDate);
    }
    
    /**
     * Returns localized string.
     * 
     * @param message message name
     * @return string
     */
    private String getLocalizedMessage(final String message) {
        return EventHandlerBase.localizeString(ContextStore.get().getEventHandlerContext(),
            message, "ExchangeRateUtilities");
    }
    
    /**
     * Add missing exchange rate.
     * 
     * @param exchRateType exchange rate type
     * @param srcCurrency source currency
     * @param destCurrency destination currency
     * @param date date
     */
    private void addMissingRate(final String exchRateType, final String srcCurrency,
            final String destCurrency, final Date date) {
        Map<String, Map<String, List<Date>>> srcMap =
                new HashMap<String, Map<String, List<Date>>>();
        if (this.missingExchangeRates.containsKey(exchRateType)) {
            srcMap = this.missingExchangeRates.get(exchRateType);
        }
        Map<String, List<Date>> destMap = new HashMap<String, List<Date>>();
        if (srcMap.containsKey(srcCurrency)) {
            destMap = srcMap.get(srcCurrency);
        }
        List<Date> destDates = new ArrayList<Date>();
        if (destMap.containsKey(destCurrency)) {
            destDates = destMap.get(destCurrency);
        }
        
        if (!destDates.contains(date)) {
            destDates.add(date);
        }
        
        destMap.put(destCurrency, destDates);
        srcMap.put(srcCurrency, destMap);
        this.missingExchangeRates.put(exchRateType, srcMap);
        
    }
    
    /**
     * Format date list as text.
     * 
     * @param dates date list
     * @return String
     */
    private String formatDates(final List<Date> dates) {
        String result = "";
        if (!dates.isEmpty()) {
            for (final Date date : dates) {
                result += (result.length() > 0 ? Constants.COMMA : "") + dateToString(date);
            }
        }
        return result;
    }
    
    /**
     * Convert date to string.
     * 
     * @param date date value
     * @return String
     */
    private String dateToString(final Date date) {
        final Calendar cal = Calendar.getInstance();
        cal.setTime(date);
        return String.format(" %s-%s-%s", cal.get(Calendar.YEAR), cal.get(Calendar.MONTH) + 1,
            cal.get(Calendar.DAY_OF_MONTH));
    }
    
    /**
     * Reset time part of date.
     * 
     * @param date date
     * @return date
     */
    private Date resetTime(final Date date) {
        final Calendar cal = Calendar.getInstance();
        cal.setTime(date);
        cal.set(Calendar.HOUR, 0);
        cal.set(Calendar.MINUTE, 0);
        cal.set(Calendar.SECOND, 0);
        cal.set(Calendar.MILLISECOND, 0);
        return cal.getTime();
    }
}
