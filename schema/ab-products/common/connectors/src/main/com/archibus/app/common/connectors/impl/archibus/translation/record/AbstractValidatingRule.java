package com.archibus.app.common.connectors.impl.archibus.translation.record;

import java.text.ParseException;
import java.util.*;

import org.json.*;

import com.archibus.app.common.connectors.domain.*;
import com.archibus.app.common.connectors.exception.ConfigurationException;
import com.archibus.app.common.connectors.impl.archibus.DataSourceUtil;
import com.archibus.app.common.connectors.impl.archibus.translation.IConnectorRule;
import com.archibus.config.Project;
import com.archibus.context.ContextStore;
import com.archibus.datasource.DataSource;
import com.archibus.datasource.data.DataRecord;
import com.archibus.schema.ArchibusFieldDefBase.Immutable;
import com.archibus.schema.TableDef;
import com.archibus.utility.*;

/**
 * A connector rule that works against the ARCHIBUS field's ref_table.
 *
 * @author cole
 *
 */
public abstract class AbstractValidatingRule implements IConnectorRule {

    /**
     * Parameter for record fields.
     */
    private static final String ALTERNATE_RECORD_KEY_FIELDS_PARAM = "recordFields";

    /**
     * Parameter for parameters specific to implementation of a rule.
     */
    private static final String ALTERNATE_RULE_PARAM = "ruleParam";

    /**
     * The name of the source field that this rule is assigned to.
     */
    private String sourceField;

    /**
     * The ref_table field for the ARCHIBUS field, or the validating table if present.
     */
    private String validatingTable;

    /**
     * The names of the primary keys of the ref_table.
     * <p>
     * <b>IMPORTANT:</b> must not be modified after getCache() is called.
     */
    private String[] validatingTableKeyFields;

    /**
     * The names of the primary keys of the ARCHIBUS table this connector is applied to (must be
     * same length as foreignKeyFields.
     * <p>
     * <b>IMPORTANT:</b> must not be modified after getCache() is called.
     */
    private String[] recordKeyFields;

    /**
     * Whether this rule is being applied to in import or export.
     */
    private boolean exporting;

    /**
     * The parameter for the rule, apart from those expected by AbstractValidatingRule.
     */
    private Object ruleParameter;

    /**
     * Whether to use the cache.
     */
    private boolean caching;

    /**
     * A cache for records from the validating table.
     */
    private RecordCache cache;

    /**
     * Instantiate this rule, completely resetting it's state.
     *
     * @param connectorField the field this rule applies to. This must refer to a field in the
     *            ARCHIBUS database that has a valid referenced table, and the primary keys for that
     *            table should be available on this connector.
     * @throws ConfigurationException if the fields or validating table do not exist, or primary
     *             keys are missing.
     */
    @Override
    public void init(final ConnectorFieldConfig connectorField) throws ConfigurationException {
        this.sourceField = connectorField.getFieldId();
        this.exporting = connectorField.getConnector().getExport();
        this.caching = connectorField.getCache();

        final Project.Immutable project = ContextStore.get().getProject();
        final TableDef.Immutable tableDef =
                project.loadTableDef(connectorField.getConnector().getArchibusTable());

        try {
            if (connectorField.getParameter() == null) {
                /*
                 * There isn't a parameter.
                 */
                setFieldsWithoutParameter(project, tableDef, connectorField);
            } else {
                final JSONObject parameters = new JSONObject(connectorField.getParameter());
                /*
                 * There is a JSON parameter, it belongs to this class.
                 */
                if (parameters.has(ALTERNATE_RULE_PARAM)) {
                    /*
                     * There is an alternate parameter for the rule's parameters.
                     */
                    this.ruleParameter = parameters.get(ALTERNATE_RULE_PARAM);
                } else {
                    this.ruleParameter = parameters;
                }
                if (parameters.has(ALTERNATE_RECORD_KEY_FIELDS_PARAM)
                        && connectorField.getValidateTbl() != null) {
                    /*
                     * There is an alternate parameter.
                     */
                    setFieldsWithParameter(project, parameters, connectorField);
                } else {
                    /*
                     * There are no alternate parameters.
                     */
                    setFieldsWithoutParameter(project, tableDef, connectorField);
                }
            }
        } catch (final ParseException e) {
            /*
             * There is a non-JSON parameter.
             */
            this.ruleParameter = connectorField.getParameter();
            setFieldsWithoutParameter(project, tableDef, connectorField);
        }

        if (this.validatingTableKeyFields.length != this.recordKeyFields.length) {
            throw new ConfigurationException(
                "Inconsistent number of foreign key fields on referring table to primary key fields on record definition.\n"
                        + "referring:  " + Arrays.toString(this.validatingTableKeyFields) + '\n'
                        + "referenced: " + Arrays.toString(this.recordKeyFields),
                null);
        }
    }

    /**
     * Sets validatingTable, validatingTableDef, validatingTableKeyFields and recordKeyFields using
     * user specified key fields.
     *
     * @param project ARCHIBUS project.
     * @param parameters field parameters including "recordFields" parameter with an array of key
     *            fields for the table being updated, in the order they appear on the reference
     *            table.
     * @param connectorField configuration for the connector field.
     */
    private void setFieldsWithParameter(final Project.Immutable project,
            final JSONObject parameters, final ConnectorFieldConfig connectorField) {
        this.validatingTable = connectorField.getValidateTbl();
        this.validatingTableKeyFields = getForeignKeyFields(project, this.validatingTable);
        setRecordKeyFields(parameters.getJSONArray(ALTERNATE_RECORD_KEY_FIELDS_PARAM));
    }

    /**
     * Sets validatingTable, validatingTableDef, validatingTableKeyFields and recordKeyFields using
     * key fields on the table definition.
     *
     * @param project ARCHIBUS project.
     * @param tableDef ARCHIBUS table definition.
     * @param connectorField configuration for the connector field.
     */
    private void setFieldsWithoutParameter(final Project.Immutable project,
            final TableDef.Immutable tableDef, final ConnectorFieldConfig connectorField) {
        final Immutable fieldDef = setValidatingTable(connectorField, tableDef);
        this.validatingTableKeyFields = getForeignKeyFields(project, this.validatingTable);
        setRecordKeyFields(fieldDef, connectorField, this.validatingTableKeyFields);
    }

    /**
     * @param project the active ARCHIBUS project
     * @param foreignTable the name of the table being validated against.
     * @return the names of the primary keys in the foreign table in order of their primary_key
     *         field.
     */
    private static String[] getForeignKeyFields(final Project.Immutable project,
            final String foreignTable) {
        final TableDef.Immutable foreignTableDef = project.loadTableDef(foreignTable);
        final ListWrapper.Immutable<Immutable> foreignKeyFieldDefs =
                foreignTableDef.getPrimaryKey().getFields();
        final String[] foreignKeyFields = new String[foreignKeyFieldDefs.size()];
        for (final Immutable foreignKeyField : foreignKeyFieldDefs) {
            foreignKeyFields[foreignKeyField.getPrimaryKeyIndex() - 1] = foreignKeyField.getName();
        }
        return foreignKeyFields;
    }

    /**
     * @param connectorField the connector field this rule is assigned to.
     * @param tableDef this transaction definition is updating.
     * @return the field definition containing the dependent columns.
     * @throws ConfigurationException if no relationship exists between the table being updated and
     *             the referenced table.
     */
    private Immutable setValidatingTable(final ConnectorFieldConfig connectorField,
            final TableDef.Immutable tableDef) throws ConfigurationException {
        Immutable fieldDef = null;
        if (StringUtil.isNullOrEmpty(connectorField.getValidateTbl())) {
            /*
             * use ref_table
             */
            if (DataSourceUtil.isDsField(connectorField)) {
                fieldDef = tableDef.getFieldDef(connectorField.getArchibusField());
                this.validatingTable = fieldDef.getReferenceTable();
            }
        } else {
            /*
             * Use validate_tbl
             */
            this.validatingTable = connectorField.getValidateTbl();
            for (final Immutable potentialFieldDef : tableDef.getFieldsList()) {
                if (this.validatingTable.equals(potentialFieldDef.getReferenceTable())) {
                    fieldDef = potentialFieldDef;
                    break;
                }
            }
        }
        return fieldDef;
    }

    /**
     * @param recordKeyFieldsParameter array of record key fields in the same order the matching
     *            fields appear on the referenced table.
     */
    private void setRecordKeyFields(final JSONArray recordKeyFieldsParameter) {
        final List<String> recordKeyFieldsList = new ArrayList<String>();
        for (int i = 0; i < recordKeyFieldsParameter.length(); i++) {
            recordKeyFieldsList.add(recordKeyFieldsParameter.getString(i));
        }
        this.recordKeyFields = recordKeyFieldsList.toArray(new String[recordKeyFieldsList.size()]);
    }

    /**
     * @param fieldDef the field definition for the field that references the foreign table.
     * @param connectorField the connector field this rule is assigned to.
     * @param foreignKeyFields the names of the primary key fields in the referenced table.
     */
    private void setRecordKeyFields(final Immutable fieldDef,
            final ConnectorFieldConfig connectorField, final String[] foreignKeyFields) {
        final ConnectorConfig connector = connectorField.getConnector();
        String[] recordForeignKeyFields = new String[foreignKeyFields.length];
        if (fieldDef != null && fieldDef.getForeignFields().size() > 0) {
            final List<?> foreignFields = fieldDef.getForeignFields();
            recordForeignKeyFields = foreignFields.toArray(new String[foreignFields.size()]);
        } else {
            System.arraycopy(foreignKeyFields, 0, recordForeignKeyFields, 0,
                foreignKeyFields.length);
        }
        final List<ConnectorFieldConfig> connectorFields = connector.getConnectorFields();
        this.recordKeyFields = new String[recordForeignKeyFields.length];
        int recordForeignKeyIndex = 0;
        if (connector.getExport()) {
            for (final String recordForeignKeyField : recordForeignKeyFields) {
                /*
                 * get ARCHIBUS key value, which is the same as the ARCHIBUS field name.
                 */
                this.recordKeyFields[recordForeignKeyIndex] = recordForeignKeyField;
                recordForeignKeyIndex++;
            }
        } else {
            for (final Object recordForeignKeyField : recordForeignKeyFields) {
                /*
                 * get foreign system key value
                 */
                for (final ConnectorFieldConfig potentialForeignConnectorField : connectorFields) {
                    if (recordForeignKeyField
                        .equals(potentialForeignConnectorField.getArchibusField())) {
                        this.recordKeyFields[recordForeignKeyIndex] =
                                potentialForeignConnectorField.getForeignFieldPath();
                        break;
                    }
                }
                recordForeignKeyIndex++;
            }
        }
    }

    /**
     * @return whether the result of this rule expects an existing value (as opposed to being the
     *         original source of the value) in the field this rule is assigned to.
     */
    @Override
    public abstract boolean requiresExistingValue();

    /**
     * @param dataSource a data source requiring the referenced tables primary keys.
     */
    protected void addPkeyFields(final DataSource dataSource) {
        for (final String foreignKeyField : this.validatingTableKeyFields) {
            final String qualifiedFieldName = this.validatingTable + '.' + foreignKeyField;
            if (!dataSource.getFieldNames().contains(qualifiedFieldName)) {
                dataSource.addField(this.validatingTable, foreignKeyField);
            }
        }
    }

    /**
     * @param record the record to be inserted into the connector's table.
     * @param dataRecord a data record requiring the referenced tables primary keys.
     */
    protected void addPkeyFields(final Map<String, Object> record, final DataRecord dataRecord) {
        int keyFieldIndex = 0;
        for (final String foreignKeyField : this.validatingTableKeyFields) {
            final Object recordKeyValue = record.get(this.recordKeyFields[keyFieldIndex]);
            if (!StringUtil.isNullOrEmpty(recordKeyValue)) {
                dataRecord.setValue(this.validatingTable + '.' + foreignKeyField, recordKeyValue);
            }
            keyFieldIndex++;
        }
    }

    /**
     * @param record the record to be inserted into the connector's table.
     * @return primary key/values for foreign table.
     */
    protected final Map<String, Object> getPkeyValues(final Map<String, Object> record) {
        final Map<String, Object> pkeyValues = new HashMap<String, Object>();
        int keyFieldIndex = 0;
        for (final String foreignKeyField : this.validatingTableKeyFields) {
            final Object recordKeyValue = record.get(this.recordKeyFields[keyFieldIndex]);
            if (!StringUtil.isNullOrEmpty(recordKeyValue)) {
                pkeyValues.put(foreignKeyField, recordKeyValue);
            }
            keyFieldIndex++;
        }
        return pkeyValues;
    }

    /**
     * @return a cache of records from the validating table, that serves as a proxy to the table.
     */
    public RecordCache getCache() {
        if (this.cache == null) {
            final Map<String, String> validatingTableToRecordFields = new HashMap<String, String>();
            for (int i = 0; i < this.validatingTableKeyFields.length; i++) {
                validatingTableToRecordFields.put(this.validatingTableKeyFields[i],
                    this.recordKeyFields[i]);
            }
            this.cache = new RecordCache(this.validatingTable, validatingTableToRecordFields,
                this.caching);
        }
        return this.cache;
    }

    /**
     * @return the name of the source field that this rule is assigned to.
     */
    protected String getSourceField() {
        return this.sourceField;
    }

    /**
     * @return the ref_table field for the ARCHIBUS field, or the validating table if present.
     */
    protected String getValidatingTable() {
        return this.validatingTable;
    }

    /**
     * @return the names of the primary keys of the ref_table.
     */
    protected String[] getValidatingTableKeyFields() {
        return Arrays.copyOf(this.validatingTableKeyFields, this.validatingTableKeyFields.length);
    }

    /**
     * @return the names of the primary keys of the ARCHIBUS table this connector is applied to
     *         (must be same length as foreignKeyFields.
     */
    protected String[] getRecordKeyFields() {
        return Arrays.copyOf(this.recordKeyFields, this.recordKeyFields.length);
    }

    /**
     * @return whether this rule is being applied to in import or export.
     *
     */
    protected boolean isExporting() {
        return this.exporting;
    }

    /**
     * @return the parameter for the rule, apart from those expected by AbstractValidatingRule.
     */
    protected Object getRuleParameter() {
        return this.ruleParameter;
    }

    /**
     * @return whether to use the cache.
     */
    protected boolean isCaching() {
        return this.caching;
    }
}
