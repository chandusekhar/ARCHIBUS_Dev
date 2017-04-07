/*
 * Copyright 2004, 2005, 2006 Acegi Technology Pty Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing permissions and limitations under
 * the License.
 */
package org.springframework.security.ui.preauth;

import javax.servlet.http.HttpServletRequest;

import org.springframework.security.web.authentication.preauth.AbstractPreAuthenticatedProcessingFilter;
import org.springframework.util.Assert;

/**
 * Flexible pre-authenticated filter which obtains username and other values supplied in the request
 * (in headers, or in cookies, or in HttpServletRequest.getRemoteUser()), for use with SSO systems.
 * <p>
 * Has additional <tt>usernameSource</tt> property.
 * <p>
 * Will create Authentication object (and attach it to the SecurityContextHolder), if such object
 * does not exist yet.
 * <p>
 * As with most pre-authenticated scenarios, it is essential that the external authentication system
 * is set up correctly as this filter does no authentication whatsoever. All the protection is
 * assumed to be provided externally and if this filter is included inappropriately in a
 * configuration, it would be possible to assume the identity of a user merely by setting the
 * correct header name. This also means it should not be used in combination with other Spring
 * Security authentication mechanisms such as form login, as this would imply there was a means of
 * bypassing the external system which would be risky.
 * <p>
 *
 * @author Valery Tydykov
 */
public class UsernameSourcePreAuthenticatedProcessingFilter
        extends AbstractPreAuthenticatedProcessingFilter {
    /**
     * Property: Source of username.
     */
    private UsernameSource usernameSource;

    @Override
    public void afterPropertiesSet() {
        super.afterPropertiesSet();

        Assert.notNull(this.usernameSource, "usernameSource must be set");
    }

    /**
     * Getter for the usernameSource property.
     *
     * @see usernameSource
     * @return the usernameSource property.
     */
    public UsernameSource getUsernameSource() {
        return this.usernameSource;
    }

    /**
     * Setter for the usernameSource property.
     *
     * @see usernameSource
     * @param usernameSource the usernameSource to set.
     */
    public void setUsernameSource(final UsernameSource usernameSource) {
        this.usernameSource = usernameSource;
    }

    @Override
    protected Object getPreAuthenticatedCredentials(final HttpServletRequest request) {
        // no password - user is already authenticated
        return "NONE";
    }

    @Override
    protected Object getPreAuthenticatedPrincipal(final HttpServletRequest request) {
        // obtain username from request
        final String username = this.usernameSource.obtainUsername(request);

        return username;
    }
}
