package com.archibus.app.common.connectors.impl.file.inbound;

import com.archibus.app.common.connectors.translation.common.outbound.IRequestFieldDefinition;
import com.archibus.app.common.connectors.translation.exception.TranslationException;

/**
 * A RequestFieldDefinition defines a method for translating a file's identifier into a java.io.File
 * that can be used by a FileSystemAdaptor.
 *
 * @author cole
 *
 */
public class FileRequestFieldDefinition implements IRequestFieldDefinition {

    /**
     * The parameter/field name for the file's identifier.
     */
    private final String fileNodeParameter;

    /**
     * Create a method for translating a file's identifier into a java.io.File that can be used by a
     * FileSystemAdaptor.
     *
     * @param fileNodeParameter the parameter/field name for the file's identifier.
     */
    public FileRequestFieldDefinition(final String fileNodeParameter) {
        this.fileNodeParameter = fileNodeParameter;
    }

    /**
     * @param databaseValue the value as stored in a foreign record database.
     * @return the value of this field in a format that can be used in a request template.
     * @throws TranslationException if the databaseValue cannot be translated into a foreign value.
     */
    public Object translateToForeign(final Object databaseValue) throws TranslationException {
        return databaseValue;
    }

    /**
     * @return the name of the field, as expected by a request template.
     */
    public String getFieldName() {
        return this.fileNodeParameter;
    }
}
