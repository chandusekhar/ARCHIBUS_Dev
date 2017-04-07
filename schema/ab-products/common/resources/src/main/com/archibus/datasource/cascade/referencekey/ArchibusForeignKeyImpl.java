package com.archibus.datasource.cascade.referencekey;

import com.archibus.context.ContextStore;
import com.archibus.schema.TableDef;

/**
 * 
 * Provides methods that enable/disable ARCHIBUS Foreign Keys.
 * <p>
 * 
 * @author Catalin Purice
 * @since 21.2
 * 
 *        Suppress PMD warning "AvoidUsingSql" in this method.
 *        <p>
 *        Justification: Case #4: Changes to SQL schema.
 */
@SuppressWarnings("PMD.AvoidUsingSql")
public class ArchibusForeignKeyImpl extends AbstractReferenceKey implements ReferenceKey {
    
    @Override
    public void loadForeignKeys(final String tableName, final String refTableName) {
        final TableDef.ThreadSafe tableDef =
                ContextStore.get().getProject().loadTableDef(tableName);
        
        for (final com.archibus.schema.ForeignKey.Immutable foreignKey : tableDef.getForeignKeys()) {
            if (refTableName.equalsIgnoreCase(foreignKey.getReferenceTable())) {
                
                final String enableStmt =
                        String.format(getEnableTemplateStmt(), tableName, foreignKey.getName());
                final String disableStmt =
                        String.format(getDisableTemplateStmt(), tableName, foreignKey.getName());
                final String constraintName = tableName + "_" + foreignKey.getName();
                addForeignKey(tableName, refTableName, constraintName, enableStmt, disableStmt);
            }
        }
    }
    
    @Override
    String getDisableTemplateStmt() {
        return "UPDATE afm_flds SET validate_data = 0 WHERE table_name = '%s' AND field_name = '%s'";
    }
    
    @Override
    String getEnableTemplateStmt() {
        return "UPDATE afm_flds SET validate_data = 1 WHERE table_name = '%s' AND field_name = '%s'";
    }
    
    @Override
    String getForeignKeySql(final String tableName, final String refTableName) {
        return null;
    }
}