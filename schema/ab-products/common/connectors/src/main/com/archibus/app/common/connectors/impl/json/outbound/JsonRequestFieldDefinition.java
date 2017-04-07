package com.archibus.app.common.connectors.impl.json.outbound;

import com.archibus.app.common.connectors.domain.ConnectorFieldConfig;
import com.archibus.app.common.connectors.exception.ConfigurationException;
import com.archibus.app.common.connectors.impl.archibus.outbound.ArchibusRequestFieldDefinition;

/**
 * A request field definition created from an afm_conn_flds record whose associated afm_connectors
 * record is of type TEXT.
 * 
 * @author cole
 * 
 */
public class JsonRequestFieldDefinition extends ArchibusRequestFieldDefinition {
    
    /**
     * Base JsonPath to object on which the field should be assigned.
     */
    private final String fieldPath;
    
    /**
     * Create a request field definition created from an afm_conn_flds record.
     * 
     * @param connectorField an afm_conn_fld associated with the connector that this definition
     *            represents.
     * @param fieldPath JSONPath to the object to which a field's value should be assigned.
     * @throws ConfigurationException if a connector rule associated with this field cannot be
     *             instantiated.
     */
    public JsonRequestFieldDefinition(final ConnectorFieldConfig connectorField,
            final String fieldPath) throws ConfigurationException {
        super(connectorField);
        this.fieldPath = fieldPath + '.' + connectorField.getForeignFieldPath();
    }
    
    @Override
    public String getFieldName() {
        return this.fieldPath;
    }
}
