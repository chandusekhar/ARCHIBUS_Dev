package com.archibus.app.common.finanal.domain;

import com.archibus.app.common.finanal.impl.AssetType;

/**
 * Domain object for Lifecycle Analysis Summary. Mapped to finanal_sum_life database table.
 * <p>
 *
 *
 * @author Ioan Draghici
 * @since 23.1
 *
 */
public class LifecycleSummary {

    /**
     * Asset type.
     */
    private AssetType assetType;

    /**
     * Summary id.
     */
    private int summaryId;

    /**
     * Building code.
     */
    private String buildingCode;

    /**
     * Country code.
     */
    private String countryCode;

    /**
     * Equipment code.
     */
    private String equipmentCode;

    /**
     * Fiscal year.
     */
    private String fiscalYear;

    /**
     * Metric name.
     */
    private String metricName;

    /**
     * Property code.
     */
    private String propertyCode;

    /**
     * Project code.
     */
    private String projectCode;

    /**
     * Site code.
     */
    private String siteCode;

    /**
     * Summary value.
     */
    private double value;

    /**
     * Getter for the assetType property.
     *
     * @see assetType
     * @return the assetType property.
     */
    public AssetType getAssetType() {
        return this.assetType;
    }

    /**
     * Setter for the assetType property.
     *
     * @see assetType
     * @param assetType the assetType to set
     */

    public void setAssetType(final AssetType assetType) {
        this.assetType = assetType;
    }

    /**
     * Getter for the summaryId property.
     *
     * @see summaryId
     * @return the summaryId property.
     */
    public int getSummaryId() {
        return this.summaryId;
    }

    /**
     * Setter for the summaryId property.
     *
     * @see summaryId
     * @param summaryId the summaryId to set
     */

    public void setSummaryId(final int summaryId) {
        this.summaryId = summaryId;
    }

    /**
     * Getter for the buildingCode property.
     *
     * @see buildingCode
     * @return the buildingCode property.
     */
    public String getBuildingCode() {
        return this.buildingCode;
    }

    /**
     * Setter for the buildingCode property.
     *
     * @see buildingCode
     * @param buildingCode the buildingCode to set
     */

    public void setBuildingCode(final String buildingCode) {
        this.buildingCode = buildingCode;
    }

    /**
     * Getter for the countryCode property.
     *
     * @see countryCode
     * @return the countryCode property.
     */
    public String getCountryCode() {
        return this.countryCode;
    }

    /**
     * Setter for the countryCode property.
     *
     * @see countryCode
     * @param countryCode the countryCode to set
     */

    public void setCountryCode(final String countryCode) {
        this.countryCode = countryCode;
    }

    /**
     * Getter for the equipmentCode property.
     *
     * @see equipmentCode
     * @return the equipmentCode property.
     */
    public String getEquipmentCode() {
        return this.equipmentCode;
    }

    /**
     * Setter for the equipmentCode property.
     *
     * @see equipmentCode
     * @param equipmentCode the equipmentCode to set
     */

    public void setEquipmentCode(final String equipmentCode) {
        this.equipmentCode = equipmentCode;
    }

    /**
     * Getter for the fiscalYear property.
     *
     * @see fiscalYear
     * @return the fiscalYear property.
     */
    public String getFiscalYear() {
        return this.fiscalYear;
    }

    /**
     * Setter for the fiscalYear property.
     *
     * @see fiscalYear
     * @param fiscalYear the fiscalYear to set
     */

    public void setFiscalYear(final String fiscalYear) {
        this.fiscalYear = fiscalYear;
    }

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
     * Getter for the propertyCode property.
     *
     * @see propertyCode
     * @return the propertyCode property.
     */
    public String getPropertyCode() {
        return this.propertyCode;
    }

    /**
     * Setter for the propertyCode property.
     *
     * @see propertyCode
     * @param propertyCode the propertyCode to set
     */

    public void setPropertyCode(final String propertyCode) {
        this.propertyCode = propertyCode;
    }

    /**
     * Getter for the projectCode property.
     *
     * @see projectCode
     * @return the projectCode property.
     */
    public String getProjectCode() {
        return this.projectCode;
    }

    /**
     * Setter for the projectCode property.
     *
     * @see projectCode
     * @param projectCode the projectCode to set
     */

    public void setProjectCode(final String projectCode) {
        this.projectCode = projectCode;
    }

    /**
     * Getter for the siteCode property.
     *
     * @see siteCode
     * @return the siteCode property.
     */
    public String getSiteCode() {
        return this.siteCode;
    }

    /**
     * Setter for the siteCode property.
     *
     * @see siteCode
     * @param siteCode the siteCode to set
     */

    public void setSiteCode(final String siteCode) {
        this.siteCode = siteCode;
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

}
