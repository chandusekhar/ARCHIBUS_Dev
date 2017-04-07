package com.archibus.app.common.connectors.transfer.db;

import java.sql.SQLException;
import java.util.*;
import java.util.Map.Entry;

import javax.sql.RowSet;
import javax.sql.rowset.JdbcRowSet;

import com.archibus.app.common.connectors.transfer.AdaptorResponse;
import com.archibus.app.common.connectors.transfer.common.AbstractSingleRequestAdaptor;
import com.archibus.app.common.connectors.transfer.exception.AdaptorException;
import com.archibus.app.common.connectors.translation.db.inbound.DbReadRequest;
import com.enterprisedt.util.debug.Logger;

/**
 *
 * Adaptor for reading from remotely database tables.
 *
 * @author Catalin Purice
 * @since 21.3
 *
 */
public class InboundDatabaseAdaptor extends AbstractSingleRequestAdaptor<DbReadRequest, RowSet> {
    
    /**
     * A log for errors occurring when closing connection resources.
     */
    private final Logger logger = Logger.getLogger(InboundDatabaseAdaptor.class);

    /**
     * Configuration for connecting to the remote database.
     */
    private final JdbcConnectionConfig connectionConfig;

    /**
     * The results.
     */
    private final Map<String, JdbcRowSet> rowSets;
    
    /**
     * @param connectionConfig configuration for connecting to the DBMS.
     */
    public InboundDatabaseAdaptor(final JdbcConnectionConfig connectionConfig) {
        super();
        this.connectionConfig = connectionConfig;
        this.rowSets = new HashMap<String, JdbcRowSet>();
    }
    
    /**
     * @param readRequest SELECT SQL and parameters for it to execute against the foreign database.
     * @param requestHandle an identifier for this request.
     * @return an adaptor response with a result set from the foreign database.
     * @throws AdaptorException if a SQLException occurs before resources are closed.
     */
    @Override
    public AdaptorResponse<RowSet> makeRequest(final DbReadRequest readRequest,
            final String requestHandle) throws AdaptorException {
        final JdbcRowSet rowSet = new ConnectorJdbcRowSet();
        try {
            rowSet.setUrl(this.connectionConfig.getJdbcUrl());
            rowSet.setUsername(this.connectionConfig.getUser());
            rowSet.setPassword(this.connectionConfig.getPassword());
        } catch (final SQLException e) {
            closeRowSet(rowSet);
            throw new AdaptorException("Invalid connection or missing driver: " + e.getMessage(), e);
        }
        try {
            rowSet.setCommand(readRequest.getQuery());
            int parameterIndex = 1;
            for (final String parameter : readRequest.getParameterOrder()) {
                rowSet.setObject(parameterIndex, readRequest.getParameters().get(parameter));
                parameterIndex++;
            }
            rowSet.execute();
        } catch (final SQLException e) {
            closeRowSet(rowSet);
            throw new AdaptorException("Error executing SQL: " + e.getMessage(), e);
        }
        this.rowSets.put(requestHandle, rowSet);
        return new AdaptorResponse<RowSet>(rowSet);
    }
    
    @Override
    public boolean expectsResponses(final String requestHandle) {
        final boolean expectsResponses = super.expectsResponses(requestHandle);
        if (!expectsResponses) {
            final JdbcRowSet rowSet = this.rowSets.get(requestHandle);
            closeRowSet(rowSet);
            this.rowSets.remove(requestHandle);
        }
        return expectsResponses;
    }
    
    @Override
    public void close() throws AdaptorException {
        try {
            for (final Entry<String, JdbcRowSet> rowSetEntry : this.rowSets.entrySet()) {
                final JdbcRowSet rowSet = rowSetEntry.getValue();
                closeRowSet(rowSet);
            }
        } finally {
            super.close();
        }
    }
    
    /**
     * Close a JDBC row set if it's open, logging an error if it cannot be closed.
     *
     * @param rowSet the row set to close.
     */
    private void closeRowSet(final JdbcRowSet rowSet) {
        try {
            if (!rowSet.isClosed()) {
                rowSet.close();
            }
        } catch (final SQLException e) {
            this.logger.warn("Failed to close DB row set: " + e.getMessage(), e);
        }
    }
}
