package com.archibus.datasource;

import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.*;
import com.archibus.datasource.restriction.Restrictions.Restriction;
import com.archibus.datasource.restriction.Restrictions.Restriction.Clause;

/**
 * Unit test for cascade update handler.
 */
public class TestCascadeUpdateHandler extends DataSourceTestBase {
    
    /**
     * Constant.
     */
    private static final String COUNT = "COUNT";
    
    /**
     * Updates a specified record. To change the record name, just modify oldValue and newValue.
     */
    public void test01CascadeUpdateFK() {
        
        final String mainTableName = "port";
        final String[] fieldNames = { "port_id" };
        
        final String oldValue = "00001";
        final String newValue = "00002";
        
        final String sql =
                "INSERT into port(port_id,port_std,description,fl_id,bl_id,rm_id,rack_id,tc_level) VALUES('00001', 'AUI-PORT-A', 'description', '17', 'HQ', '129', '1', '100-WA')";
        
        SqlUtils.executeUpdate(mainTableName, sql);
        SqlUtils.commit();
        
        final DataSource dSource =
                DataSourceFactory.createDataSourceForFields(mainTableName, fieldNames);
        dSource.addRestriction(Restrictions.eq(mainTableName, fieldNames[0], oldValue));
        
        final DataRecord record = dSource.getRecord();
        
        record.setValue("port.port_id", newValue);
        
        // call the cascade handler to delete children table records
        final CascadeHandler handler = new CascadeHandlerImpl();
        handler.cascadeUpdate(record);
        
        // commit all changes
        dSource.commit();
        
        Clause portClause = Restrictions.eq(mainTableName, fieldNames[0], oldValue);
        final Clause[] clauses = { portClause };
        Restriction restriction = Restrictions.and(clauses);
        int count = DataStatistics.getInt(mainTableName, fieldNames[0], COUNT, restriction);
        assertEquals(0, count);
        
        portClause = Restrictions.eq(mainTableName, fieldNames[0], newValue);
        restriction = Restrictions.and(clauses);
        clauses[0] = portClause;
        
        count = DataStatistics.getInt(mainTableName, fieldNames[0], COUNT, restriction);
        assertEquals(1, count);
        
        SqlUtils.executeUpdate(mainTableName, "DELETE FROM port WHERE port_id = '00002'");
        SqlUtils.commit();
        
    }
    
    /**
     * 
     * Updates a specified record. To change the record name, just modify oldValue and newValue.
     */
    public void test02CascadeUpdateSinglePK() {
        // create the data source for the parent table
        final String mainTableName = "site";
        final String[] fieldNames = { "site_id" };
        final String oldValue = "CENTER";
        final String newValue = "CENTER2";
        
        final DataSource dSource =
                DataSourceFactory.createDataSourceForFields(mainTableName, fieldNames);
        dSource.addRestriction(Restrictions.eq(mainTableName, fieldNames[0], oldValue));
        
        DataRecord record = dSource.getRecord();
        
        // set new value
        record.setValue("site.site_id", newValue);
        
        // call the cascade handler to delete children table records
        final CascadeHandler handler = new CascadeHandlerImpl();
        handler.cascadeUpdate(record);
        
        // commit all changes
        dSource.commit();
        
        Clause restriction = Restrictions.eq(mainTableName, fieldNames[0], newValue);
        int dataCount = DataStatistics.getInt(mainTableName, fieldNames[0], COUNT, restriction);
        assertEquals(1, dataCount);
        
        restriction = Restrictions.eq(mainTableName, fieldNames[0], oldValue);
        dataCount = DataStatistics.getInt(mainTableName, fieldNames[0], COUNT, restriction);
        assertEquals(0, dataCount);
        
        /**
         * Roll-back changes.
         */
        dSource.clearRestrictions();
        dSource.addRestriction(Restrictions.eq(mainTableName, fieldNames[0], newValue));
        
        record = dSource.getRecord();
        
        // set new value
        record.setValue("site.site_id", oldValue);
        
        handler.cascadeUpdate(record);
        
        // commit all changes
        dSource.commit();
        
        restriction = Restrictions.eq(mainTableName, fieldNames[0], oldValue);
        dataCount = DataStatistics.getInt(mainTableName, fieldNames[0], COUNT, restriction);
        assertEquals(1, dataCount);
        
        restriction = Restrictions.eq(mainTableName, fieldNames[0], newValue);
        dataCount = DataStatistics.getInt(mainTableName, fieldNames[0], COUNT, restriction);
        assertEquals(0, dataCount);
        
    }
    
    /**
     * 
     * Updates a specified record. To change the record name, just modify oldValue and newValue.
     */
    public void test03CascadeUpdateSinglePK() {
        // create the data source for the parent table
        final String mainTableName = "pmp";
        final String[] fieldNames = { "pmp_id" };
        final String oldValue = "AHU-3-MONTH";
        final String newValue = "AHU-3-MONTH1";
        
        final DataSource dSource =
                DataSourceFactory.createDataSourceForFields(mainTableName, fieldNames);
        dSource.addRestriction(Restrictions.eq(mainTableName, fieldNames[0], oldValue));
        
        DataRecord record = dSource.getRecord();
        
        // set new value
        record.setValue("pmp.pmp_id", newValue);
        
        // call the cascade handler to delete children table records
        final CascadeHandler handler = new CascadeHandlerImpl();
        
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
        
        /**
         * Roll-back changes.
         */
        
        dSource.clearRestrictions();
        dSource.addRestriction(Restrictions.eq(mainTableName, fieldNames[0], newValue));
        
        record = dSource.getRecord();
        
        // set new value
        record.setValue("pmp.pmp_id", oldValue);
        
        // call the cascade handler to delete children table records
        handler.cascadeUpdate(record);
        
        dSource.commit();
    }
    
    /**
     * Updates a specified record. To change the record name, just modify oldValue and newValue.
     */
    public void test04CascadeUpdateMultiPK() {
        // create the data source for the parent table
        final String mainTableName = "rm";
        final String[] fieldNames = { "bl_id", "fl_id", "rm_id" };
        final String blOldValue = "HQ";
        final String flOldValue = "01";
        final String rmOldValue = "150";
        
        final String blValue = "HQ";
        final String flValue = "01";
        final String rmValue = "888";
        
        final DataSource dSource =
                DataSourceFactory.createDataSourceForFields(mainTableName, fieldNames);
        dSource.addRestriction(Restrictions.eq(mainTableName, fieldNames[0], blOldValue));
        dSource.addRestriction(Restrictions.eq(mainTableName, fieldNames[1], flOldValue));
        dSource.addRestriction(Restrictions.eq(mainTableName, fieldNames[2], rmOldValue));
        
        DataRecord record = dSource.getRecord();
        
        // set new and old value
        record.setValue("rm.bl_id", blValue);
        record.setValue("rm.fl_id", flValue);
        record.setValue("rm.rm_id", rmValue);
        
        // call the cascade handler to delete children table records
        final CascadeHandler handler = new CascadeHandlerImpl();
        
        handler.cascadeUpdate(record);
        
        // commit all changes
        dSource.commit();
        
        Clause blClause = Restrictions.eq(mainTableName, fieldNames[0], blValue);
        Clause flClause = Restrictions.eq(mainTableName, fieldNames[1], flValue);
        Clause rmClause = Restrictions.eq(mainTableName, fieldNames[2], rmValue);
        
        Restriction restriction = Restrictions.and(blClause, flClause, rmClause);
        
        int dataCount = DataStatistics.getInt(mainTableName, fieldNames[0], COUNT, restriction);
        assertEquals(1, dataCount);
        
        blClause = Restrictions.eq(mainTableName, fieldNames[0], blOldValue);
        flClause = Restrictions.eq(mainTableName, fieldNames[1], flOldValue);
        rmClause = Restrictions.eq(mainTableName, fieldNames[2], rmOldValue);
        
        restriction = Restrictions.and(blClause, flClause, rmClause);
        
        dataCount = DataStatistics.getInt(mainTableName, fieldNames[0], COUNT, restriction);
        assertEquals(0, dataCount);
        
        /**
         * Roll-back changes.
         */
        dSource.clearRestrictions();
        dSource.addRestriction(Restrictions.eq(mainTableName, fieldNames[0], blValue));
        dSource.addRestriction(Restrictions.eq(mainTableName, fieldNames[1], flValue));
        dSource.addRestriction(Restrictions.eq(mainTableName, fieldNames[2], rmValue));
        
        record = dSource.getRecord();
        
        // set new and old value
        record.setValue("rm.bl_id", blOldValue);
        record.setValue("rm.fl_id", flOldValue);
        record.setValue("rm.rm_id", rmOldValue);
        
        handler.cascadeUpdate(record);
        
        dSource.commit();
    }
    
    /**
     * 
     * Updates a specified record. To change the record name, just modify oldValue and newValue.
     */
    public void test05CascadeUpdateSinglePK() {
        // create the data source for the parent table
        final String mainTableName = "bl";
        final String[] fieldNames = { "bl_id" };
        final String oldValue = "HQ";
        final String newValue = "HQNEW";
        
        final DataSource dSource =
                DataSourceFactory.createDataSourceForFields(mainTableName, fieldNames);
        dSource.addRestriction(Restrictions.eq(mainTableName, fieldNames[0], oldValue));
        
        DataRecord record = dSource.getRecord();
        
        // set new value
        record.setValue("bl.bl_id", newValue);
        
        final CascadeHandler handler = new CascadeHandlerImpl();
        
        handler.cascadeUpdate(record);
        // commit all changes
        dSource.commit();
        
        Clause restriction = Restrictions.eq(mainTableName, fieldNames[0], newValue);
        int dataCount = DataStatistics.getInt(mainTableName, fieldNames[0], COUNT, restriction);
        assertEquals(1, dataCount);
        
        restriction = Restrictions.eq(mainTableName, fieldNames[0], oldValue);
        dataCount = DataStatistics.getInt(mainTableName, fieldNames[0], COUNT, restriction);
        assertEquals(0, dataCount);
        
        /**
         * Roll-back changes.
         */
        dSource.clearRestrictions();
        dSource.addRestriction(Restrictions.eq(mainTableName, fieldNames[0], newValue));
        
        record = dSource.getRecord();
        
        // set new value
        record.setValue("bl.bl_id", oldValue);
        
        handler.cascadeUpdate(record);
        
        dSource.commit();
    }
    
    /**
     * 
     * TODO test06CascadeUpdateSinglePK.
     */
    public void test06CascadeUpdateSinglePK() {
        // create the data source for the parent table
        final String mainTableName = "po";
        final String[] fieldNames = { "po_id" };
        final int oldValue = 101;
        final int newValue = 1011;
        
        final DataSource dSource =
                DataSourceFactory.createDataSourceForFields(mainTableName, fieldNames);
        dSource.addRestriction(Restrictions.eq(mainTableName, fieldNames[0], oldValue));
        
        DataRecord record = dSource.getRecord();
        
        // set new value
        record.setValue("po.po_id", newValue);
        
        // call the cascade handler to delete children table records
        final CascadeHandler handler = new CascadeHandlerImpl();
        
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
        
        /**
         * Roll-back changes.
         */
        dSource.clearRestrictions();
        dSource.addRestriction(Restrictions.eq(mainTableName, fieldNames[0], newValue));
        
        record = dSource.getRecord();
        
        // set new value
        record.setValue("po.po_id", oldValue);
        
        handler.cascadeUpdate(record);
        
        dSource.commit();
    }
    
    /**
     * 
     * Self reference.
     */
    public void test07CascadeUpdateSinglePKSelfReference() {
        // create the data source for the parent table
        final String mainTableName = "regulation";
        final String[] fieldNames = { "regulation" };
        final String oldValue = "HAZMAT";
        final String newValue = "HAZMAT_self";
        
        final DataSource dSource =
                DataSourceFactory.createDataSourceForFields(mainTableName, fieldNames);
        dSource.addRestriction(Restrictions.eq(mainTableName, fieldNames[0], oldValue));
        
        DataRecord record = dSource.getRecord();
        
        // set new value
        record.setValue("regulation.regulation", newValue);
        
        // call the cascade handler to delete children table records
        final CascadeHandler handler = new CascadeHandlerImpl();
        
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
        
        /**
         * Roll-back changes.
         */
        dSource.clearRestrictions();
        dSource.addRestriction(Restrictions.eq(mainTableName, fieldNames[0], newValue));
        
        record = dSource.getRecord();
        
        // set new value
        record.setValue("regulation.regulation", oldValue);
        
        handler.cascadeUpdate(record);
        
        dSource.commit();
    }
    
    /**
     * 
     * Self reference.
     * <p/>
     * 
     * TODO Enable afm_flds.validate_data for afm_metric_definitions.ratio_metric_num
     */
    public void test08CascadeUpdateSinglePKSelfReference() {
        // create the data source for the parent table
        final String mainTableName = "afm_metric_definitions";
        final String[] fieldNames = { "metric_name" };
        
        final DataSource dSource =
                DataSourceFactory.createDataSourceForFields(mainTableName, fieldNames);
        dSource.addRestriction(Restrictions.isNotNull(mainTableName, "ratio_metric_num"));
        
        DataRecord record = dSource.getRecord();
        
        final String oldValue = record.getString("afm_metric_definitions.metric_name");
        final String newValue = "metric_CascadeHandler_test";
        
        // set new value
        record.setValue("afm_metric_definitions.metric_name", newValue);
        
        // call the cascade handler to delete children table records
        final CascadeHandler handler = new CascadeHandlerImpl();
        
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
        
        /**
         * Roll-back changes.
         */
        dSource.clearRestrictions();
        dSource.addRestriction(Restrictions.eq(mainTableName, fieldNames[0], newValue));
        
        record = dSource.getRecord();
        
        // set new value
        record.setValue("afm_metric_definitions.metric_name", oldValue);
        
        handler.cascadeUpdate(record);
        
        dSource.commit();
    }
}
