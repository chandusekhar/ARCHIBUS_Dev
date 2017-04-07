package com.archibus.eventhandler.energy;

import org.apache.log4j.Logger;

/**
 * Contains Energy Management constants definition.
 */
public class Constants {
    /**
     * Job Progress number 100.
     */
    public static final int PROGRESS_100 = 100;

    /**
     * Table name.
     */
    public static final String TABLE_BILL = "bill";

    /**
     * Table name.
     */
    public static final String TABLE_BILL_ARCHIVE = "bill_archive";

    /**
     * Table name.
     */
    public static final String TABLE_BILL_LINE = "bill_line";

    /**
     * Table name.
     */
    public static final String TABLE_BILL_LINE_ARCHIVE = "bill_line_archive";

    /**
     * Table name.
     */
    public static final String TABLE_BILL_UNIT = "bill_unit";

    /**
     * Table name.
     */
    public static final String TABLE_VN_SVCS_CONTRACT = "vn_svcs_contract";

    /**
     * Table name.
     */
    public static final String TABLE_VN_RATE = "vn_rate";

    /**
     * Table name.
     */
    public static final String TABLE_BAS_DATA_POINT = "bas_data_point";

    /**
     * Table bas_data_clean_num.
     */
    public static final String TABLE_BAS_DATA_CLEAN_NUM = "bas_data_clean_num";

    /**
     * Field qty.
     */
    public static final String FIELD_QTY = "qty";

    /**
     * Field qty_energy.
     */
    public static final String FIELD_QTY_ENERGY = "qty_energy";

    /**
     * Field qty_power.
     */
    public static final String FIELD_QTY_POWER = "qty_power";

    /**
     * Field qty_volume.
     */
    public static final String FIELD_QTY_VOLUME = "qty_volume";

    /**
     * Field vn_id.
     */
    public static final String FIELD_VN_ID = "vn_id";

    /**
     * Field vn_ac_id.
     */
    public static final String FIELD_VN_AC_ID = "vn_ac_id";

    /**
     * Field bill_id.
     */
    public static final String FIELD_BILL_ID = "bill_id";

    /**
     * Field bill_line_id.
     */
    public static final String FIELD_BILL_LINE_ID = "bill_line_id";

    /**
     * Virtual Field bill_line_id_desc.
     */
    public static final String FIELD_BILL_LINE_ID_DESC = "bill_line_id_desc";

    /**
     * Field vn_meter_id.
     */
    public static final String FIELD_VN_METER_ID = "vn_meter_id";

    /**
     * Field rollup_type.
     */
    public static final String FIELD_ROLLUP_TYPE = "rollup_type";

    /**
     * Field description.
     */
    public static final String FIELD_DESCRIPTION = "description";

    /**
     * Field status.
     */
    public static final String FIELD_STATUS = "status";

    /**
     * Field date_service_start.
     */
    public static final String FIELD_DATE_SERVICE_START = "date_service_start";

    /**
     * Field date_service_end.
     */
    public static final String FIELD_DATE_SERVICE_END = "date_service_end";

    /**
     * Field site_id.
     */
    public static final String FIELD_SITE_ID = "site_id";

    /**
     * Field bl_id.
     */
    public static final String FIELD_BL_ID = "bl_id";

    /**
     * Field fl_id.
     */
    public static final String FIELD_FL_ID = "fl_id";

    /**
     * Field zone_id.
     */
    public static final String FIELD_ZONE_ID = "zone_id";

    /**
     * Virtual Field data_point_id_name.
     */
    public static final String FIELD_DATA_POINT_ID_NAME = "data_point_id_name";

    /**
     * Virtual Field bl_fl_id.
     */
    public static final String FIELD_BL_FL_ID = "bl_fl_id";

    /**
     * Virtual Field bl_fl_zone_id.
     */
    public static final String FIELD_BL_FL_ZONE_ID = "bl_fl_zone_id";

    /**
     * Field months.
     */
    public static final String FIELD_MONTHS = "months";

    /**
     * Field hours.
     */
    public static final String FIELD_HOURS = "hours";

    /**
     * Field name.
     */
    public static final String FIELD_DATA_POINT_ID = "data_point_id";

    /**
     * Virtual field group_field.
     */
    public static final String FIELD_GROUP_FIELD = "group_field";

    /**
     * Field name.
     */
    public static final String FIELD_METERS_TO_INCLUDE = "meters_to_include";

    /**
     * Field name.
     */
    public static final String FIELD_METERS_TO_EXCLUDE = "meters_to_exclude";

    /**
     * Field vn_rate_id.
     */
    public static final String FIELD_VN_RATE_ID = "vn_rate_id";

    /**
     * Field vn_rate_desc.
     */
    public static final String FIELD_VN_RATE_DESC = "vn_rate_desc";

    /**
     * Field block.
     */
    public static final String FIELD_BLOCK = "block";

    /**
     * Field lower_threshold.
     */
    public static final String FIELD_LOWER_THRESHOLD = "lower_threshold";

    /**
     * Field upper_threshold.
     */
    public static final String FIELD_UPPER_THRESHOLD = "upper_threshold";

    /**
     * Parameter name lower_threshold_null_case.
     */
    public static final String LOWER_THRESHOLD_NULL_CASE = "lower_threshold_null_case";

    /**
     * Field amount_expense.
     */
    public static final String FIELD_AMOUNT_EXPENSE = "amount_expense";

    /**
     * Virtual field amount_prorated.
     */
    public static final String FIELD_AMOUNT_PRORATED = "amount_prorated";

    /**
     * Virtual field proration_factor.
     */
    public static final String FIELD_PRORATION_FACTOR = "proration_factor";

    /**
     * Field bill_unit_id.
     */
    public static final String FIELD_BILL_UNIT_ID = "bill_unit_id";

    /**
     * Field conversion_factor.
     */
    public static final String FIELD_CONVERSION_FACTOR = "conversion_factor";

    /**
     * Field bill_type_id.
     */
    public static final String FIELD_BILL_TYPE_ID = "bill_type_id";

    /**
     * Field time_period.
     */
    public static final String FIELD_TIME_PERIOD = "time_period";

    /**
     * Virtual Field meters.
     */
    public static final String FIELD_METERS = "meters";

    /**
     * Include.
     */
    public static final String INCLUDE = "include";

    /**
     * Exclude.
     */
    public static final String EXCLUDE = "exclude";

    /**
     * Virtual Field vn_bill_id.
     */
    public static final String FIELD_VN_BILL_ID = "vn_bill_id";

    /**
     * Virtual Field discrepancy.
     */
    public static final String FIELD_DISCREPANCY = "discrepancy";

    /**
     * Virtual Field qty_measured.
     */
    public static final String FIELD_QTY_MEASURED = "qty_measured";

    /**
     * Virtual Field discrepancy_energy.
     */
    public static final String FIELD_DISCREPANCY_ENERGY = "discrepancy_energy";

    /**
     * Virtual Field qty_energy_measured.
     */
    public static final String FIELD_QTY_ENERGY_MEASURED = "qty_energy_measured";

    /**
     * Virtual Field qty_energy_billed.
     */
    public static final String FIELD_QTY_ENERGY_BILLED = "qty_energy_billed";

    /**
     * Virtual Field discrepancy_power.
     */
    public static final String FIELD_DISCREPANCY_POWER = "discrepancy_power";

    /**
     * Virtual Field qty_power_measured.
     */
    public static final String FIELD_QTY_POWER_MEASURED = "qty_power_measured";

    /**
     * Virtual Field qty_power_billed.
     */
    public static final String FIELD_QTY_POWER_BILLED = "qty_power_billed";

    /**
     * Virtual Field discrepancy_volume.
     */
    public static final String FIELD_DISCREPANCY_VOLUME = "discrepancy_volume";

    /**
     * Virtual Field qty_volume_measured.
     */
    public static final String FIELD_QTY_VOLUME_MEASURED = "qty_volume_measured";

    /**
     * Virtual Field qty_volume_billed.
     */
    public static final String FIELD_QTY_VOLUME_BILLED = "qty_volume_billed";

    /**
     * Virtual Field max_discrepancy.
     */
    public static final String FIELD_MAX_DISCREPANCY = "max_discrepancy";

    /**
     * View file.
     */
    public static final String VIEW_COMMON = "ab-energy-bill-vs-meter-common.axvw";

    /**
     * Bill Unit rollup_type Energy.
     */
    public static final String ENERGY = "Energy";

    /**
     * Bill Unit rollup_type Power.
     */
    public static final String POWER = "Power";

    /**
     * Bill Unit rollup_type Volume.
     */
    public static final String VOLUME = "Volume";

    /**
     * "0.00".
     */
    public static final String STRING_ZERO_DOUBLE = "0.00";

    /**
     * "0".
     */
    public static final String STRING_ZERO_INT = "0";

    /**
     * String Percent.
     */
    public static final String STRING_PERCENT = "%";

    /**
     * " = ".
     */
    public static final String STRING_EQUALS = " = ";

    /**
     * "'".
     */
    public static final String STRING_SINGLE_QUOTE = "'";

    /**
     * "_".
     */
    public static final String STRING_UNDERSCORE = "_";

    /**
     * " IS NOT NULL ".
     */
    public static final String STRING_IS_NOT_NULL = " IS NOT NULL ";

    /**
     * 100.
     */
    public static final int HUNDRED = 100;

    /**
     * 16.
     */
    public static final int SIXTEEN = 16;

    /**
     * 6.
     */
    public static final int SIX = 6;

    /**
     * 8.
     */
    public static final int EIGHT = 8;

    /**
     * 2.
     */
    public static final int TWO = 2;

    /**
     * String Pending Approval.
     */
    public static final String STATUS_PENDING_APPROVAL = "Pending Approval";

    /**
     * String metersToInclude.
     */
    public static final String STRING_METERS_TO_INCLUDE = "metersToInclude";

    /**
     * String metersToExclude.
     */
    public static final String STRING_METERS_TO_EXCLUDE = "metersToExclude";

    /**
     * String Comma.
     */
    public static final String STRING_COMMA = ",";

    /**
     * String Period.
     */
    public static final String STRING_PERIOD = ".";

    /**
     * String Special Characters.
     */
    public static final String STRING_SPECIAL_CHARS = "[^\\d]";

    /**
     * Logger for this class and subclasses.
     */
    protected final Logger logger = Logger.getLogger(this.getClass());

    /**
     * Hidden constructor.
     */
    protected Constants() {
        // prevents calls from subclass
        throw new UnsupportedOperationException();
    }
}
