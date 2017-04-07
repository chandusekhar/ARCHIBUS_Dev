package com.archibus.app.solution.common.security;

import java.util.HashSet;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.userdetails.ldap.AccountMapper;

import com.archibus.fixture.SpringContextTestBase;

/**
 * Integration test for ldap/activedirectory/mapping/authority-by-prefix configuration.
 *
 * @author Valery Tydykov
 *
 */
public class LdapMappingAuthorityByPrefixIntegrationTest extends SpringContextTestBase {
    AccountMapper accountMapper;
    
    @Override
    protected String[] getConfigLocations() {
        return new String[] { "/context/security/ldap/activedirectory/mapping/authority-by-prefix/account-mapper.xml" };
    }
    
    public void testMap() {
        final String expectedAuthority = "Afm_role1";
        final HashSet<GrantedAuthority> authorities = new HashSet<GrantedAuthority>();
        authorities.add(new SimpleGrantedAuthority(expectedAuthority));
        authorities.add(new SimpleGrantedAuthority("prefix1_role2"));
        final UserDetails user = new User("username1", "password1", authorities);
        
        final String username = this.accountMapper.map(user);
        
        assertEquals(expectedAuthority, username);
    }
    
    /**
     * @return the accountMapper
     */
    public AccountMapper getAccountMapper() {
        return this.accountMapper;
    }
    
    /**
     * @param accountMapper the accountMapper to set
     */
    public void setAccountMapper(final AccountMapper accountMapper) {
        this.accountMapper = accountMapper;
    }
}
