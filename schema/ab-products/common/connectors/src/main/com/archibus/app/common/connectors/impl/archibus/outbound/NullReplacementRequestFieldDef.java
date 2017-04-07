package com.archibus.app.common.connectors.impl.archibus.outbound;

import com.archibus.app.common.connectors.domain.ConnectorFieldConfig;
import com.archibus.app.common.connectors.exception.ConfigurationException;
import com.archibus.app.common.connectors.translation.exception.TranslationException;

/**
 * Replaces a translated value with another value if it's null.
 * 
 * @author cole
 * 
 */
public class NullReplacementRequestFieldDef extends ArchibusRequestFieldDefinition {
    /**
     * The value to replace the translated value with if it's null.
     */
    private final Object replacementValue;
    
    /**
     * Create a request field definition created from an afm_conn_flds record.
     * 
     * @param connectorField an afm_conn_fld associated with the connector that this definition
     *            represents.
     * @param replacementValue the value to replace the translated value with if it's null.
     * @throws ConfigurationException if a connector rule is present and cannot be instantiated.
     */
    public NullReplacementRequestFieldDef(final ConnectorFieldConfig connectorField,
            final Object replacementValue) throws ConfigurationException {
        super(connectorField);
        this.replacementValue = replacementValue;
    }
    
    @Override
    public Object translateToForeign(final Object databaseValue) throws TranslationException {
        final Object value = super.translateToForeign(databaseValue);
        return value == null ? this.replacementValue : value;
    }
}
