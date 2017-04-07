package com.archibus.app.common.connectors.translation.json.inbound;

import java.io.*;
import java.nio.charset.Charset;

import net.minidev.json.JSONArray;

import org.apache.commons.io.IOUtils;

import com.archibus.app.common.connectors.exception.StepException;
import com.archibus.app.common.connectors.transfer.exception.AdaptorException;
import com.archibus.app.common.connectors.translation.common.inbound.*;
import com.archibus.app.common.connectors.translation.exception.TranslationException;
import com.jayway.jsonpath.JsonPath;

/**
 * A parser that extracts nodes from JSON in an input stream.
 *
 * @author cole
 *
 */
public class JsonRecordParser implements IRecordParser<InputStream, Object> {
    /**
     * The jsonPath to find the elements.
     */
    private final String elementsJSONPath;

    /**
     * Indicates whether the matched element should be processed as an array of records instead of a
     * single record.
     */
    private final boolean processArrayElements;

    /**
     * The encoding of characters in the text stream.
     */
    private final Charset characterEncoding;

    /**
     * Create a class for parsing an JSON document from a stream and extracting nodes matched by the
     * given jsonPath.
     *
     * @param elementsJSONPath the jsonPath to find transactions in the JSON message.
     * @param processArrayElements if set, indicates that an array found at the elementsJSONPath
     *            should have each element processed, instead of being treated as a record itself.
     * @param characterEncoding the encoding of characters in the text stream.
     */
    public JsonRecordParser(final String elementsJSONPath, final boolean processArrayElements,
            final Charset characterEncoding) {
        this.elementsJSONPath = elementsJSONPath;
        this.processArrayElements = processArrayElements;
        this.characterEncoding = characterEncoding;
    }

    /**
     * Parse an JSON document from a stream and return a node matched by the given xPath. If the
     * matched node is an array, then each element of h
     *
     * @param jsonInputStream the source of JSON.
     * @param handler for whatever needs to be done with the record.
     * @throws StepException if an error occurs in the handler.
     */
    public void parse(final InputStream jsonInputStream, final IRecordHandler<Object, ?> handler)
            throws StepException {
        AdaptorException adaptorException = null;
        try {
            final Object jsonObject =
                    JsonPath.read(IOUtils.toString(jsonInputStream, this.characterEncoding.name()),
                        this.elementsJSONPath);
            if (jsonObject instanceof JSONArray && this.processArrayElements) {
                final JSONArray jsonArray = (JSONArray) jsonObject;
                for (int recordIndex = 0; recordIndex < jsonArray.size(); recordIndex++) {
                    handler.handleRecord(jsonArray.get(recordIndex));
                }
            } else {
                handler.handleRecord(jsonObject);
            }
        } catch (final IOException e) {
            throw new TranslationException("Unable to read JSON input stream.", e);
        } finally {
            /*
             * Note: this will happen even if the catch block throws it's exception.
             */
            try {
                jsonInputStream.close();
            } catch (final IOException e) {
                if (adaptorException == null) {
                    adaptorException = new AdaptorException("Unable to close stream.", e);
                }
            }
        }
        if (adaptorException != null) {
            throw adaptorException;
        }
    }
}
