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

import org.apache.commons.logging.*;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.util.Assert;

/**
 * Abstract implementation of UsernameSource interface. Provides logger and properties common for
 * most implementations.
 *
 * @author Valery Tydykov
 *
 */
public abstract class AbstractUsernameSource implements UsernameSource, InitializingBean {
    /**
     * Logger for this class and subclasses.
     */
    protected final Log logger = LogFactory.getLog(this.getClass());

    /**
     * Property: Key for username.
     */
    private String usernameKey;

    @Override
    public void afterPropertiesSet() {
        Assert.hasLength(this.usernameKey, "usernameKey must be not empty");
    }

    /**
     * Getter for the usernameKey property.
     *
     * @see usernameKey
     * @return the usernameKey property.
     */
    public String getUsernameKey() {
        return this.usernameKey;
    }

    /**
     * Setter for the usernameKey property.
     *
     * @see usernameKey
     * @param usernameKey the usernameKey to set.
     */
    public void setUsernameKey(final String usernameKey) {
        this.usernameKey = usernameKey;
    }
}
