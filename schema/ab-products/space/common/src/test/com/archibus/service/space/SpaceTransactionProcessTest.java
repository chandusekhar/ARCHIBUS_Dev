package com.archibus.service.space;

import java.text.ParseException;
import java.util.Date;

import org.json.JSONObject;

import com.archibus.datasource.DataSourceTestBase;

/**
 * <p>
 * Class for test WFR method for Space Transaction application.<br>
 * 
 */
public final class SpaceTransactionProcessTest extends DataSourceTestBase {
    
    private final SpaceTransactionProcess spaceTransactionProcess = new SpaceTransactionProcess();
    
    /**
     * testApproveDepartmentSpace.
     */
    public void testApproveDepartmentSpace() {
        
        final String assignmentsListString =
                "{\"I\":[{\"bl_id\":\"HQ\",\"fl_id\":\"11\",\"rm_id\":\"122\",\"dv_id\":\"ELECTRONIC SYS.\",\"dp_id\":\"ENGINEERING\",\"status\":0,\"activity_log_id\":4142,\"action\":\"insert\",\"legend_level\":\"Claim\"}],\"U\":[],\"D\":[]}";
        
        final String recordString =
                "{\"activity_log.created_by\":\"AI\",\"activity_log.requestor\":\"AI\",\"activity_log.phone_requestor\":\"227-2508\",\"activity_log.date_requested\":\"2013-02-05\",\"activity_log.time_requested\":\"22:03.10.000\",\"activity_log.manager\":\"AFM\",\"activity_log.activity_type\":\"SERVICE DESK - DEPARTMENT SPACE\",\"activity_log.prob_type\":\"\",\"activity_log.description\":\"dfg\",\"activity_log.site_id\":\"OLDCITY\",\"activity_log.bl_id\":\"XC\",\"activity_log.fl_id\":\"02\",\"activity_log.rm_id\":\"120\",\"activity_log.location\":\"\",\"activity_log.eq_id\":\"\",\"activity_log.priority\":\"1\",\"activity_log.date_required\":\"\",\"activity_log.time_required\":\"\",\"activity_log.date_escalation_response\":\"\",\"activity_log.time_escalation_response\":\"\",\"activity_log.date_escalation_completion\":\"\",\"activity_log.time_escalation_completion\":\"\",\"activity_log.status\":\"REQUESTED\",\"activity_log.doc1\":\"\",\"activity_log.doc2\":\"\",\"activity_log.doc3\":\"\",\"activity_log.doc4\":\"\",\"activity_log.act_quest\":\"<questionnaire questionnaire_id=\\\"SERVICE DESK - DEPARTMENT SPACE\\\"><question quest_name=\\\"date_start\\\" value=\\\"2013-02-06\\\"/></questionnaire>\",\"activity_log.ac_id\":\"\",\"activity_log.po_id\":\"\",\"activity_log.cost_estimated\":\"0.00\",\"activity_log.cost_to_replace\":\"0.00\",\"activity_log.cost_cat_id\":\"\",\"activity_log.dv_id\":\"ELECTRONIC SYS.\",\"activity_log.dp_id\":\"ENGINEERING\",\"activity_log.approved_by\":\"\",\"activity_log.activity_log_id\":\"4142\",\"activity_log_step_waiting.activity_log_id\":\"4142\",\"activity_log_step_waiting.step\":\"Manager Approval\",\"activity_log_step_waiting.comments\":\"\",\"activity_log_step_waiting.step_code\":\"ce3c7d03-18e1-8d11-a46c-7d2186b330db\",\"activity_log_step_waiting.step_log_id\":\"855\",\"activity_log_step_waiting.user_name\":\"ABERNATHY\"}";
        
        final Date date = new Date();
        final int activityLogId = 4142;
        final String comments = "";
        try {
            final JSONObject assignmentsList = new JSONObject(assignmentsListString);
            final JSONObject record = new JSONObject(recordString);
            
            this.spaceTransactionProcess.approveDepartmentSpace(record, comments, date,
                activityLogId, assignmentsList);
            
        } catch (final ParseException e) {
            e.printStackTrace();
        }
        
    }
    
    /**
     * testApproveDepartmentSpaceForPastDate.
     */
    public void testApproveDepartmentSpaceForPastDate() {
        
        final String assignmentsListString =
                "{\"I\":[{\"bl_id\":\"HQ\",\"fl_id\":\"11\",\"rm_id\":\"122\",\"dv_id\":\"ELECTRONIC SYS.\",\"dp_id\":\"ENGINEERING\",\"status\":0,\"activity_log_id\":4142,\"action\":\"insert\",\"legend_level\":\"Claim\"}],\"U\":[],\"D\":[]}";
        
        final String recordString =
                "{\"activity_log.created_by\":\"AI\",\"activity_log.requestor\":\"AI\",\"activity_log.phone_requestor\":\"227-2508\",\"activity_log.date_requested\":\"2013-02-05\",\"activity_log.time_requested\":\"22:03.10.000\",\"activity_log.manager\":\"AFM\",\"activity_log.activity_type\":\"SERVICE DESK - DEPARTMENT SPACE\",\"activity_log.prob_type\":\"\",\"activity_log.description\":\"dfg\",\"activity_log.site_id\":\"OLDCITY\",\"activity_log.bl_id\":\"XC\",\"activity_log.fl_id\":\"02\",\"activity_log.rm_id\":\"120\",\"activity_log.location\":\"\",\"activity_log.eq_id\":\"\",\"activity_log.priority\":\"1\",\"activity_log.date_required\":\"\",\"activity_log.time_required\":\"\",\"activity_log.date_escalation_response\":\"\",\"activity_log.time_escalation_response\":\"\",\"activity_log.date_escalation_completion\":\"\",\"activity_log.time_escalation_completion\":\"\",\"activity_log.status\":\"REQUESTED\",\"activity_log.doc1\":\"\",\"activity_log.doc2\":\"\",\"activity_log.doc3\":\"\",\"activity_log.doc4\":\"\",\"activity_log.act_quest\":\"<questionnaire questionnaire_id=\\\"SERVICE DESK - DEPARTMENT SPACE\\\"><question quest_name=\\\"date_start\\\" value=\\\"2013-02-06\\\"/></questionnaire>\",\"activity_log.ac_id\":\"\",\"activity_log.po_id\":\"\",\"activity_log.cost_estimated\":\"0.00\",\"activity_log.cost_to_replace\":\"0.00\",\"activity_log.cost_cat_id\":\"\",\"activity_log.dv_id\":\"ELECTRONIC SYS.\",\"activity_log.dp_id\":\"ENGINEERING\",\"activity_log.approved_by\":\"\",\"activity_log.activity_log_id\":\"4142\",\"activity_log_step_waiting.activity_log_id\":\"4142\",\"activity_log_step_waiting.step\":\"Manager Approval\",\"activity_log_step_waiting.comments\":\"\",\"activity_log_step_waiting.step_code\":\"ce3c7d03-18e1-8d11-a46c-7d2186b330db\",\"activity_log_step_waiting.step_log_id\":\"855\",\"activity_log_step_waiting.user_name\":\"ABERNATHY\"}";
        
        final Date date = new Date();
        final int activityLogId = 4142;
        final String comments = "";
        try {
            final JSONObject assignmentsList = new JSONObject(assignmentsListString);
            final JSONObject record = new JSONObject(recordString);
            
            this.spaceTransactionProcess.approveDepartmentSpaceForPastDate(record, comments, date,
                activityLogId, assignmentsList);
            
        } catch (final ParseException e) {
            e.printStackTrace();
        }
        
    }
    
    /**
     * testSubmitMove.
     */
    public void testSubmitMove() {
        
        final String assignmentsListString =
                "{\"I\":[{\"activity_log_id\":\"4143\",\"em_id\":\"ACHARYA,JUANA\",\"bl_id\":\"HQ\",\"fl_id\":\"17\",\"rm_id\":\"126\",\"from_bl_id\":\"HQ\",\"from_fl_id\":\"17\",\"from_rm_id\":\"111\",\"status\":\"\",\"action\":\"insert\",\"dv_id\":\"SOFTWARE APP.\",\"dp_id\":\"OPERATIONS-MAINT\",\"rm_cat\":\"PERS\",\"rm_type\":\"OFFICE\",\"primary_rm\":0,\"primary_em\":1}],\"U\":[],\"D\":[]}";
        
        final String recordString =
                "{\"activity_log.activity_log_id\":\"4143\",\"activity_log.created_by\":\"ABERNATHY, ALISON\",\"activity_log.requestor\":\"ABERNATHY, ALISON\",\"activity_log.phone_requestor\":\"338-1011\",\"activity_log.assessment_id\":\"\"}";
        
        final Date date = new Date();
        final int activityLogId = 4143;
        
        try {
            final JSONObject assignmentsObject = new JSONObject(assignmentsListString);
            final JSONObject record = new JSONObject(recordString);
            
            this.spaceTransactionProcess.submitMove(activityLogId, record, date, assignmentsObject);
            
        } catch (final ParseException e) {
            e.printStackTrace();
        }
        
    }
    
    /**
     * testApproveMove.
     */
    public void testApproveMove() {
        
        final String assignmentsListString =
                "{\"I\":[{\"bl_id\":\"HQ\",\"fl_id\":\"15\",\"rm_id\":\"101\",\"dv_id\":\"ELECTRONIC SYS.\",\"dp_id\":\"ENGINEERING\",\"status\":0,\"activity_log_id\":4142,\"action\":\"insert\",\"legend_level\":\"Claim\"}],\"U\":[],\"D\":[]}";
        
        final String recordString =
                "{\"activity_log.activity_log_id\":\"4143\",\"activity_log.created_by\":\"ABERNATHY, ALISON\",\"activity_log.requestor\":\"ABERNATHY, ALISON\",\"activity_log.phone_requestor\":\"338-1011\",\"activity_log.assessment_id\":\"\"}";
        
        final Date date = new Date();
        final int activityLogId = 4143;
        
        try {
            final JSONObject assignmentsObject = new JSONObject(assignmentsListString);
            final JSONObject record = new JSONObject(recordString);
            
            this.spaceTransactionProcess
                .approveMove(activityLogId, record, date, assignmentsObject);
            
        } catch (final ParseException e) {
            e.printStackTrace();
        }
        
    }
    
    /**
     * approveMoveForPastDate.
     */
    public void testApproveMoveForPastDate() {
        
        final String assignmentsListString =
                "{\"I\":[{\"bl_id\":\"HQ\",\"fl_id\":\"15\",\"rm_id\":\"101\",\"dv_id\":\"ELECTRONIC SYS.\",\"dp_id\":\"ENGINEERING\",\"status\":0,\"activity_log_id\":4142,\"action\":\"insert\",\"legend_level\":\"Claim\"}],\"U\":[],\"D\":[]}";
        
        final String recordString =
                "{\"activity_log.activity_log_id\":\"4143\",\"activity_log.created_by\":\"ABERNATHY, ALISON\",\"activity_log.requestor\":\"ABERNATHY, ALISON\",\"activity_log.phone_requestor\":\"338-1011\",\"activity_log.assessment_id\":\"\"}";
        
        final Date date = new Date();
        final int activityLogId = 4143;
        
        try {
            final JSONObject assignmentsObject = new JSONObject(assignmentsListString);
            final JSONObject record = new JSONObject(recordString);
            
            this.spaceTransactionProcess.approveMoveForPastDate(activityLogId, record, date,
                assignmentsObject);
            
        } catch (final ParseException e) {
            e.printStackTrace();
        }
        
    }
    
    /**
     * approveMoveForPastDate.
     */
    public void testRejectAll() {
        
        final String assignmentsListString =
                "[{\"pct_id\":\"16906\",\"parent_pct_id\":\"16551\",\"activity_log_id\":\"4123\",\"em_id\":\"AFMDEMO5\",\"bl_id\":\"HQ\",\"fl_id\":\"18\",\"rm_id\":\"107\",\"from_bl_id\":\"HQ\",\"from_fl_id\":\"11\",\"from_rm_id\":\"101\",\"status\":\"\",\"action\":\"insert\",\"dv_id\":\"EXECUTIVE\",\"dp_id\":\"MANAGEMENT\",\"rm_cat\":\"PERS\",\"rm_type\":\"EXEC-SR\",\"primary_rm\":\"1\",\"primary_em\":1}]";
        
        final String recordString =
                "{\"activity_log.created_by\":\"AI\",\"activity_log.requestor\":\"AI\",\"activity_log.phone_requestor\":\"227-2508\",\"activity_log.date_requested\":\"2013-01-20\",\"activity_log.time_requested\":\"21:49.28.000\",\"activity_log.manager\":\"AFM\",\"activity_log.activity_type\":\"SERVICE DESK - GROUP MOVE\",\"activity_log.prob_type\":\"\",\"activity_log.description\":\"dfg\",\"activity_log.site_id\":\"OLDCITY\",\"activity_log.bl_id\":\"XC\",\"activity_log.fl_id\":\"02\",\"activity_log.rm_id\":\"120\",\"activity_log.location\":\"\",\"activity_log.eq_id\":\"\",\"activity_log.priority\":\"1\",\"activity_log.date_required\":\"\",\"activity_log.time_required\":\"\",\"activity_log.date_escalation_response\":\"\",\"activity_log.time_escalation_response\":\"\",\"activity_log.date_escalation_completion\":\"\",\"activity_log.time_escalation_completion\":\"\",\"activity_log.status\":\"REQUESTED\",\"activity_log.doc1\":\"\",\"activity_log.doc2\":\"\",\"activity_log.doc3\":\"\",\"activity_log.doc4\":\"\",\"activity_log.act_quest\":\"<questionnaire questionnaire_id=\\\"SERVICE DESK - GROUP MOVE\\\"><question quest_name=\\\"bl_id\\\" value=\\\"hq\\\"/><question quest_name=\\\"date_start\\\" value=\\\"2013-01-14\\\"/><question quest_name=\\\"date_end\\\" value=\\\"2013-01-22\\\"/><question quest_name=\\\"dp_contact\\\" value=\\\"ABROL,SHARON\\\"/><question quest_name=\\\"project_name\\\" value=\\\"\\\"/></questionnaire>\",\"activity_log.ac_id\":\"\",\"activity_log.po_id\":\"\",\"activity_log.cost_estimated\":\"0.00\",\"activity_log.cost_to_replace\":\"0.00\",\"activity_log.cost_cat_id\":\"\",\"activity_log.dv_id\":\"ELECTRONIC SYS.\",\"activity_log.dp_id\":\"ENGINEERING\",\"activity_log.approved_by\":\"\",\"activity_log.activity_log_id\":\"4123\",\"activity_log_step_waiting.activity_log_id\":\"4123\",\"activity_log_step_waiting.step\":\"Manager Approval\",\"activity_log_step_waiting.comments\":\"\",\"activity_log_step_waiting.step_code\":\"00bb803f-f41a-075e-599e-a83268af6a32\",\"activity_log_step_waiting.step_log_id\":\"836\",\"activity_log_step_waiting.user_name\":\"ABERNATHY\"}";
        
        final Date date = new Date();
        final int activityLogId = 4123;
        
        try {
            final JSONObject assignmentsList =
                    new JSONObject("{\"a\":" + assignmentsListString + "}");
            final JSONObject record = new JSONObject(recordString);
            
            this.spaceTransactionProcess.rejectAll(record, "", activityLogId,
                assignmentsList.getJSONArray("a"), date);
            
        } catch (final ParseException e) {
            e.printStackTrace();
        }
        
    }
    
    /**
     * testIssueAll.
     */
    public void testIssueAll() {
        
        final String assignmentsListString =
                "{\"I\":[],\"U\":[{\"pct_id\":\"16859\",\"parent_pct_id\":\"0\",\"activity_log_id\":\"4093\",\"em_id\":\"CHASE, JIM\",\"bl_id\":\"HQ\",\"fl_id\":\"19\",\"rm_id\":\"118\",\"from_bl_id\":\"HQ\",\"from_fl_id\":\"19\",\"from_rm_id\":\"120\",\"status\":\"\",\"action\":\"insert\",\"dv_id\":\"\",\"dp_id\":\"\",\"rm_cat\":\"ADMIN\",\"rm_type\":\"SEC\",\"primary_rm\":\"1\",\"primary_em\":1}],\"D\":[]}";
        
        final String recordString =
                "{\"activity_log.activity_log_id\":\"4093\",\"activity_log.comments\":\"\"}";
        
        final Date date = new Date();
        final int activityLogId = 4193;
        
        try {
            
            final JSONObject assignmentsObject = new JSONObject(assignmentsListString);
            final JSONObject record = new JSONObject(recordString);
            
            this.spaceTransactionProcess.issueAll(activityLogId, record, date, assignmentsObject,
                false);
        } catch (final ParseException e) {
            e.printStackTrace();
        }
        
    }
    
    /**
     * testIssueAllForPastDate.
     */
    public void testIssueAllForPastDate() {
        
        final String assignmentsListString =
                "{\"I\":[],\"U\":[{\"pct_id\":\"16859\",\"parent_pct_id\":\"0\",\"activity_log_id\":\"4093\",\"em_id\":\"CHASE, JIM\",\"bl_id\":\"HQ\",\"fl_id\":\"19\",\"rm_id\":\"118\",\"from_bl_id\":\"HQ\",\"from_fl_id\":\"19\",\"from_rm_id\":\"120\",\"status\":\"\",\"action\":\"insert\",\"dv_id\":\"\",\"dp_id\":\"\",\"rm_cat\":\"ADMIN\",\"rm_type\":\"SEC\",\"primary_rm\":\"1\",\"primary_em\":1}],\"D\":[]}";
        
        final String recordString =
                "{\"activity_log.activity_log_id\":\"4093\",\"activity_log.comments\":\"\"}";
        
        final Date date = new Date();
        final int activityLogId = 4193;
        
        try {
            
            final JSONObject assignmentsObject = new JSONObject(assignmentsListString);
            final JSONObject record = new JSONObject(recordString);
            
            this.spaceTransactionProcess.issueAllForPastDate(activityLogId, record, date,
                assignmentsObject, false);
        } catch (final ParseException e) {
            e.printStackTrace();
        }
        
    }
    
    /**
     * testIssueAllForPastDate.
     */
    public void testCancelAll() {
        
        final String assignmentsListString =
                "[{\"pct_id\":\"16859\",\"parent_pct_id\":\"0\",\"activity_log_id\":\"4093\",\"em_id\":\"CHASE, JIM\",\"bl_id\":\"HQ\",\"fl_id\":\"19\",\"rm_id\":\"118\",\"from_bl_id\":\"HQ\",\"from_fl_id\":\"19\",\"from_rm_id\":\"120\",\"status\":\"\",\"action\":\"insert\",\"dv_id\":\"\",\"dp_id\":\"\",\"rm_cat\":\"ADMIN\",\"rm_type\":\"SEC\",\"primary_rm\":\"1\",\"primary_em\":1}]";
        
        final String recordString =
                " {\"activity_log.activity_log_id\":\"4093\",\"activity_log.comments\":\"\"}";
        
        final Date date = new Date();
        final int activityLogId = 4093;
        
        try {
            final JSONObject assignmentsList =
                    new JSONObject("{\"a\":" + assignmentsListString + "}");
            final JSONObject record = new JSONObject(recordString);
            
            this.spaceTransactionProcess.cancelAll(activityLogId, record,
                assignmentsList.getJSONArray("a"), date);
            
        } catch (final ParseException e) {
            e.printStackTrace();
        }
        
    }
    
    /**
     * testIssueAllForPastDate.
     */
    public void testCloseMoveOrder() {
        
        final String assignmentsListString =
                "{\"I\":[],\"U\":[{\"pct_id\":\"16859\",\"parent_pct_id\":\"0\",\"activity_log_id\":\"4093\",\"em_id\":\"CHASE, JIM\",\"bl_id\":\"HQ\",\"fl_id\":\"19\",\"rm_id\":\"118\",\"from_bl_id\":\"HQ\",\"from_fl_id\":\"19\",\"from_rm_id\":\"120\",\"status\":\"\",\"action\":\"insert\",\"dv_id\":\"\",\"dp_id\":\"\",\"rm_cat\":\"ADMIN\",\"rm_type\":\"SEC\",\"primary_rm\":\"1\",\"primary_em\":1}],\"D\":[]}";
        
        final Date date = new Date();
        try {
            
            final JSONObject assignmentsObject = new JSONObject(assignmentsListString);
            
            this.spaceTransactionProcess.closeMoveOrder(date, assignmentsObject);
            
        } catch (final ParseException e) {
            e.printStackTrace();
        }
        
    }
    
    /**
     * deleteAll.
     */
    public void testDeleteAll() {
        
        final String assignmentsListString =
                "[{\"pct_id\":\"16859\",\"parent_pct_id\":\"0\",\"activity_log_id\":\"4093\",\"em_id\":\"CHASE, JIM\",\"bl_id\":\"HQ\",\"fl_id\":\"19\",\"rm_id\":\"118\",\"from_bl_id\":\"HQ\",\"from_fl_id\":\"19\",\"from_rm_id\":\"120\",\"status\":\"\",\"action\":\"insert\",\"dv_id\":\"\",\"dp_id\":\"\",\"rm_cat\":\"ADMIN\",\"rm_type\":\"SEC\",\"primary_rm\":\"1\",\"primary_em\":1}]";
        
        final String recordString =
                " {\"activity_log.activity_log_id\":\"4093\",\"activity_log.comments\":\"\"}";
        
        final Date date = new Date();
        final int activityLogId = 4093;
        
        try {
            final JSONObject assignmentsList =
                    new JSONObject("{\"a\":" + assignmentsListString + "}");
            final JSONObject record = new JSONObject(recordString);
            
            this.spaceTransactionProcess.deleteAll(activityLogId, record,
                assignmentsList.getJSONArray("a"), date);
            
        } catch (final ParseException e) {
            e.printStackTrace();
        }
        
    }
    
    /**
     * testDetectIfExistsMoveFuture.
     */
    public void testDetectIfExistsMoveFuture() {
        
        final String assignmentsListString =
                "{\"I\":[{\"bl_id\":\"HQ\",\"fl_id\":\"15\",\"rm_id\":\"101\",\"dv_id\":\"ELECTRONIC SYS.\",\"dp_id\":\"ENGINEERING\",\"status\":0,\"activity_log_id\":4142,\"action\":\"insert\",\"legend_level\":\"Claim\"}],\"U\":[],\"D\":[]}";
        
        final String recordString =
                "{\"activity_log.created_by\":\"AI\",\"activity_log.activity_log_id\":\"4142\",\"activity_log.requestor\":\"AI\",\"activity_log.phone_requestor\":\"227-2508\",\"activity_log.doc1\":\"\",\"activity_log.doc2\":\"\",\"activity_log.doc3\":\"\",\"activity_log.doc4\":\"\",\"activity_log.assessment_id\":\"\",\"activity_log.dv_id\":\"ELECTRONIC SYS.\",\"activity_log.dp_id\":\"ENGINEERING\"}";
        
        final Date date = new Date();
        try {
            final JSONObject assignmentsList = new JSONObject(assignmentsListString);
            new JSONObject(recordString);
            
            this.spaceTransactionProcess.detectIfExistsMoveFuture(assignmentsList, date, 0);
            
        } catch (final ParseException e) {
            e.printStackTrace();
        }
        
    }
    
    /**
     * testDetectIfExistsFutureInDefineEm.
     */
    public void testDetectIfExistsFutureInDefineEm() {
        
        this.spaceTransactionProcess.detectIfExistsFutureInDefineEm("AI", "HQ", "15", "101");
        
    }
    
    /**
     * testSubmitDepartmentSpace.
     */
    public void testSubmitDepartmentSpace() {
        
        final String assignmentsListString =
                "{\"I\":[{\"bl_id\":\"HQ\",\"fl_id\":\"15\",\"rm_id\":\"101\",\"dv_id\":\"ELECTRONIC SYS.\",\"dp_id\":\"ENGINEERING\",\"status\":0,\"activity_log_id\":4142,\"action\":\"insert\",\"legend_level\":\"Claim\"}],\"U\":[],\"D\":[]}";
        
        final String recordString =
                "{\"activity_log.created_by\":\"AI\",\"activity_log.activity_log_id\":\"4142\",\"activity_log.requestor\":\"AI\",\"activity_log.phone_requestor\":\"227-2508\",\"activity_log.doc1\":\"\",\"activity_log.doc2\":\"\",\"activity_log.doc3\":\"\",\"activity_log.doc4\":\"\",\"activity_log.assessment_id\":\"\",\"activity_log.dv_id\":\"ELECTRONIC SYS.\",\"activity_log.dp_id\":\"ENGINEERING\"}";
        
        final Date date = new Date();
        final int activityLogId = 4142;
        
        try {
            final JSONObject assignmentsList = new JSONObject(assignmentsListString);
            final JSONObject record = new JSONObject(recordString);
            
            this.spaceTransactionProcess.submitDepartmentSpace(record, date, activityLogId,
                assignmentsList);
            
        } catch (final ParseException e) {
            e.printStackTrace();
        }
        
    }
    
}
