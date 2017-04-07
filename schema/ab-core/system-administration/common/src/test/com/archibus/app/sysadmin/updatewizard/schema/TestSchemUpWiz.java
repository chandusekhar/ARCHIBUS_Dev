package com.archibus.app.sysadmin.updatewizard.schema;

import java.util.*;

import com.archibus.app.sysadmin.updatewizard.project.*;
import com.archibus.app.sysadmin.updatewizard.schema.dbschema.*;
import com.archibus.app.sysadmin.updatewizard.schema.job.UpdateSchemaJob;
import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.schema.ArchibusFieldDefBase;

/**
 * JUnit for PUW.
 * 
 * @author Catalin
 * 
 */
@SuppressWarnings({ "PMD.AvoidUsingSql", "PMD.TooManyMethods" })
public class TestSchemUpWiz extends DataSourceTestBase {
    
    /**
     * Constant.
     */
    private static final String AFM_FLDS = "afm_flds";
    
    /**
     * Constant.
     */
    private static final String AFM_TBLS = "afm_tbls";
    
    /**
     * Constant.
     */
    private static final String DELETE_FROM_AFM_FLDS = "DELETE FROM afm_flds WHERE table_name='%s'";
    
    /**
     * Constant.
     */
    private static final String DELETE_FROM_AFM_TBLS = "DELETE FROM afm_tbls WHERE table_name='%s'";
    
    /**
     * Constant.
     */
    private static final String INSERT_INTO_FLDS =
            "INSERT INTO afm_flds(table_name, field_name,primary_key,dflt_val) VALUES('%s','%s',%d, '%s')";
    
    /**
     * Adds new field non-PK/non-FK.
     */
    public void testAddDropFieldFromTable() {
        
        final String tableName = "bl";
        
        final List<String> fields = new ArrayList<String>();
        fields.add("newfield1");
        fields.add("newfield2");
        
        for (final String field : fields) {
            SqlUtils.executeUpdate(AFM_FLDS,
                String.format(INSERT_INTO_FLDS, tableName, field, 0, ""));
        }
        
        ContextStore.get().getProject().clearCachedTableDefs();
        
        final ProjectUpdateWizardService puw = new ProjectUpdateWizardServiceImpl();
        puw.addTableNamesToTransferSet(new ArrayList<String>(), false, tableName, false);
        final UpdateSchemaJob job = new UpdateSchemaJob(true, false, false, false, false, "");
        job.run();
        final List<String> missingFields = new ArrayList<String>();
        missingFields.addAll(DatabaseSchemaUtilities.getMissingFieldsFromSql(tableName));
        assertEquals(true, missingFields.isEmpty());
        
        missingFields.clear();
        
        // clear database
        for (final String field : fields) {
            SqlUtils.executeUpdate(AFM_FLDS, "DELETE FROM afm_flds WHERE table_name='" + tableName
                    + "' and field_name='" + field + "'");
        }
        ContextStore.get().getProject().clearCachedTableDefs();
        
        puw.addTableNamesToTransferSet(new ArrayList<String>(), false, tableName, false);
        job.run();
        
        missingFields.addAll(DatabaseSchemaUtilities.getMissingFieldsFromSql(tableName));
        assertEquals(true, missingFields.isEmpty());
    }
    
    /**
     * Adds new field PK.
     */
    public void testAddNewPkFieldIntoTable() {
        
        final String tableName = "bl";
        
        final List<String> pkfields = new ArrayList<String>();
        pkfields.add("newpk");
        
        for (final String pkfield : pkfields) {
            SqlUtils.executeUpdate(AFM_FLDS,
                String.format(INSERT_INTO_FLDS, tableName, pkfield, 2, 0));
        }
        
        ContextStore.get().getProject().clearCachedTableDefs();
        
        final ProjectUpdateWizardService puw = new ProjectUpdateWizardServiceImpl();
        puw.addTableNamesToTransferSet(new ArrayList<String>(), false, tableName, false);
        final UpdateSchemaJob job = new UpdateSchemaJob(true, false, true, true, false, "");
        job.run();
        final DatabaseSchemaTableDef sqlTblDef =
                new DatabaseSchemaTableDef(tableName).loadTableFieldsDefn();
        
        assertEquals("bl_id", sqlTblDef.getPrimaryKeys().get(0).getName());
        assertEquals(pkfields.get(0), sqlTblDef.getPrimaryKeys().get(1).getName());
        assertEquals(2, sqlTblDef.getPrimaryKeys().size());
    }
    
    /**
     * Creates new table.
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    public void testCreateTable() {
        
        final String tableName = "test";
        
        final List<String> fields = new ArrayList<String>();
        fields.add("pk1");
        fields.add("name");
        fields.add("type");
        
        // primary keys
        final List<String> pkFields = new ArrayList<String>();
        pkFields.add("pk1");
        
        // insert into afm_tbls
        SqlUtils.executeUpdate(AFM_TBLS,
            String.format("INSERT INTO afm_tbls(table_name) VALUES('%s')", tableName));
        
        int pkNo = 0;
        for (final String field : fields) {
            if (pkFields.contains(field)) {
                pkNo++;
                SqlUtils.executeUpdate(AFM_FLDS,
                    String.format(INSERT_INTO_FLDS, tableName, field, pkNo, ""));
            } else {
                SqlUtils.executeUpdate(AFM_FLDS,
                    String.format(INSERT_INTO_FLDS, tableName, field, 0, ""));
            }
        }
        SqlUtils.commit();
        ContextStore.get().getProject().clearCachedTableDefs();
        
        final ProjectUpdateWizardService puw = new ProjectUpdateWizardServiceImpl();
        puw.addTableNamesToTransferSet(new ArrayList<String>(), false, tableName, false);
        final UpdateSchemaJob job = new UpdateSchemaJob(true, false, false, false, false, "");
        job.run();
        final boolean existsTable = DatabaseSchemaUtilities.isTableInSql(tableName);
        assertEquals(true, existsTable);
        
        // clear database
        SqlUtils.executeUpdate(AFM_FLDS, "DROP TABLE " + tableName);
        SqlUtils.executeUpdate(AFM_FLDS, String.format(DELETE_FROM_AFM_FLDS, tableName));
        SqlUtils.executeUpdate(AFM_TBLS, String.format(DELETE_FROM_AFM_TBLS, tableName));
    }
    
    /**
     * Delete non-PK/non-FK field.
     */
    public void testDeleteFieldFromTable() {
        new ArrayList<String>();
        final String tableName = "bl";
        final String fieldName = "comments";
        SqlUtils.executeUpdate(AFM_TBLS, "DELETE FROM afm_flds WHERE table_name='" + tableName
                + "' AND field_name='" + fieldName + "'");
        SqlUtils.commit();
        
        ContextStore.get().getProject().clearCachedTableDefs();
        final ProjectUpdateWizardService puw = new ProjectUpdateWizardServiceImpl();
        puw.addTableNamesToTransferSet(new ArrayList<String>(), false, tableName, false);
        final UpdateSchemaJob job = new UpdateSchemaJob(true, false, true, true, false, "");
        job.run();
        
        final List<String> missingFields = new ArrayList<String>();
        missingFields.addAll(DatabaseSchemaUtilities.getMissingFieldsFromSql(tableName));
        assertEquals(false, missingFields.contains(fieldName));
    }
    
    /**
     * Delete existing table().
     */
    public void testDropTable() {
        
        final String tableName = "ac";
        SqlUtils.executeUpdate(AFM_FLDS, "DELETE FROM afm_flds WHERE table_name='" + tableName
                + "'");
        SqlUtils.executeUpdate(AFM_TBLS, "DELETE FROM afm_tbls WHERE table_name='" + tableName
                + "'");
        SqlUtils.commit();
        
        ContextStore.get().getProject().clearCachedTableDefs();
        
        final ProjectUpdateWizardService puw = new ProjectUpdateWizardServiceImpl();
        puw.addTableNamesToTransferSet(new ArrayList<String>(), false, tableName, false);
        final UpdateSchemaJob job = new UpdateSchemaJob(true, false, true, true, false, "");
        job.run();
        
        assertEquals(false, DatabaseSchemaUtilities.isTableInSql(tableName));
    }
    
    /**
     * Creates new table.
     */
    public void testModifyAllowNullForField() {
        final String tableName = "bl";
        final String fieldName = "name";
        final String allowNull = "0";
        SqlUtils.executeUpdate(AFM_FLDS, "UPDATE afm_flds SET allow_null=" + allowNull
                + " WHERE table_name='" + tableName + "' AND field_name='" + fieldName + "'");
        SqlUtils.commit();
        
        ContextStore.get().getProject().clearCachedTableDefs();
        
        final ProjectUpdateWizardService puw = new ProjectUpdateWizardServiceImpl();
        puw.addTableNamesToTransferSet(new ArrayList<String>(), false, tableName, false);
        final UpdateSchemaJob job = new UpdateSchemaJob(true, false, false, false, false, "");
        job.run();
        
        final ArchibusFieldDefBase.Immutable fieldDef =
                ContextStore.get().getProject().loadTableDef(tableName).getFieldDef(fieldName);
        final DatabaseSchemaFieldDef sqlFieldDef =
                new DatabaseSchemaTableDef(tableName).getFieldDef(fieldName);
        assertEquals(fieldDef.getAllowNull(), sqlFieldDef.isAllowNull());
        
    }
    
    /**
     * Creates new table.
     */
    public void testModifyDataTypeForField() {
        final ProjectUpdateWizardService puw = new ProjectUpdateWizardServiceImpl();
        puw.addTableNamesToTransferSet(new ArrayList<String>(), false, "bl", false);
        final UpdateSchemaJob job = new UpdateSchemaJob(true, false, true, false, false, "");
        job.run();
    }
    
    /**
     * Creates new table.
     */
    public void testModifyDefaultForField() {
        final String tableName = "bl";
        final String fieldName = "name";
        final String dfltVal = "my_def";
        SqlUtils.executeUpdate(AFM_FLDS, "UPDATE afm_flds SET dflt_val ='" + dfltVal
                + "' WHERE table_name='" + tableName + "' AND field_name='" + fieldName + "'");
        SqlUtils.commit();
        
        ContextStore.get().getProject().clearCachedTableDefs();
        
        final ProjectUpdateWizardService puw = new ProjectUpdateWizardServiceImpl();
        puw.addTableNamesToTransferSet(new ArrayList<String>(), false, tableName, false);
        final UpdateSchemaJob job = new UpdateSchemaJob(true, false, false, false, false, "");
        job.run();
        
        final ArchibusFieldDefBase.Immutable fieldDef =
                ContextStore.get().getProject().loadTableDef(tableName).getFieldDef(fieldName);
        final DatabaseSchemaFieldDef sqlFieldDef =
                new DatabaseSchemaTableDef(tableName).getFieldDef(fieldName);
        assertEquals(fieldDef.getDefaultValue().toString(), sqlFieldDef.getDfltVal().toString());
    }
    
    /**
     * Creates new table.
     */
    public void testModifySizeForField() {
        final String tableName = "bl";
        final String fieldName = "name";
        final ArchibusFieldDefBase.Immutable fieldDef =
                ContextStore.get().getProject().loadTableDef(tableName).getFieldDef(fieldName);
        final int size = fieldDef.getSize() + 1;
        SqlUtils.executeUpdate(AFM_FLDS, "UPDATE afm_flds SET afm_size=" + size
                + " WHERE table_name='" + tableName + "' AND field_name='" + fieldName + "'");
        SqlUtils.commit();
        
        ContextStore.get().getProject().clearCachedTableDefs();
        
        final ProjectUpdateWizardService puw = new ProjectUpdateWizardServiceImpl();
        puw.addTableNamesToTransferSet(new ArrayList<String>(), false, tableName, false);
        final UpdateSchemaJob job = new UpdateSchemaJob(true, false, false, false, false, "");
        job.run();
        
        final DatabaseSchemaFieldDef sqlFieldDef =
                new DatabaseSchemaTableDef(tableName).getFieldDef(fieldName);
        assertEquals(fieldDef.getSize(), sqlFieldDef.getSize());
    }
    
    /**
     * Creates new table.
     */
    public void testRecreateForeignKeys() {
        
    }
    
    /**
     * Re-create existing table.
     */
    public void testReCreateTable() {
        final String tableName = "bl";
        
        final ProjectUpdateWizardService puw = new ProjectUpdateWizardServiceImpl();
        puw.addTableNamesToTransferSet(new ArrayList<String>(), false, tableName, false);
        final UpdateSchemaJob job = new UpdateSchemaJob(true, false, true, true, false, "");
        job.run();
        final DatabaseSchemaTableDef sqlTable =
                new DatabaseSchemaTableDef(tableName).loadTableFieldsDefn();
        
        assertEquals(true, sqlTable.exists());
        assertEquals(
            ContextStore.get().getProject().loadTableDef(tableName).getFieldNames().size(),
            sqlTable.getFieldsName().size());
        assertEquals(ContextStore.get().getProject().loadTableDef(tableName).getForeignKeys()
            .size(), sqlTable.getFKeysDefn().size());
    }
}
