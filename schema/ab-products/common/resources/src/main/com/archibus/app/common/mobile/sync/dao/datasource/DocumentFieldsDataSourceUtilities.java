package com.archibus.app.common.mobile.sync.dao.datasource;

import java.io.*;
import java.util.*;

import org.directwebremoting.io.*;

import com.archibus.app.common.mobile.sync.dao.datasource.DocumentFieldsDataSource.FieldNames;
import com.archibus.app.common.mobile.sync.service.FieldNameValue;
import com.archibus.app.common.mobile.sync.service.Record;
import com.archibus.datasource.data.DataRecord;
import com.archibus.schema.*;
import com.archibus.schema.TableDef.ThreadSafe;
import com.archibus.utility.ExceptionBase;

/**
 * Utilities for DocumentFieldsDataSource.
 *
 * @author Valery Tydykov
 * @since 21.1
 *
 */
public final class DocumentFieldsDataSourceUtilities {

    /**
     * Constant: error message.
     */
    // @non-translatable
    private static final String FAILED_TO_CONVERT_FILE_CONTENT_USING_UTF_8_ENCODING =
            "Failed to convert file content using UTF-8 encoding.";

    /**
     * Constant: encoding name for conversion of documents to/from strings.
     */
    private static final String UTF_8 = "UTF-8";

    /**
     * Private default constructor: utility class is non-instantiable.
     */
    private DocumentFieldsDataSourceUtilities() {
    }

    /**
     * Base64 decodes string, converts to byte array.
     *
     * @param input string to be decoded.
     * @return decoded string as byte array.
     * @throws ExceptionBase if UnsupportedEncodingException is thrown.
     */
    static byte[] base64Decode(final String input) throws ExceptionBase {
        final org.apache.commons.codec.binary.Base64 encoder =
                new org.apache.commons.codec.binary.Base64();
        try {
            return encoder.decode(input.getBytes(UTF_8));
        } catch (final UnsupportedEncodingException e) {
            throw new ExceptionBase(FAILED_TO_CONVERT_FILE_CONTENT_USING_UTF_8_ENCODING, e);
        }
    }

    /**
     * Base64-encodes bytes, converts to string.
     *
     * @param bytes to encode.
     * @return encoded string.
     */
    public static String base64Encode(final byte[] bytes) {
        // base64 encode string value
        final org.apache.commons.codec.binary.Base64 encoder =
                new org.apache.commons.codec.binary.Base64();

        try {
            return new String(encoder.encode(bytes), UTF_8);
        } catch (final UnsupportedEncodingException e) {
            // @non-translatable
            throw new ExceptionBase(FAILED_TO_CONVERT_FILE_CONTENT_USING_UTF_8_ENCODING, e);
        }
    }

    /**
     * Converts base-64-encoded-string with document content to stream. Decodes Base64 encoded
     * string.
     *
     * @param documentContent string with document content, Base64 encoded.
     * @return stream with document content in binary format.
     */
    static InputStream convertDocumentContentToStream(final String documentContent) {
        return new ByteArrayInputStream(base64Decode(documentContent));
    }

    /**
     * Converts base-64-encoded-string with document content to string. Decodes Base64 encoded
     * string.
     *
     * @param documentContent string with document content, Base64 encoded.
     * @return String with document content.
     */
    static String convertDocumentContentToString(final String documentContent) {
        try {
            return new String(DocumentFieldsDataSourceUtilities.base64Decode(documentContent),
                UTF_8);
        } catch (final UnsupportedEncodingException e) {
            throw new ExceptionBase(FAILED_TO_CONVERT_FILE_CONTENT_USING_UTF_8_ENCODING, e);
        }
    }

    /**
     * Converts stream with document content in binary format to base64 encoded string.
     *
     * @param fileTransfer with the input stream with document content in binary format.
     * @return document content as base64 encoded string, or null if conversion failed.
     */
    static String convertStreamToEncodedString(final FileTransfer fileTransfer) {
        final OutputStreamLoader outputStreamLoader = fileTransfer.getOutputStreamLoader();

        // read bytes from the input stream
        byte[] bytes = null;
        String encodedString = null;
        try {
            try {
                final ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
                // TODO read chunk by chunk?
                outputStreamLoader.load(outputStream);

                bytes = outputStream.toByteArray();
                encodedString = base64Encode(bytes);
            } finally {
                if (outputStreamLoader != null) {
                    outputStreamLoader.close();
                }
            }
        } catch (final IOException e) {
            // @non-translatable
            throw new ExceptionBase(null, "Could not read InputStream", e);
        }

        return encodedString;
    }

    /**
     * Extract primary key values from recordSaved (if autonumbered table) or from recordToSave.
     *
     * @param recordWithPrimaryKeyValues to get the primary key values from.
     * @param tableDef of the sync table.
     * @return map of field name to field value for primary keys.
     */
    static Map<String, String> extractPrimaryKeys(final DataRecord recordWithPrimaryKeyValues,
            final TableDef.ThreadSafe tableDef) {
        final Map<String, String> keys = new HashMap<String, String>();
        for (final ArchibusFieldDefBase.Immutable fieldDef : tableDef.getPrimaryKey().getFields()) {
            final String fieldName = fieldDef.fullName();
            final String fieldValue = recordWithPrimaryKeyValues.getNeutralValue(fieldName);

            keys.put(fieldDef.getName(), fieldValue);
        }

        return keys;
    }

    /**
     * Prepares document field names: extracts names of document fields present in the recordDto.
     *
     * @param tableDef of the sync table.
     * @param recordDto DTO of the record, to extract field names from. Can contain names of fields
     *            that do not exist in sync table.
     * @return names of document fields present in the recordDto.
     */
    static List<String> prepareDocumentFieldNames(final TableDef.ThreadSafe tableDef,
            final Record recordDto) {
        final List<String> documentFieldNames = new ArrayList<String>();

        for (final FieldNameValue fieldNameValue : recordDto.getFieldValues()) {
            final String fieldName = fieldNameValue.getFieldName();
            final ArchibusFieldDefBase.Immutable fieldDef = tableDef.findFieldDef(fieldName);
            if (fieldDef != null && fieldDef.isDocument()) {
                // document field
                documentFieldNames.add(fieldName);
            }
        }

        return documentFieldNames;
    }

    /**
     * Separates field names into two lists: document and non-document fields. Excludes fields that
     * don't exist in sync table.
     *
     * @param fieldNames list of field names which might contain both document and non-document
     *            fields, also fields with names with "_contents" postfix.
     * @param tableDef of the sync table.
     * @return field names separated into two lists.
     */
    static FieldNames separateFieldNames(final List<String> fieldNames, final ThreadSafe tableDef) {
        final List<String> nonDocumentFieldNames = new ArrayList<String>();
        final List<String> documentFieldNames = new ArrayList<String>();

        for (final String fieldName : fieldNames) {
            // Exclude fields that do not exist in sync table
            if (tableDef.findFieldDef(fieldName) != null) {
                if (tableDef.getFieldDef(fieldName).isDocument()) {
                    documentFieldNames.add(fieldName);
                } else {
                    nonDocumentFieldNames.add(fieldName);
                }
            }
        }

        final FieldNames fieldNamesSeparated = new FieldNames();
        fieldNamesSeparated.setDocumentFieldNames(documentFieldNames);
        fieldNamesSeparated.setNonDocumentFieldNames(nonDocumentFieldNames);

        return fieldNamesSeparated;
    }
}
