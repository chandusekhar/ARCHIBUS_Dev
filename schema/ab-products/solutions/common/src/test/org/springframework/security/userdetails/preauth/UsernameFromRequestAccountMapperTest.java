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

import junit.framework.TestCase;

/**
 * Tests for UsernameFromRequestAccountMapper.
 *
 * @author Valery Tydykov
 *
 */
public class UsernameFromRequestAccountMapperTest extends TestCase {

    UsernameFromRequestAccountMapper mapper;

    @Override
    protected void setUp() throws Exception {
        this.mapper = new UsernameFromRequestAccountMapper();
    }

    /**
     * Test method for
     * {@link org.springframework.security.userdetails.preauth.UsernameFromRequestAccountMapper#map(org.springframework.security.Authentication)}
     * .
     */
    public final void testNormalOperation() {
        final String usernameExpected = "username1";
        final org.springframework.security.core.Authentication authenticationRequest =
                new TestingAuthenticationToken(usernameExpected, "password1");
        final String username = this.mapper.map(authenticationRequest);

        assertEquals(usernameExpected, username);
    }
}
