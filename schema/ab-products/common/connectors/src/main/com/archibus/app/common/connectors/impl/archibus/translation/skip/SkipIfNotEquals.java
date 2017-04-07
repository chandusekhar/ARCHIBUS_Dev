package com.archibus.app.common.connectors.impl.archibus.translation.skip;

import java.util.Map;

/**
 * A rule that indicates the record should not be skipped if the String representation of its value
 * is not one of a number of pipe delimited values in the parameters field. null is interpreted as
 * the literal null or the String 'null'.
 *
 * @author cole
 *
 */
public class SkipIfNotEquals extends AbstractSkipDependingOnValueSet {
    
    /**
     * @param record to be considered for skipping.
     * @return true if the field's value is not one of the pipe delimited values in the parameters
     *         field.
     */
    public boolean shouldSkip(final Map<String, Object> record) {
        final Object fieldValue = record.get(this.getFieldKey());
        return !this.getValueSet().contains(String.valueOf(fieldValue));
    }
}
