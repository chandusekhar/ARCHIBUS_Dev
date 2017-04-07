package com.archibus.eventhandler.energy;

import java.text.*;
import java.util.*;

import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.utility.ExceptionBase;
import com.ibm.icu.util.Calendar;

/**
 * TimePeriodUtil - This class handles all calculations related to time_period, index and Dates
 *
 * <p>
 * History:
 * <li>19.1 Initial implementation.
 *
 * @author Winston Lagos
 */
public class TimePeriodUtilService {

    /**
     * getDateRange Returns a date range by converting the startPeriod param which is in time_period
     * format (yyyy-mm) into a Date obj and subtracting the amount of months provided by size param.
     *
     * @param startPeriod
     * @param range
     * @return the date range
     */
    public static List<Date> getDateRange(final String startTimePeriod, final Integer size) {

        final String[] timePeriodFlds = { "time_period", "period_index", "name" };
        final DataSource timePeriodDS =
                DataSourceFactory.createDataSourceForFields("energy_time_period", timePeriodFlds);
        timePeriodDS.addRestriction(Restrictions.eq("energy_time_period", "time_period",
            startTimePeriod));
        DataRecord timePeriodRecord = timePeriodDS.getRecord();

        final Integer start_index =
                Integer.parseInt(timePeriodRecord.getValue("energy_time_period.period_index")
                    .toString());
        final Integer end_index = start_index - size;

        timePeriodDS.clearRestrictions();
        timePeriodDS.addRestriction(Restrictions
            .eq("energy_time_period", "period_index", end_index));
        timePeriodRecord = timePeriodDS.getRecord();
        final String endDate =
                timePeriodRecord.getValue("energy_time_period.time_period").toString();

        Date date_start = new Date();
        Date date_end = new Date();
        final ArrayList<Date> dateRange = new ArrayList<Date>();
        try {
            date_start = convertTimePeriodToDate(startTimePeriod);
            date_end = convertTimePeriodToDate(endDate);
            dateRange.add(date_start);
            dateRange.add(date_end);
        } catch (final ParseException e) {
            throw new ExceptionBase("end_date or start_date have invalid values for indices :"
                    + start_index + " and " + end_index);
        }
        return dateRange;
    }

    /**
     * convertTimePeriodToDate Returns the date corresponding to the time_period provided.
     *
     * @param startPeriod
     * @return calculated date
     */
    public static Date convertTimePeriodToDate(final String timePeriod) throws ParseException {
        SimpleDateFormat dateFormat;
        Date date;

        if (timePeriod == null) {
            throw new ParseException("Null time period string", 0);
        }
        dateFormat = new SimpleDateFormat("yyyy-MM");
        try {
            date = dateFormat.parse(timePeriod);
        } catch (final ParseException e) {
            throw new ExceptionBase("Time Period Provided was invalid: " + timePeriod);
        }

        return date;
    }

    /**
     * convertDatePeriodToTimePeriod Returns the time_period corresponding to the Date provided.
     *
     * @param date
     * @return calculated time period
     */
    public static String convertDatePeriodToTimePeriod(final String date) throws ParseException {
        final String timePeriod = date.substring(0, 6);
        return timePeriod;
    }

    /**
     * getPeriodIndexNow Returns the index for the time_period associated with the current day
     *
     * @return current time period
     */
    public static Integer getPeriodIndexNow() {
        final Calendar cal = Calendar.getInstance();
        final Integer month = cal.get(Calendar.MONTH) + 1;
        String sMonth = null;
        if (month < 10) {
            sMonth = "0" + month.toString();
        } else {
            sMonth = month.toString();
        }
        final int year = cal.get(Calendar.YEAR);
        final String currentTimePeriod = year + "-" + sMonth;
        final String[] timePeriodFlds = { "time_period", "period_index", "name" };
        final DataSource timePeriodDS =
                DataSourceFactory.createDataSourceForFields("energy_time_period", timePeriodFlds);
        timePeriodDS.addRestriction(Restrictions.eq("energy_time_period", "time_period",
            currentTimePeriod));
        final DataRecord timePeriodRecord = timePeriodDS.getRecord();
        final Integer index =
                Integer.parseInt(timePeriodRecord.getValue("energy_time_period.period_index")
                    .toString());
        return index;

    }

    /**
     * convertIndexToTimePeriod Returns the time_period for the index provided
     *
     * @param index
     * @return calculated time period
     */
    public static String convertIndexToTimePeriod(Integer index) {
        if (index == 0) {
            index = 1;
        }
        final String[] timePeriodFlds = { "time_period", "period_index", "name" };
        final DataSource timePeriodDS =
                DataSourceFactory.createDataSourceForFields("energy_time_period", timePeriodFlds);
        timePeriodDS.addRestriction(Restrictions.eq("energy_time_period", "period_index", index));
        final DataRecord timePeriodRecord = timePeriodDS.getRecord();
        final String timePeriod =
                timePeriodRecord.getValue("energy_time_period.time_period").toString();
        return timePeriod;

    }

    /**
     * convertTimePeriodToIndex Returns the index for the time_period provided
     *
     * @param timePeriod
     * @return calculated index
     */
    public static Integer convertTimePeriodToIndex(final String timePeriod) {
        final String[] timePeriodFlds = { "time_period", "period_index", "name" };
        final DataSource timePeriodDS =
                DataSourceFactory.createDataSourceForFields("energy_time_period", timePeriodFlds);
        timePeriodDS.addRestriction(Restrictions
            .eq("energy_time_period", "time_period", timePeriod));
        final DataRecord timePeriodRecord = timePeriodDS.getRecord();
        final Integer index =
                Integer.parseInt(timePeriodRecord.getValue("energy_time_period.period_index")
                    .toString());
        return index;

    }

    /*
     * getInterval - return the interval from which we process data based on the level of
     * granularity.(0 - 15MIN , 1 - HOURLY, 2 - DAILY, 3 - WEEKLY, 4 - MONTHLY, 5 - QUARTERLY, 6 -
     * YEARLY).
     * 
     * (KE 2016-02-23 - Set default interval to HOURLY. Only process at 15MIN if meter interval
     * value is exactly 15 minutes. This is because for 15-minute processing, readings are copied
     * over directly rather than aggregated precisely by 15-minute intervals. If meter
     * sampling_interval is left at 0, only process to HOURLY.)
     * 
     * @param dataPointId - interval in seconds
     * 
     * @return - the code for interval
     */
    public static int getInterval(final String dataPointId) {
        final DataSource billDs =
                DataSourceFactory.loadDataSourceFromFile(BasConstants.EDIT_VIEW_NAME,
                    BasConstants.ENERGY_BAS_EDIT_DS7);
        billDs.addRestriction(Restrictions.eq(BasConstants.POINT, BasConstants.DATA_POINT_ID,
            dataPointId));
        final DataRecord recordBill = billDs.getRecords().get(0);
        final int intervalValue =
                (Integer) (recordBill.getValue("bas_data_point.sampling_interval"));
        int ret = BasConstants.NO_1;
        if (intervalValue == BasConstants.FIFTEENMINUTES) {
            ret = BasConstants.NO_0;
        } else if (intervalValue < BasConstants.DAILY) {
            ret = BasConstants.NO_1;
        } else if (intervalValue < BasConstants.WEEKLY) {
            ret = BasConstants.NO_2;
        } else if (intervalValue < BasConstants.MONTHLY) {
            ret = BasConstants.NO_3;
        } else if (intervalValue < BasConstants.QUARTERLY) {
            ret = BasConstants.NO_4;
        } else if (intervalValue < BasConstants.YEARLY) {
            ret = BasConstants.NO_5;
        } else if (intervalValue >= BasConstants.YEARLY) {
            ret = BasConstants.NO_6;
        }
        return ret;
    }

    /**
     * isWithinAYear - Return true if input year-month value is within the year preceding the
     * current system date, rounding up to the nearest full month.
     *
     * @param yearMonth Year-Month string to compare with current date
     * @return true of false
     */
    public static boolean isWithinAYear(final String yearMonth) {
        final Calendar cal = Calendar.getInstance();
        final java.text.SimpleDateFormat dateFormat = new java.text.SimpleDateFormat("yyyy-mm");
        java.util.Date testYearMonth = cal.getTime();
        try {
            testYearMonth = dateFormat.parse(yearMonth);
        } catch (final ParseException e) {
            // @non-translatable
            throw new ExceptionBase("Update Failed", e);
        }
        cal.add(Calendar.YEAR, -1);
        final java.util.Date lastYear = cal.getTime();

        Boolean testResult;

        if (lastYear.compareTo(testYearMonth) < 0) {
            testResult = true;
        } else {
            testResult = false;
        }

        return testResult;
    }

    /**
     * isWithinAYear - Return true if input year-month value is newer that the parameter
     * BASSchedDataDelete_AgeMonths, rounding up to the nearest full month.
     *
     * (KE 0216-02-25 - Return true if parameter value is default 0.
     *
     * @param yearMonth Year-Month string to compare with date minus the parameter
     * @return true of false
     */
    public static boolean isNewerThanParameter(final String yearMonth) {
        final DataSource dataSource =
                DataSourceFactory.createDataSourceForTable("afm_activity_params");
        final List<DataRecord> records = dataSource.getRecords();
        DataRecord record = null;
        boolean check = false;
        for (int i = 0; i < records.size(); i++) {
            record = records.get(i);
            final String name = (String) record.getValue("afm_activity_params.param_id");
            if ("BASSchedDataDelete_AgeMonths".equals(name)) {
                check = true;
                break;
            }
        }
        final int months;
        if (check == true) {
            months =
                    Integer.parseInt(record.getValue("afm_activity_params.param_value").toString());
        } else {
            months = 0;
        }
        final Date date = new Date();
        final Calendar calendar = Calendar.getInstance();
        calendar.setTime(date);
        calendar.add(Calendar.MONTH, -months);
        final SimpleDateFormat sdFormat = new SimpleDateFormat("yyyy-MM", Locale.ENGLISH);
        final String parsedDate = sdFormat.format(calendar.getTime());

        Boolean testResult = true;

        if (months > 0) {
            final Calendar cal = Calendar.getInstance();
            final java.text.SimpleDateFormat dateFormat = new java.text.SimpleDateFormat("yyyy-mm");
            java.util.Date testYearMonth = cal.getTime();
            java.util.Date yearM = cal.getTime();
            try {
                testYearMonth = dateFormat.parse(yearMonth);
                yearM = dateFormat.parse(parsedDate);
            } catch (final ParseException e) {
                // @non-translatable
                throw new ExceptionBase("Update Failed", e);
            }

            if ((yearM.compareTo(testYearMonth) < 0) || yearM.compareTo(testYearMonth) == 1) {
                testResult = true;
            } else {
                testResult = false;
            }
        }
        return testResult;
    }

    public static int diff(final java.util.Date date1, final java.util.Date date2) {
        final Calendar c1 = Calendar.getInstance();
        final Calendar c2 = Calendar.getInstance();

        c1.setTime(date1);
        c2.setTime(date2);
        int diffDay = 0;

        while (!c2.after(c1)) {
            c2.add(Calendar.DAY_OF_MONTH, 1);
            diffDay++;
        }

        if (diffDay > 0) {
            diffDay--;
        }

        return diffDay;
    }
}
