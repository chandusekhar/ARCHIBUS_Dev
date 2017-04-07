package com.archibus.eventhandler.helpdesk;

import java.text.ParseException;

import org.json.JSONObject;

import com.archibus.context.ContextStore;
import com.archibus.datasource.DataSourceTestBase;
import com.archibus.jobmanager.EventHandlerContext;

/**
 * @author ec
 * 
 */
public class TestRequestHandler extends DataSourceTestBase {
    
    /**
     * test searchServiceRequests().
     */
    public void testSearchServiceRequests() {
        final JSONObject filter = new JSONObject();
        final RequestHandler handler = new RequestHandler();
        try {
            handler.searchServiceRequests(filter);
        } catch (final Exception e) {
            fail("Exception:" + e);
        }
    }
    
    /**
     * test updateRequest().
     * 
     * @throws ParseException
     */
    public void testUpdateRequest() throws ParseException {
        try {
            final RequestHandler handler = new RequestHandler();
            final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
            
            JSONObject activity_log = new JSONObject();
            activity_log.put("activity_log.requestor", "AI");
            activity_log.put("activity_log.phone_requestor", "227-2508");
            activity_log.put("activity_log.site_id", "OLDCITY");
            activity_log.put("activity_log.bl_id", "XC");
            activity_log.put("activity_log.description", "test UpdateRequest, end approval steps");
            activity_log.put("activity_log.priority", new Integer(1));
            activity_log.put("activity_log.activity_type", "SERVICE DESK - FURNITURE");
            handler.submitRequest("", activity_log);
            final JSONObject json =
                    new JSONObject((String) context.getResponse().get("jsonExpression"));
            final int activity_log_id = json.getInt("activity_log_id");
            
            activity_log = new JSONObject();
            activity_log.put("activity_log.activity_log_id", new Integer(activity_log_id));
            activity_log.put("activity_log.status", "Approved");
            
            handler.updateRequest(activity_log_id + "", "Approved", "AI", "", "", "", "",
                activity_log);
        } catch (final Exception e) {
            fail("Exception:" + e);
        }
    }
    
    /**
     * test updateServiceRequestStatusFromWorkRequest().
     */
    public void testUpdateServiceRequestStatusFromWorkRequest() {
        try {
            final RequestHandler handler = new RequestHandler();
            handler.updateServiceRequestStatusFromWorkRequest();
        } catch (final Exception e) {
            fail("Exception:" + e);
        }
    }
    
    /**
     * test updateServiceRequestStatusFromWorkRequest().
     */
    public void testUpdateStatus() {
        try {
            final RequestHandler handler = new RequestHandler();
            handler.updateStatus(1, "Approved");
        } catch (final Exception e) {
            fail("Exception:" + e);
        }
    }
    
    /*
     * public void testUpdateRequest2() throws ParseException{ Map activity_log = new HashMap();
     * activity_log.put("activity_log.requestor","AFM");
     * activity_log.put("activity_log.phone_requestor","227-2508");
     * activity_log.put("activity_log.site_id","WEST");
     * activity_log.put("activity_log.bl_id","PLAZA 1");
     * activity_log.put("activity_log.description","test UpdateRequest, end acceptance steps");
     * activity_log.put("activity_log.priority", new Integer(1));
     * activity_log.put("activity_log.activity_type","SERVICE DESK - FURNITURE");
     * 
     * Map inputs = new HashMap(); inputs.put("fields", activity_log);
     * 
     * Map response = new HashMap();
     * 
     * fixture.runEventHandlerMethod( ACTIVITY_ID, EVENT_HANDLER_CLASS, "submitRequest", inputs,
     * response, transactionContext);
     * 
     * JSONObject json = new JSONObject((String) response.get("jsonExpression")); int
     * activity_log_id = json.getInt("activity_log_id");
     * 
     * //fixture.commitTransaction(transactionContext);
     * 
     * /*fixture.verifyRow("activity_log", "activity_log_id = " + activity_log_id, new
     * String[]{"status"}, new String[]{"Approved"}); fixture.verifyRow("helpdesk_step_log",
     * "table_name = 'activity_log' AND step_type='acceptance' AND pkey_value = " + activity_log_id
     * + " AND status = 'Approved'", new String[]{"step","vn_id"}, new
     * String[]{"Vendor Acceptance","PROCOS"});
     * 
     * inputs = new HashMap(); response = new HashMap(); inputs.put("activity_log_id", new
     * Integer(activity_log_id)); inputs.put("status", "IN PROGRESS"); inputs.put("assigned_to",
     * "AFM");
     * 
     * fixture.runEventHandlerMethod( ACTIVITY_ID, EVENT_HANDLER_CLASS, "updateRequest", inputs,
     * response, transactionContext); fixture.commitTransaction(transactionContext);
     * fixture.verifyRow("activity_log", "activity_log_id = " + activity_log_id, new
     * String[]{"status","assigned_to"}, new String[]{"IN PROGRESS","AFM"});
     * fixture.verifyRow("helpdesk_step_log",
     * "table_name = 'activity_log' AND step_type='acceptance' AND pkey_value = " + activity_log_id
     * + " AND status = 'Approved'", new String[]{"step","vn_id","step_status_result"}, new
     * String[]{"Vendor Acceptance","PROCOS","declined"});
     * 
     * }
     */
    /*
     * public void testUpdateRequest3() throws ParseException{ Map activity_log = new HashMap();
     * activity_log.put("activity_log.requestor","AFM");
     * activity_log.put("activity_log.phone_requestor","227-2508");
     * activity_log.put("activity_log.site_id","MARKET");
     * activity_log.put("activity_log.bl_id","HQ");
     * activity_log.put("activity_log.description","test UpdateRequest, change dispatcher");
     * activity_log.put("activity_log.priority", new Integer(1));
     * activity_log.put("activity_log.activity_type","SERVICE DESK - MAINTENANCE");
     * activity_log.put("activity_log.prob_type","SAFETY");
     * 
     * Map inputs = new HashMap(); inputs.put("fields", activity_log);
     * 
     * Map response = new HashMap();
     * 
     * fixture.runEventHandlerMethod( ACTIVITY_ID, EVENT_HANDLER_CLASS, "submitRequest", inputs,
     * response, transactionContext);
     * 
     * JSONObject json = new JSONObject((String) response.get("jsonExpression")); int
     * activity_log_id = json.getInt("activity_log_id");
     * 
     * inputs = new HashMap(); response = new HashMap(); inputs.put("activity_log_id", new
     * Integer(activity_log_id)); inputs.put("status", "Approved"); inputs.put("dispatcher",
     * "BECKWITH, BILL");
     * 
     * fixture.runEventHandlerMethod( ACTIVITY_ID, EVENT_HANDLER_CLASS, "updateRequest", inputs,
     * response, transactionContext);
     * 
     * fixture.commitTransaction(transactionContext); fixture.verifyRow("activity_log",
     * "activity_log_id = " + activity_log_id, new String[]{"status","dispatcher"}, new
     * String[]{"Approved","BECKWITH, BILL"});
     * 
     * EventHandlerContext context = new EventHandlerContextImplTest(inputs,
     * fixture.getUserSession(), transactionContext, null); int stepLogId = Common.getMaxId(context,
     * "helpdesk_step_log", "step_log_id");
     * 
     * fixture.verifyRow("helpdesk_step_log", "step_log_id = " + stepLogId, new
     * String[]{"em_id","step_type"}, new String[]{"BECKWITH, BILL","dispatch"});
     * 
     * }
     * 
     * public void testCloseRequests() throws ParseException{ Map activity_log = new HashMap();
     * activity_log.put("activity_log.requestor","AFM");
     * activity_log.put("activity_log.phone_requestor","227-2508");
     * activity_log.put("activity_log.site_id","OLDCITY");
     * activity_log.put("activity_log.bl_id","XC");
     * activity_log.put("activity_log.description","test close request");
     * activity_log.put("activity_log.priority", new Integer(1));
     * activity_log.put("activity_log.activity_type","SERVICE DESK - FURNITURE");
     * 
     * Map inputs = new HashMap(); inputs.put("fields", activity_log);
     * 
     * Map response = new HashMap();
     * 
     * fixture.runEventHandlerMethod( ACTIVITY_ID, EVENT_HANDLER_CLASS, "saveRequest", inputs,
     * response, transactionContext);
     * 
     * JSONObject json = new JSONObject((String) response.get("jsonExpression")); int
     * activity_log_id = json.getInt("activity_log_id");
     * 
     * JSONArray records = new JSONArray(); records.put(new
     * JSONObject("{activity_log.activity_log_id : " + activity_log_id +"}"));
     * 
     * inputs = new HashMap(); inputs.put("records", records);
     * 
     * response = new HashMap();
     * 
     * fixture.runEventHandlerMethod( ACTIVITY_ID, EVENT_HANDLER_CLASS, "closeRequests", inputs,
     * response, transactionContext);
     * 
     * fixture.verifyRow("activity_log", "activity_log_id = " + activity_log_id , new
     * String[]{"status"}, new String[]{"CLOSED"}); }
     */
    /*
     * public void testCloseRequest() throws ParseException{ Map activity_log = new HashMap();
     * activity_log.put("activity_log.requestor","AFM");
     * activity_log.put("activity_log.phone_requestor","227-2508");
     * activity_log.put("activity_log.site_id","OLDCITY");
     * activity_log.put("activity_log.bl_id","XC");
     * activity_log.put("activity_log.description","test close request");
     * activity_log.put("activity_log.priority", new Integer(1));
     * activity_log.put("activity_log.activity_type","SERVICE DESK - COPY SERVICE");
     * 
     * Map inputs = new HashMap(); inputs.put("fields", activity_log);
     * 
     * Map response = new HashMap();
     * 
     * fixture.runEventHandlerMethod( ACTIVITY_ID, EVENT_HANDLER_CLASS, "saveRequest", inputs,
     * response, transactionContext);
     * 
     * JSONObject json = new JSONObject((String) response.get("jsonExpression")); int
     * activity_log_id = json.getInt("activity_log_id");
     * 
     * EventHandlerContext context = new EventHandlerContextImplTest(inputs,
     * fixture.getUserSession(), transactionContext, null); HelpdeskStatusManager manager = new
     * HelpdeskStatusManager(context,activity_log_id); manager.updateStatus("COMPLETED");
     * 
     * inputs = new HashMap(); activity_log.put("activity_log_id", new Integer(activity_log_id));
     * inputs.put("fields", activity_log);
     * 
     * response = new HashMap();
     * 
     * fixture.runEventHandlerMethod( ACTIVITY_ID, EVENT_HANDLER_CLASS, "closeRequest", inputs,
     * response, transactionContext);
     * 
     * fixture.verifyRow("hactivity_log", "activity_log_id = " + activity_log_id , new
     * String[]{"status"}, new String[]{"CLOSED"});
     * 
     * }
     * 
     * public void testArchiveRequest() throws ParseException{ Map activity_log = new HashMap();
     * activity_log.put("activity_log.requestor","AFM");
     * activity_log.put("activity_log.phone_requestor","227-2508");
     * activity_log.put("activity_log.site_id","OLDCITY");
     * activity_log.put("activity_log.bl_id","XC");
     * activity_log.put("activity_log.description","test archive request");
     * activity_log.put("activity_log.priority", new Integer(1));
     * activity_log.put("activity_log.activity_type","SERVICE DESK - FURNITURE");
     * 
     * Map inputs = new HashMap(); inputs.put("fields", activity_log);
     * 
     * Map response = new HashMap();
     * 
     * fixture.runEventHandlerMethod( ACTIVITY_ID, EVENT_HANDLER_CLASS, "saveRequest", inputs,
     * response, transactionContext);
     * 
     * JSONObject json = new JSONObject((String) response.get("jsonExpression")); int
     * activity_log_id = json.getInt("activity_log_id");
     * 
     * fixture.executeSql("UPDATE activity_log SET status = 'CLOSED' WHERE activity_log_id = " +
     * activity_log_id, transactionContext); fixture.executeSql(
     * "INSERT INTO helpdesk_step_log (activity_id,table_name,field_name,pkey_value,status,step,step_type) "
     * + "VALUES('AbBldgOpsHelpDesk','activity_log','activity_log_id'," +
     * activity_log_id+", 'CLOSED','Basic','basic')", transactionContext);
     * 
     * inputs = new HashMap(); response = new HashMap(); inputs.put("activity_log_id", new
     * Integer(activity_log_id)); fixture.runEventHandlerMethod( ACTIVITY_ID, EVENT_HANDLER_CLASS,
     * "archiveRequest", inputs, response, transactionContext);
     * 
     * String[] fields = {"requestor"}; String[] values = {"AFM"};
     * 
     * fixture.commitTransaction(transactionContext);
     * 
     * try { fixture.verifyRow("activity_log","activity_log_id = " +activity_log_id, fields,values);
     * } catch(Exception e){}//should fail, because record should be removed
     * fixture.verifyRow("hactivity_log","activity_log_id = " +activity_log_id, fields,values); int
     * next_id =activity_log_id+1; fixture.verifyRow("activity_log","activity_log_id = " + next_id,
     * new String[]{"activity_type","description"}, new String[]{"SERVICE DESK - FURNITURE",
     * "DO NOT DELETE - This record is for retaining the numbering sequence!"});
     * 
     * }
     */
    /*
     * public void testCheckRequestForm() throws ParseException{ try{ fixture.executeSql(
     * "INSERT INTO activitytype (activity_type,hide_fields) VALUES ('SERVICE DESK - TEST','eq_id')"
     * , transactionContext); } catch (Exception e){ fixture.executeSql(
     * "UPDATE activitytype SET hide_fields = 'eq_id' WHERE activity_type = 'SERVICE DESK - TEST'",
     * transactionContext); }
     * 
     * Map inputs = new HashMap(); Map response = new HashMap();
     * 
     * inputs.put("activity_type", "SERVICE DESK - TEST");
     * 
     * fixture.runEventHandlerMethod( ACTIVITY_ID, EVENT_HANDLER_CLASS, "checkRequestForm", inputs,
     * response, transactionContext);
     * 
     * assertNotNull(response.get("jsonExpression")); JSONObject json = new JSONObject((String)
     * response.get("jsonExpression")); assertFalse(json.getBoolean("equipment")); }
     * 
     * public void testCheckUserForRequest() throws ParseException{ Map response = new HashMap();
     * Map inputs = new HashMap();
     * 
     * Map activity_log = new HashMap();
     * 
     * activity_log.put("activity_log.requestor","AFM");
     * activity_log.put("activity_log.phone_requestor","227-2508");
     * activity_log.put("activity_log.site_id","MARKET");
     * activity_log.put("activity_log.bl_id","HQ"); activity_log.put("activity_log.fl_id","17");
     * activity_log.put("activity_log.rm_id","126");
     * activity_log.put("activity_log.location","test"); activity_log.put("activity_log.eq_id","");
     * activity_log.put("activity_log.prob_type","INSTALL");
     * activity_log.put("activity_log.description","request generated by test");
     * activity_log.put("activity_log.priority", new Integer(1));
     * activity_log.put("activity_log.date_required","");
     * activity_log.put("activity_log.activity_type",Constants.ON_DEMAND_WORK);
     * 
     * inputs.put("fields", activity_log);
     * 
     * fixture.runEventHandlerMethod( ACTIVITY_ID, EVENT_HANDLER_CLASS, "saveRequest", inputs,
     * response, transactionContext);
     * 
     * assertNotNull(response.get("jsonExpression"));
     * 
     * JSONObject json = new JSONObject((String) response.get("jsonExpression")); int
     * activity_log_id = json.getInt("activity_log_id");
     * 
     * inputs = new HashMap(); response = new HashMap();
     * 
     * inputs.put("activity_log_id", new Integer(activity_log_id) ); inputs.put("task","view");
     * 
     * fixture.runEventHandlerMethod( ACTIVITY_ID, EVENT_HANDLER_CLASS, "checkUserForRequest",
     * inputs, response, transactionContext);
     * 
     * assertNotNull(response.get("jsonExpression")); JSONObject res = new JSONObject((String)
     * response.get("jsonExpression")); assertTrue(res.getBoolean("check")); }
     * 
     * 
     * public void testGetRequestorInformation(){ Map inputs = new HashMap(); Map response = new
     * HashMap();
     * 
     * inputs.put("em_id", "AFM");
     * 
     * fixture.runEventHandlerMethod( ACTIVITY_ID, EVENT_HANDLER_CLASS, "getRequestorInformation",
     * inputs, response, transactionContext);
     * 
     * assertNotNull(response.get("jsonExpression")); }
     */
    /*
     * public void testSaveSatisfaction() throws ParseException { Map response = new HashMap(); Map
     * inputs = new HashMap();
     * 
     * Map activity_log = new HashMap();
     * 
     * activity_log.put("activity_log.requestor","AFM");
     * activity_log.put("activity_log.phone_requestor","227-2508");
     * activity_log.put("activity_log.site_id","MARKET");
     * activity_log.put("activity_log.bl_id","HQ"); activity_log.put("activity_log.fl_id","17");
     * activity_log.put("activity_log.rm_id","126");
     * activity_log.put("activity_log.location","test"); activity_log.put("activity_log.eq_id","");
     * activity_log.put("activity_log.prob_type","INSTALL");
     * activity_log.put("activity_log.description","request generated by test");
     * activity_log.put("activity_log.priority",new Integer(1));
     * activity_log.put("activity_log.date_required","");
     * activity_log.put("activity_log.activity_type","SERVICE DESK - MAINTENANCE");
     * activity_log.put("activity_log.status","COMPLETED");
     * 
     * inputs.put("fields", activity_log);
     * 
     * fixture.runEventHandlerMethod( ACTIVITY_ID, EVENT_HANDLER_CLASS, "saveRequest", inputs,
     * response, transactionContext);
     * 
     * assertNotNull(response.get("jsonExpression"));
     * 
     * JSONObject json = new JSONObject((String) response.get("jsonExpression")); int
     * activity_log_id = json.getInt("activity_log_id");
     * 
     * fixture.executeSql("UPDATE activity_log SET status = 'COMPLETED' WHERE activity_log_id =" +
     * activity_log_id, transactionContext);
     * 
     * inputs = new HashMap(); EventHandlerContext context = new EventHandlerContextImplTest(inputs,
     * fixture.getUserSession(), transactionContext, null); Survey survey = new
     * Survey(context,"AbBldgOpsHelpDesk",activity_log_id,"Satisfaction Survey");
     * survey.setEmId("AFM"); survey.invoke(); int stepLogId = Common.getMaxId(context,
     * "helpdesk_step_log", "step_log_id");
     * 
     * Map input_fields = new HashMap(); input_fields.put("activity_log.activity_log_id",new
     * Integer(activity_log_id) ); input_fields.put("activity_log.satisfaction", new Integer(3));
     * input_fields.put("activity_log.satisfaction_notes","ok");
     * input_fields.put("activity_log_step_waiting.step_log_id", new Integer(stepLogId));
     * input_fields.put("activity_log_step_waiting.activity_log_id",new Integer(activity_log_id) );
     * 
     * inputs.put("fields", input_fields);
     * 
     * response = new HashMap();
     * 
     * fixture.runEventHandlerMethod( ACTIVITY_ID, EVENT_HANDLER_CLASS, "saveSatisfaction", inputs,
     * response, transactionContext); fixture.commitTransaction(transactionContext);
     * 
     * String where = "activity_log_id = " + activity_log_id; String[] fields =
     * {"satisfaction_notes","satisfaction"}; String[] values = {"ok","3"};
     * fixture.verifyRow(ACTIVITY_TABLE, where, fields, values);
     * 
     * where = "step_log_id = "+stepLogId; String[] fields2 = {"comments","step_type"}; String[]
     * values2 = {"ok","survey"}; fixture.verifyRow(Constants.STEP_LOG_TABLE, where, fields2,
     * values2); }
     */
    /*
     * public void testVerifyRequest() throws ParseException{ Map response = new HashMap(); Map
     * inputs = new HashMap();
     * 
     * Map activity_log = new HashMap();
     * 
     * activity_log.put("activity_log.requestor","AFM");
     * activity_log.put("activity_log.phone_requestor","227-2508");
     * activity_log.put("activity_log.site_id","MARKET");
     * activity_log.put("activity_log.bl_id","HQ"); activity_log.put("activity_log.fl_id","17");
     * activity_log.put("activity_log.rm_id","126");
     * activity_log.put("activity_log.location","test"); activity_log.put("activity_log.eq_id","");
     * activity_log.put("activity_log.prob_type","INSTALL");
     * activity_log.put("activity_log.description","request generated by test");
     * activity_log.put("activity_log.priority",new Integer(1));
     * activity_log.put("activity_log.date_required","");
     * activity_log.put("activity_log.activity_type","SERVICE DESK - MAINTENANCE");
     * activity_log.put("activity_log.status","COMPLETED");
     * 
     * inputs.put("fields", activity_log);
     * 
     * fixture.runEventHandlerMethod( ACTIVITY_ID, EVENT_HANDLER_CLASS, "saveRequest", inputs,
     * response, transactionContext);
     * 
     * assertNotNull(response.get("jsonExpression"));
     * 
     * JSONObject json = new JSONObject((String) response.get("jsonExpression")); int
     * activity_log_id = json.getInt("activity_log_id");
     * 
     * fixture.executeSql("UPDATE activity_log SET status = 'COMPLETED' WHERE activity_log_id =" +
     * activity_log_id, transactionContext);
     * 
     * inputs = new HashMap(); EventHandlerContext context = new EventHandlerContextImplTest(inputs,
     * fixture.getUserSession(), transactionContext, null); Verification verification = new
     * Verification(context,"AbBldgOpsHelpDesk",activity_log_id,"Verification");
     * verification.setEmId("AFM"); verification.invoke(); int stepLogId = Common.getMaxId(context,
     * "helpdesk_step_log", "step_log_id"); String after = verification.getStepStatusResult();
     * 
     * Map input_fields = new HashMap();
     * input_fields.put("activity_log_step_waiting.activity_log_id",new Integer(activity_log_id) );
     * input_fields.put("activity_log_step_waiting.step_log_id", new Integer(stepLogId));
     * input_fields.put("activity_log_step_waiting.comments", "Verification ok");
     * 
     * inputs.put("fields", input_fields);
     * 
     * response = new HashMap();
     * 
     * fixture.runEventHandlerMethod( ACTIVITY_ID, EVENT_HANDLER_CLASS, "verifyRequest", inputs,
     * response, transactionContext);
     * 
     * String where = "step_log_id = "+stepLogId; String[] fields =
     * {"comments","step_status_result"}; String[] values = {"Verification ok",after};
     * fixture.verifyRow(Constants.STEP_LOG_TABLE, where, fields, values); }
     */
    /*
     * public void testReturnRequestIncomplete() throws ParseException{ Map response = new
     * HashMap(); Map inputs = new HashMap();
     * 
     * Map activity_log = new HashMap();
     * 
     * activity_log.put("activity_log.requestor","AFM");
     * activity_log.put("activity_log.phone_requestor","227-2508");
     * activity_log.put("activity_log.site_id","MARKET");
     * activity_log.put("activity_log.bl_id","HQ"); activity_log.put("activity_log.fl_id","17");
     * activity_log.put("activity_log.rm_id","126");
     * activity_log.put("activity_log.location","test"); activity_log.put("activity_log.eq_id","");
     * activity_log.put("activity_log.prob_type","INSTALL");
     * activity_log.put("activity_log.description","request generated by test");
     * activity_log.put("activity_log.priority",new Integer(1));
     * activity_log.put("activity_log.date_required","");
     * activity_log.put("activity_log.activity_type","SERVICE DESK - MAINTENANCE");
     * activity_log.put("activity_log.status","COMPLETED");
     * 
     * inputs.put("fields", activity_log);
     * 
     * fixture.runEventHandlerMethod( ACTIVITY_ID, EVENT_HANDLER_CLASS, "saveRequest", inputs,
     * response, transactionContext);
     * 
     * assertNotNull(response.get("jsonExpression"));
     * 
     * JSONObject json = new JSONObject((String) response.get("jsonExpression")); int
     * activity_log_id = json.getInt("activity_log_id");
     * 
     * fixture.executeSql("UPDATE activity_log SET status = 'COMPLETED' WHERE activity_log_id =" +
     * activity_log_id, transactionContext);
     * 
     * inputs = new HashMap(); EventHandlerContext context = new EventHandlerContextImplTest(inputs,
     * fixture.getUserSession(), transactionContext, null); Verification verification = new
     * Verification(context,"AbBldgOpsHelpDesk",activity_log_id,"Verification");
     * verification.setEmId("AFM"); verification.invoke(); int stepLogId = Common.getMaxId(context,
     * "helpdesk_step_log", "step_log_id"); String after = verification.getStepStatusRejected();
     * 
     * Map input_fields = new HashMap();
     * input_fields.put("activity_log_step_waiting.activity_log_id",new Integer(activity_log_id) );
     * input_fields.put("activity_log_step_waiting.step_log_id", new Integer(stepLogId));
     * input_fields.put("activity_log_step_waiting.comments", "Verification ok");
     * 
     * inputs.put("fields", input_fields);
     * 
     * response = new HashMap();
     * 
     * fixture.runEventHandlerMethod( ACTIVITY_ID, EVENT_HANDLER_CLASS, "returnRequestIncomplete",
     * inputs, response, transactionContext);
     * 
     * String where = "step_log_id = "+stepLogId; String[] fields =
     * {"comments","step_status_result"}; String[] values = {"Verification ok",after};
     * fixture.verifyRow(Constants.STEP_LOG_TABLE, where, fields, values); }
     */
    
    /**
     * Test method for
     * {@link com.archibus.eventhandler.helpdesk.RequestHandler#saveEndUserRequest(com.archibus.jobmanager.EventHandlerContext)}
     * .
     * 
     * public void testSaveRequest() throws ParseException {
     * 
     * Map response = new HashMap(); Map inputs = new HashMap();
     * 
     * Map activity_log = new HashMap();
     * 
     * activity_log.put("activity_log.requestor","AFM");
     * activity_log.put("activity_log.phone_requestor","227-2508");
     * activity_log.put("activity_log.site_id","MARKET");
     * activity_log.put("activity_log.bl_id","HQ"); activity_log.put("activity_log.fl_id","17");
     * activity_log.put("activity_log.rm_id","126");
     * activity_log.put("activity_log.location","test"); activity_log.put("activity_log.eq_id","");
     * activity_log.put("activity_log.prob_type","INSTALL");
     * activity_log.put("activity_log.description","request generated by test");
     * activity_log.put("activity_log.priority", new Integer(0));
     * activity_log.put("activity_log.date_required","");
     * activity_log.put("activity_log.activity_type",Constants.ON_DEMAND_WORK);
     * 
     * inputs.put("fields", activity_log);
     * 
     * fixture.runEventHandlerMethod( ACTIVITY_ID, EVENT_HANDLER_CLASS, "saveRequest", inputs,
     * response, transactionContext);
     * 
     * 
     * if(response.containsKey("jsonExpression")){ assertNotNull(response.get("jsonExpression"));
     * 
     * JSONObject json = new JSONObject((String) response.get("jsonExpression")); int id =
     * json.getInt("activity_log_id");
     * 
     * // int id = ((Integer) response.get("message")).intValue(); String[] fields =
     * {"requestor","phone_requestor"
     * ,"site_id","bl_id","fl_id","rm_id","location","prob_type","description"
     * ,"priority","activity_type","status"}; String[] values =
     * {"AFM","227-2508","MARKET","HQ","17",
     * "126","test","INSTALL","request generated by test","0",Constants.ON_DEMAND_WORK,"CREATED"};
     * String where = "activity_log_id = " + id; fixture.verifyRow(ACTIVITY_TABLE, where, fields,
     * values);
     * 
     * } else { fail("new activity_log_id not returned"); } }
     */
    
    /**
     * Test method for
     * {@link com.archibus.eventhandler.helpdesk.RequestHandler#deleteRequest(com.archibus.jobmanager.EventHandlerContext)}
     * .
     * 
     * public void testDeleteRequest() throws ParseException {
     * 
     * Map response = new HashMap(); Map inputs = new HashMap();
     * 
     * Map activity_log = new HashMap();
     * 
     * activity_log.put("activity_log.requestor","AFM");
     * activity_log.put("activity_log.phone_requestor","227-2508");
     * activity_log.put("activity_log.site_id","MARKET");
     * activity_log.put("activity_log.bl_id","HQ"); activity_log.put("activity_log.fl_id","17");
     * activity_log.put("activity_log.rm_id","126");
     * activity_log.put("activity_log.location","test");
     * activity_log.put("activity_log.prob_type","INSTALL");
     * activity_log.put("activity_log.description","request generated by test");
     * activity_log.put("activity_log.priority", new Integer(0));
     * activity_log.put("activity_log.activity_type",Constants.ON_DEMAND_WORK);
     * 
     * inputs.put("fields",activity_log);
     * 
     * fixture.runEventHandlerMethod( ACTIVITY_ID, EVENT_HANDLER_CLASS, "saveRequest", inputs,
     * response, transactionContext);
     * 
     * assertNotNull(response.get("jsonExpression"));
     * 
     * JSONObject json = new JSONObject((String) response.get("jsonExpression")); int
     * activity_log_id = json.getInt("activity_log_id");
     * 
     * response = new HashMap(); inputs = new HashMap();
     * 
     * activity_log.put("activity_log.activity_log_id", new Integer(activity_log_id) );
     * inputs.put("fields",activity_log);
     * 
     * fixture.runEventHandlerMethod( ACTIVITY_ID, EVENT_HANDLER_CLASS, "deleteRequest", inputs,
     * response, transactionContext);
     * 
     * String where = "activity_log_id = " + activity_log_id; String[] fields = {"activity_log_id"};
     * String[] values = { ""+activity_log_id }; try { fixture.verifyRow(ACTIVITY_TABLE, where,
     * fields, values); } catch (ExceptionBase e){ //verifyRow must fail, row should be deleted } }
     */
    
    /**
     * Test method for
     * {@link com.archibus.eventhandler.helpdesk.RequestHandler#submitRequest(com.archibus.jobmanager.EventHandlerContext)}
     * .
     * 
     * public void testSubmitRequest() throws ParseException { Map response = new HashMap(); Map
     * inputs = new HashMap();
     * 
     * Map activity_log = new HashMap();
     * 
     * activity_log.put("activity_log.requestor","AFM");
     * activity_log.put("activity_log.phone_requestor","227-2508");
     * activity_log.put("activity_log.site_id","MARKET");
     * activity_log.put("activity_log.bl_id","HQ"); activity_log.put("activity_log.fl_id","17");
     * activity_log.put("activity_log.rm_id","126");
     * activity_log.put("activity_log.location","test");
     * activity_log.put("activity_log.description","request generated by test");
     * activity_log.put("activity_log.priority", new Integer(1));
     * activity_log.put("activity_log.activity_type",Constants.ON_DEMAND_WORK);
     * 
     * inputs.put("tableName", "activity_log"); inputs.put("fieldName", "activity_log_id");
     * inputs.put("activity_log.activity_log_id",new Integer(0)); inputs.put("fields",activity_log);
     * 
     * 
     * fixture.runEventHandlerMethod( ACTIVITY_ID, EVENT_HANDLER_CLASS, "submitRequest", inputs,
     * response, transactionContext);
     * 
     * fixture.commitTransaction(transactionContext);
     * 
     * assertNotNull(response.get("jsonExpression"));
     * 
     * JSONObject jsonObject = new JSONObject((String) response.get("jsonExpression")); int
     * activity_log_id = jsonObject.getInt("activity_log_id");
     * 
     * 
     * String where = "activity_log_id = " + activity_log_id; String[] fields = {"description"};
     * String[] values = {"request generated by test"}; fixture.verifyRow(ACTIVITY_TABLE, where,
     * fields, values); }
     */
    
    /**
     * Test method for
     * {@link com.archibus.eventhandler.helpdesk.RequestHandler#checkAutoApprove(com.archibus.jobmanager.EventHandlerContext)}
     * .
     * 
     * public void testCheckAutoApprove() { Map response = new HashMap(); Map inputs = new
     * HashMap();
     * 
     * Map activity_log = new HashMap();
     * 
     * activity_log.put("activity_log.requestor","AFM");
     * activity_log.put("activity_log.phone_requestor","227-2508");
     * activity_log.put("activity_log.site_id","MARKET");
     * activity_log.put("activity_log.bl_id","HQ"); activity_log.put("activity_log.fl_id","17");
     * activity_log.put("activity_log.rm_id","126");
     * activity_log.put("activity_log.location","test");
     * activity_log.put("activity_log.prob_type","INSTALL");
     * activity_log.put("activity_log.description","request generated by test");
     * activity_log.put("activity_log.priority", new Integer(1));
     * activity_log.put("activity_log.activity_type",Constants.ON_DEMAND_WORK);
     * 
     * inputs.put("tableName", "activity_log"); inputs.put("fieldName", "activity_log_id");
     * inputs.put("activity_log.activity_log_id", new Integer(0));
     * inputs.put("fields",activity_log);
     * 
     * fixture.runEventHandlerMethod( ACTIVITY_ID, EVENT_HANDLER_CLASS, "submitRequest", inputs,
     * response, transactionContext);
     * 
     * if(response.containsKey("message")){ Integer activity_log_id = (Integer)
     * response.get("message");
     * 
     * inputs.put("activity_log.activity_log_id", activity_log_id); fixture.runEventHandlerMethod(
     * ACTIVITY_ID, EVENT_HANDLER_CLASS, "checkAutoApprove", inputs, response, transactionContext);
     * 
     * String[] fields = {"status"}; String[] values = {"Approved"};
     * fixture.verifyRow(ACTIVITY_TABLE, "activity_log_id = " + activity_log_id, fields, values); }
     * }
     */
    
    /**
     * Test method for
     * {@link com.archibus.eventhandler.helpdesk.RequestHandler#approveEndUserRequest(com.archibus.jobmanager.EventHandlerContext)}
     * .
     * 
     * public void testApproveRequest() throws ParseException { Map response = new HashMap(); Map
     * inputs = new HashMap();
     * 
     * EventHandlerContext context = new EventHandlerContextImplTest(inputs,
     * fixture.getUserSession(), transactionContext, null);
     * 
     * Map activity_log = new HashMap();
     * 
     * activity_log.put("activity_log.requestor","AFM");
     * activity_log.put("activity_log.phone_requestor","227-2508");
     * activity_log.put("activity_log.site_id","MARKET");
     * activity_log.put("activity_log.bl_id","HQ"); activity_log.put("activity_log.fl_id","17");
     * activity_log.put("activity_log.rm_id","126");
     * activity_log.put("activity_log.location","test");
     * activity_log.put("activity_log.prob_type","INSTALL");
     * activity_log.put("activity_log.description","request generated by test");
     * activity_log.put("activity_log.priority",new Integer(1));
     * activity_log.put("activity_log.activity_type",Constants.ON_DEMAND_WORK);
     * activity_log.put("activity_log.status", "REQUESTED");
     * 
     * inputs.put("fields",activity_log);
     * 
     * fixture.runEventHandlerMethod( ACTIVITY_ID, EVENT_HANDLER_CLASS, "submitRequest", inputs,
     * response, transactionContext);
     * 
     * JSONObject json = new JSONObject((String) response.get("jsonExpression")); int
     * activity_log_id = json.getInt("activity_log_id");
     * 
     * int stepLogId = Common.getMaxId(context, "helpdesk_step_log", "step_log_id");
     * 
     * inputs = new HashMap(); activity_log.put("activity_log_step_waiting.step_log_id",new
     * Integer(stepLogId)); activity_log.put("activity_log_step_waiting.em_id","AFM");
     * activity_log.put("activity_log_step_waiting.step","Manager Approval");
     * activity_log.put("activity_log.activity_log_id", new Integer(activity_log_id));
     * inputs.put("fields", activity_log);
     * 
     * inputs.put("tableName", "activity_log"); inputs.put("fieldName", "activity_log_id");
     * inputs.put("comments", "test approve"); inputs.put("activity_log.activity_log_id", new
     * Integer(activity_log_id) );
     * 
     * fixture.runEventHandlerMethod( ACTIVITY_ID, EVENT_HANDLER_CLASS, "approveRequest", inputs,
     * response, transactionContext);
     * 
     * fixture.commitTransaction(transactionContext);
     * 
     * String[] appFields = {"comments"}; String[] appValues = {"test approve"}; String where =
     * "step_log_id = "+stepLogId;
     * fixture.verifyRow(Constants.STEP_LOG_TABLE,where,appFields,appValues);
     * 
     * String[] field = {"status"}; String[] values = {"APPROVED"};
     * fixture.verifyRow(Constants.ACTION_ITEM_TABLE, "activity_log_id =" + activity_log_id,
     * field,values); }
     */
    
    /**
     * Test method for
     * {@link com.archibus.eventhandler.helpdesk.RequestHandler#rejectEndUserRequest(com.archibus.jobmanager.EventHandlerContext)}
     * .
     * 
     * public void testRejectRequest() throws ParseException { Map response = new HashMap(); Map
     * inputs = new HashMap();
     * 
     * Map activity_log = new HashMap();
     * 
     * activity_log.put("activity_log.requestor","AFM");
     * activity_log.put("activity_log.phone_requestor","227-2508");
     * activity_log.put("activity_log.site_id","MARKET");
     * activity_log.put("activity_log.bl_id","HQ"); activity_log.put("activity_log.fl_id","17");
     * activity_log.put("activity_log.rm_id","126");
     * activity_log.put("activity_log.location","test");
     * activity_log.put("activity_log.prob_type","INSTALL");
     * activity_log.put("activity_log.description","request generated by test");
     * activity_log.put("activity_log.priority", new Integer(1));
     * activity_log.put("activity_log.activity_type",Constants.ON_DEMAND_WORK);
     * 
     * inputs.put("fields",activity_log);
     * 
     * fixture.runEventHandlerMethod( ACTIVITY_ID, EVENT_HANDLER_CLASS, "saveRequest", inputs,
     * response, transactionContext);
     * 
     * assertNotNull(response.get("jsonExpression"));
     * 
     * JSONObject json = new JSONObject((String) response.get("jsonExpression")); int
     * activity_log_id = json.getInt("activity_log_id");
     * 
     * fixture.executeSql("UPDATE activity_log SET status = 'REQUESTED' WHERE activity_log_id =" +
     * activity_log_id, transactionContext);
     * 
     * EventHandlerContext context = new EventHandlerContextImplTest(inputs,
     * fixture.getUserSession(), transactionContext, null); Approval approval = new
     * Approval(context,ACTIVITY_ID,activity_log_id,"Manager Approval"); approval.setEmId("AFM");
     * approval.invoke();
     * 
     * int stepLogId = Common.getMaxId(context, "helpdesk_step_log", "step_log_id");
     * 
     * inputs.remove("fields"); activity_log.put("activity_log_step_waiting.step_log_id",new
     * Integer(stepLogId)); activity_log.put("activity_log_step_waiting.em_id","AFM");
     * activity_log.put("activity_log_step_waiting.step","Manager Approval");
     * activity_log.put("activity_log.activity_log_id", new Integer(activity_log_id) );
     * inputs.put("fields", activity_log);
     * 
     * inputs.put("tableName", "activity_log"); inputs.put("fieldName", "activity_log_id");
     * inputs.put("comments", "test reject"); inputs.put("activity_log.activity_log_id", new
     * Integer(activity_log_id) );
     * 
     * fixture.runEventHandlerMethod( ACTIVITY_ID, EVENT_HANDLER_CLASS, "rejectRequest", inputs,
     * response, transactionContext); fixture.commitTransaction(transactionContext); String[]
     * appFields = {"em_id","comments"}; String[] appValues = {"AFM","test reject"}; String where =
     * "step_log_id = " + stepLogId;
     * fixture.verifyRow(Constants.STEP_LOG_TABLE,where,appFields,appValues);
     * 
     * String[] field = {"status"}; String[] values = {"REJECTED"};
     * fixture.verifyRow("hactivity_log", "activity_log_id =" + activity_log_id, field,values); }
     */
    
    /*
     * public void testIssueRequest() throws ParseException{ Map response = new HashMap(); Map
     * inputs = new HashMap();
     * 
     * Map activity_log = new HashMap();
     * 
     * activity_log.put("activity_log.requestor","AFM");
     * activity_log.put("activity_log.phone_requestor","227-2508");
     * activity_log.put("activity_log.site_id","MARKET");
     * activity_log.put("activity_log.bl_id","HQ"); activity_log.put("activity_log.fl_id","17");
     * activity_log.put("activity_log.rm_id","126");
     * activity_log.put("activity_log.location","test");
     * activity_log.put("activity_log.prob_type","INSTALL");
     * activity_log.put("activity_log.description","request generated by test");
     * activity_log.put("activity_log.priority", new Integer(1));
     * activity_log.put("activity_log.activity_type",Constants.ON_DEMAND_WORK);
     * 
     * inputs.put("fields",activity_log);
     * 
     * fixture.runEventHandlerMethod( ACTIVITY_ID, EVENT_HANDLER_CLASS, "saveRequest", inputs,
     * response, transactionContext);
     * 
     * assertNotNull(response.get("jsonExpression"));
     * 
     * JSONObject json = new JSONObject((String) response.get("jsonExpression")); int
     * activity_log_id = json.getInt("activity_log_id");
     * 
     * inputs = new HashMap(); inputs.put("fields", activity_log);
     * inputs.put("activity_log.activity_log_id", new Integer(activity_log_id));
     * 
     * response = new HashMap();
     * 
     * fixture.runEventHandlerMethod( ACTIVITY_ID, EVENT_HANDLER_CLASS, "issueRequest", inputs,
     * response, transactionContext);
     * 
     * fixture.verifyRow("activity_log", "activity_log_id = " + activity_log_id, new
     * String[]{"status"}, new String[]{"IN PROGRESS"}); }
     * 
     * public void testCompleteRequest() throws ParseException{ Map response = new HashMap(); Map
     * inputs = new HashMap();
     * 
     * Map activity_log = new HashMap();
     * 
     * activity_log.put("activity_log.requestor","AFM");
     * activity_log.put("activity_log.phone_requestor","227-2508");
     * activity_log.put("activity_log.site_id","MARKET");
     * activity_log.put("activity_log.bl_id","HQ"); activity_log.put("activity_log.fl_id","17");
     * activity_log.put("activity_log.rm_id","126");
     * activity_log.put("activity_log.location","test");
     * activity_log.put("activity_log.prob_type","INSTALL");
     * activity_log.put("activity_log.description","request generated by test");
     * activity_log.put("activity_log.priority", new Integer(1));
     * activity_log.put("activity_log.activity_type",Constants.ON_DEMAND_WORK);
     * 
     * inputs.put("fields",activity_log);
     * 
     * fixture.runEventHandlerMethod( ACTIVITY_ID, EVENT_HANDLER_CLASS, "saveRequest", inputs,
     * response, transactionContext);
     * 
     * assertNotNull(response.get("jsonExpression"));
     * 
     * JSONObject json = new JSONObject((String) response.get("jsonExpression")); int
     * activity_log_id = json.getInt("activity_log_id");
     * 
     * inputs = new HashMap(); inputs.put("fields", activity_log);
     * inputs.put("activity_log.activity_log_id", new Integer(activity_log_id));
     * 
     * response = new HashMap();
     * 
     * fixture.runEventHandlerMethod( ACTIVITY_ID, EVENT_HANDLER_CLASS, "completeRequest", inputs,
     * response, transactionContext);
     * 
     * fixture.verifyRow("activity_log", "activity_log_id = " + activity_log_id, new
     * String[]{"status"}, new String[]{"COMPLETED"}); }
     */
    
    /*
     * public void testCancelRequest() throws ParseException{ Map response = new HashMap(); Map
     * inputs = new HashMap();
     * 
     * Map activity_log = new HashMap();
     * 
     * activity_log.put("activity_log.requestor","AFM");
     * activity_log.put("activity_log.phone_requestor","227-2508");
     * activity_log.put("activity_log.site_id","MARKET");
     * activity_log.put("activity_log.bl_id","HQ"); activity_log.put("activity_log.fl_id","17");
     * activity_log.put("activity_log.rm_id","126");
     * activity_log.put("activity_log.location","test");
     * activity_log.put("activity_log.prob_type","INSTALL");
     * activity_log.put("activity_log.description","request generated by test");
     * activity_log.put("activity_log.priority", new Integer(1));
     * activity_log.put("activity_log.activity_type",Constants.ON_DEMAND_WORK);
     * 
     * inputs.put("fields",activity_log);
     * 
     * fixture.runEventHandlerMethod( ACTIVITY_ID, EVENT_HANDLER_CLASS, "saveRequest", inputs,
     * response, transactionContext);
     * 
     * assertNotNull(response.get("jsonExpression"));
     * 
     * JSONObject json = new JSONObject((String) response.get("jsonExpression")); int
     * activity_log_id = json.getInt("activity_log_id");
     * 
     * inputs = new HashMap(); inputs.put("fields", activity_log);
     * inputs.put("activity_log.activity_log_id", new Integer(activity_log_id));
     * 
     * response = new HashMap(); try{ fixture.runEventHandlerMethod( ACTIVITY_ID,
     * EVENT_HANDLER_CLASS, "cancelRequest", inputs, response, transactionContext); } catch
     * (HelpdeskException e){//exception should be thrown because request status is not Requested} }
     * 
     * fixture.executeSql("UPDATE activity_log SET status = 'REQUESTED' WHERE activity_log_id = " +
     * activity_log_id, transactionContext); fixture.runEventHandlerMethod( ACTIVITY_ID,
     * EVENT_HANDLER_CLASS, "cancelRequest", inputs, response, transactionContext);
     * 
     * fixture.verifyRow("activity_log", "activity_log_id = " + activity_log_id, new
     * String[]{"status"}, new String[]{"CANCELLED"}); }
     * 
     * public void testDeclineRequest() throws ParseException{ Map inputs = new HashMap(); Map
     * response = new HashMap();
     * 
     * Map fields = new HashMap(); fields.put("requestor", "AFM");
     * fields.put("phone_requestor","227-2508"); fields.put("site_id","WEST");
     * fields.put("bl_id","PLAZA 2"); fields.put("priority",new Integer(1));
     * fields.put("activity_type","SERVICE DESK - FURNITURE"); fields.put("dp_id","ENGINEERING");
     * fields.put("dv_id","ELECTRONIC SYS."); fields.put("created_by", "AFM");
     * 
     * inputs.put("fields",fields); inputs.put("tableName", "activity_log");
     * inputs.put("fieldName","activity_log_id");
     * 
     * fixture.runEventHandlerMethod( ACTIVITY_ID, EVENT_HANDLER_CLASS, "submitRequest", inputs,
     * response, transactionContext);
     * 
     * assertNotNull(response.get("jsonExpression"));
     * 
     * JSONObject jsonObject = new JSONObject((String) response.get("jsonExpression")); int
     * activity_log_id = jsonObject.getInt("activity_log_id");
     * 
     * //get step code of last step from database EventHandlerContext context = new
     * EventHandlerContextImplTest(inputs, fixture.getUserSession(), transactionContext, null); int
     * step_log_id = Common.getMaxId(context, "helpdesk_step_log", "step_log_id");
     * 
     * //accept request inputs = new HashMap(); response = new HashMap(); fields = new HashMap();
     * fields.put("activity_log.requestor", "AFM");
     * fields.put("activity_log.phone_requestor","227-2508");
     * fields.put("activity_log.site_id","WEST"); fields.put("activity_log.bl_id","PLAZA 1");
     * fields.put("activity_log.priority",new Integer(1));
     * fields.put("activity_log.activity_type","SERVICE DESK - FURNITURE");
     * fields.put("activity_log.dp_id","ENGINEERING");
     * fields.put("activity_log.dv_id","ELECTRONIC SYS."); fields.put("activity_log.created_by",
     * "AFM"); fields.put("activity_log_step_waiting.step_log_id",new Integer(step_log_id));
     * fields.put("activity_log_step_waiting.vn_id","PROCOS");
     * fields.put("activity_log.activity_log_id", new Integer(activity_log_id) );
     * fields.put("activity_log.status", "APPROVED");
     * 
     * inputs.put("fields", fields); inputs.put("comments", "I won't do it");
     * 
     * fixture.runEventHandlerMethod( ACTIVITY_ID, EVENT_HANDLER_CLASS, "declineRequest", inputs,
     * response, transactionContext);
     * 
     * fixture.verifyRow("activity_log", "activity_log_id = " + activity_log_id, new
     * String[]{"status"}, new String[]{"APPROVED"}); fixture.verifyRow("helpdesk_step_log",
     * "step_log_id = "+step_log_id, new String[]{"step_status_result","comments"}, new
     * String[]{"declined","I won't do it"}); }
     */
    
    /*
     * public void testGetEmployeeLocation() throws ParseException{ Map inputs = new HashMap();
     * inputs.put("em_id", "AFM");
     * 
     * Map response = new HashMap(); fixture.runEventHandlerMethod( ACTIVITY_ID,
     * EVENT_HANDLER_CLASS, "getEmployeeLocation", inputs, response, transactionContext);
     * 
     * assertNotNull(response.get("jsonExpression")); JSONObject json = new JSONObject((String)
     * response.get("jsonExpression"));
     * 
     * assertEquals("MARKET", json.getString("site_id")); assertEquals("HQ",
     * json.getString("bl_id")); }
     */
    
}
