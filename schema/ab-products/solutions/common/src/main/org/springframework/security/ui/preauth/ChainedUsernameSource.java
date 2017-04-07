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

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.logging.*;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.util.Assert;

/**
 * Source of the username supplied with pre-authenticated authentication request. Delegates
 * processing to the chain of UsernameSource beans. Each bean in the chain will try to extract
 * username from the request, until username is not empty.
 *
 * @author Valery Tydykov
 *
 */
public class ChainedUsernameSource implements UsernameSource, InitializingBean {
    /**
     * Logger for this class and subclasses.
     */
    protected final Log logger = LogFactory.getLog(this.getClass());

    /**
     * Chain of UsernameSource beans.
     */
    private List<UsernameSource> usernameSources = new ArrayList<UsernameSource>();

    @Override
    public void afterPropertiesSet() {
        Assert.notNull(this.usernameSources, "usernameSources must be not null");
    }

    /**
     * Getter for the usernameSources property.
     *
     * @see usernameSources
     * @return the usernameSources property.
     */
    public List<UsernameSource> getUsernameSources() {
        return this.usernameSources;
    }

    @Override
    public String obtainUsername(final HttpServletRequest request) {
        String userName = null;
        // for each UsernameSource in the chain
        for (final UsernameSource usernameSource : this.usernameSources) {
            userName = usernameSource.obtainUsername(request);

            // stop processing if userName is not empty
            if (userName != null && userName.length() > 0) {
                break;
            }
        }

        if (this.logger.isDebugEnabled()) {
            this.logger.debug("Obtained username=[" + userName + "] from request parameter");
        }

        return userName;
    }

    /**
     * Setter for the usernameSources property.
     *
     * @see usernameSources
     * @param usernameSources the usernameSources to set
     */
    public void setUsernameSources(final List<UsernameSource> usernameSources) {
        this.usernameSources = usernameSources;
    }
}
