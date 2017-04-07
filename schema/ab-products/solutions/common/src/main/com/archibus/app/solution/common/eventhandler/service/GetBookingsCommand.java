package com.archibus.app.solution.common.eventhandler.service;

import java.sql.Time;
import java.util.Date;

import org.dom4j.Element;

import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.*;

/**
 * Implementation of the GetBookings command of the RoomWizard Connector.
 * 
 * @author tydykov
 * @created November 1, 2006
 */
class GetBookingsCommand extends RoomWizardCommand {
    /**
     * Constructor for the GetBookingsCommand object
     * 
     * @param aContext Description of the Parameter
     * @exception RoomWizardException Description of the Exception
     */
    GetBookingsCommand(EventHandlerContext aContext) throws RoomWizardException {
    }

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
            this.roomId = (String) GetBookingsCommand.this.context.getParameter(Constants.ROOM_ID);
            this.start_date = (String) GetBookingsCommand.this.context
                .getParameter(Constants.RANGE_START_DATE);
            this.start_time = (String) GetBookingsCommand.this.context
                .getParameter(Constants.RANGE_START_TIME);
            this.end_date = (String) GetBookingsCommand.this.context
                .getParameter(Constants.RANGE_END_DATE);
            this.end_time = (String) GetBookingsCommand.this.context
                .getParameter(Constants.RANGE_END_TIME);
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

    /**
     * This command returns room bookings for a given room that fall within a time period that is
     * specified in the request.
     * 
     * @param result The result node.
     * @param outputs Description of the Parameter
     */
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
     * Returns room bookings for a given room that fall within the specified time period.
     * 
     * @return Map<String booking_id, Map booking> of bookings, each item contains Map<String name,
     *         String value> of booking properties.
     * @exception RoomWizardException If there is business logic or persistence layer exception.
     */
    @Override
    protected RoomWizardCommand.Outputs doCommand() throws RoomWizardException {
        Outputs outputs = new Outputs();
        try {
            // TODO implement business logic (using persistence layer)

            // Selection criteria
            // This request must return all bookings that are active at any point during the
            // period indicated by the request arguments except bookings starting on
            // exactly the end date and time of the period specified.
            // Formally specified:
            // Given a request with:
            // range_start_date=rsd
            // range_start_time=rst
            // range_end_date=red
            // range_end_time=ret
            // and a set of bookings on a target system with
            // booking_start_date=bsd
            // booking_start_time=bst
            // booking_end_date=bed
            // booking_end_time=bet

            // return all bookings for which the following is true:
            // (((bsd + bst) < (red + ret)) AND
            // ((bed + bet) > (rsd + rst))) OR
            // ((bsd + bst) = (rsd + rst) = (red+ ret))
            // assuming that the following is always true (meetings don’t end before they start)
            // (bsd + bst) <= (bed + bet)
            // Comments
            // The connector does not need to support requests with multiple Room ids.
            // The connector may return the bookings within the rb:bookings block in
            // any order. Clients must not rely on the bookings being ordered in any way
            // in the result section.
            // The “confidential” property must not affect the processing behavior of the
            // connector in any other way than retrieving the appropriate information from
            // the server and passing it on to the client.
            // The connector should not include “deleted” bookings in the result set.
            // The connector should only collect “confirmed” bookings. If the target
            // system can have “unconfirmed” or “not yet accepted” room bookings than
            // these should not be retrieved.

            // TODO map business logic conditions to RoomWizard exceptions

            // TODO rbResultCode
            // 1200 Booking clash
            // 1201 Unbookable time
            // 1202 Not authorized to book
            if (1 == 0) {
                // @non-translatable
                throw new RoomWizardException(null, null, Constants.RB_CODE_UNBOOKABLE_TIME);
            }
            {
                // success
                // TODO assemble results
                // TODO for each booking

                outputs.booking_id = null;
                outputs.isPrivate = null;
                outputs.password_protected = null;
            }
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
