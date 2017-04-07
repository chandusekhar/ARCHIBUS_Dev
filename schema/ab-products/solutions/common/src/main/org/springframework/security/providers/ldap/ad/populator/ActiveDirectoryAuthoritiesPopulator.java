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
package org.springframework.security.providers.ldap.ad.populator;

import java.util.*;

import javax.naming.Context;
import javax.naming.directory.SearchControls;

import org.apache.commons.logging.*;
import org.springframework.ldap.core.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.ldap.DefaultSpringSecurityContextSource;
import org.springframework.security.ldap.userdetails.LdapAuthoritiesPopulator;
import org.springframework.security.providers.ldap.ad.ActiveDirectoryLdapTemplate;
import org.springframework.security.providers.ldap.ad.util.*;
import org.springframework.util.Assert;

/**
 * Obtains user role information from the directory. Uses ActiveDirectory - specific syntax for LDAP
 * parameters.
 * <p>
 * It obtains roles by performing a search for "groups" the user is a member of. Can only use
 * <tt>DefaultSpringSecurityContextSource</tt> as contextSource. Similar to
 * <code>DefaultLdapAuthoritiesPopulator</code>
 *
 * @author Valery Tydykov
 *
 */
public class ActiveDirectoryAuthoritiesPopulator implements LdapAuthoritiesPopulator {

    /**
     * Logger for this class and subclasses.
     */
    protected final Log logger = LogFactory.getLog(this.getClass());

    /**
     * Property: Context source against which bind operations will be performed.
     */
    private DefaultSpringSecurityContextSource contextSource;

    /**
     * Property: If true user roles will be converted to upper case.
     */
    private boolean convertToUpperCase = true;

    /**
     * Property: A default role which will be assigned to all authenticated users if set.
     */
    private org.springframework.security.core.GrantedAuthority defaultRole;

    /**
     * Property: The ID of the attribute which contains the role name for a group.
     */
    private String groupRoleAttribute = "cn";

    /**
     * Property: The base DN from which the search for group membership should be performed.
     */
    private String groupSearchBase;

    /**
     * Property: The pattern to be used for the user search. {0} is the user's DN
     */
    private String groupSearchFilter = "member={0}";

    /**
     * Property: Attributes of the User's LDAP Object that contain role name information.
     */
    private String rolePrefix = "ROLE_";

    /**
     * Property: Controls used to determine whether group searches should be performed over the full
     * sub-tree from the base DN. Modified by searchSubTree property
     */
    private final SearchControls searchControls = new SearchControls();

    /**
     * Constructor specifying contextSource, groupSearchBase.
     *
     * @param contextSource supplies the contexts used to search for user roles.
     * @param groupSearchBase if this is an empty string the search will be performed from the root
     *            DN of the context factory.
     */
    public ActiveDirectoryAuthoritiesPopulator(
            final DefaultSpringSecurityContextSource contextSource, final String groupSearchBase) {
        this.setContextSource(contextSource);
        this.setGroupSearchBase(groupSearchBase);
    }

    /**
     * Getter for the contextSource property.
     *
     * @see contextSource
     * @return the contextSource property.
     */
    public DefaultSpringSecurityContextSource getContextSource() {
        return this.contextSource;
    }

    /**
     * Getter for the defaultRole property.
     *
     * @see defaultRole
     * @return the defaultRole property.
     */
    public org.springframework.security.core.GrantedAuthority getDefaultRole() {
        return this.defaultRole;
    }

    @Override
    public final Collection<? extends GrantedAuthority> getGrantedAuthorities(
            final DirContextOperations user, final String username) {
        final String userDn = user.getNameInNamespace();

        if (this.logger.isDebugEnabled()) {
            this.logger.debug("Getting authorities for user " + userDn);
        }

        // password must be supplied by the ActiveDirectoryBindAuthenticator
        final String password = user.getStringAttribute(Context.SECURITY_CREDENTIALS);

        final Set<GrantedAuthority> roles = getGroupMembershipRoles(userDn, username, password);

        final Set<GrantedAuthority> extraRoles = getAdditionalRoles(user, username);

        if (extraRoles != null) {
            roles.addAll(extraRoles);
        }

        if (this.defaultRole != null) {
            roles.add(this.defaultRole);
        }

        return roles;
    }

    /**
     * Returns group membership roles from LDAP for principalDn, password, username. Searches for
     * roles userDn is member of.
     *
     * @param userDn LDAP user DN in form "username@dc1.dc2".
     * @param username username to search for in LDAP.
     * @param password LDAP password.
     * @return group membership roles.
     */
    public Set<GrantedAuthority> getGroupMembershipRoles(final String userDn, final String username,
            final String password) {

        final Set<GrantedAuthority> authorities = new HashSet<GrantedAuthority>();

        if (getGroupSearchBase() != null) {
            if (this.logger.isDebugEnabled()) {
                this.logger.debug("Searching for roles for user with DN = '" + userDn
                        + "', with filter = '" + this.groupSearchFilter + "', in search base '"
                        + this.groupSearchBase + "'");
            }

            final String principalDn = determinePrincipalDn(username);

            // bind as principalDn/password
            final ActiveDirectoryLdapTemplate template = new ActiveDirectoryLdapTemplate(
                new BindWithSpecificDnContextSource(this.contextSource, principalDn, password));
            template.setSearchControls(this.searchControls);

            // search for roles userDn is member of
            final Set<String> userRoles =
                    template.searchForSingleAttributeValues(getGroupSearchBase(),
                        this.groupSearchFilter, new String[] { userDn }, this.groupRoleAttribute);

            if (this.logger.isDebugEnabled()) {
                this.logger.debug("Roles from search: " + userRoles);
            }

            // convert role names to SimpleGrantedAuthority objects
            for (final String userRole : userRoles) {
                String roleWithPrefix = userRole;
                if (this.convertToUpperCase) {
                    roleWithPrefix = roleWithPrefix.toUpperCase();
                }

                roleWithPrefix = this.rolePrefix + roleWithPrefix;

                authorities.add(new SimpleGrantedAuthority(roleWithPrefix));
            }
        }

        return authorities;
    }

    /**
     * Getter for the groupRoleAttribute property.
     *
     * @see groupRoleAttribute
     * @return the groupRoleAttribute property.
     */
    public String getGroupRoleAttribute() {
        return this.groupRoleAttribute;
    }

    /**
     * Getter for the groupSearchBase property.
     *
     * @see groupSearchBase
     * @return the groupSearchBase property.
     */
    public String getGroupSearchBase() {
        return this.groupSearchBase;
    }

    /**
     * Getter for the groupSearchFilter property.
     *
     * @see groupSearchFilter
     * @return the groupSearchFilter property.
     */
    public String getGroupSearchFilter() {
        return this.groupSearchFilter;
    }

    /**
     * Getter for the rolePrefix property.
     *
     * @see rolePrefix
     * @return the rolePrefix property.
     */
    public String getRolePrefix() {
        return this.rolePrefix;
    }

    /**
     * Getter for the searchControls property.
     *
     * @see searchControls
     * @return the searchControls property.
     */
    public SearchControls getSearchControls() {
        return this.searchControls;
    }

    /**
     * Getter for the convertToUpperCase property.
     *
     * @see convertToUpperCase
     * @return the convertToUpperCase property.
     */
    public boolean isConvertToUpperCase() {
        return this.convertToUpperCase;
    }

    /**
     * Setter for the convertToUpperCase property.
     *
     * @see convertToUpperCase
     * @param convertToUpperCase the convertToUpperCase to set
     */
    public void setConvertToUpperCase(final boolean convertToUpperCase) {
        this.convertToUpperCase = convertToUpperCase;
    }

    /**
     * Setter for the defaultRole property.
     *
     * @see defaultRole
     * @param defaultRole the defaultRole to set
     */
    public void setDefaultRole(
            final org.springframework.security.core.GrantedAuthority defaultRole) {
        this.defaultRole = defaultRole;
    }

    /**
     * The default role which will be assigned to all users.
     *
     * @param defaultRole the role name, including any desired prefix.
     */
    public void setDefaultRole(final String defaultRole) {
        Assert.hasLength(defaultRole, "defaultRole must be not empty");
        this.defaultRole = new SimpleGrantedAuthority(defaultRole);
    }

    /**
     * Setter for the groupRoleAttribute property.
     *
     * @see groupRoleAttribute
     * @param groupRoleAttribute the groupRoleAttribute to set.
     */

    public void setGroupRoleAttribute(final String groupRoleAttribute) {
        Assert.hasLength(groupRoleAttribute, "groupRoleAttribute must be not empty");
        this.groupRoleAttribute = groupRoleAttribute;
    }

    /**
     * Setter for the groupSearchFilter property.
     *
     * @see groupSearchFilter
     * @param groupSearchFilter the groupSearchFilter to set.
     */

    public void setGroupSearchFilter(final String groupSearchFilter) {
        Assert.hasLength(groupSearchFilter, "groupSearchFilter must be not empty");
        this.groupSearchFilter = groupSearchFilter;
    }

    /**
     * Setter for the rolePrefix property.
     *
     * @see rolePrefix
     * @param rolePrefix the rolePrefix to set.
     */

    public void setRolePrefix(final String rolePrefix) {
        Assert.notNull(rolePrefix, "rolePrefix must not be null");
        this.rolePrefix = rolePrefix;
    }

    /**
     * If set to true, a subtree scope search will be performed. If false a single-level search is
     * used.
     *
     * @param searchSubtree set to true to enable searching of the entire tree below the
     *            <tt>groupSearchBase</tt>.
     */
    public void setSearchSubtree(final boolean searchSubtree) {
        final int searchScope =
                searchSubtree ? SearchControls.SUBTREE_SCOPE : SearchControls.ONELEVEL_SCOPE;
        this.searchControls.setSearchScope(searchScope);
    }

    /**
     * This method should be overridden if required to obtain any additional roles for the given
     * user (on top of those obtained from the standard search implemented by this class).
     *
     * @param user context representing the user who's roles are required.
     * @param username username for which additional roles should be obtained.
     * @return extra roles which will be merged with those returned by the group search.
     */
    protected Set<GrantedAuthority> getAdditionalRoles(final DirContextOperations user,
            final String username) {
        return null;
    }

    /**
     * Generates principalDn in the form: <code>username@dc1.dc2</code>.
     *
     * @param username for which to generate the principalDn.
     * @return generated principalDn.
     */
    private String determinePrincipalDn(final String username) {
        final String rootDn = this.contextSource.getBaseLdapPathAsString();

        final String principalDn = NamingUtils.preparePrincipalDn(username, rootDn);

        return principalDn;
    }

    /**
     * Set the {@link ContextSource}.
     *
     * @param contextSource supplies the contexts used to search for user roles.
     */
    private void setContextSource(final DefaultSpringSecurityContextSource contextSource) {
        Assert.notNull(contextSource, "contextSource must not be null");
        this.contextSource = contextSource;
    }

    /**
     * Set the group search base (name to search under).
     *
     * @param groupSearchBase if this is an empty string the search will be performed from the root
     *            DN of the context factory.
     */
    private void setGroupSearchBase(final String groupSearchBase) {
        Assert.notNull(groupSearchBase,
            "The groupSearchBase (name to search under), must not be null.");
        this.groupSearchBase = groupSearchBase;
        if (groupSearchBase.length() == 0) {
            this.logger.info(
                "groupSearchBase is empty. Searches will be performed from the context source base");
        }
    }
}
