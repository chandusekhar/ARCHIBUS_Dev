package com.archibus.app.common.connectors.impl.archibus.translation.field;

import com.archibus.app.common.connectors.impl.archibus.translation.IConnectorRule;
import com.archibus.app.common.connectors.translation.exception.TranslationException;

/**
 * A generic translation to be applied to a field's value.
 * 
 * @author cole
 * 
 */
public interface IFieldTranslator extends IConnectorRule {
    
    /**
     * Apply a translation to a field's value.
     * 
     * @param value the value to be translated.
     * @return translated value.
     * @throws TranslationException if the value is not valid for this translation.
     */
    Object applyRule(final Object value) throws TranslationException;
}
