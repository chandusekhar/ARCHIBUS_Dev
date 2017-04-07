package com.archibus.eventhandler.eam.datachangeevent;

import java.util.*;

import com.archibus.utility.StringUtil;

/**
 *
 * Utility class for EAM data change event.
 * <p>
 *
 *
 * @author Ioan Draghici
 * @since 22.1
 *
 */
public final class DataChangeEventHelper {

    /**
     * Private default constructor: utility class is non-instantiable.
     */
    private DataChangeEventHelper() {
    }
    
    /**
     * Get primary key field name.
     *
     * @param tableName table name
     * @param pKeys primary keys field values
     * @return String
     */
    public static String getPrimaryKeyFieldName(final String tableName, final Map<String, Object> pKeys) {
        String fieldName = "";
        if (DbConstants.EQUIPMENT_DEPRECIATION_TABLE.equals(tableName)) {
            fieldName = DbConstants.EQ_ID;
        } else if (DbConstants.FURNITURE_DEPRECIATION_TABLE.equals(tableName)) {
            fieldName = DbConstants.TA_ID;
        } else {
            final Iterator<String> itFields = pKeys.keySet().iterator();
            if (itFields.hasNext()) {
                fieldName = itFields.next();
            }
        }
        return fieldName;
    }
    
    /**
     * Check if log is enabled for specified table and initialize transaction fields for specified
     * table.
     *
     * @param logFields map with fields used to log data.
     * @param tableName table name
     * @return boolean
     */
    public static boolean isLogEnabledOnTable(final Map<String, String> logFields,
            final String tableName) {
        boolean isLogEnabled = false;
        final Iterator<String> itKeys = logFields.keySet().iterator();
        while (itKeys.hasNext()) {
            final String key = itKeys.next();
            if (key.startsWith(tableName + DbConstants.DOT)) {
                isLogEnabled = true;
                break;
            }
        }
        return isLogEnabled;
    }
    
    /**
     * Check is record values is changed.
     *
     * @param hasField if field exists
     * @param newValue new field value
     * @param oldValue old field value
     * @return boolean
     */
    public static boolean valueIsChanged(final boolean hasField, final Object newValue,
            final Object oldValue) {
        boolean isChanged = false;
        if (hasField && (StringUtil.notNullOrEmpty(newValue) && !newValue.equals(oldValue))) {
            isChanged = true;
        }

        if (hasField && !isChanged
                && (StringUtil.isNullOrEmpty(newValue) && StringUtil.notNullOrEmpty(oldValue))) {
            isChanged = true;
        }
        
        return isChanged;
    }
}
