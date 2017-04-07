package org.springframework.security.providers.ldap.ad.populator;

import junit.framework.*;

/**
 * Uses real LDAP/ActiveDirectory server. {See AbstractLdapIntegrationTests}
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
        suite
            .addTestSuite(org.springframework.security.providers.ldap.ad.populator.ActiveDirectoryAuthoritiesPopulatorTest.class);
        return suite;
    }
}
