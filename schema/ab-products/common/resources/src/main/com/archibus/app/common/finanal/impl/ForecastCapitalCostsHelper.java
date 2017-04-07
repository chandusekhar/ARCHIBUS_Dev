package com.archibus.app.common.finanal.impl;

import static com.archibus.app.common.finanal.impl.Constants.*;

import java.util.*;

import com.archibus.app.common.finance.dao.ICostDao;
import com.archibus.app.common.finance.dao.datasource.ScheduledCostDataSource;
import com.archibus.app.common.finance.domain.ScheduledCost;
import com.archibus.config.Project;
import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.model.view.datasource.ClauseDef.Operation;
import com.archibus.model.view.datasource.ParsedRestrictionDef;
import com.archibus.utility.StringUtil;

/**
 * Helper class for forecast capital costs.
 *
 * @author Ana Albu
 * @since 23.1
 *
 */
public class ForecastCapitalCostsHelper {

    /**
     * Scheduled cost data source.
     */
    private ICostDao<ScheduledCost> scheduledCostDataSource;

    /**
     * Calculation appreciation and if scheduled cost object parameter contains common values for
     * scheduled costs then create scheduled costs.
     *
     * @param startValue start cost value
     * @param startDate start date for appreciation
     * @param appreciationRate appreciation rate value
     * @param frequency 'YEAR' or 'MONTH'
     * @param numberOfPeriods number of periods, months or years depending on the frequency
     * @param scheduledCost ScheduledCost object containing common values for costs that should be
     *            created. If this object is null the method it is used only to calculate the
     *            appreciation at the end of asset life.
     * @return sum of all appreciation values
     */
    public double calculateAppreciation(final double startValue, final Date startDate,
            final double appreciationRate, final String frequency, final int numberOfPeriods,
            final ScheduledCost scheduledCost) {

        final Calendar currentDueDate = Calendar.getInstance();
        currentDueDate.setTime(startDate);

        double previousValue = startValue;
        double accumulatedValue = 0.0;
        double appreciationCost = 0.0;

        // sum of all appreciations
        double accumulatedAppreciation = 0.0;

        for (int periodIndex = 1; periodIndex <= numberOfPeriods; periodIndex++) {
            accumulatedValue = previousValue * appreciationRate;
            appreciationCost = accumulatedValue - previousValue;

            if (appreciationCost < 0) {
                appreciationCost = appreciationCost * (-1);
            }

            if (FREQUENCY_MONTH.equals(frequency)) {
                currentDueDate.add(Calendar.MONTH, 1);
            } else if (FREQUENCY_YEAR.equals(frequency)) {
                currentDueDate.add(Calendar.YEAR, 1);
            }

            if (scheduledCost != null) {
                scheduledCost.setAmountIncome(appreciationCost);
                scheduledCost.setAmountIncomeBaseBudget(appreciationCost);
                scheduledCost.setAmountIncomeBasePayment(appreciationCost);
                scheduledCost.setAmountIncomeTotalPayment(appreciationCost);
                scheduledCost.setDateDue(new Date(currentDueDate.getTimeInMillis()));
                saveScheduledCost(scheduledCost);
            }

            previousValue = accumulatedValue;
            accumulatedAppreciation += appreciationCost;
        }

        return accumulatedAppreciation;
    }

    /**
     * Delete all scheduled cost for this asset for this cost category created by the forecast
     * action.
     *
     * @param assetType 'bl', 'pr', 'proj' or 'eq'
     * @param record finanal_params record values from the form
     * @param costCategory cost category code
     *
     *            SuppressWarning Justification
     *            <li><code>PMD.AvoidUsingSql</code> Case 2.3 Bulk delete statement
     *
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    public void deleteForecastScheduledCosts(final String assetType, final DataRecord record,
            final String costCategory) {

        final int autoNumber = record.getInt(FINANAL_PARAMS + DOT + AUTO_NUMBER);
        final String deleteStatement = "DELETE FROM cost_tran_sched WHERE cost_tran_sched.status = "
                + SqlUtils.formatValueForSql(AUTO_FORECAST) + " AND cost_tran_sched.cost_cat_id="
                + SqlUtils.formatValueForSql(costCategory)
                + " AND cost_tran_sched.description LIKE '%#" + autoNumber + "#%'";

        SqlUtils.executeUpdate(COST_TRAN_SCHED, deleteStatement);
    }

    /**
     *
     * Create a ScheduledCost object and initialize it's values.
     *
     * @param assetType 'bl', 'pr', 'proj' or 'eq'
     * @param record finanal_params record from the form
     * @param frequency 'YEAR' or 'MONTH'
     * @param costCategory cost category value
     * @return created ScheduledCost object
     */
    public ScheduledCost initScheduledCost(final String assetType, final DataRecord record,
            final String frequency, final String costCategory) {
        final Project.Immutable project = ContextStore.get().getProject();
        final ScheduledCost scheduledCost = new ScheduledCost();
        scheduledCost.setCostCategoryId(costCategory);

        String assetTypeText = "";
        String assetId = "";

        if (ASSET_TYPE_BL.equals(assetType)) {
            assetTypeText = BUILDING;
            assetId = record.getString(FINANAL_PARAMS + DOT + BL_ID);
            scheduledCost.setBuildingId(assetId);
        } else if (ASSET_TYPE_PR.equals(assetType)) {
            assetTypeText = PROPERTY;
            assetId = record.getString(FINANAL_PARAMS + DOT + PR_ID);
            scheduledCost.setPropertyId(assetId);
        } else if (ASSET_TYPE_PROJ.equals(assetType)) {
            assetTypeText = PROJECT;
            assetId = record.getString(FINANAL_PARAMS + DOT + PROJECT_ID);
            setLocationForProject(scheduledCost, assetId);
        } else if (ASSET_TYPE_EQ.equals(assetType)) {
            assetTypeText = EQUIPMENT;
            assetId = record.getString(FINANAL_PARAMS + DOT + EQ_ID);
            setLocationForEquipment(scheduledCost, assetId);
        }

        final int autoNumber = record.getInt(FINANAL_PARAMS + DOT + AUTO_NUMBER);

        scheduledCost
            .setDescription(String.format(COST_DESCRIPTION, assetTypeText, assetId, autoNumber));
        scheduledCost.setStatus(AUTO_FORECAST);

        scheduledCost.setCurrencyPayment(project.getBudgetCurrency().getCode());
        scheduledCost.setCurrencyBudget(project.getBudgetCurrency().getCode());

        scheduledCost.setAmountIncomeVatBudget(0.0);
        scheduledCost.setAmountIncomeVatPayment(0.0);
        scheduledCost.setAmountExpenseVatBudget(0.0);
        scheduledCost.setAmountExpenseVatPayment(0.0);

        scheduledCost.setAmountIncome(0.0);
        scheduledCost.setAmountIncomeBaseBudget(0.0);
        scheduledCost.setAmountIncomeBasePayment(0.0);
        scheduledCost.setAmountIncomeTotalPayment(0.0);

        scheduledCost.setAmountExpense(0.0);
        scheduledCost.setAmountExpenseBaseBudget(0.0);
        scheduledCost.setAmountExpenseBasePayment(0.0);
        scheduledCost.setAmountExpenseTotalPayment(0.0);

        return scheduledCost;
    }

    /**
     *
     * Set the bl_id field value in the scheduled cost for the project asset.
     *
     * @param scheduledCost scheduled cost
     * @param assetId project_id
     */
    private void setLocationForProject(final ScheduledCost scheduledCost, final String assetId) {
        final String projectTable = "project";
        final DataSource projectDs = DataSourceFactory.createDataSourceForFields(projectTable,
            new String[] { PROJECT_ID, BL_ID });
        projectDs.addRestriction(new Restrictions.Restriction.Clause(projectTable, PROJECT_ID,
            assetId, Restrictions.OP_EQUALS));
        final DataRecord projectRecord = projectDs.getRecord();
        if (StringUtil.notNullOrEmpty(projectRecord.getString(projectTable + DOT + BL_ID))) {
            scheduledCost.setBuildingId(projectRecord.getString(projectTable + DOT + BL_ID));
        }
    }

    /**
     *
     * Set the bl_id or pr_id field value in the scheduled cost for the equipment asset.
     *
     * @param scheduledCost scheduled cost
     * @param assetId eq_id
     */
    private void setLocationForEquipment(final ScheduledCost scheduledCost, final String assetId) {
        final String eqTable = "eq";
        final DataSource eqDs = DataSourceFactory.createDataSourceForFields(eqTable,
            new String[] { EQ_ID, BL_ID, PR_ID });
        eqDs.addRestriction(
            new Restrictions.Restriction.Clause(eqTable, EQ_ID, assetId, Restrictions.OP_EQUALS));
        final DataRecord eqRecord = eqDs.getRecord();
        if (StringUtil.notNullOrEmpty(eqRecord.getString(eqTable + DOT + BL_ID))) {
            scheduledCost.setBuildingId(eqRecord.getString(eqTable + DOT + BL_ID));
        } else if (StringUtil.notNullOrEmpty(eqRecord.getString(eqTable + DOT + PR_ID))) {
            scheduledCost.setPropertyId(eqRecord.getString(eqTable + DOT + PR_ID));
        }
    }

    /**
     *
     * Save the ScheduledCost object in the database.
     *
     * @param scheduledCost ScheduledCost object to be saved
     */
    public void saveScheduledCost(final ScheduledCost scheduledCost) {
        if (this.scheduledCostDataSource == null) {
            this.scheduledCostDataSource = new ScheduledCostDataSource();
        }

        this.checkExistsCostCategory(scheduledCost.getCostCategoryId());

        final boolean existsCost = this.verifyExistsManuallyEnteredCost(scheduledCost);
        if (!existsCost) {
            this.scheduledCostDataSource.save(scheduledCost);
        }
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
     * Verify if exists a manually entered (with status not 'AUTO-FORECAST') scheduled cost for the
     * current asset and cost category.
     *
     * @param cost scheduled cost to be added if a manually entered cost does not exist
     * @return {boolean} true if exists and false otherwise
     */
    private boolean verifyExistsManuallyEnteredCost(final ScheduledCost cost) {
        boolean exists = false;
        if (this.scheduledCostDataSource == null) {
            this.scheduledCostDataSource = new ScheduledCostDataSource();
        }
        final ParsedRestrictionDef restriction = new ParsedRestrictionDef();
        restriction.addClause(COST_TRAN_SCHED, COST_CAT_ID, cost.getCostCategoryId(),
            Operation.EQUALS);
        restriction.addClause(COST_TRAN_SCHED, BL_ID, cost.getBuildingId(), Operation.EQUALS);
        restriction.addClause(COST_TRAN_SCHED, PR_ID, cost.getPropertyId(), Operation.EQUALS);
        restriction.addClause(COST_TRAN_SCHED, VARIABLE_KEY_STATUS, AUTO_FORECAST,
            Operation.NOT_EQUALS);
        final List<DataRecord> costRecords =
                ((DataSource) this.scheduledCostDataSource).getRecords(restriction);
        if (!costRecords.isEmpty()) {
            exists = true;
        }
        return exists;
    }

    /**
     * Get the date when current fiscal year started.
     *
     * @return date from the first day of the current fiscal year
     */
    public Calendar getCurrentFiscalYearStartDate() {
        // Get calendar for date of the start of a new financial year (year from (date) and
        // month and day from afm_scmpref)
        final int fiscalYearStartMonth =
                Integer.parseInt(getSchemaPreference(FISCALYEAR_STARTMONTH));
        final int fiscalYearStartDay = Integer.parseInt(getSchemaPreference(FISCALYEAR_STARTDAY));

        final Calendar fiscalYearStartCalendar = Calendar.getInstance();
        final Date date = new Date();
        fiscalYearStartCalendar.setTime(date);
        int fiscalYearStartYear = fiscalYearStartCalendar.get(Calendar.YEAR) - 1;

        if ((fiscalYearStartCalendar.get(Calendar.MONTH) == fiscalYearStartMonth - 1
                && fiscalYearStartCalendar.get(Calendar.DAY_OF_MONTH) >= fiscalYearStartDay)
                || fiscalYearStartCalendar.get(Calendar.MONTH) > fiscalYearStartMonth) {
            fiscalYearStartYear++;
        }

        fiscalYearStartCalendar.set(Calendar.YEAR, fiscalYearStartYear);
        fiscalYearStartCalendar.set(Calendar.MONTH, fiscalYearStartMonth - 1);
        fiscalYearStartCalendar.set(Calendar.DAY_OF_MONTH, fiscalYearStartDay);
        fiscalYearStartCalendar.set(Calendar.HOUR_OF_DAY, 0);
        fiscalYearStartCalendar.set(Calendar.MINUTE, 0);
        fiscalYearStartCalendar.set(Calendar.SECOND, 0);
        fiscalYearStartCalendar.set(Calendar.MILLISECOND, 0);

        return fiscalYearStartCalendar;
    }

    /**
     * Get the fiscal year start date for the fiscal year that includes the date sent as parameter.
     *
     * @param date date for which the fiscal year is searched
     *
     * @return date from the first day of the current fiscal year
     */
    public Calendar getFiscalYearStartDate(final Date date) {
        // Get calendar for date of the start of a new financial year (year from (date) and
        // month and day from afm_scmpref)
        final int fiscalYearStartMonth =
                Integer.parseInt(getSchemaPreference(FISCALYEAR_STARTMONTH));
        final int fiscalYearStartDay = Integer.parseInt(getSchemaPreference(FISCALYEAR_STARTDAY));

        final Calendar fiscalYearStartCalendar = Calendar.getInstance();
        fiscalYearStartCalendar.setTime(date);
        int fiscalYearStartYear = fiscalYearStartCalendar.get(Calendar.YEAR) - 1;

        if ((fiscalYearStartCalendar.get(Calendar.MONTH) == fiscalYearStartMonth - 1
                && fiscalYearStartCalendar.get(Calendar.DAY_OF_MONTH) >= fiscalYearStartDay)
                || fiscalYearStartCalendar.get(Calendar.MONTH) > fiscalYearStartMonth) {
            fiscalYearStartYear++;
        }

        fiscalYearStartCalendar.set(Calendar.YEAR, fiscalYearStartYear);
        fiscalYearStartCalendar.set(Calendar.MONTH, fiscalYearStartMonth - 1);
        fiscalYearStartCalendar.set(Calendar.DAY_OF_MONTH, fiscalYearStartDay);
        fiscalYearStartCalendar.set(Calendar.HOUR_OF_DAY, 0);
        fiscalYearStartCalendar.set(Calendar.MINUTE, 0);
        fiscalYearStartCalendar.set(Calendar.SECOND, 0);
        fiscalYearStartCalendar.set(Calendar.MILLISECOND, 0);

        return fiscalYearStartCalendar;
    }

    /**
     *
     * Update the cost and date values for the scheduledCost parameter object.
     *
     * @param costType "income" or "expense"
     * @param scheduledCost ScheduledCost object
     * @param costValue value for updating cost fields
     * @param currentDueDate value for updating due date field
     */
    public void updateCostValueAndDate(final String costType, final ScheduledCost scheduledCost,
            final double costValue, final Calendar currentDueDate) {

        if (INCOME.equals(costType)) {
            scheduledCost.setAmountIncome(costValue);
            scheduledCost.setAmountIncomeBaseBudget(costValue);
            scheduledCost.setAmountIncomeBasePayment(costValue);
            scheduledCost.setAmountIncomeTotalPayment(costValue);
        } else if (EXPENSE.equals(costType)) {
            scheduledCost.setAmountExpense(costValue);
            scheduledCost.setAmountExpenseBaseBudget(costValue);
            scheduledCost.setAmountExpenseBasePayment(costValue);
            scheduledCost.setAmountExpenseTotalPayment(costValue);
        }

        scheduledCost.setDateDue(new Date(currentDueDate.getTimeInMillis()));
    }

    /**
     * Returns project schema preference value by name.
     *
     * @param name parameter name
     * @return parameter value
     */
    public String getSchemaPreference(final String name) {
        final Project.Immutable project = ContextStore.get().getProject();
        return project.getAttribute("/*/preferences/@" + name);
    }
}
