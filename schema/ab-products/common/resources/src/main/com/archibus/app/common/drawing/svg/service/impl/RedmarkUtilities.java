package com.archibus.app.common.drawing.svg.service.impl;

import java.io.*;
import java.nio.charset.Charset;
import java.util.Map;
import java.util.regex.Pattern;

import org.apache.commons.codec.binary.Base64;
import org.directwebremoting.io.*;

import com.archibus.dao.jdbc.DocumentDaoImpl;
import com.archibus.service.DocumentService.DocumentParameters;
import com.archibus.utility.ExceptionBase;

/**
 *
 * Utilities for Redmarks.
 * <p>
 *
 * @author Ying
 * @since 22.1
 *
 */
public final class RedmarkUtilities {

    /**
     * regular express to test the image extension.
     */
    private static final String IMAGE_PATTERN = "([^\\s]+(\\.(?i)(/bmp|jpg|gif|png))$)";

    /**
     * UTF-8 encoding.
     */
    private static final String ENCODING_UTF8 = "UTF-8";

    /**
     * VERSION.
     */
    private static final String VERSION = "0";
    
    /**
     * Private default constructor: utility class is non-instantiable.
     */
    private RedmarkUtilities() {
    }

    /**
     * Checks-in a String to document field.
     *
     * @param fileContent String the document content. Required.
     * @param keys Map of primary key values for the record with document. Required.
     * @param parameters Map of check in parameters. Required
     *
     * @throws ExceptionBase if check in the document string content throws an exception.
     */
    public static void checkin(final String fileContent, final Map<String, String> keys,
            final Map<String, String> parameters) throws ExceptionBase {
        final DocumentParameters validParameters = parseParameters(keys, parameters);

        final InputStream inputStream =
                convertAsInputStream(fileContent, validParameters.getDocumentName());
        // TODO: documentDao using java bean
        final DocumentDaoImpl documentDao = new DocumentDaoImpl();
        documentDao.checkinNewFile(inputStream, validParameters.getKeys(),
            validParameters.getTableName(), validParameters.getFieldName(),
            validParameters.getDocumentName(), validParameters.getDescription(),
            validParameters.getLockStatus());
        
    }

    /**
     * Checks-out the content of the document as a String.
     *
     * @param keys Map of primary key values for the record with document. Required.
     * @param parameters Map of check out parameters. Required
     * @throws ExceptionBase if check out the document throws an exception.
     * @return String document content as String.
     */
    public static String checkOut(final Map<String, String> keys,
            final Map<String, String> parameters) throws ExceptionBase {
        final DocumentParameters validParameters = parseParameters(keys, parameters);
        // TODO: documentDao using java bean
        final DocumentDaoImpl documentDao = new DocumentDaoImpl();

        // call show() function to always check out the last version
        final FileTransfer fileTransfer =
                documentDao.show(validParameters.getKeys(), validParameters.getTableName(),
                    validParameters.getFieldName(), validParameters.getDocumentName(), VERSION,
                    true, "checkOut");

        return convertFileTransferToString(fileTransfer);
        
    }
    
    /**
     * change client side parameter to the document parameter for check in/out.
     *
     * @param keys Map of primary key values for the record with document.
     * @param parameters parsed client side parameters.
     * @return DocumentParameter object for Document service.
     * @throws ExceptionBase when error occurs.
     */
    static DocumentParameters parseParameters(final Map<String, String> keys,
            final Map<String, String> parameters) throws ExceptionBase {
        
        final String tableName = parameters.get(RedmarkConstants.PARAMETER_TABLENAME);
        final String fieldName = parameters.get(RedmarkConstants.PARAMETER_FIELDNAME);

        final String documentName = parameters.get(RedmarkConstants.PARAMETER_DOCUMENT_NAME);
        final String description = parameters.get(RedmarkConstants.PARAMETER_DESCRIPTION);

        return new DocumentParameters(keys, tableName, fieldName, documentName, description, null,
            true, VERSION);
    }

    /**
     * Convert File Content from String to InputStream.
     *
     * @param fileContent the file content as string.
     * @param documentName the document name of the file.
     * @return InputStream converted from the string.
     * @throws ExceptionBase when error occurs.
     */
    static InputStream convertAsInputStream(final String fileContent, final String documentName)
            throws ExceptionBase {
        InputStream inputStream = null;

        // regular express pattern to test the image extension.
        final Pattern pattern = Pattern.compile(IMAGE_PATTERN);
        
        // check if it is image(png, jpg, bmp or gif.
        final boolean isImage = pattern.matcher(documentName).matches();
        if (isImage) {
            final byte[] byteArray = Base64.decodeBase64(fileContent.getBytes());
            inputStream = new ByteArrayInputStream(byteArray);
        } else {
            inputStream =
                    new ByteArrayInputStream(fileContent.getBytes(Charset.forName(ENCODING_UTF8)));
        }
        return inputStream;
    }

    /**
     * Convert FileTrasnfer Content to String.
     *
     * @param fileTransfer the fileTransfer object from checkOut.
     * @return String converted from the fileTransfer object.
     * @throws ExceptionBase when error occurs.
     */
    static String convertFileTransferToString(final FileTransfer fileTransfer) throws ExceptionBase {
        final OutputStreamLoader outstreamLoader = fileTransfer.getOutputStreamLoader();
        final OutputStream out = new ByteArrayOutputStream();
        String fileContentAsString = "";

        if (outstreamLoader != null) {
            try {
                outstreamLoader.load(out);
                fileContentAsString = out.toString();
            } catch (final IOException e) {
                final ExceptionBase exception = new ExceptionBase();
                exception.setPattern(e.getLocalizedMessage());
                throw exception;
            }
        }

        return fileContentAsString;
    }
    
}
