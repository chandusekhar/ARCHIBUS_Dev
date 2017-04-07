package com.archibus.app.solution.common.security;

import java.util.Collections;

import org.springframework.security.core.userdetails.*;
import org.springframework.security.userdetails.ldap.AccountMapper;

import com.archibus.fixture.SpringContextTestBase;

/**
 * Integration test for ldap/activedirectory/mapping/many-to-one configuration.
 *
 * @author Valery Tydykov
 *
 */
public class LdapMappingManyToOneIntegrationTest extends SpringContextTestBase {
    
    AccountMapper accountMapper;
    
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
    
    @Override
    protected String[] getConfigLocations() {
        return new String[] { "/context/security/ldap/activedirectory/mapping/many-to-one/account-mapper.xml" };
    }
    
    public void testMap() {
        final String usernameExpected = "AFM";
        final UserDetails user = new User(usernameExpected, "password1", Collections.EMPTY_SET);
        final String username = this.accountMapper.map(user);
        
        assertEquals(usernameExpected, username);
    }
}
