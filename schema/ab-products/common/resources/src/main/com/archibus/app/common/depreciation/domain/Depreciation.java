package com.archibus.app.common.depreciation.domain;

/**
 * Depreciation object.
 * <p>
 *
 *
 * @author Ioan Draghici
 * @since 23.1
 *
 */
public class Depreciation {

    /**
     * Depreciation report code.
     */
    private String reportId;

    /**
     * Current value.
     */
    private double valueCurrent;

    /**
     * Depreciation accumulated value.
     */
    private double valueAccumDep;

    /**
     * Current depreciated value.
     */
    private double valueCurrentDep;

    /**
     * Getter for the reportId property.
     *
     * @see reportId
     * @return the reportId property.
     */
    public String getReportId() {
        return this.reportId;
    }

    /**
     * Setter for the reportId property.
     *
     * @see reportId
     * @param reportId the reportId to set
     */

    public void setReportId(final String reportId) {
        this.reportId = reportId;
    }

    /**
     * Getter for the valueCurrent property.
     *
     * @see valueCurrent
     * @return the valueCurrent property.
     */
    public double getValueCurrent() {
        return this.valueCurrent;
    }

    /**
     * Setter for the valueCurrent property.
     *
     * @see valueCurrent
     * @param valueCurrent the valueCurrent to set
     */

    public void setValueCurrent(final double valueCurrent) {
        this.valueCurrent = valueCurrent;
    }

    /**
     * Getter for the valueAccumDep property.
     *
     * @see valueAccumDep
     * @return the valueAccumDep property.
     */
    public double getValueAccumDep() {
        return this.valueAccumDep;
    }

    /**
     * Setter for the valueAccumDep property.
     *
     * @see valueAccumDep
     * @param valueAccumDep the valueAccumDep to set
     */

    public void setValueAccumDep(final double valueAccumDep) {
        this.valueAccumDep = valueAccumDep;
    }

    /**
     * Getter for the valueCurrentDep property.
     *
     * @see valueCurrentDep
     * @return the valueCurrentDep property.
     */
    public double getValueCurrentDep() {
        return this.valueCurrentDep;
    }

    /**
     * Setter for the valueCurrentDep property.
     *
     * @see valueCurrentDep
     * @param valueCurrentDep the valueCurrentDep to set
     */

    public void setValueCurrentDep(final double valueCurrentDep) {
        this.valueCurrentDep = valueCurrentDep;
    }

}
