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

import org.springframework.security.util.ServletUtils;

/**
 * Source of the attributes associated with pre-authenticated authentication request. The attributes
 * can be supplied in the request header. The keys for values to be extracted must be specified as a
 * <tt>keys</tt> property.
 *
 * @author Valery Tydykov
 *
 */
public class HeaderAttributesSource extends AbstractAttributesSource {
    @Override
    public Map<String, String> obtainAttributes(final HttpServletRequest request) {
        final Map<String, String> attributes =
                ServletUtils.extractHeaderValues(request, this.getKeys());

        if (this.logger.isDebugEnabled()) {
            this.logger.debug("Obtained attributes=[" + attributes + "] from header");
        }

        return attributes;
    }
}
