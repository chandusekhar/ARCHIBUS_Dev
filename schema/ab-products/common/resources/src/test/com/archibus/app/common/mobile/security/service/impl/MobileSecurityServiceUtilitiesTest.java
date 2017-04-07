package com.archibus.app.common.mobile.security.service.impl;

import java.util.*;

import junit.framework.TestCase;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.*;
import org.springframework.security.core.context.*;

import com.archibus.security.*;
import com.archibus.utility.ExceptionBase;

/**
 * Tests for MobileSecurityServiceUtilities.
 *
 * @author Valery Tydykov
 * @since 21.1
 *
 */
public class MobileSecurityServiceUtilitiesTest extends TestCase {

    /**
     * Test method for
     * {@link MobileSecurityServiceUtilities#checkSecurityConfiguration(java.lang.String)} .
     */
    public final void testCheckSecurityConfiguration() {
        {
            // case #1: security configuration does not name contain "preauth"
            MobileSecurityServiceUtilities.checkSecurityConfiguration("JUNK");
        }

        {
            try {
                // case #2: security configuration name contains "preauth"
                MobileSecurityServiceUtilities.checkSecurityConfiguration("JUNKpreauthJUNK");
                fail("Exception expected");
            } catch (final ExceptionBase exception) {
                assertEquals(
                    "Invalid configuration: configuration [JUNKpreauthJUNK] is 'preauth'.",
                    exception.getPattern());
            }
        }
    }

    /**
     * Test method for {@link MobileSecurityServiceUtilities#authenticateAndReturnAuthentication()}
     * .
     */
    public final void testAuthenticateAndReturnAuthentication() {
        // case #1: security configuration name contains "preauth"
        {
            Authentication expected = null;
            {
                final SecurityContext securityContext = SecurityContextHolder.getContext();
                expected = new Authentication() {

                    public String getName() {
                        // TODO Auto-generated method stub
                        return null;
                    }

                    public void setAuthenticated(final boolean isAuthenticated)
                            throws IllegalArgumentException {
                        // TODO Auto-generated method stub

                    }

                    public boolean isAuthenticated() {
                        // TODO Auto-generated method stub
                        return false;
                    }

                    public Object getPrincipal() {
                        // TODO Auto-generated method stub
                        return null;
                    }

                    public Object getDetails() {
                        // TODO Auto-generated method stub
                        return null;
                    }

                    public Object getCredentials() {
                        // TODO Auto-generated method stub
                        return null;
                    }

                    public Collection<? extends GrantedAuthority> getAuthorities() {
                        // TODO Auto-generated method stub
                        return null;
                    }
                };
                securityContext.setAuthentication(expected);
            }

            final Authentication actual =
                    MobileSecurityServiceUtilities.authenticateAndReturnAuthentication(null, null,
                        "JUNKpreauthJUNK", null);

            assertEquals(expected, actual);
        }

        // case #2: security configuration name does not contain "preauth"
        {
            final AuthenticationManager authenticationManager = new AuthenticationManager() {
                public Authentication authenticate(final Authentication authentication)
                        throws AuthenticationException {
                    assertEquals("TestUsername", authentication.getPrincipal());
                    assertEquals("TestPassword", authentication.getCredentials());

                    return authentication;
                }
            };
            final Authentication actual =
                    MobileSecurityServiceUtilities.authenticateAndReturnAuthentication(
                        "TestUsername", "TestPassword", "TestSecurityConfigurationName",
                        authenticationManager);

            assertEquals("TestUsername", actual.getPrincipal());
            assertEquals("TestPassword", actual.getCredentials());
        }
    }

    /**
     * Test method for {@link MobileSecurityServiceUtilities#authenticate()} .
     */
    public final void testAuthenticate() {
        // case #1: security configuration name contains "preauth"
        {
            final UserAccountImpl expected = new UserAccountImpl();

            final Authentication authentication = prepareAuthentication(expected);
            {
                final SecurityContext securityContext = SecurityContextHolder.getContext();
                securityContext.setAuthentication(authentication);
            }

            final com.archibus.security.UserAccount.ThreadSafe actual =
                    MobileSecurityServiceUtilities
                    .authenticate(null, null, "JUNKpreauthJUNK", null);

            assertEquals(expected, actual);
        }

        // case #2: security configuration name does not contain "preauth"
        {
            final UserAccountImpl expected = new UserAccountImpl();

            final AuthenticationManager authenticationManager = new AuthenticationManager() {
                public Authentication authenticate(final Authentication authentication)
                        throws AuthenticationException {
                    assertEquals("TestUsername", authentication.getPrincipal());
                    assertEquals("TestPassword", authentication.getCredentials());

                    return prepareAuthentication(expected);
                }
            };

            final com.archibus.security.UserAccount.ThreadSafe actual =
                    MobileSecurityServiceUtilities.authenticate("TestUsername", "TestPassword",
                        "TestSecurityConfigurationName", authenticationManager);

            assertEquals(expected, actual);
        }
    }

    private Authentication prepareAuthentication(final UserAccountImpl expected) {
        return new Authentication() {

            public String getName() {
                // TODO Auto-generated method stub
                return null;
            }

            public void setAuthenticated(final boolean isAuthenticated)
                    throws IllegalArgumentException {
                // TODO Auto-generated method stub

            }

            public boolean isAuthenticated() {
                // TODO Auto-generated method stub
                return false;
            }

            public Object getPrincipal() {
                final UserDetailsImpl userDetails =
                        new UserDetailsImpl("TestName", "TestPassword", false, false, false, false,
                            Collections.EMPTY_SET);
                userDetails.setUserAccount(expected);

                return userDetails;
            }

            public Object getDetails() {
                // TODO Auto-generated method stub
                return null;
            }

            public Object getCredentials() {
                // TODO Auto-generated method stub
                return null;
            }

            public Collection<? extends GrantedAuthority> getAuthorities() {
                // TODO Auto-generated method stub
                return null;
            }
        };
    }
}
