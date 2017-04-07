package com.archibus.app.sysadmin.updatewizard.schema.sqlgenerator;

import java.text.MessageFormat;
import java.util.*;

import org.apache.log4j.Logger;

import com.archibus.app.sysadmin.updatewizard.schema.compare.*;
import com.archibus.app.sysadmin.updatewizard.schema.output.SqlCommandOutput;
import com.archibus.schema.TableDef.ThreadSafe;

/**
 * 
 * Change data type of a field.
 * 
 * 1 - Create the new column at the end of the table.
 * 
 * 2 - Run an update to populate the new table column
 * 
 * 3 - Drop the old table column
 * 
 * 4 - Re-name the new column to the original column name
 * 
 */
public class ChangeDataType extends CreateAlterTable {
    
    /**
     * Numeric types.
     */
    private final List<Integer> numericTypes = Arrays.asList(SqlTypes.SQL_NUMERIC,
        SqlTypes.SQL_FLOAT, SqlTypes.SQL_INTEGER, SqlTypes.SQL_DOUBLE, SqlTypes.SQL_REAL,
        SqlTypes.SQL_SMALLINT);
    
    /**
     * Char types.
     */
    private final List<Integer> charTypes = Arrays.asList(SqlTypes.SQL_CHAR, SqlTypes.SQL_VARCHAR);
    
    /**
     * 
     * @param tableDef tableDef
     * @param out out
     * @param tableSpaceName tblspaceName
     */
    public ChangeDataType(final ThreadSafe tableDef, final SqlCommandOutput out,
            final String tableSpaceName) {
        super(tableDef, out, tableSpaceName);
    }
    
    /**
     * 
     * @param fieldToCompare field to be changed
     */
    public void changeDataType(final CompareFieldDef fieldToCompare) {
        
        if (isDataTypeChangePossible(fieldToCompare)) {
            runChangeDataTypeWorkflow(fieldToCompare);
        } else {
            Logger.getLogger(this.getClass()).warn(
                MessageFormat.format(
                    "Schema Update Wizard - Type cannot be changed for field: [{0}]",
                    new Object[] { fieldToCompare.getSysFieldDef().getTableName() + "."
                            + fieldToCompare.getArcFieldDef().getName() }));
        }
    }
    
    /**
     * @param fieldToCompare field to compare
     * @return true if the change is possible
     */
    private boolean isDataTypeChangePossible(final CompareFieldDef fieldToCompare) {
        boolean changePossible = true;
        final Integer newType =
                Integer.valueOf(fieldToCompare.get(PropertyType.TYPE).getNewValue().toString());
        final Integer oldType =
                Integer.valueOf(fieldToCompare.get(PropertyType.TYPE).getOldValue().toString());
        if (this.charTypes.contains(oldType) && this.numericTypes.contains(newType)) {
            changePossible = false;
        }
        return changePossible;
    }
    
    /**
     * @param fieldToCompare field to compare
     */
    private void runChangeDataTypeWorkflow(final CompareFieldDef fieldToCompare) {
        
        /*
         * final String newFieldName = fieldToCompare.getArcFieldDef().getName(); final String
         * tableName = fieldToCompare.getSysFieldDef().getTableName(); final String oldFieldName =
         * fieldToCompare.getSysFieldDef().getName();
         */
        // final String addNewFieldStmt = addField(newFieldName, true);
        
        // getOutput().runCommand("", DataSource.DB_ROLE_SCHEMA);
        
        // final String copyStmt =
        /*
         * CopyProjectData.copyFromColumnToColumn(tableName, oldFieldName, newFieldName +
         * SchemaUpdateWizardConstants.AFM_TEMP_FIELD_PREFIX);
         */
        // getOutput().runCommand(copyStmt, DataSource.DB_ROLE_DATA);
        if (fieldToCompare.getSysFieldDef().isForeignKey()) {
            final ManageForeignKeys fkManager =
                    new ManageForeignKeys(fieldToCompare.getSysTabledef(), null/* getOutput() */);
            fkManager.dropAllFKeysFromAndToTable();
        }
        // dropColumn(oldFieldName);
        // final String renameFieldStmt =
        // renameField(newFieldName + SchemaUpdateWizardConstants.AFM_TEMP_FIELD_PREFIX,
        // oldFieldName);
        // getOutput().runCommand(renameFieldStmt, DataSource.DB_ROLE_DATA);
    }
}
