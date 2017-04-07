package com.archibus.app.common.connectors.impl.archibus.translation.manager;

import com.archibus.app.common.connectors.domain.ConnectorFieldConfig;
import com.archibus.app.common.connectors.impl.archibus.translation.IConnectorRule;

/**
 * Manager for connector rules of a particular type.
 *
 * @author cole
 * @since 22.1
 *
 * @param <RuleBaseClass> the class of the connector rule being managed.
 */
public abstract class AbstractRuleTypeManager<RuleBaseClass extends IConnectorRule> {
    /**
     * Register a rule to be managed.
     *
     * @param connectorField the configuration for the field the rule is defined for.
     * @param rule the rule instance to be managed.
     */
    public abstract void register(final ConnectorFieldConfig connectorField,
            final IConnectorRule rule);

    /**
     * @return rule base class's class.
     */
    public abstract Class<RuleBaseClass> getRuleClass();

    /**
     * @param rule a connector rule.
     * @return the rule cast to the RuleBaseClass.
     */
    protected RuleBaseClass cast(final IConnectorRule rule) {
        return getRuleClass().cast(rule);
    }
}
