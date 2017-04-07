package com.archibus.app.common.connectors.impl.archibus.translation.field;

import java.text.DecimalFormat;

import com.archibus.app.common.connectors.domain.ConnectorFieldConfig;
import com.archibus.app.common.connectors.exception.ConfigurationException;
import com.archibus.app.common.connectors.translation.exception.TranslationException;

/**
 * Connector rule for converting a numeric value to a String for use in VARCHAR or CHAR fields. Uses
 * java.text.DecimalFormat pattern notation. If the value is not a number it will not be modified.
 * The purpose of this design is that if there are multiple data formats in a field, different rules
 * can be used to handle different formats.
 *
 * @author cole
 * @since 22.1
 *
 */
public class ConvertNumberToText implements IFieldTranslator {
    
    /**
     * The String format to produce.
     */
    private DecimalFormat format;

    @Override
    public void init(final ConnectorFieldConfig connectorField) throws ConfigurationException {
        if (connectorField.getParameter() == null) {
            this.format = new DecimalFormat();
        } else {
            this.format = new DecimalFormat(connectorField.getParameter());
        }
    }

    @Override
    public boolean requiresExistingValue() {
        return true;
    }

    @Override
    public Object applyRule(final Object value) throws TranslationException {
        Object newValue = value;
        if (value instanceof Number) {
            newValue = this.format.format(value);
        }
        return newValue;
    }
}
