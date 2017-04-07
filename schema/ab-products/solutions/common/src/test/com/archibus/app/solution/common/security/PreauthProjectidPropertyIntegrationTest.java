package com.archibus.app.solution.common.security;

import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.authentication.AuthenticationDetailsSource;
import org.springframework.security.ui.preauth.AuthenticationDetailsImpl;

/**
 * Integration test for preauth/projectid-source/property/ configuration.
 *
 * @author Valery Tydykov
 *
 */
public class PreauthProjectidPropertyIntegrationTest extends
com.archibus.fixture.IntegrationTestBase {
    AuthenticationDetailsSource authenticationDetailsSource;

    /*
     * (non-Javadoc)
     *
     * @see com.archibus.fixture.ServiceTestBase#onSetUp()
     */
    @Override
    public void onSetUp() throws Exception {
        this.setLogin(false);
        super.onSetUp();
    }

    /*
     * (non-Javadoc)
     *
     * @see com.archibus.fixture.ServiceTestBase#onTearDown()
     */
    @Override
    public void onTearDown() {
        super.onTearDown();
    }

    @Override
    protected String[] getConfigLocations() {
        return new String[] { "/context/core/core-infrastructure.xml", "appContext-test.xml",
                "/context/security/preauth/authentication-details-source.xml",
        "/context/security/preauth/projectid-source/property/projectid-source.xml" };
    }

    public void testBuildDetailsFromProperty() {
        final MockHttpServletRequest request = new MockHttpServletRequest();

        final AuthenticationDetailsImpl authenticationDetails =
                (AuthenticationDetailsImpl) this.authenticationDetailsSource.buildDetails(request);

        assertEquals(getProjectId(), authenticationDetails.getAttributes().get("projectId"));
    }

    /**
     * @return the authenticationDetailsSource
     */
    public AuthenticationDetailsSource getAuthenticationDetailsSource() {
        return this.authenticationDetailsSource;
    }

    /**
     * @param authenticationDetailsSource the authenticationDetailsSource to set
     */
    public void setAuthenticationDetailsSource(
            final org.springframework.security.authentication.AuthenticationDetailsSource authenticationDetailsSource) {
        this.authenticationDetailsSource = authenticationDetailsSource;
    }
}
