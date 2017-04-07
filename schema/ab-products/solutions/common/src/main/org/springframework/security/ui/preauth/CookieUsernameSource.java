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

import javax.servlet.http.HttpServletRequest;

import org.springframework.security.util.ServletUtils;

/**
 * Source of the username supplied with pre-authenticated authentication request as cookie. The
 * <tt>usernameKey</tt> property must be set, which will be used to extract the username from the
 * cookie.
 *
 * @author Valery Tydykov
 *
 */
public class CookieUsernameSource extends AbstractUsernameSource {
    @Override
    public String obtainUsername(final HttpServletRequest request) {
        final String username = ServletUtils.findCookieValue(request, this.getUsernameKey());

        if (this.logger.isDebugEnabled()) {
            this.logger.debug("Obtained username=[" + username + "] from cookie");
        }

        return username;
    }
}
