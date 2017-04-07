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

import java.util.Collections;

import org.springframework.ldap.core.DirContextAdapter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.core.userdetails.memory.*;

import junit.framework.TestCase;

/**
 * Tests for ReplacingUserDetailsMapper.
 *
 * @author Valery Tydykov
 *
 */
public class ReplacingUserDetailsMapperTest extends TestCase {

    ReplacingUserDetailsMapper mapper;

    @Override
    protected void setUp() throws Exception {
        this.mapper = new ReplacingUserDetailsMapper();
    }

    /**
     * Test method for
     * {@link org.springframework.security.userdetails.ldap.ReplacingUserDetailsMapper#afterPropertiesSet()}
     * .
     */
    public final void testAfterPropertiesSet() {
        try {
            this.mapper.afterPropertiesSet();
            fail("expected exception");
        } catch (final IllegalArgumentException expected) {
        } catch (final Exception unexpected) {
            fail("unexpected exception");
        }
    }

    /**
     * Test method for
     * {@link org.springframework.security.userdetails.ldap.ReplacingUserDetailsMapper#mapUserFromContext(org.springframework.ldap.core.DirContextOperations, java.lang.String, org.springframework.security.GrantedAuthority[])}
     * .
     */
    public final void testNormalOperation() {
        final String userName = "rod,ok";
        final UsernameFromPropertyAccountMapper accountMapper =
                new UsernameFromPropertyAccountMapper();
        accountMapper.setUsername(userName);
        this.mapper.setAccountMapper(accountMapper);
        this.mapper.setConvertToUpperCase(false);

        {
            // create secondary user accounts repository
            final InMemoryDaoImpl dao = new InMemoryDaoImpl();
            final UserMapEditor editor = new UserMapEditor();
            editor.setAsText("rod,ok=koala,ROLE_ONE,ROLE_TWO,enabled\r\n");
            dao.setUserMap((UserMap) editor.getValue());

            this.mapper.setUserDetailsService(dao);
        }

        final DirContextAdapter ctx = new DirContextAdapter();

        ctx.setAttributeValues("userRole", new String[] { "X", "Y", "Z" });
        ctx.setAttributeValue("uid", "ani");

        final org.springframework.security.core.userdetails.UserDetails userDetails =
                this.mapper.mapUserFromContext(ctx, "ani", Collections.EMPTY_SET);
        // verify that userDetails came from the secondary repository
        assertEquals("ROLE_ONE",
            ((GrantedAuthority) userDetails.getAuthorities().toArray()[0]).getAuthority());
    }

    /**
     * Test method for
     * {@link org.springframework.security.userdetails.ldap.ReplacingUserDetailsMapper#retrieveUser(java.lang.String)}
     * .
     */
    public final void testRetrieveUser() {
        final String username = "rod,ok";
        {
            // secondary user accounts repository
            final InMemoryDaoImpl dao = new InMemoryDaoImpl();
            final UserMapEditor editor = new UserMapEditor();
            editor.setAsText("rod,ok=koala,ROLE_ONE,ROLE_TWO,enabled\r\n");
            dao.setUserMap((UserMap) editor.getValue());

            this.mapper.setUserDetailsService(dao);
        }

        final UserDetails userDetails = this.mapper.retrieveUser(username);

        assertEquals("ROLE_ONE",
            ((GrantedAuthority) userDetails.getAuthorities().toArray()[0]).getAuthority());

        try {
            this.mapper.retrieveUser("noMatchUsername");
            fail("exception expected");
        } catch (final UsernameNotFoundException expected) {
        } catch (final Exception unexpected) {
            fail("unexpected exception");
        }
    }
}
