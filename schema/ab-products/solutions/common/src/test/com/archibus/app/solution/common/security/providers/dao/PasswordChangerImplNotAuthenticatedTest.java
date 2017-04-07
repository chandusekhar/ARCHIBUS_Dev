package com.archibus.app.solution.common.security.providers.dao;

import com.archibus.app.solution.common.security.providers.dao.*;

/**
 * Tests SecurityService event handler.
 */
public class PasswordChangerImplNotAuthenticatedTest extends
        com.archibus.fixture.IntegrationTestBase {
    private PasswordChangerImpl passwordChanger;
    
    @Override
    protected String[] getConfigLocations() {
        return new String[] { "/context/security/afm_users/password-changer.xml",
                "/context/security/afm_users/password-encoder/archibus/password-encoder.xml",
                "/context/core/core-infrastructure.xml",
                "/context/security/afm_users/useraccount.xml", "appContext-test.xml" };
    }
    
    @Override
    public void onSetUp() throws Exception {
        // user is not logged in
        this.setLogin(false);
        
        super.onSetUp();
    }
    
    public final void testChangePasswordNotAuthenticated() {
        String newPassword = "12345678.";
        String oldPassword = "afm";
        String userId = "AI";
        String projectId = getProjectId();
        
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
    
    /**
     * @return the passwordChanger
     */
    public PasswordChangerImpl getPasswordChanger() {
        return this.passwordChanger;
    }
    
    /**
     * @param passwordChanger the passwordChanger to set
     */
    public void setPasswordChanger(PasswordChangerImpl passwordChanger) {
        this.passwordChanger = passwordChanger;
    }
}
