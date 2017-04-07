package com.archibus.app.common.drawing.bim.service.impl.cloud;

import java.io.IOException;
import java.util.*;
import java.util.zip.GZIPInputStream;

import org.apache.http.*;
import org.apache.http.client.*;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.DefaultHttpClient;

import com.archibus.utility.ExceptionBase;

/**
 *
 Provides Services to retreat Revit file's Guids from Autodesk BIM Cloud Server.
 *
 * @author Yong Shao
 * @since 21.4
 *
 */
public final class RevitGuid {
    /**
     * Constant: BUFFER_SIZE.
     */
    private static final int BUFFER_SIZE = 1024;

    /**
     * Constant: REVIT_GUID_RETREAT_ERROR_MESSAGE.
     */
    private static final String REVIT_GUID_RETREAT_ERROR_MESSAGE =
            "Fail to get revit guids from Autodesk.";

    /**
     * Private default constructor: utility class is non-instantiable.
     */
    private RevitGuid() {
    }

    /**
     *
     * Gets the map of BIM Guid and corresponding Primary Key value.
     *
     * @param objectIdDbFullPath String.
     * @param accessToken String.
     * @return Map<String, Integer>.
     */
    public static Map<String, Integer> getMapping(final String objectIdDbFullPath,
            final String accessToken) {
        final Map<String, Integer> result = new HashMap<String, Integer>();
        final HttpClient httpClient = new DefaultHttpClient();
        final HttpGet httpGet = new HttpGet(objectIdDbFullPath);
        httpGet.addHeader("Access-Control-Allow-Origin", "*");
        httpGet.addHeader("Authorization", "Bearer " + accessToken);
        try {
            
            final HttpResponse httpResponse = httpClient.execute(httpGet);
            final HttpEntity entity = httpResponse.getEntity();
            if (entity != null) {
                processEntity(result, entity);
            }
        } catch (final ClientProtocolException e) {
            throw new ExceptionBase(REVIT_GUID_RETREAT_ERROR_MESSAGE, e);
        } catch (final IOException e) {
            throw new ExceptionBase(REVIT_GUID_RETREAT_ERROR_MESSAGE, e);
        } finally {
            if (httpGet != null) {
                httpGet.releaseConnection();
            }
        }
        return result;
    }
    
    /**
     *
     * Processes HTTP Entity for GZIP data.
     *
     * @param result Map<String, Integer>.
     * @param entity HttpEntit.
     */
    private static void processEntity(final Map<String, Integer> result, final HttpEntity entity) {
        entity.getContentEncoding();
        
        GZIPInputStream inputStream = null;
        try {
            inputStream = new GZIPInputStream(entity.getContent());
            
            final byte[] buffer = new byte[BUFFER_SIZE];
            final StringBuilder value = new StringBuilder();
            int bytesRead = inputStream.read(buffer);
            while (bytesRead != -1) {
                value.append(new String(buffer, 0, bytesRead));
                bytesRead = inputStream.read(buffer);
            }
            final String[] array = value.toString().split(",");
            String guid = "";
            for (int i = 0; i < array.length; i++) {
                guid = array[i];
                guid = guid.replaceAll("\\r\\n|\\r|\\n|\"|[|]", "").toUpperCase();
                result.put(guid, i);
            }
        } catch (final IllegalStateException e) {
            throw new ExceptionBase(REVIT_GUID_RETREAT_ERROR_MESSAGE, e);
        } catch (final IOException e) {
            throw new ExceptionBase(REVIT_GUID_RETREAT_ERROR_MESSAGE, e);
        } finally {
            closeInputStream(inputStream);
        }
    }
    
    /**
     *
     * TODO closeInputStream.
     *
     * @param inputStream GZIPInputStream.
     */
    private static void closeInputStream(final GZIPInputStream inputStream) {
        if (inputStream != null) {
            try {
                inputStream.close();
            } catch (final IOException e) {
                throw new ExceptionBase(REVIT_GUID_RETREAT_ERROR_MESSAGE, e);
            }
        }
    }
}
