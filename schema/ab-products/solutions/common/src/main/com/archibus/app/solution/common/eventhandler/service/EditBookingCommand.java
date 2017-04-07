package com.archibus.app.solution.common.eventhandler.service;

import org.dom4j.Element;

import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.*;

/**
 * Implementation of the EditBooking command of the RoomWizard Connector.
 * 
 * @author Valery
 * @created October 31, 2006
 */
class EditBookingCommand extends RoomWizardCommand {
    EditBookingCommand(EventHandlerContext aContext) throws RoomWizardException {
    }

    class RequiredInputs extends RoomWizardCommand.RequiredInputs {
        private String roomId;

        private String booking_id;

        /**
         * Description of the Method
         * 
         * @exception ExceptionBase Description of the Exception
         */
        @Override
        void extract() throws ExceptionBase {
            // room_id = <The unique identifier for a room>
            this.roomId = (String) EditBookingCommand.this.context.getParameter(Constants.ROOM_ID);
            // booking_id = <The unique identifier for a booking>
            this.booking_id = (String) EditBookingCommand.this.context
                .getParameter(Constants.BOOKING_ID);
        }

        /**
         * Description of the Method
         * 
         * @exception RoomWizardException Description of the Exception
         */
        @Override
        void validate() throws RoomWizardException {
            // TODO validate required parameters
            // if required parameter is not supplied, throw exception
            if (StringUtil.notNull(this.roomId).length() == 0
                    || StringUtil.notNull(this.booking_id).length() == 0) {
                throw new RoomWizardException(null, null, Constants.RB_CODE_MISSING_PARAMETER);
            }
        }
    }

    /**
     * Gets the requiredInputs attribute of the AddBookingCommand object
     * 
     * @return The requiredInputs value
     */
    public RequiredInputs getRequiredInputs() {
        return (RequiredInputs) this.requiredInputs;
    }

    /**
     * Description of the Class
     * 
     * @author tydykov
     * @created November 9, 2006
     */
    class OptionalInputs extends RoomWizardCommand.OptionalInputs {
        // TODO implement optional parameters

        /**
         * Description of the Method
         * 
         * @exception ExceptionBase Description of the Exception
         */
        @Override
        void extract() throws ExceptionBase {
            // TODO implement optional parameters
        }

        /**
         * Description of the Method
         * 
         * @exception RoomWizardException Description of the Exception
         */
        @Override
        void validate() throws RoomWizardException {
            // TODO implement optional parameters
        }
    }

    /**
     * Description of the Class
     * 
     * @author tydykov
     * @created November 6, 2006
     */
    class Outputs extends RoomWizardCommand.Outputs {
    }

    protected void assembleXmlResponseFinish(Outputs outputs, Element result) {
        // TODO string constants

        // TODO impl optional result properties

        // assemble RB XML node
        Element bookings = result.addElement("rb:bookings").addAttribute("room_id",
            ((RequiredInputs) this.requiredInputs).roomId);

        Booking bookingParameters = new Booking();
        bookingParameters.booking_id = outputs.booking_id;
        bookingParameters.isPrivate = outputs.isPrivate;
        bookingParameters.password_protected = outputs.password_protected;

        RoomWizardHelper.addBookingNode(bookings, bookingParameters);
    }

    /**
     * This command requests a change to the properties of a room booking.
     * 
     * @param context Workflow rule execution context.
     * @param result The result node.
     * @exception RoomWizardException If there is business logic or persistence layer exception.
     */

    /**
     * Edit specified room booking.
     * 
     * @param context Workflow rule execution context.
     * @param roomId Room ID.
     * @param booking_id Booking ID.
     * @return Map<String name, String value> of booking properties.
     * @exception RoomWizardException If there is business logic or persistence layer exception.
     */
    @Override
    protected RoomWizardCommand.Outputs doCommand() throws RoomWizardException {
        Outputs outputs = new Outputs();
        try {
            // TODO implement business logic (using persistence layer)

            // TODO map business logic conditions to RoomWizard exceptions

            // TODO rbResultCode
            // The following result codes are specific to the get_bookings request:
            // 1200 Booking clash
            // 1201 Unbookable time
            // 1202 Not authorized to book
            // 1300 Unknown booking
            // 1301 Incorrect booking password
            // 1302 Not authorized to change booking

            if (1 == 0) {
                // @non-translatable
                throw new RoomWizardException(null, null, Constants.RB_CODE_UNBOOKABLE_TIME);
            }

            // success
            // TODO assemble results
            outputs.booking_id = null;
            outputs.isPrivate = null;
            outputs.password_protected = null;
        } catch (ExceptionBase ex) {
            // TODO map persistence layer exceptions to RoomWizard exceptions

            // TODO rbResultCode
            // 1200 Booking clash
            // 1201 Unbookable time
            // 1202 Not authorized to book
            if (ex.getErrorNumber() == 9999) {
                // @non-translatable
                throw new RoomWizardException(null, ex, Constants.RB_CODE_BOOKING_CLASH);
            }

            // if no matching RoomWizard exceptions found (infrastructure exception),
            // re-throw exception
            throw ex;
        }

        return outputs;
    }
}
