package com.archibus.app.common.mobile.security.service.impl;

import com.archibus.app.common.mobile.security.service.IMobileSecurityService;
import com.archibus.context.ContextStore;
import com.archibus.datasource.DataSourceTestBase;
import com.archibus.model.RemoteException;
import com.archibus.security.Decoder1;
import com.archibus.utility.ExceptionBase;

/**
 * Integration tests for IMobileSecurityService.
 * 
 * @author Valery Tydykov
 * @since 21.1
 * 
 */
public class MobileSecurityServiceIntegrationTest extends DataSourceTestBase {
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
     * Test method for {@link MobileSecurityService#startMobileUserSessionForDeviceId(String)} .
     */
    public final void testLoginWithDeviceId() {
        this.mobileSecurityService.registerDevice(encrypt(DEVICE_ID_IN_DATABASE), encrypt(TRAM),
            encrypt(AFM), null);
        
        // case #1: deviceId exists in the database
        this.mobileSecurityService
            .startMobileUserSessionForDeviceId(encrypt(DEVICE_ID_IN_DATABASE));
        // verify that user session with correct deviceId exists in SecurityController
        assertEquals(DEVICE_ID_IN_DATABASE, ContextStore.get().getSecurityController()
            .getUserSession().getUserAccount().getMobileDeviceId());
    }
    
    /**
     * Test method for {@link MobileSecurityService#startMobileUserSessionForDeviceId(String)} .
     */
    public final void testLoginWithDeviceIdDeviceNotInDatabase() {
        try {
            // case #2: deviceId does not exist in the database
            this.mobileSecurityService
                .startMobileUserSessionForDeviceId(encrypt(DEVICE_ID_NOT_IN_DATABASE));
            fail(EXCEPTION_EXPECTED);
        } catch (final ExceptionBase exception) {
            assertEquals("This mobile device is not registered.", exception.getLocalizedMessage());
        }
        
        // verify that user session does not exist in SecurityController
        assertEquals(null, ContextStore.get().getSecurityController().getUserSession());
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
     * Test method for {@link MobileSecurityService#registerDevice(String, String, String)} .
     */
    public final void testRegisterDevicePasswordIsNotValid() {
        try {
            // case #3: password is not valid
            this.mobileSecurityService.registerDevice(encrypt(DEVICE_ID_NOT_IN_DATABASE),
                encrypt(TRAM), encrypt("Junk"), null);
            fail(EXCEPTION_EXPECTED);
        } catch (final RemoteException exception) {
            assertEquals("Bad credentials", exception.getDetails());
        }
        
        // verify that user session does not exist in SecurityController
        assertEquals(null, ContextStore.get().getSecurityController().getUserSession());
    }
    
    @Override
    protected String[] getConfigLocations() {
        return new String[] { "/context/security/afm_users/security-service.xml",
                "/context/security/afm_users/password-encoder/archibus/password-encoder.xml",
                "/context/security/afm_users/password-changer.xml",
                "/context/security/afm_users/password-manager.xml",
                "/context/security/afm_users/sql-security/password-changer.xml",
                "/context/security/afm_users/sql-security/password-encoder.xml",
                "/context/security/afm_users/authentication.xml",
                "/context/security/afm_users/useraccount.xml",
                "/context/core/core-infrastructure.xml", "/context/core/password-encryptor.xml",
                "appContext-test.xml", "mobileSecurityService.xml" };
    }
}
