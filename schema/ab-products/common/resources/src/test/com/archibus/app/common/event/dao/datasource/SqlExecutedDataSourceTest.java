package com.archibus.app.common.event.dao.datasource;

import java.sql.*;

import com.archibus.app.common.event.domain.*;
import com.archibus.core.dao.IDao;
import com.archibus.datasource.DataSourceTestBase;

/**
 * Integration tests for SqlExecutedDataSource.
 * 
 * @author Valery Tydykov
 * 
 */
public class SqlExecutedDataSourceTest extends DataSourceTestBase {
    
    /**
     * Test for {@link SqlExecutedDataSource#save(java.lang.Object)} and
     * {@link SqlExecutedDataSource#get(java.lang.Object)}.
     */
    public void testSaveGet() {
        final IDao<SqlExecuted> dataSource = new SqlExecutedDataSource();
        
        // save new object to database
        final SqlExecuted expected = new SqlExecuted();
        expected.setDate(new Date(1, 2, 3));
        expected.setTime(new Time(4, 5, 6));
        expected.setEventType(EventType.SQL_EXECUTED);
        expected.setTableName("TestTableName");
        expected.setUserName("TestUserName");
        expected.setSql("TestSql");
        
        final SqlExecuted saved = dataSource.save(expected);
        
        // verify that new object can be retrieved from database
        final SqlExecuted actual = dataSource.get(saved.getId());
        
        assertEquals(expected.getTableName(), actual.getTableName());
        assertEquals(expected.getUserName(), actual.getUserName());
        assertEquals(expected.getDate(), actual.getDate());
        assertEquals(expected.getEventType(), actual.getEventType());
        assertEquals(expected.getTime(), actual.getTime());
        assertEquals(expected.getSql(), actual.getSql());
    }
    
    @Override
    protected String[] getConfigLocations() {
        return new String[] { "context\\core\\core-infrastructure.xml", "appContext-test.xml",
                "sqlExecutedDataSource.xml" };
    }
}
