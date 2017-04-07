package com.archibus.app.common.connectors.impl.archibus.translation;

import java.util.*;

import com.archibus.app.common.connectors.impl.archibus.translation.aftereffect.IAfterEffectRule;
import com.archibus.app.common.connectors.impl.archibus.translation.aggregate.AbstractAggregateRule;
import com.archibus.app.common.connectors.impl.archibus.translation.field.IFieldTranslator;
import com.archibus.app.common.connectors.impl.archibus.translation.inherited.IInheritedRecordTranslator;
import com.archibus.app.common.connectors.impl.archibus.translation.manager.*;
import com.archibus.app.common.connectors.impl.archibus.translation.record.IRecordTranslator;
import com.archibus.app.common.connectors.impl.archibus.translation.segregate.ISegregateRule;
import com.archibus.app.common.connectors.impl.archibus.translation.sideeffect.ISideEffectRule;
import com.archibus.app.common.connectors.impl.archibus.translation.skip.ISkipRecordCondition;

/**
 * Types of rules that extend IConnectorRule.
 *
 * @author cole
 * @since 22.1
 */
public enum RuleType {
    /**
     * A type of rule that applies to a transaction after it's been applied to the data set.
     */
    AFTER_EFFECT(IAfterEffectRule.class, AfterEffectRuleManager.class),
    /**
     * A type of rule that aggregates a field value across multiple transactions.
     */
    AGGREGATION(AbstractAggregateRule.class, AggregateRuleManager.class),
    /**
     * A type of rule that updates a single field value.
     */
    FIELD_TRANSLATION(IFieldTranslator.class, FieldTranslatorManager.class),
    /**
     * A type of rule that updates one record based on a related record.
     */
    INHERITANCE(IInheritedRecordTranslator.class, RecordTranslatorManager.class),
    /**
     * A type of rule that updates a record.
     */
    RECORD_TRANSLATION(IRecordTranslator.class, RecordTranslatorManager.class),
    /**
     * A type of rule that segregates a record into multiple records.
     */
    SEGREGATION(ISegregateRule.class, SegregateRuleManager.class),
    /**
     * A type of rule that doesn't affect a transaction, but does something before it's applied.
     */
    SIDE_EFFECT(ISideEffectRule.class, SideEffectRuleManager.class),
    /**
     * A type of rule that determines whether a transaction should be applied.
     */
    SKIP_CONDITION(ISkipRecordCondition.class, SkipConditionManager.class);
    
    /**
     * The base class for rules of this type.
     */
    private Class<? extends IConnectorRule> ruleClass;
    
    /**
     * The class for managers of this type of rule.
     */
    private Class<? extends AbstractRuleTypeManager<?>> managerClass;

    /**
     * @param ruleClass the base class for rules of this type.
     * @param managerClass the class for managers of this type of rule.
     * @param <RuleClass> the rule type common to the manager and rule classes.
     */
    private <RuleClass extends IConnectorRule> RuleType(final Class<? extends RuleClass> ruleClass,
        final Class<? extends AbstractRuleTypeManager<RuleClass>> managerClass) {
        this.ruleClass = ruleClass;
        this.managerClass = managerClass;
    }
    
    /**
     * @return the base class for rules of this type.
     */
    public Class<? extends IConnectorRule> getRuleClass() {
        return this.ruleClass;
    }
    
    /**
     * @return the class for managers of this type of rule.
     */
    public Class<? extends AbstractRuleTypeManager<?>> getManagerClass() {
        return this.managerClass;
    }
    
    /**
     * @param rule a connector rule.
     * @return the types of the connector rule.
     */
    public static Set<RuleType> valuesOf(final IConnectorRule rule) {
        final Set<RuleType> ruleTypes = new HashSet<RuleType>();
        if (rule != null) {
            for (final RuleType ruleType : values()) {
                if (ruleType.getRuleClass().isAssignableFrom(rule.getClass())) {
                    ruleTypes.add(ruleType);
                }
            }
            if (ruleTypes.contains(INHERITANCE)) {
                ruleTypes.remove(RECORD_TRANSLATION);
            }
        }
        return ruleTypes;
    }
}
