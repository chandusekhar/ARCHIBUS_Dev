package org.springframework.security.providers.ldap.ad.populator;

import java.util.*;

import org.springframework.ldap.core.DirContextOperations;
import org.springframework.security.core.*;
import org.springframework.security.ldap.AbstractLdapIntegrationTests;
import org.springframework.security.ldap.authentication.BindAuthenticator;
import org.springframework.security.ldap.search.LdapUserSearch;
import org.springframework.security.ldap.userdetails.DefaultLdapAuthoritiesPopulator;

/**
 * Integration tests for ActiveDirectoryAuthoritiesPopulator.
 *
 * <p>
 * Uses real LDAP/ActiveDirectory server. {See AbstractLdapIntegrationTests}
 *
 * @author Valery Tydykov
 *
 */
public class ActiveDirectoryAuthoritiesPopulatorTest extends AbstractLdapIntegrationTests {

    private DefaultLdapAuthoritiesPopulator populator;

    private Authentication bob;

    DirContextOperations user;

    private LdapUserSearch userSearch;

    @Override
    protected void setUp() throws Exception {
        super.setUp();

        this.userSearch = (LdapUserSearch) appContext.getBean("userSearch");

        this.populator = new DefaultLdapAuthoritiesPopulator(getContextSource(), "");

        final BindAuthenticator authenticator = new BindAuthenticator(getContextSource());
        authenticator.setMessageSource(new SpringSecurityMessageSource());
        authenticator.setUserSearch(this.userSearch);

        this.bob = getUsernamePasswordAuthenticationToken();

        this.user = authenticator.authenticate(this.bob);
    }

    /**
     * Test method for
     * {@link org.springframework.security.providers.ldap.ad.populator.DefaultLdapAuthoritiesPopulator#getGroupMembershipRoles(java.lang.String)}
     * .
     */
    public final void testGetGroupMembershipRoles() {
        final String userDn = this.user.getNameInNamespace();
        final String username = (String) this.bob.getPrincipal();

        this.populator.setConvertToUpperCase(false);
        this.populator.setRolePrefix("");
        this.populator.setGroupSearchFilter("member={0}");
        this.populator.setGroupRoleAttribute("cn");
        this.populator.setSearchSubtree(true);

        System.out.println(userDn);

        final Set roles = this.populator.getGroupMembershipRoles(userDn, username);

        assertTrue(!roles.isEmpty());
    }

    /**
     * Test method for
     * {@link org.springframework.security.providers.ldap.ad.populator.DefaultLdapAuthoritiesPopulator#getGrantedAuthorities(org.springframework.ldap.core.DirContextOperations, java.lang.String)}
     * .
     */
    public final void testGetGrantedAuthorities() {
        final String username = (String) this.bob.getPrincipal();

        this.populator.setConvertToUpperCase(false);
        this.populator.setRolePrefix("");
        this.populator.setGroupSearchFilter("member={0}");
        this.populator.setGroupRoleAttribute("cn");
        this.populator.setSearchSubtree(true);

        System.out.println(this.user.getNameInNamespace());

        final Collection<GrantedAuthority> authorities =
                this.populator.getGrantedAuthorities(this.user, username);

        assertTrue(!authorities.isEmpty());
    }
}
