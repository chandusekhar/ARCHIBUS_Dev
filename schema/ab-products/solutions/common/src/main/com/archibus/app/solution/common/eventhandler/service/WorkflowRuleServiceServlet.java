package com.archibus.app.solution.common.eventhandler.service;

import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.archibus.config.UserSession;
import com.archibus.context.ContextStore;
import com.archibus.servlet.ServiceHelper;
import com.archibus.utility.ExceptionBase;
import com.archibus.utility.StringUtil;

/**
 * Servlet implementing Service calling a workflow rule.
 * 
 * @author tydykov
 * @created November 1, 2006
 */
public class WorkflowRuleServiceServlet extends ServiceServlet {

    /**
     * Key for the HttpServletRequest value in the Map
     */
    public final static String REQUEST = "request";

    /**
     * Key for the HttpServletResponse value in the Map
     */
    public final static String RESPONSE = "response";

    /**
     * Key for the workflowRuleName value in web.xml
     */
    public final static String WORKFLOW_RULE_NAME = "workflowRuleName";

    /**
     * Key for the authenticationHandler value in web.xml
     */
    public final static String AUTHENTICATION_HANDLER = "authenticationHandler";

    /**
     * Authenticate the request.
     * 
     * @param request An HttpServletRequest object that contains the request the client has made of
     *            the servlet.
     * @param response An HttpServletRequest object that contains the request the client has made of
     *            the servlet.
     * @exception ExceptionBase If there is a business logic or infrastructure exception.
     */
    public void authenticate(HttpServletRequest request, HttpServletResponse response)
            throws ExceptionBase {
        // load authentication handling class specified in web.xml
        String authenticationHandlerClass = this.getAuthenticationHandlerClass();
        // if authenticationHandlerClass specified, load it and invoke "handle"
        // method
        if (StringUtil.notNull(authenticationHandlerClass).length() > 0) {
            AuthenticationHandler authenticationHandler = null;
            try {
                authenticationHandler = (AuthenticationHandler) Class.forName(
                    authenticationHandlerClass).newInstance();
            } catch (Exception ex) {
                // log exception
                this.logger.error("", ex);
                // @non-translatable
                throw new ExceptionBase(null, "Unable to create instance of AuthenticationHandler",
                    ex);
            }

            // execute handle method
            UserSession.Immutable userSession = ContextStore.get().getUserSession();

            authenticationHandler.handle(userSession, request, response);
        } else {
            // authenticationHandlerClass not specified,
            // no authentication
        }
    }

    /**
     * Process the request, assemple the response.
     * 
     * @param request An HttpServletRequest object that contains the request the client has made of
     *            the servlet.
     * @param response An HttpServletRequest object that contains the request the client has made of
     *            the servlet.
     * @exception ExceptionBase If there is a business logic or infrastructure exception.
     */
    public void doProcess(HttpServletRequest request, HttpServletResponse response)
            throws ExceptionBase {
        // prepare rule inputs
        // put HttpServletRequest and HttpServletResponse into context
        Map workflowRuleInputs = new HashMap();
        workflowRuleInputs.put(REQUEST, request);
        workflowRuleInputs.put(RESPONSE, response);

        // exctract URL parameters, add them to inputs
        // for each URL parameter
        for (Enumeration en = request.getParameterNames(); en.hasMoreElements();) {
            String parameterName = (String) en.nextElement();

            workflowRuleInputs.put(parameterName, request.getParameter(parameterName));
        }

        UserSession.Immutable userSession = ContextStore.get().getUserSession();
        // execute the specified rule
        ServiceHelper.runWorkflowRuleInContext(userSession, getWorkflowRuleName(),
            workflowRuleInputs);
    }

    /**
     * Gets the workflowRuleName from the servlet configuration parameter.
     * 
     * @return The workflowRuleName value
     */
    private String getWorkflowRuleName() {
        // get the workflowRuleName from the servlet configuration parameter
        // (specified in web.xml)
        return this.getInitParameter(WORKFLOW_RULE_NAME);
    }

    /**
     * Gets the projectName from the servlet configuration parameter.
     * 
     * @return The projectName value
     */
    private String getAuthenticationHandlerClass() {
        // get the authenticationHandler from the servlet configuration
        // parameter
        // (specified in web.xml)
        return this.getInitParameter(AUTHENTICATION_HANDLER);
    }
}
