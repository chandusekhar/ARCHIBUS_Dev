package com.archibus.service.cost;

import java.math.BigDecimal;
import java.util.*;

import com.archibus.app.common.finance.dao.datasource.*;
import com.archibus.app.common.finance.domain.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.service.cost.SummarizeCosts.CostField;
import com.archibus.service.cost.SummarizeCosts.SummaryType;
import com.archibus.service.cost.VatUtil.VatCost;
import com.archibus.utility.StringUtil;

/**
 *
 * Helper class for Straight Line Rent.
 * <p>
 *
 *
 * @author Ioan Draghici
 * @since 21.2
 *
 */
public final class StraightLineRentHelper {

    /**
     * Hide default constructor for this utility class - should never be instantiated.
     */
    private StraightLineRentHelper() {
    }

    /**
     * Summarize lease costs for cost category and period.
     *
     * @param lsId lease code
     * @param startDate lease start date
     * @param endDate lease end date
     * @param costField cost field (specify cost category and calculation type)
     * @param parameters request parameters
     * @param exchangeRates exchange rates object
     * @param onEntireDuration boolean if cost are summarized for entire lease duration
     * @return double
     *
     */
    public static double summarizeLeaseCostsForCostCategory(final String lsId,
            final Date startDate, final Date endDate, final CostField costField,
            final RequestParameters parameters, final ExchangeRateUtil exchangeRates,
            final boolean onEntireDuration) {
        Double costValue = BigDecimal.ZERO.doubleValue();
        final Map<String, Double> costValues = getDefaultCostValues(parameters.isMcAndVatEnabled());
        final List<String> assetIds = new ArrayList<String>();
        assetIds.add(lsId);

        if (parameters.isFromActual()) {
            final String sqlString =
                    SummarizeCostsHelper.getCostRestriction(SummaryType.LEASE, DbConstants.LS_ID,
                        assetIds, costField, DbConstants.COST_TRAN_TABLE, startDate, endDate);
            final ActualCostDataSource actualCostDataSource = new ActualCostDataSource();
            final List<ActualCost> actualCosts =
                    actualCostDataSource.findByRestriction(Restrictions.sql(sqlString));

            SummarizeCostsHelper.summarizeActualCosts(costField, costValues, actualCosts,
                parameters, parameters.isMcAndVatEnabled(), exchangeRates);
        }

        if (parameters.isFromScheduled()) {
            final String sqlString =
                    SummarizeCostsHelper.getCostRestriction(SummaryType.LEASE, DbConstants.LS_ID,
                        assetIds, costField, DbConstants.COST_TRAN_SCHED_TABLE, startDate, endDate);

            final ScheduledCostDataSource scheduledCostDataSource = new ScheduledCostDataSource();
            final List<ScheduledCost> scheduledCosts =
                    scheduledCostDataSource.findByRestriction(Restrictions.sql(sqlString));
            SummarizeCostsHelper.summarizeScheduledCosts(costField, costValues, scheduledCosts,
                parameters, parameters.isMcAndVatEnabled(), exchangeRates);
        }

        if (parameters.isFromRecurring()) {
            final String sqlString =
                    SummarizeCostsHelper.getCostRestriction(SummaryType.LEASE, DbConstants.LS_ID,
                        assetIds, costField, DbConstants.COST_TRAN_RECUR_TABLE, startDate, endDate);
            final RecurringCostDataSource recurringCostDataSource = new RecurringCostDataSource();
            final List<RecurringCost> recurringCosts =
                    recurringCostDataSource.findByRestriction(Restrictions.sql(sqlString));
            SummarizeCostsHelper.summarizeRecurringCosts(costField, costValues, recurringCosts,
                parameters, parameters.isMcAndVatEnabled(), exchangeRates, onEntireDuration);
        }

        if (parameters.isMcAndVatEnabled()) {
            costValue = costValues.get(parameters.getVatCostType().toString());
        } else {
            costValue = costValues.get(Constants.BUDGET);
        }

        return costValue.doubleValue();
    }
    
    /**
     * Initialize cumulative differential for lease.
     *
     * @param leaseRecord lease data record
     * @param parameters request parameters
     * @param exchangeRates exchange rates
     * @param baseRentField base rent field
     * @param monthlyLiCost monthly leasehold improvement cost
     * @param monthlySlRent monthly straight line rent cost
     * @return double
     */
    public static double getCumulativeDifferential(final DataRecord leaseRecord,
            final RequestParameters parameters, final ExchangeRateUtil exchangeRates,
            final CostField baseRentField, final double monthlyLiCost, final double monthlySlRent) {
        double result = 0.0;
        final Date startDate = parameters.getDateStart();
        final boolean isGroupByCostCategory =
                parameters.getBooleanValue(Constants.GROUP_BY_COST_CATEG);
        final String lsId =
                leaseRecord.getString(DbConstants.getFieldFullName(DbConstants.LS_TABLE,
                    DbConstants.LS_ID));
        final Date lsDateStart =
                leaseRecord.getDate(DbConstants.getFieldFullName(DbConstants.LS_TABLE,
                    DbConstants.DATE_START));

        if (isGroupByCostCategory && lsDateStart.before(startDate)) {
            // clone request parameters
            final RequestParameters tmpParams = new RequestParameters(parameters.toMap());
            tmpParams.setParameterValue(DbConstants.DATE_START, StringUtil.toString(lsDateStart));
            tmpParams.setParameterValue(DbConstants.DATE_END, StringUtil.toString(startDate));
            
            // interval length
            final int interval = getMonthsBetween(lsDateStart, startDate);
            final double baseRent =
                    Math.abs(StraightLineRentHelper.summarizeLeaseCostsForCostCategory(lsId,
                        lsDateStart, startDate, baseRentField, tmpParams, exchangeRates, false));
            final double slRent = monthlySlRent * interval;
            final double liCost = monthlyLiCost * interval;
            result = (baseRent - liCost) - slRent;
        }
        return result;
    }

    /**
     * Calculate month correction factor for straight line rent.
     *
     * @param dateStart start date
     * @param dateEnd end date
     * @return integer
     */
    public static int getMonthCorrection(final Date dateStart, final Date dateEnd) {
        int result = 0;
        final Calendar calStart = Calendar.getInstance();
        final Calendar calEnd = Calendar.getInstance();
        calStart.setTime(dateStart);
        calEnd.setTime(dateEnd);
        if (calEnd.get(Calendar.DAY_OF_MONTH) >= calStart.get(Calendar.DAY_OF_MONTH)) {
            result = 1;
        }
        return result;
    }

    /**
     * Get months number between start date and end date.
     *
     * @param dateFrom start date
     * @param dateTo end date
     * @return int
     */
    public static int getMonthsBetween(final Date dateFrom, final Date dateTo) {
        final Calendar calFrom = Calendar.getInstance();
        calFrom.setTime(dateFrom);
        final Calendar calTo = Calendar.getInstance();
        calTo.setTime(dateTo);
        
        final int yearDiff = calTo.get(Calendar.YEAR) - calFrom.get(Calendar.YEAR);
        final int dayDiff = calTo.get(Calendar.DATE) > calFrom.get(Calendar.DATE) ? 1 : 0;
        return yearDiff * Constants.MONTH_NO + calTo.get(Calendar.MONTH)
                - calFrom.get(Calendar.MONTH) + dayDiff;
    }

    /**
     * Return cost field values map initialized to zero.
     *
     * @param isMcAndVatEnabled is Mc and Vat is enabled
     * @return map
     */
    private static Map<String, Double> getDefaultCostValues(final boolean isMcAndVatEnabled) {
        final Map<String, Double> result = new HashMap<String, Double>();
        // initialize costFieldValues Object
        result.put(Constants.BUDGET, BigDecimal.ZERO.doubleValue());
        if (isMcAndVatEnabled) {
            result.put(VatCost.BASE.toString(), BigDecimal.ZERO.doubleValue());
            result.put(VatCost.VAT.toString(), BigDecimal.ZERO.doubleValue());
            result.put(VatCost.TOTAL.toString(), BigDecimal.ZERO.doubleValue());
        }
        return result;
    }
}
