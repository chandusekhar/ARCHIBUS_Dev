package com.archibus.app.common.connectors.impl.db.inbound;

import java.util.*;

import javax.sql.RowSet;

import com.archibus.app.common.connectors.domain.*;
import com.archibus.app.common.connectors.exception.ConfigurationException;
import com.archibus.app.common.connectors.impl.archibus.inbound.InboundRequests;
import com.archibus.app.common.connectors.impl.db.*;
import com.archibus.app.common.connectors.logging.IUserLog;
import com.archibus.app.common.connectors.transfer.common.ConnectorObfuscationUtil;
import com.archibus.app.common.connectors.transfer.db.*;
import com.archibus.app.common.connectors.translation.common.outbound.*;
import com.archibus.app.common.connectors.translation.common.outbound.impl.RequestDef;
import com.archibus.app.common.connectors.translation.db.inbound.*;
import com.archibus.utility.StringUtil;

/**
 *
 * Provides requests to a database connection to produce records for ARCHIBUS database.
 *
 * @author Catalin Purice
 * @since 21.3
 *
 */
public class InboundDbRequests extends
        InboundRequests<DbReadRequest, RowSet, Map<String, Object>, DbResponseRecordDef> {

    /**
     * Generate a series of requests to a file system to produce records from delimited text.
     *
     * @param stepName a descriptive name for this step.
     * @param connector the afm_connector record to use as configuration
     * @param log a place to write user friendly status messages
     * @throws ConfigurationException if an associated connector rule can't be instantiated.
     */
    public InboundDbRequests(final String stepName, final ConnectorConfig connector,
            final IUserLog log) throws ConfigurationException {
        // CHECKSTYLE:OFF checkstyle doesn't like method generics requiring a space after the <>
        super(stepName, Collections.singletonList(Collections.<String, Object> emptyMap()),
            new RequestDef<IRequestFieldDefinition>(
                Collections.<IRequestFieldDefinition> emptyList()),
            // CHECKSTYLE:ON
            createRequestTemplate(connector), new InboundDatabaseAdaptor(new JdbcConnectionConfig(
                connector.getConnString(), DbUtil.getDriver(connector), connector.getConnUser(),
                ConnectorObfuscationUtil.decodeParameter(connector.getConnPassword()))),
            Collections.singletonList(new DbResponseRecordDef(connector)), log);
    }

    /*
     * JUSTIFICATION: Not an ARCHIBUS database, or even one with a known structure.
     */
    /**
     * @param connector the configuration for the connector that requires these requests to be
     *            issued.
     * @return a template (SQL query) to retrieve records defined by connector fields from the
     *         foreign database.
     * @throws ConfigurationException if there is an error getting an instance of a connector rule
     *             defining whether the field should be queried.
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    private static IRequestTemplate<DbReadRequest> createRequestTemplate(
            final ConnectorConfig connector) throws ConfigurationException {
        final StringBuffer query = new StringBuffer("SELECT ");
        for (final ConnectorFieldConfig connectorField : connector.getConnectorFields()) {
            if (connectorField.getRule().getInstance().requiresExistingValue()) {
                query.append(connectorField.getForeignFieldPath()).append(',');
            }
        }
        query.delete(query.length() - 1, query.length());
        query.append(" FROM ").append(connector.getForeignTxPath());
        if (!StringUtil.isNullOrEmpty(connector.getClause())) {
            query.append(" WHERE ").append(connector.getClause());
        }
        // CHECKSTYLE:OFF checkstyle doesn't like method generics requiring a space after the <>
        return new DbReadRequestTemplate(query.toString(), Collections.<String> emptyList());
        // CHECKSTYLE:ON
    }
}
