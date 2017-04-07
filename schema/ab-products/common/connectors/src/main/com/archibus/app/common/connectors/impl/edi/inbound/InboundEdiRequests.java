package com.archibus.app.common.connectors.impl.edi.inbound;

import java.util.*;

import org.apache.commons.collections.CollectionUtils;
import org.json.*;

import com.archibus.app.common.connectors.domain.ConnectorConfig;
import com.archibus.app.common.connectors.exception.ConfigurationException;
import com.archibus.app.common.connectors.impl.CharEncodingUtil;
import com.archibus.app.common.connectors.impl.archibus.ConnectorDataTable;
import com.archibus.app.common.connectors.impl.file.inbound.AbstractInboundFileRequests;
import com.archibus.app.common.connectors.impl.text.TextCharSequenceSet;
import com.archibus.app.common.connectors.logging.IUserLog;
import com.archibus.app.common.connectors.translation.text.inbound.*;

/**
 * A series of requests to a file system to produce records form EDI text file.
 *
 * @author Catalin Purice
 * @since 22.1
 *
 */
public class InboundEdiRequests extends
AbstractInboundFileRequests<List<String>, EdiListResponseTxDef> {

    /**
     * If this connector parameter is present, and there is a trailing record delimiter, the record
     * following it will be ignored.
     */
    private static final String IGNORE_LAST_RECORD_IF_EMPTY = "ignoreLastRecordIfEmpty";
    
    /**
     * JSON element. Represents main JSON element to read from.
     */
    private static final String NESTED_RECORDS = "nestedRecords";

    /**
     * JSON element. Specifies the EDI segment name.
     */
    private static final String PREFIXES = "prefixes";

    /**
     * JSON element. Specifies the start field position from connector fields table.
     */
    private static final String START_POS = "startPos";

    /**
     * JSON element. Specifies the end field position from connector fields table.
     */
    private static final String END_POS = "endPos";

    /**
     * JSON element. Specifies parent prefixes.
     */
    private static final String BUFFERED_PREFIXES = "bufferedPrefixes";

    /**
     * JSON element. Specifies table to migrate the record to.
     */
    private static final String MIGRATE_TO = "migrateTo";

    /**
     * Generate a series of requests to a file system to produce records from EDI text.
     *
     * @param stepName a descriptive name for this step.
     * @param connector the afm_connector record to use as configuration.
     * @param log a place to write user friendly status messages.
     * @throws ConfigurationException if a connector rule associated with these requests cannot be
     *             instantiated, or if a connection can't be opened to an FTP server.
     */
    public InboundEdiRequests(final String stepName, final ConnectorConfig connector,
            final IUserLog log) throws ConfigurationException {
        super(stepName, createTemplateParameters(connector), createResponseTxDefs(connector),
            connector, log);
    }

    /**
     * Generate response transaction definitions for transaction record types.
     *
     * @param connector the afm_connector record to use as configuration.
     * @return a list of response record definitions for EDI records.
     * @throws ConfigurationException if a connector rule associated with these requests cannot be
     *             instantiated.
     */
    private static List<EdiListResponseTxDef> createResponseTxDefs(final ConnectorConfig connector)
            throws ConfigurationException {
        final List<EdiListResponseTxDef> rspnTxDefs = new ArrayList<EdiListResponseTxDef>();

        /*
         * Create a parser similar to delimited text, except with an additional segment delimiter.
         */
        final AbstractTextParser parser =
                new DelimitedTextRecordParser(new TextCharSequenceSet(connector),
                    CharEncodingUtil.getCharacterEncoding(connector), connector.getConnParams()
                    .optBoolean(IGNORE_LAST_RECORD_IF_EMPTY, false));
        
        /*
         * Parameters describing nested records and their relationships.
         */
        final JSONArray nestedRecordTypes =
                (JSONArray) connector.getConnParams().get(NESTED_RECORDS);

        /*
         * Create one record definition for each record type as identified by a prefix.
         */
        for (final JSONObject migratedRecordType : getMigratedRecordTypes(nestedRecordTypes)) {
            final List<String> prefixes =
                    convertJsonArrayToList(migratedRecordType.getJSONArray(PREFIXES));
            final List<EdiTxRecordPart> parentTxParts =
                    getParentTxParts(connector, migratedRecordType, nestedRecordTypes);
            final EdiTxRecordPart txPart =
                    new EdiTxRecordPart(connector, prefixes, parentTxParts,
                        migratedRecordType.getInt(START_POS), migratedRecordType.getInt(END_POS));
            rspnTxDefs.add(new EdiListResponseTxDef(connector.getConnectorId(),
                new ConnectorDataTable(migratedRecordType.getString(MIGRATE_TO), connector
                    .getConnParams()), parser, connector.getSkipFirstRow(), txPart));
        }
        return rspnTxDefs;
    }

    /**
     * Get record types that indicate transactions should be created against ARCHIBUS tables.
     *
     * @param nestedRecordTypes JSON nestedRecords
     * @return list of master parts
     */
    private static List<JSONObject> getMigratedRecordTypes(final JSONArray nestedRecordTypes) {
        final List<JSONObject> migratedRecordTypes = new ArrayList<JSONObject>();
        for (int i = 0; i < nestedRecordTypes.length(); i++) {
            final JSONObject element = nestedRecordTypes.getJSONObject(i);
            if (element.has(MIGRATE_TO)) {
                migratedRecordTypes.add(element);
            }
        }
        return migratedRecordTypes;
    }

    /**
     *
     * Returns the JSONObject by Prefix.
     *
     * @param nestedRecords nestedRecords
     * @param prefixes the prefixes to seek for
     * @return JSONObjesct object
     */
    private static JSONObject getNestedRecordType(final JSONArray nestedRecords, final JSONArray prefixes) {
        JSONObject object = null;
        for (int i = 0; i < nestedRecords.length(); i++) {
            final JSONObject element = nestedRecords.getJSONObject(i);
            if (CollectionUtils.isEqualCollection(convertJsonArrayToList(prefixes),
                convertJsonArrayToList(element.getJSONArray(PREFIXES)))) {
                object = element;
            }
        }
        return object;
    }

    /**
     *
     * Get parent parts.
     *
     * @param connector connector
     * @param nestedRecordType master record
     * @param nestedRecordTypes JSON nestedRecords
     * @return List<EdiTxRecordPart>
     */
    private static List<EdiTxRecordPart> getParentTxParts(final ConnectorConfig connector,
        final JSONObject nestedRecordType, final JSONArray nestedRecordTypes) {
        final List<EdiTxRecordPart> parentTxParts = new ArrayList<EdiTxRecordPart>();
        final JSONArray parentPrefixes =
                nestedRecordType.has(BUFFERED_PREFIXES) ? nestedRecordType
                        .getJSONArray(BUFFERED_PREFIXES) : new JSONArray();
        
        for (int i = 0; i < parentPrefixes.length(); i++) {
                            final JSONObject txPartConfig =
                                    getNestedRecordType(nestedRecordTypes, parentPrefixes.getJSONArray(i));
                            // CHECKSTYLE:OFF checkstyle doesn't like method generics requiring a space after
                            // the <>
                            parentTxParts.add(new EdiTxRecordPart(connector, convertJsonArrayToList(txPartConfig
                                .getJSONArray(PREFIXES)), Collections.<EdiTxRecordPart> emptyList(), txPartConfig
                                .getInt(START_POS), txPartConfig.getInt(END_POS)));
                            // CHECKSTYLE:ON
                        }
                        return parentTxParts;
        
    }
    
    /**
     * Convert a JSONArray of strings to a List of strings.
     *
     * @param jsonArray the array to convert.
     * @return a list of strings equivalent to the jsonArray.
     */
    private static List<String> convertJsonArrayToList(final JSONArray jsonArray) {
        final List<String> elements = new ArrayList<String>();
        for (int prefixIndex = 0; prefixIndex < jsonArray.length(); prefixIndex++) {
            elements.add(jsonArray.getString(prefixIndex));
        }
        return elements;
    }

}
