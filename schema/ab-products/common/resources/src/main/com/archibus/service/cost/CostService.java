package com.archibus.service.cost;

import java.math.BigDecimal;
import java.util.*;

import com.archibus.app.common.finance.dao.ICostDao;
import com.archibus.app.common.finance.dao.datasource.*;
import com.archibus.app.common.finance.domain.*;
import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.jobmanager.*;
import com.archibus.model.config.*;
import com.archibus.service.Period;
import com.archibus.utility.*;

import edu.umd.cs.findbugs.annotations.SuppressWarnings;

/**
 * <p>
 * Provides for creating Scheduled Costs records from selected Recurring Costs records. Also,
 * provides for moving selected Scheduled Costs records to the Costs table.
 *
 * <p>
 * Creating Costs:
 *
 * <p>
 * There are three Costs tables:
 * <li>Recurring Costs
 * <li>Scheduled Costs
 * <li>Costs
 *
 * <p>
 * Costs are only considered actual costs if they are listed in the Costs table. Recurring Costs and
 * Scheduled Costs are methods of listing Costs which have not yet been approved or paid.
 *
 * <p>
 * The process of approving Recurring Costs and Scheduled Costs so that they become actual Costs is
 * documented below.
 *
 * <p>
 * Costs may only be manually entered as Recurring Costs or Scheduled Costs. When Recurring Costs
 * are scheduled (with an action) they become Scheduled Costs. When Scheduled Costs are approved
 * (with an action) they become Costs.
 *
 * <p>
 * The scheduling and approval processes basically copies or moves data from one cost table to
 * another. In particular, the mapping, listed below, of the fields in each of the costs tables
 * define how data is:
 * <li>Copied (from Recurring Costs to Scheduled Costs) with the 'Schedule Recurring Costs' actions
 * <li>Moved (from Scheduled Costs to Costs) with the 'Approve Costs' view actions.
 *
 * <p>
 * Not all Recurring Costs fields are mapped to Scheduled Costs as some of the Recurring Costs
 * fields are only necessary to define the recurring cost rules; not the individual costs.
 *
 * <p>
 * Scheduled Costs have additional fields which hold information which will only be entered for
 * individual costs and are not defined in Recurring Costs.
 *
 * <pre>
 * ___________________________
 * Cost Tables fields Mapping:
 *
 * Recurring Costs:    Scheduled Costs:         Costs:
 * -------------------------------------------------------------------------------
 *
 * ac_id               ac_id                    ac_id
 *                     activity_log_id          activity_log_id
 * amount_expense      amount_expense           amount_expense
 * amount_income       amount_income            amount_income
 *                     amount_tax_late1         amount_tax_late1
 *                     amount_tax_late2         amount_tax_late2
 *                     amount_tax_late3         amount_tax_late3
 * bl_id               bl_id                    bl_id
 * cost_cat_id         cost_cat_id              cost_cat_id
 *                                              cost_tran_id
 * cost_tran_recur_id  cost_tran_recur_id       cost_tran_recur_id
 *                     cost_tran_sched_id
 *                     date_assessed            date_assessed
 *                     date_due                 date_due
 *                     date_paid                date_paid
 *                     date_tax_late1           date_tax_late1
 *                     date_tax_late2           date_tax_late2
 *                     date_tax_late3           date_tax_late3
 * date_end
 * date_seasonal_end
 * date_seasonal_start
 * date_start
 * date_trans_created  date_trans_created       date_trans_created   +++++
 * description         description              description
 * dp_id               dp_id                    dp_id
 * dv_id               dv_id                    dv_id
 *                                              invoice_id
 * ls_id               ls_id                    ls_id
 * option1             option1                  option1
 * option2             option2                  option2
 * pa_name             pa_name                  pa_name
 * parcel_id           parcel_id                parcel_id
 * period
 * period_custom
 * pr_id               pr_id                    pr_id
 * status_active
 * yearly_factor
 *                     status ++
 *                                              status    ++
 *                     tax_authority_contact    tax_authority_contact
 *                     tax_bill_num             tax_bill_num
 *                     tax_milage_rate          tax_milage_rate
 *                     tax_type                 tax_type
 *                     tax_value_assessed       tax_value_assessed
 *                     tax_clr                  tax_clr
 *                     tax_period_in_months     tax_period_in_months
 *
 * ++ - the status field is different for Scheduled costs and costs
 * +++++ - date_trans_created is not copied; it is automatically filled in with the current date
 * </pre>
 *
 * <p>
 * History:
 * <li>Web Central 17.2: Initial implementation, ported from costapp.abs, includes only the
 * Calculate Cash Flow Projection for Recurring Costs.
 * <li>Web Central 17.3: Added Create Scheduled Costs and Approve Scheduled Costs, ported from
 * costapp.abs. Added Calculate Chargeback Costs, ported from costchgb.abs.
 *
 * @author Sergey Kuramshin
 */
public class CostService extends JobBase {

    /**
     * Constant.
     */
    private final static String DEFAULT_SCHEDULED_STATUS = "AUTO-RECURRING";

    /**
     * The list of cost category codes defined in the activity parameter CAM_Reconciliation. If the
     * activity parameter is not defined, default value = "RENT - CAM RECONCILIATION".
     */
    private List<String> costCategoriesCamReconciliation;

    /**
     * Configuration properties for cost calculation.
     */
    private Configuration configuration;

    // ----------------------- DataSource references ---------------------------
    /**
     * References to custom data sources used to load cost objects from the database. These
     * references are set by the Web Central container based on the Spring configuration file
     * schema/ab-products/solutions/common/appContext-services.xml.
     */

    private ICostDao<ActualCost> actualCostDataSource;

    /**
     * References to custom data sources used to load cost objects from the database. These
     * references are set by the Web Central container based on the Spring configuration file
     * schema/ab-products/solutions/common/appContext-services.xml.
     */
    private ICostDao<RecurringCost> recurringCostDataSource;

    /**
     * References to custom data sources used to load cost objects from the database. These
     * references are set by the Web Central container based on the Spring configuration file
     * schema/ab-products/solutions/common/appContext-services.xml.
     */
    private ICostDao<ScheduledCost> scheduledCostDataSource;

    // ----------------------- business methods --------------------------------

    /**
     * Apply multicurrency updates to legacy data. Update all actual, scheduled and recurring costs
     * that have currency budget and currency payment null
     */
    public void applyMulticurrencyUpdatesToLegacyData() {
        CurrencyUtil.applyCurrencyUpdatesToLegacyData(this.status);
    }

    /**
     * APPROVE ALL CHARGEBACK COSTS:
     * <ul>
     * <li>When a cost_tran_sched AUTO-ROLLUP record is approved:
     * <li>- a cost_tran record is created with a chrgbck_status of RU
     * <li>When a cost_tran_sched AUTO-CHARGEBACK record is approved:
     * <li>- a cost_tran record is created with a chrgbck_status of PR
     * <li>All cost_tran_sched 'AUTO-ROLLUP' and 'AUTO-CHARGEBACK' records are deleted
     * <li>All cost_tran records with chrgbck_status = CS get set to CA
     *
     * @param restriction on the cost_tran_recur records.
     */
    public void approveAllChargebackCosts(final String restriction) {
        final boolean isMcAndVatEnabled =
                ContextStore.get().getProject().isVatAndMultiCurrencyEnabled();
        CostChargeback.approveAllChargebackCosts(restriction, isMcAndVatEnabled);
    }

    /**
     * <p>
     * Approves specified scheduled cost.
     * <li>Creates a new record in the Costs table with the same values as the record in the
     * Scheduled Costs table and assigns an auto-numbered key to the new Cost record.
     * <li>Sets the Cost Status value of the Cost record to RECEIVABLE if the cost is income, or to
     * PAYABLE if the cost is an expense.
     * <li>Sets the Chargeback Status field of the Cost record to NOT CHARGED BACK.
     * <li>Deletes the record from the Scheduled Costs table.
     */
    public void approveScheduledCost(final String costId, final Date datePaid) {
        initPerRequestState();
        approveScheduledCostNoInitialization(costId, datePaid);
    }

    /**
     * <p>
     * Approves specified scheduled cost.
     * <li>Creates a new record in the Costs table with the same values as the record in the
     * Scheduled Costs table and assigns an auto-numbered key to the new Cost record.
     * <li>Sets the Cost Status value of the Cost record to RECEIVABLE if the cost is income, or to
     * PAYABLE if the cost is an expense.
     * <li>Sets the Chargeback Status field of the Cost record to NOT CHARGED BACK.
     * <li>Deletes the record from the Scheduled Costs table.
     */
    private void approveScheduledCostNoInitialization(final String costId, final Date datePaid) {
        final ScheduledCost scheduledCost =
                this.scheduledCostDataSource.get(Integer.valueOf(costId));
        final ActualCost actualCost = ActualCost.createFromScheduledCost(scheduledCost);

        actualCost.setDatePaid(datePaid);
        actualCost.setChargebackStatus("N");

        if (actualCost.isIncome()) {
            actualCost.setStatus("RECEIVABLE");
        } else {
            actualCost.setStatus("PAYABLE");
        }

        final ActualCost savedActualCost = this.actualCostDataSource.save(actualCost);

        /*
         * If the scheduled cost has a CAM Reconciliation Adjustment associated, we must update the
         * adjustment record: remove the scheduled cost id and set the actual cost id
         */
        this.updateCamAdjustmentOnApproveScheduledCost(scheduledCost, savedActualCost);

        this.scheduledCostDataSource.delete(scheduledCost);
    }

    /**
     *
     * If the scheduled cost has a CAM Reconciliation Adjustment associated, we must update the
     * adjustment record: remove the scheduled cost id and set the actual cost id.
     *
     * @param scheduledCost The scheduled cost record
     * @param actualCost The actual cost record
     */
    private void updateCamAdjustmentOnApproveScheduledCost(final ScheduledCost scheduledCost,
            final ActualCost actualCost) {
        final String costCategoryId = scheduledCost.getCostCategoryId();
        final boolean isCamCategory = this.costCategoriesCamReconciliation.contains(costCategoryId);

        if (isCamCategory) {
            // look for the adjustment record
            final DataSource adjustmentDS = DataSourceFactory.createDataSourceForFields(
                DbConstants.LS_CAM_REC_REPORT_TABLE, new String[] { "ls_cam_rec_report_id",
                        DbConstants.COST_TRAN_SCHED_ID, DbConstants.COST_TRAN_ID });
            adjustmentDS.addRestriction(Restrictions.eq(DbConstants.LS_CAM_REC_REPORT_TABLE,
                DbConstants.COST_TRAN_SCHED_ID, scheduledCost.getId()));
            final List<DataRecord> adjustmentRecords = adjustmentDS.getRecords();
            if (!adjustmentRecords.isEmpty()) {
                // remove the scheduled cost id and set the actual cost id;
                final DataRecord adjustmentRecord = adjustmentRecords.get(0);
                adjustmentRecord.setValue(DbConstants.LS_CAM_REC_REPORT_TABLE + Constants.DOT
                        + DbConstants.COST_TRAN_SCHED_ID,
                    null);
                adjustmentRecord.setValue(
                    DbConstants.LS_CAM_REC_REPORT_TABLE + Constants.DOT + DbConstants.COST_TRAN_ID,
                    actualCost.getId());
                adjustmentDS.saveRecord(adjustmentRecord);
            }
        }
    }

    /**
     * Move selected Scheduled Cost records to the Costs table.
     *
     * @param costIds List<String> of primary keys of selected recurring cost records.
     */
    public void approveScheduledCosts(final List<Integer> costIds) {
        initPerRequestState();

        final ICostDao<ScheduledCost> schedCostDataSource = new ScheduledCostDataSource();
        final List<ScheduledCost> scheduledCosts = schedCostDataSource.findByCostIds(costIds);

        for (final ScheduledCost scheduledCost : scheduledCosts) {
            this.approveScheduledCostNoInitialization(String.valueOf(scheduledCost.getId()),
                scheduledCost.getDatePaid());
        }
    }

    /**
     *
     * Deletes the scheduled costs. For the costs that have CAM Reconciliation Adjustments
     * associated (ls_cam_rec_report table), the adjustments are deleted first.
     *
     * @param costIds List of scheduled cost codes
     */
    public void deleteScheduledCosts(final List<Integer> costIds) {
        initPerRequestState();

        final String strIds = CostHelper.getSqlString(costIds);

        final String deletePattern = "DELETE FROM %s WHERE %s IN ( %s )";
        // delete from ls_cam_rec_report
        SqlUtils.executeUpdate(DbConstants.LS_CAM_REC_REPORT_TABLE, String.format(deletePattern,
            DbConstants.LS_CAM_REC_REPORT_TABLE, DbConstants.COST_TRAN_SCHED_ID, strIds));
        // delete from cost_tran_sched table
        SqlUtils.executeUpdate(DbConstants.COST_TRAN_SCHED_TABLE, String.format(deletePattern,
            DbConstants.COST_TRAN_SCHED_TABLE, DbConstants.COST_TRAN_SCHED_ID, strIds));
    }

    /**
     * Performs roll-up and chargeback (proration) of Costs recorded in the cost_tran table
     * according to the Roll-Up and Proration settings in cost_cat (Cost Categories) table.
     *
     * @param restriction on cost_tran records.
     * @param isDeleteExistingChargeback
     * @param isRecalculatePropertyAndLeaseAreas
     */
    public void calculateChargebackCosts(final String restriction,
            final boolean isDeleteExistingChargeback,
            final boolean isRecalculatePropertyAndLeaseAreas) {
        final boolean isMcAndVatEnabled =
                ContextStore.get().getProject().isVatAndMultiCurrencyEnabled();
        CostChargeback.calculateChargebackCosts(restriction, isDeleteExistingChargeback,
            isRecalculatePropertyAndLeaseAreas, isMcAndVatEnabled, this.status);
    }

    /**
     * Apply yearly factor escalation to cost value
     *
     * @param recurCostId recurring cost id
     * @param amount cost amount
     * @param date date value
     * @return double value
     */
    public double applyYearlyFactor(final int recurCostId, final double amount, final Date date) {
        initPerRequestState();
        final BigDecimal decimalAmount = new BigDecimal(amount);
        final RecurringCost recurringCost = this.recurringCostDataSource.getRecord(recurCostId);
        final double escalation = recurringCost.calculateYearlyFactorEscalation(date);
        return decimalAmount.multiply(new BigDecimal(escalation)).doubleValue();
    }

    /**
     * Calculate cost values at runtime. This method replace JavaScript calculation. Called from
     * cost edit forms and base rent edit forms.
     *
     *
     * @param costTable cost table name
     * @param values map with user inputs
     * @param isVatAmountOverride override vat amount
     * @param isVatExcluded if vat is excluded, only for costs associated with leases
     * @return map with calculated values.
     */
    public Map<String, String> calculateCostRuntimeValues(final String costTable,
            final Map<String, String> values, final boolean isVatAmountOverride,
            final boolean isVatExcluded) {

        final double incomeBase =
                CostHelper.getDoubleValue("amount_income_base_payment", values, 0.0);
        final double expenseBase =
                CostHelper.getDoubleValue("amount_expense_base_payment", values, 0.0);
        double vatPercent = CostHelper.getDoubleValue("vat_percent_value", values, 0.0);
        double vatAmount = CostHelper.getDoubleValue("vat_amount_override", values, 0.0);
        double incomeVAT = 0;
        double expenseVAT = 0;
        double incomeTotal = 0;
        double expenseTotal = 0;

        // if vat is excluded
        if (isVatExcluded) {
            vatPercent = 0;
            vatAmount = 0;
        }
        // if is vat amount override
        if (isVatAmountOverride && vatAmount != -1.0) {
            if (incomeBase != 0) {
                incomeVAT = vatAmount;
                expenseVAT = 0;
            } else if (expenseBase != 0) {
                incomeVAT = 0;
                expenseVAT = vatAmount;
            }
        }

        // vat percent
        if (!isVatAmountOverride) {
            if (vatPercent == 0 && !isVatExcluded) {
                values.put("displayValues", "1");
            }
            incomeVAT = incomeBase * vatPercent / 100;
            expenseVAT = expenseBase * vatPercent / 100;
        }

        incomeTotal = incomeBase + incomeVAT;
        expenseTotal = expenseBase + expenseVAT;

        // update new values
        values.put("amount_income_vat_payment", String.valueOf(incomeVAT));
        values.put("amount_income_total_payment", String.valueOf(incomeTotal));
        values.put("amount_expense_vat_payment", String.valueOf(expenseVAT));
        values.put("amount_expense_total_payment", String.valueOf(expenseTotal));

        return values;
    }

    /**
     * Convert cost value from currency to budget currency using specified exchange rate type.
     *
     * @param costValue cost value
     * @param currency source currency
     * @param exchangeRateType exchange rate type
     * @return double
     */
    public double convertCostToBudget(final Double costValue, final String currency,
            final String exchangeRateType) {
        double convertedValue = 0.0;
        final ExchangeRateType exchRateType = ExchangeRateType.fromString(exchangeRateType);
        final CurrencyConversions currencyConversions =
                ContextStore.get().getProject().getCurrencyConversions();
        final double exchangeRate =
                currencyConversions.getExchangeRateToBudget(currency, exchRateType);
        convertedValue = costValue * exchangeRate;
        return convertedValue;
    }

    /**
     * Calculate Cam profile fields at runtime.
     *
     * @param values field values
     * @return calculated values
     */
    public Map<String, String> calculateCamProfile(final Map<String, String> values) {

        final String camAllocMethod = values.get("ls_cam_profile.cam_alloc_method");
        // Read field values
        final Double dblBaseRent = CostHelper.getDoubleValue("ls_cam_profile.cam_rent", values);
        final Double dblFixedEstimate =
                CostHelper.getDoubleValue("ls_cam_profile.cam_cost_fixed", values);
        final Double dblAreaNegotiated =
                CostHelper.getDoubleValue("ls_cam_profile.cam_area_negotiated", values);
        Double dblPercentage = CostHelper.getDoubleValue("ls_cam_profile.cam_rent_pct", values);
        Double dblCostRentPct =
                CostHelper.getDoubleValue("ls_cam_profile.cam_cost_rent_pct", values);
        Double dblCamCostPerArea =
                CostHelper.getDoubleValue("ls_cam_profile.cam_cost_per_area", values);
        Double dblCostArea = CostHelper.getDoubleValue("ls_cam_profile.cam_cost_area", values);

        if (camAllocMethod.equals("F")) {
            values.remove("ls_cam_profile.cam_rent_pct");
            values.remove("ls_cam_profile.cam_cost_per_area");
            if (dblBaseRent != null && dblBaseRent > 0 && dblFixedEstimate != null) {
                dblPercentage = 100 * dblFixedEstimate / dblBaseRent;
                values.put("ls_cam_profile.cam_rent_pct", dblPercentage.toString());
            }
            if (dblAreaNegotiated != null && dblAreaNegotiated > 0 && dblFixedEstimate != null) {
                dblCamCostPerArea = dblFixedEstimate / dblAreaNegotiated;
                values.put("ls_cam_profile.cam_cost_per_area", dblCamCostPerArea.toString());
            }
        }

        if (camAllocMethod.equals("P")) {
            values.remove("ls_cam_profile.cam_cost_rent_pct");
            values.remove("ls_cam_profile.cam_cost_per_area");
            if (dblBaseRent != null && dblBaseRent > 0 && dblPercentage != null) {
                dblCostRentPct = dblBaseRent * dblPercentage / 100;
                values.put("ls_cam_profile.cam_cost_rent_pct", dblCostRentPct.toString());
            }
            if (dblAreaNegotiated != null && dblAreaNegotiated > 0 && dblCostRentPct != null) {
                dblCamCostPerArea = dblCostRentPct / dblAreaNegotiated;
                values.put("ls_cam_profile.cam_cost_per_area", dblCamCostPerArea.toString());
            }
        }

        if (camAllocMethod.equals("A")) {
            values.remove("ls_cam_profile.cam_cost_area");
            values.remove("ls_cam_profile.cam_rent_pct");
            if (dblAreaNegotiated != null && dblCamCostPerArea != null) {
                dblCostArea = dblAreaNegotiated * dblCamCostPerArea;
                values.put("ls_cam_profile.cam_cost_area", dblCostArea.toString());
            }

            if (dblBaseRent != null && dblBaseRent > 0 && dblCostArea != null) {
                dblPercentage = 100 * dblCostArea / dblBaseRent;
                values.put("ls_cam_profile.cam_rent_pct", dblPercentage.toString());
            }
        }
        return values;
    }

    /**
     * Convert cost values according to conversion rate from afm_conversions.
     *
     * @param costIds list of cost ids
     * @param costTypes list of cost types ("cost_tran", "cost_tran_sched", "cost_tran_recur")
     * @return error message if exchange rate is not defined or null
     */
    public void convertCostForVATAndMC(final List<Integer> costIds, final List<String> costTypes) {
        initPerRequestState();
        final String budgetCurrency = ContextStore.get().getProject().getBudgetCurrency().getCode();
        final ExchangeRateUtil exchangeRateUtil = new ExchangeRateUtil(true, budgetCurrency);
        exchangeRateUtil.loadExchangeRates();
        final Date currentDate = new Date();
        this.status.setTotalNumber(costIds.size());
        this.status.setCurrentNumber(0);
        for (int counter = 0; counter < costIds.size(); counter++) {
            final int costId = costIds.get(counter);
            final String costType = costTypes.get(counter);
            final Cost cost = getCostByIdAndType(costId, costType);
            final Date convertDate = CostHelper.getConvertDateFromCost(cost, costType, currentDate);

            try {
                // convert cost amounts
                CurrencyUtil.convertCostToBudget(cost, convertDate, budgetCurrency,
                    exchangeRateUtil);
                // save to database
                updateCost(cost, costType);
            } catch (final ExceptionBase exception) {
                this.status.setMessage(exception.getLocalizedMessage());
            }
            this.status.setCurrentNumber(counter);
        }

        this.status.setCurrentNumber(costIds.size());
        this.status.setCode(JobStatus.JOB_COMPLETE);

    }

    /**
     * Convert costs value according to conversion rate from afm_conversions.
     *
     * @param updateAll if we must update all costs
     * @param isNewCost if we must update only new costs
     * @param date specified date
     */
    public void convertCostsForVATAndMC(final boolean updateAll, final boolean isNewCost,
            final Date date) {
        initPerRequestState();
        final List<Integer> costIds = new ArrayList<Integer>();
        final List<String> costType = new ArrayList<String>();
        CostHelper.getCostIdsFromTable(DbConstants.COST_TRAN_RECUR_TABLE, updateAll, isNewCost,
            date, costIds, costType);
        CostHelper.getCostIdsFromTable(DbConstants.COST_TRAN_SCHED_TABLE, updateAll, isNewCost,
            date, costIds, costType);
        convertCostForVATAndMC(costIds, costType);
    }

    /**
     * Create Scheduled Cost records for selected Recurring Cost records.
     *
     * @param costIds List<Integer> of primary keys of selected recurring cost records.
     * @param dateEnd
     */
    public void createScheduledCosts(final List<Integer> costIds, final Date dateEndChosen) {
        final boolean isMcAndVatEnabled =
                ContextStore.get().getProject().isVatAndMultiCurrencyEnabled();
        initPerRequestState();
        final String budgetCurrency = ContextStore.get().getProject().getBudgetCurrency().getCode();
        final ExchangeRateUtil exchangeRates =
                new ExchangeRateUtil(isMcAndVatEnabled, budgetCurrency);
        exchangeRates.loadExchangeRates();
        // get data from recurring cost records for selected active records
        final List<RecurringCost> recurringCosts =
                this.recurringCostDataSource.findByCostIds(costIds);

        // loop over the Recurring cost records; create Scheduled cost records based on the values
        // in each Recurring cost record
        for (final RecurringCost recurringCost : recurringCosts) {

            // get earliest end date for this record-chosen date vs. recurring date
            Date dateEndRecurring = recurringCost.getDateEnd();
            if (dateEndRecurring == null || dateEndChosen.before(dateEndRecurring)) {
                dateEndRecurring = dateEndChosen;
            }

            // set the values required by the DateAdd function to determine the date intervals at
            // which this recur cost occurs
            final Period recurringPeriod = recurringCost.getRecurringPeriod();
            // KB 3043782 - set no of intervals to zero
            recurringPeriod.setNoOfIntervals(0);
            // original code set increment to period_custom if period == DAY,
            // and to 1 if period != DAY

            final Date changeOverDate = recurringCost.getChangeOverDate();

            // repeat incrementing date and creating scheduled costs, for each increment create a
            // new scheduled cost record, until reach the end date picked
            final Date dateEnd = dateEndRecurring;
            recurringPeriod.iterate(changeOverDate, dateEnd, new Period.Callback() {

                @Override
                public boolean call(final Date dateNext) {
                    if (!recurringCost.isOutOfSeason(dateNext)) {

                        final ScheduledCost scheduledCost =
                                ScheduledCost.createFromRecurringCost(recurringCost);

                        scheduledCost.setDateDue(dateNext);
                        scheduledCost.setStatus(DEFAULT_SCHEDULED_STATUS);
                        scheduledCost.calculateIncomeAndExpense(recurringCost, isMcAndVatEnabled,
                            exchangeRates);
                        CostService.this.scheduledCostDataSource.save(scheduledCost);
                    }
                    return true;
                }
            });
        } // next recurring cost record
    }

    /**
     * Verify if currencyCode is a supported ISO 4217 code.
     *
     * @param currencyCode currency code
     * @return true if currencyCode is a supported ISO 4217 code else return false
     */
    public boolean isValidCurrency(final String currencyCode) {
        boolean validCurrency = true;
        try {
            java.util.Currency.getInstance(currencyCode);
        } catch (final IllegalArgumentException illegalArgumentException) {
            validCurrency = false;
        }
        return validCurrency;
    }

    /**
     * Setter.
     *
     * @param actualCostDataSource data source
     */
    public void setActualCostDataSource(final ICostDao<ActualCost> actualCostDataSource) {
        this.actualCostDataSource = actualCostDataSource;
    }

    /**
     * Setter.
     *
     * @param configuration configuration properties
     */
    public void setConfiguration(final Configuration configuration) {
        this.configuration = configuration;
    }

    /**
     * Setter.
     *
     * @param recurringCostDataSource data source
     */
    public void setRecurringCostDataSource(final ICostDao<RecurringCost> recurringCostDataSource) {
        this.recurringCostDataSource = recurringCostDataSource;
    }

    /**
     * Setter.
     *
     * @param scheduledCostDataSource data source
     */
    public void setScheduledCostDataSource(final ICostDao<ScheduledCost> scheduledCostDataSource) {
        this.scheduledCostDataSource = scheduledCostDataSource;
    }

    /**
     * Update VAT field values for costs.
     *
     * @param costIds list of cost id's
     * @param costTypes list of cost types
     */
    public void updateCostRecordforVATandMC(final List<Integer> costIds,
            final List<String> costTypes) {
        this.status.setTotalNumber(costIds.size());
        this.status.setCurrentNumber(0);
        initPerRequestState();
        for (int index = 0; index < costIds.size(); index++) {
            final int costId = costIds.get(index);
            final String costType = costTypes.get(index);
            final Cost cost = getCostByIdAndType(costId, costType);
            if (this.status.isStopRequested()) {
                break;
            }

            VatUtil.calculateVatForCost(cost);
            // save to database
            updateCost(cost, costType);
            this.status.setCurrentNumber(index);
        }
        this.status.setCode(JobStatus.JOB_COMPLETE);
        this.status.setCurrentNumber(costIds.size());
    }

    /**
     * Update field value for selected costs.
     *
     * <p>
     * Suppress PMD warning "AvoidUsingSql" in this method.
     * <p>
     * Justification: Case #2. Bulk updates. #2.2. Statements with UPDATE ... WHERE pattern.
     *
     * @param costTable cost table name
     * @param fieldName field that is updated
     * @param fieldValue neutral field value
     * @param costIds list of selected costs
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    public void updateSelectedCosts(final String costTable, final String fieldName,
            final String fieldValue, final List<Integer> costIds) {
        initPerRequestState();

        String sqlRestriction = "1=1";

        if (DbConstants.COST_TRAN_TABLE.equals(costTable)) {
            sqlRestriction = this.actualCostDataSource.createSqlRestrictionForCosts(costIds);
        } else if (DbConstants.COST_TRAN_RECUR_TABLE.equals(costTable)) {
            sqlRestriction = this.recurringCostDataSource.createSqlRestrictionForCosts(costIds);
        } else if (DbConstants.COST_TRAN_SCHED_TABLE.equals(costTable)) {
            sqlRestriction = this.scheduledCostDataSource.createSqlRestrictionForCosts(costIds);
        }
        final String sql = "UPDATE " + costTable + " SET " + fieldName + " = "
                + SqlUtils.formatValueForSql(fieldValue) + " WHERE " + sqlRestriction;

        SqlUtils.executeUpdate(costTable, sql);
    }

    /**
     * Returns VAT percent value for cost category, country and lease code.
     *
     * @param costCategoryId cost category id
     * @param countryId country id
     * @param leaseId lease id
     * @return double
     */
    public double getVatPercentValue(final String costCategoryId, final String countryId,
            final String leaseId) throws ExceptionBase {
        try {
            double vatPercentValue = 0.0;
            if (StringUtil.isNullOrEmpty(leaseId) || (StringUtil.notNullOrEmpty(leaseId)
                    && !VatUtil.isVatExcludedForLease(leaseId))) {
                vatPercentValue = VatUtil.getVatPercent(countryId, costCategoryId);
            }
            return vatPercentValue;
        } catch (final ExceptionBase exception) {
            throw exception;
        }
    }

    /**
     * Get cost object by cost id and cost type.
     *
     * @param costId cost id
     * @param costType cost type
     * @return cost object
     */
    private Cost getCostByIdAndType(final int costId, final String costType) {
        Cost cost = null;
        if (DbConstants.COST_TRAN_RECUR_TABLE.equals(costType)) {
            cost = this.recurringCostDataSource.getRecord(costId);
        } else if (DbConstants.COST_TRAN_SCHED_TABLE.equals(costType)) {
            cost = this.scheduledCostDataSource.getRecord(costId);
        } else if (DbConstants.COST_TRAN_TABLE.equals(costType)) {
            cost = this.actualCostDataSource.getRecord(costId);
        }
        return cost;
    }

    /**
     * Save cost object to database.
     *
     * @param cost cost object
     * @param costType cost type
     */
    private void updateCost(final Cost cost, final String costType) {
        if (DbConstants.COST_TRAN_RECUR_TABLE.equals(costType)) {
            this.recurringCostDataSource.update((RecurringCost) cost);
        } else if (DbConstants.COST_TRAN_SCHED_TABLE.equals(costType)) {
            this.scheduledCostDataSource.update((ScheduledCost) cost);
        } else if (DbConstants.COST_TRAN_TABLE.equals(costType)) {
            this.actualCostDataSource.update((ActualCost) cost);
        }
    }

    /**
     * Initializes per-request state variables.
     */
    private void initPerRequestState() {
        this.configuration.loadSchemaPreferences();
        if (this.actualCostDataSource == null) {
            this.actualCostDataSource = new ActualCostDataSource();
        }
        if (this.scheduledCostDataSource == null) {
            this.scheduledCostDataSource = new ScheduledCostDataSource();
        }
        if (this.recurringCostDataSource == null) {
            this.recurringCostDataSource = new RecurringCostDataSource();
        }
        if (this.costCategoriesCamReconciliation == null) {
            this.costCategoriesCamReconciliation = new ArrayList<String>();
            final String costCategories = com.archibus.service.Configuration
                .getActivityParameterString("AbRPLMCosts", "CAM_Reconciliation");
            if (StringUtil.notNullOrEmpty(costCategories)) {
                for (final String camCostCateg : costCategories.split(";")) {
                    this.costCategoriesCamReconciliation.add(camCostCateg);
                }
            } else {
                this.costCategoriesCamReconciliation.add("RENT - CAM RECONCILIATION");
            }
        }
    }
}
