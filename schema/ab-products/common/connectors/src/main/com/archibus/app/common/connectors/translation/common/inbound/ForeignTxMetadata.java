package com.archibus.app.common.connectors.translation.common.inbound;

import java.util.*;

import com.archibus.app.common.connectors.translation.common.outbound.IRequestTemplate;

/**
 * Data describing transactions received from foreign systems.
 *
 * @author cole
 */
public class ForeignTxMetadata {
    /**
     * A set of statuses for foreign transactions.
     *
     * @author cole
     *
     */
    public enum Status {
        /**
         * Indicates the transaction has been received, this is the default.
         */
        RECEIVED,
        /**
         * Indicates the transaction has been processed successfully.
         */
        PROCESSED,
        /**
         * Indicates the transaction has been processed unsuccessfully.
         */
        ERROR,
        /**
         * Indicates the transaction should not be processed.
         */
        EXCLUDED,
        /**
         * Indicates the transaction requires review before being processed.
         */
        REVIEW
    }
    
    /**
     * The time at which a foreign message was received that contained this transaction.
     */
    private final Date receiptTime;
    
    /**
     * The template for the request made to retrieve this transaction.
     */
    private final IRequestTemplate<?> requestTemplate;
    
    /**
     * Parameters used to construct the request made to retrieve this transaction.
     */
    private final Map<String, Object> requestParameters;
    
    /**
     * The order in which this transaction is to be applied.
     */
    private final long transactionIndex;
    
    /**
     * The fields that were not translated successfully.
     */
    private final Set<String> fieldsInError = new HashSet<String>();
    
    /**
     * The fields whose values (or lack thereof) indicate that an update is not required.
     */
    private final Set<String> fieldsNotUpdated = new HashSet<String>();
    
    /**
     * The status of this transaction.
     */
    private Status status = Status.RECEIVED;
    
    /**
     * A message explaining the status of this transaction. Primarily used for review or error.
     */
    private final StringBuilder statusMessage = new StringBuilder();

    /**
     * Methods to determine new field values based on foreign and local values.
     */
    private final Map<String, IAggregateFunction> aggregateFunctions;
    
    /**
     * Create request metadata with identifying information.
     *
     * @param receiptTime the time at which a foreign message was received that contained this
     *            transaction.
     * @param requestTemplate the template for the request made to retrieve this transaction.
     * @param requestParameters parameters used to construct the request made to retrieve this
     *            transaction.
     * @param transactionIndex the order in which this transaction was received during a
     *            transaction.
     * @param aggregateFunctions methods to determine new field values based on foreign and local
     *            values.
     */
    public ForeignTxMetadata(final Date receiptTime, final IRequestTemplate<?> requestTemplate,
            final Map<String, Object> requestParameters, final long transactionIndex,
            final Map<String, IAggregateFunction> aggregateFunctions) {
        this.receiptTime = receiptTime;
        this.requestTemplate = requestTemplate;
        this.requestParameters = requestParameters;
        this.transactionIndex = transactionIndex;
        this.aggregateFunctions = Collections.unmodifiableMap(aggregateFunctions);
    }
    
    /**
     * @return the time at which a foreign message was received that contained this transaction.
     */
    public Date getReceiptTime() {
        return this.receiptTime;
    }
    
    /**
     * @return the template for the request made to retrieve this transaction.
     */
    public IRequestTemplate<?> getRequestTemplate() {
        return this.requestTemplate;
    }
    
    /**
     * @return parameters used to construct the request made to retrieve this transaction.
     */
    public Map<String, Object> getRequestParameters() {
        return this.requestParameters;
    }
    
    /**
     * @return the order in which this transaction was received during a transaction.
     */
    public long getTransactionIndex() {
        return this.transactionIndex;
    }
    
    /**
     * @return the fields that were not translated successfully.
     */
    public Set<String> getFieldsInError() {
        return this.fieldsInError;
    }
    
    /**
     * @return the fields whose values (or lack thereof) indicate that an update is not required.
     */
    public Set<String> getFieldsNotUpdated() {
        return this.fieldsNotUpdated;
    }
    
    /**
     * @return the status of this transaction.
     */
    public Status getStatus() {
        return this.status;
    }
    
    /**
     * @param status the new status of this transaction.
     */
    public void setStatus(final Status status) {
        this.status = status;
    }
    
    /**
     * @return a builder for the message explaining the status of this transaction. Primarily used
     *         for review or error.
     */
    public StringBuilder getStatusMessage() {
        return this.statusMessage;
    }

    /**
     * @return methods to determine new field values based on foreign and local values, by field
     *         name.
     */
    public Map<String, IAggregateFunction> getAggregateFunctions() {
        return this.aggregateFunctions;
    }
}
