package com.archibus.app.solution.common.eventhandler.service;

import javax.servlet.ServletException;
import javax.servlet.http.*;

import com.archibus.utility.ExceptionBase;

/**
 * Handles exceptions in a servlet.
 * 
 * @author tydykov
 * @created November 1, 2006
 */
public class ErrorHandler {
    /**
     * Handle specified exception. Convert the exception into ServletException or HTTP error.
     * 
     * @param exception Exception to handle.
     * @param request An HttpServletRequest object that contains the request the client has made of
     *            the servlet.
     * @param response An HttpServletRequest object that contains the request the client has made of
     *            the servlet.
     * @exception ServletException Description of the Exception
     */
    public void handle(Throwable exception, HttpServletRequest request, HttpServletResponse response)
            throws ServletException {
        // exception handling: convert exception into the error code specified in the proprietary
        // API

        // Several general failures, such as server failure, URL not found and
        // authentication failures are reported by the HTTP transport mechanism itself.

        // unhandled exception: server failure will be reported as HTTP code 500
        // report original exception
        Throwable exceptionToReport = null;
        if (exception instanceof ExceptionBase) {
            ExceptionBase exceptionBase = (ExceptionBase) exception;
            exceptionToReport = exceptionBase.findCause();
        } else {
            exceptionToReport = exception;
        }

        throw new ServletException(exceptionToReport);
    }
}
