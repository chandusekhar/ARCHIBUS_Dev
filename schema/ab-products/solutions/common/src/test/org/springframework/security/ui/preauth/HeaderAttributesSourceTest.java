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

import java.util.*;

import org.springframework.mock.web.MockHttpServletRequest;

import junit.framework.TestCase;

/**
 * Tests for HeaderAttributesSource.
 *
 * @author Valery Tydykov
 *
 */
public class HeaderAttributesSourceTest extends TestCase {

    private HeaderAttributesSource attributesSource;

    @Override
    protected void setUp() throws Exception {
        this.attributesSource = new HeaderAttributesSource();
    }

    /**
     * Test method for
     * {@link org.springframework.security.ui.preauth.HeaderAttributesSource#obtainAttributes(javax.servlet.http.HttpServletRequest)}
     * .
     */
    public final void testObtainAttributes() {
        final String key1 = "key1";
        final String value1 = "value1";
        final String key2 = "key2";
        final String value2 = "value2";
        final String key3 = "key3";

        {
            final List<String> keys = new ArrayList<String>();
            keys.add(key1);
            keys.add(key2);
            keys.add(key3);
            this.attributesSource.setKeys(keys);
        }

        final MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader(key1, value1);
        request.addHeader(key2, value2);

        final Map<String, String> attributes = this.attributesSource.obtainAttributes(request);

        assertEquals(value1, attributes.get(key1));
        assertEquals(value2, attributes.get(key2));
        assertEquals(null, attributes.get(key3));
    }
}
