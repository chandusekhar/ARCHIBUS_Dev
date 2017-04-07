package com.archibus.app.common.mobile.sync.dao;

import java.util.List;

import com.archibus.app.common.mobile.sync.service.Record;
import com.archibus.core.event.data.RecordChangedEvent;
import com.archibus.utility.ExceptionBase;

/**
 * DAO for operations on the afm_table_trans table.
 *
 * @author Jeff Martin
 * @since 23.1
 *
 */
public interface ITableTransactionDao {

    /**
     * Records the record change event in the TableTransaction datasource.
     *
     * @param recordChangedEvent the event to log
     */
    void recordTransactionEvent(RecordChangedEvent recordChangedEvent);

    /**
     * Retrieves a list of records for the table that have been deleted since the last sync.
     * 
     * @param tableName of table containing the deleted records.
     * @param timestamp of the last sync.
     * @return list of records containing the primary key values of the deleted records.
     * @throws ExceptionBase if the DataSource throws an exception.
     */
    List<Record> retrieveDeletedRecords(final String tableName, final double timestamp)
            throws ExceptionBase;
}
