package com.archibus.app.solution.common.eventhandler.service;

import org.dom4j.Document;
import org.dom4j.Element;
import org.dom4j.QName;

import com.archibus.utility.DateTime;
import com.archibus.utility.StringUtil;
import com.archibus.utility.Utility;
import com.archibus.utility.XmlImpl;

/**
 * Helper class with static methods.
 * 
 * @author Valery
 * @created October 31, 2006
 */
class RoomWizardHelper {

    /**
     * Finish preparation of the Xml response. Add result_code nodes to the result node.
     * 
     * @param kweResultCode result_code from the kwe namespace.
     * @param rbResultCode result_code from the rb namespace.
     * @param result The result node.
     */
    static void prepareXmlResponseFinish(String kweResultCode, String rbResultCode, Element result) {
        // TODO string constants
        result.addElement("kwe:result_code").setText(kweResultCode);
        result.addElement("rb:result_code").setText(rbResultCode);
    }

    /**
     * Begin preparation of the Xml response. Add result node with some properties.
     * 
     * @return Created result node.
     */
    static Element prepareXmlResponseBegin() {
        XmlImpl xml = new XmlImpl();
        // TODO string constants
        Element result = null;
        {
            xml.initDocument();
            Document document = xml.getDocument();
            QName resultName = QName
                    .get("result", "kwe", "http://www.appliancestudio.com/kwe/1.0/");
            result = document.addElement(resultName);
            result.addNamespace("rb", "http://www.appliancestudio.com/rb/1.0/");
            // current date
            // Date properties must be in the format yyyyMMdd (year, month, day).
            String date = DateTime.dateToString(Utility.currentDate(), Constants.DATE_FORMAT);
            result.addElement("kwe:date").setText(date);
            // current time
            // Time properties must be in the format using a 24 hour clock (military time).
            String time = DateTime.timeToString(Utility.currentTime(), Constants.TIME_FORMAT);
            result.addElement("kwe:time").setText(time);
        }

        return result;
    }

    /**
     * Add booking node to the Bookings node.
     * 
     * @param bookingParameters The feature to be added to the BookingNode attribute
     * @param bookings The feature to be added to the BookingNode attribute
     * @return Created booking node.
     */
    static Element addBookingNode(Element bookings, Booking bookingParameters) {
        // TODO string constants
        Element booking = bookings.addElement("rb:booking");
        booking.addAttribute("booking_id", bookingParameters.booking_id);
        booking.addAttribute("private", bookingParameters.isPrivate);
        booking.addAttribute("password_protected", bookingParameters.password_protected);

        booking.addElement("rb:range_start_date").setText(bookingParameters.start_date);
        booking.addElement("rb:range_end_date").setText(bookingParameters.end_date);
        booking.addElement("rb:range_start_time").setText(bookingParameters.start_time);
        booking.addElement("rb:range_end_time").setText(bookingParameters.end_time);

        // Optional result properties
        // if purpose specified, add it to the result
        if (StringUtil.notNull(bookingParameters.purpose).length() > 0) {
            booking.addElement("rb:purpose").setText(bookingParameters.purpose);
        }

        return booking;
    }

    // Connector name
    final static String name = "ARCHIBUS WebCentral RoomWizard Connector(c) Appliance Studio";

    // Connector version
    final static String version = "1.0";

    // Connector short name
    final static String shortName = "WebCentral";

    // supported API name
    final static String apiName = "Room Booking API";

    // supported API version
    final static String apiVersion = "1.1";

    /**
     * Add connector node to the result node.
     * 
     * @param result Result node.
     */
    static void addConnectorNode(Element result) {
        // TODO string constants
        Element connector = result.addElement("kwe:connector");
        {
            connector.addElement("kwe:name").setText(name);
            connector.addElement("kwe:version").setText(version);
            connector.addElement("kwe:short").setText(shortName);
            Element api = connector.addElement("kwe:api");
            api.addAttribute("name", apiName);
            api.addAttribute("version", apiVersion);
        }
    }
}
