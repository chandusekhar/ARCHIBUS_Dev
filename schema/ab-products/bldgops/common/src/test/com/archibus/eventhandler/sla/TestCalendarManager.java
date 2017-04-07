package com.archibus.eventhandler.sla;

import java.util.Calendar;
import java.util.Date;
import java.util.GregorianCalendar;
import java.util.HashMap;

import com.archibus.eventhandler.helpdesk.TestAll;
import com.archibus.eventhandler.sla.CalendarManager;
import com.archibus.fixture.EventHandlerFixture;
import com.archibus.fixture.EventHandlerFixture.EventHandlerContextImplTest;
import com.archibus.jobmanager.EventHandlerContext;

import junit.extensions.TestSetup;
import junit.framework.Test;
import junit.framework.TestCase;
import junit.framework.TestSuite;

public class TestCalendarManager extends TestCase {
	
	private static EventHandlerFixture fixture = null;
	private static Object transactionContext = null;
	
	public static Test suite() {
		TestSuite testSuite = new TestSuite(TestCalendarManager.class);
		
		TestSetup wrapper = new TestSetup(testSuite) {
			
			public void setUp() throws Exception {				
				fixture = new EventHandlerFixture(this, "ab-ex-echo.axvw");
				fixture.setUp();
				transactionContext = fixture.beginTransaction();				 	       
			}
			
			public void tearDown() throws Exception {				 
				fixture.tearDown();				 
			}
			
		};		
		
		return wrapper;
	}  
	
    protected void setUp() throws Exception {
		if (TestAll.fixtureAll != null ) {
			fixture = TestAll.fixtureAll; 		
		} 
		// always start transaction
		transactionContext = fixture.beginTransaction();
	}

	protected void tearDown() throws Exception {		
		// always rollback at the end of a test method
		fixture.rollbackTransaction(transactionContext);
	}
	
	public void testCalendarManager(){
		HashMap inputs = new HashMap();
		EventHandlerContext context = new EventHandlerContextImplTest(inputs, fixture.getUserSession(), transactionContext, null);
		
		boolean[] servWindow = {false,true,true,true,true,true,false};
		CalendarManager calendarManager = new CalendarManager(context,"USA",null,2007,servWindow);
		
		assertNotNull(calendarManager.holidays);
		Calendar cal = new GregorianCalendar(2007,Calendar.DECEMBER,25);
		assertTrue(calendarManager.isHoliday(cal));
	}
	
	public void testLoadServiceCalendar() {
		
		HashMap inputs = new HashMap();
		EventHandlerContext context = new EventHandlerContextImplTest(inputs, fixture.getUserSession(), transactionContext, null);
	
		CalendarManager calendarManager;
		
		calendarManager = new CalendarManager(context, null, null, null);		
		System.out.println(calendarManager.isHoliday(new Date()));
		
		calendarManager = new CalendarManager(context, "BELGIUM", null);		
		System.out.println(calendarManager.isHoliday(new Date()));		
		System.out.println(calendarManager.getHolidayName(new Date()));		
	}


}
