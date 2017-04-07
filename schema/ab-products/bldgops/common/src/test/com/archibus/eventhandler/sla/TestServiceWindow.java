package com.archibus.eventhandler.sla;

import java.sql.Date;
import java.sql.Time;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.HashMap;
import java.util.Map;

import org.apache.log4j.Level;
import org.apache.log4j.Logger;

import com.archibus.db.RecordsPersistenceImpl;
import com.archibus.eventhandler.sla.ServiceWindow;
import com.archibus.fixture.ConfigFixture;
import com.archibus.fixture.EventHandlerFixture;
import com.archibus.fixture.EventHandlerFixture.EventHandlerContextImplTest;
import com.archibus.jobmanager.EventHandlerContext;

import junit.framework.TestCase;

public class TestServiceWindow extends TestCase{
			
	private static EventHandlerFixture fixture = null;
	private static Object transactionContext = null;
	
	/*public static Test suite() {
		TestSuite testSuite = new TestSuite(TestServiceWindow.class);
		
		TestSetup wrapper = new TestSetup(testSuite) {
			
			public void setUp() throws Exception {				
				fixture = new EventHandlerFixture(this);
				fixture.setUp();		
				//ConfigFixture.enableObjectLogging(Level.INFO);
		        //Logger.getLogger(RecordsPersistenceImpl.class).setLevel(Level.DEBUG);
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
		//fixture.rollbackTransaction(transactionContext);
		try {
			fixture.commitTransaction(transactionContext);
		} catch (Exception e) {
			
		}
	}*/
	protected void setUp() throws Exception {
        this.fixture = new EventHandlerFixture(this);
        this.fixture.setUp();
        ConfigFixture.enableObjectLogging(Level.INFO);
        Logger.getLogger(RecordsPersistenceImpl.class).setLevel(Level.DEBUG);
    }

    protected void tearDown() throws Exception {
        this.fixture.tearDown();
    }
	
	
    public void testCreateServiceWindow() {
     	
    	Map inputs = new HashMap();	   
    	
    	EventHandlerContext context = new EventHandlerContextImplTest(inputs, fixture.getUserSession(), transactionContext, null);
     	
    	//service window from 9 am till 5 pm, weekdays, no holidays
    	Time start = new Time(9,0,0);
    	Time end = new Time(17,0,0);
    	String days = "0,1,1,1,1,1,0";    	
    	boolean allow_work_on_holidays = false;    	 
    	
    	ServiceWindow serviceWindow = new ServiceWindow(context,start, end, days, allow_work_on_holidays, null);    	   	
     
    	/**
    	 *   start tuesday at 16:00, 4 hours to work => end wednesday at 12am
    	 */    	
    	Calendar date = Calendar.getInstance();
    	date.set(2009, Calendar.JANUARY, 15, 0, 0, 0);
    	Calendar time = Calendar.getInstance();
    	time.set(0, 0, 0, 16, 0, 0);   
    	
    	int hours = 4;
    	
    	// Date date, Time time, double time_to, String interval
    	Map dateTime = serviceWindow.calculateEscalationDate(new Date(date.getTimeInMillis()), new Time(time.getTimeInMillis()), hours, "h");
    	
    	Date completionDate = (Date) dateTime.get("date");
    	Time completionTime = (Time) dateTime.get("time");
         	
    	assertEquals(16, completionDate.getDate()); 
    	assertEquals(12, completionTime.getHours());
    	
    	/**
    	 *   start friday at 16:00, 12 hours work => end tuesday 12 am
    	 */
    	
    	date.set(2009, Calendar.JANUARY, 16, 0, 0, 0);      	
    	time = Calendar.getInstance();
    	time.set(0, 0, 0, 16, 0, 0);   
    	hours = 12;
    	
    	// Date date, Time time, double time_to, String interval
    	dateTime = serviceWindow.calculateEscalationDate(new Date(date.getTimeInMillis()), new Time(time.getTimeInMillis()), hours, "h");

    	completionDate = (Date) dateTime.get("date");
    	completionTime = (Time) dateTime.get("time");
         	
    	assertEquals(20, completionDate.getDate()); 
    	assertEquals(12, completionTime.getHours());
    	
    	/**
    	 *   start friday at 8:00, before service window start
    	 *   4 work hours => end friday at 1 pm
    	 */
    	
    	date.set(2007, Calendar.MARCH, 23, 0, 0, 0);      	
    	time = Calendar.getInstance();
    	time.set(0, 0, 0, 8, 0, 0);   
    	hours = 4;
    	
    	// Date date, Time time, double time_to, String interval
    	dateTime = serviceWindow.calculateEscalationDate(new Date(date.getTimeInMillis()), new Time(time.getTimeInMillis()), hours, "h");
    	
    	completionDate = (Date) dateTime.get("date");
    	completionTime = (Time) dateTime.get("time");
         	
    	assertEquals(23, completionDate.getDate()); 
    	assertEquals(13, completionTime.getHours());
    	
    	/**
    	 *   start saturday at 8:00, before service window start
    	 *   4 hours work => end monday 13:00
    	 */
    	
    	date.set(2007, Calendar.MARCH, 24, 0, 0, 0);      	
    	time = Calendar.getInstance();
    	time.set(0, 0, 0, 8, 0, 0);   
    	hours = 4;
    	
    	// Date date, Time time, double time_to, String interval
    	dateTime = serviceWindow.calculateEscalationDate(new Date(date.getTimeInMillis()), new Time(time.getTimeInMillis()), hours, "h");
    	
    	completionDate = (Date) dateTime.get("date");
    	completionTime = (Time) dateTime.get("time");
         	
    	assertEquals(26, completionDate.getDate()); 
    	assertEquals(13, completionTime.getHours());
    	
    	/**
    	 *  do not use service window, 7 days a week
    	 *  start tuesday, 16:00, work 6 hours => end wednesday 14:00
    	 */    	
    	
     	date = Calendar.getInstance();
    	date.set(2007, Calendar.MARCH, 20, 0, 0, 0);      	
    	time = Calendar.getInstance();
    	time.set(0, 0, 0, 16, 0, 0);   
    	hours = 6;
    	
    	serviceWindow.setUseServiceWindow(false);
    	
    	// Date date, Time time, double time_to, String interval
    	dateTime = serviceWindow.calculateEscalationDate(new Date(date.getTimeInMillis()), new Time(time.getTimeInMillis()), hours, "h");
    	
    	completionDate = (Date) dateTime.get("date");
    	completionTime = (Time) dateTime.get("time");
         	
    	assertEquals(21, completionDate.getDate()); 
    	assertEquals(14, completionTime.getHours());
    	
    	/**
    	 *  start tuesday, 2 days, no service window => end thursday
    	 */    	
    	
     	date = Calendar.getInstance();
    	date.set(2007, Calendar.MARCH, 20, 0, 0, 0);      	
    	time = Calendar.getInstance();
    	time.set(0, 0, 0, 16, 0, 0);   
    	int completionDays = 2;
    	
    	serviceWindow.setUseServiceWindow(false);
    	
    	// Date date, Time time, double time_to, String interval
    	dateTime = serviceWindow.calculateEscalationDate(new Date(date.getTimeInMillis()), new Time(time.getTimeInMillis()), completionDays, "d");
    	
    	completionDate = (Date) dateTime.get("date");
    	completionTime = (Time) dateTime.get("time");
         	
    	assertEquals(22, completionDate.getDate()); 
    	assertEquals(16, completionTime.getHours());
    	
    	/**
    	 *  start friday, 3 days, end wednesday 
    	 */    	
    	
     	date = Calendar.getInstance();
    	date.set(2007, Calendar.MARCH, 23, 0, 0, 0);      	
    	time = Calendar.getInstance();
    	time.set(0, 0, 0, 16, 0, 0);   
    	completionDays = 3;
    	
    	serviceWindow.setUseServiceWindow(true);
    	
    	// Date date, Time time, double time_to, String interval
    	dateTime = serviceWindow.calculateEscalationDate(new Date(date.getTimeInMillis()), new Time(time.getTimeInMillis()), completionDays, "d");
    	
    	completionDate = (Date) dateTime.get("date");
    	completionTime = (Time) dateTime.get("time");
         	
    	assertEquals(28, completionDate.getDate()); 
    	assertEquals(16, completionTime.getHours());
    	
    	
    	/**
    	 *  start sunday, 2 weeks, december 
    	 */    	
    	
     	date = Calendar.getInstance();
    	date.set(2007, Calendar.DECEMBER, 23, 0, 0, 0);      	
    	time = Calendar.getInstance();
    	time.set(0, 0, 0, 16, 0, 0);   
    	int completionWeeks = 3;
    	
    	serviceWindow.setUseServiceWindow(true);
    	
    	// Date date, Time time, double time_to, String interval
    	dateTime = serviceWindow.calculateEscalationDate(new Date(date.getTimeInMillis()), new Time(time.getTimeInMillis()), completionWeeks, "w");
    	
    	completionDate = (Date) dateTime.get("date");
    	completionTime = (Time) dateTime.get("time");
         	
    	assertEquals(14, completionDate.getDate()); 
    	assertEquals(Calendar.JANUARY, completionDate.getMonth()); 
    	assertEquals(16, completionTime.getHours());
    	
    	
    	/**
    	 *  start sunday, 21 days, december, with holidays 
    	 */    	
    	
     	date = Calendar.getInstance();
    	date.set(2007, Calendar.DECEMBER, 23, 0, 0, 0);      	
    	time = Calendar.getInstance();
    	time.set(0, 0, 0, 16, 0, 0);   
    	completionDays = 15; // 3 working weeks
    	
    	allow_work_on_holidays = false;
    	serviceWindow = new ServiceWindow(context,start,end,days, allow_work_on_holidays,"MARKET");
    	
    	serviceWindow.getCalendarManager().addHoliday("2007-12-25","");
    	serviceWindow.getCalendarManager().addHoliday("2008-01-01","");
    	
    	// Date date, Time time, double time_to, String interval
    	dateTime = serviceWindow.calculateEscalationDate(new Date(date.getTimeInMillis()), new Time(time.getTimeInMillis()), completionDays, "d");
    	
    	completionDate = (Date) dateTime.get("date");
    	completionTime = (Time) dateTime.get("time");
         	
    	assertEquals(15, completionDate.getDate()); 
    	assertEquals(Calendar.JANUARY, completionDate.getMonth()); 
    	assertEquals(16, completionTime.getHours());
    	
    	/**
    	 * service window of 4,5 hours, only working monday and tuesday
    	 */
    	start = new Time(9,30,0);
    	end = new Time(14,0,0);
    	days = "0,1,1,0,0,0,0"; 
    	serviceWindow = new ServiceWindow(context,start,end,days,true,"");
    	
    	//start friday, work 6 hours
    	date = Calendar.getInstance();
    	date.set(2009, Calendar.JANUARY, 16, 0, 0, 0);      	
    	time = Calendar.getInstance();
    	time.set(0, 0, 0, 9, 0, 0);  
    	dateTime = serviceWindow.calculateEscalationDate(new Date(date.getTimeInMillis()), new Time(time.getTimeInMillis()),6,"h");
    	
    	completionDate = (Date) dateTime.get("date");
    	completionTime = (Time) dateTime.get("time");
         	
    	assertEquals(20, completionDate.getDate()); 
    	assertEquals(11, completionTime.getHours());
    	assertEquals(0, completionTime.getMinutes());
    	
    	//start friday work 45 minutes
    	time = Calendar.getInstance();
    	time.set(0, 0, 0, 9, 0, 0);  
    	dateTime = serviceWindow.calculateEscalationDate(new Date(date.getTimeInMillis()), new Time(time.getTimeInMillis()),45,"n");
    	
    	completionDate = (Date) dateTime.get("date");
    	completionTime = (Time) dateTime.get("time");
         	
    	assertEquals(19, completionDate.getDate()); 
    	assertEquals(10, completionTime.getHours());
    	assertEquals(15, completionTime.getMinutes());
    	
    	//start monday, work 300 minutes
    	date = Calendar.getInstance();
    	date.set(2009, Calendar.JANUARY, 19, 0, 0, 0);      	
    	time = Calendar.getInstance();
    	time.set(0, 0, 0, 13, 35, 0); 
    	dateTime = serviceWindow.calculateEscalationDate(new Date(date.getTimeInMillis()), new Time(time.getTimeInMillis()),300,"n");
    	
    	completionDate = (Date) dateTime.get("date");
    	completionTime = (Time) dateTime.get("time");
         	
    	assertEquals(26, completionDate.getDate()); 
    	assertEquals(9, completionTime.getHours());
    	assertEquals(35, completionTime.getMinutes());
    	
    	//start monday just before end of SW, work 39 minutes
    	date = Calendar.getInstance();
    	date.set(2009, Calendar.JANUARY, 19, 0, 0, 0);      	
    	time = Calendar.getInstance();
    	time.set(0, 0, 0, 13, 25, 0); 
    	dateTime = serviceWindow.calculateEscalationDate(new Date(date.getTimeInMillis()), new Time(time.getTimeInMillis()),39,"n");
    	
    	completionDate = (Date) dateTime.get("date");
    	completionTime = (Time) dateTime.get("time");
         	
    	assertEquals(20, completionDate.getDate()); 
    	assertEquals(9, completionTime.getHours());
    	assertEquals(34, completionTime.getMinutes());
    	
    	//start monday end together with service window
    	date = Calendar.getInstance();
    	date.set(2009, Calendar.JANUARY, 19, 0, 0, 0);      	
    	time = Calendar.getInstance();
    	time.set(0, 0, 0, 13, 45, 0); 
    	dateTime = serviceWindow.calculateEscalationDate(new Date(date.getTimeInMillis()), new Time(time.getTimeInMillis()),285,"n");
    	
    	completionDate = (Date) dateTime.get("date");
    	completionTime = (Time) dateTime.get("time");
         	
    	assertEquals(20, completionDate.getDate()); 
    	assertEquals(14, completionTime.getHours());
    	assertEquals(00, completionTime.getMinutes());
    }
	
	

}
