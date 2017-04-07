package com.archibus.datasource.cascade.sqlbuilder.document;

import java.util.*;

import com.archibus.context.ContextStore;
import com.archibus.datasource.SqlUtils;
import com.archibus.datasource.cascade.common.*;
import com.archibus.datasource.cascade.loader.tabletree.CascadeTableDefImpl;
import com.archibus.datasource.data.DataRecord;
import com.archibus.schema.*;
import com.archibus.schema.ArchibusFieldDefBase.Immutable;

/**
 * 
 * Utility class. Provides methods that generates SQL commands that synchronize ARCHIBUS document
 * tables.
 * <p>
 * 
 * @author Catalin Purice
 * 
 */
public final class ArchibusDocumentSqlBuilder {
    
    /**
     * 
     * Private default constructor: utility class is non-instantiable.
     */
    private ArchibusDocumentSqlBuilder() {
    }
    
    /**
     * 
     * Builds DELETE commands for ARCHIBUS document tables.
     * 
     * @param cascadeTable cascade table
     * @param record parent record
     * @param parentRestriction parent restriction
     * @return list of DELETE SQL commands
     */
    public static List<String> buildDeleteCommandsForDocumentTables(
            final CascadeTableDefImpl cascadeTable, final DataRecord record,
            final String parentRestriction) {
        
        final List<String> deleteFromDocTables = new ArrayList<String>();
        final String primaryKeyNames =
                concatPrimaryKeyFieldNamesForDocumentTables(cascadeTable.getTableDef());
        
        for (final ArchibusFieldDefBase.Immutable docFieldDef : cascadeTable.getDocFields()) {
            
            final String restriction =
                    String.format(CascadeConstants.RESTRICTION_DOCUMENT_TEMPLATE_SQL,
                        SqlUtils.formatValueForSql(cascadeTable.getName()),
                        SqlUtils.formatValueForSql(docFieldDef.getName()), primaryKeyNames,
                        cascadeTable.getName(), parentRestriction);
            
            for (final String docTable : ArchibusDocumentUtility.getDocTables()) {
                deleteFromDocTables.add(String.format(CascadeConstants.DELETE_TEMPLATE_SQL,
                    docTable, restriction));
            }
        }
        return deleteFromDocTables;
    }
    
    /**
     * 
     * Builds UPDATE commands for ARCHIBUS document tables.
     * 
     * @param cascadeTable cascade table
     * @param record parent record
     * @param parentRestriction parent restriction
     * @return list of UPDATE SQL commands
     */
    public static List<String> buildInsertCommandsForDocumentTables(
            final CascadeTableDefImpl cascadeTable, final DataRecord record,
            final String parentRestriction) {
        
        final List<String> updateDocTables = new ArrayList<String>();
        final String newPrimaryKeyValues = concatPrimaryKeyValuesForDocumentTables(record, true);
        final String oldPrimaryKeyValues = concatPrimaryKeyValuesForDocumentTables(record, false);
        
        final String primaryKeyNames =
                concatPrimaryKeyFieldNamesForDocumentTables(cascadeTable.getTableDef());
        
        for (final ArchibusFieldDefBase.Immutable docFieldDef : cascadeTable.getDocFields()) {
            
            final String restriction =
                    String.format(CascadeConstants.RESTRICTION_DOCUMENT_TEMPLATE_SQL,
                        SqlUtils.formatValueForSql(cascadeTable.getName()),
                        SqlUtils.formatValueForSql(docFieldDef.getName()), primaryKeyNames,
                        cascadeTable.getName(), parentRestriction);
            
            for (int i = ArchibusDocumentUtility.getDocTables().size(); i > 0; i--) {
                
                final String insertStmt =
                        generateInsertSelectStmt(ArchibusDocumentUtility.getDocTables().get(i - 1),
                            docFieldDef, newPrimaryKeyValues, oldPrimaryKeyValues, restriction);
                
                updateDocTables.add(insertStmt);
            }
        }
        return updateDocTables;
    }
    
    /**
     * 
     * Generates fields for INSERT SQL commands.
     * 
     * @param docTableName document table
     * @param docFieldDef document field definition
     * @param newPkValue new primary key value
     * @param oldPkValue old primary key value
     * @param restriction parent restriction
     * @return INSERT statement
     */
    private static String generateInsertSelectStmt(final String docTableName,
            final Immutable docFieldDef, final String newPkValue, final String oldPkValue,
            final String restriction) {
        
        final StringBuilder sqlFieldsForInsert = new StringBuilder();
        final StringBuilder sqlFieldsForSelect = new StringBuilder();
        
        final TableDef.Immutable tableDef =
                ContextStore.get().getProject().loadTableDef(docTableName);
        
        final Iterator<String> iter = tableDef.getFieldNames().iterator();
        
        while (iter.hasNext()) {
            final String fieldName = iter.next();
            sqlFieldsForInsert.append(fieldName);
            
            // is table_name
            if (fieldName.equals(ArchibusDocumentUtility.getDocFields().get(0))) {
                sqlFieldsForSelect.append(SqlUtils.formatValueForSql(docFieldDef.getTableName()));
            } else if (fieldName.equals(ArchibusDocumentUtility.getDocFields().get(1))) {
                sqlFieldsForSelect.append(SqlUtils.formatValueForSql(docFieldDef.getName()));
            } else if (fieldName.equals(ArchibusDocumentUtility.getDocFields().get(2))) {
                final String replacePKValue =
                        String.format(ArchibusDocumentUtility.getReplacePrimaryKeyExpresion(),
                            oldPkValue, newPkValue);
                sqlFieldsForSelect.append(replacePKValue);
            } else {
                sqlFieldsForSelect.append(fieldName);
            }
            
            if (iter.hasNext()) {
                sqlFieldsForInsert.append(CascadeConstants.COMMA);
                sqlFieldsForSelect.append(CascadeConstants.COMMA);
            }
        }
        
        return String.format(CascadeConstants.INSERT_TEMPLATE_SQL, docTableName,
            sqlFieldsForInsert, sqlFieldsForSelect, docTableName, restriction);
    }
    
    /**
     * Concatenates primary keys separated by PIPE.
     * 
     * @param tableDef table definition
     * @return String
     */
    private static String concatPrimaryKeyFieldNamesForDocumentTables(
            final TableDef.ThreadSafe tableDef) {
        String concatenatedFields = "";
        final String pipeCharacterConcat =
                CascadeUtility.sqlConcat() + SqlUtils.formatValueForSql(CascadeConstants.PIPE)
                        + CascadeUtility.sqlConcat();
        for (final ArchibusFieldDefBase.Immutable fieldDef : tableDef.getPrimaryKey().getFields()) {
            concatenatedFields += CascadeUtility.castToChar(fieldDef) + pipeCharacterConcat;
        }
        return concatenatedFields.substring(0, concatenatedFields.lastIndexOf(pipeCharacterConcat));
    }
    
    /**
     * 
     * Concatenates primary key fields as SQL expression.
     * 
     * @param record record
     * @param isNewValue if true it will concatenate new values
     * @return concatenated primary key fields in SQL
     */
    private static String concatPrimaryKeyValuesForDocumentTables(final DataRecord record,
            final boolean isNewValue) {
        final List<String> pkFullFieldNames = CascadeUtility.getPrimaryKeyFields(record);
        String concatenatedPkFieldValues = "";
        for (final String fullFieldName : pkFullFieldNames) {
            Object value = record.getOldValue(fullFieldName);
            if (isNewValue) {
                value = record.getValue(fullFieldName);
            }
            concatenatedPkFieldValues += value + CascadeConstants.PIPE;
        }
        concatenatedPkFieldValues =
                concatenatedPkFieldValues.substring(0,
                    concatenatedPkFieldValues.lastIndexOf(CascadeConstants.PIPE));
        return SqlUtils.formatValueForSql(concatenatedPkFieldValues);
    }
}