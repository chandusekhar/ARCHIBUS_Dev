package com.archibus.service.common;

import java.io.*;
import java.text.ParseException;
import java.util.*;

import org.json.JSONArray;

import com.archibus.context.*;
import com.archibus.ext.report.ReportUtility;
import com.archibus.service.DocumentService;
import com.archibus.utility.*;

/**
 * Utility class. Provides helper functions for the drawing service
 * 
 * @author ec
 * @since 20.2
 * 
 */
public final class DrawingServiceImageHelper {
    
    /**
     * -.
     */
    private static final String DASH = "-";
    
    /**
     * Private default constructor: utility class is non-instantiable.
     * 
     * @throws InstantiationException always, since this constructor should never be called.
     */
    private DrawingServiceImageHelper() throws InstantiationException {
        throw new InstantiationException("Never instantiate " + this.getClass().getName()
                + "; use static methods!");
    }
    
    /**
     * Write png data to file.
     * 
     * @param viewName axvw view name
     * @param data png data
     * @return full file path
     */
    static String writeImageToFile(final String viewName, final String data) {
        final Context ctxt = ContextStore.get();
        final String filePath =
                ctxt.getWebAppPath() + ReportUtility.getPerUserReportFilesPath(ctxt);
        FileUtil.createFoldersIfNot(filePath);
        // save redlines image on server
        final String fullFilePath = filePath + ReportUtility.createFileName(viewName, "png");
        final File file = new File(fullFilePath);
        try {
            final JSONArray array = new JSONArray(data);
            final byte[] bytes = new byte[array.length()];
            for (int i = 0; i < array.length(); i++) {
                bytes[i] = (byte) array.getInt(i);
            }
            final ByteArrayInputStream bais = new ByteArrayInputStream(bytes);
            bais.toString();
            
            final FileOutputStream fos = new FileOutputStream(file);
            int bytedata = bais.read();
            while (bytedata != -1) {
                final char chaar = (char) bytedata;
                fos.write(chaar);
                bytedata = bais.read();
            }
            fos.flush();
            fos.close();
        } catch (ParseException e) {
            throw new ExceptionBase("Saving image to file failed");
        } catch (FileNotFoundException fnfe) {
            throw new ExceptionBase("Saving image to file failed - file not found " + fullFilePath);
        } catch (IOException ioe) {
            throw new ExceptionBase("Saving image to file failed - IO " + fullFilePath);
        }
        return fullFilePath;
    }
    
    /**
     * Check in redlines document as attachment to a service request (activity_log record).
     * 
     * @param data redlines image dataString
     * @param activityLogId service request id
     * @param docField document field name
     * @throws ExceptionBase if check-in of document failed
     */
    static void checkInRedlinesDoc(final String data, final int activityLogId, final String docField)
            throws ExceptionBase {
        // save redlines as document in the database
        try {
            final JSONArray array = new JSONArray(data);
            final byte[] bytes = new byte[array.length()];
            for (int i = 0; i < array.length(); i++) {
                bytes[i] = (byte) array.getInt(i);
            }
            DrawingServiceImageHelper.checkInRedlinesDoc(new ByteArrayInputStream(bytes),
                activityLogId, docField);
        } catch (ParseException e) {
            throw new ExceptionBase("Document Check in Failed");
        }
        
    }
    
    /**
     * Check in redlines document as attachment to a service request (activity_log record).
     * 
     * @param input redlines image Inputstream.
     * @param activityLogId service request id.
     * @param docField document field name.
     */
    static void checkInRedlinesDoc(final InputStream input, final int activityLogId,
            final String docField) {
        final DocumentService documentService =
                (DocumentService) ContextStore.get().getBean("documentService");
        final Map<String, String> keys = new HashMap<String, String>();
        keys.put(DrawingService.ACTIVITY_LOG_ID_FIELD_NAME, Integer.toString(activityLogId));
        
        final String fileName =
                DrawingService.ACTIVITY_LOG_TABLE_NAME + DASH + activityLogId + DASH + docField
                        + ".png";
        documentService.checkinNewFile(input, keys, DrawingService.ACTIVITY_LOG_TABLE_NAME,
            docField, fileName, DrawingService.REDLINESTABLENAME, "0");
    }
}
