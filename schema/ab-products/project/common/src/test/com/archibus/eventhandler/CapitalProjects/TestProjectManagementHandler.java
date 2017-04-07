package com.archibus.eventhandler.CapitalProjects;

import com.archibus.fixture.*;
import junit.framework.*;

/**
 *  Tests CapitalProjectsHandler.
 */
public class TestProjectManagementHandler extends TestCase {

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
     * Test for setFieldDefaultValue event handler.
     */
    public void testDeleteRequestedAction() throws Exception {
        this.fixture.runWorkflowRule("deleteRequestedAction.xml");
    }

    /**
     * Test for setFieldDefaultValue event handler.
     */
    public void testApplyPaymentToVendorInvoice() throws Exception {
        this.fixture.runWorkflowRule("applyPaymentToVendorInvoice.xml");

    }

    /**
     * Test for createProject event handler.
     */
    public void testApproveChangeOrder() throws Exception {
        this.fixture.runWorkflowRule("approveChangeOrder.xml");

    }


    /**
     * Test for createProject event handler.
     */
    public void testApproveWorkPkgBid() throws Exception {
        this.fixture.runWorkflowRule("approveWorkPkgBid.xml");

    }

    /**
     * Test for createProject event handler.
     */
    public void testCalcActivityLogDateSchedEndForActivity() throws Exception {
        this.fixture.runWorkflowRule("calcActivityLogDateSchedEndForActivity.xml");

    }

    /**
     * Test for createProject event handler.
     */
    public void testCalcActivityLogDateSchedEndForProject() throws Exception {
        this.fixture.runWorkflowRule("calcActivityLogDateSchedEndForProject.xml");

    }

    /**
     * Test for calcActivityLogDateSchedEndForWorkPkg event handler.
     */
    public void testCalcActivityLogDateSchedEndForWorkPkg() throws Exception {
        this.fixture.runWorkflowRule("calcActivityLogDateSchedEndForWorkPkg.xml");

    }



    /**
     * Test for deleteInvoice event handler.
     */
    public void testDeleteInvoice() throws Exception {
        this.fixture.runWorkflowRule("deleteInvoice.xml");

    }

    /**
     * Test for emailBidderOnBidApprovalOrRejection event handler.
     */
    public void testEmailBidderOnBidApprovalOrRejection() throws Exception {
        this.fixture.runWorkflowRule("emailBidderOnBidApprovalOrRejection.xml");

    }

    /**
     * Test for notifyAssigneeOfPendingActions event handler.
     */
    public void testNotifyAssigneeOfPendingActions() throws Exception {
        this.fixture.runWorkflowRule("notifyAssigneeOfPendingActions.xml");

    }

    /**
     * Test for setActionStatus event handler.
     */
    public void testSetActionStatus() throws Exception {
        this.fixture.runWorkflowRule("setActionStatus.xml");

    }

    /**
     * Test for setInvoiceStatus event handler.
     */
    public void testSetInvoiceStatus() throws Exception {
        this.fixture.runWorkflowRule("setInvoiceStatus.xml");

    }

    /**
     * Test for createWorkPkgInvoice event handler.
     */
    public void testCreateWorkPkgInvoice() throws Exception {
        this.fixture.runWorkflowRule("createWorkPkgInvoice.xml");

    }

    /**
     * Test for submitWorkPkgInvoice event handler.
     */
    public void testSubmitWorkPkgInvoice() throws Exception {
        this.fixture.runWorkflowRule("submitWorkPkgInvoice.xml");

    }

    /**
     * Test for withdrawWorkPkgInvoice event handler.
     */
    public void testWithdrawWorkPkgInvoice() throws Exception {
        this.fixture.runWorkflowRule("withdrawWorkPkgInvoice.xml");

    }

    /**
     * Test for submitWorkPkgBid event handler.
     */
    public void testSubmitWorkPkgBid() throws Exception {
        this.fixture.runWorkflowRule("submitWorkPkgBid.xml");

    }

    /**
     * Test for withdrawWorkPkgBid event handler.
     */
    public void testWithdrawWorkPkgBid() throws Exception {
        this.fixture.runWorkflowRule("withdrawWorkPkgBid.xml");

    }

    /**
     * Test for requestChangeOrder event handler.
     */
    public void testRequestChangeOrder() throws Exception {
        this.fixture.runWorkflowRule("requestChangeOrder.xml");

    }

    /**
     * Test for addWorkPkgBid event handler.
     */
    public void testAddWorkPkgBid() throws Exception {
        this.fixture.runWorkflowRule("addWorkPkgBid.xml");

    }

    /**
  * Test for createWorkRequestForAction event handler.
  */
 public void testCreateWorkRequestForAction() throws Exception {
     this.fixture.runWorkflowRule("createWorkRequestForAction.xml");

 }

 /**
 * Test for CalcActivityLogDatePlannedEndForActivity event handler.
 */
public void testCalcActivityLogDatePlannedEndForActivity() throws Exception {
    this.fixture.runWorkflowRule("calcActivityLogDatePlannedEndForActivity.xml");

}

/**
 * Test for CalcActivityLogDatePlannedEndForWorkPkg event handler.
 */
public void testCalcActivityLogDatePlannedEndForWorkPkg() throws Exception {
    this.fixture.runWorkflowRule("calcActivityLogDatePlannedEndForWorkPkg.xml");

}

/**
 * Test for CalcActivityLogDatePlannedEndForProject event handler.
 */
public void testCalcActivityLogDatePlannedEndForProject() throws Exception {
    this.fixture.runWorkflowRule("calcActivityLogDatePlannedEndForProject.xml");

}

/**
 * Test for cancelAction event handler.
 */
public void testCancelAction() throws Exception {
    this.fixture.runWorkflowRule("cancelAction.xml");

}

/**
 * Test for stopAction event handler.
 */
public void testStopAction() throws Exception {
    this.fixture.runWorkflowRule("stopAction.xml");

}

/**
 * Test for addWorkPackage event handler.
 */
public void testaddWorkPackage() throws Exception {
    this.fixture.runWorkflowRule("addWorkPackage.xml");

}





}
