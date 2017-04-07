package com.archibus.app.common.mobile.security.dao.datasource;

import java.util.*;

import com.archibus.app.common.mobile.security.dao.IRegistrationLogDao;
import com.archibus.app.common.mobile.security.domain.RegistrationLog;
import com.archibus.datasource.ObjectDataSourceImpl;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;

/**
 * Data Source for Registration Log.
 * <p>
 * Has prototype scope
 *
 * @author Jeff Martin
 * @since 23.1
 *
 */
public class RegistrationLogDataSource extends ObjectDataSourceImpl<RegistrationLog> implements
IRegistrationLogDao {

    /**
     * The year epoch occurred.
     */
    private static final int EPOCH_YEAR = 1970;

    /**
     * Constant: field name: "user_name".
     */
    private static final String USER_NAME = "user_name";

    /**
     * Constant: field name: "mob_device_id".
     */
    private static final String MOB_DEVICE_ID = "mob_device_id";

    /**
     * Constant: field name: "mob_device_name".
     */
    private static final String MOB_DEVICE_NAME = "mob_device_name";

    /**
     * Constant: field name: "date_registered".
     */
    private static final String DATE_REGISTERED = "date_registered";

    /**
     * Constant: field name: "time_registered".
     */
    private static final String TIME_REGISTERED = "time_registered";

    /**
     * Constant: field name: "date_unregistered".
     */
    private static final String DATE_UNREGISTERED = "date_unregistered";

    /**
     * Constant: field name: "time_unregistered".
     */
    private static final String TIME_UNREGISTERED = "time_unregistered";

    /**
     * Constant: table name: "afm_mob_dev_reg_log".
     */
    private static final String REGISTRATION_LOG_TABLE_NAME = "afm_mob_dev_reg_log";

    /**
     * Field names to property names mapping. All fields will be added to the DataSource.
     */
    private static final String[][] FIELDS_TO_PROPERTIES = { { USER_NAME, "userName" },
        { MOB_DEVICE_ID, "mobDeviceId" }, { MOB_DEVICE_NAME, "mobDeviceName" },
        { DATE_REGISTERED, "dateRegistered" }, { TIME_REGISTERED, "timeRegistered" },
            { DATE_UNREGISTERED, "dateUnregistered" }, { TIME_UNREGISTERED, "timeUnregistered" },
        { "auto_number", "autoNumber" } };

    /**
     * Constructs RegistrationLogDataSource, mapped to <code>afm_mob_dev_reg_log</code> table.
     */
    protected RegistrationLogDataSource() {
        super("registrationLogDataSource", REGISTRATION_LOG_TABLE_NAME);
        this.setDatabaseRole(DB_ROLE_DATA);
    }

    @Override
    protected String[][] getFieldsToProperties() {
        return FIELDS_TO_PROPERTIES.clone();
    }

    @Override
    public void recordDeviceRegistration(final String userName, final String deviceId,
            final String deviceName) {

        // Check if there are records in the registration log from a previous device registration
        // for this user. Set the date and time unregistered values for any existing records.
        this.doRecordDeviceUnregistration(userName);

        // Insert the new registration event
        this.insertRegistrationLogRecord(userName, deviceId, deviceName);
    }

    /**
     *
     * Checks the datasource for the most recent registration entry for the user and device where
     * the device has not been unregistered.
     * <p>
     * The device has not been unregistered if the date and time unregistered fields are null.
     *
     * @param userName of the user registering the device.
     * @return list of unregistered device log records for the user.
     */
    private List<DataRecord> getRegisteredDeviceLogRecords(final String userName) {

        this.clearRestrictions();
        this.addRestriction(Restrictions.eq(REGISTRATION_LOG_TABLE_NAME, USER_NAME, userName));
        this.addRestriction(Restrictions.isNull(REGISTRATION_LOG_TABLE_NAME, DATE_UNREGISTERED));
        this.addRestriction(Restrictions.isNull(REGISTRATION_LOG_TABLE_NAME, TIME_UNREGISTERED));

        // TODO: Could return multiple records if the data is not consistent.
        return this.getRecords();

    }

    /**
     * Sets the date unregistered and time unregistered values to the current date for registration
     * record.
     *
     * @param record to update.
     */
    private void recordDeviceUnregisterEvent(final DataRecord record) {

        if (record != null) {
            final Date currentDate = new Date();
            record.setValue(REGISTRATION_LOG_TABLE_NAME + DOT + DATE_UNREGISTERED,
                getSqlDateFromDate(currentDate));
            record.setValue(REGISTRATION_LOG_TABLE_NAME + DOT + TIME_UNREGISTERED,
                getSqlTimeFromDate(currentDate));

            this.saveRecord(record);
        }
    }

    /**
     * Inserts a registration event record into the Regisration Log table.
     *
     * @param userName of the user registering the device.
     * @param deviceId of the device being registered.
     * @param deviceName of the device being registered.
     */
    private void insertRegistrationLogRecord(final String userName, final String deviceId,
            final String deviceName) {

        final DataRecord record = this.createNewRecord();
        final Date currentDate = new Date();
        record.setValue(REGISTRATION_LOG_TABLE_NAME + DOT + USER_NAME, userName);
        record.setValue(REGISTRATION_LOG_TABLE_NAME + DOT + MOB_DEVICE_ID, deviceId);
        record.setValue(REGISTRATION_LOG_TABLE_NAME + DOT + MOB_DEVICE_NAME, deviceName);
        record.setValue(REGISTRATION_LOG_TABLE_NAME + DOT + DATE_REGISTERED,
            getSqlDateFromDate(currentDate));
        record.setValue(REGISTRATION_LOG_TABLE_NAME + DOT + TIME_REGISTERED,
            getSqlTimeFromDate(currentDate));

        this.saveRecord(record);
    }

    /**
     * @param javaDate java.util.Date
     * @return java.sql.Date equivalent to the javaDate, with the time set to Epoch per java spec
     */
    private static java.sql.Date getSqlDateFromDate(final Date javaDate) {
        final Calendar calendar = Calendar.getInstance();
        calendar.setTime(javaDate);
        calendar.set(Calendar.HOUR, 0);
        calendar.set(Calendar.MINUTE, 0);
        calendar.set(Calendar.SECOND, 0);
        calendar.set(Calendar.MILLISECOND, 0);
        return new java.sql.Date(calendar.getTime().getTime());
    }

    /**
     * @param javaDate java.util.Date
     * @return java.sql.Time equivalent to the javaDate, with the date set to Epoch per java spec
     */
    private static java.sql.Time getSqlTimeFromDate(final Date javaDate) {
        final Calendar calendar = Calendar.getInstance();
        calendar.setTime(javaDate);
        calendar.set(Calendar.YEAR, EPOCH_YEAR);
        calendar.set(Calendar.DAY_OF_YEAR, 1);
        return new java.sql.Time(calendar.getTime().getTime());
    }

    @Override
    public void recordDeviceUnregistration(final String userName) {
        this.doRecordDeviceUnregistration(userName);
    }

    /**
     * Sets the date and time unregistered values to the current data for any user device log
     * entries where the device is registered.
     * 
     * @param userName of the user unregistering the device.
     */
    private void doRecordDeviceUnregistration(final String userName) {
        final List<DataRecord> registeredDeviceRecords =
                this.getRegisteredDeviceLogRecords(userName);

        for (final DataRecord record : registeredDeviceRecords) {
            this.recordDeviceUnregisterEvent(record);
        }
    }

}
