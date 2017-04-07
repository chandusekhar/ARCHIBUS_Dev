package com.archibus.app.sysadmin.updatewizard.schema.compare;

/**
 * Defines the field properties.
 * 
 * @author Catalin Purice
 * 
 */
public enum PropertyType {
    /**
     * Allow null.
     */
    ALLOWNULL,
    /**
     * Auto-Numeric.
     */
    AUTONUM,
    /**
     * Decimals.
     */
    DECIMALS,
    /**
     * default.
     */
    DEFAULT,
    /**
     * Field Size.
     */
    SIZE,
    /**
     * Data type.
     */
    TYPE,
    /**
     * Primary key.
     */
    PK_CHG,
    /**
     * Foreign key.
     */
    FK_CHG
}
