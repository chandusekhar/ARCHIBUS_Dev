package com.archibus.app.solution.common.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import com.archibus.security.UserDetailsImpl;
import com.archibus.service.remoting.SecurityService;

/**
 * Integration test for security in ldap/many-to-one configuration. Loads complete ldap
 * configuration, including filters, but invokes SecurityService login/logout methods directly,
 * bypassing filters. To test at the HTTP request/response level, the DWR servlet would need to be
 * configured, which is not trivial.
 *
 * <p>
 * Uses real LDAP/AciveDirectory server. For the real LDAP server, enter url and root in
 * /security/ldap/activedirectory/ldap.properties. Also, enter username and password for the test
 * LDAP account in credentials.xml. Also, enter the expected values in assertions.
 *
 * @author Valery Tydykov
 *
 */
public class LdapIntegrationTest extends com.archibus.fixture.IntegrationTestBase {
    private org.springframework.security.core.Authentication authenticationToken;
    
    SecurityService securityService;
    
    /**
     * @param authenticationToken the authenticationToken to set
     */
    public void setAuthenticationToken(final Authentication authenticationToken) {
        this.authenticationToken = authenticationToken;
    }
    
    /*
     * (non-Javadoc)
     * 
     * @see com.archibus.fixture.ServiceTestBase#onSetUp()
     */
    @Override
    public void onSetUp() throws Exception {
        this.setLogin(false);
        super.onSetUp();
    }
    
    @Override
    protected String[] getConfigLocations() {
        return new String[] { "/context/controls/drawing/controls-drawing.xml",
                "/context/rendering/jsp/filters-chain-rendering.xml",
                "/context/rendering/jsp/filters.xml",
                "/context/rendering/jsp/filters-rendering.xml",
                "/context/security/ldap/activedirectory/security-service.xml",
                "/context/security/ldap/activedirectory/authentication.xml",
                "/context/security/ldap/activedirectory/mapping/many-to-one/account-mapper.xml",
                "/context/security/afm_users/useraccount.xml",
                "/context/core/core-infrastructure.xml", "appContext-test.xml",
                "/com/archibus/security/providers/ldap/ad/credentials.xml",
                "/context/core/password-encryptor.xml" };
    }
    
    public void testAuthenticate() {
        final String password = (String) this.authenticationToken.getCredentials();
        final String username = (String) this.authenticationToken.getPrincipal();
        this.securityService.loginDo(username, password, getProjectId(), null);
        
        Authentication result = SecurityContextHolder.getContext().getAuthentication();
        
        assertTrue(result != null);
        assertEquals(getProjectId(), ((UserDetailsImpl) result.getPrincipal()).getUsername());
        
        this.securityService.logout();
        
        result = SecurityContextHolder.getContext().getAuthentication();
        
        assertEquals(null, result);
    }
    
    /**
     * @return the securityService
     */
    public SecurityService getSecurityService() {
        return this.securityService;
    }
    
    /**
     * @param securityService the securityService to set
     */
    public void setSecurityService(final SecurityService securityService) {
        this.securityService = securityService;
    }
    
    /**
     * @return the authenticationToken
     */
    public Authentication getAuthenticationToken() {
        return this.authenticationToken;
    }
}
