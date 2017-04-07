package com.archibus.app.common.connectors.impl.archibus.translation.manager;

import java.util.*;

import com.archibus.app.common.connectors.domain.ConnectorFieldConfig;
import com.archibus.app.common.connectors.impl.archibus.translation.IConnectorRule;
import com.archibus.app.common.connectors.impl.archibus.translation.sideeffect.ISideEffectRule;
import com.archibus.app.common.connectors.translation.exception.TranslationException;

/**
 * Manager for rules that affect tables other than the one being updated.
 *
 * @author cole
 * @since 21.4
 *
 */
public class SideEffectRuleManager extends AbstractRuleTypeManager<ISideEffectRule> {
    
    /**
     * Connector rules defining conditions for doing something based on the record, but not to it.
     */
    private final List<ISideEffectRule> sideEffectRules = new ArrayList<ISideEffectRule>();

    /**
     * Manage an already initialized side effect rule.
     *
     * @param connectorField the configuration for the connector field this rule applies to.
     * @param rule the rule to be managed.
     */
    @Override
    public void register(final ConnectorFieldConfig connectorField, final IConnectorRule rule) {
        this.sideEffectRules.add(cast(rule));
    }

    /**
     * @param record the input to the side effect.
     * @throws TranslationException if any rule cannot be applied.
     */
    public void applySideEffects(final Map<String, Object> record) throws TranslationException {
        final Map<String, Object> originalRecord = Collections.unmodifiableMap(record);
        for (final ISideEffectRule sideEffectRule : this.sideEffectRules) {
            sideEffectRule.applySideEffect(originalRecord);
        }
    }
    
    @Override
    public Class<ISideEffectRule> getRuleClass() {
        return ISideEffectRule.class;
    }
}
