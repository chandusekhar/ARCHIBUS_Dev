package com.archibus.datasource.cascade.referencekey;

/**
 * 
 * Provides methods that enable/disable SQL Server Foreign Keys.
 * <p>
 * 
 * @author Catalin Purice
 * @since 21.2
 */
public class SqlServerReferenceKeyImpl extends AbstractReferenceKey implements ReferenceKey {
    
    /**
     * Foreign key SQL loader.
     * <p>
     * Suppress PMD warning "AvoidUsingSql" in this class.
     * 
     * Justification: Case #4: Changes to SQL schema. definition.
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    private static final String FKEY_SQL = "SELECT f.name AS constraint_name, "
            + "   OBJECT_NAME(f.parent_object_id) AS table_name, "
            + "   COL_NAME(fc.parent_object_id, fc.parent_column_id) AS field_name "
            + " FROM sys.foreign_keys AS f, sys.foreign_key_columns AS fc "
            + " WHERE f.OBJECT_ID = fc.constraint_object_id"
            + " AND f.parent_object_id = object_id('%s')"
            + " AND f.referenced_object_id = object_id('%s')";
    
    @Override
    String getForeignKeySql(final String tableName, final String refTableName) {
        return String.format(FKEY_SQL, tableName, refTableName);
    }
    
    @Override
    String getDisableTemplateStmt() {
        return "ALTER TABLE %s NOCHECK CONSTRAINT %s";
    }
    
    @Override
    String getEnableTemplateStmt() {
        return "ALTER TABLE %s CHECK CONSTRAINT %s";
    }
    
}
