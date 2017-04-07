package com.archibus.eventhandler.Moves;

import java.io.File;
import java.text.SimpleDateFormat;
import java.util.*;

import com.archibus.context.*;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.*;
import com.archibus.datasource.restriction.Restrictions.Restriction.Clause;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.ext.report.*;
import com.archibus.jobmanager.*;
import com.archibus.jobmanager.JobStatus.JobResult;
import com.archibus.utility.StringUtil;

public class MovePaginatedReportGenerator extends JobBase {
    /*
     * type of reports that will be generated valid valued 'group', 'single', 'scenario'
     */
    private final String rptType;
    
    /*
     * selected move project
     */
    private final String projectId;
    
    /*
     * selected move id , used for single move
     */
    private String moveId;
    
    /*
     * selected scenario id, used with projectId for group move
     */
    private String scenarioId;
    
    private String viewName;
    
    // current move types
    private final String[] moKeys = { "project", "Employee", "New Hire", "Leaving", "Equipment",
            "Asset", "Room", "action" };
    
    // map with data for each type of report: file name and main datasource id
    private final Map<String, Map<String, String>> moData =
            new HashMap<String, Map<String, String>>() {
                {
                    put("project", new HashMap<String, String>() {
                        {
                            put("file", "ab-mo-move-project-rpt.axvw");
                            put("ds", "ds_abMoveProject_project");
                            put("type", "group");
                        }
                    });
                    put("Employee", new HashMap<String, String>() {
                        {
                            put("file", "ab-mo-move-em-rpt.axvw");
                            put("ds", "ds_abMoveEm_em");
                            put("type", "Employee");
                        }
                    });
                    put("New Hire", new HashMap<String, String>() {
                        {
                            put("file", "ab-mo-move-new-hire-rpt.axvw");
                            put("ds", "ds_abMoveHire_em");
                            put("type", "New Hire");
                        }
                    });
                    put("Leaving", new HashMap<String, String>() {
                        {
                            put("file", "ab-mo-move-em-leaving-rpt.axvw");
                            put("ds", "ds_abMoveLeaving_em");
                            put("type", "Leaving");
                        }
                    });
                    put("Equipment", new HashMap<String, String>() {
                        {
                            put("file", "ab-mo-move-eq-rpt.axvw");
                            put("ds", "ds_abMoveEq_eq");
                            put("type", "Equipment");
                        }
                    });
                    put("Asset", new HashMap<String, String>() {
                        {
                            put("file", "ab-mo-move-asset-rpt.axvw");
                            put("ds", "ds_abMoveAsset_asset");
                            put("type", "Asset");
                        }
                    });
                    put("Room", new HashMap<String, String>() {
                        {
                            put("file", "ab-mo-move-rm-rpt.axvw");
                            put("ds", "ds_abMoveRoom_rm");
                            put("type", "Room");
                        }
                    });
                    put("action", new HashMap<String, String>() {
                        {
                            put("file", "ab-mo-move-action-rpt.axvw");
                            put("ds", "ds_abMoveAction_action");
                            put("type", "single");
                        }
                    });
                }
            };
    
    // @translatable
    private final String DOC_TITLE_GP = "Group Move";
    
    // @translatable
    private final String JOB_TITLE_GP = "Group Moves";
    
    // @translatable
    private final String DOC_TITLE_SINGLE = "Individual Move";
    
    // @translatable
    private final String JOB_TITLE_SINGLE = "Individual Move";
    
    // @translatable
    private final String DOC_TITLE_SCENARIO = "Move Scenario";
    
    // @translatable
    private final String JOB_TITLE_SCENARIO = "Move Scenario";
    
    public MovePaginatedReportGenerator(final String rptType, final String projectId,
            final String selectedId) {
        this.rptType = rptType;
        this.projectId = projectId;
        if (this.rptType.equals("single")) {
            this.moveId = selectedId;
        } else if (this.rptType.equals("scenario")) {
            this.scenarioId = selectedId;
        }
        
    }
    
    @Override
    public void run() {
        final PaginatedReportsBuilder builder = new PaginatedReportsBuilder();
        final List<String> files = new ArrayList<String>();
        final Context context = ContextStore.get();
        final Date currentDate = new Date();
        final SimpleDateFormat dateFormat = new SimpleDateFormat();
        dateFormat.applyPattern("yyMMddHHmmss");
        final String dateString = dateFormat.format(currentDate);
        String fileName = "";
        String jobTitle = "";
        
        int counter;
        if ((this.rptType.equals("group") && StringUtil.notNullOrEmpty(this.projectId))
                || (this.rptType.equals("single") && StringUtil.notNullOrEmpty(this.moveId))) {
            counter = 1;
            for (final String crtKey : this.moKeys) {
                final Map<String, String> crtData = this.moData.get(crtKey);
                final String moType = crtData.get("type");
                boolean generate = false;
                String strRestriction = null;
                if (this.rptType.equals("group")) {
                    fileName = "move-management-group-moves-";
                    jobTitle =
                            EventHandlerBase.localizeString(context.getEventHandlerContext(),
                                this.JOB_TITLE_GP, this.getClass().getName());
                    generate =
                            isData(crtKey, this.projectId, this.moveId) && !moType.equals("single");
                    if (moType.equals("group")) {
                        // information shown from project table
                        strRestriction =
                                " project.project_id = '"
                                        + SqlUtils.makeLiteralOrBlank(this.projectId) + "' "
                                        + "AND project.project_type = 'Move' ";
                    } else {
                        // information shown from mo table
                        strRestriction =
                                " mo.project_id = '" + SqlUtils.makeLiteralOrBlank(this.projectId)
                                        + "' " + "AND mo.mo_type = '"
                                        + SqlUtils.makeLiteralOrBlank(moType) + "'";
                    }
                } else if (this.rptType.equals("single")) {
                    final String moveType = getIndividualMoveType(this.moveId);
                    jobTitle =
                            EventHandlerBase.localizeString(context.getEventHandlerContext(),
                                this.JOB_TITLE_SINGLE, this.getClass().getName());
                    fileName = "move-management-individual-move-";
                    generate =
                            isData(crtKey, this.projectId, this.moveId)
                                    && (moveType.equals(moType) || moType.equals("single"));
                    if (moType.equals("single")) {
                        // information shown from activity_log table
                        strRestriction =
                                " activity_log.mo_id = '"
                                        + SqlUtils.makeLiteralOrBlank(this.moveId) + "' "
                                        + "AND activity_log.project_id IS NULL ";
                    } else {
                        // information shown from mo table
                        strRestriction =
                                " mo.mo_id = '" + SqlUtils.makeLiteralOrBlank(this.moveId) + "' "
                                        + "AND mo.mo_type = '"
                                        + SqlUtils.makeLiteralOrBlank(moType) + "'";
                    }
                }
                if (generate) {
                    this.viewName = crtData.get("file");
                    final Map<String, Object> moRestriction = new HashMap<String, Object>();
                    moRestriction.put(crtData.get("ds"), strRestriction);
                    final com.archibus.ext.report.docx.Report report =
                            new com.archibus.ext.report.docx.Report();
                    if (this.rptType.equals("group")) {
                        report
                            .setTitle(EventHandlerBase.localizeString(context
                                .getEventHandlerContext(), this.DOC_TITLE_GP, this.getClass()
                                .getName())
                                    + " : " + this.projectId);
                    } else {
                        report.setTitle(EventHandlerBase.localizeString(context
                            .getEventHandlerContext(), this.DOC_TITLE_SINGLE, this.getClass()
                            .getName()));
                    }
                    report.setFilename(fileName + crtKey + "-" + counter + "-" + dateString
                            + ".docx");
                    report.setRestrictions(moRestriction);
                    builder.buildDocxFromView(context, report, this.viewName, null);
                    files.add(report.getFileFullName());
                    counter++;
                }
            }
        } else if (this.rptType.equals("scenario") && StringUtil.notNullOrEmpty(this.scenarioId)
                && StringUtil.notNullOrEmpty(this.projectId)) {
            this.viewName = "ab-mo-move-scenario-rpt.axvw";
            jobTitle =
                    EventHandlerBase.localizeString(context.getEventHandlerContext(),
                        this.JOB_TITLE_SCENARIO, this.getClass().getName());
            fileName = "move-management-move-scenario-";
            final String strRestriction =
                    " AND mo_scenario_em.project_id = '"
                            + SqlUtils.makeLiteralOrBlank(this.projectId) + "' "
                            + "AND mo_scenario_em.scenario_id = '"
                            + SqlUtils.makeLiteralOrBlank(this.scenarioId) + "'";
            final Map<String, Object> moRestriction = new HashMap<String, Object>();
            moRestriction.put("drawPanelRest", strRestriction);
            final com.archibus.ext.report.docx.Report report =
                    new com.archibus.ext.report.docx.Report();
            report.setTitle(EventHandlerBase.localizeString(context.getEventHandlerContext(),
                this.DOC_TITLE_SCENARIO, this.getClass().getName())
                    + " : "
                    + this.scenarioId
                    + " ; " + this.projectId);
            report.setFilename(fileName + "1-" + dateString + ".docx");
            report.setPatameters(moRestriction);
            builder.buildDocxFromView(context, report, this.viewName, null);
            files.add(report.getFileFullName());
        }
        
        if (files.size() > 0) {
            // merging files into one file
            final String mainFileName = fileName + dateString + ".docx";
            final String finalFileFullname =
                    ReportUtility.getReportFilesStorePath(context) + mainFileName;
            ReportUtility.appendDocxFiles(files, finalFileFullname);
            this.status.setResult(new JobResult(jobTitle, mainFileName, context.getContextPath()
                    + ReportUtility.getPerUserReportFilesPath(context) + mainFileName));
            
            // delete partial results to save space on hd
            for (final String fullPath : files) {
                final File crtFile = new File(fullPath);
                if (crtFile.exists()) {
                    crtFile.delete();
                }
            }
        }
        
        this.status.setCode(JobStatus.JOB_COMPLETE);
    }
    
    /*
     * check if exist data for current report/partial report
     */
    private boolean isData(final String moKey, final String projectId, final String moId) {
        if (!moKey.equals("project") && !moKey.equals("action")) {
            Clause idClause = null;
            if (StringUtil.notNullOrEmpty(projectId)) {
                idClause = Restrictions.eq("mo", "project_id", projectId);
            } else if (StringUtil.notNullOrEmpty(moId)) {
                idClause = Restrictions.eq("mo", "mo_id", moId);
            }
            final DataSource ds = DataSourceFactory.createDataSource();
            ds.addTable("mo");
            ds.addField("mo", "project_id");
            ds.addField("mo", "mo_type");
            ds.addField("mo", "mo_id");
            ds.addRestriction(Restrictions.and(idClause, Restrictions.eq("mo", "mo_type", moKey)));
            final List records = ds.getRecords();
            return (!records.isEmpty());
            
        } else if (moKey.equals("action") && StringUtil.notNullOrEmpty(moId)) {
            final DataSource ds = DataSourceFactory.createDataSource();
            ds.addTable("activity_log");
            ds.addField("activity_log", "activity_log_id");
            ds.addField("activity_log", "mo_id");
            ds.addRestriction(Restrictions.eq("activity_log", "mo_id", moId));
            final List records = ds.getRecords();
            return (!records.isEmpty());
            
        }
        return true;
    }
    
    /*
     * return type of individual move
     */
    private String getIndividualMoveType(final String moveId) {
        final DataSource ds = DataSourceFactory.createDataSource();
        ds.addTable("mo");
        ds.addField("mo", "mo_type");
        ds.addField("mo", "mo_id");
        ds.addRestriction(Restrictions.eq("mo", "mo_id", moveId));
        final DataRecord rec = ds.getRecord();
        return rec.getString("mo.mo_type");
    }
}
