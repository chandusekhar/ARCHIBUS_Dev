package com.archibus.app.common.connectors.impl.db.outbound;

import java.util.*;

import com.archibus.app.common.connectors.domain.*;
import com.archibus.app.common.connectors.exception.ConfigurationException;
import com.archibus.app.common.connectors.impl.archibus.outbound.OutboundRequests;
import com.archibus.app.common.connectors.impl.db.DbUtil;
import com.archibus.app.common.connectors.logging.IUserLog;
import com.archibus.app.common.connectors.transfer.common.ConnectorObfuscationUtil;
import com.archibus.app.common.connectors.transfer.db.*;
import com.archibus.app.common.connectors.translation.db.outbound.DbUpdateTemplate;

/**
 * A series of requests to a file system to store records as delimited text.
 *
 * @author cole
 *
 */
public final class OutboundDbRequests extends OutboundRequests<List<?>> {
    
    /**
     * Delimiter between schema and table in foreign records path.
     */
    private static final String TABLE_SCHEMA_DELIMITER = "\\.";

    /**
     * Error indicating the remote source is badly formatted.
     */
    private static final String REMOTE_SOURCE_FORMAT_ERROR =
            "Remote source should be of the form: schema.table.";
    
    /**
     * Generate a series of requests to a file system to produce records from delimited text.
     *
     * @param stepName a descriptive name for this step.
     * @param connector the afm_connector record to use as configuration
     * @param log a place to write user friendly status messages
     * @throws ConfigurationException if a connector rule associated with these requests cannot be
     *             instantiated.
     */
    public OutboundDbRequests(final String stepName, final ConnectorConfig connector,
            final IUserLog log) throws ConfigurationException {
        /*
         * Create requests.
         */
        super(stepName, connector, new DbRequestRecordDefinition(connector), new DbUpdateTemplate(
            DATA_SOURCE_PARAM, getColumns(connector)), new OutboundDatabaseTableAdaptor(
            new JdbcConnectionConfig(connector.getConnString(), DbUtil.getDriver(connector),
                connector.getConnUser(), ConnectorObfuscationUtil.decodeParameter(connector
                    .getConnPassword())), null, getSchema(connector.getForeignTxPath()),
            getTable(connector.getForeignTxPath()), getColumns(connector)), log);
    }
    
    /**
     * @param foreignRecordsPath schema.table in the foreign database.
     * @return schema in the foreign database.
     */
    private static String getSchema(final String foreignRecordsPath) {
        final String[] splitPath = foreignRecordsPath.split(TABLE_SCHEMA_DELIMITER);
        if (splitPath.length < 2) {
            throw new ConfigurationException(REMOTE_SOURCE_FORMAT_ERROR, null);
        } else {
            return splitPath[0];
        }
    }
    
    /**
     * @param foreignRecordsPath schema.table in the foreign database.
     * @return table in the foreign database.
     * @throws ConfigurationException if the foreignRecordsPath is of the wrong format.
     */
    private static String getTable(final String foreignRecordsPath) throws ConfigurationException {
        final String[] splitPath = foreignRecordsPath.split(TABLE_SCHEMA_DELIMITER);
        if (splitPath.length < 2) {
            throw new ConfigurationException(REMOTE_SOURCE_FORMAT_ERROR, null);
        } else {
            return splitPath[1];
        }
    }
    
    /**
     * @param connector the configuration which includes the column names.
     * @return a list of column names that are to be updated in order of position.
     */
    private static List<String> getColumns(final ConnectorConfig connector) {
        final List<String> fields = new ArrayList<String>();
        for (final ConnectorFieldConfig connectorField : connector.getConnectorFields()) {
            fields.add(connectorField.getForeignFieldPath());
        }
        return fields;
    }
}
