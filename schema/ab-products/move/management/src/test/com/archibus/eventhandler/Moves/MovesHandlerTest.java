package com.archibus.eventhandler.Moves;

import java.text.ParseException;
import java.util.*;

import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;

public class MovesHandlerTest extends DataSourceTestBase {
    
    MovesHandler handler = new MovesHandler();
    
    /**
     * calculate employee headcount
     * 
     * scheduled job that runs on first days of each month and fill hist_em_count table
     */
    public void testCalculateEmployeeHeadcount() {
        this.handler.calculateHistoricalEmployeeHeadcount();
    }
    
    /*
     * MOVE SCENARIO
     */
    /**
     * Create Move Scenario
     * 
     * dataRecord with project_id and scenario_id isDefault true if is the default scenario created
     * by the app, false otherwise
     */
    
    public void testCreateMoveScenario() {
        DataSource ds = DataSourceFactory.createDataSourceForFields("mo_scenario", new String[] {
                "project_id", "scenario_id" });
        DataRecord record = ds.createNewRecord();
        record.setValue("mo_scenario.project_id", "MARKETING MOVE");
        record.setValue("mo_scenario.scenario_id", "Scenario 2");
        boolean isDefault = false;
        
        this.handler.createMoveScenario(record, isDefault);
    }
    
    /**
     * Copy Move Scenario
     */
    public void testCopyMoveScenario() {
        DataSource ds = DataSourceFactory.createDataSourceForFields("mo_scenario", new String[] {
                "project_id", "scenario_id" });
        DataRecord record = ds.createNewRecord();
        record.setValue("mo_scenario.project_id", "MARKETING MOVE");
        record.setValue("mo_scenario.scenario_id", "Scenario 2");
        String origScenarioId = "Scenario 1";
        
        this.handler.copyMoveScenario(record, origScenarioId);
    }
    
    /**
     * Delete Move Scenario
     */
    public void testDeleteMoveScenario() {
        String scenarioId = "Scenario 2";
        String projectId = "MARKETING MOVE";
        
        this.handler.deleteMoveScenario(scenarioId, projectId);
    }
    
    public void testUpdateMoveProject() {
        String scenarioId = "Scenario 1";
        String projectId = "MARKETING MOVE";
        
        this.handler.updateMoveProject(projectId, scenarioId);
    }
    
    public void testUpdateMoveScenario() {
        String scenarioId = "Scenario 1";
        String projectId = "MARKETING MOVE";
        List<Map<String, Object>> records = null;
        
        this.handler.updateMoveScenario(projectId, scenarioId, records);
        
    }
    
    /*
     * WORK REQUEST
     */

    public void testGenWorkRequest() {
        String activityLogId = "1";
        String projectId = "";
        String moId = "199500001";
        this.handler.genWorkRequest(activityLogId, projectId, moId);
    }
    
    /*
     * PAGINATED REPORT
     */
    public void testOnPaginatedReport() {
        String rptType = "single";
        String projectId = "";
        String moId = "199700142";
        
        this.handler.onPaginatedReport(rptType, projectId, moId);
    }
    
    /*
     * SINGLE MOVES METHODS
     */
    public void testAddIndividualMove() {
        
        Date now = new Date();
        DataSource ds = DataSourceFactory.createDataSourceForFields("mo", new String[] { "status",
                "em_id", "description", "mo_type", "mo_class", "requestor", "dept_contact",
                "to_bl_id", "to_fl_id", "to_rm_id", "date_start_req", "date_created" });
        DataRecord record = ds.createNewRecord();
        
        record.setValue("mo.status", "Created");
        record.setValue("mo.em_id", "YEN, USENG");
        record.setValue("mo.description", "Move");
        record.setValue("mo.mo_type", "Employee");
        record.setValue("mo.mo_class", "N/A");
        record.setValue("mo.requestor", "AFM");
        record.setValue("mo.dept_contact", "SMITH, ALBERT");
        record.setValue("mo.to_bl_id", "HQ");
        record.setValue("mo.to_fl_id", "17");
        record.setValue("mo.to_rm_id", "110");
        record.setValue("mo.date_start_req", now);
        record.setValue("mo.date_created", now);
        
        boolean addEq = true;
        boolean addTa = true;
        
        try {
            this.handler.addIndividualMove(record, addEq, addTa);
        } catch (ParseException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
    }
    
    public void testAddIndividualMoveNewHire() {
        Date now = new Date();
        
        DataSource ds = DataSourceFactory.createDataSourceForFields("mo", new String[] { "status",
                "em_id", "description", "mo_type", "mo_class", "requestor", "dept_contact",
                "to_bl_id", "to_fl_id", "to_rm_id", "date_start_req", "date_created" });
        DataRecord record = ds.createNewRecord();
        
        record.setValue("mo.status", "Created");
        record.setValue("mo.em_id", "BECKWITH, BILL");
        record.setValue("mo.description", "Move New Hire");
        record.setValue("mo.mo_type", "New Hire");
        record.setValue("mo.mo_class", "N/A");
        record.setValue("mo.requestor", "AFM");
        record.setValue("mo.dept_contact", "SMITH, ALBERT");
        record.setValue("mo.to_bl_id", "HQ");
        record.setValue("mo.to_fl_id", "17");
        record.setValue("mo.to_rm_id", "110");
        record.setValue("mo.date_start_req", now);
        record.setValue("mo.date_created", now);
        
        boolean addEq = false;
        boolean addTa = false;
        
        try {
            this.handler.addIndividualMoveNewHire(record, addEq, addTa);
        } catch (ParseException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
    }
    
    public void testAddIndividualMoveEmployeeLeaving() {
        Date now = new Date();
        
        DataSource ds = DataSourceFactory.createDataSourceForFields("mo", new String[] { "status",
                "em_id", "description", "mo_type", "mo_class", "requestor", "dept_contact",
                "to_bl_id", "to_fl_id", "to_rm_id", "date_start_req", "date_created" });
        DataRecord record = ds.createNewRecord();
        
        record.setValue("mo.status", "Created");
        record.setValue("mo.em_id", "YEN, USENG");
        record.setValue("mo.description", "Move Leaving");
        record.setValue("mo.mo_type", "Leaving");
        record.setValue("mo.mo_class", "N/A");
        record.setValue("mo.requestor", "AFM");
        record.setValue("mo.dept_contact", "SMITH, ALBERT");
        record.setValue("mo.date_start_req", now);
        record.setValue("mo.date_created", now);
        
        boolean addEq = true;
        boolean addTa = true;
        
        try {
            this.handler.addIndividualMoveEmployeeLeaving(record, addEq, addTa);
        } catch (ParseException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
    }
    
    public void testAddIndividualMoveEquipment() {
        Date now = new Date();
        
        DataSource ds = DataSourceFactory.createDataSourceForFields("mo", new String[] { "status",
                "em_id", "description", "mo_type", "mo_class", "requestor", "dept_contact",
                "to_bl_id", "to_fl_id", "to_rm_id", "date_start_req", "date_created" });
        DataRecord record = ds.createNewRecord();
        record.setValue("mo.status", "Created");
        record.setValue("mo.em_id", "2000000029");
        record.setValue("mo.description", "Move Equipment");
        record.setValue("mo.mo_type", "Equipment");
        record.setValue("mo.mo_class", "N/A");
        record.setValue("mo.requestor", "AFM");
        record.setValue("mo.dept_contact", "SMITH, ALBERT");
        record.setValue("mo.to_bl_id", "HQ");
        record.setValue("mo.to_fl_id", "17");
        record.setValue("mo.to_rm_id", "100");
        record.setValue("mo.date_start_req", now);
        record.setValue("mo.date_created", now);
        
        boolean addEq = true;
        boolean addTa = true;
        
        try {
            this.handler.addIndividualMoveEquipment(record, addEq, addTa);
        } catch (ParseException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
    }
    
    public void testAddIndividualMoveAsset() {
        Date now = new Date();
        
        DataSource ds = DataSourceFactory.createDataSourceForFields("mo", new String[] { "status",
                "em_id", "description", "mo_type", "mo_class", "requestor", "dept_contact",
                "to_bl_id", "to_fl_id", "to_rm_id", "date_start_req", "date_created" });
        DataRecord record = ds.createNewRecord();
        record.setValue("mo.status", "Created");
        record.setValue("mo.em_id", "ASSET1");
        record.setValue("mo.description", "Move Asset");
        record.setValue("mo.mo_type", "Asset");
        record.setValue("mo.mo_class", "N/A");
        record.setValue("mo.requestor", "AFM");
        record.setValue("mo.dept_contact", "SMITH, ALBERT");
        record.setValue("mo.to_bl_id", "HQ");
        record.setValue("mo.to_fl_id", "16");
        record.setValue("mo.to_rm_id", "110");
        record.setValue("mo.date_start_req", now);
        record.setValue("mo.date_created", now);
        
        boolean addEq = true;
        boolean addTa = true;
        
        try {
            this.handler.addIndividualMoveAsset(record, addEq, addTa);
        } catch (ParseException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
    }
    
    public void testAddIndividualMoveRoom() {
        Date now = new Date();
        
        DataSource ds = DataSourceFactory.createDataSourceForFields("mo", new String[] { "status",
                "em_id", "description", "mo_type", "mo_class", "requestor", "dept_contact",
                "to_bl_id", "to_fl_id", "to_rm_id", "date_start_req", "date_created", "from_bl_id",
                "from_fl_id", "from_rm_id" });
        DataRecord record = ds.createNewRecord();
        record.setValue("mo.status", "Created");
        record.setValue("mo.em_id", "HQ|17|110");
        record.setValue("mo.description", "Room");
        record.setValue("mo.mo_type", "Room");
        record.setValue("mo.mo_class", "N/A");
        record.setValue("mo.requestor", "AFM");
        record.setValue("mo.dept_contact", "SMITH, ALBERT");
        record.setValue("mo.from_bl_id", "HQ");
        record.setValue("mo.from_fl_id", "17");
        record.setValue("mo.from_rm_id", "110");
        record.setValue("mo.to_bl_id", "HQ");
        record.setValue("mo.to_fl_id", "18");
        record.setValue("mo.to_rm_id", "112");
        record.setValue("mo.date_start_req", now);
        record.setValue("mo.date_created", now);
        
        boolean addEq = false;
        boolean addTa = false;
        
        try {
            this.handler.addIndividualMoveRoom(record, addEq, addTa);
        } catch (ParseException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
    }
    
    public void testAddActionIndividualMove() {
        
        DataSource ds = DataSourceFactory.createDataSourceForFields("activity_log", new String[] {
                "description", "activity_type", "requestor", "mo_id" });
        DataRecord record = ds.createNewRecord();
        record.setValue("activity_log.description", " xxx ");
        record.setValue("activity_log.activity_type", "PROPERTY - GENERAL");
        record.setValue("activity_log.requestor", "AFM");
        record.setValue("activity_log.mo_id", 199500004);
        
        this.handler.addActionIndividualMove(record);
    }
    
    public void testRequestIndividualMove() {
        String mo_id = "199500008";
        this.handler.requestIndividualMove(mo_id);
    }
    
    public void testRouteIndividualMoveForApproval() {
        
        String mo_id = "199500008";
        String apprv_mgr1 = "AFM";
        String apprv_mgr2 = "";
        String apprv_mgr3 = "";
        
        this.handler.routeIndividualMoveForApproval(mo_id, apprv_mgr1, apprv_mgr2, apprv_mgr3);
    }
    
    public void testApproveIndividualMove() {
        String mo_id = "199500008";
        String apprv_mgr1 = "AFM";
        String apprv_mgr2 = "";
        String apprv_mgr3 = "";
        
        this.handler.approveIndividualMove(mo_id, apprv_mgr1, apprv_mgr2, apprv_mgr3);
    }
    
    public void testAutoApproveIndividualMove() {
        String mo_id = "199500008";
        
        this.handler.autoApproveIndividualMove(mo_id);
    }
    
    public void testRejectIndividualMove() {
        String mo_id = "199500008";
        String apprv_mgr1 = "AFM";
        String apprv_mgr2 = "";
        String apprv_mgr3 = "";
        
        this.handler.rejectIndividualMove(mo_id, apprv_mgr1, apprv_mgr2, apprv_mgr3);
    }
    
    public void testIssueIndividualMove() {
        String mo_id = "199500008";
        String requestor = "AFM";
        
        this.handler.issueIndividualMove(mo_id, requestor);
    }
    
    public void testCloseIndividualMove() {
        String mo_id = "199700041";
        
        this.handler.closeIndividualMove(mo_id);
    }
    
    /*
     * GROUP MOVES METHODS
     */

    public void testAddProjectMoveRecord() {
        Date now = new Date();
        DataSource ds = DataSourceFactory.createDataSourceForFields("project", new String[] {
                "project_id", "description", "bl_id", "requestor", "dept_contact", "contact_id",
                "date_start", "date_end" });
        DataRecord record = ds.createNewRecord();
        record.setValue("project.project_id", "NEW MARKETING MOVE");
        record.setValue("project.description", "NEW MARKETING MOVE");
        record.setValue("project.bl_id", "HQ");
        record.setValue("project.requestor", "AFM");
        record.setValue("project.dept_contact", "AFM");
        record.setValue("project.date_start", now);
        record.setValue("project.date_end", now);
        record.setValue("project.contact_id", "MR. TIM TUCKER");
        
        try {
            this.handler.addProjectMoveRecord(record);
        } catch (ParseException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
    }
    
    public void testAddProjectMove() {
        Date now = new Date();
        
        DataSource ds = DataSourceFactory.createDataSourceForFields("mo", new String[] { "status",
                "em_id", "description", "mo_type", "mo_class", "requestor", "dept_contact",
                "to_bl_id", "to_fl_id", "to_rm_id", "date_start_req", "date_created", "from_bl_id",
                "from_fl_id", "from_rm_id", "project_id" });
        DataRecord record = ds.createNewRecord();
        record.setValue("mo.project_id", "MARKETING MOVE");
        record.setValue("mo.status", "Created");
        record.setValue("mo.em_id", "BARTLETT, BETTY");
        record.setValue("mo.description", "Employee ");
        record.setValue("mo.mo_type", "Employee");
        record.setValue("mo.mo_class", "N/A");
        record.setValue("mo.requestor", "AFM");
        record.setValue("mo.dept_contact", "SMITH, ALBERT");
        record.setValue("mo.from_bl_id", "HQ");
        record.setValue("mo.from_fl_id", "17");
        record.setValue("mo.from_rm_id", "110");
        record.setValue("mo.to_bl_id", "HQ");
        record.setValue("mo.to_fl_id", "18");
        record.setValue("mo.to_rm_id", "112");
        record.setValue("mo.date_start_req", now);
        record.setValue("mo.date_created", now);
        
        try {
            this.handler.addProjectMove(record);
        } catch (ParseException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
    }
    
    public void testAddProjectMoveNewHire() {
        Date now = new Date();
        
        DataSource ds = DataSourceFactory.createDataSourceForFields("mo", new String[] { "status",
                "em_id", "description", "mo_type", "mo_class", "requestor", "dept_contact",
                "to_bl_id", "to_fl_id", "to_rm_id", "date_start_req", "date_created", "from_bl_id",
                "from_fl_id", "from_rm_id", "project_id" });
        DataRecord record = ds.createNewRecord();
        record.setValue("mo.project_id", "MARKETING MOVE");
        record.setValue("mo.status", "Created");
        record.setValue("mo.em_id", "BARTLETT, BETTY");
        record.setValue("mo.description", "New Hire ");
        record.setValue("mo.mo_type", "New Hire");
        record.setValue("mo.mo_class", "N/A");
        record.setValue("mo.requestor", "AFM");
        record.setValue("mo.dept_contact", "YEN, USENG");
        record.setValue("mo.to_bl_id", "HQ");
        record.setValue("mo.to_fl_id", "18");
        record.setValue("mo.to_rm_id", "112");
        record.setValue("mo.date_start_req", now);
        record.setValue("mo.date_created", now);
        
        try {
            this.handler.addProjectMoveNewHire(record);
        } catch (ParseException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
    }
    
    public void testAddProjectMoveEmployeeLeaving() {
        Date now = new Date();
        
        DataSource ds = DataSourceFactory.createDataSourceForFields("mo", new String[] { "status",
                "em_id", "description", "mo_type", "mo_class", "requestor", "dept_contact",
                "to_bl_id", "to_fl_id", "to_rm_id", "date_start_req", "date_created", "from_bl_id",
                "from_fl_id", "from_rm_id", "project_id" });
        DataRecord record = ds.createNewRecord();
        record.setValue("mo.project_id", "MARKETING MOVE");
        record.setValue("mo.status", "Created");
        record.setValue("mo.em_id", "BARTLETT, BETTY");
        record.setValue("mo.description", "Leaving ");
        record.setValue("mo.mo_type", "Leaving");
        record.setValue("mo.mo_class", "N/A");
        record.setValue("mo.requestor", "AFM");
        record.setValue("mo.dept_contact", "YEN, USENG");
        record.setValue("mo.from_bl_id", "HQ");
        record.setValue("mo.from_fl_id", "18");
        record.setValue("mo.from_rm_id", "112");
        record.setValue("mo.date_start_req", now);
        record.setValue("mo.date_created", now);
        
        try {
            this.handler.addProjectMoveEmployeeLeaving(record);
        } catch (ParseException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
    }
    
    public void testAddProjectMoveEquipment() {
        Date now = new Date();
        
        DataSource ds = DataSourceFactory.createDataSourceForFields("mo", new String[] { "status",
                "em_id", "description", "mo_type", "mo_class", "requestor", "dept_contact",
                "to_bl_id", "to_fl_id", "to_rm_id", "date_start_req", "date_created", "from_bl_id",
                "from_fl_id", "from_rm_id", "project_id" });
        DataRecord record = ds.createNewRecord();
        record.setValue("mo.project_id", "MARKETING MOVE");
        record.setValue("mo.status", "Created");
        record.setValue("mo.em_id", "2000000029");
        record.setValue("mo.description", "Equipment ");
        record.setValue("mo.mo_type", "Equipment");
        record.setValue("mo.mo_class", "N/A");
        record.setValue("mo.requestor", "AFM");
        record.setValue("mo.dept_contact", "YEN, USENG");
        record.setValue("mo.from_bl_id", "HQ");
        record.setValue("mo.from_fl_id", "18");
        record.setValue("mo.from_rm_id", "112");
        record.setValue("mo.to_bl_id", "HQ");
        record.setValue("mo.to_fl_id", "17");
        record.setValue("mo.to_rm_id", "110");
        record.setValue("mo.date_start_req", now);
        record.setValue("mo.date_created", now);
        
        try {
            this.handler.addProjectMoveEquipment(record);
        } catch (ParseException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
    }
    
    public void testAddProjectMoveAsset() {
        Date now = new Date();
        
        DataSource ds = DataSourceFactory.createDataSourceForFields("mo", new String[] { "status",
                "em_id", "description", "mo_type", "mo_class", "requestor", "dept_contact",
                "to_bl_id", "to_fl_id", "to_rm_id", "date_start_req", "date_created", "from_bl_id",
                "from_fl_id", "from_rm_id", "project_id" });
        DataRecord record = ds.createNewRecord();
        record.setValue("mo.project_id", "MARKETING MOVE");
        record.setValue("mo.status", "Created");
        record.setValue("mo.em_id", "Asset 22");
        record.setValue("mo.description", "Asset ");
        record.setValue("mo.mo_type", "Asset");
        record.setValue("mo.mo_class", "N/A");
        record.setValue("mo.requestor", "AFM");
        record.setValue("mo.dept_contact", "YEN, USENG");
        record.setValue("mo.from_bl_id", "HQ");
        record.setValue("mo.from_fl_id", "18");
        record.setValue("mo.from_rm_id", "112");
        record.setValue("mo.to_bl_id", "HQ");
        record.setValue("mo.to_fl_id", "17");
        record.setValue("mo.to_rm_id", "110");
        record.setValue("mo.date_start_req", now);
        record.setValue("mo.date_created", now);
        
        try {
            this.handler.addProjectMoveAsset(record);
        } catch (ParseException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
    }
    
    public void testAddProjectMoveRoom() {
        Date now = new Date();
        
        DataSource ds = DataSourceFactory.createDataSourceForFields("mo", new String[] { "status",
                "em_id", "description", "mo_type", "mo_class", "requestor", "dept_contact",
                "to_bl_id", "to_fl_id", "to_rm_id", "date_start_req", "date_created", "from_bl_id",
                "from_fl_id", "from_rm_id", "project_id" });
        DataRecord record = ds.createNewRecord();
        record.setValue("mo.project_id", "MARKETING MOVE");
        record.setValue("mo.status", "Created");
        record.setValue("mo.em_id", "HQ|18|112");
        record.setValue("mo.description", "Room ");
        record.setValue("mo.mo_type", "Room");
        record.setValue("mo.mo_class", "N/A");
        record.setValue("mo.requestor", "AFM");
        record.setValue("mo.dept_contact", "AFM");
        record.setValue("mo.from_bl_id", "HQ");
        record.setValue("mo.from_fl_id", "18");
        record.setValue("mo.from_rm_id", "112");
        record.setValue("mo.to_bl_id", "HQ");
        record.setValue("mo.to_fl_id", "17");
        record.setValue("mo.to_rm_id", "110");
        record.setValue("mo.date_start_req", now);
        record.setValue("mo.date_created", now);
        
        try {
            this.handler.addProjectMoveRoom(record);
        } catch (ParseException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
    }
    
    public void testAddBulkMoves() {
        Date now = new Date();
        
        DataSource ds = DataSourceFactory.createDataSourceForFields("mo", new String[] {
                "from_dv_id", "from_dp_id", "requestor", "to_bl_id", "to_fl_id", "date_start_req",
                "from_bl_id", "from_fl_id", "project_id" });
        DataRecord record = ds.createNewRecord();
        record.setValue("mo.project_id", "MARKETING MOVE");
        record.setValue("mo.from_dv_id", "SOFTWARE SOLN.");
        record.setValue("mo.from_dp_id", "ENGINEERING");
        record.setValue("mo.from_bl_id", "HQ");
        record.setValue("mo.from_fl_id", "18");
        record.setValue("mo.to_bl_id", "HQ");
        record.setValue("mo.to_fl_id", "17");
        record.setValue("mo.requestor", "AFM");
        record.setValue("mo.date_start_req", now);
        
        try {
            this.handler.addBulkMoves(record);
        } catch (ParseException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
    }
    
    public void testAddActionGroupMove() {
        new Date();
        
        DataSource ds = DataSourceFactory.createDataSourceForFields("activity_log", new String[] {
                "project_id", "description", "activity_type", "requestor" });
        DataRecord record = ds.createNewRecord();
        record.setValue("activity_log.project_id", "RENOVATION OF HQ");
        record.setValue("activity_log.description", "ENGINEERING");
        record.setValue("activity_log.activity_type", "ENGINEERING");
        record.setValue("activity_log.requestor", "AFM");
        
        this.handler.addActionGroupMove(record);
    }
    
    public void testRequestGroupMove() {
        String project_id = "MARKETING MOVE";
        this.handler.requestGroupMove(project_id);
    }
    
    public void testRouteGroupMoveForApproval() {
        String project_id = "MARKETING MOVE";
        
        String apprv_mgr1 = "AFM";
        String apprv_mgr2 = "";
        String apprv_mgr3 = "";
        
        this.handler.routeGroupMoveForApproval(project_id, apprv_mgr1, apprv_mgr2, apprv_mgr3);
    }
    
    public void testApproveGroupMove() {
        String project_id = "MARKETING MOVE";
        
        String apprv_mgr1 = "AFM";
        String apprv_mgr2 = "";
        String apprv_mgr3 = "";
        
        this.handler.approveGroupMove(project_id, apprv_mgr1, apprv_mgr2, apprv_mgr3);
    }
    
    public void testAutoApproveGroupMove() {
        String project_id = "MARKETING MOVE";
        this.handler.autoApproveGroupMove(project_id);
    }
    
    public void testRejectGroupMove() {
        String project_id = "MARKETING MOVE";
        
        String apprv_mgr1 = "AFM";
        String apprv_mgr2 = "";
        String apprv_mgr3 = "";
        
        this.handler.rejectGroupMove(project_id, apprv_mgr1, apprv_mgr2, apprv_mgr3);
    }
    
    public void testIssueGroupMove() {
        String project_id = "MARKETING MOVE";
        
        String requestor = "AFM";
        
        this.handler.issueGroupMove(project_id, requestor);
    }
    
    public void testCloseGroupMove() {
        String project_id = "MARKETING MOVE";
        
        this.handler.closeGroupMove(project_id);
    }
    
}
