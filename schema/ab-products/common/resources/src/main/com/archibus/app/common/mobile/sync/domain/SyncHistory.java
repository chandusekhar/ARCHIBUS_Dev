package com.archibus.app.common.mobile.sync.domain;

/**
 * Domain class for sync history.
 * <p>
 * Mapped to afm_sync_history table.
 *
 * @author Martin
 * @since 23.1
 *
 */
public class SyncHistory {

    /**
     * Sync History user name.
     */
    private String userName;

    /**
     * Sync History device id.
     */
    private String deviceId;

    /**
     * Sync History server table name.
     */
    private String serverTableName;

    /**
     * Sync History client table name.
     */
    private String clientTableName;

    /**
     * Sync History last download timestamp.
     */
    private Long lastDownloadTimestamp;

    /**
     * Getter for the deviceId property.
     *
     * @see deviceId
     * @return the deviceId property.
     */
    public String getDeviceId() {
        return this.deviceId;
    }

    /**
     * Setter for the deviceId property.
     *
     * @see deviceId
     * @param deviceId the deviceId to set
     */

    public void setDeviceId(final String deviceId) {
        this.deviceId = deviceId;
    }

    /**
     * Getter for the serverTableName property.
     *
     * @see serverTableName
     * @return the serverTableName property.
     */
    public String getServerTableName() {
        return this.serverTableName;
    }

    /**
     * Setter for the serverTableName property.
     *
     * @see serverTableName
     * @param serverTableName the serverTableName to set
     */

    public void setServerTableName(final String serverTableName) {
        this.serverTableName = serverTableName;
    }

    /**
     * Getter for the clientTableName property.
     *
     * @see clientTableName
     * @return the clientTableName property.
     */
    public String getClientTableName() {
        return this.clientTableName;
    }

    /**
     * Setter for the clientTableName property.
     *
     * @see clientTableName
     * @param clientTableName the clientTableName to set
     */

    public void setClientTableName(final String clientTableName) {
        this.clientTableName = clientTableName;
    }

    /**
     * Getter for the lastDownloadTimestamp property.
     *
     * @see lastDownloadTimestamp
     * @return the lastDownloadTimestamp property.
     */
    public Long getLastDownloadTimestamp() {
        return this.lastDownloadTimestamp;
    }

    /**
     * Setter for the lastDownloadTimestamp property.
     *
     * @see lastDownloadTimestamp
     * @param lastDownloadTimestamp the lastDownloadTimestamp to set
     */

    public void setLastDownloadTimestamp(final Long lastDownloadTimestamp) {
        this.lastDownloadTimestamp = lastDownloadTimestamp;
    }

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
}
