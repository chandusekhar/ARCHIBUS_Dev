/**
 *
 */
package org.springframework.security.ui.preauth;

import java.util.*;

import javax.servlet.http.Cookie;

import org.springframework.mock.web.MockHttpServletRequest;

import junit.framework.TestCase;

/**
 * Tests for AttributesSourceWebAuthenticationDetailsSource.
 *
 * @author Valery Tydykov
 *
 */
public class AttributesSourceWebAuthenticationDetailsSourceTest extends TestCase {

    AttributesSourceWebAuthenticationDetailsSource authenticationDetailsSource;

    @Override
    protected void setUp() throws Exception {
        this.authenticationDetailsSource = new AttributesSourceWebAuthenticationDetailsSource();
    }

    /**
     * Test method for
     * {@link org.springframework.security.ui.preauth.AttributesSourceWebAuthenticationDetailsSource#buildDetails(java.lang.Object)}
     * .
     */
    public final void testBuildDetailsObjectHeader() {
        final String key1 = "key1";
        final String value1 = "value1";
        final String key2 = "key2";
        final String value2 = "value2";
        final String key3 = "key3";
        final String value3 = "value3";

        {
            final HeaderAttributesSource attributesSource = new HeaderAttributesSource();

            {
                final List keys = new ArrayList();
                keys.add(key1);
                keys.add(key2);
                keys.add(key3);
                attributesSource.setKeys(keys);
            }

            this.authenticationDetailsSource.setAttributesSource(attributesSource);
        }

        final MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader(key1, value1);
        request.addHeader(key2, value2);
        request.addHeader(key3, value3);
        final AuthenticationDetailsImpl authenticationDetails =
                (AuthenticationDetailsImpl) this.authenticationDetailsSource.buildDetails(request);

        assertEquals(value1, authenticationDetails.getAttributes().get(key1));
        assertEquals(value2, authenticationDetails.getAttributes().get(key2));
        assertEquals(value3, authenticationDetails.getAttributes().get(key3));
    }

    public final void testBuildDetailsObjectCookie() {
        final String key1 = "key1";
        final String value1 = "value1";
        final String key2 = "key2";
        final String value2 = "value2";
        final String key3 = "key3";
        final String value3 = "value3";

        {
            final CookieAttributesSource attributesSource = new CookieAttributesSource();

            {
                final List keys = new ArrayList();
                keys.add(key1);
                keys.add(key2);
                keys.add(key3);
                attributesSource.setKeys(keys);
            }

            this.authenticationDetailsSource.setAttributesSource(attributesSource);
        }

        final MockHttpServletRequest request = new MockHttpServletRequest();

        {
            final Cookie[] cookies = new Cookie[] { new Cookie(key1, value1),
                    new Cookie(key2, value2), new Cookie(key3, value3) };
            request.setCookies(cookies);
        }

        final AuthenticationDetailsImpl authenticationDetails =
                (AuthenticationDetailsImpl) this.authenticationDetailsSource.buildDetails(request);

        assertEquals(value1, authenticationDetails.getAttributes().get(key1));
        assertEquals(value2, authenticationDetails.getAttributes().get(key2));
        assertEquals(value3, authenticationDetails.getAttributes().get(key3));
    }

    public final void testBuildDetailsObjectProperty() {
        final String key1 = "key1";
        final String value1 = "value1";
        final String key2 = "key2";
        final String value2 = "value2";
        final String key3 = "key3";
        final String value3 = "value3";

        {
            final PropertyAttributesSource attributesSource = new PropertyAttributesSource();

            {
                final Map attributes = new HashMap();
                attributes.put(key1, value1);
                attributes.put(key2, value2);
                attributes.put(key3, value3);
                attributesSource.setAttributes(attributes);
            }

            this.authenticationDetailsSource.setAttributesSource(attributesSource);
        }

        final MockHttpServletRequest request = new MockHttpServletRequest();

        final AuthenticationDetailsImpl authenticationDetails =
                (AuthenticationDetailsImpl) this.authenticationDetailsSource.buildDetails(request);

        assertEquals(value1, authenticationDetails.getAttributes().get(key1));
        assertEquals(value2, authenticationDetails.getAttributes().get(key2));
        assertEquals(value3, authenticationDetails.getAttributes().get(key3));
    }

    public final void testSetUsername() {
        try {
            this.authenticationDetailsSource.setAttributesSource(null);
            fail("exception expected");
        } catch (final IllegalArgumentException expected) {
        } catch (final Exception unexpected) {
            fail("unexpected exception");
        }
    }

    public final void testAfterPropertiesSet() {
        try {
            this.authenticationDetailsSource.afterPropertiesSet();
            fail("expected exception");
        } catch (final IllegalArgumentException expected) {
        } catch (final Exception unexpected) {
            fail("unexpected exception");
        }
    }
}
