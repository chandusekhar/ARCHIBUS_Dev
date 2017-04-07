package com.archibus.app.common.event.dao.datasource;

import com.archibus.app.common.event.domain.SqlExecuted;
import com.archibus.core.dao.IDao;
import com.archibus.datasource.ObjectDataSourceImpl;

/**
 * DataSource for saving SqlExecuted instances to the afm_data_event_log table.
 * 
 * @author Valery Tydykov
 */
public class SqlExecutedDataSource extends ObjectDataSourceImpl<SqlExecuted> implements
        IDao<SqlExecuted> {
    
    /**
     * Field names to property names mapping. All fields will be added to the DataSource.
     */
    private static final String[][] FIELDS_TO_PROPERTIES = { { Constants.AUTO_NUMBER, "id" },
            { Constants.EVENT_TYPE, "eventType" }, { Constants.USER_NAME, "userName" },
            { Constants.DATE_OCCURRED, "date" }, { Constants.TIME_OCCURRED, "time" },
            { Constants.TABLE_NAME, "tableName" }, { Constants.SQL_STATEMENT, "sql" } };
    
    /**
     * Constructs SqlExecutedDataSource, mapped to <code>afm_data_event_log</code> table, using
     * <code>sqlExecuted</code> bean.
     */
    public SqlExecutedDataSource() {
        super(Constants.SQL_EXECUTED, Constants.AFM_DATA_EVENT_LOG);
    }
    
    @Override
    protected String[][] getFieldsToProperties() {
        return FIELDS_TO_PROPERTIES.clone();
    }
}
