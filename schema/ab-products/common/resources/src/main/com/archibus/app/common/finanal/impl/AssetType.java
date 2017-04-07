package com.archibus.app.common.finanal.impl;

import com.archibus.utility.EnumTemplate;

/**
 * Asset type enumeration.
 * <p>
 *
 *
 * @author Ioan Draghici
 * @since 23.1
 *
 */
public enum AssetType {

    /**
     * Asset types.
     */
    BUILDING, PROPERTY, PROJECT, EQUIPMENT;

    /**
     * Asset type definition.
     */
    private static final Object[][] STRINGS_TO_ENUMS = { { "Building", BUILDING },
            { "Property", PROPERTY }, { "Project", PROJECT }, { "Equipment", EQUIPMENT } };

    /**
     * Asset type definition.
     */
    private static final Object[][] TABLE_NAMES_FOR_ENUMS = { { "bl", BUILDING },
            { "property", PROPERTY }, { "project", PROJECT }, { "eq", EQUIPMENT } };

    /**
     * Asset type definition.
     */
    private static final Object[][] PK_FIELD_NAMES_FOR_ENUMS = { { "bl_id", BUILDING },
            { "pr_id", PROPERTY }, { "project_id", PROJECT }, { "eq_id", EQUIPMENT } };

    /**
     *
     * Convert from string.
     *
     * @param source string value
     * @return vat type
     */
    public static AssetType fromString(final String source) {
        return (AssetType) EnumTemplate.fromString(source, STRINGS_TO_ENUMS, AssetType.class);
    }

    /**
     * Returns database table name for asset type.
     *
     * @return String
     */
    public String getAssetTableName() {
        return EnumTemplate.toString(TABLE_NAMES_FOR_ENUMS, this);
    }

    /**
     * Returns database pk field name for asset type.
     *
     * @return String
     */
    public String getAssetFieldName() {
        return EnumTemplate.toString(PK_FIELD_NAMES_FOR_ENUMS, this);
    }

    @Override
    public String toString() {
        return EnumTemplate.toString(STRINGS_TO_ENUMS, this);
    }
}
