/**
 * 
 */
package com.archibus.eventhandler.sla;

import java.sql.Date;
import java.sql.Time;
import java.util.Calendar;
import java.util.GregorianCalendar;
import java.util.HashMap;
import java.util.Map;

import junit.extensions.TestSetup;
import junit.framework.Test;
import junit.framework.TestCase;
import junit.framework.TestSuite;

import com.archibus.eventhandler.helpdesk.TestAll;
import com.archibus.fixture.EventHandlerFixture;
import com.archibus.fixture.EventHandlerFixture.EventHandlerContextImplTest;
import com.archibus.jobmanager.EventHandlerContext;

/**
 * 
 */
public class TestServiceLevelAgreement extends TestCase {

    private static EventHandlerFixture fixture = null;
    private static Object transactionContext = null;

    public static Test suite() {
        TestSuite testSuite = new TestSuite(TestServiceLevelAgreement.class);

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
        if (TestAll.fixtureAll != null) {
            fixture = TestAll.fixtureAll;
        }
        // always start transaction
        transactionContext = fixture.beginTransaction();
    }

    protected void tearDown() throws Exception {
        // always rollback at the end of a test method
        fixture.rollbackTransaction(transactionContext);
    }

    /*
     * public void testServiceLevelAgreement(){ HashMap inputs = new HashMap(); EventHandlerContext
     * context = new EventHandlerContextImplTest(inputs, fixture.getUserSession(),
     * transactionContext, null); Map request = new HashMap(); request.put("activity_type","SERVICE
     * DESK - TEST"); request.put("eq_id","SMOK-DET-001"); request.put("requestor","ADAMS, ALBERT");
     * ServiceLevelAgreement sla = new ServiceLevelAgreement(context,request);
     * 
     * //check if the equipment standard is looked up
     * assertEquals("SMOKE-DETECTOR",sla.getRequestStringParameter("eq_std"));
     * 
     * assertNotNull(sla.getSlaResponseWithPriorityLevelsAsJson()); JSONObject sla_response =
     * sla.getSlaResponseWithPriorityLevelsAsJson(); assertEquals("urgent",
     * sla_response.get("priority_level")); }
     * 
     * public void testServiceLevelAgreementFromRequest() throws ParseException{ Map inputs = new
     * HashMap(); Map response = new HashMap();
     * 
     * Map fields = new HashMap(); fields.put("requestor", "AFM");
     * fields.put("phone_requestor","227-2508"); fields.put("priority",new Integer(1));
     * fields.put("activity_type","SERVICE DESK - TEST"); fields.put("created_by", "AFM");
     * 
     * inputs.put("fields",fields);
     * 
     * fixture.runEventHandlerMethod( "AbBldgOpsHelpDesk",
     * "com.archibus.eventhandler.helpdesk.RequestHandler", "saveRequest", inputs, response,
     * transactionContext);
     * 
     * assertNotNull(response.get("jsonExpression"));
     * 
     * JSONObject jsonObject = new JSONObject((String) response.get("jsonExpression")); int
     * activity_log_id = jsonObject.getInt("activity_log_id");
     * 
     * EventHandlerContext context = new EventHandlerContextImplTest(inputs,
     * fixture.getUserSession(), transactionContext, null); ServiceLevelAgreement sla = new
     * ServiceLevelAgreement(context,"activity_log","activity_log_id",activity_log_id);
     * assertEquals("EXEC-SR", sla.getRequestStringParameter("em_std"));
     * 
     * assertNotNull(sla.getSlaResponseWithPriorityLevelsAsJson()); assertEquals("tryout",
     * sla.getSlaResponseWithPriorityLevelsAsJson().get("priority_level")); }
     */

    public void testCalculateEscalation() {
        HashMap inputs = new HashMap();
        EventHandlerContext context = new EventHandlerContextImplTest(inputs, fixture
            .getUserSession(), transactionContext, null);
        ServiceLevelAgreement sla = ServiceLevelAgreement
                .getInstance(context, 1, 3, "SERVICE DESK - COPY SERVICE");
        Calendar cal = new GregorianCalendar();
        cal.set(Calendar.HOUR_OF_DAY, 7);
        Date date = new Date(cal.getTimeInMillis());
        Time time = new Time(cal.getTimeInMillis());

        Map escalation = sla.calculateEscalation(date, time);
        Map response = (Map) escalation.get("response");
        Map completion = (Map) escalation.get("completion");

        Time resp_time = (Time) response.get("time");
        Date resp_date = (Date) response.get("date");

        Time comp_time = (Time) completion.get("time");
        Date comp_date = (Date) completion.get("date");

        assertEquals(12, resp_time.getHours());
        assertEquals(0, resp_time.getMinutes());
        assertEquals(cal.get(Calendar.DATE) + 1, resp_date.getDate());

        assertEquals(11, comp_time.getHours());
        assertEquals(0, comp_time.getMinutes());
        assertEquals(cal.get(Calendar.DATE) + 1, comp_date.getDate());
    }

}
