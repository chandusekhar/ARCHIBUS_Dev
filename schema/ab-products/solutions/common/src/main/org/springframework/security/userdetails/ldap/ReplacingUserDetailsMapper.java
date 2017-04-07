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
import org.springframework.dao.DataAccessException;
import org.springframework.ldap.core.DirContextOperations;
import org.springframework.security.authentication.AuthenticationServiceException;
import org.springframework.security.core.*;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.ldap.userdetails.LdapUserDetailsMapper;
import org.springframework.util.Assert;

/**
 * The context mapper used by the LDAP authentication provider to create an LDAP user object.
 * Creates the final <tt>UserDetails</tt> object that will be returned by the provider once the user
 * has been authenticated, replacing the original <tt>UserDetails</tt> object. Has additional
 * properties <tt>userDetailsService</tt> and <tt>accountMapper</tt>, which are used to map original
 * user to username in secondary repository and to retrieve UserDetails from the secondary account
 * repository.
 *
 *
 * @author Valery Tydykov
 *
 */
public class ReplacingUserDetailsMapper extends LdapUserDetailsMapper implements InitializingBean {
    /**
     * Logger for this class and subclasses.
     */
    protected final Log logger = LogFactory.getLog(this.getClass());

    /**
     * Mapper which will be used to map original user to username in secondary repository.
     */
    private AccountMapper accountMapper;

    /**
     * Service which will be used to retrieve UserDetails from the secondary account repository.
     */
    private UserDetailsService userDetailsService;

    @Override
    public void afterPropertiesSet() {
        Assert.notNull(this.userDetailsService, "UserDetailsService must be supplied");
        Assert.notNull(this.accountMapper, "AccountMapper must be supplied");
    }

    /**
     * Getter for the accountMapper property.
     * 
     * @return the accountMapper property.
     */
    public AccountMapper getAccountMapper() {
        return this.accountMapper;
    }

    /**
     * Getter for the userDetailsService property.
     * 
     * @return the userDetailsService property.
     */
    public UserDetailsService getUserDetailsService() {
        return this.userDetailsService;
    }

    @Override
    public UserDetails mapUserFromContext(final DirContextOperations ctx, final String username,
            final Collection<? extends GrantedAuthority> authorities) {
        final UserDetails userOriginal = super.mapUserFromContext(ctx, username, authorities);

        if (this.logger.isDebugEnabled()) {
            this.logger
                .debug("Replacing UserDetails with username=[" + userOriginal.getUsername() + "]");
        }

        // map user to secondary username
        final String usernameMapped = this.accountMapper.map(userOriginal);

        // replace original UserDetails with the secondary UserDetails
        final UserDetails user = retrieveUser(usernameMapped);

        return user;
    }

    /**
     * Setter for the accountMapper property.
     *
     * @see accountMapper
     * @param accountMapper the accountMapper to set.
     */
    public void setAccountMapper(final AccountMapper accountMapper) {
        this.accountMapper = accountMapper;
    }

    /**
     * Setter for the userDetailsService property.
     *
     * @see userDetailsService
     * @param userDetailsService the userDetailsService to set.
     */
    public void setUserDetailsService(final UserDetailsService userDetailsService) {
        this.userDetailsService = userDetailsService;
    }

    /**
     * Retrieves UserDetails from the secondary account repository.
     *
     * @param username for which to load UserDetails.
     * @return loaded UserDetails.
     * @throws AuthenticationException if repository throws DataAccessException, or if
     *             UserDetailsService returned null.
     */
    protected UserDetails retrieveUser(final String username) throws AuthenticationException {
        UserDetails loadedUser;

        // retrieve UserDetails from the secondary account repository
        try {
            loadedUser = this.userDetailsService.loadUserByUsername(username);
        } catch (final DataAccessException repositoryProblem) {
            throw new AuthenticationServiceException(repositoryProblem.getMessage(),
                repositoryProblem);
        }

        if (loadedUser == null) {
            throw new AuthenticationServiceException(
                "UserDetailsService returned null, which is an interface contract violation");
        }

        return loadedUser;
    }
}
