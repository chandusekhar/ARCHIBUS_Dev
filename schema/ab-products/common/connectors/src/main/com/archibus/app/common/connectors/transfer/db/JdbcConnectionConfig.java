package com.archibus.app.common.connectors.transfer.db;

import com.archibus.app.common.connectors.exception.ConfigurationException;

/**
 * Configuration for connecting to a DBMS using JDBC.
 *
 * @author cole
 * @since 22.1
 *
 */
public class JdbcConnectionConfig {
    
    /**
     * JDBC URL to the DBMS with which to exchange data.
     */
    private final String jdbcUrl;

    /**
     * JDBC driver name.
     */
    private final String driverName;

    /**
     * User name for connecting to the DBMS.
     */
    private final String user;

    /**
     * Password for connecting to the DBMS.
     */
    private final String password;
    
    /**
     * @param jdbcUrl JDBC URL to the DBMS with which to exchange data.
     * @param driverName optional JDBC driver name.
     * @param user user name for connecting to the DBMS.
     * @param password password for connecting to the DBMS.
     * @throws ConfigurationException if the driver is unspecified and unknown.
     */
    public JdbcConnectionConfig(final String jdbcUrl, final String driverName, final String user,
            final String password) throws ConfigurationException {
        super();
        this.jdbcUrl = jdbcUrl;
        this.driverName = driverName;
        this.user = user;
        this.password = password;
    }
    
    /**
     * @return JDBC URL to the DBMS with which to exchange data.
     */
    public String getJdbcUrl() {
        return this.jdbcUrl;
    }
    
    /**
     * @return optional JDBC driver name.
     */
    public String getDriverName() {
        return this.driverName;
    }
    
    /**
     * @return User name for connecting to the DBMS.
     */
    public String getUser() {
        return this.user;
    }
    
    /**
     * @return Password for connecting to the DBMS.
     */
    public String getPassword() {
        return this.password;
    }
}
