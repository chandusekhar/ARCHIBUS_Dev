package com.archibus.app.common.connectors.translation.common.inbound;

import java.util.Set;

import com.archibus.app.common.connectors.exception.DatabaseException;

/**
 * A mechanism for persisting transactions as database records.
 *
 * @author cole
 */
public interface IForeignTxDataTable {
    
    /**
     * Remove data from the database that should not be persisted across transactions. Exceptions to
     * removal might include exclusions or previously unprocessed records.
     *
     * @throws DatabaseException due to any issues that prevent the data from being removed.
     * @throws DatabaseException if the table may not have been reset.
     */
    void resetTable() throws DatabaseException;
    
    /**
     * Apply the transaction in a persistent way.
     *
     * @param transactionRecord the transaction to apply.
     * @throws DatabaseException if the transaction may not have been applied.
     */
    void persist(final ForeignTxRecord transactionRecord) throws DatabaseException;
    
    /**
     * @param transactionRecord the transaction.
     * @param primaryKeyFields the fields to check for equivalence.
     * @return the ARCHIBUS record the transaction would apply to, or null if it applies to a new
     *         record.
     * @throws DatabaseException if the record could not be looked up (if it was not found, will
     *             return null).
     */
    ArchibusDataRecord lookup(final ForeignTxRecord transactionRecord,
            final Set<String> primaryKeyFields) throws DatabaseException;
    
    /**
     * @return field names for primary key values.
     */
    Set<String> getPrimaryKeyFields();
    
    /**
     * @return field names for primary key values that must be specified (not null, no
     *         default/generated value)
     */
    Set<String> getRequiredPrimaryKeyFields();
}
