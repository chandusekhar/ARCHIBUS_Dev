package com.archibus.app.solution.common.eventhandler.service;

import junit.framework.TestCase;

import org.dom4j.Element;

import com.archibus.app.solution.common.eventhandler.service.*;
import com.archibus.utility.ExceptionBase;

/**
 * Description of the Class
 * 
 * @author Valery
 * @created October 31, 2006
 */
public class TestRoomWizardHelper extends TestCase {

    /**
     * A unit test for JUnit
     * 
     * @exception ExceptionBase Description of the Exception
     */
    public void testPrepareXmlResponseBegin() throws ExceptionBase {
        Element result = RoomWizardHelper.prepareXmlResponseBegin();
        verifyResultNodeBegin(result);

        System.out.println("prepareXmlResponseBegin");
        System.out.println(result.asXML());
    }

    /**
     * A unit test for JUnit
     */
    public void testPrepareXmlResponseFinish() {
        String kweResultCode = "0";
        String rbResultCode = "0";

        Element result = RoomWizardHelper.prepareXmlResponseBegin();
        verifyResultNodeBegin(result);

        RoomWizardHelper.prepareXmlResponseFinish(kweResultCode, rbResultCode, result);
        verifyResultNodeFinish(result);

        System.out.println("prepareXmlResponseFinish");
        System.out.println(result.asXML());
    }

    /**
     * A unit test for JUnit
     */
    public void testAddBookingNode() {
        String kweResultCode = "0";
        String rbResultCode = "0";

        Element result = RoomWizardHelper.prepareXmlResponseBegin();
        RoomWizardHelper.prepareXmlResponseFinish(kweResultCode, rbResultCode, result);

        Booking bookingParameters = new Booking();
        bookingParameters.start_date = "20011231";
        bookingParameters.start_time = "235846";
        bookingParameters.end_date = "20011231";
        bookingParameters.end_time = "235846";
        bookingParameters.booking_id = "235846";
        bookingParameters.isPrivate = "no";
        bookingParameters.password_protected = "no";

        String roomId = "101";

        Element bookings = result.addElement("rb:bookings").addAttribute("room_id", roomId);
        RoomWizardHelper.addBookingNode(bookings, bookingParameters);

        // TODO verify BookingNode

        System.out.println("addBookingNode");
        System.out.println(result.asXML());
    }

    /**
     * A unit test for JUnit
     */
    public void testAddConnectorNode() {
        Element result = RoomWizardHelper.prepareXmlResponseBegin();
        RoomWizardHelper.addConnectorNode(result);
        verifyConnectorNode(result);

        System.out.println("addConnectorNode");
        System.out.println(result.asXML());
    }

    /**
     * Description of the Method
     * 
     * @param result Description of the Parameter
     */
    public static void verifyResultNodeBegin(Element result) {
        {
            Element date = (Element) result
                .selectSingleNode("descendant-or-self::kwe:result/kwe:date");
            assertNotNull(date.getText());
        }
        {
            Element time = (Element) result
                .selectSingleNode("descendant-or-self::kwe:result/kwe:time");
            assertNotNull(time.getText());
        }
    }

    /**
     * Description of the Method
     * 
     * @param result Description of the Parameter
     */
    public static void verifyResultNodeFinish(Element result) {
        {
            Element element = (Element) result
                .selectSingleNode("descendant-or-self::kwe:result/kwe:result_code");
            assertNotNull(element.getText());
        }
        {
            Element element = (Element) result
                .selectSingleNode("descendant-or-self::kwe:result/rb:result_code");
            assertNotNull(element.getText());
        }
    }

    /**
     * Description of the Method
     * 
     * @param result Description of the Parameter
     */
    public static void verifyConnectorNode(Element result) {
        {
            Element element = (Element) result
                .selectSingleNode("descendant-or-self::kwe:connector/kwe:name");
            assertNotNull(element.getText());
        }
        {
            Element element = (Element) result
                .selectSingleNode("descendant-or-self::kwe:connector/kwe:version");
            assertNotNull(element.getText());
        }
        {
            Element element = (Element) result
                .selectSingleNode("descendant-or-self::kwe:connector/kwe:short");
            assertEquals("WebCentral", element.getText());
        }
        {
            Element element = (Element) result
                .selectSingleNode("descendant-or-self::kwe:connector/kwe:api");
            assertNotNull(element.getText());
        }
    }
}
