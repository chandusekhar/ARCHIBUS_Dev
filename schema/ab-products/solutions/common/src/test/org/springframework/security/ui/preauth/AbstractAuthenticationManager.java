package org.springframework.security.ui.preauth;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.*;

/**
 * An abstract implementation of the {@link AuthenticationManager}.
 *
 * @author Wesley Hall
 * @version $Id: AbstractAuthenticationManager.java 2653 2008-02-18 20:18:40Z luke_t $
 */
public abstract class AbstractAuthenticationManager implements AuthenticationManager {
    // ~ Methods
    // ========================================================================================================
    
    /**
     * An implementation of the <code>authenticate</code> method that calls the abstract method
     * <code>doAuthenticatation</code> to do its work.
     * <p>
     * If doAuthenticate throws an <code>AuthenticationException</code> then the exception is
     * populated with the failed <code>Authentication</code> object that failed.
     *
     * @param authRequest the authentication request object
     *
     * @return a fully authenticated object including credentials
     *
     * @throws AuthenticationException if authentication fails
     */
    public final Authentication authenticate(final Authentication authRequest)
            throws AuthenticationException {
        return doAuthentication(authRequest);
    }
    
    /**
     * Concrete implementations of this class override this method to provide the authentication
     * service.
     * <p>
     * The contract for this method is documented in the
     * {@link AuthenticationManager#authenticate(Authentication)}.
     *
     * @param authentication the authentication request object
     *
     * @return a fully authenticated object including credentials
     *
     * @throws AuthenticationException if authentication fails
     */
    protected abstract Authentication doAuthentication(Authentication authentication)
            throws AuthenticationException;
}
