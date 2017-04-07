package com.archibus.datasource;

import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.*;
import com.archibus.datasource.restriction.Restrictions.Restriction;
import com.archibus.datasource.restriction.Restrictions.Restriction.Clause;

/**
 * 
 * Provides JUnit test cases for Merge Primary Keys.
 * <p>
 * 
 * @author Catalin Purice
 * 
 */
public class TestCascadeMergePrimaryKeys extends DataSourceTestBase {
    
    /**
     * 
     * Updates a specified record. To change the record name, just
     */
    public void test01CascadeMergeSinglePK() {
        // create the data source for the parent table
        final String mainTableName = "bl";
        final String[] fieldNames = { "bl_id" };
        final String fromValue = "BARCOFF";
        final String toValue = "BEIJOFF";
        
        final DataSource dSource =
                DataSourceFactory.createDataSourceForFields(mainTableName, fieldNames);
        dSource.addRestriction(Restrictions.eq(mainTableName, fieldNames[0], fromValue));
        
        final DataRecord fromRecord = dSource.getRecord();
        
        dSource.clearRestrictions();
        dSource.addRestriction(Restrictions.eq(mainTableName, fieldNames[0], toValue));
        
        final DataRecord toRecord = dSource.getRecord();
        
        final CascadeHandlerImpl handler = new CascadeHandlerImpl();
        
        handler.mergePrimaryKeys(fromRecord, toRecord);
        
        // commit all changes
        dSource.commit();
        
        Clause restriction = Restrictions.eq(mainTableName, fieldNames[0], fromValue);
        int dataCount = DataStatistics.getInt(mainTableName, fieldNames[0], "COUNT", restriction);
        assertEquals(0, dataCount);
        
        restriction = Restrictions.eq(mainTableName, fieldNames[0], toValue);
        dataCount = DataStatistics.getInt(mainTableName, fieldNames[0], "COUNT", restriction);
        assertEquals(1, dataCount);
    }
    
    /**
     * Updates a specified record. To change the record name, just change old and new values.
     */
    public void test02CascadeUpdateMultiPK() {
        // create the data source for the parent table
        final String mainTableName = "rm";
        final String[] fieldNames = { "bl_id", "fl_id", "rm_id" };
        
        final String oldBlId = "JFK A";
        final String oldFlId = "04";
        final String oldRmId = "001";
        
        final String newBlId = "JFK A";
        final String newFlId = "04";
        final String newRmId = "002";
        final DataSource dSource =
                DataSourceFactory.createDataSourceForFields(mainTableName, fieldNames);
        
        dSource.addRestriction(Restrictions.eq(mainTableName, fieldNames[0], oldBlId));
        dSource.addRestriction(Restrictions.eq(mainTableName, fieldNames[1], oldFlId));
        dSource.addRestriction(Restrictions.eq(mainTableName, fieldNames[2], oldRmId));
        
        final DataRecord fromRecord = dSource.getRecord();
        
        dSource.clearRestrictions();
        
        dSource.addRestriction(Restrictions.eq(mainTableName, fieldNames[0], newBlId));
        dSource.addRestriction(Restrictions.eq(mainTableName, fieldNames[1], newFlId));
        dSource.addRestriction(Restrictions.eq(mainTableName, fieldNames[2], newRmId));
        
        final DataRecord toRecord = dSource.getRecord();
        
        // call the cascade handler to delete children table records
        final CascadeHandlerImpl handler = new CascadeHandlerImpl();
        handler.mergePrimaryKeys(fromRecord, toRecord);
        
        dSource.commit();
        
        Clause blId = Restrictions.eq(mainTableName, fieldNames[0], oldBlId);
        Clause flId = Restrictions.eq(mainTableName, fieldNames[1], oldFlId);
        Clause rmId = Restrictions.eq(mainTableName, fieldNames[2], oldRmId);
        
        Restriction restriction = Restrictions.and(blId, flId, rmId);
        
        int dataCount = DataStatistics.getInt(mainTableName, fieldNames[0], "COUNT", restriction);
        assertEquals(0, dataCount);
        
        blId = Restrictions.eq(mainTableName, fieldNames[0], newBlId);
        flId = Restrictions.eq(mainTableName, fieldNames[1], newFlId);
        rmId = Restrictions.eq(mainTableName, fieldNames[2], newRmId);
        
        restriction = Restrictions.and(blId, flId, rmId);
        
        dataCount = DataStatistics.getInt(mainTableName, fieldNames[0], "COUNT", restriction);
        assertEquals(1, dataCount);
    }
}
