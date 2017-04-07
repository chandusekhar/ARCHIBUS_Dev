package com.archibus.app.projectmgmt;

import java.sql.Date;
import java.text.SimpleDateFormat;
import java.util.Locale;

import com.archibus.datasource.*;

/**
 * Contains capital projects costs common handlers.
 */
public class CostsCommon {
    
    /**
     * Hidden constructor.
     */
    protected CostsCommon() {
        // prevents calls from subclass
        throw new UnsupportedOperationException();
    }
    
    /**
     * Returns sql for date group by.
     * 
     * @param groupingType String grouping type "date", "week", "month", "quarter", "year".
     * 
     * @return String date grouping statement.
     */
    public static String getDateSql(final String groupingType) {
        String dateSql = "${sql.yearMonthDayOf('afm_cal_dates.cal_date')}";
        if (groupingType.equals(Constants.WEEK)) {
            dateSql = "${sql.yearWeekOf('afm_cal_dates.cal_date')}";
        } else if (groupingType.equals(Constants.MONTH)) {
            dateSql = "${sql.yearMonthOf('afm_cal_dates.cal_date')}";
        } else if (groupingType.equals(Constants.QUARTER)) {
            dateSql = "${sql.yearQuarterOf('afm_cal_dates.cal_date')}";
        } else if (groupingType.equals(Constants.YEAR)) {
            dateSql = "${sql.yearOf('afm_cal_dates.cal_date')}";
        }
        return dateSql;
    }
    
    /**
     * Returns a String formatted by date group by.
     * 
     * @param date java.sql.Date Date value.
     * @param groupingType String grouping type "date", "week", "month", "quarter", "year".
     * 
     * @return String.
     */
    public static String getDateGroup(final Date date, final String groupingType) {
        String dateGroup = "";
        final SimpleDateFormat formatYear = new SimpleDateFormat("yyyy", Locale.getDefault());
        final SimpleDateFormat formatYearMonth =
                new SimpleDateFormat("yyyy-MM", Locale.getDefault());
        final SimpleDateFormat formatMonth = new SimpleDateFormat("M", Locale.getDefault());
        final SimpleDateFormat formatYearWeek =
                new SimpleDateFormat("yyyy-ww", Locale.getDefault());
        final SimpleDateFormat formatDate = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault());
        if (groupingType.equals(Constants.YEAR)) {
            dateGroup = formatYear.format(date);
        } else if (groupingType.equals(Constants.QUARTER)) {
            // CHECKSTYLE:OFF Justification: Suppress "'3' is a Magic Number"
            // '3' is used only once in this file. Cannot justify declaring a variable for it.
            final Integer quarter = (Integer.parseInt(formatMonth.format(date)) + 2) / 3;
            // CHECKSTYLE:ON
            dateGroup = formatYear.format(date) + "-" + quarter;
        } else if (groupingType.equals(Constants.MONTH)) {
            dateGroup = formatYearMonth.format(date);
        } else if (groupingType.equals(Constants.WEEK)) {
            dateGroup = formatYearWeek.format(date);
        } else {
            dateGroup = formatDate.format(date);
        }
        return dateGroup;
    }
    
    /**
     * Returns afm_cal_dates DataSource for costs.
     * 
     * @param
     * 
     * @return DataSource.
     */
    public static DataSource getDatesDs() {
        final DataSource datesDs = DataSourceFactory.createDataSource();
        datesDs.addTable(Constants.AFM_CAL_DATES_TABLE, DataSource.ROLE_MAIN);
        datesDs.addVirtualField(Constants.AFM_CAL_DATES_TABLE, Constants.DATE_FIELD,
            DataSource.DATA_TYPE_TEXT);
        datesDs.addVirtualField(Constants.AFM_CAL_DATES_TABLE, "costs",
            DataSource.DATA_TYPE_NUMBER, Constants.SIZE_18, Constants.DECIMALS_0);
        datesDs.addSort(Constants.AFM_CAL_DATES_TABLE, Constants.DATE_FIELD);
        return datesDs;
    }
    
    /**
     * Returns sql null value statement.
     * 
     * @return String sql null value statement.
     */
    public static String getNvl() {
        String nvl = "";
        if (SqlUtils.isOracle()) {
            nvl = Constants.NULL_VALUE;
        } else {
            nvl = Constants.IS_NULL;
        }
        return nvl;
    }
    
    /**
     * Returns sql top statement.
     * 
     * @return String sql TOP statement.
     */
    public static String getTop() {
        String top = "";
        if (SqlUtils.isSqlServer()) {
            top = Constants.SQL_SERV_TOP;
        }
        return top;
    }
    
    /**
     * Returns sql datepart statement.
     * 
     * @return String sql DATEPART statement.
     */
    public static String getDatePart() {
        String datePart = "";
        if (SqlUtils.isOracle()) {
            datePart = "TO_CHAR(cal_date, 'd')-1";
        } else {
            datePart = "DATEPART(dw, cal_date)-1";
        }
        return datePart;
    }
}
