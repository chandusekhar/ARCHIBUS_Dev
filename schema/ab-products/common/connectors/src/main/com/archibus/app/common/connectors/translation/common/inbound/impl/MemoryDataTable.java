package com.archibus.app.common.connectors.translation.common.inbound.impl;

import java.util.*;

import com.archibus.app.common.connectors.exception.DatabaseException;
import com.archibus.app.common.connectors.translation.common.inbound.*;

/**
 * A method for persisting records in memory. These records won't persist past the life of this
 * object, which is in most cases runtime.
 *
 * @author cole
 */
public class MemoryDataTable implements IForeignTxDataTable {
    
    /**
     * The set of records in the table.
     */
    private final Set<ForeignTxRecord> table;
    
    /**
     * A list of field names that are primary keys for records.
     */
    private final Set<String> tablePrimaryKeyFields;
    
    /**
     * Create a cache for persisting records in memory. These records won't persist past the life of
     * this object, which is in most cases runtime.
     *
     * @param primaryKeyFields a list of field names that are primary keys for records.
     */
    public MemoryDataTable(final Set<String> primaryKeyFields) {
        this.table = new HashSet<ForeignTxRecord>();
        this.tablePrimaryKeyFields = Collections.unmodifiableSet(primaryKeyFields);
    }
    
    /**
     * Since this method doesn't support persistent, stateful transactions, it removes all the data
     * from the database.
     *
     * @throws DatabaseException due to any issues that prevent the data from being removed.
     */
    public void resetTable() throws DatabaseException {
        this.table.clear();
    }
    
    /**
     * Save the data records to a java.util.Set.
     *
     * @param dataRecord the data record that should persist.
     */
    public void persist(final ForeignTxRecord dataRecord) {
        this.table.add(dataRecord);
    }
    
    /**
     * @param foreignDatabaseRecord the record that is being tested for being a duplicate.
     * @param primaryKeyFields the fields to check for equivalence.
     * @return the record the given record duplicates or null if there is no duplicate.
     */
    public ForeignTxRecord lookup(final ForeignTxRecord foreignDatabaseRecord,
            final Set<String> primaryKeyFields) {
        ForeignTxRecord matchingRecord = null;
        /*
         * Search for the record.
         */
        for (final ForeignTxRecord existingRecord : this.table) {
            boolean matchFound = true;
            for (final String fieldName : primaryKeyFields) {
                final Object existingValue = existingRecord.getFields().get(fieldName);
                final Object messageValue = foreignDatabaseRecord.getFields().get(fieldName);
                /*
                 * Compare field values.
                 */
                if ((existingValue != null || messageValue != null)
                        && (existingValue == null || !existingValue.equals(messageValue))) {
                    /*
                     * If not equal, next record.
                     */
                    matchFound = false;
                    break;
                }
            }
            if (matchFound) {
                /*
                 * All fields matched.
                 */
                matchingRecord = existingRecord;
                break;
            }
        }
        return matchingRecord;
    }
    
    @Override
    public String toString() {
        return this.table.toString();
    }
    
    @Override
    public Set<String> getPrimaryKeyFields() {
        return this.tablePrimaryKeyFields;
    }
    
    @Override
    public Set<String> getRequiredPrimaryKeyFields() {
        return this.tablePrimaryKeyFields;
    }
}
