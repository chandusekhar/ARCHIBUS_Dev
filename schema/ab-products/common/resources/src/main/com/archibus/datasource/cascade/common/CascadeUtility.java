package com.archibus.datasource.cascade.common;

import java.util.*;

import org.apache.log4j.Logger;

import com.archibus.config.Project;
import com.archibus.context.*;
import com.archibus.core.event.data.*;
import com.archibus.core.event.data.DataEvent.BeforeOrAfter;
import com.archibus.datasource.*;
import com.archibus.datasource.cascade.CascadeRecord;
import com.archibus.datasource.data.*;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.schema.*;
import com.archibus.utility.*;

/**
 * Utility class for Cascade Handler. Provides trivial methods for Cascade Handler functionality.
 * 
 * @author Catalin Purice
 * 
 */
@SuppressWarnings("PMD.TooManyMethods")
public final class CascadeUtility {
    
    /**
     * Hide constructor.
     */
    private CascadeUtility() {
    }
    
    /**
     * Get table name from record list.
     * 
     * @param records records
     * @return table name
     */
    public static String getTableNameFromRecord(final List<DataRecord> records) {
        return Utility.tableNameFromFullName(records.get(0).getFields().get(0).getFieldDef()
            .fullName());
    }
    
    /**
     * Get table name from record.
     * 
     * @param record record
     * @return table name
     */
    public static String getTableNameFromRecord(final DataRecord record) {
        return Utility.tableNameFromFullName(record.getFields().get(0).getFieldDef().fullName());
    }
    
    /**
     * Get table name from record.
     * 
     * @param record record
     * @param fullName full field name
     * @return value
     */
    public static Object getValueFromRecord(final DataRecord record, final String fullName) {
        return SqlUtils.formatValueForSql(record.getValue(fullName));
    }
    
    /**
     * 
     * @param tableName table name
     * @return DataSource
     */
    public static DataSource createDataSourceForPrimaryKeys(final String tableName) {
        final Project.Immutable project = ContextStore.get().getProject();
        final TableDef.Immutable tableDefn = project.loadTableDef(tableName);
        final ListWrapper.Immutable<String> fieldNames = tableDefn.getFieldNames();
        final String[] arrFields = new String[tableDefn.getPrimaryKey().getCount()];
        int pos = 0;
        for (final String fieldName : fieldNames) {
            if (pos == tableDefn.getPrimaryKey().getCount()) {
                break;
            } else if (tableDefn.getFieldDef(fieldName).isPrimaryKey()) {
                arrFields[pos] = fieldName;
                pos++;
            }
        }
        return DataSourceFactory.createDataSourceForFields(tableName, arrFields);
    }
    
    /**
     * 
     * Concatenates fields as SQL expression.
     * 
     * @param tableDef ARCHIBUS table definition
     * @return concatenated fields in SQL
     */
    public static String concatPrimaryKeyFieldNames(final TableDef.ThreadSafe tableDef) {
        String concatenatedFields = "";
        for (final ArchibusFieldDefBase.Immutable fieldDef : tableDef.getPrimaryKey().getFields()) {
            concatenatedFields += castToChar(fieldDef) + sqlConcat();
        }
        return concatenatedFields.substring(0, concatenatedFields.lastIndexOf(sqlConcat()));
    }
    
    /**
     * 
     * returns CAST expression for numeric fields.
     * 
     * @param fieldDef ARCHIBUS field definition
     * @return cast expression
     */
    public static String castToChar(final ArchibusFieldDefBase.Immutable fieldDef) {
        
        String castFieldExpression = fieldDef.getName();
        
        if ((SqlUtils.isSqlServer() || SqlUtils.isSybase()) && !fieldDef.isCharType()) {
            castFieldExpression =
                    String.format(CascadeConstants.CAST_TO_CHAR_EXPRESSION, fieldDef.getName());
        }
        return castFieldExpression;
    }
    
    /**
     * Concatenate foreign fields names.
     * 
     * @param foreignKey foreign key
     * @return concatenated fields
     */
    public static String concatForeignFieldNames(final ForeignKey.Immutable foreignKey) {
        String concatenatedFields = "";
        
        final TableDef.Immutable foreignTableDef =
                ContextStore.get().getProject().loadTableDef(foreignKey.getForeignTable());
        
        for (final String fKeyName : foreignKey.getForeignFields()) {
            concatenatedFields += castToChar(foreignTableDef.getFieldDef(fKeyName)) + sqlConcat();
        }
        return concatenatedFields.substring(0, concatenatedFields.lastIndexOf(sqlConcat()));
    }
    
    /**
     * 
     * Gets the list of primary key fields of the table from which the record is deleted.
     * 
     * @param record record
     * @return primary keys as a list
     */
    public static List<String> getPrimaryKeyFields(final DataRecord record) {
        
        final Project.Immutable project = ContextStore.get().getProject();
        
        final String tableName = getTableNameFromRecord(record);
        final List<String> pkNames = new ArrayList<String>();
        for (final ArchibusFieldDefBase.Immutable fieldDef : project.loadTableDef(tableName)
            .getPrimaryKey().getFields()) {
            pkNames.add(tableName + CascadeConstants.DOT + fieldDef.getName());
        }
        return pkNames;
    }
    
    /**
     * Returns true if any of the field values in the updatedRecord have changed.
     * 
     * @param updatedRecord the record to check.
     * @return true if any of the field values in the updatedRecord have changed.
     */
    public static boolean hasRecordChanged(final DataRecord updatedRecord) {
        boolean hasRecordChanged = false;
        final List<DataValue> fields = updatedRecord.getFields();
        for (final DataValue field : fields) {
            final Object value = field.getValue();
            final Object oldValue = field.getOldValue();
            if (value == null) {
                if (oldValue == null) {
                    // value did not change, skip field
                    continue;
                }
            } else {
                if (value.equals(oldValue)) {
                    // value did not change, skip field
                    continue;
                }
            }
            
            hasRecordChanged = true;
            break;
        }
        
        return hasRecordChanged;
    }
    
    /**
     * Triggers Data Change Event for parent record.
     * 
     * @param recordObj object record
     * @param record record
     * @param beforeOrAfter before of after change
     * @param changeType change type
     */
    public static void triggerDataEvent(final CascadeRecord recordObj, final DataRecord record,
            final BeforeOrAfter beforeOrAfter, final ChangeType changeType) {
        final Context context = ContextStore.get();
        
        final DataEventTriggerTemplate dataEventTriggerTemplate =
                new DataEventTriggerTemplate(Logger.getLogger(recordObj.getClass()));
        final DataChangeEvent dataChangeEvent =
                new RecordChangedEvent(recordObj, beforeOrAfter, context.getUser(),
                    getTableNameFromRecord(record), changeType, record);
        dataEventTriggerTemplate.triggerDataEvent(context, dataChangeEvent);
    }
    
    /**
     * 
     * Create restriction for root table.
     * 
     * @param record record to update/delete
     * @param isNewRecord if true then generate restriction for INSERT and if false generate
     *            restriction for DELETE/UPDATE
     * @return restriction
     */
    public static String createRestrictionForRoot(final DataRecord record, final boolean isNewRecord) {
        
        final List<String> pkFullFieldNames = getPrimaryKeyFields(record);
        String restriction = "";
        for (final String pkFullFieldName : pkFullFieldNames) {
            final DataValue value = record.findField(pkFullFieldName);
            final String sqlValue = isNewRecord ? value.getOldDbValue() : value.getDbValue();
            restriction +=
                    pkFullFieldName + CascadeConstants.EQUALS + sqlValue + CascadeConstants.AND;
        }
        return restriction.substring(0, restriction.lastIndexOf(CascadeConstants.AND));
    }
    
    /**
     * 
     * Builds merge record from old and new records.
     * 
     * @param fromRecord old record
     * @param toRecord new record
     * @return record to be merged
     */
    public static DataRecord buildMergeRecord(final DataRecord fromRecord, final DataRecord toRecord) {
        final List<String> fromPrimaryKeysFields = getPrimaryKeyFields(fromRecord);
        final String[] fields =
                fromPrimaryKeysFields.toArray(new String[fromPrimaryKeysFields.size()]);
        final String tableName = getTableNameFromRecord(fromRecord);
        final DataSource dataSource =
                DataSourceFactory.createDataSourceForFields(tableName, fields);
        
        final DataRecord record = dataSource.createNewRecord();
        
        for (final DataValue pkFullName : record.getFields()) {
            final DataValue oldValue = fromRecord.findField(pkFullName.getName());
            final DataValue value = toRecord.findField(pkFullName.getName());
            record.setOldValue(pkFullName.getName(), oldValue.getValue());
            record.setValue(pkFullName.getName(), value.getValue());
        }
        return record;
    }
    
    /**
     * 
     * Checks if the two records have the same description(no of primary keys, table names and field
     * names).
     * 
     * @param fromRecord from record
     * @param toRecord to record
     * @return booleans
     */
    public static boolean recordsMatch(final DataRecord fromRecord, final DataRecord toRecord) {
        
        boolean isValid = true;
        final String fromTable = CascadeUtility.getTableNameFromRecord(fromRecord);
        final String toTable = CascadeUtility.getTableNameFromRecord(toRecord);
        final List<String> fromPrimaryKeysFields = CascadeUtility.getPrimaryKeyFields(fromRecord);
        final List<String> toPrimaryKeysFields = CascadeUtility.getPrimaryKeyFields(toRecord);
        
        if (fromTable.equals(toTable) && fromPrimaryKeysFields.size() == toPrimaryKeysFields.size()) {
            for (final String fromPk : fromPrimaryKeysFields) {
                if (!toPrimaryKeysFields.contains(fromPk)) {
                    isValid = false;
                    break;
                }
            }
        } else {
            isValid = false;
        }
        return isValid;
    }
    
    /**
     * 
     * @return list of table names defined in ARCHIBUS data dictionary
     */
    public static List<String> getProjectTableNames() {
        final DataSource tableDS =
                DataSourceFactory.createDataSource().addTable(CascadeConstants.AFM_TBLS)
                    .addField(CascadeConstants.AFM_TBLS, "table_name")
                    .addRestriction(Restrictions.eq(CascadeConstants.AFM_TBLS, "is_sql_view", 0));
        final List<DataRecord> records = tableDS.getRecords();
        final List<String> tableNames = new ArrayList<String>();
        for (final DataRecord record : records) {
            tableNames.add(record.getValue("afm_tbls.table_name").toString());
        }
        return tableNames;
    }
    
    /**
     * 
     * Returns concatenation expression.
     * 
     * @return String
     */
    public static String sqlConcat() {
        return SqlUtils.isOracle() ? "||" : "+";
    }
    
    /**
     * 
     * Builds primary key restriction from record. This record contains PK only.
     * 
     * @param recordWithPkOnly record with primary keys
     * @param isDelete true if the recordWitkPkOnly will be deleted
     * @return SQL restriction
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    public static String buildPrimaryKeyRestriction(final DataRecord recordWithPkOnly,
            final boolean isDelete) {
        
        final StringBuffer restriction = new StringBuffer(" WHERE ");
        
        final Iterator<DataRecordField> iter = recordWithPkOnly.getFieldValues().iterator();
        
        while (iter.hasNext()) {
            final DataRecordField fieldDef = iter.next();
            final Object fieldValue =
                    isDelete ? SqlUtils.formatValueForSql(recordWithPkOnly.getValue(fieldDef
                        .getName())) : SqlUtils.formatValueForSql(recordWithPkOnly
                        .getOldValue(fieldDef.getName()));
            restriction.append(fieldDef.getName()).append('=').append(fieldValue);
            if (iter.hasNext()) {
                restriction.append(" AND ");
            }
        }
        
        return restriction.toString();
    }
}
