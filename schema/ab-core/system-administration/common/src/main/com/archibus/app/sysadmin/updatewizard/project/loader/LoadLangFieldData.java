package com.archibus.app.sysadmin.updatewizard.project.loader;

import java.util.*;
import java.util.Map.Entry;

import com.archibus.app.sysadmin.updatewizard.project.compare.CompareFieldUtilities;
import com.archibus.app.sysadmin.updatewizard.project.util.*;
import com.archibus.app.sysadmin.updatewizard.schema.dbschema.DatabaseSchemaTableDef;
import com.archibus.context.ContextStore;
import com.archibus.schema.FieldEnumImpl;
import com.archibus.utility.StringUtil;

/**
 * 
 * Used to load translatable fields.
 * 
 * @author Catalin Purice
 * @since 20.1
 * 
 */
public class LoadLangFieldData extends LoadFieldData {
    
    /**
     * Enumeration list translatable field name from afm_flds_lang table.
     */
    private static final String ENUM_LIST_FIELD_NAME = "enum_list" + LangUtilities.getFieldSuffix();
    
    /**
     * ML heading translatable field name from afm_flds_lang table.
     */
    private static final String ML_HEADING_FIELD_NAME = "ml_heading"
            + LangUtilities.getFieldSuffix();
    
    /**
     * Constant.
     */
    private static final String AFM_FLDS_FILE = "afm_flds.csv";
    
    /**
     * ML Heading as String.
     */
    private String mlHeading;
    
    /**
     * Enumeration List as String.
     */
    private String enumList;
    
    /**
     * 
     * @param fldMap field map
     */
    public LoadLangFieldData(final Map<String, Object> fldMap) {
        super(fldMap);
    }
    
    /**
     * Constructor.
     * 
     * @param fldData LoadFieldData
     */
    public LoadLangFieldData(final LoadLangFieldData fldData) {
        
        super(fldData);
        if (this.isAfmFieldExists()) {
            loadMlHeading();
            loadEnumList();
        }
    }
    
    /**
     * Getter for the mlHeading property.
     * 
     * @see mlHeading
     * @return the mlHeading property.
     */
    public String getMlHeading() {
        return this.mlHeading;
    }
    
    /**
     * Getter for the enumList property.
     * 
     * @see enumList
     * @return the enumList property.
     */
    public String getEnumList() {
        return this.enumList;
    }
    
    /**
     * Loads enumeration list based on Locale.
     */
    private void loadEnumList() {
        if (getFieldDef() instanceof FieldEnumImpl) {
            final FieldEnumImpl enumFieldDef = (FieldEnumImpl) getFieldDef();
            this.enumList =
                    enumListToString(enumFieldDef.getValues(ContextStore.get().getUserSession()
                        .getLocale()));
        } else {
            this.enumList = "";
        }
    }
    
    /**
     * Loads ML headings based on Locale.
     */
    private void loadMlHeading() {
        this.mlHeading = mlHeadingToString();
    }
    
    /**
     * get fields for table.
     * 
     * @param sqlTblDefn SQL table definition
     * @param allFieldsMap all fields from CSV file
     * @return List<LoadFieldData>
     */
    public static List<LoadLangFieldData> getFieldsForTable(
            final DatabaseSchemaTableDef sqlTblDefn, final List<Map<String, Object>> allFieldsMap) {
        final List<LoadLangFieldData> tableFieldsData = new ArrayList<LoadLangFieldData>();
        for (final Map<String, Object> fldMap : allFieldsMap) {
            if (sqlTblDefn.getTableName().equals(
                fldMap.get(ProjectUpdateWizardConstants.TABLE_NAME).toString())) {
                final LoadLangFieldData loadedField = new LoadLangFieldData(fldMap);
                loadedField.loadData(sqlTblDefn);
                tableFieldsData.add(loadedField);
            }
        }
        return tableFieldsData;
    }
    
    /**
     * Loads all fields from file into memory.
     * 
     * @return List<Map<String, Object>>
     */
    public static List<Map<String, Object>> loadAllCSVFieldsData() {
        List<Map<String, Object>> fieldsData = null;
        if (LangUtilities.isLangEn()) {
            fieldsData = getCSVFieldsData();
        } else {
            fieldsData = getCSVLangFieldsData();
        }
        return fieldsData;
    }
    
    /**
     * 
     * Returns all ARCHIBUS fields (including enum_list_xx anf ml_heading_xx) from CSV file.
     * 
     * @return fields
     */
    private static List<Map<String, Object>> getCSVLangFieldsData() {
        final DataSourceFile afmFldsTables = new DataSourceFile(AFM_FLDS_FILE);
        final DataSourceFile afmFldsLangTables = new DataSourceFile("afm_flds_lang.csv");
        final List<Map<String, Object>> enRecords = afmFldsTables.getAllRecords();
        final List<Map<String, Object>> langRecords = afmFldsLangTables.getAllRecords();
        for (final Map<String, Object> csvRecord : enRecords) {
            final String tableName =
                    csvRecord.get(ProjectUpdateWizardConstants.TABLE_NAME).toString();
            final String fieldName =
                    csvRecord.get(ProjectUpdateWizardConstants.FIELD_NAME).toString();
            final Map<String, Object> recordLang = getLangRecord(langRecords, tableName, fieldName);
            if (StringUtil.notNullOrEmpty(recordLang)) {
                final String mlHeadingValue = recordLang.get(ML_HEADING_FIELD_NAME).toString();
                final String enumListValue = recordLang.get(ENUM_LIST_FIELD_NAME).toString();
                
                addLangFields(enRecords, csvRecord, mlHeadingValue, enumListValue);
            } else {
                ProjectUpdateWizardLogger.logWarning("Field not defined in afm_flds_lang table:"
                        + tableName + "." + fieldName);
            }
        }
        return enRecords;
    }
    
    /**
     * 
     * Returns record from the list of records based on table name and field name.
     * 
     * @param records records from CSV file
     * @param tableName table name
     * @param fieldName field name
     * @return record
     */
    private static Map<String, Object> getLangRecord(final List<Map<String, Object>> records,
            final String tableName, final String fieldName) {
        Map<String, Object> recordFound = null;
        for (final Map<String, Object> record : records) {
            if (tableName.equalsIgnoreCase(record.get(ProjectUpdateWizardConstants.TABLE_NAME)
                .toString())
                    && fieldName.equalsIgnoreCase(record.get(
                        ProjectUpdateWizardConstants.FIELD_NAME).toString())) {
                recordFound = record;
                break;
            }
        }
        return recordFound;
    }
    
    /**
     * 
     * Updates the Map from CSV file with the translatable values of ml_heading and enum_list.
     * 
     * @param records CSV records
     * @param csvRecord record to be updated
     * @param mlHeading ml_heading translatable value
     * @param enumList enum_list translatable value
     */
    private static void addLangFields(final List<Map<String, Object>> records,
            final Map<String, Object> csvRecord, final String mlHeading, final String enumList) {
        final int index = records.indexOf(csvRecord);
        final Set<Entry<String, Object>> sset = records.get(index).entrySet();
        final Iterator<Entry<String, Object>> iter = sset.iterator();
        while (iter.hasNext()) {
            final Entry<String, Object> elem = iter.next();
            if (DifferenceMessage.ENUM_LIST.name().equalsIgnoreCase(elem.getKey())) {
                elem.setValue(enumList);
            } else if (DifferenceMessage.ML_HEADING.name().equalsIgnoreCase(elem.getKey())) {
                elem.setValue(mlHeading);
            }
        }
    }
    
    /**
     * 
     * Returns all ARCHIBUS fields from CSV file.
     * 
     * @return fields
     */
    private static List<Map<String, Object>> getCSVFieldsData() {
        final DataSourceFile afmFldsTables = new DataSourceFile(AFM_FLDS_FILE);
        return afmFldsTables.getAllRecords();
    }
    
    /**
     * 
     * Compares two enumeration list and returns true is different.
     * 
     * @param enumList enumeration list
     * @return enumeration list as string
     */
    private static String enumListToString(final List<Object> enumList) {
        String enumListAsString = "";
        for (final Object element : enumList) {
            final List<Object> enumValue = (List<Object>) element;
            final String storedValue = String.valueOf(enumValue.get(0)).trim();
            final String displayedValue = String.valueOf(enumValue.get(1)).trim();
            if (enumListAsString.length() > 0) {
                enumListAsString += CompareFieldUtilities.SEPARATOR;
            }
            enumListAsString += storedValue + CompareFieldUtilities.SEPARATOR + displayedValue;
        }
        return enumListAsString;
    }
    
    /**
     * 
     * Converts multi-line heading to String.
     * 
     * @return ml heading
     */
    private String mlHeadingToString() {
        final List<String> mlAscHeading =
                getFieldDef().getMultiLineHeadings(ContextStore.get().getUserSession().getLocale());
        String mlHeadingAsString = "";
        for (final String element : mlAscHeading) {
            final String mlHeadingValue = element;
            if (mlHeadingAsString.length() > 0) {
                mlHeadingAsString += "\n";
            }
            mlHeadingAsString += mlHeadingValue;
        }
        return mlHeadingAsString;
    }
}
