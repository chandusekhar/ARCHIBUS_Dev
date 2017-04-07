package com.archibus.app.asset.mobile.service.impl;

import static com.archibus.app.common.mobile.util.FieldNameConstants.*;
import static com.archibus.app.common.mobile.util.ServiceConstants.*;
import static com.archibus.app.common.mobile.util.TableNameConstants.*;

import java.sql.Date;
import java.util.*;

import com.archibus.app.asset.mobile.service.IAssetMobileService;
import com.archibus.app.common.mobile.util.DocumentsUtilities;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.ext.importexport.common.TransferStatusHelper;
import com.archibus.model.view.datasource.ClauseDef.Operation;
import com.archibus.model.view.datasource.*;
import com.archibus.utility.*;

/**
 * Implementation of the Asset Management Workflow Rule Service for mobile asset survey application.
 * <p>
 * Registered in the ARCHIBUS Workflow Rules table as 'AbAssetManagement-AssetMobileService'.
 * <p>
 * Provides methods for synchronization between sync tables (survey, eq_audit) and inventory tables
 * (eq).
 * <p>
 * Invoked by web client or mobile client.
 * 
 * @author Ying Qin
 * @since 21.1
 * 
 */
public class AssetMobileService implements IAssetMobileService {
    
    /**
     * Constant: error message when the user name does not exists in afm_users table with matching
     * email.
     */
    static final String NO_USER_ACCOUNT_MESSAGE =
            "No ARCHIBUS User account exists for Performed By user [{0}] with the matching email.";
    
    /** {@inheritDoc} */
    // TODO Will performedBy be always the current user?
    public String createSurvey(final String surveyId, final Date surveyDate,
            final String performedBy, final String description) {
        final String userName = DataSourceUtilities.retrieveUserName(performedBy);
        
        if (StringUtil.notNullOrEmpty(userName)) {
            addOrUpdateSurveyRecord(surveyId, surveyDate, performedBy, description, null, true);
        } else {
            final ExceptionBase exception = new ExceptionBase();
            exception.setPattern(NO_USER_ACCOUNT_MESSAGE);
            exception.setTranslatable(true);
            exception.setArgs(new Object[] { performedBy });
            throw exception;
        }
        
        return userName;
    }
    
    /**
     * Add or Update the survey record.
     * 
     * @param surveyId survey code
     * @param surveyDate date of the survey
     * @param performedBy employee that the survey will be performed by
     * @param description description of the new or updated survey
     * @param status the survey status
     * @param newRecord true if adding, false if updating.
     */
    private void addOrUpdateSurveyRecord(final String surveyId, final Date surveyDate,
            final String performedBy, final String description, final String status,
            final boolean newRecord) {
        final DataSource datasource =
                DataSourceFactory.createDataSourceForFields(SURVEY_TABLE, new String[] { SURVEY_ID,
                        SURVEY_DATE, EM_ID, DESCRIPTION, STATUS });
        
        DataRecord record = null;
        if (newRecord) {
            record = datasource.createNewRecord();
        } else {
            final ParsedRestrictionDef restriction = new ParsedRestrictionDef();
            restriction.addClause(SURVEY_TABLE, SURVEY_ID, surveyId, Operation.EQUALS);
            final List<DataRecord> records = datasource.getRecords(restriction);
            if (records.isEmpty()) {
                record = datasource.createNewRecord();
            } else {
                record = records.get(0);
            }
        }
        
        if (record != null) {
            record.setValue(SURVEY_TABLE + SQL_DOT + SURVEY_ID, surveyId);
            record.setValue(SURVEY_TABLE + SQL_DOT + SURVEY_DATE, surveyDate);
            record.setValue(SURVEY_TABLE + SQL_DOT + EM_ID, performedBy);
            record.setValue(SURVEY_TABLE + SQL_DOT + DESCRIPTION, description);
            if (StringUtil.notNullOrEmpty(status)) {
                record.setValue(SURVEY_TABLE + SQL_DOT + STATUS, status);
            }
            
            datasource.saveRecord(record);
        }
        // TODO else ?
    }
    
    /** {@inheritDoc} */
    public long importEquipmentToSurvey(final String surveyId, final String buildingId,
            final String floorId, final String divisionId, final String departmentId,
            final String userName, final String equipmentStandard) {
        final DataSource equipmentDatasource =
                DataSourceFactory.createDataSourceForFields(EQ_TABLE,
                    DataSourceUtilities.getEquipmentFields(surveyId));
        
        final Map<String, Object> equipmentMap =
                ImportExportUtilities.composeEquipmentMap(buildingId, floorId, divisionId,
                    departmentId);
        
        long numberOfRecords = 0;
        
        final List<DataRecord> equipmentRecords =
                ImportExportUtilities.retrieveEquipmentRecords(equipmentDatasource, equipmentMap,
                    "", "", equipmentStandard);
        if (!equipmentRecords.isEmpty()) {
            final DataSource equipmentAuditDatasource =
                    DataSourceFactory.createDataSourceForFields(EQ_AUDIT_TABLE,
                        DataSourceUtilities.getEquipmentAuditFields(surveyId));
            
            for (final DataRecord equipmentRecord : equipmentRecords) {
                final String equipmentId = equipmentRecord.getString(EQ_TABLE + SQL_DOT + EQ_ID);
                
                // restrict on primary keys
                final ParsedRestrictionDef restriction =
                        RestrictionUtilities.composeEquipmentAuditPrimaryKeysRestriction(surveyId,
                            equipmentId);
                final List<DataRecord> equipmentAuditRecords =
                        equipmentAuditDatasource.getRecords(restriction);
                DataRecord equipmentAuditRecord;
                if (equipmentAuditRecords.isEmpty()) {
                    equipmentAuditRecord = equipmentAuditDatasource.createNewRecord();
                } else {
                    equipmentAuditRecord = equipmentAuditRecords.get(0);
                }
                
                // set the required fields
                equipmentAuditRecord.setValue(EQ_AUDIT_TABLE + SQL_DOT + SURVEY_ID, surveyId);
                
                // copy the afm_user.user_name value (e.g. TRAM) to the mob_locked_by field of the
                // eq_audit record assigned to this employee.
                equipmentAuditRecord.setValue(EQ_AUDIT_TABLE + SQL_DOT + MOB_LOCKED_BY, userName);
                
                // the record has been updated to the same as the eq table
                equipmentAuditRecord.setValue(EQ_AUDIT_TABLE + SQL_DOT + TRANSFER_STATUS,
                    TransferStatusHelper.TRANS_STATUS.NO_CHANGE.toString());
                
                ImportExportUtilities.updateValuesForEqFieldsToSurvey(surveyId,
                    equipmentAuditRecord, equipmentId, equipmentRecord);
                equipmentAuditDatasource.saveRecord(equipmentAuditRecord);
                
                // copy the equipment photo
                DocumentsUtilities.copyDocuments(DOCUMENT_FIELD_NAMES_EQ, equipmentRecord,
                    equipmentAuditRecord);
                
                numberOfRecords++;
            }
        }
        
        return numberOfRecords;
    }
    
    /** {@inheritDoc} */
    public void updateEquipmentToSurvey(final String surveyId) {
        final DataSource equipmentDatasource =
                DataSourceFactory.createDataSourceForFields(EQ_TABLE,
                    DataSourceUtilities.getEquipmentFields(surveyId));
        
        final DataSource equipmentAuditDatasource =
                DataSourceFactory.createDataSourceForFields(EQ_AUDIT_TABLE,
                    DataSourceUtilities.getEquipmentAuditFields(surveyId));
        
        final List<DataRecord> equipmentAuditRecords =
                ImportExportUtilities.retrieveSurveyEquipmentAuditRecords(equipmentAuditDatasource,
                    surveyId);
        
        for (final DataRecord equipmentAuditRecord : equipmentAuditRecords) {
            final String equipmentId =
                    equipmentAuditRecord.getString(EQ_AUDIT_TABLE + SQL_DOT + EQ_ID);
            final Map<String, Object> equipmentMap = new HashMap<String, Object>();
            
            equipmentDatasource.clearRestrictions();
            final List<DataRecord> equipmentRecords =
                    ImportExportUtilities.retrieveEquipmentRecords(equipmentDatasource,
                        equipmentMap, "", equipmentId, "");
            
            if (!equipmentRecords.isEmpty()) {
                final DataRecord equipmentRecord = equipmentRecords.get(0);
                
                ImportExportUtilities.updateValuesForEqFieldsToSurvey(surveyId,
                    equipmentAuditRecord, equipmentId, equipmentRecord);
                equipmentAuditDatasource.saveRecord(equipmentAuditRecord);
                
            }
        }
    }
    
    /** {@inheritDoc} */
    public void updateSurvey(final String surveyId, final Date surveyDate,
            final String performedBy, final String description, final String status) {
        // update the afm_user.user_name value (e.g. TRAM) to the mob_locked_by field of the
        // eq_audit record assigned to this employee.
        final String userName = DataSourceUtilities.retrieveUserName(performedBy);
        
        if (StringUtil.notNullOrEmpty(userName)) {
            addOrUpdateSurveyRecord(surveyId, surveyDate, performedBy, description, status, false);
            
            final DataSource equipmentAuditDatasource =
                    DataSourceFactory.createDataSourceForFields(EQ_AUDIT_TABLE,
                        DataSourceUtilities.getEquipmentAuditFields(surveyId));
            equipmentAuditDatasource.setContext();
            equipmentAuditDatasource.setMaxRecords(0);
            
            final ParsedRestrictionDef restriction = new ParsedRestrictionDef();
            restriction.addClause(EQ_AUDIT_TABLE, SURVEY_ID, surveyId, Operation.EQUALS);
            
            final List<DataRecord> equipmentAuditRecords =
                    equipmentAuditDatasource.getRecords(restriction);
            if (equipmentAuditRecords != null && !equipmentAuditRecords.isEmpty()) {
                ImportExportUtilities.updateEquipmentAuditTable(userName, equipmentAuditDatasource,
                    equipmentAuditRecords);
            }
            // TODO else ?
        } else {
            final ExceptionBase exception = new ExceptionBase();
            exception.setPattern(NO_USER_ACCOUNT_MESSAGE);
            exception.setTranslatable(true);
            exception.setArgs(new Object[] { performedBy });
            throw exception;
        }
    }
    
    /** {@inheritDoc} */
    public void closeSurvey(final String surveyId) {
        
        final DataSource surveyDatasource =
                DataSourceFactory.createDataSourceForFields(SURVEY_TABLE, new String[] { SURVEY_ID,
                        STATUS });
        
        final ParsedRestrictionDef restriction = new ParsedRestrictionDef();
        restriction.addClause(SURVEY_TABLE, SURVEY_ID, surveyId, Operation.EQUALS);
        final List<DataRecord> surveyRecords = surveyDatasource.getRecords(restriction);
        if (!surveyRecords.isEmpty()) {
            final DataRecord surveyRecord = surveyRecords.get(0);
            surveyRecord.setValue(SURVEY_TABLE + SQL_DOT + STATUS, CLOSED);
            surveyDatasource.saveRecord(surveyRecord);
            
            exportSurveyToEquipment(surveyId);
        }
        // TODO else ?
    }
    
    /** {@inheritDoc} */
    public void exportSurveyToEquipment(final String surveyId) {
        final DataSource equipmentAuditDatasource =
                DataSourceFactory.createDataSourceForFields(EQ_AUDIT_TABLE,
                    DataSourceUtilities.getEquipmentAuditFields(surveyId));
        equipmentAuditDatasource.setContext();
        equipmentAuditDatasource.setMaxRecords(0);
        
        final ParsedRestrictionDef restriction = new ParsedRestrictionDef();
        restriction.addClause(EQ_AUDIT_TABLE, SURVEY_ID, surveyId, Operation.EQUALS);
        final List<DataRecord> equipmentAuditRecords =
                equipmentAuditDatasource.getRecords(restriction);
        
        if (equipmentAuditRecords != null && !equipmentAuditRecords.isEmpty()) {
            for (final DataRecord equipmentAuditRecord : equipmentAuditRecords) {
                final boolean succeeds =
                        ImportExportUtilities.addOrUpdateEquipment(surveyId,
                            equipmentAuditDatasource, equipmentAuditRecord);
                
                // clear the mob_locked_by field if update is successful
                if (succeeds) {
                    equipmentAuditRecord.setValue(EQ_AUDIT_TABLE + SQL_DOT + MOB_LOCKED_BY, "");
                    equipmentAuditDatasource.saveRecord(equipmentAuditRecord);
                }
                // TODO else ?
            }
        }
        
    }
    
    /** {@inheritDoc} */
    public void deleteSurvey(final String surveyId) {
        
        final DataSource surveyDatasource =
                DataSourceFactory.createDataSourceForFields(SURVEY_TABLE,
                    new String[] { SURVEY_ID });
        
        ParsedRestrictionDef restriction = new ParsedRestrictionDef();
        restriction.addClause(SURVEY_TABLE, SURVEY_ID, surveyId, Operation.EQUALS);
        final List<DataRecord> surveyRecords = surveyDatasource.getRecords(restriction);
        if (!surveyRecords.isEmpty()) {
            surveyDatasource.deleteRecord(surveyRecords.get(0));
        }
        // TODO else ?
        
        final DataSource equipmentAuditDatasource =
                DataSourceFactory.createDataSourceForFields(EQ_AUDIT_TABLE,
                    DataSourceUtilities.getEquipmentAuditFields(surveyId));
        equipmentAuditDatasource.setContext();
        equipmentAuditDatasource.setMaxRecords(0);
        
        restriction = new ParsedRestrictionDef();
        restriction.addClause(EQ_AUDIT_TABLE, SURVEY_ID, surveyId, Operation.EQUALS);
        
        final List<DataRecord> equipmentAuditRecords =
                equipmentAuditDatasource.getRecords(restriction);
        if (equipmentAuditRecords != null && !equipmentAuditRecords.isEmpty()) {
            for (final DataRecord equipmentAuditRecord : equipmentAuditRecords) {
                equipmentAuditDatasource.deleteRecord(equipmentAuditRecord);
            }
        }
    }
    
    /** {@inheritDoc} */
    public void markSurveyCompleted(final String surveyId) {
        final DataSource surveyDatasource =
                DataSourceFactory.createDataSourceForFields(SURVEY_TABLE, new String[] { SURVEY_ID,
                        STATUS });
        
        ParsedRestrictionDef restriction = new ParsedRestrictionDef();
        restriction.addClause(SURVEY_TABLE, SURVEY_ID, surveyId, Operation.EQUALS);
        final List<DataRecord> surveyRecords = surveyDatasource.getRecords(restriction);
        if (!surveyRecords.isEmpty()) {
            final DataRecord surveyRecord = surveyRecords.get(0);
            surveyRecord.setValue(SURVEY_TABLE + SQL_DOT + STATUS, COMPLETED);
            surveyDatasource.saveRecord(surveyRecord);
            
            final DataSource equipmentAuditDatasource =
                    DataSourceFactory.createDataSourceForFields(EQ_AUDIT_TABLE,
                        DataSourceUtilities.getEquipmentAuditFields(surveyId));
            equipmentAuditDatasource.setContext();
            equipmentAuditDatasource.setMaxRecords(0);
            restriction = new ParsedRestrictionDef();
            restriction.addClause(EQ_AUDIT_TABLE, SURVEY_ID, surveyId, Operation.EQUALS);
            
            final List<DataRecord> equipmentAuditRecords =
                    equipmentAuditDatasource.getRecords(restriction);
            if (equipmentAuditRecords != null && !equipmentAuditRecords.isEmpty()) {
                for (final DataRecord equipmentAuditRecord : equipmentAuditRecords) {
                    equipmentAuditRecord.setValue(EQ_AUDIT_TABLE + SQL_DOT + MOB_LOCKED_BY, "");
                    equipmentAuditDatasource.saveRecord(equipmentAuditRecord);
                }
            }
        }
        // TODO else ?
    }
    
    /** {@inheritDoc} */
    public void deleteSurveyTask(final String surveyId, final String eqId) {
        
        final DataSource equipmentAuditDatasource =
                DataSourceFactory.createDataSourceForFields(EQ_AUDIT_TABLE,
                    DataSourceUtilities.getEquipmentAuditFields(surveyId));
        final ParsedRestrictionDef restriction = new ParsedRestrictionDef();
        restriction.addClause(EQ_AUDIT_TABLE, SURVEY_ID, surveyId, Operation.EQUALS);
        restriction.addClause(EQ_AUDIT_TABLE, EQ_ID, eqId, Operation.EQUALS);
        
        final List<DataRecord> equipmentAuditRecords =
                equipmentAuditDatasource.getRecords(restriction);
        if (equipmentAuditRecords != null && !equipmentAuditRecords.isEmpty()) {
            for (final DataRecord equipmentAuditRecord : equipmentAuditRecords) {
                equipmentAuditDatasource.deleteRecord(equipmentAuditRecord);
            }
        }
    }
}
