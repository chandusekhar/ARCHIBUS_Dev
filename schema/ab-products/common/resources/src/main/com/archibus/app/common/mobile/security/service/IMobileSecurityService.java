package com.archibus.app.common.mobile.security.service;

import com.archibus.utility.ExceptionBase;

/**
 * API of the security service for mobile applications.
 * <p>
 * Non-authenticated users are allowed to invoke all methods in this service.
 *
 * @author Valery Tydykov
 *
 * @since 21.1
 */
public interface IMobileSecurityService {
    /**
     * Registers the device to the given username if in non-SSO configuration, or to the username
     * which is already in existing Spring SecurityContext. Authenticates user using username and
     * password if in non-SSO configuration, or gets existing Authentication from Spring
     * SecurityContext otherwise. The username and password are not used in SSO configuration.
     * <p>
     * Does not require existing user session. Does not start user session.
     * <p>
     * The projectId is expected to be already in the Context. In SSO configuration Authentication
     * must already exist in Spring SecurityContext.
     *
     * @param deviceId id of the device to be registered. Encrypted using ARCHIBUS encryption.
     * @param username of the user to be authenticated. Used in non-SSO configuration. Encrypted
     *            using ARCHIBUS encryption.
     * @param password of the user to be authenticated. Used in non-SSO configuration. Encrypted
     *            using ARCHIBUS encryption.
     * @param localeName Java locale name. Used to translate exceptions in
     *            ExceptionHandlingInterceptor. Must be the 4th parameter in this method.
     * @throws ExceptionBase if registration fails, if authentication using username and password
     *             fails, if account is not enabled for mobile access, if account has
     *             non-LEVEL_4_ACTIVITY license.
     */
    void registerDevice(final String deviceId, final String username, final String password,
            final String localeName) throws ExceptionBase;

    /**
     * Starts user session for a mobile client. The username and projectId are expected to be
     * already in the Context. No authentication is performed.
     * <p>
     * Verifies that the account has the authorization to access Web Central from a mobile device;
     * checks for a valid SSO configuration.
     * <p>
     * Does not require existing user session.
     * <p>
     * WebCentral must be configured to use one of the standard ARCHIBUS SSO configurations.
     *
     * @throws ExceptionBase If user is not authenticated, or if the configuration is not "preauth",
     *             or if user is not pre-authenticated, if account is not enabled for mobile access,
     *             if account has non-LEVEL_4_ACTIVITY license.
     */
    void startMobileSsoUserSession() throws ExceptionBase;

    /**
     * Loads ARCHIBUS User account by deviceId and starts new user session for that account.
     * Verifies that the account has the authorization to access Web Central from a mobile device.
     * No authentication is performed.
     * <p>
     * Does not require existing user session.
     * <p>
     * The projectId is expected to be already in the Context.
     * <p>
     * WebCentral must be configured to use one of the ARCHIBUS non-SSO configurations.
     *
     * @param deviceId id of the device to be used for loading user account. Encrypted using
     *            ARCHIBUS encryption.
     * @throws ExceptionBase if the configuration is "preauth", if deviceId is not valid, if account
     *             is not enabled for mobile access, if account has non-LEVEL_4_ACTIVITY license, if
     *             mobile device is not registered.
     */
    void startMobileUserSessionForDeviceId(final String deviceId) throws ExceptionBase;

    /**
     * Returns sqlitePassphrase.
     *
     * @return sqlitePassphrase in clear text.
     */
    String getSqlitePassphrase();

    /**
     * Unregisters the users device. Sets the value of the afm_users.mob_device_id field to null for
     * the provided user.
     * <p>
     * Records the device unregistration event in the afm_mob_dev_reg_log table.
     *
     * @param userName of the user for which to unregister the device.
     * @param deviceId of the device to unregister.
     * @throws ExceptionBase if the user cannot be found, if saving the user account throws
     *             exception.
     */
    void unRegisterDevice(final String userName, final String deviceId) throws ExceptionBase;

    /**
     *
     * Records the device registration event in the afm_mob_dev_reg_log table.
     *
     * @param userName of the user registering the device
     * @param deviceId of the device being registered
     * @param deviceName of the device being registered
     * @throws ExceptionBase if the UserAccount datasource throws exception.
     */
    void recordDeviceRegistration(final String userName, final String deviceId,
            final String deviceName) throws ExceptionBase;

}
