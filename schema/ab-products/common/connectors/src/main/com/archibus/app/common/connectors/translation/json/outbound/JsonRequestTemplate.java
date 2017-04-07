package com.archibus.app.common.connectors.translation.json.outbound;

import java.io.*;
import java.nio.charset.Charset;
import java.util.*;
import java.util.Map.Entry;

import net.minidev.json.*;

import com.archibus.app.common.connectors.translation.common.outbound.IWrappedRequestTemplate;
import com.archibus.app.common.connectors.translation.common.outbound.impl.AbstractDataSourceRequestTemplate;
import com.archibus.app.common.connectors.translation.exception.TranslationException;
import com.archibus.app.common.connectors.translation.json.JsonConstants;
import com.jayway.jsonpath.JsonPath;

/*
 * TODO threading/streaming of JSON generation
 */
/*
 * TODO start with a JSONArray instead of a recordsTemplate to make it more modular?
 */
/**
 * A template for generating a list of delimited text fields.
 *
 * @author cole
 *
 */
public class JsonRequestTemplate extends AbstractDataSourceRequestTemplate<InputStream> implements
        IWrappedRequestTemplate<InputStream> {
    
    /**
     * The JSON to be written to the stream.
     */
    private final Object jsonOutput;
    
    /**
     * The JSON for a single record.
     */
    private final String recordTemplate;
    
    /**
     * The record array to add records to within the jsonOutput.
     */
    private final JSONArray recordArray;

    /**
     * The encoding of characters in the text stream.
     */
    private final Charset characterEncoding;
    
    /**
     * Create a template for generating an JSON node from fields.
     *
     * @param dataSourceFieldName the field name referring to a DataSource object in template
     *            parameters.
     * @param recordsTemplate JSON that should contain records with a placeholder for records.
     * @param pathToRecords JSONPath path to records array in the records template. Must resolve to
     *            a JSONArray.
     * @param recordTemplate the template for a specific record.
     * @param characterEncoding the encoding of characters in the text stream.
     */
    public JsonRequestTemplate(final String dataSourceFieldName, final Object recordsTemplate,
            final String pathToRecords, final Object recordTemplate, final Charset characterEncoding) {
        super(dataSourceFieldName);
        this.jsonOutput = JsonPath.read(recordsTemplate.toString(), JsonConstants.JSON_ROOT);
        this.recordTemplate = recordTemplate.toString();
        this.recordArray = JsonPath.read(this.jsonOutput, pathToRecords);
        this.characterEncoding = characterEncoding;
    }
    
    /**
     * Generate beginning of JSON for wrapping a series of records.
     *
     * @param templateParameters presently ignored.
     * @return empty input stream
     */
    public InputStream generateStart(final Map<String, Object> templateParameters) {
        return new ByteArrayInputStream(new byte[0]);
    }
    
    /**
     * Generate JSON for a record.
     *
     * @param requestParameters a map of jsonPath to a value for an element or attribute referenced
     *            by that xPath.
     * @return empty input stream
     * @throws TranslationException if the recordTemplate cannot be copied.
     */
    public InputStream generateRequest(final Map<String, Object> requestParameters)
            throws TranslationException {
        final Object recordObject = JsonPath.read(this.recordTemplate, JsonConstants.JSON_ROOT);
        for (final Entry<String, ?> field : requestParameters.entrySet()) {
            final int fieldNameDelimiterIndex = field.getKey().lastIndexOf('.');
            if (fieldNameDelimiterIndex > -1) {
                final JSONObject fieldObject =
                        JsonPath.read(recordObject,
                            field.getKey().substring(0, fieldNameDelimiterIndex));
                fieldObject.put(field.getKey().substring(fieldNameDelimiterIndex + 1),
                    field.getValue());
            } else if (recordObject instanceof JSONObject) {
                ((JSONObject) recordObject).put(field.getKey(), field.getValue());
            } else {
                throw new TranslationException("The field " + field.getKey()
                        + " does not refer to an attribute of a JSON object.", null);
            }
        }
        this.recordArray.add(recordObject);
        return new ByteArrayInputStream(new byte[0]);
    }
    
    /**
     * Generate ending of JSON for wrapping a series of records.
     *
     * @param templateParameters presently ignored.
     * @return InputStream with JSON representing records.
     * @throws TranslationException if the character encoding is invalid (should not happen, due to
     *             use of character set).
     */
    public InputStream generateEnd(final Map<String, Object> templateParameters)
            throws TranslationException {
        try {
            return new ByteArrayInputStream(this.jsonOutput.toString().getBytes(
                this.characterEncoding.name()));
        } catch (final UnsupportedEncodingException e) {
            throw new TranslationException("Invalid character encoding used to encode string: "
                    + this.characterEncoding.name(), null);
        }
    }

    /**
     * @return the JSON object (usually JSONObject or JSONArray) with all the records thus far.
     */
    public Object getJsonOutput() {
        return this.jsonOutput;
    }
}
