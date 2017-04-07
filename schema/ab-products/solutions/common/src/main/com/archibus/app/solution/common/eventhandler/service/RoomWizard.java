package com.archibus.app.solution.common.eventhandler.service;

import org.dom4j.Document;
import org.dom4j.Element;

import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.ExceptionBase;
import com.archibus.utility.XmlImpl;

/**
 * EventHandler implements RoomWizard proprietary API/message format.
 * 
 * @author tydykov
 * @created October 27, 2006
 */
public class RoomWizard extends EventHandlerBase {

    /**
     * Description of the Field
     */
    public final static String COMMAND = "command";

    // KWE Result codes
    private final static String KWE_CODE_SUCCESS = "0";

    private final static String KWE_CODE_UNKNOWN_ERROR = "1";

    // Application error, a more detailed error description may be found in an application specific
    // result_code.
    private final static String KWE_CODE_APPLICATION_ERROR = "2";

    private final static String KWE_CODE_UNSUPPORTED_CHARACTER_SET = "3";

    private final static String CONTENT_TYPE = "text/xml; charset=ISO-8859-1";

    /**
     * Handle the event.
     * 
     * @param context Workflow rule execution context.
     * @exception ExceptionBase If there is writeXmlToResponse exception.
     */
    public void handle(EventHandlerContext context) throws ExceptionBase {
        String kweResultCode = KWE_CODE_SUCCESS;
        String rbResultCode = Constants.RB_CODE_SUCCESS;
        Element result = null;
        {
            // extract command from the request
            final String commandType = (String) context.getParameter(COMMAND);
            // select method based on the requested command
            try {
                RoomWizardCommand command = RoomWizardCommand.getInstance(commandType, context);
                // execute the requested command
                result = command.execute();
            } catch (RoomWizardException ex) {
                // handle business logic and infrastructure exceptions
                kweResultCode = KWE_CODE_APPLICATION_ERROR;
                rbResultCode = ex.getRbCode();
            }
        }

        // finish assembling XML response
        RoomWizardHelper.prepareXmlResponseFinish(kweResultCode, rbResultCode, result);

        // write XML into response
        Document document = result.getDocument();
        String xmlString = XmlImpl.toString(document, "ISO-8859-1");
        // TODO: write document as stream
        writeStringToResponse(context, xmlString, CONTENT_TYPE);
    }
}
