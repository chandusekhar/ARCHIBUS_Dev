package org.springframework.security.providers.ldap.ad.authenticator;

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
            .addTestSuite(org.springframework.security.providers.ldap.ad.authenticator.ActiveDirectoryBindAuthenticatorTest.class);
        return suite;
    }
}
