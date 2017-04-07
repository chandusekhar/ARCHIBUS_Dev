package com.archibus.eventhandler.steps;

import java.text.ParseException;

import org.json.*;

import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.eventhandler.helpdesk.*;
import com.archibus.eventhandler.ondemandwork.WorkRequestHandler;

public class StepStatusTest extends DataSourceTestBase {

    RequestHandler requestHandler = new RequestHandler();

    WorkRequestHandler workRequestHandler = new WorkRequestHandler();

    public void testNormalServiceDeskFlow() {
        JSONObject record = new JSONObject();
        record.put("activity_log.requestor", "CALLAWAY, JULIE");
        record.put("activity_log.site_id", "JFK");
        record.put("activity_log.bl_id", "JFK A");
        record.put("activity_log.fl_id", "04");
        record.put("activity_log.rm_id", "001");
        record.put("activity_log.activity_type", "SERVICE DESK - COPY SERVICE");
        record.put("activity_log.priority", "1");
        record.put("activity_log.description", "testing default value for step status");

        // create request
        this.requestHandler.submitRequest("", record);
        int activityLogId = DataStatistics
            .getInt("activity_log", "activity_log_id", "MAX",
                "activity_type='SERVICE DESK - COPY SERVICE' AND requestor ='CALLAWAY, JULIE' AND site_id='JFK'");

        assertNotNull(activityLogId);

        // check if request is autoapproved and stepstatus is 'none'
        String[] activityLogFields = new String[] { "activity_log_id", "requestor", "site_id",
                "bl_id", "fl_id", "rm_id", "activity_type", "priority", "description", "status",
                "step_status" };
        DataSource activityLogDS = DataSourceFactory.createDataSourceForFields("activity_log",
            activityLogFields);

        DataRecord activityLogRecord = activityLogDS
            .getRecord("activity_log_id = " + activityLogId);
        assertEquals(Constants.STEP_STATUS_NULL, activityLogRecord
            .getString("activity_log.step_status"));
        assertEquals("APPROVED", activityLogRecord.getString("activity_log.status"));

        // check step status result of notification step
        String[] helpdeskStepLogFields = new String[] { "step_log_id", "step", "step_type",
                "step_status_result", "em_id", "status", "step_order" };
        DataSource helpdeskStepLogDS = DataSourceFactory.createDataSourceForFields(
            "helpdesk_step_log", helpdeskStepLogFields);
        DataRecord notificationRecord = helpdeskStepLogDS
            .getRecord("table_name='activity_log' AND pkey_value = " + activityLogId
                    + " AND status='REQUESTED' AND step_type='notification'");
        assertEquals(Constants.STEP_STATUS_NULL, notificationRecord
            .getString("helpdesk_step_log.step_status_result"));

        record.put("activity_log.activity_log_id", activityLogId);
        this.requestHandler.issueRequest(record);

        activityLogRecord = activityLogDS.getRecord("activity_log_id = " + activityLogId);
        assertEquals(Constants.STEP_STATUS_NULL, activityLogRecord
            .getString("activity_log.step_status"));
        assertEquals("IN PROGRESS", activityLogRecord.getString("activity_log.status"));

        DataRecord basicStepRecord = helpdeskStepLogDS
            .getRecord("table_name='activity_log' AND pkey_value=" + activityLogId
                    + " AND status='IN PROGRESS' AND step_type='basic'");
        assertEquals(Constants.STEP_STATUS_NULL, basicStepRecord
            .getString("helpdesk_step_log.step_status_result"));

        // complete request
        this.requestHandler.completeRequest(record);
        activityLogRecord = activityLogDS.getRecord("activity_log_id = " + activityLogId);
        assertEquals(Constants.STEP_STATUS_WAITING, activityLogRecord
            .getString("activity_log.step_status"));
        assertEquals("COMPLETED", activityLogRecord.getString("activity_log.status"));

        // satisfaction survey
        DataRecord satisfactionStepRecord = helpdeskStepLogDS
            .getRecord("table_name='activity_log' AND pkey_value=" + activityLogId
                    + " AND status='COMPLETED' AND step_type='survey' AND date_response IS NULL");
        JSONObject satisfactionRecord = record;
        satisfactionRecord.put("activity_log_step_waiting.step_log_id", satisfactionStepRecord
            .getInt("helpdesk_step_log.step_log_id"));
        satisfactionRecord.put("activity_log_step_waiting.activity_log_id", activityLogId);
        satisfactionRecord.put("activity_log.satisfaction", 5);
        satisfactionRecord.put("activity_log.satisfaction_notes", "good job");
        this.requestHandler.saveSatisfaction(satisfactionRecord);

        satisfactionStepRecord = helpdeskStepLogDS
            .getRecord("table_name='activity_log' AND pkey_value=" + activityLogId
                    + " AND status='COMPLETED' AND step_type='survey'");
        assertEquals(Constants.STEP_STATUS_NULL, satisfactionStepRecord
            .getString("helpdesk_step_log.step_status_result"));
        activityLogRecord = activityLogDS.getRecord("activity_log_id = " + activityLogId);
        assertEquals(Constants.STEP_STATUS_NULL, activityLogRecord
            .getString("activity_log.step_status"));
        assertEquals("COMPLETED", activityLogRecord.getString("activity_log.status"));

        // close request
        this.requestHandler.closeRequest(record);
        activityLogRecord = activityLogDS.getRecord("activity_log_id = " + activityLogId);
        assertEquals(Constants.STEP_STATUS_NULL, activityLogRecord
            .getString("activity_log.step_status"));
        assertEquals("CLOSED", activityLogRecord.getString("activity_log.status"));

        // archive request
        this.requestHandler.archiveRequest(Integer.toString(activityLogId), record);
        DataSource hactivityLogDS = DataSourceFactory.createDataSourceForFields("hactivity_log",
            activityLogFields);
        DataRecord hactivityLogRecord = hactivityLogDS.getRecord("activity_log_id = "
                + activityLogId);
        assertEquals("CLOSED", hactivityLogRecord.getString("hactivity_log.status"));
        assertEquals(Constants.STEP_STATUS_NULL, hactivityLogRecord
            .getString("hactivity_log.step_status"));

        SqlUtils.executeUpdate("hactivity_log",
            "DELETE FROM hactivity_log WHERE activity_log_id = " + activityLogId);
        SqlUtils.executeUpdate("helpdesk_step_log",
            "DELETE FROM helpdesk_step_log WHERE table_name='hactivity_log' AND pkey_value = "
                    + activityLogId);
    }

    public void testLongServiceDeskFlow() {
        JSONObject record = new JSONObject();
        record.put("activity_log.requestor", "CALLAWAY, JULIE");
        record.put("activity_log.site_id", "JFK");
        record.put("activity_log.bl_id", "JFK A");
        record.put("activity_log.fl_id", "04");
        record.put("activity_log.rm_id", "001");
        record.put("activity_log.activity_type", "SERVICE DESK - COPY SERVICE");
        record.put("activity_log.priority", "2");
        record.put("activity_log.description", "testing default value for step status");

        // create request
        this.requestHandler.submitRequest("", record);
        int activityLogId = DataStatistics
            .getInt("activity_log", "activity_log_id", "MAX",
                "activity_type='SERVICE DESK - COPY SERVICE' AND requestor ='CALLAWAY, JULIE' AND site_id='JFK'");

        assertNotNull(activityLogId);

        String[] activityLogFields = new String[] { "activity_log_id", "requestor", "site_id",
                "bl_id", "fl_id", "rm_id", "activity_type", "priority", "description", "status",
                "step_status" };
        DataSource activityLogDS = DataSourceFactory.createDataSourceForFields("activity_log",
            activityLogFields);

        DataRecord activityLogRecord = activityLogDS
            .getRecord("activity_log_id = " + activityLogId);
        assertEquals(Constants.STEP_STATUS_WAITING, activityLogRecord
            .getString("activity_log.step_status"));
        assertEquals("REQUESTED", activityLogRecord.getString("activity_log.status"));

        // check step status result of approval step
        String[] helpdeskStepLogFields = new String[] { "step_log_id", "step", "step_type",
                "step_status_result", "em_id", "status", "step_order" };
        DataSource helpdeskStepLogDS = DataSourceFactory.createDataSourceForFields(
            "helpdesk_step_log", helpdeskStepLogFields);
        DataRecord mgrApprovalRecord = helpdeskStepLogDS
            .getRecord("table_name='activity_log' AND pkey_value = " + activityLogId
                    + " AND status='REQUESTED' AND step_type='approval' AND date_response IS NULL");
        assertEquals(Constants.STEP_STATUS_NULL, mgrApprovalRecord
            .getString("helpdesk_step_log.step_status_result"));

        // approve request
        int mgrApprovalStepLogId = mgrApprovalRecord.getInt("helpdesk_step_log.step_log_id");

        record.put("activity_log.activity_log_id", activityLogId);
        record.put("activity_log_step_waiting.step_log_id", mgrApprovalStepLogId);
        this.requestHandler.approveRequest(record, "ok");

        mgrApprovalRecord = helpdeskStepLogDS.getRecord("step_log_id = " + mgrApprovalStepLogId);
        assertEquals("approved", mgrApprovalRecord
            .getString("helpdesk_step_log.step_status_result"));

        activityLogRecord = activityLogDS.getRecord("activity_log_id = " + activityLogId);
        assertEquals(Constants.STEP_STATUS_WAITING, activityLogRecord
            .getString("activity_log.step_status"));
        assertEquals("REQUESTED", activityLogRecord.getString("activity_log.status"));

        // approve request
        DataRecord facApprovalRecord = helpdeskStepLogDS
            .getRecord("table_name='activity_log' AND pkey_value = " + activityLogId
                    + " AND status='REQUESTED' AND step_type='approval' AND date_response IS NULL");
        assertEquals(Constants.STEP_STATUS_NULL, facApprovalRecord
            .getString("helpdesk_step_log.step_status_result"));
        int facApprovalStepLogId = facApprovalRecord.getInt("helpdesk_step_log.step_log_id");
        record.put("activity_log_step_waiting.step_log_id", facApprovalStepLogId);
        this.requestHandler.approveRequest(record, "okok");

        activityLogRecord = activityLogDS.getRecord("activity_log_id = " + activityLogId);
        assertEquals(Constants.STEP_STATUS_WAITING, activityLogRecord
            .getString("activity_log.step_status"));
        assertEquals("APPROVED", activityLogRecord.getString("activity_log.status"));

        // accept request
        DataRecord acceptanceRecord = helpdeskStepLogDS
            .getRecord("table_name='activity_log' AND pkey_value = " + activityLogId
                    + " AND status='APPROVED' AND step_type='acceptance' AND date_response IS NULL");
        assertEquals(Constants.STEP_STATUS_NULL, acceptanceRecord
            .getString("helpdesk_step_log.step_status_result"));
        int acceptanceStepLogId = acceptanceRecord.getInt("helpdesk_step_log.step_log_id");

        record.put("activity_log_step_waiting.step_log_id", acceptanceStepLogId);
        this.requestHandler.acceptRequest(record, "wilco");

        acceptanceRecord = helpdeskStepLogDS.getRecord("step_log_id = " + acceptanceStepLogId);
        assertEquals("accepted", acceptanceRecord.getString("helpdesk_step_log.step_status_result"));
        activityLogRecord = activityLogDS.getRecord("activity_log_id = " + activityLogId);
        assertEquals(Constants.STEP_STATUS_NULL, activityLogRecord
            .getString("activity_log.step_status"));
        assertEquals("APPROVED", activityLogRecord.getString("activity_log.status"));

        // issue request
        record.remove("activity_log_step_waiting.step_log_id");
        this.requestHandler.issueRequest(record);
        activityLogRecord = activityLogDS.getRecord("activity_log_id = " + activityLogId);
        assertEquals(Constants.STEP_STATUS_WAITING, activityLogRecord
            .getString("activity_log.step_status"));
        assertEquals("IN PROGRESS", activityLogRecord.getString("activity_log.status"));

        // issue approval
        DataRecord issueAppRecord = helpdeskStepLogDS
            .getRecord("table_name='activity_log' AND pkey_value = "
                    + activityLogId
                    + " AND status='IN PROGRESS' AND step_type='approval' AND date_response IS NULL");
        assertEquals(Constants.STEP_STATUS_NULL, issueAppRecord
            .getString("helpdesk_step_log.step_status_result"));
        int issueAppStepLogId = issueAppRecord.getInt("helpdesk_step_log.step_log_id");
        record.put("activity_log_step_waiting.step_log_id", issueAppStepLogId);
        this.requestHandler.approveRequest(record, "issue ok");

        issueAppRecord = helpdeskStepLogDS.getRecord("step_log_id = " + issueAppStepLogId);
        assertEquals("approved", issueAppRecord.getString("helpdesk_step_log.step_status_result"));

        // complete request
        record.remove("activity_log_step_waiting.step_log_id");
        this.requestHandler.completeRequest(record);
        activityLogRecord = activityLogDS.getRecord("activity_log_id = " + activityLogId);
        assertEquals(Constants.STEP_STATUS_WAITING, activityLogRecord
            .getString("activity_log.step_status"));
        assertEquals("COMPLETED", activityLogRecord.getString("activity_log.status"));

        // verification - reissue request
        DataRecord verificationRecord = helpdeskStepLogDS
            .getRecord("table_name='activity_log' AND pkey_value = " + activityLogId
                    + " AND step_type='verification' AND date_response IS NULL");
        record.put("activity_log_step_waiting.activity_log_id", activityLogId);
        int verificationStepLogId = verificationRecord.getInt("helpdesk_step_log.step_log_id");
        record.put("activity_log_step_waiting.step_log_id", verificationStepLogId);
        record.put("activity_log_step_waiting.comments", "not good, redo");

        this.requestHandler.returnRequestIncomplete(record);
        activityLogRecord = activityLogDS.getRecord("activity_log_id = " + activityLogId);
        assertEquals(Constants.STEP_STATUS_WAITING, activityLogRecord
            .getString("activity_log.step_status"));
        assertEquals("IN PROGRESS", activityLogRecord.getString("activity_log.status"));
        verificationRecord = helpdeskStepLogDS.getRecord("step_log_id = " + verificationStepLogId);
        assertEquals("rejected", verificationRecord
            .getString("helpdesk_step_log.step_status_result"));

        // issue approval
        issueAppRecord = helpdeskStepLogDS.getRecord("table_name='activity_log' AND pkey_value = "
                + activityLogId
                + " AND status='IN PROGRESS' AND step_type='approval' AND date_response IS NULL");
        assertEquals(Constants.STEP_STATUS_NULL, issueAppRecord
            .getString("helpdesk_step_log.step_status_result"));
        issueAppStepLogId = issueAppRecord.getInt("helpdesk_step_log.step_log_id");
        record.put("activity_log_step_waiting.step_log_id", issueAppStepLogId);
        this.requestHandler.approveRequest(record, "issue ok");

        activityLogRecord = activityLogDS.getRecord("activity_log_id = " + activityLogId);
        assertEquals(Constants.STEP_STATUS_NULL, activityLogRecord
            .getString("activity_log.step_status"));
        assertEquals("IN PROGRESS", activityLogRecord.getString("activity_log.status"));
        issueAppRecord = helpdeskStepLogDS.getRecord("step_log_id = " + issueAppStepLogId);
        assertEquals("approved", issueAppRecord.getString("helpdesk_step_log.step_status_result"));

        // complete request
        record.remove("activity_log_step_waiting.activity_log_id");
        record.remove("activity_log_step_waiting.step_log_id");
        record.remove("activity_log_step_waiting.comments");
        this.requestHandler.completeRequest(record);
        activityLogRecord = activityLogDS.getRecord("activity_log_id = " + activityLogId);
        assertEquals(Constants.STEP_STATUS_WAITING, activityLogRecord
            .getString("activity_log.step_status"));
        assertEquals("COMPLETED", activityLogRecord.getString("activity_log.status"));

        verificationRecord = helpdeskStepLogDS
            .getRecord("table_name='activity_log' AND pkey_value = " + activityLogId
                    + " AND step_type='verification' AND date_response IS NULL");
        record.put("activity_log_step_waiting.activity_log_id", activityLogId);
        verificationStepLogId = verificationRecord.getInt("helpdesk_step_log.step_log_id");
        record.put("activity_log_step_waiting.step_log_id", verificationStepLogId);
        record.put("activity_log_step_waiting.comments", "now it's good");

        this.requestHandler.verifyRequest(record);
        activityLogRecord = activityLogDS.getRecord("activity_log_id = " + activityLogId);
        assertEquals(Constants.STEP_STATUS_NULL, activityLogRecord
            .getString("activity_log.step_status"));
        assertEquals("COMPLETED", activityLogRecord.getString("activity_log.status"));
        verificationRecord = helpdeskStepLogDS.getRecord("step_log_id = " + verificationStepLogId);
        assertEquals("verified", verificationRecord
            .getString("helpdesk_step_log.step_status_result"));

        // close request
        this.requestHandler.closeRequest(record);
        activityLogRecord = activityLogDS.getRecord("activity_log_id = " + activityLogId);
        assertEquals(Constants.STEP_STATUS_NULL, activityLogRecord
            .getString("activity_log.step_status"));
        assertEquals("CLOSED", activityLogRecord.getString("activity_log.status"));

        // archive request
        this.requestHandler.archiveRequest(Integer.toString(activityLogId), record);
        DataSource hactivityLogDS = DataSourceFactory.createDataSourceForFields("hactivity_log",
            activityLogFields);
        DataRecord hactivityLogRecord = hactivityLogDS.getRecord("activity_log_id = "
                + activityLogId);
        assertEquals("CLOSED", hactivityLogRecord.getString("hactivity_log.status"));
        assertEquals(Constants.STEP_STATUS_NULL, hactivityLogRecord
            .getString("hactivity_log.step_status"));

        SqlUtils.executeUpdate("hactivity_log",
            "DELETE FROM hactivity_log WHERE activity_log_id = " + activityLogId);
        SqlUtils.executeUpdate("helpdesk_step_log",
            "DELETE FROM helpdesk_step_log WHERE table_name='hactivity_log' AND pkey_value = "
                    + activityLogId);
    }

    public void testOnDemandFlow() throws ParseException {
        JSONObject record = new JSONObject();
        record.put("activity_log.requestor", "DECKER, MIKE");
        record.put("activity_log.site_id", "JFK");
        record.put("activity_log.activity_type", "SERVICE DESK - MAINTENANCE");
        record.put("activity_log.prob_type", "PAINT");
        record.put("activity_log.description", "testing stepstatus");
        record.put("activity_log.priority", 1);

        // submit request
        this.requestHandler.submitRequest("", record);
        int activityLogId = DataStatistics
            .getInt(
                "activity_log",
                "activity_log_id",
                "MAX",
                "activity_type='SERVICE DESK - MAINTENANCE' AND requestor ='DECKER, MIKE' AND site_id='JFK' AND prob_type='PAINT'");
        assertNotNull(activityLogId);

        String[] activityLogFields = new String[] { "activity_log_id", "requestor", "site_id",
                "bl_id", "fl_id", "rm_id", "activity_type", "priority", "description", "status",
                "step_status", "supervisor", "prob_type" };
        DataSource activityLogDS = DataSourceFactory.createDataSourceForFields("activity_log",
            activityLogFields);

        DataRecord activityLogRecord = activityLogDS
            .getRecord("activity_log_id = " + activityLogId);
        assertEquals("REQUESTED", activityLogRecord.getString("activity_log.status"));
        assertEquals(Constants.STEP_STATUS_WAITING, activityLogRecord
            .getString("activity_log.step_status"));

        String[] helpdeskStepLogFields = new String[] { "step_log_id", "step", "step_type",
                "step_status_result", "em_id", "status", "step_order" };
        DataSource helpdeskStepLogDS = DataSourceFactory.createDataSourceForFields(
            "helpdesk_step_log", helpdeskStepLogFields);

        DataRecord editApproveStepLogRecord = helpdeskStepLogDS
            .getRecord("table_name='activity_log' AND pkey_value = " + activityLogId
                    + " AND step_type='review' AND date_response IS NULL");

        assertEquals(Constants.STEP_STATUS_NULL, editApproveStepLogRecord
            .getString("helpdesk_step_log.step_status_result"));
        int editApproveStepLogId = editApproveStepLogRecord.getInt("helpdesk_step_log.step_log_id");
        // edit and approve
        record.put("activity_log.activity_log_id", activityLogId);
        record.put("activity_log.bl_id", "JFK A");
        record.put("activity_log.fl_id", "04");
        record.put("activity_log.rm_id", "011");

        record.put("activity_log_step_waiting.step_log_id", editApproveStepLogId);
        this.requestHandler.reviewRequest(record, "ok");

        editApproveStepLogRecord = helpdeskStepLogDS.getRecord("step_log_id = "
                + editApproveStepLogId);
        assertEquals("approved", editApproveStepLogRecord
            .getString("helpdesk_step_log.step_status_result"));

        activityLogRecord = activityLogDS.getRecord("activity_log_id = " + activityLogId);
        assertEquals("REQUESTED", activityLogRecord.getString("activity_log.status"));
        assertEquals(Constants.STEP_STATUS_WAITING, activityLogRecord
            .getString("activity_log.step_status"));

        DataRecord mgrApprovalRecord = helpdeskStepLogDS
            .getRecord("table_name='activity_log' AND pkey_value = " + activityLogId
                    + " AND step_type='approval' AND date_response IS NULL");
        assertEquals(Constants.STEP_STATUS_NULL, mgrApprovalRecord
            .getString("helpdesk_step_log.step_status_result"));
        int mgrApprovalStepLogId = mgrApprovalRecord.getInt("helpdesk_step_log.step_log_id");
        record.put("activity_log_step_waiting.step_log_id", mgrApprovalStepLogId);

        this.requestHandler.approveRequest(record, "ok");
        activityLogRecord = activityLogDS.getRecord("activity_log_id = " + activityLogId);
        assertEquals("APPROVED", activityLogRecord.getString("activity_log.status"));
        assertEquals(Constants.STEP_STATUS_WAITING, activityLogRecord
            .getString("activity_log.step_status"));

        mgrApprovalRecord = helpdeskStepLogDS.getRecord("step_log_id = " + mgrApprovalStepLogId);
        assertEquals("approved", mgrApprovalRecord
            .getString("helpdesk_step_log.step_status_result"));

        DataRecord notificationRecord = helpdeskStepLogDS
            .getRecord("table_name='activity_log' AND pkey_value = " + activityLogId
                    + " AND step_type='notification' AND status = 'REQUESTED'");
        assertEquals(Constants.STEP_STATUS_NULL, notificationRecord
            .getString("helpdesk_step_log.step_status_result"));

        // dispatch request
        DataRecord dispatchRecord = helpdeskStepLogDS
            .getRecord("table_name='activity_log' AND pkey_value = " + activityLogId
                    + " AND step_type='dispatch' AND date_response IS NULL");
        assertEquals(Constants.STEP_STATUS_NULL, dispatchRecord
            .getString("helpdesk_step_log.step_status_result"));

        int dispatchStepLogId = dispatchRecord.getInt("helpdesk_step_log.step_log_id");

        record.put("activity_log_step_waiting.step_log_id", dispatchStepLogId);
        record.put("activity_log.supervisor", "CRAFTSPERSON");
        this.workRequestHandler.dispatchRequest("activity_log", "activity_log_id", Integer
            .toString(activityLogId), record, "go for it");

        dispatchRecord = helpdeskStepLogDS.getRecord("step_log_id = " + dispatchStepLogId);
        assertEquals("dispatched", dispatchRecord.getString("helpdesk_step_log.step_status_result"));

        activityLogRecord = activityLogDS.getRecord("activity_log_id = " + activityLogId);
        assertEquals("APPROVED", activityLogRecord.getString("activity_log.status"));
        assertEquals(Constants.STEP_STATUS_NULL, activityLogRecord
            .getString("activity_log.step_status"));

        JSONArray records = new JSONArray("[{'activity_log.activity_log_id':" + activityLogId
                + "}]");
        this.workRequestHandler.createWorkRequestFromHelpRequest(records, null);

        String[] wrFields = new String[] { "wr_id", "activity_log_id", "supervisor", "status",
                "step_status", "site_id", "bl_id", "fl_id", "rm_id", "prob_type", "activity_type",
                "description", "wo_id" };
        DataSource workRequestDS = DataSourceFactory.createDataSourceForFields("wr", wrFields);
        DataRecord workRequestRecord = workRequestDS
            .getRecord("activity_log_id = " + activityLogId);
        int wrId = workRequestRecord.getInt("wr.wr_id");
        assertEquals("A", workRequestRecord.getString("wr.status"));
        assertEquals(Constants.STEP_STATUS_WAITING, workRequestRecord.getString("wr.step_status"));

        JSONObject wrRecord = new JSONObject();
        wrRecord.put("wr.wr_id", wrId);
        wrRecord.put("wr.bl_id", "JFK A");
        wrRecord.put("wr.fl_id", "04");
        wrRecord.put("wr.rm_id", "011");
        wrRecord.put("wr.requestor", "DECKER, MIKE");
        wrRecord.put("wr.site_id", "JFK");
        wrRecord.put("wr.activity_type", "SERVICE DESK - MAINTENANCE");
        wrRecord.put("wr.prob_type", "PAINT");
        wrRecord.put("wr.description", "testing stepstatus");
        wrRecord.put("wr.priority", 1);

        DataRecord estimationRecord = helpdeskStepLogDS
            .getRecord("table_name='wr' AND pkey_value = " + wrId
                    + " AND step_type='estimation' AND date_response IS NULL AND status='A'");
        assertEquals(Constants.STEP_STATUS_NULL, estimationRecord
            .getString("helpdesk_step_log.step_status_result"));
        int estimationStepLogId = estimationRecord.getInt("helpdesk_step_log.step_log_id");

        wrRecord.put("wr_step_waiting.step_log_id", estimationStepLogId);
        this.workRequestHandler.completeEstimation("wr", "wr_id", Integer.toString(wrId), wrRecord);
        workRequestRecord = workRequestDS.getRecord("wr_id = " + wrId);
        assertEquals("A", workRequestRecord.getString("wr.status"));
        assertEquals(Constants.STEP_STATUS_WAITING, workRequestRecord.getString("wr.step_status"));

        estimationRecord = helpdeskStepLogDS.getRecord("step_log_id = " + estimationStepLogId);
        assertEquals("estimated", estimationRecord
            .getString("helpdesk_step_log.step_status_result"));

        DataRecord estimationApprovalRecord = helpdeskStepLogDS
            .getRecord("table_name='wr' AND pkey_value = " + wrId
                    + " AND step_type='approval' AND status = 'A' AND date_response IS NULL");
        assertEquals(Constants.STEP_STATUS_NULL, estimationApprovalRecord
            .getString("helpdesk_step_log.step_status_result"));

        int estimationApprovalStepLogId = estimationApprovalRecord
            .getInt("helpdesk_step_log.step_log_id");

        wrRecord.put("wr_step_waiting.step_log_id", estimationApprovalStepLogId);
        this.workRequestHandler.approveWorkRequest(wrRecord, "estimation ok");

        workRequestRecord = workRequestDS.getRecord("wr_id = " + wrId);
        assertEquals("A", workRequestRecord.getString("wr.status"));
        assertEquals(Constants.STEP_STATUS_NULL, workRequestRecord.getString("wr.step_status"));

        estimationApprovalRecord = helpdeskStepLogDS.getRecord("step_log_id = "
                + estimationApprovalStepLogId);
        assertEquals("approved", estimationApprovalRecord
            .getString("helpdesk_step_log.step_status_result"));

        JSONObject woRecord = new JSONObject();
        woRecord.put("bl_id", "JFK A");
        woRecord.put("priority", 1);
        woRecord.put("description", "test");

        // create work order
        JSONArray wrRecords = new JSONArray("[{wr.wr_id:" + wrId + "}]");
        this.workRequestHandler.saveNewWorkorder(woRecord, wrRecords, Integer
            .toString(activityLogId), "");

        workRequestRecord = workRequestDS.getRecord("wr_id = " + wrId);
        int woId = workRequestRecord.getInt("wr.wo_id");

        String[] woFields = new String[] { "wo_id", "bl_id", "priority", "description",
                "date_closed", "date_issued" };
        DataSource workOrderDS = DataSourceFactory.createDataSourceForFields("wo", woFields);
        DataRecord workOrderRecord = workOrderDS.getRecord("wo_id=" + woId);
        assertNotNull(workOrderRecord);

        assertEquals("AA", workRequestRecord.getString("wr.status"));
        assertEquals(Constants.STEP_STATUS_WAITING, workRequestRecord.getString("wr.step_status"));

        // schedule work request
        DataRecord scheduleRecord = helpdeskStepLogDS.getRecord("table_name='wr' AND pkey_value= "
                + wrId + " AND status = 'AA' AND step_type='scheduling' AND date_response IS NULL");
        assertEquals(Constants.STEP_STATUS_NULL, scheduleRecord
            .getString("helpdesk_step_log.step_status_result"));
        int scheduleStepLogId = scheduleRecord.getInt("helpdesk_step_log.step_log_id");
        wrRecord.put("wr_step_waiting.step_log_id", scheduleStepLogId);
        this.workRequestHandler.completeScheduling(wrRecord);

        scheduleRecord = helpdeskStepLogDS.getRecord("step_log_id = " + scheduleStepLogId);
        workRequestRecord = workRequestDS.getRecord("wr_id = " + wrId);
        assertEquals("AA", workRequestRecord.getString("wr.status"));
        assertEquals(Constants.STEP_STATUS_WAITING, workRequestRecord.getString("wr.step_status"));

        DataRecord scheduleAppRecord = helpdeskStepLogDS
            .getRecord("table_name='wr' AND pkey_value = " + wrId
                    + " AND status='AA' AND step_type='approval' AND date_response IS NULL");

        assertEquals(Constants.STEP_STATUS_NULL, scheduleAppRecord
            .getString("helpdesk_step_log.step_status_result"));
        int scheduleAppStepLogId = scheduleAppRecord.getInt("helpdesk_step_log.step_log_id");
        wrRecord.put("wr_step_waiting.step_log_id", scheduleAppStepLogId);

        this.workRequestHandler.approveWorkRequest(wrRecord, "schedule ok");

        scheduleAppRecord = helpdeskStepLogDS.getRecord("step_log_id = " + scheduleAppStepLogId);
        assertEquals("approved", scheduleAppRecord
            .getString("helpdesk_step_log.step_status_result"));

        workRequestRecord = workRequestDS.getRecord("wr_id = " + wrId);
        assertEquals("AA", workRequestRecord.getString("wr.status"));
        assertEquals(Constants.STEP_STATUS_NULL, workRequestRecord.getString("wr.step_status"));

        this.workRequestHandler.issueWorkorder(Integer.toString(woId));
        workRequestRecord = workRequestDS.getRecord("wr_id = " + wrId);
        assertEquals("I", workRequestRecord.getString("wr.status"));
        assertEquals(Constants.STEP_STATUS_NULL, workRequestRecord.getString("wr.step_status"));

        notificationRecord = helpdeskStepLogDS.getRecord("table_name='wr' AND pkey_value = " + wrId
                + " AND status='I' AND step_type='notification'");
        assertEquals(Constants.STEP_STATUS_NULL, notificationRecord
            .getString("helpdesk_step_log.step_status_result"));

        activityLogRecord = activityLogDS.getRecord("activity_log_id = " + activityLogId);
        assertEquals("IN PROGRESS", activityLogRecord.getString("activity_log.status"));
        assertEquals(Constants.STEP_STATUS_NULL, activityLogRecord
            .getString("activity_log.step_status"));

        workOrderRecord = workOrderDS.getRecord("wo_id = " + woId);
        assertNotNull(workOrderRecord.getValue("wo.date_issued"));

        wrRecord.remove("wr_step_waiting.step_log_id");
        wrRecord.put("wr.cf_notes", "done");
        this.workRequestHandler.updateWorkRequestStatus(wrRecord, "Com");

        workRequestRecord = workRequestDS.getRecord("wr_id = " + wrId);
        assertEquals("Com", workRequestRecord.getString("wr.status"));
        assertEquals(Constants.STEP_STATUS_WAITING, workRequestRecord.getString("wr.step_status"));

        activityLogRecord = activityLogDS.getRecord("activity_log_id = " + activityLogId);
        assertEquals("IN PROGRESS", activityLogRecord.getString("activity_log.status"));
        assertEquals(Constants.STEP_STATUS_NULL, activityLogRecord
            .getString("activity_log.step_status"));

        DataRecord verificationRecord = helpdeskStepLogDS
            .getRecord("table_name='wr' AND pkey_value=" + wrId
                    + " AND status = 'Com' AND step_type='verification' AND date_response IS NULL");

        assertEquals(Constants.STEP_STATUS_NULL, verificationRecord
            .getString("helpdesk_step_log.step_status_result"));
        int verificationStepLogId = verificationRecord.getInt("helpdesk_step_log.step_log_id");

        wrRecord.put("wr_step_waiting.step_log_id", verificationStepLogId);
        wrRecord.put("wr_step_waiting.wr_id", wrId);
        wrRecord.put("wr_step_waiting.comments", "ok");

        this.workRequestHandler.verifyWorkRequest(wrRecord);
        workRequestRecord = workRequestDS.getRecord("wr_id = " + wrId);
        assertEquals("Com", workRequestRecord.getString("wr.status"));
        assertEquals(Constants.STEP_STATUS_NULL, workRequestRecord.getString("wr.step_status"));

        activityLogRecord = activityLogDS.getRecord("activity_log_id = " + activityLogId);
        assertEquals("COMPLETED", activityLogRecord.getString("activity_log.status"));
        assertEquals(Constants.STEP_STATUS_WAITING, activityLogRecord
            .getString("activity_log.step_status"));

        DataRecord satisfactionRecord = helpdeskStepLogDS
            .getRecord("table_name='activity_log' AND pkey_value = " + activityLogId
                    + " AND status='COMPLETED' AND step_type='survey' AND date_response IS NULL");
        int satisfactionStepLogId = satisfactionRecord.getInt("helpdesk_step_log.step_log_id");

        record.put("activity_log_step_waiting.step_log_id", satisfactionStepLogId);
        record.put("activity_log.satisfaction_notes", "nice work");
        record.put("activity_log.satisfaction", 4);
        record.put("activity_log_step_waiting.activity_log_id", activityLogId);
        this.requestHandler.saveSatisfaction(record);

        satisfactionRecord = helpdeskStepLogDS.getRecord("step_log_id = " + satisfactionStepLogId);
        assertEquals(Constants.STEP_STATUS_NULL, satisfactionRecord
            .getString("helpdesk_step_log.step_status_result"));

        activityLogRecord = activityLogDS.getRecord("activity_log_id = " + activityLogId);
        assertEquals("COMPLETED", activityLogRecord.getString("activity_log.status"));
        assertEquals(Constants.STEP_STATUS_NULL, activityLogRecord
            .getString("activity_log.step_status"));

        this.workRequestHandler.closeWorkOrder(Integer.toString(woId));

        DataSource hactivityLogDS = DataSourceFactory.createDataSourceForFields("hactivity_log",
            activityLogFields);
        DataRecord hactivityLogRecord = hactivityLogDS.getRecord("activity_log_id = "
                + activityLogId);
        assertEquals("CLOSED", hactivityLogRecord.getString("hactivity_log.status"));
        assertEquals(Constants.STEP_STATUS_NULL, hactivityLogRecord
            .getString("hactivity_log.step_status"));

        DataSource hWrDS = DataSourceFactory.createDataSourceForFields("hwr", wrFields);
        DataRecord hWrRecord = hWrDS.getRecord("wr_id = " + wrId);
        assertEquals("Clo", hWrRecord.getString("hwr.status"));
        assertEquals(Constants.STEP_STATUS_NULL, hWrRecord.getString("hwr.step_status"));

        DataSource hWoDS = DataSourceFactory.createDataSourceForFields("hwo", woFields);
        DataRecord hWoRecord = hWoDS.getRecord("wo_id = " + woId);
        assertNotNull(hWoRecord.getValue("hwo.date_closed"));

        SqlUtils.executeUpdate("hwo", "DELETE FROM hwo WHERE wo_id = " + woId);
        SqlUtils.executeUpdate("hwr", "DELETE FROM hwr WHERE wr_id = " + wrId);
        SqlUtils.executeUpdate("hactivity_log",
            "DELETE FROM hactivity_log WHERE activity_log_id = " + activityLogId);
        SqlUtils.executeUpdate("helpdesk_step_log",
            "DELETE FROM helpdesk_step_log WHERE (table_name='hactivity_log' AND pkey_value = "
                    + activityLogId + ") OR (table_name='hwr' AND pkey_value = " + wrId + ")");

    }
}
