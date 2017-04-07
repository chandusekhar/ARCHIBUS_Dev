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
package org.springframework.security.userdetails.preauth;

import org.apache.commons.logging.*;
import org.springframework.security.core.*;

/**
 * Maps username (from the primary user account repository, e.g. LDAP) to username in secondary user
 * account repository. Uses username supplied in the <tt>authenticationRequest</tt> as secondary
 * authentication storage username.
 *
 *
 * @author Valery Tydykov
 *
 */
public class UsernameFromRequestAccountMapper implements AccountMapper {
    /**
     * Logger for this class and subclasses.
     */
    protected final Log logger = LogFactory.getLog(this.getClass());

    /**
     * Property: If true username will be converted to upper case.
     */
    private boolean convertToUppercase;

    /**
     * Getter for the convertToUppercase property.
     *
     * @see convertToUppercase
     * @return the convertToUppercase property.
     */
    public boolean isConvertToUppercase() {
        return this.convertToUppercase;
    }

    @Override
    public String map(final Authentication authenticationRequest) throws AuthenticationException {
        String username = authenticationRequest.getName();

        if (this.convertToUppercase) {
            username = username.toUpperCase();
        }

        if (this.logger.isDebugEnabled()) {
            this.logger.debug("Mapping account=[" + username + "] to account=[" + username + "]");
        }

        // use SSO username as secondary authentication storage username
        return username;
    }

    /**
     * Setter for the convertToUppercase property.
     *
     * @see convertToUppercase
     * @param convertToUppercase the convertToUppercase to set.
     */
    public void setConvertToUppercase(final boolean convertToUppercase) {
        this.convertToUppercase = convertToUppercase;
    }
}
