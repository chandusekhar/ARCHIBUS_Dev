package com.archibus.eventhandler.eam.domain;

import com.archibus.utility.EnumTemplate;

/**
 *
 * Mapped to trans_type from asset_trans table.
 * <p>
 *
 *
 * @author Ioan Draghici
 * @since 22.1
 *
 */
public enum TransactionType {
    /**
     * Asset location.
     */
    LOCATION,
    /**
     * Asset status.
     */
    STATUS,
    /**
     * Asset ownership.
     */
    OWNERSHIP,
    /**
     * A value (cost) was changed.
     */
    VALUE;
    /**
     * Mapping to String values.
     */
    private static final Object[][] STRINGS_TO_ENUMS = { { "Location", LOCATION },
            { "Status", STATUS }, { "Ownership", OWNERSHIP }, { "Value", VALUE } };
    
    /**
     * Converts given string to enum object.
     *
     * @param source string to convert to enum.
     * @return result of conversion.
     */
    public static TransactionType fromString(final String source) {
        return (TransactionType) EnumTemplate.fromString(source, STRINGS_TO_ENUMS,
            TransactionType.class);
    }
    
    @Override
    public String toString() {
        return EnumTemplate.toString(STRINGS_TO_ENUMS, this);
    }
}
