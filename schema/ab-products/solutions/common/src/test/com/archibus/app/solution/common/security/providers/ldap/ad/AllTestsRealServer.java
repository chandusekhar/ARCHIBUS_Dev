package com.archibus.app.solution.common.security.providers.ldap.ad;

import junit.framework.*;

/**
 * Integration tests for activedirectory configurations.
 * 
 * <p>
 * Uses real LDAP/AciveDirectory server. (See ActiveDirectoryAuthorityByPrefixIntegrationTest).
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
        // TODO fails, configure ActiveDirectory account with security group prefix Afm
        // suite.addTestSuite(com.archibus.app.solution.common.security.providers.ldap.ad.ActiveDirectoryAuthorityByPrefixIntegrationTest.class);
        suite
            .addTestSuite(com.archibus.app.solution.common.security.providers.ldap.ad.ActiveDirectoryIntegrationTest.class);
        return suite;
    }
}
