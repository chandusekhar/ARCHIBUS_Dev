package com.archibus.app.sysadmin.updatewizard.project.transfer.mergeschema;

import java.util.Iterator;

import com.archibus.app.sysadmin.updatewizard.schema.util.SchemaUpdateWizardConstants;
import com.archibus.context.ContextStore;
import com.archibus.datasource.SqlUtils;
import com.archibus.datasource.data.*;
import com.archibus.schema.*;
import com.archibus.schema.ArchibusFieldDefBase.Immutable;
import com.archibus.utility.*;

/**
 * 
 * Builds UPDATE/INSERT/DELETE SQL commands from records.
 * <p>
 * 
 * Used by MergeSchema.
 * 
 * @author Catalin Purice
 * @since 21.2
 * 
 */

@SuppressWarnings("PMD.AvoidUsingSql")
public final class StatementBuilder {
    
    /**
     * Constant.
     */
    private static final String COMMA = ",";
    
    /**
     * 
     * Private default constructor: utility class is non-instantiable.
     */
    private StatementBuilder() {
    }
    
    /**
     * 
     * Build update statement from record.
     * 
     * @param record record
     * @return UPDATE statement
     */
    public static StringBuffer buildUpdateStatement(final DataRecord record) {
        
        final StringBuffer sqlCommand = new StringBuffer();
        
        sqlCommand.append("UPDATE ");
        
        sqlCommand.append(Utility.tableNameFromFullName(record.getFields().get(0).getFieldDef()
            .fullName()));
        
        sqlCommand.append(" SET ");
        
        final Iterator<DataValue> iter = record.getFields().iterator();
        
        int noOfFieldsToSet = 0;
        
        while (iter.hasNext()) {
            
            final DataValue elem = iter.next();
            final Object value = elem.getValue();
            final Object oldValue = elem.getOldValue();
            
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
            
            if (noOfFieldsToSet++ > 0) {
                sqlCommand.append(COMMA);
            }
            
            sqlCommand
                .append(buildEqualRestriction(elem.getFieldDef().getName(), elem.getDbValue()));
        }
        
        sqlCommand.append(getPrimaryKeyRestriction(record));
        
        return sqlCommand;
        
    }
    
    /**
     * 
     * Build delete statement from record.
     * 
     * @param record record
     * @return DELETE statement
     */
    public static StringBuffer buildDeleteStatement(final DataRecord record) {
        
        final StringBuffer sqlCommand = new StringBuffer(64);
        
        sqlCommand.append("DELETE FROM ");
        
        sqlCommand.append(Utility.tableNameFromFullName(record.getFields().get(0).getFieldDef()
            .fullName()));
        
        sqlCommand.append(getPrimaryKeyRestriction(record));
        
        return sqlCommand;
    }
    
    /**
     * 
     * Build insert statement from record.
     * 
     * @param record record
     * @return INSERT statement
     */
    public static StringBuffer buildInsertStatement(final DataRecord record) {
        
        final StringBuffer sqlCommand = new StringBuffer(64);
        
        sqlCommand.append("INSERT INTO ");
        
        sqlCommand.append(Utility.tableNameFromFullName(record.getFields().get(0).getFieldDef()
            .fullName()));
        
        sqlCommand.append(SchemaUpdateWizardConstants.OPEN_BRACKET);
        
        final StringBuffer valuesPart = new StringBuffer(64);
        
        valuesPart.append(" VALUES(");
        
        final Iterator<DataValue> iter = record.getFields().iterator();
        
        while (iter.hasNext()) {
            final DataValue elem = iter.next();
            sqlCommand.append(elem.getFieldDef().getName());
            valuesPart.append(elem.getDbValue());
            if (iter.hasNext()) {
                sqlCommand.append(COMMA);
                valuesPart.append(COMMA);
            }
        }
        sqlCommand.append(SchemaUpdateWizardConstants.CLOSE_BRACKET);
        valuesPart.append(SchemaUpdateWizardConstants.CLOSE_BRACKET);
        
        sqlCommand.append(valuesPart);
        
        return sqlCommand;
    }
    
    /**
     * 
     * Builds equal restriction.
     * 
     * @param leftOp left operand
     * @param rightOp right operand
     * @return the SQL restriction
     */
    private static String buildEqualRestriction(final String leftOp, final String rightOp) {
        return leftOp + '=' + rightOp;
    }
    
    /**
     * 
     * Builds primary key restriction from record.
     * 
     * @param record record
     * @return SQL restriction
     */
    private static StringBuffer getPrimaryKeyRestriction(final DataRecord record) {
        
        final StringBuffer restriction = new StringBuffer(64);
        
        restriction.append(" WHERE ");
        
        final String tableName =
                Utility.tableNameFromFullName(record.getFields().get(0).getFieldDef().fullName());
        final ListWrapper.Immutable<Immutable> primaryKeys =
                ContextStore.get().getProject().loadTableDef(tableName).getPrimaryKey().getFields();
        
        final Iterator<Immutable> iter = primaryKeys.iterator();
        
        while (iter.hasNext()) {
            final ArchibusFieldDefBase.Immutable fieldDef = iter.next();
            restriction.append(buildEqualRestriction(fieldDef.getName(),
                SqlUtils.formatValueForSql(record.getValue(fieldDef.fullName()))));
            if (iter.hasNext()) {
                restriction.append(" AND ");
            }
        }
        return restriction;
    }
}
