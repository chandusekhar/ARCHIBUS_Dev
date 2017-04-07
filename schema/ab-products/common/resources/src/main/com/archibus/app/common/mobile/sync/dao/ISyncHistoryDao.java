package com.archibus.app.common.mobile.sync.dao;

import com.archibus.utility.ExceptionBase;

/**
 * DAO for operations on the afm_sync_history table.
 *
 * @author Martin
 * @since 23.1
 *
 */
public interface ISyncHistoryDao {

    /**
     * Retrieves the last download timestamp for a user, device and client table.
     *
     * @param userName the name of the user that performed the last update
     * @param deviceId the device id used during the last download
     * @param clientTableName the name of the Mobile Client database table
     * @return The timestamp of the last table download. The timestamp is Epoch time.
     * @throws ExceptionBase if the DataSource throws exception.
     */
    java.sql.Timestamp retrieveTableDownloadTime(final String userName, final String deviceId,
            final String clientTableName) throws ExceptionBase;

    /**
     * Records the last download timestamp for a mobile client database table.
     * <p>
     * The timestamp value is the current server time when the method is executed.
     * <p>
     *
     * @param userName the username of the Mobile Client user
     * @param deviceId the device id of the device the table was downloaded to
     * @param clientTableName the name of the client database table
     * @param serverTableName the name of the Web Central database table that is the source of the
     *            data
     * @throws ExceptionBase if the DataSource throws exception.
     */
    void recordTableDownloadTime(final String userName, final String deviceId,
            final String serverTableName, final String clientTableName) throws ExceptionBase;

}
