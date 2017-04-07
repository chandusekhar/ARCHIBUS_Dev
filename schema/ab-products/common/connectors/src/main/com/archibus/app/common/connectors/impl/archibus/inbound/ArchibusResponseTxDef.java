package com.archibus.app.common.connectors.impl.archibus.inbound;

import java.util.*;

import com.archibus.app.common.connectors.exception.ConfigurationException;
import com.archibus.app.common.connectors.impl.archibus.DataSourceUtil;
import com.archibus.app.common.connectors.impl.archibus.translation.RuleManager;
import com.archibus.app.common.connectors.impl.archibus.translation.manager.*;
import com.archibus.app.common.connectors.impl.archibus.translation.record.ToUpper;
import com.archibus.app.common.connectors.impl.archibus.translation.skip.SkipFirstNTransactions;
import com.archibus.app.common.connectors.translation.common.inbound.*;
import com.archibus.app.common.connectors.translation.common.inbound.ForeignTxMetadata.Status;
import com.archibus.app.common.connectors.translation.common.inbound.impl.ArchibusDataTable;
import com.archibus.app.common.connectors.translation.exception.TranslationException;

/**
 * A definition for the interpretation of a type of transaction for the purpose of updating the
 * ARCHIBUS database.
 *
 * @author cole
 * @param <ResponseType> the type of the response message to be interpreted.
 * @param <ResponseTxType> the type of the transactions this interpretation applies to.
 * @param <ResponseFldDefType> the definition for the interpretation of fields in the transactions.
 */
public class ArchibusResponseTxDef<
/*
 * Disabled formatter, due to resulting line length.
 */
// @formatter:off
ResponseType, ResponseTxType, ResponseFldDefType extends AbstractArchibusResponseFieldDefinition<ResponseTxType>>
        extends ResponseTxDef<ResponseType, ResponseTxType, ResponseFldDefType> {
    // @formatter:on
    /**
     * A manager for working with connector rules.
     */
    private final RuleManager ruleManager = new RuleManager();
    
    /**
     * Create a definition for the interpretation of a type of transaction for the purpose of
     * updating a specific table in the ARCHIBUS database.
     *
     * @param txDefId a unique identifier for this transaction definition.
     * @param dataTable a method for accessing the table to be updated.
     * @param parser method for parsing transaction records from the message.
     * @param responseFieldDefs the definition for the interpretation of fields in the transactions.
     * @param numberOfTransactionsToSkip number of transactions to ignore from source (usually
     *            headers)
     * @throws ConfigurationException if a rule manager cannot be instantiated.
     */
    protected ArchibusResponseTxDef(final String txDefId, final ArchibusDataTable dataTable,
            final IRecordParser<ResponseType, ResponseTxType> parser,
            final List<ResponseFldDefType> responseFieldDefs, final int numberOfTransactionsToSkip)
            throws ConfigurationException {
        super(txDefId, dataTable, responseFieldDefs, false, true, parser);
        if (numberOfTransactionsToSkip > 0) {
            this.ruleManager.resolveManager(SkipConditionManager.class).register(
                new SkipFirstNTransactions(numberOfTransactionsToSkip));
        }
        for (final AbstractArchibusResponseFieldDefinition<ResponseTxType> fieldDef : responseFieldDefs) {
            this.ruleManager.add(fieldDef.getConnectorField());
            fieldDef.setRuleManager(this.ruleManager);
            if (fieldDef.getFieldDef() != null && fieldDef.getFieldDef().getFormatting().isUpper()) {
                final ToUpper toUpperRule = new ToUpper();
                toUpperRule.init(fieldDef.getConnectorField());
                this.ruleManager.resolveManager(RecordTranslatorManager.class)
                    .register(toUpperRule);
            }
        }
    }
    
    /**
     * @param extractedResponse the response after extracting field values.
     * @return the reason the transaction should be skipped, or null otherwise.
     */
    public String shouldSkip(final Map<String, Object> extractedResponse) {
        return this.ruleManager.resolveManager(SkipConditionManager.class).shouldSkip(
            extractedResponse);
    }
    
    /**
     * @param extractedResponse the response after extracting field values.
     * @return the extracted response after field rules have been applied.
     * @throws TranslationException if any field translation cannot be applied.
     */
    public Map<String, Object> applyFieldRules(final Map<String, Object> extractedResponse)
            throws TranslationException {
        final Map<String, Object> translatedResponse = new HashMap<String, Object>();
        for (final ResponseFldDefType rspnFieldDef : super.getFieldDefinitions()) {
            final String fieldKey = rspnFieldDef.getForeignFieldPath();
            final Object newValue =
                    this.ruleManager.resolveManager(FieldTranslatorManager.class).applyRule(
                        fieldKey, extractedResponse.get(fieldKey));
            translatedResponse.put(fieldKey, newValue);
        }
        return translatedResponse;
    }
    
    /**
     * @param extractedResponse the response after field rules are applied.
     * @param ancestralRecords records by response transaction definition id, of ancestral records
     *            from which information may be inherited.
     * @return the extracted response after IRecordTranslator rules have been applied.
     * @throws TranslationException if any record rule cannot be applied.
     */
    public Map<String, Object> applyRecordRules(final Map<String, Object> extractedResponse,
            final Map<String, Map<String, Object>> ancestralRecords) throws TranslationException {
        return this.ruleManager.resolveManager(RecordTranslatorManager.class).applyRule(
            extractedResponse, ancestralRecords);
    }

    /**
     * Apply all segregation rules recursively.
     *
     * @param originalTransaction the transaction to be segregated.
     * @return transactions after segregation rules have been applied.
     * @throws TranslationException if records cannot be segregated.
     */
    public Iterable<Map<String, Object>> segregateRecords(
            final Map<String, Object> originalTransaction) throws TranslationException {
        return this.ruleManager.resolveManager(SegregateRuleManager.class).segregate(
            originalTransaction);
    }

    /**
     * @param translatedResponse the response after translating/skipping field values.
     * @throws TranslationException if any rule cannot be applied.
     */
    public void applySideEffects(final Map<String, Object> translatedResponse)
            throws TranslationException {
        this.ruleManager.resolveManager(SideEffectRuleManager.class).applySideEffects(
            translatedResponse);
    }

    /**
     * @param archibusRecord the ARCHIBUS record the transaction was applied to.
     * @param translatedResponse the transaction that was applied.
     * @throws TranslationException if any rule cannot be applied.
     */
    public void applyAfterEffects(final Map<String, Object> archibusRecord,
            final Map<String, Object> translatedResponse) throws TranslationException {
        this.ruleManager.resolveManager(AfterEffectRuleManager.class).applyAfterEffects(
            archibusRecord, translatedResponse);
    }

    /**
     * @return functions for aggregating field values across records/transactions.
     */
    public Map<String, IAggregateFunction> getAggregateFunctions() {
        return this.ruleManager.resolveManager(AggregateRuleManager.class).getAggregateFunctions();
    }

    /**
     * @return a list of response transactions definition ids for definitions that precede and
     *         contribute to this one.
     */
    public Set<String> getAncestorIds() {
        return this.ruleManager.resolveManager(RecordTranslatorManager.class).getAncestorIds();
    }
    
    @Override
    public void populateDbValues(final Map<String, Object> translatedValues,
            final ForeignTxRecord transaction) {
        for (final ResponseFldDefType ffd : getFieldDefinitions()) {
            /*
             * NOTE: this cast is valid, and is a workaround to an invalid compile error.
             */
            if (DataSourceUtil.isDsField(ffd.getConnectorField())) {
                final String dbFieldName = ffd.getConnectorField().getArchibusField();
                final String foreignFieldName = ffd.getForeignFieldPath();
                final ForeignTxMetadata metadata = transaction.getMetadata();
                /*
                 * Translate the foreign value into a database value.
                 */
                try {
                    final Object fieldValue =
                            ffd.translateToDatabase(translatedValues.get(foreignFieldName));

                    /*
                     * Check to see if an update should occur.
                     */
                    if (ffd.shouldUpdate(fieldValue) && dbFieldName != null) {
                        transaction.putField(dbFieldName, fieldValue);
                    } else {
                        metadata.getFieldsNotUpdated().add(dbFieldName);
                    }
                } catch (final TranslationException e) {
                    /*
                     * Record errors in translation.
                     */
                    metadata.setStatus(Status.ERROR);
                    metadata.getStatusMessage().append("\nError translating field: ")
                        .append(ffd.getForeignFieldPath());
                    metadata.getFieldsInError().add(ffd.getForeignFieldPath());
                }
            }
        }
    }
}
