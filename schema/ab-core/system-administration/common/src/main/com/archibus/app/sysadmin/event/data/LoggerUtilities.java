package com.archibus.app.sysadmin.event.data;

import java.util.List;
import java.util.regex.*;

import com.archibus.utility.WildCardExpressionMatcher;

/**
 * Utility class for the LoggerSqlExecuted and LoggerRecordChanged. Provides methods that find
 * matching table name in the SQL. Wild card "%" might be used for matching.
 * <p>
 * Used by LoggerSqlExecuted and LoggerRecordChanged to match table names.
 * 
 * @author Valery Tydykov
 * @since 20.1
 * 
 */
final class LoggerUtilities {
    /**
     * Constant: part of regular expression to match space or comma.
     */
    private static final String REGEX_PATTERN_SPACE_OR_COMMA = "(\\s|,)";
    
    /**
     * Private default constructor: utility class is non-instantiable.
     * 
     * @throws InstantiationException always, since this constructor should never be called.
     */
    private LoggerUtilities() throws InstantiationException {
        throw new InstantiationException("Never instantiate " + this.getClass().getName()
                + "; use static methods!");
    }
    
    /**
     * Determines table name in which the event happened from the [optionally] supplied table name,
     * SQL statement.
     * 
     * @param tableName the table name supplied in the event, or null.
     * @param sql the SQL statement from the event.
     * @param tablesToLog table names for which the event needs to be logged.
     * @return table name to be logged, or null if table name was not determined or was not in the
     *         tablesToLog.
     */
    protected static String determineTableName(final String tableName, final String sql,
            final List<String> tablesToLog) {
        String tableNameToLog = null;
        if (tableName == null) {
            // tableName was not supplied
            // try to determine table name from the supplied SQL:
            // check if sql contains any table from the list of tables
            tableNameToLog = findMatchingTable(sql, tablesToLog);
        } else {
            // tableName was supplied
            // check if tableName is in the tablesToLog
            if (isTableInList(tableName, tablesToLog)) {
                tableNameToLog = tableName;
            }
        }
        
        return tableNameToLog;
    }
    
    /**
     * Returns true if tablesToLog contains "%" item, or tableName is in the tablesToLog. The
     * tablesToLog list can contain "%" wild card, which means "match any table", otherwise there
     * must be exact match.
     * 
     * @param tableName the table name supplied in the event. Can not be null.
     * @param tablesToLog list of table names for which the event needs to be logged, or null. The
     *            list can contain "%" wild card.
     * @return true if tablesToLog contains "%" item, or tableName is in the tablesToLog.
     */
    protected static boolean isTableInList(final String tableName, final List<String> tablesToLog) {
        boolean isTableInList = false;
        if (tablesToLog != null) {
            for (final String tableToLog : tablesToLog) {
                if (WildCardExpressionMatcher.WILD_CARD.equals(tableToLog)) {
                    // "any table" match
                    isTableInList = true;
                    break;
                } else {
                    if (tableName.equalsIgnoreCase(tableToLog)) {
                        // found matching table
                        isTableInList = true;
                        break;
                    }
                }
            }
        }
        
        return isTableInList;
    }
    
    /**
     * Tries to find one of the table names specified in tablesToLog in sql. The tablesToLog list
     * can contain "%" wild card, which means "match any table", otherwise there must be exact
     * match. The table name in the SQL must be surrounded by spaces and/or commas.
     * 
     * @param sql the SQL statement from the event.
     * @param tablesToLog list of table names for which the event needs to be logged, or null. The
     *            list can contain "%" wild card.
     * @return the first matching table name, or null if there was no match or tablesToLog was null.
     */
    protected static String findMatchingTable(final String sql, final List<String> tablesToLog) {
        String matchingTable = null;
        if (tablesToLog != null) {
            for (final String tableToLog : tablesToLog) {
                if (WildCardExpressionMatcher.WILD_CARD.equals(tableToLog)) {
                    // "any table" match, return " " as table name
                    matchingTable = " ";
                    break;
                } else {
                    if (findMatchingTable(sql, tableToLog)) {
                        // found matching table in SQL, return the first table name found
                        matchingTable = tableToLog;
                        break;
                    }
                }
            }
        }
        
        return matchingTable;
    }
    
    /**
     * Returns true if tableToLog found in the sql. The tableToLog can not contain "%" wild card.
     * There must be exact match. The table name in the SQL must be surrounded by spaces and/or
     * commas.
     * 
     * @param sql the SQL statement from the event.
     * @param tableToLog table name for which the event needs to be logged. Can not contain "%" wild
     *            card.
     * @return true if tableToLog found in the sql.
     */
    protected static boolean findMatchingTable(final String sql, final String tableToLog) {
        // The table name in the SQL must be surrounded by spaces and/or commas.
        final String patternAsString =
                REGEX_PATTERN_SPACE_OR_COMMA + tableToLog + REGEX_PATTERN_SPACE_OR_COMMA;
        final Pattern pattern = Pattern.compile(patternAsString, Pattern.CASE_INSENSITIVE);
        final Matcher matcher = pattern.matcher(sql);
        // match regular expression against SQL
        return matcher.find();
    }
}
