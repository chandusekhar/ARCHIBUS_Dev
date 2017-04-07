package com.archibus.app.common.depreciation.domain;

import java.util.Date;

/**
 * Furniture domain object. Contains only fields that are required for depreciation calculation.
 * <p>
 *
 * Used by Depreciation service to calculate and update depreciation value. Managed by Spring.
 * Configured in [schema\ab-products\common\resources\appContext-services.xml] file.
 *
 * @author Ioan Draghici
 * @since 23.1
 *
 */
public class Furniture {

    /**
     * Furniture code.
     */
    private String taId;

    /**
     * Property type.
     */
    private String propertyType;

    /**
     * Value salvage.
     */
    private double valueSalvage;

    /**
     * Value original.
     */
    private double valueOriginal;

    /**
     * Date delivery.
     */
    private Date dateDelivery;

    /**
     * Getter for the taId property.
     *
     * @see taId
     * @return the taId property.
     */
    public String getTaId() {
        return this.taId;
    }

    /**
     * Setter for the taId property.
     *
     * @see taId
     * @param taId the taId to set
     */

    public void setTaId(final String taId) {
        this.taId = taId;
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
     * Getter for the valueOriginal property.
     *
     * @see valueOriginal
     * @return the valueOriginal property.
     */
    public double getValueOriginal() {
        return this.valueOriginal;
    }

    /**
     * Setter for the valueOriginal property.
     *
     * @see valueOriginal
     * @param valueOriginal the valueOriginal to set
     */

    public void setValueOriginal(final double valueOriginal) {
        this.valueOriginal = valueOriginal;
    }

    /**
     * Getter for the dateDelivery property.
     *
     * @see dateDelivery
     * @return the dateDelivery property.
     */
    public Date getDateDelivery() {
        return this.dateDelivery;
    }

    /**
     * Setter for the dateDelivery property.
     *
     * @see dateDelivery
     * @param dateDelivery the dateDelivery to set
     */

    public void setDateDelivery(final Date dateDelivery) {
        this.dateDelivery = dateDelivery;
    }

}
