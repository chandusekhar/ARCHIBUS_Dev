package com.archibus.app.solution.common.security.ui;

import javax.servlet.http.HttpServletRequest;

import org.aopalliance.intercept.MethodInvocation;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.security.ui.preauth.AuthenticationDetailsImpl;
import org.springframework.util.Assert;

import com.archibus.config.Project;
import com.archibus.context.*;
import com.archibus.context.utility.SecurityControllerTemplate;
import com.archibus.service.interceptor.AbstractInterceptor;

/**
 * Populates context with values from AuthenticationDetails. Intercepts calls to
 * AttributesSourceWebAuthenticationDetailsSource.buildDetails; after buildDetails method returns
 * AuthenticationDetailsImpl object, gets and sets project and sessionId in the context.
 *
 * @author Valery Tydykov
 *
 */
public class ContextPopulatingInterceptor extends AbstractInterceptor implements InitializingBean {
    private String projectIdKey;

    /**
     * Check that all required properties have been set.
     *
     * <p>
     * Suppress PMD warning "SignatureDeclareThrowsException".
     * <p>
     * Justification: this method is declared in Spring API.
     */
    @Override
    @SuppressWarnings("PMD.SignatureDeclareThrowsException")
    public void afterPropertiesSet() throws Exception {
        Assert.hasText(this.projectIdKey, "projectIdKey must not be empty");
    }

    /**
     * @return the projectIdKey
     */
    public String getProjectIdKey() {
        return this.projectIdKey;
    }

    @Override
    public Object invoke(final MethodInvocation invocation) throws Throwable {
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
        // proceed with normal invocation
        retVal = invocation.proceed();
        // populate context
        final HttpServletRequest request = (HttpServletRequest) invocation.getArguments()[0];

        Assert.isInstanceOf(AuthenticationDetailsImpl.class, retVal);
        final AuthenticationDetailsImpl authenticationDetails = (AuthenticationDetailsImpl) retVal;

        // Populates context with values from AuthenticationDetails.
        populateContext(request, authenticationDetails);

        return retVal;
    }

    /**
     * @param projectIdKey the projectIdKey to set
     */
    public void setProjectIdKey(final String projectIdKey) {
        this.projectIdKey = projectIdKey;
    }

    private void populateContext(final HttpServletRequest request,
            final AuthenticationDetailsImpl authenticationDetails) {
        // set project and sessionId in the context
        final Context context = ContextStore.get();

        final String projectId =
                (String) authenticationDetails.getAttributes().get(this.getProjectIdKey());

        Assert.hasLength(projectId, "projectId must not be empty");

        if (this.logger.isDebugEnabled()) {
            this.logger.debug("Using project=[" + projectId + "]");
        }

        final Project.Immutable project =
                SecurityControllerTemplate.findProject(context.getConfigManager(), projectId);

        Assert.notNull(project, "project not found");
        Assert.notNull(project.isOpen(), "project must be open");

        // set project in the context
        context.setProject(project);

        final String sessionId = request.getSession().getId();
        Assert.hasLength(sessionId, "sessionId must be not empty");

        // set sessionId in the context
        context.getSession().setId(sessionId);
    }
}
