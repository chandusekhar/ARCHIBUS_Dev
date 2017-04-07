package com.archibus.app.sysadmin.updatewizard.schema.sqlgenerator;

import org.apache.log4j.Logger;

import com.archibus.app.sysadmin.updatewizard.project.util.ProjectUpdateWizardUtilities;
import com.archibus.app.sysadmin.updatewizard.schema.dbschema.DatabaseSchemaUtilities;
import com.archibus.app.sysadmin.updatewizard.schema.util.SchemaUpdateWizardUtilities;
import com.archibus.context.ContextStore;
import com.archibus.datasource.DataSource;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.schema.*;
import com.archibus.utility.*;
import com.archibus.utility.ListWrapper.Immutable;

/**
 * Checks if foreign keys are valid and adds missing data based on default value.
 * 
 * @author Catalin Purice
 * 
 */
public class ValidateForeignKey {
    
    /**
     * foreign key.
     */
    private final ForeignKey.Immutable foreignKey;
    
    /**
     * Constructor.
     * 
     * @param fKey ARCHIBUS foreign key
     */
    public ValidateForeignKey(final ForeignKey.Immutable fKey) {
        this.foreignKey = fKey;
    }
    
    /**
     * Checks if foreign keys values validates with primary keys values and adds missing data based
     * on default value.
     * 
     * @return insert statement
     */
    public String getStatement() {
        
        boolean isDfltValueInParent = false;
        if (DatabaseSchemaUtilities.isTableInSql(this.foreignKey.getReferenceTable())) {
            isDfltValueInParent =
                    createDataSourceForDefaultValue().getRecords().isEmpty() ? false : true;
        }
        String insertStmt = "";
        if (!isDfltValueInParent) {
            if (hasNotNullWithNoDefaultFields()) {
                // throw error
                Logger
                    .getLogger(this.getClass())
                    .error(
                        "Cannot create foreign key "
                                + this.foreignKey.getName()
                                + ". "
                                + this.foreignKey.getReferenceTable()
                                + " table has fields that do not allow NULL values and have no default values. "
                                + "You need to import data to those fields before creating foreign key(s).");
            } else {
                insertStmt = getInsertRecInRefTableStmt();
            }
        }
        return insertStmt;
    }
    
    /**
     * Check if the parent table has not null and no default fields.
     * 
     * @return boolean
     */
    private boolean hasNotNullWithNoDefaultFields() {
        final String refTableName = this.foreignKey.getReferenceTable();
        final TableDef.ThreadSafe refTableDef =
                ContextStore.get().getProject().loadTableDef(refTableName);
        boolean hasNotNullWithNoDflt = false;
        for (final String fieldName : refTableDef.getFieldNames()) {
            final ArchibusFieldDefBase.Immutable fieldDef = refTableDef.getFieldDef(fieldName);
            if (!fieldDef.getAllowNull() && fieldDef.getDefaultValue() == null
                    && !fieldDef.isPrimaryKey()) {
                hasNotNullWithNoDflt = true;
                break;
            }
        }
        return hasNotNullWithNoDflt;
    }
    
    /**
     * Adds new record into parent table with default value of foreign key as primary key. We need
     * to log this as SQL statement.
     * 
     * @return insert statement
     *         <p>
     *         Suppress PMD warning "AvoidUsingSql" in this method.
     *         <p>
     *         Justification: Case #5 - Logging SQL statements.
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    private String getInsertRecInRefTableStmt() {
        return String.format("INSERT INTO %s(%s) VALUES(%s)", this.foreignKey.getReferenceTable(),
            SchemaUpdateWizardUtilities.convertArrayToString(this.foreignKey.getPrimaryColumns(),
                ','), buildDfltValStmt());
    }
    
    /**
     * 
     * @return default values
     */
    private String buildDfltValStmt() {
        final String[] refPkFields = convertListToArray(this.foreignKey.getPrimaryColumns());
        final String[] foreignFields = convertListToArray(this.foreignKey.getForeignFields());
        String dfltValues = "";
        final TableDef.ThreadSafe foreignTableDef =
                ContextStore.get().getProject().loadTableDef(this.foreignKey.getForeignTable());
        for (int i = 0; i < refPkFields.length; i++) {
            final String defaultValue =
                    foreignTableDef.getFieldDef(foreignFields[i]).getDefaultValue().toString();
            dfltValues = "'" + defaultValue;
            dfltValues += "',";
        }
        return dfltValues.substring(0, dfltValues.length() - 1);
    }
    
    /**
     * Creates DataSource.
     * 
     * @return DataSource
     */
    private DataSource createDataSourceForDefaultValue() {
        final DataSource checkDfltValDs =
                ProjectUpdateWizardUtilities.createDataSourceForTable(this.foreignKey
                    .getReferenceTable());
        final TableDef.ThreadSafe foreignTableDef =
                ContextStore.get().getProject().loadTableDef(this.foreignKey.getForeignTable());
        final ListWrapper.Immutable<String> fkCols = this.foreignKey.getForeignFields();
        if (!fkCols.isEmpty()) {
            for (final String fkName : fkCols) {
                final Object defaultValue = foreignTableDef.getFieldDef(fkName).getDefaultValue();
                checkDfltValDs.addRestriction(Restrictions.eq(this.foreignKey.getReferenceTable(),
                    fkName, defaultValue));
            }
        }
        return checkDfltValDs;
    }
    
    /**
     * Do not take into consideration invalid foreign keys.
     * 
     * @return true if the foreign key is correctly defined in ARCHIBUS
     */
    public boolean isValid() {
        final String lastFieldName = this.foreignKey.getLastField();
        final TableDef.ThreadSafe foreignTableDef =
                ContextStore.get().getProject().loadTableDef(this.foreignKey.getForeignTable());
        boolean isValid = true;
        final TableDef.ThreadSafe archibusTDef =
                ContextStore.get().getProject().loadTableDef(this.foreignKey.getForeignTable());
        if (archibusTDef.getFieldDef(this.foreignKey.getName()).isValidateData()) {
            if (null == foreignTableDef.findFieldDef(lastFieldName)) {
                isValid = false;
                final String message =
                        String.format(
                            "Skip adding foreign key. Field does not exist in Foreign Table:%s.%s",
                            this.foreignKey.getForeignTable(), lastFieldName);
                Logger.getLogger(getClass()).warn(message);
            } else if (this.foreignKey.getForeignFields().size() != this.foreignKey
                .getPrimaryColumns().size()) {
                isValid = false;
                final String message =
                        String
                            .format(
                                "Skip adding foreign key. Mismatched column specifications for foreign field: %s.%s",
                                this.foreignKey.getForeignTable(), lastFieldName);
                Logger.getLogger(getClass()).warn(message);
            }
        } else {
            isValid = false;
        }
        return isValid;
    }
    
    /**
     * Converts List to Array.
     * 
     * @param fieldsList list of fields
     * @return String[]
     */
    private String[] convertListToArray(final Immutable<String> fieldsList) {
        final String[] ret = new String[fieldsList.size()];
        for (int i = 0; i < ret.length; i++) {
            ret[i] = fieldsList.get(i);
        }
        return ret;
    }
}
