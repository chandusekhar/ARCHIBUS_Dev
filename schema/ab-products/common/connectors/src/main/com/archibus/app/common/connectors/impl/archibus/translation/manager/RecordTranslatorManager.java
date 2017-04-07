package com.archibus.app.common.connectors.impl.archibus.translation.manager;

import java.util.*;

import com.archibus.app.common.connectors.domain.ConnectorFieldConfig;
import com.archibus.app.common.connectors.impl.archibus.translation.IConnectorRule;
import com.archibus.app.common.connectors.impl.archibus.translation.inherited.IInheritedRecordTranslator;
import com.archibus.app.common.connectors.impl.archibus.translation.record.IRecordTranslator;
import com.archibus.app.common.connectors.translation.exception.TranslationException;

/**
 * Manager for rules that apply a translation that may involve multiple field values.
 *
 * @author cole
 * @since 21.4
 *
 */
public class RecordTranslatorManager extends AbstractRuleTypeManager<IRecordTranslator> {
    
    /**
     * Connector rules to be applied to this record.
     */
    private final List<IInheritedRecordTranslator> inheritedRecordTranslators =
            new ArrayList<IInheritedRecordTranslator>();
    
    /**
     * Connector rules to be applied to this record.
     */
    private final List<IRecordTranslator> recordTranslators = new ArrayList<IRecordTranslator>();

    /**
     * Manage an already initialized record rule.
     *
     * @param rule the rule to be managed.
     */
    public void register(final IConnectorRule rule) {
        register(null, rule);
    }

    /**
     * Manage an already initialized record rule.
     *
     * @param connectorField the configuration for the connector field this rule applies to.
     * @param rule the rule to be managed.
     */
    @Override
    public void register(final ConnectorFieldConfig connectorField, final IConnectorRule rule) {
        if (rule instanceof IInheritedRecordTranslator) {
            this.inheritedRecordTranslators.add((IInheritedRecordTranslator) rule);
        } else {
            this.recordTranslators.add(cast(rule));
        }
    }

    /**
     * @param record the record to be translated.
     * @param ancestralTransactions previous transactions that may contribute to record rules.
     * @throws TranslationException if any rule cannot be applied.
     * @return the translated record.
     */
    public Map<String, Object> applyRule(final Map<String, Object> record,
        final Map<String, Map<String, Object>> ancestralTransactions)
                throws TranslationException {
        final Map<String, Object> translatedRecord = new HashMap<String, Object>(record);
        for (final IInheritedRecordTranslator recordTranslator : this.inheritedRecordTranslators) {
            final String ancestorId = recordTranslator.getTransactionDefinitionId();
            if (ancestralTransactions.containsKey(ancestorId)) {
                recordTranslator.applyRule(translatedRecord,
                    Collections.unmodifiableMap(ancestralTransactions.get(ancestorId)));
            } else {
                throw new TranslationException("No record to inherit from: " + ancestorId + " -> "
                        + record.toString(), null);
            }
        }
        final Map<String, Object> originalRecord = Collections.unmodifiableMap(translatedRecord);
        for (final IRecordTranslator recordTranslator : this.recordTranslators) {
            recordTranslator.applyRule(translatedRecord, originalRecord);
        }
        return translatedRecord;
    }

    @Override
    public Class<IRecordTranslator> getRuleClass() {
        return IRecordTranslator.class;
    }
    
    /**
     * @return a list of response transactions definition ids for definitions that precede and
     *         contribute to this one.
     */
    public Set<String> getAncestorIds() {
        final Set<String> ids = new HashSet<String>();
        for (final IInheritedRecordTranslator rule : this.inheritedRecordTranslators) {
            ids.add(rule.getTransactionDefinitionId());
        }
        return ids;
    }
}
