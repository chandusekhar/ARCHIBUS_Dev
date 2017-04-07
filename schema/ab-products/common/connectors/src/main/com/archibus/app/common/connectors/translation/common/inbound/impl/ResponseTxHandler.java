package com.archibus.app.common.connectors.translation.common.inbound.impl;

import java.util.*;

import com.archibus.app.common.connectors.exception.DatabaseException;
import com.archibus.app.common.connectors.translation.common.inbound.*;
import com.archibus.app.common.connectors.translation.common.inbound.ForeignTxMetadata.Status;

/**
 * A transaction handler for applying transactions to the ForeignTxDataTable. Transactions are
 * assumed to be handled in the order specified by the message.
 *
 * @author cole
 *
 * @param <ResponseType> the type of message containing transactions.
 * @param <ResponseTxType> the type of transaction that may be parsed from the message.
 * @param <ResponseTxDefType> the type of the definition for interpreting responses.
 */
public class ResponseTxHandler<
/*
 * Disabled formatter, due to resulting line length.
 */
// @formatter:off
ResponseType,
ResponseTxType,
ResponseTxDefType extends ResponseTxDef<
ResponseType,
ResponseTxType,
? extends IResponseTxFieldDef<ResponseTxType>
>
>
implements IRecordHandler<ForeignTxRecord, ForeignTxRecord> {
    // @formatter:on

    /**
     * The response transaction definition to use for translating the response.
     */
    private final ResponseTxDefType responseTxDef;

    /**
     * Create a transaction handler for translating transactions from a response into data record
     * updates using a ResponseTxDef. Transactions are assumed to be handled in the order specified
     * by the message.
     *
     * @param responseTxDef the response definition to use for translating the response.
     */
    public ResponseTxHandler(final ResponseTxDefType responseTxDef) {
        this.responseTxDef = responseTxDef;
    }

    /**
     * Apply the transaction to the current ForeignTxDataTable.
     *
     * @param transactionRecord the transaction to apply.
     * @return the record after the transaction is applied.
     * @throws DatabaseException if the record updated by the foreignTransaction cannot be stored in
     *             the database.
     */
    public ForeignTxRecord handleRecord(final ForeignTxRecord transactionRecord)
            throws DatabaseException {
        checkForKeys(transactionRecord);

        /*
         * If the transaction isn't complete enough to correlate it with existing data, record it as
         * an error. Otherwise, correlate it with existing data.
         */
        if (!transactionRecord.getMetadata().getStatus().equals(Status.ERROR)) {
            mergeWithExisting(transactionRecord);
            /*
             * TODO persist errors!
             */
            this.responseTxDef.getTransactionTable().persist(transactionRecord);
        }

        return transactionRecord;
    }

    /**
     * Record an error in metadata for any missing primary key fields.
     *
     * @param foreignTxRecord the transaction to check for primary key fields.
     */
    private void checkForKeys(final ForeignTxRecord foreignTxRecord) {
        final ForeignTxMetadata metadata = foreignTxRecord.getMetadata();
        final Set<String> requiredPrimaryKeyFields =
                this.responseTxDef.getTransactionTable().getRequiredPrimaryKeyFields();
        final Map<String, Object> presentRequiredPrimaryKeys =
                foreignTxRecord.getFields(requiredPrimaryKeyFields);
        if (presentRequiredPrimaryKeys.size() < requiredPrimaryKeyFields.size()) {
            metadata.setStatus(Status.ERROR);
            for (final String primaryKeyName : requiredPrimaryKeyFields) {
                final Set<String> presentPrimaryKeyNames = presentRequiredPrimaryKeys.keySet();
                if (!presentPrimaryKeyNames.contains(primaryKeyName)) {
                    metadata.getStatusMessage().append("\nMissing primary key value: ")
                        .append(primaryKeyName);
                }
            }
        }
    }

    /**
     * Merge this transaction with other transactions against the same record. Record an error in
     * metadata if this is not permitted.
     *
     * @param foreignTxRecord the transaction to be merged.
     * @return whether a transaction or record existed to merge it with.
     * @throws DatabaseException if there is an error searching for an existing version of
     *             foreignTxRecord
     */
    private ArchibusDataRecord mergeWithExisting(final ForeignTxRecord foreignTxRecord)
            throws DatabaseException {
        final ForeignTxMetadata metadata = foreignTxRecord.getMetadata();
        /*
         * If it shouldn't be skipped, see if it's a duplicate.
         */
        final ArchibusDataRecord duplicate =
                this.responseTxDef.getTransactionTable().lookup(foreignTxRecord,
                    this.responseTxDef.getTransactionTable().getPrimaryKeyFields());
        if (duplicate != null) {
            if (this.responseTxDef.areMultipleUpdatesAllowed()) {
                foreignTxRecord.mergeWithDuplicate(duplicate);
            } else {
                metadata.setStatus(Status.ERROR);
                metadata.getStatusMessage().append("\nDuplicate record at index ")
                    .append(metadata.getTransactionIndex());
            }
        }
        return duplicate;
    }
}