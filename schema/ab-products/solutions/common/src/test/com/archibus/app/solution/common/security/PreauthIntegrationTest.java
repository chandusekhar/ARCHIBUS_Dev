package com.archibus.app.solution.common.security;

import java.io.IOException;

import javax.servlet.*;

import org.springframework.mock.web.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.ui.preauth.UsernameSourcePreAuthenticatedProcessingFilter;

import com.archibus.security.UserDetailsImpl;

/**
 * Integration test for security in preauth/property configuration. Loads complete preauth
 * configuration, including filters. Tests filters at the HTTP request/response level.
 *
 * @author Valery Tydykov
 *
 */
public class PreauthIntegrationTest extends com.archibus.fixture.IntegrationTestBase {
    private UsernameSourcePreAuthenticatedProcessingFilter filter;

    /*
     * (non-Javadoc)
     *
     * @see com.archibus.fixture.ServiceTestBase#onSetUp()
     */
    @Override
    public void onSetUp() throws Exception {
        this.setLogin(false);
        super.onSetUp();

        // crear security context
        SecurityContextHolder.getContext().setAuthentication(null);
    }

    /*
     * (non-Javadoc)
     *
     * @see com.archibus.fixture.ServiceTestBase#onTearDown()
     */
    @Override
    public void onTearDown() {
        // crear security context
        SecurityContextHolder.getContext().setAuthentication(null);

        super.onTearDown();
    }

    @Override
    protected String[] getConfigLocations() {
        return new String[] { "/context/controls/drawing/controls-drawing.xml",
                "/context/rendering/jsp/filters-chain-rendering.xml",
                "/context/rendering/jsp/filters.xml",
                "/context/rendering/jsp/filters-rendering.xml",
                "/config/context/security/preauth/filters.xml",
                "/context/security/preauth/authentication-details-source.xml",
                "/context/security/preauth/username-source/remote-user/username-source.xml",
                "/context/security/preauth/projectid-source/property/projectid-source.xml",
                "/context/security/afm_users/useraccount.xml",
                "/context/security/preauth/security-service.xml",
                "/context/security/preauth/authentication.xml",
                "/context/security/preauth/account-mapper.xml",
                "/context/core/core-infrastructure.xml", "appContext-test.xml",
        "/context/core/password-encryptor.xml" };
    }

    public void testAuthenticate() throws IOException, ServletException {
        final MockHttpServletRequest request = new MockHttpServletRequest();
        final String username = getUserId();
        request.setRemoteUser(username);

        final FilterChain filterChain = new MockFilterChain();
        final MockHttpServletResponse response = new MockHttpServletResponse();
        this.filter.doFilter(request, response, filterChain);

        final org.springframework.security.core.Authentication result =
                SecurityContextHolder.getContext().getAuthentication();

        assertTrue(result != null);
        assertEquals(getUserId(), ((UserDetailsImpl) result.getPrincipal()).getUsername());
    }

    /**
     * @return the filter
     */
    public UsernameSourcePreAuthenticatedProcessingFilter getFilter() {
        return this.filter;
    }

    /**
     * @param filter the filter to set
     */
    public void setFilter(final UsernameSourcePreAuthenticatedProcessingFilter filter) {
        this.filter = filter;
    }
}
