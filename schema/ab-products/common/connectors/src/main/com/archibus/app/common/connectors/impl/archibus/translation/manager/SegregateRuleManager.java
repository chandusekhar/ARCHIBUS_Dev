package com.archibus.app.common.connectors.impl.archibus.translation.manager;

import java.util.*;

import com.archibus.app.common.connectors.domain.ConnectorFieldConfig;
import com.archibus.app.common.connectors.impl.archibus.translation.IConnectorRule;
import com.archibus.app.common.connectors.impl.archibus.translation.segregate.ISegregateRule;
import com.archibus.app.common.connectors.translation.exception.TranslationException;

/**
 * Manager for rules that segregate records into multiple records.
 *
 * @author cole
 * @since 22.1
 *
 */
public class SegregateRuleManager extends AbstractRuleTypeManager<ISegregateRule> {

    /**
     * Functions for segregating records into multiple records.
     */
    private final List<ISegregateRule> segregateRules = new ArrayList<ISegregateRule>();
    
    /**
     * Manage an already initialized segregate rule.
     *
     * @param connectorField the configuration for the connector field this rule applies to.
     * @param rule the rule to be managed.
     */
    @Override
    public void register(final ConnectorFieldConfig connectorField, final IConnectorRule rule) {
        this.segregateRules.add(cast(rule));
    }

    /**
     * @return functions for segregating records into multiple records.
     */
    public List<ISegregateRule> getSegregateRules() {
        return Collections.unmodifiableList(this.segregateRules);
    }
    
    @Override
    public Class<ISegregateRule> getRuleClass() {
        return ISegregateRule.class;
    }
    
    /**
     * Apply all segregation rules recursively.
     *
     * @param originalTransaction the transaction to be segregated.
     * @return records after segregation rules have been applied.
     * @throws TranslationException if records cannot be segregated by any rule.
     */
    public Iterable<Map<String, Object>> segregate(final Map<String, Object> originalTransaction)
            throws TranslationException {
        List<Map<String, Object>> transactions =
                new ArrayList<Map<String, Object>>(Collections.singletonList(originalTransaction));
        for (final ISegregateRule rule : getSegregateRules()) {
            List<Map<String, Object>> newTransactions = new ArrayList<Map<String, Object>>();
            for (final Map<String, Object> transaction : transactions) {
                for (final Map<String, Object> newTransaction : rule.segregate(transaction)) {
                    newTransactions.add(newTransaction);
                }
            }
            /*
             * Swap new and old transaction list, clearing old ones.
             */
            final List<Map<String, Object>> temp = transactions;
            transactions = newTransactions;
            newTransactions = temp;
            newTransactions.clear();
        }
        return transactions;
    }
}
