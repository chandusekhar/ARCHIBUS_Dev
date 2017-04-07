package com.archibus.app.sysadmin.updatewizard.project.util;

import java.util.*;

import com.archibus.app.sysadmin.updatewizard.project.loader.DataSourceFile;
import com.archibus.datasource.DataSource;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;

/**
 * CSV file utility.
 * 
 * @author Catalin
 * 
 */
public final class CsvUtilities {
    
    /**
     * constant.
     */
    private static final String SPACE = " ";
    
    /**
     * constant.
     */
    private static final String TABLE_NAME = "table_name";
    
    /**
     * constant.
     */
    private static final String FIELD_NAME = "field_name";
    
    /**
     * Constructor.
     */
    private CsvUtilities() {
        
    }
    
    /**
     * Returns all table names from csv file.
     * 
     * @param csvTblsMap list of tables map from afm_tbls.csv file
     * @return list of table names
     */
    public static List<String> getAllTableNames(final List<Map<String, Object>> csvTblsMap) {
        final List<String> tableNames = new ArrayList<String>();
        for (final Map<String, Object> tableMap : csvTblsMap) {
            final String tableNameFromMap = tableMap.get(TABLE_NAME).toString();
            if (!tableNames.contains(tableNameFromMap)) {
                tableNames.add(tableMap.get(TABLE_NAME).toString());
            }
        }
        return tableNames;
    }
    
    /**
     * Returns all table names from CSV file but excludes views.
     * 
     * @param csvTblsMap list of tables map from afm_tbls.csv file
     * @return list of table names
     */
    public static List<String> getTableNamesOnly(final List<Map<String, Object>> csvTblsMap) {
        final List<String> tableNames = new ArrayList<String>();
        for (final Map<String, Object> tableMap : csvTblsMap) {
            final String tableNameFromMap = tableMap.get(TABLE_NAME).toString();
            final String isSqlView =
                    tableMap.get(ProjectUpdateWizardUtilities.IS_SQL_VIEW).toString();
            if ("0".equals(isSqlView) && !tableNames.contains(tableNameFromMap)) {
                tableNames.add(tableMap.get(TABLE_NAME).toString());
            }
        }
        return tableNames;
    }
    
    /**
     * Returns all filed names for the specified table name.
     * 
     * @param tableName table name
     * @param csvFldsMap list of fields map from afm_flds.csv file
     * @return list of field names
     */
    public static List<String> getFieldNamesForTable(final String tableName,
            final List<Map<String, Object>> csvFldsMap) {
        final List<String> fieldNames = new ArrayList<String>();
        for (final Map<String, Object> fieldMap : csvFldsMap) {
            if (fieldMap.get(TABLE_NAME).toString().equals(tableName)) {
                fieldNames.add(fieldMap.get(FIELD_NAME).toString());
            }
        }
        return fieldNames;
    }
    
    /**
     * Returns the specific Map for the table.
     * 
     * @param tableName table name
     * @param csvTblsMap list of Map
     * @return Map for the specific table
     */
    public static Map<String, Object> getTableMap(final String tableName,
            final List<Map<String, Object>> csvTblsMap) {
        Map<String, Object> matchTableMap = new HashMap<String, Object>();
        for (final Map<String, Object> tableMap : csvTblsMap) {
            if (tableMap.get(TABLE_NAME).toString().equals(tableName)) {
                matchTableMap = tableMap;
            }
        }
        return matchTableMap;
    }
    
    /**
     * Returns the specific Map for the field from table.
     * 
     * @param tableName table name
     * @param fieldName field name
     * @param csvFldsMap list of Map
     * @return Map for the specific field from table
     */
    public static Map<String, Object> getFieldMap(final String tableName, final String fieldName,
            final List<Map<String, Object>> csvFldsMap) {
        Map<String, Object> matchFieldMap = new HashMap<String, Object>();
        for (final Map<String, Object> fieldMap : csvFldsMap) {
            if (fieldMap.get(TABLE_NAME).toString().equals(tableName)
                    && fieldMap.get(FIELD_NAME).toString().equals(fieldName)) {
                matchFieldMap = fieldMap;
                break;
            }
        }
        return matchFieldMap;
    }
    
    /**
     * Gets the map from csv file.
     * 
     * @param tableName table name
     * @return List<Map<String, Object>>
     */
    public static List<Map<String, Object>> getMapsFromFile(final String tableName) {
        return new DataSourceFile(tableName + ".csv").getAllRecords();
    }
    
    /**
     * 
     * @param dataS data source
     * @param map the map
     * @return DataRecord
     */
    public static DataRecord mapToRecord(final DataSource dataS, final Map<String, Object> map) {
        final DataRecord record = dataS.createNewRecord();
        final String mainTableName = dataS.getMainTableName();
        final Set<Map.Entry<String, Object>> set = map.entrySet();
        final Iterator<Map.Entry<String, Object>> iter = set.iterator();
        while (iter.hasNext()) {
            final Map.Entry<String, Object> elem = iter.next();
            record.setValue(mainTableName + '.' + elem.getKey(), elem.getValue());
        }
        return record;
    }
    
    /**
     * 
     * @param tableName table name
     * @param fieldName field name
     * @return Map<String, Object> containing field properties
     */
    public static Map<String, Object> getFieldMap(final String tableName, final String fieldName) {
        final DataSource fieldsPropDS =
                ProjectUpdateWizardUtilities
                    .createDataSourceForTable(ProjectUpdateWizardConstants.AFM_FLDS)
                    .addRestriction(
                        Restrictions.eq(ProjectUpdateWizardConstants.AFM_FLDS, TABLE_NAME,
                            tableName))
                    .addRestriction(
                        Restrictions.eq(ProjectUpdateWizardConstants.AFM_FLDS, FIELD_NAME,
                            fieldName));
        return fieldsPropDS.getRecord().getValues(true);
    }
    
    /**
     * New line from CSV file is "\r\n". In DB the new line comes as "\n". We need to ignore this
     * kind of difference.
     * 
     * @param value value
     * @return String
     */
    public static String replaceNewLine(final String value) {
        return value.replace("\r\n", "\n");
    }
    
    /**
     * Replace " " before and after SEPARATOR.
     * 
     * @param target the string
     * @param separator separator used
     * @return the string trimmed
     */
    public static String trimSpaceBeforeAndAfterSeparator(final String target,
            final String separator) {
        String myString = target;
        final String[] matches = { separator + SPACE, SPACE + separator };
        while (myString.contains(matches[0]) || myString.contains(matches[1])) {
            myString = myString.replaceAll(matches[0], separator);
            myString = myString.replaceAll(matches[1], separator);
        }
        return myString;
    }
    
    /**
     * 
     * Get Map By Key.
     * 
     * @param key key
     * @param value value
     * @param csvFldsMap all records
     * @return map
     */
    public static Map<String, Object> getMapByKey(final String key, final String value,
            final List<Map<String, Object>> csvFldsMap) {
        Map<String, Object> matchFieldMap = new HashMap<String, Object>();
        for (final Map<String, Object> fieldMap : csvFldsMap) {
            if (fieldMap.get(key).toString().equals(value)) {
                matchFieldMap = fieldMap;
                break;
            }
        }
        return matchFieldMap;
    }
}
