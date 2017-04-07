package com.archibus.app.common.depreciation.domain;

/**
 * Property type domain object. Mapped to property_type database table.
 * <p>
 *
 *
 * @author Ioan Draghici
 * @since 23.1
 *
 */
public class PropertyType {
    /**
     * Property type.
     */
    private String type;

    /**
     * Depreciation period.
     */
    private int deprecPeriod;

    /**
     * Depreciation method.
     */
    private String deprecMethod;

    /**
     * Getter for the type property.
     *
     * @see type
     * @return the type property.
     */
    public String getType() {
        return this.type;
    }

    /**
     * Setter for the type property.
     *
     * @see type
     * @param type the type to set
     */

    public void setType(final String type) {
        this.type = type;
    }

    /**
     * Getter for the deprecPeriod property.
     *
     * @see deprecPeriod
     * @return the deprecPeriod property.
     */
    public int getDeprecPeriod() {
        return this.deprecPeriod;
    }

    /**
     * Setter for the deprecPeriod property.
     *
     * @see deprecPeriod
     * @param deprecPeriod the deprecPeriod to set
     */

    public void setDeprecPeriod(final int deprecPeriod) {
        this.deprecPeriod = deprecPeriod;
    }

    /**
     * Getter for the deprecMethod property.
     *
     * @see deprecMethod
     * @return the deprecMethod property.
     */
    public String getDeprecMethod() {
        return this.deprecMethod;
    }

    /**
     * Setter for the deprecMethod property.
     *
     * @see deprecMethod
     * @param deprecMethod the deprecMethod to set
     */

    public void setDeprecMethod(final String deprecMethod) {
        this.deprecMethod = deprecMethod;
    }

}
