package com.archibus.app.common.mobile.security.service.impl;

import org.aopalliance.intercept.MethodInvocation;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.util.Assert;

import com.archibus.config.*;
import com.archibus.context.*;
import com.archibus.context.Context;
import com.archibus.service.interceptor.AbstractInterceptor;
import com.archibus.utility.ExceptionBase;

/**
 * Interceptor that populates the Context with the Core user session. The context must already
 * exist.
 * <p>
 * Used by services that allow non-authenticated user calls and require access to persistence
 * through DataSource, such as IMobileSecurityService. Managed by Spring, has singleton scope.
 * Configured in /WEB-INF/config/context/remoting/mobile/services.xml file.
 *
 * @author Valery Tydykov
 * @since 21.1
 *
 */
public class CoreUserSessionPopulatingContextInterceptor extends AbstractInterceptor implements
InitializingBean {
    /**
     * Property: configManager. Required.
     */
    private ConfigManager.Immutable configManager;

    /**
     * {@inheritDoc}
     * <p>
     * Suppress Warning "PMD.SignatureDeclareThrowsException"
     * <p>
     * Justification: This method implements Spring interface.
     */
    @Override
    @SuppressWarnings({ "PMD.SignatureDeclareThrowsException" })
    public void afterPropertiesSet() throws Exception {
        Assert.notNull(this.configManager, "ConfigManager must be supplied");
    }

    /**
     * Getter for the configManager property.
     *
     * @see configManager
     * @return the configManager property.
     */
    public ConfigManager.Immutable getConfigManager() {
        return this.configManager;
    }

    /** {@inheritDoc} */
    // CHECKSTYLE:OFF Justification: Suppress "Throwing Throwable is not allowed"
    // warning: This method implements Spring interface.
    @Override
    public Object invoke(final MethodInvocation invocation) throws Throwable {
        // CHECKSTYLE:ON
        Object retVal = null;
        // Workaround for Spring 4 bug: Spring intercepts toString method of ProxyFactoryBean on
        // startup, when initializing beans
        final ReturnValues returnValues = workAroundSpring4BugIfToStringCalled(invocation);
        if (returnValues.isProcessed()) {
            retVal = returnValues.getReturnValue();
        } else {
            retVal = process(invocation);
        }

        return retVal;
    }

    /**
     * Process the invocation.
     *
     * @param invocation to be processed.
     * @return return value of the invocation.
     * @throws Throwable if invocation throws an exception.
     */
    // CHECKSTYLE:OFF Justification: Suppress "Throwing Throwable is not allowed"
    // warning: This method must propagate the exception.
    private Object process(final MethodInvocation invocation) throws Throwable {
        // CHECKSTYLE:ON
        final Context context = ContextStore.get();
        final Project.Immutable project = context.getProject();
        // project must exist
        if (project == null) {
            // @non-translatable
            throw new ExceptionBase("Project must be not null in the Context.");
        }

        // set core user session in the Context
        final UserSession.Immutable userSession = project.loadCoreUserSession();
        // core userSession must exist
        if (userSession == null) {
            // @non-translatable
            throw new ExceptionBase("Core user session must be not null in the Project.");
        }

        context.setUserSession(userSession);

        Object retVal;
        try {
            // proceed with normal invocation
            retVal = invocation.proceed();
        } finally {
            // clear user session in the Context
            context.setUserSession(null);
        }
        
        return retVal;
    }

    /**
     * Setter for the configManager property.
     *
     * @see configManager
     * @param configManager the configManager to set
     */

    public void setConfigManager(final ConfigManager.Immutable configManager) {
        this.configManager = configManager;
    }
}
