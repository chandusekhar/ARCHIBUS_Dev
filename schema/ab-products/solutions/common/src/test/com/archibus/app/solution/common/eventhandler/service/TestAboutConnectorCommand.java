package com.archibus.app.solution.common.eventhandler.service;

import junit.framework.TestCase;

import org.dom4j.Element;

import com.archibus.app.solution.common.eventhandler.service.*;

/**
 * Description of the Class
 * 
 * @author tydykov
 * @created November 1, 2006
 */
public class TestAboutConnectorCommand extends TestCase {

    /**
     * A unit test for JUnit
     * 
     * @exception RoomWizardException Description of the Exception
     */
    public void testAboutConnector() throws RoomWizardException {
        RoomWizardCommand command = RoomWizardCommand.getInstance(
            RoomWizardCommand.COMMAND_ADD_BOOKING, null);

        Element result = command.execute();

        TestRoomWizardHelper.verifyResultNodeBegin(result);
        TestRoomWizardHelper.verifyConnectorNode(result);

        System.out.println(result.asXML());
    }
}
