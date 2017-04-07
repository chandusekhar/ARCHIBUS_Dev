package com.archibus.app.solution.common.eventhandler.service;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.archibus.config.ContextCacheable;
import com.archibus.utility.ExceptionBase;

/**
 * Handles authentication in a servlet.
 * 
 * @author tydykov
 * @created November 3, 2006
 */
public class AuthenticationHandler {
    /**
     * Authenticate the request.
     * 
     * @param request An HttpServletRequest object that contains the request the client has made of
     *            the servlet.
     * @param response An HttpServletRequest object that contains the request the client has made of
     *            the servlet.
     * @param context Description of the Parameter
     * @exception ExceptionBase If authentication failed.
     */
    public void handle(ContextCacheable.Immutable context, HttpServletRequest request,
            HttpServletResponse response) throws ExceptionBase {
        // no authentication
    }
}
