package com.archibus.app.common.connectors.impl.db;

import com.archibus.app.common.connectors.domain.ConnectorConfig;
import com.archibus.app.common.connectors.exception.ConfigurationException;

/**
 * Utility class. Provides methods for working with JDBC connections.
 *
 * @author cole
 * @since 22.1
 *
 */
public final class DbUtil {

    /**
     * Connection parameter for the JDBC driver.
     */
    private static final String DB_DRIVER_PARAM = "jdbcDriver";
    
    /**
     * Default JDBC driver for SQL Server.
     */
    private static final String DB_DRIVER_SQL_SERVER =
            "com.microsoft.sqlserver.jdbc.SQLServerDriver";

    /**
     * Default JDBC driver for Oracle.
     */
    private static final String DB_DRIVER_ORACLE = "oracle.jdbc.OracleDriver";

    /**
     * Default JDBC driver for Sybase.
     */
    private static final String DB_DRIVER_SYBASE = "com.sybase.jdbc3.jdbc.SybDriver";

    /**
     * Default JDBC driver for ODBC.
     */
    private static final String DB_DRIVER_ODBC = "sun.jdbc.odbc.JdbcOdbcDriver";
    
    /**
     * Private default constructor: utility class is non-instantiable.
     */
    private DbUtil() {
    }
    
    /**
     * @param connectorConfig configuration for the connector.
     * @return a jdbc driver name for this connector.
     * @throws ConfigurationException if the driver is unspecified and not implied by the connector
     *             type, or isn't on the classpath.
     */
    public static String getDriver(final ConnectorConfig connectorConfig)
            throws ConfigurationException {
        String driverName;
        if (connectorConfig.getConnParams().has(DB_DRIVER_PARAM)) {
            driverName = connectorConfig.getConnParams().getString(DB_DRIVER_PARAM);
        } else {
            switch (connectorConfig.getType()) {
                case ORACLE:
                    driverName = DB_DRIVER_ORACLE;
                    break;
                case SQL_SERVER:
                    driverName = DB_DRIVER_SQL_SERVER;
                    break;
                case SYBASE:
                    driverName = DB_DRIVER_SYBASE;
                    break;
                case MS_ACCESS:
                    driverName = DB_DRIVER_ODBC;
                    break;
                default:
                    throw new ConfigurationException(
                        "Uncrecognized or unspecified jdbc driver class.", null);
            }
        }
        try {
            Class.forName(driverName);
        } catch (final ClassNotFoundException e) {
            throw new ConfigurationException("JDBC Driver " + driverName
                    + " not found on classpath", e);
        }
        return driverName;
    }
}
