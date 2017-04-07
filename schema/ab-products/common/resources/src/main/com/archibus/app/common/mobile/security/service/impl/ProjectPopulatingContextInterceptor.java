package com.archibus.app.common.mobile.security.service.impl;

import org.aopalliance.intercept.MethodInvocation;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.util.Assert;

import com.archibus.config.*;
import com.archibus.context.Context;
import com.archibus.context.utility.*;
import com.archibus.service.interceptor.AbstractInterceptor;
import com.archibus.utility.ExceptionBase;

/**
 * Interceptor that populates Context with specified Project. Context must already exist. The
 * specified projectId must exist in the ConfigManager.
 *
 * Used by services that assume that the Project is already in the Context, such as
 * IMobileSecurityService. Managed by Spring, has singleton scope. Configured in
 * /WEB-INF/config/context/remoting/mobile/services.xml file.
 *
 * @author Valery Tydykov
 * @since 21.1
 *
 */
public class ProjectPopulatingContextInterceptor extends AbstractInterceptor implements
        InitializingBean {
    /**
     * Property: configManager. Required.
     */
    private ConfigManager.Immutable configManager;
    
    /**
     * Property: projectId. Required.
     */
    private String projectId;
    
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
        Assert.hasText(this.projectId, "projectId must be supplied");
    }
    
    /**
     * @return the configManager
     */
    public ConfigManager.Immutable getConfigManager() {
        return this.configManager;
    }
    
    /**
     * Getter for the projectId property.
     *
     * @see projectId
     * @return the projectId property.
     */
    public String getProjectId() {
        return this.projectId;
    }
    
    // CHECKSTYLE:OFF Justification: Suppress "Throwing Throwable is not allowed"
    // warning: This method implements Spring interface.
    @Override
    public Object invoke(final MethodInvocation invocation) throws Throwable {
        // CHECKSTYLE:ON
        Object retVal = null;
        
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
        Object retVal;
        final Project.Immutable project =
                findFirstActiveOrSpecifiedProject(this.configManager, this.projectId);
        
        // set project in the Context
        final ContextTemplate contextTemplate = new ContextTemplate();
        final Context context = contextTemplate.getContext();
        context.setProject(project);
        
        try {
            final MethodInvocation invocationArg = invocation;
            // prepare/cleanup context
            retVal = contextTemplate.doWithContext(new Callback() {
                // CHECKSTYLE:OFF Justification: Suppress "Throwing Throwable is not allowed"
                // warning: This method implements an interface.
                @Override
                public Object doWithContext(final Context context) throws Throwable {
                    // CHECKSTYLE:ON
                    
                    // proceed with normal invocation
                    return invocationArg.proceed();
                }
            });
            
        } finally {
            // clear project in the Context
            context.setProject(null);
        }

        return retVal;
    }
    
    /**
     * Finds first active or specified by projectId project.
     *
     * @param configManager which contains all projects.
     * @param projectId "FirstActiveProject" or projectId of one of the active projects in
     *            configManager.
     * @return project if found; throw ExceptionBase otherwise.
     */
    static Project.Immutable findFirstActiveOrSpecifiedProject(
            final ConfigManager.Immutable configManager, final String projectId) {
        Project.Immutable project;
        // If value of projectId is "FirstActiveProject":
        if ("FirstActiveProject".equals(projectId)) {
            // Try to find first active project
            project = configManager.findFirstActiveProject();
            // project must exist
            if (project == null) {
                // @non-translatable
                throw new ExceptionBase("No active projects specified.");
            }
        } else {
            project = SecurityControllerTemplate.findProject(configManager, projectId);
            // project must exist
            if (project == null) {
                // @non-translatable
                throw new ExceptionBase("ProjectId does not match any projects");
            }
        }
        
        Assert.notNull(project, "project must be not null");
        return project;
    }
    
    /**
     * @param configManager the configManager to set
     */
    public void setConfigManager(final ConfigManager.Immutable configManager) {
        this.configManager = configManager;
    }
    
    /**
     * Setter for the projectId property.
     *
     * @see projectId
     * @param projectId the projectId to set
     */
    
    public void setProjectId(final String projectId) {
        this.projectId = projectId;
    }
}
