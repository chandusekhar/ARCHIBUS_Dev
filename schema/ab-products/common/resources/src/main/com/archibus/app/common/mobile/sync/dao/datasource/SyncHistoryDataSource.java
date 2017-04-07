package com.archibus.app.common.mobile.sync.dao.datasource;

import com.archibus.app.common.mobile.sync.dao.ISyncHistoryDao;
import com.archibus.app.common.mobile.sync.domain.SyncHistory;
import com.archibus.datasource.ObjectDataSourceImpl;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.utility.ExceptionBase;

/**
 * DataSource for SyncHistory.
 * <p>
 * A bean class named as "syncHistoryDataSource".
 * <p>
 * configured in
 * schema/ab-products/common/resources/src/main/com/archibus/app/common/mobile/services.xml
 *
 * <p>
 * Designed to have prototype scope.
 *
 * @author Martin
 * @since 23.1
 *
 */
public class SyncHistoryDataSource extends ObjectDataSourceImpl<SyncHistory> implements
        ISyncHistoryDao {

    /**
     * Constant: field name: "user_name".
     */
    private static final String USER_NAME = "user_name";

    /**
     * Constant: field name: "mob_device_id".
     */
    private static final String MOB_DEVICE_ID = "mob_device_id";

    /**
     * Constant: field name: "server_table_name".
     */
    private static final String SERVER_TABLE_NAME = "server_table_name";

    /**
     * Constant: field name: "client_table_name".
     */
    private static final String CLIENT_TABLE_NAME = "client_table_name";

    /**
     * Constant: field name: "last_download_timestamp".
     */
    private static final String LAST_DOWNLOAD_TIMESTAMP = "last_download_timestamp";

    /**
     * afm_sync_history table name.
     */
    private static final String SYNC_HISTORY_TABLE_NAME = "afm_mobile_sync_history";

    /**
     * Field names to property names mapping. All fields will be added to the DataSource.
     */
    private static final String[][] FIELDS_TO_PROPERTIES = { { USER_NAME, "userName" },
        { MOB_DEVICE_ID, "deviceId" }, { SERVER_TABLE_NAME, "serverTableName" },
        { CLIENT_TABLE_NAME, "clientTableName" },
        { LAST_DOWNLOAD_TIMESTAMP, "lastDownloadTimestamp" }, { "auto_number", "autoNumber" } };

    /**
     * Constructs SyncHistoryDataSource, mapped to <code>afm_sync_history</code> table.
     */
    public SyncHistoryDataSource() {
        super("syncHistoryDataSource", SYNC_HISTORY_TABLE_NAME);
    }

    @Override
    public java.sql.Timestamp retrieveTableDownloadTime(final String userName,
            final String deviceId, final String clientTableName) throws ExceptionBase {

        final DataRecord record =
                this.getSyncHistoryRecordForUserAndDevice(userName, deviceId, clientTableName);

        final double lastDownloadTimestamp =
                record == null ? 0 : (Double) record.getValue(SYNC_HISTORY_TABLE_NAME + DOT
                        + LAST_DOWNLOAD_TIMESTAMP);

        return new java.sql.Timestamp((long) lastDownloadTimestamp);

    }

    @Override
    public void recordTableDownloadTime(final String userName, final String deviceId,
            final String serverTableName, final String clientTableName) throws ExceptionBase {

        final DataRecord record =
                this.getSyncHistoryRecordForUserAndDevice(userName, deviceId, clientTableName);

        if (record == null) {
            this.insertSyncHistory(userName, deviceId, serverTableName, clientTableName);
        } else {
            this.updateSyncHistory(record);
        }

    }

    @Override
    protected String[][] getFieldsToProperties() {
        return FIELDS_TO_PROPERTIES.clone();
    }

    /**
     * Retrieves the sync history record for the user, device and client table.
     * <p>
     *
     * @param userName of the current user
     * @param deviceId of the device retrieving the record
     * @param clientTableName of the client database table
     * @return the record if it exists, null otherwise
     */
    private DataRecord getSyncHistoryRecordForUserAndDevice(final String userName,
            final String deviceId, final String clientTableName) {
        DataRecord record = null;

        this.addRestriction(Restrictions.eq(SYNC_HISTORY_TABLE_NAME, USER_NAME, userName));
        this.addRestriction(Restrictions.eq(SYNC_HISTORY_TABLE_NAME, MOB_DEVICE_ID, deviceId));
        this.addRestriction(Restrictions.eq(SYNC_HISTORY_TABLE_NAME, CLIENT_TABLE_NAME,
            clientTableName));

        record = this.getRecord();

        return record;
    }

    /**
     * Inserts a new record into the afm_sync_history table.
     * <p>
     * Sets the last_download_timestamp value to the current server time.
     * <p>
     *
     * @param userName of the current user
     * @param deviceId of the current device
     * @param serverTableName the name of the Web Central database table
     * @param clientTableName the name of the device database table
     */
    private void insertSyncHistory(final String userName, final String deviceId,
            final String serverTableName, final String clientTableName) {

        final DataRecord record = this.createNewRecord();
        record.setValue(SYNC_HISTORY_TABLE_NAME + DOT + USER_NAME, userName);
        record.setValue(SYNC_HISTORY_TABLE_NAME + DOT + MOB_DEVICE_ID, deviceId);
        record.setValue(SYNC_HISTORY_TABLE_NAME + DOT + CLIENT_TABLE_NAME, clientTableName);
        record.setValue(SYNC_HISTORY_TABLE_NAME + DOT + SERVER_TABLE_NAME, serverTableName);
        record.setValue(SYNC_HISTORY_TABLE_NAME + DOT + LAST_DOWNLOAD_TIMESTAMP,
            System.currentTimeMillis());

        this.saveRecord(record);

    }

    /**
     *
     * Updates the last_download_timestamp field for an existing sync history record.
     * <p>
     * Sets the last_download_timestamp field to the current server time.
     *
     * @param record to be updated
     */
    private void updateSyncHistory(final DataRecord record) {
        record.setValue(SYNC_HISTORY_TABLE_NAME + DOT + LAST_DOWNLOAD_TIMESTAMP,
            System.currentTimeMillis());
        this.saveRecord(record);
    }

}
