package com.archibus.app.common.connectors.impl.archibus.translation.skip;

import java.util.Map;

import com.archibus.utility.StringUtil;

/**
 * A rule that indicates the record should be skipped if its value is null or one of a number of
 * pipe delimited values in the parameters field.
 *
 * @author cole
 *
 */
public class SkipIfNullOrEquals extends AbstractSkipDependingOnValueSet {
    /**
     * @param record to be considered for skipping.
     * @return true if the field's value is null, empty, or one of the pipe delimited values in the
     *         parameters field.
     */
    public boolean shouldSkip(final Map<String, Object> record) {
        final Object fieldValue = record.get(this.getFieldKey());
        return StringUtil.isNullOrEmpty(fieldValue)
                || this.getValueSet().contains(String.valueOf(fieldValue));
    }
}
