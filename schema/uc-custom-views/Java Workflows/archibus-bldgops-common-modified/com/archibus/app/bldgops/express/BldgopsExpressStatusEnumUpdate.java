package com.archibus.app.bldgops.express;

import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.utility.StringUtil;

/**
 * Update the enum list of field status.
 * 
 * <p>
 * History:
 * <li>21.2: Add for 21.2 Bldgops Express.
 * 
 * @author Zhang Yi
 * 
 * 
 */
public class BldgopsExpressStatusEnumUpdate {
    
    /**
     * Dot sign '.'.
     * 
     */
    private static final String DOT = ".";
    
    /**
     * Semicolon sign ';'.
     * 
     */
    private static final String SEMICOLON = ";";
    
    /**
     * Indicates the 'status' value "AA" .
     * 
     */
    private static final String STATUS_AA = "AA;";
    
    /**
     * Indicates the table 'afm_flds' .
     * 
     */
    private static final String AFM_FLDS = "afm_flds";
    
    /**
     * Indicates the table 'afm_flds_lang' .
     * 
     */
    private static final String AFM_FLDS_LANG = "afm_flds_lang";
    
    /**
     * Indicates the table name 'afm_activity_params' .
     * 
     */
    private static final String AFM_ACTIVITY_PARAMS = "afm_activity_params";
    
    /**
     * Indicates the field name 'activity_id' .
     * 
     */
    private static final String ACTIVITY_ID = "activity_id";
    
    /**
     * Indicates the field name 'param_id' .
     * 
     */
    private static final String PARAM_ID = "param_id";
    
    /**
     * Indicates the table-field 'afm_flds.enum_list' .
     * 
     */
    private static final String AFM_FLDS_ENUM_LIST = "afm_flds.enum_list";
    
    /**
     * Indicates the constant string 'none' .
     * 
     */
    private static final String NONE = "none";
    
    /**
     * Indicates the table-field 'afm_activity_params.param_value' .
     * 
     */
    private static final String AFM_ACTIVITY_PARAMS_PARAM_VALUE = "afm_activity_params.param_value";
    
    /**
     * DataSource of table afm_flds.
     */
    private final DataSource fldsDS;
    
    /**
     * DataSource of table afm_flds_lang.
     */
    private final DataSource langDS;
    
    /**
     * DataSource of table afm_activity_parameters.
     */
    private final DataSource activityParamDS;
    
    /**
     * Current index of display value of status 'A' in enum list.
     */
    private int indexOfA;
    
    /**
     * Current index of display value of status 'AA' in enum list.
     */
    private int indexOfAA;
    
    /**
     * This variable is used to store the translation texts of 'AA' display value in different
     * language, those texts are composed of field name and text values that are separated by ";".
     * 
     */
    private String translationTextOfAA = "";
    
    /**
     * array of language field names.
     */
    private final String[] langArray = new String[] { "enum_list_ch", "enum_list_nl",
            "enum_list_it", "enum_list_fr", "enum_list_es", "enum_list_de" };
    
    /**
     * array of tables that need to change their status field enum list.
     */
    private final String[] tables = new String[] { "wr", "hwr", "wr_sync", "afm_wf_steps",
            "helpdesk_sla_steps", "wrhwr", "wrview", "hwr_month" };
    
    /**
     * 
     * Initially add fields to DataSource langDS.
     * 
     */
    public BldgopsExpressStatusEnumUpdate() {
        
        this.langDS = DataSourceFactory.createDataSourceForFields(AFM_FLDS_LANG, this.langArray);
        
        this.fldsDS =
                DataSourceFactory.createDataSourceForFields(AFM_FLDS, new String[] { "table_name",
                        "field_name", "enum_list" });
        
        this.activityParamDS =
                DataSourceFactory.createDataSourceForFields(AFM_ACTIVITY_PARAMS, new String[] {
                        ACTIVITY_ID, PARAM_ID, "param_value" });
    }
    
    /**
     * 
     * If application parameter 'WorkRequestsOnly' is 1, convert display value of status 'AA' to
     * 'A'.
     * 
     * @param workRequestsOnly int '1' or '0' to indicate if user choose 'work request only' on
     *            client side.
     */
    public void updateEnumListOfStatusField(final int workRequestsOnly) {
        
        if (workRequestsOnly == 1) {
            
            this.updateAssignedStatus();
            
        } else {
            
            this.restoreAssignedStatus();
            
        }
    }
    
    /**
     * 
     * For enum field 'status' such as wr.status and wrhwr.status, replace original display value
     * "Assigned to Work Order" with "Approved" for status 'AA'.
     * 
     */
    private void updateAssignedStatus() {
        
        for (final String table : this.tables) {
            
            final String restriction = "  table_name='" + table + "'  and field_name='status' ";
            
            final DataRecord fldsRecord = this.fldsDS.getRecord(restriction);
            this.updateStatusField(fldsRecord);
            
            final DataRecord langRecord = this.langDS.getRecord(restriction);
            for (final String langName : this.langArray) {
                
                if (StringUtil.notNullOrEmpty(langRecord.getString(AFM_FLDS_LANG + DOT + langName))) {
                    // Only update language record when there e language values
                    this.updateStatusLangField(langRecord);
                    break;
                }
            }
        }
        
        ContextStore.get().getProject().clearCachedTableDefs();
        
        this.saveActivityParameter(this.translationTextOfAA);
    }
    
    /**
     * Save string value to activity parameter
     * "AbBldgOpsOnDemandWork-TranslationsForWorkRequestStatusAA".
     * 
     * @param parameterValue String parameter value
     */
    private void saveActivityParameter(final String parameterValue) {
        
        final DataRecord paraRecord =
                this.activityParamDS
                    .getRecord("activity_id='AbBldgOpsOnDemandWork' and param_id='TranslationsForWorkRequestStatus' ");
        
        if (paraRecord != null) {
            paraRecord.setValue(AFM_ACTIVITY_PARAMS_PARAM_VALUE, parameterValue);
            this.activityParamDS.updateRecord(paraRecord);
        }
    }
    
    /**
     * 
     * For enum field status, replace its display value "Assigned to Work Order" with "Approved".
     * 
     * @param fldsRecord DataRecord afm_flds record.
     */
    private void updateStatusField(final DataRecord fldsRecord) {
        
        // change schema field of "status"
        if (fldsRecord != null) {
            
            final String textOfStatusAA =
                    this.updateStatusTextOfEnumList(fldsRecord, AFM_FLDS_ENUM_LIST);
            
            if (this.translationTextOfAA.length() == 0) {
                
                this.translationTextOfAA = "afm_flds.enum_list;" + textOfStatusAA;
            }
            
            this.fldsDS.updateRecord(fldsRecord);
            
        }
    }
    
    /**
     * 
     * For lang field of enum field 'status', replace its translated display value
     * "Assigned to Work Order" with "Approved" for different languages.
     * 
     * @param langRecord DataRecord afm_flds_lang record.
     */
    private void updateStatusLangField(final DataRecord langRecord) {
        
        String textOfStatusAA = "";
        
        // change language field of "status"
        if (langRecord != null) {
            
            for (final String langField : this.langArray) {
                
                final String fieldName = AFM_FLDS_LANG + DOT + langField;
                
                final String langTextOfStatusAA =
                        this.updateStatusTextOfEnumList(langRecord, fieldName);
                
                if (this.translationTextOfAA.split(SEMICOLON).length == 2) {
                    textOfStatusAA =
                            textOfStatusAA + AFM_FLDS_LANG + DOT + langField + SEMICOLON
                                    + langTextOfStatusAA + SEMICOLON;
                }
            }
            
            this.langDS.updateRecord(langRecord);
            
            this.translationTextOfAA = this.translationTextOfAA + SEMICOLON + textOfStatusAA;
        }
    }
    
    /**
     * 
     * For given status field Record or status field's language record, replace display value at
     * destIndex position with display value at srcIndex position of enum-list.
     * 
     * @param record DataRecord to update its enum list.
     * @param fieldName String name of enum list field.
     * 
     * @return display value that is replaced
     */
    private String updateStatusTextOfEnumList(final DataRecord record, final String fieldName) {
        
        String textOfAA = "";
        
        final String translatedEnumText = record.getString(fieldName);
        if (StringUtil.notNullOrEmpty(translatedEnumText)) {
            
            final String[] enumList = translatedEnumText.split(SEMICOLON);
            // Identify and store the position index of "A" and "AA" in status enum value list.
            for (int i = 0; i < enumList.length; i++) {
                if ("A".equals(enumList[i])) {
                    
                    this.indexOfA = i + 1;
                    
                } else if ("AA".equals(enumList[i])) {
                    
                    this.indexOfAA = i + 1;
                }
                
            }
            
            textOfAA = enumList[this.indexOfAA];
            final String newStatusDisplayText = STATUS_AA + enumList[this.indexOfA];
            final String oldStautsDisplayText = STATUS_AA + enumList[this.indexOfAA];
            
            final String newTranslatedEnumText =
                    translatedEnumText.replaceAll(oldStautsDisplayText, newStatusDisplayText);
            
            record.setValue(fieldName, newTranslatedEnumText);
        }
        
        return textOfAA;
        
    }
    
    /**
     * 
     * For enum field 'status' such as wr.status and wrhwr.status, restore original display value
     * "Assigned to Work Order" for status 'AA'.
     * 
     */
    private void restoreAssignedStatus() {
        
        final DataRecord paraRecord =
                this.activityParamDS
                    .getRecord(" activity_id='AbBldgOpsOnDemandWork' and param_id='TranslationsForWorkRequestStatus' ");
        final String translationsForWorkRequestStatusAA =
                paraRecord.getString(AFM_ACTIVITY_PARAMS_PARAM_VALUE);
        
        if (StringUtil.notNullOrEmpty(translationsForWorkRequestStatusAA)
                && !NONE.equalsIgnoreCase(translationsForWorkRequestStatusAA)) {
            
            final String[] textArray = translationsForWorkRequestStatusAA.split(SEMICOLON);
            
            for (final String table : this.tables) {
                
                final String restriction = " table_name='" + table + "' and field_name='status' ";
                
                final DataRecord fldsRecord = this.fldsDS.getRecord(restriction);
                this.restoreStatusField(fldsRecord, textArray);
                
                final DataRecord langRecord = this.langDS.getRecord(restriction);
                this.restoreStatusLangField(langRecord, textArray);
            }
            
            // after restore the display value of status 'AA', also reset the value of
            // 'TranslationsForWorkRequestStatus' to 'none'.
            paraRecord.setValue(AFM_ACTIVITY_PARAMS_PARAM_VALUE, NONE);
            this.activityParamDS.saveRecord(paraRecord);
            
            ContextStore.get().getProject().clearCachedTableDefs();
        }
        
    }
    
    /**
     * 
     * For enum field 'status', restore its display value "Assigned to Work Order".
     * 
     * @param fldsRecord DataRecord afm_flds record.
     * @param textArray String[] text and translations for Status 'AA'.
     */
    private void restoreStatusField(final DataRecord fldsRecord, final String[] textArray) {
        
        // change schema field of "status"
        if (fldsRecord != null) {
            
            this.restoreStatusTextOfEnumList(fldsRecord, AFM_FLDS_ENUM_LIST, textArray[1]);
            
            this.fldsDS.updateRecord(fldsRecord);
            
        }
    }
    
    /**
     * 
     * For lang field of enum field 'status', restore its original translated display value
     * "Assigned to Work Order" for different languages.
     * 
     * @param langRecord DataRecord afm_flds_lang record.
     * @param textArray String[] text and translations for Status 'AA'.
     */
    private void restoreStatusLangField(final DataRecord langRecord, final String[] textArray) {
        
        // change language field of "status"
        if (langRecord != null) {
            
            int count = 0;
            boolean isToUpdate = true;
            
            for (final String langField : this.langArray) {
                
                final String fieldName = AFM_FLDS_LANG + DOT + langField;
                
                count++;
                if (textArray.length <= (count * 2 + 1)) {
                    isToUpdate = false;
                    break;
                }
                this.restoreStatusTextOfEnumList(langRecord, fieldName, textArray[count * 2 + 1]);
            }
            
            // kb#3044151: for non multi-lingual DB, don't update the language record for field
            // 'status'.
            if (isToUpdate) {
                this.langDS.updateRecord(langRecord);
            }
        }
    }
    
    /**
     * 
     * For given status field Record or status field's language record, restore display value for
     * status 'AA'|.
     * 
     * @param record DataRecord to update its enum list.
     * @param fieldName String name of enum list field.
     * @param displayValue String original display value to restore.
     * 
     */
    private void restoreStatusTextOfEnumList(final DataRecord record, final String fieldName,
            final String displayValue) {
        
        final String translatedEnumText = record.getString(fieldName);
        if (StringUtil.notNullOrEmpty(translatedEnumText)
                && StringUtil.notNullOrEmpty(displayValue)) {
            
            final String[] enumList = translatedEnumText.split(SEMICOLON);
            
            int defaultIndexOfAA = 0;
            for (int i = 0; i < enumList.length; i++) {
                if (STATUS_AA.equalsIgnoreCase(enumList[i].trim() + SEMICOLON)) {
                    defaultIndexOfAA = i + 1;
                }
            }
            
            final String oldStautsDisplayText = STATUS_AA + enumList[defaultIndexOfAA];
            final String newStatusDisplayText = STATUS_AA + displayValue;
            
            final String newTranslatedEnumText =
                    translatedEnumText.replaceAll(oldStautsDisplayText, newStatusDisplayText);
            
            record.setValue(fieldName, newTranslatedEnumText);
        }
    }
}
