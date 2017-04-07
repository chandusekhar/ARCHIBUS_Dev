package com.archibus.service.cost;

import java.math.BigDecimal;
import java.util.*;

import com.archibus.app.common.finance.dao.ICostDao;
import com.archibus.app.common.finance.domain.RecurringCost;
import com.archibus.config.ContextCacheable;
import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.*;
import com.archibus.jobmanager.JobStatus.JobResult;
import com.archibus.model.config.ExchangeRateType;
import com.archibus.service.Period;
import com.archibus.service.cost.VatUtil.VatCost;
import com.archibus.utility.StringUtil;

/**
 * Creates cash flow or financial projections from costs.
 * 
 * <p>
 * History:
 * <li>Web Central 17.3: Initial implementation, ported from lssup.abs.
 * 
 * @author Sergey Kuramshin
 */
public class CreateCostProjection {
    
    // ----------------------- constants ----------------------------------------------------------
    
    public static final String PROJECTION_ACCOUNT = "ac";
    
    public static final String PROJECTION_BUILDING = "bl";
    
    public static final String PROJECTION_DEPARTMENT = "dp";
    
    public static final String PROJECTION_LEASE = "ls";
    
    public static final String PROJECTION_LEASE_FOR_BUILDING = "lsBl";
    
    public static final String PROJECTION_LEASE_FOR_PROPERTY = "lsPr";
    
    public static final String PROJECTION_PROPERTY = "pr";
    
    public static final String PROJECTION_TAXES = "taxes";
    
    /**
     * Map<String projectionType, String assetKey>
     */
    static private Map<String, String> assetKeysByProjectionType = new HashMap<String, String>();
    
    // @translatable
    private static final String MESSAGE_PROCESSING_ACTUAL_COSTS = "Processing actual costs";
    
    // @translatable
    private static final String MESSAGE_PROCESSING_RECURRING_COSTS = "Processing recurring costs";
    
    // ----------------------- business methods ---------------------------------------------------
    
    // @translatable
    private static final String MESSAGE_PROCESSING_SCHEDULED_COSTS = "Processing scheduled costs";
    
    static {
        assetKeysByProjectionType.put(PROJECTION_PROPERTY, CostProjection.ASSET_KEY_PROPERTY);
        assetKeysByProjectionType.put(PROJECTION_TAXES, CostProjection.ASSET_KEY_PROPERTY);
        assetKeysByProjectionType.put(PROJECTION_BUILDING, CostProjection.ASSET_KEY_BUILDING);
        assetKeysByProjectionType.put(PROJECTION_LEASE, CostProjection.ASSET_KEY_LEASE);
        assetKeysByProjectionType
            .put(PROJECTION_LEASE_FOR_BUILDING, CostProjection.ASSET_KEY_LEASE);
        assetKeysByProjectionType
            .put(PROJECTION_LEASE_FOR_PROPERTY, CostProjection.ASSET_KEY_LEASE);
        assetKeysByProjectionType.put(PROJECTION_DEPARTMENT, CostProjection.ASSET_KEY_DEPARTMENT);
        assetKeysByProjectionType.put(PROJECTION_ACCOUNT, CostProjection.ASSET_KEY_ACCOUNT);
    }
    
    /**
     * Activity parameter: is Mc and Vat is enabled.
     */
    private boolean isMcAndVatEnabled = false;
    
    /**
     * If is budget currency selected.
     */
    private boolean isBudgetCurrency = false;
    
    /**
     * Destination currency code.
     */
    private String currencyCode;
    
    /**
     * Exchange rate type.
     */
    private ExchangeRateType exchangeRateType = ExchangeRateType.BUDGET;
    
    /**
     * Vat cost type.
     */
    private VatCost vatCost;
    
    /**
     * Recurring cost data source.
     */
    private final ICostDao<RecurringCost> recurringCostDataSource;
    
    /**
     * Constructor.
     * 
     * @param recurringCostDataSource
     */
    public CreateCostProjection(final ICostDao<RecurringCost> recurringCostDataSource) {
        this.recurringCostDataSource = recurringCostDataSource;
    }
    
    /**
     * Load exchange rates.
     * 
     * @param isMcEnabled activity parameter
     * @param currencyCode destination currency code
     * @param exchangeRateType exchange rate type
     */
    public void setEnhancedFeatureParameters(final boolean isMcEnabled,
            final boolean isBudgetCurrency, final String currencyCode,
            final ExchangeRateType exchangeRateType, final VatCost vatCost) {
        this.isMcAndVatEnabled = isMcEnabled;
        if (isMcEnabled) {
            this.currencyCode = currencyCode;
            this.exchangeRateType = exchangeRateType;
            this.vatCost = vatCost;
            this.isBudgetCurrency = isBudgetCurrency;
        } else {
            this.exchangeRateType = ExchangeRateType.BUDGET;
            this.vatCost = VatCost.TOTAL;
        }
    }
    
    /**
     * Calculate cash flow projections from costs, scheduled costs, and/or recurring costs. Returns
     * calculation results as a CostProjection object.
     * 
     * @param projectionType The type of projection - "pr", "ls", "taxes", etc. Costs will be
     *            grouped by the corresponding foreign key field. Supported values are defined as
     *            constants in the CreateCostProjection class.
     * @param dateFrom The projection start date.
     * @param dateTo The projection end date.
     * @param period The date interval between projection values - "month", "quarter", or "year".
     * @param calculationType Defines how to calculate totals - "netincome", "income", or "expense".
     * @param isGroupByCostCategory Whether to group costs by cost category.
     * @param isFromCosts Whether to include actual costs into the projection.
     * @param isFromScheduledCosts Whether to include scheduled costs into the projection.
     * @param isFromRecurringCosts Whether to include recurring costs into the projection.
     * @param clientRestriction Optional client restriction string, or null.
     * @return CostProjection
     */
    CostProjection calculateCashFlowProjection(final String projectionType, final Date dateFrom,
            final Date dateTo, final String period, final String calculationType,
            final boolean isGroupByCostCategory, final boolean isFromCosts,
            final boolean isFromScheduledCosts, final boolean isFromRecurringCosts,
            String recurringCostsRestriction, String scheduledCostsRestriction,
            String actualCostsRestriction, final JobStatus status) {
        
        status.setResult(new JobResult("Calculate cash flow projection"));
        
        final String assetKey = getAssetKeyForProjectionType(projectionType);
        
        if (projectionType.equalsIgnoreCase(PROJECTION_TAXES)) {
            recurringCostsRestriction = addTaxesRestriction(recurringCostsRestriction);
            scheduledCostsRestriction = addTaxesRestriction(scheduledCostsRestriction);
            actualCostsRestriction = addTaxesRestriction(actualCostsRestriction);
        }
        
        // the CostProjection object will hold calculation results
        final CostProjection projection = new CostProjection(assetKey, dateFrom, dateTo, period);
        
        final ContextCacheable.Immutable context = ContextStore.get().getCurrentContext();
        if (isFromCosts && !status.isStopRequested()) {
            status.setMessage(EventHandlerBase.localizeString(context,
                MESSAGE_PROCESSING_ACTUAL_COSTS, this.getClass().getName()));
            updateProjectionFromCosts(projection, calculationType, "cost_tran",
                isGroupByCostCategory, actualCostsRestriction, status);
        }
        
        if (isFromScheduledCosts && !status.isStopRequested()) {
            status.setMessage(EventHandlerBase.localizeString(context,
                MESSAGE_PROCESSING_SCHEDULED_COSTS, this.getClass().getName()));
            updateProjectionFromCosts(projection, calculationType, "cost_tran_sched",
                isGroupByCostCategory, scheduledCostsRestriction, status);
        }
        
        if (isFromRecurringCosts && !status.isStopRequested()) {
            status.setMessage(EventHandlerBase.localizeString(context,
                MESSAGE_PROCESSING_RECURRING_COSTS, this.getClass().getName()));
            updateProjectionFromRecurringCosts(projection, calculationType, isGroupByCostCategory,
                recurringCostsRestriction, status);
        }
        
        return projection;
    }
    
    /**
     * Create empty cost projection.
     * 
     * @param projectionType projectrion type
     * @param dateFrom projection start date
     * @param dateTo projection end date
     * @param period projection period
     * @return {@link CostProjection}
     */
    public CostProjection createDefaultCostProjection(final String projectionType,
            final Date dateFrom, final Date dateTo, final String period) {
        final String assetKey = getAssetKeyForProjectionType(projectionType);
        return new CostProjection(assetKey, dateFrom, dateTo, period);
    }

    /**
     * Adds taxes restriction to specified client restriction and returns the combined restriction.
     * 
     * @param clientRestriction
     * @return
     */
    private String addTaxesRestriction(String restriction) {
        if (StringUtil.notNullOrEmpty(restriction)) {
            restriction = "(" + restriction + ") AND ";
        }
        restriction = StringUtil.notNull(restriction) + "cost_cat.cost_type = 'TAX'";
        return restriction;
    }
    
    /**
     * @see #getTotalCostAmountsForSqlServer(String, String, String, Date, Date)
     * @return SQL query for SQL server
     */
    private String buildCustomQueryForSqlServer(final String assetKey, final String costTable,
            final String restriction, final Date dateFrom, final Date dateTo) {
        
        final String selectTemplate = "SELECT %s FROM %s WHERE %s";
        final String groupByTemplate = " GROUP BY %s";
        final String sumTemplate = "SUM(%s.%s) AS %s";
        
        // we will be grouping cost records by asset key
        String groupByField = assetKey;
        if (groupByField.equalsIgnoreCase(CostProjection.ASSET_KEY_DEPARTMENT)) {
            groupByField = "dv_id, dp_id";
        }
        final String firstGroupField = costTable + "." + groupByField;
        final String secondGroupField = costTable + ".cost_cat_id";
        
        // we will be filtering out cost records that do not belong to specified asset (have NULL)
        final VirtualFieldDef amountIncomeFieldDef =
                getSumVirtualField(costTable, "amount_income_total", "amount_income");
        final VirtualFieldDef amountExpenseFieldDef =
                getSumVirtualField(costTable, "amount_expense_total", "amount_expense");
        final String amountIncomeSqlFieldDef =
                amountIncomeFieldDef.sqlExpressions.getExpressionForCurrentDatabase()
                        + " AS amount_income_total";
        
        final String amountExpenseSqlFieldDef =
                amountExpenseFieldDef.sqlExpressions.getExpressionForCurrentDatabase()
                        + " AS amount_expense_total";
        
        final String fromSelectFields =
                firstGroupField + " AS " + assetKey + " ," + secondGroupField + " AS cost_cat_id,"
                        + amountIncomeSqlFieldDef + "," + amountExpenseSqlFieldDef;
        String fromSelectRestriction = " (" + firstGroupField + " IS NOT NULL) ";
        fromSelectRestriction +=
                "AND (${sql.isNull('date_paid', 'date_due')} >= ${parameters['dateFrom']}) ";
        fromSelectRestriction +=
                "AND (${sql.isNull('date_paid', 'date_due')} <= ${parameters['dateTo']}) ";
        if (StringUtil.notNullOrEmpty(restriction)) {
            fromSelectRestriction += "AND (" + restriction + ")";
        }
        final String fromSelect =
                String.format(selectTemplate, fromSelectFields, costTable, fromSelectRestriction);
        final String sumAmountIncome =
                String.format(sumTemplate, costTable, "amount_income_total", "amount_income_total");
        final String sumAmountExpense =
                String.format(sumTemplate, costTable, "amount_expense_total",
                    "amount_expense_total");
        final String groupByClause =
                String.format(groupByTemplate, firstGroupField + ", " + secondGroupField);
        return String.format(selectTemplate, firstGroupField + ", " + secondGroupField + ", "
                + sumAmountIncome + ", " + sumAmountExpense, "(" + fromSelect + ") " + costTable,
            "1=1")
                + groupByClause;
    }
    
    /**
     * Returns the asset key name for specified projection type.
     * 
     * @param projectionType
     * @return
     */
    private String getAssetKeyForProjectionType(final String projectionType) {
        final String custProjectionType =
                "property".equals(projectionType) ? PROJECTION_PROPERTY : projectionType;
        return assetKeysByProjectionType.get(custProjectionType);
    }
    
    /**
     * Get Summary virtual field definition.
     * 
     * @param costTable cost table
     * @param field field name
     * @param baseField base field name
     * @return
     */
    private VirtualFieldDef getSumVirtualField(final String costTable, final String fieldName,
            final String baseField) {
        VirtualFieldDef fieldDef = null;
        if (this.isMcAndVatEnabled) {
            // cost field name
            final String costField =
                    getCostFieldName(costTable, baseField, this.isBudgetCurrency, this.vatCost);
            // currency field name
            final String currencyField = getCurrencyField(costTable, this.isBudgetCurrency);
            
            // exchange rate formula
            String exchangeRateFormula = "";
            if (costTable.equals("cost_tran_recur")) {
                exchangeRateFormula =
                        "${sql.exchangeRateFromField('" + currencyField + "', '"
                                + this.currencyCode + "', '" + this.exchangeRateType.toString()
                                + "')}";
            } else {
                exchangeRateFormula =
                        "${sql.exchangeRateFromFieldForDate('" + currencyField + "', '"
                                + this.currencyCode + "', '" + this.exchangeRateType.toString()
                                + "', '" + costTable + ".date_due' )}";
            }
            // field sql formula
            final String fieldSqlFormula = "(" + costField + " * " + exchangeRateFormula + ")";
            
            // field definition
            final Map<String, String> sqlExpressions = new HashMap<String, String>();
            sqlExpressions.put("generic", fieldSqlFormula);
            
            fieldDef = new VirtualFieldDef(costTable, fieldName, DataSource.DATA_TYPE_NUMBER);
            fieldDef.addSqlExpressions(sqlExpressions);
            
        } else {
            
            // field definition
            final Map<String, String> sqlExpressions = new HashMap<String, String>();
            sqlExpressions.put("generic", costTable + "." + baseField);
            
            fieldDef = new VirtualFieldDef(costTable, fieldName, DataSource.DATA_TYPE_NUMBER);
            fieldDef.addSqlExpressions(sqlExpressions);
        }
        return fieldDef;
    }
    
    /**
     * Groups costs by asset (building, property, lease, etc) and cost category ID, and calculates
     * total amount income and amount expense for each group.
     * 
     * @param assetKey Name of the asset field.
     * @param costTable Name of the cost table.
     * @param restriction Client console restriction.
     * @param dateFrom Date range to calculate totals for.
     * @param dateTo
     * @return List of records containing calculated totals.
     */
    private List<DataRecord> getTotalCostAmounts(final String assetKey, final String costTable,
            final String restriction, final Date dateFrom, final Date dateTo) {
        
        final String sqlQuery =
                buildCustomQueryForSqlServer(assetKey, costTable, restriction, dateFrom, dateTo);
        final DataSource totalCostDs = DataSourceFactory.createDataSource();
        totalCostDs.addTable(costTable);
        totalCostDs.addTable("cost_cat");
        totalCostDs.addTable("bl");
        totalCostDs.addTable("property");
        totalCostDs.setApplyVpaRestrictions(false);
        totalCostDs.addQuery(sqlQuery);
        totalCostDs.addVirtualField(costTable, assetKey, DataSource.DATA_TYPE_TEXT);
        totalCostDs.addVirtualField(costTable, "cost_cat_id", DataSource.DATA_TYPE_TEXT);
        totalCostDs.addVirtualField(costTable, "amount_income_total", DataSource.DATA_TYPE_NUMBER);
        totalCostDs.addVirtualField(costTable, "amount_expense_total", DataSource.DATA_TYPE_NUMBER);
        totalCostDs.addParameter("dateFrom", dateFrom, DataSource.DATA_TYPE_DATE);
        totalCostDs.addParameter("dateTo", dateTo, DataSource.DATA_TYPE_DATE);
        totalCostDs.addSort(costTable, assetKey);
        totalCostDs.addSort(costTable, "cost_cat_id");
        final List<DataRecord> costRecords = totalCostDs.getRecords();
        
        return costRecords;
    }
    
    /**
     * Updates total costs stored in the projection from cost records.
     * 
     * @param projection Cost projection to update.
     * @param calculationType Defines how to calculate totals - "netincome", "income", or "expense".
     * @param costTable Name of the cost table.
     * @param isGroupByCostCategory If true, group cost projection results by cost category.
     * @param restriction Client console restriction.
     * @param status Job status to update while the calculation is running.
     */
    private void updateProjectionFromCosts(final CostProjection projection,
            final String calculationType, final String costTable,
            final boolean isGroupByCostCategory, final String restriction, final JobStatus status) {
        
        status.setTotalNumber(projection.getNumberOfPeriods());
        int current = 0;
        status.setCurrentNumber(current);
        
        // we will iterate through the range of dates of this projection
        // starting at dateStart and incrementing by period
        final Calendar c = Calendar.getInstance();
        c.setTime(projection.getDateStart());
        
        while (c.getTime().before(projection.getDateEnd()) && !status.isStopRequested()) {
            // for each period, group cost records that match that period
            final Date dateFrom = c.getTime();
            final Period datePeriod = new Period(projection.getPeriod(), dateFrom);
            final Date dateTo = datePeriod.getDateEnd();
            
            // get total amounts for costs grouped by asset and cost category
            final List<DataRecord> costRecords =
                    getTotalCostAmounts(projection.getAssetKey(), costTable, restriction, dateFrom,
                        dateTo);
            
            // update projection costs
            for (final DataRecord costRecord : costRecords) {
                final String assetId =
                        costRecord.getString(costTable + "." + projection.getAssetKey());
                final String costCategoryId = costRecord.getString(costTable + ".cost_cat_id");
                final double amountIncome =
                        costRecord.getDouble(costTable + ".amount_income_total");
                final double amountExpense =
                        costRecord.getDouble(costTable + ".amount_expense_total");
                
                BigDecimal delta = new BigDecimal(0);
                if (!calculationType.equals(CostProjection.CALCTYPE_EXPENSE)) {
                    final BigDecimal incomeDelta = new BigDecimal(amountIncome);
                    delta = delta.add(incomeDelta);
                }
                if (!calculationType.equals(CostProjection.CALCTYPE_INCOME)) {
                    final BigDecimal expenseDelta = new BigDecimal(amountExpense);
                    delta = delta.subtract(expenseDelta);
                }
                
                if (isGroupByCostCategory) {
                    projection.updateCost(assetId, costCategoryId, dateFrom, delta.doubleValue());
                } else {
                    projection.updateCost(assetId, dateFrom, delta.doubleValue());
                }
            }
            
            // add month, quarter, year, or custom number of days
            datePeriod.addPeriodToCalendar(c);
            
            // update the job progress
            status.setCurrentNumber(++current);
        }
    }
    
    /**
     * Updates total costs stored in the projection from recurring cost records.
     * 
     * @param projection
     * @param calculationType
     * @param isGroupByCostCategory
     * @param additionalRestriction
     */
    private void updateProjectionFromRecurringCosts(final CostProjection projection,
            final String calculationType, final boolean isGroupByCostCategory,
            final String restriction, final JobStatus status) {
        final Set<Integer> recurringCostIds = new TreeSet<Integer>();
        
        final String assetKey = projection.getAssetKey();
        final Date dateStart = projection.getDateStart();
        final Date dateEnd = projection.getDateEnd();
        
        final ExchangeRateUtil exchangeRates =
                loadExchangeRates(this.isMcAndVatEnabled, this.currencyCode,
                    this.exchangeRateType.toString());
        // load recurring cost rules for specified asset key and date range
        final List<RecurringCost> recurringCosts =
                this.recurringCostDataSource.findByAssetKeyAndDateRange(assetKey, dateStart,
                    dateEnd, restriction);
        
        // set the total job size = the number of recurring costs
        status.setTotalNumber(recurringCosts.size());
        
        int current = 0;
        status.setCurrentNumber(current);
        
        // for all applicable recurring costs
        for (final RecurringCost cost : recurringCosts) {
            if (status.isStopRequested()) {
                break;
            }
            updateProjectionFromRecuringCost(projection, cost, calculationType,
                isGroupByCostCategory, exchangeRates);
            recurringCostIds.add(cost.getId());
            // update the job progress
            status.setCurrentNumber(++current);
        }
        
        final List<String> errorMessages = exchangeRates.getMissingExchangeRates();
        if (!errorMessages.isEmpty()) {
            JobStatusUtil.addProperty(status, Constants.PROPERTY_MISSING_EXCHANGE_RATE,
                errorMessages);
        }
    }
    
    /**
     * Update projection from recurring cost.
     * 
     * @param projection cost projection
     * @param cost recurring cost
     * @param calculationType calculation type
     * @param isGroupByCostCategory if is grouped by cost category
     */
    private void updateProjectionFromRecuringCost(final CostProjection projection,
            final RecurringCost cost, final String calculationType,
            final boolean isGroupByCostCategory, final ExchangeRateUtil exchangeRates) {
        final String assetId = cost.getAssetId(projection.getAssetKey());
        final String sourceCurrency =
                this.isBudgetCurrency ? cost.getCurrencyBudget() : cost.getCurrencyPayment();
        final Double exchangeRate =
                exchangeRates.getExchangeRateForCurrency(sourceCurrency, this.exchangeRateType);
        final BigDecimal incomeAmount =
                new BigDecimal(cost.getIncomeAmount(this.isMcAndVatEnabled, this.isBudgetCurrency,
                    this.vatCost));
        final BigDecimal expenseAmount =
                new BigDecimal(cost.getExpenseAmount(this.isMcAndVatEnabled, this.isBudgetCurrency,
                    this.vatCost));
        
        final Date changeOverDate = cost.getChangeOverDate();
        final Period recurringPeriod = cost.getRecurringPeriod();
        recurringPeriod.setNoOfIntervals(0);
        
        final Date currentDateEnd = getCurrentDateEnd(projection, cost, assetId);
        
        recurringPeriod.iterate(changeOverDate, currentDateEnd, new Period.Callback() {
            @Override
            public boolean call(final Date dateNext) {
                // check if the date falls into seasonal range
                if (!cost.isOutOfSeason(dateNext)) {
                    
                    final BigDecimal yearlyFactorEscalation =
                            new BigDecimal(cost.calculateYearlyFactorEscalation(dateNext));
                    final BigDecimal monthlyFactorEscalation =
                            new BigDecimal(cost.calculateMonthlyFactorEscalation());
                    
                    BigDecimal delta = BigDecimal.ZERO;
                    if (!calculationType.equals(CostProjection.CALCTYPE_EXPENSE)) {
                        BigDecimal incomeDelta = incomeAmount.multiply(yearlyFactorEscalation);
                        incomeDelta = incomeDelta.multiply(monthlyFactorEscalation);
                        delta = delta.add(incomeDelta);
                    }
                    if (!calculationType.equals(CostProjection.CALCTYPE_INCOME)) {
                        BigDecimal expenseDelta = expenseAmount.multiply(yearlyFactorEscalation);
                        expenseDelta = expenseDelta.multiply(monthlyFactorEscalation);
                        delta = delta.subtract(expenseDelta);
                    }
                    
                    // apply exchange rate
                    delta = delta.multiply(new BigDecimal(exchangeRate));
                    
                    if (isGroupByCostCategory) {
                        projection.updateCost(assetId, cost.getCostCategoryId(), dateNext,
                            delta.doubleValue());
                    } else {
                        projection.updateCost(assetId, dateNext, delta.doubleValue());
                    }
                }
                return true;
            }
        });
        
    }
    
    /**
     * Returns full name for currency field.
     * 
     * @param tableName table name
     * @param isBudgetCurrency is if budget currencu selected
     * @return String
     */
    private String getCurrencyField(final String tableName, final boolean isBudgetCurrency) {
        String fieldName = DbConstants.getFieldFullName(tableName, DbConstants.CURRENCY_PAYMENT);
        if (isBudgetCurrency) {
            fieldName = DbConstants.getFieldFullName(tableName, DbConstants.CURRENCY_BUDGET);
        }
        return fieldName;
    }
    
    /**
     * Returns full name for currency field.
     * 
     * @param tableName cost table name
     * @param baseName base field name (amount_income, amount_expense)
     * @param isBudgetCurrency if is budget currency selected
     * @param vatCost vat cost type
     * @return full field name
     */
    private String getCostFieldName(final String tableName, final String baseName,
            final boolean isBudgetCurrency, final VatCost vatCost) {
        final String fieldName = baseName;
        String addToField = "_" + vatCost.toString() + (isBudgetCurrency ? "_budget" : "_payment");
        if (isBudgetCurrency && VatCost.TOTAL.equals(vatCost)) {
            addToField = "";
        }
        return DbConstants.getFieldFullName(tableName, fieldName + addToField);
        
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
     * Obtain the end date of the recurring cost.
     * 
     * @param projection The cost projection to update.
     * @param assetId The ID value of the asset used in the projection
     * @return end date
     */
    private Date getCurrentDateEnd(final CostProjection projection, final RecurringCost cost,
            final String assetId) {
        
        Date dateEndRecurring = cost.getDateEnd();
        if (dateEndRecurring == null || projection.getDateEnd().before(dateEndRecurring)) {
            dateEndRecurring = projection.getDateEnd();
        }
        
        Date currentDateEnd = dateEndRecurring;
        
        Date leaseExpirationDate = null;
        if (DbConstants.LS_ID.equals(projection.getAssetKey())) {
            leaseExpirationDate = getLeaseExpirationDate(assetId);
        }
        
        if (leaseExpirationDate != null && leaseExpirationDate.before(dateEndRecurring)) {
            currentDateEnd = leaseExpirationDate;
        }
        
        return currentDateEnd;
    }
    
    /**
     * Get lease expiration date.
     * 
     * @param lsId Lease id
     * @return lease Expiration date
     */
    private Date getLeaseExpirationDate(final String lsId) {
        final DataSource lsDs =
                DataSourceFactory.createDataSourceForFields(DbConstants.LS_TABLE, new String[] {
                        DbConstants.LS_ID, DbConstants.DATE_END });
        lsDs.addRestriction(Restrictions.eq(DbConstants.LS_TABLE, DbConstants.LS_ID, lsId));
        
        final DataRecord record = lsDs.getRecord();
        
        return record.getDate(DbConstants.LS_TABLE + "." + DbConstants.DATE_END);
    }
}
