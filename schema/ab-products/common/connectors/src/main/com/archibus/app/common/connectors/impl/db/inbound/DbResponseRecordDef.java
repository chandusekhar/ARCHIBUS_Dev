package com.archibus.app.common.connectors.impl.db.inbound;

import java.util.*;

import javax.sql.RowSet;

import com.archibus.app.common.connectors.domain.*;
import com.archibus.app.common.connectors.exception.ConfigurationException;
import com.archibus.app.common.connectors.impl.archibus.ConnectorDataTable;
import com.archibus.app.common.connectors.impl.archibus.inbound.ArchibusResponseTxDef;
import com.archibus.app.common.connectors.translation.db.inbound.DbRecordParser;
import com.archibus.datasource.DataSourceFieldDefLoader;

/**
 * Record mapping for extracting and translating a field values from a database record.
 *
 * @author cole
 *
 */
public class DbResponseRecordDef extends
        ArchibusResponseTxDef<RowSet, Map<String, Object>, DbResponseFieldDefinition> {
    /**
     * @param connector the connector configuration defining this record mapping.
     * @throws ConfigurationException if there is an error getting the instance of the connector
     *             rule defining whether the field should be queried.
     */
    public DbResponseRecordDef(final ConnectorConfig connector) throws ConfigurationException {
        super(connector.getConnectorId(), new ConnectorDataTable(connector), new DbRecordParser(
            createQueryFieldNames(connector)), createResponseFieldDefinitions(connector), connector
            .getSkipFirstRow());
    }

    /**
     * @param connector the connector configuration defining this record mapping.
     * @return a list of columns to be queried from the foreign database.
     * @throws ConfigurationException if there is an error getting the instance of the connector
     *             rule defining whether the field should be queried.
     */
    private static List<String> createQueryFieldNames(final ConnectorConfig connector)
            throws ConfigurationException {
        final List<String> fieldNames = new ArrayList<String>();
        for (final ConnectorFieldConfig connectorField : connector.getConnectorFields()) {
            if (connectorField.getRule().getInstance().requiresExistingValue()) {
                fieldNames.add(connectorField.getForeignFieldPath());
            }
        }
        return Collections.unmodifiableList(fieldNames);
    }

    /**
     * @param connector the connector configuration defining this record mapping.
     * @return a list of field mappings for each column to be provided to the ARCHIBUS database.
     */
    private static List<DbResponseFieldDefinition> createResponseFieldDefinitions(
            final ConnectorConfig connector) {
        final DataSourceFieldDefLoader fieldDefLoader = new DataSourceFieldDefLoader();
        final List<DbResponseFieldDefinition> fieldDefs =
                new ArrayList<DbResponseFieldDefinition>();
        for (final ConnectorFieldConfig connectorField : connector.getConnectorFields()) {
            fieldDefs.add(new DbResponseFieldDefinition(connectorField, fieldDefLoader));
        }
        return Collections.unmodifiableList(fieldDefs);
    }
}
