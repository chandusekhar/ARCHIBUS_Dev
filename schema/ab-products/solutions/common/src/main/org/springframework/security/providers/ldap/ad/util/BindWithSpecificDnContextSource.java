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
package org.springframework.security.providers.ldap.ad.util;

import javax.naming.directory.DirContext;

import org.springframework.dao.DataAccessException;
import org.springframework.ldap.NamingException;
import org.springframework.ldap.core.ContextSource;
import org.springframework.security.ldap.DefaultSpringSecurityContextSource;

/**
 * A {@link ContextSource} that binds with specific DN.
 *
 * @author Valery Tydykov
 *
 */
public class BindWithSpecificDnContextSource implements ContextSource {
    /**
     * Property: contextFactory to get context from.
     */
    private final DefaultSpringSecurityContextSource contextFactory;

    /**
     * Property: password of user to be used for binding.
     */
    private final String password;

    /**
     * Property: DN of user to be used for binding.
     */
    private final String userDn;

    /**
     * Constructor specifying contextFactory, userDn, password.
     *
     * @param contextFactory to get context from.
     * @param userDn DN of user to be used for binding.
     * @param password password of user to be used for binding.
     */
    public BindWithSpecificDnContextSource(final DefaultSpringSecurityContextSource contextFactory,
            final String userDn, final String password) {
        this.contextFactory = contextFactory;
        this.userDn = userDn;
        this.password = password;
    }

    @Override
    public DirContext getContext(final String principal, final String credentials)
            throws NamingException {
        // TODO should not be used?
        return null;
    }

    @Override
    public DirContext getReadOnlyContext() throws DataAccessException {
        return this.contextFactory.getContext(this.userDn, this.password);
    }

    @Override
    public DirContext getReadWriteContext() throws DataAccessException {
        return getReadOnlyContext();
    }
}
