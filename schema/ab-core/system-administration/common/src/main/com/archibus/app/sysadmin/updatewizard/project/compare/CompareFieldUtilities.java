package com.archibus.app.sysadmin.updatewizard.project.compare;

import java.util.*;

import com.archibus.app.sysadmin.updatewizard.project.loader.*;
import com.archibus.app.sysadmin.updatewizard.project.transfer.mergeschema.SaveDifference;
import com.archibus.app.sysadmin.updatewizard.project.util.*;
import com.archibus.app.sysadmin.updatewizard.schema.util.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.schema.ArchibusFieldDefBase;
import com.archibus.utility.StringUtil;

/**
 * Utility for field comparison.
 * 
 * @author Catalin Purice
 * 
 */
public final class CompareFieldUtilities {
    
    /**
     * Autoincrement.
     */
    private static final String AUTOINCREMENT = "AUTOINCREMENT";

    /**
     * message for NULL values.
     */
    public static final String NULL_VALUE = "(null)";

    /**
     * template message.
     */
    public static final String OLD_AND_NEW_VAL_MESS = "%s [%s]";
    
    /**
     * Constant.
     */
    public static final String SEPARATOR = ";";
    
    /**
     * Private constructor.
     */
    private CompareFieldUtilities() {
        
    }
    
    /**
     * 
     * @param tableName table name
     * @param fieldName field name
     * @param afmEnumList afm_flds.enum_list value
     * @return missing key values
     */
    private static StringBuilder getMissingDbValuesFromEnumList(final String tableName,
            final String fieldName, final String afmEnumList) {
        final List<String> sqlValues =
                ProjectUpdateWizardUtilities.getDistinctSqlValues(tableName, fieldName);
        final List<String> projectKeyValues = extractKeyValues(afmEnumList);
        final StringBuilder missingValues = new StringBuilder();
        
        for (final String sqlValue : sqlValues) {
            if (!projectKeyValues.contains(sqlValue)) {
                missingValues.append(sqlValue);
                missingValues.append(SEPARATOR);
            }
        }
        // eliminate last new line
        return missingValues.length() == 0 ? missingValues : missingValues.replace(
            missingValues.lastIndexOf(SEPARATOR), missingValues.length(), "");
    }
    
    /**
     * 
     * @param enumList enumeration list like in afm_flds.enum_list
     * @return keys of the enumeration list
     */
    private static List<String> extractKeyValues(final String enumList) {
        final String[] element = enumList.split(SEPARATOR);
        final List<String> keyValues = new ArrayList<String>();
        if (element.length > 0) {
            keyValues.add(element[0]);
            for (int i = 2; i < element.length; i++) {
                if (i % 2 == 0) {
                    keyValues.add(element[i]);
                }
            }
        }
        return keyValues;
    }
    
    /**
     * Builds message taking into consideration NULL values.
     * @param value1 first value
     * @param value2 second value
     * @return message
     */
    public static String buildMessage(final String value1, final String value2) {
        String firstValue = value1;
        String secondValue = value2;
        
        if (StringUtil.isNullOrEmpty(firstValue)) {
            firstValue = NULL_VALUE;
        }
        if (StringUtil.isNullOrEmpty(secondValue)) {
            secondValue = NULL_VALUE;
        }

        return String.format(CompareFieldUtilities.OLD_AND_NEW_VAL_MESS, firstValue,
            secondValue);
    }
    
    
    /**
     * 
     * @param loadTable table
     * @param fieldsDataFromFile table's fields
     * @param isCompareOnly true - for Compare Only operation / false - for Merge Data Dictionary
     */
    public static void compareEachField(final LoadTableData loadTable,
            final List<Map<String, Object>> fieldsDataFromFile, final boolean isCompareOnly) {
        if (!loadTable.isSqlView()) {
            if (isCompareOnly) {
                ProjectUpdateWizardUtilities.updateTableStatus(loadTable.getTableName(),
                    ProjectUpdateWizardConstants.IN_PROGRESS);
            }
            final CompareTableProperties tableComparator =
                    CompareFactory.compareTableToCsvDef(loadTable);
            // tableComparator.compareTable();
            final List<LoadLangFieldData> fieldsData =
                    LoadLangFieldData.getFieldsForTable(tableComparator.getSqlTableDef(),
                        fieldsDataFromFile);
            for (final LoadLangFieldData fieldData : fieldsData) {
                CompareFactory.compareFieldToCsvDef(fieldData, isCompareOnly).compareField();
            }
        }
    }
    
    /**
     * 
     * @param checkDiff checked difference
     * @param rAction recommended action
     * @param csvFldMap Map from csv file
     * @param archibusFldDefnRecord DataRecord
     */
    public static void compareFieldProperty(final DifferenceMessage checkDiff,
            final Actions rAction, final Map<String, Object> csvFldMap,
            final DataRecord archibusFldDefnRecord) {
        
        final String afmValue = getArchibusFieldProperty(checkDiff, archibusFldDefnRecord);
        
        final String csvFieldName = checkDiff.name().toLowerCase();
        
        String csvValue = CsvUtilities.replaceNewLine(String.valueOf(csvFldMap.get(csvFieldName)));
        if (csvValue.startsWith("\"")) {
            csvValue = SchemaUpdateWizardUtilities.trimChar(csvValue, '"', '"');
        }
        
        if (!csvValue.equals(afmValue)) {
            buildAndSaveRecord(checkDiff, buildMessage(afmValue, csvValue),
                "", rAction, csvFldMap);
        }
    }
    
    /**
     * Builds and save the changed record.
     * 
     * @param diffType change type
     * @param dataDictDiff data dictionary difference message
     * @param sqlDiff sql difference message
     * @param recommAction recommended action
     * @param csvFldMap Map from csv file
     */
    public static void buildAndSaveRecord(final DifferenceMessage diffType,
            final String dataDictDiff, final String sqlDiff, final Actions recommAction,
            final Map<String, Object> csvFldMap) {
        
        if (dataDictDiff.length() > 0 || sqlDiff.length() > 0) {
            final SaveDifference saveFldMap = new SaveDifference();
            saveFldMap.buildMapForField(csvFldMap, diffType, dataDictDiff, sqlDiff, recommAction);
            saveFldMap.save();
        }
    }
    
    /**
     * Compares default values.
     * 
     * @param csvDfltVal value from csv file
     * @param afmDfltVal value from ARCHIBUS data dictionary
     * @param afmFieldDef ARCHIBUS field definition
     * @return true if the values are different and false otherwise
     */
    public static boolean compareValues(final String csvDfltVal, final String afmDfltVal,
            final ArchibusFieldDefBase.Immutable afmFieldDef) {
        boolean isDifferent = false;
        if (AUTOINCREMENT.equalsIgnoreCase(csvDfltVal)
                || AUTOINCREMENT.equalsIgnoreCase(afmDfltVal)) {
            isDifferent = csvDfltVal.equalsIgnoreCase(afmDfltVal);
            isDifferent ^= true;
        } else if (csvDfltVal.length() > 0 && afmDfltVal.length() > 0) {
            isDifferent = compareByType(csvDfltVal, afmDfltVal, afmFieldDef);
        }
        return isDifferent;
    }
    
    /**
     * @param csvDfltVal default value from csv file
     * @param afmDfltVal default value from archibus
     * @param afmFieldDef archibus field def
     * @return true if different
     */
    private static boolean compareByType(final String csvDfltVal, final String afmDfltVal,
            final ArchibusFieldDefBase.Immutable afmFieldDef) {
        boolean isDifferent = false;
        if (afmFieldDef.IsNumType()) {
            final Double csvNumDfltVal = Double.valueOf(csvDfltVal);
            final Double afmNumDfltVal = Double.valueOf(afmDfltVal);
            if (!csvNumDfltVal.equals(afmNumDfltVal)) {
                isDifferent = true;
            }
        } else {
            if (!csvDfltVal.equals(afmDfltVal)) {
                isDifferent = true;
            }
        }
        return isDifferent;
    }
    
    /**
     * 
     * @param property property
     * @param archibusFldDefnRecord DataRecord field
     * @return value as String
     */
    public static String getArchibusFieldProperty(final DifferenceMessage property,
            final DataRecord archibusFldDefnRecord) {
        final String field = property.toString().toLowerCase();
        final Object afmValue =
                archibusFldDefnRecord.getValue(ProjectUpdateWizardConstants.AFM_FLDS
                        + SchemaUpdateWizardConstants.DOT + field);
        String value = "";
        if (afmValue != null) {
            value = String.valueOf(afmValue);
        }
        return CsvUtilities.replaceNewLine(value);
    }
    
    /**
     * 
     * @param enumListValue enum list
     * @param defaultVal default value
     * @param csvFldMap Map from csv file
     */
    public static void checkIfDefaultIsInEnumList(final String enumListValue,
            final Object defaultVal, final Map<String, Object> csvFldMap) {
        final String defaultValue = String.valueOf(defaultVal);
        final List<String> enumKeys = extractKeyValues(enumListValue);
        final boolean valueExists = enumKeys.contains(defaultValue) ? true : false;
        if (enumListValue.length() > 0 && !valueExists) {
            CompareFieldUtilities.buildAndSaveRecord(DifferenceMessage.NO_DEFAULT, defaultValue,
                defaultValue, Actions.REVIEW_ERROR, csvFldMap);
        }
    }
    
    /**
     * Check database enum_list keys.
     * 
     * @param enumListValue enum list value from afm_flds.enum_list
     * @param csvFldMap Map from csv file
     */
    public static void checkMissingDbEnumList(final String enumListValue,
            final Map<String, Object> csvFldMap) {
        if (enumListValue.length() > 0) {
            final StringBuilder missingKeys =
                    getMissingDbValuesFromEnumList(csvFldMap.get("table_name").toString(),
                        csvFldMap.get("field_name").toString(), enumListValue);
            if (missingKeys.length() > 0) {
                CompareFieldUtilities.buildAndSaveRecord(DifferenceMessage.NO_DB_VAL_IN_ENUM, "",
                    missingKeys.toString(), Actions.REVIEW_ERROR, csvFldMap);
            }
        }
    }
    
    /**
     * 
     * Compare lang property(ml_heading and enum_list).
     * 
     * @param changeType change type
     * @param recommAction recommended action
     * @param csvFldMap CSV field properties
     * @param projectLangValue lang value(ml_heading or enum_list)
     */
    public static void compareLangProperty(final DifferenceMessage changeType,
            final Actions recommAction, final Map<String, Object> csvFldMap,
            final String projectLangValue) {
        
        String csvValue = String.valueOf(csvFldMap.get(changeType.name().toLowerCase()));
        
        // ignore ";" at the end of ENUM_LIST
        if (DifferenceMessage.ENUM_LIST.equals(changeType) && csvValue.length() > 0) {
            csvValue = CsvUtilities.trimSpaceBeforeAndAfterSeparator(csvValue, SEPARATOR);
            if (csvValue.endsWith(SEPARATOR)) {
                csvValue = csvValue.substring(0, csvValue.length() - 1);
            }
        }
        csvValue = CsvUtilities.replaceNewLine(csvValue);
        
        if (!csvValue.equals(projectLangValue)) {
            buildAndSaveRecord(changeType,
                String.format(OLD_AND_NEW_VAL_MESS, projectLangValue, csvValue), "", recommAction,
                csvFldMap);
        }
    }
}
