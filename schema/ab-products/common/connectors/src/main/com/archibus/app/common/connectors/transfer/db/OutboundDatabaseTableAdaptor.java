package com.archibus.app.common.connectors.transfer.db;

import java.sql.*;
import java.util.*;

import com.archibus.app.common.connectors.exception.ConfigurationException;
import com.archibus.app.common.connectors.transfer.AdaptorResponse;
import com.archibus.app.common.connectors.transfer.exception.AdaptorException;

/**
 * An adaptor for writing to a foreign database table.
 *
 * @author cole
 *
 */
public class OutboundDatabaseTableAdaptor extends AbstractDatabaseAdaptor<List<?>, Void> {
    
    /**
     * The keyword AND. A constant is used as these may be appended or deleted, and the lengthe is
     * needed.
     */
    private static final String AND = " AND ";
    
    /**
     * A prepared insert statement.
     */
    private final String insert;
    
    /**
     * A prepared update statement, should insert fail.
     */
    private final String update;
    
    /**
     * Order of parameters in update relative to order for insert.
     */
    private final List<Integer> updateOrder;
    
    /**
     * @param connectionConfig jdbc connection configuration.
     * @param catalog catalog of the table.
     * @param schema schema of the table.
     * @param table the table to insert data into.
     * @param fields the fields to insert data into in the table.
     * @throws ConfigurationException if a SQL exception occurs while preparing statements.
     */
    public OutboundDatabaseTableAdaptor(final JdbcConnectionConfig connectionConfig,
            final String catalog, final String schema, final String table, final List<String> fields)
            throws ConfigurationException {
        super(connectionConfig);
        try {
            final List<String> primaryKeys = new ArrayList<String>();
            final ResultSet primaryKeyResults =
                    getConnection().getMetaData().getPrimaryKeys(catalog, schema, table);
            while (primaryKeyResults.next()) {
                primaryKeys.add(primaryKeyResults.getString("COLUMN_NAME"));
            }
            this.updateOrder = new ArrayList<Integer>();
            for (final String field : fields) {
                if (!primaryKeys.contains(field)) {
                    this.updateOrder.add(fields.indexOf(field) + 1);
                }
            }
            for (final String field : primaryKeys) {
                this.updateOrder.add(fields.indexOf(field) + 1);
            }
            this.insert = generateInsertQuery(schema, table, fields);
            this.update = generateUpdateQuery(schema, table, fields, primaryKeys);
        } catch (final SQLException e) {
            throw new ConfigurationException("Unable to prepare update queries", e);
        }
    }
    
    /*
     * JUSTIFICATION: Not an ARCHIBUS database, or even one with a known structure.
     */
    /**
     * Create an insert statement for the given table and fields.
     *
     * @param schema the schema of the table.
     * @param table the name of the table.
     * @param fields the fields that are being inserted.
     * @return an insert statement for the given table and fields.
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    private static String generateInsertQuery(final String schema, final String table,
            final List<String> fields) {
        final StringBuffer insertQuery = new StringBuffer("INSERT INTO ");
        insertQuery.append(schema).append('.').append(table).append(" (");
        for (final String field : fields) {
            insertQuery.append(field).append(',');
        }
        insertQuery.delete(insertQuery.length() - 1, insertQuery.length());
        insertQuery.append(") VALUES (");
        for (int i = 0; i < fields.size(); i++) {
            insertQuery.append("?,");
        }
        insertQuery.delete(insertQuery.length() - 1, insertQuery.length());
        insertQuery.append(')');
        return insertQuery.toString();
    }
    
    /*
     * JUSTIFICATION: Not an ARCHIBUS database, or even one with a known structure.
     */
    /**
     * Create an update statement for the given table and fields.
     *
     * @param schema the schema of the table.
     * @param table the name of the table.
     * @param fields the fields that are not primary keys.
     * @param primaryKeys the fields that are primary keys.
     * @return an update statement for the given table and fields.
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    private static String generateUpdateQuery(final String schema, final String table,
            final List<String> fields, final List<String> primaryKeys) {
        final StringBuffer updateQuery = new StringBuffer("UPDATE ");
        updateQuery.append(schema).append('.').append(table);
        updateQuery.append(" SET ");
        for (final String field : fields) {
            if (!primaryKeys.contains(field)) {
                updateQuery.append(field).append("=?,");
            }
        }
        updateQuery.delete(updateQuery.length() - 1, updateQuery.length());
        updateQuery.append(" WHERE ");
        for (final String field : primaryKeys) {
            updateQuery.append(field).append("=?").append(AND);
        }
        updateQuery.delete(updateQuery.length() - AND.length(), updateQuery.length());
        return updateQuery.toString();
    }
    
    /**
     * Execute the insert or update statement with the given request as parameters.
     *
     * @param queryParameters the parameters to the statement.
     * @param requestHandle the id for this request.
     * @return a response indicating when the update was requested.
     * @throws AdaptorException if parameters cannot be set.
     */
    @Override
    public AdaptorResponse<Void> makeRequest(final List<?> queryParameters,
            final String requestHandle) throws AdaptorException {
        SQLException sqlException;
        try {
            sqlException =
                    executeQuery(getConnection().prepareStatement(this.insert), queryParameters,
                        true);
        } catch (final SQLException e) {
            throw new AdaptorException("Error preparing insert query: " + this.insert, e);
        }
        if (sqlException != null) {
            if (this.updateOrder.contains(0)) {
                throw new AdaptorException("Error inserting record into foreign database: "
                        + sqlException.getLocalizedMessage(), sqlException);
            } else {
                try {
                    executeQuery(getConnection().prepareStatement(this.update), queryParameters,
                        false);
                } catch (final SQLException e) {
                    throw new AdaptorException("Error preparing update query: " + this.insert, e);
                }
            }
        }
        return new AdaptorResponse<Void>(null);
    }
    
    /**
     * Execute a prepared statement.
     *
     * @param query the statement.
     * @param queryParameters the parameters to use with the statement.
     * @param shouldInsert whether it's an insert (as opposed to an update).
     * @return a SQL exception if one occurs during execution.
     * @throws AdaptorException if the parameters cannot be set.
     */
    private SQLException executeQuery(final PreparedStatement query, final List<?> queryParameters,
            final boolean shouldInsert) throws AdaptorException {
        synchronized (query) {
            SQLException exception = null;
            try {
                query.clearParameters();
                if (shouldInsert) {
                    setInsertParameters(query, queryParameters);
                } else {
                    setUpdateParameters(query, queryParameters, this.updateOrder);
                }
            } catch (final SQLException e) {
                throw new AdaptorException("Invalid parameters to query. "
                        + e.getLocalizedMessage(), e);
            }
            try {
                query.executeUpdate();
            } catch (final SQLException e) {
                exception = e;
            }
            return exception;
        }
    }
    
    /**
     * Set parameters on a prepared insert statement.
     *
     * @param query the insert statement.
     * @param queryParameters the values to use as parameters.
     * @throws SQLException if the parameters cannot be set.
     */
    private static void setInsertParameters(final PreparedStatement query,
            final List<?> queryParameters) throws SQLException {
        int parameterIndex = 1;
        for (final Object value : queryParameters) {
            setParameter(query, parameterIndex, value);
            parameterIndex++;
        }
    }
    
    /**
     * Set parameters on a prepared update statement.
     *
     * @param query the update statement.
     * @param queryParameters the values to use as parameters.
     * @param parameterOrder the order the values should be used in.
     * @throws SQLException if the parameters cannot be set.
     */
    private static void setUpdateParameters(final PreparedStatement query,
            final List<?> queryParameters, final List<Integer> parameterOrder) throws SQLException {
        for (int parameterIndex = 1; parameterIndex < parameterOrder.size(); parameterIndex++) {
            setParameter(query, parameterIndex,
                queryParameters.get(parameterOrder.get(parameterIndex - 1) - 1));
        }
    }
    
    /**
     * Set a parameter on a prepared statement.
     *
     * @param query the prepared statement.
     * @param parameterIndex the index of the parameter.
     * @param value the value to be set.
     * @throws SQLException if the value cannot be set.
     */
    private static void setParameter(final PreparedStatement query, final int parameterIndex,
            final Object value) throws SQLException {
        if (value instanceof Time) {
            query.setTime(parameterIndex, (Time) value);
        } else if (value instanceof java.util.Date) {
            query.setDate(parameterIndex, new java.sql.Date(((java.util.Date) value).getTime()));
        } else if (value instanceof Integer) {
            query.setInt(parameterIndex, (Integer) value);
        } else if (value instanceof Double) {
            query.setDouble(parameterIndex, (Double) value);
        } else if (value instanceof Float) {
            query.setFloat(parameterIndex, (Float) value);
        } else if (value == null) {
            query.setString(parameterIndex, null);
        } else {
            query.setString(parameterIndex, value.toString());
        }
    }
}
