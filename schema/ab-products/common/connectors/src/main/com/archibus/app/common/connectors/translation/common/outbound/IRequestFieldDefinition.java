package com.archibus.app.common.connectors.translation.common.outbound;

import com.archibus.app.common.connectors.translation.exception.TranslationException;

/**
 * An IRequestFieldDefinition defines methods for accessing a specific unit of data in a foreign
 * system's message in the form of a data field.
 *
 * @author cole
 *
 */
public interface IRequestFieldDefinition {

    /**
     * @return the name of the field, as expected by a request template.
     */
    String getFieldName();

    /**
     * @param databaseValue the value as stored in the ARCHIBUS database.
     * @return the value of this field in a format that can be used in a request template.
     * @throws TranslationException if the databaseValue cannot be translated into a foreign value.
     */
    Object translateToForeign(final Object databaseValue) throws TranslationException;
}
