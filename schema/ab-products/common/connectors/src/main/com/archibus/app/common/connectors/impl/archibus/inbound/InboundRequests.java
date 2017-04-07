package com.archibus.app.common.connectors.impl.archibus.inbound;

import java.util.*;

import com.archibus.app.common.connectors.AbstractRequests;
import com.archibus.app.common.connectors.exception.*;
import com.archibus.app.common.connectors.logging.IUserLog;
import com.archibus.app.common.connectors.transfer.IAdaptor;
import com.archibus.app.common.connectors.translation.common.inbound.*;
import com.archibus.app.common.connectors.translation.common.inbound.ForeignTxMetadata.Status;
import com.archibus.app.common.connectors.translation.common.inbound.impl.ResponseTxHandler;
import com.archibus.app.common.connectors.translation.common.outbound.*;
import com.archibus.app.common.connectors.translation.exception.TranslationException;

/**
 * Requests to provide foreign data to ARCHIBUS.
 *
 * @author cole
 *
 * @param <RequestType> the type of request message sent to the adaptor.
 * @param <ResponseType> the type of response message received from the adaptor.
 * @param <ResponseTxType> the type of transaction records to be extracted from the response from
 *            the adaptor.
 * @param <ResponseTxDefType> the type of record definition to be used to extract and translate
 *            transactions from the message.
 */
public class InboundRequests<
/*
 * Disabled formatter, due to resulting line length.
 */
// @formatter:off
    RequestType,
    ResponseType,
    ResponseTxType,
    ResponseTxDefType extends ArchibusResponseTxDef<
        ResponseType,
        ResponseTxType,
        ? extends AbstractArchibusResponseFieldDefinition<ResponseTxType>
        >
    >
extends
AbstractRequests<RequestType, ResponseType, ResponseTxType, ResponseTxDefType> {
    // @formatter:on

    /**
     * The interval at which the number of inbound transactions processed is logged.
     */
    private static final int TRANSACTION_LOG_INTERVAL = 1000;

    /**
     * A prefix for when a transaction is skipped for having errors.
     */
    private static final String ERROR_SKIPPING_PREFIX = "Error, skipping transaction [";

    /**
     * A suffix for error messages, separating the error message from the description.
     */
    private static final String ERROR_MESSAGE_SUFFIX = "]: ";

    /**
     * The number of records processed.
     */
    private long recordsProcessed;

    /**
     * Log for progress updates.
     */
    private final IUserLog log;

    /**
     * Define a series of requests to a foreign system which result in ARCHIBUS receiving data.
     *
     * @param stepName a descriptive name for this step.
     * @param templateParameters a set of static field values for use in each request in sequence.
     * @param requestDef translates database field values to foreign field values for the requests.
     * @param requestTemplate constructs a request using foreign field values.
     * @param adaptor sends the requests.
     * @param responseTxDefs translates foreign field values to database field values for the
     *            response.
     * @param log a user visible log for connector progress.
     */
    public InboundRequests(final String stepName,
            final List<? extends Map<String, Object>> templateParameters,
            final IRequestDef requestDef, final IRequestTemplate<RequestType> requestTemplate,
            final IAdaptor<RequestType, ResponseType> adaptor,
            final List<ResponseTxDefType> responseTxDefs, final IUserLog log) {
        super(stepName, templateParameters, requestDef, requestTemplate, adaptor, responseTxDefs);
        this.log = log;
    }

    @Override
    public Void execute(final Map<String, Object> previousResults) throws StepException {
        super.execute(previousResults);
        this.log.writeMessage("Total Records Processed: [" + this.recordsProcessed + ']');
        return null;
    }

    @Override
    protected IRecordHandler<ResponseTxType, List<ForeignTxRecord>> getTxRecordHandler(
            final List<ResponseTxDefType> rspRecDefs, final Map<String, Object> requestParameters,
            final Date responseTime) {
        return new InboundTxHandler(rspRecDefs, requestParameters, responseTime);
    }

    /**
     * A record handler for inbound transactions that processes connector rules and logs status.
     *
     * @author cole
     *
     */
    private final class InboundTxHandler implements
            IRecordHandler<ResponseTxType, List<ForeignTxRecord>> {

        /**
         * A handler for updating records in the ARCHIBUS database.
         */
        private final Map<ResponseTxDefType, IRecordHandler<ForeignTxRecord, ForeignTxRecord>> updateHandlers;
        
        /**
         * Response transaction record definition which describes how to interpret the transaction.
         */
        private final List<ResponseTxDefType> rspTxRecDefs;

        /**
         * Index for the current record for the current transaction definition.
         */
        private final Map<ResponseTxDefType, Integer> txDefRecordsMatched;

        /**
         * Parameters used to make the request to the adaptor.
         */
        private final Map<String, Object> requestParameters;

        /**
         * The time at which the response was received.
         */
        private final Date responseTime;

        /**
         * @param requestParameters parameters used to make the request to the adaptor.
         * @param rspTxRecDefs response transaction record definition which describes how to
         *            interpret the transaction.
         * @param responseTime the time at which the response was received.
         */
        public InboundTxHandler(final List<ResponseTxDefType> rspTxRecDefs,
                final Map<String, Object> requestParameters, final Date responseTime) {
            this.rspTxRecDefs = Collections.unmodifiableList(rspTxRecDefs);
            this.requestParameters = requestParameters;
            this.responseTime = responseTime;
            this.updateHandlers =
                    new HashMap<ResponseTxDefType, IRecordHandler<ForeignTxRecord, ForeignTxRecord>>();
            this.txDefRecordsMatched = new HashMap<ResponseTxDefType, Integer>();
            for (final ResponseTxDefType rspTxRecDef : this.rspTxRecDefs) {
                this.updateHandlers.put(rspTxRecDef,
                    new ResponseTxHandler<ResponseType, ResponseTxType, ResponseTxDefType>(
                        rspTxRecDef));
                this.txDefRecordsMatched.put(rspTxRecDef, 0);
            }
        }

        /**
         * @param responseTransaction the message from the foreign system.
         * @return a record representing this message and any errors that occurred.
         * @throws StepException when there is an error extracting, translating
         *             (TranslationException) or storing a value (DatabaseException).
         */
        @Override
        public List<ForeignTxRecord> handleRecord(final ResponseTxType responseTransaction)
                throws StepException {
            final List<ForeignTxRecord> foreignTxRecords = new ArrayList<ForeignTxRecord>();
            final long currentRecordIndex = ++InboundRequests.this.recordsProcessed;
            if (currentRecordIndex % TRANSACTION_LOG_INTERVAL == 0) {
                InboundRequests.this.log.writeMessage("Records Processed: [" + currentRecordIndex
                        + ']');
            }
            for (final ResponseTxDefType rspTxRecDef : this.rspTxRecDefs) {
                if (rspTxRecDef.handles(responseTransaction)) {
                    final int currRecordIx = this.txDefRecordsMatched.get(rspTxRecDef) + 1;
                    this.txDefRecordsMatched.put(rspTxRecDef, currRecordIx);
                    foreignTxRecords.addAll(handleTxType(
                        rspTxRecDef.preProcess(responseTransaction), rspTxRecDef, currRecordIx));
                }
            }
            return foreignTxRecords;
        }
        
        /**
         * Handle a type of transaction.
         *
         * @param responseTransaction the message from the foreign system.
         * @param rspTxRecDef a definition of a transaction used to interpret it.
         * @param currRecordIx the order in which this transaction occurred in the response.
         * @return a record representing this message and any errors that occurred.
         * @throws StepException when there is an error extracting, translating
         *             (TranslationException) or storing a value (DatabaseException).
         */
        private List<ForeignTxRecord> handleTxType(final ResponseTxType responseTransaction,
                final ResponseTxDefType rspTxRecDef, final long currRecordIx) throws StepException {
            ForeignTxRecord foreignTxRecord = null;
            /*
             * Extract values from transaction record and apply field rules.
             */
            final Map<String, Object> extractedValues =
                    InboundRequests.this.extractValues(responseTransaction, rspTxRecDef);

            Map<String, Object> translatedValues;
            String error = null;
            try {
                /*
                 * Apply field level rules.
                 */
                final Map<String, Object> translatedFieldValues =
                        rspTxRecDef.applyFieldRules(extractedValues);

                /*
                 * Apply record level rules.
                 */
                translatedValues =
                        rspTxRecDef.applyRecordRules(translatedFieldValues,
                            rspTxRecDef.getAncestralTransactions());
            } catch (final TranslationException e) {
                error =
                        "Error translating transaction [" + rspTxRecDef.getId() + ':'
                                + currRecordIx + ERROR_MESSAGE_SUFFIX
                                + ExceptionUtil.getExceptionBaseMessage(e);
                translatedValues = extractedValues;
            }

            final List<ForeignTxRecord> foreignTransactions = new ArrayList<ForeignTxRecord>();
            for (final Map<String, Object> translatedInstance : rspTxRecDef
                .segregateRecords(translatedValues)) {
                /*
                 * Create database record.
                 */
                foreignTxRecord =
                        new ForeignTxRecord(new ForeignTxMetadata(this.responseTime,
                            InboundRequests.this.requestTemplate, this.requestParameters,
                            currRecordIx, rspTxRecDef.getAggregateFunctions()));
                foreignTransactions.add(foreignTxRecord);

                String reason = null;
                /*
                 * Test skip condition rules.
                 */
                reason = rspTxRecDef.shouldSkip(translatedInstance);
                if (reason == null && error == null) {
                    handleTx(translatedInstance, rspTxRecDef, foreignTxRecord, currRecordIx);
                } else if (reason == null) {
                    /*
                     * there was an error and no known reason to skip.
                     */
                    InboundRequests.this.log.writeMessage(error);
                } else {
                    /*
                     * there was a reason to skip, so disregard error.
                     */
                    InboundRequests.this.log.writeMessage("Skipping [" + rspTxRecDef.getId() + ':'
                            + currRecordIx + ERROR_MESSAGE_SUFFIX + reason);
                }
            }
            return foreignTransactions;
        }
        
        /**
         * Handle a single transaction.
         *
         * @param transactionParameters the parameters for the transaction.
         * @param rspTxRecDef the definition for the transaction.
         * @param foreignTxRecord the transaction.
         * @param currRecordIx the current index.
         * @throws StepException when there is an error extracting, translating
         *             (TranslationException) or storing a value (DatabaseException).
         */
        private void handleTx(final Map<String, Object> transactionParameters,
                final ResponseTxDefType rspTxRecDef, final ForeignTxRecord foreignTxRecord,
                final long currRecordIx) throws StepException {
            try {
                /*
                 * Apply side effect rules before.
                 */
                rspTxRecDef.applySideEffects(Collections.unmodifiableMap(transactionParameters));
                /*
                 * Update record in database.
                 */
                rspTxRecDef.populateDbValues(transactionParameters, foreignTxRecord);
                this.updateHandlers.get(rspTxRecDef).handleRecord(foreignTxRecord);
                if (foreignTxRecord.getMetadata().getStatus() == Status.ERROR) {
                    InboundRequests.this.log.writeMessage(ERROR_SKIPPING_PREFIX
                            + rspTxRecDef.getId() + ':' + currRecordIx + ERROR_MESSAGE_SUFFIX
                            + foreignTxRecord.getMetadata().getStatusMessage().toString());
                } else {
                    /*
                     * Apply side effect rules after.
                     */
                    rspTxRecDef.applyAfterEffects(foreignTxRecord.getFields(),
                        transactionParameters);
                    /*
                     * Save for children.
                     */
                    rspTxRecDef.bufferToChildren(transactionParameters);
                }
            } catch (final TranslationException e) {
                /*
                 * there was an error applying the transaction or one of it's side effects.
                 */
                InboundRequests.this.log.writeMessage(ERROR_SKIPPING_PREFIX + rspTxRecDef.getId()
                        + ':' + currRecordIx + ERROR_MESSAGE_SUFFIX
                        + ExceptionUtil.getExceptionBaseMessage(e));
            } catch (final DatabaseException e) {
                InboundRequests.this.log.writeMessage("Error applying transaction ["
                        + rspTxRecDef.getId() + ':' + currRecordIx + ERROR_MESSAGE_SUFFIX
                        + ExceptionUtil.getExceptionBaseMessage(e));
            }
        }
    }

    /**
     * Extract field values from the transaction.
     *
     * @param foreignTransaction the foreign record.
     * @param rspTxRecDef the definition of the foreign transaction record.
     * @return a map of foreign field names to extracted values, with field level rules applied.
     * @throws TranslationException when a field rule is present and the value is not valid for the
     *             rule.
     */
    private Map<String, Object> extractValues(final ResponseTxType foreignTransaction,
            final ResponseTxDefType rspTxRecDef) throws TranslationException {
        final Map<String, Object> extractedValues = new HashMap<String, Object>();
        for (final IResponseTxFieldDef<?> iffd : rspTxRecDef.getFieldDefinitions()) {
            /*
             * Disabled formatter, due to resulting line length.
             */
            // @formatter:off
            /*
             * NOTE: this cast is valid, and is a workaround to an invalid compile error.
             */
            @SuppressWarnings("unchecked")
            final AbstractArchibusResponseFieldDefinition<ResponseTxType> ffd =
                    (AbstractArchibusResponseFieldDefinition<ResponseTxType>) iffd;
            // @formatter:on
            if (ffd.shouldExtract()) {
                final Object extractedValue = ffd.extractValue(foreignTransaction);
                extractedValues.put(ffd.getForeignFieldPath(), extractedValue);
            }
        }
        return extractedValues;
    }

}
