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

import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.memory.*;

import junit.framework.TestCase;

/**
 * Tests for UserDetailsMappingServiceWrapper.
 *
 * @author Valery Tydykov
 *
 */
public class UserDetailsMappingServiceWrapperTest extends TestCase {

    UserDetailsMappingServiceWrapper service;

    @Override
    protected void setUp() throws Exception {
        this.service = new UserDetailsMappingServiceWrapper();
    }

    /**
     * Test method for
     * {@link org.springframework.security.userdetails.preauth.UserDetailsMappingServiceWrapper#afterPropertiesSet()}
     * .
     */
    public final void testAfterPropertiesSet() {
        try {
            this.service.afterPropertiesSet();
            fail("expected exception");
        } catch (final IllegalArgumentException expected) {
        } catch (final Exception unexpected) {
            fail("unexpected exception");
        }
    }

    /**
     * Test method for
     * {@link org.springframework.security.userdetails.preauth.UserDetailsMappingServiceWrapper#loadUserDetails(org.springframework.security.Authentication)}
     * .
     */
    public final void testLoadUserDetails() {
        final String username = "rod,ok";
        final UsernameFromPropertyAccountMapper accountMapper =
                new UsernameFromPropertyAccountMapper();
        accountMapper.setUsername(username);

        this.service.setAccountMapper(accountMapper);

        // secondary user accounts repository
        {
            final InMemoryDaoImpl dao = new InMemoryDaoImpl();
            final UserMapEditor editor = new UserMapEditor();
            editor.setAsText("rod,ok=koala,ROLE_ONE,ROLE_TWO,enabled\r\n");
            dao.setUserMap((UserMap) editor.getValue());

            this.service.setUserDetailsService(dao);
        }

        final org.springframework.security.core.Authentication authentication =
                new TestingAuthenticationToken("any", "any");
        final UserDetails user = this.service.loadUserDetails(authentication);

        // verify that userDetails came from the secondary repository
        assertEquals("ROLE_ONE",
            ((GrantedAuthority) user.getAuthorities().toArray()[0]).getAuthority());
    }
}
