package com.archibus.eventhandler.clean;

import java.util.*;

import com.archibus.context.*;
import com.archibus.datasource.*;
import com.archibus.datasource.data.*;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.jobmanager.JobStatus;
import com.archibus.utility.StringUtil;

/**
 * Assessment items methods.
 * 
 * <p>
 * Suppress PMD warning "AvoidUsingSql" in this class.
 * <p>
 * Justification: Case #2: Statement with INSERT ... SELECT pattern.
 * 
 * @author Ioan Draghici
 * 
 */
@SuppressWarnings("PMD.AvoidUsingSql")
public class AssessmentHandler extends CommonsHandler {
    
    /**
     * Copy Assessment Items.
     * 
     * @param pKeys array with source items id's
     * @param newProjectId new project id
     * @param newAssessedBy new assessed by
     * @param newAssignedTo new assigned to
     * @param status job status
     */
    public void copyItems(final List<String> pKeys, final String newProjectId,
            final String newAssessedBy, final String newAssignedTo, final JobStatus status) {
        
        String pKeysVal = "";
        for (int i = 0; i < pKeys.size(); i++) {
            pKeysVal += (pKeysVal.length() == 0 ? "" : Constants.COMMA) + pKeys.get(i);
        }
        
        final String copyStatement =
                "INSERT INTO activity_log "
                        + "( assessment_id, project_id, assessed_by, assigned_to, site_id, "
                        + "bl_id, fl_id, rm_id, hcm_loc_typ_id, hcm_harea_id, location, lat, lon, "
                        + "hcm_loc_notes, cond_priority, prob_type, hcm_id, hcm_qty, action_title, "
                        + "cb_units_id, hcm_is_hazard, hcm_pipe_cnt, hcm_friable, hcm_fittings_num, "
                        + "hcm_haz_rank_id, hcm_class1_id, hcm_haz_rating_id, hcm_class2_id, hcm_class3_id, "
                        + "cond_value, hcm_pending_act, repair_type, rec_action, cause_type, "
                        + "hcm_labeled, description, activity_type ) "
                        + "SELECT activity_log_id, '"
                        + SqlUtils.makeLiteralOrBlank(newProjectId)
                        + Constants.MULTIPLE_VALUE_REPLACEMENT_FOR_STRING
                        + SqlUtils.makeLiteralOrBlank(newAssessedBy)
                        + Constants.MULTIPLE_VALUE_REPLACEMENT_FOR_STRING
                        + SqlUtils.makeLiteralOrBlank(newAssignedTo)
                        + "', site_id, bl_id, fl_id, rm_id, hcm_loc_typ_id, hcm_harea_id, location, lat, lon, hcm_loc_notes, "
                        + "cond_priority, prob_type, hcm_id, hcm_qty, action_title, cb_units_id, hcm_is_hazard, hcm_pipe_cnt, "
                        + "hcm_friable, hcm_fittings_num, hcm_haz_rank_id, hcm_class1_id, hcm_haz_rating_id, hcm_class2_id, "
                        + "hcm_class3_id, cond_value, hcm_pending_act, repair_type, rec_action, cause_type, "
                        + "hcm_labeled, description, activity_type "
                        + "FROM activity_log WHERE activity_log.activity_log_id IN ( " + pKeysVal
                        + " ) ";
        SqlUtils.executeUpdate(Constants.ACTIVITY_LOG_TABLE, copyStatement);
    }
    
	 /**
     * Copy a material sample and all its lab results to other assessment items
     * 
     * @param sampleIdSource source sample id
     * @return new sample id
     */
    public void copySampleAndLabResultsToAssessmentItems(final String sampleIdSource,
    		final List<String> assessmentItems)
    {
    	for(String item : assessmentItems)
    	{
            final String copySampleStatement =
                    "INSERT INTO cb_samples ( activity_log_id, uc_sample_reference, analysis_requested, "
                            + "analyst_name, comments, date_analysis, date_collected, date_received, lab_id, lab_log_num, "
                            + "requested_by, sample_archive, sample_code, sample_desc, sample_doc, sample_loc, "
                            + "sample_loc_code, sample_prefix_num, sample_type, dwgname, ehandle ) "
                            + "SELECT " + SqlUtils.makeLiteralOrBlank(item)
                            + ", " + SqlUtils.makeLiteralOrBlank(sampleIdSource)
                            + ", analysis_requested, analyst_name, comments, date_analysis, "
                            + "date_collected,date_received, lab_id, lab_log_num, requested_by, sample_archive, "
                            + "sample_code, sample_desc, sample_doc, sample_loc, sample_loc_code, sample_prefix_num, "
                            + "sample_type, dwgname, ehandle " + "FROM cb_samples "
                            + "WHERE cb_samples.sample_id = " + sampleIdSource;
            SqlUtils.executeUpdate(Constants.CB_SAMPLES_TABLE, copySampleStatement);
            final DataSource dsSample = DataSourceFactory.createDataSource();
            dsSample.addTable(Constants.CB_SAMPLES_TABLE);
            dsSample.addQuery("SELECT MAX(sample_id) AS sample_id FROM cb_samples",
                SqlExpressions.DIALECT_GENERIC);
            final DataRecord rec = dsSample.getRecord();
            final String sampleIdDestination = rec.getFields().get(0).getValue().toString();
            SqlUtils.commit();
            final String copyResultsStatement =
                    "INSERT INTO cb_sample_result(cb_units_id, qualifier, result_1, "
                            + "result_2, sample_comp_id, sample_id) "
                            + "SELECT cb_units_id, qualifier, result_1, result_2, sample_comp_id, "
                            + SqlUtils.makeLiteralOrBlank(sampleIdDestination)
                            + " FROM cb_sample_result " + "WHERE sample_id = " + sampleIdSource;
            SqlUtils.executeUpdate("cb_sample_result", copyResultsStatement);
    	}
    }
	
    /**
     * Copy a material sample and all its lab results to other assessment items
     * 
     * @param sampleIdSource source sample id
     * @return new sample id
     */
    public String copySampleAndLabResults(final String sampleIdSource) {
        final String copySampleStatement =
                "INSERT INTO cb_samples ( activity_log_id, analysis_requested, "
                        + "analyst_name, comments, date_analysis, date_collected, date_received, lab_id, lab_log_num, "
                        + "requested_by, sample_archive, sample_code, sample_desc, sample_doc, sample_loc, "
                        + "sample_loc_code, sample_prefix_num, sample_type, dwgname, ehandle ) "
                        + "SELECT activity_log_id, analysis_requested, analyst_name, comments, date_analysis, "
                        + "date_collected,date_received, lab_id, lab_log_num, requested_by, sample_archive, "
                        + "sample_code, sample_desc, sample_doc, sample_loc, sample_loc_code, sample_prefix_num, "
                        + "sample_type, dwgname, ehandle " + "FROM cb_samples "
                        + "WHERE cb_samples.sample_id = " + sampleIdSource;
        SqlUtils.executeUpdate(Constants.CB_SAMPLES_TABLE, copySampleStatement);
        
        final DataSource dsSample = DataSourceFactory.createDataSource();
        dsSample.addTable(Constants.CB_SAMPLES_TABLE);
        dsSample.addQuery("SELECT MAX(sample_id) AS sample_id FROM cb_samples",
            SqlExpressions.DIALECT_GENERIC);
        final DataRecord rec = dsSample.getRecord();
        final String sampleIdDestination = rec.getFields().get(0).getValue().toString();
        
        // need the new value for the sample_id foreign key in cb_sample_result
        SqlUtils.commit();
        
        final String copyResultsStatement =
                "INSERT INTO cb_sample_result(cb_units_id, qualifier, result_1, "
                        + "result_2, sample_comp_id, sample_id) "
                        + "SELECT cb_units_id, qualifier, result_1, result_2, sample_comp_id, "
                        + SqlUtils.makeLiteralOrBlank(sampleIdDestination)
                        + " FROM cb_sample_result " + "WHERE sample_id = " + sampleIdSource;
        SqlUtils.executeUpdate("cb_sample_result", copyResultsStatement);
        
        return sampleIdDestination;
    }
    
    /**
     * Generate communication log for items.
     * 
     * @param pKeys list of items pKeys
     * @param commlogId communication log record
     * @param commLogs current communication logs that must be updated. Contains pairs assessmentId,
     *            commlogId
     * @param status job status
     */
    public void generateCommLogForItems(final List<String> pKeys, final String commlogId,
            final Map<String, String> commLogs, final JobStatus status) {
        
        final int totalNo = pKeys.size() - 1;
        final int origCommlogId = Integer.valueOf(commlogId);
        status.setTotalNumber(totalNo);
        // create datasource
        final String tableName = Constants.LS_COMM_TABLE;
        final String[] fieldNames = getAllFieldsForTable(tableName);
        final DataSource dsComLog =
                DataSourceFactory.createDataSourceForFields(tableName, fieldNames);
        
        // get source record
        final DataRecord sourceRecord =
                dsComLog.getRecord(tableName + Constants.DOT + Constants.AUTO_NUMBER
                        + Constants.EQUALS_OPERATOR + origCommlogId);
        
        // fields that are not copied.
        final Set<String> exceptFields = new HashSet<String>();
        exceptFields.add(tableName + Constants.DOT + Constants.ACTIVITY_LOG_ID);
        exceptFields.add(tableName + Constants.DOT + Constants.AUTO_NUMBER);
        
        // prepare dataSet that will be returned to axvw
        final DataSetList resultDataSet = new DataSetList();
        
        for (int i = 0; i < pKeys.size(); i++) {
            if (status.isStopRequested()) {
                status.setDataSet(resultDataSet);
                status.setCurrentNumber(totalNo);
                status.setCode(JobStatus.JOB_STOP_REQUESTED);
                return;
            }
            final int assessmentId = Integer.valueOf(pKeys.get(i));
            
            // we must add/save this record
            DataRecord targetRecord = null;
            if (commLogs.containsKey(String.valueOf(assessmentId))) {
                final String crtCommlogId = commLogs.get(String.valueOf(assessmentId));
                targetRecord =
                        dsComLog.getRecord(tableName + Constants.DOT + Constants.AUTO_NUMBER
                                + Constants.EQUALS_OPERATOR + crtCommlogId);
            } else {
                targetRecord = dsComLog.createNewRecord();
                // set activity_log_id
                targetRecord.setValue(tableName + Constants.DOT + Constants.ACTIVITY_LOG_ID,
                    assessmentId);
            }
            
            copyRecordValues(sourceRecord, targetRecord, exceptFields);
            
            // save record
            final DataRecord newRec = dsComLog.saveRecord(targetRecord);
            if (newRec == null) {
                resultDataSet.addRecord(sourceRecord);
            } else {
                newRec.addField(sourceRecord.findField(
                    tableName + Constants.DOT + Constants.ACTIVITY_LOG_ID).getFieldDef());
                newRec
                    .setValue(tableName + Constants.DOT + Constants.ACTIVITY_LOG_ID, assessmentId);
                resultDataSet.addRecord(newRec);
            }
            sourceRecord.getString("ls_comm.doc");
            
            /*
             * // we must copy documents if (StringUtil.notNullOrEmpty(fileName)) {
             * copyDocument(origCommlogId, newId, fileName, "ls_comm", "doc", "auto_number"); }
             */
            status.setCurrentNumber(i + 1);
        }
        
        status.setDataSet(resultDataSet);
        status.setCurrentNumber(pKeys.size() - 1);
        status.setCode(JobStatus.JOB_COMPLETE);
    }
    
    /**
     * Generate Service Request from assessment items.
     * 
     * @param projectId project id
     * @param projProbType prob_type
     * @param assessIds list with selected assessment id's.
     * @param defValue default values record
     * @param status job status
     */
    public void generateServiceRequests(final String projectId, final String projProbType,
            final List<String> assessIds, final DataRecord defValue, final JobStatus status) {
        
        final int totalNo = assessIds.size();
        status.setTotalNumber(totalNo);
        // we need a global datasource on activity_log table
        final String tableName = Constants.ACTIVITY_LOG_TABLE;
        final String[] fields =
                { Constants.ACTIVITY_LOG_ID, "assessment_id", "activity_type",
                        Constants.BUILDING_FLD_NAME, Constants.FLOOR_FLD_NAME,
                        Constants.ROOM_FLD_NAME, "site_id", Constants.PROB_TYPE, "date_required",
                        "date_scheduled", "cost_estimated", "hours_est_baseline",
                        Constants.DESCRIPTION_FLD_NAME, "dv_id", "dp_id", "phone_requestor",
                        "ac_id", "priority", "created_by", "requestor", "assessed_by",
                        "assigned_to", "hcm_abate_by", "project_id" };
        final DataSource dsActivityLog =
                DataSourceFactory.createDataSourceForFields(tableName, fields);
        
        int counter = 0;
        for (final String assessmentId : assessIds) {
            if (status.isStopRequested()) {
                status.setCurrentNumber(totalNo);
                status.setCode(JobStatus.JOB_STOP_REQUESTED);
                return;
            }
            // get assessment record
            final DataRecord recParent =
                    dsActivityLog.getRecord(tableName + Constants.DOT + Constants.ACTIVITY_LOG_ID
                            + Constants.EQUALS_OPERATOR + assessmentId);
            
            DataRecord recRequest = dsActivityLog.createNewRecord();
            
            // copy all values from parent to source
            copyRecordValues(recParent, recRequest);
            
            // we must copy default values
            copyRecordValues(defValue, recRequest);
            
            // do some work here
            recRequest.setValue("activity_log.project_id", projectId);
            recRequest.setValue("activity_log.activity_type", Constants.REQUEST_ACTIVITY_TYPE);
            recRequest.setValue("activity_log.assessment_id",
                recParent.getValue(tableName + Constants.DOT + Constants.ACTIVITY_LOG_ID));
            
            final String hazAssessInfo = getAssessmentInfo(Integer.valueOf(assessmentId));
            final String hazPlacesInfo = getHcmPlacesInfo(Integer.valueOf(assessmentId));
            String hazInformation = Constants.INFO_MARKER_START;
            hazInformation += hazAssessInfo;
            hazInformation += hazPlacesInfo;
            hazInformation += Constants.INFO_MARKER_END;
            String description =
                    recRequest
                        .getString(tableName + Constants.DOT + Constants.DESCRIPTION_FLD_NAME);
            if (description.indexOf(Constants.INFO_MARKER_START) != -1) {
                description =
                        description.substring(0, description.indexOf(Constants.INFO_MARKER_START));
            }
            description += hazInformation;
            recRequest.setValue("activity_log.description", description);
            // save current record
            final DataRecord newRec = dsActivityLog.saveRecord(recRequest);
            final int requestId =
                    newRec.getInt(tableName + Constants.DOT + Constants.ACTIVITY_LOG_ID);
            recRequest = dsActivityLog.getRecord("activity_log.activity_log_id = " + requestId);
            
            final ServiceRequestHandler servReqHandler = new ServiceRequestHandler();
            servReqHandler.submitServiceRequest(String.valueOf(requestId));
            
            status.setCurrentNumber(counter++);
        }
        
        status.setCurrentNumber(totalNo);
        status.setCode(JobStatus.JOB_COMPLETE);
    }
    
    /**
     * Get hazard info string for selected assessment.
     * 
     * @param pKey assessment id.
     * @return hazard information
     */
    public String getAssessmentHazInfo(final String pKey) {
        final String hazAssessInfo = getAssessmentInfo(Integer.valueOf(pKey));
        final String hazPlacesInfo = getHcmPlacesInfo(Integer.valueOf(pKey));
        String hazInformation = Constants.INFO_MARKER_START;
        hazInformation += hazAssessInfo;
        hazInformation += hazPlacesInfo;
        hazInformation += Constants.INFO_MARKER_END;
        return hazInformation;
    }
    
    /**
     * Get assessment item hazard info string.
     * 
     * @param activityLogId activity log id
     * @return string value
     */
    private String getAssessmentInfo(final int activityLogId) {
        String hazInfo = "";
        final String tableName = Constants.ACTIVITY_LOG_TABLE;
        final String[] fields =
                { Constants.PROB_TYPE, "hcm_loc_typ_id", "hcm_harea_id", "location", "lat", "lon",
                        "hcm_loc_notes", "hcm_haz_status_id", "hcm_id", "hcm_qty", "action_title",
                        "cb_units_id", "hcm_is_hazard", "hcm_pipe_cnt", "hcm_friable",
                        "hcm_fittings_num", "hcm_haz_rank_id", "hcm_class1_id", "hcm_class2_id",
                        "hcm_class3_id", "hcm_haz_rating_id", "hcm_cond_id", "cond_value",
                        "repair_type", "rec_action", "cause_type", "hcm_labeled" };
        final DataSource dsLocal = DataSourceFactory.createDataSourceForFields(tableName, fields);
        dsLocal
            .addRestriction(Restrictions.eq(tableName, Constants.ACTIVITY_LOG_ID, activityLogId));
        final DataRecord record = dsLocal.getRecord();
        final Context context = ContextStore.get();
        
        for (final String field : fields) {
            final String fieldName = tableName + "." + field;
            if (record.valueExists(fieldName)
                    && StringUtil.notNullOrEmpty(record.getValue(fieldName))) {
                final String fieldTitle = CleanBuildingMessages.getInfoFieldTitle(field, context);
                final String fieldValue = record.findField(fieldName).getLocalizedValue();
                hazInfo += "\r\n--" + fieldTitle + fieldValue;
            }
        }
        return hazInfo;
    }
    
    /**
     * Get hazard places info string.
     * 
     * @param activityLogId activity log id
     * @return info string
     */
    private String getHcmPlacesInfo(final int activityLogId) {
        String result = "\r\n" + CleanBuildingMessages.MESSAGE_AFFECTED_LOCATIONS;
        final String tableName = Constants.CB_HCM_PLACES_TABLE;
        final String[] fields =
                { Constants.ACTIVITY_LOG_ID, Constants.HCM_PLACES_ID, Constants.BUILDING_FLD_NAME,
                        Constants.FLOOR_FLD_NAME, Constants.ROOM_FLD_NAME };
        final DataSource dsLocal = DataSourceFactory.createDataSourceForFields(tableName, fields);
        dsLocal
            .addRestriction(Restrictions.eq(tableName, Constants.ACTIVITY_LOG_ID, activityLogId));
        dsLocal.addSort(Constants.HCM_PLACES_ID);
        final List<DataRecord> records = dsLocal.getRecords();
        for (final DataRecord rec : records) {
            result +=
                    rec.getString("cb_hcm_places.bl_id") + Constants.DASH
                            + rec.getString("cb_hcm_places.fl_id") + Constants.DASH
                            + rec.getString("cb_hcm_places.rm_id") + Constants.COMMA;
        }
        return result.substring(0, result.length() - 1);
    }
    
}
