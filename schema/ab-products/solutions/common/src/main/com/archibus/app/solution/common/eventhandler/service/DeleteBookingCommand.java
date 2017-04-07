package com.archibus.app.solution.common.eventhandler.service;

import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.*;

/**
 * Implementation of the DeleteBooking command of the RoomWizard Connector.
 * 
 * @author Valery
 * @created October 31, 2006
 */
class DeleteBookingCommand extends RoomWizardCommand {

    DeleteBookingCommand(EventHandlerContext aContext) throws RoomWizardException {
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
            this.roomId = (String) DeleteBookingCommand.this.context
                .getParameter(Constants.ROOM_ID);
            // booking_id = <The unique identifier for a booking>
            this.booking_id = (String) DeleteBookingCommand.this.context
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

    /**
     * This command requests that a booking should be removed from the target system.
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
            // The following result codes are specific to the delete_bookings request:
            // 1300 Unknown booking
            // 1301 Incorrect booking password
            // 1302 Not authorised to change booking

            if (1 == 0) {
                // @non-translatable
                throw new RoomWizardException(null, null, Constants.RB_CODE_UNBOOKABLE_TIME);
            }
            // success
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
