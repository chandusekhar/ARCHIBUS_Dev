package com.archibus.app.common.connectors.dao.datasource;


/**
 * Utilities for working with Daos.
 * 
 * @author cole
 * 
 */
public final class DaoUtil {
    /**
     * Utility class, do not call.
     */
    private DaoUtil() {
    }
    
    /**
     * @param originalFieldsToProperties fields to properties mapping.
     * @return deep clone of originalFieldsToProperties.
     */
    public static String[][] getFieldsToProperties(final String[][] originalFieldsToProperties) {
        final String[][] fieldsToProperties = new String[originalFieldsToProperties.length][2];
        for (int i = 0; i < originalFieldsToProperties.length; i++) {
            fieldsToProperties[i] = new String[2];
            System.arraycopy(originalFieldsToProperties[i], 0, fieldsToProperties[i], 0, 2);
        }
        return fieldsToProperties;
    }
}
