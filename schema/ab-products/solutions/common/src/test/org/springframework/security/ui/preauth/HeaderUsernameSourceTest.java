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
package org.springframework.security.ui.preauth;

import org.springframework.mock.web.MockHttpServletRequest;

import junit.framework.TestCase;

/**
 * Tests for HeaderUsernameSource.
 *
 * @author Valery Tydykov
 *
 */
public class HeaderUsernameSourceTest extends TestCase {

    HeaderUsernameSource usernameSource;

    @Override
    protected void setUp() throws Exception {
        this.usernameSource = new HeaderUsernameSource();
    }

    public final void testObtainUsernameSupplied() {
        final String key1 = "key1";
        final String value1 = "value1";

        final MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader(key1, value1);

        this.usernameSource.setUsernameKey(key1);
        final String username = this.usernameSource.obtainUsername(request);

        assertEquals(value1, username);
    }

    public final void testObtainUsernameNotSupplied() {
        final String key1 = "key1";

        final MockHttpServletRequest request = new MockHttpServletRequest();

        this.usernameSource.setUsernameKey(key1);
        final String username = this.usernameSource.obtainUsername(request);

        assertEquals(null, username);
    }
}
