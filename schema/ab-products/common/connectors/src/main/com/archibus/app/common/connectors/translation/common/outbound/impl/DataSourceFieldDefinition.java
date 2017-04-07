package com.archibus.app.common.connectors.translation.common.outbound.impl;

import com.archibus.app.common.connectors.translation.common.outbound.IRequestFieldDefinition;
import com.archibus.app.common.connectors.translation.exception.TranslationException;
import com.archibus.utility.StringUtil;

/**
 * A field definition for a field from an ARCHIBUS data source.
 * 
 * @author cole
 * 
 */
public class DataSourceFieldDefinition implements IRequestFieldDefinition {
    /**
     * The name of the field from the ARCHIBUS database.
     */
    private final String dataSourceFieldName;
    
    /**
     * The field name expected by the request template.
     */
    private final String foreignFieldPath;
    
    /**
     * Create a field definition for an ARCHIBUS data source.
     * 
     * @param foreignFieldPath the field name expected by the request template.
     * @param archibusFieldName the ARCHIBUS field name (no table).
     */
    public DataSourceFieldDefinition(final String foreignFieldPath, final String archibusFieldName) {
        this.dataSourceFieldName = archibusFieldName;
        this.foreignFieldPath = foreignFieldPath;
    }
    
    /**
     * @return the field name for use by the request template.
     */
    public String getFieldName() {
        return this.foreignFieldPath;
    }
    
    /**
     * @return the field name from the ARCHIBUS data source.
     */
    public String getDataSourceFieldName() {
        return this.dataSourceFieldName;
    }
    
    /**
     * @param databaseValue the value from the database.
     * @return the neutral value for the database value.
     * @throws TranslationException if for some reason the databaseValue cannot be translated.
     */
    public Object translateToForeign(final Object databaseValue) throws TranslationException {
        Object translatedValue = null;
        if (!StringUtil.isNullOrEmpty(databaseValue)) {
            translatedValue = databaseValue;
        }
        return translatedValue;
    }
    
}
