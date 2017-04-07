package com.archibus.app.solution.common.eventhandler.service;

import org.dom4j.Element;

import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.ExceptionBase;

/**
 * Description of the Class
 * 
 * @author tydykov
 * @created November 6, 2006
 */
public abstract class RoomWizardCommand {
    /**
     * Description of the Field
     */
    protected EventHandlerContext context;

    /**
     * Description of the Field
     */
    protected RequiredInputs requiredInputs;

    /**
     * Description of the Field
     */
    protected OptionalInputs optionalInputs;

    /**
     * Description of the Class
     * 
     * @author tydykov
     * @created November 6, 2006
     */
    class RequiredInputs {
        /**
         * Description of the Method
         * 
         * @exception ExceptionBase Description of the Exception
         */
        void extract() throws ExceptionBase {
        }

        /**
         * Description of the Method
         * 
         * @exception RoomWizardException Description of the Exception
         */
        void validate() throws RoomWizardException {
        }

    }

    /**
     * Description of the Class
     * 
     * @author tydykov
     * @created November 6, 2006
     */
    class OptionalInputs {
        /**
         * Description of the Method
         * 
         * @exception ExceptionBase Description of the Exception
         */
        void extract() throws ExceptionBase {
        }

        /**
         * Description of the Method
         * 
         * @exception RoomWizardException Description of the Exception
         */
        void validate() throws RoomWizardException {
        }

    }

    /**
     * Description of the Class
     * 
     * @author tydykov
     * @created November 9, 2006
     */
    class Outputs {
        String booking_id;

        String isPrivate;

        String password_protected;
    }

    /**
     * Constructor for the RoomWizardCommand object
     */
    RoomWizardCommand() {
    }

    /**
     * Constructor for the RoomWizardCommand object
     * 
     * @param aContext Description of the Parameter
     * @exception RoomWizardException Description of the Exception
     * @exception ExceptionBase Description of the Exception
     */
    RoomWizardCommand(EventHandlerContext aContext) throws RoomWizardException, ExceptionBase {
        init(aContext);

        if (this.requiredInputs != null) {
            this.requiredInputs.extract();
            this.requiredInputs.validate();
        }
        if (this.optionalInputs != null) {
            this.optionalInputs.extract();
            this.optionalInputs.validate();
        }
    }

    /**
     * Description of the Field
     */
    public final static String COMMAND_ABOUT_CONNECTOR = "about_connector";

    /**
     * Description of the Field
     */
    public final static String COMMAND_GET_BOOKINGS = "get_bookings";

    /**
     * Description of the Field
     */
    public final static String COMMAND_ADD_BOOKING = "add_booking";

    /**
     * Description of the Field
     */
    public final static String COMMAND_EDIT_BOOKING = "edit_booking";

    /**
     * Description of the Field
     */
    public final static String COMMAND_DELETE_BOOKING = "delete_booking";

    /**
     * Gets the instance attribute of the RoomWizardCommand class
     * 
     * @param type Description of the Parameter
     * @param aContext Description of the Parameter
     * @return The instance value
     * @exception RoomWizardException Description of the Exception
     */
    public static RoomWizardCommand getInstance(final String type,
            final EventHandlerContext aContext) throws RoomWizardException {
        RoomWizardCommand newObject = null;

        if (COMMAND_ABOUT_CONNECTOR.equals(type)) {
            newObject = new AboutConnectorCommand();
        } else if (COMMAND_GET_BOOKINGS.equals(type)) {
            newObject = new GetBookingsCommand(aContext);
        } else if (COMMAND_ADD_BOOKING.equals(type)) {
            newObject = new AddBookingCommand(aContext);
        } else if (COMMAND_EDIT_BOOKING.equals(type)) {
            newObject = new EditBookingCommand(aContext);
        } else if (COMMAND_DELETE_BOOKING.equals(type)) {
            newObject = new DeleteBookingCommand(aContext);
        } else {
            throw new RoomWizardException(null, null, Constants.RB_CODE_COMMAND_NOT_FOUND);
        }

        return newObject;
    }

    /**
     * Description of the Method
     * 
     * @param aContext Description of the Parameter
     * @exception RoomWizardException Description of the Exception
     */
    void init(EventHandlerContext aContext) throws RoomWizardException {
        this.context = aContext;
    }

    /**
     * Description of the Method
     * 
     * @return Description of the Return Value
     * @exception RoomWizardException Description of the Exception
     */
    Element execute() throws RoomWizardException {
        Outputs outputs = doCommand();

        return assembleXmlResponse(outputs);
    }

    /**
     * Add room booking.
     * 
     * @return Description of the Return Value
     * @exception RoomWizardException If there is business logic or persistence layer exception.
     */
    protected Outputs doCommand() throws RoomWizardException {
        return null;
    }

    /**
     * Description of the Method
     * 
     * @param outputs Description of the Parameter
     * @return Description of the Return Value
     */
    protected Element assembleXmlResponse(Outputs outputs) {
        // start assembling XML response
        Element result = RoomWizardHelper.prepareXmlResponseBegin();

        // The result XML structure for every command always has a kwe:connector block.
        RoomWizardHelper.addConnectorNode(result);

        assembleXmlResponseFinish(outputs, result);

        return result;
    }

    /**
     * Description of the Method
     * 
     * @param outputs Description of the Parameter
     * @param result Description of the Parameter
     */
    protected void assembleXmlResponseFinish(Outputs outputs, Element result) {
    }
}
