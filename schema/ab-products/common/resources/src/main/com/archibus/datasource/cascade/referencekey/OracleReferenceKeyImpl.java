package com.archibus.datasource.cascade.referencekey;

/**
 * 
 * Provides methods that enable/disable ORACLE Foreign Keys.
 * <p>
 * 
 * @author Catalin Purice
 * @since 21.2
 */
public class OracleReferenceKeyImpl extends AbstractReferenceKey implements ReferenceKey {
    
    /**
     * Foreign key SQL loader.
     * <p>
     * Suppress PMD warning "AvoidUsingSql" in this method.
     * 
     * Justification: Case #4: Changes to SQL schema.
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    private static final String FKEY_SQL =
            "SELECT  b.table_name AS table_name, b.column_name AS field_name, b.constraint_name AS constraint_name FROM user_constraints d,"
                    + "     (   SELECT c.constraint_name, c.r_constraint_name, c.table_name, col.column_name "
                    + "         FROM user_constraints c, user_cons_columns col "
                    + "         WHERE UPPER(c.table_name) = UPPER('%s')"
                    + "         AND col.constraint_name = c.constraint_name"
                    + "         AND constraint_type = 'R') b "
                    + "WHERE d.constraint_name=b.r_constraint_name AND UPPER(d.table_name)=UPPER('%s')";
    
    @Override
    public String getForeignKeySql(final String tableName, final String refTableName) {
        return String.format(FKEY_SQL, tableName, refTableName);
    }
    
    @Override
    String getDisableTemplateStmt() {
        return "ALTER TABLE %s DISABLE CONSTRAINT %s";
    }
    
    @Override
    String getEnableTemplateStmt() {
        return "ALTER TABLE %s ENABLE CONSTRAINT %s";
    }
}
