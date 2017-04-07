package com.archibus.app.common.depreciation.domain;

import java.util.Date;

/**
 * Equipment domain object. Contains only fields that are required for depreciation calculation.
 * <p>
 *
 * Used by Depreciation service to calculate and update depreciation value. Managed by Spring.
 * Configured in [schema\ab-products\common\resources\appContext-services.xml] file.
 *
 * @author Ioan Draghici
 * @since 23.1
 *
 */
public class Equipment {
    /**
     * Equipment code.
     */
    private String eqId;

    /**
     * Property type.
     */
    private String propertyType;

    /**
     * Cost depreciated value.
     */
    private double costDepValue;

    /**
     * Purchase cost.
     */
    private double costPurchase;

    /**
     * Salvage value.
     */
    private double valueSalvage;

    /**
     * Date installed.
     */
    private Date dateInstalled;

    /**
     * Getter for the eqId property.
     *
     * @see eqId
     * @return the eqId property.
     */
    public String getEqId() {
        return this.eqId;
    }

    /**
     * Setter for the eqId property.
     *
     * @see eqId
     * @param eqId the eqId to set
     */

    public void setEqId(final String eqId) {
        this.eqId = eqId;
    }

    /**
     * Getter for the propertyType property.
     *
     * @see propertyType
     * @return the propertyType property.
     */
    public String getPropertyType() {
        return this.propertyType;
    }

    /**
     * Setter for the propertyType property.
     *
     * @see propertyType
     * @param propertyType the propertyType to set
     */

    public void setPropertyType(final String propertyType) {
        this.propertyType = propertyType;
    }

    /**
     * Getter for the costDepValue property.
     *
     * @see costDepValue
     * @return the costDepValue property.
     */
    public double getCostDepValue() {
        return this.costDepValue;
    }

    /**
     * Setter for the costDepValue property.
     *
     * @see costDepValue
     * @param costDepValue the costDepValue to set
     */

    public void setCostDepValue(final double costDepValue) {
        this.costDepValue = costDepValue;
    }

    /**
     * Getter for the costPurchase property.
     *
     * @see costPurchase
     * @return the costPurchase property.
     */
    public double getCostPurchase() {
        return this.costPurchase;
    }

    /**
     * Setter for the costPurchase property.
     *
     * @see costPurchase
     * @param costPurchase the costPurchase to set
     */

    public void setCostPurchase(final double costPurchase) {
        this.costPurchase = costPurchase;
    }

    /**
     * Getter for the valueSalvage property.
     *
     * @see valueSalvage
     * @return the valueSalvage property.
     */
    public double getValueSalvage() {
        return this.valueSalvage;
    }

    /**
     * Setter for the valueSalvage property.
     *
     * @see valueSalvage
     * @param valueSalvage the valueSalvage to set
     */

    public void setValueSalvage(final double valueSalvage) {
        this.valueSalvage = valueSalvage;
    }

    /**
     * Getter for the dateInstalled property.
     *
     * @see dateInstalled
     * @return the dateInstalled property.
     */
    public Date getDateInstalled() {
        return this.dateInstalled;
    }

    /**
     * Setter for the dateInstalled property.
     *
     * @see dateInstalled
     * @param dateInstalled the dateInstalled to set
     */

    public void setDateInstalled(final Date dateInstalled) {
        this.dateInstalled = dateInstalled;
    }

}
