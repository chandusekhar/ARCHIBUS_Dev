package com.archibus.app.solution.common.security.ui;

import javax.servlet.http.HttpServletRequest;

import org.apache.log4j.Logger;
import org.springframework.context.*;

import com.archibus.context.*;
import com.archibus.context.utility.*;
import com.archibus.service.remoting.SecurityService;
import com.archibus.utility.ExceptionHandlerBase;

/**
 * Listener for InteractiveAuthenticationSuccessEvent, triggered by the Preauth...Filter. Invokes
 * securityService.startSsoUserSession(), if event was not caused by a CXF Service call or by a DWR
 * call.
 * <p>
 *
 * Required for SSO mode from the browser (browser does not call startSsoUserSession method).
 * SmartClient and mobile client call startSsoUserSession method explicitly.
 * <p>
 * Managed by Spring, has singleton scope. Configured in core-infrastructure.xml file.
 *
 * @author Valery Tydykov
 * @since 20.1
 *
 */
public class AuthenticationSuccessfulEventListener implements ApplicationListener {
    /**
     * Logger for this class and subclasses.
     */
    protected final Logger logger = Logger.getLogger(getClass());

    /** {@inheritDoc} */
    public void onApplicationEvent(final ApplicationEvent event) {
        if (event instanceof org.springframework.security.authentication.event.InteractiveAuthenticationSuccessEvent) {
            final Context context = ContextStore.get();
            // if not a CXF Service call and not a DWR call
            if (!isCxfServiceCall(context) && !isDwrCall(context)) {
                // not a CXF Service call (WebService call from SmartClient or REST service call
                // from mobile client)
                // not a DWR call (from mobile client or from browser client)

                // prepare context
                final SecurityControllerTemplate contextTemplate =
                        new SecurityControllerTemplate(this.logger, true);

                // prepare/cleanup context
                try {
                    contextTemplate.doWithContext(new Callback() {
                        // CHECKSTYLE:OFF Justification: Suppress
                        // "Throwing Throwable is not allowed"
                        // warning: We can not change the signature of this method
                        public Object doWithContext(final Context context) throws Throwable {
                            // CHECKSTYLE:ON
                            invokeStartSsoUserSession(context);

                            return null;
                        }
                    });
                    // CHECKSTYLE:OFF Justification: Suppress "Catching Throwable is not allowed"
                    // warning: We can not let the exception propagate here, it should be reported
                    // and event handling finished
                } catch (final Throwable e) {
                    // CHECKSTYLE:ON
                    // log exception and continue
                    final String errorReport = ExceptionHandlerBase.prepareErrorReport(e);
                    this.logger.error(errorReport);
                }
            }
        }
    }

    /**
     * Returns true if request in the context is a DWR call.
     *
     * @param context current context.
     * @return true if request in the context is a DWR call.
     */
    private boolean isDwrCall(final Context context) {
        final HttpServletRequest request = context.getRequest();
        final String requestURI = request.getRequestURI();

        return requestURI.contains("/dwr/");
    }

    /**
     * Returns true if request in the context is a CXF Service call.
     *
     * @param context current context.
     * @return true if request in the context is a CXF Service call.
     */
    private boolean isCxfServiceCall(final Context context) {
        final HttpServletRequest request = context.getRequest();
        final String requestURI = request.getRequestURI();
        request.getContentType();

        return requestURI.contains("/cxf/");
    }

    /**
     * Invokes securityService.StartSsoUserSession method.
     *
     * @param context to be used to get the securityService bean from.
     */
    private void invokeStartSsoUserSession(final Context context) {
        final SecurityService securityService =
                (SecurityService) context.getBean("securityService");
        securityService.startSsoUserSession();
    }
}
