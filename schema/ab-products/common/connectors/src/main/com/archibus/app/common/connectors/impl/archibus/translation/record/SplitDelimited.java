package com.archibus.app.common.connectors.impl.archibus.translation.record;

import java.text.ParseException;
import java.util.*;

import org.json.*;

import com.archibus.app.common.connectors.domain.ConnectorFieldConfig;
import com.archibus.app.common.connectors.exception.ConfigurationException;
import com.archibus.app.common.connectors.translation.exception.TranslationException;

/**
 * Provides translation of a field value where the value contains a delimited set of values.
 *
 * @author cole
 * @since 22.1
 *
 */
public class SplitDelimited implements IRecordTranslator {
    
    /**
     * The name of the parameter specifying the regular expression to use to split the value into
     * fields.
     */
    private static final String DELIMITER_PATTERN_PARAM = "delimiterPattern";
    
    /**
     * The name of the parameter specifying whether to trim whitespace after parsing the values.
     */
    private static final String TRIM_PARAM = "trim";

    /**
     * The name of the parameter specifying the fields to be populated from the parsed value.
     */
    private static final String TARGET_FIELDS_PARAM = "targetFields";

    /**
     * The path to the field this rule is assigned to, the one with the value that should be split.
     */
    private String forieignFieldPath;

    /**
     * The fields to be populated from the parsed value.
     */
    private final List<String> targetFieldNames = new ArrayList<String>();

    /**
     * The regular expression to use to split the value into fields.
     */
    private String delimiterPattern = ",";

    /**
     * Whether to trim whitespace after parsing the values.
     */
    private boolean trim;

    @Override
    public void init(final ConnectorFieldConfig connectorField) throws ConfigurationException {
        this.forieignFieldPath = connectorField.getForeignFieldPath();
        JSONObject configuration;
        try {
            configuration = new JSONObject(connectorField.getParameter());
        } catch (final ParseException e) {
            throw new ConfigurationException(
                "Unable to parse configuration for SPLIT DELIMITED rule: "
                        + connectorField.getParameter(), e);
        }
        this.trim = configuration.optBoolean(TRIM_PARAM, false);
        this.delimiterPattern = configuration.getString(DELIMITER_PATTERN_PARAM);
        this.targetFieldNames.clear();
        final JSONArray targetFieldConfig = configuration.getJSONArray(TARGET_FIELDS_PARAM);
        for (int targetFieldIndex = 0; targetFieldIndex < targetFieldConfig.length(); targetFieldIndex++) {
            this.targetFieldNames.add(targetFieldConfig.getString(targetFieldIndex));
        }
        
    }

    @Override
    public boolean requiresExistingValue() {
        return true;
    }

    @Override
    public void applyRule(final Map<String, Object> record, final Map<String, Object> originalRecord)
            throws TranslationException {
        final Object value = originalRecord.get(this.forieignFieldPath);
        if (value != null) {
            final String[] parts = value.toString().split(this.delimiterPattern);
            for (int partIndex = 0; partIndex < this.targetFieldNames.size()
                    && partIndex < parts.length; partIndex++) {
                final String targetField = this.targetFieldNames.get(partIndex);
                final String part = parts[partIndex];
                if (targetField != null) {
                    record.put(targetField, this.trim ? part.trim() : part);
                }
            }
        }
    }

}
