package com.archibus.app.common.connectors.impl.archibus.translation.record;

import java.text.ParseException;
import java.util.*;

import org.json.JSONObject;

import com.archibus.app.common.connectors.domain.ConnectorFieldConfig;
import com.archibus.app.common.connectors.exception.ConfigurationException;
import com.archibus.app.common.connectors.translation.exception.TranslationException;

/**
 * Connector rule to convert units of a quantity field based on the value of a second field.
 *
 * @author cole
 * @since 22.1
 *
 */
public class ConvertUnits implements IRecordTranslator {
    
    /**
     * The parameter for the name of the field with the unit qualifier.
     */
    private static final String UNIT_FIELD_PARAM = "unitField";
    
    /**
     * The parameter for the map between unit qualifiers and conversion ratios.
     */
    private static final String CONVSERION_MAP_PARAM = "conversionMap";
    
    /**
     * The field to be converted, the one on which the rule is assigned.
     */
    private String fieldKey;
    
    /**
     * The field for the unit qualifier.
     */
    private String unitField;
    
    /**
     * A map between unit qualifiers and conversion ratios.
     */
    private JSONObject conversions;
    
    @Override
    public void init(final ConnectorFieldConfig connectorField) throws ConfigurationException {
        this.fieldKey = connectorField.getFieldId();
        JSONObject parameters;
        try {
            parameters = new JSONObject(connectorField.getParameter());
        } catch (final ParseException e) {
            throw new ConfigurationException("Unable to parser parameter into JSON object. "
                    + connectorField.getParameter(), e);
        }
        this.unitField = parameters.getString(UNIT_FIELD_PARAM);
        this.conversions = parameters.getJSONObject(CONVSERION_MAP_PARAM);
        final Iterator<?> conversionIterator = this.conversions.keys();
        while (conversionIterator.hasNext()) {
            final String key = (String) conversionIterator.next();
            final String value = this.conversions.getString(key);
            if (value.indexOf('/') > -1) {
                final String[] valueParts = value.split("/");
                try {
                    this.conversions.put(key,
                        Double.valueOf(valueParts[0]) / Double.valueOf(valueParts[1]));
                } catch (final NumberFormatException e) {
                    throw new ConfigurationException(
                        "Convert units couldn't convert conversion to a number: " + value
                                + ".  Conversion factors may be decimal numbers or fractions.", e);
                }
            }
        }
    }
    
    @Override
    public boolean requiresExistingValue() {
        return true;
    }
    
    @Override
    public void applyRule(final Map<String, Object> record, final Map<String, Object> originalRecord) {
        final String unit = String.valueOf(originalRecord.get(this.unitField));
        double quantity;
        final Object originalQuantity = originalRecord.get(this.fieldKey);
        if (originalQuantity instanceof Number) {
            quantity = ((Number) originalQuantity).doubleValue();
        } else {
            try {
                quantity = Double.valueOf(originalQuantity.toString());
            } catch (final NumberFormatException e) {
                throw new TranslationException(
                    "Convert units couldn't convert quantity to a number: " + originalQuantity, e);
            }
        }
        if (this.conversions.has(unit)) {
            record.put(this.fieldKey, quantity * this.conversions.getDouble(unit));
        }
    }
    
}
