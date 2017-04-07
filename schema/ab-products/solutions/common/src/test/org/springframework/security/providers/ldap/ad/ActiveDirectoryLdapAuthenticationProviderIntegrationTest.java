package org.springframework.security.providers.ldap.ad;

import java.util.Collection;

import org.springframework.security.core.*;
import org.springframework.security.core.userdetails.memory.*;
import org.springframework.security.ldap.AbstractLdapIntegrationTests;
import org.springframework.security.ldap.authentication.*;
import org.springframework.security.ldap.search.LdapUserSearch;
import org.springframework.security.ldap.userdetails.DefaultLdapAuthoritiesPopulator;
import org.springframework.security.providers.ldap.ad.authenticator.ActiveDirectoryBindAuthenticator;
import org.springframework.security.providers.ldap.ad.populator.ActiveDirectoryAuthoritiesPopulator;
import org.springframework.security.userdetails.ldap.*;

/**
 * Integration test for {@link ActiveDirectoryAuthoritiesPopulator} and
 * {@link ActiveDirectoryBindAuthenticator}.
 * <p>
 * Uses real LDAP/ActiveDirectory server. {See AbstractLdapIntegrationTests}
 *
 * @author Valery Tydykov
 *
 */
public class ActiveDirectoryLdapAuthenticationProviderIntegrationTest
        extends AbstractLdapIntegrationTests {
    private BindAuthenticator authenticator;

    private DefaultLdapAuthoritiesPopulator populator;

    private Authentication bob;

    private LdapAuthenticationProvider authenticationProvider;

    private LdapUserSearch userSearch;

    @Override
    protected void setUp() throws Exception {
        super.setUp();

        this.userSearch = (LdapUserSearch) appContext.getBean("userSearch");

        this.authenticator = new BindAuthenticator(getContextSource());
        this.authenticator.setMessageSource(new SpringSecurityMessageSource());
        this.authenticator.setUserSearch(this.userSearch);

        this.populator = new DefaultLdapAuthoritiesPopulator(getContextSource(), "");
        this.populator.setConvertToUpperCase(false);
        this.populator.setRolePrefix("");
        this.populator.setGroupSearchFilter("member={0}");
        this.populator.setGroupRoleAttribute("cn");
        this.populator.setSearchSubtree(true);

        this.authenticationProvider =
                new LdapAuthenticationProvider(this.authenticator, this.populator);

        this.bob = getUsernamePasswordAuthenticationToken();
    }

    public void testAuthenticate() {
        final Authentication authenticationResult =
                this.authenticationProvider.authenticate(this.bob);

        final Collection<? extends GrantedAuthority> authorities =
                authenticationResult.getAuthorities();
        assertTrue(!authorities.isEmpty());
    }

    public void testAuthenticateWithInMemoryDao() {
        {
            final ReplacingUserDetailsMapper userDetailsContextMapper =
                    new ReplacingUserDetailsMapper();
            {
                // All LDAP accounts mapped to single secondary account "rod"
                final UsernameFromPropertyAccountMapper accountMapper =
                        new UsernameFromPropertyAccountMapper();
                accountMapper.setUsername("rod,ok");
                userDetailsContextMapper.setAccountMapper(accountMapper);
            }

            userDetailsContextMapper.setConvertToUpperCase(false);

            // create secondary user accounts repository
            {
                final InMemoryDaoImpl dao = new InMemoryDaoImpl();
                final UserMapEditor editor = new UserMapEditor();
                editor.setAsText("rod,ok=koala,ROLE_ONE,ROLE_TWO,enabled\r\n");
                dao.setUserMap((UserMap) editor.getValue());

                userDetailsContextMapper.setUserDetailsService(dao);
            }

            this.authenticationProvider.setUserDetailsContextMapper(userDetailsContextMapper);
        }

        final Authentication authenticationResult =
                this.authenticationProvider.authenticate(this.bob);

        final Collection<? extends GrantedAuthority> authorities =
                authenticationResult.getAuthorities();

        assertEquals(2, authorities.size());
        assertEquals("ROLE_ONE", ((GrantedAuthority) authorities.toArray()[0]).getAuthority());
    }
}
