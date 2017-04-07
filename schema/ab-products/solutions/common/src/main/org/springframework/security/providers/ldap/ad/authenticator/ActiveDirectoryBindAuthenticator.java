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
package org.springframework.security.providers.ldap.ad.authenticator;

import java.text.MessageFormat;

import javax.naming.Context;

import org.apache.commons.logging.*;
import org.springframework.context.*;
import org.springframework.context.support.MessageSourceAccessor;
import org.springframework.ldap.core.DirContextOperations;
import org.springframework.security.authentication.*;
import org.springframework.security.core.*;
import org.springframework.security.ldap.*;
import org.springframework.security.ldap.authentication.LdapAuthenticator;
import org.springframework.security.providers.ldap.ad.util.*;
import org.springframework.util.Assert;

/**
 * An authenticator which binds as a user. Generates ActiveDirectory - specific syntax of LDAP
 * parameters. Can only use <tt>DefaultSpringSecurityContextSource</tt> as contextSource. Similar to
 * <code>BindAuthenticator</code>.
 *
 * @author Valery Tydykov
 *
 */
public class ActiveDirectoryBindAuthenticator implements LdapAuthenticator, MessageSourceAware {
    /**
     * Constant: LDAP filter by user account name to be used for user search.
     */
    protected static final String USER_SEARCH_FILTER = "(&(objectClass=user)(samAccountName={0}))";

    /**
     * Logger for this class and subclasses.
     */
    protected final Log logger = LogFactory.getLog(this.getClass());

    /**
     * Property: Accessor of error messages.
     */
    protected MessageSourceAccessor messages = SpringSecurityMessageSource.getAccessor();

    /**
     * Property: Context source against which bind operations will be performed.
     */
    private final DefaultSpringSecurityContextSource contextSource;

    /**
     * Creates an initialized instance using the {@link DefaultSpringSecurityContextSource}
     * provided.
     *
     * @param contextSource DefaultSpringSecurityContextSource instance against which bind
     *            operations will be performed.
     */
    public ActiveDirectoryBindAuthenticator(
            final DefaultSpringSecurityContextSource contextSource) {
        Assert.notNull(contextSource, "contextSource must not be null.");
        this.contextSource = contextSource;
    }

    @Override
    public DirContextOperations authenticate(final Authentication authentication) {
        Assert.isInstanceOf(UsernamePasswordAuthenticationToken.class, authentication,
            "Can only process UsernamePasswordAuthenticationToken objects");

        final String username = authentication.getName();
        final String password = (String) authentication.getCredentials();

        // Active Directory requires principalDn in the form: username@dc1.dc2.
        final String principalDn = determinePrincipalDn(username);

        final DirContextOperations user = bindWithDn(principalDn, username, password);
        if (user == null) {
            throw new BadCredentialsException(
                this.messages.getMessage("BindAuthenticator.badCredentials", "Bad credentials"));
        }

        // Store password in user: will be used by the authorities populator to bind
        // (again) as username/password.
        user.addAttributeValue(Context.SECURITY_CREDENTIALS, password);

        return user;
    }

    @Override
    public void setMessageSource(final MessageSource messageSource) {
        Assert.notNull("Message source must not be null");
        this.messages = new MessageSourceAccessor(messageSource);
    }

    /**
     * Binds as LDAP principalDn/password, searches for account info for username.
     *
     * @param principalDn LDAP principal DN in form "username@dc1.dc2".
     * @param username username to search for in LDAP.
     * @param password LDAP password.
     * @return LDAP entry for the username.
     */
    protected DirContextOperations bindWithDn(final String principalDn, final String username,
            final String password) {
        if (this.logger.isDebugEnabled()) {
            this.logger.debug("Bind with dn=[" + principalDn + "], username=[" + username + "]");
        }

        // bind as principalDn/password
        final SpringSecurityLdapTemplate template = new SpringSecurityLdapTemplate(
            new BindWithSpecificDnContextSource(this.contextSource, principalDn, password));

        // search for account info for username
        final String formattedFilter =
                MessageFormat.format(USER_SEARCH_FILTER, new Object[] { username });

        return template.searchForSingleEntry("", formattedFilter, null);
    }

    /**
     * Generates principalDn in the form: <code>username@dc1.dc2</code>.
     *
     * @param username for which to generate the principalDn.
     * @return generated principalDn.
     */
    protected String determinePrincipalDn(final String username) {
        final String rootDn = this.contextSource.getBaseLdapPathAsString();

        final String principalDn = NamingUtils.preparePrincipalDn(username, rootDn);

        return principalDn;
    }
}
