package com.archibus.app.common.connectors.impl.archibus.translation;

import java.util.*;

import com.archibus.app.common.connectors.domain.*;
import com.archibus.app.common.connectors.exception.*;
import com.archibus.app.common.connectors.impl.archibus.translation.manager.AbstractRuleTypeManager;

/**
 * Create a manager for handling connector rules.
 *
 * @author cole
 *
 */
public class RuleManager {

    /**
     * Indicates that the field has a value before a rule is applied.
     */
    private final Set<String> requiresExistingValue = new HashSet<String>();
    
    /**
     * Managers for rule types.
     */
    private final Map<Class<? extends AbstractRuleTypeManager<?>>, AbstractRuleTypeManager<?>> managers =
            new HashMap<Class<? extends AbstractRuleTypeManager<?>>, AbstractRuleTypeManager<?>>();

    /**
     * Manage an uninitialized rule based on a connector field.
     *
     * @param connectorField the field to which the rule is assigned.
     * @throws ConfigurationException if a rule manager cannot be instantiated due to configuration.
     */
    public void add(final ConnectorFieldConfig connectorField) throws ConfigurationException {
        final String fieldKey = connectorField.getFieldId();
        final ConnectorRuleConfig connectorRule = connectorField.getRule();
        if (connectorRule != null) {
            final IConnectorRule rule = connectorRule.getNewInstance();
            rule.init(connectorField);
            for (final RuleType ruleType : RuleType.valuesOf(rule)) {
                resolveManager(ruleType.getManagerClass()).register(connectorField, rule);
            }
            if (rule.requiresExistingValue()) {
                this.requiresExistingValue.add(fieldKey);
            }
        }
    }
    
    /**
     * @param managerClass a manager type.
     * @return the manager for that rule type.
     * @param <ManagerClass> the manager type.
     */
    public <ManagerClass extends AbstractRuleTypeManager<?>> ManagerClass resolveManager(
            final Class<ManagerClass> managerClass) {
        if (!this.managers.containsKey(managerClass)) {
            try {
                this.managers.put(managerClass, managerClass.newInstance());
            } catch (final InstantiationException e) {
                throw new ConnectorInstantiationException(
                    "Cannot instantiate rule manager using default constructor: "
                            + managerClass.getName(), e);
            } catch (final IllegalAccessException e) {
                throw new ConnectorInstantiationException(
                    "Cannot access constructor for rule manager: " + managerClass.getName(), e);
            }
        }
        return managerClass.cast(this.managers.get(managerClass));
    }

    /**
     * Indicate that the given field must have a value.
     *
     * @param fieldKey the field key on the source record.
     */
    public void setValueRequired(final String fieldKey) {
        this.requiresExistingValue.add(fieldKey);
    }

    /**
     * @param fieldKey the identifier for the field in the source record.
     * @return whether the field's value should be extracted from the message.
     */
    public boolean shouldExtract(final String fieldKey) {
        return this.requiresExistingValue.contains(fieldKey);
    }
}
