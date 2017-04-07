package com.archibus.app.sysadmin.event.data;

import java.util.*;

import junit.framework.*;

import com.archibus.app.common.MockUtilities;

/**
 * Tests for LoggerUtilities methods.
 * 
 * @author Valery Tydykov
 * @since 20.1
 * 
 */
public class LoggerUtilitiesTest extends TestCase {
    /**
     * Constant: wild card %.
     */
    private static final String WILD_CARD = "%";
    
    /**
     * Constant: comma.
     */
    private static final String COMMA = ",";
    
    /**
     * Constant: space.
     */
    private static final String SPACE = " ";
    
    /**
     * Test method for
     * {@link com.archibus.app.sysadmin.event.data.LoggerUtilities#findMatchingTable(java.lang.String, java.util.List)}
     * .
     */
    public void testFindMatchingTableStringListOfString() {
        {
            // case 1: tableName in the list
            final List<String> tablesToLog = new ArrayList<String>();
            tablesToLog.add(MockUtilities.TABLE_NAME1);
            tablesToLog.add(MockUtilities.TABLE_NAME2);
            
            final String sql = SPACE + MockUtilities.TABLE_NAME1 + SPACE;
            final String sqlUpperCase = sql.toUpperCase();
            final String actual = LoggerUtilities.findMatchingTable(sqlUpperCase, tablesToLog);
            
            Assert.assertEquals(MockUtilities.TABLE_NAME1, actual);
        }
        {
            // case 2: wildcard
            final List<String> tablesToLog = new ArrayList<String>();
            tablesToLog.add(WILD_CARD);
            
            final String sql = SPACE + MockUtilities.TABLE_NAME1 + SPACE;
            final String sqlUpperCase = sql.toUpperCase();
            final String actual = LoggerUtilities.findMatchingTable(sqlUpperCase, tablesToLog);
            
            Assert.assertEquals(SPACE, actual);
        }
        {
            // case 3: tableName not in the list
            final List<String> tablesToLog = new ArrayList<String>();
            tablesToLog.add(MockUtilities.TABLE_NAME2);
            
            final String sql = SPACE + MockUtilities.TABLE_NAME1 + SPACE;
            final String sqlUpperCase = sql.toUpperCase();
            final String actual = LoggerUtilities.findMatchingTable(sqlUpperCase, tablesToLog);
            
            Assert.assertEquals(null, actual);
        }
        {
            // case 4: tables is null
            final List<String> tablesToLog = null;
            
            final String sql = SPACE + MockUtilities.TABLE_NAME1 + SPACE;
            final String sqlUpperCase = sql.toUpperCase();
            final String actual = LoggerUtilities.findMatchingTable(sqlUpperCase, tablesToLog);
            
            Assert.assertEquals(null, actual);
        }
    }
    
    /**
     * Test method for
     * {@link com.archibus.app.sysadmin.event.data.LoggerUtilities#findMatchingTable(java.lang.String, java.lang.String)}
     * .
     */
    public void testFindMatchingTableStringString() {
        // The table name in the SQL must be surrounded by spaces and/or commas.
        {
            // case 1: tableToLog: match, surrounded by spaces in SQL
            final String tableToLog = MockUtilities.TABLE_NAME1;
            
            final String sql = SPACE + MockUtilities.TABLE_NAME1 + SPACE;
            boolean actual = LoggerUtilities.findMatchingTable(sql, tableToLog);
            
            Assert.assertEquals(true, actual);
            
            // make sure match is case insensitive
            actual = LoggerUtilities.findMatchingTable(sql.toLowerCase(), tableToLog.toUpperCase());
            
            Assert.assertEquals(true, actual);
        }
        {
            // case 2: tableToLog: match, surrounded by commas in SQL
            final String tableToLog = MockUtilities.TABLE_NAME1;
            
            final String sql = COMMA + MockUtilities.TABLE_NAME1 + COMMA;
            boolean actual = LoggerUtilities.findMatchingTable(sql, tableToLog);
            
            Assert.assertEquals(true, actual);
            
            // make sure match is case insensitive
            actual = LoggerUtilities.findMatchingTable(sql.toLowerCase(), tableToLog.toUpperCase());
            
            Assert.assertEquals(true, actual);
        }
        {
            // case 3: tableToLog: match, surrounded by comma and space in SQL
            final String tableToLog = MockUtilities.TABLE_NAME1;
            
            final String sql = COMMA + MockUtilities.TABLE_NAME1 + SPACE;
            boolean actual = LoggerUtilities.findMatchingTable(sql, tableToLog);
            
            Assert.assertEquals(true, actual);
            
            // make sure match is case insensitive
            actual = LoggerUtilities.findMatchingTable(sql.toLowerCase(), tableToLog.toUpperCase());
            
            Assert.assertEquals(true, actual);
        }
        {
            // case 4: tableToLog: no match, surrounded by spaces in SQL
            final String tableToLog = MockUtilities.TABLE_NAME2;
            
            final String sql = SPACE + MockUtilities.TABLE_NAME1 + SPACE;
            final boolean actual = LoggerUtilities.findMatchingTable(sql, tableToLog);
            
            Assert.assertEquals(false, actual);
        }
    }
    
    /**
     * Test method for
     * {@link com.archibus.app.sysadmin.event.data.LoggerUtilities#isTableInList(String, List)} .
     */
    public void testIsTableInList() {
        {
            // case 1: tableName in the list
            final List<String> tablesToLog = new ArrayList<String>();
            tablesToLog.add(MockUtilities.TABLE_NAME1);
            tablesToLog.add(MockUtilities.TABLE_NAME2);
            
            final String tableName = MockUtilities.TABLE_NAME1;
            boolean actual = LoggerUtilities.isTableInList(tableName.toLowerCase(), tablesToLog);
            
            Assert.assertEquals(true, actual);
            
            // make sure match is case insensitive
            actual = LoggerUtilities.isTableInList(tableName.toUpperCase(), tablesToLog);
            
            Assert.assertEquals(true, actual);
        }
        {
            // case 2: tableName not in the list
            final List<String> tablesToLog = new ArrayList<String>();
            tablesToLog.add(MockUtilities.TABLE_NAME2);
            
            final String tableName = MockUtilities.TABLE_NAME1;
            boolean actual = LoggerUtilities.isTableInList(tableName.toLowerCase(), tablesToLog);
            
            Assert.assertEquals(false, actual);
            
            // make sure match is case insensitive
            actual = LoggerUtilities.isTableInList(tableName.toUpperCase(), tablesToLog);
            
            Assert.assertEquals(false, actual);
        }
        {
            // case 3: wild card %
            final List<String> tablesToLog = new ArrayList<String>();
            tablesToLog.add(WILD_CARD);
            
            final String tableName = MockUtilities.TABLE_NAME1;
            boolean actual = LoggerUtilities.isTableInList(tableName.toLowerCase(), tablesToLog);
            
            Assert.assertEquals(true, actual);
            
            // make sure match is case insensitive
            actual = LoggerUtilities.isTableInList(tableName.toUpperCase(), tablesToLog);
            
            Assert.assertEquals(true, actual);
        }
    }
    
    /**
     * Test method for
     * {@link com.archibus.app.sysadmin.event.data.LoggerUtilities#determineTableName(String, String, String[])}
     * .
     */
    public void testDetermineTableName() {
        {
            // case 1: tableName supplied AND in the list
            final List<String> tablesToLog = new ArrayList<String>();
            tablesToLog.add(MockUtilities.TABLE_NAME1);
            tablesToLog.add(MockUtilities.TABLE_NAME2);
            final String actual =
                    LoggerUtilities
                        .determineTableName(MockUtilities.TABLE_NAME1, null, tablesToLog);
            
            Assert.assertEquals(MockUtilities.TABLE_NAME1, actual);
        }
        
        {
            // case 2: tableName supplied AND not in the list
            final List<String> tablesToLog = new ArrayList<String>();
            tablesToLog.add(MockUtilities.TABLE_NAME2);
            final String actual =
                    LoggerUtilities
                        .determineTableName(MockUtilities.TABLE_NAME1, null, tablesToLog);
            
            Assert.assertEquals(null, actual);
        }
        
        {
            // case 3: tableName not supplied, SQL supplied with matching table
            final List<String> tablesToLog = new ArrayList<String>();
            tablesToLog.add(MockUtilities.TABLE_NAME1);
            tablesToLog.add(MockUtilities.TABLE_NAME2);
            
            final String sql = SPACE + MockUtilities.TABLE_NAME1 + SPACE;
            final String sqlUpperCase = sql.toUpperCase();
            final String actual =
                    LoggerUtilities.determineTableName(null, sqlUpperCase, tablesToLog);
            
            Assert.assertEquals(MockUtilities.TABLE_NAME1, actual);
        }
        
        {
            // case 3: tableName not supplied, SQL supplied with non-matching table
            final List<String> tablesToLog = new ArrayList<String>();
            tablesToLog.add(MockUtilities.TABLE_NAME2);
            final String sql = SPACE + MockUtilities.TABLE_NAME1 + SPACE;
            final String sqlUpperCase = sql.toUpperCase();
            final String actual =
                    LoggerUtilities.determineTableName(null, sqlUpperCase, tablesToLog);
            
            Assert.assertEquals(null, actual);
        }
    }
}
