package org.springframework.security.ui.preauth;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.*;

/**
 * Simply accepts as valid whatever is passed to it, if <code>grantAccess</code> is set to
 * <code>true</code>.
 *
 * @author Ben Alex
 * @author Wesley Hall
 * @version $Id: MockAuthenticationManager.java 1496 2006-05-23 13:38:33Z benalex $
 */
public class MockAuthenticationManager extends AbstractAuthenticationManager {
    // ~ Instance fields
    // ================================================================================================
    
    private boolean grantAccess = true;
    
    // ~ Constructors
    // ===================================================================================================
    
    public MockAuthenticationManager(final boolean grantAccess) {
        this.grantAccess = grantAccess;
    }
    
    public MockAuthenticationManager() {
        super();
    }
    
    // ~ Methods
    // ========================================================================================================
    
    public Authentication doAuthentication(final Authentication authentication)
            throws AuthenticationException {
        if (this.grantAccess) {
            return authentication;
        } else {
            throw new BadCredentialsException("MockAuthenticationManager instructed to deny access");
        }
    }
}
