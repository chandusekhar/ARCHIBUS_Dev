package com.archibus.app.sysadmin.event.data;

import java.util.*;

import junit.framework.*;

import com.archibus.app.common.MockUtilities;
import com.archibus.app.common.event.domain.*;
import com.archibus.context.*;
import com.archibus.core.dao.IDao;
import com.archibus.core.event.data.DataEvent.BeforeOrAfter;
import com.archibus.core.event.data.*;
import com.archibus.model.view.datasource.AbstractRestrictionDef;

/**
 * Tests for LoggerSqlExecuted.
 * 
 * @author Valery Tydykov
 * 
 */
public class LoggerSqlExecutedTest extends TestCase {
    
    private static final String ALTER_TABLE = "ALTER TABLE ";
    
    private static final String DELETE = "DELETE ";
    
    private static final String UPDATE = "UPDATE ";
    
    /**
     * Constant: SQL statement with "tableName1".
     */
    private static final String TEST_SQL = "DELETE FROM " + MockUtilities.TABLE_NAME1;
    
    /**
     * Test method for
     * {@link com.archibus.app.sysadmin.event.data.LoggerSqlExecuted#onSqlExecuted(com.archibus.core.event.data.SqlExecutedEvent, java.lang.String[])}
     * .
     */
    public void testOnSqlExecuted() {
        // prepare parameters for tested method
        // case 1: table name in the SQL statement matches table name in tablesToLog.
        final User user = new User(null);
        user.setName(MockUtilities.TEST_USER_NAME);
        final SqlExecutedEvent sqlExecutedEvent =
                new SqlExecutedEvent(this, user, BeforeOrAfter.AFTER, MockUtilities.TABLE_NAME1,
                    TEST_SQL);
        
        final List<String> tablesToLog = new ArrayList<String>();
        tablesToLog.add(MockUtilities.TABLE_NAME1);
        tablesToLog.add(MockUtilities.TABLE_NAME2);
        
        // create mock context
        ContextStore.set(MockUtilities.createMockContext(true, true));
        
        // create mock DAO
        final CallbackFlag callbackFlag = new CallbackFlag();
        final IDao<SqlExecuted> sqlExecutedDao = new IDao<SqlExecuted>() {
            public void delete(final SqlExecuted bean) {
                // TODO Auto-generated method stub
            }
            
            public List<SqlExecuted> find(final AbstractRestrictionDef restriction) {
                // TODO Auto-generated method stub
                return null;
            }
            
            public SqlExecuted get(final Object id) {
                // TODO Auto-generated method stub
                return null;
            }
            
            public SqlExecuted save(final SqlExecuted bean) {
                // verification: this method should be called
                callbackFlag.called = true;
                
                // verify parameter bean
                Assert.assertEquals(MockUtilities.TEST_USER_NAME, bean.getUserName());
                Assert.assertEquals(TEST_SQL, bean.getSql());
                Assert.assertEquals(EventType.SQL_EXECUTED, bean.getEventType());
                
                Assert.assertEquals(new java.sql.Date(sqlExecutedEvent.getTimestamp()),
                    bean.getDate());
                Assert.assertEquals(new java.sql.Time(sqlExecutedEvent.getTimestamp()),
                    bean.getTime());
                Assert.assertEquals(MockUtilities.TABLE_NAME1, bean.getTableName());
                
                return null;
            }
            
            public void update(final SqlExecuted bean) {
                // TODO Auto-generated method stub
            }
            
            public void update(final SqlExecuted bean, final SqlExecuted oldBean) {
                // TODO Auto-generated method stub
            }
        };
        
        final LoggerSqlExecuted loggerSqlExecuted = new LoggerSqlExecuted();
        loggerSqlExecuted.setSqlExecutedDao(sqlExecutedDao);
        // invoke tested method
        loggerSqlExecuted.onSqlExecuted(sqlExecutedEvent, tablesToLog);
        
        // verify that IDao<SqlExecuted>.save was called
        Assert.assertTrue(callbackFlag.called);
    }
    
    /**
     * Test method for
     * {@link com.archibus.app.sysadmin.event.data.LoggerSqlExecuted#onSqlExecuted(com.archibus.core.event.data.SqlExecutedEvent, java.lang.String[])}
     * .
     */
    public void testOnSqlExecutedWrongTable() {
        // wrong table name: not in the list of tables to log.
        final SqlExecutedEvent sqlExecutedEvent =
                new SqlExecutedEvent(this, null, BeforeOrAfter.AFTER, MockUtilities.TABLE_NAME1,
                    TEST_SQL);
        final List<String> tablesToLog = new ArrayList<String>();
        tablesToLog.add(MockUtilities.TABLE_NAME2);
        
        final LoggerSqlExecuted loggerSqlExecuted = new LoggerSqlExecuted();
        // invoke tested method
        loggerSqlExecuted.onSqlExecuted(sqlExecutedEvent, tablesToLog);
        
        // nothing should happen
    }
    
    /**
     * Test method for
     * {@link com.archibus.app.sysadmin.event.data.LoggerSqlExecuted#onSqlExecuted(com.archibus.core.event.data.SqlExecutedEvent, java.lang.String[])}
     * .
     */
    public void testOnSqlExecutedSqlNull() {
        // SQL is null in the event
        final SqlExecutedEvent sqlExecutedEvent =
                new SqlExecutedEvent(this, null, BeforeOrAfter.AFTER, null, null);
        final LoggerSqlExecuted loggerSqlExecuted = new LoggerSqlExecuted();
        // invoke tested method
        loggerSqlExecuted.onSqlExecuted(sqlExecutedEvent, null);
        
        // nothing should happen
    }
    
    /**
     * Test method for
     * {@link com.archibus.app.sysadmin.event.data.LoggerUtilities#isDataChangeEvent(String)} .
     */
    public void testIsDataChangeEvent() {
        {
            // case 1: SQL contains "INSERT "
            
            final boolean actual = LoggerSqlExecuted.isDataChangeEvent("INSERT ");
            
            Assert.assertEquals(true, actual);
        }
        {
            // case 2: SQL contains "UPDATE "
            
            final boolean actual = LoggerSqlExecuted.isDataChangeEvent(UPDATE);
            
            Assert.assertEquals(true, actual);
        }
        {
            // case 3: SQL contains "DELETE "
            
            final boolean actual = LoggerSqlExecuted.isDataChangeEvent(DELETE);
            
            Assert.assertEquals(true, actual);
        }
        {
            // case 4: SQL does not contain "INSERT " nor "DELETE " nor "UPDATE "
            
            final boolean actual = LoggerSqlExecuted.isDataChangeEvent(ALTER_TABLE);
            
            Assert.assertEquals(false, actual);
        }
    }
}
