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

/**
 * String manipulation methods.
 *
 * @author Valery Tydykov
 *
 */
public final class StringUtils {

    /**
     * Utility class should not be instantiated.
     *
     * @throws InstantiationException if caller tries to instantiate this class.
     */
    private StringUtils() throws InstantiationException {
    }

    /**
     * Returns a string that is not null. Converts object to String if object is not String.
     *
     * @param object to be converted to String, might be null.
     * @return empty string if the original was null, else the original string or object converted
     *         to String.
     */
    public static String notNull(final Object object) {
        String result;

        if (object == null) {
            result = "";
        } else if (object instanceof String) {
            result = (String) object;
        } else {
            result = String.valueOf(object);
        }

        return result;
    }

    /**
     * Tokenizes source string using another string as separator.
     *
     * @param source source string.
     * @param separator separator string.
     * @return List of tokens found in the source string.
     */
    public static List<String> tokenizeString(final String source, final String separator) {
        final List<String> tokens = new ArrayList<String>();
        if (org.springframework.util.StringUtils.hasText(source)) {
            String remaining = source;
            while (remaining.indexOf(separator) != -1) {
                final int index = remaining.indexOf(separator);
                tokens.add(remaining.substring(0, index));
                remaining = remaining.substring(index + separator.length());
            }

            tokens.add(remaining);
        }

        return tokens;
    }
}
