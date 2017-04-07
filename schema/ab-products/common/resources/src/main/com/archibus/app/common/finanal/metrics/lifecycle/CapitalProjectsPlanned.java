package com.archibus.app.common.finanal.metrics.lifecycle;

import java.util.*;

import com.archibus.app.common.finanal.domain.*;
import com.archibus.app.common.finanal.impl.*;
import com.archibus.app.common.finanal.metrics.*;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.utility.StringUtil;

/**
 * Capital Projects Planned (lifetime). Query from Inventory
 *
 * <li>Metric Name: cap_CapitalProjects-Planned-lifetime_an; cap_CapitalProjects-Planned-3years_an
 * <li>Bean Name : cap_CapitalProjects_Planned_lifetime_an; cap_CapitalProjects_Planned_3years_an
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
public class CapitalProjectsPlanned implements MetricProvider {

    /**
     * Constant.
     */
    private static final String CAP_CAPITALPROJECTS_PLANNED_3YEARS_AN =
            "cap_CapitalProjects-Planned-3years_an";

    /**
     * Constant.
     */
    private static final String CAP_CAPITALPROJECTS_PLANNED_LIFECYCLE_AN =
            "cap_CapitalProjects-Planned-lifecycle_an";

    /**
     * Constant.
     */
    private static final String CAP_CAPITALPROJECTS_PLANNED_LIFETIME_AN =
            "cap_CapitalProjects-Planned-lifetime_an";

    /**
     * Constant.
     */
    private static final String VF_METRIC_VALUE = ".vf_metric_value";

    /**
     * Constant.
     */
    private static final String PARAM_FROM_DATE = "param_from_date";

    /**
     * Constant.
     */
    private static final String PARAM_TO_DATE = "param_to_date";

    /**
     * List with asset types.
     */
    private List<String> assetTypes;

    /**
     * Error message string.
     */
    private String errorMessage = "";

    /**
     * Financial metric object.
     */
    private FinancialMetric metric;

    /** {@inheritDoc} */

    @Override
    public Map<Date, Double> getValues(final FinancialAnalysisParameter financialParameter,
            final Date dateFrom, final Date dateTo) {
        // use when is required to return metric values
        return null;
    }

    /** {@inheritDoc} */

    @Override
    public void calculateValues(final FinancialAnalysisParameter financialParameter,
            final Date dateFrom, final Date dateTo) {
        this.errorMessage = "";
        if (isValidFinancialParameter(financialParameter)) {
            // query data from inventory
            final DataSourceGroupingImpl projectDataSource =
                    createProjectDataSource(financialParameter);
            projectDataSource.addRestriction(Restrictions.eq(DbConstants.PROJECT_TABLE,
                financialParameter.getAssetType().getAssetFieldName(),
                financialParameter.getAssetId()));

            if (CAP_CAPITALPROJECTS_PLANNED_LIFECYCLE_AN.equals(this.metric.getName())) {
                calculateFinancialSummaryLifecycleValues(projectDataSource, financialParameter,
                    dateFrom);
            } else {
                calculateFinancialSummaryValues(projectDataSource, financialParameter, dateFrom,
                    dateTo);
            }
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

    /**
     * Create project grouping data source.
     *
     * @param financialParameter financial parameter
     * @return DataSource
     */
    private DataSourceGroupingImpl createProjectDataSource(
            final FinancialAnalysisParameter financialParameter) {
        final DataSourceGroupingImpl projectDataSource = new DataSourceGroupingImpl();
        projectDataSource.addTable(DbConstants.PROJECT_TABLE, DataSource.ROLE_MAIN);
        projectDataSource.addField(DbConstants.PROJECT_TABLE,
            financialParameter.getAssetType().getAssetFieldName());
        projectDataSource.addGroupByField(DbConstants.PROJECT_TABLE,
            financialParameter.getAssetType().getAssetFieldName(), null);

        final VirtualFieldDef calculatedField = new VirtualFieldDef(DbConstants.PROJECT_TABLE,
            "vf_metric_value", DataSource.DATA_TYPE_NUMBER);
        final Map<String, String> sqlExpressions = new HashMap<String, String>();
        sqlExpressions.put("generic",
            "SUM(CASE WHEN project.cost_est_baseline = 0.0 THEN project.cost_budget  ELSE project.cost_est_baseline END)");
        calculatedField.addSqlExpressions(sqlExpressions);
        projectDataSource.addCalculatedField(calculatedField);
        return projectDataSource;
    }

    /**
     * Calculate and save financial summary values.
     *
     * @param projectDataSource data source object
     * @param financialParameter financial analysis parameter
     * @param dateFrom start date
     * @param dateTo end date
     */
    private void calculateFinancialSummaryValues(final DataSourceGroupingImpl projectDataSource,
            final FinancialAnalysisParameter financialParameter, final Date dateFrom,
            final Date dateTo) {
        projectDataSource.addRestriction(Restrictions.sql(
            "(project.status IN ('Approved','Approved-In Design','Issued-In Process','Issued-On Hold','Issued-Stopped',"
                    + "'Completed-Pending','Completed-Not Ver','Completed-Verified','Closed') OR funding_probability >= 90)"));
        if (CAP_CAPITALPROJECTS_PLANNED_3YEARS_AN.equals(this.metric.getName())) {
            final Date dateWithinThreeYears = DateUtils.incrementDate(dateTo, Calendar.YEAR, 3);
            projectDataSource.addRestriction(Restrictions.and(
                Restrictions.gte(DbConstants.PROJECT_TABLE, DbConstants.DATE_START, dateFrom),
                Restrictions.lte(DbConstants.PROJECT_TABLE, DbConstants.DATE_START,
                    dateWithinThreeYears)));
        } else if (CAP_CAPITALPROJECTS_PLANNED_LIFETIME_AN.equals(this.metric.getName())) {
            projectDataSource.addRestriction(
                Restrictions.gte(DbConstants.PROJECT_TABLE, DbConstants.DATE_START, dateFrom));
        }

        final DataRecord record = projectDataSource.getRecord();
        if (record != null) {
            double metricValue = record.getDouble(DbConstants.PROJECT_TABLE + VF_METRIC_VALUE);
            metricValue = MetricProviderUtils.round(metricValue, this.metric.getMetricDecimals());
            MetricProviderUtils.saveToFinancialSummary(financialParameter, dateFrom,
                this.metric.getResultField(), metricValue);
        }
    }

    /**
     * Calculate and save financial summary values.
     *
     * @param projectDataSource data source object
     * @param financialParameter financial analysis parameter
     * @param calculationDate calculation date
     */
    private void calculateFinancialSummaryLifecycleValues(
            final DataSourceGroupingImpl projectDataSource,
            final FinancialAnalysisParameter financialParameter, final Date calculationDate) {
        final int startYear = DateUtils.getFiscalYearForDate(financialParameter.getDatePurchased());
        final int period = financialParameter.getPlannedLife();
        // final int yearDiff = DateUtils.getFieldFromDate(Calendar.YEAR, calculationDate)
        // - DateUtils.getFiscalYearForDate(financialParameter.getDatePurchased());
        // if (financialParameter.getPlannedLife() > yearDiff) {
        // period = yearDiff;
        // }

        projectDataSource.addRestriction(Restrictions.sql(
            "(project.status IN ('Approved', 'Approved-In Design', 'Issued-In Process', 'Issued-On Hold', "
                    + "'Issued-Stopped', 'Completed-Pending', 'Completed-Not Ver', 'Completed-Verified', 'Closed') OR funding_probability >= 90)"));

        projectDataSource.addRestriction(Restrictions.sql(
            "(project.date_start >= ${parameters['param_from_date']} AND project.date_start <= ${parameters['param_to_date']} )"));
        projectDataSource.addParameter(PARAM_FROM_DATE, new Date(), DataSource.DATA_TYPE_DATE);
        projectDataSource.addParameter(PARAM_TO_DATE, new Date(), DataSource.DATA_TYPE_DATE);

        for (int index = 0; index < period; index++) {
            final int fiscalYear = startYear + index;
            final Date intervalStart = DateUtils.getFiscalYearStartDate(fiscalYear);
            final Date intervalEnd = DateUtils.getFiscalYearEndDate(fiscalYear);
            projectDataSource.setParameter(PARAM_FROM_DATE, intervalStart);
            projectDataSource.setParameter(PARAM_TO_DATE, intervalEnd);

            final DataRecord record = projectDataSource.getRecord();
            double metricValue = (record != null)
                    ? record.getDouble(DbConstants.PROJECT_TABLE + VF_METRIC_VALUE) : 0.0;
            metricValue = MetricProviderUtils.round(metricValue, this.metric.getMetricDecimals());
            MetricProviderUtils.saveToFinancialSummaryLifecycle(financialParameter, intervalStart,
                this.metric.getName(), metricValue);
        }

    }

    /**
     * Validate financial parameter settings.
     *
     * @param financialAnalysisParameter financial parameter
     * @return boolean
     */
    private boolean isValidFinancialParameter(
            final FinancialAnalysisParameter financialAnalysisParameter) {
        String message = "Metric Name: " + this.metric.getName() + "; Asset Type: "
                + financialAnalysisParameter.getAssetType().toString() + "; Asset Id: "
                + financialAnalysisParameter.getAssetId();
        boolean isValid = true;
        if (StringUtil.isNullOrEmpty(financialAnalysisParameter.getDatePurchased())) {
            isValid = false;
            message += " ; Undefined Purchase Date !";
        }

        if (CAP_CAPITALPROJECTS_PLANNED_LIFECYCLE_AN.equals(this.metric.getName())
                && financialAnalysisParameter.getPlannedLife() == 0) {
            isValid = false;
            message += "; Undefined planned life!";
        }

        if (!isValid) {
            this.errorMessage = message;
        }
        return isValid;
    }

}
