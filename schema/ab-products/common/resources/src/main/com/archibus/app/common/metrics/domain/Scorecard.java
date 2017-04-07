package com.archibus.app.common.metrics.domain;

/**
 * Domain object for metric scorecard assignments.
 * <p>
 * Mapped to <code>afm_ metric_scards</code> table.
 *
 * @author Sergey Kuramshin
 * @since 21.2
 *
 */
public class Scorecard {
    
    /**
     * Metric name.
     */
    private String metricName;
    
    /**
     * Scorecard code.
     */
    private String scorecardCode;
    
    /**
     * Decimals, override decimals property in the metric definition, if defined.
     */
    private String decimals;
    
    /**
     * Scorecards should be displayed in ascending order if value exists.
     */
    private Integer displayOrder;
    
    /**
     * Getter for the metricName property.
     *
     * @see metricName
     * @return the metricName property.
     */
    public String getMetricName() {
        return this.metricName;
    }
    
    /**
     * Setter for the metricName property.
     *
     * @see metricName
     * @param metricName the metricName to set
     */
    
    public void setMetricName(final String metricName) {
        this.metricName = metricName;
    }
    
    /**
     * Getter for the scorecardCode property.
     *
     * @see scorecardCode
     * @return the scorecardCode property.
     */
    public String getScorecardCode() {
        return this.scorecardCode;
    }
    
    /**
     * Setter for the scorecardCode property.
     *
     * @see scorecardCode
     * @param scorecardCode the scorecardCode to set
     */
    
    public void setScorecardCode(final String scorecardCode) {
        this.scorecardCode = scorecardCode;
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
     * Getter for the displayOrder property.
     *
     * @see displayOrder
     * @return the displayOrder property.
     */
    public Integer getDisplayOrder() {
        return this.displayOrder;
    }

    /**
     * Setter for the displayOrder property.
     *
     * @see displayOrder
     * @param displayOrder the displayOrder to set
     */
    public void setDisplayOrder(final Integer displayOrder) {
        this.displayOrder = displayOrder;
    }
}
