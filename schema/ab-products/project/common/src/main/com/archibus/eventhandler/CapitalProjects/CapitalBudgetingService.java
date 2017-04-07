package com.archibus.eventhandler.CapitalProjects;

import java.util.*;

import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.jobmanager.*;
import com.archibus.service.*;
import com.archibus.service.DocumentService.DocumentParameters;
import com.archibus.utility.*;

/**
 * Provide methods for the Capital Project Management Activity.
 * <p>
 * <li/><b>createProject</b> - Create new Project.
 * </p>
 * <br/>
 * 
 * @author Kaori Emery
 * 
 */
public class CapitalBudgetingService extends JobBase {
    static final String[] ACTIVITYLOG_FIELDS = { "activity_log_id", "project_id", "work_pkg_id",
            "action_title", "activity_type", "cost_estimated", "cost_est_cap",
            "duration_est_baseline", "duration", "hours_est_baseline", "hours_est_design",
            "wbs_id", "description", "date_planned_for", "date_scheduled", "doc" };
    
    static final String ACTIVITYLOG_TABLE = "activity_log";
    
    /**
     * Table fields.
     */
    static final String[] PROJECT_FIELDS = { "project_id", "project_name", "project_type",
            "date_start", "date_end", "dept_contact", "phone_dept_contact", "bl_id", "site_id",
            "requestor", "phone_req", "contact_id", "is_template", "summary", "description",
            "benefit", "scope", "duration_est", "days_per_week", "cost_budget" };
    
    static final String PROJECT_TABLE = "project";
    
    static final String[] WORKPKG_FIELDS = { "project_id", "work_pkg_id", "summary", "description",
            "days_per_week", "date_est_start", "date_est_end" };
    
    static final String WORKPKG_TABLE = "work_pkgs";
    
    /**
     * Job Status Message.
     */
    // @translatable
    private static final String MESSAGE_FAILED_RETRIEVE_RECORDS = "Failed to retrieve data records";
    
    /**
     * Copy document from template project or action
     * 
     * @param targetDocId id of new project or action
     * @param srcDocId id of template project or action with document
     */
    public void copyDocumentFromTemplate(final String docTable, final String docField,
            final String primaryKeyField, final String srcDocId, final String targetDocId) {
        
        final String[] docFields = { primaryKeyField, docField };
        final DataSource ds = DataSourceFactory.createDataSourceForFields(docTable, docFields);
        ds.addRestriction(Restrictions.eq(docTable, primaryKeyField, srcDocId));
        final DataRecord srcDocRecord = ds.getRecord();
        final String fileName = srcDocRecord.getString(docTable + "." + docField);
        
        final Map<String, String> srcKeys = new HashMap<String, String>();
        srcKeys.put(primaryKeyField, srcDocId);
        final DocumentParameters srcDocParam =
                new DocumentParameters(srcKeys, docTable, docField, null, true);
        final Map<String, String> targetKeys = new HashMap<String, String>();
        targetKeys.put(primaryKeyField, targetDocId);
        final DocumentParameters targetDocParam =
                new DocumentParameters(targetKeys, docTable, docField, fileName, null, "0");
        
        final DocumentService documentService =
                (DocumentService) ContextStore.get().getBean("documentService");
        documentService.copyDocument(srcDocParam, targetDocParam);
        
    }
    
    /**
     * Copy project documents from template project
     * 
     * @param targetDocId project_id of new project
     * @param srcDocId project_id of template project with documents
     */
    public void copyProjectDocuments(final String srcDocId, final String targetDocId) {
        final String[] projFields =
                { "doc", "doc_risk_mgmt", "doc_charter", "doc_impl_plan", "project_id" };
        final DataSource ds = DataSourceFactory.createDataSourceForFields("project", projFields);
        ds.addRestriction(Restrictions.eq("project", "project_id", srcDocId));
        final DataRecord srcDocRecord = ds.getRecord();
        
        for (int i = 0; i < 4; i++) {
            final String docField = projFields[i];
            final String fileName = srcDocRecord.getString("project." + docField);
            if (StringUtil.notNullOrEmpty(fileName)) {
                copyDocumentFromTemplate("project", docField, "project_id", srcDocId, targetDocId);
            }
        }
    }
    
    /**
     * Copy template project, work packages and actions. Copy project and action documents.
     * 
     * @param project_id_template String project_id of template project
     * @param project_id_destination String project_id of new project
     * @param isNewProject boolean true if new project
     */
    
    public void copyTemplateProject(final String project_id_template,
            final String project_id_destination, final boolean isNewProject) {
        
        try {
            final DataSource actionDs =
                    DataSourceFactory.createDataSourceForFields(ACTIVITYLOG_TABLE,
                        ACTIVITYLOG_FIELDS);
            actionDs.addRestriction(Restrictions.eq(ACTIVITYLOG_TABLE, "project_id",
                project_id_template));
            final List<DataRecord> actionTemplateRecords = actionDs.getRecords();
            final int totalNumber =
                    (actionTemplateRecords.size() > 0) ? actionTemplateRecords.size() : 100;
            this.status.setTotalNumber(totalNumber);
            this.status.setCode(JobStatus.JOB_STARTED);
            this.status.setCurrentNumber(0);
            
            if (this.status.isStopRequested()) {
                this.status.setCode(JobStatus.JOB_STOPPED);
            } else {
                final DataSource projectDs =
                        DataSourceFactory.createDataSourceForFields(PROJECT_TABLE, PROJECT_FIELDS);
                projectDs.addRestriction(Restrictions.eq(PROJECT_TABLE, "project_id",
                    project_id_template));
                final DataRecord projectTemplateRecord = projectDs.getRecord();
                
                projectDs.clearRestrictions();
                projectDs.addRestriction(Restrictions.eq(PROJECT_TABLE, "project_id",
                    project_id_destination));
                final DataRecord projectDestinationRecord = projectDs.getRecord();
                
                if (isNewProject) {
                    projectDestinationRecord.setValue("project.summary",
                        projectTemplateRecord.getValue("project.summary"));
                    projectDestinationRecord.setValue("project.description",
                        projectTemplateRecord.getValue("project.description"));
                    projectDestinationRecord.setValue("project.benefit",
                        projectTemplateRecord.getValue("project.benefit"));
                    projectDestinationRecord.setValue("project.scope",
                        projectTemplateRecord.getValue("project.scope"));
                    projectDestinationRecord.setValue("project.duration_est",
                        projectTemplateRecord.getValue("project.duration_est"));
                    projectDestinationRecord.setValue("project.days_per_week",
                        projectTemplateRecord.getValue("project.days_per_week"));
                    projectDestinationRecord.setValue("project.cost_budget",
                        projectTemplateRecord.getValue("project.cost_budget"));
                    projectDs.saveRecord(projectDestinationRecord);
                    projectDs.commit();
                    
                    copyProjectDocuments(project_id_template, project_id_destination);
                }
                
                final DataSource workpkgDs =
                        DataSourceFactory.createDataSourceForFields(WORKPKG_TABLE, WORKPKG_FIELDS);
                workpkgDs.addRestriction(Restrictions.eq(WORKPKG_TABLE, "project_id",
                    project_id_template));
                final List<DataRecord> workpkgTemplateRecords = workpkgDs.getRecords();
                for (final DataRecord workpkgTemplateRecord : workpkgTemplateRecords) {
                    workpkgDs.clearRestrictions();
                    final DataRecord workpkgRecord = workpkgDs.createNewRecord();
                    workpkgRecord.setValue("work_pkgs.project_id", project_id_destination);
                    workpkgRecord.setValue("work_pkgs.work_pkg_id",
                        workpkgTemplateRecord.getValue("work_pkgs.work_pkg_id"));
                    workpkgRecord.setValue("work_pkgs.summary",
                        workpkgTemplateRecord.getValue("work_pkgs.summary"));
                    workpkgRecord.setValue("work_pkgs.description",
                        workpkgTemplateRecord.getValue("work_pkgs.description"));
                    workpkgRecord.setValue("work_pkgs.days_per_week",
                        workpkgTemplateRecord.getValue("work_pkgs.days_per_week"));
                    workpkgRecord.setValue("work_pkgs.date_est_start",
                        projectDestinationRecord.getValue("project.date_start"));
                    workpkgRecord.setValue("work_pkgs.date_est_end",
                        projectDestinationRecord.getValue("project.date_end"));
                    workpkgDs.saveRecord(workpkgRecord);
                    workpkgDs.commit();
                }
                int i = 0;
                for (final DataRecord actionTemplateRecord : actionTemplateRecords) {
                    actionDs.clearRestrictions();
                    DataRecord actionRecord = actionDs.createNewRecord();
                    actionRecord.setValue("activity_log.project_id", project_id_destination);
                    actionRecord.setValue("activity_log.work_pkg_id",
                        actionTemplateRecord.getValue("activity_log.work_pkg_id"));
                    actionRecord.setValue("activity_log.action_title",
                        actionTemplateRecord.getValue("activity_log.action_title"));
                    actionRecord.setValue("activity_log.activity_type",
                        actionTemplateRecord.getValue("activity_log.activity_type"));
                    actionRecord.setValue("activity_log.cost_estimated",
                        actionTemplateRecord.getValue("activity_log.cost_estimated"));
                    actionRecord.setValue("activity_log.cost_est_cap",
                        actionTemplateRecord.getValue("activity_log.cost_est_cap"));
                    actionRecord.setValue("activity_log.duration_est_baseline",
                        actionTemplateRecord.getValue("activity_log.duration_est_baseline"));
                    actionRecord.setValue("activity_log.duration",
                        actionTemplateRecord.getValue("activity_log.duration"));
                    actionRecord.setValue("activity_log.hours_est_baseline",
                        actionTemplateRecord.getValue("activity_log.hours_est_baseline"));
                    actionRecord.setValue("activity_log.hours_est_design",
                        actionTemplateRecord.getValue("activity_log.hours_est_design"));
                    actionRecord.setValue("activity_log.wbs_id",
                        actionTemplateRecord.getValue("activity_log.wbs_id"));
                    actionRecord.setValue("activity_log.description",
                        actionTemplateRecord.getValue("activity_log.description"));
                    actionRecord.setValue("activity_log.date_planned_for",
                        projectDestinationRecord.getValue("project.date_start"));
                    actionRecord.setValue("activity_log.date_scheduled",
                        projectDestinationRecord.getValue("project.date_start"));
                    actionRecord = actionDs.saveRecord(actionRecord);
                    actionDs.commit();
                    final String fileName = actionTemplateRecord.getString("activity_log.doc");
                    if (StringUtil.notNullOrEmpty(fileName)) {
                        copyDocumentFromTemplate(ACTIVITYLOG_TABLE, "doc", "activity_log_id", ""
                                + actionTemplateRecord.getValue("activity_log.activity_log_id"), ""
                                + actionRecord.getValue("activity_log.activity_log_id"));
                    }
                    this.status.setCurrentNumber(++i);
                }
                this.status.setCurrentNumber(totalNumber);
                this.status.setCode(JobStatus.JOB_COMPLETE);
            }
        } catch (final ExceptionBase e) {
            this.status.setCode(JobStatus.JOB_FAILED);
            // @non-translatable
            throw new ExceptionBase(MESSAGE_FAILED_RETRIEVE_RECORDS, e);
        }
    }
    
    /**
     * Create new Project
     * <ul>
     * <li/>Save Project with auto-generated Project Code.
     * </ul>
     * 
     * @param recProject project data record
     * @return recProject with primary key value
     */
    public DataRecord createProject(final DataRecord recProject) {
        final DataSource dsProject =
                DataSourceFactory.createDataSourceForFields(PROJECT_TABLE, PROJECT_FIELDS);
        dsProject.setApplyVpaRestrictions(false);
        
        final String projectCode = generateProjectCode(dsProject);
        recProject.setValue("project.project_id", projectCode);
        dsProject.saveRecord(recProject);
        return recProject;
    }
    
    /**
     * Generate new Project Code
     * <ul>
     * <li/>Generate new Project Code using the following format: 2012-000001
     * </ul>
     * 
     * @param dsProject project data source
     * @return new Project Code
     */
    private String generateProjectCode(final DataSource dsProject) {
        final int year = Calendar.getInstance().get(Calendar.YEAR);
        String clause = "";
        if (SqlUtils.isOracle()) {
            clause =
                    "project_id=(SELECT MAX(project_id) FROM project WHERE REGEXP_LIKE(project_id, '"
                            + year + "-" + "[0-9]{6}'))";
        } else {
            clause =
                    "project_id=(SELECT MAX(project_id) FROM project WHERE project_id LIKE '"
                            + year + "-" + "[0-9][0-9][0-9][0-9][0-9][0-9]')";
        }
        dsProject.addRestriction(Restrictions.sql(clause));
        
        final DataRecord recProjectMax = dsProject.getRecord();
        String maxProjCode = "";
        if (recProjectMax != null) {
            maxProjCode = (String) recProjectMax.getValue("project.project_id");
        }
        dsProject.clearRestrictions();
        
        String counter = "";
        if (maxProjCode.equals("")) {
            counter = "000001";
        } else {
            counter = String.valueOf(Integer.parseInt(maxProjCode.substring(5, 11)) + 1);
            int length = counter.length();
            while (length < 6) {
                counter = "0" + counter;
                length++;
            }
        }
        return year + "-" + counter;
    }
}
