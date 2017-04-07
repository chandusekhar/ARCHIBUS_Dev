package com.archibus.app.common.mobile.security.service.impl;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.*;
import org.springframework.security.web.authentication.preauth.PreAuthenticatedAuthenticationToken;
import org.springframework.util.Assert;

import com.archibus.app.common.mobile.security.dao.*;
import com.archibus.app.common.mobile.security.service.IMobileSecurityService;
import com.archibus.context.*;
import com.archibus.model.licensing.MobileLicenseManager;
import com.archibus.security.*;
import com.archibus.security.providers.encryption.Encryptor;
import com.archibus.service.remoting.*;
import com.archibus.utility.ExceptionBase;

/**
 * <p>
 * Implementation of <code>IMobileSecurityService</code>.
 * <p>
 * This is a singleton bean managed by Spring, configured in
 * /schema/ab-products/common/resources/src/main/com/archibus/app/common/mobile/services.xml.
 * <p>
 * Exposed to JavaScript clients through DWR, configured in /WEB-INF/dwr.xml.
 *
 * @author Valery Tydykov
 * @since 21.1
 *
 */
public class MobileSecurityService implements IMobileSecurityService, InitializingBean {
    /**
     * Logger for this class and subclasses.
     */
    protected final Logger logger = Logger.getLogger(this.getClass());

    /**
     * Property: authenticationManager. Used to authenticate user in non-SSO configurations.
     */
    private AuthenticationManager authenticationManager;

    /**
     * Property: mobileLicenseManager. Required.
     */
    private MobileLicenseManager mobileLicenseManager;

    /**
     * SecurityService. Used by startMobileSsoUserSession().
     */
    private SecurityService securityService;

    /**
     * DAO for UserAccount. Used for operations with UserAccount,
     * com.archibus.security.UserAccount.ThreadSafe, UserDetails.
     */
    private IUserAccountDao userAccountDao;

    /**
     * DAO for the Registration Log.
     */
    private IRegistrationLogDao registrationLogDao;

    /**
     * Property: sqlitePassphrase. Has value of mobileServices.sqlitePassphrase property from
     * mobileservices.properties file, set in security-service.xml. Contains passphrase in clear
     * text, or empty string (which indicates that the mobile client database should not be
     * encrypted). Optional.
     */
    private String sqlitePassphrase;

    /**
     * Property: securityConfiguration. Has value of security.configurationFile property from
     * security.properties file, set in security-service.xml. Typical value: "afm_users".
     */
    private String securityConfiguration;

    /**
     * Encryptor for password and other sensitive values. Used by registerDevice().
     */
    private Encryptor encryptor;

    /**
     * {@inheritDoc}
     * <p>
     * Suppress Warning "PMD.SignatureDeclareThrowsException"
     * <p>
     * Justification: This method implements Spring interface.
     */
    @Override
    @SuppressWarnings({ "PMD.SignatureDeclareThrowsException" })
    public void afterPropertiesSet() throws Exception {
        Assert.hasLength(this.securityConfiguration, "securityConfiguration must have length");
        Assert.notNull(this.securityService, "securityService must be supplied");
        Assert.notNull(this.userAccountDao, "userAccountDao must be supplied");
        Assert.notNull(this.mobileLicenseManager, "mobileLicenseManager must be supplied");
        Assert.notNull(this.registrationLogDao, "registrationLogDao must be supplied");
    }

    /**
     * Getter for the authenticationManager property.
     *
     * @see authenticationManager
     * @return the authenticationManager property.
     */
    public AuthenticationManager getAuthenticationManager() {
        return this.authenticationManager;
    }

    /**
     * Getter for the mobileLicenseManager property.
     *
     * @see mobileLicenseManager
     * @return the mobileLicenseManager property.
     */
    public MobileLicenseManager getMobileLicenseManager() {
        return this.mobileLicenseManager;
    }

    /**
     * Getter for the securityConfiguration property.
     *
     * @see securityConfiguration
     * @return the securityConfiguration property.
     */
    public String getSecurityConfiguration() {
        return this.securityConfiguration;
    }

    /**
     * Getter for the securityService property.
     *
     * @see securityService
     * @return the securityService property.
     */
    public SecurityService getSecurityService() {
        return this.securityService;
    }

    /**
     * Getter for the sqlitePassphrase property.
     *
     * @see sqlitePassphrase.
     * @return the sqlitePassphrase property.
     */
    @Override
    public String getSqlitePassphrase() {
        return this.sqlitePassphrase;
    }

    /**
     * Getter for the userAccountDao property.
     *
     * @see userAccountDao
     * @return the userAccountDao property.
     */
    public IUserAccountDao getUserAccountDao() {
        return this.userAccountDao;
    }

    @Override
    public void registerDevice(final String deviceId, final String username, final String password,
            final String localeName) throws ExceptionBase {
        // decrypt deviceId, username, password
        final String deviceIdDecrypted = this.encryptor.decrypt(deviceId);
        final String usernameDecrypted = this.encryptor.decrypt(username);
        final String passwordDecrypted = this.encryptor.decrypt(password);

        registerDeviceDo(deviceIdDecrypted, usernameDecrypted, passwordDecrypted);
    }

    /**
     * Getter for the encryptor property.
     *
     * @see encryptor
     * @return the encryptor property.
     */
    public Encryptor getEncryptor() {
        return this.encryptor;
    }

    /**
     * Setter for the encryptor property.
     *
     * @see encryptor
     * @param encryptor the encryptor to set
     */

    public void setEncryptor(final Encryptor encryptor) {
        this.encryptor = encryptor;
    }

    /**
     * See
     * {@link MobileSecurityService#registerDevice(java.lang.String, java.lang.String, java.lang.String)}
     * .
     *
     * @param deviceId id of the device to be registered. Not encrypted.
     * @param username of the user to be authenticated. Used in non-SSO configuration. Not
     *            encrypted.
     * @param password of the user to be authenticated. Used in non-SSO configuration. Not
     *            encrypted.
     */
    public void registerDeviceDo(final String deviceId, final String username, final String password) {
        if (this.logger.isInfoEnabled()) {
            this.logger.info(String.format("registerDevice with deviceId=[%s], username=[%s]",
                deviceId, username));
        }

        final com.archibus.security.UserAccount.ThreadSafe userAccount =
                MobileSecurityServiceUtilities.authenticate(username, password,
                    this.securityConfiguration, this.authenticationManager);

        userAccount.checkIfEnabledForMobileAccess();

        this.userAccountDao.registerDevice(deviceId, userAccount);
    }

    /**
     * Setter for the authenticationManager property.
     *
     * @see authenticationManager
     * @param authenticationManager the authenticationManager to set.
     */
    public void setAuthenticationManager(final AuthenticationManager authenticationManager) {
        this.authenticationManager = authenticationManager;
    }

    /**
     * Setter for the mobileLicenseManager property.
     *
     * @see mobileLicenseManager
     * @param mobileLicenseManager the mobileLicenseManager to set.
     */
    public void setMobileLicenseManager(final MobileLicenseManager mobileLicenseManager) {
        this.mobileLicenseManager = mobileLicenseManager;
    }

    /**
     * Setter for the securityConfiguration property.
     *
     * @see securityConfiguration
     * @param securityConfiguration the securityConfiguration to set.
     */
    public void setSecurityConfiguration(final String securityConfiguration) {
        this.securityConfiguration = securityConfiguration;
    }

    /**
     * Setter for the securityService property.
     *
     * @see securityService
     * @param securityService the securityService to set.
     */
    public void setSecurityService(final SecurityService securityService) {
        this.securityService = securityService;
    }

    /**
     * Setter for the sqlitePassphrase property.
     *
     * @see sqlitePassphrase.
     * @param sqlitePassphrase the sqlitePassphrase to set.
     */
    public void setSqlitePassphrase(final String sqlitePassphrase) {
        this.sqlitePassphrase = sqlitePassphrase;
    }

    /**
     * Setter for the userAccountDao property.
     *
     * @see userAccountDao
     * @param userAccountDao the userAccountDao to set.
     */
    public void setUserAccountDao(final IUserAccountDao userAccountDao) {
        this.userAccountDao = userAccountDao;
    }

    @Override
    public void startMobileSsoUserSession() throws ExceptionBase {
        if (this.logger.isInfoEnabled()) {
            this.logger.info("startMobileSsoUserSession");
        }

        // user is already authenticated
        // Get userAccount from Spring SecurityContext
        final Authentication authentication = SecurityServiceImpl.getAuthenticationFromContext();
        Assert.notNull(authentication, "authentication must be supplied");

        final UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Assert.notNull(userDetails, "userDetails must be supplied in Authentication");

        final com.archibus.security.UserAccount.Immutable userAccount =
                userDetails.getUserAccount();
        Assert.notNull(userAccount, "userAccount must be supplied in UserDetailsImpl");

        userAccount.checkIfEnabledForMobileAccess();

        // KB 3045264: Destroy delayed license lock if exists for this user, before starting a new
        // session, or the program will temporarily consume two licenses for the same user.
        // MobileLicenseManager needs the user account in the context.
        ContextStore.get().setUserAccount(userDetails.getUserAccount());
        this.mobileLicenseManager.destroyDelayedLicenseLock();

        // start user session
        this.securityService.startSsoUserSession();
    }

    @Override
    public void startMobileUserSessionForDeviceId(final String deviceId) throws ExceptionBase {
        // decrypt deviceId
        final Decoder1 decoder = new Decoder1();
        final String deviceIdDecrypted = decoder.decode(deviceId);

        startMobileUserSessionForDeviceIdDo(deviceIdDecrypted);
    }

    /**
     * See {@link MobileSecurityService#startMobileUserSessionForDeviceId(java.lang.String)}.
     *
     * @param deviceId id of the device to be used for loading user account. Not encrypted.
     */
    void startMobileUserSessionForDeviceIdDo(final String deviceId) {
        if (this.logger.isInfoEnabled()) {
            this.logger.info(String.format(
                "startMobileUserSessionForDeviceIdDo with deviceId=[%s]", deviceId));
        }

        // configuration check: Configuration must be not preauth
        MobileSecurityServiceUtilities.checkSecurityConfiguration(this.securityConfiguration);

        final com.archibus.app.common.mobile.security.domain.UserAccount userAccount =
                this.userAccountDao.loadByDeviceId(deviceId);
        if (userAccount == null) {
            // @translatable
            final ExceptionBase exception =
                    new ExceptionBase("This mobile device is not registered.");
            exception.setTranslatable(true);
            exception.setErrorNumber(ExceptionBase.ERROR_NUMBER_MOBILE_DEVICE_NOT_REGISTERED);
            throw exception;
        }

        final String username = userAccount.getName();
        final UserDetailsImpl userDetails =
                (UserDetailsImpl) this.userAccountDao.loadUserDetailsByUsername(username);

        userDetails.getUserAccount().checkIfEnabledForMobileAccess();

        final Authentication authentication =
                new PreAuthenticatedAuthenticationToken(userDetails, null);

        // attach Authentication result to SecurityContext
        final SecurityContext securityContext = SecurityContextHolder.getContext();
        // SecurityContext might not exist, when this method is called from unit test
        if (securityContext != null) {
            securityContext.setAuthentication(authentication);
        }

        // KB 3045264: Destroy delayed license lock if exists for this user, before starting a new
        // session, or the program will temporarily consume two licenses for the same user.
        // MobileLicenseManager needs the user account in the context.
        ContextStore.get().setUserAccount(userDetails.getUserAccount());
        this.mobileLicenseManager.destroyDelayedLicenseLock();

        // start user session for the UserAccount object
        // prepare context
        SecurityServiceImpl.afterAuthentication(authentication, true);

        final Context context = ContextStore.get();
        context.getSecurityController().login();
    }

    @Override
    public void unRegisterDevice(final String userName, final String deviceId) throws ExceptionBase {
        final String usernameDecrypted = this.encryptor.decrypt(userName);
        final String deviceIdDecrypted = this.encryptor.decrypt(deviceId);

        // this.userAccountDao.unregisterDevice(usernameDecrypted);
        this.userAccountDao.unregisterDeviceIfRegistered(deviceIdDecrypted);

        this.registrationLogDao.recordDeviceUnregistration(usernameDecrypted);
    }

    /**
     * Getter for the registrationLogDao property.
     *
     * @see registrationLogDao
     * @return the registrationLogDao property.
     */
    public IRegistrationLogDao getRegistrationLogDao() {
        return this.registrationLogDao;
    }

    /**
     * Setter for the registrationLogDao property.
     *
     * @see registrationLogDao
     * @param registrationLogDao the registrationLogDao to set
     */

    public void setRegistrationLogDao(final IRegistrationLogDao registrationLogDao) {
        this.registrationLogDao = registrationLogDao;
    }

    @Override
    public void recordDeviceRegistration(final String userName, final String deviceId,
            final String deviceName) throws ExceptionBase {

        final String usernameDecrypted = this.encryptor.decrypt(userName);
        final String deviceIdDecrypted = this.encryptor.decrypt(deviceId);

        this.registrationLogDao.recordDeviceRegistration(usernameDecrypted, deviceIdDecrypted,
            deviceName);

    }
}