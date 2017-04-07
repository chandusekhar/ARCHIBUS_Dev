package com.archibus.app.sysadmin.updatewizard.project.compare;

import java.util.Map;

import com.archibus.app.sysadmin.updatewizard.project.loader.LoadLangFieldData;
import com.archibus.app.sysadmin.updatewizard.project.util.*;
import com.archibus.app.sysadmin.updatewizard.schema.compare.PropertyType;
import com.archibus.app.sysadmin.updatewizard.schema.sqlgenerator.SqlTypes;

/**
 * Compares the field properties.
 * 
 * @author Catalin Purice
 * 
 */
public class CompareFieldProperties extends LoadLangFieldData {
    
    /**
     * constant.
     */
    private static final String NULL = "null";
    
    /**
     * constant.
     */
    private static final String ONE = "1";
    
    /**
     * constant.
     */
    private static final String ZERO = "0";
    
    /**
     * constant.
     */
    private static final String DOT = ".";
    
    /**
     * Specifies if to make SQL comparison where or not there is a difference between data
     * dictionary and CSV file.
     */
    private final boolean isCompare;
    
    /**
     * Constructor.
     * 
     * @param fldData LoadFieldData
     * @param isCompare Specifies if to make SQL comparison where or not there is a difference
     *            between data dictionary and CSV file.
     */
    public CompareFieldProperties(final LoadLangFieldData fldData, final boolean isCompare) {
        super(fldData);
        this.isCompare = isCompare;
    }
    
    /**
     * Compare the field name against ARCHIBUS data dictionary and SQL field table.
     */
    public void compareField() {
        
        if (this.isAfmFieldExists()) {
            compareDataType();
            compareAllowNull();
            compareDfltValue();
            compareDepCols();
            compareValidTable();
            comparePrimaryKey();
            
            // compare enum_list
            CompareFieldUtilities.compareLangProperty(DifferenceMessage.ENUM_LIST,
                Actions.APPLY_CHANGE, this.getCsvFldMap(), this.getEnumList());
            
            // compare ml_heading
            CompareFieldUtilities.compareLangProperty(DifferenceMessage.ML_HEADING,
                Actions.APPLY_CHANGE, this.getCsvFldMap(), this.getMlHeading());
            
            final String afmEnumListValue =
                    CompareFieldUtilities.getArchibusFieldProperty(DifferenceMessage.ENUM_LIST,
                        this.getArchibusFldDefnRecord());
            if (this.isSqlFieldExists()) {
                // check database enum_list keys
                CompareFieldUtilities.checkMissingDbEnumList(afmEnumListValue, this.getCsvFldMap());
            }
            // check if default is in enum_list
            CompareFieldUtilities.checkIfDefaultIsInEnumList(afmEnumListValue, this.getFieldDef()
                .getDefaultValue(), this.getCsvFldMap());
            
            // compare sl_heading
            CompareFieldUtilities.compareFieldProperty(DifferenceMessage.SL_HEADING,
                Actions.APPLY_CHANGE, this.getCsvFldMap(), this.getArchibusFldDefnRecord());
            
            // compare is_atxt
            CompareFieldUtilities.compareFieldProperty(DifferenceMessage.IS_ATXT,
                Actions.APPLY_CHANGE, this.getCsvFldMap(), this.getArchibusFldDefnRecord());
            
            // afm_type
            CompareFieldUtilities.compareFieldProperty(DifferenceMessage.AFM_TYPE,
                Actions.APPLY_CHANGE, this.getCsvFldMap(), this.getArchibusFldDefnRecord());
            
            // attributes
            CompareFieldUtilities.compareFieldProperty(DifferenceMessage.ATTRIBUTES,
                Actions.APPLY_CHANGE, this.getCsvFldMap(), this.getArchibusFldDefnRecord());
            
            // string_format
            CompareFieldUtilities.compareFieldProperty(DifferenceMessage.STRING_FORMAT,
                Actions.APPLY_CHANGE, this.getCsvFldMap(), this.getArchibusFldDefnRecord());
            
            // num_format
            CompareFieldUtilities.compareFieldProperty(DifferenceMessage.NUM_FORMAT,
                Actions.APPLY_CHANGE, this.getCsvFldMap(), this.getArchibusFldDefnRecord());
            
            // comments
            CompareFieldUtilities.compareFieldProperty(DifferenceMessage.COMMENTS,
                Actions.APPLY_CHANGE, this.getCsvFldMap(), this.getArchibusFldDefnRecord());
            
            // edit_group - will not be displayed for merge as per specification
            if (this.isCompare) {
                CompareFieldUtilities.compareFieldProperty(DifferenceMessage.EDIT_GROUP,
                    Actions.APPLY_CHANGE, this.getCsvFldMap(), this.getArchibusFldDefnRecord());
            }
            // edit_mask
            CompareFieldUtilities.compareFieldProperty(DifferenceMessage.EDIT_MASK,
                Actions.APPLY_CHANGE, this.getCsvFldMap(), this.getArchibusFldDefnRecord());
            
            // field_grouping
            CompareFieldUtilities.compareFieldProperty(DifferenceMessage.FIELD_GROUPING,
                Actions.APPLY_CHANGE, this.getCsvFldMap(), this.getArchibusFldDefnRecord());
            
            // is_tc_tracebale
            CompareFieldUtilities.compareFieldProperty(DifferenceMessage.IS_TC_TRACEABLE,
                Actions.APPLY_CHANGE, this.getCsvFldMap(), this.getArchibusFldDefnRecord());
            
            // review_group
            CompareFieldUtilities.compareFieldProperty(DifferenceMessage.REVIEW_GROUP,
                Actions.APPLY_CHANGE, this.getCsvFldMap(), this.getArchibusFldDefnRecord());
            
            // max_val
            CompareFieldUtilities.compareFieldProperty(DifferenceMessage.MAX_VAL,
                Actions.APPLY_CHANGE, this.getCsvFldMap(), this.getArchibusFldDefnRecord());
            
            // min_val
            CompareFieldUtilities.compareFieldProperty(DifferenceMessage.MIN_VAL,
                Actions.APPLY_CHANGE, this.getCsvFldMap(), this.getArchibusFldDefnRecord());
            
            // validate_data
            CompareFieldUtilities.compareFieldProperty(DifferenceMessage.VALIDATE_DATA,
                Actions.APPLY_CHANGE, this.getCsvFldMap(), this.getArchibusFldDefnRecord());
        } else {
            /**
             * the field exists in csv file only.
             */
            CompareFieldUtilities.buildAndSaveRecord(DifferenceMessage.NEW, "-[new]", "",
                Actions.APPLY_CHANGE, this.getCsvFldMap());
        }
    }
    
    /**
     * Compares allow null value.
     */
    private void compareAllowNull() {
        final String afmAllowNull = this.getFieldDef().getAllowNull() ? ONE : ZERO;
        final String csvAllowNull = String.valueOf(this.getCsvFldMap().get("allow_null"));
        
        String csvDiff = "";
        String sqlDiff = "";
        // check data dictionary
        if (!csvAllowNull.equalsIgnoreCase(afmAllowNull)) {
            csvDiff =
                    String.format(CompareFieldUtilities.OLD_AND_NEW_VAL_MESS, afmAllowNull,
                        csvAllowNull);
        }
        
        if (csvDiff.length() > 0 || this.isCompare) {
            if (this.isSqlFieldExists()
                    && this.getCompField().get(PropertyType.ALLOWNULL).isChanged()) {
                sqlDiff =
                        String.format(CompareFieldUtilities.OLD_AND_NEW_VAL_MESS, afmAllowNull,
                            this.getCompField().get(PropertyType.ALLOWNULL).getOldValue());
            }
            CompareFieldUtilities.buildAndSaveRecord(DifferenceMessage.ALLOW_NULL, csvDiff,
                sqlDiff, Actions.APPLY_CHANGE, this.getCsvFldMap());
        }
    }
    
    /**
     * compare data types.
     */
    private void compareDataType() {
        
        final Map<String, Object> csvFldMap = this.getCsvFldMap();
        final String csvDataType = String.valueOf(csvFldMap.get("data_type"));
        final String afmDataType = String.valueOf(this.getFieldDef().getSqlType());
        
        String csvDiff = "";
        if (SqlTypes.isDataTypeDifferent(afmDataType, csvDataType)) {
            csvDiff =
                    String.format(CompareFieldUtilities.OLD_AND_NEW_VAL_MESS,
                        SqlTypes.dataTypeToLiteral(Integer.parseInt(afmDataType)),
                        SqlTypes.dataTypeToLiteral(Integer.parseInt(csvDataType)));
        }
        
        if (csvDiff.length() > 0 || this.isCompare) {
            String sqlDiff = "";
            if (this.isSqlFieldExists()) {
                final String sqlDataType =
                        SqlTypes.getGroupTypeByType(this.getCompField().getSysFieldDef()
                            .getDataType());
                final String afmGroupType =
                        this.isDocStgAfmType() ? String.valueOf(SqlTypes.SQL_LONGVARBINARY)
                                : String.valueOf(SqlTypes.DATATYPE
                                    .get(Integer.valueOf(afmDataType)).getGroupType());
                sqlDiff = SqlTypes.checkGroupType(sqlDataType, afmDataType, afmGroupType);
            }
            CompareFieldUtilities.buildAndSaveRecord(DifferenceMessage.DATA_TYPE, csvDiff, sqlDiff,
                Actions.KEEP_EXISTING, this.getCsvFldMap());
        }
        sizeMatter(csvDataType);
    }
    
    /**
     * @param csvDataType data type
     */
    private void sizeMatter(final String csvDataType) {
        if (!this.isDocStgAfmType()) {
            if (new SqlTypes(Integer.parseInt(csvDataType)).isDecimalsMatters()) {
                compareDecimals();
            }
            if (new SqlTypes(Integer.parseInt(csvDataType)).isSizeMatters()) {
                compareSize();
            }
        }
    }
    
    /**
     * compares field size.
     */
    private void compareSize() {
        final Map<String, Object> csvFldMap = this.getCsvFldMap();
        final String afmSize = String.valueOf(this.getFieldDef().getSize());
        final String csvSize = String.valueOf(csvFldMap.get("afm_size"));
        final int afmSizeInt = Integer.parseInt(afmSize);
        
        Actions action = Actions.APPLY_CHANGE;
        String csvDiff = "";
        if (!csvSize.equalsIgnoreCase(afmSize)) {
            csvDiff = String.format(CompareFieldUtilities.OLD_AND_NEW_VAL_MESS, afmSize, csvSize);
            final int csvSizeInt = Integer.parseInt(csvSize);
            if (csvSizeInt < afmSizeInt) {
                action = Actions.KEEP_EXISTING;
            }
        }
        
        if (csvDiff.length() > 0 || this.isCompare) {
            String sqlDiff = "";
            if (this.isSqlFieldExists()
                    && afmSizeInt != this.getCompField().getSysFieldDef().getSize()) {
                sqlDiff =
                        String.format(CompareFieldUtilities.OLD_AND_NEW_VAL_MESS, afmSize, this
                            .getCompField().getSysFieldDef().getSize());
            }
            CompareFieldUtilities.buildAndSaveRecord(DifferenceMessage.AFM_SIZE, csvDiff, sqlDiff,
                action, this.getCsvFldMap());
        }
    }
    
    /**
     * compares decimals.
     */
    private void compareDecimals() {
        String csvDiff = "";
        final Map<String, Object> csvFldMap = this.getCsvFldMap();
        final String afmDecimals =
                CompareFieldUtilities.getArchibusFieldProperty(DifferenceMessage.DECIMALS,
                    this.getArchibusFldDefnRecord());
        final String csvDecimals = String.valueOf(csvFldMap.get("decimals"));
        final int afmDecimalsInt = Integer.parseInt(afmDecimals);
        
        Actions action = Actions.APPLY_CHANGE;
        if (!csvDecimals.equalsIgnoreCase(afmDecimals)) {
            csvDiff =
                    String.format(CompareFieldUtilities.OLD_AND_NEW_VAL_MESS, afmDecimals,
                        csvDecimals);
            final int csvSizeI = Integer.parseInt(csvDecimals);
            if (csvSizeI < afmDecimalsInt) {
                action = Actions.KEEP_EXISTING;
            }
        }
        
        if (csvDiff.length() > 0 || this.isCompare) {
            String sqlDiff = "";
            if (this.isSqlFieldExists()
                    && afmDecimalsInt > this.getCompField().getSysFieldDef().getDecimals()) {
                sqlDiff =
                        String.format(CompareFieldUtilities.OLD_AND_NEW_VAL_MESS, afmDecimals,
                            String.valueOf(this.getCompField().getSysFieldDef().getDecimals()));
            }
            CompareFieldUtilities.buildAndSaveRecord(DifferenceMessage.DECIMALS, csvDiff, sqlDiff,
                action, this.getCsvFldMap());
        }
    }
    
    /**
     * Compares dependency columns.
     * 
     * @return
     */
    private void compareDepCols() {
        final String csvDepCols = String.valueOf(this.getCsvFldMap().get("dep_cols"));
        
        String afmDepCols =
                getArchibusFldDefnRecord().getString(
                    ProjectUpdateWizardConstants.AFM_FLDS + DOT
                            + DifferenceMessage.DEP_COLS.name().toLowerCase());
        if (afmDepCols == null || NULL.equals(afmDepCols)) {
            afmDepCols = "";
        }
        
        String csvDiff = "";
        if (!csvDepCols.equalsIgnoreCase(afmDepCols)) {
            csvDiff = CompareFieldUtilities.buildMessage(afmDepCols, csvDepCols);
        }
        
        if (csvDiff.length() > 0 || this.isCompare) {
            String sqlDiff = "";
            if (this.isSqlFieldExists() && this.getSqlFieldDef().isForeignKey()
                    && this.getCompField().hasForeignKeysChanged()) {
                sqlDiff =
                        String.format(CompareFieldUtilities.OLD_AND_NEW_VAL_MESS, afmDepCols,
                            "Foreign Key changed");
            }
            CompareFieldUtilities.buildAndSaveRecord(DifferenceMessage.DEP_COLS, csvDiff, sqlDiff,
                Actions.APPLY_CHANGE, this.getCsvFldMap());
        }
    }
    
    /**
     * Compares default value.
     */
    private void compareDfltValue() {
        
        final String csvDfltVal = String.valueOf(this.getCsvFldMap().get("dflt_val"));
        String afmDfltVal =
                getArchibusFldDefnRecord().getString(
                    ProjectUpdateWizardConstants.AFM_FLDS + DOT
                            + DifferenceMessage.DFLT_VAL.name().toLowerCase());
        if (afmDfltVal == null || NULL.equals(afmDfltVal)) {
            afmDfltVal = "";
        }
        String csvDiff = "";
        if (CompareFieldUtilities.compareValues(csvDfltVal, afmDfltVal, this.getFieldDef())) {
            csvDiff = CompareFieldUtilities.buildMessage(afmDfltVal, csvDfltVal);
        }
        
        if (csvDiff.length() > 0 || this.isCompare) {
            String sqlDiff = "";
            if (this.isSqlFieldExists()
                    && this.getCompField().get(PropertyType.DEFAULT).isChanged()) {
                final String sqlValue =
                        this.getCompField().get(PropertyType.DEFAULT).getOldValue().toString();
                sqlDiff = CompareFieldUtilities.buildMessage(afmDfltVal, sqlValue);
            }
            CompareFieldUtilities.buildAndSaveRecord(DifferenceMessage.DFLT_VAL, csvDiff, sqlDiff,
                Actions.REVIEW_ERROR, this.getCsvFldMap());
        }
    }
    
    /**
     * compares primary keys.
     */
    private void comparePrimaryKey() {
        final String csvPkey = String.valueOf(this.getCsvFldMap().get("primary_key"));
        final String afmPkey = String.valueOf(this.getFieldDef().getPrimaryKeyIndex());
        String csvDiff = "";
        if ((Integer.parseInt(csvPkey) > 0 || Integer.parseInt(afmPkey) > 0)
                && !csvPkey.equals(afmPkey)) {
            csvDiff = String.format(CompareFieldUtilities.OLD_AND_NEW_VAL_MESS, afmPkey, csvPkey);
        }
        
        if (csvDiff.length() > 0 || this.isCompare) {
            String sqlDiff = "";
            if (this.isSqlFieldExists() && this.getSqlFieldDef().isPrimaryKey()
                    && this.getCompField().hasPrimaryKeysChanged()) {
                sqlDiff = "Primary Key changed";
            }
            CompareFieldUtilities.buildAndSaveRecord(DifferenceMessage.PRIMARY_KEY, csvDiff,
                sqlDiff, Actions.APPLY_CHANGE, this.getCsvFldMap());
        }
    }
    
    /**
     * compare reference table.
     */
    private void compareValidTable() {
        
        final String afmRefTable =
                NULL.equals(String.valueOf(this.getFieldDef().getReferenceTable())) ? "" : String
                    .valueOf(this.getFieldDef().getReferenceTable());
        
        final String csvRefTable = this.getCsvFldMap().get("ref_table").toString();
        String csvDiff = "";
        if (!csvRefTable.equals(afmRefTable)) {
            csvDiff = CompareFieldUtilities.buildMessage(afmRefTable, csvRefTable);
        }
        if (csvDiff.length() > 0 || this.isCompare) {
            String sqlDiff = "";
            if (this.isSqlFieldExists()
                    && this.getFieldDef().isValidateData()
                    && !afmRefTable.equalsIgnoreCase(NULL.equals(String.valueOf(this
                        .getSqlFieldDef().getRefTable())) ? "" : String.valueOf(this
                        .getSqlFieldDef().getRefTable()))) {
                sqlDiff = CompareFieldUtilities.buildMessage(afmRefTable, 
                    String.valueOf(this.getSqlFieldDef().getRefTable()));
            }
            CompareFieldUtilities.buildAndSaveRecord(DifferenceMessage.REF_TABLE, csvDiff, sqlDiff,
                Actions.APPLY_CHANGE, this.getCsvFldMap());
        }
    }
}
