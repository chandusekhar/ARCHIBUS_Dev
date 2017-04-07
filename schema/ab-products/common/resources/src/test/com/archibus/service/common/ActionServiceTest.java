package com.archibus.service.common;

import java.text.ParseException;
import java.util.*;

import com.archibus.eventhandler.EventHandlerTestBaseImpl;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.ExceptionBase;

public class ActionServiceTest extends EventHandlerTestBaseImpl {
    
    /**
     * Activity Log ID: 234.
     */
    private static final String ACTIVITY_LOG_ID = "234";
    
    /**
     * Project ID: BUILD-HQ-NEW.
     */
    private static final String PROJECT_ID = "BUILD-HQ-NEW";
    
    /**
     * Work Pkg ID: Footings and Foundation.
     */
    private static final String WORK_PKG_ID = "Footings and Foundation";
    
    /**
     * Test for calcActivityLogDateSchedEndForActivity method.
     */
    public void testCalcDateSchedEndForActivity() {
        final Map inputs = new HashMap();
        inputs.put("activity_log_id", ACTIVITY_LOG_ID);
        final EventHandlerContext c = createTestContext(inputs);
        new ActionService().calcActivityLogDateSchedEndForActivity(c);
    }
    
    /**
     * Test for calcActivityLogDateSchedEndForProject method.
     * @throws ParseException
     * @throws ExceptionBase
     */
    public void testCalcDateSchedEndForProject() throws ExceptionBase, ParseException {
        final Map inputs = new HashMap();
        inputs.put("project_id", PROJECT_ID);
        final EventHandlerContext c = createTestContext(inputs);
        new ActionService().calcActivityLogDateSchedEndForProject(c);
    }
    
    /**
     * Test for calcActivityLogDateSchedEndForWorkPkg method.
     */
    public void testCalcDateSchedEndForWorkPkg() {
        final Map inputs = new HashMap();
        inputs.put("project_id", PROJECT_ID);
        inputs.put("work_pkg_id", WORK_PKG_ID);
        final EventHandlerContext c = createTestContext(inputs);
        new ActionService().calcActivityLogDateSchedEndForWorkPkg(c);
    }
    
    /**
     * Test for calcActivityLogDatePlannedEndForActivity method.
     */
    public void testCalcDatePlannedEndForActivity() {
        final Map inputs = new HashMap();
        inputs.put("activity_log_id", ACTIVITY_LOG_ID);
        final EventHandlerContext c = createTestContext(inputs);
        new ActionService().calcActivityLogDatePlannedEndForActivity(c);
    }
    
    /**
     * Test for calcActivityLogDatePlannedEndForProject method.
     */
    public void testCalcDatePlannedEndForProject() {
        final Map inputs = new HashMap();
        inputs.put("project_id", PROJECT_ID);
        final EventHandlerContext c = createTestContext(inputs);
        new ActionService().calcActivityLogDatePlannedEndForProject(c);
    }
    
    /**
     * Test for calcActivityLogDatePlannedEndForWorkPkg method.
     */
    public void testCalcDatePlannedEndForWorkPkg() {
        final Map inputs = new HashMap();
        inputs.put("project_id", PROJECT_ID);
        inputs.put("work_pkg_id", WORK_PKG_ID);
        final EventHandlerContext c = createTestContext(inputs);
        new ActionService().calcActivityLogDatePlannedEndForWorkPkg(c);
    }
    
}
