package com.archibus.controls.arcgis;

import java.io.*;

import org.apache.http.HttpResponse;
import org.apache.http.client.*;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.log4j.Logger;
import org.json.JSONObject;

/**
 *
 * Executes an HTTP post to an ArcGIS Server. Used by the Standard Esri Map Control and the
 * Extensions for Esri.
 *
 * @author knight
 *
 */
public final class ArcgisHttpClient {

    /**
     * The Logger object used to log messages to archibus.log.
     */
    @SuppressWarnings({ "PMD.AvoidStaticFields" })
    private static Logger log = Logger.getLogger(ArcgisHttpClient.class);

    /**
     *
     * Constructor not called.
     *
     */
    private ArcgisHttpClient() {

    }

    /**
     *
     * Create and execute the http post.
     *
     * @param url The url for the ArcGIS Server service.
     * @param parameters The url parameters for the http post.
     * @return The http response from the ArcGIS Server.
     */
    public static JSONObject executePost(final String url, final String parameters) {

        log.info("Executing ArcGIS Server post...");
        
        final HttpClient httpClient = new DefaultHttpClient();
        HttpResponse httpResponse = null;
        JSONObject result = null;
        try {
            final HttpPost httpPost = new HttpPost(url);
            final StringEntity stringEntity = new StringEntity(parameters);
            httpPost.addHeader("content-type", "application/x-www-form-urlencoded");
            httpPost.setEntity(stringEntity);
            httpResponse = httpClient.execute(httpPost);

            result = ArcgisHttpResponseParser.getResult(httpResponse);

        } catch (final UnsupportedEncodingException error) {
            log.error("Encoding exception posting to ArcGIS Server : " + error.getMessage());
            
        } catch (final ClientProtocolException error) {
            log.error("Client protocol exception posting to ArcGIS Server : " + error.getMessage());
            
        } catch (final IOException error) {
            log.error("IO exception posting to ArcGIS Server : " + error.getMessage());
            
        } finally {
            httpClient.getConnectionManager().shutdown();
        }
        
        return result;
    }
}
