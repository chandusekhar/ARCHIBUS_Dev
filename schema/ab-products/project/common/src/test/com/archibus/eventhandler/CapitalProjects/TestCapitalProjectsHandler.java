package com.archibus.eventhandler.CapitalProjects;

import junit.framework.TestCase;

import com.archibus.fixture.*;
import junit.framework.*;
import java.util.HashMap;
import java.util.Map;
import com.archibus.utility.ExceptionBase;
import java.util.Random;
import javax.naming.*;
import javax.sql.*;

import com.archibus.config.*;
import com.archibus.db.DbConnection;
import com.archibus.db.DbConnectionUser;
import com.archibus.db.UseDbConnection;
import com.archibus.jobmanager.*;
import com.archibus.utility.*;
import com.archibus.view.analysis.MdxSqlParameter;

import junit.framework.*;
import org.dom4j.*;
import com.archibus.eventhandler.*;
import java.text.SimpleDateFormat;

import com.archibus.utility.ExceptionBase;
import java.util.HashMap;

import java.sql.*;
import java.text.*;

/**
 *  Tests CapitalProjectsHandler.
 */
public class TestCapitalProjectsHandler extends TestCase {

    /**
     *  Helper object providing test-related resource and methods.
     */
    private EventHandlerFixture fixture = null;

    /**
     *  JUnit test initialization method.
     *
     *@exception  Exception  Description of the Exception
     */
    public void setUp() throws Exception {
        this.fixture = new EventHandlerFixture(this, "ab-ex-echo.axvw");
        this.fixture.setUp();
    }

    /**
     *  JUnit clean-up method.
     */
    public void tearDown() {
        this.fixture.tearDown();
    }

    // ----------------------- test methods ------------------------------------

    /**
     * Test for setFieldDefaultValue event handler. method removed
     */
    public void NOtestSetFieldDefaultValue() throws Exception {
        this.fixture.runWorkflowRule("setFieldDefaultValue.xml");
        this.fixture.verifyRow(
            "funding",
            "fund_id = 'test_fund'",
            new String[] {"description"},
            new String[] {"created by test"});
    }

    /**
     * Test for createProject event handler.
     */
    public void testCreateProject() throws ExceptionBase {

        //this.fixture.runWorkflowRule("createProject.xml");

        Map response = new HashMap();
        Map inputs = new HashMap();

        Random rn = new Random();
        String projectName = "Project" + rn.toString();
        // create test UseDbConnection instance as transaction context
        Object transactionContext = this.fixture.beginTransaction();

        inputs.put("project.project_id", projectName);
        inputs.put("project.project_type", "ASSESSMENT");
        inputs.put("project.status", "Create");
        inputs.put("project.description", "New project");
        inputs.put("project.requestor", "AFM");
        inputs.put("project.dept_contact", "BARTLETT, BETTY");
        inputs.put("project.contact_id", "MR. PETER RONSON");

        SimpleDateFormat dFormat = new SimpleDateFormat("yyyy-MM-dd");

        try {
            inputs.put("project.date_end", new java.sql.Date(dFormat.parse("2006-12-13").getTime()));
        } catch (ParseException ex) {
        }
        try {
            inputs.put("project.date_start", new java.sql.Date(dFormat.parse("2006-06-21").getTime()));
        } catch (ParseException ex) {
        }

        inputs.put("projectFields", inputs);
        this.fixture.runEventHandlerMethod(
            "AbCapitalBudgeting",
            "com.archibus.eventhandler.CapitalProjects.CapitalProjectsHandler",
            "createProject",
            inputs,
            response, transactionContext);

        this.fixture.rollbackTransaction(transactionContext);

    }

    /**
     * Tests CapitalProjectsHandler.generateProgramBudget method.
     */
    public void testCapitalProjects_generateProgramBudget() {

        /*
          Map response = new HashMap();
          Map inputs = new HashMap();
          inputs.put("budget_id", "Capital-2007-11-3A-Proposed");
          inputs.put("from_year", new Integer("2007"));
          inputs.put("to_year", new Integer("2008"));
          inputs.put("sites_list", "NORTH;MARKET;JFK;;");
          inputs.put("program_type_list",
                     "Special Programs;Site;Bldg. Systems (Upgrades);Bldg. Systems (Deferred Maint.)");
          boolean result = this.fixture.runEventHandlerMethod(
              "AbCapitalBudgeting",
              "com.archibus.eventhandler.CapitalProjects.CapitalProjectsHandler",
              "generateProgramBudget",
              inputs,
              response);
          if (!result) {
              fail();
          }
         */
        this.fixture.runWorkflowRule("generateProgramBudget.xml");
    }


    /**
     * Test for insertProjectQuestionnaireRecord event handler.
     */
    public void testInsertProjectQuestionnaireRecord() throws Exception {
        this.fixture.runWorkflowRule("insertProjectQuestionnaireRecord.xml");
        this.fixture.verifyRow(
            "questionnaire",
            "questionnaire_id = 'PROJECT - LEASE'",
            new String[] {"title", "description"},
            new String[] {"Questionnaire:PROJECT-LEASE", "Questionnaire for PROJECT-LEASE"});
    }

    /**
     *  Tests saveDocumentTemplate() event handler.
     */
    public void testSaveDocumentTemplate() throws ExceptionBase {
        this.fixture.runWorkflowRule("saveDocumentTemplate.xml");
    }

    /**
     *  Tests addProjectTemplate() event handler.
     */
    public void testaddProjectTemplate() throws ExceptionBase {
        this.fixture.runWorkflowRule("addProjectTemplate.xml");
    }


    /**
     *  Tests copyActionsToProject() event handler.
     */
    public void testcopyActionsToProject() throws ExceptionBase {
        this.fixture.runWorkflowRule("copyActionsToProject.xml");
    }

    /**
     * Test for copyScenarioRecordsToProjectFunds event handler.
     */
    public void testCopyScenarioRecordsToProjectFunds() throws Exception {
        this.fixture.runWorkflowRule("copyScenarioRecordsToProjectFunds.xml");

    }

    /**
     * Test for rollUpActionCostsToProjects event handler.
     */
    public void testRollUpActionCostsToProjects() throws Exception {
        this.fixture.runWorkflowRule("rollUpActionCostsToProjects.xml");

    }


    /**
     * Test for saveScenarioItem event handler.
     */
    public void testSaveScenarioItem() throws Exception {
        this.fixture.runWorkflowRule("saveScenarioItem.xml");

    }

/////////////////////////

    /**
     * Test for requestProject event handler.
     */
    public void testRequestProject() throws Exception {
        this.fixture.runWorkflowRule("requestProject.xml");

    }

    /**
     * Test for withdrawProject event handler.
     */
    public void testWithdrawProject() throws Exception {
        this.fixture.runWorkflowRule("withdrawProject.xml");

    }

    /**
     * Test for copyTemplateActionsToProject event handler.
     */
    public void testCopyTemplateActionsToProject() throws Exception {
        this.fixture.runWorkflowRule("copyTemplateActionsToProject.xml");

    }

    /**
     * Test for createScenarioItemsFromActivityLogs event handler.
     */
    public void testCreateScenarioItemsFromActivityLogs() throws Exception {
        this.fixture.runWorkflowRule("createScenarioItemsFromActivityLogs.xml");

    }

    /**
     * Test for routeProjectForApproval event handler.
     */
    public void testRouteProjectForApproval() throws Exception {
        this.fixture.runWorkflowRule("routeProjectForApproval.xml");

    }

    /**
     * Test for setApprovingManagersStatusGroup event handler.
     */
    // public void testSetApprovingManagersStatusGroup() throws Exception {
    //      this.fixture.runWorkflowRule("setApprovingManagersStatusGroup.xml");

    //  }

    /**
     * Test for approveProject event handler.
     */
    public void testApproveProject() throws Exception {
        this.fixture.runWorkflowRule("approveProject.xml");

    }

    /**
     * Test for rejectProject event handler.
     */
    public void testRejectProject() throws Exception {
        this.fixture.runWorkflowRule("rejectProject.xml");

    }

    /**  AbWorkplacePortal
     *  temporary here until we create a seperate test file for
     * AbWorkplacePortal
     * Test for savePolicyAndProceduresDocument event handler.
     */
    public void testSavePolicyAndProceduresDocument() throws Exception {
        this.fixture.runWorkflowRule("savePolicyAndProceduresDocument.xml");

    }


}
