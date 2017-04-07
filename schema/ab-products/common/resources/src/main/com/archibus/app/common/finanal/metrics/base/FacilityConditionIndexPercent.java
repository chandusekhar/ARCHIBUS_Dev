package com.archibus.app.common.finanal.metrics.base;

import java.util.*;

import com.archibus.app.common.finanal.domain.*;
import com.archibus.app.common.finanal.impl.*;
import com.archibus.app.common.finanal.metrics.*;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.utility.StringUtil;

/**
 * FCI (%). For all activity_log_items that have activity_type = 'ASSESSMENT' and that are assigned
 * to this asset (i.e. that have activity_log_items.pr_id, bl_id, project_id or eq_id assigned to
 * this asset), calculate ${sql.getFormula("AbCapitalPlanningCA-FacilityConditionIndex")}/100
 *
 * <li>Metric Name: ops_FacilityConditionIndex_percent_an_fy
 * <li>Bean Name : ops_FacilityConditionIndex_percent_an_fy
 *
 * <p>
 *
 * Used by Financial Analysis service. Managed by Spring. Configured in
 * financialMetrics-definition.xml file.
 *
 * @author Ioan Draghici
 * @since 23.1
 *
 */
public class FacilityConditionIndexPercent implements MetricProvider {

    /**
     * Constant.
     */
    private static final String DATE_ASSESSED = "date_assessed";

    /**
     * List with asset types.
     */
    private List<String> assetTypes;

    /**
     * Financial metric object.
     */
    private FinancialMetric metric;

    /**
     * Error message.
     */
    private String errorMessage;

    /** {@inheritDoc} */

    @Override
    public Map<Date, Double> getValues(final FinancialAnalysisParameter financialParameter,
            final Date dateFrom, final Date dateTo) {
        // used when is required to return metric values
        return null;
    }

    /** {@inheritDoc} */

    @Override
    public void calculateValues(final FinancialAnalysisParameter financialParameter,
            final Date dateFrom, final Date dateTo) {
        this.errorMessage = "";
        final AssetType assetType = financialParameter.getAssetType();
        final String assetId = financialParameter.getAssetId();
        final DataSourceGroupingImpl activityLogDataSource = new DataSourceGroupingImpl();
        activityLogDataSource.addTable(Constants.ACTIVITY_LOG, DataSource.ROLE_MAIN);
        activityLogDataSource.addField(Constants.ACTIVITY_LOG, assetType.getAssetFieldName());
        activityLogDataSource.addGroupByField(Constants.ACTIVITY_LOG, assetType.getAssetFieldName(),
            DataSource.DATA_TYPE_TEXT);
        final VirtualFieldDef fciPercentField = new VirtualFieldDef(Constants.ACTIVITY_LOG,
            "vf_fci_percent", DataSource.DATA_TYPE_NUMBER);
        final Map<String, String> sqlExpressions = new HashMap<String, String>();
        sqlExpressions.put("generic",
            "SUM( ${sql.getFormula('AbCapitalPlanningCA-WeightedFCI-Numerator')}/${sql.getFormula('AbCapitalPlanningCA-WeightedFCI-Denominator')} )");
        fciPercentField.addSqlExpressions(sqlExpressions);
        activityLogDataSource.addCalculatedField(fciPercentField);
        activityLogDataSource.addRestriction(
            Restrictions.and(Restrictions.eq(Constants.ACTIVITY_LOG, "activity_type", "ASSESSMENT"),
                Restrictions.eq(Constants.ACTIVITY_LOG, assetType.getAssetFieldName(), assetId)));
        activityLogDataSource.addRestriction(
            Restrictions.and(Restrictions.lte(Constants.ACTIVITY_LOG, DATE_ASSESSED, dateTo),
                Restrictions.gte(Constants.ACTIVITY_LOG, DATE_ASSESSED, dateFrom)));
        activityLogDataSource.addRestriction(Restrictions.in(Constants.ACTIVITY_LOG, "status",
            "REQUESTED, APPROVED, BUDGETED, PLANNED, SCHEDULED"));

        final DataRecord record = activityLogDataSource.getRecord();
        if (record != null) {
            double metricValue = record.getDouble(Constants.ACTIVITY_LOG + ".vf_fci_percent");

            metricValue = MetricProviderUtils.round(metricValue, this.metric.getMetricDecimals());
            MetricProviderUtils.saveToFinancialSummary(financialParameter, dateFrom,
                this.metric.getResultField(), metricValue);
        }
    }

    /** {@inheritDoc} */

    @Override
    public void setMetric(final FinancialMetric metric) {
        this.metric = metric;
    }

    /** {@inheritDoc} */

    @Override
    public boolean isApplicableForAssetType(final AssetType assetType) {
        return this.assetTypes.contains(assetType.toString());
    }

    /** {@inheritDoc} */

    @Override
    public boolean isApplicableForAllAssetTypes() {
        return StringUtil.isNullOrEmpty(this.assetTypes);
    }

    /** {@inheritDoc} */

    @Override
    public String getAssetTypeRestriction() {
        return MetricProviderUtils.getAssetTypeRestrictionForTable(Constants.FINANAL_PARAMS,
            this.assetTypes);
    }

    /**
     * Getter for the assetTypes property.
     *
     * @see assetTypes
     * @return the assetTypes property.
     */
    public List<String> getAssetTypes() {
        return this.assetTypes;
    }

    /**
     * Setter for the assetTypes property.
     *
     * @see assetTypes
     * @param assetTypes the assetTypes to set
     */

    public void setAssetTypes(final List<String> assetTypes) {
        this.assetTypes = assetTypes;
    }

    /** {@inheritDoc} */

    @Override
    public String getErrorMessage() {
        return this.errorMessage;
    }
}
