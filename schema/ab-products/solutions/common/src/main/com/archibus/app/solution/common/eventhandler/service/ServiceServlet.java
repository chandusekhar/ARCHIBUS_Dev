package com.archibus.app.solution.common.eventhandler.service;

import javax.servlet.ServletException;
import javax.servlet.http.*;

import org.apache.log4j.Logger;

import com.archibus.utility.*;

/**
 * Base class for servlets implementing "Web Services" - like services. Does not handle
 * init/destroy.
 * 
 * @author Valery
 * @created October 26, 2006
 */
public abstract class ServiceServlet extends HttpServlet implements Immutable {
    /**
     * Logger for this class and subclasses
     */
    protected final Logger logger = Logger.getLogger(this.getClass().getName());

    /**
     * Key for the errorHandlerClass value in web.xml
     */
    public final static String ERROR_HANDLER_CLASS = "errorHandlerClass";

    /**
     * Called by the server (via the service method) to allow a servlet to handle a GET request.
     * 
     * @param request An HttpServletRequest object that contains the request the client has made of
     *            the servlet.
     * @param response An HttpServletRequest object that contains the request the client has made of
     *            the servlet.
     * @throws ServletException If the request for the GET could not be handled.
     */
    @Override
    public void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException {
        setRequestCharacterEncoding2UTF8(request);

        this.logger.debug("ServiceServlet.doGet()");

        process(request, response);
    }

    /**
     * Called by the server (via the service method) to allow a servlet to handle a POST request.
     * 
     * @param request An HttpServletRequest object that contains the request the client has made of
     *            the servlet.
     * @param response An HttpServletRequest object that contains the request the client has made of
     *            the servlet.
     * @throws ServletException If the request for the GET could not be handled.
     */
    @Override
    public void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException {
        setRequestCharacterEncoding2UTF8(request);

        this.logger.debug("ServiceServlet.doPost()");

        process(request, response);
    }

    /**
     * Process the request, assemple the response.
     * 
     * @param request An HttpServletRequest object that contains the request the client has made of
     *            the servlet.
     * @param response An HttpServletRequest object that contains the request the client has made of
     *            the servlet.
     * @throws ServletException If the request for the GET could not be handled.
     */
    public void process(HttpServletRequest request, HttpServletResponse response)
            throws ServletException {
        try {
            // TODO Authenticate request
            authenticate(request, response);
            this.logger.debug("Request authenticated");

            doProcess(request, response);

            this.logger.debug("Request processed");
        } catch (ExceptionBase ex) {
            // log exception
            this.logger.error("", ex);

            // exception handling: convert exception into the error code specified in the
            // proprietary API
            handle(ex, request, response);
        }
    }

    /**
     * Authenticate the request.
     * 
     * @param request An HttpServletRequest object that contains the request the client has made of
     *            the servlet.
     * @param response An HttpServletRequest object that contains the request the client has made of
     *            the servlet.
     * @exception ExceptionBase If there is a business logic or infrastructure exception.
     */
    public abstract void authenticate(HttpServletRequest request, HttpServletResponse response)
            throws ExceptionBase;

    /**
     * Process the request, assemple the response.
     * 
     * @param request An HttpServletRequest object that contains the request the client has made of
     *            the servlet.
     * @param response An HttpServletRequest object that contains the request the client has made of
     *            the servlet.
     * @exception ExceptionBase If there is a business logic or infrastructure exception.
     */
    public abstract void doProcess(HttpServletRequest request, HttpServletResponse response)
            throws ExceptionBase;

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
    protected void handle(Throwable exception, HttpServletRequest request,
            HttpServletResponse response) throws ServletException {
        // load exception handling class specified in web.xml
        String errorHandlerClass = this.getInitParameter(ERROR_HANDLER_CLASS);
        // if errorHandlerClass specified, load it and invoke "handle" method
        if (StringUtil.notNull(errorHandlerClass).length() > 0) {
            ErrorHandler errorHandler = null;
            try {
                errorHandler = (ErrorHandler) Class.forName(errorHandlerClass).newInstance();
            } catch (Exception ex1) {
                // log exception
                this.logger.error("", ex1);
                // @non-translatable
                throw new ServletException("Unable to create instance of ErrorHandler", ex1);
            }

            // execute handle method
            errorHandler.handle(exception, request, response);
        } else {
            // errorHandlerClass not specified, do default handling

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

    /**
     * @param request Standard request object
     * @exception ServletException Description of the Exception
     * @throws ExceptionBase
     */
    private static void setRequestCharacterEncoding2UTF8(HttpServletRequest request)
            throws ServletException {
        // encode all parameters' values in "UTF-8" character set font
        try {
            request.setCharacterEncoding("UTF-8");
        } catch (java.io.UnsupportedEncodingException e) {
            // @non-translatable
            throw new ServletException("setCharacterEncoding(UTF-8) failed", e);
        }
    }
}
