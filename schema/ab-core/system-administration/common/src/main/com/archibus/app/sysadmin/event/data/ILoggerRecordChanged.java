package com.archibus.app.sysadmin.event.data;

import java.util.List;

import com.archibus.core.event.data.RecordChangedEvent;

/**
 * Interface to be implemented by classes that need to be notified by the core when there is a
 * RecordChangedEvent.
 * <p>
 * Specifies specialized event listener.
 * <p>
 * Logs event parameters, if the changed table is in the tablesToLog.
 * 
 * @author Valery Tydykov
 */
interface ILoggerRecordChanged {
    
    /**
     * Handles RecordChangedEvent.
     * 
     * @param recordChangedEvent the event to respond to.
     * @param tablesToLog table names for which the event needs to be logged.
     */
    void onRecordChanged(final RecordChangedEvent recordChangedEvent, final List<String> tablesToLog);
}