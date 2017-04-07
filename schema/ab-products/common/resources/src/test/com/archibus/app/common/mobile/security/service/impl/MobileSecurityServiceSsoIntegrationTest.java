package com.archibus.app.common.mobile.security.service.impl;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.*;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.preauth.PreAuthenticatedAuthenticationToken;

import com.archibus.app.common.mobile.security.service.IMobileSecurityService;
import com.archibus.context.ContextStore;
import com.archibus.datasource.DataSourceTestBase;
import com.archibus.security.Decoder1;

/**
 * Integration tests for IMobileSecurityService.
 *
 * @author Valery Tydykov
 * @since 21.1
 *
 */
public class MobileSecurityServiceSsoIntegrationTest extends DataSourceTestBase {
    static final String EXCEPTION_EXPECTED = "Exception expected";
    
    private static final String AFM = "afm";
    
    private static final String TRAM = "TRAM";
    
    private static final String DEVICE_ID_IN_DATABASE = "46FB6E5B-9A61-4C53-838D-F2521618A1A1";
    
    private static final String DEVICE_ID_NOT_IN_DATABASE = "JunkDeviceId";
    
    private IMobileSecurityService mobileSecurityService;
    
    private static String encrypt(final String input) {
        return new Decoder1().encode(input);
    }
    
    /**
     * Getter for the mobileSecurityService property.
     *
     * @see mobileSecurityService
     * @return the mobileSecurityService property.
     */
    public IMobileSecurityService getMobileSecurityService() {
        return this.mobileSecurityService;
    }
    
    @Override
    public void onSetUp() throws Exception {
        // user is not logged in
        this.setLogin(false);
        
        super.onSetUp();
        
        preparePreauthContext(TRAM);
    }
    
    /**
     * Setter for the mobileSecurityService property.
     *
     * @see mobileSecurityService
     * @param mobileSecurityService the mobileSecurityService to set
     */
    
    public void setMobileSecurityService(final IMobileSecurityService mobileSecurityService) {
        this.mobileSecurityService = mobileSecurityService;
    }
    
    /**
     * Test method for {@link MobileSecurityService#registerDevice(String, String, String)} .
     */
    public final void testRegisterDeviceDeviceInDatabase() {
        // case #1: deviceId exists in the database
        this.mobileSecurityService.registerDevice(encrypt(DEVICE_ID_IN_DATABASE), encrypt(TRAM),
            encrypt(AFM), null);
        
        // verify that user session does not exist in SecurityController
        assertEquals(null, ContextStore.get().getSecurityController().getUserSession());
    }
    
    /**
     * Test method for {@link MobileSecurityService#registerDevice(String, String, String)} .
     */
    public final void testRegisterDeviceDeviceNotInDatabase() {
        // case #2: deviceId does not exist in the database
        this.mobileSecurityService.registerDevice(encrypt(DEVICE_ID_NOT_IN_DATABASE),
            encrypt(TRAM), encrypt(AFM), null);
        
        // verify that user session does not exist in SecurityController
        assertEquals(null, ContextStore.get().getSecurityController().getUserSession());
    }
    
    /**
     * Test method for {@link MobileSecurityService#startMobileSsoUserSession()} .
     */
    public final void testStartMobileSsoUserSession() {
        this.mobileSecurityService.startMobileSsoUserSession();
    }
    
    static void preparePreauthContext(final String username) {
        final SecurityContext securityContext = SecurityContextHolder.getContext();
        final UserDetails userDetails = MobileSecurityServiceTest.prepareUserDetails(username);
        final Authentication authentication =
                new PreAuthenticatedAuthenticationToken(userDetails, null);
        authentication.setAuthenticated(true);
        
        securityContext.setAuthentication(authentication);
    }
    
    @Override
    protected String[] getConfigLocations() {
        return new String[] { "/context/security/afm_users/security-service.xml",
                "/context/security/preauth/authentication.xml",
                "/context/security/preauth/account-mapper.xml",
                "/com/archibus/app/solution/common/security/providers/dao/credentials.xml",
                "/context/security/afm_users/password-encoder/archibus/password-encoder.xml",
                "/context/security/afm_users/password-changer.xml",
                "/context/security/afm_users/password-manager.xml",
                "/context/security/afm_users/sql-security/password-changer.xml",
                "/context/security/afm_users/sql-security/password-encoder.xml",
                "/context/security/afm_users/authentication.xml",
                "/context/security/afm_users/useraccount.xml",
                "/context/core/core-infrastructure.xml", "/context/core/password-encryptor.xml",
                "appContext-test.xml", "mobileSecurityService-sso.xml" };
    }
}
