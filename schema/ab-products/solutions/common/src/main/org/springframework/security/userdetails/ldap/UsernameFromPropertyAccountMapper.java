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

import org.apache.commons.logging.*;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.util.Assert;

/**
 * Maps user (loaded from the primary user account repository, e.g. LDAP) to username in secondary
 * user account repository. Maps all users to the same <tt>username</tt>.
 *
 *
 * @author Valery Tydykov
 *
 */
public class UsernameFromPropertyAccountMapper implements AccountMapper, InitializingBean {
    /**
     * Logger for this class and subclasses.
     */
    protected final Log logger = LogFactory.getLog(this.getClass());

    /**
     * Property: Single username to map to.
     */
    private String username;

    @Override
    public void afterPropertiesSet() {
        Assert.hasLength(this.username, "userName must be not empty");
    }

    /**
     * Getter for the username property.
     *
     * @see username
     * @return the username property.
     */
    public String getUsername() {
        return this.username;
    }

    @Override
    public String map(final UserDetails user) throws AuthenticationException {
        if (this.logger.isDebugEnabled()) {
            this.logger.debug("Mapping account=[" + user.getUsername() + "] to account=["
                    + this.getUsername() + "]");
        }

        // map all users to the same userName
        return this.username;
    }

    /**
     * Setter for the username property.
     *
     * @see username
     * @param username the username to set.
     */
    public void setUsername(final String username) {
        this.username = username;
    }
}
