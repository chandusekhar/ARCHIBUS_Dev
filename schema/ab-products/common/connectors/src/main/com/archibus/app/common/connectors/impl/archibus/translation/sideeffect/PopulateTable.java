package com.archibus.app.common.connectors.impl.archibus.translation.sideeffect;

import java.util.*;

import com.archibus.app.common.connectors.domain.ConnectorFieldConfig;
import com.archibus.app.common.connectors.exception.*;
import com.archibus.app.common.connectors.impl.archibus.translation.record.AbstractValidatingRule;
import com.archibus.app.common.connectors.translation.common.inbound.impl.ArchibusDataTable;
import com.archibus.app.common.connectors.translation.exception.TranslationException;
import com.archibus.datasource.*;
import com.archibus.datasource.data.*;
import com.archibus.utility.*;

/**
 * Add data to a table referred to by the record being imported.
 *
 * @author cole
 *
 */
public class PopulateTable extends AbstractValidatingRule implements ISideEffectRule {

    /**
     * Index for archibus table's fields in arrays.
     */
    private static final int SOURCE = 0;

    /**
     * Index for referenced fields in arrays.
     */
    private static final int TARGET = 1;

    /**
     * Field delimiter for field entries in field parameters.
     */
    private static final String FIELD_DELIMITER_REGEX = "\\|";

    /**
     * Delimits mappings in a field entry from field parameters.
     */
    private static final String MAPPING_DELIMITER_REGEX = "\\;";

    /**
     * Delimits mappings in a field entry from field parameters.
     */
    private static final String MAPPING_DELIMITER = ";";

    /**
     * Source fields to table qualified database fields.
     */
    private String[][] fieldMapping;

    /**
     * Data source for the validating table.
     */
    private DataSource referencedDataSource;

    /**
     * The names of the primary keys of the ARCHIBUS table this connector is applied to (must be
     * same length as foreignKeyFields.
     * <p>
     * <b>IMPORTANT:</b> must not be modified after getCache() is called.
     */
    private String[] recordKeyFields;

    @Override
    public void init(final ConnectorFieldConfig connectorField) {
        super.init(connectorField);
        /*
         * Use afm_conn_flds.parameters.
         */
        this.recordKeyFields = super.getRecordKeyFields();
        final String[] validatingTableKeyFields = getValidatingTableKeyFields();
        if (StringUtil.isNullOrEmpty(getRuleParameter())) {
            this.fieldMapping = new String[2][this.recordKeyFields.length];
            for (int fieldIndex = 0; fieldIndex < this.recordKeyFields.length; fieldIndex++) {
                this.fieldMapping[SOURCE][fieldIndex] = this.recordKeyFields[fieldIndex];
                this.fieldMapping[TARGET][fieldIndex] = validatingTableKeyFields[fieldIndex];
            }
        } else {
            final String[] fields = ((String) getRuleParameter()).split(FIELD_DELIMITER_REGEX);
            this.fieldMapping = new String[2][fields.length];
            for (int fieldIndex = 0; fieldIndex < fields.length; fieldIndex++) {
                final String field = fields[fieldIndex];
                if (field.contains(MAPPING_DELIMITER)) {
                    final String[] splitField = field.split(MAPPING_DELIMITER_REGEX);
                    this.fieldMapping[SOURCE][fieldIndex] = splitField[SOURCE];
                    this.fieldMapping[TARGET][fieldIndex] = splitField[TARGET];
                    fixRecordKeyFields(splitField[SOURCE], splitField[TARGET]);
                } else {
                    final String target = inferArchibusFieldName(fieldIndex, field, connectorField);
                    this.fieldMapping[SOURCE][fieldIndex] = field;
                    this.fieldMapping[TARGET][fieldIndex] = target;
                    fixRecordKeyFields(field, target);
                }
            }
        }

        this.referencedDataSource = DataSourceFactory.createDataSource();
        this.referencedDataSource.addTable(getValidatingTable())
            .addField(this.fieldMapping[TARGET]);
        addPkeyFields(this.referencedDataSource);
    }

    /**
     * Looks at the validating table's primary keys first using the fieldIndex, then the connector
     * configuration using the configuredFieldName.
     *
     * @param fieldIndex index of the field in the validating table's primary key.
     * @param configuredName the field id of the field on the connector.
     * @param connectorField the connector field on which the rule is defined.
     * @return the name of the field on the validating table.
     * @throws ConfigurationException if the field name cannot be infered.
     */
    private String inferArchibusFieldName(final int fieldIndex, final String configuredName,
            final ConnectorFieldConfig connectorField) throws ConfigurationException {
        String name = null;
        final String[] validatingTableKeyFields = getValidatingTableKeyFields();
        if (fieldIndex < validatingTableKeyFields.length) {
            /*
             * If it's within the range of the primary key fields in the target table.
             */
            name = validatingTableKeyFields[fieldIndex];
        } else {
            /*
             * If it matches a connector field on this connector, use that field's ARCHIBUS field
             * name.
             */
            for (final ConnectorFieldConfig field : connectorField.getConnector()
                .getConnectorFields()) {
                if (configuredName.equals(field.getFieldId())) {
                    name = field.getArchibusField();
                    break;
                }
            }
        }
        if (name == null) {
            throw new ConfigurationException("could not infer ARCHIBUS field for " + configuredName,
                null);
        } else {
            return name;
        }
    }

    /**
     * The record key fields are normally mapped to primary keys, but the parameter can override
     * that. In order for records to be looked up properly, we need to fix the mapping.
     *
     * @param source the source field.
     * @param target the target field the source field is mapped to.
     */
    private void fixRecordKeyFields(final String source, final String target) {
        final String[] validatingTableKeyFields = getValidatingTableKeyFields();
        for (int keyFieldIndex =
                0; keyFieldIndex < validatingTableKeyFields.length; keyFieldIndex++) {
            if (target.equals(validatingTableKeyFields[keyFieldIndex])) {
                this.recordKeyFields[keyFieldIndex] = source;
            }
        }
    }

    /**
     * Make changes to a referenced table based on a transaction being applied to a referring table.
     *
     * @param record values to be used to construct the record in the referenced table.
     * @throws TranslationException if the table cannot be populated with the specified data.
     */
    @Override
    public void applySideEffect(final Map<String, Object> record) throws TranslationException {
        this.referencedDataSource.clearRestrictions();
        DataRecord referencedRecord = getCache().get(record, this.referencedDataSource);
        if (referencedRecord == null) {
            referencedRecord = this.referencedDataSource.createNewRecord();
            addPkeyFields(record, referencedRecord);
        }
        try {
            updateReferencedRecord(record, referencedRecord);
        } catch (final DatabaseException e) {
            throw new TranslationException(e.getLocalizedMessage(), e);
        }
    }

    /**
     * Update the referenced record.
     *
     * @param record the record after previous record rules have been applied.
     * @param referencedRecord the data record from the referenced table without modification.
     * @throws DatabaseException may be thrown if a field's value is invalid.
     */
    protected void updateReferencedRecord(final Map<String, Object> record,
            final DataRecord referencedRecord) throws DatabaseException {
        for (int fieldIndex = 0; fieldIndex < this.fieldMapping[SOURCE].length; fieldIndex++) {
            final String sourceField = this.fieldMapping[SOURCE][fieldIndex];
            final String targetField = this.fieldMapping[TARGET][fieldIndex];
            Object value = record.get(sourceField);
            if (value instanceof String) {
                final DataValue dataValue =
                        referencedRecord.findField(getValidatingTable() + '.' + targetField);
                ArchibusDataTable.validateStringLength((String) value, dataValue);
                dataValue.setUiValue((String) value);
                value = dataValue.getValue();
            }
            referencedRecord.setValue(getValidatingTable() + '.' + targetField, value);
        }
        try {
            this.referencedDataSource.saveRecord(referencedRecord);
            this.referencedDataSource.commit();
        } catch (final ExceptionBase e) {
            throw new TranslationException("Unable to populate table " + getValidatingTable() + ": "
                    + ExceptionUtil.getExceptionBaseMessage(e),
                e);
        }
    }

    /**
     * @return true as a value is required to identify the record in the other table.
     */
    @Override
    public boolean requiresExistingValue() {
        return true;
    }

    /**
     * @return the names of the primary keys of the ARCHIBUS table this connector is applied to
     *         (must be same length as foreignKeyFields.
     */
    @Override
    protected String[] getRecordKeyFields() {
        return Arrays.copyOf(this.recordKeyFields, this.recordKeyFields.length);
    }
}
