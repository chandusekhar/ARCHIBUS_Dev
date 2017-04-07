package com.archibus.app.sysadmin.updatewizard.project.loader;

import java.util.*;

/**
 * Loads data from afm_tbls.csv to Map object.
 * 
 * @author Catalin Purice
 * 
 */
public class LoadTableData {
    
    /**
     * true if the table is a view.
     */
    private final transient boolean tableIsView;
    
    /**
     * The table name.
     */
    private final transient String tableName;
    
    /**
     * Map of tables.
     */
    private transient Map<String, Object> tableMap;
    
    /**
     * Constructor.
     * 
     * @param tblMap table map
     */
    public LoadTableData(final Map<String, Object> tblMap) {
        this.tableName = tblMap.get("table_name").toString();
        this.tableIsView = "0".equals(String.valueOf(tblMap.get("is_sql_view"))) ? false : true;
        this.tableMap = tblMap;
    }
    
    /**
     * Constructor.
     * 
     * @param tableName table name
     * @param isSqlView true if the table is view
     */
    public LoadTableData(final String tableName, final boolean isSqlView) {
        this.tableIsView = isSqlView;
        this.tableName = tableName;
    }
    
    /**
     * @return the tablesMap
     */
    public Map<String, Object> getTablesMap() {
        return this.tableMap;
    }
    
    /**
     * @return the tableName
     */
    public String getTableName() {
        return this.tableName;
    }
    
    /**
     * @return the isSqlView
     */
    public boolean isSqlView() {
        return this.tableIsView;
    }
    
    /**
     * gets all tables from afm_tbls.csv.
     * 
     * @return List<LoadTableData>
     */
    public static List<LoadTableData> getAllTablesData() {
        final DataSourceFile dsfTables = new DataSourceFile("afm_tbls.csv");
        final List<Map<String, Object>> allTablesMap = dsfTables.getAllRecords();
        final List<LoadTableData> allTablesData = new ArrayList<LoadTableData>();
        for (final Map<String, Object> tblMap : allTablesMap) {
            allTablesData.add(new LoadTableData(tblMap));
        }
        return allTablesData;
    }
    
    /**
     * Returns table names from LoadTableData objects.
     * 
     * @param tablesDataFromFile List<LoadTableData>
     * @return list of tables
     */
    public static List<String> getAllTableNames(final List<LoadTableData> tablesDataFromFile) {
        final List<String> csvTableNames = new ArrayList<String>();
        for (final LoadTableData tableData : tablesDataFromFile) {
            if (!tableData.isSqlView()) {
                csvTableNames.add(tableData.getTableName());
            }
        }
        return csvTableNames;
    }
}
