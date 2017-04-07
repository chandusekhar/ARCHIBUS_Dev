package com.archibus.eventhandler.steps;

import java.text.ParseException;
import java.util.List;

import org.json.JSONObject;

import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.eventhandler.helpdesk.RequestHandler;

public class EditAndApproveTest extends DataSourceTestBase {

    RequestHandler classHandler = new RequestHandler();

    public void testEditAndApproveWithoutChange() throws ParseException {
        JSONObject record = new JSONObject();
        record.put("activity_log.activity_type", "SERVICE DESK - HOTELING");
        record.put("activity_log.site_id", "MARKET");
        record.put("activity_log.bl_id", "HQ");
        record.put("activity_log.requestor", "BARTLETT, JOAN");
        record.put("activity_log.priority", 1);
        record.put("activity_log.description", "testing");

        this.classHandler.submitRequest("", record);
        int activityLogId = DataStatistics.getInt("activity_log", "activity_log_id", "MAX",
            "activity_type='SERVICE DESK - HOTELING'");
        assertNotNull(activityLogId);
        int reviewStepLogId = DataStatistics.getInt("helpdesk_step_log", "step_log_id", "MAX",
            "table_name='activity_log' AND pkey_value = " + activityLogId
                    + " AND step_type='review'");
        assertNotNull(reviewStepLogId);

        record.put("activity_log.activity_log_id", activityLogId);
        record.put("activity_log_step_waiting.step_log_id", reviewStepLogId);

        this.classHandler.reviewRequest(record, "testing Edit and Approve");

        String SQL = "SELECT step_status_result FROM helpdesk_step_log WHERE step_log_id = "
                + reviewStepLogId;
        String[] flds = { "step_status_result" };
        List<DataRecord> records = SqlUtils.executeQuery("helpdesk_step_log", flds, SQL);
        DataRecord stepRecord = records.get(0);
        assertEquals("approved", stepRecord.getString("helpdesk_step_log.step_status_result"));

        SQL = "SELECT status, assigned_to FROM activity_log WHERE activity_log_id = "
                + activityLogId;
        flds = new String[] { "status", "assigned_to" };
        records = SqlUtils.executeQuery("activity_log", flds, SQL);
        DataRecord activityLogRecord = records.get(0);
        assertEquals("APPROVED", activityLogRecord.getString("activity_log.status"));
        assertEquals("ADAMS, CHRIS", activityLogRecord.getString("activity_log.assigned_to"));

        SqlUtils.executeUpdate("activity_log", "DELETE FROM activity_log WHERE activity_log_id = "
                + activityLogId);
        SqlUtils.executeUpdate("helpdesk_step_log",
            "DELETE FROM helpdesk_step_log WHERE table_name='activity_log' AND pkey_value = "
                    + activityLogId);
    }

    public void testEditAndApproveChangeToPriority2() {
        JSONObject record = new JSONObject();
        record.put("activity_log.activity_type", "SERVICE DESK - HOTELING");
        record.put("activity_log.site_id", "MARKET");
        record.put("activity_log.bl_id", "HQ");
        record.put("activity_log.requestor", "BARTLETT, JOAN");
        record.put("activity_log.priority", 1);
        record.put("activity_log.description", "testing");

        this.classHandler.submitRequest("", record);
        int activityLogId = DataStatistics.getInt("activity_log", "activity_log_id", "MAX",
            "activity_type='SERVICE DESK - HOTELING'");
        assertNotNull(activityLogId);
        int reviewStepLogId = DataStatistics.getInt("helpdesk_step_log", "step_log_id", "MAX",
            "table_name='activity_log' AND pkey_value = " + activityLogId
                    + " AND step_type='review'");
        assertNotNull(reviewStepLogId);

        record.put("activity_log.activity_log_id", activityLogId);
        record.put("activity_log_step_waiting.step_log_id", reviewStepLogId);
        record.put("activity_log.priority", 2);

        this.classHandler.reviewRequest(record, "testing Edit and Approve with change priority");

        String SQL = "SELECT step_status_result,comments FROM helpdesk_step_log WHERE step_log_id = "
                + reviewStepLogId;
        String[] flds = new String[] { "step_status_result", "comments" };
        List<DataRecord> records = SqlUtils.executeQuery("helpdesk_step_log", flds, SQL);
        DataRecord stepRecord = records.get(0);
        assertEquals("approved", stepRecord.getString("helpdesk_step_log.step_status_result"));
        assertEquals("AFM :: Request has been reviewed for fields [priority]", stepRecord
            .getString("helpdesk_step_log.comments"));

        SQL = "SELECT status,step_status FROM activity_log WHERE activity_log_id = "
                + activityLogId;
        flds = new String[] { "status", "step_status" };
        records = SqlUtils.executeQuery("activity_log", flds, SQL);
        DataRecord activityLogRecord = records.get(0);
        assertEquals("REQUESTED", activityLogRecord.getString("activity_log.status"));
        assertEquals("waiting", activityLogRecord.getString("activity_log.step_status"));

        int approvalStepLogId = DataStatistics.getInt("helpdesk_step_log", "step_log_id", "MAX",
            "table_name='activity_log' AND pkey_value = " + activityLogId
                    + " AND step_type='approval'");
        assertNotNull(approvalStepLogId);

        SQL = "SELECT em_id, step FROM helpdesk_step_log WHERE step_log_id = " + approvalStepLogId;
        flds = new String[] { "em_id", "step" };
        records = SqlUtils.executeQuery("helpdesk_step_log", flds, SQL);
        stepRecord = records.get(0);
        assertEquals("BARTLETT, JOAN", stepRecord.getString("helpdesk_step_log.em_id"));
        assertEquals("Facility Approval", stepRecord.getString("helpdesk_step_log.step"));

        SqlUtils.executeUpdate("activity_log", "DELETE FROM activity_log WHERE activity_log_id = "
                + activityLogId);
        SqlUtils.executeUpdate("helpdesk_step_log",
            "DELETE FROM helpdesk_step_log WHERE table_name='activity_log' AND pkey_value = "
                    + activityLogId);
    }

    public void testEditAndApproveChangeToPriority3() {
        JSONObject record = new JSONObject();
        record.put("activity_log.activity_type", "SERVICE DESK - HOTELING");
        record.put("activity_log.site_id", "MARKET");
        record.put("activity_log.bl_id", "HQ");
        record.put("activity_log.requestor", "BARTLETT, JOAN");
        record.put("activity_log.priority", 1);
        record.put("activity_log.description", "testing");

        this.classHandler.submitRequest("", record);
        int activityLogId = DataStatistics.getInt("activity_log", "activity_log_id", "MAX",
            "activity_type='SERVICE DESK - HOTELING'");
        assertNotNull(activityLogId);
        int reviewStepLogId = DataStatistics.getInt("helpdesk_step_log", "step_log_id", "MAX",
            "table_name='activity_log' AND pkey_value = " + activityLogId
                    + " AND step_type='review'");
        assertNotNull(reviewStepLogId);

        record.put("activity_log.activity_log_id", activityLogId);
        record.put("activity_log_step_waiting.step_log_id", reviewStepLogId);
        record.put("activity_log.priority", 3);

        this.classHandler.reviewRequest(record, "testing Edit and Approve with change priority");

        String SQL = "SELECT step_status_result,comments FROM helpdesk_step_log WHERE step_log_id = "
                + reviewStepLogId;
        String[] flds = new String[] { "step_status_result", "comments" };
        List<DataRecord> records = SqlUtils.executeQuery("helpdesk_step_log", flds, SQL);
        DataRecord stepRecord = records.get(0);
        assertEquals("approved", stepRecord.getString("helpdesk_step_log.step_status_result"));
        assertEquals("AFM :: Request has been reviewed for fields [priority]", stepRecord
            .getString("helpdesk_step_log.comments"));

        SQL = "SELECT status,step_status FROM activity_log WHERE activity_log_id = "
                + activityLogId;
        flds = new String[] { "status", "step_status" };
        records = SqlUtils.executeQuery("activity_log", flds, SQL);
        DataRecord activityLogRecord = records.get(0);
        assertEquals("APPROVED", activityLogRecord.getString("activity_log.status"));
        assertEquals("waiting", activityLogRecord.getString("activity_log.step_status"));

        int acceptanceStepLogId = DataStatistics.getInt("helpdesk_step_log", "step_log_id", "MAX",
            "table_name='activity_log' AND pkey_value = " + activityLogId
                    + " AND step_type='acceptance'");
        assertNotNull(acceptanceStepLogId);

        SQL = "SELECT em_id, step FROM helpdesk_step_log WHERE step_log_id = "
                + acceptanceStepLogId;
        flds = new String[] { "em_id", "step" };
        records = SqlUtils.executeQuery("helpdesk_step_log", flds, SQL);
        stepRecord = records.get(0);
        assertEquals("ABERNATHY, ALISON", stepRecord.getString("helpdesk_step_log.em_id"));
        assertEquals("Employee Acceptance", stepRecord.getString("helpdesk_step_log.step"));

        SqlUtils.executeUpdate("activity_log", "DELETE FROM activity_log WHERE activity_log_id = "
                + activityLogId);
        SqlUtils.executeUpdate("helpdesk_step_log",
            "DELETE FROM helpdesk_step_log WHERE table_name='activity_log' AND pkey_value = "
                    + activityLogId);
    }

    public void testEditAndApproveChangeToPriority4() {
        JSONObject record = new JSONObject();
        record.put("activity_log.activity_type", "SERVICE DESK - HOTELING");
        record.put("activity_log.site_id", "MARKET");
        record.put("activity_log.bl_id", "HQ");
        record.put("activity_log.requestor", "BARTLETT, JOAN");
        record.put("activity_log.priority", 1);
        record.put("activity_log.description", "testing");

        this.classHandler.submitRequest("", record);
        int activityLogId = DataStatistics.getInt("activity_log", "activity_log_id", "MAX",
            "activity_type='SERVICE DESK - HOTELING'");
        assertNotNull(activityLogId);
        int reviewStepLogId = DataStatistics.getInt("helpdesk_step_log", "step_log_id", "MAX",
            "table_name='activity_log' AND pkey_value = " + activityLogId
                    + " AND step_type='review'");
        assertNotNull(reviewStepLogId);

        record.put("activity_log.activity_log_id", activityLogId);
        record.put("activity_log_step_waiting.step_log_id", reviewStepLogId);
        record.put("activity_log.priority", 4);

        this.classHandler.reviewRequest(record, "testing Edit and Approve with change priority");

        String SQL = "SELECT step_status_result,comments FROM helpdesk_step_log WHERE step_log_id = "
                + reviewStepLogId;
        String[] flds = new String[] { "step_status_result", "comments" };
        List<DataRecord> records = SqlUtils.executeQuery("helpdesk_step_log", flds, SQL);
        DataRecord stepRecord = records.get(0);
        assertEquals("approved", stepRecord.getString("helpdesk_step_log.step_status_result"));
        assertEquals("AFM :: Request has been reviewed for fields [priority]", stepRecord
            .getString("helpdesk_step_log.comments"));

        SQL = "SELECT status,step_status FROM activity_log WHERE activity_log_id = "
                + activityLogId;
        flds = new String[] { "status", "step_status" };
        records = SqlUtils.executeQuery("activity_log", flds, SQL);
        DataRecord activityLogRecord = records.get(0);
        assertEquals("REQUESTED", activityLogRecord.getString("activity_log.status"));
        assertEquals("waiting", activityLogRecord.getString("activity_log.step_status"));

        int approvalStepLogId = DataStatistics.getInt("helpdesk_step_log", "step_log_id", "MAX",
            "table_name='activity_log' AND pkey_value = " + activityLogId
                    + " AND step_type='approval'");
        assertNotNull(approvalStepLogId);

        SQL = "SELECT em_id, step FROM helpdesk_step_log WHERE step_log_id = " + approvalStepLogId;
        flds = new String[] { "em_id", "step" };
        records = SqlUtils.executeQuery("helpdesk_step_log", flds, SQL);
        stepRecord = records.get(0);
        assertEquals("BARTLETT, JOAN", stepRecord.getString("helpdesk_step_log.em_id"));
        assertEquals("Facility Approval", stepRecord.getString("helpdesk_step_log.step"));

        SqlUtils.executeUpdate("activity_log", "DELETE FROM activity_log WHERE activity_log_id = "
                + activityLogId);
        SqlUtils.executeUpdate("helpdesk_step_log",
            "DELETE FROM helpdesk_step_log WHERE table_name='activity_log' AND pkey_value = "
                    + activityLogId);
    }

    public void testEditAndApproveChangeToPriority5() {
        JSONObject record = new JSONObject();
        record.put("activity_log.activity_type", "SERVICE DESK - HOTELING");
        record.put("activity_log.site_id", "MARKET");
        record.put("activity_log.bl_id", "HQ");
        record.put("activity_log.requestor", "BARTLETT, JOAN");
        record.put("activity_log.priority", 1);
        record.put("activity_log.description", "testing");

        this.classHandler.submitRequest("", record);
        int activityLogId = DataStatistics.getInt("activity_log", "activity_log_id", "MAX",
            "activity_type='SERVICE DESK - HOTELING'");
        assertNotNull(activityLogId);
        int reviewStepLogId = DataStatistics.getInt("helpdesk_step_log", "step_log_id", "MAX",
            "table_name='activity_log' AND pkey_value = " + activityLogId
                    + " AND step_type='review'");
        assertNotNull(reviewStepLogId);

        record.put("activity_log.activity_log_id", activityLogId);
        record.put("activity_log_step_waiting.step_log_id", reviewStepLogId);
        record.put("activity_log.priority", 5);

        this.classHandler.reviewRequest(record, "testing Edit and Approve with change priority");

        String SQL = "SELECT step_status_result,comments FROM helpdesk_step_log WHERE step_log_id = "
                + reviewStepLogId;
        String[] flds = new String[] { "step_status_result", "comments" };
        List<DataRecord> records = SqlUtils.executeQuery("helpdesk_step_log", flds, SQL);
        DataRecord stepRecord = records.get(0);
        assertEquals("approved", stepRecord.getString("helpdesk_step_log.step_status_result"));
        assertEquals("AFM :: Request has been reviewed for fields [priority]", stepRecord
            .getString("helpdesk_step_log.comments"));

        SQL = "SELECT status,step_status FROM activity_log WHERE activity_log_id = "
                + activityLogId;
        flds = new String[] { "status", "step_status" };
        records = SqlUtils.executeQuery("activity_log", flds, SQL);
        DataRecord activityLogRecord = records.get(0);
        assertEquals("APPROVED", activityLogRecord.getString("activity_log.status"));
        assertEquals("waiting", activityLogRecord.getString("activity_log.step_status"));

        int acceptanceStepLogId = DataStatistics.getInt("helpdesk_step_log", "step_log_id", "MAX",
            "table_name='activity_log' AND pkey_value = " + activityLogId
                    + " AND step_type='acceptance'");
        assertNotNull(acceptanceStepLogId);

        SQL = "SELECT em_id, step FROM helpdesk_step_log WHERE step_log_id = "
                + acceptanceStepLogId;
        flds = new String[] { "em_id", "step" };
        records = SqlUtils.executeQuery("helpdesk_step_log", flds, SQL);
        stepRecord = records.get(0);
        assertEquals("CARLO, ALFRED", stepRecord.getString("helpdesk_step_log.em_id"));
        assertEquals("Employee Acceptance", stepRecord.getString("helpdesk_step_log.step"));

        SqlUtils.executeUpdate("activity_log", "DELETE FROM activity_log WHERE activity_log_id = "
                + activityLogId);
        SqlUtils.executeUpdate("helpdesk_step_log",
            "DELETE FROM helpdesk_step_log WHERE table_name='activity_log' AND pkey_value = "
                    + activityLogId);
    }
}