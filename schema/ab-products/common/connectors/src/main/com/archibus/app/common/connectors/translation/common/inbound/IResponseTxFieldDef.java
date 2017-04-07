package com.archibus.app.common.connectors.translation.common.inbound;

import com.archibus.app.common.connectors.translation.exception.TranslationException;
import com.archibus.db.ViewField;

/**
 * A ForeignFieldDefinition defines methods for accessing a specific unit of data in a foreign
 * system's message in the form of a data field.
 *
 * @author cole
 * @param <ResponseTxType> the type of transaction that contains this field.
 */
public interface IResponseTxFieldDef<ResponseTxType> {
    /**
     * @return the name of the field, as expected by a request template.
     */
    ViewField.Immutable getFieldDef();

    /**
     * @param transactionRecord a record parsed from a response.
     * @return the value of this field in the response transaction.
     */
    Object extractValue(final ResponseTxType transactionRecord);

    /**
     * @param foreignValue the value as returned from extractValue.
     * @return the value of this field in a format that can be inserted into a database. null means
     *         null, not default value.
     * @throws TranslationException if the foreignValue cannot be translated into a database value.
     */
    Object translateToDatabase(final Object foreignValue) throws TranslationException;

    /**
     * An extractedValue may indicate that no change is to be made. If that is the case, this will
     * return false.
     *
     * @param extractedValue the value as returned from extractValue.
     * @return whether this field with the given value should be updated.
     */
    boolean shouldUpdate(final Object extractedValue);
}
