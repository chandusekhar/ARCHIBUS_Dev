package com.archibus.app.common.connectors.impl.archibus.translation.field;

import com.archibus.utility.Utility;

/**
 * A connector rule to set the value of the time field to a string representation of the current
 * time.
 * 
 * @author cole
 * 
 */
public class SetCurrentTime extends AbstractFormatDate {
    @Override
    public Object applyRule(final Object value) {
        return super.applyRule(Utility.currentTime());
    }
    
    /**
     * Sets the time, so no existing value is required.
     * 
     * @return false.
     */
    public boolean requiresExistingValue() {
        return false;
    }
}
