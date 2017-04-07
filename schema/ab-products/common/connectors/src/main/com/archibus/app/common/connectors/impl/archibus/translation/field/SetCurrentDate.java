package com.archibus.app.common.connectors.impl.archibus.translation.field;

import com.archibus.utility.Utility;

/**
 * A connector rule to set the value of the date field to a string representation of the current
 * date.
 * 
 * @author cole
 * 
 */
public class SetCurrentDate extends AbstractFormatDate {
    @Override
    public Object applyRule(final Object value) {
        return super.applyRule(Utility.currentDate());
    }
    
    /**
     * Sets the date, so no existing value is required.
     * 
     * @return false.
     */
    public boolean requiresExistingValue() {
        return false;
    }
}
