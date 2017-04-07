package com.mycompany.eventhandler.notify;

import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandler;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.ExceptionBase;

/**
 * This event handler sends email notifications using 3 children event handlers.
 * 
 * @author Valery Tydykov
 * @created March 14, 2005
 */
public class NotifyMain extends EventHandlerBase implements EventHandler {

    /**
     * Keys for objects that are shared between children event handlers.
     */
    final static String KEY_VIEW = "view";

    final static String KEY_VIEW_IMPL = "viewImpl";

    final static String KEY_VIEW_XML = "viewXml";

    final static String KEY_VIEW_STATISTIC = "viewStatistic";

    /**
     * Default event-handling method.
     * 
     * @param context Map of input parameters.
     * @param response Map of output parameters.
     * @exception ExceptionBase
     */
    public void handle(EventHandlerContext context) throws ExceptionBase {

        // load view and generate XML
        runWorkflowRule(context, "AbSolutionsExtras-NotifyStep1", false);

        // retrieve statistic value
        runWorkflowRule(context, "AbSolutionsExtras-NotifyStep2", false);

        // send email notifications
        runWorkflowRule(context, "AbSolutionsExtras-NotifyStep3", true);
    }
}
