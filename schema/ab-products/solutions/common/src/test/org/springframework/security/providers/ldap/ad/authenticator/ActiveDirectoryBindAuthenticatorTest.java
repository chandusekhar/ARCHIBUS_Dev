package org.springframework.security.providers.ldap.ad.authenticator;

import org.springframework.security.core.*;
import org.springframework.security.ldap.AbstractLdapIntegrationTests;
import org.springframework.security.ldap.authentication.BindAuthenticator;
import org.springframework.security.ldap.search.LdapUserSearch;

/**
 * Integration tests for ActiveDirectoryBindAuthenticator.
 * <p>
 * Uses real LDAP/ActiveDirectory server. {See AbstractLdapIntegrationTests}
 *
 * @author Valery Tydykov
 *
 */
public class ActiveDirectoryBindAuthenticatorTest extends AbstractLdapIntegrationTests {
    private BindAuthenticator authenticator;

    private Authentication bob;

    private LdapUserSearch userSearch;

    @Override
    protected void setUp() throws Exception {
        super.setUp();

        this.bob = getUsernamePasswordAuthenticationToken();

        this.userSearch = (LdapUserSearch) appContext.getBean("userSearch");
    }

    @Override
    protected void tearDown() throws Exception {
        this.authenticator = null;

        super.tearDown();
    }

    /**
     * Test method for
     * {@link org.springframework.security.providers.ldap.ad.authenticator.ActiveDirectoryBindAuthenticator#authenticate(org.springframework.security.Authentication)}
     * .
     */
    public void testAuthenticateAuthentication() {
        this.authenticator = new BindAuthenticator(getContextSource());
        this.authenticator.setMessageSource(new SpringSecurityMessageSource());
        this.authenticator.setUserSearch(this.userSearch);

        this.authenticator.authenticate(this.bob);
    }

    public LdapUserSearch getUserSearch() {
        return this.userSearch;
    }

    public void setUserSearch(final LdapUserSearch userSearch) {
        this.userSearch = userSearch;
    }
}
