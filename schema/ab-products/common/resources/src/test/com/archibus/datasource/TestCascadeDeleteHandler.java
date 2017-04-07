package com.archibus.datasource;

import java.util.*;

import com.archibus.context.ContextStore;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.datasource.restriction.Restrictions.Restriction;
import com.archibus.datasource.restriction.Restrictions.Restriction.Clause;

/**
 * Unit test for Cascade Delete Handler.
 */
public class TestCascadeDeleteHandler extends DataSourceTestBase {

    /**
     * Constant.
     */
    private static final String COUNT = "COUNT";

    /**
     *
     * Delete from orphan table.
     */
    public void test01CascadeDeleteFromOrphanTable() {

        final List<String> sqlAddObjects = new ArrayList<String>();
        sqlAddObjects.add("insert into afm_tbls(table_name) values('mytable')");
        sqlAddObjects
            .add("insert into afm_flds(table_name, field_name, data_type, afm_size, primary_key) "
                    + "values('mytable', 'id', 1, 10, 1)");
        sqlAddObjects
            .add("insert into afm_flds(table_name, field_name, data_type, afm_size, primary_key) "
                    + "values('mytable', 'name', 1, 10, 0)");
        sqlAddObjects.add("create table mytable(id char(10), name char(10))");
        sqlAddObjects.add("alter table mytable add constraint mytable_pk primary key (id)");
        sqlAddObjects.add("insert into mytable(id, name) values('121', 'name')");

        for (final String query : sqlAddObjects) {
            SqlUtils.executeUpdate("afm_flds", query);
        }

        ContextStore.get().getProject().clearCachedTableDefs();

        final String mainTableName = "mytable";
        final String[] fieldNames = { "id" };
        final DataSource dSource =
                DataSourceFactory.createDataSourceForFields(mainTableName, fieldNames);
        dSource.addRestriction(Restrictions.eq(mainTableName, fieldNames[0], "121"));

        // insert the parent record
        final DataRecord record = dSource.getRecord();

        // call the cascade handler to delete children table records
        final CascadeHandler handler = new CascadeHandlerImpl();

        handler.cascadeDelete(record);

        // commit all changes
        dSource.commit();

        final Restriction restriction = Restrictions.sql("id = '121'");
        final int parentCount = DataStatistics.getInt("mytable", "id", COUNT, restriction);
        assertEquals(0, parentCount);

        final List<String> sqlClearObjects = new ArrayList<String>();
        sqlClearObjects.add("delete from afm_flds where table_name='mytable'");
        sqlClearObjects.add("delete from afm_tbls where table_name='mytable'");
        sqlClearObjects.add("drop table mytable");

        for (final String query : sqlClearObjects) {
            SqlUtils.executeUpdate("afm_flds", query);
        }
    }

    /**
     *
     * tests cascade delete from a table with foreign keys references only.
     */
    public void test02CascadeDeleteFK() {

        final String sql =
                "INSERT into port(port_id,port_std,description,fl_id,bl_id,rm_id,rack_id,tc_level) values('00001', 'AUI-PORT-A', 'description', '17', 'HQ', '129', '1', '100-WA')";

        SqlUtils.executeUpdate("port", sql);
        SqlUtils.commit();

        // create the data source for the parent table
        final String mainTableName = "port";
        final String[] fieldNames = { "port_id" };
        final DataSource dSource =
                DataSourceFactory.createDataSourceForFields(mainTableName, fieldNames);
        dSource.addRestriction(Restrictions.eq(mainTableName, fieldNames[0], "00001"));

        final DataRecord record = dSource.getRecord();

        // call the cascade handler to delete children table records
        final CascadeHandler handler = new CascadeHandlerImpl();
        handler.cascadeDelete(record);

        // commit all changes
        dSource.commit();

        final Restriction restriction = Restrictions.sql("port_id = '00001'");
        final int childrenCount = DataStatistics.getInt("port", "port_id", COUNT, restriction);
        assertEquals(0, childrenCount);
    }

    /**
     *
     * Delete from a table with multiple primary key dependents.
     */
    public void test03CascadeDeleteMultiPK() {
        // create the data source for the parent table
        final String mainTableName = "rm";
        final String[] fieldNames = { "bl_id", "fl_id", "rm_id" };
        final String blValue = "HQ";
        final String flValue = "01";
        final String rmValue = "105";
        final DataSource dSource =
                DataSourceFactory.createDataSourceForFields(mainTableName, fieldNames);

        final Clause blClause = Restrictions.eq(mainTableName, fieldNames[0], blValue);
        final Clause flClause = Restrictions.eq(mainTableName, fieldNames[1], flValue);
        final Clause rmClause = Restrictions.eq(mainTableName, fieldNames[2], rmValue);

        final Restriction restriction = Restrictions.and(blClause, flClause, rmClause);

        dSource.addRestriction(restriction);

        // insert the parent record
        final DataRecord record = dSource.getRecord();

        // call the cascade handler to delete children table records
        final CascadeHandler handler = new CascadeHandlerImpl();
        handler.cascadeDelete(record);

        // commit all changes
        dSource.commit();

        final int dataCount =
                DataStatistics.getInt(mainTableName, fieldNames[0], COUNT, restriction);
        assertEquals(0, dataCount);
    }

    /**
     *
     * Delete from a table with single primary key dependents.
     */
    public void test04CascadeDeleteSinglePK() {
        // create the data source for the parent table
        final String mainTableName = "pmp";
        final String[] fieldNames = { "pmp_id" };
        final String pKValue = "AHU-3-MONTH";
        final DataSource dSource =
                DataSourceFactory.createDataSourceForFields(mainTableName, fieldNames);
        dSource.addRestriction(Restrictions.eq(mainTableName, fieldNames[0], pKValue));

        // insert the parent record
        final DataRecord record = dSource.getRecord();

        // call the cascade handler to delete children table records
        final CascadeHandler handler = new CascadeHandlerImpl();
        handler.cascadeDelete(record);

        // commit all changes
        dSource.commit();

        // verify that the parent record doesn't exist
        final Clause restriction = Restrictions.eq(mainTableName, fieldNames[0], pKValue);
        final int dataCount =
                DataStatistics.getInt(mainTableName, fieldNames[0], COUNT, restriction);
        assertEquals(0, dataCount);
    }

    /**
     *
     * Delete from a table with single primary key dependents.
     */
    public void test05CascadeDeleteSinglePK() {
        // create the data source for the parent table
        final String mainTableName = "dp";
        final String[] fieldNames = { "dv_id", "dp_id" };
        final String pKDvId = "ACCESSORIES";
        final String pKDpId = "DISTRIBUTION";
        final DataSource dSource =
                DataSourceFactory.createDataSourceForFields(mainTableName, fieldNames);
        dSource.addRestriction(Restrictions.eq(mainTableName, fieldNames[0], pKDvId));
        dSource.addRestriction(Restrictions.eq(mainTableName, fieldNames[1], pKDpId));

        // insert the parent record
        final DataRecord record = dSource.getRecord();

        // call the cascade handler to delete children table records
        final CascadeHandler handler = new CascadeHandlerImpl();
        handler.cascadeDelete(record);

        // commit all changes
        dSource.commit();

        // verify that the parent record doesn't exist
        final Clause clause1 = Restrictions.eq(mainTableName, fieldNames[0], pKDvId);
        final Clause clause2 = Restrictions.eq(mainTableName, fieldNames[1], pKDpId);
        final Restriction restriction = Restrictions.and(clause1, clause2);
        final int dataCount =
                DataStatistics.getInt(mainTableName, fieldNames[0], COUNT, restriction);
        assertEquals(0, dataCount);
    }

    /**
     *
     * Delete from a table with single primary key dependents.
     */
    public void test06CascadeDeleteSinglePK() {
        // create the data source for the parent table
        final String mainTableName = "bl";
        final String[] fieldNames = { "bl_id" };
        final String pkValue = "HQ";
        final DataSource dSource =
                DataSourceFactory.createDataSourceForFields(mainTableName, fieldNames);
        dSource.addRestriction(Restrictions.eq(mainTableName, fieldNames[0], pkValue));

        // insert the parent record
        final DataRecord record = dSource.getRecord();

        // call the cascade handler to delete children table records
        final CascadeHandler handler = new CascadeHandlerImpl();
        handler.cascadeDelete(record);
        // commit all changes
        dSource.commit();

        Clause restriction = Restrictions.eq(mainTableName, fieldNames[0], pkValue);
        int dataCount = DataStatistics.getInt(mainTableName, fieldNames[0], COUNT, restriction);
        assertEquals(0, dataCount);

        // check floors
        restriction = Restrictions.eq("fl", fieldNames[0], pkValue);
        dataCount = DataStatistics.getInt("fl", fieldNames[0], COUNT, restriction);
        assertEquals(0, dataCount);

        // check documents
        final Clause doc1 = Restrictions.eq("afm_docs", "table_name", mainTableName);
        final Clause doc2 = Restrictions.eq("afm_docs", "field_name", fieldNames[0]);
        final Clause doc3 = Restrictions.eq("afm_docs", "pkey_value", pkValue);
        final Restriction docRestriction = Restrictions.and(doc1, doc2, doc3);
        dataCount = DataStatistics.getInt("afm_docs", "table_name", COUNT, docRestriction);
        assertEquals(0, dataCount);
    }

    @Override
    protected String[] getConfigLocations() {
        return new String[] { "/context/core/core-infrastructure.xml",
                "/context/core/core-optional.xml", "/context/reports/docx/reports-docx.xml",
                "/context/controls/drawing/controls-drawing.xml", "appContext-test.xml" };
    }
}
