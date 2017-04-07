package com.archibus.app.solution.workflow;

import java.util.*;

import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.fixture.*;
import com.archibus.utility.ExceptionBase;

/**
 * JUnit test class for the HelpDeskExampleHandlers class.
 */
public class TestSolutionsWorkflowHandlers extends IntegrationTestBase {

    /**
     * Helper object providing test-related resources and methods.
     */
    private EventHandlerFixture fixture = null;

    /**
     * Unit Test for helpDeskPlanRequest method
     */
    public void testHelpDeskPlanRequest() throws ExceptionBase {

        // declare activity, class, and method to be run
        final String activityId = "AbSolutionsWorkflow";
        final String eventHandlerClass = "com.mycompany.eventhandler.helpdesk.HelpDeskExampleHandlers";
        final String eventHandlerMethod = "helpDeskPlanRequest";

        final String INPUT_ACTIVITY_TYPE = "PROJECT - TASK";
        final String INPUT_ACTION_TITLE = "Test";
        final String INPUT_COST_ESTIMATED = "100.0";

        // create test inputs for test cases
        Map fields = new HashMap();
        fields.put("activity_log.activity_type", INPUT_ACTIVITY_TYPE);
        fields.put("activity_log.action_title", INPUT_ACTION_TITLE);
        fields.put("activity_log.cost_estimated", INPUT_COST_ESTIMATED);

        Map inputs = new HashMap();
        inputs.put("fieldValues", EventHandlerBase.toJSONObject(fields));
        inputs.put("oldFieldValues", EventHandlerBase.toJSONObject(fields));
        Map response = new HashMap();

        // execute test method with test input parameters
        this.fixture.runEventHandlerMethod(activityId, eventHandlerClass, eventHandlerMethod,
            inputs, response);

        // // TODO verify that the new record has been created
        // this.fixture.verifyRow()
        //        
        // transactionContext.doAndHandleDBOperation(new DbConnectionUser() {
        // @Override
        // public void doInTransaction() throws ExceptionBase {
        // try {
        // DbConnection.ThreadSafe connection = getConnection();
        // ResultSet rs = connection
        // .execute(
        // "SELECT activity_type, action_title, cost_estimated FROM activity_log WHERE
        // activity_log_id = (SELECT max(activity_log_id) FROM activity_log)",
        // 1);
        // assertTrue(rs.next());
        // assertEquals(INPUT_ACTIVITY_TYPE, rs.getString(1).trim());
        // assertEquals(INPUT_ACTION_TITLE, rs.getString(2).trim());
        // assertEquals(INPUT_COST_ESTIMATED, "" + rs.getDouble(3));
        // } catch (SQLException t) {
        // throw new ExceptionBase("testHelpDeskPlanRequest", t);
        // }
        // }
        // });
    }

    /**
     * Unit Test for helpDeskRequest method
     */
    public void testHelpDeskRequest() throws ExceptionBase {

        // declare activity, class, and method to be run
        final String activityId = "AbSolutionsWorkflow";
        final String eventHandlerClass = "com.mycompany.eventhandler.helpdesk.HelpDeskExampleHandlers";
        final String eventHandlerMethod = "helpDeskRequest";

        final String INPUT_ACTIVITY_LOG_ID = "1";
        final String INPUT_COST_ESTIMATED = "100.0";

        // create test inputs for test cases
        Map fields = new HashMap();
        fields.put("activity_log.activity_log_id", INPUT_ACTIVITY_LOG_ID);
        fields.put("activity_log.cost_estimated", INPUT_COST_ESTIMATED);

        Map inputs = new HashMap();
        inputs.put("fieldValues", EventHandlerBase.toJSONObject(fields));
        inputs.put("oldFieldValues", EventHandlerBase.toJSONObject(fields));
        Map response = new HashMap();

        // execute test method with test input parameters
        this.fixture.runEventHandlerMethod(activityId, eventHandlerClass, eventHandlerMethod,
            inputs, response);

        // // TODO verify that the record has been updated
        // transactionContext.doAndHandleDBOperation(new DbConnectionUser() {
        // @Override
        // public void doInTransaction() throws ExceptionBase {
        // try {
        // DbConnection.ThreadSafe connection = getConnection();
        // ResultSet rs = connection.execute(
        // "SELECT status FROM activity_log WHERE activity_log_id = "
        // + INPUT_ACTIVITY_LOG_ID, 1);
        // assertTrue(rs.next());
        // assertEquals("SCHEDULED", rs.getString(1).trim());
        // } catch (SQLException t) {
        // throw new ExceptionBase("testHelpDeskRequest failed", t);
        // }
        // }
        // });
    }

    /**
     * Unit Test for helpDeskReject method
     */
    public void testhelpDeskReject() throws ExceptionBase {
        final String activityId = "AbSolutionsWorkflow";
        final String eventHandlerClass = "com.mycompany.eventhandler.helpdesk.HelpDeskExampleHandlers";
        final String eventHandlerMethod = "helpDeskReject";

        final String INPUT_ACTIVITY_LOG_ID = "1";
        final String INPUT_APPROVED_BY = "AFM";

        // create test inputs for test cases
        Map fieldValues = new HashMap();
        fieldValues.put("activity_log.activity_log_id", INPUT_ACTIVITY_LOG_ID);
        fieldValues.put("activity_log.approved_by", INPUT_APPROVED_BY);

        Map oldFieldValues = new HashMap();
        oldFieldValues.put("activity_log.activity_log_id", INPUT_ACTIVITY_LOG_ID);

        Map inputs = new HashMap();
        inputs.put("fieldValues", EventHandlerBase.toJSONObject(fieldValues));
        inputs.put("oldFieldValues", EventHandlerBase.toJSONObject(oldFieldValues));
        Map response = new HashMap();

        this.fixture.runEventHandlerMethod(activityId, eventHandlerClass, eventHandlerMethod,
            inputs, response);

        // // TODO verify that the record has been updated
        // transactionContext.doAndHandleDBOperation(new DbConnectionUser() {
        // @Override
        // public void doInTransaction() throws ExceptionBase {
        // try {
        // DbConnection.ThreadSafe connection = getConnection();
        // ResultSet rs = connection.execute(
        // "SELECT status, approved_by FROM activity_log WHERE activity_log_id = "
        // + INPUT_ACTIVITY_LOG_ID, 1);
        // assertTrue(rs.next());
        // assertEquals(INPUT_STATUS, rs.getString(1).trim());
        // assertEquals(INPUT_APPROVED_BY, rs.getString(2).trim());
        // } catch (SQLException t) {
        // throw new ExceptionBase("testHelpDeskApprove failed", t);
        // }
        // }
        // });
    }

    /**
     * Unit Test for helpDeskApprove method
     */
    public void testhelpDeskApprove() throws ExceptionBase {
        final String activityId = "AbSolutionsWorkflow";
        final String eventHandlerClass = "com.mycompany.eventhandler.helpdesk.HelpDeskExampleHandlers";
        final String eventHandlerMethod = "helpDeskApprove";

        final String INPUT_ACTIVITY_LOG_ID = "1";
        final String INPUT_APPROVED_BY = "AFM";
        final String INPUT_ASSIGNED_TO = "AFM";

        // create test inputs for test cases
        Map fieldValues = new HashMap();
        fieldValues.put("activity_log.activity_log_id", INPUT_ACTIVITY_LOG_ID);
        fieldValues.put("activity_log.approved_by", INPUT_APPROVED_BY);
        fieldValues.put("activity_log.assigned_to", INPUT_ASSIGNED_TO);

        Map oldFieldValues = new HashMap();
        oldFieldValues.put("activity_log.activity_log_id", INPUT_ACTIVITY_LOG_ID);

        Map inputs = new HashMap();
        inputs.put("fieldValues", EventHandlerBase.toJSONObject(fieldValues));
        inputs.put("oldFieldValues", EventHandlerBase.toJSONObject(oldFieldValues));
        Map response = new HashMap();

        // execute test method with test input parameters
        this.fixture.runEventHandlerMethod(activityId, eventHandlerClass, eventHandlerMethod,
            inputs, response);

        // // TODO verify that the new record has been created
        // transactionContext.doAndHandleDBOperation(new DbConnectionUser() {
        // @Override
        // public void doInTransaction() throws ExceptionBase {
        // try {
        // DbConnection.ThreadSafe connection = getConnection();
        // ResultSet rs = connection.execute(
        // "SELECT status, approved_by, assigned_to FROM activity_log WHERE activity_log_id = "
        // + INPUT_ACTIVITY_LOG_ID, 1);
        // assertTrue(rs.next());
        // assertEquals(INPUT_STATUS, rs.getString(1).trim());
        // assertEquals(INPUT_APPROVED_BY, rs.getString(2).trim());
        // assertEquals(INPUT_ASSIGNED_TO, rs.getString(3).trim());
        // } catch (SQLException t) {
        // throw new ExceptionBase("testHelpDeskApprove failed", t);
        // }
        // }
        // });
    }

    /**
     * Unit Test for helpDeskComplete method
     */
    public void testHelpDeskComplete() throws ExceptionBase {
        final String activityId = "AbSolutionsWorkflow";
        final String eventHandlerClass = "com.mycompany.eventhandler.helpdesk.HelpDeskExampleHandlers";
        final String eventHandlerMethod = "helpDeskComplete";

        final String INPUT_ACTIVITY_LOG_ID = "1";
        final String INPUT_STATUS = "COMPLETED";
        final String INPUT_COMPLETED_BY = "AFM";

        // create test inputs for test cases
        Map fieldValues = new HashMap();
        fieldValues.put("activity_log.activity_log_id", INPUT_ACTIVITY_LOG_ID);
        fieldValues.put("activity_log.status", INPUT_STATUS);
        fieldValues.put("activity_log.completed_by", INPUT_COMPLETED_BY);

        Map oldFieldValues = new HashMap();
        oldFieldValues.put("activity_log.activity_log_id", INPUT_ACTIVITY_LOG_ID);

        Map inputs = new HashMap();
        inputs.put("fieldValues", EventHandlerBase.toJSONObject(fieldValues));
        inputs.put("oldFieldValues", EventHandlerBase.toJSONObject(oldFieldValues));
        Map response = new HashMap();

        // execute test method with test input parameters
        this.fixture.runEventHandlerMethod(activityId, eventHandlerClass, eventHandlerMethod,
            inputs, response);

        // // TODO verify that the new record has been created
        // transactionContext.doAndHandleDBOperation(new DbConnectionUser() {
        // @Override
        // public void doInTransaction() throws ExceptionBase {
        // try {
        // DbConnection.ThreadSafe connection = getConnection();
        // ResultSet rs = connection.execute(
        // "SELECT status, completed_by FROM activity_log WHERE activity_log_id = "
        // + INPUT_ACTIVITY_LOG_ID, 1);
        // assertTrue(rs.next());
        // assertEquals(INPUT_STATUS, rs.getString(1).trim());
        // assertEquals(INPUT_COMPLETED_BY, rs.getString(2).trim());
        //
        // } catch (SQLException t) {
        // throw new ExceptionBase("testHelpDeskComplete failed", t);
        // }
        // }
        // });
    }

    @Override
    public void onSetUp() throws Exception {
        super.onSetUp();

        this.fixture = new EventHandlerFixture(this);
    }

    @Override
    public void onTearDown() {
        this.fixture.tearDown();
        super.onTearDown();
    }
}
