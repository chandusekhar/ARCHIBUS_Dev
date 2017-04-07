package com.archibus.app.common.connectors.translation.common.inbound;

import java.util.*;
import java.util.Map.Entry;

/**
 * A definition for the interpretation of a type of transaction in the context of a message for the
 * purpose of storage in a database.
 *
 * @author cole
 *
 * @param <ResponseType> the type of the message to be interpreted.
 * @param <ResponseTxType> the type of the transactions to be interpreted.
 * @param <ResponseTxFldDefType> the type of field definition this response definition supports.
 */
// @formatter:off (line length)
public class ResponseTxDef<
ResponseType,
ResponseTxType,
ResponseTxFldDefType extends IResponseTxFieldDef<ResponseTxType>
> {
    // @formatter:on
    /**
     * A unique identifier for this transaction definition.
     */
    private final String id;
    
    /**
     * Whether the transactions this response definition is intended to interpret are independent of
     * previous transactions.
     */
    private final boolean stateless;
    
    /**
     * Whether a second update for a record in the same response is valid.
     */
    private final boolean multipleUpdatesAllowed;
    
    /**
     * A utility for converting a response message into a list of records.
     */
    private final IRecordParser<ResponseType, ResponseTxType> parser;
    
    /**
     * Fields are properties on a transaction, and the foreign field definitions hold information on
     * interpreting them. The order may be significant, and these fields should be extracted in the
     * order specified by the list.
     */
    private final List<ResponseTxFldDefType> responseTxFieldDefs;
    
    /**
     * A list of response transaction definitions for which the most recent record should be saved
     * for that definition's interpretation.
     */
    private final Set<ResponseTxDef<?, ?, ?>> predecessors;
    
    /**
     * A set of ancestral transactions, by their definition's id.
     */
    private final Map<String, Map<String, Object>> ancestralTransactions;
    
    /**
     * The database table storing parsed transactions.
     */
    private final IForeignTxDataTable transactionDataTable;
    
    /**
     * Create a response transaction definition.
     *
     * @param id a unique identifier for this transactino definition.
     * @param transactionDataTable the database storing transactions from the response that have
     *            been converted to database records.
     * @param responseTxFieldDefs fields are properties on a transaction record, and the response
     *            transaction field definitions hold information on interpreting them. The order may
     *            be significant, and these fields should be extracted in the order specified by the
     *            list.
     * @param stateless whether the transactions this response definition is intended to interpret
     *            are independent of previous transactions.
     * @param multipleUpdatesAllowed whether a second update for a record in the same response is
     *            valid.
     * @param parser a utility for converting a response into a list of records.
     */
    public ResponseTxDef(final String id, final IForeignTxDataTable transactionDataTable,
            final List<ResponseTxFldDefType> responseTxFieldDefs, final boolean stateless,
            final boolean multipleUpdatesAllowed,
            final IRecordParser<ResponseType, ResponseTxType> parser) {
        /*
         * Set members.
         */
        this.id = id;
        this.responseTxFieldDefs = Collections.unmodifiableList(responseTxFieldDefs);
        this.transactionDataTable = transactionDataTable;
        this.stateless = stateless;
        this.multipleUpdatesAllowed = multipleUpdatesAllowed;
        this.parser = parser;
        this.predecessors = new HashSet<ResponseTxDef<?, ?, ?>>();
        this.ancestralTransactions = new HashMap<String, Map<String, Object>>();
    }

    /**
     * @return a unique identifier for this response transaction definition.
     */
    public String getId() {
        return this.id;
    }

    /**
     * @return parser for extracting these transactions from a message.
     */
    public IRecordParser<ResponseType, ResponseTxType> getParser() {
        return this.parser;
    }
    
    /**
     * @param transaction the transaction to be handled.
     * @return whether this definition applies to this transaction.
     */
    public boolean handles(final ResponseTxType transaction) {
        return true;
    }
    
    /**
     * Perform processing of source record prior to interpretation.
     *
     * @param sourceRecord the record received.
     * @return the record after processing has occurred.
     */
    public ResponseTxType preProcess(final ResponseTxType sourceRecord) {
        return sourceRecord;
    }
    
    /**
     * @param predecessor the ResponseTxDef that requires data from this transaction's definition.
     */
    public void addPredecessor(final ResponseTxDef<?, ?, ?> predecessor) {
        this.predecessors.add(predecessor);
    }
    
    /**
     * @return ancestral transactions that have been buffered.
     */
    public Map<String, Map<String, Object>> getAncestralTransactions() {
        return this.ancestralTransactions;
    }

    /**
     * If this definition is dependent on an previous transaction, this will enable it to save the
     * previous transaction.
     *
     * @param transaction the transaction after record level rules have been applied.
     */
    public void bufferToChildren(final Map<String, Object> transaction) {
        for (final ResponseTxDef<?, ?, ?> predecessor : this.predecessors) {
            predecessor.buffer(this, transaction);
        }
    }

    /*
     * JUSTIFICATION: the method is used in the method above.
     */
    /**
     * If this definition is dependent on an previous transaction, this will enable it to save the
     * previous transaction.
     *
     * @param ancestralDefinition the transaction definition for the ancestor.
     * @param transaction the ancestral transaction after it has been applied.
     */
    @SuppressWarnings({ "PMD.UnusedPrivateMethod" })
    private void buffer(final ResponseTxDef<?, ?, ?> ancestralDefinition,
            final Map<String, Object> transaction) {
        this.ancestralTransactions.put(ancestralDefinition.getId(), transaction);
    }
    
    /**
     * @return the database table storing parsed transactions.
     */
    public IForeignTxDataTable getTransactionTable() {
        return this.transactionDataTable;
    }
    
    /**
     * Fields are properties on a transaction, and the foreign field definitions hold information on
     * interpreting them. The order may be significant, and these fields should be extracted in the
     * order specified by the list.
     *
     * @return field definitions for interpreting transactions' field values.
     */
    public List<ResponseTxFldDefType> getFieldDefinitions() {
        return this.responseTxFieldDefs;
    }
    
    /**
     * @return true if and only if a second update for a record in the same response is valid.
     */
    public boolean areMultipleUpdatesAllowed() {
        return this.multipleUpdatesAllowed;
    }
    
    /**
     * @return whether the transactions this response definition is intended to interpret are
     *         independent of previous transactions.
     */
    public boolean isStateless() {
        return this.stateless;
    }

    /**
     * Use database values from the translated record to populate the transaction.
     *
     * @param translatedValues the translated record's values.
     * @param transaction the transaction.
     */
    public void populateDbValues(final Map<String, Object> translatedValues,
            final ForeignTxRecord transaction) {
        for (final Entry<String, Object> entry : translatedValues.entrySet()) {
            transaction.putField(entry.getKey(), entry.getValue());
        }
    }
}