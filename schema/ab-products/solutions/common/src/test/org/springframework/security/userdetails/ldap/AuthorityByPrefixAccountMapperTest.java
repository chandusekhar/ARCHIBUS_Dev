/**
 *
 */
package org.springframework.security.userdetails.ldap;

import java.util.*;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;

import junit.framework.TestCase;

/**
 * Tests for AuthorityByPrefixAccountMapper.
 *
 * @author Valery Tydykov
 *
 */
public class AuthorityByPrefixAccountMapperTest extends TestCase {
    AuthorityByPrefixAccountMapper mapper;

    @Override
    protected void setUp() throws Exception {
        this.mapper = new AuthorityByPrefixAccountMapper();
    }

    /**
     * Test method for
     * {@link org.springframework.security.userdetails.ldap.AuthorityByPrefixAccountMapper#map(org.springframework.security.userdetails.UserDetails)}
     * .
     */
    public final void testNormalOperation() {
        final String expectedAuthority = "prefix1_role1";
        final Collection<org.springframework.security.core.GrantedAuthority> authorities =
                new HashSet<GrantedAuthority>();
        authorities.add(new SimpleGrantedAuthority(expectedAuthority));
        authorities.add(new SimpleGrantedAuthority("prefix1_role2"));

        final UserDetails user = new User("username1", "password1", authorities);
        this.mapper.setAuthorityPrefix("prefix1_");
        final String authority = this.mapper.map(user);

        assertEquals(expectedAuthority, authority);
    }

    /**
     * Test method for
     * {@link org.springframework.security.userdetails.ldap.AuthorityByPrefixAccountMapper#map(org.springframework.security.userdetails.UserDetails)}
     * .
     */
    public final void testAuthorityNotFoundThrowsException() {
        final String expectedAuthority = "prefix1_role1";
        final Collection<org.springframework.security.core.GrantedAuthority> authorities =
                new HashSet<GrantedAuthority>();
        authorities.add(new SimpleGrantedAuthority(expectedAuthority));
        final UserDetails user = new User("username1", "password1", authorities);
        this.mapper.setAuthorityPrefix("NoMatchPrefix");

        try {
            this.mapper.map(user);
            fail("exception expected");
        } catch (final AuthorityNotFoundException expected) {
        } catch (final Exception unexpected) {
            fail("map throws unexpected exception");
        }
    }

    /**
     * Test method for
     * {@link org.springframework.security.userdetails.ldap.AuthorityByPrefixAccountMapper#afterPropertiesSet()}
     * .
     */
    public final void testAfterPropertiesSet() {
        try {
            this.mapper.afterPropertiesSet();
            fail("exception expected");
        } catch (final IllegalArgumentException expected) {
        } catch (final Exception unexpected) {
            fail("unexpected exception");
        }
    }
}
