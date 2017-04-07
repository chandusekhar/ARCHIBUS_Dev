package com.archibus.eventhandler.helpdesk;

import com.archibus.eventhandler.ondemandwork.TestScheduleHandler;
import com.archibus.eventhandler.ondemandwork.TestWorkRequestHandler;
import com.archibus.eventhandler.sla.TestCalendarManager;
import com.archibus.eventhandler.sla.TestSLAAutomation;
import com.archibus.eventhandler.sla.TestServiceLevelAgreement;
import com.archibus.eventhandler.sla.TestServiceLevelAgreementHandler;
import com.archibus.eventhandler.sla.TestServiceWindow;
import com.archibus.eventhandler.steps.TestApproval;
import com.archibus.eventhandler.steps.TestReview;
import com.archibus.eventhandler.steps.TestStatusConverter;
import com.archibus.eventhandler.steps.TestStepHandler;
import com.archibus.eventhandler.steps.TestStepManagerImpl;
import com.archibus.eventhandler.steps.TestSteps;
import com.archibus.eventhandler.steps.TestWorkflowFactory;
import com.archibus.eventhandler.steps.roles.TestBuildingManagerLookup;
import com.archibus.fixture.EventHandlerFixture;

import junit.extensions.TestSetup;
import junit.framework.Test;
import junit.framework.TestCase;
import junit.framework.TestSuite;

public class TestAll extends TestCase {	
	/**
     *  Helper object providing test-related resource and methods.
     */
    // make it package available
	public static EventHandlerFixture fixtureAll = null; 
    
	public static Test suite() {
		TestSuite testSuite = new TestSuite();
		
		//helpdesk test suites
		testSuite.addTestSuite(TestActivityHandler.class);		
		testSuite.addTestSuite(TestCommon.class);
		testSuite.addTestSuite(TestCommonHandler.class);
		testSuite.addTestSuite(TestEscalationHandler.class);
		testSuite.addTestSuite(TestQuestionnaireHandler.class);
		testSuite.addTestSuite(TestReportHandler.class);
		testSuite.addTestSuite(TestRequestHandler.class);
		testSuite.addTestSuite(Tester.class);
		
		//on demand test suites
		testSuite.addTestSuite(TestWorkRequestHandler.class);
		testSuite.addTestSuite(TestScheduleHandler.class);
		
		//SLA test suites
		testSuite.addTestSuite(TestCalendarManager.class);
		testSuite.addTestSuite(TestServiceLevelAgreementHandler.class);
		testSuite.addTestSuite(TestServiceWindow.class);
		testSuite.addTestSuite(TestServiceLevelAgreement.class);
		testSuite.addTestSuite(TestSLAAutomation.class);
		
		//Steps test suites
		testSuite.addTestSuite(TestStatusConverter.class);
		testSuite.addTestSuite(TestStepHandler.class);		
		testSuite.addTestSuite(TestSteps.class);	
		testSuite.addTestSuite(TestApproval.class);
		testSuite.addTestSuite(TestReview.class);	
		testSuite.addTestSuite(TestStepManagerImpl.class);		
		testSuite.addTestSuite(TestWorkflowFactory.class);
		
		//Roles test suites
		testSuite.addTestSuite(TestBuildingManagerLookup.class);
		
		TestSetup wrapper = new TestSetup(testSuite) {
			
			public void setUp() throws Exception {
				fixtureAll = new EventHandlerFixture(this, "ab-ex-echo.axvw");
				fixtureAll.setUp(); 
			}
			
			public void tearDown() throws Exception {				
				fixtureAll.tearDown();
			}
			
		};		
		
		return wrapper;
	}  
	
	
    protected void setUp() throws Exception {
		// do nothing
	}

	protected void tearDown() throws Exception {		
//		 do nothing
	}

}
