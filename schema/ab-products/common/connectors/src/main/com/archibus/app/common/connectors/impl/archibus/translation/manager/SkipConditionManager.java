package com.archibus.app.common.connectors.impl.archibus.translation.manager;

import java.util.*;

import com.archibus.app.common.connectors.domain.ConnectorFieldConfig;
import com.archibus.app.common.connectors.impl.archibus.translation.IConnectorRule;
import com.archibus.app.common.connectors.impl.archibus.translation.skip.ISkipRecordCondition;

/**
 *
 * Manager for conditions for skipping transactions.
 *
 * @author cole
 * @since 21.4
 *
 */
public class SkipConditionManager extends AbstractRuleTypeManager<ISkipRecordCondition> {
    
    /**
     * Connector rules defining conditions for skipping a record.
     */
    private final List<ISkipRecordCondition> skipRecordConditions =
            new ArrayList<ISkipRecordCondition>();

    /**
     * Manage an already initialized record rule.
     *
     * @param rule the rule to be managed.
     */
    public void register(final IConnectorRule rule) {
        register(null, rule);
    }

    /**
     * Manage an already initialized skip rule.
     *
     * @param connectorField the configuration for the connector field this rule applies to.
     * @param rule the rule to be managed.
     */
    @Override
    public void register(final ConnectorFieldConfig connectorField, final IConnectorRule rule) {
        this.skipRecordConditions.add(cast(rule));
    }

    /**
     * @param record to be considered.
     * @return the reason the record should be skipped, or null otherwise.
     */
    public String shouldSkip(final Map<String, Object> record) {
        String reason = null;
        for (final ISkipRecordCondition skipRecordCondition : this.skipRecordConditions) {
            if (skipRecordCondition.shouldSkip(record) && reason == null) {
                reason = skipRecordCondition.getReason(record);
                /*
                 * NOTE: do not short circuit, all skip rules should be tested in case they are
                 * stateful.
                 */
            }
        }
        return reason;
    }

    @Override
    public Class<ISkipRecordCondition> getRuleClass() {
        return ISkipRecordCondition.class;
    }
}
