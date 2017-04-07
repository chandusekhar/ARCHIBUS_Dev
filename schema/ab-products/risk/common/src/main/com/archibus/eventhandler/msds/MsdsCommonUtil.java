package com.archibus.eventhandler.msds;

import java.io.*;
import java.net.URLConnection;
import java.text.MessageFormat;
import java.util.*;

import org.apache.log4j.Logger;

import com.archibus.context.ContextStore;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.service.DocumentService;
import com.archibus.utility.*;

/**
 * MSDS Common Handler.
 * 
 * 
 * @author ASC-BJ:Zhang Yi
 */
public final class MsdsCommonUtil {
    
    /**
     * Initial byte array size for reading file content.
     */
    private static final int BYTE_ARRAY_SIZE = 512;
    
    /**
     * Max size of doc name.
     */
    private static final int DOC_NAME_MAX_SIZE = 64;
    
    /**
     * Max size of doc name.
     */
    private static final int DOC_NAME_TRUNCATE_SIZE = 61;
    
    /**
     * String value "0" of status.
     */
    private static final String STATUS_0 = "0";
    
    /**
     * Table name "msds_data".
     */
    private static final String MSDS_DATA = "msds_data";
    
    /**
     * Field name "doc".
     */
    private static final String DOC = "doc";
    
    /**
     * String value "1" of status.
     */
    private static final String STATUS_1 = "1";
    
    /**
     * Indicates the char "'".
     */
    private static final char CHAR_SINGLE_QUOTATION = '/';
    
    /**
     * Logger to write messages to archibus.log.
     */
    private MsdsCommonUtil() {
    }
    
    /**
     * check remote file into a doc field msds_data.doc.
     * 
     * @param logger log object instance
     * @param documentService DocumentService bean
     * @param msdsId String msds code
     * @param remoteFileName string file name
     * @param urlConnection URLConnection connection
     * @param isNew boolean sign indicate if check in new file to current msds data or update an
     *            existed version
     * 
     * @throws IOException e
     */
    public static void checkInFile(final Logger logger, final DocumentService documentService,
            final String msdsId, final String remoteFileName, final URLConnection urlConnection,
            final boolean isNew) throws IOException {
        
        // construct primary key map of msds_id
        final Map<String, String> keys = new HashMap<String, String>();
        keys.put("msds_id", msdsId);
        
        // determine whether currently check in operation is 0:new or 1:update
        final String status = isNew ? STATUS_0 : STATUS_1;
        
        // get actual file name without prefix.
        String fileName = remoteFileName;
        if (StringUtil.notNullOrEmpty(fileName)) {
            
            int found = fileName.indexOf(CHAR_SINGLE_QUOTATION);
            while (found != -1) {
                fileName = fileName.substring(found + 1, fileName.length());
                found = fileName.indexOf(CHAR_SINGLE_QUOTATION);
            }
            
            // kb#3041729:when file name's size is over 64, truncate it to match the msds_data.doc
            // field's size.
            if (fileName.length() > DOC_NAME_MAX_SIZE) {
                fileName = "..." + fileName.substring(fileName.length() - DOC_NAME_TRUNCATE_SIZE);
            }
        }
        
        final InputStream ins = convertToLocalInputStream(logger, urlConnection.getInputStream());
        
        // call document service to check in remote file for msds_data
        documentService.checkinNewFile(ins, keys, MSDS_DATA, DOC,
            StringUtil.replace(fileName, "%20", " "), "MSDS Data Document", status);
        
        // remove lock after check-in
        documentService.changeLockStatus(keys, MSDS_DATA, DOC, STATUS_0, true);
        
    }
    
    /**
     * @return a converted local input stream from remote input stream.
     * 
     * @param logger log object instance
     * @param inputStream Remote input stream by url
     */
    public static InputStream convertToLocalInputStream(final Logger logger,
            final InputStream inputStream) {
        
        final byte[] tmp = new byte[BYTE_ARRAY_SIZE];
        final ByteArrayOutputStream out = new ByteArrayOutputStream();
        int bytesRead = -1;
        
        try {
            bytesRead = inputStream.read(tmp);
        } catch (final IOException e) {
            final String errorMessage =
                    MessageFormat.format(
                        "Read remote file content encounters error.\nRoot cause: {0}",
                        e.getMessage());
            logExceptionMessageAndThrowExceptionBase(logger, errorMessage, ContextStore.get()
                .getEventHandlerContext());
        }
        while (bytesRead != -1) {
            out.write(tmp, 0, bytesRead);
            try {
                bytesRead = inputStream.read(tmp);
            } catch (final IOException e) {
                final String errorMessage =
                        MessageFormat.format(
                            " Read remote file content encounters error.\nRoot cause: {0}",
                            e.getMessage());
                logExceptionMessageAndThrowExceptionBase(logger, errorMessage, ContextStore.get()
                    .getEventHandlerContext());
            }
        }
        return new ByteArrayInputStream(out.toByteArray());
        
    }
    
    /**
     * Write message to log file.
     * 
     * @param logger log object instance
     * @param errorMessage String message will write to archibus.log
     * @param context EventHandlerContext context object
     */
    public static void logExceptionMessageAndThrowExceptionBase(final Logger logger,
            final String errorMessage, final EventHandlerContext context) {
        
        if (logger.isDebugEnabled()) {
            logger.error(errorMessage);
        }
        context.addResponseParameter("jsonExpression", "err");
        // @non-translatable
        throw new ExceptionBase("Download Msds data document from remote URL has failed:"
                + errorMessage);
        
    }
    
}
