package com.mycompany.eventhandler.notify;

import org.dom4j.Document;
import org.dom4j.Element;

import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandler;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.ExceptionBase;
import com.archibus.utility.StringUtil;

/**
 * This event handler retrieves view statistic value for Notify workflow rule.
 * 
 * @author Valery Tydykov
 * @author Sergey Kuramshin
 * @created March 14, 2005
 */
public class NotifyStep2 extends EventHandlerBase implements EventHandler {

    /**
     * Default event-handling method.
     * 
     * @param context Map of input parameters.
     * @param response Map of output parameters.
     * @exception ExceptionBase
     */
    public void handle(EventHandlerContext context) throws ExceptionBase {
        // response must contain generated view XML
        Document xml = (Document) context.getParameter(NotifyMain.KEY_VIEW_XML);

        // view XML should contain statistic value,
        // for example number of records meeting some criteria
        Integer statisticValue = null;
        {
            Element statistic = (Element) xml.selectSingleNode("descendant::statistics/statistic");
            if (statistic != null) {
                String valueString = statistic.attributeValue("value");

                if (StringUtil.notNull(valueString).length() > 0) {
                    try {
                        statisticValue = new Integer(valueString);
                    } catch (NumberFormatException e) {
                        // this should never happen - would mean error in generating XmlForXsl
                        // @non-translatable
                        String errorMessage = "Unable to parse statistic value=[{0}]";

                        ExceptionBase exception = new ExceptionBase();
                        exception.setPattern(errorMessage);
                        exception.setArgs(new Object[] { valueString });
                        exception.setNested(e);
                        throw exception;
                    }
                }
            }
        }

        // attach statistic value to the response
        context.addResponseParameter(NotifyMain.KEY_VIEW_STATISTIC, statisticValue);

        if (this.log.isDebugEnabled()) {
            this.log.debug("Statistic value=[" + statisticValue + "]");
        }
    }
}
