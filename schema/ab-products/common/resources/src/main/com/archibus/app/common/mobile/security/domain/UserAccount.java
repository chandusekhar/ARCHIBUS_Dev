package com.archibus.app.common.mobile.security.domain;

/**
 * Domain class for user account.
 * <p>
 * Mapped to afm_users table.
 * <p>
 * Duplicates com.archibus.security.UserAccount domain object, to avoid confusion about the life
 * cycle of those objects:
 * <p>
 * - the com.archibus.security.UserAccount domain object is managed by JCache, it exists while the
 * user session exists;
 * <p>
 * - this object is only used by the mobile.service package, to find user account by device id
 * (which can not be done using com.archibus.security.UserAccount and JCache, since JCache uses key
 * which requires user name), and to update device ID.
 * <p>
 * This duplication means that the cached UserAccount domain object might have different values than
 * the database record.
 *
 * @author Valery Tydykov
 * @since 21.1
 *
 */
public class UserAccount {

    /**
     * User name.
     */
    private String name;

    /**
     * ID of the Mobile device, registered for the user.
     */
    private String mobileDeviceId;

    /**
     * @return the name
     */
    public String getName() {
        return this.name;
    }

    /**
     * @param name the name to set
     */
    public void setName(final String name) {
        this.name = name;
    }

    /**
     * @return the mobileDeviceId
     */
    public String getMobileDeviceId() {
        return this.mobileDeviceId;
    }

    /**
     * @param mobileDeviceId the mobileDeviceId to set
     */
    public void setMobileDeviceId(final String mobileDeviceId) {
        this.mobileDeviceId = mobileDeviceId;
    }
}
