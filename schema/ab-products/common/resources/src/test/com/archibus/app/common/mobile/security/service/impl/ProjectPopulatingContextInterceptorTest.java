package com.archibus.app.common.mobile.security.service.impl;

import junit.framework.TestCase;

import com.archibus.app.common.MockUtilities;
import com.archibus.app.common.util.Callback;
import com.archibus.config.*;
import com.archibus.context.*;
import com.archibus.context.Context;
import com.archibus.utility.ExceptionBase;

/**
 * Tests for ProjectPopulatingContextInterceptor.
 * 
 * @author Valery Tydykov
 * @since 21.1
 * 
 */
public class ProjectPopulatingContextInterceptorTest extends TestCase {
    private ProjectPopulatingContextInterceptor projectPopulatingContextInterceptor;
    
    /** {@inheritDoc} */
    @Override
    protected void setUp() throws Exception {
        super.setUp();
        
        this.projectPopulatingContextInterceptor = new ProjectPopulatingContextInterceptor();
    }
    
    /**
     * Test method for {@link ProjectPopulatingContextInterceptor#afterPropertiesSet()}.
     */
    public final void testAfterPropertiesSet() {
        // case #1: ConfigManager is not supplied.
        try {
            this.projectPopulatingContextInterceptor.afterPropertiesSet();
            fail(MobileSecurityServiceSsoIntegrationTest.EXCEPTION_EXPECTED);
        } catch (final Exception exception) {
            assertEquals("ConfigManager must be supplied", exception.getMessage());
        }
        
        // case #2: projectId is not supplied.
        try {
            this.projectPopulatingContextInterceptor.setConfigManager(MockUtilities
                .createMockConfigManager());
            this.projectPopulatingContextInterceptor.afterPropertiesSet();
            fail(MobileSecurityServiceSsoIntegrationTest.EXCEPTION_EXPECTED);
        } catch (final Exception exception) {
            assertEquals("projectId must be supplied", exception.getMessage());
        }
        
        // case #3: Both ConfigManager and projectId are supplied.
        try {
            this.projectPopulatingContextInterceptor.setConfigManager(MockUtilities
                .createMockConfigManager());
            this.projectPopulatingContextInterceptor.setProjectId("SomeProjectId");
            this.projectPopulatingContextInterceptor.afterPropertiesSet();
        } catch (final Exception exception) {
            fail("Exception is not expected.");
        }
    }
    
    /**
     * Test method for
     * {@link ProjectPopulatingContextInterceptor#invoke(org.aopalliance.intercept.MethodInvocation)}
     * .
     * 
     * @throws Throwable
     */
    public final void testInvoke() throws Throwable {
        final Context context = new Context();
        ContextStore.set(context);
        
        final ConfigManager.Immutable configManager = MockUtilities.createMockConfigManager();
        context.setConfigManager(configManager);
        this.projectPopulatingContextInterceptor.setConfigManager(configManager);
        
        // case #1: ProjectId does not match any projects.
        try {
            this.projectPopulatingContextInterceptor.invoke(null);
            fail(MobileSecurityServiceSsoIntegrationTest.EXCEPTION_EXPECTED);
        } catch (final Throwable exception) {
            assertEquals("ProjectId does not match any projects",
                ((ExceptionBase) exception).getPattern());
        }
        
        // case #2: ProjectId matches a project.
        this.projectPopulatingContextInterceptor.setProjectId("ExistingProjectId");
        
        this.projectPopulatingContextInterceptor
            .invoke(CoreUserSessionPopulatingContextInterceptorTest
                .prepareMethodInvocation(new Callback() {
                    
                    public Object doWithContext(final Context context) throws ExceptionBase {
                        // verify that Project is set in the Context
                        assertEquals("ExistingProjectId", context.getProject().getName());
                        
                        return null;
                    }
                }));
        
        // verify that Project is cleared in the Context
        assertEquals(null, context.getProject());
    }
    
    /**
     * Test method for
     * {@link ProjectPopulatingContextInterceptor#findFirstActiveOrSpecifiedProject()} .
     */
    public final void testfindFirstActiveOrSpecifiedProject() {
        final ConfigManager.Immutable configManager = MockUtilities.createMockConfigManager();
        
        // case #1: ProjectId does not match any projects.
        try {
            ProjectPopulatingContextInterceptor.findFirstActiveOrSpecifiedProject(configManager,
                "JUNK");
            fail(MobileSecurityServiceSsoIntegrationTest.EXCEPTION_EXPECTED);
        } catch (final Throwable exception) {
            assertEquals("ProjectId does not match any projects",
                ((ExceptionBase) exception).getPattern());
        }
        
        // case #2: FirstActiveProject specified and there are no active projects.
        try {
            ProjectPopulatingContextInterceptor.findFirstActiveOrSpecifiedProject(configManager,
                "FirstActiveProject");
            fail(MobileSecurityServiceSsoIntegrationTest.EXCEPTION_EXPECTED);
        } catch (final Throwable exception) {
            assertEquals("No active projects specified.", ((ExceptionBase) exception).getPattern());
        }
        
        // case #3: ProjectId matches a project.
        final Project.Immutable project =
                this.projectPopulatingContextInterceptor.findFirstActiveOrSpecifiedProject(
                    configManager, "ExistingProjectId");
        assertEquals("ExistingProjectId", project.getName());
        
    }
}
