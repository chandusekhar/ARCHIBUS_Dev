package com.archibus.datasource;

import com.archibus.app.sysadmin.updatewizard.project.util.ProjectUpdateWizardUtilities;
import com.archibus.app.sysadmin.updatewizard.schema.job.UpdateSchemaJob;
import com.archibus.context.ContextStore;
import com.archibus.datasource.cascade.CascadeHandler;
import com.archibus.datasource.cascade.loader.TablesLoaderDeleteImpl;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.*;
import com.archibus.datasource.restriction.Restrictions.Restriction.Clause;

/**
 * Unit test for Cascade Delete Handler.
 */
public class TestCircularForeignKeys extends DataSourceTestBase {
    
    /**
     * Constant.
     */
    private static final String COUNT = "COUNT";
    
    /**
     * 
     * Test self references foreign keys.
     */
    public void testCircularSelfReferenceForeignKeys() {
        
        final String mainTableName = "pmp";
        final String[] fieldNames = { "pmp_id" };
        final String oldValue = "AHU-3-MONTH";
        final String newValue = "AHU-3-MONTH2";
        
        createSelfReferenceKeyForTableInARCHIBUS(mainTableName);
        updatePhysicalDB(mainTableName);
        
        final DataSource dSource =
                DataSourceFactory.createDataSourceForFields(mainTableName, fieldNames);
        dSource.addRestriction(Restrictions.eq(mainTableName, fieldNames[0], oldValue));
        
        final DataRecord record = dSource.getRecord();
        
        // set new value
        record.setValue("pmp.pmp_id", newValue);
        
        final CascadeHandlerImpl handler = new CascadeHandlerImpl();
        handler.cascadeUpdate(record);
        dSource.commit();
        
        // verify that the parent record have been updated
        Clause restriction = Restrictions.eq(mainTableName, fieldNames[0], newValue);
        
        int dataCount = DataStatistics.getInt(mainTableName, fieldNames[0], COUNT, restriction);
        assertEquals(1, dataCount);
        
        // verify that the parent record doesn't exist
        restriction = Restrictions.eq(mainTableName, fieldNames[0], oldValue);
        dataCount = DataStatistics.getInt(mainTableName, fieldNames[0], COUNT, restriction);
        assertEquals(0, dataCount);
        
        dropSelfReferenceKeyForTableInARCHIBUS(mainTableName);
        updatePhysicalDB(mainTableName);
    }
    
    /**
     * 
     * Test circular foreign keys on deeper levels.
     */
    public void testCircularForeignKeys() {
        // create the data source for the parent table
        final String mainTableName = "bl";
        final String[] fieldNames = { "bl_id" };
        final String oldValue = "HQ";
        final String newValue = "HQNEW";
        
        final DataSource dSource =
                DataSourceFactory.createDataSourceForFields(mainTableName, fieldNames);
        dSource.addRestriction(Restrictions.eq(mainTableName, fieldNames[0], oldValue));
        
        final DataRecord record = dSource.getRecord();
        
        record.setValue("bl.bl_id", newValue);
        
        final CascadeHandler cascadeManager = new CascadeHandler(record);
        
        final TablesLoaderDeleteImpl loader = new TablesLoaderDeleteImpl(cascadeManager);
        loader.processCascadeTables();
        
    }
    
    /**
     * Creates self reference into ARCHIBUS tables.
     * 
     * @param tableName table name
     */
    private void createSelfReferenceKeyForTableInARCHIBUS(final String tableName) {
        // add new field name that refers primary_key and it's not null-able.
        
        final DataSource afmFldsDataSource =
                ProjectUpdateWizardUtilities.createDataSourceForTable("afm_flds");
        afmFldsDataSource.addRestriction(Restrictions.eq(afmFldsDataSource.getMainTableName(),
            "table_name", tableName));
        
        final DataRecord record = afmFldsDataSource.createNewRecord();
        
        final String selfReferenceFieldName = tableName + "_self";
        
        record.setValue("afm_flds.table_name", tableName);
        record.setValue("afm_flds.field_name", selfReferenceFieldName);
        record.setValue("afm_flds.ref_table", tableName);
        record.setValue("afm_flds.allow_null", 0);
        record.setValue("afm_flds.afm_size", 16);
        record.setValue("afm_flds.dflt_val", "AHU-3-MONTH2");
        
        afmFldsDataSource.saveRecord(record);
        afmFldsDataSource.commit();
        
        ContextStore.get().getProject().clearCachedTableDefs();
    }
    
    /**
     * Creates self reference into ARCHIBUS tables.
     * 
     * @param tableName table name
     */
    private void dropSelfReferenceKeyForTableInARCHIBUS(final String tableName) {
        // add new field name that refers primary_key and it's not null-able.
        
        final DataSource afmFldsDataSource =
                ProjectUpdateWizardUtilities.createDataSourceForTable("afm_flds");
        afmFldsDataSource.addRestriction(Restrictions.eq(afmFldsDataSource.getMainTableName(),
            "table_name", tableName));
        afmFldsDataSource.addRestriction(Restrictions.eq(afmFldsDataSource.getMainTableName(),
            "field_name", tableName + "_self"));
        
        final DataRecord record = afmFldsDataSource.getRecord();
        
        afmFldsDataSource.deleteRecord(record);
        
        ContextStore.get().getProject().clearCachedTableDefs();
    }
    
    /**
     * Create self reference key into physical DB.
     * 
     * @param tableName table name
     */
    private void updatePhysicalDB(final String tableName) {
        // final ProjectUpdateWizardService puws = new ProjectUpdateWizardServiceImpl();
        // puws.addTableNamesToTransferSet(new ArrayList<String>(), false, tableName, false);
        SqlUtils
            .executeUpdate("pmp",
                "insert into afm_transfer_set(table_name, status, set_name) values('pmp', 'PENDING', 'TEST')");
        SqlUtils.commit();
        final UpdateSchemaJob job = new UpdateSchemaJob(true, false, false, true, false, "");
        job.run();
    }
}
