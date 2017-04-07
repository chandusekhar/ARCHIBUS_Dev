package com.archibus.app.common.connectors.impl.archibus.translation.skip;

import java.util.Map;

/**
 * A rule that indicates the record should not be skipped if the String representation of its value
 * doesn't contain one of a number of pipe delimited values in the parameters field. null is
 * interpreted as the literal null or the String 'null'.
 *
 * @author cole
 *
 */
public class SkipIfNotContains extends AbstractSkipDependingOnValueSet {
    
    /**
     * @param record to be considered for skipping.
     * @return true if the field's value does not contain one of the pipe delimited values in the
     *         parameters field.
     */
    public boolean shouldSkip(final Map<String, Object> record) {
        final String fieldValue = String.valueOf(record.get(this.getFieldKey()));
        boolean found = false;
        for (final String value : this.getValueSet()) {
            if (fieldValue.indexOf(value) > -1) {
                found = true;
                break;
            }
        }
        return !found;
    }
}
