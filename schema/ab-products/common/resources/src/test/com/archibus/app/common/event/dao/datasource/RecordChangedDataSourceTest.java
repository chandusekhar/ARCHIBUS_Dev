package com.archibus.app.common.event.dao.datasource;

import java.sql.*;

import com.archibus.app.common.event.domain.*;
import com.archibus.core.dao.IDao;
import com.archibus.core.event.data.ChangeType;
import com.archibus.datasource.DataSourceTestBase;

/**
 * Integration tests for RecordChangedDataSource.
 * 
 * @author Valery Tydykov
 * 
 */
public class RecordChangedDataSourceTest extends DataSourceTestBase {
    
    /**
     * Test for {@link RecordChangedDataSource#save(java.lang.Object)} and
     * {@link RecordChangedDataSource#get(java.lang.Object)}.
     */
    public void testSaveGet() {
        final IDao<RecordChanged> dataSource = new RecordChangedDataSource();
        
        // save new object to database
        final RecordChanged expected = new RecordChanged();
        expected.setChangeType(ChangeType.DELETE);
        expected.setDate(new Date(1, 2, 3));
        expected.setTime(new Time(4, 5, 6));
        expected.setEventType(EventType.RECORD_CHANGED);
        expected.setFields("bl_id|fl_id|rm_id|dv_id|dp_id");
        expected.setNewValues("HQ|17|101|EXEC|MNGMT");
        expected.setOldValues("HQ|17|102|EXEC|MNGMT");
        expected.setTableName("TestTableName");
        expected.setUserName("TestUserName");
        
        final RecordChanged saved = dataSource.save(expected);
        
        // verify that new object can be retrieved from database
        final RecordChanged actual = dataSource.get(saved.getId());
        
        assertEquals(expected.getFields(), actual.getFields());
        assertEquals(expected.getNewValues(), actual.getNewValues());
        assertEquals(expected.getOldValues(), actual.getOldValues());
        assertEquals(expected.getTableName(), actual.getTableName());
        assertEquals(expected.getUserName(), actual.getUserName());
        assertEquals(expected.getChangeType(), actual.getChangeType());
        assertEquals(expected.getDate(), actual.getDate());
        assertEquals(expected.getEventType(), actual.getEventType());
        assertEquals(expected.getTime(), actual.getTime());
    }
    
    @Override
    protected String[] getConfigLocations() {
        return new String[] { "context\\core\\core-infrastructure.xml", "appContext-test.xml",
                "recordChangedDataSource.xml" };
    }
}
