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

import java.text.MessageFormat;

import javax.servlet.http.HttpServletRequest;

import org.springframework.util.StringUtils;

/**
 * Source of the username supplied with pre-authenticated authentication request as request
 * parameter. The <tt>usernameKey</tt> property must be set, which will be used to extract the
 * username from the request parameter. The <tt>validReferers</tt> property must be set, which will
 * be used to verify if request is valid.
 * <p>
 * HTTP request parameter can be modified by the user, which is not very secure. For additional
 * protection RequestParameterUsernameSource will:
 * <p>
 * 1. Verify that POST method was used.
 * <p>
 * 2. Verify that request has valid referer.
 *
 * @author Valery Tydykov
 * @author Joel Emery
 *
 */
public class RequestParameterUsernameSource extends AbstractUsernameSource {
    /**
     * Constant: HTTP referer.
     */
    public static final String REFERER = "referer";

    /**
     * Constant: HTTP post method name.
     */
    private static final String METHOD_POST = "POST";

    /**
     * Property: List of valid HTTP referers.
     */
    private String[] validReferers;

    /**
     * Getter for the validReferers property.
     *
     * @see validReferers
     * @return the validReferers property.
     */
    public String[] getValidReferers() {
        return this.validReferers.clone();
    }

    @Override
    public String obtainUsername(final HttpServletRequest request) {
        final String userName = request.getParameter(this.getUsernameKey());

        if (this.logger.isDebugEnabled()) {
            this.logger.debug("Obtained username=[" + userName + "] from request parameter");
        }

        String result = null;

        // if username supplied, verify request
        if (StringUtils.hasText(userName) && verifyRequest(request)) {
            // request is valid
            result = userName;
        }

        return result;
    }

    /**
     * Setter for the validReferers property.
     *
     * @see validReferers
     * @param validReferers the validReferers to set
     */

    public void setValidReferers(final String[] validReferers) {
        this.validReferers = validReferers.clone();
    }

    /**
     * Returns true if referer in request header is valid.
     *
     * @param request to be verified.
     * @return true if referer in request header is valid.
     */
    private boolean isValidReferer(final HttpServletRequest request) {
        final String referer = request.getHeader(REFERER);
        if (this.logger.isDebugEnabled()) {
            this.logger.debug("Request Referer=[" + referer + "]");
        }

        boolean result = false;
        // if no validReferers specified, is valid
        if (this.validReferers == null || this.validReferers.length == 0) {
            result = true;
        } else {
            boolean isValidReferer = false;

            if (referer != null) {
                isValidReferer = isValidReferer(referer);
            }

            result = isValidReferer;
        }

        return result;
    }

    /**
     * Returns true if referer in is in list of valid referers.
     *
     * @param referer to be verified.
     * @return true if referer is valid.
     */
    private boolean isValidReferer(final String referer) {
        boolean result = false;

        for (final String validReferer : this.validReferers) {
            if (referer.equalsIgnoreCase(validReferer)) {
                result = true;
                break;
            }
        }

        return result;
    }

    /**
     * Verifies that request is secure: that POST method was used, that request has valid referer.
     *
     * @param request request to be verified.
     * @return true if request passes verification.
     */
    private boolean verifyRequest(final HttpServletRequest request) {
        boolean result = true;

        // HTTP request parameter can be modified by the user, which is not very secure.
        // For additional protection, verify that POST method was used.
        if (!METHOD_POST.equalsIgnoreCase(request.getMethod())) {
            // method is not POST
            {
                // @non-translatable
                final String errorMessage =
                        "non-POST method was used in HTTP request to provide username. Only POST method is allowed when supplying username as HTTP request parameter.";
                this.logger.error(errorMessage);
            }

            result = false;
        }

        // For additional protection, verify that request has valid referer.
        if (!isValidReferer(request)) {
            // referer is not valid
            {
                // @non-translatable
                final String errorMessage = MessageFormat.format(
                    "Invalid referer=[{0}] was used in HTTP request to provide username.",
                    request.getHeader(REFERER));
                this.logger.error(errorMessage);
            }

            result = false;
        }

        return result;
    }
}
