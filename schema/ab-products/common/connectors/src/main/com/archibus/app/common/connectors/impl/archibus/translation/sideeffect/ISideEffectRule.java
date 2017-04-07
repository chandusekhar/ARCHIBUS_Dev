package com.archibus.app.common.connectors.impl.archibus.translation.sideeffect;

import java.util.Map;

import com.archibus.app.common.connectors.impl.archibus.translation.IConnectorRule;
import com.archibus.app.common.connectors.translation.exception.TranslationException;

/**
 * A rule to do something that does not impact the record, but may be required to insert it.
 *
 * @author cole
 *
 */
public interface ISideEffectRule extends IConnectorRule {
    
    /**
     * @param record the record that's already been modified and not skipped by other rules.
     * @throws TranslationException if the record is inappropriate for the side effect.
     */
    void applySideEffect(final Map<String, Object> record) throws TranslationException;
}
