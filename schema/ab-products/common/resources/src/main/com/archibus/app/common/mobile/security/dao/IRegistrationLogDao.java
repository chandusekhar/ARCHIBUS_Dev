package com.archibus.app.common.mobile.security.dao;

/**
 * DAO for the Registration Log.
 *
 * @author Jeff Martin
 * @since 23.1
 *
 */
public interface IRegistrationLogDao {

    /**
     * Records the device registration event in the afm_mob_dev_reg_log table.
     * <p>
     * Set the date and time the device is unregistered if there is an existing registration log
     * entry for the user and device.
     *
     * @param userName of the user registering the device.
     * @param mobDeviceId device id of the device being registered.
     * @param deviceName of the device being registered. The device name is not available on all
     *            mobile platforms.
     */
    void recordDeviceRegistration(final String userName, final String mobDeviceId,
            final String deviceName);

    /**
     * Records the device unregistration event in the afm_mob_dev_reg_log table.
     * <p>
     * Sets the date and time the device is unregistered.
     * <p>
     * The device is unregistered when a user logs off of the mobile app or registers a different
     * device.
     *
     * @param userName of the device being unregistered.
     */
    void recordDeviceUnregistration(final String userName);
}
