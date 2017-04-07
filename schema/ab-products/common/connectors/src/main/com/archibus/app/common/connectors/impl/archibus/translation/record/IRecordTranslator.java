package com.archibus.app.common.connectors.impl.archibus.translation.record;

import java.util.Map;

import com.archibus.app.common.connectors.impl.archibus.translation.IConnectorRule;

/**
 * A generic translation to be applied to a record's values.
 * 
 * @author cole
 */
public interface IRecordTranslator extends IConnectorRule {
    
    /**
     * Apply a translation to a record's values.
     * 
     * @param record the record to be modified (may already be modified by other rules).
     * @param originalRecord the record prior to translation by other record level rules.
     */
    void applyRule(final Map<String, Object> record, final Map<String, Object> originalRecord);
}
