package com.archibus.eventhandler.hoteling;

import java.text.SimpleDateFormat;
import java.util.*;

import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.model.view.datasource.ClauseDef.Operation;
import com.archibus.model.view.datasource.*;
import com.archibus.utility.*;

/**
 * Helper Class for Hoteling activity that holds methods and variables used in all java files.<br>
 * <p>
 *
 * @author Guo
 * @since 20.3
 */
public final class HotelingUtility {

    /**
     * Constructor method for removing warning: 'Utility classes should not have a public or default
     * constructor'.
     *
     */
    private HotelingUtility() {
    }

    /**
     * add '' to the given value to used for SQL condition.
     *
     * @param string the string that need add ''
     * @return return the string after add ''
     */
    public static String literal(final String string) {
        return " '" + SqlUtils.makeLiteralOrBlank(string) + "'  ";
    }

    /**
     * Get RMPCT table DataSource.
     *
     * @return DataSource Object
     */
    public static DataSource getRmpctDataSource() {
        return DataSourceFactory.createDataSourceForFields(HotelingConstants.RMPCT, new String[] {
                HotelingConstants.ACTIVITY_LOG_ID, HotelingConstants.PCT_ID,
                HotelingConstants.PARENT_PCT_ID, HotelingConstants.DATE_START,
                HotelingConstants.DATE_END, HotelingConstants.DAY_PART, HotelingConstants.BL_ID,
                HotelingConstants.FL_ID, HotelingConstants.RM_ID, HotelingConstants.EM_ID,
                HotelingConstants.RESOURCES, HotelingConstants.VISITOR_ID,
                HotelingConstants.STATUS, HotelingConstants.DV_ID, HotelingConstants.DP_ID,
                HotelingConstants.AC_ID, HotelingConstants.RM_CAT, HotelingConstants.RM_TYPE,
                HotelingConstants.PCT_TIME, HotelingConstants.PCT_SPACE, HotelingConstants.PRORATE,
                HotelingConstants.PRIMARY_RM, HotelingConstants.PRIMARY_EM,
                HotelingConstants.CONFIRMED });
    }

    /**
     * Get RM table DataSource.
     *
     * @return DataSource Object
     */
    public static DataSource getRmDataSource() {
        return DataSourceFactory.createDataSourceForFields(HotelingConstants.T_RM, new String[] {
                HotelingConstants.BL_ID, HotelingConstants.FL_ID, HotelingConstants.RM_ID,
                HotelingConstants.DV_ID, HotelingConstants.DP_ID, HotelingConstants.RM_CAT,
                HotelingConstants.RM_TYPE, HotelingConstants.CAP_EM, HotelingConstants.PRORATE });
    }

    /**
     * Get ACTIVITY_LOG table DataSource.
     *
     * @return DataSource Object
     */
    public static DataSource getActivityLogDataSource() {
        return DataSourceFactory.createDataSourceForFields(HotelingConstants.ACTIVITY_LOG,
            new String[] { HotelingConstants.ACTIVITY_LOG_ID, HotelingConstants.ACTIVITY_TYPE,
                HotelingConstants.DATE_REQUESTED, HotelingConstants.TIME_REQUESTED,
                HotelingConstants.STATUS, HotelingConstants.REQUESTER,
                HotelingConstants.RECURRING_RULE, HotelingConstants.DATE_APPROVED });
    }

    /**
     * Get visitor table DataSource.
     *
     * @return DataSource Object
     */
    public static DataSource getVisitorDataSource() {

        return DataSourceFactory.createDataSourceForFields(HotelingConstants.VISITORS,
            new String[] { HotelingConstants.VISITOR_ID, HotelingConstants.NAME_FIRST,
                HotelingConstants.NAME_LAST });
    }

    /**
     * Get room record by primary keys.
     *
     * @param blId building code
     * @param flId floor code
     * @param rmId room code
     *
     * @return DataRecord Object
     */
    public static DataRecord getRmRecord(final String blId, final String flId, final String rmId) {

        // build the query restriction
        final ParsedRestrictionDef restriction = new ParsedRestrictionDef();
        restriction.addClause(HotelingConstants.T_RM, HotelingConstants.BL_ID, blId,
            Operation.EQUALS);
        restriction.addClause(HotelingConstants.T_RM, HotelingConstants.FL_ID, flId,
            Operation.EQUALS);
        restriction.addClause(HotelingConstants.T_RM, HotelingConstants.RM_ID, rmId,
            Operation.EQUALS);

        DataRecord room = null;
        // query the room
        final List<DataRecord> rmList = getRmDataSource().getRecords(restriction);
        if (!rmList.isEmpty()) {
            room = rmList.get(0);
        }

        // return the room object
        return room;
    }

    /**
     * Get department manager by name.
     *
     * @param dvId building code
     * @param dpId floor code
     *
     * @return approve manager
     */
    public static String getDepartManagerByDpId(final String dvId, final String dpId) {
        // create datasource
        final DataSource dpDS =
                DataSourceFactory.createDataSourceForFields(HotelingConstants.T_DP, new String[] {
                        HotelingConstants.DV_ID, HotelingConstants.DP_ID,
                        HotelingConstants.APPROVE_MGR });

        // build the query restriction
        final ParsedRestrictionDef restriction = new ParsedRestrictionDef();
        restriction.addClause(HotelingConstants.T_DP, HotelingConstants.DV_ID, dvId,
            Operation.EQUALS);
        restriction.addClause(HotelingConstants.T_DP, HotelingConstants.DP_ID, dpId,
            Operation.EQUALS);

        DataRecord dpRecord = null;
        // query the room
        final List<DataRecord> dpList = dpDS.getRecords(restriction);
        if (!dpList.isEmpty()) {
            dpRecord = dpList.get(0);
        }

        String manager = null;
        if (dpRecord != null) {
            manager =
                    dpRecord.getString(HotelingConstants.T_DP + HotelingConstants.DOT
                        + HotelingConstants.APPROVE_MGR);
        }

        return manager;
    }

    /**
     * To calculate and return time zone date of given building's location for input check date.
     *
     * @param checkDate date need to calculate
     * @param blId building id
     *
     * @return time zone date
     */
    public static Date getTimeZoneDateOfBl(final Date checkDate, final String blId) {

        Date timeZoneDate = checkDate;
        // create datasource
        final DataSource blDS =
                DataSourceFactory.createDataSource()
                .addTable(HotelingConstants.T_BL, DataSource.ROLE_MAIN)
                .addTable(HotelingConstants.T_CITY, DataSource.ROLE_STANDARD)
                .addField(HotelingConstants.T_BL, HotelingConstants.BL_ID)
                .addField(HotelingConstants.T_CITY, HotelingConstants.TIMEZONE_ID);

        // build the query restriction
        final ParsedRestrictionDef restriction = new ParsedRestrictionDef();
        restriction.addClause(HotelingConstants.T_BL, HotelingConstants.BL_ID, blId,
            Operation.EQUALS);

        // Get building records
        final List<DataRecord> records = blDS.getRecords(restriction);

        if (!records.isEmpty()) {
            final String blCityTimezone = records.get(0).getString("city.timezone_id");
            TimeZone blTz;
            if (StringUtil.notNullOrEmpty(blCityTimezone)) {
                blTz = TimeZone.getTimeZone(blCityTimezone);
            } else {
                blTz = TimeZone.getDefault();
            }

            final int serverHourOffSet =
                    TimeZone.getDefault().getOffset(0) / HotelingConstants.NUMBER_3600000;
            final int blHourOffSet = blTz.getOffset(0) / HotelingConstants.NUMBER_3600000;

            @SuppressWarnings("deprecation")
            final int hourOffset =
            blHourOffSet - serverHourOffSet + Utility.currentTime().getHours();

            if (hourOffset >= HotelingConstants.NUMBER_24) {
                final Date timeZoneDateOfBl = checkDate;
                timeZoneDateOfBl.setTime(checkDate.getTime() + HotelingConstants.NUMBER_86400000);
                timeZoneDate = timeZoneDateOfBl;
            } else if (hourOffset < 0) {
                final Date timeZoneDateOfBl = checkDate;
                timeZoneDateOfBl.setTime(checkDate.getTime() - HotelingConstants.NUMBER_86400000);
                timeZoneDate = timeZoneDateOfBl;
            }
        }

        return timeZoneDate;

    }

    /**
     * Check the given date is passed current date.
     *
     * @param date date
     * @param blId blId
     * @return compare result
     */
    public static int isDatePassed(final Date date, final String blId) {
        final String datesStartStr = date.toString();
        final Date currdate =
                blId == null ? Utility.currentDate() : getTimeZoneDateOfBl(Utility.currentDate(),
                    blId);
                final String currdateStr = currdate.toString().trim();
                int isDatePassed = 0;
                if (!currdateStr.equals(datesStartStr)) {
                    isDatePassed = currdate.compareTo(date);
                }
                return isDatePassed;
    }

    /**
     * get activity log id from pct_id.
     *
     * @param pctId pct id
     * @return return activity log id
     */
    public static int getActivityLogIdFromPctId(final int pctId) {
        final DataSource rmpctDS = getRmpctDataSource();

        // build the query restriction
        final ParsedRestrictionDef restriction = new ParsedRestrictionDef();
        restriction.addClause(HotelingConstants.RMPCT, HotelingConstants.PCT_ID, pctId,
            Operation.EQUALS);

        DataRecord record = null;
        // query the room
        final List<DataRecord> records = rmpctDS.getRecords(restriction);
        if (!records.isEmpty()) {
            record = records.get(0);
        }

        int activityLogId = 0;
        if (record != null) {
            activityLogId =
                    record.getInt(HotelingConstants.RMPCT + HotelingConstants.DOT
                        + HotelingConstants.ACTIVITY_LOG_ID);
        }

        return activityLogId;
    }

    /**
     * Get employee standard(em_std) by given employee code(em_id).
     *
     * @param emId employee name
     * @return employee standard
     */
    public static String getEmployeeStandard(final String emId) {
        final DataSource emDS =
                DataSourceFactory.createDataSourceForFields("em", new String[] {
                        HotelingConstants.EM_ID, "em_std" });
        final DataRecord emRecord = emDS.getRecord(" em.em_id='" + emId + "' ");

        String emStd = null;
        if (emRecord != null) {
            emStd = emRecord.getString("em.em_std");
        }

        return emStd;
    }

    /**
     * Judge whether need approve for give emId .
     *
     * @param emId employee name
     * @param dvId division name
     * @param dpId department name
     *
     * @return true or false
     */
    public static boolean isNeedApprove(final String emId, final String dvId, final String dpId) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();

        boolean needApprove = true;

        final boolean isApprovedRequired =
                HotelingConstants.YES.equalsIgnoreCase(EventHandlerBase.getActivityParameterString(
                    context, HotelingConstants.AB_SPACE_HOTELLING, "ApprovalRequired"));

        final boolean isSpecialUser =
                ContextStore.get().getUser().isMemberOfGroup("HOTEL BOOKINGS WITHOUT APPROVAL")
                || ContextStore.get().getUser().isMemberOfGroup("HOTELING ADMINISTRATION")
                || (emId != null && emId.equals(getDepartManagerByDpId(dvId, dpId)));

        if ((!isApprovedRequired) || isSpecialUser) {
            needApprove = false;
        }

        return needApprove;

    }

    /**
     * set parent pct_id for given pct_id .
     *
     * @param pctId pct_id
     * @param parentPctId parent_pct_id
     *
     *            <p>
     *            Suppress warning PMD.AvoidUsingSql.
     *            <p>
     *            Justification: Case #2.2: Statements with UPDATE ... WHERE pattern.
     */
    @SuppressWarnings({ "PMD.AvoidUsingSql" })
    public static void setParentPctId(final int pctId, final int parentPctId) {
        // bulk update
        final String updateRmpct =
                "UPDATE rmpct set parent_pct_id=" + parentPctId + " WHERE parent_pct_id=" + pctId;

        HotelingUtility.getRmpctDataSource().addQuery(updateRmpct).executeUpdate();
    }

    /**
     * select the min pct_id as new parent_pct_id.
     *
     * @param pctId pct-id
     * @return mix pct_id
     */
    public static int selectMinPctIdAsParentPctId(final int pctId) {
        final int minPctId =
                DataStatistics.getInt(HotelingConstants.RMPCT, HotelingConstants.PCT_ID,
                    HotelingConstants.MIN, " em_id is not null and parent_pct_id=" + pctId);

        return minPctId;
    }

    /**
     * update activity_log status.
     *
     * @param activityLogId activity_log_id
     * @param status activity log status
     */
    public static void updateActivityLogStatus(final int activityLogId, final String status) {

        final DataSource activityLogDs =
                DataSourceFactory.createDataSourceForFields(HotelingConstants.ACTIVITY_LOG,
                    new String[] { HotelingConstants.ACTIVITY_LOG_ID, HotelingConstants.STATUS });
        activityLogDs.addRestriction(Restrictions.eq(HotelingConstants.ACTIVITY_LOG,
            HotelingConstants.ACTIVITY_LOG_ID, activityLogId));
        final DataRecord record = activityLogDs.getRecord();
        if (record != null) {
            record.setValue(HotelingConstants.ACTIVITY_LOG + HotelingConstants.DOT
                + HotelingConstants.STATUS, status);
            activityLogDs.saveRecord(record);
        }

    }

    /**
     *
     * decide if the status of the activity log can be updated to APPROVED when approve a recurring
     * booking.
     *
     * @param activityLogId the activity log id
     * @param parentPctId the parent rmpct id
     * @return if the activity log can be updated when approve
     */
    public static boolean canUpdateActivityLogStatus(final int activityLogId, final int parentPctId) {
        final int unSolvedCount =
                DataStatistics.getInt("rmpct", "pct_id", "COUNT", " status=0 AND parent_pct_id="
                        + parentPctId);
        final int minActivityLogId =
                DataStatistics.getInt(HotelingConstants.RMPCT, HotelingConstants.ACTIVITY_LOG_ID,
                    HotelingConstants.MIN, " parent_pct_id=" + parentPctId);
        boolean flag = false;
        if (unSolvedCount <= 1) {
            flag = true;
        } else {
            if (minActivityLogId != activityLogId) {
                flag = true;
            }
        }
        return flag;
    }

    /**
     * prepare the SelectDataSource for cancel, approve ,reject.
     *
     * @param operationLevel Operation Level
     * @return DataSource
     */
    public static DataSource getDatasourceByOperationLevel(final String operationLevel) {
        final DataSource selectRecordDs = getRmpctJoinActivityLogDataSource();

        String pctOrParentField = "";
        if ("0".equals(operationLevel)) {
            pctOrParentField = HotelingConstants.PARENT_PCT_ID;
        }
        if ("1".equals(operationLevel)) {
            pctOrParentField = HotelingConstants.PCT_ID;
        }
        selectRecordDs
        .addRestriction(Restrictions.sql(pctOrParentField + " =${parameters['pct_id']} "))
        .addParameter(HotelingConstants.PCT_ID, "", DataSource.DATA_TYPE_INTEGER)
        .addSort(HotelingConstants.RMPCT, HotelingConstants.DATE_START);

        return selectRecordDs;
    }

    /**
     * Get RMPCT table DataSource.
     *
     * @return DataSource Object
     */
    public static DataSource getRmpctJoinActivityLogDataSource() {
        final DataSource dataSource = DataSourceFactory.createDataSource();
        dataSource.addTable(HotelingConstants.RMPCT, DataSource.ROLE_MAIN);
        dataSource.addTable(HotelingConstants.ACTIVITY_LOG, DataSource.ROLE_STANDARD);
        dataSource.addField(HotelingConstants.RMPCT, new String[] {
                HotelingConstants.ACTIVITY_LOG_ID, HotelingConstants.PCT_ID,
                HotelingConstants.PARENT_PCT_ID, HotelingConstants.DATE_START,
                HotelingConstants.DATE_END, HotelingConstants.DAY_PART, HotelingConstants.BL_ID,
                HotelingConstants.FL_ID, HotelingConstants.RM_ID, HotelingConstants.EM_ID,
                HotelingConstants.RESOURCES, HotelingConstants.VISITOR_ID,
                HotelingConstants.STATUS, HotelingConstants.DV_ID, HotelingConstants.DP_ID,
                HotelingConstants.AC_ID, HotelingConstants.RM_CAT, HotelingConstants.RM_TYPE,
                HotelingConstants.PCT_TIME, HotelingConstants.PCT_SPACE, HotelingConstants.PRORATE,
                HotelingConstants.PRIMARY_RM, HotelingConstants.PRIMARY_EM });
        dataSource.addField(HotelingConstants.ACTIVITY_LOG,
            new String[] { HotelingConstants.RECURRING_RULE });

        return dataSource;
    }

    /**
     * get visitor name by id.
     *
     * @param visitorId visitorId
     * @return visitor name
     */
    public static String getVisitoNameById(final int visitorId) {
        String name = "";
        final DataRecord visitor = getVisitorDataSource().getRecord("visitor_id=" + visitorId);
        if (visitor != null) {
            name =
                    visitor.getString("visitors.name_last") + ", "
                            + visitor.getString("visitors.name_first");

        }

        return name;
    }

    /**
     * get date start by pctid.
     *
     * @param pctId pctId
     * @return date start
     */
    public static Date getDateStartByPctId(final int pctId) {
        return HotelingUtility
                .getRmpctDataSource()
                .getRecord(HotelingConstants.PCT_ID + " =" + pctId)
                .getDate(HotelingConstants.RMPCT + HotelingConstants.DOT + HotelingConstants.DATE_START);
    }

    /**
     *
     * format a time with a style hh:mm.s.sss to hh:mm:ss.
     *
     * @param original the original time string
     * @return the new time string
     */
    public static String formatTime(final String original) {
        final String result = original.replace('.', ':');
        return result.substring(0, HotelingConstants.DECIMAL_NUMBER_EIGHT);
    }

    /**
     *
     * generate a sql time string as regard to any time.
     *
     * @param timeString the original time string.such as 10:00:00
     * @param type the year, month, day or hour etcs
     * @param factor the number added to the timeString,it can be positive or negative.
     * @return a new time string.
     */
    public static String formatSqlConfirmationTime(final String timeString, final String type,
            final int factor) {
        if (null == timeString || timeString.indexOf(':') < 0) {
            throw new IllegalArgumentException(HotelingConstants.BAD_TIME_FORMAT);
        }
        final String[] timeArray = timeString.split(":");
        if (timeArray.length < HotelingConstants.TIME_STANDARD_LENGTH) {
            throw new IllegalArgumentException(HotelingConstants.BAD_TIME_FORMAT);
        }
        final int hour = Integer.parseInt(timeArray[0]);
        final int minute = Integer.parseInt(timeArray[1]);
        final int second = Integer.parseInt(timeArray[2]);
        final Calendar calendar = Calendar.getInstance(Locale.getDefault());
        calendar.set(Calendar.HOUR_OF_DAY, hour);
        calendar.set(Calendar.MINUTE, minute);
        calendar.set(Calendar.SECOND, second);

        if (type.equalsIgnoreCase(HotelingConstants.CALENDAR_HOUR_MODIFIED)) {
            calendar.add(Calendar.HOUR_OF_DAY, factor);
        } else if (type.equalsIgnoreCase(HotelingConstants.CALENDAR_MINUTE_MODIFIED)) {
            calendar.add(Calendar.MINUTE, factor);
        } else if (type.equalsIgnoreCase(HotelingConstants.CALENDAR_SECOND_MODIFIED)) {
            calendar.add(Calendar.SECOND, factor);
        }
        final SimpleDateFormat timeFormat = new SimpleDateFormat("HH:mm:ss", Locale.getDefault());
        return timeFormat.format(calendar.getTime());
    }

    /**
     *
     * create afm_flds table datasource.
     *
     * @return the table afm_flds datasource
     */
    public static DataSource createAfmFieldsDataSource() {
        final DataSource afmDataSource =
                DataSourceFactory.createDataSourceForFields("afm_flds", new String[] {
                        "table_name", "field_name" });
        return afmDataSource;
    }

    /**
     *
     * As for regular hoteling, calculate the date separately.
     *
     * @param dateStart the start date of the hoteling
     * @param dateEnd the end date of the hoteling
     * @return the dates in which the bookings can generate.
     */
    public static List<Date> getRegularHotelingDateList(final Date dateStart, final Date dateEnd) {
        final List<Date> datesList = new ArrayList<Date>();
        final Calendar calendar = Calendar.getInstance();
        calendar.setTime(dateStart);
        while (!calendar.getTime().after(dateEnd)) {
            datesList.add(calendar.getTime());
            calendar.add(Calendar.DAY_OF_YEAR, 1);
        }
        return datesList;
    }
}
