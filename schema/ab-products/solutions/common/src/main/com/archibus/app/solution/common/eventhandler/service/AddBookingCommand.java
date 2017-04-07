package com.archibus.app.solution.common.eventhandler.service;

import java.sql.Time;
import java.util.Date;

import org.dom4j.Element;

import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.*;

/**
 * Implementation of the AddBooking command of the RoomWizard Connector.
 * 
 * @author Valery
 * @created October 31, 2006
 */
class AddBookingCommand extends RoomWizardCommand {

    /**
     * Description of the Class
     * 
     * @author tydykov
     * @created November 9, 2006
     */
    class RequiredInputs extends RoomWizardCommand.RequiredInputs {
        private String roomId;

        private Date startDate;

        private Time startTime;

        private Date endDate;

        private Time endTime;

        private String start_date;

        private String start_time;

        private String end_date;

        private String end_time;

        /**
         * Description of the Method
         * 
         * @exception ExceptionBase Description of the Exception
         */
        @Override
        void extract() throws ExceptionBase {
            // room_id = <The unique identifier for a room>
            this.roomId = (String) AddBookingCommand.this.context.getParameter(Constants.ROOM_ID);
            this.start_date = (String) AddBookingCommand.this.context
                .getParameter(Constants.START_DATE);
            this.start_time = (String) AddBookingCommand.this.context
                .getParameter(Constants.START_TIME);
            this.end_date = (String) AddBookingCommand.this.context
                .getParameter(Constants.END_DATE);
            this.end_time = (String) AddBookingCommand.this.context
                .getParameter(Constants.END_TIME);
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
                    || StringUtil.notNull(this.start_date).length() == 0) {
                throw new RoomWizardException(null, null, Constants.RB_CODE_MISSING_PARAMETER);
            }

            try {
                // convert to Date type
                // ( 4DIGIT 2DIGIT 2DIGIT ) | “today”
                this.startDate = DateTime.stringToDate(this.start_date, Constants.TODAY,
                    Constants.DATE_FORMAT);
                // convert to Time type
                // ( 2DIGIT 2DIGIT 2DIGIT ) | “now”
                this.startTime = DateTime.stringToTime(this.start_time, Constants.NOW,
                    Constants.TIME_FORMAT);
                // convert to Date type
                // ( 4DIGIT 2DIGIT 2DIGIT ) | “today”
                this.endDate = DateTime.stringToDate(this.end_date, Constants.TODAY,
                    Constants.DATE_FORMAT);
                // convert to Time type
                // ( 2DIGIT 2DIGIT 2DIGIT ) | “now”
                this.endTime = DateTime.stringToTime(this.end_time, Constants.NOW,
                    Constants.TIME_FORMAT);

                // TODO validate parameters
            } catch (ExceptionBase ex) {
                throw new RoomWizardException(null, ex, Constants.RB_CODE_INCORRECT_PARAMETER);
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

    // TODO implement optional parameters

    /**
     * Constructor for the AddBookingCommand object
     * 
     * @param aContext Description of the Parameter
     * @exception RoomWizardException Description of the Exception
     */
    AddBookingCommand(EventHandlerContext aContext) throws RoomWizardException {
    }

    /**
     * Description of the Method
     * 
     * @param aContext Description of the Parameter
     * @exception RoomWizardException Description of the Exception
     */
    @Override
    void init(EventHandlerContext aContext) throws RoomWizardException {
        this.requiredInputs = new RequiredInputs();
        this.optionalInputs = new OptionalInputs();

        super.init(aContext);
    }

    /**
     * This command requests that a very simple room booking be added to the target system. A
     * connector should try to add this booking to the target system and report the result back to
     * the client.
     * 
     * @param outputs Description of the Parameter
     * @return Description of the Return Value
     */

    /**
     * Description of the Method
     * 
     * @param outputs Description of the Parameter
     * @param result Description of the Parameter
     */
    protected void assembleXmlResponseFinish(Outputs outputs, Element result) {
        // TODO string constants

        // TODO impl optional result properties

        // assemble RB XML node
        Element bookings = result.addElement("rb:bookings").addAttribute("room_id",
            ((RequiredInputs) this.requiredInputs).roomId);

        Booking bookingParameters = new Booking();
        bookingParameters.start_date = this.getRequiredInputs().start_date;
        bookingParameters.start_time = this.getRequiredInputs().start_time;
        bookingParameters.end_date = this.getRequiredInputs().end_date;
        bookingParameters.end_time = this.getRequiredInputs().end_date;
        bookingParameters.booking_id = outputs.booking_id;
        bookingParameters.isPrivate = outputs.isPrivate;
        bookingParameters.password_protected = outputs.password_protected;

        RoomWizardHelper.addBookingNode(bookings, bookingParameters);
    }

    /**
     * Add room booking.
     * 
     * @return Description of the Return Value
     * @exception RoomWizardException If there is business logic or persistence layer exception.
     */
    @Override
    protected RoomWizardCommand.Outputs doCommand() throws RoomWizardException {
        Outputs outputs = new Outputs();
        try {
            // TODO implement business logic (using persistence layer)

            // The connector may use the host, email, and phone details from the request to create a
            // “host” attendee.
            // The connector should only try to prohibit booking clashes if a target system
            // requires this of any “client” connecting to it, otherwise the connector must
            // accept new bookings that overlap with existing bookings.
            // The add_booking command creates very simple bookings only; more
            // complicated bookings such as repeating bookings or bookings with
            // invitees are not covered by this version of the API.

            // TODO map business logic conditions to RoomWizard exceptions

            // TODO rbResultCode
            // 1200 Booking clash
            // 1201 Unbookable time
            // 1202 Not authorized to book
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
