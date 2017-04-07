package com.archibus.controls.arcgis;

import java.io.*;
import java.text.ParseException;

import org.apache.http.HttpResponse;
import org.apache.log4j.Logger;
import org.json.*;

/**
 *
 * Parses the HTTP response of an ArcGIS Server. Used by the Standard Esri Map Control and the
 * Extensions for Esri.
 *
 * @author knight
 *
 */

public final class ArcgisHttpResponseParser {
    
    /**
     * Logger used to output debugging results.
     */
    @SuppressWarnings({ "PMD.AvoidStaticFields" })
    private static Logger log = Logger.getLogger(ArcgisHttpResponseParser.class);

    /**
     * Constructor not called.
     */
    private ArcgisHttpResponseParser() {
        
    }
    
    /**
     *
     * Gets the result from the HTTP response.
     *
     * @param httpResponse The HTTP response.
     * @return The result.
     *
     */
    public static JSONObject getResult(final HttpResponse httpResponse) {
        log.info("Parsing ArcGIS Server response...");

        JSONObject result = new JSONObject();
        BufferedReader reader = null;
        
        try {
            reader =
                    new BufferedReader(new InputStreamReader(httpResponse.getEntity().getContent(),
                        "UTF-8"));
            final StringBuilder builder = new StringBuilder();
            for (;;) {
                final String line = reader.readLine();
                if (line == null) {
                    break;
                }
                builder.append(line).append("\n");
            }
            final JSONTokener tokener = new JSONTokener(builder.toString());
            result = new JSONObject(tokener);

        } catch (final IOException error) {
            log.error("IO exception reading ArcGIS Server response : " + error.getMessage());

        } catch (final ParseException error) {
            log.error("Parsing exception reading ArcGIS Server response : " + error.getMessage());
        } finally {
            if (reader != null) {
                try {
                    reader.close();
                } catch (final IOException error) {
                    log.error("IO Exception closing ArcGIS Server response : " + error.getMessage());
                }
            }
        }
        
        return result;
    }
    
}
