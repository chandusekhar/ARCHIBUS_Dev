package com.archibus.app.common.connectors.impl.archibus.translation.field;

import com.archibus.utility.StringUtil;

/**
 * A connector rule to set the value of the field to a provided value if the value is null or empty.
 * 
 * @author cole
 * 
 */
public class SetValueIfNull extends SetValue {
    
    /**
     * @param value value to be replaced.
     * @return if the value is null or an empty string, the replacement value, otherwise the
     *         parameter value.
     */
    @Override
    public Object applyRule(final Object value) {
        return StringUtil.isNullOrEmpty(value) ? super.applyRule(value) : value;
    }
    
    /**
     * Sets the value based on it's previous state, so a value must exist to compare.
     * 
     * @return true.
     */
    @Override
    public boolean requiresExistingValue() {
        return true;
    }
}
