package com.archibus.app.common.metrics.domain;

/**
 * Domain object for metric granularity.
 * <p>
 * Mapped to <code>afm_metric_grans</code> table.
 * 
 * @author Ioan Draghici
 * @since 21.2
 * 
 */
public class Granularity extends GranularityDef {
    
    /**
     * Metric code.
     */
    private String metricName;
    
    /**
     * String with required standard table names (separated with semicolon).
     */
    private String requiredTables;
    
    /**
     * The view file name to which the user can drill-down from the metric data/chart.
     */
    private String drillDownView;
    
    /**
     * Getter for the metricName property.
     * 
     * @see metricId
     * @return the metricId property.
     */
    public String getMetricName() {
        return this.metricName;
    }
    
    /**
     * Setter for the metricName property.
     * 
     * @see metricName
     * @param metricName the metricId to set
     */
    
    public void setMetricName(final String metricName) {
        this.metricName = metricName;
    }
    
    /**
     * @return the requiredTables
     */
    public String getRequiredTables() {
        return this.requiredTables;
    }
    
    /**
     * @param requiredTables the requiredTables to set
     */
    public void setRequiredTables(final String requiredTables) {
        this.requiredTables = requiredTables;
    }
    
    /**
     * Getter for the drillDownView property.
     * 
     * @see drillDownView
     * @return the drillDownView property.
     */
    public String getDrillDownView() {
        return this.drillDownView;
    }
    
    /**
     * Setter for the drillDownView property.
     * 
     * @see drillDownView
     * @param drillDownView the drillDownView to set
     */
    
    public void setDrillDownView(final String drillDownView) {
        this.drillDownView = drillDownView;
    }
    
    /**
     * Load granularity definition.
     * 
     * @param granularityDef definition object
     */
    public void loadDefinition(final GranularityDef granularityDef) {
        this.setTitle(granularityDef.getTitle());
        this.setFieldPresence(granularityDef.getFieldPresence());
        this.setRequiredFields(granularityDef.getRequiredFields());
    }
    
}
