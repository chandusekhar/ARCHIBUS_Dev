package com.archibus.app.common.connectors.impl.json.outbound;

import java.nio.charset.Charset;

import net.minidev.json.*;

import com.archibus.app.common.connectors.domain.ConnectorConfig;
import com.archibus.app.common.connectors.exception.*;
import com.archibus.app.common.connectors.impl.CharEncodingUtil;
import com.archibus.app.common.connectors.impl.file.outbound.AbstractOutboundFileRequests;
import com.archibus.app.common.connectors.logging.IUserLog;
import com.archibus.app.common.connectors.translation.json.JsonConstants;
import com.archibus.app.common.connectors.translation.json.outbound.JsonRequestTemplate;

/**
 * A series of requests to a file system to store records as JSON.
 *
 * @author cole
 *
 */
public final class OutboundJsonRequests extends AbstractOutboundFileRequests {

    /**
     * A connector parameter for the JSON containing records.
     */
    private static final String RECORDS_TEMPLATE_PARAM = "recordsTemplate";

    /**
     * A connector parameter for JSON path expression into the records template that results in an
     * array to which records are added.
     */
    private static final String RECS_ARRAY_PATH_PARAM = "pathToRecordsArray";

    /**
     * A connector parameter for the JSON that is generated for each record in the record array.
     */
    private static final String RECORD_TEMPLATE = "recordTemplate";

    /**
     * A path into the record template to a JSON object to which fields attributes are to be added.
     */
    private static final String PATH_TO_RECORD_FIELDS_PARAM = "pathToRecordFields";
    
    /**
     * Generate a series of requests to a file system to produce records from JSON.
     *
     * @param stepName a descriptive name for this step.
     * @param connector the afm_connector record to use as configuration
     * @param log a place to write user friendly status messages
     * @throws StepException ConfigurationException if a connector rule is present that cannot be
     *             instantiated. AdaptorException if a connection cannot be established to an FTP
     *             server.
     */
    public OutboundJsonRequests(final String stepName, final ConnectorConfig connector,
            final IUserLog log) throws StepException {
        /*
         * Create requests.
         */
        // @formatter:off
        super(stepName, connector, createRecordDefinition(connector), createRequestTemplate(
            connector.getSourceTbl(), connector.getConnParams(),
            CharEncodingUtil.getCharacterEncoding(connector)), log);
        // @formatter:on
    }
    
    /**
     * @param connector the afm_connector record to use as configuration
     * @return a record definition representing the fields on this connector.
     * @throws ConfigurationException if a connector rule is present that cannot be instantiated.
     */
    private static JsonRequestRecordDefinition createRecordDefinition(
            final ConnectorConfig connector) throws ConfigurationException {
        return new JsonRequestRecordDefinition(connector, connector.getConnParams().optString(
            PATH_TO_RECORD_FIELDS_PARAM, generateFieldPath(connector.getForeignTxPath())));
    }
    
    /**
     * @param sourceTbl the connector's "source table" which is of the form
     *            element[.element]*.recordElementName.
     * @param parameters connector parameters, which may include alternative interpretations for the
     *            source table.
     * @param charSet the character set to use when writing JSON text.
     * @return a request template for generating JSON text from ARCHIBUS data records.
     */
    private static JsonRequestTemplate createRequestTemplate(final String sourceTbl,
            final org.json.JSONObject parameters, final Charset charSet) {
        return new JsonRequestTemplate(DATA_SOURCE_PARAM,
            parameters.has(RECORDS_TEMPLATE_PARAM) ? parameters.get(RECORDS_TEMPLATE_PARAM)
                    : generateRecordsTemplate(sourceTbl), parameters.optString(
                RECS_ARRAY_PATH_PARAM, getPathToRecords(sourceTbl)),
            parameters.has(RECORD_TEMPLATE) ? parameters.getJSONObject(RECORD_TEMPLATE)
                    : generateRecordTemplate(sourceTbl), charSet);
    }
    
    /**
     * Generates template JSON for a record in the record array.
     *
     * @param sourceTbl the connector's "source table" which is of the form
     *            element[.element]*.recordElementName.
     * @return A JSONObject with exactly one attribute called "recordElementName" that refers to a
     *         JSONObject with no attributes.
     */
    private static String generateFieldPath(final String sourceTbl) {
        final int elementIndex = sourceTbl.lastIndexOf('.');
        String jsonPath = JsonConstants.JSON_ROOT;
        if (elementIndex > 0 && elementIndex + 1 < sourceTbl.length()) {
            jsonPath += '.' + sourceTbl.substring(elementIndex + 1);
        }
        return jsonPath;
    }
    
    /**
     * Generates template JSON for a record in the record array.
     *
     * @param sourceTbl the connector's "source table" which is of the form
     *            element[.element]*.recordElementName.
     * @return A JSONObject with exactly one attribute called "recordElementName" that refers to a
     *         JSONObject with no attributes.
     */
    private static JSONObject generateRecordTemplate(final String sourceTbl) {
        final JSONObject recordObject = new JSONObject();
        recordObject.put(sourceTbl.substring(sourceTbl.lastIndexOf('.') + 1), new JSONObject());
        return recordObject;
    }
    
    /**
     * Generate jsonPath for finding the record array in the recordsTemplate.
     *
     * @param sourceTbl the connector's "source table" which is of the form
     *            element[.element]*.recordElementName. In other words,
     *            element.element.recordElement name would result in $.element.element
     * @return jsonPath to the record array.
     */
    private static String getPathToRecords(final String sourceTbl) {
        final int elementIndex = sourceTbl.lastIndexOf('.');
        String jsonPath = JsonConstants.JSON_ROOT;
        if (elementIndex > 0) {
            jsonPath += '.' + sourceTbl.substring(0, elementIndex);
        }
        return jsonPath;
    }
    
    /**
     * Generate a JSON object that encapsulates the record array.
     *
     * @param sourceTbl a string of the format element.element.recordElementName
     * @return an object of the form element.element.recordsArray (ignores recordElementName)
     */
    private static JSONObject generateRecordsTemplate(final String sourceTbl) {
        final String[] elements = sourceTbl.split("\\.");
        
        /*
         * Start with a JSON object containing an array for records.
         */
        final JSONObject currentElement = new JSONObject();
        int elementIndex = elements.length - 2;
        if (elementIndex >= 0) {
            currentElement.put(elements[elementIndex], new JSONArray());
        }
        elementIndex--;
        
        /*
         * Then going up the hierarchy, recursively add nested JSON objects to satisfy the path.
         */
        while (elementIndex >= 0) {
            currentElement.put(elements[elementIndex], currentElement);
            elementIndex--;
        }
        return currentElement;
    }
}
