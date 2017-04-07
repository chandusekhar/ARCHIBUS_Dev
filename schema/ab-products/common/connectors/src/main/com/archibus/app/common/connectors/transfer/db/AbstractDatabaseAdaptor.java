package com.archibus.app.common.connectors.transfer.db;

import java.sql.*;

import com.archibus.app.common.connectors.exception.ConfigurationException;
import com.archibus.app.common.connectors.transfer.common.AbstractSingleRequestAdaptor;
import com.archibus.app.common.connectors.transfer.exception.AdaptorException;
import com.enterprisedt.util.debug.Logger;

/**
 * A database adaptor that handls a database connection.
 *
 * @author cole
 *
 * @param <RequestType> the type of request made to the adaptor.
 * @param <ResponseMessageType> the type of response expected from making the request.
 */
public abstract class AbstractDatabaseAdaptor<RequestType, ResponseMessageType> extends
        AbstractSingleRequestAdaptor<RequestType, ResponseMessageType> {
    
    /**
     * A log for errors occurring when closing connection resources.
     */
    private final Logger logger = Logger.getLogger(AbstractDatabaseAdaptor.class);
    
    /**
     * Connection to the database management server with which to exchange data.
     */
    private final Connection connection;
    
    /**
     * @param connectionConfig configuration for connecting to the DBMS.
     * @throws ConfigurationException if the driver, JDBC URL, user or password are invalid.
     */
    public AbstractDatabaseAdaptor(final JdbcConnectionConfig connectionConfig)
            throws ConfigurationException {
        super();
        if (connectionConfig.getDriverName() != null) {
            try {
                Class.forName(connectionConfig.getDriverName());
            } catch (final ClassNotFoundException e) {
                throw new ConfigurationException("JDBC Driver " + connectionConfig.getDriverName()
                        + " not found on classpath", e);
            }
        }
        try {
            this.connection =
                    DriverManager.getConnection(connectionConfig.getJdbcUrl(),
                        connectionConfig.getUser(), connectionConfig.getPassword());
        } catch (final SQLException e) {
            throw new ConfigurationException("Unable to open a connection to remote database.", e);
        }
    }
    
    /**
     * @return a database connection to the foreign database.
     */
    protected Connection getConnection() {
        return this.connection;
    }
    
    @Override
    public void close() throws AdaptorException {
        try {
            getConnection().close();
        } catch (final SQLException e) {
            this.logger.warn("Failed to close DB connection.", e);
        } finally {
            super.close();
        }
    }
}
