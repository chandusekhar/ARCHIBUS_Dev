package com.archibus.app.common.connectors.transfer.db;

import java.sql.*;
import java.util.Map;

import com.sun.rowset.JdbcRowSetImpl;

/*
 * NOTE regarding use of proprietary API.
 * 
 * There is no good way in Java 6 to create a JdbcRowSet without referring to Oracle proprietary
 * API: http://stackoverflow.com/questions/8217493/implementations-of-rowset-cachedrowset-etc
 * 
 * There is in Java 7, but even then the java doc refers to the proprietary API:
 * http://docs.oracle.com/javase/7/docs/api/javax/sql/rowset/JdbcRowSet.html
 * 
 * The alternative would be straight JDBC.
 */
/**
 * A JdbcRowSet that is forward only.
 *
 * @author cole
 * @since 22.1
 *
 */
public class ConnectorJdbcRowSet extends JdbcRowSetImpl {

    /**
     * Version number to detect version of class associated with serialized version of object.
     */
    private static final long serialVersionUID = -3991459915029961898L;

    @Override
    protected PreparedStatement prepare() throws SQLException {
        /*
         * KB 3047928
         */
        setAutoCommit(false);
        /*
         * END KB 3047928
         */
        try {
            final Map<String, Class<?>> aMap = getTypeMap();
            if (aMap != null) {
                getConnection().setTypeMap(aMap);
            }
            /*
             * This needed to change to support MS SQL JDBC driver, but it's also more efficient for
             * our purposes.
             */
            setPreparedStatement(getConnection().prepareStatement(getCommand(),
                ResultSet.TYPE_FORWARD_ONLY, ResultSet.CONCUR_READ_ONLY));
        } catch (final SQLException ex) {
            if (getPreparedStatement() != null) {
                getPreparedStatement().close();
            }
            if (getConnection() != null) {
                getConnection().close();
            }

            throw new SQLException(ex.getMessage());
        }

        return getPreparedStatement();
    }
    
}
