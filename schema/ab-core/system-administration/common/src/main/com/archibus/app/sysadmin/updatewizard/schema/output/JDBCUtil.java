package com.archibus.app.sysadmin.updatewizard.schema.output;

import java.sql.*;
import java.util.*;

import org.apache.log4j.Logger;

import com.archibus.context.ContextStore;
import com.archibus.utility.ExceptionBase;

/**
 *
 * Plain JDBC connection class that has basic methods to executes SQL queries. The main reason we
 * have this class is that we can use a prepared statement.
 *
 * <p>
 *
 * @author Catalin Purice
 * @since 23.1
 *
 *        This class uses SQL commands. Also the resources are closes by using a separate method.
 *
 */
@SuppressWarnings({ "PMD.AvoidUsingSql", "PMD.CloseResource" })
public final class JDBCUtil {
    
    /**
     *
     * Private default constructor: utility class is non-instantiable.
     */
    private JDBCUtil() {
        
    }

    /**
     * Execute a prepared statement.
     *
     * @param prepareStmt the statement.
     * @param queryParameters the parameters to use with the statement.
     * @return a SQL exception if one occurs during execution.
     * @throws SQLException if an SQLException occurs.
     */
    private static List<Map<String, Object>> executeQuery(final PreparedStatement prepareStmt,
            final List<?> queryParameters) throws SQLException {
        
        List<Map<String, Object>> rows = null;
        ResultSet resultSet = null;
        
        try {
            setParameters(prepareStmt, queryParameters);
            resultSet = prepareStmt.executeQuery();
            rows = resultSetToList(resultSet);
        } finally {
            closeSilent(resultSet);
        }
        return rows;
    }

    /**
     *
     * Convert a ResultSet to List<Map<String, Object>>.
     *
     * @param resultSet result set
     * @return List<Map<String, Object>>
     * @throws ExceptionBase throws exception if any conversion exception occurs.
     */
    private static List<Map<String, Object>> resultSetToList(final ResultSet resultSet)
            throws ExceptionBase {

        final List<Map<String, Object>> rows = new ArrayList<Map<String, Object>>();
        
        try {
            
            final ResultSetMetaData metaData = resultSet.getMetaData();
            final int noOfColumns = metaData.getColumnCount();
            
            while (resultSet.next()) {
                final Map<String, Object> columns = new HashMap<String, Object>();
                for (int columnIndex = 1; columnIndex <= noOfColumns; columnIndex++) {
                    columns.put(metaData.getColumnName(columnIndex),
                        String.valueOf(resultSet.getObject(columnIndex)).trim());
                }
                rows.add(columns);
            }
        } catch (final SQLException e) {
            throw new ExceptionBase("Error while converting ResultSet to DataRecord: ", e);
        }
        return rows;
    }
    
    /**
     * Set parameters on a prepared insert statement.
     *
     * @param query the insert statement.
     * @param queryParameters the values to use as parameters.
     * @throws SQLException if the parameters cannot be set.
     */
    private static void setParameters(final PreparedStatement query, final List<?> queryParameters)
            throws SQLException {
        int parameterIndex = 1;
        for (final Object value : queryParameters) {
            setParameter(query, parameterIndex, value);
            parameterIndex++;
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
    
    /**
     *
     * Close the resultSet Silent.
     *
     * @param resultSet the result set
     */
    private static void closeSilent(final ResultSet resultSet) {
        try {
            if (resultSet != null) {
                resultSet.close();
            }
        } catch (final SQLException e) {
            Logger.getLogger(JDBCUtil.class).warn("Error closing ResultSet: " + e.getMessage());
        }
    }
    
    /**
     *
     * close the prepare statement.
     *
     * @param preparedStatement the result set
     */
    private static void closeSilent(final PreparedStatement preparedStatement) {
        try {
            if (preparedStatement != null) {
                preparedStatement.close();
            }
        } catch (final SQLException e) {
            Logger.getLogger(JDBCUtil.class).warn(
                "Error closing PreparedStatement: " + e.getMessage());
        }
    }

    /**
     *
     * Validates the sql command.
     *
     * @param sqlCommand sql command
     * @return boolean
     */
    private static boolean isValidCommand(final String sqlCommand) {
        return sqlCommand.length() > 0 && !sqlCommand.trim().startsWith("--");
    }

    /**
     *
     * Executes a query using a JDBC connection.
     *
     * @param sqlCommand SQl command to be executed
     * @param queryParameters parameters to be set
     * @return query results
     * @throws ExceptionBase throw exception if any error occurs
     */
    public static List<Map<String, Object>> executeQuery(final String sqlCommand,
        final List<?> queryParameters) throws ExceptionBase {

        List<Map<String, Object>> rows = new ArrayList<Map<String, Object>>();
        PreparedStatement preparedStatement = null;
        
        if (isValidCommand(sqlCommand)) {
            try {
                preparedStatement =
                        ContextStore.get().getDbConnection().getConnection()
                            .prepareStatement(sqlCommand);
                rows = executeQuery(preparedStatement, queryParameters);
            } catch (final SQLException e) {
                throw new ExceptionBase("Failed to execute query: " + sqlCommand, e);
            } finally {
                closeSilent(preparedStatement);
            }
        }
        
        return rows;
    }

    /**
     *
     * Executes a query using a JDBC connection.
     *
     * @param sqlCommand SQL command to be executed
     * @param queryParameters parameters to be set
     * @return query results
     * @throws ExceptionBase throw exception if any error occurs
     */
    public static int executeUpdate(final String sqlCommand, final List<?> queryParameters)
            throws ExceptionBase {
        
        int affectedRows = 0;
        PreparedStatement preparedStatement = null;
        
        if (isValidCommand(sqlCommand)) {
            try {
                preparedStatement =
                        ContextStore.get().getDbConnection().getConnection()
                            .prepareStatement(sqlCommand);
                affectedRows = executeUpdate(preparedStatement, queryParameters);
            } catch (final SQLException e) {
                throw new ExceptionBase("Failed to execute command: " + sqlCommand, e);
            } finally {
                closeSilent(preparedStatement);
            }
        }
        
        return affectedRows;
    }
    
    /**
     *
     * Executes an update with parameters.
     *
     * @param preparedStatement prepared statement
     * @param queryParameters query parameters
     * @return no of rows updated
     * @throws SQLException if any SQL exception occurs
     */
    private static int executeUpdate(final PreparedStatement preparedStatement,
            final List<?> queryParameters) throws SQLException {
        setParameters(preparedStatement, queryParameters);
        return preparedStatement.executeUpdate();
    }
    
    /**
     *
     * Returns column names.
     *
     * @param tableName name of the table
     * @return list of columns names
     */
    public static List<String> getColumnNames(final String tableName) {
        final List<String> columns = new ArrayList<String>();
        ResultSet rsColumns = null;
        try {
            final DatabaseMetaData meta =
                    ContextStore.get().getDbConnection().getConnection().getMetaData();
            rsColumns = meta.getColumns(null, null, tableName.toUpperCase(), null);
            while (rsColumns.next()) {
                columns.add(rsColumns.getString("COLUMN_NAME"));
            }
        } catch (final SQLException e) {
            throw new ExceptionBase("Failed to get columns for table: " + tableName, e);
        } finally {
            closeSilent(rsColumns);
        }
        return columns;
    }
    
    /**
     *
     * Check if table exists in the database..
     *
     * @param tableName table name
     * @return true if table exists or false otherwise
     */
    public static boolean existsTable(final String tableName) {
        boolean tableExists = false;
        ResultSet rsTable = null;
        try {
            final DatabaseMetaData meta =
                    ContextStore.get().getDbConnection().getConnection().getMetaData();
            rsTable = meta.getTables(null, null, tableName.toUpperCase(), null);
            while (rsTable.next()) {
                tableExists = true;
            }
        } catch (final SQLException e) {
            throw new ExceptionBase("Failed to check table existance: " + tableName, e);
        } finally {
            closeSilent(rsTable);
        }
        return tableExists;
    }

    /**
     * Check if a the specified column exists in the database..
     *
     * @param tableName table name
     * @param columnName column name
     * @return true if column exists or false otherwise
     */
    public static boolean existsColumn(final String tableName, final String columnName) {
        boolean columnExists = false;
        ResultSet rsTable = null;
        try {
            final DatabaseMetaData meta =
                    ContextStore.get().getDbConnection().getConnection().getMetaData();
            rsTable =
                    meta.getColumns(null, null, tableName.toUpperCase(), columnName.toUpperCase());
            while (rsTable.next()) {
                columnExists = true;
            }
        } catch (final SQLException e) {
            throw new ExceptionBase("Failed to check column existance: " + tableName + "."
                    + columnName, e);
        } finally {
            closeSilent(rsTable);
        }
        return columnExists;
    }
}
