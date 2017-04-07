package com.archibus.app.sysadmin.updatewizard.schema.compare;

import com.archibus.app.sysadmin.updatewizard.schema.sqlgenerator.SqlTypes;
import com.archibus.app.sysadmin.updatewizard.schema.util.SchemaUpdateWizardConstants;
import com.archibus.schema.ArchibusFieldDefBase;

/**
 * Utility class. Provides methods used in field comparison.
 * 
 * @author Catalin Purice
 * @since 20.1
 * 
 */
public final class CompareFieldDefUtilities {
    
    /**
     * Private default constructor: utility class is non-instantiable.
     */
    private CompareFieldDefUtilities() {
        super();
    }
    
    /**
     * @param defaultValue default value
     * @param sqlType SQL type
     * @return default value
     */
    public static Object convertDefaultValue(final Object defaultValue, final int sqlType) {
        Object myValue = null;
        if (SchemaUpdateWizardConstants.NULL.equals(defaultValue)) {
            myValue = String.valueOf(defaultValue);
        } else {
            // check the data type before CAST
            if (sqlType == SqlTypes.SQL_DOUBLE || sqlType == SqlTypes.SQL_FLOAT
                    || sqlType == SqlTypes.SQL_REAL || sqlType == SqlTypes.SQL_NUMERIC) {
                myValue = Double.valueOf((String) defaultValue);
            } else if (sqlType == SqlTypes.SQL_INTEGER) {
                if (String.valueOf(defaultValue).contains(SchemaUpdateWizardConstants.NULL)
                        || String.valueOf(defaultValue).contains("null")) {
                    myValue = SchemaUpdateWizardConstants.NULL;
                } else {
                    myValue = Integer.valueOf((String) defaultValue);
                }
            } else {
                myValue = String.valueOf(defaultValue).toUpperCase();
            }
        }
        return myValue;
    }
    
    /**
     * @param fieldDef ARCHIBUS field definition
     * @return true if the field is a document fields
     */
    public static boolean isDoc(final ArchibusFieldDefBase.Immutable fieldDef) {
        return fieldDef.getArchibusFieldType().getCode() == SchemaUpdateWizardConstants.AFM_DOC_TYPE ? true
                : false;
    }
    
    /**
     * 
     * @param newType new type
     * @param oldType old type
     * @return boolean
     */
    public static boolean isSameGroupOfDataType(final int newType, final int oldType) {
        boolean isSameDataType = false;
        if (new SqlTypes(newType).getGroupType() == new SqlTypes(oldType).getGroupType()) {
            isSameDataType = true;
        }
        return isSameDataType;
    }
}
