package com.archibus.eventhandler.eam.connectors;

import java.util.*;
import java.util.regex.Pattern;

import com.archibus.app.common.connectors.domain.ConnectorFieldConfig;
import com.archibus.app.common.connectors.exception.ConfigurationException;
import com.archibus.app.common.connectors.impl.archibus.DataSourceUtil;
import com.archibus.app.common.connectors.impl.archibus.translation.record.IRecordTranslator;
import com.archibus.context.ContextStore;
import com.archibus.datasource.DataSourceFieldDefLoader;
import com.archibus.db.ViewField.Immutable;
import com.archibus.db.*;
import com.archibus.schema.*;
import com.archibus.utility.StringUtil;
import com.aspose.cells.DateTime;

/*
 * JUSTIFICATION: it's actually one method, broken up to reduce complexity.
 */
/**
 * Checks the validity of fields against the ARCHIBUS schema, remove the value from the transaction,
 * and note this in a description.
 *
 * @author cole
 * @since 22.1
 *
 */
@SuppressWarnings("PMD.TooManyMethods")
public class AssetValidationRule implements IRecordTranslator {
    
    /**
     * " should be " - stating that what follows is the intended condition of the value.
     */
    private static final String SHOULD_BE = " should be ";
    
    /**
     * " found: " - stating that what follows is the value as provided.
     */
    private static final String WAS = " was: ";

    /**
     * " characters" - the units of a string's length.
     */
    private static final String CHARACTERS = " characters";
    
    /**
     * ARCHIBUS field definitions for imported values.
     */
    private Map<String, Immutable> fieldDefs;
    
    /**
     * Field for error descriptions.
     */
    private String descriptionField;
    
    @Override
    public void init(final ConnectorFieldConfig assignedConnectorField)
            throws ConfigurationException {
        this.fieldDefs = new HashMap<String, Immutable>();
        final DataSourceFieldDefLoader loader = new DataSourceFieldDefLoader();
        for (final ConnectorFieldConfig connectorField : assignedConnectorField.getConnector()
            .getConnectorFields()) {
            final Immutable fieldDef = DataSourceUtil.getFieldDef(connectorField, loader);
            if (fieldDef != null) {
                this.fieldDefs.put(connectorField.getFieldId(), fieldDef);
            }
        }
        this.descriptionField = assignedConnectorField.getFieldId();
    }
    
    @Override
    public boolean requiresExistingValue() {
        return false;
    }
    
    @Override
    public void applyRule(final Map<String, Object> record, final Map<String, Object> originalRecord) {
        String message = null;
        for (final String fieldId : this.fieldDefs.keySet()) {
            message = checkValue(fieldId, this.fieldDefs.get(fieldId), record.get(fieldId));
            if (message != null) {
                record.remove(fieldId);
                record.put(this.descriptionField, message);
            }
            
        }
    }
    
    /**
     * @param fieldId the source field id.
     * @param fieldDef the ARCHIBUS schema definition for the field.
     * @param value the value of the field.
     * @return message explaining why the field should be removed from the transaction or null if it
     *         shouldn't be.
     */
    private static String checkValue(final String fieldId, final Immutable fieldDef,
            final Object value) {
        String message;
        if (StringUtil.isNullOrEmpty(value)) {
            message = checkNull(fieldId, fieldDef);
        } else {
            message = checkNotNull(fieldId, fieldDef, value);
        }
        return message;
    }

    /*
     * JUSTIFICATION: simple switch based on enumeration.
     */
    /**
     * @param fieldId the source field id.
     * @param fieldDef the ARCHIBUS schema definition for the field.
     * @param value the value of the field.
     * @return message explaining why the field should be removed from the transaction or null if it
     *         shouldn't be.
     */
    @SuppressWarnings("PMD.CyclomaticComplexity")
    private static String checkNotNull(final String fieldId, final Immutable fieldDef,
            final Object value) {
        String message = checkEnum(fieldId, fieldDef, value);
        if (message == null) {
            switch (DataType.get(fieldDef.getSqlType())) {
                case SMALLINT:
                case INTEGER:
                    message = checkInteger(fieldId, fieldDef, value);
                    break;
                case NUMERIC:
                case REAL:
                case DECIMAL:
                case FLOAT:
                case DOUBLE:
                    message = checkReal(fieldId, fieldDef, value);
                    break;
                case DATE:
                    message = checkDate(fieldId, value);
                    break;
                case TIME:
                    message = checkTime(fieldId, value);
                    break;
                case TIMESTAMP:
                    message = checkTimestamp(fieldId, value);
                    break;
                case CHAR:
                case VARCHAR:
                case LONGVARCHAR:
                default:
                    message = checkString(fieldId, fieldDef, value);
                    break;
            }
        }
        return message;
    }
    
    /**
     * @param fieldId the source field id.
     * @param fieldDef the ARCHIBUS schema definition for the field.
     * @param value the value of the field.
     * @return message explaining why the field should be removed from the transaction or null if it
     *         shouldn't be.
     */
    private static String checkEnum(final String fieldId, final Immutable fieldDef,
            final Object value) {
        String message = null;
        FieldEnumImpl fieldEnumDef = null;
        if (fieldDef instanceof FieldEnumImpl) {
            fieldEnumDef = (FieldEnumImpl) fieldDef;
        } else if (fieldDef instanceof ViewFieldImpl) {
            final com.archibus.schema.ArchibusFieldDefBase.Immutable viewField =
                    ((ViewFieldImpl) fieldDef).getFieldDef();
            if (viewField instanceof FieldEnumImpl) {
                fieldEnumDef = (FieldEnumImpl) viewField;
            }
        }
        if (fieldEnumDef != null) {
            boolean found = false;
            for (final Object enumMappingObject : fieldEnumDef.getValues(ContextStore.get()
                .getUserSession().getLocale())) {
                final List<?> enumMapping = (List<?>) enumMappingObject;
                found = value.equals(enumMapping.get(0));
                if (found) {
                    break;
                }
            }
            if (!found) {
                message = fieldId + SHOULD_BE + "an enumerated value" + WAS + value;
            }
        }
        return message;
    }

    /**
     * @param fieldId the source field id.
     * @param fieldDef the ARCHIBUS schema definition for the field.
     * @return message explaining why the field should be removed from the transaction or null if it
     *         shouldn't be.
     */
    private static String checkNull(final String fieldId, final Immutable fieldDef) {
        String message = null;
        if (!fieldDef.getAllowNull() && StringUtil.isNullOrEmpty(fieldDef.getDefaultValue())) {
            message = fieldId + " should not be null";
        }
        return message;
    }

    /**
     * @param fieldId the source field id.
     * @param fieldDef the ARCHIBUS schema definition for the field.
     * @param value the value of the field.
     * @return message explaining why the field should be removed from the transaction or null if it
     *         shouldn't be.
     */
    private static String checkInteger(final String fieldId, final Immutable fieldDef,
            final Object value) {
        String message = null;
        try {
            message = checkRange(fieldId, fieldDef, Integer.valueOf(value.toString()));
        } catch (final NumberFormatException e) {
            message = fieldId + SHOULD_BE + "an integer" + WAS + value;
        }
        return message;
    }
    
    /**
     * @param fieldId the source field id.
     * @param fieldDef the ARCHIBUS schema definition for the field.
     * @param value the value of the field.
     * @return message explaining why the field should be removed from the transaction or null if it
     *         shouldn't be.
     */
    private static String checkReal(final String fieldId, final Immutable fieldDef,
            final Object value) {
        String message = null;
        try {
            message = checkRange(fieldId, fieldDef, Double.valueOf(value.toString()));
        } catch (final NumberFormatException e) {
            message = fieldId + SHOULD_BE + "a number" + WAS + value;
        }
        return message;
    }
    
    /**
     * @param fieldId the source field id.
     * @param value the value of the field.
     * @return message explaining why the field should be removed from the transaction or null if it
     *         shouldn't be.
     */
    private static String checkDate(final String fieldId, final Object value) {
        String message = null;
        if (!(value instanceof java.util.Date || value instanceof DateTime)) {
            message =
                    fieldId + SHOULD_BE + "a java.util.Date or java.sql.Date" + WAS
                            + value.getClass();
        }
        return message;
    }
    
    /**
     * @param fieldId the source field id.
     * @param value the value of the field.
     * @return message explaining why the field should be removed from the transaction or null if it
     *         shouldn't be.
     */
    private static String checkTime(final String fieldId, final Object value) {
        String message = null;
        if (!(value instanceof java.util.Date || value instanceof DateTime)) {
            message =
                    fieldId + SHOULD_BE + "a java.util.Date or java.sql.Time" + WAS
                            + value.getClass();
        }
        return message;
    }

    /**
     * @param fieldId the source field id.
     * @param value the value of the field.
     * @return message explaining why the field should be removed from the transaction or null if it
     *         shouldn't be.
     */
    private static String checkTimestamp(final String fieldId, final Object value) {
        String message = null;
        if (!(value instanceof java.util.Date || value instanceof java.sql.Timestamp)) {
            message =
                    fieldId + SHOULD_BE + "a java.util.Date or java.sql.Timestamp" + WAS
                            + value.getClass();
        }
        return message;
    }

    /**
     * @param fieldId the source field id.
     * @param fieldDef the ARCHIBUS schema definition for the field.
     * @param value the value of the field.
     * @return message explaining why the field should be removed from the transaction or null if it
     *         shouldn't be.
     */
    private static String checkString(final String fieldId, final Immutable fieldDef,
            final Object value) {
        String message = null;
        /*
         * check strings
         */
        final String fieldValue = value.toString();
        if (fieldValue.length() > fieldDef.getSize()) {
            message =
                    fieldId + SHOULD_BE + "less than or equal to " + fieldDef.getSize()
                            + CHARACTERS + WAS + fieldValue.length() + CHARACTERS;
        }
        switch (fieldDef.getFormatting()) {
            case Numbers:
                if (!Pattern.matches("[0-9]*", fieldValue)) {
                    message = fieldId + SHOULD_BE + "only numbers" + WAS + fieldValue;
                }
                break;
            case Upper:
                if (!Pattern.matches("[^a-z]*", fieldValue)) {
                    message = fieldId + SHOULD_BE + "free of lowercase letters" + WAS + fieldValue;
                }
                break;
            case UpperAlpha:
                if (!Pattern.matches("[A-Z]*", fieldValue)) {
                    message = fieldId + SHOULD_BE + "only upper case letters" + WAS + fieldValue;
                }
                break;
            case UpperAlphaNum:
                if (!Pattern.matches("[A-Z0-9]*", fieldValue)) {
                    message =
                            fieldId + SHOULD_BE + "only upper case letters and numbers" + WAS
                                    + fieldValue;
                }
                break;
            default:
                break;
        }
        return message;
    }
    
    /**
     * @param fieldId the source field id.
     * @param fieldDef the ARCHIBUS schema definition for the field.
     * @param value the value of the field.
     * @return message explaining why the field should be removed from the transaction or null if it
     *         shouldn't be.
     */
    private static String checkRange(final String fieldId, final Immutable fieldDef,
            final Number value) {
        String message = null;
        if (fieldDef.getMinimumValue() != null && value.doubleValue() < fieldDef.getMinimumValue()) {
            message =
                    fieldId + SHOULD_BE + "greater than " + fieldDef.getMinimumValue() + WAS
                            + value;
        }
        if (fieldDef.getMinimumValue() != null && value.doubleValue() > fieldDef.getMaximumValue()) {
            message = fieldId + SHOULD_BE + "less than " + fieldDef.getMinimumValue() + WAS + value;
        }
        return message;
    }
}
