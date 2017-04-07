/**
 *
 */
package org.springframework.security.ui.preauth;

import javax.servlet.http.Cookie;

import org.springframework.mock.web.MockHttpServletRequest;

import junit.framework.TestCase;

/**
 * Tests for CookieUsernameSource.
 *
 * @author tydykov
 *
 */
public class CookieUsernameSourceTest extends TestCase {

    CookieUsernameSource usernameSource;

    @Override
    protected void setUp() throws Exception {
        this.usernameSource = new CookieUsernameSource();
    }

    public final void testObtainUsernameSupplied() {
        final String key1 = "key1";
        final String value1 = "value1";

        final MockHttpServletRequest request = new MockHttpServletRequest();
        {
            final Cookie[] cookies = new Cookie[] { new Cookie(key1, value1) };
            request.setCookies(cookies);
        }

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
