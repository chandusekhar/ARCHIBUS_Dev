package com.archibus.app.common.connectors.impl.archibus.translation.manager;

import java.util.*;

import com.archibus.app.common.connectors.domain.ConnectorFieldConfig;
import com.archibus.app.common.connectors.impl.archibus.translation.IConnectorRule;
import com.archibus.app.common.connectors.impl.archibus.translation.field.IFieldTranslator;
import com.archibus.app.common.connectors.translation.exception.TranslationException;

/**
 * Manager for rules that apply a translation to a single field's value.
 *
 * @author cole
 * @since 21.4
 *
 */
public class FieldTranslatorManager extends AbstractRuleTypeManager<IFieldTranslator> {
    
    /**
     * A connector rule to be applied to this field, or null if none is to be applied.
     */
    private final Map<String, List<IFieldTranslator>> fieldTranslators =
            new HashMap<String, List<IFieldTranslator>>();

    /**
     * Manage an already initialized field rule.
     *
     * @param connectorField the configuration for the connector field this rule applies to.
     * @param rule the rule to be managed.
     */
    @Override
    public void register(final ConnectorFieldConfig connectorField, final IConnectorRule rule) {
        final String fieldKey = connectorField.getFieldId();
        if (!this.fieldTranslators.containsKey(fieldKey)) {
            this.fieldTranslators.put(fieldKey, new ArrayList<IFieldTranslator>());
        }
        this.fieldTranslators.get(fieldKey).add(cast(rule));
    }

    /**
     * @param fieldKey the field the value belongs to.
     * @param value the value to be translated.
     * @return the translated value.
     * @throws TranslationException if a translation cannot be applied.
     */
    public Object applyRule(final String fieldKey, final Object value) throws TranslationException {
        Object translatedValue = value;
        if (this.fieldTranslators.containsKey(fieldKey)) {
            for (final IFieldTranslator fieldTranslator : this.fieldTranslators.get(fieldKey)) {
                translatedValue = fieldTranslator.applyRule(value);
            }
        }
        return translatedValue;
    }
    
    @Override
    public Class<IFieldTranslator> getRuleClass() {
        return IFieldTranslator.class;
    }

}
