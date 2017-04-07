package com.archibus.app.common.event.dao.datasource;

import com.archibus.app.common.event.domain.RecordChanged;
import com.archibus.core.dao.IDao;
import com.archibus.datasource.ObjectDataSourceImpl;

/**
 * DataSource for saving RecordChanged instances to the afm_data_event_log table.
 * 
 * @author Valery Tydykov
 */
public class RecordChangedDataSource extends ObjectDataSourceImpl<RecordChanged> implements
        IDao<RecordChanged> {
    
    /**
     * Field names to property names mapping. All fields will be added to the DataSource.
     */
    private static final String[][] FIELDS_TO_PROPERTIES = { { Constants.AUTO_NUMBER, "id" },
            { Constants.EVENT_TYPE, "eventType" }, { Constants.CHANGE_TYPE, "changeType" },
            { Constants.USER_NAME, "userName" }, { Constants.DATE_OCCURRED, "date" },
            { Constants.TIME_OCCURRED, "time" }, { Constants.TABLE_NAME, "tableName" },
            { Constants.FIELD_LIST, "fields" }, { Constants.VALUES_OLD, "oldValues" },
            { Constants.VALUES_NEW, "newValues" } };
    
    /**
     * Constructs RecordChangedDataSource, mapped to <code>afm_data_event_log</code> table, using
     * <code>recordChanged</code> bean.
     */
    public RecordChangedDataSource() {
        super(Constants.RECORD_CHANGED, Constants.AFM_DATA_EVENT_LOG);
    }
    
    @Override
    protected String[][] getFieldsToProperties() {
        return FIELDS_TO_PROPERTIES.clone();
    }
}
