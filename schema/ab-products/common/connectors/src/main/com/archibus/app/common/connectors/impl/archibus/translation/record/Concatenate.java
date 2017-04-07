package com.archibus.app.common.connectors.impl.archibus.translation.record;

import java.util.Map;
import java.util.regex.Pattern;

import com.archibus.app.common.connectors.domain.ConnectorFieldConfig;
import com.archibus.utility.StringUtil;

/**
 * A translator that concatenates fields on a record into another record.
 *
 * @author cole
 *
 */
public class Concatenate implements IRecordTranslator {
    
    /**
     * The position of the field in which to store the result of concatenation.
     */
    private String fieldKey = "";
    
    /**
     * The pattern of fields to concatenate, which is a series of strings divided by groupDelimiter,
     * where the string may be encapsulated by positionDelimiter if the contained index it
     * represents a field.
     */
    private String[] subPatterns = new String[0];
    
    /**
     * Indicates whether a subPattern at a corresponding position represents a field name or a
     * literal string.
     */
    private boolean[] subPatternIsField = new boolean[0];
    
    /**
     * @param connectorField the field this rule is to be applied to.
     */
    public void init(final ConnectorFieldConfig connectorField) {
        this.fieldKey = connectorField.getFieldId();
        String groupDelimiter = "\\|";
        String positionDelimiter = "?";
        if (!StringUtil.isNullOrEmpty(connectorField.getParameter())) {
            final String[] splitParameter = connectorField.getParameter().split("::");
            groupDelimiter = Pattern.quote(splitParameter[0]);
            positionDelimiter = splitParameter[1];
        }
        final Map<Integer, ConnectorFieldConfig> otherConnectorFields =
                connectorField.getConnector().getConnectorFieldPositionMap();
        this.subPatterns = connectorField.getFieldId().split(groupDelimiter);
        this.subPatternIsField = new boolean[this.subPatterns.length];
        for (int patternIndex = 0; patternIndex < this.subPatterns.length; patternIndex++) {
            final String subPattern = this.subPatterns[patternIndex];
            if (subPattern.endsWith(positionDelimiter) && subPattern.startsWith(positionDelimiter)) {
                final int fieldIndex =
                        Integer.parseInt(subPattern.substring(1, subPattern.length() - 1));
                this.subPatterns[patternIndex] = otherConnectorFields.get(fieldIndex).getFieldId();
                this.subPatternIsField[patternIndex] = true;
            } else {
                this.subPatternIsField[patternIndex] = false;
            }
        }
    }
    
    /**
     * Concatenate the values based on the field configuration.
     *
     * @param record with fields to concatenate, keys are ARCHIBUS field names.
     * @param originalRecord the record prior to translation by other record level rules.
     */
    public void applyRule(final Map<String, Object> record, final Map<String, Object> originalRecord) {
        final StringBuilder newValue = new StringBuilder();
        for (int patternIndex = 0; patternIndex < this.subPatterns.length; patternIndex++) {
            final String subPattern = this.subPatterns[patternIndex];
            if (this.subPatternIsField[patternIndex]) {
                final Object originalValue = originalRecord.get(subPattern);
                final String fieldValue = originalValue == null ? null : originalValue.toString();
                newValue.append(fieldValue == null ? "" : fieldValue);
            } else {
                newValue.append(subPattern);
            }
        }
        record.put(this.fieldKey, newValue.toString());
    }
    
    /**
     * Indicates that there is no field to be read from the source.
     *
     * @return false.
     */
    public boolean requiresExistingValue() {
        return false;
    }
}
