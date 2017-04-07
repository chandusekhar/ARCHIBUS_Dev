package com.archibus.eventhandler.ehs;

import java.io.*;
import java.text.ParseException;
import java.util.Map;

import org.directwebremoting.io.*;
import org.json.JSONArray;

import com.archibus.context.ContextStore;
import com.archibus.service.*;
import com.archibus.service.DocumentService.DocumentParameters;
import com.archibus.utility.*;

/**
 * Provide methods to handle documents.
 * 
 * @author Ioan Draghici
 * @since 20.1
 * 
 */
public final class EhsDocumentHelper {
    /**
     * Bean name.
     */
    private static final String DOC_SERVICE_BEAN = "documentService";
    
    /**
     * Lock status "0".
     */
    private static final String LOCK_STATUS_ZERO = "0";
    
    /**
     * Private default constructor: utility class is non-instantiable.
     */
    private EhsDocumentHelper() {
        
    }
    
    /**
     * Check in document.
     * 
     * @param fileName file name
     * @param version file version
     * @param pKey primary key
     * @param docTable doc table name
     * @param docField doc field name
     * @param data input data
     */
    public static void checkInDocument(final String fileName, final int version,
            final Map<String, String> pKey, final String docTable, final String docField,
            final String data) {
        final DocumentService documentService =
                (DocumentService) ContextStore.get().getBean(DOC_SERVICE_BEAN);
        // get input stream
        final InputStream input = getInputStream(data);
        
        if (version > 0) {
            documentService.checkinNewVersion(input, pKey, docTable, docField, fileName, "",
                Integer.toString(version));
        } else {
            documentService.checkinNewFile(input, pKey, docTable, docField, fileName, "",
                Integer.toString(version));
        }
        
    }
    
    /**
     * Check out document and save it to disk.
     * 
     * @param fileName file name
     * @param version file version
     * @param pKey primary key
     * @param docTable document table
     * @param docField document field
     * @return file full name
     */
    public static String checkOutFile(final String fileName, final int version,
            final Map<String, String> pKey, final String docTable, final String docField) {
        String fileFullName = "";
        // check out document
        final byte[] buffer = checkOutDocument(fileName, version, pKey, docTable, docField);
        
        // save to temporary file
        fileFullName = saveToFile(fileName, buffer);
        
        return fileFullName;
    }
    
    /**
     * Copy documents from source to target.
     * 
     * @param source source keys
     * @param target target keys
     * @param targetName target file name
     * @param docTable document table
     * @param docField document field
     */
    public static void copyDocuments(final Map<String, String> source,
            final Map<String, String> target, final String targetName, final String docTable,
            final String docField) {
        final DocumentParameters sourceParameters =
                new DocumentParameters(source, docTable, docField, null, true);
        final DocumentParameters targetParameters =
                new DocumentParameters(target, docTable, docField, targetName, null,
                    LOCK_STATUS_ZERO);
        final DocumentService documentService =
                (DocumentService) ContextStore.get().getBean(DOC_SERVICE_BEAN);
        documentService.copyDocument(sourceParameters, targetParameters);
    }
    
    /**
     * Check out document and return byte array.
     * 
     * @param fileName file name
     * @param version file version
     * @param pKey primary key
     * @param docTable document table
     * @param docField document field
     * @return byte array
     */
    private static byte[] checkOutDocument(final String fileName, final int version,
            final Map<String, String> pKey, final String docTable, final String docField) {
        final DocumentService documentService =
                (DocumentService) ContextStore.get().getBean(DOC_SERVICE_BEAN);
        final FileTransfer fileTransfer =
                documentService.checkOut(pKey, docTable, docField, LOCK_STATUS_ZERO, false,
                    fileName, Integer.toString(version));
        final OutputStreamLoader outputStreamLoader = fileTransfer.getOutputStreamLoader();
        try {
            final ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            
            outputStreamLoader.load(outputStream);
            
            return outputStream.toByteArray();
        } catch (final IOException e) {
            // @non-translatable
            throw new ExceptionBase(null, "Could not read InputStream", e);
        }
        
    }
    
    /**
     * Convert file data to input stream.
     * 
     * @param data file data
     * @return input stream
     * @throws ExceptionBase exception base
     */
    private static InputStream getInputStream(final String data) throws ExceptionBase {
        try {
            final JSONArray array = new JSONArray(data);
            final byte[] bytes = new byte[array.length()];
            for (int i = 0; i < array.length(); i++) {
                bytes[i] = (byte) array.getInt(i);
            }
            return new ByteArrayInputStream(bytes);
        } catch (final ParseException e) {
            throw new ExceptionBase("Document Check in Failed");
        }
    }
    
    /**
     * Save document to temporary file and return file full name.
     * 
     * @param fileName file name
     * @param buffer input stream
     * @return file path
     */
    private static String saveToFile(final String fileName, final byte[] buffer) {
        final com.archibus.context.Context context = ContextStore.get();
        final String folderPath =
                context.getWebAppPath() + File.separator + "schema" + File.separator + "per_site"
                        + File.separator + "users" + File.separator + context.getUser().getName();
        // check if folder exist
        FileUtil.createFoldersIfNot(folderPath);
        
        // save file
        final String fileFullName = folderPath + File.separator + fileName;
        FileUtil.saveAs(buffer, fileFullName);
        
        return fileFullName;
    }
}
