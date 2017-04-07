package com.archibus.service.cost;

import java.math.BigDecimal;
import java.util.*;

import com.archibus.app.common.finance.domain.*;
import com.archibus.context.ContextStore;
import com.archibus.datasource.SqlUtils;
import com.archibus.model.config.ExchangeRateType;
import com.archibus.service.Period;
import com.archibus.service.cost.SummarizeCosts.CostField;
import com.archibus.service.cost.SummarizeCosts.SummaryType;
import com.archibus.service.cost.VatUtil.VatCost;
import com.archibus.utility.StringUtil;

/**
 *
 * Helper class for Summarize Costs.
 * <p>
 *
 *
 * @author Ioan Draghici
 * @since 21.2
 *
 */
public final class SummarizeCostsHelper {

    /**
     * Constant.
     */
    private static final String UNDERSCORE = "_";

    /**
     * Constant.
     */
    private static final String ASSET_KEY = "\\{asset_key\\}";

    /**
     * Constant.
     */
    private static final String RESTRICTION = "\\{restriction\\}";

    /**
     * Constant.
     */
    private static final String USER_RESTRICTION = "\\{user_restriction\\}";

    /**
     * Constant.
     */
    private static final String FIELD_NAME = "\\{field_name\\}";

    /**
     * Constant.
     */
    private static final String TABLE_NAME = "\\{table_name\\}";

    /**
     * Constant.
     */
    private static final String DOLLAR_SIGN = "\\$";

    /**
     * Constant.
     */
    private static final String DOLLAR_SIGN_CHAR = "\\\\\\$";

    /**
     * Hide default constructor for this utility class - should never be instantiated.
     */
    private SummarizeCostsHelper() {
    }

    /**
     * Returns sql restriction for costs.
     *
     * @param summaryType summary type
     * @param assetKey asset key
     * @param assetIds list with asset id's
     * @param costField cost field
     * @param costTable cost table
     * @param startDate start date
     * @param endDate end date
     * @return string
     */
    public static String getCostRestriction(final SummaryType summaryType, final String assetKey,
            final List<String> assetIds, final CostField costField, final String costTable,
            final Date startDate, final Date endDate) {
        final String assetRestriction = getInClause(assetIds);
        String sqlString = costTable + Constants.DOT + assetKey + assetRestriction;
        if (SummaryType.CAM_RECONCILIATION.equals(summaryType)) {
            sqlString +=
                    getCamCostRestriction(assetRestriction, costField.getCostTypeRestriction(),
                        costTable, startDate, endDate);
        } else {
            sqlString +=
                    Constants.AND
                    + SummarizeCostsHelper.getCostCategoryRestriction(costTable,
                        costField.getCostTypeRestriction());

            if (StringUtil.notNullOrEmpty(startDate) && StringUtil.notNullOrEmpty(endDate)) {
                sqlString +=
                        Constants.AND
                        + SummarizeCostsHelper.getDateRestriction(costTable, startDate,
                            endDate);
            }
            if (DbConstants.COST_TRAN_RECUR_TABLE.equals(costTable)) {
                sqlString += "  AND cost_tran_recur.status_active = 1 ";
            }
        }
        return sqlString;
    }

    /**
     * Get cost restriction for CAM Reconciliation.
     *
     * @param assetRestriction asset id restriction string
     * @param costCategory cost category
     * @param costTable cost table
     * @param startDate start date
     * @param endDate end date
     * @return string
     */
    public static String getCamCostRestriction(final String assetRestriction,
            final String costCategory, final String costTable, final Date startDate,
            final Date endDate) {
        String sqlString = null;
        final String formmatedCostCateg = costCategory.replaceAll(Constants.COMMA, "','");
        final Calendar calendar = Calendar.getInstance();
        calendar.setTime(startDate);
        if (DbConstants.COST_TRAN_RECUR_TABLE.equals(costTable)) {
            sqlString =
                    " AND cost_tran_recur.cost_cat_id IN ('" + formmatedCostCateg + "') AND "
                            + getDateRestriction(costTable, startDate, endDate);

        } else if (DbConstants.COST_TRAN_SCHED_TABLE.equals(costTable)) {
            sqlString =
                    " AND cost_tran_sched.cost_cat_id IN ('"
                            + formmatedCostCateg
                            + "') AND ( EXISTS(SELECT ls_cam_rec_report.ls_cam_rec_report_id FROM ls_cam_rec_report WHERE ls_cam_rec_report.ls_id "
                            + assetRestriction
                            + " AND ls_cam_rec_report.cost_tran_sched_id = cost_tran_sched.cost_tran_sched_id AND ls_cam_rec_report.ls_rent_year = "
                            + SqlUtils.formatValueForSql(calendar.get(Calendar.YEAR))
                            + " ) OR ( NOT EXISTS(SELECT ls_cam_rec_report.ls_cam_rec_report_id FROM ls_cam_rec_report WHERE ls_cam_rec_report.ls_id "
                            + assetRestriction
                            + " AND ls_cam_rec_report.cost_tran_sched_id = cost_tran_sched.cost_tran_sched_id) AND "
                            + getDateRestriction(costTable, startDate, endDate) + "))";
        } else if (DbConstants.COST_TRAN_TABLE.equals(costTable)) {
            sqlString =
                    " AND cost_tran.cost_cat_id IN ('"
                            + formmatedCostCateg
                            + "') AND (EXISTS(SELECT ls_cam_rec_report.ls_cam_rec_report_id FROM ls_cam_rec_report WHERE ls_cam_rec_report.ls_id "
                            + assetRestriction
                            + " AND ls_cam_rec_report.cost_tran_id = cost_tran.cost_tran_id AND ls_cam_rec_report.ls_rent_year = "
                            + SqlUtils.formatValueForSql(calendar.get(Calendar.YEAR))
                            + " ) OR (NOT EXISTS(SELECT ls_cam_rec_report.ls_cam_rec_report_id FROM ls_cam_rec_report WHERE ls_cam_rec_report.ls_id "
                            + assetRestriction
                            + " AND ls_cam_rec_report.cost_tran_id = cost_tran.cost_tran_id ) AND "
                            + getDateRestriction(costTable, startDate, endDate) + ")) ";
        }
        return sqlString;
    }

    /**
     * Returns cost category restriction string.
     *
     * @param costTable cost table
     * @param costTypeRestriction cost type restriction
     * @return String
     */
    public static String getCostCategoryRestriction(final String costTable,
            final String costTypeRestriction) {
        return "EXISTS(SELECT cost_cat.cost_cat_id FROM cost_cat WHERE cost_cat.cost_cat_id = "
                + costTable + ".cost_cat_id AND " + costTypeRestriction + " )";
    }

    /**
     * Returns date restriction.
     *
     * @param costTable cost table
     * @param dateStart date start
     * @param dateEnd date end
     * @return string
     */
    public static String getDateRestriction(final String costTable, final Date dateStart,
            final Date dateEnd) {
        String result = "";
        if (DbConstants.COST_TRAN_RECUR_TABLE.equals(costTable)) {
            result =
                    "cost_tran_recur.date_start <= " + SqlUtils.formatValueForSql(dateEnd)
                    + " AND (cost_tran_recur.date_end >= "
                    + SqlUtils.formatValueForSql(dateStart)
                    + " OR cost_tran_recur.date_end IS NULL) ";
        } else {
            final String dateField =
                    "${sql.isNull('" + costTable + ".date_paid', '" + costTable + ".date_due')}";
            result =
                    dateField + " >= " + SqlUtils.formatValueForSql(dateStart) + " AND  "
                            + dateField + " <= " + SqlUtils.formatValueForSql(dateEnd);
        }
        return result;
    }

    /**
     * Summarize actual or scheduled cost on database in buffer table.
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
        final String summarizeOnBuffer =
                prepareSummaryStatement(DbConstants.CCOST_SUM_TABLE, costTable, costField,
                    assetIds, type, assetKey, parameters);
        SqlUtils.executeUpdate(DbConstants.CCOST_SUM_TABLE, summarizeOnBuffer);

        if (!SummaryType.CAM_RECONCILIATION.equals(type)) {
            final RequestParameters tmpParameters = getBudgetRequestParameters(parameters);
            final String summarizeOnAsset =
                    prepareSummaryStatement(assetTable, costTable, costField, assetIds, type,
                        assetKey, tmpParameters);
            SqlUtils.executeUpdate(assetTable, summarizeOnAsset);
        }

    }

    /**
     * Summarize actuals cost for cost field and update cost values into database.
     *
     * @param costField cost field
     * @param costs list of recurring costs
     * @param type summary type
     * @param assetTable asset table name
     * @param assetKey asset key field
     * @param assetIds list with asset ids
     * @param parameters request parameters
     * @param exchangeRateUtil exchange rate util object
     */
    public static void summarizeRecurringCosts(final CostField costField,
            final List<RecurringCost> costs, final SummaryType type, final String assetTable,
            final String assetKey, final List<String> assetIds, final RequestParameters parameters,
            final ExchangeRateUtil exchangeRateUtil) {
        // Load budget exchange rates
        final String budgetCurrency = ContextStore.get().getProject().getBudgetCurrency().getCode();
        final ExchangeRateUtil budgetExchangeRates =
                new ExchangeRateUtil(parameters.isMcAndVatEnabled(), budgetCurrency,
                    ExchangeRateType.BUDGET);
        budgetExchangeRates.loadExchangeRates();

        final RequestParameters tmpRequestParameters = getBudgetRequestParameters(parameters);

        final ExchangeRateUtil tmpExchangeRateUtil =
                loadExchangeRates(parameters.isMcAndVatEnabled(), budgetCurrency,
                    parameters.getExchangeRateType());

        final Iterator<RecurringCost> itCosts = costs.iterator();
        while (itCosts.hasNext()) {
            final RecurringCost recurringCost = itCosts.next();
            final String assetId = recurringCost.getFieldValue(assetKey);
            final Map<String, Double> costValues = new HashMap<String, Double>();
            final Map<String, Double> tmpCostValues = new HashMap<String, Double>();
            final List<ScheduledCost> projection =
                    createCostProjection(recurringCost, parameters, parameters.isMcAndVatEnabled(),
                        budgetExchangeRates, false);
            for (final ScheduledCost scheduledCost : projection) {
                summarizeCost(costField, costValues, scheduledCost, parameters,
                    parameters.isMcAndVatEnabled(), exchangeRateUtil);
                if (!SummaryType.CAM_RECONCILIATION.equals(type)) {
                    summarizeCost(costField, tmpCostValues, scheduledCost, tmpRequestParameters,
                        tmpRequestParameters.isMcAndVatEnabled(), tmpExchangeRateUtil);
                }
            }

            updateCostOnTable(DbConstants.CCOST_SUM_TABLE, type, assetKey, costField, parameters,
                assetId, costValues);
            if (!SummaryType.CAM_RECONCILIATION.equals(type)) {
                updateCostOnTable(assetTable, type, assetKey, costField, tmpRequestParameters,
                    assetId, tmpCostValues);
            }
        }
    }

    /**
     * Summarize actuals cost for cost field.
     *
     * @param costField cost field
     * @param summarizedValues object with summarized values
     * @param costs list of recurring costs
     * @param parameters request parameters
     * @param isMcAndVatEnabled if MC & VAT is enabled
     * @param exchangeRateUtil exchange rate util object
     * @param onEntireDuration boolean if cost are summarized for entire lease duration
     */
    public static void summarizeRecurringCosts(final CostField costField,
            final Map<String, Double> summarizedValues, final List<RecurringCost> costs,
            final RequestParameters parameters, final boolean isMcAndVatEnabled,
            final ExchangeRateUtil exchangeRateUtil, final boolean onEntireDuration) {
        // Load budget exchange rates
        final String budgetCurrency = ContextStore.get().getProject().getBudgetCurrency().getCode();
        final ExchangeRateUtil budgetExchangeRates =
                new ExchangeRateUtil(parameters.isMcAndVatEnabled(), budgetCurrency,
                    ExchangeRateType.BUDGET);
        budgetExchangeRates.loadExchangeRates();
        final boolean isForSLR = parameters.getBooleanValue(Constants.IS_FOR_SLR);
        final Iterator<RecurringCost> itCosts = costs.iterator();
        while (itCosts.hasNext()) {
            final RecurringCost recurringCost = itCosts.next();
            final List<ScheduledCost> projection =
                    isForSLR ? createCostProjection2(recurringCost, parameters, isMcAndVatEnabled,
                        budgetExchangeRates, onEntireDuration) : createCostProjection(
                        recurringCost, parameters, isMcAndVatEnabled, budgetExchangeRates,
                        onEntireDuration);
            summarizeScheduledCosts(costField, summarizedValues, projection, parameters,
                        isMcAndVatEnabled, exchangeRateUtil);
        }
    }

    /**
     * Add asset records into buffer table.
     *
     * @param userName user name
     * @param type report type
     * @param assetTable asset table
     * @param assetKey asset primary key
     * @param assetIds list with asset is's
     * @param parameters request parameters
     *
     */
    public static void addAssetsToBufferTable(final String userName, final SummaryType type,
            final String assetTable, final String assetKey, final List<String> assetIds,
            final RequestParameters parameters) {
        String insertStatement =
                "INSERT INTO ccost_sum (user_name, report_name, {asset_key} {date_field}) SELECT {user_name}, {report_type}, {asset_key} {date_value} FROM {asset_table} WHERE {restriction}";
        insertStatement =
                insertStatement.replaceAll("\\{user_name\\}", SqlUtils.formatValueForSql(userName));
        insertStatement =
                insertStatement.replaceAll("\\{report_type\\}",
                    SqlUtils.formatValueForSql(type.toString()));
        insertStatement = insertStatement.replaceAll(ASSET_KEY, assetKey);
        insertStatement = insertStatement.replaceAll("\\{asset_table\\}", assetTable);
        final String dateField =
                SummaryType.CAM_RECONCILIATION.equals(type) ? Constants.COMMA
                        + DbConstants.DATE_COSTS_LAST_CALCD : "";
        final String dateValue =
                SummaryType.CAM_RECONCILIATION.equals(type) ? Constants.COMMA
                        + SqlUtils.formatValueForSql(parameters.getDateStart()) : "";
                        insertStatement = insertStatement.replaceAll("\\{date_field\\}", dateField);
                        insertStatement = insertStatement.replaceAll("\\{date_value\\}", dateValue);

                        final String restriction = assetTable + Constants.DOT + assetKey + getInClause(assetIds);
                        insertStatement = insertStatement.replaceAll(RESTRICTION, restriction);
                        SqlUtils.executeUpdate(DbConstants.CCOST_SUM_TABLE, insertStatement);
    }

    /**
     * Summarize actual costs for cost field.
     *
     * @param costField cost field
     * @param summarizedValues object with summarized values
     * @param costs list of actual costs
     * @param parameters request parameters
     * @param isMcAndVatEnabled if MC & VAT is enabled
     * @param exchangeRateUtil exchange rate util object
     */
    public static void summarizeActualCosts(final CostField costField,
            final Map<String, Double> summarizedValues, final List<ActualCost> costs,
            final RequestParameters parameters, final boolean isMcAndVatEnabled,
            final ExchangeRateUtil exchangeRateUtil) {
        final Iterator<ActualCost> itCosts = costs.iterator();
        while (itCosts.hasNext()) {
            final ActualCost cost = itCosts.next();
            summarizeCost(costField, summarizedValues, cost, parameters, isMcAndVatEnabled,
                exchangeRateUtil);
        }
    }

    /**
     * Summarize actuals cost for cost field.
     *
     * @param costField cost field
     * @param summarizedValues object with summarized values
     * @param costs list of scheduled costs
     * @param parameters request parameters
     * @param isMcAndVatEnabled if MC & VAT is enabled
     * @param exchangeRateUtil exchange rate util object
     */
    public static void summarizeScheduledCosts(final CostField costField,
            final Map<String, Double> summarizedValues, final List<ScheduledCost> costs,
            final RequestParameters parameters, final boolean isMcAndVatEnabled,
            final ExchangeRateUtil exchangeRateUtil) {
        final Iterator<ScheduledCost> itCosts = costs.iterator();
        while (itCosts.hasNext()) {
            final ScheduledCost cost = itCosts.next();
            summarizeCost(costField, summarizedValues, cost, parameters, isMcAndVatEnabled,
                exchangeRateUtil);
        }
    }

    /**
     * Reset cost field value.
     *
     * @param assetTable asset table
     * @param fieldName cost field name
     * @param assetKey asset key
     * @param assetIds list with asset id's
     */
    public static void resetFieldValue(final String assetTable, final String fieldName,
            final String assetKey, final List<String> assetIds) {
        final String sqlUpdate =
                "UPDATE  " + assetTable + " SET " + fieldName + " = 0.0 WHERE " + assetKey
                + getInClause(assetIds);
        SqlUtils.executeUpdate(assetTable, sqlUpdate);
    }

    /**
     * Set calculation dates.
     *
     * @param assetTable table name
     * @param assetKey field name
     * @param assetIds selected items
     * @param parameters request parameters
     */
    public static void setCalcDate(final String assetTable, final String assetKey,
            final List<String> assetIds, final RequestParameters parameters) {
        String sqlUpdate =
                "UPDATE " + assetTable + " SET date_costs_last_calcd = "
                        + SqlUtils.formatValueForSql(new Date());
        if (DbConstants.LS_TABLE.equals(assetTable)) {
            sqlUpdate +=
                    ", date_cost_anal_start = "
                            + SqlUtils.formatValueForSql(parameters.getDateStart())
                            + ", date_cost_anal_end = "
                            + SqlUtils.formatValueForSql(parameters.getDateEnd());
        } else {
            sqlUpdate +=
                    ", date_costs_start = " + SqlUtils.formatValueForSql(parameters.getDateStart())
                    + ", date_costs_end = "
                    + SqlUtils.formatValueForSql(parameters.getDateEnd());
        }
        sqlUpdate += " WHERE " + assetKey + getInClause(assetIds);
        SqlUtils.executeUpdate(assetTable, sqlUpdate);
    }

    /**
     * Prepare update statement.
     *
     * @param updateTable update table (buffer or asset table)
     * @param costTable cost table
     * @param costField cost field
     * @param assetIds list with asset id's
     * @param type summary type
     * @param assetKey asset key field
     * @param parameters request parameters
     * @return string
     */
    private static String prepareSummaryStatement(final String updateTable, final String costTable,
            final CostField costField, final List<String> assetIds, final SummaryType type,
            final String assetKey, final RequestParameters parameters) {

        final String updatePattern =
                "UPDATE {table_name} SET {field_name} =  (SELECT {field_name} + {null_fnc}(SUM( ({formula}) * exchange_rate), 0.0) FROM (SELECT ({asset_key}) ${sql.as} {asset_key}, ({amount_income}) ${sql.as} amount_income, ({amount_expense}) ${sql.as} amount_expense, ({exchange_rate}) ${sql.as} exchange_rate FROM {cost_table} WHERE {restriction} )  {cost_table} WHERE {cost_table}.{asset_key} = {table_name}.{asset_key} {user_restriction} )";
        String sqlStatement = updatePattern.replaceAll(TABLE_NAME, updateTable);

        sqlStatement = sqlStatement.replaceAll(FIELD_NAME, costField.getFieldId());
        sqlStatement = sqlStatement.replaceAll(ASSET_KEY, assetKey);
        sqlStatement = sqlStatement.replaceAll("\\{cost_table\\}", costTable);
        String restriction = costTable + Constants.DOT + assetKey + getInClause(assetIds);

        if (SummaryType.CAM_RECONCILIATION.equals(type)) {
            restriction +=
                    getCamCostRestriction(getInClause(assetIds),
                        costField.getCostTypeRestriction(), costTable, parameters.getDateStart(),
                        parameters.getDateEnd());
        } else {
            restriction +=
                    Constants.AND
                    + getCostCategoryRestriction(costTable,
                        costField.getCostTypeRestriction());
            restriction +=
                    Constants.AND
                    + getDateRestriction(costTable, parameters.getDateStart(),
                        parameters.getDateEnd());
        }
        restriction = restriction.replaceAll(DOLLAR_SIGN, DOLLAR_SIGN_CHAR);

        sqlStatement = sqlStatement.replaceAll(RESTRICTION, restriction);
        final String nullFnc = SqlUtils.isOracle() ? "NVL" : "ISNULL";
        sqlStatement = sqlStatement.replaceAll("\\{null_fnc\\}", nullFnc);

        final String amountIncomeField =
                DbConstants.CCOST_SUM_TABLE.equals(updateTable) ? getFieldName(
                    DbConstants.AMOUNT_INCOME, parameters.isMcAndVatEnabled(),
                    parameters.isBudgetCurrency(), parameters.getVatCostType()) : getFieldName(
                        DbConstants.AMOUNT_INCOME, parameters.isMcAndVatEnabled(), true, VatCost.TOTAL);

                    sqlStatement = sqlStatement.replaceAll("\\{amount_income\\}", amountIncomeField);

                    final String amountExpenseField =
                            DbConstants.CCOST_SUM_TABLE.equals(updateTable) ? getFieldName(
                                DbConstants.AMOUNT_EXPENSE, parameters.isMcAndVatEnabled(),
                                parameters.isBudgetCurrency(), parameters.getVatCostType())
                                : getFieldName(DbConstants.AMOUNT_EXPENSE, parameters.isMcAndVatEnabled(),
                                    true, VatCost.TOTAL);

                                sqlStatement = sqlStatement.replaceAll("\\{amount_expense\\}", amountExpenseField);
                                final String dateField = DbConstants.getFieldFullName(costTable, DbConstants.DATE_DUE);
                                final String exchangeRateField =
                                        DbConstants.CCOST_SUM_TABLE.equals(updateTable) ? getExchangeRateFormula(costTable,
                                            parameters.isMcAndVatEnabled(), parameters.isBudgetCurrency(),
                                            parameters.getCurrencyCode(), parameters.getExchangeRateType(), dateField)
                                            : getExchangeRateFormula(costTable, parameters.isMcAndVatEnabled(), true,
                                                ContextStore.get().getProject().getBudgetCurrency().getCode(),
                                                ExchangeRateType.BUDGET.toString(), dateField);
                                        sqlStatement = sqlStatement.replaceAll("\\{exchange_rate\\}", exchangeRateField);

                                        sqlStatement =
                                                sqlStatement.replaceAll("\\{formula\\}", getFormula(costField.getCalcType()));
                                        final String dateRestriction =
                                                SummaryType.CAM_RECONCILIATION.equals(type) ? " AND date_costs_last_calcd = "
                                                        + SqlUtils.formatValueForSql(parameters.getDateStart()) : "";
                                                        final String userRestriction =
                                                                DbConstants.CCOST_SUM_TABLE.equals(updateTable) ? " AND  ccost_sum.report_name = "
                                                                        + SqlUtils.formatValueForSql(type.toString())
                                                                        + " AND  ccost_sum.user_name = "
                                                                        + SqlUtils.formatValueForSql(parameters
                                                                            .getParameterValue(Constants.USER_NAME)) + dateRestriction : "";
                                                        sqlStatement = sqlStatement.replaceAll(USER_RESTRICTION, userRestriction);

                                                        return sqlStatement;
    }

    /**
     * Returns selected field name when MC and Vat is enabled.
     *
     * @param baseName base part of field name
     * @param isMcAndVatEnabled if MC & VAt is enabled
     * @param isBudgetCurrency if is budget currency
     * @param vatCost vat cost type
     * @return string
     */
    private static String getFieldName(final String baseName, final boolean isMcAndVatEnabled,
            final boolean isBudgetCurrency, final VatCost vatCost) {
        String fieldName = baseName;
        if (isMcAndVatEnabled && !(isBudgetCurrency && VatCost.TOTAL.equals(vatCost))) {
            fieldName =
                    baseName + UNDERSCORE + vatCost.toString().toLowerCase() + UNDERSCORE
                    + (isBudgetCurrency ? Constants.BUDGET : Constants.PAYMENT);
        }
        return fieldName;
    }

    /**
     * Returns calculation formula for calculation type.
     *
     * @param calculationType calculation type
     * @return string
     */
    private static String getFormula(final String calculationType) {
        String formula = DbConstants.AMOUNT_INCOME;
        if (CostProjection.CALCTYPE_EXPENSE.equals(calculationType)) {
            formula = "- " + DbConstants.AMOUNT_EXPENSE;
        } else if (CostProjection.CALCTYPE_NETINCOME.equals(calculationType)) {
            formula = DbConstants.AMOUNT_INCOME + " - " + DbConstants.AMOUNT_EXPENSE;
        }
        return formula;
    }

    /**
     * Returns expression for exchange rate.
     *
     * @param tableName table name
     * @param isMcAndVatEnabled is MC and Vat is enabled
     * @param isBudgetCurrency if is budget currency
     * @param currencyCode selected currency code
     * @param exchangeRateType selected exchange rate type
     * @param dateField date field
     * @return string
     */
    private static String getExchangeRateFormula(final String tableName,
            final boolean isMcAndVatEnabled, final boolean isBudgetCurrency,
            final String currencyCode, final String exchangeRateType, final String dateField) {
        String formula = "1.0";
        if (isMcAndVatEnabled) {
            formula =
                    "\\${sql.exchangeRateFromFieldForDate('{field}', '{code}', '{type}', '{date}')}";
            final String currencyField =
                    isBudgetCurrency ? tableName + ".currency_budget" : tableName
                            + ".currency_payment";

            formula = formula.replaceAll("\\{field\\}", currencyField);
            formula = formula.replaceAll("\\{code\\}", currencyCode);
            formula = formula.replaceAll("\\{type\\}", exchangeRateType);
            formula = formula.replaceAll("\\{date\\}", dateField);
        }
        return formula;
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
     * Create cost projection for given recurring cost.
     *
     * @param recurringCost recurring cost
     * @param parameters request parameters
     * @param isMcAndVatEnabled if MC & VAT is enabled
     * @param exchangeRates exchange rates
     * @param onEntireDuration boolean if cost are summarized for entire cost duration
     * @return List<ScheduledCost>
     */
    private static List<ScheduledCost> createCostProjection2(final RecurringCost recurringCost,
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
        recurringPeriod.iterate2(dateFrom, dateTo, new Period.Callback() {
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
     * Add current cost values to summary. Used for actual and scheduled costs.
     *
     * @param costField cost field
     * @param summarizedValues object with summarized values
     * @param cost cost object
     * @param parameters request parameters
     * @param isMcAndVatEnabled if Mc and Vat is enabled
     * @param exchangeRateUtil exchange rates object
     */
    private static void summarizeCost(final CostField costField,
            final Map<String, Double> summarizedValues, final ScheduledCost cost,
            final RequestParameters parameters, final boolean isMcAndVatEnabled,
            final ExchangeRateUtil exchangeRateUtil) {

        BigDecimal budgetAmount = BigDecimal.ZERO;
        BigDecimal baseAmount = BigDecimal.ZERO;
        BigDecimal vatAmount = BigDecimal.ZERO;
        BigDecimal totalAmount = BigDecimal.ZERO;
        if (!summarizedValues.isEmpty()) {
            budgetAmount = new BigDecimal(summarizedValues.get(Constants.BUDGET));
            if (isMcAndVatEnabled) {
                baseAmount = new BigDecimal(summarizedValues.get(VatCost.BASE.toString()));
                vatAmount = new BigDecimal(summarizedValues.get(VatCost.VAT.toString()));
                totalAmount = new BigDecimal(summarizedValues.get(VatCost.TOTAL.toString()));
            }
        }

        final String calculationType = costField.getCalcType();
        // TODO: check date for exchange rate should be cost due date or current date ??
        final BigDecimal exchangeRate =
                getExchangeRate(cost, cost.getDateDue(), parameters, isMcAndVatEnabled,
                    exchangeRateUtil);

        if (!CostProjection.CALCTYPE_EXPENSE.equals(calculationType)) {
            budgetAmount = budgetAmount.add(new BigDecimal(cost.getAmountIncome()));
            final BigDecimal baseIncomeDelta =
                    new BigDecimal(cost.getIncomeAmount(isMcAndVatEnabled,
                        parameters.isBudgetCurrency(), VatCost.BASE));
            final BigDecimal vatIncomeDelta =
                    new BigDecimal(cost.getIncomeAmount(isMcAndVatEnabled,
                        parameters.isBudgetCurrency(), VatCost.VAT));
            final BigDecimal totalIncomeDelta =
                    new BigDecimal(cost.getIncomeAmount(isMcAndVatEnabled,
                        parameters.isBudgetCurrency(), VatCost.TOTAL));

            baseAmount = baseAmount.add(baseIncomeDelta.multiply(exchangeRate));
            vatAmount = vatAmount.add(vatIncomeDelta.multiply(exchangeRate));
            totalAmount = totalAmount.add(totalIncomeDelta.multiply(exchangeRate));
        }

        if (!CostProjection.CALCTYPE_INCOME.equals(calculationType)) {
            budgetAmount = budgetAmount.subtract(new BigDecimal(cost.getAmountExpense()));
            final BigDecimal baseExpenseDelta =
                    new BigDecimal(cost.getExpenseAmount(isMcAndVatEnabled,
                        parameters.isBudgetCurrency(), VatCost.BASE));
            final BigDecimal vatExpenseDelta =
                    new BigDecimal(cost.getExpenseAmount(isMcAndVatEnabled,
                        parameters.isBudgetCurrency(), VatCost.VAT));
            final BigDecimal totalExpenseDelta =
                    new BigDecimal(cost.getExpenseAmount(isMcAndVatEnabled,
                        parameters.isBudgetCurrency(), VatCost.TOTAL));
            baseAmount = baseAmount.subtract(baseExpenseDelta.multiply(exchangeRate));
            vatAmount = vatAmount.subtract(vatExpenseDelta.multiply(exchangeRate));
            totalAmount = totalAmount.subtract(totalExpenseDelta.multiply(exchangeRate));
        }

        summarizedValues.put(Constants.BUDGET, budgetAmount.doubleValue());
        if (isMcAndVatEnabled) {
            summarizedValues.put(VatCost.BASE.toString(), baseAmount.doubleValue());
            summarizedValues.put(VatCost.VAT.toString(), vatAmount.doubleValue());
            summarizedValues.put(VatCost.TOTAL.toString(), totalAmount.doubleValue());
        }

    }

    /**
     * Returns exchange rate for cost and date.
     *
     * @param cost cost object
     * @param exchangeDate cost date
     * @param parameters request parameters
     * @param isMcAndVatEnabled if Mc And Vat is enabled.
     * @param exchangeRateUtil exchange rates
     * @return BigDecimal
     */
    private static BigDecimal getExchangeRate(final Cost cost, final Date exchangeDate,
            final RequestParameters parameters, final boolean isMcAndVatEnabled,
            final ExchangeRateUtil exchangeRateUtil) {
        BigDecimal exchangeRate = BigDecimal.ONE;
        final String currency =
                parameters.isBudgetCurrency() ? cost.getCurrencyBudget() : cost
                        .getCurrencyPayment();
                if (isMcAndVatEnabled && !parameters.getCurrencyCode().equals(currency)) {
                    final ExchangeRateType exchangeRateType =
                            ExchangeRateType.fromString(parameters.getExchangeRateType());
                    exchangeRate =
                            new BigDecimal(exchangeRateUtil.getExchangeRateForCurrencyAndDate(currency,
                                exchangeRateType, exchangeDate));
                }
                return exchangeRate;
    }

    /**
     * Get IN clause for specified list.
     *
     * @param assetIds list with id's
     * @return string
     */
    private static String getInClause(final List<String> assetIds) {
        String restriction = " IN (";
        for (final String assetId : assetIds) {
            restriction += SqlUtils.formatValueForSql(assetId) + Constants.COMMA;
        }
        restriction = restriction.substring(0, restriction.length() - 1) + ")";
        return restriction;
    }

    /**
     * Update cost value on specified table.
     *
     * @param updateTable update table
     * @param type summary type
     * @param assetKey asset key
     * @param costField cost field
     * @param parameters request parameters
     * @param assetId asset id
     * @param costValues cost values
     */
    private static void updateCostOnTable(final String updateTable, final SummaryType type,
            final String assetKey, final CostField costField, final RequestParameters parameters,
            final String assetId, final Map<String, Double> costValues) {
        boolean isUpdateOn = true;
        if (StringUtil.isNullOrEmpty(assetId)
                || costValues.isEmpty()
                || (SummaryType.CAM_RECONCILIATION.equals(type) && !DbConstants.CCOST_SUM_TABLE
                        .equals(updateTable))) {
            isUpdateOn = false;
        }

        if (isUpdateOn) {
            String updateStatement =
                    "UPDATE {table_name} SET {field_name} = {field_name} + {cost_value} WHERE {table_name}.{asset_key} = {asset_id} {user_restriction}";
            updateStatement = updateStatement.replaceAll(TABLE_NAME, updateTable);
            updateStatement = updateStatement.replaceAll(FIELD_NAME, costField.getFieldId());
            updateStatement = updateStatement.replaceAll(ASSET_KEY, assetKey);
            updateStatement =
                    updateStatement.replaceAll("\\{asset_id\\}",
                        SqlUtils.formatValueForSql(assetId));

            final String userRestriction =
                    DbConstants.CCOST_SUM_TABLE.equals(updateTable) ? " AND ccost_sum.report_name = "
                            + SqlUtils.formatValueForSql(type.toString())
                            + " AND ccost_sum.user_name = "
                            + SqlUtils.formatValueForSql(parameters
                                .getParameterValue(Constants.USER_NAME))
                                + (SummaryType.CAM_RECONCILIATION.equals(type) ? " AND date_costs_last_calcd = "
                                        + SqlUtils.formatValueForSql(parameters.getDateStart())
                                        : "")
                                        : "";
            updateStatement = updateStatement.replaceAll(USER_RESTRICTION, userRestriction);
            final Double costValue =
                                                DbConstants.CCOST_SUM_TABLE.equals(updateTable)
                                                && parameters.isMcAndVatEnabled() ? costValues.get(parameters
                                                    .getVatCostType().toString()) : costValues.get(Constants.BUDGET);
                                                updateStatement =
                                                        updateStatement.replaceAll("\\{cost_value\\}",
                                                            SqlUtils.formatValueForSql(costValue));

                                                SqlUtils.executeUpdate(updateTable, updateStatement);
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
