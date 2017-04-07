package com.archibus.app.asset.mobile.service.impl;

import static com.archibus.app.common.mobile.util.FieldNameConstants.*;
import static com.archibus.app.common.mobile.util.ServiceConstants.*;
import static com.archibus.app.common.mobile.util.TableNameConstants.*;

import java.util.*;
import java.util.Map.Entry;

import com.archibus.app.common.mobile.util.DocumentsUtilities;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.ext.importexport.common.TransferStatusHelper;
import com.archibus.model.view.datasource.ClauseDef.Operation;
import com.archibus.model.view.datasource.*;
import com.archibus.utility.*;

/**
 * Utilities for AssetMobileService.
 * <p>
 * Provides methods for exportEquipmentToSurvey and importSurveyToEquipment in AssetMobileService
 * class.
 * 
 * @author Ying Qin
 * @since 21.1
 * 
 */
final class ImportExportUtilities {
    /**
     * Separator for fields to survey: ";".
     */
    private static final String FIELDS_TO_SURVEY_SEPARATOR = ";";
    
    /**
     * Hide default constructor for this utility class - should never be instantiated.
     */
    private ImportExportUtilities() {
    }
    
    /**
     * Retrieves the equipment records for specified restrictions.
     * 
     * @param datasource equipment data source
     * @param map the hash map of equipment fields and values.
     * @param surveyId survey code for equipment
     * @param equipmentId equipment code
     * @param equipmentStandard equipment standard
     * 
     * @return a list of equipments as DataRecord objects
     */
    static List<DataRecord> retrieveEquipmentRecords(final DataSource datasource,
            final Map<String, Object> map, final String surveyId, final String equipmentId,
            final String equipmentStandard) {
        
        datasource.setContext();
        datasource.setMaxRecords(0);
        
        final Iterator<Map.Entry<String, Object>> eqMapIterator = map.entrySet().iterator();
        while (eqMapIterator.hasNext()) {
            final Map.Entry<String, Object> pairs = eqMapIterator.next();
            final String key = StringUtil.notNull(pairs.getKey());
            final Object value = StringUtil.notNull(pairs.getValue());
            // skip the "marked_for_deletion" field since it does not exist in eq table
            if (StringUtil.notNullOrEmpty(value)
                    && key.compareToIgnoreCase(MARKED_FOR_DELETION) != 0) {
                datasource.addRestriction(Restrictions.eq(EQ_TABLE, key, value));
            }
        }
        
        if (StringUtil.notNullOrEmpty(surveyId)) {
            datasource.addRestriction(Restrictions.eq(EQ_TABLE, SURVEY_ID, surveyId));
        }
        
        if (StringUtil.notNullOrEmpty(equipmentId)) {
            datasource.addRestriction(Restrictions.eq(EQ_TABLE, EQ_ID, equipmentId));
        }
        
        if (StringUtil.notNullOrEmpty(equipmentStandard)) {
            datasource.addRestriction(Restrictions.eq(EQ_TABLE, EQ_STD, equipmentStandard));
        }
        
        // add the not null field restriction
        datasource.addRestriction(Restrictions.sql(EQ_TABLE + SQL_DOT + EQ_ID + SQL_IS_NOT_NULL));
        
        return datasource.getRecords();
        
    }
    
    /**
     * Composes equipment hash map of fields and values from an eq_audit record.
     * 
     * @param surveyId survey id
     * @param equipmentRecord the eq_audit record to get the value from.
     * 
     * @return a hash map of equipment's fields and values
     */
    static Map<String, Object> retrieveEquipmentMap(final String surveyId,
            final DataRecord equipmentRecord) {
        final Map<String, Object> map = new HashMap<String, Object>();
        
        final List<String> eqFieldsToSurvey = retrieveEquipmentFieldsToSurvey(surveyId);
        for (final String eqFieldToSurvey : eqFieldsToSurvey) {
            map.put(eqFieldToSurvey,
                equipmentRecord.getValue(EQ_AUDIT_TABLE + SQL_DOT + eqFieldToSurvey));
        }
        
        return map;
    }
    
    /**
     * Composes equipment hash map of fields and values from bl, fl, dv, dp code.
     * 
     * @param buildingId building code
     * @param floorId floor code
     * @param divisionId division code
     * @param departmentId department code
     * 
     * @return a hash map of equipment's fields and values
     */
    static Map<String, Object> composeEquipmentMap(final String buildingId, final String floorId,
            final String divisionId, final String departmentId) {
        final Map<String, Object> eqMap = new HashMap<String, Object>();
        
        eqMap.put(BL_ID, buildingId);
        eqMap.put(FL_ID, floorId);
        eqMap.put(DV_ID, divisionId);
        eqMap.put(DP_ID, departmentId);
        
        return eqMap;
    }
    
    /**
     * Retrieves Equipment Record for the specified eq_id.
     * 
     * @param dsEquipment equipment data source
     * @param equipmentId equipment code
     * 
     * @return an equipment data record
     */
    static DataRecord retrieveEquipmentRecord(final DataSource dsEquipment, final String equipmentId) {
        
        DataRecord equipmentRecord = null;
        
        if (StringUtil.notNullOrEmpty(equipmentId)) {
            dsEquipment.addRestriction(Restrictions.eq(EQ_TABLE, EQ_ID, equipmentId));
            equipmentRecord = dsEquipment.getRecord();
        }
        
        return equipmentRecord;
    }
    
    /**
     * Updates value for the list of equipment fields to survey in equipment audit tale.
     * 
     * @param surveyId survey id
     * @param equipmentAuditRecord the record of eq_audit to insert or update
     * @param equipmentId the equipment code
     * @param eqRecord the record of eq to import from
     */
    static void updateValuesForEqFieldsToSurvey(final String surveyId,
            final DataRecord equipmentAuditRecord, final String equipmentId,
            final DataRecord eqRecord) {
        
        // update only records that where not surveyed on mobile yet
        if (equipmentAuditRecord.getInt(EQ_AUDIT_TABLE + SQL_DOT + MOB_IS_CHANGED) != 0) {
            return;
        }
        
        final List<String> eqFieldsToSurvey = retrieveEquipmentFieldsToSurvey(surveyId);
        for (final String eqFieldToSurvey : eqFieldsToSurvey) {
            // skip "marked_for_deletion" field since it does not exist in eq table
            // skip "survey_id" field since we alread set it
            if (StringUtil.notNullOrEmpty(eqFieldToSurvey)
                    && eqFieldToSurvey.compareToIgnoreCase(SURVEY_ID) != 0
                    && eqFieldToSurvey.compareToIgnoreCase(MARKED_FOR_DELETION) != 0) {
                equipmentAuditRecord.setValue(EQ_AUDIT_TABLE + SQL_DOT + eqFieldToSurvey,
                    eqRecord.getValue(EQ_TABLE + SQL_DOT + eqFieldToSurvey));
            }
        }
    }
    
    /**
     * Retrieves the eq_audit records for specified survey_id.
     * 
     * @param datasource equipment audit data source
     * @param surveyId survey code
     * 
     * @return a list of equipments as DataRecord objects
     */
    static List<DataRecord> retrieveSurveyEquipmentAuditRecords(final DataSource datasource,
            final String surveyId) {
        
        datasource.setContext();
        datasource.setMaxRecords(0);
        
        if (StringUtil.notNullOrEmpty(surveyId)) {
            datasource.addRestriction(Restrictions.eq(EQ_AUDIT_TABLE, SURVEY_ID, surveyId));
        }
        
        return datasource.getRecords();
    }
    
    /**
     * 
     * Looks up in survey.survey_fields the equipment fields to survey for the given survey. If
     * survey_fields is empty, returns the list from the activity parameter for the equipment fields
     * to survey
     * 
     * @param surveyId The survey id
     * @return a list of equipment fields to survey.
     */
    protected static List<String> retrieveEquipmentFieldsToSurvey(final String surveyId) {
        List<String> fieldsToSurvey = new ArrayList<String>();
        
        if (StringUtil.notNullOrEmpty(surveyId)) {
            final String surveyFields = retrieveFieldsToSurveyFromSurvey(surveyId);
            if (StringUtil.notNullOrEmpty(surveyFields)) {
                fieldsToSurvey = Utility.stringToList(surveyFields, FIELDS_TO_SURVEY_SEPARATOR);
            }
        }
        
        if (fieldsToSurvey.isEmpty()) {
            fieldsToSurvey = retrieveFieldsToSurveyFromActivityParameter();
        }
        
        return fieldsToSurvey;
    }
    
    /**
     * Looks up in survey.survey_fields the equipment fields to survey for the given survey.
     * 
     * @param surveyId The survey id
     * @return the survey.survey_fields field content, or null if the survey record does not exist
     */
    private static String retrieveFieldsToSurveyFromSurvey(final String surveyId) {
        String surveyFields = null;
        
        final DataSource dsSurvey =
                DataSourceFactory.createDataSourceForFields(SURVEY_TABLE, new String[] { SURVEY_ID,
                        SURVEY_FIELDS });
        dsSurvey.addRestriction(Restrictions.eq(SURVEY_TABLE, SURVEY_ID, surveyId));
        
        final DataRecord surveyRecord = dsSurvey.getRecord();
        if (surveyRecord != null) {
            surveyFields = surveyRecord.getString(SURVEY_TABLE + SQL_DOT + SURVEY_FIELDS);
        }
        
        return surveyFields;
    }
    
    /**
     * Looks up the activity parameter for the equipment fields to survey.
     * 
     * @return a list of equipment fields to survey.
     */
    protected static List<String> retrieveFieldsToSurveyFromActivityParameter() {
        final DataSource dsActivityParams =
                DataSourceFactory.createDataSourceForFields("afm_activity_params", new String[] {
                        "activity_id", "param_id", "param_value" });
        
        final ParsedRestrictionDef restriction = new ParsedRestrictionDef();
        restriction.addClause("afm_activity_params", "activity_id", "AbAssetManagement",
            Operation.EQUALS);
        restriction.addClause("afm_activity_params", "param_id", "EquipmentFieldsToSurvey",
            Operation.EQUALS);
        final DataRecord activityParamsRecord = dsActivityParams.getRecords(restriction).get(0);
        
        return Utility.stringToList(
            activityParamsRecord.getString("afm_activity_params.param_value"),
            FIELDS_TO_SURVEY_SEPARATOR);
    }
    
    /**
     * Adds Or updates equipment(s) from the survey table.
     * 
     * 1. Creates new Equipment (eq) table records for all new Equipment Survey Audit records
     * (eq_audit).
     * <p>
     * 2. Updates the existing Equipment records for changed Equipment Survey Audit records.
     * <p>
     * 3. If the Marked for Deletion? field is active (per the task above), then this action deletes
     * all items that are Marked for Deletion (eq_audit.marked_for_deletion) from the Equipment
     * table. If the field is not active, this action does not delete any records.
     * <p>
     * 4. When the action copies the Equipment Status field, the status will still reflect the
     * Equipment item's disposition (e.g. In Service, Out of Service, In Repair, Salvaged, Sold).
     * 
     * @param surveyId survey code
     * @param equipmentAuditDatasource data source of eq_audit table
     * @param equipmentAuditRecord an eq_audit record
     * 
     * @return true if adding or updating successful, false if failed.
     */
    static boolean addOrUpdateEquipment(final String surveyId,
            final DataSource equipmentAuditDatasource, final DataRecord equipmentAuditRecord) {
        
        final DataSource equipmentDatasource =
                DataSourceFactory.createDataSourceForFields(EQ_TABLE,
                    DataSourceUtilities.getEquipmentFields(surveyId));
        
        final Map<String, Object> equipmentMap =
                ImportExportUtilities.retrieveEquipmentMap(surveyId, equipmentAuditRecord);
        final String equipmentId = StringUtil.notNull(equipmentMap.get(EQ_ID));
        
        // search by primary key to see if there is any existing record
        DataRecord equipmentRecord =
                ImportExportUtilities.retrieveEquipmentRecord(equipmentDatasource, equipmentId);
        
        final int markedForDeletion =
                equipmentAuditRecord.getInt(EQ_AUDIT_TABLE + SQL_DOT + MARKED_FOR_DELETION);
        
        boolean needsUpdate = false;
        
        // do the add or update can not process because of errors?
        boolean succeeds = true;
        boolean isNew = false;
        
        if (equipmentRecord == null) {
            // create new record in eq only if we do not want to delete it from eq table
            if (markedForDeletion == 0) {
                needsUpdate = true;
                try {
                    equipmentRecord = equipmentDatasource.createNewRecord();
                    
                    isNew = true;
                } catch (final ExceptionBase e) {
                    equipmentAuditRecord.setValue(EQ_AUDIT_TABLE + SQL_DOT + TRANSFER_STATUS,
                        TransferStatusHelper.TRANS_STATUS.ERROR.toString());
                    equipmentAuditDatasource.saveRecord(equipmentAuditRecord);
                    succeeds = false;
                }
            }
        } else {
            final List<DataRecord> equipmentRecords =
                    ImportExportUtilities.retrieveEquipmentRecords(equipmentDatasource,
                        equipmentMap, surveyId, equipmentId, "");
            if (equipmentRecords.isEmpty()) {
                // update record in eq
                needsUpdate = true;
            }
            
            // marked for deletion field is "yes"
            if (markedForDeletion == 1) {
                // no need to update
                needsUpdate = false;
                try {
                    equipmentDatasource.deleteRecord(equipmentRecord);
                    equipmentAuditRecord.setValue(EQ_AUDIT_TABLE + SQL_DOT + TRANSFER_STATUS,
                        TransferStatusHelper.TRANS_STATUS.MISSING.toString());
                    equipmentAuditDatasource.saveRecord(equipmentAuditRecord);
                    
                } catch (final ExceptionBase e) {
                    equipmentAuditRecord.setValue(EQ_AUDIT_TABLE + SQL_DOT + TRANSFER_STATUS,
                        TransferStatusHelper.TRANS_STATUS.ERROR.toString());
                    equipmentAuditDatasource.saveRecord(equipmentAuditRecord);
                    succeeds = false;
                }
            }
        }
        
        if (needsUpdate) {
            try {
                updateEquipmentRecordValues(surveyId, equipmentRecord, equipmentMap);
                
                if (isNew) {
                    equipmentAuditRecord.setValue(EQ_AUDIT_TABLE + SQL_DOT + TRANSFER_STATUS,
                        TransferStatusHelper.TRANS_STATUS.INSERTED.toString());
                } else {
                    equipmentAuditRecord.setValue(EQ_AUDIT_TABLE + SQL_DOT + TRANSFER_STATUS,
                        TransferStatusHelper.TRANS_STATUS.UPDATED.toString());
                }
                
                // update the equipment record
                equipmentDatasource.saveRecord(equipmentRecord);
            } catch (final ExceptionBase e) {
                // if there is error updating, change the transfer status field to error in
                // equipment audit's corresponding record.
                equipmentAuditRecord.setValue(EQ_AUDIT_TABLE + SQL_DOT + TRANSFER_STATUS,
                    TransferStatusHelper.TRANS_STATUS.ERROR.toString());
                equipmentAuditDatasource.saveRecord(equipmentAuditRecord);
                succeeds = false;
            }
        } else {
            equipmentAuditRecord.setValue(EQ_AUDIT_TABLE + SQL_DOT + TRANSFER_STATUS,
                TransferStatusHelper.TRANS_STATUS.NO_CHANGE.toString());
        }
        
        if (succeeds) {
            DocumentsUtilities.copyDocuments(DOCUMENT_FIELD_NAMES_EQ, equipmentAuditRecord,
                equipmentRecord);
        }
        
        return succeeds;
    }
    
    /**
     * update equipment record values to the related values from equipment map.
     * 
     * @param surveyId the survey code
     * @param equipmentRecord the record to be update.
     * @param equipmentMap the map to retrieve the values from.
     */
    private static void updateEquipmentRecordValues(final String surveyId,
            final DataRecord equipmentRecord, final Map<String, Object> equipmentMap) {
        
        final Iterator<Entry<String, Object>> iterator = equipmentMap.entrySet().iterator();
        while (iterator.hasNext()) {
            final Map.Entry<String, Object> pairs = iterator.next();
            final String key = pairs.getKey();
            // skip the "marked_for_deletion" field since it does not exist in eq table
            if (key.compareToIgnoreCase(MARKED_FOR_DELETION) != 0) {
                equipmentRecord.setValue(EQ_TABLE + SQL_DOT + key, pairs.getValue());
            }
            
            // avoids a ConcurrentModificationException
            iterator.remove();
        }
        equipmentRecord.setValue(EQ_TABLE + SQL_DOT + SURVEY_ID, StringUtil.notNull(surveyId));
    }
    
    /**
     * Update the existing eq_audit record with the specified user name.
     * 
     * @param userName the user name to perform the survey
     * @param equipmentAuditDatasource eq_audit table datasource
     * @param equipmentAuditRecords records from eq_audit table
     */
    static void updateEquipmentAuditTable(final String userName,
            final DataSource equipmentAuditDatasource, final List<DataRecord> equipmentAuditRecords) {
        for (final DataRecord equipmentAuditRecord : equipmentAuditRecords) {
            final String oldUserName =
                    StringUtil.notNull(equipmentAuditRecord.getString(EQ_AUDIT_TABLE + SQL_DOT
                            + MOB_LOCKED_BY));
            if (userName.compareToIgnoreCase(oldUserName) == 0) {
                equipmentAuditRecord.setValue(EQ_AUDIT_TABLE + SQL_DOT + TRANSFER_STATUS,
                    TransferStatusHelper.TRANS_STATUS.NO_CHANGE.toString());
            } else {
                // set the survey.em_id field
                equipmentAuditRecord.setValue(EQ_AUDIT_TABLE + SQL_DOT + MOB_LOCKED_BY, userName);
                // set the survey.transfer_status field
                equipmentAuditRecord.setValue(EQ_AUDIT_TABLE + SQL_DOT + TRANSFER_STATUS,
                    TransferStatusHelper.TRANS_STATUS.UPDATED.toString());
            }
            try {
                equipmentAuditDatasource.saveRecord(equipmentAuditRecord);
            } catch (final ExceptionBase e) {
                // TODO comment needed - why do you ignore exception?
                // go to next record
                // TODO why do you need continue?
                continue;
            }
        }
    }
    
}
