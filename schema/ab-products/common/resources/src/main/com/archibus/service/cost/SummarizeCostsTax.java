package com.archibus.service.cost;

import java.util.*;

import com.archibus.app.common.finance.dao.datasource.*;
import com.archibus.app.common.finance.domain.*;
import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.model.config.ExchangeRateType;
import com.archibus.service.Period;
import com.archibus.service.cost.SummarizeCosts.CostField;
import com.archibus.service.cost.SummarizeCosts.SummaryType;
import com.archibus.service.cost.VatUtil.VatCost;

/**
 * Summarize property and parcels taxes.
 * <p>
 *
 *
 * @author Ioan Draghici
 * @since 22.1
 *
 */
public final class SummarizeCostsTax {

    /**
     * Hide default constructor for this utility class - should never be instantiated.
     */
    private SummarizeCostsTax() {
    }

    /**
     * Summarize actual or scheduled cost.
     *
     * @param costField cost field
     * @param costTable cost table
     * @param type report type
     * @param assetTable asset table
     * @param assetKey asset primary key
     * @param assetIds list with asset is's
     * @param parameters request parameters
     */
    public static void summarizeCosts(final CostField costField, final String costTable,
            final SummaryType type, final String assetTable, final String assetKey,
            final List<String> assetIds, final RequestParameters parameters) {
        
        for (final String assetId : assetIds) {
            summarizeCostsForAsset(costField, costTable, type, assetTable, assetKey, assetId,
                parameters);
        }
    }
    
    /**
     * Summarize actual or scheduled cost for specified asset.
     *
     * @param costField cost field
     * @param costTable cost table
     * @param type report type
     * @param assetTable asset table
     * @param assetKey asset primary key
     * @param assetId property code
     * @param parameters request parameters
     */
    private static void summarizeCostsForAsset(final CostField costField, final String costTable,
            final SummaryType type, final String assetTable, final String assetKey,
            final String assetId, final RequestParameters parameters) {
        
        final List<String> parcelIds = getParcelsForProperty(assetId);
        final Map<String, Double> results = new HashMap<String, Double>();
        results.put(Constants.TRUE_ASSESSED_VALUE, Double.valueOf(0.0));
        results.put(Constants.ASSESSED_VALUE, Double.valueOf(0.0));
        results.put(Constants.YEARLY_TAX_RATE, Double.valueOf(0.0));

        for (final String parcelId : parcelIds) {
            final List<Cost> costs =
                    getCostsForPropertyAndParcel(assetId, parcelId, costTable,
                        costField.getCostTypeRestriction(), parameters);
            calculateTaxCosts(costs, results);
        }
        
        if (!parcelIds.isEmpty()) {
            // update into database
            updateCostField(costField, type, assetTable, assetKey, assetId, results);
        }
    }

    /**
     * Returns list of parcel id's for specified property.
     *
     * @param propertyId property code
     * @return List<String>
     */
    private static List<String> getParcelsForProperty(final String propertyId) {

        final DataSource parcelDs =
                DataSourceFactory.createDataSourceForFields(DbConstants.PARCEL_TABLE, new String[] {
                        DbConstants.PR_ID, DbConstants.PARCEL_ID });
        parcelDs.setMaxRecords(0);
        parcelDs.setApplyVpaRestrictions(false);
        parcelDs.addRestriction(Restrictions.eq(DbConstants.PARCEL_TABLE, DbConstants.PR_ID,
            propertyId));
        final List<DataRecord> records = parcelDs.getRecords();
        final List<String> result = new ArrayList<String>();
        for (final DataRecord record : records) {
            result.add(record.getString(DbConstants.getFieldFullName(DbConstants.PARCEL_TABLE,
                DbConstants.PARCEL_ID)));
        }
        return result;
    }

    /**
     * Get costs for property and parcel.
     *
     * @param propertyId property code
     * @param parcelId parcel code
     * @param costTable cost table
     * @param taxType tax type
     * @param parameters request parameters
     * @return List<Cost>
     */
    private static List<Cost> getCostsForPropertyAndParcel(final String propertyId,
            final String parcelId, final String costTable, final String taxType,
            final RequestParameters parameters) {
        final String sqlStatement =
                costTable + ".pr_id = " + SqlUtils.formatValueForSql(propertyId) + "  AND "
                        + costTable + ".parcel_id = " + SqlUtils.formatValueForSql(parcelId)
                        + "  AND  " + costTable + "." + taxType;
        final Date dateStart = parameters.getDateStart();
        final Date dateEnd = parameters.getDateEnd();
        // KB3049883 - use the Date Due to identify the scheduled costs and actual costs for the
        // selected timeframe.
        final String dateField = costTable + ".date_due";
        final String dateRestriction =
                dateField + " >= " + SqlUtils.formatValueForSql(dateStart) + " AND  " + dateField
                + " <= " + SqlUtils.formatValueForSql(dateEnd);
        
        final String sqlRestriction = sqlStatement + " AND " + dateRestriction;

        final List<Cost> result = new ArrayList<Cost>();
        if (DbConstants.COST_TRAN_TABLE.equals(costTable)) {
            final ActualCostDataSource actualDataSource = new ActualCostDataSource();
            final List<ActualCost> actualCosts =
                    actualDataSource.findByRestriction(Restrictions.sql(sqlRestriction));
            for (final ActualCost actualCost : actualCosts) {
                result.add(actualCost);
            }
        } else if (DbConstants.COST_TRAN_SCHED_TABLE.equals(costTable)) {
            final ScheduledCostDataSource schedDataSource = new ScheduledCostDataSource();
            final List<ScheduledCost> schedCosts =
                    schedDataSource.findByRestriction(Restrictions.sql(sqlRestriction));
            for (final ScheduledCost schedCost : schedCosts) {
                result.add(schedCost);
            }
        } else if (DbConstants.COST_TRAN_RECUR_TABLE.equals(costTable)) {
            // Load budget exchange rates
            final String budgetCurrency =
                    ContextStore.get().getProject().getBudgetCurrency().getCode();
            final ExchangeRateUtil budgetExchangeRates =
                    new ExchangeRateUtil(parameters.isMcAndVatEnabled(), budgetCurrency,
                        ExchangeRateType.BUDGET);
            budgetExchangeRates.loadExchangeRates();
            
            getBudgetRequestParameters(parameters);
            
            loadExchangeRates(parameters.isMcAndVatEnabled(), budgetCurrency,
                parameters.getExchangeRateType());
            
            final RecurringCostDataSource recurDataSource = new RecurringCostDataSource();
            // recurring cost don't have date_paid field
            final List<RecurringCost> recurCosts =
                    recurDataSource.findByRestriction(Restrictions.sql(sqlStatement));
            
            for (final RecurringCost recurCost : recurCosts) {
                final List<ScheduledCost> projection =
                        createCostProjection(recurCost, parameters, parameters.isMcAndVatEnabled(),
                            budgetExchangeRates, false);
                for (final ScheduledCost schedCost : projection) {
                    result.add(schedCost);
                }
            }
        }
        return result;
    }

    /**
     * Calculate tax costs.
     *
     * @param costs list of costs
     * @param results map with calculated values
     */
    private static void calculateTaxCosts(final List<Cost> costs, final Map<String, Double> results) {
        Double trueAssessedValue = results.get(Constants.TRUE_ASSESSED_VALUE);
        Double yearlyTaxRate = results.get(Constants.YEARLY_TAX_RATE);
        Double assessedValue = results.get(Constants.ASSESSED_VALUE);
        for (final Cost cost : costs) {
            trueAssessedValue = trueAssessedValue + cost.getTaxValueAssessed() / cost.getTaxClr();
            yearlyTaxRate =
                    yearlyTaxRate + (cost.getTaxPeriodInMonths() / Constants.MONTH_NO)
                            * cost.getAmountExpense();
            assessedValue = assessedValue + cost.getTaxValueAssessed();
        }
        results.put(Constants.TRUE_ASSESSED_VALUE, trueAssessedValue);
        results.put(Constants.YEARLY_TAX_RATE, yearlyTaxRate);
        results.put(Constants.ASSESSED_VALUE, assessedValue);
    }
    
    /**
     * Update cost field into database.
     *
     * @param costField cost field
     * @param type summary type
     * @param assetTable asset table
     * @param assetKey asset key
     * @param assetId asset id
     * @param results calculated values
     */
    private static void updateCostField(final CostField costField, final SummaryType type,
            final String assetTable, final String assetKey, final String assetId,
            final Map<String, Double> results) {
        Double fieldValue = 0.0;
        if (DbConstants.TAX_RATE_PROP.equals(costField.getFieldId())
                || DbConstants.TAX_RATE_SCHOOL.equals(costField.getFieldId())) {
            final Double trueValueAssessed = results.get(Constants.TRUE_ASSESSED_VALUE);
            final Double yearlyTaxRate = results.get(Constants.YEARLY_TAX_RATE);
            if (trueValueAssessed.doubleValue() != 0) {
                fieldValue = yearlyTaxRate / trueValueAssessed;
            }
        } else if (DbConstants.VALUE_ASSESSED_PROP_TAX.equals(costField.getFieldId())
                || DbConstants.VALUE_ASSESSED_SCHOOL_TAX.equals(costField.getFieldId())) {
            fieldValue = results.get(Constants.ASSESSED_VALUE);
        }
        // update buffer table
        
        // update asset table
        final String sqlStatement =
                "UPDATE " + assetTable + " SET " + costField.getFieldId() + " =  "
                        + SqlUtils.formatValueForSql(fieldValue) + " WHERE " + assetKey + " = "
                        + SqlUtils.formatValueForSql(assetId);
        SqlUtils.executeUpdate(assetTable, sqlStatement);
    }

    /**
     * Create cost projection for given recurring cost.
     *
     * @param recurringCost recurring cost
     * @param parameters request parameters
     * @param isMcAndVatEnabled if MC & VAT is enabled
     * @param exchangeRates exchange rates
     * @param onEntireDuration boolean if cost are summarized for entire cost duration
     * @return List<ScheduledCost>
     */
    private static List<ScheduledCost> createCostProjection(final RecurringCost recurringCost,
            final RequestParameters parameters, final boolean isMcAndVatEnabled,
            final ExchangeRateUtil exchangeRates, final boolean onEntireDuration) {
        final List<ScheduledCost> projection = new ArrayList<ScheduledCost>();
        Date dateTo = parameters.getDateEnd();
        if (recurringCost.getDateEnd() != null
                && (recurringCost.getDateEnd().before(dateTo) || onEntireDuration)) {
            dateTo = recurringCost.getDateEnd();
        }
        Date dateFrom = parameters.getDateStart();
        final Date changeOverDate = recurringCost.getChangeOverDate();
        if (dateFrom.before(changeOverDate) || onEntireDuration) {
            dateFrom = changeOverDate;
        }
        
        final Period recurringPeriod = recurringCost.getRecurringPeriod();
        recurringPeriod.setNoOfIntervals(0);
        recurringPeriod.iterate(dateFrom, dateTo, new Period.Callback() {
            @Override
            public boolean call(final Date dateNext) {
                if (!recurringCost.isOutOfSeason(dateNext)) {
                    final ScheduledCost scheduledCost =
                            ScheduledCost.createFromRecurringCost(recurringCost);
                    scheduledCost.setDateDue(dateNext);
                    scheduledCost.calculateIncomeAndExpense(recurringCost, isMcAndVatEnabled,
                        exchangeRates, false);
                    projection.add(scheduledCost);
                }
                return true;
            }
        });
        return projection;
    }
    
    /**
     * Load exchange rates if MC is enabled.
     *
     * @param isMcEnabled boolean
     * @param destinCurrency destination currency
     * @param exchangeRateType exchange rate type
     * @return ExchangeRateUtil object
     */
    private static ExchangeRateUtil loadExchangeRates(final boolean isMcEnabled,
            final String destinCurrency, final String exchangeRateType) {
        final ExchangeRateType exchRateType =
                isMcEnabled ? ExchangeRateType.fromString(exchangeRateType)
                        : ExchangeRateType.BUDGET;
        final ExchangeRateUtil exchangeRateUtil =
                new ExchangeRateUtil(isMcEnabled, destinCurrency, exchRateType);
        exchangeRateUtil.loadExchangeRates();
        return exchangeRateUtil;
    }

    /**
     * Returns request parameters for budget currency.
     *
     * @param parameters request parameters
     * @return request parameters
     */
    private static RequestParameters getBudgetRequestParameters(final RequestParameters parameters) {
        // summarize on asset table
        final RequestParameters tmpParameters = new RequestParameters(parameters.toMap());
        // set total cost
        tmpParameters.setParameterValue("vat_cost_type", VatCost.TOTAL.toString());
        // set currency code
        tmpParameters.setParameterValue("currency_code", ContextStore.get().getProject()
            .getBudgetCurrency().getCode());
        return tmpParameters;
    }
}
