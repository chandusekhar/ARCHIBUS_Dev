package com.archibus.eventhandler.clean;

import java.util.*;

import com.archibus.datasource.*;
import com.archibus.datasource.data.*;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.jobmanager.JobStatus;
import com.archibus.utility.StringUtil;

/**
 * Action items methods.
 * 
 * @author Ioan Draghici
 * 
 */
public class ActionHandler extends CommonsHandler {
    /**
     * Create copies of selected items. Create copies of activity_log and cb_hcm_loc_typ_chk
     * records.
     * 
     * <p>
     * Suppress PMD warning "AvoidUsingSql" in this method.
     * <p>
     * Justification: Case #2: Statement with INSERT ... SELECT pattern.
     * 
     * @param sourceIds source pKey's
     * @param status job status
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    public void copyItems(final List<String> sourceIds, final JobStatus status) {
        // fields to be copied
        final String[] actionFields =
                { Constants.ACTIVITY_LOG_ID, Constants.SITE_FLD_NAME, Constants.BUILDING_FLD_NAME,
                        Constants.FLOOR_FLD_NAME, Constants.ROOM_FLD_NAME, Constants.ACTIVITY_TYPE,
                        Constants.PROJECT_ID, Constants.ASSESSMENT_ID, Constants.PROB_TYPE,
                        Constants.ASSIGNED_TO, Constants.ASSESSED_BY, Constants.HCM_ABATE_BY,
                        Constants.DATE_REQUESTED, Constants.COPIED_FROM };
        final Map<String, Object> actionDefaults = new HashMap<String, Object>();
        final Date currentDate = new Date();
        actionDefaults.put(Constants.DATE_REQUESTED, currentDate);
        // set job total no
        final int totalNo = sourceIds.size();
        status.setTotalNumber(totalNo);
        final DataSetList newRecords = new DataSetList();
        // start copy process
        int counter = 0;
        for (final String sourceId : sourceIds) {
            if (status.isStopRequested()) {
                status.setDataSet(newRecords);
                status.setCurrentNumber(totalNo);
                status.setCode(JobStatus.JOB_STOP_REQUESTED);
                return;
            }
            // copy action record
            actionDefaults.put(Constants.COPIED_FROM, Integer.valueOf(sourceId));
            final DataRecord newRec =
                    copyRecord(Constants.ACTIVITY_LOG_TABLE, Constants.ACTIVITY_LOG_ID, sourceId,
                        actionFields, actionDefaults);
            final int newId =
                    newRec.getInt(Constants.ACTIVITY_LOG_TABLE + Constants.DOT
                            + Constants.ACTIVITY_LOG_ID);
            // copy locations - bulk copy here is faster
            final String copyLocQuery =
                    "INSERT INTO " + Constants.CB_HCM_LOC_TYP_CHK_TABLE + " ("
                            + Constants.ACTIVITY_LOG_ID + ", " + Constants.HCM_LOC_TYP_ID
                            + ") SELECT " + newId + " ${sql.as} " + Constants.ACTIVITY_LOG_ID
                            + ",  " + Constants.HCM_LOC_TYP_ID + " FROM "
                            + Constants.CB_HCM_LOC_TYP_CHK_TABLE + " WHERE "
                            + Constants.ACTIVITY_LOG_ID + Constants.EQUALS_OPERATOR + sourceId;
            SqlUtils.executeUpdate(Constants.CB_HCM_LOC_TYP_CHK_TABLE, copyLocQuery);
            newRecords.addRecord(newRec);
            status.setCurrentNumber(counter++);
        }
        status.setDataSet(newRecords);
        status.setCurrentNumber(totalNo);
        status.setCode(JobStatus.JOB_COMPLETE);
        
    }
    
    /**
     * Generate action items for assessments.
     * 
     * @param record data record with current action field values
     * @param actionIds list of current action id's, used for update
     * @param assessmentIds list of selected assessments
     * @param status job status
     */
    public void generateRecordsForAssessments(final DataRecord record,
            final Map<String, String> actionIds, final List<String> assessmentIds,
            final JobStatus status) {
        
        // Set status total number
        final long totalNo = assessmentIds.size();
        status.setTotalNumber(totalNo);
        
        final String[] fields = getAllFieldsForTable(Constants.ACTIVITY_LOG_TABLE);
        final DataSource dsGlobal =
                DataSourceFactory.createDataSourceForFields(Constants.ACTIVITY_LOG_TABLE, fields);
        
        // prepare dataSet that will be returned to axvw
        final DataSetList resultDataSet = new DataSetList();
        final String origAssessmentId =
                String.valueOf(record.getInt(Constants.ACTIVITY_LOG_TABLE + Constants.DOT
                        + Constants.ASSESSMENT_ID));
        int counter = 0;
        for (final String assessment : assessmentIds) {
            if (status.isStopRequested()) {
                // if is stop requested than stop execution
                status.setDataSet(resultDataSet);
                status.setCurrentNumber(totalNo);
                status.setCode(JobStatus.JOB_STOP_REQUESTED);
                return;
            }
            if (assessment.equals(origAssessmentId)) {
                continue;
            }
            // get parent record - assessment
            final DataRecord recAssessment =
                    dsGlobal.getRecord(Constants.ACTIVITY_LOG_TABLE + Constants.DOT
                            + Constants.ACTIVITY_LOG_ID + Constants.EQUALS_OPERATOR + assessment);
            // get action record
            DataRecord recAction = null;
            if (actionIds.containsKey(assessment)) {
                final String action = actionIds.get(assessment);
                recAction =
                        dsGlobal.getRecord(Constants.ACTIVITY_LOG_TABLE + Constants.DOT
                                + Constants.ACTIVITY_LOG_ID + Constants.EQUALS_OPERATOR + action);
            } else {
                recAction = dsGlobal.createNewRecord();
            }
            
            // update values
            updateRecord(recAction, record, recAssessment);
            // set assessmentID
            recAction.setValue(Constants.ACTIVITY_LOG_TABLE + Constants.DOT
                    + Constants.ASSESSMENT_ID, Integer.valueOf(assessment));
            
            final DataRecord newRec = dsGlobal.saveRecord(recAction);
            if (newRec == null) {
                final DataRecord crtRec = new DataRecord();
                crtRec.addField(record.findField(
                    Constants.ACTIVITY_LOG_TABLE + Constants.DOT + Constants.ACTIVITY_LOG_ID)
                    .getFieldDef());
                crtRec.addField(record.findField(
                    Constants.ACTIVITY_LOG_TABLE + Constants.DOT + Constants.ASSESSMENT_ID)
                    .getFieldDef());
                crtRec.setValue(
                    Constants.ACTIVITY_LOG_TABLE + Constants.DOT + Constants.ACTIVITY_LOG_ID,
                    recAction.getValue(Constants.ACTIVITY_LOG_TABLE + Constants.DOT
                            + Constants.ACTIVITY_LOG_ID));
                crtRec.setValue(Constants.ACTIVITY_LOG_TABLE + Constants.DOT
                        + Constants.ASSESSMENT_ID, Integer.valueOf(assessment));
                resultDataSet.addRecord(crtRec);
            } else {
                newRec.addField(record.findField(
                    Constants.ACTIVITY_LOG_TABLE + Constants.DOT + Constants.ASSESSMENT_ID)
                    .getFieldDef());
                newRec.setValue(Constants.ACTIVITY_LOG_TABLE + Constants.DOT
                        + Constants.ASSESSMENT_ID, Integer.valueOf(assessment));
                resultDataSet.addRecord(newRec);
            }
            
            status.setCurrentNumber(counter++);
        }
        status.setDataSet(resultDataSet);
        status.setCurrentNumber(totalNo);
        status.setCode(JobStatus.JOB_COMPLETE);
    }
    
    /**
     * Generate survey items from parent items.Also generates survey items from service request -
     * same logic.
     * 
     * @param pKeys parent primary keys
     * @param level on what level to generate
     * @param defaultValue record with default values
     * @param defaultLocations list of locations
     * @param status job status
     * @param isCountOnly true if is only to count the records to generate
     * @return number of new records
     */
    public int generateSurveyRecords(final List<String> pKeys, final String level,
            final DataRecord defaultValue, final List<String> defaultLocations,
            final JobStatus status, final boolean isCountOnly) {
        final int totalNo = pKeys.size() * Constants.MY_FACTOR;
        status.setTotalNumber(totalNo);
        final DataSetList result = new DataSetList();
        int counter = 0;
        int noRecords = 0;
        boolean exitMethod = false;
        for (final String pKey : pKeys) {
            if (status.isStopRequested()) {
                status.setCurrentNumber(status.getTotalNumber());
                status.setDataSet(result);
                status.setCode(JobStatus.JOB_STOP_REQUESTED);
                exitMethod = true;
                break;
            }
            
            final DataSetList crtResult =
                    generateSurveyRecordsForParent(pKey, level, defaultValue, defaultLocations,
                        status, isCountOnly);
            result.addRecords(crtResult.getRecords());
            noRecords = result.getRecords().size();
            final int crtNo = counter++ * Constants.MY_FACTOR;
            status.setCurrentNumber(crtNo);
        }
        if (!exitMethod) {
            status.setDataSet(result);
            status.setCurrentNumber(totalNo);
            status.setCode(JobStatus.JOB_COMPLETE);
        }
        
        return noRecords;
    }
    
    /**
     * Validate settings from generate survey items pop-up.
     * 
     * @param level user selected level
     * @param pKeys selected activityLogid's
     * @return result message
     */
    public String validateSurveySettings(final String level, final List<String> pKeys) {
        String result = "valid";
        String pKeysVal = "";
        for (int i = 0; i < pKeys.size(); i++) {
            pKeysVal += (pKeysVal.length() == 0 ? "" : ",") + pKeys.get(i);
        }
        // get activity_log data
        final String[] activityLogFlds =
                { Constants.ACTIVITY_LOG_ID, Constants.SITE_FLD_NAME, Constants.BUILDING_FLD_NAME,
                        Constants.FLOOR_FLD_NAME, Constants.ROOM_FLD_NAME };
        final DataSource dsActivityLog =
                DataSourceFactory.createDataSourceForFields(Constants.ACTIVITY_LOG_TABLE,
                    activityLogFlds);
        dsActivityLog.addRestriction(Restrictions.in(Constants.ACTIVITY_LOG_TABLE,
            Constants.ACTIVITY_LOG_ID, pKeysVal));
        final List<DataRecord> records = dsActivityLog.getRecords();
        for (final DataRecord record : records) {
            if (!validateSurveySettingsForRecord(level, record)) {
                result = "error";
                break;
            }
        }
        return result;
    }
    
    /**************** PRIVATE METHODS ******************************/
    
    /**
     * Generate Survey records for specified parent.
     * 
     * @param parentId parent id
     * @param level specified level
     * @param defaults default values record
     * @param defaultLocations list of locations
     * @param status job status
     * @param isCountOnly true if is only to count the records to generate
     * @return dataset list with created records pkeys
     */
    private DataSetList generateSurveyRecordsForParent(final String parentId, final String level,
            final DataRecord defaults, final List<String> defaultLocations, final JobStatus status,
            final boolean isCountOnly) {
        // create global datasource
        final String[] recFields =
                { Constants.ACTIVITY_LOG_ID, Constants.PROJECT_ID, Constants.PROB_TYPE,
                        Constants.HCM_LOC_TYP_ID, Constants.SITE_FLD_NAME,
                        Constants.BUILDING_FLD_NAME, Constants.FLOOR_FLD_NAME,
                        Constants.ROOM_FLD_NAME, Constants.ACTIVITY_TYPE, Constants.COPIED_FROM,
                        Constants.ASSESSED_BY, Constants.CAUSE_TYPE, Constants.ASSIGNED_TO,
                        "hcm_pending_act", Constants.HCM_ABATE_BY, "hcm_haz_status_id",
                        Constants.ASSESSMENT_ID };
        final DataSource dsActivityLog =
                DataSourceFactory
                    .createDataSourceForFields(Constants.ACTIVITY_LOG_TABLE, recFields);
        
        // get parent record
        dsActivityLog.addRestriction(Restrictions.eq(Constants.ACTIVITY_LOG_TABLE,
            Constants.ACTIVITY_LOG_ID, parentId));
        final DataRecord recParent = dsActivityLog.getRecord();
        
        // get location types
        String[] locTypes = defaultLocations.toArray(new String[defaultLocations.size()]);
        if (locTypes.length == 0) {
            // no location types defined try to get location types of parent item
            final List<DataRecord> records =
                    getRecordsFromTable(Constants.CB_HCM_LOC_TYP_CHK_TABLE,
                        Constants.ACTIVITY_LOG_ID, parentId);
            if (!records.isEmpty()) {
                locTypes = new String[records.size()];
                int index = 0;
                for (final DataRecord rec : records) {
                    locTypes[index] =
                            rec.getString(Constants.CB_HCM_LOC_TYP_CHK_TABLE + Constants.DOT
                                    + Constants.HCM_LOC_TYP_ID);
                    index++;
                }
            }
        }
        
        // datasource for hcm_places
        final String[] flds = getAllFieldsForTable(Constants.CB_HCM_PLACES_TABLE);
        final DataSource dsHcmPlace =
                DataSourceFactory.createDataSourceForFields(Constants.CB_HCM_PLACES_TABLE, flds);
        final DataSetList resultDataSet = new DataSetList();
        final List<DataRecord> locations = getLocationsForItem(recParent, level);
        int recNo = locations.size();
        if (locTypes.length > 0) {
            recNo = recNo * locTypes.length;
        }
        final int step = Constants.MY_FACTOR / recNo;
        for (final DataRecord location : locations) {
            for (final String locType : locTypes) {
                // if is stop requested
                if (status.isStopRequested()) {
                    status.setCurrentNumber(status.getTotalNumber());
                    status.setCode(JobStatus.JOB_STOP_REQUESTED);
                    // return resultDataSet;
                } else {
                    // create new record
                    final DataRecord recSurvey =
                            getNewSurveyRecord(parentId, dsActivityLog, location, locType);
                    
                    // create hazard places records
                    final DataRecord recHcmPlace = getNewHcmPlaceRecord(dsHcmPlace, location);
                    
                    // set default values
                    copyRecordValues(defaults, recSurvey);
                    
                    if (isCountOnly) {
                        // only add the to-be-generated records
                        resultDataSet.addRecord(recSurvey);
                    } else {
                        // save survey record
                        final DataRecord newRec = dsActivityLog.saveRecord(recSurvey);
                        resultDataSet.addRecord(newRec);
                        dsActivityLog.clearRestrictions();
                        final int newSurveyId =
                                newRec.getInt(Constants.ACTIVITY_LOG_TABLE + Constants.DOT
                                        + Constants.ACTIVITY_LOG_ID);
                        dsActivityLog.addRestriction(Restrictions.eq(Constants.ACTIVITY_LOG_TABLE,
                            Constants.ACTIVITY_LOG_ID, newSurveyId));
                        final DataRecord recUpdate = dsActivityLog.getRecord();
                        recUpdate.setValue(Constants.ACTIVITY_LOG_TABLE + Constants.DOT
                                + Constants.ASSESSMENT_ID, newSurveyId);
                        dsActivityLog.saveRecord(recUpdate);
                        
                        recHcmPlace.setValue(Constants.CB_HCM_PLACES_TABLE + Constants.DOT
                                + Constants.ACTIVITY_LOG_ID, newSurveyId);
                        // save record
                        dsHcmPlace.saveRecord(recHcmPlace);
                    }
                    status.setCurrentNumber(status.getCurrentNumber() + step);
                }
            }
        }
        return resultDataSet;
    }
    
    /**
     * Create survey record depending on location.
     * 
     * @param parentId Parent survey id
     * @param dsActivityLog data source for the survey
     * @param location location
     * @param locType location type
     * @return survey data record
     */
    private DataRecord getNewSurveyRecord(final String parentId, final DataSource dsActivityLog,
            final DataRecord location, final String locType) {
        final DataRecord recSurvey = dsActivityLog.createNewRecord();
        
        // set some values
        recSurvey.setValue(Constants.ACTIVITY_LOG_TABLE + Constants.DOT + Constants.ACTIVITY_TYPE,
            Constants.ASSESSMENT_ACTIVITY_TYPE);
        // copied from
        recSurvey.setValue(Constants.ACTIVITY_LOG_TABLE + Constants.DOT + Constants.COPIED_FROM,
            Integer.valueOf(parentId));
        // place
        recSurvey.setValue(Constants.ACTIVITY_LOG_TABLE + Constants.DOT + Constants.HCM_LOC_TYP_ID,
            locType);
        
        // set location fields
        if (location.valueExists(Constants.SITE_TABLE + Constants.DOT + Constants.SITE_FLD_NAME)) {
            recSurvey.setValue(Constants.ACTIVITY_LOG_TABLE + Constants.DOT
                    + Constants.SITE_FLD_NAME,
                location.getValue(Constants.SITE_TABLE + Constants.DOT + Constants.SITE_FLD_NAME));
        }
        if (location.valueExists(Constants.BUILDING_TABLE + Constants.DOT
                + Constants.BUILDING_FLD_NAME)) {
            recSurvey.setValue(
                Constants.ACTIVITY_LOG_TABLE + Constants.DOT + Constants.BUILDING_FLD_NAME,
                location.getValue(Constants.BUILDING_TABLE + Constants.DOT
                        + Constants.BUILDING_FLD_NAME));
        }
        if (location.valueExists(Constants.FLOOR_TABLE + Constants.DOT + Constants.FLOOR_FLD_NAME)) {
            recSurvey
                .setValue(
                    Constants.ACTIVITY_LOG_TABLE + Constants.DOT + Constants.FLOOR_FLD_NAME,
                    location.getValue(Constants.FLOOR_TABLE + Constants.DOT
                            + Constants.FLOOR_FLD_NAME));
        }
        if (location.valueExists(Constants.ROOM_TABLE + Constants.DOT + Constants.ROOM_FLD_NAME)) {
            recSurvey.setValue(Constants.ACTIVITY_LOG_TABLE + Constants.DOT
                    + Constants.ROOM_FLD_NAME,
                location.getValue(Constants.ROOM_TABLE + Constants.DOT + Constants.ROOM_FLD_NAME));
        }
        
        return recSurvey;
    }
    
    /**
     * Create hazard place record depending on location.
     * 
     * @param dsHcmPlace data source for the hazard place
     * @param location location
     * @return hazard place record
     */
    private DataRecord getNewHcmPlaceRecord(final DataSource dsHcmPlace, final DataRecord location) {
        final DataRecord recHcmPlace = dsHcmPlace.createNewRecord();
        
        if (location.valueExists(Constants.BUILDING_TABLE + Constants.DOT
                + Constants.BUILDING_FLD_NAME)) {
            recHcmPlace.setValue(
                Constants.CB_HCM_PLACES_TABLE + Constants.DOT + Constants.BUILDING_FLD_NAME,
                location.getValue(Constants.BUILDING_TABLE + Constants.DOT
                        + Constants.BUILDING_FLD_NAME));
        }
        if (location.valueExists(Constants.FLOOR_TABLE + Constants.DOT + Constants.FLOOR_FLD_NAME)) {
            recHcmPlace
                .setValue(
                    Constants.CB_HCM_PLACES_TABLE + Constants.DOT + Constants.FLOOR_FLD_NAME,
                    location.getValue(Constants.FLOOR_TABLE + Constants.DOT
                            + Constants.FLOOR_FLD_NAME));
        }
        if (location.valueExists(Constants.ROOM_TABLE + Constants.DOT + Constants.ROOM_FLD_NAME)) {
            recHcmPlace.setValue(Constants.CB_HCM_PLACES_TABLE + Constants.DOT
                    + Constants.ROOM_FLD_NAME,
                location.getValue(Constants.ROOM_TABLE + Constants.DOT + Constants.ROOM_FLD_NAME));
        }
        
        return recHcmPlace;
    }
    
    /**
     * Update record values with source and parent values.
     * 
     * @param recTarget record to be updated
     * @param recSource source record
     * @param recParent parent record
     */
    private void updateRecord(final DataRecord recTarget, final DataRecord recSource,
            final DataRecord recParent) {
        final List<DataValue> fields = recTarget.getFields();
        
        for (final DataValue field : fields) {
            final String fieldName = field.getName();
            
            final boolean isBlOrFlOrRm =
                    (Constants.ACTIVITY_LOG_TABLE + Constants.DOT + Constants.BUILDING_FLD_NAME)
                        .equals(fieldName)
                            || (Constants.ACTIVITY_LOG_TABLE + Constants.DOT + Constants.FLOOR_FLD_NAME)
                                .equals(fieldName)
                            || (Constants.ACTIVITY_LOG_TABLE + Constants.DOT + Constants.ROOM_FLD_NAME)
                                .equals(fieldName);
            
            final boolean isHazRespOrAbatReason =
                    (Constants.ACTIVITY_LOG_TABLE + Constants.DOT + "repair_type")
                        .equals(fieldName)
                            || (Constants.ACTIVITY_LOG_TABLE + Constants.DOT + Constants.CAUSE_TYPE)
                                .equals(fieldName);
            
            if ((Constants.ACTIVITY_LOG_TABLE + Constants.DOT + Constants.SITE_FLD_NAME)
                .equals(fieldName) || isBlOrFlOrRm || isHazRespOrAbatReason) {
                
                if (recParent.valueExists(fieldName)) {
                    recTarget.setValue(fieldName, recParent.getValue(fieldName));
                }
            } else {
                updateRecordFromSourceOrParent(recTarget, recSource, recParent, fieldName);
            }
            
        }
    }
    
    /**
     * Copies the field to the target record's field, from the source record or from the parent
     * record.
     * 
     * @param recTarget target record
     * @param recSource source record
     * @param recParent parent record
     * @param fieldName field name to copy
     */
    private void updateRecordFromSourceOrParent(final DataRecord recTarget,
            final DataRecord recSource, final DataRecord recParent, final String fieldName) {
        if ((Constants.ACTIVITY_LOG_TABLE + Constants.DOT + Constants.ASSESSED_BY)
            .equals(fieldName)
                || (Constants.ACTIVITY_LOG_TABLE + Constants.DOT + Constants.ASSIGNED_TO)
                    .equals(fieldName)
                || (Constants.ACTIVITY_LOG_TABLE + Constants.DOT + Constants.HCM_ABATE_BY)
                    .equals(fieldName)) {
            
            // if value is provided update from source otherwise copy from parent
            if (recSource.valueExists(fieldName)) {
                recTarget.setValue(fieldName, recSource.getValue(fieldName));
            } else if (recParent.valueExists(fieldName)) {
                recTarget.setValue(fieldName, recParent.getValue(fieldName));
            }
            
        } else if (!(Constants.ACTIVITY_LOG_TABLE + Constants.DOT + Constants.ACTIVITY_LOG_ID)
            .equals(fieldName) && recSource.valueExists(fieldName)) {
            recTarget.setValue(fieldName, recSource.getValue(fieldName));
        }
    }
    
    /**
     * Validate generate survey records settings for specified activity_log record.
     * 
     * @param level user selected level
     * @param record activity_log record
     * @return true / false if settings are validated or not
     */
    private boolean validateSurveySettingsForRecord(final String level, final DataRecord record) {
        boolean result = true;
        final String siteId =
                record.getString(Constants.ACTIVITY_LOG_TABLE + Constants.DOT
                        + Constants.SITE_FLD_NAME);
        final String blId =
                record.getString(Constants.ACTIVITY_LOG_TABLE + Constants.DOT
                        + Constants.BUILDING_FLD_NAME);
        final String flId =
                record.getString(Constants.ACTIVITY_LOG_TABLE + Constants.DOT
                        + Constants.FLOOR_FLD_NAME);
        final String rmId =
                record.getString(Constants.ACTIVITY_LOG_TABLE + Constants.DOT
                        + Constants.ROOM_FLD_NAME);
        
        if (Constants.BUILDING_TABLE.equals(level) && !StringUtil.notNullOrEmpty(blId)) {
            final DataSource dsLevel = getBuildingLevelDataSource(siteId);
            final List<DataRecord> records = dsLevel.getRecords();
            result ^= records.isEmpty();
        } else if (Constants.FLOOR_TABLE.equals(level) && !StringUtil.notNullOrEmpty(flId)) {
            final DataSource dsLevel = getFloorLevelDataSource(siteId, blId);
            final List<DataRecord> records = dsLevel.getRecords();
            result ^= records.isEmpty();
        } else if (Constants.ROOM_TABLE.equals(level) && !StringUtil.notNullOrEmpty(rmId)) {
            final DataSource dsLevel = getRoomLevelDataSource(siteId, blId, flId);
            final List<DataRecord> records = dsLevel.getRecords();
            result ^= records.isEmpty();
        }
        
        return result;
    }
    
    /**
     * Create data source for building level.
     * 
     * @param siteId site code
     * @return data source for building level
     */
    private DataSource getBuildingLevelDataSource(final String siteId) {
        final DataSource dsLevel = DataSourceFactory.createDataSource();
        dsLevel.addTable(Constants.BUILDING_TABLE);
        dsLevel.addField(Constants.SITE_FLD_NAME);
        dsLevel.addField(Constants.BUILDING_FLD_NAME);
        dsLevel.addRestriction(Restrictions.eq(Constants.BUILDING_TABLE, Constants.SITE_FLD_NAME,
            siteId));
        return dsLevel;
    }
    
    /**
     * Create data source for floor level.
     * 
     * @param siteId site code
     * @param blId building code
     * @return data source for floor level
     */
    private DataSource getFloorLevelDataSource(final String siteId, final String blId) {
        final DataSource dsLevel = DataSourceFactory.createDataSource();
        
        dsLevel.addTable(Constants.FLOOR_TABLE, DataSource.ROLE_MAIN);
        dsLevel.addTable(Constants.BUILDING_TABLE, DataSource.ROLE_STANDARD);
        dsLevel.addField(Constants.FLOOR_TABLE, Constants.FLOOR_FLD_NAME);
        dsLevel.addField(Constants.BUILDING_TABLE, Constants.BUILDING_FLD_NAME);
        dsLevel.addField(Constants.BUILDING_TABLE, Constants.SITE_FLD_NAME);
        dsLevel.addRestriction(Restrictions.eq(Constants.BUILDING_TABLE, Constants.SITE_FLD_NAME,
            siteId));
        if (StringUtil.notNullOrEmpty(blId)) {
            dsLevel.addRestriction(Restrictions.eq(Constants.BUILDING_TABLE,
                Constants.BUILDING_FLD_NAME, blId));
        }
        
        return dsLevel;
    }
    
    /**
     * Create data source for room level.
     * 
     * @param siteId site code
     * @param blId building code
     * @param flId floor code
     * @return data source for room level
     */
    private DataSource getRoomLevelDataSource(final String siteId, final String blId,
            final String flId) {
        final DataSource dsLevel = DataSourceFactory.createDataSource();
        
        dsLevel.addTable(Constants.ROOM_TABLE, DataSource.ROLE_MAIN);
        dsLevel.addTable(Constants.BUILDING_TABLE, DataSource.ROLE_STANDARD);
        dsLevel.addField(Constants.ROOM_TABLE, Constants.ROOM_FLD_NAME);
        dsLevel.addField(Constants.ROOM_TABLE, Constants.FLOOR_FLD_NAME);
        dsLevel.addField(Constants.BUILDING_TABLE, Constants.BUILDING_FLD_NAME);
        dsLevel.addField(Constants.BUILDING_TABLE, Constants.SITE_FLD_NAME);
        dsLevel.addRestriction(Restrictions.eq(Constants.BUILDING_TABLE, Constants.SITE_FLD_NAME,
            siteId));
        if (StringUtil.notNullOrEmpty(blId)) {
            dsLevel.addRestriction(Restrictions.eq(Constants.BUILDING_TABLE,
                Constants.BUILDING_FLD_NAME, blId));
        }
        if (StringUtil.notNullOrEmpty(flId)) {
            dsLevel.addRestriction(Restrictions.eq(Constants.ROOM_TABLE, Constants.FLOOR_FLD_NAME,
                flId));
        }
        
        return dsLevel;
    }
}
