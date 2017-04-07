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

import org.apache.commons.logging.*;
import org.springframework.util.StringUtils;

/**
 * Source of the username supplied with pre-authenticated authentication request as remote user
 * header value. Optionally can strip prefix: "domain\\username" -> "username", if
 * <tt>stripPrefix</tt> property value is "true".
 *
 * @author Valery Tydykov
 *
 */
public class RemoteUserUsernameSource implements UsernameSource {
    /**
     * Logger for this class and subclasses.
     */
    protected final Log logger = LogFactory.getLog(this.getClass());

    /**
     * Property: If true strip prefix: "domain\\username" -> "username".
     */
    private boolean stripPrefix = true;

    /**
     * @return the stripPrefix
     */
    public boolean isStripPrefix() {
        return this.stripPrefix;
    }

    @Override
    public String obtainUsername(final HttpServletRequest request) {
        String username = request.getRemoteUser();

        if (this.stripPrefix) {
            username = this.removePrefix(username);
        }

        if (this.logger.isDebugEnabled()) {
            this.logger.debug("Obtained username=[" + username + "] from remote user");
        }

        return username;
    }

    /**
     * @param stripPrefix the stripPrefix to set
     */
    public void setStripPrefix(final boolean stripPrefix) {
        this.stripPrefix = stripPrefix;
    }

    /**
     * Removes prefix from userName: "domain\\username" -> "username".
     *
     * @param userName to strip prefix from
     * @return userName without prefix.
     */
    private String removePrefix(final String userName) {
        String result = userName;

        if (StringUtils.hasText(userName)) {
            final int index = userName.lastIndexOf('\\');
            if (index != -1) {
                result = userName.substring(index + 1);
            }
        }

        return result;
    }
}
