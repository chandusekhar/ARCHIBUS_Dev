package com.archibus.app.common.finanal.impl;

import static com.archibus.app.common.finanal.impl.Constants.*;

import java.util.*;

import com.archibus.app.common.finance.dao.ICostDao;
import com.archibus.app.common.finance.dao.datasource.RecurringCostDataSource;
import com.archibus.app.common.finance.domain.RecurringCost;
import com.archibus.config.Project;
import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.model.view.datasource.ClauseDef.Operation;
import com.archibus.model.view.datasource.ParsedRestrictionDef;

/**
 * Helper class for estimate income and expenses costs.
 *
 * @author Ana Albu
 * @since 23.1
 *
 */
public class EstimateIncomeExpensesCosts {

    /**
     * Scheduled cost data source.
     */
    private ICostDao<RecurringCost> recurringCostDataSource;

    /**
     *
     * Creates a recurring cost for asset for cost category.
     *
     * @param parameters object containing values for asset type, asset code, frequency and
     *            finanal_params.auto_number value
     * @param costType "income" or "expense"
     * @param costCategId cost category code
     * @param value cost value from form
     * @param startDate estimation start date
     * @param endDate estimation end date
     *
     */
    public void createIncomeExpenseCost(final Map<String, Object> parameters, final String costType,
            final String costCategId, final double value, final Date startDate,
            final Date endDate) {

        // delete all recurring costs for this asset for this cost category created by the estimate
        // action
        deleteEstimateRecurringCosts(parameters, costCategId);

        // for zero cost value don't created recurring cost
        // or if there is already a record for that building or property and cost category.
        if (value == 0 || existsRecurringCost(parameters, costCategId)) {
            return;
        }

        final RecurringCost recurringCost = initRecurringCost(parameters, costCategId);

        if (INCOME.equals(costType)) {
            recurringCost.setAmountIncome(value);
            recurringCost.setAmountIncomeBaseBudget(value);
            recurringCost.setAmountIncomeBasePayment(value);
            recurringCost.setAmountIncomeTotalPayment(value);
        } else if (EXPENSE.equals(costType)) {
            recurringCost.setAmountExpense(value);
            recurringCost.setAmountExpenseBaseBudget(value);
            recurringCost.setAmountExpenseBasePayment(value);
            recurringCost.setAmountExpenseTotalPayment(value);
        }

        recurringCost.setDateStart(startDate);
        recurringCost.setDateEnd(endDate);

        saveRecurringCost(recurringCost);
    }

    /**
     *
     * Initialize a recurring cost for asset for cost category with default values.
     *
     * @param parameters object containing values for asset type, asset code, frequency and
     *            finanal_params.auto_number value
     * @param costCategId cost category code
     * @return the recurring cost
     *
     */
    private RecurringCost initRecurringCost(final Map<String, Object> parameters,
            final String costCategId) {
        final Project.Immutable project = ContextStore.get().getProject();
        final RecurringCost recurringCost = new RecurringCost();

        recurringCost.setCostCategoryId(costCategId);

        final String assetType = parameters.get(ASSET_TYPE).toString();
        String assetId = "";
        String assetTypeText = "";

        if (ASSET_TYPE_BL.equals(assetType)) {
            assetId = parameters.get(BL_ID).toString();
            assetTypeText = BUILDING;
            recurringCost.setBuildingId(assetId);
        } else if (ASSET_TYPE_PR.equals(assetType)) {
            assetId = parameters.get(PR_ID).toString();
            assetTypeText = PROPERTY;
            recurringCost.setPropertyId(assetId);
        }

        recurringCost.setDescription(String.format(COST_RECUR_DESCRIPTION, assetTypeText, assetId));

        recurringCost.setCurrencyPayment(project.getBudgetCurrency().getCode());
        recurringCost.setCurrencyBudget(project.getBudgetCurrency().getCode());

        recurringCost.setAmountIncomeVatBudget(0.0);
        recurringCost.setAmountIncomeVatPayment(0.0);
        recurringCost.setAmountExpenseVatBudget(0.0);
        recurringCost.setAmountExpenseVatPayment(0.0);

        recurringCost.setAmountIncome(0.0);
        recurringCost.setAmountIncomeBaseBudget(0.0);
        recurringCost.setAmountIncomeBasePayment(0.0);
        recurringCost.setAmountIncomeTotalPayment(0.0);

        recurringCost.setAmountExpense(0.0);
        recurringCost.setAmountExpenseBaseBudget(0.0);
        recurringCost.setAmountExpenseBasePayment(0.0);
        recurringCost.setAmountExpenseTotalPayment(0.0);

        final String frequency = parameters.get(FREQUENCY).toString();
        recurringCost.setPeriod(frequency);
        recurringCost.setCostActive(true);

        return recurringCost;
    }

    /**
     *
     * Save the RecurringCost object in the database.
     *
     * @param recurringCost RecurringCost object to be saved
     */
    public void saveRecurringCost(final RecurringCost recurringCost) {
        if (this.recurringCostDataSource == null) {
            this.recurringCostDataSource = new RecurringCostDataSource();
        }

        checkExistsCostCategory(recurringCost.getCostCategoryId());

        this.recurringCostDataSource.save(recurringCost);
    }

    /**
     * Auto-create missing cost categories.
     *
     * @param costCatId cost category code
     */
    private void checkExistsCostCategory(final String costCatId) {
        final String[] costCatFields = { COST_CAT_ID };
        final DataSource costCatDataSource =
                DataSourceFactory.createDataSourceForFields(COST_CAT, costCatFields);
        final ParsedRestrictionDef costCatRestriction = new ParsedRestrictionDef();
        costCatRestriction.addClause(COST_CAT, COST_CAT_ID, costCatId, Operation.EQUALS);

        final List<DataRecord> costCatRecords = costCatDataSource.getRecords(costCatRestriction);

        if (costCatRecords.isEmpty()) {
            final DataRecord costCatRecord = costCatDataSource.createNewRecord();
            costCatRecord.setValue(COST_CAT + DOT + COST_CAT_ID, costCatId);
            costCatDataSource.saveRecord(costCatRecord);
        }
    }

    /**
     * Delete all recurring cost for this asset for this cost category created by the estimate
     * action.
     *
     * @param parameters object containing values for asset type, asset code, frequency and
     *            finanal_params.auto_number value
     * @param costCategId cost category code
     *
     *            SuppressWarning Justification
     *            <li><code>PMD.AvoidUsingSql</code> Case 2.3 Bulk delete statement
     *
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    private void deleteEstimateRecurringCosts(final Map<String, Object> parameters,
            final String costCategId) {

        final String assetType = parameters.get(ASSET_TYPE).toString();
        String assetId = "";

        if (ASSET_TYPE_BL.equals(assetType)) {
            assetId = parameters.get(BL_ID).toString();
        } else if (ASSET_TYPE_PR.equals(assetType)) {
            assetId = parameters.get(PR_ID).toString();
        }

        String deleteStatement = "DELETE FROM cost_tran_recur WHERE cost_tran_recur.cost_cat_id="
                + SqlUtils.formatValueForSql(costCategId)
                + " AND cost_tran_recur.description LIKE 'OpEx Estimate - AUTO-FORECAST%'";

        if (ASSET_TYPE_BL.equals(assetType)) {
            deleteStatement += " AND cost_tran_recur.bl_id=" + SqlUtils.formatValueForSql(assetId);
        } else if (ASSET_TYPE_PR.equals(assetType)) {
            deleteStatement += " AND cost_tran_recur.pr_id=" + SqlUtils.formatValueForSql(assetId);
        }

        SqlUtils.executeUpdate(COST_TRAN_RECUR, deleteStatement);
    }

    /**
     *
     * Verify if exists a cost_tran_recur record for asset for for cost category.
     *
     * @param parameters object containing values for asset type, asset code, frequency and
     *            finanal_params.auto_number value
     * @param costCategId cost category code
     * @return true if exists a cost_tran_recur record matching conditions, else false
     */
    private boolean existsRecurringCost(final Map<String, Object> parameters,
            final String costCategId) {
        if (this.recurringCostDataSource == null) {
            this.recurringCostDataSource = new RecurringCostDataSource();
        }

        final ParsedRestrictionDef recurCostRestriction = new ParsedRestrictionDef();
        recurCostRestriction.addClause(COST_TRAN_RECUR, COST_CAT_ID, costCategId, Operation.EQUALS);

        final String assetType = parameters.get(ASSET_TYPE).toString();

        if (ASSET_TYPE_BL.equals(assetType)) {
            recurCostRestriction.addClause(COST_TRAN_RECUR, BL_ID, parameters.get(BL_ID).toString(),
                Operation.EQUALS);
        } else if (ASSET_TYPE_PR.equals(assetType)) {
            recurCostRestriction.addClause(COST_TRAN_RECUR, PR_ID, parameters.get(PR_ID).toString(),
                Operation.EQUALS);
        }

        final List<DataRecord> recurCostsRecords =
                ((DataSource) this.recurringCostDataSource).getRecords(recurCostRestriction);

        return !recurCostsRecords.isEmpty();

    }
}
