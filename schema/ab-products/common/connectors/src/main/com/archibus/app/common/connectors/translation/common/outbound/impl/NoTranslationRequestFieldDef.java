package com.archibus.app.common.connectors.translation.common.outbound.impl;

import com.archibus.app.common.connectors.translation.common.outbound.IRequestFieldDefinition;

/**
 * A field definition that does no translation.
 *
 * @author cole
 *
 */
public class NoTranslationRequestFieldDef implements IRequestFieldDefinition {
    /**
     * The name of the field, as expected by a request template.
     */
    private final String fieldName;
    
    /**
     * Create a field definition that does no translation with the given field name.
     *
     * @param fieldName the name of the field, as expected by a request template.
     */
    public NoTranslationRequestFieldDef(final String fieldName) {
        this.fieldName = fieldName;
    }
    
    /**
     * @return the name of the field, as expected by a request template.
     */
    public String getFieldName() {
        return this.fieldName;
    }
    
    /**
     * @param databaseValue the value of this field in the ARCHIBUS database.
     * @return the databaseValue
     */
    public Object translateToForeign(final Object databaseValue) {
        return databaseValue;
    }
    
}
