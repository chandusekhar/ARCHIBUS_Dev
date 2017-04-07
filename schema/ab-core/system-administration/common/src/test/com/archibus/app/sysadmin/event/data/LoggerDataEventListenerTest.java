package com.archibus.app.sysadmin.event.data;

import java.util.*;

import junit.framework.*;

import org.springframework.context.ApplicationEvent;

import com.archibus.app.common.MockUtilities;
import com.archibus.config.Project;
import com.archibus.core.event.data.*;
import com.archibus.core.event.data.DataEvent.BeforeOrAfter;

/**
 * Tests for LoggerDataEventListener.
 * 
 * @author Valery Tydykov
 * 
 */
public class LoggerDataEventListenerTest extends TestCase {
    
    /**
     * Test method for
     * {@link com.archibus.app.sysadmin.event.data.LoggerDataEventListener#onApplicationEvent(org.springframework.context.ApplicationEvent)}
     * .
     */
    public void testOnApplicationEventRecordChanged() {
        // case 1: event has RecordChangedEvent type, AFTER
        final LoggerDataEventListener loggerDataEventListener = new LoggerDataEventListener();
        
        final Map<String, String> parametersKeyValue = new HashMap<String, String>();
        parametersKeyValue.put(LoggerDataEventListener.DATA_CHANGE_EVENT_TABLES_TO_LOG,
            MockUtilities.TABLE_NAME1 + ";" + MockUtilities.TABLE_NAME2);
        final Project.Immutable project =
                MockUtilities.createMockProject(MockUtilities.createMockActivityManager(null,
                    parametersKeyValue));
        
        loggerDataEventListener.setProject(project);
        
        final ApplicationEvent event =
                new RecordChangedEvent(this, BeforeOrAfter.AFTER, null, null, ChangeType.INSERT,
                    null);
        
        final CallbackFlag callbackFlag = new CallbackFlag();
        
        final ILoggerRecordChanged loggerRecordChanged = new ILoggerRecordChanged() {
            public void onRecordChanged(final RecordChangedEvent recordChangedEvent,
                    final List<String> tablesToLog) {
                Assert.assertSame(event, recordChangedEvent);
                Assert.assertEquals(MockUtilities.TABLE_NAME1, tablesToLog.get(0));
                Assert.assertEquals(MockUtilities.TABLE_NAME2, tablesToLog.get(1));
                
                callbackFlag.called = true;
            }
        };
        
        loggerDataEventListener.setLoggerRecordChanged(loggerRecordChanged);
        // invoke tested method
        loggerDataEventListener.onApplicationEvent(event);
        
        // verify that ILoggerRecordChanged.onRecordChanged was called
        Assert.assertTrue(callbackFlag.called);
    }
    
    /**
     * Test method for
     * {@link com.archibus.app.sysadmin.event.data.LoggerDataEventListener#onApplicationEvent(org.springframework.context.ApplicationEvent)}
     * .
     */
    public void testOnApplicationEventRecordChangedBefore() {
        final LoggerDataEventListener loggerDataEventListener = new LoggerDataEventListener();
        
        {
            final ApplicationEvent event =
                    new RecordChangedEvent(this, BeforeOrAfter.AFTER, null, null,
                        ChangeType.DELETE, null);
            
            loggerDataEventListener.onApplicationEvent(event);
            
            // nothing should happen
        }
        
        {
            final ApplicationEvent event =
                    new RecordChangedEvent(this, BeforeOrAfter.BEFORE, null, null,
                        ChangeType.INSERT, null);
            
            loggerDataEventListener.onApplicationEvent(event);
            
            // nothing should happen
        }
        
        {
            final ApplicationEvent event =
                    new RecordChangedEvent(this, BeforeOrAfter.BEFORE, null, null,
                        ChangeType.UPDATE, null);
            
            loggerDataEventListener.onApplicationEvent(event);
            
            // nothing should happen
        }
    }
    
    /**
     * Test method for
     * {@link com.archibus.app.sysadmin.event.data.LoggerDataEventListener#onApplicationEvent(org.springframework.context.ApplicationEvent)}
     * .
     */
    public void testOnApplicationEventSqlExecuted() {
        // case 1: event has SqlExecuted type, AFTER
        final LoggerDataEventListener loggerDataEventListener = new LoggerDataEventListener();
        
        final Map<String, String> parametersKeyValue = new HashMap<String, String>();
        parametersKeyValue.put(LoggerDataEventListener.DATA_CHANGE_EVENT_TABLES_TO_LOG,
            MockUtilities.TABLE_NAME1 + ";" + MockUtilities.TABLE_NAME2);
        final Project.Immutable project =
                MockUtilities.createMockProject(MockUtilities.createMockActivityManager(null,
                    parametersKeyValue));
        
        loggerDataEventListener.setProject(project);
        
        final SqlExecutedEvent sqlExecutedEvent =
                new SqlExecutedEvent(this, null, BeforeOrAfter.AFTER, MockUtilities.TABLE_NAME1,
                    null);
        
        final CallbackFlag callbackFlag = new CallbackFlag();
        
        final ILoggerSqlExecuted loggerSqlExecuted = new ILoggerSqlExecuted() {
            public void onSqlExecuted(final SqlExecutedEvent recordSqlExecuted,
                    final List<String> tablesToLog) {
                Assert.assertSame(sqlExecutedEvent, recordSqlExecuted);
                Assert.assertEquals(MockUtilities.TABLE_NAME1, tablesToLog.get(0));
                Assert.assertEquals(MockUtilities.TABLE_NAME2, tablesToLog.get(1));
                
                callbackFlag.called = true;
            }
        };
        
        loggerDataEventListener.setLoggerSqlExecuted(loggerSqlExecuted);
        // invoke tested method
        loggerDataEventListener.onApplicationEvent(sqlExecutedEvent);
        
        // verify that ILoggerSqlExecuted.onSqlExecuted was called
        Assert.assertTrue(callbackFlag.called);
    }
    
    /**
     * Test method for
     * {@link com.archibus.app.sysadmin.event.data.LoggerDataEventListener#onApplicationEvent(org.springframework.context.ApplicationEvent)}
     * .
     */
    public void testOnApplicationEventSqlExecutedBefore() {
        final LoggerDataEventListener loggerDataEventListener = new LoggerDataEventListener();
        
        final ApplicationEvent event =
                new SqlExecutedEvent(this, null, BeforeOrAfter.BEFORE, null, null);
        
        loggerDataEventListener.onApplicationEvent(event);
        
        // nothing should happen
    }
    
    /**
     * Test method for
     * {@link com.archibus.app.sysadmin.event.data.LoggerDataEventListener#onApplicationEvent(org.springframework.context.ApplicationEvent)}
     * .
     */
    public void testOnApplicationEventWrongEventType() {
        final LoggerDataEventListener loggerDataEventListener = new LoggerDataEventListener();
        
        final ApplicationEvent event = new RecordsReadDataEvent(this, BeforeOrAfter.AFTER, null);
        
        loggerDataEventListener.onApplicationEvent(event);
        
        // nothing should happen
    }
}
