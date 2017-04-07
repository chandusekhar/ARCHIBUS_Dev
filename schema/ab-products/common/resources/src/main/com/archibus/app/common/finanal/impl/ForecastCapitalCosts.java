package com.archibus.app.common.finanal.impl;

import static com.archibus.app.common.finanal.impl.Constants.*;

import java.util.*;

import org.apache.poi.ss.formula.functions.Finance;

import com.archibus.app.common.depreciation.impl.DepreciationService;
import com.archibus.app.common.finance.domain.ScheduledCost;
import com.archibus.config.Project.Immutable;
import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.*;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.utility.StringUtil;

/**
 * Helper class for forecast capital costs.
 *
 * @author Ana Albu
 * @since 23.1
 *
 */
public class ForecastCapitalCosts {
    /**
     * Helper class.
     */
    private final ForecastCapitalCostsHelper helper = new ForecastCapitalCostsHelper();

    /**
     * Calculate principal payments forecast and create scheduled costs.
     *
     * @param assetType 'bl', 'pr', 'proj' or 'eq'
     * @param record finanal_params record from the form
     * @param frequency 'YEAR' or 'MONTH'
     * @param costCategory cost category value
     */
    public void calculatePrincipalCosts(final String assetType, final DataRecord record,
            final String frequency, final String costCategory) {
        calculateCosts(assetType, record, frequency, costCategory, PRINCIPAL_COST_TYPE);
    }

    /**
     * Calculate interest payments forecast and create scheduled costs.
     *
     * @param assetType 'bl', 'pr', 'proj' or 'eq'
     * @param record finanal_params record from the form
     * @param frequency 'YEAR' or 'MONTH'
     * @param costCategory cost category value
     */
    public void calculateInterestCosts(final String assetType, final DataRecord record,
            final String frequency, final String costCategory) {
        calculateCosts(assetType, record, frequency, costCategory, INTEREST_COST_TYPE);
    }

    /**
     * Calculate cost of capital forecast and create scheduled costs.
     *
     * @param assetType 'bl', 'pr', 'proj' or 'eq'
     * @param record finanal_params record from the form
     * @param frequency 'YEAR' or 'MONTH'
     * @param costCategory cost category value
     */
    public void calculateCapitalCosts(final String assetType, final DataRecord record,
            final String frequency, final String costCategory) {
        // delete all scheduled cost for this asset for this cost category created by the forecast
        // action
        this.helper.deleteForecastScheduledCosts(assetType, record, costCategory);

        final Immutable project = ContextStore.get().getProject();
        final com.archibus.config.IActivityParameterManager activityParameterManager =
                project.getActivityParameterManager();
        final ScheduledCost scheduledCost =
                this.helper.initScheduledCost(assetType, record, frequency, costCategory);

        final Double loanDownPayment = record.getDouble(FINANAL_PARAMS + DOT + DOWN_PAYMENT);

        final Double loanAmount = record.getDouble(FINANAL_PARAMS + DOT + LOAN_AMOUNT);

        final Date loanStartDate = record.getDate(FINANAL_PARAMS + DOT + DATE_LOAN_START);
        final Calendar currentDueDate = Calendar.getInstance();
        currentDueDate.setTime(loanStartDate);

        double rate = Double.parseDouble(activityParameterManager
            .getParameterValue("AbRPLMStrategicFinancialAnalysis-InternalCostofCapital"));

        final double loanRate = record.getDouble(FINANAL_PARAMS + DOT + LOAN_RATE);
        final double principalRate = loanRate / NUMBER_OF_MONTHS;

        int numberOfPeriods = record.getInt(FINANAL_PARAMS + DOT + PLANNED_LIFE);

        if (FREQUENCY_MONTH.equals(frequency)) {
            rate = rate / NUMBER_OF_MONTHS;
            numberOfPeriods = numberOfPeriods * NUMBER_OF_MONTHS;
            calculateCapitalCostsMonthly(scheduledCost, loanDownPayment, loanAmount, principalRate,
                rate + 1, numberOfPeriods, currentDueDate);
        } else {
            calculateCapitalCostsYearly(scheduledCost, loanDownPayment, loanAmount, principalRate,
                rate + 1, numberOfPeriods, currentDueDate);
        }
    }

    /**
     *
     * Calculate cost of capital forecast and create scheduled costs for a yearly frequency.
     *
     * @param scheduledCost ScheduledCost object containing common values for costs that should be
     *            created
     * @param loanDownPayment loan down payment value
     * @param loanAmount loan amount value
     * @param principalRate rate value to calculate principal costs, obtained from Loan Rate divided
     *            by 12.
     * @param rate rate value for calculating capital costs
     * @param numberOfPeriods number of years
     * @param currentDueDate start loan date
     */
    private void calculateCapitalCostsYearly(final ScheduledCost scheduledCost,
            final Double loanDownPayment, final Double loanAmount, final Double principalRate,
            final double rate, final int numberOfPeriods, final Calendar currentDueDate) {

        int period = 1;
        double interestPaidThisYear = 0;

        double previousValue = loanDownPayment;
        for (int periodIndex = 1; periodIndex <= numberOfPeriods; periodIndex++) {
            interestPaidThisYear = 0;
            for (int monthIndex = 1; monthIndex <= NUMBER_OF_MONTHS; monthIndex++) {
                double interestPaidThisMonth = 0.0;
                interestPaidThisMonth = Math.abs(Finance.ppmt(principalRate, period,
                    numberOfPeriods * NUMBER_OF_MONTHS, loanAmount));

                period++;
                interestPaidThisYear += interestPaidThisMonth;
            }
            previousValue = previousValue + interestPaidThisYear;
            final double accumulatedValue = previousValue * rate;
            double capitalCost = accumulatedValue - previousValue;

            if (capitalCost < 0) {
                capitalCost = capitalCost * (-1);
            }

            currentDueDate.add(Calendar.YEAR, 1);
            this.helper.updateCostValueAndDate(EXPENSE, scheduledCost, capitalCost, currentDueDate);
            this.helper.saveScheduledCost(scheduledCost);

            previousValue = accumulatedValue;
        }
    }

    /**
     *
     * Calculate cost of capital forecast and create scheduled costs for a monthly frequency.
     *
     * @param scheduledCost ScheduledCost object containing common values for costs that should be
     *            created
     * @param loanDownPayment loan down payment value
     * @param loanAmount loan amount value
     * @param principalRate rate value to calculate principal costs, obtained from Loan Rate divided
     *            by 12.
     * @param rate rate value
     * @param numberOfPeriods number of months
     * @param currentDueDate start loan date
     */
    private void calculateCapitalCostsMonthly(final ScheduledCost scheduledCost,
            final Double loanDownPayment, final Double loanAmount, final double principalRate,
            final double rate, final int numberOfPeriods, final Calendar currentDueDate) {

        double previousValue = loanDownPayment;

        final int numberOfYears = numberOfPeriods / NUMBER_OF_MONTHS;
        for (int indexAn = 1; indexAn <= numberOfYears; indexAn++) {
            for (int currentMonth = (indexAn - 1) * NUMBER_OF_MONTHS + 1; currentMonth <= indexAn
                    * NUMBER_OF_MONTHS; currentMonth++) {
                final double interestPaidThisMonth = Math
                    .abs(Finance.ppmt(principalRate, currentMonth, numberOfPeriods, loanAmount));

                previousValue = previousValue + interestPaidThisMonth;
                final double accumulatedValue = previousValue * rate;
                double capitalCost = accumulatedValue - previousValue;

                if (capitalCost < 0) {
                    capitalCost = capitalCost * (-1);
                }

                currentDueDate.add(Calendar.MONTH, 1);
                this.helper.updateCostValueAndDate(EXPENSE, scheduledCost, capitalCost,
                    currentDueDate);
                this.helper.saveScheduledCost(scheduledCost);

                previousValue = accumulatedValue;

            }
        }
    }

    /**
     * Calculate depreciation charges forecast and create scheduled costs.
     *
     * @param assetType 'bl', 'pr', 'proj' or 'eq'
     * @param record finanal_params record from the form
     * @param frequency 'YEAR' or 'MONTH'
     * @param costCategory cost category value
     */
    public void calculateDepreciationCosts(final String assetType, final DataRecord record,
            final String frequency, final String costCategory) {
        // delete all scheduled cost for this asset for this cost category created by the forecast
        // action
        this.helper.deleteForecastScheduledCosts(assetType, record, costCategory);

        final DepreciationService depreciationService = new DepreciationService();

        final int finParamId = record.getInt(FINANAL_PARAMS + DOT + AUTO_NUMBER);

        // start the calculation from date_purchase's fiscal year or month
        final Date datePurchased = record.getDate(FINANAL_PARAMS + DOT + DATE_PURCHASED);
        final Calendar startDate = this.helper.getFiscalYearStartDate(datePurchased);
        if (FREQUENCY_YEAR.equals(frequency)) {
            // For Annual calculation: The first schedule cost record has the Due Date the
            // beginning of the next fiscal year (= current fiscal year + 1)
            startDate.add(Calendar.YEAR, 1);
        } else if (FREQUENCY_MONTH.equals(frequency)) {
            // For Monthly calculation: The first schedule cost record has the Due Date the
            // beginning of the next fiscal month (= current fiscal month + 1)
            startDate.setTime(datePurchased);
            final int fiscalYearStartDay =
                    Integer.parseInt(this.helper.getSchemaPreference(FISCALYEAR_STARTDAY));
            startDate.set(Calendar.DATE, fiscalYearStartDay);
            startDate.add(Calendar.MONTH, 1);
        }

        final int deprecPeriod = record.getInt(PROPERTY_TYPE + DOT + DEPREC_PERIOD);

        // calculation end date is start date + depreciation period in months
        final Calendar endDate = Calendar.getInstance();
        endDate.setTimeInMillis(startDate.getTimeInMillis());
        endDate.add(Calendar.MONTH, deprecPeriod);
        endDate.add(Calendar.DATE, -1);

        // set cost due date
        final ScheduledCost scheduledCost =
                this.helper.initScheduledCost(assetType, record, frequency, costCategory);

        final DataSetList results = (DataSetList) depreciationService
            .calculateDepreciationValuesForFinParamAndPeriodAndTimeSpan(finParamId,
                new Date(startDate.getTimeInMillis()), new Date(endDate.getTimeInMillis()),
                frequency.toLowerCase());
        final List<DataRecord> records = results.getRecords();

        final Iterator<DataRecord> iterator = records.iterator();
        while (iterator.hasNext()) {
            final DataRecord deprecRecord = iterator.next();

            final double deprecValue = deprecRecord.getDouble(FINANAL_PARAMS + DOT + COST_PURCHASE);
            scheduledCost.setAmountExpense(deprecValue);
            scheduledCost.setAmountExpenseBaseBudget(deprecValue);
            scheduledCost.setAmountExpenseBasePayment(deprecValue);
            scheduledCost.setAmountExpenseTotalPayment(deprecValue);

            scheduledCost.setDateDue(deprecRecord.getDate(FINANAL_PARAMS + DOT + DATE_PURCHASED));

            this.helper.saveScheduledCost(scheduledCost);

        }
    }

    /**
     * Calculate appreciation forecast and create scheduled costs.
     *
     * @param assetType 'bl', 'pr', 'proj' or 'eq'
     * @param record finanal_params record from the form
     * @param frequency 'YEAR' or 'MONTH'
     * @param costCategory cost category value
     */
    public void calculateAppreciationCosts(final String assetType, final DataRecord record,
            final String frequency, final String costCategory) {

        // delete all scheduled cost for this asset for this cost category created by the forecast
        // action
        this.helper.deleteForecastScheduledCosts(assetType, record, costCategory);

        if (ASSET_TYPE_EQ.equals(assetType) || ASSET_TYPE_PROJ.equals(assetType)) {
            return;
        }

        final ScheduledCost scheduledCost =
                this.helper.initScheduledCost(assetType, record, frequency, costCategory);

        final double costPurchase = record.getDouble(FINANAL_PARAMS + DOT + COST_PURCHASE);

        double rate = record.getDouble(FINANAL_PARAMS + DOT + RATE_APPREC);
        int numberOfPeriods = record.getInt(FINANAL_PARAMS + DOT + PLANNED_LIFE);
        if (FREQUENCY_MONTH.equals(frequency)) {
            rate = rate / NUMBER_OF_MONTHS;
            numberOfPeriods = numberOfPeriods * NUMBER_OF_MONTHS;
        }
        rate = rate + 1;

        final Date dateApprecStart = record.getDate(FINANAL_PARAMS + DOT + DATE_APPREC_START);
        final Calendar startDate = this.helper.getFiscalYearStartDate(dateApprecStart);
        if (FREQUENCY_MONTH.equals(frequency)) {
            // For Monthly calculation: The first schedule cost record has the Due Date the
            // beginning of the next fiscal month (= current fiscal month + 1)
            startDate.setTime(dateApprecStart);
            final int fiscalYearStartDay =
                    Integer.parseInt(this.helper.getSchemaPreference(FISCALYEAR_STARTDAY));
            startDate.set(Calendar.DATE, fiscalYearStartDay);
        }

        this.helper.calculateAppreciation(costPurchase, startDate.getTime(), rate, frequency,
            numberOfPeriods, scheduledCost);
    }

    /**
     * Calculate disposition cost forecast and create scheduled costs.
     *
     * @param assetType 'bl', 'pr', 'proj' or 'eq'
     * @param record finanal_params record from the form
     * @param frequency 'YEAR' or 'MONTH'
     * @param costCategory cost category value
     */
    public void calculateDispositionCosts(final String assetType, final DataRecord record,
            final String frequency, final String costCategory) {

        // delete all scheduled cost for this asset for this cost category created by the forecast
        // action
        this.helper.deleteForecastScheduledCosts(assetType, record, costCategory);

        final double costPurchase = record.getDouble(FINANAL_PARAMS + DOT + COST_PURCHASE);
        record.getDate(FINANAL_PARAMS + DOT + DATE_PURCHASED);

        int numberOfPeriods = record.getInt(FINANAL_PARAMS + DOT + PLANNED_LIFE);

        double rate = record.getDouble(FINANAL_PARAMS + DOT + RATE_APPREC) + 1;

        Calendar startDate = Calendar.getInstance();
        final Calendar endDate = Calendar.getInstance();

        final Date appreciationStartDate = record.getDate(FINANAL_PARAMS + DOT + DATE_APPREC_START);
        final Date purchaseDate = record.getDate(FINANAL_PARAMS + DOT + DATE_PURCHASED);

        final ScheduledCost scheduledCost =
                this.helper.initScheduledCost(assetType, record, frequency, costCategory);

        double valueAtEndOfLife = 0;
        if (ASSET_TYPE_BL.equals(assetType) || ASSET_TYPE_PR.equals(assetType)) {
            // Schedule this cost for the Proposed Disposition (Year), that is the Year of the
            // Appreciation Start Date plus the Planned Life
            startDate = this.helper.getFiscalYearStartDate(appreciationStartDate);
            if (FREQUENCY_MONTH.equals(frequency)) {
                // For Monthly calculation: The first schedule cost record has the Due Date the
                // beginning of the next fiscal month (= current fiscal month + 1)
                startDate.setTime(appreciationStartDate);
                final int fiscalYearStartDay =
                        Integer.parseInt(this.helper.getSchemaPreference(FISCALYEAR_STARTDAY));
                startDate.set(Calendar.DATE, fiscalYearStartDay);

                rate = (rate - 1) / NUMBER_OF_MONTHS + 1;
                numberOfPeriods = numberOfPeriods * NUMBER_OF_MONTHS;

                endDate.setTimeInMillis(startDate.getTimeInMillis());
                endDate.add(Calendar.MONTH, numberOfPeriods);
            } else {
                endDate.setTimeInMillis(startDate.getTimeInMillis());
                endDate.add(Calendar.YEAR, numberOfPeriods);
            }

            valueAtEndOfLife = this.helper.calculateAppreciation(costPurchase, startDate.getTime(),
                rate, frequency, numberOfPeriods, null) + costPurchase;

            scheduledCost.setDateDue(new Date(endDate.getTimeInMillis()));
        } else {
            final DepreciationService depreciationService = new DepreciationService();

            final int finParamId = record.getInt(FINANAL_PARAMS + DOT + AUTO_NUMBER);

            startDate = this.helper.getFiscalYearStartDate(purchaseDate);
            if (FREQUENCY_MONTH.equals(frequency)) {
                // For Monthly calculation: The first schedule cost record has the Due Date the
                // beginning of the next fiscal month (= current fiscal month + 1)
                startDate.setTime(purchaseDate);
                final int fiscalYearStartDay =
                        Integer.parseInt(this.helper.getSchemaPreference(FISCALYEAR_STARTDAY));
                startDate.set(Calendar.DATE, fiscalYearStartDay);
            }

            endDate.setTimeInMillis(startDate.getTimeInMillis());
            // calculate the value at end of planned life
            endDate.add(Calendar.YEAR, numberOfPeriods);
            scheduledCost.setDateDue(new Date(endDate.getTimeInMillis()));

            endDate.add(Calendar.DATE, -1);

            valueAtEndOfLife = costPurchase - depreciationService
                .calculateDepreciationForFinParamAndPeriodAndTimeSpan(finParamId,
                    startDate.getTime(), endDate.getTime(), frequency.toLowerCase());

        }

        // multiply by 5%
        valueAtEndOfLife = valueAtEndOfLife * DISPOSITION_PERCENTAGE_VALUE;

        scheduledCost.setAmountIncome(valueAtEndOfLife);
        scheduledCost.setAmountIncomeBaseBudget(valueAtEndOfLife);
        scheduledCost.setAmountIncomeBasePayment(valueAtEndOfLife);
        scheduledCost.setAmountIncomeTotalPayment(valueAtEndOfLife);

        this.helper.saveScheduledCost(scheduledCost);
    }

    /**
     * Calculate salvage value forecast and create a scheduled cost.
     *
     * @param assetType 'bl', 'pr', 'proj' or 'eq'
     * @param record finanal_params record from the form
     * @param frequency 'YEAR' or 'MONTH'
     * @param costCategory cost category value
     */
    public void calculateSalvageCosts(final String assetType, final DataRecord record,
            final String frequency, final String costCategory) {

        // delete all scheduled cost for this asset for this cost category created by the forecast
        // action
        this.helper.deleteForecastScheduledCosts(assetType, record, costCategory);

        final double costPurchase = record.getDouble(FINANAL_PARAMS + DOT + COST_PURCHASE);

        int numberOfPeriods = record.getInt(FINANAL_PARAMS + DOT + PLANNED_LIFE);

        double rate = record.getDouble(FINANAL_PARAMS + DOT + RATE_APPREC) + 1;

        final ScheduledCost scheduledCost =
                this.helper.initScheduledCost(assetType, record, frequency, costCategory);

        // Set the "Date Due" to be the first day of the proposed disposition year -- is the Year of
        // the Date Purchased plus the Planned Life.
        final Date datePurchased = record.getDate(FINANAL_PARAMS + DOT + DATE_PURCHASED);

        final Calendar startDate = this.helper.getFiscalYearStartDate(datePurchased);
        if (FREQUENCY_MONTH.equals(frequency)) {
            // For Monthly calculation: The first schedule cost record has the Due Date the
            // beginning of the next fiscal month (= current fiscal month + 1)
            startDate.setTime(datePurchased);
            final int fiscalYearStartDay =
                    Integer.parseInt(this.helper.getSchemaPreference(FISCALYEAR_STARTDAY));
            startDate.set(Calendar.DATE, fiscalYearStartDay);
        }

        final Calendar endDate = Calendar.getInstance();
        endDate.setTimeInMillis(startDate.getTimeInMillis());
        endDate.add(Calendar.YEAR, numberOfPeriods);

        scheduledCost.setDateDue(new Date(endDate.getTimeInMillis()));

        double valueAtEndOfLife = 0.0;
        final int finParamId = record.getInt(FINANAL_PARAMS + DOT + AUTO_NUMBER);

        if (ASSET_TYPE_BL.equals(assetType) || ASSET_TYPE_PR.equals(assetType)) {

            if (FREQUENCY_MONTH.equals(frequency)) {
                rate = (rate - 1) / NUMBER_OF_MONTHS + 1;
                numberOfPeriods = numberOfPeriods * NUMBER_OF_MONTHS;
            }

            valueAtEndOfLife = this.helper.calculateAppreciation(costPurchase, startDate.getTime(),
                rate, frequency, numberOfPeriods, null) + costPurchase;

        } else if (ASSET_TYPE_EQ.equals(assetType)) {
            final String eqTable = "eq";
            final DataSource eqDataSource = DataSourceFactory.createDataSourceForFields(eqTable,
                new String[] { EQ_ID, VALUE_SALVAGE });
            eqDataSource.addRestriction(new Restrictions.Restriction.Clause(eqTable, EQ_ID,
                record.getString(FINANAL_PARAMS + DOT + EQ_ID), Restrictions.OP_EQUALS));
            final DataRecord eqRecord = eqDataSource.getRecord();
            final double valueSalvage = eqRecord.getDouble(eqTable + DOT + VALUE_SALVAGE);
            if (StringUtil.notNullOrEmpty(valueSalvage) && valueSalvage != 0) {
                valueAtEndOfLife = valueSalvage;
            } else {
                final DepreciationService depreciationService = new DepreciationService();
                endDate.add(Calendar.DATE, -1);
                valueAtEndOfLife = costPurchase - depreciationService
                    .calculateDepreciationForFinParamAndPeriodAndTimeSpan(finParamId,
                        startDate.getTime(), endDate.getTime(), frequency.toLowerCase());
            }
        } else if (ASSET_TYPE_PROJ.equals(assetType)) {
            final DepreciationService depreciationService = new DepreciationService();
            endDate.add(Calendar.DATE, -1);
            valueAtEndOfLife = costPurchase - depreciationService
                .calculateDepreciationForFinParamAndPeriodAndTimeSpan(finParamId,
                    startDate.getTime(), endDate.getTime(), frequency.toLowerCase());
        }

        scheduledCost.setAmountIncome(valueAtEndOfLife);
        scheduledCost.setAmountIncomeBaseBudget(valueAtEndOfLife);
        scheduledCost.setAmountIncomeBasePayment(valueAtEndOfLife);
        scheduledCost.setAmountIncomeTotalPayment(valueAtEndOfLife);

        this.helper.saveScheduledCost(scheduledCost);
    }

    /**
     * Common calculation for principal and interest costs.
     *
     * @param assetType 'bl', 'pr', 'proj' or 'eq'
     * @param record finanal_params record from the form
     * @param frequency 'YEAR' or 'MONTH'
     * @param costCategory cost category value
     * @param costType cost type: "principal" or "interest"
     */
    private void calculateCosts(final String assetType, final DataRecord record,
            final String frequency, final String costCategory, final String costType) {
        // delete all scheduled cost for this asset for this cost category created by the forecast
        // action
        this.helper.deleteForecastScheduledCosts(assetType, record, costCategory);

        // create forecast scheduled costs
        final Immutable project = ContextStore.get().getProject();
        final com.archibus.config.IActivityParameterManager activityParameterManager =
                project.getActivityParameterManager();
        final ScheduledCost scheduledCost =
                this.helper.initScheduledCost(assetType, record, frequency, costCategory);

        final int loanTerm = record.getInt(FINANAL_PARAMS + DOT + LOAN_TERM);

        final double loanAmount = record.getDouble(FINANAL_PARAMS + DOT + LOAN_AMOUNT);

        double loanRate = record.getDouble(FINANAL_PARAMS + DOT + LOAN_RATE);
        if (loanRate == 0) {
            loanRate = Double.parseDouble(activityParameterManager
                .getParameterValue("AbRPLMStrategicFinancialAnalysis-InternalCostofDebt")) + 1;
        }

        double interestPaidThisYear = 0;
        double interestPaidThisMonth = 0.0;
        int period = 1;
        final double rate = loanRate / NUMBER_OF_MONTHS;
        final int numberOfPeriods = loanTerm * NUMBER_OF_MONTHS;

        final Date loanStartDate = record.getDate(FINANAL_PARAMS + DOT + DATE_LOAN_START);
        final Calendar currentDueDate = Calendar.getInstance();
        currentDueDate.setTime(loanStartDate);

        for (int yearIndex = 1; yearIndex <= loanTerm; yearIndex++) {
            interestPaidThisYear = 0.0;
            for (int monthIndex = 1; monthIndex <= NUMBER_OF_MONTHS; monthIndex++) {
                interestPaidThisMonth = 0.0;
                if (PRINCIPAL_COST_TYPE.equals(costType)) {
                    interestPaidThisMonth =
                            Math.abs(Finance.ppmt(rate, period, numberOfPeriods, loanAmount));
                } else if (INTEREST_COST_TYPE.equals(costType)) {
                    interestPaidThisMonth =
                            Math.abs(Finance.ipmt(rate, period, numberOfPeriods, loanAmount));
                }

                if (FREQUENCY_MONTH.equals(frequency)) {
                    scheduledCost.setAmountExpense(interestPaidThisMonth);
                    scheduledCost.setAmountExpenseBaseBudget(interestPaidThisMonth);
                    scheduledCost.setAmountExpenseBasePayment(interestPaidThisMonth);
                    scheduledCost.setAmountExpenseTotalPayment(interestPaidThisMonth);

                    currentDueDate.add(Calendar.MONTH, 1);
                    scheduledCost.setDateDue(new Date(currentDueDate.getTimeInMillis()));

                    this.helper.saveScheduledCost(scheduledCost);
                }

                period++;
                interestPaidThisYear += interestPaidThisMonth;
            }

            if (FREQUENCY_YEAR.equals(frequency)) {
                // Multiply the result by -1 as the resulting values should be positive but placed
                // in the Amount - Expense column.
                scheduledCost.setAmountExpense(interestPaidThisYear);
                scheduledCost.setAmountExpenseBaseBudget(interestPaidThisYear);
                scheduledCost.setAmountExpenseBasePayment(interestPaidThisYear);
                scheduledCost.setAmountExpenseTotalPayment(interestPaidThisYear);

                currentDueDate.add(Calendar.YEAR, 1);
                scheduledCost.setDateDue(new Date(currentDueDate.getTimeInMillis()));

                this.helper.saveScheduledCost(scheduledCost);
            }
        }
    }

    /**
     * If there are subloans for the selected asset copy info from main loan finanal_params record
     * into subloan records. Return the list of subloan records for the selected asset.
     *
     * @param assetType 'bl', 'pr', 'proj' or 'eq'
     * @param mainLoanRecord finanal_params record from the form
     * @return list of subloans records
     */
    public List<DataRecord> getSubloanRecords(final String assetType,
            final DataRecord mainLoanRecord) {
        final List<DataRecord> result = new ArrayList<DataRecord>();

        final DataSource finanalParamsDs =
                DataSourceFactory.createDataSourceForFields(FINANAL_PARAMS,
                    new String[] { AUTO_NUMBER, BL_ID, PR_ID, EQ_ID, PROJECT_ID, SUB_LOAN,
                            LOAN_AMOUNT, DOWN_PAYMENT, LOAN_RATE, LOAN_TERM, DATE_LOAN_START,
                            PLANNED_LIFE });
        if (ASSET_TYPE_BL.equals(assetType)) {
            finanalParamsDs.addRestriction(new Restrictions.Restriction.Clause(FINANAL_PARAMS,
                BL_ID, mainLoanRecord.getString(FINANAL_PARAMS + DOT + BL_ID),
                Restrictions.OP_EQUALS));
        } else if (ASSET_TYPE_PR.equals(assetType)) {
            finanalParamsDs.addRestriction(new Restrictions.Restriction.Clause(FINANAL_PARAMS,
                PR_ID, mainLoanRecord.getString(FINANAL_PARAMS + DOT + PR_ID),
                Restrictions.OP_EQUALS));
        } else if (ASSET_TYPE_EQ.equals(assetType)) {
            finanalParamsDs.addRestriction(new Restrictions.Restriction.Clause(FINANAL_PARAMS,
                EQ_ID, mainLoanRecord.getString(FINANAL_PARAMS + DOT + EQ_ID),
                Restrictions.OP_EQUALS));
        } else if (ASSET_TYPE_PROJ.equals(assetType)) {
            finanalParamsDs.addRestriction(new Restrictions.Restriction.Clause(FINANAL_PARAMS,
                PROJECT_ID, mainLoanRecord.getString(FINANAL_PARAMS + DOT + PROJECT_ID),
                Restrictions.OP_EQUALS));
        }

        finanalParamsDs.addRestriction(new Restrictions.Restriction.Clause(FINANAL_PARAMS, SUB_LOAN,
            1, Restrictions.OP_EQUALS));

        final List<DataRecord> subloanRecords = finanalParamsDs.getRecords();

        for (int i = 0; i < subloanRecords.size(); i++) {
            final DataRecord subloanRecord = subloanRecords.get(i);

            subloanRecord.setValue(FINANAL_PARAMS + DOT + PLANNED_LIFE,
                mainLoanRecord.getInt(FINANAL_PARAMS + DOT + PLANNED_LIFE));

            result.add(subloanRecord);
        }

        return result;
    }
}
