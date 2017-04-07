package com.archibus.eventhandler.clean;

import java.util.*;

import com.archibus.context.ContextStore;
import com.archibus.datasource.data.DataRecord;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.*;
import com.archibus.jobmanager.JobStatus.JobResult;

/**
 * Clean Building Service.
 * 
 * @author Ioan Draghici
 * 
 *         <p>
 *         Suppress PMD.TooManyMethods warning.
 *         <p>
 *         Justification: This class contains public methods called from axvw.
 */
@SuppressWarnings({ "PMD.TooManyMethods" })
public class CleanBuildingService extends JobBase {
    /**
     * PERCENT.
     */
    private static final int PERCENT = 100;
    
    /**
     * Copy selected assessment items.
     * 
     * @param pKeys primary keys values for selected items
     * @param projectId project code
     * @param assessedBy assessed by user
     * @param assignedTo assigned to user
     */
    public void copyAssessmentItems(final List<String> pKeys, final String projectId,
            final String assessedBy, final String assignedTo) {
        final AssessmentHandler assessmentHandler = new AssessmentHandler();
        assessmentHandler.copyItems(pKeys, projectId, assessedBy, assignedTo, this.status);
    }
    
    /**
     * Copy items.
     * 
     * @param type item type ("action")
     * @param pKeys list of pkeys
     */
    public void copyItems(final String type, final List<String> pKeys) {
        // copy hazard items
        if (Constants.TYPE_ACTION_ITEM.equals(type)) {
            final ActionHandler actionHandler = new ActionHandler();
            actionHandler.copyItems(pKeys, this.status);
        }
    }
    
    /**
     * Copy a material sample and all its lab results to other assessment items on
     * CopyToOther button click.
     * 
     * @param sampleIdSource source sample id
     * @return new sample id
     */
    public void copySampleAndLabResultsToAssessmentItems(final String sampleIdSource,
    		final List<String> assessmentItems)
    {
    	final AssessmentHandler assessmentHandler = new AssessmentHandler();
    	assessmentHandler.copySampleAndLabResultsToAssessmentItems(
    			sampleIdSource, assessmentItems);
    }
     /* Copy sample and lab results from a material sample to another on CopyWithResults button
     * click.
     * 
     * @param sampleIdSource source sample id
     * @return new sample id
     */
    public String copySampleAndLabResults(final String sampleIdSource) {
        final AssessmentHandler assessmentHandler = new AssessmentHandler();
        return assessmentHandler.copySampleAndLabResults(sampleIdSource);
    }
    
    /**
     * WFR - AbRiskCleanBuilding-CleanBuildingService-exportXLS. Custom 2d cross-tab XLS report.
     * 
     * @param viewName - view name.
     * @param title - title.
     * @param dataSourceId - dataSourceId.
     * @param groupByFields - List<Map<String, String>>.
     * @param calculatedFields - List<Map<String, Object>>.
     * @param sortFields - List<Map<String, Object>>.
     * @param data - Map<String, Object> client-side dataSet json object.
     */
    public void exportXLS(final String viewName, final String title, final String dataSourceId,
            final List<Map<String, String>> groupByFields,
            final List<Map<String, Object>> calculatedFields,
            final List<Map<String, Object>> sortFields, final Map<String, Object> data) {
        
        this.status.setTotalNumber(PERCENT);
        this.status.setCurrentNumber(0);
        
        final ExportReport reportBuilder = new ExportReport();
        final JobResult result =
                reportBuilder.exportXLS(viewName, title, dataSourceId, groupByFields,
                    calculatedFields, sortFields, data);
        this.status.setResult(result);
        
        this.status.setCode(JobStatus.JOB_COMPLETE);
        this.status.setCurrentNumber(PERCENT);
    }
    
    /**
     * Generate action items from assessment.
     * 
     * @param record action data record
     * @param actionItems map with assessmentId, action id
     * @param assessmentIds list of selected assessments
     */
    public void generateActionRecsFromAssessments(final DataRecord record,
            final Map<String, String> actionItems, final List<String> assessmentIds) {
        final ActionHandler actionHandler = new ActionHandler();
        actionHandler
            .generateRecordsForAssessments(record, actionItems, assessmentIds, this.status);
    }
    
    /**
     * Generate Communications Log for assessment items.
     * 
     * @param assessmentIds list of assessment id's
     * @param comLogId current edited communication log
     * @param commLogs current communication logs that must be updated. Contains pairs assessmentId,
     *            commlogId
     */
    public void generateCommLogRecsFromAssessments(final List<String> assessmentIds,
            final String comLogId, final Map<String, String> commLogs) {
        final AssessmentHandler assessmentHandler = new AssessmentHandler();
        assessmentHandler.generateCommLogForItems(assessmentIds, comLogId, commLogs, this.status);
    }
    
    /**
     * Generate records WFR.
     * 
     * @param type page mode type, valid values: "assessment", "action", "request"
     * @param config configuration values (project, problem type and level)
     * @param locations list of locations
     * @param recFilter filter values record
     * @param recDefaults default values record
     * @param isCountOnly if is count only
     * @return number of new records
     */
    public int generateRecords(final String type, final Map<String, String> config,
            final List<String> locations, final Map<String, String> recFilter,
            final DataRecord recDefaults, final boolean isCountOnly) {
        final CommonsHandler commonsHandler = new CommonsHandler();
        // calculate number of new records
        final int recordNo = commonsHandler.calculateRecordsNo(type, config, locations, recFilter);
        // if is not count mode - generate records
        if (!isCountOnly && recordNo > 0) {
            commonsHandler.generateRecords(type, config, locations, recFilter, recDefaults,
                recordNo, this.status);
        }
        return recordNo;
    }
    
    /**
     * Generate Service Request from assessment items.
     * 
     * @param projectId selected project id
     * @param projProbType problem type of selected project
     * @param assessIds list with assessment id's.
     * @param defValue data record with some default values
     */
    public void generateServiceRecsFromAssessments(final String projectId,
            final String projProbType, final List<String> assessIds, final DataRecord defValue) {
        final AssessmentHandler assessmentHandler = new AssessmentHandler();
        assessmentHandler.generateServiceRequests(projectId, projProbType, assessIds, defValue,
            this.status);
    }
    
    /**
     * Generate Survey Records from parent items (actions or service request).
     * 
     * @param fromType parent type, valid values ("action", "request") - do we need this ?
     * @param pKeys parent primary keys
     * @param level on what level to generate.
     * @param defaultValue default values record
     * @param defaultLocations list of locations
     * @param isCountOnly true if is only to count the records to generate
     * @return number of new records
     */
    public int generateSurveyRecords(final String fromType, final List<String> pKeys,
            final String level, final DataRecord defaultValue, final List<String> defaultLocations,
            final boolean isCountOnly) {
        final ActionHandler actionHandler = new ActionHandler();
        final int noRecords =
                actionHandler.generateSurveyRecords(pKeys, level, defaultValue, defaultLocations,
                    this.status, isCountOnly);
        return noRecords;
    }
    
    /**
     * Get hazard info string for selected assessment.
     * 
     * @param pKey assessment id
     * @return description
     */
    public String getAssessmentHazInfo(final String pKey) {
        final AssessmentHandler assessmentHandler = new AssessmentHandler();
        return assessmentHandler.getAssessmentHazInfo(pKey);
    }
    
    /**
     * Check if exists valid license for activity.
     * 
     * @param activityId activity id
     * @return true if exists license for activity else false
     */
    public boolean isActivityLicense(final String activityId) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        return EventHandlerBase.isActivityLicenseEnabled(context, activityId);
    }
    
    /**
     * Update activity log items. Used for update assessment, action items and for assign items.
     * 
     * @param pKeys list of items that will be updated
     * @param record new values
     */
    public void updateItems(final List<String> pKeys, final DataRecord record) {
        
        final CommonsHandler commHandler = new CommonsHandler();
        commHandler.updateItems(pKeys, record);
    }
    
    /**
     * Validate settings for generate survey records action.
     * 
     * @param level user selected level
     * @param pKeys selected activity_log records
     * @return result string
     */
    public String validateSurveySettings(final String level, final List<String> pKeys) {
        final ActionHandler actionHandler = new ActionHandler();
        return actionHandler.validateSurveySettings(level, pKeys);
    }
}
