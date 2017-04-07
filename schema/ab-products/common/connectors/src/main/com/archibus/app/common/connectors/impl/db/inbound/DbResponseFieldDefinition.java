package com.archibus.app.common.connectors.impl.db.inbound;

import java.util.Map;

import com.archibus.app.common.connectors.domain.ConnectorFieldConfig;
import com.archibus.app.common.connectors.impl.archibus.inbound.AbstractArchibusResponseFieldDefinition;
import com.archibus.datasource.DataSourceFieldDefLoader;

/**
 * Field mapping for extracting and translating a field value from a database record.
 * 
 * @author cole
 * 
 */
public class DbResponseFieldDefinition extends
        AbstractArchibusResponseFieldDefinition<Map<String, Object>> {
    
    /**
     * The column for the field in the foreign database.
     */
    private final String fieldKey;
    
    /**
     * @param connectorField the configuration for this field mapping.
     * @param fieldDefLoader for loading the ARCHIBUS field definition.
     */
    public DbResponseFieldDefinition(final ConnectorFieldConfig connectorField,
            final DataSourceFieldDefLoader fieldDefLoader) {
        super(connectorField, fieldDefLoader);
        this.fieldKey = connectorField.getForeignFieldPath();
    }
    
    /**
     * @param foreignRecord the map of field values from the foreign database (by column in the
     *            foreign database).
     * @return the value in the map matching the field key.
     */
    public Object extractValue(final Map<String, Object> foreignRecord) {
        return foreignRecord.get(this.fieldKey);
    }
    
}
