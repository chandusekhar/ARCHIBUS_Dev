package com.archibus.app.solution.common.security;

import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.ui.preauth.*;

import com.archibus.fixture.SpringContextTestBase;

/**
 * Integration test for preauth/username-source/request-parameter configuration.
 * 
 * @author Valery Tydykov
 * 
 */
public class PreauthRemoteUserUsernameSourceIntegrationTest extends SpringContextTestBase {
    UsernameSource usernameSource;
    
    @Override
    protected String[] getConfigLocations() {
        return new String[] { "/context/security/preauth/username-source/request-parameter/username-source.xml" };
    }
    
    public void testObtainUsernameRequestParameter() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addParameter("username", "AI");
        request.setMethod("POST");
        request.addHeader(RequestParameterUsernameSource.REFERER,
            "http://server1.domain.local/login.do");
        
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
