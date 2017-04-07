package com.archibus.app.common.mobile.security.service.impl;

import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.util.Assert;

import com.archibus.security.UserAccount.ThreadSafe;
import com.archibus.security.*;
import com.archibus.service.remoting.SecurityServiceImpl;
import com.archibus.utility.ExceptionBase;

/**
 * Utilities for MobileSecurityService. Provides methods for checking configuration, authentication.
 * <p>
 *
 * @author Valery Tydykov
 * @since 21.1
 *
 */
final class MobileSecurityServiceUtilities {

    /**
     * Constant: "preauth".
     */
    private static final String PREAUTH = "preauth";

    /**
     * Private default constructor: utility class is non-instantiable.
     */
    private MobileSecurityServiceUtilities() {
    }

    /**
     * Checks securityConfiguration. Throws exception if securityConfiguration contains "preauth".
     *
     * @param securityConfigurationName name of the security configuration.
     */
    static void checkSecurityConfiguration(final String securityConfigurationName) {
        if (securityConfigurationName.contains(PREAUTH)) {
            // @non-translatable
            final String errorMessage =
                    String.format("Invalid configuration: configuration [%s] is 'preauth'.",
                        securityConfigurationName);
            throw new ExceptionBase(errorMessage);
        }
    }

    /**
     * Authenticates user if in non-SSO configuration, or gets existing Authentication from Spring
     * SecurityContext otherwise.
     *
     * @param username of the user to be authenticated. Used in non-SSO configuration.
     * @param password of the user to be authenticated. Used in non-SSO configuration.
     * @param securityConfigurationName name of the security configuration.
     * @param authenticationManager to be used to authenticate user. Used in non-SSO configuration.
     * @return UserAccount for the authenticated user.
     */
    static com.archibus.security.UserAccount.ThreadSafe authenticate(final String username,
            final String password, final String securityConfigurationName,
            final AuthenticationManager authenticationManager) {
        final Authentication authentication =
                authenticateAndReturnAuthentication(username, password, securityConfigurationName,
                    authenticationManager);

        final UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Assert.notNull(userDetails, "userDetails must be supplied in Authentication");

        final com.archibus.security.UserAccount.ThreadSafe userAccount =
                (ThreadSafe) userDetails.getUserAccount();
        Assert.notNull(userAccount, "userAccount must be supplied in UserDetailsImpl");

        return userAccount;
    }

    /**
     * Prepares Authentication. Authenticates user if in non-SSO configuration, or gets existing
     * Authentication from Spring SecurityContext otherwise.
     *
     * @param username of the user to be authenticated. Used in non-SSO configuration.
     * @param password of the user to be authenticated. Used in non-SSO configuration.
     * @param securityConfigurationName name of the security configuration.
     * @param authenticationManager to be used to authenticate user. Used in non-SSO configuration.
     * @return authentication for the user.
     */
    static Authentication authenticateAndReturnAuthentication(final String username,
            final String password, final String securityConfigurationName,
            final AuthenticationManager authenticationManager) {
        Authentication authentication;
        if (securityConfigurationName.contains(PREAUTH)) {
            // SSO configuration, user is already authenticated; no username, no password supplied
            // get authentication from Spring SecurityContext
            authentication = SecurityServiceImpl.getAuthenticationFromContext();
        } else {
            // non-SSO configuration, user is not authenticated
            // authenticate user
            final UsernamePasswordAuthenticationToken authRequest =
                    new UsernamePasswordAuthenticationToken(username, password);
            authentication = authenticationManager.authenticate(authRequest);
        }
        Assert.notNull(authentication, "authentication must be not null");

        return authentication;
    }

}