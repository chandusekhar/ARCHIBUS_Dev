package com.archibus.eventhandler.ondemandwork;

import org.json.*;

import com.archibus.context.ContextStore;
import com.archibus.datasource.DataSourceTestBase;
import com.archibus.jobmanager.EventHandlerContext;

public class TestWorkRequestHandler extends DataSourceTestBase {
    
    /**
     * test checkWoSupervisorSubstitutes().
     */
    public void testCheckWoSupervisorSubstitutes() {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final WorkRequestHandler handler = new WorkRequestHandler();
        
        final JSONArray records = new JSONArray();
        final JSONObject record = new JSONObject();
        record.put("wo.wo_id", 1);
        records.put(record);
        handler.checkWoSupervisorSubstitutes(records, true);
        assertNotNull(context.getResponse().get("jsonExpression"));
    }
    
    /**
     * test checkWrSupervisorSubstitutes().
     */
    public void testCheckWrSupervisorSubstitutes() {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final WorkRequestHandler handler = new WorkRequestHandler();
        
        final JSONArray records = new JSONArray();
        final JSONObject record = new JSONObject();
        record.put("wr.wr_id", 1);
        records.put(record);
        handler.checkWrSupervisorSubstitutes(records, true);
        assertNotNull(context.getResponse().get("jsonExpression"));
    }
    
    /**
     * test checkVerificationSubstitute().
     */
    public void testCheckVerificationSubstitute() {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final WorkRequestHandler handler = new WorkRequestHandler();
        
        handler.checkVerificationSubstitute("1");
        assertNotNull(context.getResponse().get("jsonExpression"));
    }
    
    /**
     * test checkWoCfSubstitutes().
     */
    public void testCheckWoCfSubstitutes() {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final WorkRequestHandler handler = new WorkRequestHandler();
        
        final JSONArray records = new JSONArray();
        final JSONObject record = new JSONObject();
        record.put("wo.wo_id", 1);
        records.put(record);
        handler.checkWoCfSubstitutes(records);
        assertNotNull(context.getResponse().get("jsonExpression"));
    }
    
    /**
     * test checkWrCfSubstitutes().
     */
    public void testCheckWrCfSubstitutes() {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final WorkRequestHandler handler = new WorkRequestHandler();
        
        final JSONArray records = new JSONArray();
        final JSONObject record = new JSONObject();
        record.put("wr.wr_id", 1);
        records.put(record);
        handler.checkWrCfSubstitutes(records);
        assertNotNull(context.getResponse().get("jsonExpression"));
    }
    
    /**
     * test getHelpRequestsForWorkRequests().
     */
    public void testGetHelpRequestsForWorkRequests() {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final WorkRequestHandler handler = new WorkRequestHandler();
        
        final JSONArray records = new JSONArray();
        final JSONObject record = new JSONObject();
        record.put("wr.wr_id", 1);
        records.put(record);
        handler.getHelpRequestsForWorkRequests(records);
        assertNotNull(context.getResponse().get("jsonExpression"));
    }
    
    /*
     * public void testAutoApproveDispatch() throws ParseException{ Map inputs = new HashMap(); Map
     * response = new HashMap();
     * 
     * Map fields = new HashMap(); fields.put("requestor", "AFM"); fields.put("site_id","MARKET");
     * fields.put("bl_id","HQ"); fields.put("priority",new Integer(1));
     * fields.put("activity_type","SERVICE DESK - MAINTENANCE"); fields.put("prob_type", "DOOR");
     * fields.put("created_by", "AFM");
     * 
     * inputs.put("fields",fields); inputs.put("tableName", "activity_log");
     * inputs.put("fieldName","activity_log_id");
     * 
     * fixture.runEventHandlerMethod( "AbBldgOpsHelpDesk",
     * "com.archibus.eventhandler.helpdesk.RequestHandler", "submitRequest", inputs, response,
     * transactionContext);
     * 
     * assertNotNull(response.get("jsonExpression"));
     * 
     * JSONObject jsonObject = new JSONObject((String) response.get("jsonExpression")); int
     * activity_log_id = jsonObject.getInt("activity_log_id");
     * 
     * fixture.verifyRow("activity_log", "activity_log_id="+activity_log_id, new String[]{"status"},
     * new String[]{"APPROVED"}); }
     */
    
    /**
     * public void testCancelWorkRequests() throws ParseException { final RequestHandler handler =
     * new RequestHandler(); final EventHandlerContext context =
     * ContextStore.get().getEventHandlerContext();
     * 
     * JSONObject fields = new JSONObject(); fields.put("activity_log.requestor", "AI");
     * fields.put("activity_log.site_id", "OLDCITY"); fields.put("activity_log.bl_id", "I202");
     * fields.put("activity_log.priority", new Integer(1)); fields.put("activity_log.activity_type",
     * "SERVICE DESK - MAINTENANCE"); fields.put("activity_log.prob_type", "CEILING TILE");
     * fields.put("activity_log.created_by", "AI");
     * 
     * handler.submitRequest("", fields);
     * 
     * assertNotNull(context.getResponse().get("jsonExpression"));
     * 
     * final JSONObject jsonObject = new JSONObject((String)
     * context.getResponse().get("jsonExpression")); final int activity_log_id =
     * jsonObject.getInt("activity_log_id");
     * 
     * JSONArray records = new JSONArray(); JSONObject record = new JSONObject();
     * record.put("activity_log.activity_log_id", activity_log_id); records.put(record);
     * 
     * inputs = new HashMap(); inputs.put("records", records); response = new HashMap();
     * 
     * fixture.runEventHandlerMethod(ACTIVITY_ID, EVENT_HANDLER_CLASS,
     * "createWorkRequestFromHelpRequest", inputs, response, transactionContext);
     * 
     * final EventHandlerContext context = new EventHandlerContextImplTest(inputs,
     * fixture.getUserSession(), transactionContext, null); final int wr_id =
     * Common.getMaxId(context, "wr", "wr_id"); records = new JSONArray(); record = new
     * JSONObject(); record.put("wr.wr_id", wr_id); records.put(record);
     * 
     * fields = new HashMap(); fields.put("wo.bl_id", "I202"); fields.put("wo.description",
     * "test ceiling tiles");
     * 
     * inputs = new HashMap(); inputs.put("records", records); inputs.put("link_to", new
     * Integer(activity_log_id)); inputs.put("fields", fields);
     * 
     * fixture.runEventHandlerMethod(ACTIVITY_ID, EVENT_HANDLER_CLASS, "saveNewWorkorder", inputs,
     * response, transactionContext);
     * 
     * final int wo_id = Common.getMaxId(context, "wo", "wo_id");
     * 
     * assertEquals(activity_log_id, ((Integer) Common.getValue(context, "wr", "activity_log_id",
     * "wr_id = " + wr_id)).intValue()); assertEquals(wo_id, ((Integer) Common.getValue(context,
     * "wr", "wo_id", "wr_id = " + wr_id)).intValue()); assertEquals( wo_id, ((Integer)
     * Common.getValue(context, "activity_log", "wo_id", "activity_log_id = " +
     * activity_log_id)).intValue()); assertNull(Common.getValue(context, "activity_log", "wr_id",
     * "activity_log_id = " + activity_log_id));
     * 
     * fields = new HashMap();
     * 
     * fields.put("wr.requestor", "AFM"); fields.put("wr.phone", "227-2508");
     * fields.put("wr.site_id", "MARKET"); fields.put("wr.bl_id", "HQ"); fields.put("wr.fl_id",
     * "17"); fields.put("wr.rm_id", "126"); fields.put("wr.location", "test");
     * fields.put("wr.eq_id", ""); fields.put("wr.prob_type", "INSTALL");
     * fields.put("wr.description", "workrequest generated by test"); fields.put("wr.priority", new
     * Integer(1)); fields.put("wr.activity_type", Constants.ON_DEMAND_WORK);
     * fields.put("wr.status", "Com");
     * 
     * inputs = new HashMap(); inputs.put("fields", fields); response = new HashMap();
     * 
     * fixture.runEventHandlerMethod(ACTIVITY_ID, EVENT_HANDLER_CLASS, "saveWorkRequest", inputs,
     * response, transactionContext);
     * 
     * assertNotNull(response.get("jsonExpression")); JSONObject json = new JSONObject((String)
     * response.get("jsonExpression")); final int wr_id2 = json.getInt("wr_id");
     * fixture.executeSql("UPDATE wr SET wo_id=" + wo_id + " WHERE wr_id = " + wr_id2,
     * transactionContext);
     * 
     * final JSONArray jsonArray = new JSONArray(); json = new JSONObject(); json.put("wr.wr_id",
     * wr_id2); jsonArray.put(json);
     * 
     * inputs = new HashMap(); inputs.put("records", jsonArray);
     * 
     * response = new HashMap();
     * 
     * fixture.runEventHandlerMethod("AbBldgOpsHelpDesk",
     * "com.archibus.eventhandler.ondemandwork.WorkRequestHandler", "cancelWorkRequests", inputs,
     * response, transactionContext);
     * 
     * fixture.verifyRow("wr", "wr_id = " + wr_id2, new String[] { "status" }, new String[] { "Can"
     * });
     * 
     * inputs = new HashMap(); inputs.put("wr_id", new Integer(wr_id));
     * 
     * response = new HashMap();
     * 
     * fixture.runEventHandlerMethod("AbBldgOpsHelpDesk",
     * "com.archibus.eventhandler.ondemandwork.WorkRequestHandler", "cancelWorkRequest", inputs,
     * response, transactionContext);
     * 
     * fixture.verifyRow("hwr", "wr_id = " + wr_id, new String[] { "status" }, new String[] { "Can"
     * }); fixture.verifyRow("hwo", "wo_id = " + wo_id, new String[] { "bl_id" }, new String[] {
     * "I202" }); }
     */
    
    /*
     * public void testIssueWorkRequests() { JSONArray jsonArray = new JSONArray(); JSONObject json
     * = new JSONObject(); json.put("wo_id", 1999000028); json.put("wr_id",950000175);
     * jsonArray.put(json);
     * 
     * Map inputs = new HashMap(); inputs.put("records", jsonArray);
     * 
     * Map response = new HashMap();
     * 
     * fixture.runEventHandlerMethod( "AbBldgOpsHelpDesk",
     * "com.archibus.eventhandler.ondemandwork.WorkRequestHandler", "issueWorkRequests", inputs,
     * response, transactionContext);
     * 
     * fixture.verifyRow("wr", "wr_id = 950000175", new String[]{"status"}, new String[]{"AA"}); }
     * 
     * public void testSaveNewWorkRequest() throws ParseException{ Map inputs = new HashMap(); Map
     * response = new HashMap();
     * 
     * Map fields = new HashMap(); fields.put("requestor", "AFM"); fields.put("site_id","OLDCITY");
     * fields.put("bl_id","I202"); fields.put("priority",new Integer(1));
     * fields.put("activity_type","SERVICE DESK - MAINTENANCE"); fields.put("prob_type",
     * "ELECTRICAL"); fields.put("created_by", "AFM");
     * 
     * inputs.put("fields",fields); inputs.put("tableName", "activity_log");
     * inputs.put("fieldName","activity_log_id");
     * 
     * fixture.runEventHandlerMethod( "AbBldgOpsHelpDesk",
     * "com.archibus.eventhandler.helpdesk.RequestHandler", "submitRequest", inputs, response,
     * transactionContext);
     * 
     * assertNotNull(response.get("jsonExpression"));
     * 
     * JSONObject jsonObject = new JSONObject((String) response.get("jsonExpression")); int
     * activity_log_id = jsonObject.getInt("activity_log_id");
     * 
     * System.err.println(activity_log_id); }
     * 
     * 
     * public void testSaveNewWorkOrder() throws ParseException{ Map inputs = new HashMap(); Map
     * response = new HashMap();
     * 
     * Map fields = new HashMap(); fields.put("requestor", "AFM"); fields.put("site_id","OLDCITY");
     * fields.put("bl_id","I202"); fields.put("priority",new Integer(1));
     * fields.put("activity_type","SERVICE DESK - MAINTENANCE"); fields.put("prob_type",
     * "CEILING TILE"); fields.put("created_by", "AFM");
     * 
     * inputs.put("fields",fields); inputs.put("tableName", "activity_log");
     * inputs.put("fieldName","activity_log_id");
     * 
     * fixture.runEventHandlerMethod( "AbBldgOpsHelpDesk",
     * "com.archibus.eventhandler.helpdesk.RequestHandler", "submitRequest", inputs, response,
     * transactionContext);
     * 
     * assertNotNull(response.get("jsonExpression"));
     * 
     * JSONObject jsonObject = new JSONObject((String) response.get("jsonExpression")); int
     * activity_log_id = jsonObject.getInt("activity_log_id");
     * 
     * JSONArray records = new JSONArray(); JSONObject record = new JSONObject();
     * record.put("activity_log.activity_log_id", activity_log_id); records.put(record);
     * 
     * inputs = new HashMap(); inputs.put("records", records); response = new HashMap();
     * 
     * fixture.runEventHandlerMethod( ACTIVITY_ID, EVENT_HANDLER_CLASS,
     * "createWorkRequestFromHelpRequest", inputs, response, transactionContext);
     * 
     * EventHandlerContext context = new EventHandlerContextImplTest(inputs,
     * fixture.getUserSession(), transactionContext, null); int wr_id = Common.getMaxId(context,
     * "wr", "wr_id"); records = new JSONArray(); record = new JSONObject(); record.put("wr.wr_id",
     * wr_id); records.put(record);
     * 
     * fields = new HashMap(); fields.put("wo.bl_id", "I202"); fields.put("wo.description",
     * "test ceiling tiles");
     * 
     * inputs = new HashMap(); inputs.put("records", records); inputs.put("link_to", new
     * Integer(activity_log_id)); inputs.put("fields",fields);
     * 
     * fixture.runEventHandlerMethod( ACTIVITY_ID, EVENT_HANDLER_CLASS, "saveNewWorkorder", inputs,
     * response, transactionContext);
     * 
     * int wo_id = Common.getMaxId(context, "wo", "wo_id");
     * 
     * assertEquals(activity_log_id, ((Integer)
     * Common.getValue(context,"wr","activity_log_id","wr_id = " + wr_id)).intValue());
     * assertEquals(wo_id, ((Integer) Common.getValue(context,"wr","wo_id","wr_id = " +
     * wr_id)).intValue()); assertEquals(wo_id, ((Integer)
     * Common.getValue(context,"activity_log","wo_id","activity_log_id = " +
     * activity_log_id)).intValue());
     * assertNull(Common.getValue(context,"activity_log","wr_id","activity_log_id = " +
     * activity_log_id)); }
     * 
     * public void testArchiveWorkOrders() throws ParseException{ Map inputs = new HashMap(); Map
     * response = new HashMap(); >>>>>>> .r9302
     * 
     * public void testRecalculateWorkOrder() { Map inputs = new HashMap(); Map response = new
     * HashMap();
     * 
     * EventHandlerContext context = new EventHandlerContextImplTest(inputs, fixture
     * .getUserSession(), transactionContext, null);
     * 
     * WorkRequestHandler workRequestHandler = new WorkRequestHandler();
     * 
     * // workRequestHandler.recalculateWorkOrderCosts(context, 9);
     * 
     * }
     * 
     * public void testCancelWorkRequests() throws ParseException { Map inputs = new HashMap(); Map
     * response = new HashMap();
     * 
     * Map fields = new HashMap(); fields.put("requestor", "AFM"); fields.put("site_id", "OLDCITY");
     * fields.put("bl_id", "I202"); fields.put("priority", new Integer(1));
     * fields.put("activity_type", "SERVICE DESK - MAINTENANCE"); fields.put("prob_type",
     * "CEILING TILE"); fields.put("created_by", "AFM");
     * 
     * inputs.put("fields", fields); inputs.put("tableName", "activity_log");
     * inputs.put("fieldName", "activity_log_id");
     * 
     * fixture.runEventHandlerMethod("AbBldgOpsHelpDesk",
     * "com.archibus.eventhandler.helpdesk.RequestHandler", "submitRequest", inputs, response,
     * transactionContext);
     * 
     * assertNotNull(response.get("jsonExpression"));
     * 
     * JSONObject jsonObject = new JSONObject((String) response.get("jsonExpression")); int
     * activity_log_id = jsonObject.getInt("activity_log_id");
     * 
     * JSONArray records = new JSONArray(); JSONObject record = new JSONObject();
     * record.put("activity_log.activity_log_id", activity_log_id); records.put(record);
     * 
     * inputs = new HashMap(); inputs.put("records", records); response = new HashMap();
     * 
     * fixture.runEventHandlerMethod(ACTIVITY_ID, EVENT_HANDLER_CLASS,
     * "createWorkRequestFromHelpRequest", inputs, response, transactionContext);
     * 
     * EventHandlerContext context = new EventHandlerContextImplTest(inputs, fixture
     * .getUserSession(), transactionContext, null); int wr_id = Common.getMaxId(context, "wr",
     * "wr_id"); records = new JSONArray(); record = new JSONObject(); record.put("wr.wr_id",
     * wr_id); records.put(record);
     * 
     * fields = new HashMap(); fields.put("wo.bl_id", "I202"); fields.put("wo.description",
     * "test ceiling tiles");
     * 
     * inputs = new HashMap(); inputs.put("records", records); inputs.put("link_to", new
     * Integer(activity_log_id)); inputs.put("fields", fields);
     * 
     * fixture.runEventHandlerMethod(ACTIVITY_ID, EVENT_HANDLER_CLASS, "saveNewWorkorder", inputs,
     * response, transactionContext);
     * 
     * int wo_id = Common.getMaxId(context, "wo", "wo_id");
     * 
     * assertEquals(activity_log_id, ((Integer) Common.getValue(context, "wr", "activity_log_id",
     * "wr_id = " + wr_id)).intValue()); assertEquals(wo_id, ((Integer) Common.getValue(context,
     * "wr", "wo_id", "wr_id = " + wr_id)) .intValue()); assertEquals(wo_id, ((Integer)
     * Common.getValue(context, "activity_log", "wo_id", "activity_log_id = " + activity_log_id))
     * .intValue()); assertNull(Common.getValue(context, "activity_log", "wr_id",
     * "activity_log_id = " + activity_log_id));
     * 
     * fields = new HashMap();
     * 
     * fields.put("wr.requestor", "AFM"); fields.put("wr.phone", "227-2508");
     * fields.put("wr.site_id", "MARKET"); fields.put("wr.bl_id", "HQ"); fields.put("wr.fl_id",
     * "17"); fields.put("wr.rm_id", "126"); fields.put("wr.location", "test");
     * fields.put("wr.eq_id", ""); fields.put("wr.prob_type", "INSTALL");
     * fields.put("wr.description", "workrequest generated by test"); fields.put("wr.priority", new
     * Integer(1)); fields.put("wr.activity_type", Constants.ON_DEMAND_WORK);
     * fields.put("wr.status", "Com");
     * 
     * inputs = new HashMap(); inputs.put("fields", fields); response = new HashMap();
     * 
     * fixture.runEventHandlerMethod(ACTIVITY_ID, EVENT_HANDLER_CLASS, "saveWorkRequest", inputs,
     * response, transactionContext);
     * 
     * assertNotNull(response.get("jsonExpression")); JSONObject json = new JSONObject((String)
     * response.get("jsonExpression")); int wr_id2 = json.getInt("wr_id");
     * fixture.executeSql("UPDATE wr SET wo_id=" + wo_id + " WHERE wr_id = " + wr_id2,
     * transactionContext);
     * 
     * JSONArray jsonArray = new JSONArray(); json = new JSONObject(); json.put("wr.wr_id", wr_id2);
     * jsonArray.put(json);
     * 
     * inputs = new HashMap(); inputs.put("records", jsonArray);
     * 
     * response = new HashMap();
     * 
     * fixture.runEventHandlerMethod("AbBldgOpsHelpDesk",
     * "com.archibus.eventhandler.ondemandwork.WorkRequestHandler", "cancelWorkRequests", inputs,
     * response, transactionContext);
     * 
     * fixture.verifyRow("wr", "wr_id = " + wr_id2, new String[] { "status" }, new String[] { "Can"
     * });
     * 
     * inputs = new HashMap(); inputs.put("wr_id", new Integer(wr_id));
     * 
     * response = new HashMap();
     * 
     * fixture.runEventHandlerMethod("AbBldgOpsHelpDesk",
     * "com.archibus.eventhandler.ondemandwork.WorkRequestHandler", "cancelWorkRequest", inputs,
     * response, transactionContext);
     * 
     * fixture.verifyRow("hwr", "wr_id = " + wr_id, new String[] { "status" }, new String[] { "Can"
     * }); fixture.verifyRow("hwo", "wo_id = " + wo_id, new String[] { "bl_id" }, new String[] {
     * "I202" }); }
     * 
     * /* public void testIssueWorkRequests() { JSONArray jsonArray = new JSONArray(); JSONObject
     * json = new JSONObject(); json.put("wo_id", 1999000028); json.put("wr_id",950000175);
     * jsonArray.put(json);
     * 
     * Map inputs = new HashMap(); inputs.put("records", jsonArray);
     * 
     * Map response = new HashMap();
     * 
     * fixture.runEventHandlerMethod( "AbBldgOpsHelpDesk",
     * "com.archibus.eventhandler.ondemandwork.WorkRequestHandler", "issueWorkRequests", inputs,
     * response, transactionContext);
     * 
     * fixture.verifyRow("wr", "wr_id = 950000175", new String[]{"status"}, new String[]{"AA"}); }
     * 
     * public void testSaveNewWorkRequest() throws ParseException{ Map inputs = new HashMap(); Map
     * response = new HashMap();
     * 
     * Map fields = new HashMap(); fields.put("requestor", "AFM"); fields.put("site_id","OLDCITY");
     * fields.put("bl_id","I202"); fields.put("priority",new Integer(1));
     * fields.put("activity_type","SERVICE DESK - MAINTENANCE"); fields.put("prob_type",
     * "ELECTRICAL"); fields.put("created_by", "AFM");
     * 
     * inputs.put("fields",fields); inputs.put("tableName", "activity_log");
     * inputs.put("fieldName","activity_log_id");
     * 
     * fixture.runEventHandlerMethod( "AbBldgOpsHelpDesk",
     * "com.archibus.eventhandler.helpdesk.RequestHandler", "submitRequest", inputs, response,
     * transactionContext);
     * 
     * assertNotNull(response.get("jsonExpression"));
     * 
     * JSONObject jsonObject = new JSONObject((String) response.get("jsonExpression")); int
     * activity_log_id = jsonObject.getInt("activity_log_id");
     * 
     * System.err.println(activity_log_id); }
     * 
     * 
     * public void testSaveNewWorkOrder() throws ParseException{ Map inputs = new HashMap(); Map
     * response = new HashMap();
     * 
     * Map fields = new HashMap(); fields.put("requestor", "AFM"); fields.put("site_id","OLDCITY");
     * fields.put("bl_id","I202"); fields.put("priority",new Integer(1));
     * fields.put("activity_type","SERVICE DESK - MAINTENANCE"); fields.put("prob_type", "CEILING
     * TILE"); fields.put("created_by", "AFM");
     * 
     * inputs.put("fields",fields); inputs.put("tableName", "activity_log");
     * inputs.put("fieldName","activity_log_id");
     * 
     * fixture.runEventHandlerMethod( "AbBldgOpsHelpDesk",
     * "com.archibus.eventhandler.helpdesk.RequestHandler", "submitRequest", inputs, response,
     * transactionContext);
     * 
     * assertNotNull(response.get("jsonExpression"));
     * 
     * JSONObject jsonObject = new JSONObject((String) response.get("jsonExpression")); int
     * activity_log_id = jsonObject.getInt("activity_log_id");
     * 
     * JSONArray records = new JSONArray(); JSONObject record = new JSONObject();
     * record.put("activity_log.activity_log_id", activity_log_id); records.put(record);
     * 
     * inputs = new HashMap(); inputs.put("records", records); response = new HashMap();
     * 
     * fixture.runEventHandlerMethod( ACTIVITY_ID, EVENT_HANDLER_CLASS,
     * "createWorkRequestFromHelpRequest", inputs, response, transactionContext);
     * 
     * EventHandlerContext context = new EventHandlerContextImplTest(inputs,
     * fixture.getUserSession(), transactionContext, null); int wr_id = Common.getMaxId(context,
     * "wr", "wr_id"); records = new JSONArray(); record = new JSONObject(); record.put("wr.wr_id",
     * wr_id); records.put(record);
     * 
     * fields = new HashMap(); fields.put("wo.bl_id", "I202"); fields.put("wo.description", "test
     * ceiling tiles");
     * 
     * inputs = new HashMap(); inputs.put("records", records); inputs.put("link_to", new
     * Integer(activity_log_id)); inputs.put("fields",fields);
     * 
     * fixture.runEventHandlerMethod( ACTIVITY_ID, EVENT_HANDLER_CLASS, "saveNewWorkorder", inputs,
     * response, transactionContext);
     * 
     * int wo_id = Common.getMaxId(context, "wo", "wo_id");
     * 
     * assertEquals(activity_log_id, ((Integer)
     * Common.getValue(context,"wr","activity_log_id","wr_id = " + wr_id)).intValue());
     * assertEquals(wo_id, ((Integer) Common.getValue(context,"wr","wo_id","wr_id = " +
     * wr_id)).intValue()); assertEquals(wo_id, ((Integer)
     * Common.getValue(context,"activity_log","wo_id","activity_log_id = " +
     * activity_log_id)).intValue());
     * assertNull(Common.getValue(context,"activity_log","wr_id","activity_log_id = " +
     * activity_log_id)); }
     * 
     * public void testArchiveWorkOrders() throws ParseException{ Map inputs = new HashMap(); Map
     * response = new HashMap();
     * 
     * inputs.put("date_from", "2007-08-22"); inputs.put("date_from", "2007-08-31");
     * 
     * fixture.runEventHandlerMethod( ACTIVITY_ID, EVENT_HANDLER_CLASS, "archiveWorkOrders", inputs,
     * response, transactionContext); }
     * 
     * public void testRejectDispatchRequest() throws ParseException{ Map inputs = new HashMap();
     * Map response = new HashMap();
     * 
     * Map fields = new HashMap(); fields.put("requestor", "AFM"); fields.put("site_id","OLDCITY");
     * fields.put("bl_id","I202"); fields.put("priority",new Integer(1));
     * fields.put("activity_type","SERVICE DESK - MAINTENANCE"); fields.put("prob_type", "CEILING
     * TILE"); fields.put("created_by", "AFM");
     * 
     * inputs.put("fields",fields); inputs.put("tableName", "activity_log");
     * inputs.put("fieldName","activity_log_id");
     * 
     * fixture.runEventHandlerMethod( "AbBldgOpsHelpDesk",
     * "com.archibus.eventhandler.helpdesk.RequestHandler", "submitRequest", inputs, response,
     * transactionContext);
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
     * inputs = new HashMap();
     * 
     * inputs.put("comments", "reject dispatching");
     * 
     * fields = new HashMap(); fields.put("activity_log_step_waiting.step_log_id",new
     * Integer(step_log_id)); fields.put("activity_log.supervisor", "AFM");
     * fields.put("activity_log.activity_log_id", new Integer(activity_log_id));
     * fields.put("activity_log.requestor", "AFM");
     * fields.put("activity_log.phone_requestor","227-2508");
     * fields.put("activity_log.site_id","OLDCITY"); fields.put("activity_log.bl_id","I202");
     * fields.put("activity_log.priority",new Integer(1));
     * fields.put("activity_log.activity_type","SERVICE DESK - MAINTENANCE");
     * fields.put("activity_log.prob_type", "CEILING TILE"); fields.put("activity_log.created_by",
     * "AFM");
     * 
     * inputs.put("fields", fields);
     * 
     * fixture.runEventHandlerMethod( ACTIVITY_ID, EVENT_HANDLER_CLASS, "rejectDispatchRequest",
     * inputs, response, transactionContext);
     * 
     * fixture.verifyRow("hactivity_log", "activity_log_id = " +activity_log_id, new
     * String[]{"status"}, new String[]{"REJECTED"}); fixture.verifyRow("helpdesk_step_log",
     * "step_log_id = " + step_log_id, new String[]{"comments"}, new String[]{"reject
     * dispatching"}); }
     * 
     * public void testDispatchRequest() throws ParseException{ Map inputs = new HashMap(); Map
     * response = new HashMap();
     * 
     * Map fields = new HashMap(); fields.put("requestor", "AFM");
     * fields.put("phone_requestor","227-2508"); fields.put("site_id","OLDCITY");
     * fields.put("bl_id","I202"); fields.put("priority",new Integer(1));
     * fields.put("activity_type","SERVICE DESK - MAINTENANCE"); fields.put("prob_type", "CEILING
     * TILE"); fields.put("created_by", "AFM");
     * 
     * inputs.put("fields",fields); inputs.put("tableName", "activity_log");
     * inputs.put("fieldName","activity_log_id");
     * 
     * fixture.runEventHandlerMethod( "AbBldgOpsHelpDesk",
     * "com.archibus.eventhandler.helpdesk.RequestHandler", "submitRequest", inputs, response,
     * transactionContext);
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
     * inputs = new HashMap();
     * 
     * inputs.put("comments", "dispatching ok");
     * 
     * fields = new HashMap(); fields.put("activity_log_step_waiting.step_log_id",new
     * Integer(step_log_id)); fields.put("activity_log.supervisor", "AFM");
     * fields.put("activity_log.activity_log_id", new Integer(activity_log_id));
     * fields.put("activity_log.requestor", "AFM");
     * fields.put("activity_log.phone_requestor","227-2508");
     * fields.put("activity_log.site_id","OLDCITY"); fields.put("activity_log.bl_id","I202");
     * fields.put("activity_log.priority",new Integer(1));
     * fields.put("activity_log.activity_type","SERVICE DESK - MAINTENANCE");
     * fields.put("activity_log.prob_type", "CEILING TILE"); fields.put("activity_log.created_by",
     * "AFM");
     * 
     * inputs.put("fields", fields);
     * 
     * fixture.runEventHandlerMethod( ACTIVITY_ID, EVENT_HANDLER_CLASS, "dispatchRequest", inputs,
     * response, transactionContext);
     * 
     * fixture.verifyRow("activity_log", "activity_log_id = " +activity_log_id, new
     * String[]{"status"}, new String[]{"APPROVED"}); fixture.verifyRow("helpdesk_step_log",
     * "step_log_id = " + step_log_id, new String[]{"step_status_result","comments"}, new
     * String[]{"dispatched","dispatching ok"}); }
     * 
     * public void testVerifyWorkRequest() throws ExceptionBase, ParseException{ Map fields = new
     * HashMap();
     * 
     * fields.put("wr.requestor","AFM"); fields.put("wr.phone","227-2508");
     * fields.put("wr.site_id","MARKET"); fields.put("wr.bl_id","HQ"); fields.put("wr.fl_id","17");
     * fields.put("wr.rm_id","126"); fields.put("wr.location","test"); fields.put("wr.eq_id","");
     * fields.put("wr.prob_type","INSTALL"); fields.put("wr.description","workrequest generated by
     * test"); fields.put("wr.priority", new Integer(1));
     * fields.put("wr.activity_type",Constants.ON_DEMAND_WORK); fields.put("wr.status","Com");
     * 
     * Map inputs = new HashMap(); inputs.put("fields", fields); Map response = new HashMap();
     * 
     * fixture.runEventHandlerMethod( ACTIVITY_ID, EVENT_HANDLER_CLASS, "saveWorkRequest", inputs,
     * response, transactionContext);
     * 
     * assertNotNull(response.get("jsonExpression")); JSONObject json = new JSONObject((String)
     * response.get("jsonExpression")); int wr_id = json.getInt("wr_id"); fixture.executeSql("UPDATE
     * wr SET status = 'Com' WHERE wr_id = "+wr_id, transactionContext);
     * 
     * EventHandlerContext context = new EventHandlerContextImplTest(inputs,
     * fixture.getUserSession(), transactionContext, null);
     * 
     * Verification veri = new Verification(context,ACTIVITY_ID,wr_id,"Verification");
     * veri.setEmId("AFM"); veri.invoke();
     * 
     * int stepLogId = Common.getMaxId(context, "helpdesk_step_log", "step_log_id");
     * 
     * inputs = new HashMap(); fields.put("wr_step_waiting.wr_id", new Integer(wr_id));
     * fields.put("wr_step_waiting.step_log_id",new Integer(stepLogId));
     * fields.put("wr_step_waiting.em_id", "AFM"); fields.put("wr_step_waiting.step",
     * "Verification"); fields.put("wr_step_waiting.comments", "Ok"); inputs.put("fields", fields);
     * 
     * fixture.runEventHandlerMethod( ACTIVITY_ID, EVENT_HANDLER_CLASS, "verifyWorkRequest", inputs,
     * response, transactionContext); String where = "table_name = 'wr' AND pkey_value = "+wr_id + "
     * AND em_id = 'AFM' AND step_type ='verification'";
     * 
     * fixture.verifyRow(Constants.STEP_LOG_TABLE,where, new String[]{"step_status_result"}, new
     * String[]{"verified"}); }
     * 
     * public void testReturnWorkRequest() throws ParseException{ Map fields = new HashMap();
     * 
     * fields.put("wr.requestor","AFM"); fields.put("wr.phone","227-2508");
     * fields.put("wr.site_id","MARKET"); fields.put("wr.bl_id","HQ"); fields.put("wr.fl_id","17");
     * fields.put("wr.rm_id","126"); fields.put("wr.location","test"); fields.put("wr.eq_id","");
     * fields.put("wr.prob_type","INSTALL"); fields.put("wr.description","workrequest generated by
     * test"); fields.put("wr.priority",new Integer(1));
     * fields.put("wr.activity_type",Constants.ON_DEMAND_WORK); fields.put("wr.status","Com");
     * 
     * Map inputs = new HashMap(); inputs.put("fields", fields); Map response = new HashMap();
     * 
     * fixture.runEventHandlerMethod( ACTIVITY_ID, EVENT_HANDLER_CLASS, "saveWorkRequest", inputs,
     * response, transactionContext);
     * 
     * assertNotNull(response.get("jsonExpression")); JSONObject json = new JSONObject((String)
     * response.get("jsonExpression")); int wr_id = json.getInt("wr_id");
     * 
     * fixture.executeSql("UPDATE wr SET status = 'Com' WHERE wr_id = "+wr_id, transactionContext);
     * EventHandlerContext context = new EventHandlerContextImplTest(inputs,
     * fixture.getUserSession(), transactionContext, null);
     * 
     * Verification veri = new Verification(context,ACTIVITY_ID,wr_id,"Verification");
     * veri.setEmId("AFM"); veri.invoke();
     * 
     * int stepLogId = Common.getMaxId(context, "helpdesk_step_log", "step_log_id");
     * 
     * inputs = new HashMap(); fields.put("wr_step_waiting.wr_id", new Integer(wr_id));
     * fields.put("wr_step_waiting.step_log_id",new Integer(stepLogId));
     * fields.put("wr_step_waiting.em_id", "AFM"); fields.put("wr_step_waiting.step",
     * "Verification"); fields.put("wr_step_waiting.comments", "not ok"); inputs.put("fields",
     * fields);
     * 
     * fixture.runEventHandlerMethod( ACTIVITY_ID, EVENT_HANDLER_CLASS, "returnWorkRequest", inputs,
     * response, transactionContext);
     * 
     * fixture.commitTransaction(transactionContext);
     * 
     * fixture.verifyRow(Constants.STEP_LOG_TABLE,"step_log_id = " + stepLogId, new
     * String[]{"step_status_result"}, new String[]{"rejected"}); fixture.verifyRow("wr", "wr_id = "
     * + wr_id, new String[]{"status"}, new String[]{"I"}); }
     * 
     * public void testCompleteScheduling() throws ParseException{ Map response = new HashMap(); Map
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
     * activity_log.put("activity_log.manager","AFM");
     * 
     * inputs.put("fields",activity_log);
     * 
     * fixture.runEventHandlerMethod( ACTIVITY_ID,
     * "com.archibus.eventhandler.helpdesk.RequestHandler", "saveRequest", inputs, response,
     * transactionContext);
     * 
     * JSONObject json = new JSONObject((String) response.get("jsonExpression")); int
     * activity_log_id = json.getInt("activity_log_id"); fixture.executeSql("UPDATE activity_log SET
     * status='APPROVED' WHERE activity_log_id = " + activity_log_id, transactionContext);
     * 
     * WorkRequestHandler handler = new WorkRequestHandler();
     * context.addResponseParameter("activity_log.activity_log_id", new Integer(activity_log_id));
     * int wr_id = handler.createWorkOrderFromActionItem(context, activity_log_id);
     * 
     * fixture.executeSql("UPDATE wr SET status = 'AA' WHERE wr_id = " + wr_id, transactionContext);
     * 
     * Scheduling schedule = new Scheduling(context,ACTIVITY_ID,wr_id,"Schedule");
     * schedule.setEmId("AFM"); schedule.invoke();
     * 
     * int stepLogId = Common.getMaxId(context, "helpdesk_step_log", "step_log_id");
     * 
     * Map fields = new HashMap(); fields.put("wr.wr_id", new Integer(wr_id));
     * fields.put("wr_step_waiting.step_log_id", new Integer(stepLogId)); inputs.put("fields",
     * fields);
     * 
     * inputs.put("tableName", "wr"); inputs.put("fieldName","wr_id"); inputs.put("wr.wr_id",new
     * Integer(wr_id));
     * 
     * fixture.runEventHandlerMethod( ACTIVITY_ID, EVENT_HANDLER_CLASS, "completeScheduling",
     * inputs, response, transactionContext);
     * 
     * fixture.commitTransaction(transactionContext);
     * 
     * fixture.verifyRow("wr", "wr_id = " + wr_id, new String[]{"status"}, new String[]{"AA"});
     * fixture.verifyRow(Constants.STEP_LOG_TABLE,"step_log_id = " + stepLogId, new
     * String[]{"step_status_result"},new String[]{"scheduled"}); }
     * 
     * public void testCompleteEstimation() throws ParseException{ Map response = new HashMap(); Map
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
     * activity_log.put("activity_log.status","APPROVED");
     * activity_log.put("activity_log.manager","AFM");
     * 
     * inputs.put("fields",activity_log);
     * 
     * fixture.runEventHandlerMethod( "AbBldgOpsHelpDesk",
     * "com.archibus.eventhandler.helpdesk.RequestHandler", "saveRequest", inputs, response,
     * transactionContext);
     * 
     * JSONObject json = new JSONObject((String) response.get("jsonExpression")); int
     * activity_log_id = json.getInt("activity_log_id"); fixture.executeSql("UPDATE activity_log SET
     * status='APPROVED' WHERE activity_log_id = " + activity_log_id, transactionContext);
     * 
     * WorkRequestHandler handler = new WorkRequestHandler();
     * context.addResponseParameter("activity_log.activity_log_id", new Integer(activity_log_id));
     * int wr_id = handler.createWorkOrderFromActionItem(context, activity_log_id);
     * 
     * Estimation estimation = new Estimation(context,ACTIVITY_ID,wr_id,"Estimation");
     * estimation.setEmId("AFM"); estimation.invoke();
     * 
     * int stepLogId = Common.getMaxId(context, "helpdesk_step_log", "step_log_id");
     * 
     * Map fields = new HashMap(); fields.put("wr_step_waiting.step_log_id", new
     * Integer(stepLogId)); fields.put("wr.wr_id", new Integer(wr_id)); inputs.put("fields",
     * fields);
     * 
     * inputs.put("tableName", "wr"); inputs.put("fieldName","wr_id"); inputs.put("wr.wr_id",new
     * Integer(wr_id));
     * 
     * fixture.runEventHandlerMethod( ACTIVITY_ID, EVENT_HANDLER_CLASS, "completeEstimation",
     * inputs, response, transactionContext);
     * 
     * fixture.commitTransaction(transactionContext);
     * 
     * fixture.verifyRow("wr", "wr_id = " + wr_id, new String[]{"status"}, new String[]{"AA"});
     * fixture.verifyRow(Constants.STEP_LOG_TABLE,"step_log_id = " + stepLogId, new
     * String[]{"step_status_result"},new String[]{"estimated"}); }
     * 
     * public void testApproveWorkRequest() throws ParseException{ Map fields = new HashMap();
     * 
     * fields.put("wr.requestor","AFM"); fields.put("wr.phone","227-2508");
     * fields.put("wr.site_id","MARKET"); fields.put("wr.bl_id","HQ"); fields.put("wr.fl_id","17");
     * fields.put("wr.rm_id","126"); fields.put("wr.location","test"); fields.put("wr.eq_id","");
     * fields.put("wr.prob_type","INSTALL"); fields.put("wr.description","workrequest generated by
     * test"); fields.put("wr.priority",new Integer(1));
     * fields.put("wr.activity_type",Constants.ON_DEMAND_WORK); fields.put("wr.status","AA");
     * 
     * Map inputs = new HashMap(); inputs.put("fields", fields); Map response = new HashMap();
     * 
     * fixture.runEventHandlerMethod( ACTIVITY_ID, EVENT_HANDLER_CLASS, "saveWorkRequest", inputs,
     * response, transactionContext);
     * 
     * assertNotNull(response.get("jsonExpression")); JSONObject json = new JSONObject((String)
     * response.get("jsonExpression")); int wr_id = json.getInt("wr_id"); EventHandlerContext
     * context = new EventHandlerContextImplTest(inputs, fixture.getUserSession(),
     * transactionContext, null);
     * 
     * fixture.executeSql("UPDATE wr SET status = 'AA' WHERE wr_id = " + wr_id, transactionContext);
     * 
     * Approval approval = new Approval(context,ACTIVITY_ID,wr_id,"Estimation Approval");
     * approval.setEmId("AFM"); approval.invoke();
     * 
     * int stepLogId = Common.getMaxId(context, "helpdesk_step_log", "step_log_id");
     * 
     * inputs.remove("fields"); fields.put("wr_step_waiting.step_log_id",new Integer(stepLogId));
     * fields.put("wr_step_waiting.em_id", "AFM"); fields.put("wr_step_waiting.step", "Estimation
     * Approval"); fields.put("wr.wr_id", new Integer(wr_id)); inputs.put("fields", fields);
     * 
     * fixture.runEventHandlerMethod( ACTIVITY_ID, EVENT_HANDLER_CLASS, "approveWorkRequest",
     * inputs, response, transactionContext);
     * 
     * fixture.commitTransaction(transactionContext);
     * 
     * fixture.verifyRow("wr", "wr_id = " + wr_id, new String[]{"status"}, new String[]{"AA"});
     * fixture.verifyRow(Constants.STEP_LOG_TABLE,"step_log_id = " + stepLogId, new
     * String[]{"step_status_result"}, new String[]{"approved"}); }
     * 
     * public void testRejectWorkRequest() throws ParseException{ Map fields = new HashMap();
     * 
     * fields.put("wr.requestor","AFM"); fields.put("wr.phone","227-2508");
     * fields.put("wr.site_id","MARKET"); fields.put("wr.bl_id","HQ"); fields.put("wr.fl_id","17");
     * fields.put("wr.rm_id","126"); fields.put("wr.location","test"); fields.put("wr.eq_id","");
     * fields.put("wr.prob_type","INSTALL"); fields.put("wr.description","workrequest generated by
     * test"); fields.put("wr.priority",new Integer(1));
     * fields.put("wr.activity_type",Constants.ON_DEMAND_WORK); fields.put("wr.status","AA");
     * 
     * Map inputs = new HashMap(); inputs.put("fields", fields); Map response = new HashMap();
     * 
     * fixture.runEventHandlerMethod( ACTIVITY_ID, EVENT_HANDLER_CLASS, "saveWorkRequest", inputs,
     * response, transactionContext);
     * 
     * assertNotNull(response.get("jsonExpression")); JSONObject json = new JSONObject((String)
     * response.get("jsonExpression")); int wr_id = json.getInt("wr_id"); EventHandlerContext
     * context = new EventHandlerContextImplTest(inputs, fixture.getUserSession(),
     * transactionContext, null);
     * 
     * fixture.executeSql("UPDATE wr SET status = 'AA' WHERE wr_id = " + wr_id, transactionContext);
     * fixture.executeSql("INSERT INTO helpdesk_step_log
     * (activity_id,table_name,field_name,pkey_value,step,step_type,status,step_order)" + "VALUES
     * ('AbBldgOpsOnDemandWork','wr','wr_id',"+wr_id+",'Basic','basic','AA',0)",
     * transactionContext);
     * 
     * Approval approval = new Approval(context,ACTIVITY_ID,wr_id,"Estimation Approval");
     * approval.setEmId("AFM"); approval.invoke();
     * 
     * int stepLogId = Common.getMaxId(context, "helpdesk_step_log", "step_log_id");
     * inputs.remove("fields"); fields.put("wr.wr_id",new Integer(wr_id));
     * fields.put("wr_step_waiting.step_log_id",new Integer(stepLogId));
     * fields.put("wr_step_waiting.em_id", "AFM"); fields.put("wr_step_waiting.step", "Estimation
     * Approval"); inputs.put("fields", fields);
     * 
     * fixture.runEventHandlerMethod( ACTIVITY_ID, EVENT_HANDLER_CLASS, "rejectWorkRequest", inputs,
     * response, transactionContext); fixture.commitTransaction(transactionContext); //
     * fixture.verifyRow("hwr", "wr_id = " + wr_id, new String[]{"status"}, new String[]{"Rej"});
     * fixture.verifyRow(Constants.STEP_LOG_TABLE,"step_log_id = " + stepLogId, new
     * String[]{"step_status_result","table_name"}, new String[]{"rejected","hwr"}); }
     * 
     * public void testUpdateWorkRequestStatus() throws ParseException{ Map fields = new HashMap();
     * 
     * fields.put("wr.requestor","AFM"); fields.put("wr.phone","227-2508");
     * fields.put("wr.site_id","MARKET"); fields.put("wr.bl_id","HQ"); fields.put("wr.fl_id","17");
     * fields.put("wr.rm_id","126"); fields.put("wr.location","test"); fields.put("wr.eq_id","");
     * fields.put("wr.prob_type","INSTALL"); fields.put("wr.description","workrequest generated by
     * test"); fields.put("wr.priority",new Integer(1));
     * fields.put("wr.activity_type",Constants.ON_DEMAND_WORK); fields.put("wr.status","R");
     * 
     * Map inputs = new HashMap(); inputs.put("fields", fields); Map response = new HashMap();
     * 
     * fixture.runEventHandlerMethod( ACTIVITY_ID, EVENT_HANDLER_CLASS, "saveWorkRequest", inputs,
     * response, transactionContext);
     * 
     * assertNotNull(response.get("jsonExpression")); JSONObject json = new JSONObject((String)
     * response.get("jsonExpression")); int wr_id = json.getInt("wr_id"); inputs.remove("fields");
     * fields.put("wr_id", new Integer(wr_id)); inputs.put("fields", fields); inputs.put("status",
     * "I");
     * 
     * fixture.runEventHandlerMethod( ACTIVITY_ID, EVENT_HANDLER_CLASS, "updateWorkRequestStatus",
     * inputs, response, transactionContext); //fixture.commitTransaction(transactionContext);
     * //fixture.verifyRow("wr", "wr_id = " + wr_id, new String[]{"status"}, new String[]{"I"});
     * 
     * inputs.put("status", "Com");
     * 
     * fixture.runEventHandlerMethod( ACTIVITY_ID, EVENT_HANDLER_CLASS, "updateWorkRequestStatus",
     * inputs, response, transactionContext); fixture.commitTransaction(transactionContext);
     * fixture.verifyRow("wr", "wr_id = " + wr_id, new String[]{"status"}, new String[]{"Com"}); }
     * 
     * public void testGetEstimationFromToolType() throws ParseException { Map inputs = new
     * HashMap();
     * 
     * inputs.put("wr_id", new Integer(950000022) ); inputs.put("tool_type", "MULTIMETER");
     * 
     * fixture.executeSql("INSERT INTO wrtt (wr_id,tool_type,hours_est) VALUES (950000022,
     * 'MULTIMETER',3.00)",transactionContext);
     * 
     * Map response = new HashMap(); fixture.runEventHandlerMethod( ACTIVITY_ID,
     * EVENT_HANDLER_CLASS, "getEstimationFromToolType", inputs, response, transactionContext);
     * assertNotNull(response.get("jsonExpression")); JSONObject json = new JSONObject((String)
     * response.get("jsonExpression")); assertEquals(json.getInt("estimation"), 3); }
     * 
     * public void testGetEstimationFromTrade() throws ParseException { Map inputs = new HashMap();
     * 
     * inputs.put("wr_id", new Integer(950000022) ); inputs.put("tr_id", "ELECTRICIAN-II");
     * 
     * fixture.executeSql("INSERT INTO wrtr (wr_id,tr_id,hours_est,work_type) VALUES (950000022,
     * 'ELECTRICIAN-II',3.00,'W')",transactionContext); Map response = new HashMap();
     * fixture.runEventHandlerMethod( ACTIVITY_ID, EVENT_HANDLER_CLASS, "getEstimationFromTrade",
     * inputs, response, transactionContext); assertNotNull(response.get("jsonExpression"));
     * JSONObject json = new JSONObject((String) response.get("jsonExpression"));
     * assertEquals(json.getInt("estimation"), 3);
     * assertEquals(json.getString("work_type").trim(),"W"); }
     * 
     * public void testLinkHelpRequestToWorkRequest() throws ParseException{
     * 
     * Map activity_log = new HashMap(); activity_log.put("activity_log.requestor","AFM");
     * activity_log.put("activity_log.phone_requestor","227-2508");
     * activity_log.put("activity_log.site_id","MARKET");
     * activity_log.put("activity_log.bl_id","HQ"); activity_log.put("activity_log.fl_id","17");
     * activity_log.put("activity_log.rm_id","126");
     * activity_log.put("activity_log.location","test");
     * activity_log.put("activity_log.prob_type","INSTALL");
     * activity_log.put("activity_log.description","request generated by test ................");
     * activity_log.put("activity_log.priority",new Integer(1));
     * activity_log.put("activity_log.activity_type",Constants.ON_DEMAND_WORK);
     * activity_log.put("activity_log.status","APPROVED");
     * 
     * Map inputs = new HashMap(); inputs.put("fields",activity_log); Map response = new HashMap();
     * fixture.runEventHandlerMethod( "AbBldgOpsHelpDesk",
     * "com.archibus.eventhandler.helpdesk.RequestHandler", "saveRequest", inputs, response,
     * transactionContext); JSONObject json = new JSONObject((String)
     * response.get("jsonExpression")); int activity_log_id = json.getInt("activity_log_id");
     * JSONArray records = new JSONArray(); JSONObject record = new JSONObject();
     * record.put("activity_log.activity_log_id", new Integer(activity_log_id));
     * records.put(record);
     * 
     * Map fields = new HashMap(); fields.put("wr.requestor","AFM");
     * fields.put("wr.phone","227-2508"); fields.put("wr.site_id","MARKET");
     * fields.put("wr.bl_id","HQ"); fields.put("wr.fl_id","17"); fields.put("wr.rm_id","126");
     * fields.put("wr.location","test"); fields.put("wr.eq_id","");
     * fields.put("wr.prob_type","INSTALL"); fields.put("wr.description","workrequest generated by
     * test"); fields.put("wr.priority",new Integer(1));
     * fields.put("wr.activity_type",Constants.ON_DEMAND_WORK); fields.put("wr.status","R");
     * 
     * inputs = new HashMap(); inputs.put("fields", fields); response = new HashMap();
     * 
     * fixture.runEventHandlerMethod( ACTIVITY_ID, EVENT_HANDLER_CLASS, "saveWorkRequest", inputs,
     * response, transactionContext);
     * 
     * assertNotNull(response.get("jsonExpression")); json = new JSONObject((String)
     * response.get("jsonExpression")); Integer wr_id = new Integer(json.getInt("wr_id"));
     * inputs.put("activity_log_id",new Integer(activity_log_id)); inputs.put("wr_id", wr_id);
     * 
     * fixture.runEventHandlerMethod( ACTIVITY_ID, EVENT_HANDLER_CLASS,
     * "linkHelpRequestToWorkRequest", inputs, response, transactionContext);
     * 
     * fixture.commitTransaction(transactionContext); fixture.verifyRow("activity_log",
     * "activity_log_id="+activity_log_id, new String[]{"wr_id"}, new String[]{wr_id.toString()}); }
     * 
     * public void testCreateWorkRequestFromHelpRequest() throws ParseException{ Map inputs = new
     * HashMap(); Map response = new HashMap();
     * 
     * Map fields = new HashMap(); fields.put("requestor", "AFM");
     * fields.put("phone_requestor","227-2508"); fields.put("site_id","OLDCITY");
     * fields.put("bl_id","I202"); fields.put("priority",new Integer(1));
     * fields.put("activity_type","SERVICE DESK - MAINTENANCE"); fields.put("prob_type", "CEILING
     * TILE"); fields.put("created_by", "AFM"); String description = "Test Create Work Request From
     * Service Request"; fields.put("description",description);
     * 
     * inputs.put("fields",fields); inputs.put("tableName", "activity_log");
     * inputs.put("fieldName","activity_log_id");
     * 
     * fixture.runEventHandlerMethod( "AbBldgOpsHelpDesk",
     * "com.archibus.eventhandler.helpdesk.RequestHandler", "saveRequest", inputs, response,
     * transactionContext); assertNotNull(response.get("jsonExpression"));
     * 
     * JSONObject jsonObject = new JSONObject((String) response.get("jsonExpression")); int
     * activity_log_id = jsonObject.getInt("activity_log_id");
     * 
     * fixture.executeSql("UPDATE activity_log SET status = 'APPROVED' WHERE activity_log_id = " +
     * activity_log_id, transactionContext); JSONArray records = new JSONArray(); records.put(new
     * JSONObject("{activity_log.activity_log_id :"+activity_log_id +"}"));
     * 
     * inputs = new HashMap(); inputs.put("records", records); inputs.put("documents", null);
     * response = new HashMap(); fixture.runEventHandlerMethod( ACTIVITY_ID, EVENT_HANDLER_CLASS,
     * "createWorkRequestFromHelpRequest", inputs, response, transactionContext);
     * fixture.commitTransaction(transactionContext);
     * 
     * fixture.verifyRow("wr", "wr_id = (SELECT MAX(wr_id) FROM wr)", new
     * String[]{"bl_id","description"}, new String[]{"I202",description});
     * fixture.verifyRow("activity_log", "activity_log_id="+activity_log_id, new
     * String[]{"supervisor"}, new String[]{"AFM"}); }
     * 
     * public void testCreateWorkRequestFromHelpRequest2() throws ParseException{ String supervisor
     * = "BECKWITH, BILL"; Map inputs = new HashMap(); Map response = new HashMap();
     * 
     * Map fields = new HashMap(); fields.put("requestor", "AFM"); fields.put("site_id","WEST");
     * fields.put("bl_id","PLAZA 2"); fields.put("priority",new Integer(1));
     * fields.put("activity_type","SERVICE DESK - MAINTENANCE"); fields.put("prob_type",
     * "WINDOW/GLAS"); fields.put("created_by", "AFM"); String description = "Test Create Work
     * Request From Service Request with cf"; fields.put("description",description);
     * 
     * inputs.put("fields",fields);
     * 
     * fixture.runEventHandlerMethod( "AbBldgOpsHelpDesk",
     * "com.archibus.eventhandler.helpdesk.RequestHandler", "submitRequest", inputs, response,
     * transactionContext);
     * 
     * assertNotNull(response.get("jsonExpression")); JSONObject jsonObject = new
     * JSONObject((String) response.get("jsonExpression")); int activity_log_id =
     * jsonObject.getInt("activity_log_id");
     * 
     * EventHandlerContext context = new EventHandlerContextImplTest(inputs,
     * fixture.getUserSession(), transactionContext, null); int step_log_id =
     * Common.getMaxId(context, "helpdesk_step_log", "step_log_id");
     * 
     * inputs = new HashMap();
     * 
     * inputs.put("comments", "dispatching ok");
     * 
     * fields.put("activity_log_step_waiting.step_log_id",new Integer(step_log_id));
     * fields.put("activity_log.supervisor",supervisor); fields.put("activity_log.activity_log_id",
     * new Integer(activity_log_id));
     * 
     * inputs.put("fields", fields);
     * 
     * fixture.runEventHandlerMethod( ACTIVITY_ID, EVENT_HANDLER_CLASS, "dispatchRequest", inputs,
     * response, transactionContext);
     * 
     * JSONArray records = new JSONArray(); records.put(new
     * JSONObject("{activity_log.activity_log_id :"+activity_log_id +"}"));
     * 
     * inputs = new HashMap(); inputs.put("records", records); inputs.put("documents", null);
     * response = new HashMap();
     * 
     * fixture.runEventHandlerMethod( ACTIVITY_ID, EVENT_HANDLER_CLASS,
     * "createWorkRequestFromHelpRequest", inputs, response, transactionContext);
     * 
     * fixture.commitTransaction(transactionContext);
     * 
     * assertNotNull(response.get("jsonExpression")); records = new JSONArray((String)
     * response.get("jsonExpression")); int wr_id = records.getJSONObject(0).getInt("wr_id");
     * 
     * Integer act_wr_id = (Integer)
     * Common.getValue(context,"activity_log","wr_id","activity_log_id = " + activity_log_id);
     * assertEquals(act_wr_id.intValue(), wr_id);
     * 
     * fixture.verifyRow("wr", "wr_id = "+wr_id, new String[]{"bl_id","description","supervisor"},
     * new String[]{"PLAZA 2",description,supervisor}); String supervisor2 = (String)
     * Common.getValue(context,"activity_log","supervisor","activity_log_id = " + activity_log_id);
     * assertEquals(supervisor, supervisor2); //fixture.verifyRow("activity_log",
     * "activity_log_id="+activity_log_id, new String[]{"supervisor"}, new String[]{supervisor}); }
     * 
     * public void testSaveWorkRequestPart(){ Map inputs = new HashMap();
     * 
     * fixture.executeSql("UPDATE pt SET qty_on_hand = 100,qty_on_reserve = 0 WHERE part_id
     * ='BULB-25W'", transactionContext); fixture.executeSql("DELETE FROM wrpt WHERE part_id
     * ='BULB-25W' AND wr_id = 950000022", transactionContext);
     * 
     * Map fields = new HashMap(); fields.put("wr_id", new Integer(950000022) );
     * fields.put("part_id", "BULB-25W"); fields.put("qty_estimated",new Double(75));
     * 
     * inputs.put("fields", fields); Map response = new HashMap();
     * 
     * fixture.runEventHandlerMethod( ACTIVITY_ID, EVENT_HANDLER_CLASS, "saveWorkRequestPart",
     * inputs, response, transactionContext);
     * 
     * EventHandlerContext context = new EventHandlerContextImplTest(inputs,
     * fixture.getUserSession(), transactionContext, null); String status = (String)
     * Common.getValue(context,"wrpt","status","part_id = 'BULB-25W' AND wr_id = 950000022");
     * assertEquals(status, "R"); Double qty_on_hand = (Double)
     * Common.getValue(context,"pt","qty_on_hand","part_id = 'BULB-25W'"); assertEquals(qty_on_hand,
     * new Double(25)); Double qty_on_reserve = (Double)
     * Common.getValue(context,"pt","qty_on_reserve","part_id = 'BULB-25W'");
     * assertEquals(qty_on_reserve, new Double(75));
     * 
     * Date date_assigned = (Date) Common.getValue(context,"wrpt","date_assigned","part_id =
     * 'BULB-25W' AND wr_id = 950000022"); Time time_assigned = (Time)
     * Common.getValue(context,"wrpt","time_assigned","part_id = 'BULB-25W' AND wr_id = 950000022");
     * 
     * fields = new HashMap(); fields.put("date_assigned", date_assigned);
     * fields.put("time_assigned",time_assigned); fields.put("wr_id", new Integer(950000022));
     * fields.put("part_id", "BULB-25W"); fields.put("qty_estimated",new Double(101));
     * 
     * inputs.put("fields", fields);
     * 
     * fixture.runEventHandlerMethod( ACTIVITY_ID, EVENT_HANDLER_CLASS, "saveWorkRequestPart",
     * inputs, response, transactionContext);
     * 
     * status = (String) Common.getValue(context,"wrpt","status","part_id = 'BULB-25W' AND wr_id =
     * 950000022"); assertEquals("NI", status); qty_on_hand = (Double)
     * Common.getValue(context,"pt","qty_on_hand","part_id = 'BULB-25W'"); assertEquals(qty_on_hand,
     * new Double(100)); qty_on_reserve = (Double)
     * Common.getValue(context,"pt","qty_on_reserve","part_id = 'BULB-25W'");
     * assertEquals(qty_on_reserve, new Double(0));
     * 
     * fields = new HashMap(); fields.put("date_assigned", date_assigned);
     * fields.put("time_assigned",time_assigned); fields.put("wr_id", new Integer(950000022));
     * fields.put("part_id", "BULB-25W"); fields.put("qty_estimated",new Double(91));
     * 
     * inputs.put("fields", fields);
     * 
     * fixture.runEventHandlerMethod( ACTIVITY_ID, EVENT_HANDLER_CLASS, "saveWorkRequestPart",
     * inputs, response, transactionContext);
     * 
     * status = (String) Common.getValue(context,"wrpt","status","part_id = 'BULB-25W' AND wr_id =
     * 950000022"); assertEquals("R", status); qty_on_hand = (Double)
     * Common.getValue(context,"pt","qty_on_hand","part_id = 'BULB-25W'"); assertEquals(qty_on_hand,
     * new Double(9)); qty_on_reserve = (Double)
     * Common.getValue(context,"pt","qty_on_reserve","part_id = 'BULB-25W'");
     * assertEquals(qty_on_reserve, new Double(91)); }
     */
}
