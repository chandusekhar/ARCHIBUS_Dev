package com.archibus.app.common.connectors.translation.text.outbound;

import com.archibus.app.common.connectors.translation.common.outbound.impl.ListField;

/**
 * A field to be written to delimited text.
 * 
 * @author cole
 */
public class DelimitedTextField extends ListField {
    
    /**
     * How to pad the field, for fixed width fields.
     */
    private final PaddingRule paddingRule;
    
    /**
     * @param fieldName the name of the field.
     * @param paddingRule how to pad the field, for fixed width fields.
     * @param position the zero based position of the field in the record.
     */
    public DelimitedTextField(final String fieldName, final PaddingRule paddingRule,
            final int position) {
        super(fieldName, position);
        this.paddingRule = paddingRule;
    }
    
    /**
     * @return how the field should be padded, for fixed width fields.
     */
    public PaddingRule getPaddingRule() {
        return this.paddingRule;
    }
}
