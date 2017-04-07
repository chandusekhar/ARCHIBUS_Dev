/**
 *
 */
package org.springframework.security.ui.preauth;

import java.util.*;

import org.springframework.mock.web.MockHttpServletRequest;

import junit.framework.TestCase;

/**
 * Tests for RequestParameterAttributesSource.
 *
 * @author Valery Tydykov
 *
 */
public class RequestParameterAttributesSourceTest extends TestCase {

    private RequestParameterAttributesSource attributesSource;

    @Override
    protected void setUp() throws Exception {
        this.attributesSource = new RequestParameterAttributesSource();
    }

    /**
     * Test method for
     * {@link org.springframework.security.ui.preauth.RequestParameterAttributesSource#obtainAttributes(javax.servlet.http.HttpServletRequest)}
     * .
     */
    public void testObtainAttributes() {
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
        request.addParameter(key1, value1);
        request.addParameter(key2, value2);

        final Map<String, String> attributes = this.attributesSource.obtainAttributes(request);

        assertEquals(value1, attributes.get(key1));
        assertEquals(value2, attributes.get(key2));
        assertEquals(null, attributes.get(key3));
    }

    /**
     * Test method for
     * {@link org.springframework.security.ui.preauth.RequestParameterAttributesSource#afterPropertiesSet()}
     * .
     *
     * @throws Exception If afterPropertiesSet throws exception.
     */
    public void testAfterPropertiesSet() throws Exception {
        try {
            this.attributesSource.afterPropertiesSet();
            fail("exception expected");
        } catch (final Exception e) {
            // exception expected
        }

        final List<String> keys = new ArrayList<String>();
        this.attributesSource.setKeys(keys);
        this.attributesSource.afterPropertiesSet();
    }
}
