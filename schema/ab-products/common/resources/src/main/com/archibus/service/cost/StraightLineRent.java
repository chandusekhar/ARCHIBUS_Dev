package com.archibus.service.cost;

import java.math.BigDecimal;
import java.util.*;

import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.jobmanager.JobStatus;
import com.archibus.model.config.ExchangeRateType;
import com.archibus.service.Period;
import com.archibus.service.cost.SummarizeCosts.CostField;
import com.archibus.utility.StringUtil;

/**
 * Generate Straight Line Rent projection.
 * <p>
 *
 *
 * @author Ioan Draghici
 * @since 21.1
 *
 */
public class StraightLineRent {
    /**
     * Constant.
     */
    private static final String MONTH_NO_FIELD = "month_no";

    /**
     * Generate Straight Line Rent projection.
     *
     * @param requestParameters report request parameters
     * @param jobStatus job status
     * @return CostProjection
     */
    public CostProjection createProjection(final RequestParameters requestParameters,
            final JobStatus jobStatus) {
        
        jobStatus.setMessage(CostMessages
            .getLocalizedMessage(CostMessages.MESSAGE_CALCULATE_STRAIGHT_LINE));
        final List<DataRecord> leases = getLeases(requestParameters);
        JobStatusUtil.initializeJob(jobStatus, leases.size(), 0);
        final ExchangeRateUtil exchangeRates =
                loadExchangeRates(requestParameters.isMcAndVatEnabled(),
                    requestParameters.getCurrencyCode(), requestParameters.getExchangeRateType());
        
        // create cost projection
        final CostProjection projection =
                new CostProjection(DbConstants.LS_ID, requestParameters.getDateStart(),
                    requestParameters.getDateEnd(), requestParameters.getPeriod());
        
        for (final DataRecord recLease : leases) {
            calculateStraightLineRentForLease(projection, recLease, requestParameters,
                exchangeRates);
            JobStatusUtil.incrementJobCurrentNo(jobStatus, 1);
        }
        
        final List<String> errorMessages = exchangeRates.getMissingExchangeRates();
        if (!errorMessages.isEmpty()) {
            JobStatusUtil.addProperty(jobStatus, Constants.PROPERTY_MISSING_EXCHANGE_RATE,
                errorMessages);
        }
        
        JobStatusUtil.completeJob(jobStatus);
        return projection;
    }
    
    /**
     * Get lease records.
     *
     * @param parameters request parameters
     * @return List<DataRecord>
     *         <p>
     *         Suppress PMD warning "AvoidUsingSql" in this method.
     *         <p>
     *         Justification Case 1. Sql statement with subqueries
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    private List<DataRecord> getLeases(final RequestParameters parameters) {
        final DataSource dataSource =
                DataSourceFactory.createDataSourceForFields(DbConstants.LS_TABLE, new String[] {
                        DbConstants.LS_ID, DbConstants.DATE_START, DbConstants.DATE_END,
                        DbConstants.LANDLORD_TENANT });
        // add standard tables for VPA restriction
        dataSource.addTable(DbConstants.BL_TABLE, DataSource.ROLE_STANDARD);
        dataSource.addTable(DbConstants.PR_TABLE, DataSource.ROLE_STANDARD);
        dataSource.setApplyVpaRestrictions(false);
        
        // add month number calculated field
        final VirtualFieldDef monthNoFieldDef =
                new VirtualFieldDef(DbConstants.LS_TABLE, MONTH_NO_FIELD,
                    DataSource.DATA_TYPE_INTEGER);
        final Map<String, String> sqlExpressions = new HashMap<String, String>();
        sqlExpressions.put("generic",
                "${sql.dateDiffCalendar('month', 'ls.date_start', 'ls.date_end')}");
        monthNoFieldDef.addSqlExpressions(sqlExpressions);
        dataSource.addCalculatedField(monthNoFieldDef);
        // add restrictions
        dataSource.addRestriction(Restrictions.eq(DbConstants.LS_TABLE,
            DbConstants.USE_AS_TEMPLATE, 0));
        dataSource.addRestriction(Restrictions.sql(parameters.getRestrictionForTableAndField(
            DbConstants.LS_TABLE, DbConstants.LS_ID)));
        // add date range restriction
        dataSource.addRestriction(Restrictions.lt(DbConstants.LS_TABLE, DbConstants.DATE_START,
            parameters.getDateEnd()));
        dataSource
        .addRestriction(Restrictions.and(
            Restrictions.isNotNull(DbConstants.LS_TABLE, DbConstants.DATE_END),
            Restrictions.gt(DbConstants.LS_TABLE, DbConstants.DATE_END,
                parameters.getDateStart())));
        // location restriction
        String sqlRestriction =
                "EXISTS(SELECT bl.bl_id FROM bl WHERE bl.bl_id = ls.bl_id "
                        + parameters.getLocationRestrictionForTable2("bl")
                        + " AND ${sql.getVpaRestrictionForTable('bl')} ) ";
        if (StringUtil.isNullOrEmpty(parameters.getStringValue(DbConstants.BL_ID))) {
            sqlRestriction +=
                    "OR EXISTS(SELECT property.pr_id FROM property WHERE property.pr_id = ls.pr_id "
                            + parameters.getLocationRestrictionForTable2("property")
                            + " AND ${sql.getVpaRestrictionForTable('property')} )";
        }
        
        dataSource.addRestriction(Restrictions.sql(sqlRestriction));
        return dataSource.getRecords();
    }
    
    /**
     * Calculate Straight Line Rent for lease.
     *
     * @param projection cost projection
     * @param recLease lease data record
     * @param parameters report request parameters
     * @param exchangeRates exchange rates
     */
    private void calculateStraightLineRentForLease(final CostProjection projection,
            final DataRecord recLease, final RequestParameters parameters,
            final ExchangeRateUtil exchangeRates) {
        final boolean isGroupByCostCategory =
                parameters.getBooleanValue(Constants.GROUP_BY_COST_CATEG);
        
        final String lsId =
                recLease.getString(DbConstants.getFieldFullName(DbConstants.LS_TABLE,
                    DbConstants.LS_ID));
        final Date lsDateStart =
                recLease.getDate(DbConstants.getFieldFullName(DbConstants.LS_TABLE,
                    DbConstants.DATE_START));
        final Date lsDateEnd =
                recLease.getDate(DbConstants.getFieldFullName(DbConstants.LS_TABLE,
                    DbConstants.DATE_END));
        // final int lsMonthDuration =
        // recLease.getInt(DbConstants.getFieldFullName(DbConstants.LS_TABLE, MONTH_NO_FIELD))
        // + StraightLineRentHelper.getMonthCorrection(lsDateStart, lsDateEnd);
        final int lsMonthDuration = StraightLineRentHelper.getMonthsBetween(lsDateStart, lsDateEnd);
        final String calculationType = parameters.getCalculationType();
        // calculate monthly base rent
        final CostField baseRentCostField =
                getCostFieldForCostCateg(Constants.BASE_RENT,
                    parameters.getParameterValue(Constants.BASE_RENT_ACTIVITY_PARAM),
                    calculationType);
        final double monthlyBaseRent =
                Math.abs(StraightLineRentHelper.summarizeLeaseCostsForCostCategory(lsId,
                    lsDateStart, lsDateEnd, baseRentCostField, parameters, exchangeRates, true))
                    / lsMonthDuration;
        
        // calculate monthly lease hold improvement costs
        final CostField liCostField =
                getCostFieldForCostCateg(Constants.LI_CREDIT,
                    Constants.LEASEHOLD_IMPROVMENT_COST_CATEG, calculationType);
        final double monthlyLiCost =
                Math.abs(StraightLineRentHelper.summarizeLeaseCostsForCostCategory(lsId, null,
                    null, liCostField, parameters, exchangeRates, true)) / lsMonthDuration;
        
        final String groupResultsBy = parameters.getPeriod();
        final int factor = getMultiplicationFactorByPeriod(groupResultsBy);
        BigDecimal cumulDiffCostHolder =
                BigDecimal.valueOf(StraightLineRentHelper.getCumulativeDifferential(recLease,
                    parameters, exchangeRates, baseRentCostField, monthlyLiCost, monthlyBaseRent));
        final List<CostPeriod> costPeriods = projection.createPeriodsForAsset(lsId);
        for (final CostPeriod costPeriod : costPeriods) {
            boolean isCalcOn = false;
            if (Period.MONTH.equals(groupResultsBy)) {
                isCalcOn =
                        !costPeriod.getDateStart().after(lsDateEnd)
                        && !costPeriod.getDateEnd().before(lsDateStart)
                        && !costPeriod.getDateEnd().after(lsDateEnd);
            } else {
                isCalcOn =
                        !costPeriod.getDateStart().after(lsDateEnd)
                        && !costPeriod.getDateEnd().before(lsDateStart);
            }

            if (isCalcOn) {
                final Double correctionFactor =
                        getCorrectionFactorForPeriod(costPeriod, lsDateStart, lsDateEnd,
                            parameters.getPeriod());
                if (isGroupByCostCategory) {
                    parameters.setParameterValue(DbConstants.DATE_START,
                        dateToString(costPeriod.getDateStart()));
                    parameters.setParameterValue(DbConstants.DATE_END,
                        dateToString(costPeriod.getDateEnd()));
                    final double baseRent =
                            Math.abs(StraightLineRentHelper.summarizeLeaseCostsForCostCategory(
                                lsId, costPeriod.getDateStart(), costPeriod.getDateEnd(),
                                baseRentCostField, parameters, exchangeRates, false));
                    final double liCost = monthlyLiCost * factor * correctionFactor.doubleValue();
                    final double actualRent = baseRent - Math.abs(liCost);
                    final double slRent = monthlyBaseRent * factor * correctionFactor.doubleValue();
                    final double diffCost = actualRent - slRent;
                    cumulDiffCostHolder = cumulDiffCostHolder.add(BigDecimal.valueOf(diffCost));
                    
                    projection.updateCost(lsId, Constants.BASE_RENT, costPeriod.getDateStart(),
                        baseRent);
                    projection.updateCost(lsId, Constants.LI_CREDIT, costPeriod.getDateStart(),
                        liCost);
                    projection.updateCost(lsId, Constants.ACTUAL_RENT, costPeriod.getDateStart(),
                        actualRent);
                    projection.updateCost(lsId, Constants.STRAIGHT_LINE_RENT,
                        costPeriod.getDateStart(), slRent);
                    projection.updateCost(lsId, Constants.DIFFERENTIAL_RENT,
                        costPeriod.getDateStart(), diffCost);
                    projection.updateCost(lsId, Constants.DIFFERENTIAL_RENT_CUMUL,
                        costPeriod.getDateStart(), cumulDiffCostHolder.doubleValue());
                    
                } else {
                    projection.updateCost(lsId, costPeriod.getDateStart(), monthlyBaseRent * factor
                        * correctionFactor.doubleValue());
                }
            }
        }
    }
    
    /**
     * Load exchange rates if MC is enabled.
     *
     * @param isMcEnabled boolean
     * @param destinCurrency destination currency
     * @param exchangeRateType exchange rate type
     * @return ExchangeRateUtil object
     */
    private ExchangeRateUtil loadExchangeRates(final boolean isMcEnabled,
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
     * Get multiplication factor by period.
     *
     * @param period user selected period
     * @return int
     */
    private int getMultiplicationFactorByPeriod(final String period) {
        int result = 1;
        if (Period.QUARTER.equals(period)) {
            result = Integer.valueOf("3");
        } else if (Period.YEAR.equals(period)) {
            result = Constants.MONTH_NO;
        }
        return result;
    }
    
    /**
     * Calculate correction factor for incomplete intervals.
     *
     * @param period cost period
     * @param startDate asset start date
     * @param endDate asset end date
     * @param timeRangeSpan time range span
     * @return Double
     */
    private Double getCorrectionFactorForPeriod(final CostPeriod period, final Date startDate,
            final Date endDate, final String timeRangeSpan) {
        Double result = 1.0;
        boolean isCorrectionOnStart = false;
        boolean isCorrectionOnEnd = false;
        if (!Period.MONTH.equals(timeRangeSpan) && period.getDateStart().before(startDate)) {
            isCorrectionOnStart = true;
        }

        if (!Period.MONTH.equals(timeRangeSpan) && period.getDateEnd().after(endDate)) {
            isCorrectionOnEnd = true;
        }

        if (isCorrectionOnStart || isCorrectionOnEnd) {
            final int multiplicationFactor = getMultiplicationFactorByPeriod(timeRangeSpan);
            int intervalLength = 0;
            if (isCorrectionOnStart) {
                intervalLength =
                        StraightLineRentHelper.getMonthsBetween(startDate, period.getDateEnd());
            }
            if (isCorrectionOnEnd) {
                intervalLength =
                        StraightLineRentHelper.getMonthsBetween(period.getDateStart(), endDate)
                                - (period.getDateEnd().after(endDate) ? 1 : 0);
            }
            result = Double.valueOf(intervalLength) / Double.valueOf(multiplicationFactor);
        }
        
        return result;
    }
    
    /**
     * Returns CostField for cost category and calculation type.
     *
     * @param fieldId field id
     * @param costCateg cost category
     * @param calculationType calculation type.
     * @return CostField
     */
    private CostField getCostFieldForCostCateg(final String fieldId, final String costCateg,
            final String calculationType) {
        final SummarizeCosts summarizeCost = new SummarizeCosts(DbConstants.LS_TABLE);
        final String restriction =
                "cost_cat.cost_cat_id IN ('" + costCateg.replaceAll(Constants.COMMA, "','") + "')";
        return summarizeCost.new CostField(fieldId, restriction, calculationType);
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
        return String.format("%s-%s-%s", cal.get(Calendar.YEAR), cal.get(Calendar.MONTH) + 1,
            cal.get(Calendar.DAY_OF_MONTH));
    }

}
