package com.archibus.app.sysadmin.event.data;

import java.util.*;

import junit.framework.*;

import com.archibus.app.common.MockUtilities;
import com.archibus.app.common.event.domain.*;
import com.archibus.context.*;
import com.archibus.core.dao.IDao;
import com.archibus.core.event.data.*;
import com.archibus.core.event.data.DataEvent.BeforeOrAfter;
import com.archibus.datasource.data.DataRecord;
import com.archibus.db.ViewField;
import com.archibus.model.view.datasource.AbstractRestrictionDef;

/**
 * Tests for LoggerRecordChanged.
 * 
 * @author Valery Tydykov
 * 
 */
public class LoggerRecordChangedTest extends TestCase {
    private static final String TEST_VALUE1_TEST_VALUE2_DOC_FIELD_CONTENT_TEST_VALUE4_NULL =
            "TestValue1|TestValue2|docFieldContent|TestValue4|null";
    
    private static final String FIELD1_FIELD2_FIELD3_FIELD4_FIELD5 =
            "field1|field2|field3|field4|field5";
    
    /**
     * Constant: String value shorter than 100 characters.
     */
    private static final String SHORTER_THAN100_CHARACTERS_VALUE = "ShorterThan100CharactersValue";
    
    /**
     * Test method for {@link
     * com.archibus.app.sysadmin.event.data.LoggerRecordChanged#onRecordChanged(com.archibus.core.
     * event.data.RecordChangedEvent, List<String>)} .
     */
    public void testOnRecordChanged() {
        // prepare parameters for tested method
        // case 1: table name in the event matches table name in tablesToLog.
        final DataRecord record = new DataRecord();
        
        final User user = new User(null);
        user.setName(MockUtilities.TEST_USER_NAME);
        final RecordChangedEvent recordChangedEvent =
                new RecordChangedEvent(this, BeforeOrAfter.AFTER, user, MockUtilities.TABLE_NAME1,
                    ChangeType.INSERT, record);
        
        final List<String> tablesToLog = new ArrayList<String>();
        tablesToLog.add(MockUtilities.TABLE_NAME1);
        tablesToLog.add(MockUtilities.TABLE_NAME2);
        
        // create mock context
        ContextStore.set(MockUtilities.createMockContext(true, true));
        
        // create mock DAO
        final CallbackFlag callbackFlag = new CallbackFlag();
        final IDao<RecordChanged> recordChangedDao = new IDao<RecordChanged>() {
            public void delete(final RecordChanged bean) {
                // TODO Auto-generated method stub
            }
            
            public List<RecordChanged> find(final AbstractRestrictionDef restriction) {
                // TODO Auto-generated method stub
                return null;
            }
            
            public RecordChanged get(final Object id) {
                // TODO Auto-generated method stub
                return null;
            }
            
            public RecordChanged save(final RecordChanged bean) {
                // verification: this method should be called
                callbackFlag.called = true;
                
                // verify parameter bean
                Assert.assertEquals(MockUtilities.TEST_USER_NAME, bean.getUserName());
                Assert.assertEquals(ChangeType.INSERT, bean.getChangeType());
                Assert.assertEquals(EventType.RECORD_CHANGED, bean.getEventType());
                
                Assert.assertEquals(new java.sql.Date(recordChangedEvent.getTimestamp()),
                    bean.getDate());
                Assert.assertEquals(new java.sql.Time(recordChangedEvent.getTimestamp()),
                    bean.getTime());
                Assert.assertEquals(MockUtilities.TABLE_NAME1, bean.getTableName());
                
                return null;
            }
            
            public void update(final RecordChanged bean) {
                // TODO Auto-generated method stub
            }
            
            public void update(final RecordChanged bean, final RecordChanged oldBean) {
                // TODO Auto-generated method stub
            }
        };
        
        final LoggerRecordChanged loggerRecordChanged = new LoggerRecordChanged();
        loggerRecordChanged.setRecordChangedDao(recordChangedDao);
        // invoke tested method
        loggerRecordChanged.onRecordChanged(recordChangedEvent, tablesToLog);
        
        // verify that IDao<RecordChanged>.save was called
        Assert.assertTrue(callbackFlag.called);
    }
    
    /**
     * Test method for {@link
     * com.archibus.app.sysadmin.event.data.LoggerRecordChanged#onRecordChanged(com.archibus.core.
     * event.data.RecordChangedEvent, List<String>)} .
     */
    public void testOnRecordChangedWrongTable() {
        // wrong table name: not in the list of tables to log.
        final RecordChangedEvent recordChangedEvent =
                new RecordChangedEvent(this, BeforeOrAfter.AFTER, null, MockUtilities.TABLE_NAME1,
                    ChangeType.INSERT, null);
        final List<String> tablesToLog = new ArrayList<String>();
        tablesToLog.add(MockUtilities.TABLE_NAME2);
        
        final LoggerRecordChanged loggerRecordChanged = new LoggerRecordChanged();
        // invoke tested method
        loggerRecordChanged.onRecordChanged(recordChangedEvent, tablesToLog);
        
        // nothing should happen
    }
    
    /**
     * Test method for
     * {@link com.archibus.app.sysadmin.event.data.LoggerUtilities#getFirst100Characters(java.lang.String)}
     * .
     */
    public void testGetFirst100Characters() {
        {
            // case 1: Shorter Than 100 Characters Value
            final String actual =
                    LoggerRecordChanged.getFirst100Characters(SHORTER_THAN100_CHARACTERS_VALUE);
            
            Assert.assertEquals(SHORTER_THAN100_CHARACTERS_VALUE, actual);
        }
        
        {
            // case 2: Longer Than 100 Characters Value
            final String expected =
                    "0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789";
            
            final String actual =
                    LoggerRecordChanged.getFirst100Characters(expected + "Extra characters");
            
            Assert.assertEquals(expected, actual);
        }
        
        {
            // case 3: null
            final String actual = LoggerRecordChanged.getFirst100Characters(null);
            
            Assert.assertEquals(null, actual);
        }
    }
    
    /**
     * Test method for
     * {@link com.archibus.app.sysadmin.event.data.LoggerUtilities#populateFieldsAndValues(com.archibus.core.event.data.RecordChangedEvent, com.archibus.app.common.event.domain.RecordChanged)}
     * .
     */
    public void testPopulateFieldsAndValues() {
        final DataRecord record = new DataRecord();
        
        // add field1
        {
            final String fieldFullName = "field1";
            final ViewField.Immutable viewField =
                    MockUtilities.createMockViewField(fieldFullName, false, false);
            
            record.addField(viewField);
            record.setValue(fieldFullName, "TestValue1");
            
            record.setOldValue(fieldFullName, "TestOldValue1");
        }
        
        // add field2
        {
            final String fieldFullName = "field2";
            final ViewField.Immutable viewField =
                    MockUtilities.createMockViewField(fieldFullName, false, false);
            
            record.addField(viewField);
            record.setValue(fieldFullName, "TestValue2");
            
            record.setOldValue(fieldFullName, "TestOldValue2");
        }
        
        // add field3 - document field
        {
            final String fieldFullName = "field3";
            final ViewField.Immutable viewField =
                    MockUtilities.createMockViewField(fieldFullName, true, false);
            
            record.addField(viewField);
            record.setValue(fieldFullName, "TestValue3");
            
            record.setOldValue(fieldFullName, "TestOldValue3");
        }
        
        // add field4 - memo field
        {
            final String fieldFullName = "field4";
            final ViewField.Immutable viewField =
                    MockUtilities.createMockViewField(fieldFullName, false, true);
            
            record.addField(viewField);
            record.setValue(fieldFullName, "TestValue4");
            
            record.setOldValue(fieldFullName, "TestOldValue4");
        }
        
        // add field5 - memo field with null value
        {
            final String fieldFullName = "field5";
            final ViewField.Immutable viewField =
                    MockUtilities.createMockViewField(fieldFullName, false, true);
            
            record.addField(viewField);
            record.setValue(fieldFullName, null);
            
            record.setOldValue(fieldFullName, null);
        }
        
        {
            // ChangeType.UPDATE, old values are not nulls
            final RecordChangedEvent recordChangedEvent =
                    new RecordChangedEvent(this, null, null, null, ChangeType.UPDATE, record);
            
            final RecordChanged recordChanged = new RecordChanged();
            
            LoggerRecordChanged.populateFieldsAndValues(recordChangedEvent, recordChanged);
            
            Assert.assertEquals(TEST_VALUE1_TEST_VALUE2_DOC_FIELD_CONTENT_TEST_VALUE4_NULL,
                recordChanged.getNewValues());
            Assert.assertEquals("TestOldValue1|TestOldValue2|docFieldContent|TestOldValue4|null",
                recordChanged.getOldValues());
            Assert.assertEquals(FIELD1_FIELD2_FIELD3_FIELD4_FIELD5, recordChanged.getFields());
        }
        
        {
            // ChangeType.DELETE, old values are not nulls
            final RecordChangedEvent recordChangedEvent =
                    new RecordChangedEvent(this, null, null, null, ChangeType.DELETE, record);
            
            final RecordChanged recordChanged = new RecordChanged();
            
            LoggerRecordChanged.populateFieldsAndValues(recordChangedEvent, recordChanged);
            
            Assert.assertEquals(TEST_VALUE1_TEST_VALUE2_DOC_FIELD_CONTENT_TEST_VALUE4_NULL,
                recordChanged.getNewValues());
            Assert.assertEquals("", recordChanged.getOldValues());
            Assert.assertEquals(FIELD1_FIELD2_FIELD3_FIELD4_FIELD5, recordChanged.getFields());
        }
        
        {
            // ChangeType.UPDATE, old values are all nulls
            final RecordChangedEvent recordChangedEvent =
                    new RecordChangedEvent(this, null, null, null, ChangeType.UPDATE, record);
            
            // set all old values to null
            record.setOldValue("field1", null);
            record.setOldValue("field2", null);
            record.setOldValue("field3", null);
            record.setOldValue("field4", null);
            record.setOldValue("field5", null);
            
            final RecordChanged recordChanged = new RecordChanged();
            
            LoggerRecordChanged.populateFieldsAndValues(recordChangedEvent, recordChanged);
            
            Assert.assertEquals(TEST_VALUE1_TEST_VALUE2_DOC_FIELD_CONTENT_TEST_VALUE4_NULL,
                recordChanged.getNewValues());
            Assert.assertEquals("", recordChanged.getOldValues());
            Assert.assertEquals(FIELD1_FIELD2_FIELD3_FIELD4_FIELD5, recordChanged.getFields());
        }
    }
}
