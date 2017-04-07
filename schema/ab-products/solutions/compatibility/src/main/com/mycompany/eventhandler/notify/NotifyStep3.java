package com.mycompany.eventhandler.notify;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Reader;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import org.dom4j.Document;
import org.dom4j.Element;

import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandler;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.ExceptionBase;

/**
 * This event handler sends email notifications for Notify workflow rules.
 * 
 * @author Valery Tydykov
 * @author Sergey Kuramshin
 * @created March 14, 2005
 */
public class NotifyStep3 extends EventHandlerBase implements EventHandler {

    /**
     * Default event-handling method.
     * 
     * @param context Map of input parameters.
     * @exception ExceptionBase
     */
    public void handle(EventHandlerContext context) throws ExceptionBase {
        // response must contain 1) view, 2) generated view XML and 3) statistic value
        String viewName = (String) context.getParameter(NotifyMain.KEY_VIEW);
        Document view = (Document) context.getParameter(NotifyMain.KEY_VIEW_IMPL);
        Document xml = (Document) context.getParameter(NotifyMain.KEY_VIEW_XML);
        Integer statisticValue = (Integer) context.getParameter(NotifyMain.KEY_VIEW_STATISTIC);

        // send notifications if the statistic value is > 0
        if (statisticValue.intValue() > 0) {

            // apply XSL to render the mail body
            String xsltFilePath = determineXsltFilePath(context, viewName);
            InputStream htmlStream = applyViewXsl(context, viewName, xml, xsltFilePath, false);

            // convert HTML input stream to text
            StringBuffer html = new StringBuffer();
            try {
                Reader reader = new InputStreamReader(htmlStream, "UTF-8");
                int c;
                while ((c = reader.read()) != -1) {
                    html.append((char) c);
                }
            } catch (Throwable t) {
                // @non-translatable
                throw new ExceptionBase("Could not read HTML input stream", t);
            }

            // assemble email parameters
            String from = getEmailFrom(context);
            String host = getEmailHost(context);
            String port = getEmailPort(context);
            String userId = getEmailUserId(context);
            String password = getEmailPassword(context);
            String subject = ((Element) view
                .selectSingleNode("descendant::message[@name='subject']")).getText();

            // prepare CC list
            ArrayList ccAddresses = new ArrayList();
            // for each item in the CC list
            List ccList = xml.selectNodes("descendant::cc/records/record");
            for (Iterator it = ccList.iterator(); it.hasNext();) {
                Element cc = (Element) it.next();

                String ccAddress = cc.attributeValue("email");
                ccAddresses.add(ccAddress);
            }

            File file = null;
            try {
                // prepare attachment file
                ArrayList attachments = new ArrayList();
                {
                    try {
                        // create temporary file
                        file = File.createTempFile("pattern", ".suffix");

                        // Write to file
                        BufferedWriter out = new BufferedWriter(new FileWriter(file));
                        out.write("aString");
                        out.close();
                    } catch (IOException e) {
                        // @non-translatable
                        throw new ExceptionBase("Could not create temporary attachment file", e);
                    }

                    String fileName = file.getAbsolutePath();
                    attachments.add(fileName);
                }

                // for each item in the Notify list
                List notifyList = xml.selectNodes("descendant::notify/records/record");
                for (Iterator it = notifyList.iterator(); it.hasNext();) {
                    Element notify = (Element) it.next();

                    String to = notify.attributeValue("email");

                    sendEmail(html.toString(), from, host, port, subject, to, ccAddresses, null,
                        userId, password, attachments);
                }
            } finally {
                // delete temp file
                if (file != null) {
                    file.delete();
                }
            }
        }
    }
}
