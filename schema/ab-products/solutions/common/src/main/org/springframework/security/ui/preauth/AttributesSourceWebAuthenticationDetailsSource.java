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

import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.InitializingBean;
import org.springframework.security.web.authentication.*;
import org.springframework.util.Assert;

/**
 * Implementation of AuthenticationDetailsSource which builds the details object from an
 * <tt>HttpServletRequest</tt> object.
 * <p>
 * Uses <code>attributesSource</code> to obtain attributes from the request. Adds obtained
 * attributes to created details object. The details object must be an instance of
 * <tt>AuthenticationDetailsImpl</tt>, which has additional <tt>attributes</tt> property.
 *
 * @author Valery Tydykov
 */
public class AttributesSourceWebAuthenticationDetailsSource extends WebAuthenticationDetailsSource
        implements InitializingBean {

    /**
     * Property: Source of attributes.
     */
    private AttributesSource attributesSource;

    @Override
    public void afterPropertiesSet() {
        Assert.notNull(this.attributesSource, "attributesSource must be set");
    }

    @Override
    public WebAuthenticationDetails buildDetails(final HttpServletRequest context) {
        // build AuthenticationDetailsImpl object
        final AuthenticationDetailsImpl result = new AuthenticationDetailsImpl(context);

        // extract attributes from the request
        final Map<String, String> attributes = this.attributesSource.obtainAttributes(context);

        // add additional attributes to the AuthenticationDetailsImpl object
        // add attributes from the AttributesSource to the AuthenticationDetailsImpl object
        result.getAttributes().putAll(attributes);

        return result;
    }

    /**
     * @param attributesSource the attributesSource to set
     */
    public void setAttributesSource(final AttributesSource attributesSource) {
        Assert.notNull(attributesSource, "attributesSource must not be null");
        this.attributesSource = attributesSource;
    }
}
