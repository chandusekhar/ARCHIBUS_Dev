package com.archibus.service.cost;

import java.math.BigDecimal;
import java.util.*;

import org.json.JSONObject;

import com.archibus.app.common.finance.dao.datasource.*;
import com.archibus.app.common.finance.domain.*;
import com.archibus.context.*;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.jobmanager.JobStatus;
import com.archibus.model.config.ExchangeRateType;
import com.archibus.service.cost.VatUtil.VatCost;
import com.archibus.service.space.*;
import com.archibus.utility.EnumTemplate;

/**
 * Summarize Lease, Property or Building Costs for a specific period. Calculate asset costs and save
 * this to the database.
 * <p>
 * Asset tables : property , ls, bl
 * <p>
 * Cost fields affected by the calculation:
 * <li>bl {cost_tax_total, cost_utility_total, cost_operating_total, cost_other_total, income_total}
 * <li>property {cost_tax_total, cost_utility_total, cost_operating_total, cost_other_total,
 * income_total}
 * <li>ls {amount_base_rent, amount_operating, amount_other, amount_taxes, amount_pct_rent,
 * amount_tot_rent_inc, amount_tot_rent_exp}
 * </p>
 * <p>
 * Changes:
 * <p>
 * 11/12/2010 KB 3029349 Ioan Draghici
 * <p>
 * Some of the fields that we present in the REPM version 19.2 new reports are calculated fields
 * related to space and occupancy. To calculate these fields run the following actions, prior to
 * performing the cost calculations:
 * <p>
 * 1. For summarize lease costs
 * <li>Perform Proration and Update Lease Areas.
 * <li>Update Building and Property Area Totals
 * <p>
 * 2. For summarize property and building costs
 * <li>Update Building and Property Area Totals
 *
 * @author Ioan Draghici
 *
 */

public class SummarizeCosts {
    /**
     *
     * VAT Cost enumeration.
     * <p>
     *
     * @author Ioan Draghici
     * @since 21.3
     *
     */
    public enum SummaryType {
        /**
         * Cost summary type.
         */
        BUILDING, LEASE, PROPERTY, CAM_RECONCILIATION;
        /**
         * Cost Summary type definition .
         */
        private static final Object[][] STRINGS_TO_ENUMS = { { DbConstants.BL_TABLE, BUILDING },
            { "ls", LEASE }, { "pr", PROPERTY }, { "cam_reconciliation", CAM_RECONCILIATION } };
        
        /**
         *
         * Convert from string.
         *
         * @param source string value
         * @return vat type
         */
        public static SummaryType fromString(final String source) {
            return (SummaryType) EnumTemplate.fromString(source, STRINGS_TO_ENUMS, VatCost.class);
        }
        
        @Override
        public String toString() {
            return EnumTemplate.toString(STRINGS_TO_ENUMS, this);
        }
    }
    
    /**
     * Asset field object. Object structure column id, cost type restriction, calculation type
     * (NETINCOME, INCOME or EXPENSE) (income, expense or both)
     *
     * Ex: property table id: "cost_tax_total", costTypeRestriction: " cost_cat.cost_type = 'TAX'",
     * calcType: INCOME
     */
    public class CostField {
        /**
         * Calculation type.
         */
        private final String calcType;
        
        /**
         * Cost type restriction.
         */
        private final String costTypeRestriction;
        
        /**
         * Column id.
         */
        private final String fieldId;
        
        /**
         * class constructor.
         *
         * @param fieldId - column id
         * @param costRestriction - cost type restriction
         * @param calcType - calculation type formula
         */
        public CostField(final String fieldId, final String costRestriction, final String calcType) {
            this.fieldId = fieldId;
            this.costTypeRestriction = costRestriction;
            this.calcType = calcType;
        }
        
        /**
         * Get calculation type.
         *
         * @return calcType
         */
        public String getCalcType() {
            return this.calcType;
        }
        
        /**
         * Get cost type restriction.
         *
         * @return costTypeRestriction
         */
        public String getCostTypeRestriction() {
            return this.costTypeRestriction;
        }
        
        /**
         * Get column id.
         *
         * @return fieldId
         */
        public String getFieldId() {
            return this.fieldId;
        }
        
    }
    
    /**
     * Summarize type; values ls, bl, pr or cam_reconciliation.
     */
    private final SummaryType assetType;
    
    /**
     * Asset key.
     */
    private String assetKey;
    
    /**
     * Asset key.
     */
    private String assetTable;
    
    /**
     * Asset id's list.
     */
    private List<String> assetIds;
    
    /**
     * Logged user.
     */
    private User loggedUser;
    
    /**
     * List with cost fields.
     */
    private List<CostField> costFields;
    
    /**
     * Constructor specifying summary type.
     *
     * @param type summary type
     */
    public SummarizeCosts(final String type) {
        this.assetType = SummaryType.fromString(type);
        if (SummaryType.BUILDING.equals(this.assetType)) {
            this.assetKey = DbConstants.BL_ID;
            this.assetTable = DbConstants.BL_TABLE;
        } else if (SummaryType.LEASE.equals(this.assetType)) {
            this.assetKey = DbConstants.LS_ID;
            this.assetTable = DbConstants.LS_TABLE;
        } else if (SummaryType.PROPERTY.equals(this.assetType)) {
            this.assetKey = DbConstants.PR_ID;
            this.assetTable = DbConstants.PR_TABLE;
        } else if (SummaryType.CAM_RECONCILIATION.equals(this.assetType)) {
            this.assetKey = DbConstants.LS_ID;
            this.assetTable = DbConstants.CCOST_SUM_TABLE;
        }
    }
    
    /**
     * Summarize costs.
     *
     * @param parameters request parameters
     * @param isMcAndVatEnabled if Enhanced Global Feature set is enabled
     * @param jobStatus job status
     */
    public void calculate(final RequestParameters parameters, final boolean isMcAndVatEnabled,
            final JobStatus jobStatus) {
        boolean continueJob = true;
        JobStatusUtil.initializeJob(jobStatus, Constants.ONE_HUNDRED, 0);
        // get logged user
        this.loggedUser = ContextStore.get().getUser();
        parameters.setParameterValue(Constants.USER_NAME, this.loggedUser.getName());
        // get asset id's for users selection
        this.assetIds = getAssets(this.assetTable, this.assetKey, parameters);
        
        continueJob = JobStatusUtil.checkJobStatus(jobStatus);
        // get cost fields for asset type
        this.costFields = getCostFields(this.assetType);
        ExchangeRateUtil exchangeRateUtil = null;
        if (continueJob) {
            JobStatusUtil.incrementJobCurrentNo(jobStatus, 2);
            exchangeRateUtil =
                    loadExchangeRates(isMcAndVatEnabled, parameters.getCurrencyCode(),
                        parameters.getExchangeRateType());
            JobStatusUtil.incrementJobCurrentNo(jobStatus, 2);
        }
        
        continueJob = JobStatusUtil.checkJobStatus(jobStatus);
        if (continueJob) {
            continueJob =
                    runInitialTasks(isMcAndVatEnabled, parameters.getBooleanValue("update_area"),
                        jobStatus);
        }
        
        jobStatus.setMessage(CostMessages
            .getLocalizedMessage(CostMessages.JOB_STATUS_PROCESSING_COSTS));
        
        // clear buffer table
        CostHelper.clearBufferTable(this.loggedUser.getName(), this.assetType.toString());
        continueJob = !this.assetIds.isEmpty();
        
        if (continueJob) {
            SummarizeCostsHelper.addAssetsToBufferTable(this.loggedUser.getName(), this.assetType,
                this.assetTable, this.assetKey, this.assetIds, parameters);
        }
        final Iterator<CostField> itCostFields = this.costFields.iterator();
        while (itCostFields.hasNext() && continueJob) {
            final CostField costField = itCostFields.next();
            continueJob = JobStatusUtil.checkJobStatus(jobStatus);
            
            continueJob =
                    calculateCostsForField(this.assetIds, costField, parameters, isMcAndVatEnabled,
                        exchangeRateUtil, jobStatus);
            JobStatusUtil.incrementJobCurrentNo(jobStatus, 90 / this.costFields.size());
            
        }
        
        final List<String> errorMessages = exchangeRateUtil.getMissingExchangeRates();
        if (!errorMessages.isEmpty()) {
            JobStatusUtil.addProperty(jobStatus, Constants.PROPERTY_MISSING_EXCHANGE_RATE,
                errorMessages);
        }
        
        // update job status
        if (continueJob) {
            JobStatusUtil.completeJob(jobStatus);
        }
    }
    
    /**
     * Summarize cost (with details) for selected asset
     *
     * @param parameters request parameters
     * @param isMcAndVatEnabled if MC and Vat is enabled
     * @return JSONObject
     */
    public JSONObject calculateDetails(final RequestParameters parameters,
            final boolean isMcAndVatEnabled) {
        this.loggedUser = ContextStore.get().getUser();
        // get asset id's for users selection
        this.assetIds = getAssets(this.assetTable, this.assetKey, parameters);
        this.costFields = getCostFields(this.assetType);
        
        final ExchangeRateUtil exchangeRateUtil =
                loadExchangeRates(isMcAndVatEnabled, parameters.getCurrencyCode(),
                    parameters.getExchangeRateType());
        
        final Map<String, Map<String, Double>> summarizedCosts =
                new HashMap<String, Map<String, Double>>();
        final Iterator<CostField> itCostFields = this.costFields.iterator();
        while (itCostFields.hasNext()) {
            final CostField costField = itCostFields.next();
            calculateCostsForField(this.assetIds, costField, parameters, isMcAndVatEnabled,
                exchangeRateUtil, summarizedCosts);
        }
        return mapToJSON(summarizedCosts);
    }
    
    /**
     * Summarize cost for Cam reconciliation report.
     *
     * @param leaseId lease id
     * @param parameters request parameters
     * @param isMcAndVatEnabled if Mc And Vat is enabled
     * @param jobStatus job status
     * @return boolean
     */
    public boolean calculateCamReconciliation(final String leaseId,
            final RequestParameters parameters, final boolean isMcAndVatEnabled,
            final JobStatus jobStatus) {
        boolean continueJob = true;
        // get logged user
        this.loggedUser = ContextStore.get().getUser();
        parameters.setParameterValue(Constants.USER_NAME, this.loggedUser.getName());
        continueJob = JobStatusUtil.checkJobStatus(jobStatus);
        ExchangeRateUtil exchangeRateUtil = null;
        if (continueJob) {
            JobStatusUtil.incrementJobCurrentNo(jobStatus, 2);
            // get cost fields for asset type
            exchangeRateUtil =
                    loadExchangeRates(isMcAndVatEnabled, parameters.getCurrencyCode(),
                        parameters.getExchangeRateType());
        }
        // add selected asset to result object
        this.assetIds = new ArrayList<String>();
        this.assetIds.add(leaseId);
        
        SummarizeCostsHelper.addAssetsToBufferTable(this.loggedUser.getName(), this.assetType,
            DbConstants.LS_TABLE, this.assetKey, this.assetIds, parameters);
        
        // summarize base rent costs
        continueJob = JobStatusUtil.checkJobStatus(jobStatus);
        if (continueJob) {
            final CostField baseRentField =
                    new CostField("amount_base_rent",
                        parameters.getParameterValue(Constants.BASE_RENT_ACTIVITY_PARAM),
                        CostProjection.CALCTYPE_NETINCOME);
            
            calculateCostsForField(this.assetIds, baseRentField, parameters, isMcAndVatEnabled,
                exchangeRateUtil, jobStatus);
        }
        // summarize cam estimate cost
        continueJob = JobStatusUtil.checkJobStatus(jobStatus);
        if (continueJob) {
            final CostField camEstimateField =
                    new CostField("amount_operating",
                        parameters.getParameterValue(Constants.CAM_ESTIMATE_ACTIVITY_PARAM),
                        CostProjection.CALCTYPE_NETINCOME);
            calculateCostsForField(this.assetIds, camEstimateField, parameters, isMcAndVatEnabled,
                exchangeRateUtil, jobStatus);
        }
        // cam adjustment costs
        continueJob = JobStatusUtil.checkJobStatus(jobStatus);
        if (continueJob) {
            final CostField camEstimateField =
                    new CostField("amount_pct_rent",
                        parameters.getParameterValue(Constants.CAM_RECONCILIATION_ACTIVITY_PARAM),
                        CostProjection.CALCTYPE_NETINCOME);
            calculateCostsForField(this.assetIds, camEstimateField, parameters, isMcAndVatEnabled,
                exchangeRateUtil, jobStatus);
        }
        continueJob = JobStatusUtil.checkJobStatus(jobStatus);
        if (continueJob) {
            calculateCamFields(leaseId, isMcAndVatEnabled);
        }
        return continueJob;
    }
    
    /**
     * Summarize costs for specified cost field.
     *
     * @param assetIds list with asset id's
     * @param costField cost field
     * @param parameters request parameters
     * @param isMcAndVatEnabled if MC& VAT is enabled
     * @param exchangeRateUtil exchange rate object
     * @param jobStatus job status
     * @return boolean
     */
    private boolean calculateCostsForField(final List<String> assetIds, final CostField costField,
            final RequestParameters parameters, final boolean isMcAndVatEnabled,
            final ExchangeRateUtil exchangeRateUtil, final JobStatus jobStatus) {
        final boolean continueJob = JobStatusUtil.checkJobStatus(jobStatus);

        if (DbConstants.LS_TABLE.equals(this.assetTable)
                || DbConstants.BL_TABLE.equals(this.assetTable)
                || DbConstants.PR_TABLE.equals(this.assetTable)) {
            SummarizeCostsHelper.resetFieldValue(this.assetTable, costField.getFieldId(),
                this.assetKey, assetIds);
        }
        if (parameters.isFromActual() && continueJob) {
            if (Constants.CALCTYPE_TAX.equals(costField.getCalcType())) {
                SummarizeCostsTax.summarizeCosts(costField, DbConstants.COST_TRAN_TABLE,
                    this.assetType, this.assetTable, this.assetKey, assetIds, parameters);
            } else {
                SummarizeCostsHelper.summarizeCosts(costField, DbConstants.COST_TRAN_TABLE,
                    this.assetType, this.assetTable, this.assetKey, assetIds, parameters);
            }
        }
        if (parameters.isFromScheduled() && continueJob) {
            if (Constants.CALCTYPE_TAX.equals(costField.getCalcType())) {
                SummarizeCostsTax.summarizeCosts(costField, DbConstants.COST_TRAN_SCHED_TABLE,
                    this.assetType, this.assetTable, this.assetKey, assetIds, parameters);
            } else {
                SummarizeCostsHelper.summarizeCosts(costField, DbConstants.COST_TRAN_SCHED_TABLE,
                    this.assetType, this.assetTable, this.assetKey, assetIds, parameters);
            }
        }
        if (parameters.isFromRecurring() && continueJob) {
            if (Constants.CALCTYPE_TAX.equals(costField.getCalcType())) {
                SummarizeCostsTax.summarizeCosts(costField, DbConstants.COST_TRAN_RECUR_TABLE,
                    this.assetType, this.assetTable, this.assetKey, assetIds, parameters);
            } else {
                final String sqlString =
                        SummarizeCostsHelper.getCostRestriction(this.assetType, this.assetKey,
                            assetIds, costField, DbConstants.COST_TRAN_RECUR_TABLE,
                            parameters.getDateStart(), parameters.getDateEnd());
                final RecurringCostDataSource recurringCostDataSource =
                        new RecurringCostDataSource();
                final List<RecurringCost> recurringCosts =
                        recurringCostDataSource.findByRestriction(Restrictions.sql(sqlString));
                SummarizeCostsHelper.summarizeRecurringCosts(costField, recurringCosts,
                    this.assetType, this.assetTable, this.assetKey, assetIds, parameters,
                    exchangeRateUtil);
            }
        }

        if (DbConstants.LS_TABLE.equals(this.assetTable)
                || DbConstants.BL_TABLE.equals(this.assetTable)
                || DbConstants.PR_TABLE.equals(this.assetTable)) {
            SummarizeCostsHelper.setCalcDate(this.assetTable, this.assetKey, assetIds, parameters);
        }
        return continueJob;
    }
    
    /**
     * Summarize costs for specified cost field.
     *
     * @param assetIds list with asset id's
     * @param costField cost field
     * @param parameters request parameters
     * @param isMcAndVatEnabled if MC& VAT is enabled
     * @param exchangeRateUtil exchange rate object
     * @param summarizedCosts map that hold summarized values
     */
    private void calculateCostsForField(final List<String> assetIds, final CostField costField,
            final RequestParameters parameters, final boolean isMcAndVatEnabled,
            final ExchangeRateUtil exchangeRateUtil,
            final Map<String, Map<String, Double>> summarizedCosts) {
        final Map<String, Double> costValues = getDefaultCostValues(isMcAndVatEnabled);
        
        if (parameters.isFromActual()) {
            final String sqlString =
                    SummarizeCostsHelper.getCostRestriction(this.assetType, this.assetKey,
                        assetIds, costField, DbConstants.COST_TRAN_TABLE,
                        parameters.getDateStart(), parameters.getDateEnd());
            
            final ActualCostDataSource actualCostDataSource = new ActualCostDataSource();
            final List<ActualCost> actualCosts =
                    actualCostDataSource.findByRestriction(Restrictions.sql(sqlString));
            SummarizeCostsHelper.summarizeActualCosts(costField, costValues, actualCosts,
                parameters, isMcAndVatEnabled, exchangeRateUtil);
        }
        
        if (parameters.isFromScheduled()) {
            final String sqlString =
                    SummarizeCostsHelper.getCostRestriction(this.assetType, this.assetKey,
                        assetIds, costField, DbConstants.COST_TRAN_SCHED_TABLE,
                        parameters.getDateStart(), parameters.getDateEnd());
            
            final ScheduledCostDataSource scheduledCostDataSource = new ScheduledCostDataSource();
            final List<ScheduledCost> scheduledCosts =
                    scheduledCostDataSource.findByRestriction(Restrictions.sql(sqlString));
            SummarizeCostsHelper.summarizeScheduledCosts(costField, costValues, scheduledCosts,
                parameters, isMcAndVatEnabled, exchangeRateUtil);
        }
        
        if (parameters.isFromRecurring()) {
            final String sqlString =
                    SummarizeCostsHelper.getCostRestriction(this.assetType, this.assetKey,
                        assetIds, costField, DbConstants.COST_TRAN_RECUR_TABLE,
                        parameters.getDateStart(), parameters.getDateEnd());
            final RecurringCostDataSource recurringCostDataSource = new RecurringCostDataSource();
            final List<RecurringCost> recurringCosts =
                    recurringCostDataSource.findByRestriction(Restrictions.sql(sqlString));
            SummarizeCostsHelper.summarizeRecurringCosts(costField, costValues, recurringCosts,
                parameters, isMcAndVatEnabled, exchangeRateUtil, false);
        }
        
        summarizedCosts.put(costField.getFieldId(), costValues);
    }
    
    /**
     * Returns list with all asset id's.
     *
     * @param table table name
     * @param primaryKey primary key field
     * @param parameters request parameters
     * @return List<String>
     */
    private List<String> getAssets(final String table, final String primaryKey,
        final RequestParameters parameters) {
        final DataSource dataSource =
                DataSourceFactory.createDataSourceForFields(table, new String[] { primaryKey });
        if (SummaryType.LEASE.equals(this.assetType)) {
            final String costAssocWith = parameters.getCostAssocWith();
            // add restriction as sql string
            dataSource.setApplyVpaRestrictions(false);
            dataSource.addRestriction(Restrictions.eq(table, DbConstants.USE_AS_TEMPLATE, 0));
            dataSource.addRestriction(Restrictions.sql(parameters.getRestrictionForTableAndField(
                DbConstants.LS_TABLE, DbConstants.LS_ID)));
            String sqlRestriction = "";
            if (Constants.LEASES_ALL.equals(costAssocWith)
                    || Constants.LEASES_FOR_BUILDINGS.equals(costAssocWith)) {
                dataSource.addTable(DbConstants.BL_TABLE, DataSource.ROLE_STANDARD);
                sqlRestriction =
                        "EXISTS(SELECT bl.bl_id FROM bl WHERE bl.bl_id = ls.bl_id "
                                + parameters.getLocationRestrictionForTable2("bl")
                                + " AND ${sql.getVpaRestrictionForTable('bl')} )";
            }
            if (Constants.LEASES_ALL.equals(costAssocWith)
                    || Constants.LEASES_FOR_PROPERTIES.equals(costAssocWith)) {
                dataSource.addTable(DbConstants.PR_TABLE, DataSource.ROLE_STANDARD);
                sqlRestriction =
                        (sqlRestriction.length() > 0 ? sqlRestriction + " OR " : "")
                        + "EXISTS(SELECT property.pr_id FROM property WHERE property.pr_id = ls.pr_id "
                        + parameters.getLocationRestrictionForTable2("property")
                        + " AND ${sql.getVpaRestrictionForTable('property')} )";
            }
            
            dataSource.addRestriction(Restrictions.sql(sqlRestriction));
            
        } else {
            dataSource.addRestriction(parameters.getLocationRestrictionForTable(table));
        }
        final List<DataRecord> records = dataSource.getRecords();
        final List<String> results = new ArrayList<String>();
        for (final DataRecord record : records) {
            results.add(record.getString(table + Constants.DOT + primaryKey));
        }
        return results;
    }
    
    /**
     * Calculate additional CAM fields (camCostActual, camDelta)
     *
     * @param leaseId selected lease code
     * @param isMcAndVatEnabled is Mc and Vat is enabled
     */
    private void calculateCamFields(final String leaseId, final boolean isMcAndVatEnabled) {
        final String updateStatement =
                "UPDATE ccost_sum SET amount_other = amount_operating + amount_pct_rent, "
                        + "amount_security = (CASE WHEN amount_pct_rent <> 0 THEN (amount_operating / amount_pct_rent) * 100 ELSE amount_security END) "
                        + "WHERE report_name = "
                        + SqlUtils.formatValueForSql(this.assetType.toString())
                        + " AND user_name = "
                        + SqlUtils.formatValueForSql(this.loggedUser.getName()) + " AND "
                        + this.assetKey + " = " + SqlUtils.formatValueForSql(leaseId);
        
        SqlUtils.executeUpdate(DbConstants.CCOST_SUM_TABLE, updateStatement);
    }
    
    /**
     * Returns list with cost fields for asset type.
     *
     * @param type asset type
     * @return List<CostField>
     */
    // CHECKSTYLE:OFF : Justification: hard-coded list of cost fields (definition copied from
    // Windows application).
    private List<CostField> getCostFields(final SummaryType type) {
        final List<CostField> result = new ArrayList<CostField>();
        if (SummaryType.LEASE.equals(type) || SummaryType.CAM_RECONCILIATION.equals(type)) {
            result.add(new CostField("amount_base_rent", "cost_cat.cost_type = 'BASE RENT'",
                CostProjection.CALCTYPE_NETINCOME));
            result.add(new CostField("amount_operating", "cost_cat.cost_type='OPERATING EXP.'",
                CostProjection.CALCTYPE_NETINCOME));
            result.add(new CostField("amount_other",
                "cost_cat.cost_type NOT IN ('BASE RENT', 'OPERATING EXP.', 'TAX', 'PCT. RENT')",
                CostProjection.CALCTYPE_NETINCOME));
            result.add(new CostField("amount_taxes", "cost_cat.cost_type = 'TAX'",
                CostProjection.CALCTYPE_NETINCOME));
            result.add(new CostField("amount_pct_rent", "cost_cat.cost_type = 'PCT. RENT'",
                CostProjection.CALCTYPE_NETINCOME));
            result.add(new CostField("amount_tot_rent_inc",
                "cost_cat.cost_type IN ('BASE RENT', 'OTHER RENT', 'PCT. RENT')",
                CostProjection.CALCTYPE_INCOME));
            result.add(new CostField("amount_tot_rent_exp",
                "cost_cat.cost_type IN ('BASE RENT', 'OTHER RENT', 'PCT. RENT')",
                CostProjection.CALCTYPE_EXPENSE));
        } else if (SummaryType.PROPERTY.equals(type)) {
            result.add(new CostField("cost_tax_total", "cost_cat.cost_type = 'TAX'",
                CostProjection.CALCTYPE_NETINCOME));
            result.add(new CostField("cost_utility_total", "cost_cat.cost_type = 'UTILITY'",
                CostProjection.CALCTYPE_NETINCOME));
            result.add(new CostField("cost_operating_total",
                "cost_cat.cost_type = 'OPERATING EXP.'", CostProjection.CALCTYPE_NETINCOME));
            result.add(new CostField("cost_other_total",
                "cost_cat.cost_type NOT IN ('TAX','UTILITY','OPERATING EXP.')",
                CostProjection.CALCTYPE_EXPENSE));
            result.add(new CostField("income_total",
                "cost_cat.cost_type NOT IN ('TAX','UTILITY','OPERATING EXP.')",
                CostProjection.CALCTYPE_INCOME));
            result.add(new CostField("tax_rate_prop", "tax_type = 'PROPERTY'",
                Constants.CALCTYPE_TAX));
            result.add(new CostField("value_assessed_prop_tax", "tax_type = 'PROPERTY'",
                Constants.CALCTYPE_TAX));
            result.add(new CostField("tax_rate_school", "tax_type = 'SCHOOL'",
                Constants.CALCTYPE_TAX));
            result.add(new CostField("value_assessed_school_tax", "tax_type = 'SCHOOL'",
                Constants.CALCTYPE_TAX));
        } else {
            result.add(new CostField("cost_tax_total", "cost_cat.cost_type = 'TAX'",
                CostProjection.CALCTYPE_NETINCOME));
            result.add(new CostField("cost_utility_total", "cost_cat.cost_type = 'UTILITY'",
                CostProjection.CALCTYPE_NETINCOME));
            result.add(new CostField("cost_operating_total",
                "cost_cat.cost_type = 'OPERATING EXP.'", CostProjection.CALCTYPE_NETINCOME));
            result.add(new CostField("cost_other_total",
                "cost_cat.cost_type NOT IN ('TAX','UTILITY','OPERATING EXP.')",
                CostProjection.CALCTYPE_EXPENSE));
            result.add(new CostField("income_total",
                "cost_cat.cost_type NOT IN ('TAX','UTILITY','OPERATING EXP.')",
                CostProjection.CALCTYPE_INCOME));
        }
        return result;
    }
    
    // CHECKSTYLE:ON
    /**
     * Perform initial tasks: <li>Check if legacy data is defined () <li>Do proration and update
     * areas.
     *
     * @param isMcEnabled boolean , true if Mc & Vat is enabled
     * @param status job status
     * @return boolean
     */
    private boolean runInitialTasks(final boolean isMcEnabled, final boolean isUpdateArea,
            final JobStatus status) {
        boolean result = true;
        // check legacy data
        if (isMcEnabled && CurrencyUtil.isLegacyDataUpdateRequired()) {
            status.addProperty("updateLegacyCosts", "true");
            status.addProperty("updateLegacyCostsMessage", CurrencyUtil.getErrorDetails());
            status.setCurrentNumber(Constants.ONE_HUNDRED);
            status.setCode(JobStatus.JOB_COMPLETE);
            result = false;
        }
        JobStatusUtil.incrementJobCurrentNo(status, 2);
        // do proration and update areas
        if (isUpdateArea && result && JobStatusUtil.checkJobStatus(status)) {
            result = doProrationAndUpdateAreas(status);
        }
        return result;
    }
    
    /**
     * Perform proration and update lease areas.
     *
     * @param status job status
     * @return boolean
     */
    private boolean doProrationAndUpdateAreas(final JobStatus status) {
        boolean result = true;
        if (SummaryType.LEASE.equals(this.assetType)
                || SummaryType.CAM_RECONCILIATION.equals(this.assetType)) {
            status.setMessage(CostMessages
                .getLocalizedMessage(CostMessages.JOB_STATUS_PRORATION_UPDATE_LS_AREA));
            LeaseAreaUpdate.updateLeaseAreas();
            JobStatusUtil.incrementJobCurrentNo(status, 2);
        }
        result = JobStatusUtil.checkJobStatus(status);
        if (result) {
            status.setMessage(CostMessages
                .getLocalizedMessage(CostMessages.JOB_STATUS_UPDATE_BL_PR_AREA));
            PropertyAreaUpdate.updateBuildingAndPropertyAreas();
            JobStatusUtil.incrementJobCurrentNo(status, 2);
        }
        return result;
    }
    
    /**
     * Return cost field values map initialized to zero.
     *
     * @param isMcAndVatEnabled is Mc and Vat is enabled
     * @return map
     */
    private Map<String, Double> getDefaultCostValues(final boolean isMcAndVatEnabled) {
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
     * Get calculated cost as JSON object.
     *
     * @param objMap map object
     * @return the costs property.
     */
    private JSONObject mapToJSON(final Map<String, Map<String, Double>> objMap) {
        final JSONObject result = new JSONObject();
        final Iterator<String> itFelds = objMap.keySet().iterator();
        while (itFelds.hasNext()) {
            final String field = itFelds.next();
            result.put(field, new JSONObject(objMap.get(field)));
        }
        return result;
    }

}
