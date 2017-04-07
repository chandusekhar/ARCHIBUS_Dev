package com.archibus.app.solution.common.security;

import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.ui.preauth.UsernameSource;

import com.archibus.fixture.SpringContextTestBase;

/**
 * Integration test for preauth/username-source/remote-user configuration.
 * 
 * @author Valery Tydykov
 * 
 */
public class PreauthRequestParameterUsernameSourceIntegrationTest extends SpringContextTestBase {
    UsernameSource usernameSource;
    
    @Override
    protected String[] getConfigLocations() {
        return new String[] { "/context/security/preauth/username-source/remote-user/username-source.xml" };
    }
    
    public void testObtainUsernameRequestParameter() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRemoteUser("AI");
        String username = this.usernameSource.obtainUsername(request);
        
        assertEquals("AI", username);
    }
    
    /**
     * @return the usernameSource
     */
    public UsernameSource getUsernameSource() {
        return this.usernameSource;
    }
    
    /**
     * @param usernameSource the usernameSource to set
     */
    public void setUsernameSource(UsernameSource usernameSource) {
        this.usernameSource = usernameSource;
    }
}
