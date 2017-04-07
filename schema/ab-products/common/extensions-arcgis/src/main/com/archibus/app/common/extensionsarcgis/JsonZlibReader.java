package com.archibus.app.common.extensionsarcgis;

import java.io.*;
import java.text.ParseException;
import java.util.zip.InflaterInputStream;

import org.apache.log4j.Logger;
import org.json.*;

/**
 *
 * Provides methods to read JSON.zlib files. Used by the Extensions for Esri.
 *
 * @author knight
 *
 */
public final class JsonZlibReader {
    
    /**
     * Logger used to output debugging results.
     */
    @SuppressWarnings({ "PMD.AvoidStaticFields" })
    // See KB# 3051675
    private static Logger log = Logger.getLogger(JsonZlibReader.class);
    
    /**
     * Buffer size constant.
     */
    private static final int BUFFER_SIZE = 1024;
    
    /**
     *
     * Constructor not called.
     *
     */
    private JsonZlibReader() {
        
    }
    
    /**
     *
     * Reads and uncompresses a JSON.zlib file.
     *
     * @param filename The filename of the JSON.zlib to read.
     * @return The uncompressed contents of the JSON.zlib.
     */
    public static JSONObject readFile(final String filename) {
        log.info("Reading JSON zlib file : " + filename);
        
        JSONObject contents = null;
        
        try {
            final File inputAssetFile = new File(filename);
            final FileInputStream inputStreamAssetFile = new FileInputStream(inputAssetFile);
            final InflaterInputStream zlibInputStream =
                    new InflaterInputStream(inputStreamAssetFile);
            final InputStreamReader streamReader = new InputStreamReader(zlibInputStream);
            
            final StringBuilder stringBuilder = new StringBuilder();
            final char[] buffer = new char[BUFFER_SIZE];
            for (;;) {
                final int bytesRead = streamReader.read(buffer);
                if (bytesRead == -1) {
                    break;
                }
                stringBuilder.append(buffer, 0, bytesRead);
            }
            final JSONTokener jsonTokener = new JSONTokener(stringBuilder.toString());
            contents = (JSONObject) jsonTokener.nextValue();
            streamReader.close();
            
        } catch (final FileNotFoundException error) {
            log.error("JSON zlib file not found : " + error.getMessage());
        } catch (final IOException error) {
            log.error("IO error reading JSON zlib file : " + error.getMessage());
        } catch (final ParseException error) {
            log.error("Error parsing JSON zlib file : " + error.getMessage());
        }
        
        return contents;
    }
    
}
