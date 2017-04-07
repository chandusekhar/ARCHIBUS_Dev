package com.archibus.app.common.finanal.domain;

import com.archibus.app.common.metrics.domain.Metric;

/**
 * Domain object for financial metric. Extend user defined metric object.
 * <p>
 *
 *
 * @author Ioan Draghici
 * @since 23.1
 *
 */
public class FinancialMetric extends Metric {

    /**
     * Calculation type.
     */
    private String calculationType;

    /**
     * Calculation order.
     */
    private int calculationOrder;

    /**
     * Display chart.
     */
    private String displayChart;

    /**
     * Display color.
     */
    private String displayColor;

    /**
     * Display icon.
     */
    private String displayIcon;

    /**
     * Field category.
     */
    private String fieldCategory;

    /**
     * Result field name.
     */
    private String resultField;

    /**
     * Getter for the calculationType property.
     *
     * @see calculationType
     * @return the calculationType property.
     */
    public String getCalculationType() {
        return this.calculationType;
    }

    /**
     * Setter for the calculationType property.
     *
     * @see calculationType
     * @param calculationType the calculationType to set
     */

    public void setCalculationType(final String calculationType) {
        this.calculationType = calculationType;
    }

    /**
     * Getter for the calculationOrder property.
     *
     * @see calculationOrder
     * @return the calculationOrder property.
     */
    public int getCalculationOrder() {
        return this.calculationOrder;
    }

    /**
     * Setter for the calculationOrder property.
     *
     * @see calculationOrder
     * @param calculationOrder the calculationOrder to set
     */

    public void setCalculationOrder(final int calculationOrder) {
        this.calculationOrder = calculationOrder;
    }

    /**
     * Getter for the displayChart property.
     *
     * @see displayChart
     * @return the displayChart property.
     */
    public String getDisplayChart() {
        return this.displayChart;
    }

    /**
     * Setter for the displayChart property.
     *
     * @see displayChart
     * @param displayChart the displayChart to set
     */

    public void setDisplayChart(final String displayChart) {
        this.displayChart = displayChart;
    }

    /**
     * Getter for the displayColor property.
     *
     * @see displayColor
     * @return the displayColor property.
     */
    public String getDisplayColor() {
        return this.displayColor;
    }

    /**
     * Setter for the displayColor property.
     *
     * @see displayColor
     * @param displayColor the displayColor to set
     */

    public void setDisplayColor(final String displayColor) {
        this.displayColor = displayColor;
    }

    /**
     * Getter for the displayIcon property.
     *
     * @see displayIcon
     * @return the displayIcon property.
     */
    public String getDisplayIcon() {
        return this.displayIcon;
    }

    /**
     * Setter for the displayIcon property.
     *
     * @see displayIcon
     * @param displayIcon the displayIcon to set
     */

    public void setDisplayIcon(final String displayIcon) {
        this.displayIcon = displayIcon;
    }

    /**
     * Getter for the fieldCategory property.
     *
     * @see fieldCategory
     * @return the fieldCategory property.
     */
    public String getFieldCategory() {
        return this.fieldCategory;
    }

    /**
     * Setter for the fieldCategory property.
     *
     * @see fieldCategory
     * @param fieldCategory the fieldCategory to set
     */

    public void setFieldCategory(final String fieldCategory) {
        this.fieldCategory = fieldCategory;
    }

    /**
     * Getter for the resultField property.
     *
     * @see resultField
     * @return the resultField property.
     */
    public String getResultField() {
        return this.resultField;
    }

    /**
     * Setter for the resultField property.
     *
     * @see resultField
     * @param resultField the resultField to set
     */

    public void setResultField(final String resultField) {
        this.resultField = resultField;
    }

}
