package com.archibus.app.common.connectors.impl.archibus.translation.manager;

import java.util.*;

import com.archibus.app.common.connectors.domain.ConnectorFieldConfig;
import com.archibus.app.common.connectors.impl.archibus.translation.IConnectorRule;
import com.archibus.app.common.connectors.impl.archibus.translation.aggregate.AbstractAggregateRule;
import com.archibus.app.common.connectors.translation.common.inbound.IAggregateFunction;

/**
 * Manager for rules that aggregate values across multiple transactions.
 *
 * @author cole
 * @since 21.4
 *
 */
public class AggregateRuleManager extends AbstractRuleTypeManager<AbstractAggregateRule> {

    /**
     * Functions for aggregating field values across records/transactions.
     */
    private final Map<String, IAggregateFunction> aggregateFunctions =
            new HashMap<String, IAggregateFunction>();
    
    /**
     * Manage an already initialized aggregate rule.
     *
     * @param connectorField the configuration for the connector field this rule applies to.
     * @param rule the rule to be managed.
     */
    @Override
    public void register(final ConnectorFieldConfig connectorField, final IConnectorRule rule) {
        this.aggregateFunctions.put(connectorField.getFieldId(), cast(rule));
    }

    /**
     * @return functions for aggregating field values across records/transactions.
     */
    public Map<String, IAggregateFunction> getAggregateFunctions() {
        return Collections.unmodifiableMap(this.aggregateFunctions);
    }
    
    @Override
    public Class<AbstractAggregateRule> getRuleClass() {
        return AbstractAggregateRule.class;
    }
}
