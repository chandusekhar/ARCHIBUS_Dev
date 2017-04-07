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
package org.springframework.security.userdetails.ldap;

import java.util.Collection;

import org.apache.commons.logging.*;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.security.core.*;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.util.Assert;

/**
 * Maps user (loaded from the primary user account repository, e.g. LDAP) to username in secondary
 * user account repository. Tries to find user's authority with name starting with
 * <tt>authorityPrefix</tt>.
 *
 *
 * @author Valery Tydykov
 *
 */
public class AuthorityByPrefixAccountMapper implements AccountMapper, InitializingBean {
    /**
     * Logger for this class and subclasses.
     */
    protected final Log logger = LogFactory.getLog(this.getClass());

    /**
     * Property: Prefix of authority to find.
     */
    private String authorityPrefix;

    @Override
    public void afterPropertiesSet() {
        Assert.hasLength(this.authorityPrefix, "authorityPrefix must be not empty");
    }

    /**
     * Getter for the authorityPrefix property.
     *
     * @see authorityPrefix
     * @return the authorityPrefix property.
     */
    public String getAuthorityPrefix() {
        return this.authorityPrefix;
    }

    @Override
    public String map(final UserDetails user) throws AuthenticationException {
        if (this.logger.isDebugEnabled()) {
            this.logger.debug("Mapping account=[" + user.getUsername()
                    + "]: search authorities for authority prefix=[" + this.getAuthorityPrefix()
                    + "] ");
        }

        // search authorities for authority prefix
        final Collection<? extends GrantedAuthority> authorities = user.getAuthorities();
        for (final GrantedAuthority authority : authorities) {
            if (authority.getAuthority().startsWith(this.getAuthorityPrefix())) {
                if (this.logger.isDebugEnabled()) {
                    this.logger.debug("Authority found=[" + authority + "]");
                }

                return authority.getAuthority();
            }
        }

        // not found
        // TODO message with UserDetails and authorityPrefix?
        throw new AuthorityNotFoundException(null);
    }

    /**
     * Setter for the authorityPrefix property.
     *
     * @see authorityPrefix
     * @param authorityPrefix the authorityPrefix to set
     */

    public void setAuthorityPrefix(final String authorityPrefix) {
        this.authorityPrefix = authorityPrefix;
    }
}
