package com.archibus.app.common.extensionsarcgis;

import java.io.*;
import java.text.ParseException;

import org.apache.log4j.Logger;
import org.json.*;

/**
 *
 *
 * Provides methods to read and write JSON files.
 *
 * @author knight
 *
 */
public final class JsonReaderWriter {
    
    /**
     * Logger used to output debugging results.
     */
    @SuppressWarnings({ "PMD.AvoidStaticFields" })
    // See KB# 3051675
    private static Logger log = Logger.getLogger(JsonReaderWriter.class);
    
    /**
     * Constructor not called.
     */
    private JsonReaderWriter() {
        
    }
    
    /**
     *
     * Read JSON object from file.
     *
     * @param filename The name of the JSON file to read.
     * @return The contents of the JSON file.
     */
    protected static JSONObject readFile(final String filename) {
        
        log.info("Reading JSON file: " + filename.toLowerCase());
        
        JSONObject contents = null;
        BufferedReader bufferedReader = null;
        
        try {
            
            String sCurrentLine;
            bufferedReader = new BufferedReader(new FileReader(filename.toLowerCase()));
            final StringBuilder stringBuilder = new StringBuilder();
            
            sCurrentLine = bufferedReader.readLine();
            while (sCurrentLine != null) {
                stringBuilder.append(sCurrentLine);
                sCurrentLine = bufferedReader.readLine();
            }
            final JSONTokener jsonTokener = new JSONTokener(stringBuilder.toString());
            contents = (JSONObject) jsonTokener.nextValue();
            
        } catch (final IOException error) {
            log.error("IO error reading JSON file : " + error.getMessage());
        } catch (final ParseException error) {
            log.error("Error parsing JSON file : " + error.getMessage());
        } finally {
            try {
                if (bufferedReader != null) {
                    bufferedReader.close();
                }
            } catch (final IOException error) {
                log.error("IO error closing JSON reader : " + error.getMessage());
            }
        }
        
        return contents;
    }
    
    /**
     *
     * Write JSON object to file.
     *
     * @param contents The contents of the JSON file.
     * @param filename The name of the JSON file to write.
     */
    protected static void writeFile(final JSONObject contents, final String filename) {
        
        log.info("Writing JSON file: " + filename.toLowerCase());
        
        try {
            
            final FileWriter fileWriter = new FileWriter(filename.toLowerCase());
            fileWriter.write(contents.toString());
            fileWriter.flush();
            fileWriter.close();
            
        } catch (final IOException error) {
            log.error("IO error writing JSON file : " + error.getMessage());
        }
        
    }
    
}
