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

import org.springframework.beans.factory.InitializingBean;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.*;
import org.springframework.util.Assert;

/**
 * This implementation for AuthenticationUserDetailsService wraps a regular Spring Security
 * UserDetailsService implementation, to retrieve a UserDetails object based on the mapping of the
 * user name contained in a PreAuthenticatedAuthenticationToken to user name expected by the
 * userDetailsService.
 *
 * @author Valery Tydykov
 */
public class UserDetailsMappingServiceWrapper
        implements AuthenticationUserDetailsService<Authentication>, InitializingBean {
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
        Assert.notNull(this.userDetailsService, "UserDetailsService must be set");
        Assert.notNull(this.accountMapper, "AccountMapper must be set");
    }

    /**
     * Getter for the accountMapper property.
     *
     * @see accountMapper
     * @return the accountMapper property.
     */
    public AccountMapper getAccountMapper() {
        return this.accountMapper;
    }

    /**
     * Getter for the userDetailsService property.
     *
     * @see userDetailsService
     * @return the userDetailsService property.
     */
    public UserDetailsService getUserDetailsService() {
        return this.userDetailsService;
    }

    @Override
    public UserDetails loadUserDetails(final Authentication authentication)
            throws UsernameNotFoundException {
        // Determine username for the secondary authentication repository
        final String username = this.accountMapper.map(authentication);

        // get the UserDetails object from the wrapped UserDetailsService implementation
        return this.userDetailsService.loadUserByUsername(username);
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
}
