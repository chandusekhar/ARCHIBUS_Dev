package com.archibus.app.common.metrics.domain;

import java.util.Date;

import com.archibus.app.common.metrics.*;
import com.archibus.app.common.metrics.domain.trenddirection.*;
import com.archibus.datasource.*;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.utility.StringUtil;

/**
 * Domain object for user defined metric.
 * <p>
 * Mapped to <code>afm_metric_definitions</code> table.
 *
 * Suppress PMD warnings, "ExcessivePublicCount", "TooManyFields".
 * <p>
 * Justification: this class represents a database record and all fields and their getters/setters
 * are required for display and/or processing.
 *
 * @author Ioan Draghici
 * @since 21.2
 *
 */
@SuppressWarnings({ "PMD.ExcessivePublicCount", "PMD.TooManyFields" })
public class Metric {

    /**
     * Metric name.
     */
    private String name;

    /**
     * Metric title.
     */
    private String title;

    /**
     * Description.
     */
    private String description;

    /**
     * Description.
     */
    private String businessImplication;

    /**
     * Assumptions.
     */
    private String assumptions;

    /**
     * Aggregate method.
     */
    private String aggregateAs;

    /**
     * Start date field name.
     */
    private String startDateField;

    /**
     * End date field name.
     */
    private String endDateField;

    /**
     * Table name.
     */
    private String collectTable;

    /**
     * Metric collect date.
     */
    private Date collectDate;

    /**
     * Collect formula.
     */
    private String formula;

    /**
     * Where clause statement.
     */
    private String whereClause;

    /**
     * Metric status.
     */
    private String status;

    /**
     * Metric test status.
     */
    private String testStatus;

    /**
     * Recurring rule.
     */
    private String recurringRule;

    /**
     * Numerator metric code.
     */
    private String numerator;

    /**
     * Denominator metric code.
     */
    private String denominator;

    /**
     * Numeric format (afm_metric_definitions.value_disp_numeric).
     */
    private String numericFormat;

    /**
     * Display format (afm_metric_definitions.value_disp_format).
     */
    private String displayFormat;

    /**
     * Display format - metric (afm_metric_definitions.value_disp_format_m).
     */
    private String displayFormatMetric;

    /**
     * Decimals (afm_metric_definitions.value_disp_decimals).
     */
    private String decimals;

    /**
     * This attribute is used for trend direction interpretation, which specifies whether an
     * increase in this metric’s values from the last time period has a positive / negative business
     * influence.
     * <p>
     * Smaller is Better / 0 - Smaller values have positive business significance (e.g. expenses).
     * <p>
     * Larger is Better / 1 - Larger values have positive business significance (e.g. revenue).
     * <p>
     * On Target is Better / 2 - Values outside of target range have negative business significance
     * (e.g. vacancy rate, temperature).
     * <p>
     * No Significance / 3 - Values have neutral business significance (e.g. count of buildings)
     */
    private int reportTrendDir;

    /**
     * High "red", "critical" or "error" level for the metric.
     */
    private double reportLimitHighCritical;

    /**
     * High "yellow" or "warning" level for the metric.
     */
    private double reportLimitHighWarning;

    /**
     * The metric’s value targeted by the client / considered optimal.
     */
    private double reportLimitTarget;

    /**
     * Low "yellow" or "warning" level for the metric.
     */
    private double reportLimitLowWarning;

    /**
     * Low "red", "critical" or "error" level for the metric.
     */
    private double reportLimitLowCritical;

    /**
     * Remove metric trend values method.
     */
    private String valuesRemoveMethod;

    /**
     * Remove metric trend values older than X days.
     */
    private int valuesRemoveOlderThan;

    /**
     * Report benchmark value.
     */
    private double reportBenchmarkValue;

    /**
     * Trend direction factor.
     */
    private int sampleTrendDir;

    /**
     * @return the name
     */
    public String getName() {
        return this.name;
    }

    /**
     * @param name the name to set
     */
    public void setName(final String name) {
        this.name = name;
    }

    /**
     * Getter for the title property.
     *
     * @see title
     * @return the title property.
     */
    public String getTitle() {
        return this.title;
    }

    /**
     * Setter for the title property.
     *
     * @see title
     * @param title the title to set
     */

    public void setTitle(final String title) {
        this.title = title;
    }

    /**
     * Getter for the description property.
     *
     * @see description
     * @return the description property.
     */
    public String getDescription() {
        return this.description;
    }

    /**
     * Setter for the description property.
     *
     * @see description
     * @param description the description to set
     */

    public void setDescription(final String description) {
        this.description = description;
    }

    /**
     * Getter for the businessImplication property.
     *
     * @see businessImplication
     * @return the businessImplication property.
     */
    public String getBusinessImplication() {
        return this.businessImplication;
    }

    /**
     * Setter for the businessImplication property.
     *
     * @see businessImplication
     * @param businessImplication the businessImplication to set
     */

    public void setBusinessImplication(final String businessImplication) {
        this.businessImplication = businessImplication;
    }

    /**
     * Getter for the assumptions property.
     *
     * @see assumptions
     * @return the assumptions property.
     */
    public String getAssumptions() {
        return this.assumptions;
    }

    /**
     * Setter for the assumptions property.
     *
     * @see assumptions
     * @param assumptions the assumptions to set
     */

    public void setAssumptions(final String assumptions) {
        this.assumptions = assumptions;
    }

    /**
     * @return the aggregateAs
     */
    public String getAggregateAs() {
        return this.aggregateAs;
    }

    /**
     * @param aggregateAs the aggregateAs to set
     */
    public void setAggregateAs(final String aggregateAs) {
        this.aggregateAs = aggregateAs;
    }

    /**
     * Getter for the startDateField property.
     *
     * @see startDateField
     * @return the startDateField property.
     */
    public String getStartDateField() {
        return this.startDateField;
    }

    /**
     * Setter for the startDateField property.
     *
     * @see startDateField
     * @param startDateField the startDateField to set
     */

    public void setStartDateField(final String startDateField) {
        this.startDateField = startDateField;
    }

    /**
     * Getter for the endDateField property.
     *
     * @see endDateField
     * @return the endDateField property.
     */
    public String getEndDateField() {
        return this.endDateField;
    }

    /**
     * Setter for the tableName property.
     *
     * @see tableName
     * @param tableName the tableName to set
     */

    public void setCollectTable(final String tableName) {
        this.collectTable = tableName;
    }

    /**
     * Setter for the endDateField property.
     *
     * @see endDateField
     * @param endDateField the endDateField to set
     */

    public void setEndDateField(final String endDateField) {
        this.endDateField = endDateField;
    }

    /**
     * Setter for the collectDate property.
     *
     * @see collectDate
     * @param collectDate the collectDate to set
     */

    public void setCollectDate(final Date collectDate) {
        this.collectDate = collectDate;
    }

    /**
     * Getter for the tableName property.
     *
     * @see collectTable
     * @return the tableName property.
     */
    public String getCollectTable() {
        return this.collectTable;
    }

    /**
     * Getter for the collectDate property.
     *
     * @see collectDate
     * @return the collectDate property.
     */
    public Date getCollectDate() {
        return this.collectDate;
    }

    /**
     * Getter for the formula property.
     *
     * @see formula
     * @return the formula property.
     */
    public String getFormula() {
        String result = null;
        if (!isCustomWfr() && !isFieldName() && !isRatioMetric()) {
            result = this.formula;
        }
        return result;
    }

    /**
     * Setter for the formula property.
     *
     * @see formula
     * @param formula the formula to set
     */

    public void setFormula(final String formula) {
        this.formula = formula;
    }

    /**
     * Getter for the whereClause property.
     *
     * @see whereClause
     * @return the whereClause property.
     */
    public String getWhereClause() {
        return this.whereClause;
    }

    /**
     * Setter for the whereClause property.
     *
     * @see whereClause
     * @param whereClause the whereClause to set
     */

    public void setWhereClause(final String whereClause) {
        this.whereClause = whereClause;
    }

    /**
     * Getter for the status property.
     *
     * @see status
     * @return the status property.
     */
    public String getStatus() {
        return this.status;
    }

    /**
     * Setter for the status property.
     *
     * @see status
     * @param status the status to set
     */

    public void setStatus(final String status) {
        this.status = status;
    }

    /**
     * Getter for the testStatus property.
     *
     * @see testStatus
     * @return the testStatus property.
     */
    public String getTestStatus() {
        return this.testStatus;
    }

    /**
     * Setter for the testStatus property.
     *
     * @see testStatus
     * @param testStatus the testStatus to set
     */

    public void setTestStatus(final String testStatus) {
        this.testStatus = testStatus;
    }

    /**
     * If metric is defined with custom WFR.
     *
     * @return boolean
     */
    public boolean isCustomWfr() {
        return this.formula.indexOf(Constants.BEAN) == 0;
    }

    /**
     * If metric is defined with db field name.
     *
     * @return boolean
     */
    public boolean isFieldName() {
        return this.formula.indexOf(Constants.FIELD) == 0;
    }

    /**
     * Returns metric bean name for custom WFR.
     *
     * @return string
     */
    public String getBeanName() {
        return this.formula.substring(Constants.BEAN.length());
    }

    /**
     * Returns metric field name.
     *
     * @return string
     */
    public String getCollectField() {
        String result = null;
        if (isFieldName()) {
            result = this.formula.substring(Constants.FIELD.length());
        }
        return result;
    }

    /**
     * @return the recurringRule
     */
    public String getRecurringRule() {
        return this.recurringRule;
    }

    /**
     * @param recurringRule the recurringRule to set
     */
    public void setRecurringRule(final String recurringRule) {
        this.recurringRule = recurringRule;
    }

    /**
     * @return the numerator
     */
    public String getNumerator() {
        return this.numerator;
    }

    /**
     * @param numerator the numerator to set
     */
    public void setNumerator(final String numerator) {
        this.numerator = numerator;
    }

    /**
     * @return the denominator
     */
    public String getDenominator() {
        return this.denominator;
    }

    /**
     * @param denominator the denominator to set
     */
    public void setDenominator(final String denominator) {
        this.denominator = denominator;
    }

    /**
     * Getter for the numericFormat property.
     *
     * @see numericFormat
     * @return the numericFormat property.
     */
    public String getNumericFormat() {
        return this.numericFormat;
    }

    /**
     * Setter for the numericFormat property.
     *
     * @see numericFormat
     * @param numericFormat the numericFormat to set
     */

    public void setNumericFormat(final String numericFormat) {
        this.numericFormat = numericFormat;
    }

    /**
     * Getter for the displayFormat property.
     *
     * @see displayFormat
     * @return the displayFormat property.
     */
    public String getDisplayFormat() {
        return this.displayFormat;
    }

    /**
     * Setter for the displayFormat property.
     *
     * @see displayFormat
     * @param displayFormat the displayFormat to set
     */

    public void setDisplayFormat(final String displayFormat) {
        this.displayFormat = displayFormat;
    }

    /**
     * Getter for the displayFormatMetric property.
     *
     * @see displayFormatMetric
     * @return the displayFormatMetric property.
     */
    public String getDisplayFormatMetric() {
        return this.displayFormatMetric;
    }

    /**
     * Setter for the displayFormatMetric property.
     *
     * @see displayFormatMetric
     * @param displayFormatMetric the displayFormatMetric to set
     */

    public void setDisplayFormatMetric(final String displayFormatMetric) {
        this.displayFormatMetric = displayFormatMetric;
    }

    /**
     * Getter for the decimals property.
     *
     * @see decimals
     * @return the decimals property.
     */
    public String getDecimals() {
        return this.decimals;
    }

    /**
     * Setter for the decimals property.
     *
     * @see decimals
     * @param decimals the decimals to set
     */

    public void setDecimals(final String decimals) {
        this.decimals = decimals;
    }

    /**
     * Getter for the reportTrendDir property.
     *
     * @see reportTrendDir
     * @return the reportTrendDir property.
     */
    public int getReportTrendDir() {
        return this.reportTrendDir;
    }

    /**
     * Setter for the reportTrendDir property.
     *
     * @see reportTrendDir
     * @param reportTrendDir the reportTrendDir to set
     */

    public void setReportTrendDir(final int reportTrendDir) {
        this.reportTrendDir = reportTrendDir;
    }

    /**
     * Getter for the reportLimitHighCritical property.
     *
     * @see reportLimitHighCritical
     * @return the reportLimitHighCritical property.
     */
    public double getReportLimitHighCritical() {
        return this.reportLimitHighCritical;
    }

    /**
     * Setter for the reportLimitHighCritical property.
     *
     * @see reportLimitHighCritical
     * @param reportLimitHighCritical the reportLimitHighCritical to set
     */

    public void setReportLimitHighCritical(final double reportLimitHighCritical) {
        this.reportLimitHighCritical = reportLimitHighCritical;
    }

    /**
     * Getter for the reportLimitHighWarning property.
     *
     * @see reportLimitHighWarning
     * @return the reportLimitHighWarning property.
     */
    public double getReportLimitHighWarning() {
        return this.reportLimitHighWarning;
    }

    /**
     * Setter for the reportLimitHighWarning property.
     *
     * @see reportLimitHighWarning
     * @param reportLimitHighWarning the reportLimitHighWarning to set
     */

    public void setReportLimitHighWarning(final double reportLimitHighWarning) {
        this.reportLimitHighWarning = reportLimitHighWarning;
    }

    /**
     * Getter for the reportLimitTarget property.
     *
     * @see reportLimitTarget
     * @return the reportLimitTarget property.
     */
    public double getReportLimitTarget() {
        return this.reportLimitTarget;
    }

    /**
     * Setter for the reportLimitTarget property.
     *
     * @see reportLimitTarget
     * @param reportLimitTarget the reportLimitTarget to set
     */

    public void setReportLimitTarget(final double reportLimitTarget) {
        this.reportLimitTarget = reportLimitTarget;
    }

    /**
     * Getter for the reportLimitLowWarning property.
     *
     * @see reportLimitLowWarning
     * @return the reportLimitLowWarning property.
     */
    public double getReportLimitLowWarning() {
        return this.reportLimitLowWarning;
    }

    /**
     * Setter for the reportLimitLowWarning property.
     *
     * @see reportLimitLowWarning
     * @param reportLimitLowWarning the reportLimitLowWarning to set
     */

    public void setReportLimitLowWarning(final double reportLimitLowWarning) {
        this.reportLimitLowWarning = reportLimitLowWarning;
    }

    /**
     * Getter for the reportLimitLowCritical property.
     *
     * @see reportLimitLowCritical
     * @return the reportLimitLowCritical property.
     */
    public double getReportLimitLowCritical() {
        return this.reportLimitLowCritical;
    }

    /**
     * Setter for the reportLimitLowCritical property.
     *
     * @see reportLimitLowCritical
     * @param reportLimitLowCritical the reportLimitLowCritical to set
     */

    public void setReportLimitLowCritical(final double reportLimitLowCritical) {
        this.reportLimitLowCritical = reportLimitLowCritical;
    }

    /**
     * If current metric is ratio metric.
     *
     * @return boolean
     */
    public boolean isRatioMetric() {
        return StringUtil.notNullOrEmpty(this.numerator)
                && StringUtil.notNullOrEmpty(this.denominator);
    }

    /**
     * Getter for the valuesRemoveMethod property.
     *
     * @see valuesRemoveMethod
     * @return the valuesRemoveMethod property.
     */
    public String getValuesRemoveMethod() {
        return this.valuesRemoveMethod;
    }

    /**
     * Setter for the valuesRemoveMethod property.
     *
     * @see valuesRemoveMethod
     * @param valuesRemoveMethod the valuesRemoveMethod to set
     */

    public void setValuesRemoveMethod(final String valuesRemoveMethod) {
        this.valuesRemoveMethod = valuesRemoveMethod;
    }

    /**
     * Getter for the valuesRemoveOlderThan property.
     *
     * @see valuesRemoveOlderThan
     * @return the valuesRemoveOlderThan property.
     */
    public int getValuesRemoveOlderThan() {
        return this.valuesRemoveOlderThan;
    }

    /**
     * Setter for the valuesRemoveOlderThan property.
     *
     * @see valuesRemoveOlderThan
     * @param valuesRemoveOlderThan the valuesRemoveOlderThan to set
     */

    public void setValuesRemoveOlderThan(final int valuesRemoveOlderThan) {
        this.valuesRemoveOlderThan = valuesRemoveOlderThan;
    }

    /**
     * Getter for the sampleTrendDir property.
     *
     * @see sampleTrendDir
     * @return the sampleTrendDir property.
     */
    public int getSampleTrendDir() {
        return this.sampleTrendDir;
    }

    /**
     * Setter for the sampleTrendDir property.
     *
     * @see sampleTrendDir
     * @param sampleTrendDir the sampleTrendDir to set
     */

    public void setSampleTrendDir(final int sampleTrendDir) {
        this.sampleTrendDir = sampleTrendDir;
    }

    /**
     * Getter for the reportBenchmarkValue property.
     *
     * @see reportBenchmarkValue
     * @return the reportBenchmarkValue property.
     */
    public double getReportBenchmarkValue() {
        return this.reportBenchmarkValue;
    }

    /**
     * Setter for the reportBenchmarkValue property.
     *
     * @see reportBenchmarkValue
     * @param reportBenchmarkValue the reportBenchmarkValue to set
     */

    public void setReportBenchmarkValue(final double reportBenchmarkValue) {
        this.reportBenchmarkValue = reportBenchmarkValue;
    }

    /**
     * Update field values for delete/archive methods.
     *
     */
    public void setArchiveFields() {
        setValuesRemoveMethod(DataStatistics
            .getString(DbConstants.AFM_METRIC_DEFINITIONS, "values_remove_method",
                DataSourceGroupingImpl.FORMULA_MAX, Restrictions.eq(
                    DbConstants.AFM_METRIC_DEFINITIONS, DbConstants.METRIC_NAME, this.name)));
        setValuesRemoveOlderThan(DataStatistics
            .getInt(DbConstants.AFM_METRIC_DEFINITIONS, "values_remove_older_than",
                DataSourceGroupingImpl.FORMULA_MAX, Restrictions.eq(
                    DbConstants.AFM_METRIC_DEFINITIONS, DbConstants.METRIC_NAME, this.name)));
    }

    /**
     * @param isSampleData if is sample data or not
     * @return last collect date.
     */
    public Date getLastCollectDate(final boolean isSampleData) {
        Date result = null;
        if (isSampleData) {
            result =
                    DataStatistics.getDate(DbConstants.AFM_METRIC_TREND_VALUES,
                        DbConstants.METRIC_DATE, DataSourceGroupingImpl.FORMULA_MAX, Restrictions
                        .and(Restrictions.eq(DbConstants.AFM_METRIC_TREND_VALUES,
                            DbConstants.METRIC_NAME, this.name), Restrictions.eq(
                                DbConstants.AFM_METRIC_TREND_VALUES, DbConstants.COLLECT_ERR_MSG,
                                Constants.EXAMPLE)));
        } else {
            result =
                    DataStatistics.getDate(DbConstants.AFM_METRIC_TREND_VALUES,
                        DbConstants.METRIC_DATE, DataSourceGroupingImpl.FORMULA_MAX, Restrictions
                        .eq(DbConstants.AFM_METRIC_TREND_VALUES, DbConstants.METRIC_NAME,
                            this.name));
        }
        return result;
    }

    /**
     * Calculates stoplight color for specified value, based on report limits for this metric. The
     * color for non-ratio metric drill-downs is always black, e.g. value has no significance.
     *
     * @param value The value.
     * @param forDrillDown True if the color is required to display metric drill-down values, e.g.
     *            per building.
     * @return The color.
     */
    public StoplightColor calculateStoplightColor(final double value, final boolean forDrillDown) {
        StoplightColor result = StoplightColor.BLACK;

        final boolean isRatio = this.getNumerator() != null && this.getDenominator() != null;
        if (isRatio || !forDrillDown) {
            final ITrendDirection trendDirection =
                    TrendDirectionFactory.createTrendDirection(getReportTrendDir());

            result = trendDirection.calculateStoplightColor(this, value);
        }

        return result;
    }

    /**
     * Return number of decimals.
     * 
     * @return integer
     */
    public int getMetricDecimals() {
        int decimalsNo = 0;
        final MetricDecimals metricDecimals = MetricDecimals.fromString(this.decimals);
        if (MetricDecimals.TWO_PLACES.equals(metricDecimals)) {
            decimalsNo = 2;
        } else if (MetricDecimals.ONE_PLACE.equals(metricDecimals)) {
            decimalsNo = 1;
        } else {
            decimalsNo = 0;
        }
        return decimalsNo;
    }
}
