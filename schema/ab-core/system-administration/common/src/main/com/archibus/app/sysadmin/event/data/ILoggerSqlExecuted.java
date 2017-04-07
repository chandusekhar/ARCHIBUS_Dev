package com.archibus.app.sysadmin.event.data;

import java.util.List;

import com.archibus.core.event.data.SqlExecutedEvent;

/**
 * Specialized event listener which is configured to be notified by the core when there is a
 * SqlExecutedEvent.
 * <p>
 * Logs event parameters, if the SQL statement caused data change, and the changed table is in the
 * tablesToLog.
 * 
 * @author Valery Tydykov
 */
interface ILoggerSqlExecuted {
    
    /**
     * Handles SqlExecutedEvent.
     * 
     * @param sqlExecutedEvent the event to respond to.
     * @param tablesToLog table names for which the event needs to be logged.
     */
    void onSqlExecuted(final SqlExecutedEvent sqlExecutedEvent, final List<String> tablesToLog);
}