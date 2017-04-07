package com.archibus.app.common.mobile.security.service.impl;

import java.lang.reflect.*;

import junit.framework.TestCase;

import org.aopalliance.intercept.MethodInvocation;

import com.archibus.app.common.MockUtilities;
import com.archibus.app.common.util.Callback;
import com.archibus.context.*;
import com.archibus.utility.ExceptionBase;

/**
 * Tests for CoreUserSessionPopulatingContextInterceptor.
 * 
 * @author Valery Tydykov
 * @since 21.1
 * 
 */
public class CoreUserSessionPopulatingContextInterceptorTest extends TestCase {
    private CoreUserSessionPopulatingContextInterceptor coreUserSessionPopulatingContextInterceptor;
    
    /** {@inheritDoc} */
    @Override
    protected void setUp() throws Exception {
        super.setUp();
        
        this.coreUserSessionPopulatingContextInterceptor =
                new CoreUserSessionPopulatingContextInterceptor();
    }
    
    /**
     * Test method for {@link CoreUserSessionPopulatingContextInterceptor#afterPropertiesSet()} .
     */
    public final void testAfterPropertiesSet() {
        // case #1: ConfigManager is not supplied.
        try {
            this.coreUserSessionPopulatingContextInterceptor.afterPropertiesSet();
            fail(MobileSecurityServiceSsoIntegrationTest.EXCEPTION_EXPECTED);
        } catch (final Exception exception) {
            assertEquals("ConfigManager must be supplied", exception.getMessage());
        }
        
        // case #2: ConfigManager is supplied.
        this.coreUserSessionPopulatingContextInterceptor.setConfigManager(MockUtilities
            .createMockConfigManager());
        try {
            this.coreUserSessionPopulatingContextInterceptor.afterPropertiesSet();
        } catch (final Exception exception) {
            fail("Exception is not expected.");
        }
    }
    
    /**
     * Test method for
     * {@link CoreUserSessionPopulatingContextInterceptor#invoke(org.aopalliance.intercept.MethodInvocation)}
     * .
     * 
     * @throws Throwable
     */
    public final void testInvoke() throws Throwable {
        final Context context = new Context();
        ContextStore.set(context);
        
        // case #1: Project is not supplied in the Context.
        try {
            this.coreUserSessionPopulatingContextInterceptor.invoke(null);
            fail(MobileSecurityServiceSsoIntegrationTest.EXCEPTION_EXPECTED);
        } catch (final Throwable exception) {
            assertEquals("Project must be not null in the Context.",
                ((ExceptionBase) exception).getPattern());
        }
        
        // case #2: Project is supplied in the Context.
        context.setConfigManager(MockUtilities.createMockConfigManager());
        context.setProject(MockUtilities.createMockProject(null));
        
        this.coreUserSessionPopulatingContextInterceptor
            .invoke(prepareMethodInvocation(new Callback() {
                
                public Object doWithContext(final Context context) throws ExceptionBase {
                    // verify that UserSession is set in the Context
                    assertEquals("MockUserAccount", context.getUserSession().getUserAccount()
                        .getName());
                    
                    return null;
                }
            }));
        
        // verify that UserSession is cleared in the Context
        assertEquals(null, context.getUserSession());
    }
    
    static MethodInvocation prepareMethodInvocation(final Callback callback) {
        return new MethodInvocation() {
            
            public Object proceed() throws Throwable {
                final Context context = ContextStore.get();
                // do some verification here
                callback.doWithContext(context);
                
                return null;
            }
            
            public Object getThis() {
                return null;
            }
            
            public AccessibleObject getStaticPart() {
                return null;
            }
            
            public Object[] getArguments() {
                return null;
            }
            
            public Method getMethod() {
                return null;
            }
        };
    }
}
