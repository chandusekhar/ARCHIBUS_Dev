package com.archibus.service.cost;

import java.util.Map;

import org.json.JSONObject;

import com.archibus.app.common.finance.dao.ICostDao;
import com.archibus.app.common.finance.dao.datasource.RecurringCostDataSource;
import com.archibus.app.common.finance.domain.RecurringCost;
import com.archibus.datasource.DataSource;
import com.archibus.datasource.data.DataSet;
import com.archibus.jobmanager.JobBase;
import com.archibus.utility.StringUtil;

/**
 *
 * Provides WFR-ules for cost reporting.
 * <p>
 *
 *
 * @author Ioan Draghici
 * @since 21.1
 *
 */
public class CostReportingService extends JobBase {
    
    /**
     * If Enhanced Global feature set is enabled.
     */
    private boolean isMcAndVatEnabled;
    
    /**
     * Reference to custom data source used to load recurring cost objects. This reference is set by
     * WebC container based on Spring configuration file
     * schema/ab-products/solutions/common/appContext-services.xml.
     */
    private ICostDao<RecurringCost> recurringCostDataSource;
    
    /**
     * Configuration properties for cost calculation.
     */
    private Configuration configuration;
    
    /**
     * Returns Straight Line Rent projection.
     *
     * @param requestParam request parameters
     * @return data set
     */
    public DataSet getStraightLineRentProjection(final Map<String, String> requestParam) {
        // initialize report request parameters.
        final RequestParameters parameters = new RequestParameters(requestParam);
        parameters.setParameterValue(Constants.IS_FOR_SLR, Constants.TRUE);
        final StraightLineRent straightLineRent = new StraightLineRent();
        final CostProjection projection =
                straightLineRent.createProjection(parameters, this.status);
        initPerRequestState();
        final boolean isGroupByCostCateg =
                parameters.getBooleanValue(Constants.GROUP_BY_COST_CATEG);
        final DataSet dataSet =
                CostHelper.projectionToDataSet(projection,
                    (DataSource) this.recurringCostDataSource, isGroupByCostCateg,
                    isGroupByCostCateg, parameters.getMultipleValueSeparator());
        this.status.setDataSet(dataSet);
        return dataSet;
    }
    
    /**
     * Calculate CAM Reconciliation costs.
     *
     * @param leaseId lease code
     * @param requestParam request parameters
     */
    public void calculateCamReconciliation(final String leaseId,
            final Map<String, String> requestParam) {
        final RequestParameters parameters = new RequestParameters(requestParam);
        this.isMcAndVatEnabled = parameters.isMcAndVatEnabled();
        initializeCostCateg(parameters);
        CostHelper.calculateCamReconciliationData(leaseId, this.isMcAndVatEnabled, parameters,
            this.status);
    }
    
    /**
     * Start summarize costs job. Used by financial reports.
     *
     * @param type summarize cost for buildings, properties or leases (for buildings, properties or
     *            all)
     * @param requestParam map with request parameters (filter options)
     */
    public void summarizeCosts(final String type, final Map<String, String> requestParam) {
        final SummarizeCosts summarizeCosts = new SummarizeCosts(type);
        final RequestParameters parameters = new RequestParameters(requestParam);
        this.isMcAndVatEnabled = parameters.isMcAndVatEnabled();
        summarizeCosts.calculate(parameters, this.isMcAndVatEnabled, this.status);
    }
    
    /**
     * Start summarize costs job. Used by financial reports.
     *
     * @param type summarize cost for buildings, properties or leases (for buildings, properties or
     *            all)
     * @param requestParam map with request parameters (filter options)
     * @return JSONObject
     */
    public JSONObject summarizeCostsDetails(final String type,
            final Map<String, String> requestParam) {
        final SummarizeCosts summarizeCosts = new SummarizeCosts(type);
        final RequestParameters parameters = new RequestParameters(requestParam);
        this.isMcAndVatEnabled = parameters.isMcAndVatEnabled();
        return summarizeCosts.calculateDetails(parameters, this.isMcAndVatEnabled);
    }
    
    /**
     * Returns cash flow projection.
     *
     * @param requestParam request parameters
     * @return DataSet
     */
    public DataSet getCashFlowProjection(final Map<String, String> requestParam) {
        boolean continueJob = true;
        final RequestParameters parameters = new RequestParameters(requestParam);
        this.isMcAndVatEnabled = parameters.isMcAndVatEnabled();
        // check if update to legacy data is required
        if (this.isMcAndVatEnabled && CurrencyUtil.isLegacyDataUpdateRequired()) {
            this.status.addProperty("updateLegacyCosts", Constants.TRUE);
            this.status.addProperty("updateLegacyCostsMessage", CurrencyUtil.getErrorDetails());
            continueJob = false;
            JobStatusUtil.completeJob(this.status);
        }

        CostProjection projection =
                CostHelper.createEmptyProjection(this.recurringCostDataSource, parameters,
                    this.configuration.getDefaultDateStart(),
                    this.configuration.getDefaultDateEnd());
        initPerRequestState();
        final boolean isGroupByCostCategory =
                parameters.getBooleanValue(Constants.GROUP_BY_COST_CATEG);
        if (continueJob) {
            projection =
                    CostHelper.calculateCashFlowProjection(this.recurringCostDataSource,
                        parameters, this.configuration.getDefaultDateStart(),
                        this.configuration.getDefaultDateEnd(), this.status);
        }
        
        DataSet dataSet = null;
        continueJob = continueJob && JobStatusUtil.checkJobStatus(this.status);
        if (continueJob) {
            dataSet =
                    CostHelper.projectionToDataSet(projection,
                        (DataSource) this.recurringCostDataSource, isGroupByCostCategory, false,
                        parameters.getMultipleValueSeparator());
        } else {
            dataSet = CostHelper.createEmptyDataSet(projection);
        }
        this.status.setDataSet(dataSet);
        return dataSet;
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
     * Initializes per-request state variables.
     */
    private void initPerRequestState() {
        this.configuration.loadSchemaPreferences();
        if (this.recurringCostDataSource == null) {
            this.recurringCostDataSource = new RecurringCostDataSource();
        }
    }
    
    /**
     * Initialize cost categories.
     *
     * @param parameters request parameters
     */
    private void initializeCostCateg(final RequestParameters parameters) {
        // base rent
        if (StringUtil
            .notNullOrEmpty(parameters.getStringValue(Constants.BASE_RENT_ACTIVITY_PARAM))) {
            parameters.setParameterValue(
                Constants.BASE_RENT_ACTIVITY_PARAM,
                getActivityParameterValue(Constants.REPM_COST_ACTIVITY_ID,
                    Constants.BASE_RENT_ACTIVITY_PARAM, Constants.BASE_RENT_COST_CATEG));
        }
        // CAM estimate
        if (StringUtil.notNullOrEmpty(parameters
            .getStringValue(Constants.CAM_ESTIMATE_ACTIVITY_PARAM))) {
            parameters.setParameterValue(
                Constants.CAM_ESTIMATE_ACTIVITY_PARAM,
                getActivityParameterValue(Constants.REPM_COST_ACTIVITY_ID,
                    Constants.CAM_ESTIMATE_ACTIVITY_PARAM, Constants.CAM_ESTIMATE_COST_CATEG));
        }
        // CAM estimate
        if (StringUtil.notNullOrEmpty(parameters
            .getStringValue(Constants.CAM_RECONCILIATION_ACTIVITY_PARAM))) {
            parameters.setParameterValue(
                Constants.CAM_RECONCILIATION_ACTIVITY_PARAM,
                getActivityParameterValue(Constants.REPM_COST_ACTIVITY_ID,
                    Constants.CAM_RECONCILIATION_ACTIVITY_PARAM,
                    Constants.CAM_RECONCILIATION_COST_CATEG));
        }
    }
    
    /**
     * Get activity parameters value.
     *
     * @param activityId activity id
     * @param paramName parameter name
     * @param defaultValue default value
     * @return parameter value
     */
    private String getActivityParameterValue(final String activityId, final String paramName,
            final String defaultValue) {
        String value =
                com.archibus.service.Configuration
                    .getActivityParameterString(activityId, paramName);
        if (StringUtil.isNullOrEmpty(value)) {
            value = defaultValue;
        }
        // if we have multiple values replace separator with comma.
        value = value.replaceAll(";", ",");
        return value;
    }
    
}
