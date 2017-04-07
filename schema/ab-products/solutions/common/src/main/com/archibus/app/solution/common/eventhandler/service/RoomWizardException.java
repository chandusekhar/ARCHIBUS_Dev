package com.archibus.app.solution.common.eventhandler.service;

import com.archibus.utility.ExceptionBase;

/**
 * Business logic exception, specific for RoomWizard Connector. Has rbCode result code property,
 * specified in RoomWizard Connector API.
 * 
 * @author Valery
 * @created October 31, 2006
 */
class RoomWizardException extends ExceptionBase {
    // RB result code
    private String rbCode;

    /**
     * Constructor for the RoomWizardException object
     * 
     * @param operation Operation.
     * @param nested Nested exception.
     * @param rbCode RB result code.
     */
    RoomWizardException(String operation, Throwable nested, String rbCode) {
        super(operation, nested);

        this.rbCode = rbCode;
    }

    /**
     * Sets the rbCode attribute of the RoomWizardException object
     * 
     * @param rbCode The new rbCode value
     */
    public void setRbCode(String rbCode) {
        this.rbCode = rbCode;
    }

    /**
     * Gets the rbCode attribute of the RoomWizardException object
     * 
     * @return The rbCode value
     */
    public String getRbCode() {
        return rbCode;
    }
}
