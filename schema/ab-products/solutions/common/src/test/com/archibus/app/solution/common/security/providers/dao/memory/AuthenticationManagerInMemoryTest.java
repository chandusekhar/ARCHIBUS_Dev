package com.archibus.app.solution.common.security.providers.dao.memory;

import java.util.Collection;

import org.springframework.security.authentication.*;
import org.springframework.security.core.*;
import org.springframework.test.AbstractDependencyInjectionSpringContextTests;

import com.archibus.utility.ExceptionBase;

/**
 * Tests SecurityService event handler.
 */
public class AuthenticationManagerInMemoryTest extends
AbstractDependencyInjectionSpringContextTests {
    org.springframework.security.authentication.ProviderManager providerManager;
    
    @Override
    protected String[] getConfigLocations() {
        return new String[] { "/com/archibus/app/solution/common/security/providers/dao/memory/authentication.xml" };
    }
    
    public void testAuthenticate() throws ExceptionBase {
        final String userId = "tydykov";
        final String password = "valery";
        final Authentication authentication =
                new UsernamePasswordAuthenticationToken(userId, password);
        final Authentication authenticationResult =
                this.getProviderManager().authenticate(authentication);
        
        final Collection<? extends GrantedAuthority> authorities =
                authenticationResult.getAuthorities();
        
        assertEquals(2, authorities.size());
        assertEquals("ROLE_TELLER", ((GrantedAuthority) authorities.toArray()[1]).getAuthority());
        assertEquals("ROLE_SUPERVISOR",
            ((GrantedAuthority) authorities.toArray()[0]).getAuthority());
    }
    
    public ProviderManager getProviderManager() {
        return this.providerManager;
    }
    
    public void setProviderManager(final ProviderManager providerManager) {
        this.providerManager = providerManager;
    }
}
