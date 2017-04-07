package com.archibus.eventhandler.reservations;

import java.io.*;
import java.sql.Time;
import java.text.SimpleDateFormat;
import java.util.*;

import org.apache.log4j.Logger;

import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.eventhandler.helpdesk.RequestHandler;
import com.archibus.eventhandler.ondemandwork.*;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.*;

public class ReservationsEventHandlerBase extends EventHandlerBase {

    protected static Logger Classlog = Logger.getLogger(ReservationsEventHandlerBase.class);

    static final String ACTIVITY_ID = "AbWorkplaceReservations";

    /**
     * Put all messages of mail in a treemap
     *
     * @param context
     * @param Std : it can be "By" or "For" only
     * @param locale : locale of user
     * @return TreeMap with messages
     */
    public TreeMap<String, String> getMailMessages(final EventHandlerContext context, String Std,
            final String locale) {
        final TreeMap<String, String> messages = new TreeMap<String, String>();
        final int maxSubject = 4;
        final int maxBody = 13;
        Std = Std.toUpperCase();
        for (int i = 1; i <= maxSubject; i++) {
            messages.put("SUBJECT" + i,
                localizeMessage(context, ACTIVITY_ID, "NOTIFYREQUESTED" + Std + "_WFR",
                    "NOTIFYREQUESTED" + Std + "_SUBJECT_PART" + i, locale));
        }
        for (int i = 1; i <= maxBody; i++) {
            messages.put("BODY" + i,
                localizeMessage(context, ACTIVITY_ID, "NOTIFYREQUESTED" + Std + "_WFR",
                    "NOTIFYREQUESTED" + Std + "_BODY_PART" + i, locale));
        }

        messages.put("BODY11_2", localizeMessage(context, ACTIVITY_ID,
            "NOTIFYREQUESTED" + Std + "_WFR", "NOTIFYREQUESTED" + Std + "_BODY_PART11_2", locale));

        // EC - KB 3040163 - use other message content based on reservation status
        messages.put("BODY_PART2_CANCEL",
            localizeMessage(context, ACTIVITY_ID, "NOTIFYREQUESTED" + Std + "_WFR",
                "NOTIFYREQUESTED" + Std + "_BODY_PART2_CANCEL", locale));
        messages.put("BODY_PART2_REJECT",
            localizeMessage(context, ACTIVITY_ID, "NOTIFYREQUESTED" + Std + "_WFR",
                "NOTIFYREQUESTED" + Std + "_BODY_PART2_REJECT", locale));

        return messages;
    }

    /**
     * create a attachment cite for a mail
     *
     * @param parametersValues configuration parameters
     * @return String with route of created file.
     */
    public String createAttachments(final EventHandlerContext context,
            final TreeMap<String, String> parametersValues) {

        String result = "";
        final String errMessage = localizeMessage(context, ACTIVITY_ID, "SENDEMAILINVITATIONS_WFR",
            "SENDEMAILINVITATIONSERROR", null);
        final String RULE_ID = "createAttachments";

        try {
            String line = "";

            // kb#3034925: change encoding of ics file from default ansi to utf-8
            /*
             * File file = new File((String) parametersValues.get("path"), (String) parametersValues
             * .get("filename")); BufferedWriter out = new BufferedWriter(new FileWriter(file));
             */
            final String outfilename = parametersValues.get("path") + File.separator
                    + parametersValues.get("filename");
            final FileOutputStream file = new FileOutputStream(outfilename);
            final BufferedWriter out = new BufferedWriter(new OutputStreamWriter(file, "UTF-8"));

            line = "BEGIN:VCALENDAR";
            out.write(line);
            out.newLine();

            line = "PRODID:-//hacksw/handcal//NONSGML v1.0//EN";
            out.write(line);
            out.newLine();

            line = "VERSION:2.0";
            out.write(line);
            out.newLine();

            line = "METHOD:" + parametersValues.get("method");
            out.write(line);
            out.newLine();

            line = "BEGIN:VEVENT";
            out.write(line);
            out.newLine();

            line = parametersValues.get("attendeesSection");
            out.write(line);
            out.newLine();

            line = "ORGANIZER:MAILTO:" + parametersValues.get("mailTo");
            out.write(line);
            out.newLine();

            line = "DTSTART:" + parametersValues.get("dateStart") + "T"
                    + parametersValues.get("timeStart") + "Z";
            out.write(line);
            out.newLine();

            line = "DTEND:" + parametersValues.get("dateEnd") + "T"
                    + parametersValues.get("timeEnd") + "Z";
            out.write(line);
            out.newLine();

            if (parametersValues.containsKey("rruleFreq")) {
                line = "RRULE:FREQ=" + parametersValues.get("rruleFreq");
                line += ";UNTIL=" + parametersValues.get("rruleUntil");
                line += ";INTERVAL=" + parametersValues.get("rruleInternal");
                if (parametersValues.containsKey("rruleBySetPos")) {
                    line += ";BYSETPOS=" + parametersValues.get("rruleBySetPos");
                }
                if (parametersValues.containsKey("rruleByDay")) {
                    line += ";BYDAY=" + parametersValues.get("rruleByDay");
                }
                // BV
                if (parametersValues.containsKey("rruleByMonth")) {
                    if (parametersValues.containsKey("rruleByMonthDay")) {
                        // this is yearly pattern on specific date
                        // RRULE:FREQ=YEARLY;COUNT=5;BYMONTHDAY=5;BYMONTH=6
                        line += ";BYMONTHDAY=" + parametersValues.get("rruleByMonthDay");
                        line += ";BYMONTH=" + parametersValues.get("rruleByMonth");
                    } else {
                        // this is yearly pattern on a day of the week
                        line += ";BYMONTH=" + parametersValues.get("rruleByMonth");
                    }
                }
                //

                line += ";WKST=" + parametersValues.get("WKST");
                out.write(line);
                out.newLine();
            }
            if (parametersValues.containsKey("exDate")) {
                line = "EXDATE:" + parametersValues.get("exDate");
                out.write(line);
                out.newLine();
            }

            if (parametersValues.containsKey("sequence")) {
                line = "SEQUENCE:" + parametersValues.get("sequence");
                out.write(line);
                out.newLine();
            }
            line = "UID:" + parametersValues.get("uid");
            out.write(line);
            out.newLine();

            if (parametersValues.containsKey("recurrence-id")) {
                line = "RECURRENCE-ID:" + parametersValues.get("recurrence-id");
                out.write(line);
                out.newLine();
            }
            line = "LOCATION:" + parametersValues.get("location");
            out.write(line);
            out.newLine();

            line = buildIcalTimeStamp();
            out.write(line);
            out.newLine();

            line = "SUMMARY:" + parametersValues.get("summary");
            out.write(line);
            out.newLine();

            line = "DESCRIPTION:" + parametersValues.get("description");
            out.write(line);
            out.newLine();

            line = "CLASS:PUBLIC";
            out.write(line);
            out.newLine();

            line = "END:VEVENT";
            out.write(line);
            out.newLine();

            line = "END:VCALENDAR";
            out.write(line);
            out.newLine();

            // kb#3034925: change encoding of ics file from default ansi to utf-8
            out.flush();

            out.close();

            // result = file.getAbsolutePath();
            result = outfilename;

        } catch (final Throwable e) {
            handleError(context,
                ACTIVITY_ID + "-" + RULE_ID + ": Failed creating attachments " + e.getMessage(),
                errMessage, e);
            // log.info(ACTIVITY_ID+"-createAttachments: "+e);
        }

        return result;

    }

    private static String buildIcalTimeStamp() {
        String line;
        final SimpleDateFormat dateFormatter = new SimpleDateFormat("yyyyMMdd");
        final SimpleDateFormat timeFormatter = new SimpleDateFormat("HHmmss");
        final Calendar curDateTime = Calendar.getInstance();
        long time = curDateTime.getTimeInMillis();

        final int minutesoffset =
                -curDateTime.get(Calendar.ZONE_OFFSET) + curDateTime.get(Calendar.DST_OFFSET);
        time += minutesoffset;
        curDateTime.setTimeInMillis(time);
        line = "DTSTAMP:" + dateFormatter.format(curDateTime.getTime()) + "T"
                + timeFormatter.format(curDateTime.getTime());
        return line;
    }

    /**
     * Put all mesages of mail for send mail in a treemap
     *
     * @param context
     * @param locale : locale of user
     * @return TreeMap with messages
     */
    public TreeMap<String, String> getSendMailMessages(final EventHandlerContext context,
            final String locale) {
        final TreeMap<String, String> messages = new TreeMap<String, String>();
        final int maxSubject = 4;
        final int maxBody = 8;
        for (int i = 1; i <= maxSubject; i++) {
            messages.put("SUBJECT" + i, localizeMessage(context, ACTIVITY_ID,
                "SENDEMAILINVITATIONS_WFR", "SENDEMAILINVITATIONS_SUBJECT_PART" + i, locale));
        }
        for (int i = 1; i <= maxBody; i++) {
            messages.put("BODY" + i, localizeMessage(context, ACTIVITY_ID,
                "SENDEMAILINVITATIONS_WFR", "SENDEMAILINVITATIONS_BODY_PART" + i, locale));
        }

        messages.put("BODY1_2", localizeMessage(context, ACTIVITY_ID, "SENDEMAILINVITATIONS_WFR",
            "SENDEMAILINVITATIONS_BODY_PART1_2", locale));
        messages.put("BODY1_3", localizeMessage(context, ACTIVITY_ID, "SENDEMAILINVITATIONS_WFR",
            "SENDEMAILINVITATIONS_BODY_PART1_3", locale));
        messages.put("BODY2_2", localizeMessage(context, ACTIVITY_ID, "SENDEMAILINVITATIONS_WFR",
            "SENDEMAILINVITATIONS_BODY_PART2_2", locale));
        messages.put("BODY2_3", localizeMessage(context, ACTIVITY_ID, "SENDEMAILINVITATIONS_WFR",
            "SENDEMAILINVITATIONS_BODY_PART2_3", locale));
        messages.put("BODY6_2", localizeMessage(context, ACTIVITY_ID, "SENDEMAILINVITATIONS_WFR",
            "SENDEMAILINVITATIONS_BODY_PART6_2", locale));

        return messages;
    }

    /**
     * This function will log the error and throw a new Exception with the desired description
     *
     * @param context
     * @param logMessage
     * @param exceptionMessage
     * @param originalException
     * @return void
     */
    protected static void handleError(final EventHandlerContext context, final String logMessage,
            final String exceptionMessage, final Throwable originalException) {
        context.addResponseParameter("message", exceptionMessage);
        throw new ExceptionBase(null, exceptionMessage, originalException);
    }

    /**
     * This function will store the error of Email Notification to context with the desired
     * description
     *
     * @param context
     * @param logMessage
     * @param exceptionMessage
     * @param originalException
     * @param address
     * @return void
     */
    protected static void handleNotificationError(final EventHandlerContext context,
            final String logMessage, final String exceptionMessage,
            final Throwable originalException, final String address) {
        String errorMessage;
        if (StringUtil.notNullOrEmpty(address)) {
            errorMessage = address + ": " + exceptionMessage;
        } else {

            errorMessage = exceptionMessage;
        }

        context.addResponseParameter("message", errorMessage);
    }

    /**
     * return a value from Map. If this value not exist, return empty
     *
     * @param record
     * @param name
     * @return String
     */
    protected static String getString(final Map<?, ?> record, final String name) {
        String s = (String) record.get(name);
        if (s == null) {
            s = "";
        }
        return s;
    }

    /**
     * Changing HH:MM PM and am format into HH:MM:SS format
     *
     * @param date
     * @return String
     */
    protected static String transformDate(final String date) {
        String result = date;
        if (date.toUpperCase().indexOf("AM") > -1 || date.toUpperCase().indexOf("PM") > -1) {

            String hour = date.substring(0, date.indexOf(":"));
            final String minute = date.substring(date.indexOf(":") + 1, date.indexOf(" "));
            if (date.indexOf("AM") > -1) {
                hour = (hour.equals("12") ? "00" : hour);
            }
            if (date.indexOf("PM") > -1) {
                hour = (hour.equals("12") ? hour : String.valueOf(Integer.parseInt(hour) + 12));
            }
            result = hour + ":" + minute + ":00";
        }
        return result;
    }

    /*
     * This function transform a String into a Time, with the correct format @param t @return Time
     */
    protected static Time getTimeFromString(final String t) {
        final String[] l1 = t.split(":");
        final int h1 = new Integer(l1[0].toString()).intValue();
        final int m1 = new Integer(l1[1].toString().substring(0, 2)).intValue();
        final Calendar calendar = Calendar.getInstance();
        calendar.clear();
        calendar.set(1970, Calendar.JANUARY, 1, h1, m1, 0);
        return new Time(calendar.getTimeInMillis());
    }

    // kb#3035551: add different ics file to email attachment for requested_by
    public String createAttachments_requestedBy(final EventHandlerContext context,
            final TreeMap<String, String> parametersValues) {

        String result = "";
        final String errMessage = localizeMessage(context, ACTIVITY_ID, "SENDEMAILINVITATIONS_WFR",
            "SENDEMAILINVITATIONSERROR", null);
        final String RULE_ID = "createAttachments";

        try {
            String line = "";

            // kb#3034925: change encoding of ics file from default ansi to utf-8
            /*
             * File file = new File((String) parametersValues.get("path"), (String) parametersValues
             * .get("filename_requestedBy")); BufferedWriter out = new BufferedWriter(new
             * FileWriter(file));
             */
            final String outfilename =
                    parametersValues.get("path") + parametersValues.get("filename_requestedBy");
            final FileOutputStream file = new FileOutputStream(outfilename);
            final BufferedWriter out = new BufferedWriter(new OutputStreamWriter(file, "UTF-8"));
            // end kb3034925

            line = "BEGIN:VCALENDAR";
            out.write(line);
            out.newLine();

            line = "PRODID:-//hacksw/handcal//NONSGML v1.0//EN";
            out.write(line);
            out.newLine();

            line = "VERSION:2.0";
            out.write(line);
            out.newLine();

            line = "METHOD:" + parametersValues.get("method");
            out.write(line);
            out.newLine();

            line = "BEGIN:VEVENT";
            out.write(line);
            out.newLine();

            line = parametersValues.get("attendeesSection_requestedBy");
            out.write(line);
            out.newLine();

            line = "ORGANIZER:MAILTO:"
                    + getActivityParameterString(context, ACTIVITY_ID, "InternalServicesEmail");
            out.write(line);
            out.newLine();

            line = "DTSTART:" + parametersValues.get("dateStart") + "T"
                    + parametersValues.get("timeStart") + "Z";
            out.write(line);
            out.newLine();

            line = "DTEND:" + parametersValues.get("dateEnd") + "T"
                    + parametersValues.get("timeEnd") + "Z";
            out.write(line);
            out.newLine();

            if (parametersValues.containsKey("rruleFreq")) {
                line = "RRULE:FREQ=" + parametersValues.get("rruleFreq");
                line += ";UNTIL=" + parametersValues.get("rruleUntil");
                line += ";INTERVAL=" + parametersValues.get("rruleInternal");
                if (parametersValues.containsKey("rruleBySetPos")) {
                    line += ";BYSETPOS=" + parametersValues.get("rruleBySetPos");
                }
                if (parametersValues.containsKey("rruleByDay")) {
                    line += ";BYDAY=" + parametersValues.get("rruleByDay");
                }
                line += ";WKST=" + parametersValues.get("WKST");
                out.write(line);
                out.newLine();
            }
            if (parametersValues.containsKey("exDate")) {
                line = "EXDATE:" + parametersValues.get("exDate");
                out.write(line);
                out.newLine();
            }

            if (parametersValues.containsKey("sequence")) {
                line = "SEQUENCE:" + parametersValues.get("sequence");
                out.write(line);
                out.newLine();
            }
            line = "UID:" + parametersValues.get("uid");
            out.write(line);
            out.newLine();

            if (parametersValues.containsKey("recurrence-id")) {
                line = "RECURRENCE-ID:" + parametersValues.get("recurrence-id");
                out.write(line);
                out.newLine();
            }
            line = "LOCATION:" + parametersValues.get("location");
            out.write(line);
            out.newLine();

            line = buildIcalTimeStamp();
            out.write(line);
            out.newLine();

            line = "SUMMARY:" + parametersValues.get("summary");
            out.write(line);
            out.newLine();

            line = "DESCRIPTION:" + parametersValues.get("description");
            out.write(line);
            out.newLine();

            line = "CLASS:PUBLIC";
            out.write(line);
            out.newLine();

            line = "END:VEVENT";
            out.write(line);
            out.newLine();

            line = "END:VCALENDAR";
            out.write(line);
            out.newLine();

            // kb#3034925: change encoding of ics file from default ansi to utf-8
            out.flush();

            out.close();

            result = outfilename;

        } catch (final Throwable e) {
            handleError(context,
                ACTIVITY_ID + "-" + RULE_ID + ": Failed creating attachments " + e.getMessage(),
                errMessage, e);
            // log.info(ACTIVITY_ID+"-createAttachments: "+e);
        }

        return result;
    }

    /**
     * Create a work requests data source to cancel / stop work requests for different trades and
     * vendors than the specified ones.
     *
     * @param resId the reservation id
     * @param tradeToCreate the trade for which a work request should be generated
     * @param vendorToCreate the vendor for which a work request should be generated
     * @return the data source with restrictions set
     */
    protected DataSource createDataSourceToCancelOtherWorkRequests(final String resId,
            final String tradeToCreate, final String vendorToCreate) {
        final String[] fields =
                { "wr_id", "res_id", "status", "date_stat_chg", "time_stat_chg", "wo_id" };

        final DataSource workRequestDataSource =
                DataSourceFactory.createDataSourceForFields("wr", fields);
        workRequestDataSource.setApplyVpaRestrictions(false);
        workRequestDataSource.addRestriction(Restrictions.eq("wr", "res_id", resId));
        workRequestDataSource
            .addRestriction(Restrictions.in("wr", "status", "R,Rev,A,AA,I,HP,HA,HL"));
        workRequestDataSource.addRestriction(Restrictions.or(Restrictions.isNotNull("wr", "tr_id"),
            Restrictions.isNotNull("wr", "vn_id")));
        if (StringUtil.notNullOrEmpty(tradeToCreate)) {
            workRequestDataSource.addRestriction(Restrictions.or(Restrictions.isNull("wr", "tr_id"),
                Restrictions.ne("wr", "tr_id", tradeToCreate)));
        }
        if (StringUtil.notNullOrEmpty(vendorToCreate)) {
            workRequestDataSource.addRestriction(Restrictions.or(Restrictions.isNull("wr", "vn_id"),
                Restrictions.ne("wr", "vn_id", vendorToCreate)));
        }
        return workRequestDataSource;
    }

    /**
     * Create a work requests data source to save / update work requests. Add restrictions to
     * retrieve the work requests for the specified reservation and trade / vendor.
     *
     * @param createFor tr_id or vn_id to handle trades or vendors
     * @param nameToCreate name of the trade or vendor to set in the restriction
     * @param resId reservation identifier
     * @return the work requests data source with restrictions set
     */
    protected DataSource createDataSourceToSaveWorkRequests(final String createFor,
            final String nameToCreate, final String resId) {
        final DataSource dsWr = DataSourceFactory.createDataSourceForFields("wr",
            new String[] { "wr_id", "priority", "activity_type", "res_id", "rmres_id", "rsres_id",
                    "est_labor_hours", "requestor", "status", "bl_id", "fl_id", "rm_id",
                    "date_assigned", "time_assigned", "date_requested", "time_requested", "tr_id",
                    "vn_id", "phone", "dv_id", "dp_id", "description", "prob_type", "date_stat_chg",
                    "time_stat_chg" });
        dsWr.setApplyVpaRestrictions(false);
        // Retrieve the existing work request records for this reservation and trade/vendor.
        dsWr.addRestriction(Restrictions.eq("wr", "res_id", resId));
        dsWr.addRestriction(Restrictions.eq("wr", createFor, nameToCreate));
        dsWr.addRestriction(Restrictions.ne("wr", "status", "Can"));
        dsWr.addRestriction(Restrictions.ne("wr", "status", "S"));
        dsWr.addSort("wr", "time_assigned", DataSource.SORT_ASC);
        return dsWr;
    }

    /**
     * Determine the matching work request status based on the room reservation status and building
     * operations application parameter 'WorkRequestsOnly'.
     *
     * @param statusOfReservation reservation status ('Awaiting App.' or 'Confirmed')
     * @param isWorkRequestOnly true if Building Operations uses only work requests
     * @return the matching work request status: R, A or AA
     */
    protected String getStatusForWorkRequest(final String statusOfReservation,
            final boolean isWorkRequestOnly) {
        String workRequestStatus;
        if ("Awaiting App.".equals(statusOfReservation)) {
            workRequestStatus = "R";
        } else if (isWorkRequestOnly) {
            workRequestStatus = "AA";
        } else {
            workRequestStatus = "A";
        }
        return workRequestStatus;
    }

    /**
     * Calculate the correct time assigned for a work request / work order from the reservation
     * data. This adds the delta_time to the time_assigned. Delta_time corresponds to the room
     * arrangement pre_block for setup and is 0 for cleanup.
     *
     * @param dataRecord the reservation data
     * @param tableName table name for accessing the data
     * @param suffix the suffix indicating _setup or _cleanup for the setup or cleanup work request
     * @return the time value for time_assigned
     */
    protected Time getTimeAssigned(final DataRecord dataRecord, final String tableName,
            final String suffix) {
        final Calendar calendar = Calendar.getInstance();
        calendar.setTime(dataRecord.getDate(tableName + ".time_assigned" + suffix));
        calendar.add(Calendar.MINUTE, dataRecord.getInt(tableName + ".delta_time" + suffix));
        final Time timeAssigned = new Time(calendar.getTimeInMillis());
        return timeAssigned;
    }

    /**
     * Create or update a work request corresponding to reservation setup or cleanup, for a trade or
     * vendor.
     *
     * @param wrDataSource work request data source (to save the work request record)
     * @param wrRecord work request record (new or existing)
     * @param dataRecord the reservation data
     * @param tableName table name for accessing the data
     * @param pkeyFieldName primary key field name for the data
     * @param createFor tr_id or vn_id when creating for a trade or vendor
     * @param suffix _setup or _cleanup when creating for setup or cleanup
     */
    protected void saveWorkRequest(final DataSource wrDataSource, final DataRecord wrRecord,
            final DataRecord dataRecord, final String tableName, final String pkeyFieldName,
            final String createFor, final String suffix) {

        final String originalStatus = wrRecord.getString("wr.status");
        wrRecord.setValue("wr.status", dataRecord.getValue(tableName + ".status"));
        final String newStatus = wrRecord.getString("wr.status");

        wrRecord.setValue("wr.res_id", dataRecord.getValue(tableName + ".res_id"));
        wrRecord.setValue("wr." + pkeyFieldName,
            dataRecord.getValue(tableName + "." + pkeyFieldName));
        wrRecord.setValue("wr.bl_id", dataRecord.getValue(tableName + ".bl_id"));
        wrRecord.setValue("wr.fl_id", dataRecord.getValue(tableName + ".fl_id"));
        wrRecord.setValue("wr.rm_id", dataRecord.getValue(tableName + ".rm_id"));
        wrRecord.setValue("wr.requestor", dataRecord.getValue(tableName + ".requestor"));
        wrRecord.setValue("wr.date_assigned", dataRecord.getValue(tableName + ".date_assigned"));
        wrRecord.setValue("wr.date_requested", new Date());
        wrRecord.setValue("wr.time_requested", new java.sql.Time(System.currentTimeMillis()));
        wrRecord.setValue("wr.phone", dataRecord.getValue(tableName + ".phone"));
        wrRecord.setValue("wr.dv_id", dataRecord.getValue(tableName + ".dv_id"));
        wrRecord.setValue("wr.dp_id", dataRecord.getValue(tableName + ".dp_id"));
        wrRecord.setValue("wr." + createFor, dataRecord.getValue(tableName + "." + createFor));
        wrRecord.setValue("wr.est_labor_hours",
            dataRecord.getValue(tableName + ".est_labor_hours" + suffix));
        wrRecord.setValue("wr.time_assigned", getTimeAssigned(dataRecord, tableName, suffix));
        wrRecord.setValue("wr.description",
            dataRecord.getValue(tableName + ".description" + suffix));
        wrRecord.setValue("wr.prob_type", dataRecord.getValue(tableName + ".prob_type" + suffix));
        wrRecord.setValue("wr.activity_type", "SERVICE DESK - MAINTENANCE");

        final Map<String, Object> wrValues = wrRecord.getValues();

        // convert dates and times to strings in the wrValues map
        wrValues.put("wr.date_assigned", wrRecord.getNeutralValue("wr.date_assigned"));
        wrValues.put("wr.time_assigned", wrRecord.getNeutralValue("wr.time_assigned"));
        wrValues.put("wr.date_requested", wrRecord.getNeutralValue("wr.date_requested"));
        wrValues.put("wr.time_requested", wrRecord.getNeutralValue("wr.time_requested"));

        // remove the status value, we only set that directly via status manager
        wrValues.remove("wr.status");

        if (wrRecord.isNew()) {
            // copy only the fields that exist in activity log to another map
            final Map<String, Object> activityLogValues = new HashMap<String, Object>();
            activityLogValues.put("wr.bl_id", wrValues.get("wr.bl_id"));
            activityLogValues.put("wr.fl_id", wrValues.get("wr.fl_id"));
            activityLogValues.put("wr.rm_id", wrValues.get("wr.rm_id"));
            activityLogValues.put("wr.requestor", wrValues.get("wr.requestor"));
            activityLogValues.put("wr.dv_id", wrValues.get("wr.dv_id"));
            activityLogValues.put("wr.dp_id", wrValues.get("wr.dp_id"));
            activityLogValues.put("wr." + createFor, wrValues.get("wr." + createFor));
            activityLogValues.put("wr.description", wrValues.get("wr.description"));
            activityLogValues.put("wr.prob_type", wrValues.get("wr.prob_type"));
            activityLogValues.put("wr.activity_type", wrValues.get("wr.activity_type"));

            // Submit the activity log request so BldgOps can generate the work request
            final RequestHandler requestHandler = new RequestHandler();
            requestHandler.submitRequest("", EventHandlerBase.toJSONObject(activityLogValues));
            final int activityLogId = ContextStore.get().getEventHandlerContext()
                .getInt("activity_log.activity_log_id");

            // Query the wr table by activity_log_id to find the wr_id and priority
            final DataSource dataSource = DataSourceFactory.createDataSourceForFields("wr",
                new String[] { "wr_id", "priority", "activity_log_id" });
            dataSource.addRestriction(Restrictions.eq("wr", "activity_log_id", activityLogId));
            final DataRecord savedRecord = dataSource.getRecord();
            wrRecord.setValue("wr.wr_id", savedRecord.getInt("wr.wr_id"));
            wrRecord.setValue("wr.priority", savedRecord.getInt("wr.priority"));
            wrValues.put("wr.wr_id", wrRecord.getInt("wr.wr_id"));
            wrValues.put("wr.priority", wrRecord.getInt("wr.priority"));
        } else if (ReservationsEventHandlerBase.shouldUpdateStatus(originalStatus, newStatus)) {
            // Use the status manager to change the status of an existing work request
            final OnDemandWorkStatusManager statusManager = new OnDemandWorkStatusManager(
                ContextStore.get().getEventHandlerContext(), wrRecord.getInt("wr.wr_id"));
            statusManager.updateStatus(newStatus);
        }

        // Update all relevant work request fields to match the reservation.
        final WorkRequestHandler workRequestHandler = new WorkRequestHandler();
        workRequestHandler.editRequestParameters(EventHandlerBase.toJSONObject(wrValues));
    }

    /**
     * Check whether we should update the work request status. This isn't required between A and AA.
     *
     * @param currentStatus the current work request status
     * @param newStatus the new work request status
     * @return true if it should be updated, false if not
     */
    private static boolean shouldUpdateStatus(final String currentStatus, final String newStatus) {
        boolean updateStatus = false;
        if ("A".equals(newStatus) || "AA".equals(newStatus)) {
            updateStatus = !("A".equals(currentStatus) || "AA".equals(currentStatus));
        } else {
            updateStatus = !currentStatus.equals(newStatus);
        }
        return updateStatus;
    }

    /**
     * Add virtual field definitions to the reservations data source used to populate the work
     * requests and work orders.
     *
     * @param ds0 the reservations data source
     * @param tableName the main table name for the data source
     * @param pkeyFieldName field name of the primary key of the main table
     * @param createFor tr_id or vn_id to handle trades or vendors
     */
    protected void addVirtualFields(final DataSource ds0, final String tableName,
            final String pkeyFieldName, final String createFor) {
        ds0.addVirtualField(tableName, "res_id", DataSource.DATA_TYPE_INTEGER);
        ds0.addVirtualField(tableName, pkeyFieldName, DataSource.DATA_TYPE_INTEGER);
        ds0.addVirtualField(tableName, "bl_id", DataSource.DATA_TYPE_TEXT);
        ds0.addVirtualField(tableName, "fl_id", DataSource.DATA_TYPE_TEXT);
        ds0.addVirtualField(tableName, "rm_id", DataSource.DATA_TYPE_TEXT);

        ds0.addVirtualField(tableName, "status", DataSource.DATA_TYPE_TEXT);
        ds0.addVirtualField(tableName, "date_assigned", DataSource.DATA_TYPE_DATE);
        ds0.addVirtualField(tableName, createFor, DataSource.DATA_TYPE_TEXT);

        ds0.addVirtualField(tableName, "requestor", DataSource.DATA_TYPE_TEXT);
        ds0.addVirtualField(tableName, "phone", DataSource.DATA_TYPE_TEXT);
        ds0.addVirtualField(tableName, "dv_id", DataSource.DATA_TYPE_TEXT);
        ds0.addVirtualField(tableName, "dp_id", DataSource.DATA_TYPE_TEXT);

        ds0.addVirtualField(tableName, "est_labor_hours_setup", DataSource.DATA_TYPE_NUMBER);
        ds0.addVirtualField(tableName, "delta_time_setup", DataSource.DATA_TYPE_INTEGER);
        ds0.addVirtualField(tableName, "time_assigned_setup", DataSource.DATA_TYPE_TIME);
        ds0.addVirtualField(tableName, "description_setup", DataSource.DATA_TYPE_TEXT);
        ds0.addVirtualField(tableName, "prob_type_setup", DataSource.DATA_TYPE_TEXT);

        ds0.addVirtualField(tableName, "est_labor_hours_cleanup", DataSource.DATA_TYPE_NUMBER);
        ds0.addVirtualField(tableName, "delta_time_cleanup", DataSource.DATA_TYPE_INTEGER);
        ds0.addVirtualField(tableName, "time_assigned_cleanup", DataSource.DATA_TYPE_TIME);
        ds0.addVirtualField(tableName, "description_cleanup", DataSource.DATA_TYPE_TEXT);
        ds0.addVirtualField(tableName, "prob_type_cleanup", DataSource.DATA_TYPE_TEXT);
    }

}
