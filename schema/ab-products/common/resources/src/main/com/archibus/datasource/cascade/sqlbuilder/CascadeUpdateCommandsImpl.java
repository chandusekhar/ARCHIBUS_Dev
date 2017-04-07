package com.archibus.datasource.cascade.sqlbuilder;

import java.util.*;

import com.archibus.datasource.cascade.common.*;
import com.archibus.datasource.cascade.loader.tabletree.*;
import com.archibus.datasource.cascade.sqlbuilder.document.ArchibusDocumentSqlBuilder;
import com.archibus.datasource.data.*;
import com.archibus.schema.ForeignKey;
import com.archibus.utility.StringUtil;

/**
 * Generates SQL commands for Cascade Update Handler.
 * 
 * @author Catalin Purice
 * 
 */
public class CascadeUpdateCommandsImpl extends CascadeCommands implements SqlCommandsBuilder {
    
    /**
     * is merge primary keys parameter.
     */
    private final boolean isMergePrimaryKeys;
    
    /**
     * Cascade table definition.
     */
    private final CascadeTableDef cascadeTable;
    
    /**
     * Constructor.
     * 
     * @param childTable child table
     * @param sqlRestriction SQL restriction
     * @param isMergePK merge primary keys
     */
    public CascadeUpdateCommandsImpl(final CascadeTableDef childTable,
            final SqlRestriction sqlRestriction, final boolean isMergePK) {
        super(sqlRestriction);
        this.cascadeTable = childTable;
        this.isMergePrimaryKeys = isMergePK;
    }
    
    /**
     * {@inheritDoc}
     */
    public void buildSqlCommands() {
        
        if (this.cascadeTable.isRoot()
                || (this.cascadeTable.hasPrimaryKeyReference() && this.cascadeTable.getParent()
                    .isRoot())) {
            
            if ((this.isMergePrimaryKeys && !this.cascadeTable.isRoot())
                    || !this.isMergePrimaryKeys) {
                buildInsertCommand();
            }
            
            buildDeleteCommand();
            
            if (this.cascadeTable.hasDocFields()) {
                buildDocTablesSqlCommands();
            }
        } else {
            buildUpdateCommands();
        }
    }
    
    /**
     * 
     * Builds UPDATE commands for ARCHIBUS document tables.
     */
    public void buildDocTablesSqlCommands() {
        
        if (this.log.isDebugEnabled()) {
            this.log
                .debug("Cascade Handler: Synchronize document tables. Build SQL commands for table "
                        + this.cascadeTable.getName() + ".");
        }
        
        if (this.cascadeTable.isRoot()) {
            
            final String restriction =
                    CascadeUtility.createRestrictionForRoot(this.getForeignKeysSqlRestriction()
                        .getRootRecord(), true);
            
            final List<String> inserIntoDocTablesStmts =
                    ArchibusDocumentSqlBuilder.buildInsertCommandsForDocumentTables(
                        (CascadeTableDefImpl) this.cascadeTable, this
                            .getForeignKeysSqlRestriction().getRootRecord(), restriction);
            final List<String> deleteFromDocTablesStmts =
                    ArchibusDocumentSqlBuilder.buildDeleteCommandsForDocumentTables(
                        (CascadeTableDefImpl) this.cascadeTable, this
                            .getForeignKeysSqlRestriction().getRootRecord(), restriction);
            this.sqlStatements.addAfmDocCommands(inserIntoDocTablesStmts);
            this.sqlStatements.addAfmDocCommands(deleteFromDocTablesStmts);
        } else {
            final List<ForeignKeyRestriction> fKeysRestrictions =
                    this.cascadeTable.getPrimaryKeysFKeys();
            
            for (final ForeignKeyRestriction fKeyRestriction : fKeysRestrictions) {
                
                final List<String> inserIntoDocTablesStmts =
                        ArchibusDocumentSqlBuilder.buildInsertCommandsForDocumentTables(
                            (CascadeTableDefImpl) this.cascadeTable, this
                                .getForeignKeysSqlRestriction().getRootRecord(), fKeyRestriction
                                .getSqlRestriction());
                final List<String> deleteFromDocTablesStmts =
                        ArchibusDocumentSqlBuilder.buildDeleteCommandsForDocumentTables(
                            (CascadeTableDefImpl) this.cascadeTable, this
                                .getForeignKeysSqlRestriction().getRootRecord(), fKeyRestriction
                                .getSqlRestriction());
                this.sqlStatements.addAfmDocCommands(inserIntoDocTablesStmts);
                this.sqlStatements.addAfmDocCommands(deleteFromDocTablesStmts);
            }
        }
    }
    
    /**
     * 
     * Build UPDATE commands and save them into local member.
     * 
     */
    private void buildUpdateCommands() {
        final List<ForeignKeyRestriction> fKeysRestrictions = this.cascadeTable.getForeignKeys();
        
        final List<String> updateSetCommands = new ArrayList<String>();
        
        for (final ForeignKeyRestriction fKeyRestriction : fKeysRestrictions) {
            final String updateSetCommand = getUpdateSetSql(fKeyRestriction);
            updateSetCommands.add(updateSetCommand);
            
        }
        this.sqlStatements.addUpdateCommands(updateSetCommands);
    }
    
    /**
     * /**
     * 
     * Returns UPDATE SET SQL command.
     * 
     * @param fKeyRestriction foreign key by restriction
     * @return UPDATE SET SQL command
     */
    private String getUpdateSetSql(final ForeignKeyRestriction fKeyRestriction) {
        
        return String.format(CascadeConstants.UPDATE_TEMPLATE_SQL, fKeyRestriction.getForeignKey()
            .getForeignTable(), buildSetClause(fKeyRestriction.getForeignKey()), fKeyRestriction
            .getSqlRestriction());
    }
    
    /**
     * 
     * 
     * Generates INSERT INTO ... SELECT
     * 
     */
    private void buildInsertCommand() {
        
        final StringBuilder sqlFieldsForInsert = new StringBuilder();
        final StringBuilder sqlFieldsForSelect = new StringBuilder();
        
        prepareTableFields(sqlFieldsForInsert, sqlFieldsForSelect);
        
        String restriction = "";
        if (this.cascadeTable.isRoot()) {
            restriction =
                    CascadeUtility.createRestrictionForRoot(this.getForeignKeysSqlRestriction()
                        .getRootRecord(), true);
        } else {
            restriction = this.cascadeTable.getPrimaryKeysFKeys().get(0).getSqlRestriction();
            
        }
        
        final String insertCommand =
                String.format(CascadeConstants.INSERT_TEMPLATE_SQL, this.cascadeTable.getName(),
                    sqlFieldsForInsert, sqlFieldsForSelect, this.cascadeTable.getName(),
                    restriction);
        
        this.sqlStatements.addInsertCommands(Arrays.asList(insertCommand));
    }
    
    /**
     * Generates DELETE FROM ... SQL command
     */
    private void buildDeleteCommand() {
        String restriction = "";
        if (this.cascadeTable.isRoot()) {
            restriction =
                    CascadeUtility.createRestrictionForRoot(this.getForeignKeysSqlRestriction()
                        .getRootRecord(), true);
        } else {
            restriction = this.cascadeTable.getPrimaryKeysFKeys().get(0).getSqlRestriction();
        }
        
        final String deleteCommand =
                String.format(CascadeConstants.DELETE_TEMPLATE_SQL, this.cascadeTable.getName(),
                    restriction);
        this.sqlStatements.addDeleteCommands(Arrays.asList(deleteCommand));
    }
    
    /**
     * 
     * Generates fields for INSERT SQL commands.
     * 
     * @param sqlFieldsForInsert fields for INSERT part
     * @param sqlFieldsForSelect fields for SELECT part
     */
    private void prepareTableFields(final StringBuilder sqlFieldsForInsert,
            final StringBuilder sqlFieldsForSelect) {
        
        final Iterator<String> iter = this.cascadeTable.getTableDef().getFieldNames().iterator();
        
        while (iter.hasNext()) {
            final String fieldName = iter.next();
            sqlFieldsForInsert.append(fieldName);
            
            final DataValue foreignField = getDataValueForField(fieldName);
            
            if (StringUtil.notNullOrEmpty(foreignField)) {
                sqlFieldsForSelect.append(foreignField.getDbValue());
            } else {
                sqlFieldsForSelect.append(fieldName);
            }
            if (iter.hasNext()) {
                sqlFieldsForInsert.append(CascadeConstants.COMMA);
                sqlFieldsForSelect.append(CascadeConstants.COMMA);
            }
        }
    }
    
    /**
     * 
     * SET fkey1 = value1, fkey2=value2 ..., fkeyn=valuen WHERE levelSqlRestriction.
     * 
     * @param foreignKey foreign key
     * @return SET clause
     */
    private String buildSetClause(final ForeignKey.Immutable foreignKey) {
        
        String setClause = "";
        int index = 0;
        DataValue foreignField = null;
        for (final String fkName : foreignKey.getForeignFields()) {
            
            foreignField = this.getForeignKeysSqlRestriction().getPrimaryKeyValueByIndex(index);
            
            if (StringUtil.notNullOrEmpty(foreignField)) {
                setClause += fkName + " = " + foreignField.getDbValue();
                
                if (index < foreignKey.getForeignFields().size() - 1) {
                    setClause += ", ";
                }
                index++;
            } else {
                setClause = setClause.substring(0, setClause.lastIndexOf(','));
                break;
            }
        }
        return setClause;
    }
    
    /**
     * 
     * Return data value for field.
     * 
     * @param fieldName field name from table
     * @return DataValue
     */
    private DataValue getDataValueForField(final String fieldName) {
        DataValue foreignField = null;
        final DataRecord record = this.getForeignKeysSqlRestriction().getRootRecord();
        
        if (this.cascadeTable.isRoot()) {
            if (this.cascadeTable.getTableDef().getFieldDef(fieldName).isPrimaryKey()) {
                final String fullFieldName =
                        this.cascadeTable.getTableDef().getName() + CascadeConstants.DOT
                                + fieldName;
                foreignField = record.findField(fullFieldName);
            }
        } else {
            final ForeignKey.Immutable pkFkField =
                    this.cascadeTable.getPrimaryKeysFKeys().get(0).getForeignKey();
            int index = 0;
            for (final String fkField : pkFkField.getForeignFields()) {
                if (fkField.equalsIgnoreCase(fieldName)) {
                    final String fullFieldName =
                            pkFkField.getReferenceTable() + CascadeConstants.DOT
                                    + pkFkField.getPrimaryColumns().get(index);
                    foreignField = record.findField(fullFieldName);
                    break;
                }
                index++;
            }
        }
        return foreignField;
    }
}
