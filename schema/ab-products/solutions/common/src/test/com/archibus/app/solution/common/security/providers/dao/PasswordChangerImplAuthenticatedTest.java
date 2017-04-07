package com.archibus.app.solution.common.security.providers.dao;

import com.archibus.app.solution.common.security.providers.dao.*;

/**
 * Tests SecurityService event handler.
 */
public class PasswordChangerImplAuthenticatedTest extends com.archibus.fixture.IntegrationTestBase {
    private PasswordChangerImpl passwordChanger;
    
    /**
     * @return the passwordChanger
     */
    public PasswordChangerImpl getPasswordChanger() {
        return this.passwordChanger;
    }
    
    /**
     * @param passwordChanger the passwordChanger to set
     */
    public void setPasswordChanger(final PasswordChangerImpl passwordChanger) {
        this.passwordChanger = passwordChanger;
    }
    
    /**
     * Test method for
     * {@link com.archibus.app.solution.common.security.providers.dao.PasswordChangerImpl#changePassword(java.lang.String, java.lang.String, java.lang.String, java.lang.String)}
     * .
     */
    public final void testChangePasswordAuthenticated() {
        final String newPassword = "12345678.";
        final String oldPassword = "afm";
        final String userId = "AI";
        final String projectId = null;
        
        this.passwordChanger.changePassword(userId, oldPassword, newPassword, projectId);
        
        // change password back to the original value, which does not conform to the new policy:
        // modify policy to allow old password
        ((PasswordPatternValidatorImpl) this.passwordChanger.getPasswordPatternValidator())
            .setMinimumLength(0);
        ((PasswordPatternValidatorImpl) this.passwordChanger.getPasswordPatternValidator())
            .setMustIncludeNumbers(false);
        ((PasswordPatternValidatorImpl) this.passwordChanger.getPasswordPatternValidator())
            .setMustIncludePunctuation(false);
        this.passwordChanger.changePassword(userId, newPassword, oldPassword, projectId);
    }
    
    @Override
    protected String[] getConfigLocations() {
        return new String[] { "/context/security/afm_users/password-changer.xml",
                "/context/security/afm_users/password-encoder/archibus/password-encoder.xml",
                "/context/core/core-infrastructure.xml",
                "/context/security/afm_users/useraccount.xml", "appContext-test.xml" };
    }
}
