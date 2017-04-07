package com.archibus.eventhandler.energy;

/**
 * BasDataConstants - This class contains constants for BAS data processing.
 *
 * History: <li>23.1.
 *
 * @author Kaori Emery
 */

public class BasConstants {
    /**
     * String status message - Processing virtual meter.
     */
    // @translatable
    public static final String MESSAGE_PROCESSING_VIRTUAL_METER = "Processing virtual meter";

    /**
     * String Power.
     */
    public static final String POWER = "Power";

    /**
     * id String.
     */
    public static final String ID_STRING = "id";

    /**
     * DataSource Name.
     */
    public static final String ENERGY_BAS_EDIT_DS2 = "energyBasEdit_ds2";

    /**
     * ELECTRIC String.
     */
    public static final String ELECTRIC = "ELECTRIC";

    /**
     * Field name.
     */
    public static final String BILL_UNIT_ROLLUP_TYPE = "bill_unit.rollup_type";

    /**
     * Field name.
     */
    public static final String BILL_UNIT_CONVERSION_FACTOR = "bill_unit.conversion_factor";

    /**
     * Field name.
     */
    public static final String BAS_DATA_POINT_BILL_TYPE_ID = "bas_data_point.bill_type_id";

    /**
     * Field name.
     */
    public static final String BAS_DATA_POINT_METERS_TO_INCLUDE =
            "bas_data_point.meters_to_include";

    /**
     * Field name.
     */
    public static final String BAS_DATA_POINT_METERS_TO_EXCLUDE =
            "bas_data_point.meters_to_exclude";

    /**
     * Field name.
     */
    public static final String BAS_DATA_CLEAN_NUM_VALUE_REPORTED =
            "bas_data_clean_num.value_reported";

    /**
     * Field name.
     */
    public static final String BAS_DATA_CLEAN_NUM_PROCESS_STATUS =
            "bas_data_clean_num.process_status";

    /**
     * Field name.
     */
    public static final String BAS_DATA_CLEAN_NUM_DELTA = "bas_data_clean_num.delta";

    /**
     * Virtual field name.
     */
    public static final String BAS_DATA_CLEAN_NUM_VALUE_COMMON = "bas_data_clean_num.value_common";

    /**
     * "0".
     */
    public static final String STRING_0 = "0";

    /**
     * 1.
     */
    public static final int NO_0 = 0;

    /**
     * 1.
     */
    public static final int NO_1 = 1;

    /**
     * 2.
     */
    public static final int NO_2 = 2;

    /**
     * 3.
     */
    public static final int NO_3 = 3;

    /**
     * 4.
     */
    public static final int NO_4 = 4;

    /**
     * 5.
     */
    public static final int NO_5 = 5;

    /**
     * 6.
     */
    public static final int NO_6 = 6;

    /**
     * 50.
     */
    public static final int NO_50 = 50;

    /**
     * 75.
     */
    public static final int NO_75 = 75;

    /**
     * 90.
     */
    public static final int NO_90 = 90;

    /**
     * -01.
     */
    public static final String DAY_01 = "-01";

    /**
     * Comma.
     */
    public static final String COMMA = ",";

    /**
     * SUM.
     */
    public static final String SUM = "SUM";

    /**
     * MAX.
     */
    public static final String MAX = "MAX";

    /**
     * Year in seconds.
     */
    public static final int YEARLY = 31536000;

    /**
     * Quarter in seconds.
     */
    public static final int QUARTERLY = 7776000;

    /**
     * Month in seconds.
     */
    public static final int MONTHLY = 2592000;

    /**
     * Week in seconds.
     */
    public static final int WEEKLY = 604800;

    /**
     * Day in seconds.
     */
    public static final int DAILY = 86400;

    /**
     * Hour in seconds.
     */
    public static final int HOURLY = 3600;

    /**
     * 15 Minutes in seconds.
     */
    public static final int FIFTEENMINUTES = 900;

    /**
     * 25.
     */
    public static final int NO_25 = 25;

    /**
     * 15.
     */
    public static final int NO_15 = 15;

    /**
     * 100.
     */
    public static final int NO_100 = 100;

    /**
     * DataSource.
     */
    public static final String ENERGY_BAS_EDIT_DS7 = "energyBasEdit_ds7";

    /**
     * Update Field.
     */
    // @translatable
    public static final String FAILED_UPDATE = "Update failed";

    /**
     * Table name.
     */
    public static final String CLEAN_NUM = "bas_data_clean_num";

    /**
     * Table name.
     */
    public static final String TIME_NORM_NUM = "bas_data_time_norm_num";

    /**
     * Table name.
     */
    public static final String POINT = "bas_data_point";

    /**
     * Field name.
     */
    public static final String DATA_POINT_ID = "data_point_id";

    /**
     * Field name.
     */
    public static final String PROCESS_STATUS = "process_status";

    /**
     * Field name.
     */

    public static final String FIELD_YEAR_MONTH = "bas_data_clean_num.year_month";

    /**
     * Edit view name.
     */

    public static final String EDIT_VIEW_NAME = "ab-energy-bas-edit-process.axvw";

    /**
     * Calendar hours.
     */

    public static final String[] CAL_HOURS = { "00:00", "01:00", "02:00", "03:00", "04:00",
        "05:00", "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00",
        "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00",
    "23:00" };

    /**
     * Minutes.
     */

    public static final String[] MINUTES = { ":00", ":15", ":30", ":45" };

    /**
     * MANUAL.
     */

    public static final String MANUAL = "MANUAL";

    /**
     * NOT PROCESSED.
     */

    public static final String NOT_PROCESSED = "NOT PROCESSED";

    /**
     * 15MIN.
     */

    public static final String FIFTEENMIN = "15MIN";

    /**
     * HOUR.
     */

    public static final String HOUR = "HOUR";

    /**
     * DAY.
     */

    public static final String DAY = "DAY";

    /**
     * WEEK.
     */

    public static final String WEEK = "WEEK";

    /**
     * MONTH.
     */

    public static final String MONTH = "MONTH";

    /**
     * QUARTER.
     */

    public static final String QUARTER = "QUARTER";

    /**
     * YEAR.
     */

    public static final String YEAR = "YEAR";

    /**
     * yearQuarterOf.
     */

    public static final String YEAR_QUARTER_OF = "yearQuarterOf";

    /**
     * yearOf.
     */

    public static final String YEAR_OF = "yearOf";

    /**
     * Hidden constructor.
     */
    protected BasConstants() {
        // prevents calls from subclass
        throw new UnsupportedOperationException();
    }
}
