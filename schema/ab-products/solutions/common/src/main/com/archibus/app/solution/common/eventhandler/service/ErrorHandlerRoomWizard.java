package com.archibus.app.solution.common.eventhandler.service;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;


/**
 * Error handler for RoomWizard Service servlet.
 * 
 * @author tydykov
 * @created November 1, 2006
 */
public class ErrorHandlerRoomWizard extends ErrorHandler {
    /**
     * Constructor for the ErrorHandlerRoomWizard object
     */
    public ErrorHandlerRoomWizard() {
    }

    /**
     * Handle specified exception.
     * 
     * @param exception Exception to handle.
     * @param request An HttpServletRequest object that contains the request the client has made of
     *            the servlet.
     * @param response An HttpServletRequest object that contains the request the client has made of
     *            the servlet.
     * @throws ServletException Description of the Exception
     */
    public void handle(Throwable exception, HttpServletRequest request, HttpServletResponse response)
            throws ServletException {
        // exception handling: convert exception into the error code specified in the proprietary
        // API
        super.handle(exception, request, response);
    }
}
