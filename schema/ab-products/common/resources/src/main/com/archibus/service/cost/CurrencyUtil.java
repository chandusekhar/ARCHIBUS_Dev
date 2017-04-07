package com.archibus.service.cost;

import java.util.*;

import com.archibus.app.common.finance.domain.Cost;
import com.archibus.context.*;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.JobStatus;
import com.archibus.model.config.ExchangeRateType;
import com.archibus.utility.ExceptionBase;

import edu.umd.cs.findbugs.annotations.SuppressWarnings;

/**
 *
 * Utility class. Provides helper methods for multi-currency.
 * <p>
 *
 *
 * @author Ioan Draghici
 * @since 21.2
 *
 */
public final class CurrencyUtil {

    /**
     * Message.
     */
    // @translatable
    private static final String MESSAGE_UPDATE_LEGACY_COSTS =
            "You must run &quot;Updates to Legacy Costs&quot; from &quot;Define Exchange Rates&quot; or contact an Administrator.";

    /**
     * Constant.
     */
    private static final int TEN = 10;

    /**
     * Constant.
     */
    private static final int FORTY = 40;

    /**
     * Constant.
     */
    private static final int SEVENTY = 70;

    /**
     * Localized error message.
     */
    private static String errorDetails = "";

    /**
     * Hide default constructor for this utility class - should never be instantiated.
     */
    private CurrencyUtil() {
    }

    /**
     * Returns true if is required to run update legacy data.
     *
     * @return boolean
     */
    public static boolean isLegacyDataUpdateRequired() {
        final boolean result = isCostWithoutCurrencyInTable(DbConstants.COST_TRAN_TABLE)
                || isCostWithoutCurrencyInTable(DbConstants.COST_TRAN_TABLE)
                || isCostWithoutCurrencyInTable(DbConstants.COST_TRAN_RECUR_TABLE);
        if (result) {
            errorDetails = getLocalizedMessage(MESSAGE_UPDATE_LEGACY_COSTS);
        }
        return result;
    }

    /**
     * Update all cost records that don't have currencies defined (currency_budget and
     * currency_payment are null).
     *
     * @param jobStatus job status
     */
    public static void applyCurrencyUpdatesToLegacyData(final JobStatus jobStatus) {
        jobStatus.setTotalNumber(Constants.ONE_HUNDRED);
        jobStatus.setCurrentNumber(TEN);
        final User loggedUser = ContextStore.get().getUser();
        final String budgetCurrency = ContextStore.get().getProject().getBudgetCurrency().getCode();
        applyCurrencyUpdatesToLegacyDataForTable(DbConstants.COST_TRAN_TABLE, budgetCurrency,
            loggedUser.getCountry());
        jobStatus.setCurrentNumber(FORTY);
        applyCurrencyUpdatesToLegacyDataForTable(DbConstants.COST_TRAN_SCHED_TABLE, budgetCurrency,
            loggedUser.getCountry());
        jobStatus.setCurrentNumber(SEVENTY);
        applyCurrencyUpdatesToLegacyDataForTable(DbConstants.COST_TRAN_RECUR_TABLE, budgetCurrency,
            loggedUser.getCountry());
        jobStatus.setCode(JobStatus.JOB_COMPLETE);
        jobStatus.setCurrentNumber(Constants.ONE_HUNDRED);
    }

    /**
     * Convert cost amounts to budget currency.
     *
     * @param cost cost object
     * @param convertDate convert date
     * @param currencyBudget budget currency
     * @param exchangeRates object with all exchange rates to budget currency
     * @throws ExceptionBase if exchange rate is not defined
     */
    public static void convertCostToBudget(final Cost cost, final Date convertDate,
            final String currencyBudget, final ExchangeRateUtil exchangeRates)
                    throws ExceptionBase {
        final String currencyPayment = cost.getCurrencyPayment();
        double exchangeRateOverride = cost.getExchangeRateOverride();
        final boolean isExchangeRateOverride = !(exchangeRateOverride == 1.0);
        if (currencyPayment.equals(currencyBudget)) {
            exchangeRateOverride = 1.0;
        }
        cost.setCurrencyBudget(currencyBudget);
        if (isExchangeRateOverride || currencyPayment.equals(currencyBudget)) {
            cost.setDateUsedForMcBudget(convertDate);
            cost.setDateUsedForMcPayment(convertDate);
            cost.setExchangeRateBudget(exchangeRateOverride);
            cost.setExchangeRatePayment(exchangeRateOverride);
            applyExchangeRatesToCost(cost, exchangeRateOverride);
        } else {
            final double exchangeRateBudget = exchangeRates.getExchangeRateForCurrencyAndDate(
                currencyPayment, ExchangeRateType.BUDGET, convertDate);
            final Date dateUsedForMcBudget = exchangeRates.getExchangeRateDate();
            final double exchangeRatePayment = exchangeRates.getExchangeRateForCurrencyAndDate(
                currencyPayment, ExchangeRateType.PAYMENT, convertDate);
            final Date dateUsedForMcPayment = exchangeRates.getExchangeRateDate();

            cost.setDateUsedForMcBudget(dateUsedForMcBudget);
            cost.setDateUsedForMcPayment(dateUsedForMcPayment);
            cost.setExchangeRateBudget(exchangeRateBudget);
            cost.setExchangeRatePayment(exchangeRatePayment);
            applyExchangeRatesToCost(cost, exchangeRateBudget);
        }
    }

    /**
     * Convert cost amounts to budget currency using cost exchange rates.
     *
     * @param cost cost object
     */
    public static void convertCostToBudget(final Cost cost) {
        final String currencyPayment = cost.getCurrencyPayment();
        final String currencyBudget = cost.getCurrencyBudget();
        double exchangeRateOverride = cost.getExchangeRateOverride();
        final boolean isExchangeRateOverride = !(exchangeRateOverride == 1.0);
        if (currencyPayment.equals(currencyBudget)) {
            exchangeRateOverride = 1.0;
        }
        if (isExchangeRateOverride || currencyPayment.equals(currencyBudget)) {
            cost.setExchangeRateBudget(exchangeRateOverride);
            cost.setExchangeRatePayment(exchangeRateOverride);
            applyExchangeRatesToCost(cost, exchangeRateOverride);
        } else {
            applyExchangeRatesToCost(cost, cost.getExchangeRateBudget());
        }
    }

    /**
     * Returns localized error details.
     *
     * @return String
     */
    public static String getErrorDetails() {
        return errorDetails;
    }

    /**
     * Return localized string.
     *
     * @param message message id
     * @return localized string
     */
    private static String getLocalizedMessage(final String message) {
        return EventHandlerBase.localizeString(ContextStore.get().getEventHandlerContext(), message,
            "com.archibus.service.cost.CurrencyUtil");
    }

    /**
     * Check if exists costs without currency in cost table.
     *
     * @param table cost table name
     * @return boolean
     */
    private static boolean isCostWithoutCurrencyInTable(final String table) {
        final DataSource dataSource = DataSourceFactory.createDataSourceForFields(table,
            new String[] { DbConstants.CURRENCY_BUDGET, DbConstants.CURRENCY_PAYMENT });
        dataSource
            .addRestriction(Restrictions.or(Restrictions.isNull(table, DbConstants.CURRENCY_BUDGET),
                Restrictions.isNull(table, DbConstants.CURRENCY_PAYMENT)));
        final List<DataRecord> records = dataSource.getRecords();
        return !records.isEmpty();
    }

    /**
     * Apply currency updates to legacy data for cost table.
     *
     * @param tableName table name
     * @param currencyCode currency code
     * @param countryCode country code
     *
     *            <p>
     *            Suppress PMD.AvoidUsingSql
     *            <p>
     *            Justification Case #2: Bulk Update
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    private static void applyCurrencyUpdatesToLegacyDataForTable(final String tableName,
            final String currencyCode, final String countryCode) {
        final String sqlUpdatePattern =
                "UPDATE %s " + " SET currency_budget = '%s' , currency_payment = '%s' "
                        + ", exchange_rate_budget = 1, exchange_rate_payment = 1, date_used_for_mc_budget = ${sql.currentDate}, "
                        + "date_used_for_mc_payment = ${sql.currentDate}, ctry_id = '%s' "
                        + ", amount_income_base_budget = amount_income, "
                        + "amount_expense_base_budget = amount_expense, "
                        + "amount_income_vat_budget = 0, amount_expense_vat_budget = 0, "
                        + "amount_income_total_payment = amount_income, "
                        + "amount_expense_total_payment = amount_expense, "
                        + "amount_income_base_payment = amount_income, "
                        + "amount_expense_base_payment = amount_expense, "
                        + "amount_income_vat_payment = 0, amount_expense_vat_payment = 0, "
                        + "exchange_rate_override = 1, vat_percent_value = 0, "
                        + "vat_percent_override = 0, vat_amount_override = 0 "
                        + "WHERE currency_budget IS NULL AND currency_payment IS NULL";
        final String sqlUpdate =
                String.format(sqlUpdatePattern, tableName, currencyCode, currencyCode, countryCode);
        SqlUtils.executeUpdate(tableName, sqlUpdate);
    }

    /**
     * Apply exchange rate to cost.
     *
     * @param cost cost object
     * @param exchangeRate exchange rate
     */
    private static void applyExchangeRatesToCost(final Cost cost, final Double exchangeRate) {
        cost.setAmountIncome(cost.getAmountIncomeTotalPayment() * exchangeRate);
        cost.setAmountExpense(cost.getAmountExpenseTotalPayment() * exchangeRate);

        cost.setAmountIncomeBaseBudget(cost.getAmountIncomeBasePayment() * exchangeRate);
        cost.setAmountExpenseBaseBudget(cost.getAmountExpenseBasePayment() * exchangeRate);

        cost.setAmountIncomeVatBudget(cost.getAmountIncomeVatPayment() * exchangeRate);
        cost.setAmountExpenseVatBudget(cost.getAmountExpenseVatPayment() * exchangeRate);
    }
}
