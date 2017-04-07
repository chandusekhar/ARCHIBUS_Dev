package com.archibus.service.schema.impl;

import java.util.*;

import org.apache.log4j.Logger;
import org.json.*;

import com.archibus.app.common.util.SchemaUtils;
import com.archibus.config.Project;
import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.schema.TableDef;
import com.archibus.service.schema.IDataDictionaryService;
import com.archibus.utility.*;

/**
 * {@link IDataDictionaryService}.
 *
 * @author Radu Bunea
 * @since 23.1
 *
 */
public class DataDictionaryService implements IDataDictionaryService {

    /**
     * Constant for table afm_tbls.
     */
    private static final String AFM_TBLS_TABLE = "afm_tbls";

    /**
     * Constant for table afm_flds.
     */
    private static final String AFM_FLDS_TABLE = "afm_flds";

    /**
     * Constant for field table_name.
     */
    private static final String TABLE_NAME = "table_name";

    /**
     * Constant for field field_name.
     */
    private static final String FIELD_NAME = "field_name";

    /**
     * Constant.
     */
    private static final String ACTION = "action";

    /**
     * Constant for action keep.
     */
    private static final String ACTION_KEEP = "keep";

    /**
     * Constant for action overwrite.
     */
    private static final String ACTION_OVERWRITE = "overwrite";

    /**
     * Constant for action copy.
     */
    private static final String ACTION_COPY = "copy";

    /**
     * Constant.
     */
    private static final String FIELD_EXISTS_IN_SCHEMA = "fieldExistsInSchema";

    /**
     * Constant.
     */
    private static final String DOT = ".";

    /**
     * Constant used in log message.
     */
    private static final String STARTED_LOG_MSG = "Started";

    /**
     * Constant used in log message.
     */
    private static final String OK_LOG_MSG = "OK";

    /**
     * Constant copy_ prefix added when a field si copied on the same table.
     */
    private static final String COPY_PREFIX = "copy_";

    /**
     * Error message when to table doesn't exists in Archibus schema.
     */
    // @translatable
    private static final String ERROR_MESSAGE_INVALID_TO_TABLE =
            "The Copy To table does not exist. Fields can only be copied to existing tables. Use Copy Table if you wish to copy an entire table definition.";

    /**
     * Logger for this class and subclasses.
     */
    protected final Logger logger = Logger.getLogger(this.getClass());

    /** {@inheritDoc} */
    @Override
    public void copyTable(final String fromTable, final String toTable) {
        // @non-translatable
        final String operation = "copyTable(%s, %s): %s";
        if (this.logger.isInfoEnabled()) {
            final String message = String.format(operation, fromTable, toTable, STARTED_LOG_MSG);
            this.logger.info(message);
        }

        // re-load tables definitions
        ContextStore.get().getProject().clearCachedTableDefs();

        // verify table definition, especially for presents of primary keys. If no primary keys are
        // present, throw exception
        ContextStore.get().getProject().loadTableDef(fromTable);

        // create new data dictionary table
        createTable(fromTable, toTable);

        // create new data dictionary fields
        copyTableFields(fromTable, toTable);

        // re-load tables definitions
        ContextStore.get().getProject().clearCachedTableDefs();

        if (this.logger.isInfoEnabled()) {
            final String message = String.format(operation, fromTable, toTable, OK_LOG_MSG);
            this.logger.info(message);
        }
    }

    /** {@inheritDoc} */
    @Override
    public void copyFields(final String fromTable, final String toTable,
            final JSONArray fieldsToCopy, final boolean checkFieldsForActions) {
        // @non-translatable
        final String operation = "copyFields(%s, %s): %s";
        if (this.logger.isInfoEnabled()) {
            final String message = String.format(operation, fromTable, toTable, STARTED_LOG_MSG);
            this.logger.info(message);
        }

        // re-load tables definitions
        ContextStore.get().getProject().clearCachedTableDefs();

        // load table definitions to check if the primary keys are defined correctly
        ContextStore.get().getProject().loadTableDef(fromTable);
        if (tableExistsInSchema(toTable)) {
            if (checkFieldsForActions) {
                // return list of existing fields with actions or create new data dictionary fields
                // if fields don't exist
                checkExistingFields(fromTable, toTable, fieldsToCopy);
            } else {
                // create new data dictionary fields
                createTableFields(fromTable, toTable, fieldsToCopy);
            }
            // re-load tables definitions
            ContextStore.get().getProject().clearCachedTableDefs();
        } else {
            final ExceptionBase exception =
                    new ExceptionBase(ERROR_MESSAGE_INVALID_TO_TABLE, toTable);
            exception.setTranslatable(true);
            throw exception;
        }
        if (this.logger.isInfoEnabled()) {
            final String message = String.format(operation, fromTable, toTable, OK_LOG_MSG);
            this.logger.info(message);
        }
    }

    /**
     * Create data dictionary table from existing data dictionary table .
     *
     * @param fromTable From table
     * @param toTable To table
     */
    private void createTable(final String fromTable, final String toTable) {
        final DataSource dataSourceAfmTbls = createDataSourceForTable(AFM_TBLS_TABLE);
        dataSourceAfmTbls.addRestriction(Restrictions.eq(AFM_TBLS_TABLE, TABLE_NAME, fromTable));

        final DataRecord recordToTable = dataSourceAfmTbls.createNewRecord();
        recordToTable.setFieldValues(dataSourceAfmTbls.getRecord().getFieldValues());
        recordToTable.setValue(AFM_TBLS_TABLE + DOT + TABLE_NAME, toTable);
        dataSourceAfmTbls.saveRecord(recordToTable);
    }

    /**
     * Copy all fields form one table to another table.
     *
     * @param fromTable From table
     * @param toTable To table
     */
    private void copyTableFields(final String fromTable, final String toTable) {
        final DataSource dataSourceAfmFlds = createDataSourceForTable(AFM_FLDS_TABLE);
        dataSourceAfmFlds.addRestriction(Restrictions.eq(AFM_FLDS_TABLE, TABLE_NAME, fromTable));
        final List<DataRecord> recordsFromTable = dataSourceAfmFlds.getRecords();
        for (final DataRecord recordFromTable : recordsFromTable) {
            final String fieldName = recordFromTable.getString(AFM_FLDS_TABLE + DOT + FIELD_NAME);
            createFieldToTable(fromTable, toTable, fieldName, ACTION_COPY);
        }
    }

    /**
     *
     * Create data dictionary fields from existing data dictionary table fields.
     *
     * @param fromTable From table
     * @param toTable To table
     * @param fieldsToCopy List of fields to copy
     */
    private void createTableFields(final String fromTable, final String toTable,
            final JSONArray fieldsToCopy) {
        for (int i = 0; i < fieldsToCopy.length(); i++) {
            final JSONObject field = fieldsToCopy.getJSONObject(i);
            final String fieldName = field.getString(FIELD_NAME);
            final String action = field.getString(ACTION);
            if (!ACTION_KEEP.equals(action)) {
                createFieldToTable(fromTable, toTable, fieldName, action);
            }
        }
    }

    /**
     *
     * Set jsonExpression list of existing fields with actions plus the copy fields if fields exists
     * in dictionary, else create new data dictionary fields.
     *
     * @param fromTable From table
     * @param toTable To table
     * @param fieldsToCopy fields to copy
     */
    private void checkExistingFields(final String fromTable, final String toTable,
            final JSONArray fieldsToCopy) {
        final JSONArray actionFields = getActionsForExistingFields(toTable, fieldsToCopy);
        if (actionFields.length() > 0 && !fromTable.equalsIgnoreCase(toTable)) {
            ContextStore.get().getEventHandlerContext().addResponseParameter("jsonExpression",
                actionFields.toString());
        } else {
            // create new data dictionary fields and return existing fields to ovewrite
            createTableFields(fromTable, toTable, fieldsToCopy);
        }
    }

    /**
     *
     * Get actions for existing fields.
     *
     * @param tableName Table name where to check if fields exists
     * @param fields List of fields to check
     * @return JSONOArray of objects with data if the field is defined or not in schema like
     *         {field_name: fieldName,fieldExistsInSchema: true/false}
     */
    private JSONArray getActionsForExistingFields(final String tableName, final JSONArray fields) {
        final JSONArray existingFields = new JSONArray();
        if (fieldsExistsInSchema(tableName, fields)) {
            for (int i = 0; i < fields.length(); i++) {
                final JSONObject field = fields.getJSONObject(i);
                final String fieldName = field.getString(FIELD_NAME);
                final boolean fieldExistsInSchema =
                        SchemaUtils.fieldExistsInSchema(tableName, fieldName);
                final JSONObject existingField = new JSONObject();
                existingField.put(FIELD_NAME, fieldName);
                existingField.put(FIELD_EXISTS_IN_SCHEMA, fieldExistsInSchema);
                existingFields.put(existingField);
            }
        }
        return existingFields;
    }

    /**
     *
     * Create field from table to another table.
     *
     * @param fromTable From table
     * @param toTable To table
     * @param fieldName Field Name to copy
     * @param action overwrite record or create new record
     */
    private void createFieldToTable(final String fromTable, final String toTable,
            final String fieldName, final String action) {
        final DataSource dataSourceFromTable = createDataSourceForTable(AFM_FLDS_TABLE);
        dataSourceFromTable.addRestriction(Restrictions.eq(AFM_FLDS_TABLE, TABLE_NAME, fromTable));
        dataSourceFromTable.addRestriction(Restrictions.eq(AFM_FLDS_TABLE, FIELD_NAME, fieldName));
        final DataRecord recordFromTable = dataSourceFromTable.getRecord();

        if (ACTION_COPY.equals(action)) {
            final DataRecord recordToTable = dataSourceFromTable.createNewRecord();

            recordToTable.setFieldValues(recordFromTable.getFieldValues());
            recordToTable.setValue(AFM_FLDS_TABLE + DOT + TABLE_NAME, toTable);
            if (fromTable.equals(toTable)) {
                recordToTable.setValue(AFM_FLDS_TABLE + DOT + FIELD_NAME, COPY_PREFIX + fieldName);
            }
            dataSourceFromTable.saveRecord(recordToTable);
        } else if (ACTION_OVERWRITE.equals(action)) {
            final DataSource dataSourceToTable = createDataSourceForTable(AFM_FLDS_TABLE);
            dataSourceToTable.addRestriction(Restrictions.eq(AFM_FLDS_TABLE, TABLE_NAME, toTable));
            dataSourceToTable
                .addRestriction(Restrictions.eq(AFM_FLDS_TABLE, FIELD_NAME, fieldName));
            final DataRecord recordToTable = dataSourceToTable.getRecord();

            recordToTable.setFieldValues(recordFromTable.getFieldValues());
            recordToTable.setValue(AFM_FLDS_TABLE + DOT + TABLE_NAME, toTable);

            dataSourceFromTable.saveRecord(recordToTable);
        }
    }

    /**
     *
     * Check table exists in data dictionary.
     *
     * @param tableName Table name
     * @return true if table exists
     */
    private boolean tableExistsInSchema(final String tableName) {
        final DataSource dataSource =
                DataSourceFactory.createDataSource().addTable(AFM_TBLS_TABLE).addField(TABLE_NAME)
                    .addRestriction(Restrictions.eq(AFM_TBLS_TABLE, TABLE_NAME, tableName));
        final DataRecord record = dataSource.getRecord();
        return record != null;
    }

    /**
     * Check fields are defined in schema for a specific table.
     *
     * @param tableName Table name
     * @param fields List of object fields
     * @return true if fields are defined
     */
    private boolean fieldsExistsInSchema(final String tableName, final JSONArray fields) {
        final List<String> fieldsRestriction = new ArrayList<String>();
        for (int i = 0; i < fields.length(); i++) {
            fieldsRestriction.add(fields.getJSONObject(i).getString(FIELD_NAME));
        }
        final DataSource dataSourceAfmFlds = createDataSourceForTable(AFM_FLDS_TABLE);
        dataSourceAfmFlds.addRestriction(Restrictions.eq(AFM_FLDS_TABLE, TABLE_NAME, tableName));
        dataSourceAfmFlds.addRestriction(
            Restrictions.in(AFM_FLDS_TABLE, FIELD_NAME, fieldsRestriction.toString()));
        return dataSourceAfmFlds.getRecords().size() > 0;
    }

    /**
     * Create data-source for table.
     *
     * @param tableName Table name.
     * @return DataSource for table name
     */
    private DataSource createDataSourceForTable(final String tableName) {
        final Project.Immutable project = ContextStore.get().getProject();
        final TableDef.Immutable tableDefn = project.loadTableDef(tableName);
        final ListWrapper.Immutable<String> fieldNames = tableDefn.getFieldNames();
        final String[] arrFields = new String[fieldNames.size()];
        int pos = 0;
        for (final String fieldName : fieldNames) {
            arrFields[pos] = fieldName;
            pos++;
        }
        return DataSourceFactory.createDataSourceForFields(tableName, arrFields);
    }
}