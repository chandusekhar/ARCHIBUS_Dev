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
package org.springframework.security.util;

import java.util.*;

import javax.servlet.http.*;

import org.springframework.util.Assert;

/**
 * Servlet API-related methods.
 *
 * @author Valery Tydykov
 *
 */
public final class ServletUtils {
    /**
     * Utility class should not be instantiated.
     *
     * @throws InstantiationException if caller tries to instantiate this class.
     */
    private ServletUtils() throws InstantiationException {
    }

    /**
     * Extracts from HTTP request values of cookies. The keys for cookies to be extracted must be
     * specified as a <tt>keys</tt> parameter.
     *
     * @param request HTTP request. Must be not null.
     * @param keys List of keys for which cookie values will be extracted. Must be not null.
     * @return Map<key, attribute value>; empty map if no matching cookies found.
     */
    public static Map<String, String> extractCookiesValues(final HttpServletRequest request,
            final List<String> keys) {
        Assert.notNull(request);
        Assert.notNull(keys);

        final Map<String, String> values = new HashMap<String, String>();
        final Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            // for each cookie
            for (final Cookie cookie : cookies) {
                final String key = cookie.getName();

                if (keys.contains(key)) {
                    // found key in the list of the keys to return
                    final String value = cookie.getValue();
                    values.put(key, value);
                }
            }
        }

        return values;
    }

    /**
     * Extracts from HTTP request values of header attributes. The keys for attributes to be
     * extracted must be specified as a <tt>keys</tt> parameter.
     *
     * @param request HTTP request. Must be not null.
     * @param keys List of keys for which attributes will be extracted. Must be not null.
     * @return Map<key, attribute value>; empty map if no matching attributes found; attribute value
     *         will be null if no matching header found.
     */
    public static Map<String, String> extractHeaderValues(final HttpServletRequest request,
            final List<String> keys) {
        Assert.notNull(request);
        Assert.notNull(keys);

        final Map<String, String> values = new HashMap<String, String>();
        // for each key
        for (final String key : keys) {
            final String value = request.getHeader(key);
            values.put(key, value);
        }

        return values;
    }

    /**
     * Extracts from HTTP request values of parameters. The keys for parameters to be extracted must
     * be specified as a <tt>keys</tt> parameter.
     *
     * @param request HTTP request. Must be not null.
     * @param keys List of keys for which parameters will be extracted. Must be not null.
     * @return Map<key, parameter value>; empty map if no matching parameters found; parameter value
     *         will be null if no matching parameter key found.
     */
    public static Map<String, String> extractParameterValues(final HttpServletRequest request,
            final List<String> keys) {
        Assert.notNull(request);
        Assert.notNull(keys);

        final Map<String, String> values = new HashMap<String, String>();
        // for each key
        for (final String key : keys) {
            final String value = request.getParameter(key);
            values.put(key, value);
        }

        return values;
    }

    /**
     * Find value of the cookie. The cookie to be found is specified by the <tt>key</tt> parameter.
     *
     * @param request HTTP request. Must be not null.
     * @param key Key for which cookie will be searched.
     * @return Value of the cookie found, or null, if not found.
     */
    public static String findCookieValue(final HttpServletRequest request, final String key) {
        Assert.notNull(request);

        String value = null;
        final Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            // find cookie key
            for (final Cookie cookie : cookies) {
                if (StringUtils.notNull(cookie.getName()).equals(key)) {
                    // cookie key found
                    value = cookie.getValue();
                    break;
                }
            }
        }

        return value;
    }
}
