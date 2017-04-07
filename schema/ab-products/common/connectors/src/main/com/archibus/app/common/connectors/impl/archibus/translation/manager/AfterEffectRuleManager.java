package com.archibus.app.common.connectors.impl.archibus.translation.manager;

import java.util.*;

import com.archibus.app.common.connectors.domain.ConnectorFieldConfig;
import com.archibus.app.common.connectors.impl.archibus.translation.IConnectorRule;
import com.archibus.app.common.connectors.impl.archibus.translation.aftereffect.IAfterEffectRule;
import com.archibus.app.common.connectors.translation.exception.TranslationException;

/**
 * Manager for rules that affect tables other than the one being updated.
 *
 * @author cole
 * @since 21.4
 *
 */
public class AfterEffectRuleManager extends AbstractRuleTypeManager<IAfterEffectRule> {

    /**
     * Connector rules defining conditions for doing something after a transaction is applied.
     */
    private final List<IAfterEffectRule> afterEffectRules = new ArrayList<IAfterEffectRule>();
    
    /**
     * Manage an already initialized side effect rule.
     *
     * @param connectorField the configuration for the connector field this rule applies to.
     * @param rule the rule to be managed.
     */
    @Override
    public void register(final ConnectorFieldConfig connectorField, final IConnectorRule rule) {
        this.afterEffectRules.add(cast(rule));
    }
    
    /**
     * @param archibusRecord the ARCHIBUS record the transaction was applied to.
     * @param record the transaction that was applied.
     * @throws TranslationException if any rule cannot be applied.
     */
    public void applyAfterEffects(final Map<String, Object> archibusRecord,
            final Map<String, Object> record) throws TranslationException {
        for (final IAfterEffectRule afterEffectRule : this.afterEffectRules) {
            afterEffectRule.applyAfterEffect(archibusRecord, record);
        }
    }

    @Override
    public Class<IAfterEffectRule> getRuleClass() {
        return IAfterEffectRule.class;
    }
}
