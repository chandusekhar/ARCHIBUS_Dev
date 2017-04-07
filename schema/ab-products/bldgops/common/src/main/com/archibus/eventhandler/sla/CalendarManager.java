package com.archibus.eventhandler.sla;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.GregorianCalendar;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

import com.archibus.eventhandler.helpdesk.HelpdeskEventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;

/**
 * 
 * <p>
 * Calendar Manager is used to calculate Holiday dates. The Holidays are stored in the
 * <code>afm_holiday_dates</code> table.
 * </p>
 * 
 * <p>
 * Holidays can differ from country (<code>ctry</code> and region (<code>regn</code>).
 * </p>
 * 
 */

public class CalendarManager extends HelpdeskEventHandlerBase {
    
    //fix KB3030757-Date formats are not synchronized. It is recommended to create separate format instances for each thread(Guo 2011/4/12) 
    //private static final DateFormat isoDateFormatter = new SimpleDateFormat("yyyy-MM-dd");

    // fast searchable TreeMap
    // key = date , description = value
    /**
     * Map with holiday descriptions (key = date, value = description)
     */
    Map holidays = new TreeMap();

    /**
     * Workflow rule execution context
     */
    private final EventHandlerContext context;

    /**
     * Service Window days, starting on Sunday index 0.
     * 
     * <p>
     * The Service Window is part of the Service Level Agremeent logic.
     * 
     * @see ServiceLevelAgreement
     * @see ServiceWindow
     */
    private boolean[] serviceWindowDays = new boolean[7];

    /**
     * Country the calendar is restricted to (if given)
     */
    private String ctry_id;
    /**
     * Region the calendar is restricted to (if given)
     */
    private String regn_id;

    /**
     * Year the calendar is restricted to
     */
    private final int year;

    /**
     * Basic Constructor, passing the country and region.
     * 
     * <p>
     * Pass <code>null</code> values for country or region if not known.
     * </p>
     * 
     * @param context Workflow rule execution context
     * @param ctry_id Country code
     * @param regn_id Region code
     */
    public CalendarManager(EventHandlerContext context, String ctry_id, String regn_id) {
        this(context, ctry_id, regn_id, 0, null);
    }

    /**
     * Constructor for getting the year calendar.
     * 
     * @param context Workflow rule execution context
     * @param ctry_id Country code
     * @param regn_id Region code
     * @param year Year
     */
    public CalendarManager(EventHandlerContext context, String ctry_id, String regn_id, int year) {
        this(context, ctry_id, regn_id, year, null);
    }

    /**
     * 
     * @param context Workflow rule execution context
     * @param ctry_id Country code
     * @param regn_id Region code
     * @param serviceWindowDays Service Windows Days array (e.g. 0,1,1,1,1,1,0)
     */
    public CalendarManager(EventHandlerContext context, String ctry_id, String regn_id,
            boolean[] serviceWindowDays) {
        this(context, ctry_id, regn_id, 0, serviceWindowDays);
    }

    /**
     * Constructor using <code>year</code> the Service Window.
     * 
     * @param context
     * @param ctry_id
     * @param regn_id
     * @param serviceWindowDays
     */
    public CalendarManager(EventHandlerContext context, String ctry_id, String regn_id, int year,
            boolean[] serviceWindowDays) {
        super();
        this.context = context;
        this.ctry_id = ctry_id;
        this.regn_id = regn_id;
        this.year = year;
        this.serviceWindowDays = serviceWindowDays;
        loadServiceCalendar();
    }

    /**
     * 
     * Check if the given day is a working day according to the service window.
     * 
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Check if the day_of_week of the given day is set true in
     * {@link #serviceWindowDays serviceWindowdays}</li>
     * <li>Check if the given day {@link #isHoliday(Calendar) is a holiday}</li>
     * </ol>
     * </p>
     * <p>
     * 
     * @param cal Calendar
     * @return Given day is working day or not according to the service window
     *         </p>
     */
    public boolean isServiceWindowWorkingDay(Calendar cal) {
        return serviceWindowDays[cal.get(GregorianCalendar.DAY_OF_WEEK)] && !isHoliday(cal);
    }

    /**
     * 
     * Check if the given day is a working day according to the service window.
     * 
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Check if the day_of_week of the given day is set true in
     * {@link #serviceWindowDays serviceWindowdays}</li>
     * <li>Check if the given day {@link #isHoliday(Calendar) is a holiday}</li>
     * </ol>
     * </p>
     * <p>
     * 
     * @param date Date
     * @return Given day is working day or not according to the service window
     *         </p>
     */
    public boolean isServiceWindowWorkingDay(Date date) {
        Calendar cal = Calendar.getInstance();
        cal.setTime(date);
        return isServiceWindowWorkingDay(cal);
    }

    /**
     * 
     * Get the name (description) of a holiday day. This is a translatable field.
     * 
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Format given date to simple format</li>
     * <li>Check if the given date is in the {@link #holidays holidays map}</li>
     * </ol>
     * </p>
     * <p>
     * 
     * @param date Date
     * @return Name of holiday
     *         </p>
     */
    public String getHolidayName(Date date) {
        String key = new SimpleDateFormat("yyyy-MM-dd").format(date);

        if (holidays.keySet().contains(key)) {
            return notNull(holidays.get(key));
        } else {
            return null;
        }
    }

    public Map getHolidays() {
        return holidays;
    }

    /**
     * 
     * Check if the given date is a holiday.
     * 
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Check if the given date is in the {@link #holidays holidays map}</li>
     * </ol>
     * </p>
     * <p>
     * 
     * @param date Date to check
     * @return Given date is holiday or not
     *         </p>
     */
    public boolean isHoliday(Date date) {
        String key = new SimpleDateFormat("yyyy-MM-dd").format(date);
        return holidays.keySet().contains(key);
    }

    /**
     * 
     * Check if the given date is a holiday.
     * 
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Check if the given date is in the {@link #holidays holidays map}</li>
     * </ol>
     * </p>
     * <p>
     * 
     * @param cal Calendar
     * @return Given date is holiday or not
     *         </p>
     */
    public boolean isHoliday(Calendar cal) {
        return isHoliday(cal.getTime());
    }

    /**
     * 
     * Check if the given date is a weekday (not saturday or sunday).
     * 
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Create a calendar instance</li>
     * <li>Check if the given date {@link #isWeekDay(Calendar) is a week day}</li>
     * </ol>
     * </p>
     * <p>
     * 
     * @param date Date to check
     * @return Given date is weekday or not
     *         </p>
     */
    public boolean isWeekDay(Date date) {
        Calendar cal = Calendar.getInstance();
        cal.setTime(date);
        return isWeekDay(cal);
    }

    /**
     * Check if the given date is a weekday (not saturday or sunday).
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Check if the given date is not saturday or sunday</li>
     * </ol>
     * </p>
     * <p>
     * 
     * @param cal Calendar to check
     * @return Given date is weekday or not
     *         </p>
     */
    public boolean isWeekDay(Calendar cal) {
        return cal.get(GregorianCalendar.DAY_OF_WEEK) != GregorianCalendar.SATURDAY
                && cal.get(GregorianCalendar.DAY_OF_WEEK) != GregorianCalendar.SUNDAY;
    }

    /**
     * 
     * Check if the given date falls in a weekend.
     * 
     * @param date Date to check
     * @return weekend or not
     */
    public boolean isWeekend(Date date) {
        Calendar cal = Calendar.getInstance();
        cal.setTime(date);
        return isWeekend(cal);
    }

    /**
     * 
     * Check if the given date falls in a weekend.
     * 
     * @param cal (Calendar) date to check
     * @return weekend or not
     */
    public boolean isWeekend(Calendar cal) {
        return cal.get(GregorianCalendar.DAY_OF_WEEK) == GregorianCalendar.SATURDAY
                || cal.get(GregorianCalendar.DAY_OF_WEEK) == GregorianCalendar.SUNDAY;
    }

    /**
     * 
     * Check if the given date is saturday.
     * 
     * @param date Date to check
     * @return weekend or not
     */
    public boolean isSaturday(Date date) {
        Calendar cal = Calendar.getInstance();
        cal.setTime(date);
        return isSaturday(cal);
    }

    /**
     * 
     * Check if the given date is saturday.
     * 
     * @param cal (Calendar) date to check
     * @return weekend or not
     */
    public boolean isSaturday(Calendar cal) {
        return cal.get(GregorianCalendar.DAY_OF_WEEK) == GregorianCalendar.SATURDAY;
    }

    /**
     * 
     * Check if the given date is sunday.
     * 
     * @param date Date to check
     * @return weekend or not
     */
    public boolean isSunday(Date date) {
        Calendar cal = Calendar.getInstance();
        cal.setTime(date);
        return isSunday(cal);
    }

    /**
     * 
     * Check if the given date is sunday.
     * 
     * @param cal (Calendar) date to check
     * @return weekend or not
     */
    public boolean isSunday(Calendar cal) {
        return cal.get(GregorianCalendar.DAY_OF_WEEK) == GregorianCalendar.SUNDAY;
    }

    /**
     * Retrieve ctry_id
     */
    public String getCtry_id() {
        return ctry_id;
    }

    /**
     * Set ctry_id
     * 
     * @param ctry_id Country Code
     */
    public void setCtry_id(String ctry_id) {
        this.ctry_id = ctry_id;
    }

    /**
     * Retrieve regn_id
     */
    public String getRegn_id() {
        return regn_id;
    }

    /**
     * Set regn_id
     * 
     * @param regn_id Region code
     */
    public void setRegn_id(String regn_id) {
        this.regn_id = regn_id;
    }

    /**
     * Retrieve serviceWindowDays
     */
    public boolean[] getServiceWindowDays() {
        return serviceWindowDays;
    }

    /**
     * Set serviceWindowDays
     * 
     * @param serviceWindowDays array for service window days
     */
    public void setServiceWindowDays(boolean[] serviceWindowDays) {
        this.serviceWindowDays = serviceWindowDays;
    }

    /**
     * Add a holiday on the given date with the given description to the
     * {@link #holidays holidays map}
     * 
     * @param isoDate holiday date
     * @param description holiday description
     */
    public void addHoliday(String isoDate, String description) {
        holidays.put(isoDate, description);
    }

    /**
     * Add a holiday on the given date with the given description to the
     * {@link #holidays holidays map}
     * 
     * @param date holiday date
     * @param description holiday description
     */
    public void addHoliday(Date date, String description) {
        holidays.put(new SimpleDateFormat("yyyy-MM-dd").format(date), description);
    }

    /**
     * Load the Holiday Calendar from database.
     * 
     * <p>
     * Holidays can be different for a country and region. The description is a translatable field.
     * The current locale of the context is used to retrieve the translated value or default value.
     * If the <code>year</code> is set, only holidays for the current year are retrieved.
     * </p>
     * 
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Create SQL query to get holiday days, depending on given country, region and year (all
     * optional)</li>
     * <li>Put selected days into the {@link #holidays holidays map}</li>
     * </ol>
     * </p>
     * <p>
     * <b>SQL:</b> <div>SELECT cal_date, description FROM afm_holiday_dates<br />
     * WHERE 0=0 AND (ctry_id IS NULL OR ctry_id = ?)<br />
     * AND (regn_id IS NULL OR regn_id = ?)<br />
     * AND (cal_date BETWEEN <i>start of given year</i> AND <i>end of given year</i>) </div>
     * </p>
     */
    private void loadServiceCalendar() {
        // load holidays (all)
        String where = "0=0";

        if (ctry_id != null) {
            where += " AND (ctry_id IS NULL OR ctry_id = " + literal(context, ctry_id) + ")";

            if (regn_id != null) {
                where += " AND (regn_id IS NULL OR regn_id = " + literal(context, regn_id) + ")";
            } else {
                // where += " AND (regn_id IS NULL)";
            }
        } else {
            // where += " AND (ctry_id IS NULL)";
        }

        if (year != 0) {

            Calendar cal = Calendar.getInstance();

            cal.set(year, Calendar.JANUARY, 1);
            String startDate = new SimpleDateFormat("yyyy-MM-dd").format(cal.getTime());

            cal.set(year, Calendar.DECEMBER, 31);
            String endDate = new SimpleDateFormat("yyyy-MM-dd").format(cal.getTime());

            where += " AND ( cal_date BETWEEN " + formatSqlIsoToNativeDate(context, startDate)
                    + " AND " + formatSqlIsoToNativeDate(context, endDate) + "  )";
        }

        // String descriptionField = languageCode==null? "description" :
        // "description_"+languageCode;
        List records = selectDbRecords(context, "afm_holiday_dates", new String[] { "cal_date",
                "description" }, where);

        for (Iterator it = records.iterator(); it.hasNext();) {
            Object[] record = (Object[]) it.next();
            holidays.put(new SimpleDateFormat("yyyy-MM-dd").format(getDateValue(context, record[0])),
                         notNull(record[1]));
        }
    }

}
