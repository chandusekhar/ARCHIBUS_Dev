package com.archibus.app.common.connectors.impl.archibus.translation.field;

import java.text.ParseException;

import org.json.JSONObject;

import com.archibus.app.common.connectors.domain.ConnectorFieldConfig;
import com.archibus.app.common.connectors.exception.ConfigurationException;
import com.archibus.app.common.connectors.translation.exception.TranslationException;

/**
 * Convert a field's value to a mapped value specified in field parameters.
 *
 * @author cole
 *
 */
public class ConvertEnumeratedParamValue implements IFieldTranslator {

    /**
     * Parameter attribute for the mapping.
     */
    private static final String ENUM_PARAM = "enumList";

    /**
     * Parameter attribute indicating whether to preserve unmapped values or replace them with null.
     */
    private static final String PRESERVE_UNMAPPED_PARAM = "preserveUnmapped";
    
    /**
     * The map of old field values to new field values.
     */
    private JSONObject mapping;
    
    /**
     * Whether to preserve unmapped values or replace them with null.
     */
    private boolean preserveUnmapped;
    
    /**
     * Initialize the enumeration <-> value map by parsing the enum_list field from the connector
     * field.
     *
     * @param connectorField the field with the enumerated list to parse.
     * @throws ConfigurationException if the parameter cannot be parsed.
     */
    @Override
    public void init(final ConnectorFieldConfig connectorField) throws ConfigurationException {
        JSONObject parameter;
        try {
            parameter = new JSONObject(connectorField.getParameter());
        } catch (final ParseException e) {
            throw new ConfigurationException(connectorField.getFieldId()
                    + "'s parameter should be a JSON object.", e);
        }
        if (!parameter.has(ENUM_PARAM)) {
            throw new ConfigurationException(connectorField.getFieldId()
                    + "'s parameter must include an attribute: " + ENUM_PARAM, null);
        }
        this.mapping = parameter.getJSONObject(ENUM_PARAM);
        this.preserveUnmapped = parameter.optBoolean(PRESERVE_UNMAPPED_PARAM, false);
    }
    
    /**
     * @param value the value to be replaced.
     * @return the new value for the value in the map, or the original value if there is no mapping
     *         and preserveUnmapped is set.
     * @throws TranslationException if the value doesn't match and preserveUnmapped is unset.
     */
    @Override
    public Object applyRule(final Object value) throws TranslationException {
        final String key = String.valueOf(value);
        Object newValue = null;
        if (this.mapping.has(key)) {
            final Object mappedValue = this.mapping.get(key);
            if (!JSONObject.NULL.equals(mappedValue)) {
                newValue = mappedValue;
            }
        } else if (this.preserveUnmapped) {
            newValue = value;
        } else {
            throw new TranslationException(value + " is not one of " + this.mapping.toString(),
                null);
        }
        return newValue;
    }
    
    /**
     * A value must exist to be converted.
     *
     * @return true.
     */
    @Override
    public boolean requiresExistingValue() {
        return true;
    }
}
