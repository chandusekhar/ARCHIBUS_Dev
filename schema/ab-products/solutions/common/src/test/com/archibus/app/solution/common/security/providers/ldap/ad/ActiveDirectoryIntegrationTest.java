package com.archibus.app.solution.common.security.providers.ldap.ad;

import java.util.Collection;

import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.core.*;

import com.archibus.security.*;
import com.archibus.utility.ExceptionBase;

/**
 * Integration test for activedirectory + afm_users configuration.
 *
 * <p>
 * Uses real LDAP/AciveDirectory server. For the real LDAP server, enter url and root in
 * /security/ldap/activedirectory/ldap.properties. Also, enter username and password for the test
 * LDAP account in credentials.xml. Also, enter the expected values in assertions.
 *
 * @author Valery Tydykov
 *
 */
public class ActiveDirectoryIntegrationTest extends com.archibus.fixture.IntegrationTestBase {
    @Override
    protected void prepareTestInstance() throws Exception {
        this.setDependencyCheck(false);
        this.setLogin(false);

        super.prepareTestInstance();
    }

    private org.springframework.security.authentication.AuthenticationProvider authenticationProvider;

    private Authentication authenticationToken;

    /**
     * @return the authenticationToken
     */
    public Authentication getAuthenticationToken() {
        return this.authenticationToken;
    }

    /**
     * @param authenticationToken the authenticationToken to set
     */
    public void setAuthenticationToken(final Authentication authenticationToken) {
        this.authenticationToken = authenticationToken;
    }

    @Override
    protected String[] getConfigLocations() {
        return new String[] { "/security/ldap/activedirectory/authentication.xml",
                "/security/ldap/activedirectory/mapping/many-to-one/account-mapper.xml",
                "/context/security/afm_users/useraccount.xml",
                "/context/core/core-infrastructure.xml",
                "/com/archibus/security/providers/ldap/ad/credentials.xml" };
    }

    public void testAuthenticate() throws ExceptionBase {
        final Authentication authenticationResult =
                this.getAuthenticationProvider().authenticate(this.authenticationToken);

        final Collection<? extends GrantedAuthority> authorities =
                authenticationResult.getAuthorities();

        assertEquals(1, authorities.size());
        assertEquals("%", ((GrantedAuthority) authorities.toArray()[0]).getAuthority());

        final UserAccount.Immutable userAccount =
                ((UserDetailsImpl) authenticationResult.getPrincipal()).getUserAccount();

        assertEquals("AI", userAccount.getName());
    }

    /**
     * @return the authenticationProvider
     */
    public AuthenticationProvider getAuthenticationProvider() {
        return this.authenticationProvider;
    }

    /**
     * @param authenticationProvider the authenticationProvider to set
     */
    public void setAuthenticationProvider(final AuthenticationProvider authenticationProvider) {
        this.authenticationProvider = authenticationProvider;
    }
}
