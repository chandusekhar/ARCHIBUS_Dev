package com.mycompany.eventhandler.notify;

import org.dom4j.Document;

import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandler;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.ExceptionBase;

/**
 * This event handler loads view and generates view XML for Notify workflow rule.
 * 
 * @author Valery Tydykov
 * @author Sergey Kuramshin
 * @created March 14, 2005
 */
public class NotifyStep1 extends EventHandlerBase implements EventHandler {

    /**
     * Default event-handling method.
     * 
     * @param context Map of input parameters.
     * @param response Map of output parameters.
     * @exception ExceptionBase
     */
    public void handle(EventHandlerContext context) throws ExceptionBase {
        // get and validate view name from context
        String viewName = (String) context.getParameter(NotifyMain.KEY_VIEW);
        if (this.log.isDebugEnabled()) {
            this.log.debug("Loading view [" + viewName + "]");
        }

        // load view XML and attach it to the response
        Document view = loadViewXml(context, viewName);
        context.addResponseParameter(NotifyMain.KEY_VIEW_IMPL, view);

        // generate view XML and attach it to the response
        Document xml = generateViewXml(context, viewName, null);
        context.addResponseParameter(NotifyMain.KEY_VIEW_XML, xml);
    }
}
