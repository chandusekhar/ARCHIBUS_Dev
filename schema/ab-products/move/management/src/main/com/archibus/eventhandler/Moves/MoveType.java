package com.archibus.eventhandler.Moves;

import com.archibus.utility.EnumTemplate;

/**
 * Move types enumeration.
 * 
 * <p>
 * Suppress warning. Justification: old package name. If is renamed we should check all references
 * (application code, wfr definitions ...)
 * 
 * @author Ioan Draghici
 * @since 21.1
 * 
 */
public enum MoveType {
    /**
     * Move types.
     */
    EMPLOYEE, NEW_HIRE, LEAVING, EQUIPMENT, ASSET, ROOM;
    /**
     * VAT types definition.
     */
    private static final Object[][] STRINGS_TO_ENUMS = { { "Employee", EMPLOYEE },
            { "New Hire", NEW_HIRE }, { "Leaving", LEAVING }, { "Equipment", EQUIPMENT },
            { "Asset", ASSET }, { "Room", ROOM } };
    
    /**
     * 
     * Convert from string.
     * 
     * @param source string value
     * @return vat type
     */
    public static MoveType fromString(final String source) {
        return (MoveType) EnumTemplate.fromString(source, STRINGS_TO_ENUMS, MoveType.class);
    }
    
    @Override
    public String toString() {
        return EnumTemplate.toString(STRINGS_TO_ENUMS, this);
    }
}
