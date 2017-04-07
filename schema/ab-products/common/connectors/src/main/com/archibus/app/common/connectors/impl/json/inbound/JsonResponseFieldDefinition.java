package com.archibus.app.common.connectors.impl.json.inbound;

import com.archibus.app.common.connectors.domain.ConnectorFieldConfig;
import com.archibus.app.common.connectors.exception.ConfigurationException;
import com.archibus.app.common.connectors.impl.archibus.inbound.AbstractArchibusResponseFieldDefinition;
import com.archibus.datasource.DataSourceFieldDefLoader;
import com.jayway.jsonpath.JsonPath;

/**
 * A method for extracting field data from a JSON array of records.
 * 
 * @author cole
 * 
 */
public class JsonResponseFieldDefinition extends AbstractArchibusResponseFieldDefinition<Object> {
    
    /**
     * The jsonPath for extracting a field from a record Object.
     */
    private final String jsonPath;
    
    /**
     * Create a method for extracting field data from an JSON Object that provides a field value
     * based on afm_conn_flds and afm_flds records.
     * 
     * @param connectorField the field associated with the afm_connector record that describes this
     *            field.
     * @param fieldDefLoader a means to retrieve the afm_flds data about this field.
     * @throws ConfigurationException if a connector rule associated with this field cannot be
     *             instantiated.
     */
    public JsonResponseFieldDefinition(final ConnectorFieldConfig connectorField,
            final DataSourceFieldDefLoader fieldDefLoader) throws ConfigurationException {
        super(connectorField, fieldDefLoader);
        this.jsonPath = connectorField.getForeignFieldPath();
    }
    
    /**
     * Extract this field's value from the record Object read from the JSON file.
     * 
     * @param recordObject a Object from the source JSON file.
     * @return The value of the field from the record, extracted using the jsonPath provided by the
     *         afm_conn_flds table.
     */
    public Object extractValue(final Object recordObject) {
        return this.jsonPath == null ? null : JsonPath.read(recordObject, this.jsonPath);
    }
}
