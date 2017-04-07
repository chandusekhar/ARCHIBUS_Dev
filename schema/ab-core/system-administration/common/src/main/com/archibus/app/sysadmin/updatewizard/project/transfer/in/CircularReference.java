package com.archibus.app.sysadmin.updatewizard.project.transfer.in;

import java.util.*;

import com.archibus.app.sysadmin.updatewizard.project.util.*;
import com.archibus.app.sysadmin.updatewizard.schema.dbschema.*;
import com.archibus.app.sysadmin.updatewizard.schema.output.*;
import com.archibus.app.sysadmin.updatewizard.schema.sqlgenerator.ManageForeignKeys;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;

/**
 * gets/drops circular references.
 * 
 * @author Catalin Purice
 * 
 */
public class CircularReference {
    
    /**
     * Child table.
     */
    private final String childTable;
    
    /**
     * Child field name.
     */
    private final String childFkey;
    
    /**
     * Constructor.
     * 
     * @param cTable child table
     * @param cFkey foreign key
     */
    public CircularReference(final String cTable, final String cFkey) {
        super();
        this.childTable = cTable;
        this.childFkey = cFkey;
    }
    
    /**
     * @return the branch
     */
    public String getChild() {
        return this.childTable;
    }
    
    /**
     * Drops the reference from ARCHIBUS data dictionary by setting validate_data = 0.
     */
    public void dropArchibusReference() {
        final DataSource dsCircRef =
                DataSourceFactory
                    .createDataSource()
                    .addTable(ProjectUpdateWizardConstants.AFM_FLDS)
                    .addField("ref_table")
                    .addField(ProjectUpdateWizardUtilities.TABLE_NAME)
                    .addField(ProjectUpdateWizardUtilities.FIELD_NAME)
                    .addField("validate_data")
                    .addRestriction(
                        Restrictions.eq(ProjectUpdateWizardConstants.AFM_FLDS,
                            ProjectUpdateWizardUtilities.TABLE_NAME, this.childTable))
                    .addRestriction(
                        Restrictions.eq(ProjectUpdateWizardConstants.AFM_FLDS,
                            ProjectUpdateWizardUtilities.FIELD_NAME, this.childFkey));
        final DataRecord record = dsCircRef.getRecord();
        record.setValue("afm_flds.validate_data", 0);
        dsCircRef.saveRecord(record);
        dsCircRef.commit();
    }
    
    /**
     * Drops the reference from Sql database.
     */
    public void dropSqlReference() {
        final DatabaseSchemaTableDef sqlChildTDef =
                new DatabaseSchemaTableDef(this.childTable).loadTableFieldsDefn();
        final DatabaseSchemaForeignKeyDef sqlFkeyDef =
                sqlChildTDef.getForeignKeyDef(this.childFkey);
        if (sqlFkeyDef != null) {
            final SqlCommandOutput out = new ExecuteCommand();
            new ManageForeignKeys(sqlChildTDef, out).dropForeignKey(sqlFkeyDef);
        }
    }
    
    /**
     * Order the table names in the list according to dependencies.
     * 
     * @param tableNames tables names
     * @return circular references
     */
    public static List<Map<String, String>> getCircularReference(final List<String> tableNames) {
        final ITablesImportPriority procOrder = new TablesImportPriority(tableNames, false);
        procOrder.calculatePriority();
        return procOrder.getCircularReferences();
    }
}
