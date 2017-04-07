package com.archibus.app.solution.common.security;

import junit.framework.Test;
import junit.framework.TestCase;
import junit.framework.TestSuite;

/**
 * Integration tests for activedirectory configurations.
 * 
 * <p>
 * Uses real LDAP/ActiveDirectory server.
 * <p>
 * (See ActiveDirectoryAuthorityByPrefixIntegrationTest).
 * <p>
 * (See AbstractLdapIntegrationTests}
 * 
 * @author Valery Tydykov
 * 
 */
public class AllTestsRealServer extends TestCase {

    public AllTestsRealServer(String s) {
        super(s);
    }

    public static Test suite() {
        TestSuite suite = new TestSuite();
        suite.addTest(com.archibus.app.solution.common.security.providers.ldap.ad.AllTestsRealServer
            .suite());
        suite.addTest(org.springframework.security.AllTestsRealServer.suite());
        suite.addTestSuite(com.archibus.app.solution.common.security.LdapIntegrationTest.class);
        return suite;
    }
}
