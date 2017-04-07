package com.archibus.app.solution.common.eventhandler.service;

import java.util.*;

import org.dom4j.Element;

import com.archibus.app.solution.common.eventhandler.service.*;
import com.archibus.fixture.*;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.ExceptionBase;

/**
 * Description of the Class
 * 
 * @author Valery
 * @created November 7, 2006
 */
public class TestAddBookingCommand extends IntegrationTestBase {

    /**
     * Helper object providing test-related resource and methods.
     */
    private final ServletServiceFixture fixture = new ServletServiceFixture(this);

    /**
     * JUnit test initialization method.
     * 
     * @exception Exception Description of the Exception
     */
    @Override
    public void onSetUp() throws Exception {
        super.onSetUp();

        this.fixture.setUp();
    }

    /**
     * JUnit clean-up method.
     */
    @Override
    public void onTearDown() {
        this.fixture.tearDown();

        super.onTearDown();
    }

    /**
     * A unit test for JUnit
     * 
     * @exception RoomWizardException Description of the Exception
     */
    public void testAddBooking() throws RoomWizardException {
        {
            Map inputs = new HashMap();
            inputs.put("room_id", "101");
            EventHandlerContext context = this.fixture.prepareContext(inputs);
            Element result = null;
            try {
                RoomWizardCommand command = RoomWizardCommand.getInstance(
                    RoomWizardCommand.COMMAND_ADD_BOOKING, context);
                result = command.execute();
            } catch (ExceptionBase ex) {
                // ExceptionBase expected
                if (ex.getOperation().indexOf("Event handler parameter [start_date] not found") == -1) {
                    fail("Event handler parameter [start_date] not found ExceptionBase expected");
                }
            }
        }
        {
            Map inputs = new HashMap();
            inputs.put("room_id", "101");
            inputs.put("start_date", "20011123");
            inputs.put("start_time", "235545");
            inputs.put("end_date", "20011123");
            inputs.put("end_time", "235545");
            EventHandlerContext context = this.fixture.prepareContext(inputs);
            RoomWizardCommand command = RoomWizardCommand.getInstance(
                RoomWizardCommand.COMMAND_ADD_BOOKING, context);

            Element result = command.execute();

            TestRoomWizardHelper.verifyResultNodeBegin(result);
            TestRoomWizardHelper.verifyConnectorNode(result);
        }
    }
}
