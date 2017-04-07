package com.archibus.datasource.cascade.sqlbuilder;

import java.util.*;

import com.archibus.datasource.cascade.common.*;
import com.archibus.datasource.cascade.loader.TablesLoaderDeleteImpl;
import com.archibus.datasource.cascade.loader.tabletree.*;
import com.archibus.datasource.cascade.sqlbuilder.document.ArchibusDocumentSqlBuilder;
import com.archibus.schema.FieldDefBase;

/**
 * Generates DELETE FROM and UPDATE SET SQL commands for cascade delete.
 * 
 * @author Catalin Purice
 * 
 */
public class CascadeDeleteCommandsImpl extends CascadeCommands implements SqlCommandsBuilder {
    
    /**
     * cascade table.
     */
    private final CascadeTableDef cascadeTable;
    
    /**
     * Constructor.
     * 
     * @param childTable table
     * @param sqlRestriction SQL restriction
     */
    public CascadeDeleteCommandsImpl(final CascadeTableDef childTable,
            final SqlRestriction sqlRestriction) {
        super(sqlRestriction);
        this.cascadeTable = childTable;
    }
    
    /**
     * 
     * Builds SQL commands.
     */
    @Override
    public void buildSqlCommands() {
        
        if (this.cascadeTable.isRoot()) {
            addDeleteCommandFromRoot();
        } else {
            
            final List<ForeignKeyRestriction> fKeysRestrictions =
                    ((CascadeTableDefImpl) this.cascadeTable).getAllForeignKeys();
            
            for (final ForeignKeyRestriction fKeyRestriction : fKeysRestrictions) {
                final FieldDefBase.Immutable fieldDef = this.cascadeTable.getTableDef()
                    .getFieldDef(fKeyRestriction.getForeignKey().getName());
                if (!TablesLoaderDeleteImpl.getAllowNull(fieldDef) || fieldDef.isPrimaryKey()) {
                    // delete from
                    addDeleteCommand(fKeyRestriction);
                    break;
                } else {
                    // set null
                    addUpdateSetNullCommand(fKeyRestriction);
                }
            }
        }
    }
    
    /**
     * 
     * Generate DELETE from document tables SQL commands.
     */
    @Override
    public void buildDocTablesSqlCommands() {
        
        if (this.cascadeTable.isRoot()) {
            final String restriction =
                    CascadeUtility.createRestrictionForRoot(this.getForeignKeysSqlRestriction()
                        .getRootRecord(), false);
            buildDeleteCommandsForDocumentTables(restriction);
        } else {
            
            final List<ForeignKeyRestriction> fKeysRestrictions =
                    ((CascadeTableDefImpl) this.cascadeTable).getAllForeignKeys();
            
            for (final ForeignKeyRestriction fKeyRestriction : fKeysRestrictions) {
                final String restriction = fKeyRestriction.getSqlRestriction();
                buildDeleteCommandsForDocumentTables(restriction);
            }
        }
    }
    
    /**
     * 
     * Builds DELETE commands for ARCHIBUS document tables.
     * 
     * @param restriction parent restriction
     */
    private void buildDeleteCommandsForDocumentTables(final String restriction) {
        
        if (this.log.isDebugEnabled()) {
            this.log
                .debug("Cascade Handler: Synchronize document tables. Build SQL commands for table "
                        + this.cascadeTable.getName() + ".");
        }
        
        final List<String> deleteFromDocTables =
                ArchibusDocumentSqlBuilder.buildDeleteCommandsForDocumentTables(
                    (CascadeTableDefImpl) this.cascadeTable, this.getForeignKeysSqlRestriction()
                        .getRootRecord(), restriction);
        this.sqlStatements.addAfmDocCommands(deleteFromDocTables);
    }
    
    /**
     * 
     * Builds Delete Commands.
     * 
     * @param fKeyRestriction foreign key by restriction
     */
    private void addUpdateSetNullCommand(final ForeignKeyRestriction fKeyRestriction) {
        // set null
        final String updateSetNullSql = getUpdateSetNullSql(fKeyRestriction);
        this.sqlStatements.addUpdateCommands(Arrays.asList(updateSetNullSql));
    }
    
    /**
     * Builds Update Commands.
     * 
     * @param fKeyRestriction foreign key by restriction
     */
    private void addDeleteCommand(final ForeignKeyRestriction fKeyRestriction) {
        
        final String deleteCommand =
                String.format(CascadeConstants.DELETE_TEMPLATE_SQL, fKeyRestriction.getForeignKey()
                    .getForeignTable(), fKeyRestriction.getSqlRestriction());
        
        this.sqlStatements.addDeleteCommands(Arrays.asList(deleteCommand));
        
        /*
         * Disable cascade delete documents for delete. if (this.cascadeTable.hasDocFields()) {
         * buildDeleteCommandsForDocumentTables(fKeyRestriction.getSqlRestriction()); }
         */
    }
    
    /**
     * Builds Update Commands.
     * 
     */
    private void addDeleteCommandFromRoot() {
        
        final String restriction =
                CascadeUtility.createRestrictionForRoot(this.getForeignKeysSqlRestriction()
                    .getRootRecord(), false);
        
        final String deleteCommand =
                String.format(CascadeConstants.DELETE_TEMPLATE_SQL, this.cascadeTable.getName(),
                    restriction);
        this.sqlStatements.addDeleteCommands(Arrays.asList(deleteCommand));
        
        /*
         * Disable cascade delete documents for delete. if (this.cascadeTable.hasDocFields()) {
         * buildDeleteCommandsForDocumentTables(restriction); }
         */
    }
    
    /**
     * Generates UPDATE SET NULL command.
     * 
     * @param fKeyRestriction foreign key by restriction
     * @return SQL update set null command
     */
    private String getUpdateSetNullSql(final ForeignKeyRestriction fKeyRestriction) {
        
        String setNullFields = "";
        for (int i = 0; i < fKeyRestriction.getForeignKey().getForeignFields().size(); i++) {
            
            final String fkName =
                    fKeyRestriction.getForeignKey().getForeignFields().get(i).toString();
            
            setNullFields += fkName + " = NULL";
            if (i < fKeyRestriction.getForeignKey().getForeignFields().size() - 1) {
                setNullFields += ", ";
            }
        }
        // update set null command
        return String.format(CascadeConstants.UPDATE_TEMPLATE_SQL, fKeyRestriction.getForeignKey()
            .getForeignTable(), setNullFields, fKeyRestriction.getSqlRestriction());
    }
}
