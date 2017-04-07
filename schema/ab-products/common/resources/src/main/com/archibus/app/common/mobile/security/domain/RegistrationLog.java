package com.archibus.app.common.mobile.security.domain;

import java.sql.Time;
import java.util.Date;

/**
 * Domain object for the Device Registration log. Mapped to the afm_users_mob_devices table.
 *
 * @author jmartin
 * @since 23.1
 *
 */
public class RegistrationLog {

    /**
     * User name.
     */
    private String userName;

    /**
     * Mobile device id.
     */
    private String mobileDeviceId;

    /**
     * Mobile device name.
     */
    private String mobileDeviceName;

    /**
     * Date device registered.
     */
    private Date dateRegistered;

    /**
     * Time device registered.
     */
    private Time timeRegistered;

    /**
     * Date device unregistered.
     */
    private Date dateUnregistered;

    /**
     * Time device unregistered.
     */
    private Time timeUnregistered;

    /**
     * Getter for the userName property.
     *
     * @see userName
     * @return the userName property.
     */
    public String getUserName() {
        return this.userName;
    }

    /**
     * Setter for the userName property.
     *
     * @see userName
     * @param userName the userName to set
     */

    public void setUserName(final String userName) {
        this.userName = userName;
    }

    /**
     * Getter for the mobileDeviceId property.
     *
     * @see mobileDeviceId
     * @return the mobileDeviceId property.
     */
    public String getMobileDeviceId() {
        return this.mobileDeviceId;
    }

    /**
     * Setter for the mobileDeviceId property.
     *
     * @see mobileDeviceId
     * @param mobileDeviceId the mobileDeviceId to set
     */

    public void setMobileDeviceId(final String mobileDeviceId) {
        this.mobileDeviceId = mobileDeviceId;
    }

    /**
     * Getter for the mobileDeviceName property.
     *
     * @see mobileDeviceName
     * @return the mobileDeviceName property.
     */
    public String getMobileDeviceName() {
        return this.mobileDeviceName;
    }

    /**
     * Setter for the mobileDeviceName property.
     *
     * @see mobileDeviceName
     * @param mobileDeviceName the mobileDeviceName to set
     */

    public void setMobileDeviceName(final String mobileDeviceName) {
        this.mobileDeviceName = mobileDeviceName;
    }

    /**
     * Getter for the dateRegistered property.
     *
     * @see dateRegistered
     * @return the dateRegistered property.
     */
    public Date getDateRegistered() {
        return this.dateRegistered;
    }

    /**
     * Setter for the dateRegistered property.
     *
     * @see dateRegistered
     * @param dateRegistered the dateRegistered to set
     */

    public void setDateRegistered(final Date dateRegistered) {
        this.dateRegistered = dateRegistered;
    }

    /**
     * Getter for the timeRegistered property.
     *
     * @see timeRegistered
     * @return the timeRegistered property.
     */
    public Time getTimeRegistered() {
        return this.timeRegistered;
    }

    /**
     * Setter for the timeRegistered property.
     *
     * @see timeRegistered
     * @param timeRegistered the timeRegistered to set
     */

    public void setTimeRegistered(final Time timeRegistered) {
        this.timeRegistered = timeRegistered;
    }

    /**
     * Getter for the dateUnregistered property.
     *
     * @see dateUnregistered
     * @return the dateUnregistered property.
     */
    public java.util.Date getDateUnregistered() {
        return this.dateUnregistered;
    }

    /**
     * Setter for the dateUnregistered property.
     *
     * @see dateUnregistered
     * @param dateUnregistered the dateUnregistered to set
     */

    public void setDateUnregistered(final Date dateUnregistered) {
        this.dateUnregistered = dateUnregistered;
    }

    /**
     * Getter for the timeUnregistered property.
     *
     * @see timeUnregistered
     * @return the timeUnregistered property.
     */
    public Time getTimeUnregistered() {
        return this.timeUnregistered;
    }

    /**
     * Setter for the timeUnregistered property.
     *
     * @see timeUnregistered
     * @param timeUnregistered the timeUnregistered to set
     */

    public void setTimeUnregistered(final Time timeUnregistered) {
        this.timeUnregistered = timeUnregistered;
    }

}
