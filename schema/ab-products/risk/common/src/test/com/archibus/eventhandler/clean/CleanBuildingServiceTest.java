package com.archibus.eventhandler.clean;

import java.text.ParseException;
import java.util.*;

import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;

/**
 * Test methods for clean building activity.
 * 
 * @author Ioan Draghici
 * 
 */
public class CleanBuildingServiceTest extends DataSourceTestBase {
    /**
     * class handler.
     */
    final CleanBuildingService cleanBuildingService = new CleanBuildingService();
    
    /**
     * Create two clean building assessment projects if don't exists in database.
     * 
     */
    public void testCreateAssessmentProjects() {
        
        final String dbTable = "project";
        final String[] dbFields =
                { "project_id", "status", "project_type", "date_start", "date_end", "contact_id",
                        "description", "prob_type" };
        final DataSource dsLocal = DataSourceFactory.createDataSourceForFields(dbTable, dbFields);
        // add first project
        if (!recordExist(dbTable, "project_id", "ASBESTOS-MARKET-HQ-001")) {
            final DataRecord recSample = dsLocal.createNewRecord();
            
            recSample.setValue("project.project_id", "ASBESTOS-MARKET-HQ-001");
            recSample.setValue("project.status", "CREATED");
            recSample.setValue("project.project_type", "ASSESSMENT - HAZMAT");
            recSample.setValue("project.date_start", java.sql.Date.valueOf("2011-01-30"));
            recSample.setValue("project.date_end", java.sql.Date.valueOf("2021-01-30"));
            recSample.setValue("project.contact_id", "ALLIED");
            recSample.setValue("project.description", "Asbestos substance in HQ building");
            recSample.setValue("project.prob_type", "HAZMAT-SUB|ASBESTOS");
            dsLocal.saveRecord(recSample);
        }
        // add second project
        if (!recordExist(dbTable, "project_id", "MOLD-MARKET-HQ-001")) {
            final DataRecord recSample = dsLocal.createNewRecord();
            recSample.setValue("project.project_id", "MOLD-MARKET-HQ-001");
            recSample.setValue("project.status", "CREATED");
            recSample.setValue("project.project_type", "ASSESSMENT - HAZMAT");
            recSample.setValue("project.date_start", java.sql.Date.valueOf("2011-01-30"));
            recSample.setValue("project.date_end", java.sql.Date.valueOf("2021-01-30"));
            recSample.setValue("project.contact_id", "A-DRAKE");
            recSample.setValue("project.description", "Mold substance in HQ building");
            recSample.setValue("project.prob_type", "HAZMAT-SUB|MOLD");
            dsLocal.saveRecord(recSample);
        }
        
        // force commit for JUnit
        SqlUtils.commit();
    }
    
    /**
     * Generate assessment records.
     */
    public void testGenerateAssessmentRecord() {
        final String type = "assessment";
        // config object
        final Map<String, String> config = new HashMap<String, String>();
        config.put("level", "fl");
        config.put("probType", "HAZMAT-SUB|ASBESTOS");
        config.put("project", "ASBESTOS-MARKET-HQ-001");
        // location
        final List<String> location = new ArrayList<String>();
        location.add("AIR DUCT");
        location.add("CEILING");
        location.add("ELEVATOR SHAFT");
        location.add("FLOOR");
        // filter
        final Map<String, String> filter = new HashMap<String, String>();
        filter.put("bl.site_id", "MARKET");
        filter.put("rm.dp_id", "DISTRIBUTION#MARKETING#ENGINEERING");
        filter.put("rm.dv_id", "ELECTRONIC SYS.#EXECUTIVE");
        
        final DataRecord defaults = new DataRecord();
        
        final CleanBuildingService cleanBuildingService = new CleanBuildingService();
        // when is count mode only
        final int calcRecordNo =
                cleanBuildingService
                    .generateRecords(type, config, location, filter, defaults, true);
        
        System.out.println("Calculated assessments number: [ " + calcRecordNo + " ]");
        
        // create assessment records
        
        final int genRecordsNo =
                cleanBuildingService.generateRecords(type, config, location, filter, defaults,
                    false);
        
        // force commit for JUnit
        SqlUtils.commit();
        
        System.out.println("Created assessments number: [ " + genRecordsNo + " ]");
        
    }
    
    /**
     * Update selected items.
     * 
     * @throws ParseException json parse Exception
     */
    public void testUpdateSelection() throws ParseException {
        
        final List<String> pKeys = Arrays.asList("834", "836", "838");
        final String table = "activity_log";
        final String[] fields =
                { "cond_priority", "cond_value", "date_assessed", "date_installed", "date_review",
                        "date_scheduled", "hcm_class1_id", "hcm_class2_id", "hcm_class3_id",
                        "hcm_cond_id", "hcm_haz_rank_id", "hcm_haz_rating_id", "hcm_haz_status_id",
                        "rec_action", "repair_type", "status" };
        final DataSource dsLocal = DataSourceFactory.createDataSourceForFields(table, fields);
        final DataRecord defaults = dsLocal.createNewRecord();
        defaults.setValue("activity_log.cond_priority", "0");
        defaults.setValue("activity_log.cond_value", "0");
        defaults.setValue("activity_log.date_assessed", "2011-06-21");
        defaults.setValue("activity_log.date_installed", "");
        defaults.setValue("activity_log.date_review", "2011-06-30");
        defaults.setValue("activity_log.date_scheduled", "2011-06-02");
        defaults.setValue("activity_log.hcm_class1_id", "");
        defaults.setValue("activity_log.hcm_class2_id", "");
        defaults.setValue("activity_log.hcm_class3_id", "");
        defaults.setValue("activity_log.hcm_haz_rating_id", "LEVEL IV");
        defaults.setValue("activity_log.hcm_haz_status_id", "");
        defaults.setValue("activity_log.rec_action", "0");
        defaults.setValue("activity_log.repair_type", "");
        defaults.setValue("activity_log.status", "PLANNED");
        
        this.cleanBuildingService.updateItems(pKeys, defaults);
        // force commit for JUnit
        SqlUtils.commit();
    }
    
    /**
     * Copy assessment items.
     */
    public void testCopyAssessmentItems() {
        final List<String> pKeys = Arrays.asList("832", "796", "797", "798");
        final String projectId = "MOLD-MARKET-HQ-001";
        final String assessedBy = "CARLO";
        final String assignedTo = "AFM";
        
        this.cleanBuildingService.copyAssessmentItems(pKeys, projectId, assessedBy, assignedTo);
        // force commit for JUnit
        SqlUtils.commit();
        
    }
    
    /**
     * Create communications logs from asssessment items.
     */
    public void testGeneratCommlogFromAssessment() {
        final List<String> assessmentIds = Arrays.asList("832", "796", "797", "798");
        final String commLogId = "33";
        final Map<String, String> commLogs = new HashMap<String, String>();
        commLogs.put("832", "33");
        
        this.cleanBuildingService.generateCommLogRecsFromAssessments(assessmentIds, commLogId,
            commLogs);
        // force commit for JUnit
        SqlUtils.commit();
        
    }
    
    public void testGenerateServReqFromAssess() {
        final List<String> assessmentIds = Arrays.asList("640", "641", "642", "645");
        final String tableName = "activity_log";
        final String[] fields =
                { "assessed_by", "assigned_to", "date_required", "description", "hcm_abate_by",
                        "phone_requestor", "priority", "prob_type", "requestor" };
        final DataSource dsLocal = DataSourceFactory.createDataSourceForFields(tableName, fields);
        final DataRecord defValues = dsLocal.createNewRecord();
        defValues.setValue("activity_log.assessed_by", "AFM");
        defValues.setValue("activity_log.assigned_to", "ABBOT, PAUL");
        defValues.setValue("activity_log.date_required", java.sql.Date.valueOf("2011-06-30"));
        defValues.setValue("activity_log.description",
            "Test add nw service request from assessment");
        defValues.setValue("activity_log.hcm_abate_by", "A-DRAKE");
        defValues.setValue("activity_log.phone_requestor", "");
        defValues.setValue("activity_log.priority", Integer.valueOf("3"));
        defValues.setValue("activity_log.prob_type", "HAZMAT-SUB|ASBESTOS");
        defValues.setValue("activity_log.requestor", "AFM");
        
        final String projectId = "";
        final String probType = "HAZMAT-SUB|ASBESTOS";
        
        this.cleanBuildingService.generateServiceRecsFromAssessments(projectId, probType,
            assessmentIds, defValues);
        // force commit for JUnit
        SqlUtils.commit();
        
    }
    
    /**
     * Check if a specific record already exists in database.
     * 
     * @param table db table name
     * @param field db field name
     * @param value field value
     * @return true if record exist , false if not
     */
    private boolean recordExist(final String table, final String field, final Object value) {
        final DataSource dsLocal = DataSourceFactory.createDataSource();
        dsLocal.addTable(table);
        dsLocal.addField(field);
        dsLocal.addRestriction(Restrictions.eq(table, field, value));
        return !dsLocal.getRecords().isEmpty();
    }
    
}
