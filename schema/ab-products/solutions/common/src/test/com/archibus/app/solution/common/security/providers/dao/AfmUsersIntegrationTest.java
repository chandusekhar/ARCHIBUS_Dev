package com.archibus.app.solution.common.security.providers.dao;

import java.util.Collection;

import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.core.*;

import com.archibus.security.*;
import com.archibus.utility.ExceptionBase;

/**
 * Integration test for afm_users configuration.
 *
 * <p>
 * Enter username and password for the test afm_users account in credentials.xml. Also, enter the
 * expected values in assertions.
 *
 * @author Valery Tydykov
 *
 */
public class AfmUsersIntegrationTest extends com.archibus.fixture.IntegrationTestBase {
    @Override
    protected void prepareTestInstance() throws Exception {
        this.setDependencyCheck(false);
        
        super.prepareTestInstance();
    }
    
    private AuthenticationProvider authenticationProvider;
    
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
        return new String[] { "/context/security/afm_users/authentication.xml",
                "/context/security/afm_users/useraccount.xml",
                "/context/security/afm_users/password-encoder/archibus/password-encoder.xml",
                "/context/core/core-infrastructure.xml", "appContext-test.xml",
                "/com/archibus/app/solution/common/security/providers/dao/credentials.xml" };
    }
    
    public void testAuthenticate() throws ExceptionBase {
        final Authentication authenticationResult =
                this.getAuthenticationProvider().authenticate(this.authenticationToken);
        
        final Collection<? extends GrantedAuthority> authorities =
                authenticationResult.getAuthorities();
        
        assertEquals(15, authorities.size());
        assertEquals("%", ((GrantedAuthority) authorities.toArray()[0]).getAuthority());
        
        final UserAccount.Immutable userAccount =
                ((UserDetailsImpl) authenticationResult.getPrincipal()).getUserAccount();
        
        assertEquals("AFM", userAccount.getName());
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
