package com.archibus.app.common.metrics.domain;

import java.util.Date;

/**
 * Domain object for metric trend values.
 * <p>
 * Mapped to <code>afm_metric_trend_values</code> table.
 * 
 * @author Ioan Draghici
 * @since 21.2
 * 
 */
public class MetricTrendValue {
    /**
     * Trend value id.
     */
    private int id;
    
    /**
     * Metric id.
     */
    private String metricName;
    
    /**
     * Error message.
     */
    private String errorMessage;
    
    /**
     * Group By fields: granularity.
     */
    private String groupByFields;
    
    /**
     * Group by value.
     */
    private String groupByValue;
    
    /**
     * Collect date.
     */
    private Date collectDate;
    
    /**
     * Current value.
     */
    private double value;
    
    /**
     * Last value.
     */
    private double lastValue;
    
    /**
     * Last year value.
     */
    private double lastYearValue;
    
    /**
     * Previous 19 values separated by semicolon.
     */
    private String previousValues;
    
    /**
     * Getter for the id property.
     * 
     * @see id
     * @return the id property.
     */
    public int getId() {
        return this.id;
    }
    
    /**
     * Setter for the id property.
     * 
     * @see id
     * @param id the id to set
     */
    
    public void setId(final int id) {
        this.id = id;
    }
    
    /**
     * @return the metricName
     */
    public String getMetricName() {
        return this.metricName;
    }
    
    /**
     * @param metricName the metricName to set
     */
    public void setMetricName(final String metricName) {
        this.metricName = metricName;
    }
    
    /**
     * Getter for the errorMessage property.
     * 
     * @see errorMessage
     * @return the errorMessage property.
     */
    public String getErrorMessage() {
        return this.errorMessage;
    }
    
    /**
     * Setter for the errorMessage property.
     * 
     * @see errorMessage
     * @param errorMessage the errorMessage to set
     */
    
    public void setErrorMessage(final String errorMessage) {
        this.errorMessage = errorMessage;
    }
    
    /**
     * Getter for the groupByFields property.
     * 
     * @see groupByFields
     * @return the groupByFields property.
     */
    public String getGroupByFields() {
        return this.groupByFields;
    }
    
    /**
     * Setter for the groupByFields property.
     * 
     * @see groupByFields
     * @param groupByFields the groupByFields to set
     */
    
    public void setGroupByFields(final String groupByFields) {
        this.groupByFields = groupByFields;
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
     * Getter for the groupByValue property.
     * 
     * @see groupByValue
     * @return the groupByValue property.
     */
    public String getGroupByValue() {
        return this.groupByValue;
    }
    
    /**
     * Setter for the groupByValue property.
     * 
     * @see groupByValue
     * @param groupByValue the groupByValue to set
     */
    
    public void setGroupByValue(final String groupByValue) {
        this.groupByValue = groupByValue;
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
     * Getter for the value property.
     * 
     * @see value
     * @return the value property.
     */
    public double getValue() {
        return this.value;
    }
    
    /**
     * Setter for the value property.
     * 
     * @see value
     * @param value the value to set
     */
    
    public void setValue(final double value) {
        this.value = value;
    }
    
    /**
     * Getter for the lastValue property.
     * 
     * @see lastValue
     * @return the lastValue property.
     */
    public double getLastValue() {
        return this.lastValue;
    }
    
    /**
     * Setter for the lastValue property.
     * 
     * @see lastValue
     * @param lastValue the lastValue to set
     */
    
    public void setLastValue(final double lastValue) {
        this.lastValue = lastValue;
    }
    
    /**
     * Getter for the lastYearValue property.
     * 
     * @see lastYearValue
     * @return the lastYearValue property.
     */
    public double getLastYearValue() {
        return this.lastYearValue;
    }
    
    /**
     * Setter for the lastYearValue property.
     * 
     * @see lastYearValue
     * @param lastYearValue the lastYearValue to set
     */
    
    public void setLastYearValue(final double lastYearValue) {
        this.lastYearValue = lastYearValue;
    }
    
    /**
     * Getter for the lastValues property.
     * 
     * @see previousValues
     * @return the lastValues property.
     */
    public String getPreviousValues() {
        return this.previousValues;
    }
    
    /**
     * Setter for the lastValues property.
     * 
     * @see previousValues
     * @param previousValues the lastValues to set
     */
    
    public void setPreviousValues(final String previousValues) {
        this.previousValues = previousValues;
    }
    
    /**
     * Create new trend value and save the error message.
     * 
     * @param metric metric object
     * @param granularity granularity object
     * @param error error message
     * @param metricDate collect date
     * @return {@link MetricTrendValue}
     */
    public static MetricTrendValue createErrorRecord(final Metric metric,
            final Granularity granularity, final String error, final Date metricDate) {
        final MetricTrendValue newValue = new MetricTrendValue();
        newValue.setMetricName(metric.getName());
        newValue.setGroupByFields(granularity.getGroupByFields());
        newValue.setErrorMessage(error);
        newValue.setCollectDate(metricDate);
        return newValue;
    }
    
    /**
     * Create new value for metric, group by and aggregate method.
     * 
     * @param metricName metric name
     * @param groupByFields group by fields
     * @return {@link MetricTrendValue}
     */
    public static MetricTrendValue createNewValueFor(final String metricName,
            final String groupByFields) {
        final MetricTrendValue newValue = new MetricTrendValue();
        newValue.setMetricName(metricName);
        newValue.setGroupByFields(groupByFields);
        return newValue;
    }
    
    @Override
    public String toString() {
        String toStringPattern =
                "Metric name : [%s] , Metric Date: [%s], Collect Group By: [%s], Collect By Value: [%s], Metric Value: [%s], ";
        toStringPattern +=
                "Metric Last Value: [%s], Metric Last Year Value: [%s], Metric Previous Values: [%s]";
        return String
            .format(toStringPattern, this.metricName, this.collectDate.toString(),
                this.groupByFields, this.groupByValue, String.valueOf(this.value),
                String.valueOf(this.lastValue), String.valueOf(this.lastYearValue),
                this.previousValues);
    }
}
