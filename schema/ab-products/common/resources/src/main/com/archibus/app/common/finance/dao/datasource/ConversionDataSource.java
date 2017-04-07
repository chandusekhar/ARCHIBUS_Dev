package com.archibus.app.common.finance.dao.datasource;

import java.util.*;

import com.archibus.app.common.finance.dao.IConversionDao;
import com.archibus.app.common.finance.domain.Conversion;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.*;
import com.archibus.datasource.restriction.Restrictions.Restriction;
import com.archibus.datasource.restriction.Restrictions.Restriction.Clause;
import com.archibus.utility.StringUtil;

/**
 * 
 * Data Source for Conversion (<code>afm_conversions</code> table).
 * <p>
 * 
 * 
 * @author Ioan Draghici
 * @since 21.3
 * 
 */
public class ConversionDataSource extends ObjectDataSourceImpl<Conversion> implements
        IConversionDao<Conversion> {
    
    /**
     * Field names to property names mapping. All fields will be added to the DataSource.
     * <p>
     * Fields common for all Cost DataSources are specified here.
     */
    private static final String[][] FIELDS_TO_PROPERTIES = { { "source_units", "sourceUnits" },
            { "destin_units", "destinUnits" }, { "is_currency", "isCurrency" },
            { "exchange_rate_type", "exchangeRateType" }, { "date_conversion", "dateConversion" },
            { Constants.FACTOR, Constants.FACTOR } };
    
    /**
     * Constructs ConversionsDataSource, mapped to <code>afm_conversions</code> database table,
     * using <code>conversions</code> bean.
     * 
     */
    public ConversionDataSource() {
        super("afmConversions", "afm_conversions");
    }
    
    /**
     * {@inheritDoc}
     */
    public List<Conversion> getExchangeRates(final String destinCurrency) {
        return getExchangeRatesOfTypeForCurrency(destinCurrency, null, null);
    }
    
    /**
     * {@inheritDoc}
     */
    public List<Conversion> getExchangeRatesOfType(final String destinCurrency,
            final String exchangeRateType) {
        return getExchangeRatesOfTypeForCurrency(destinCurrency, null, exchangeRateType);
    }
    
    /**
     * {@inheritDoc}
     */
    public List<Conversion> getExchangeRatesOfTypeForCurrency(final String destinCurrency,
            final String sourceCurrency, final String exchangeRateType) {
        return getExchangeRatesOfTypeForCurrencyAndDateRange(destinCurrency, sourceCurrency,
            exchangeRateType, null, null);
    }
    
    /**
     * {@inheritDoc}
     */
    public List<Conversion> getExchangeRatesOfTypeForCurrencyAndDateRange(
            final String destinCurrency, final String sourceCurrency,
            final String exchangeRateType, final Date fromDate, final Date toDate) {
        final DataSource dataSource = this.createCopy();
        final Restriction restriction =
                getRestriction(destinCurrency, sourceCurrency, Constants.YES, exchangeRateType,
                    fromDate, toDate);
        dataSource.addRestriction(restriction);
        final List<DataRecord> records = dataSource.getRecords();
        
        return new DataSourceObjectConverter<Conversion>().convertRecordsToObjects(records,
            this.beanName, this.fieldToPropertyMapping, null);
    }
    
    @Override
    protected String[][] getFieldsToProperties() {
        return FIELDS_TO_PROPERTIES.clone();
    }
    
    /**
     * Returns restriction object for specified criteria's. All clauses are added with AND between.
     * 
     * @param destinUnit destination unit
     * @param sourceUnit source unit
     * @param isCurrency if is currency
     * @param exchangeRateType exchange rate type
     * @param fromDate from date start date for date conversion date
     * @param toDate to date end date for conversion date
     * @return restriction object
     */
    private Restriction getRestriction(final String destinUnit, final String sourceUnit,
            final String isCurrency, final String exchangeRateType, final Date fromDate,
            final Date toDate) {
        final List<Clause> clauses = new ArrayList<Restrictions.Restriction.Clause>();
        
        if (StringUtil.notNullOrEmpty(destinUnit)) {
            clauses.add(Restrictions.eq(Constants.AFM_CONVERSIONS, Constants.DESTIN_UNITS,
                destinUnit));
        }
        
        if (StringUtil.notNullOrEmpty(sourceUnit)) {
            clauses.add(Restrictions.eq(Constants.AFM_CONVERSIONS, Constants.SOURCE_UNITS,
                sourceUnit));
        }
        
        if (StringUtil.notNullOrEmpty(isCurrency)) {
            clauses.add(Restrictions.eq(Constants.AFM_CONVERSIONS, Constants.IS_CURRENCY,
                isCurrency));
        }
        
        if (StringUtil.notNullOrEmpty(exchangeRateType)) {
            clauses.add(Restrictions.eq(Constants.AFM_CONVERSIONS, Constants.EXCHANGE_RATE_TYPE,
                exchangeRateType));
        }
        
        if (StringUtil.notNullOrEmpty(fromDate)) {
            clauses.add(Restrictions.gte(Constants.AFM_CONVERSIONS, Constants.DATE_CONVERSION,
                fromDate));
        }
        
        if (StringUtil.notNullOrEmpty(toDate)) {
            clauses.add(Restrictions.lte(Constants.AFM_CONVERSIONS, Constants.DATE_CONVERSION,
                toDate));
        }
        
        return new Restriction(Restrictions.REL_OP_AND, clauses);
    }
}
