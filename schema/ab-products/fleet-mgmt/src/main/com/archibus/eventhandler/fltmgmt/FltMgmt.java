package com.archibus.eventhandler.fltmgmt;

import java.text.DateFormat;
import java.util.*;

import org.apache.log4j.Logger;

import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.*;
import com.archibus.datasource.*;

/**
 * <p>
 * This event handler implements business logic related to Fleet Dispatch and Repair Orders and
 * their associated email alerts.
 * </p>
 * 
 * @author John Till
 * @created March 1, 2011
 * @version 2.0
 * @since 1.0
 * 
 */
public class FltMgmt extends EventHandlerBase {

    static final String ACTIVITY_ID = "AbAssetFleetManagement";

    /**
     * Default constructor.
     */
    public FltMgmt() {
        super();
    }

    public void getDatabaseType(final EventHandlerContext context) {
        if (isOracle(context)) {
            context.addResponseParameter("message", "Oracle");
        } else if (isSqlServer(context)) {
            context.addResponseParameter("message", "MSSQL");
        } else if (isSybase(context)) {
            context.addResponseParameter("message", "Sybase");
        } else {
            context.addResponseParameter("message", "Other");
        }
    }

    public void sendFleetEmail(EventHandlerContext context) {
        final String body = (String) context.getParameter("body");
        final String subject = (String) context.getParameter("subject");
        final String recipient = (String) context.getParameter("recipient");

        if ((recipient != null) && (!recipient.equals(""))) {
            sendEmail(context, body, subject, recipient);
        }
    }

    private void sendEmail(EventHandlerContext context, String body, String subject,
            String recipient) {
        if (context.parameterExists("notifyEmailAddress")) {
            context.removeResponseParameter("notifyEmailAddress");
        }
        if (context.parameterExists("notifySubject")) {
            context.removeResponseParameter("notifySubject");
        }
        if (context.parameterExists("notifyBody")) {
            context.removeResponseParameter("notifyBody");
        }

        final String mail_mode = getActivityParameterString(context, "AbAssetFleetManagement",
            "MAIL_MODE");
        if (mail_mode.equals("DISABLED")) {
            return;
        }

        if (mail_mode.equals("LIVE")) {
            context.addResponseParameter("notifyEmailAddress", recipient);
        } else {
            context.addResponseParameter("notifyEmailAddress", getActivityParameterString(context,
                "AbAssetFleetManagement", "TEST_EMAIL"));
        }

        if (this.log.isDebugEnabled()) {
            this.log.debug("FLEET EMAIL\r\nRecipient: " + recipient + "\r\nSubject: " + subject
                    + "\r\nBody: " + body);
        }
        context.addResponseParameter("notifySubject", subject);
        context.addResponseParameter("notifyBody", body);

        runWorkflowRule(context, "AbCommonResources-notify", true);
    }

    public void executeFleetSQL(EventHandlerContext context) {
        String sqlQuery = null;

        if (isOracle(context) && context.parameterExists("sqlQueryOracle")) {
            sqlQuery = (String) context.getParameter("sqlQueryOracle");
        } else if (context.parameterExists("sqlQuery")) {
            sqlQuery = (String) context.getParameter("sqlQuery");
        }

        sqlQuery = expandParameters(context, sqlQuery);

        if (this.log.isDebugEnabled()) {
            this.log.debug("SQL=[" + sqlQuery + "]");
        }

        executeDbSql(context, sqlQuery, false);
    }

    class KeyReplacementException extends Exception {

        private static final long serialVersionUID = 1L;

        public KeyReplacementException() {
            super();
        }

        public KeyReplacementException(String message) {
            super(message);
        }

        public KeyReplacementException(Throwable cause) {
            super(cause);
        }

        public KeyReplacementException(String message, Throwable cause) {
            super(message, cause);
        }
    }

    @SuppressWarnings("unchecked")
    protected static <T> Collection<T> checkedCollectionFromRaw(final Collection<?> c,
            final Class<T> cls) {
        final Collection<T> result = Collections.checkedCollection(new ArrayList<T>(c.size()), cls);
        result.addAll((Collection) c);
        return result;
    }

    protected String getAllTableFields(final EventHandlerContext context,
            final String requestedTable) {
        final String sqlString = "SELECT field_name FROM afm_flds WHERE table_name='"
                + requestedTable + "'";
        final Collection<Map> queryResults = checkedCollectionFromRaw(EventHandlerBase
            .retrieveDbRecords(context, sqlString), Map.class);

        String fieldList = new String();
        for (final Map<String, String> thisRecord : queryResults) {
            fieldList += thisRecord.get("field_name") + ", ";
        }
        return fieldList.substring(0, fieldList.length() - 3);
    }

    protected int[] parseDays(final String inputDaysAdvance) {
        final String[] splitDays = inputDaysAdvance.replace(" ", "").split(",");
        int[] daysAdvance = new int[splitDays.length];

        for (int i = 0; i < splitDays.length; i++) {
            daysAdvance[i] = Integer.parseInt(splitDays[i]);
        }
        return daysAdvance;
    }

    protected static Logger Classlog = Logger.getLogger(EventHandlerBase.class);

    protected static void handleError(EventHandlerContext context, String logMessage,
            String exceptionMessage, Throwable originalException) {
        Classlog.error(logMessage);
        context.addResponseParameter("message", exceptionMessage);
        throw new ExceptionBase(exceptionMessage, originalException);
    }

    protected static String getFieldMLHeading(final EventHandlerContext context,
            final String table_name, final String field_name) {
        final String ml_heading = (String) EventHandlerBase.selectDbValue(context, "afm_flds",
            "mh_heading", "table_name=" + literal(context, table_name) + " AND field_name="
                    + literal(context, field_name));

        if (ml_heading == null) {
            return field_name;
        }
        return ml_heading;
    }

    protected String replacePMKeys(final EventHandlerContext context, final String string,
            final Map<String, String> thisRecord) throws KeyReplacementException {
        if (string == null) {
            throw new KeyReplacementException(
                "The String to perform key replacement on must not be null!");
        }

        if (thisRecord == null) {
            throw new KeyReplacementException(
                "The Map<String, String> to perform key replacement with must not be null!");
        }

        final DateFormat dateFormatter = DateFormat.getDateInstance(DateFormat.SHORT);

        return string.replace(
            "%RECIPIENT%",
            (thisRecord.get("name_first") != null ? thisRecord.get("name_first") : "") + " "
                    + (thisRecord.get("name_last") != null ? thisRecord.get("name_last") : ""))
            .replace(
                "%PROCEDURE%",
                thisRecord.get("maint_proc") != null ? thisRecord.get("maint_proc").toLowerCase()
                        : "[no procedure found]").replace(
                "%VEHICLE%",
                thisRecord.get("vehicle") != null ? thisRecord.get("vehicle")
                        : "[no vehicle found]").replace("%MAKE%",
                thisRecord.get("make") != null ? thisRecord.get("make") : "[no make found]")
            .replace("%MODEL%",
                thisRecord.get("model") != null ? thisRecord.get("model") : "[no model found]")
            .replace(
                "%LICENSE%",
                thisRecord.get("license") != null ? thisRecord.get("license")
                        : "[no license found]").replace(
                "%SERIAL%",
                thisRecord.get("num_serial") != null ? thisRecord.get("num_serial")
                        : "[no serial found]").replace(
                "%DATEDUE%",
                dateFormatter.format(getDateValue(context,
                    thisRecord.get("date_next_todo") != null ? thisRecord.get("date_next_todo")
                            : thisRecord.get("date_next_alt_todo")))).replace("\\n", "\n");
    }

    protected String replaceServiceKeys(final EventHandlerContext context, final String string,
            final Map<String, String> thisRecord) throws KeyReplacementException {
        if (string == null) {
            throw new KeyReplacementException(
                "The String to perform key replacement on must not be null!");
        }

        if (thisRecord == null) {
            throw new KeyReplacementException(
                "The Map<String, String> to perform key replacement with must not be null!");
        }

        final DateFormat dateFormatter = DateFormat.getDateInstance(DateFormat.SHORT);
        final DateFormat timeFormatter = DateFormat.getTimeInstance(DateFormat.SHORT);

        return string.replace(
            "%RECIPIENT%",
            (thisRecord.get("name_first") != null ? thisRecord.get("name_first") : "") + " "
                    + (thisRecord.get("name_last") != null ? thisRecord.get("name_last") : ""))
            .replace(
                "%SHOP%",
                thisRecord.get("repair_shop") != null ? thisRecord.get("repair_shop")
                        : "[no shop found]").replace(
                "%PROCEDURE%",
                thisRecord.get("repair_type") != null ? thisRecord.get("repair_type").toLowerCase()
                        : "[no procedure found]").replace(
                "%VEHICLE%",
                thisRecord.get("vehicle") != null ? thisRecord.get("vehicle")
                        : "[no vehicle found]").replace("%MAKE%",
                thisRecord.get("make") != null ? thisRecord.get("make") : "[no make found]")
            .replace("%MODEL%",
                thisRecord.get("model") != null ? thisRecord.get("model") : "[no model found]")
            .replace(
                "%LICENSE%",
                thisRecord.get("license") != null ? thisRecord.get("license")
                        : "[no license found]").replace(
                "%SERIAL%",
                thisRecord.get("num_serial") != null ? thisRecord.get("num_serial")
                        : "[no serial found]").replace("%DATEDUE%",
                dateFormatter.format(getDateValue(context, thisRecord.get("date_perform"))))
            .replace("%TIMEDUE%",
                timeFormatter.format(getTimeValue(context, thisRecord.get("time_perform"))))
            .replace("\\n", "\n");
    }

    public void sendPMEmails(final EventHandlerContext context) {
        try {
            final String subject = context.getString("pMSubject");
            final String body = context.getString("pMBody");
            final int[] daysAdvance = this.parseDays(context.getString("pMDaysAdvance"));

            for (int days : daysAdvance) {
                try {
                    if (days < 0) {
                        throw new ExceptionBase(
                            "Values in input parameter 'PMDaysAdvance' must be zero or greater!");
                    }

                    final String dateNextTodo = formatSqlAddDays(context, Utility.currentDate()
                        .toString(), Integer.toString(days));

                    final String sqlStatement = "SELECT "
                            + "pms.vehicle_id, pms.date_next_todo, pms.date_next_alt_todo, pms.pmp_id, "
                            + "pmp.description AS maint_proc, vehicle.num_serial, vehicle.license, "
                            + "vehicle.description as vehicle, vehicle.mfr_id, flt_mfr.description AS make, "
                            + "vehicle.model_id, flt_model.description AS model,  vehicle.em_id, "
                            + "em.name_first, em.name_last, em.email, vehicle.dv_id, vehicle.dp_id, "
                            + "dp.name, dp.email AS dp_email "
                            + "FROM "
                            + "pms, pmp, vehicle "
                            + "LEFT JOIN em ON em.em_id=vehicle.em_id "
                            + "LEFT JOIN dp ON dp.dv_id=vehicle.dv_id AND dp.dp_id=vehicle.dp_id "
                            + "LEFT JOIN flt_mfr ON flt_mfr.mfr_id=vehicle.mfr_id "
                            + "LEFT JOIN flt_model ON flt_model.model_id=vehicle.model_id "
                            + "WHERE "
                            + "vehicle.vehicle_id=pms.vehicle_id "
                            + "AND pmp.pmp_id=pms.pmp_id "
                            + "AND (vehicle.em_id IS NOT NULL OR vehicle.dp_id IS NOT NULL) "
                            + "AND NOT EXISTS "
                            + "(SELECT flt_order.pms_id FROM flt_order WHERE flt_order.pms_id=pms.pms_id AND flt_order.vehicle_id=pms.vehicle_id) "
                            + "AND ((pms.date_next_todo=" + dateNextTodo
                            + " AND pms.date_next_alt_todo IS NULL) "
                            + "OR pms.date_next_alt_todo=" + dateNextTodo + ")";
                    final Collection<Map> queryResults = checkedCollectionFromRaw(EventHandlerBase
                        .retrieveDbRecords(context, sqlStatement), Map.class);

                    for (final Map<String, String> thisRecord : queryResults) {
                        try {
                            new ArrayList<String>();

                            if (thisRecord.get("email") != null
                                    || thisRecord.get("dp_email") != null) {
                                final String toAddress = thisRecord.get("email") != null ? thisRecord
                                    .get("email")
                                        : thisRecord.get("dp_email");

                                // if (thisRecord.get("email") != null && thisRecord.get("dp_email")
                                // != null) {
                                // ccAddresses.add(thisRecord.get("dp_email"));
                                // }

                                // sendFleetEmail(context, toAddress, ccAddresses,
                                // this.replacePMKeys(context, subject, thisRecord),
                                // this.replacePMKeys(context, body, thisRecord));
                                sendEmail(context, this.replacePMKeys(context, body, thisRecord),
                                    this.replacePMKeys(context, subject, thisRecord), toAddress);
                            }
                        } catch (final Exception e) {
                            this.log.error(
                                "Failed building and sending preventative maintenance email!", e);
                        }
                    }
                } catch (final Exception e) {
                    this.log.error("Failed querying for preventative maintenance emails!", e);
                }
            }
        } catch (final Exception e) {
            this.log.error("Failed reading preventative maintenance email activity parameters!", e);
        }
    }

    public void sendServiceEmails(final EventHandlerContext context) {
        try {
            final String subject = context.getString("serviceSubject");
            final String body = context.getString("serviceBody");
            final int[] daysAdvance = this.parseDays(context.getString("serviceDaysAdvance"));

            for (int element : daysAdvance) {
                try {
                    if (element >= 0) {
                        final String datePerform = formatSqlAddDays(context, Utility.currentDate()
                            .toString(), Integer.toString(element));

                        final String sqlStatement = "SELECT "
                                + "flt_order.vehicle_id, flt_order.date_perform, flt_order.time_perform, flt_order.fo_id, "
                                + "flt_repair_type.description AS repair_type, flt_shop.description AS repair_shop, "
                                + "vehicle.num_serial, vehicle.license, vehicle.description as vehicle, vehicle.mfr_id, "
                                + "flt_mfr.description AS make, vehicle.model_id, flt_model.description AS model, "
                                + "vehicle.em_id, em.name_first, em.name_last, em.email, vehicle.dv_id, "
                                + "vehicle.dp_id, dp.name, dp.email AS dp_email "
                                + "FROM "
                                + "flt_order, flt_repair_type, flt_shop, vehicle "
                                + "LEFT JOIN em ON em.em_id=vehicle.em_id "
                                + "LEFT JOIN dp ON dp.dv_id=vehicle.dv_id AND dp.dp_id=vehicle.dp_id "
                                + "LEFT JOIN flt_mfr ON flt_mfr.mfr_id=vehicle.mfr_id "
                                + "LEFT JOIN flt_model ON flt_model.model_id=vehicle.model_id "
                                + "WHERE " + "fo_type='RO' "
                                + "AND flt_repair_type.repair_type_id=flt_order.repair_type_id "
                                + "AND flt_shop.shop_id=flt_order.shop_id "
                                + "AND vehicle.vehicle_id=flt_order.vehicle_id "
                                + "AND flt_order.date_perform=" + datePerform;
                        final Collection<Map> queryResults = checkedCollectionFromRaw(
                            EventHandlerBase.retrieveDbRecords(context, sqlStatement), Map.class);

                        for (final Map<String, String> thisRecord : queryResults) {
                            try {
                                if (thisRecord.get("email") != null
                                        || thisRecord.get("dp_email") != null) {
                                    final String toAddress = thisRecord.get("email") != null ? thisRecord
                                        .get("email")
                                            : thisRecord.get("dp_email");

                                    // if (thisRecord.get("email") != null &&
                                    // thisRecord.get("dp_email") != null) {
                                    // ccAddresses = new ArrayList<String>();
                                    // ccAddresses.add(thisRecord.get("dp_email"));
                                    // }

                                    // sendFleetEmail(context, toAddress, ccAddresses,
                                    // this.replaceServiceKeys(context, subject, thisRecord),
                                    // this.replaceServiceKeys(context, body, thisRecord));
                                    sendEmail(context, this.replaceServiceKeys(context, body,
                                        thisRecord), this.replaceServiceKeys(context, subject,
                                        thisRecord), toAddress);
                                }
                            } catch (final Exception e) {
                                this.log
                                    .error("Failed building and sending repair order email!", e);
                            }
                        }
                    }
                } catch (final Exception e) {
                    this.log.error("Failed querying for repair order emails!", e);
                }
            }
        } catch (final Exception e) {
            this.log.error("Failed reading repair order email input parameters!", e);
        }
    }

    public void sendOverduePMEmails(final EventHandlerContext context) {
        try {
            final String subject = context.getString("oPMSubject");
            final String body = context.getString("oPMBody");
            final int daysPast = context.getInt("oPMDaysPast");

            try {
                if (daysPast < 0) {
                    throw new ExceptionBase(
                        "Input parameter 'oPMDaysPast' must be zero or greater!");
                }

                final Calendar now = Calendar.getInstance();
                now.setTime(Utility.currentDate());
                now.add(Calendar.DATE, -daysPast);

                final String baseDate = formatSqlDaysBetween(context, new java.sql.Date(now
                    .getTimeInMillis()).toString(), "pms.date_next_todo");
                final String altBaseDate = formatSqlDaysBetween(context, new java.sql.Date(now
                    .getTimeInMillis()).toString(), "pms.date_next_alt_todo");

                final String sqlStatement = "SELECT "
                        + "pms.vehicle_id, pms.date_next_todo, pms.date_next_alt_todo, pms.pmp_id, "
                        + "pmp.description AS maint_proc, vehicle.num_serial, vehicle.license, "
                        + "vehicle.description, vehicle.mfr_id, flt_mfr.description AS make, "
                        + "vehicle.model_id, flt_model.description AS model,  vehicle.em_id, "
                        + "em.name_first, em.name_last, em.email, vehicle.dv_id, vehicle.dp_id, "
                        + "dp.name, dp.email AS dp_email "
                        + "FROM "
                        + "pms, pmp, vehicle "
                        + "LEFT JOIN em ON em.em_id=vehicle.em_id "
                        + "LEFT JOIN dp ON dp.dv_id=vehicle.dv_id AND dp.dp_id=vehicle.dp_id "
                        + "LEFT JOIN flt_mfr ON flt_mfr.mfr_id=vehicle.mfr_id "
                        + "LEFT JOIN flt_model ON flt_model.model_id=vehicle.model_id "
                        + "WHERE "
                        + "vehicle.vehicle_id=pms.vehicle_id "
                        + "AND pmp.pmp_id=pms.pmp_id "
                        + "AND (vehicle.em_id IS NOT NULL OR vehicle.dp_id IS NOT NULL) "
                        + "AND NOT EXISTS "
                        + "(SELECT flt_order.pms_id FROM flt_order WHERE flt_order.pms_id=pms.pms_id AND flt_order.vehicle_id=pms.vehicle_id) "
                        + "AND (("
                        + baseDate
                        + " % "
                        + daysPast
                        + "=0 AND pms.date_next_todo<"
                        + formatSqlFieldValue(context, Utility.currentDate(), "java.sql.Date",
                            "date_next_todo")
                        + " "
                        + "AND pms.date_next_alt_todo IS NULL) OR ("
                        + altBaseDate
                        + "%"
                        + daysPast
                        + "=0 "
                        + "AND pms.date_next_alt_todo<"
                        + formatSqlFieldValue(context, Utility.currentDate(), "java.sql.Date",
                            "date_next_alt_todo") + "))";
                final Collection<Map> queryResults = checkedCollectionFromRaw(EventHandlerBase
                    .retrieveDbRecords(context, sqlStatement), Map.class);

                for (final Map<String, String> thisRecord : queryResults) {
                    try {
                        new ArrayList<String>();

                        if (thisRecord.get("email") != null || thisRecord.get("dp_email") != null) {
                            final String toAddress = thisRecord.get("email") != null ? thisRecord
                                .get("email") : thisRecord.get("dp_email");

                            // if (thisRecord.get("email") != null && thisRecord.get("dp_email") !=
                            // null) {
                            // ccAddresses.add(thisRecord.get("dp_email"));
                            // }

                            // sendFleetEmail(context, toAddress, ccAddresses,
                            // this.replacePMKeys(context, subject, thisRecord),
                            // this.replacePMKeys(context, body, thisRecord));
                            sendEmail(context, this.replacePMKeys(context, body, thisRecord), this
                                .replacePMKeys(context, subject, thisRecord), toAddress);
                        }
                    } catch (final Exception e) {
                        this.log.error(
                            "Failed building and sending overdue preventative maintenance email!",
                            e);
                    }
                }
            } catch (final Exception e) {
                this.log.error("Failed querying for overdue preventative maintenance emails!", e);
            }
        } catch (final Exception e) {
            this.log.error(
                "Failed reading overdue preventative maintenance email activity parameters!", e);
        }
    }

    public void sendOverdueServiceEmails(final EventHandlerContext context) {
        try {
            final String subject = context.getString("oServiceSubject");
            final String body = context.getString("oServiceBody");
            final int daysPast = context.getInt("oServiceDaysPast");

            try {
                if (daysPast < 0) {
                    throw new ExceptionBase(
                        "Input parameter 'OverdueServiceDaysPast' must be zero or greater!");
                }

                final Calendar now = Calendar.getInstance();
                now.setTime(Utility.currentDate());
                now.add(Calendar.DATE, -daysPast);

                final String baseDate = formatSqlDaysBetween(context, new java.sql.Date(now
                    .getTimeInMillis()).toString(), "flt_order.date_perform");

                System.out.println(baseDate);
                System.out.println(daysPast);

                final String sqlStatement = "SELECT "
                        + "flt_order.vehicle_id, flt_order.date_perform, flt_order.time_perform, flt_order.fo_id, "
                        + "flt_repair_type.description AS repair_type, flt_shop.description AS repair_shop, "
                        + "vehicle.num_serial, vehicle.license, vehicle.description, vehicle.mfr_id, "
                        + "flt_mfr.description AS make, vehicle.model_id, flt_model.description AS model, "
                        + "vehicle.em_id, em.name_first, em.name_last, em.email, vehicle.dv_id, "
                        + "vehicle.dp_id, dp.name, dp.email AS dp_email "
                        + "FROM "
                        + "flt_order, flt_repair_type, flt_shop, vehicle LEFT JOIN em ON em.em_id=vehicle.em_id "
                        + "LEFT JOIN dp ON dp.dv_id=vehicle.dv_id AND dp.dp_id=vehicle.dp_id "
                        + "LEFT JOIN flt_mfr ON flt_mfr.mfr_id=vehicle.mfr_id "
                        + "LEFT JOIN flt_model ON flt_model.model_id=vehicle.model_id "
                        + "WHERE "
                        + "fo_type='RO' AND flt_repair_type.repair_type_id=flt_order.repair_type_id "
                        + "AND flt_shop.shop_id=flt_order.shop_id AND vehicle.vehicle_id=flt_order.vehicle_id AND "
                        + baseDate
                        + "%"
                        + daysPast
                        + "=0 AND flt_order.date_perform<"
                        + formatSqlFieldValue(context, Utility.currentDate(), "java.sql.Date",
                            "date_perform");
                final Collection<Map> queryResults = checkedCollectionFromRaw(EventHandlerBase
                    .retrieveDbRecords(context, sqlStatement), Map.class);

                for (final Map<String, String> thisRecord : queryResults) {
                    try {
                        new ArrayList<String>();

                        if (thisRecord.get("email") != null || thisRecord.get("dp_email") != null) {
                            final String toAddress = thisRecord.get("email") != null ? thisRecord
                                .get("email") : thisRecord.get("dp_email");

                            // if (thisRecord.get("email") != null && thisRecord.get("dp_email") !=
                            // null) {
                            // ccAddresses.add(thisRecord.get("dp_email"));
                            // }

                            // sendFleetEmail(context, toAddress, ccAddresses,
                            // this.replaceServiceKeys(context, subject, thisRecord),
                            // this.replaceServiceKeys(context, body, thisRecord));
                            sendEmail(context, this.replaceServiceKeys(context, body, thisRecord),
                                this.replaceServiceKeys(context, subject, thisRecord), toAddress);
                        }
                    } catch (final Exception e) {
                        this.log.error("Failed building and sending repair order email!", e);
                    }
                }
            } catch (final Exception e) {
                this.log.error("Failed querying for repair order emails!", e);
            }
        } catch (final Exception e) {
            this.log.error("Failed reading repair order email activity parameters!", e);
        }
    }

    public void scheduleNextPMs(final EventHandlerContext context) {

        final Integer fo_id = context.getInt("fo_id");
        final Integer pms_id = context.getInt("pms_id");
        final String status = context.getString("status");

        if(status.equals("Com") && (pms_id != null))
        {
            final Integer current_meter = (Integer) EventHandlerBase.selectDbValue(context, "flt_order", "current_meter", "fo_id = " + fo_id);
            final String date_completed = formatSqlIsoToNativeDate(context, (String) EventHandlerBase.selectDbValue(context, "flt_order", "date_completed", "fo_id = " + fo_id));
            String sqlString = "";
            if (isOracle(context)) {
                sqlString = "UPDATE pms SET date_last_completed=" + date_completed +
                            ", overdue_miles=0" +
                            ", meter_last_pm=" + current_meter +
                            ", date_next_alt_todo=" + date_completed + "+interval_max_days" +
                            " where pms_id=" + pms_id;
            } else {
                sqlString = "UPDATE pms SET date_last_completed=" + date_completed +
                            ", overdue_miles=0" +
                            ", meter_last_pm=" + current_meter +
                            ", date_next_alt_todo=dateadd(d,interval_max_days," + date_completed + ")" +
                            " where pms_id=" + pms_id;
            }

            try {
                EventHandlerBase.executeDbSql(context, sqlString, true);
            }  
            catch( Throwable e ) {
                this.log.error("Error occurred while updating next PM schedule date.", e);
            }
        }
    }

    public void closeFleetOrders(final EventHandlerContext context) {

        FieldFormula ff = new FieldFormula();
        String sSqlStmt;

        // CALC_RESOURCES from FLTSUP.ABS
        ff.setAssigned("flt_rocf");
        ff.setStandard("cf");
        ff.setAssignedRestriction("EXISTS (SELECT flt_order.status FROM flt_order WHERE flt_order.fo_id=flt_rocf.fo_id AND flt_order.status NOT IN ('Rej','Can'))");
        ff.calculate("flt_rocf.cost_estimated", "flt_rocf.hours_est      * cf.rate_hourly");
        ff.calculate("flt_rocf.cost_straight",  "flt_rocf.hours_straight * cf.rate_hourly");
        ff.calculate("flt_rocf.cost_over",      "flt_rocf.hours_over     * cf.rate_over");
        ff.calculate("flt_rocf.cost_double",    "flt_rocf.hours_double   * cf.rate_double");
        ff.calculate("flt_rocf.cost_total",     "flt_rocf.cost_straight  + flt_rocf.cost_over  + flt_rocf.cost_double");
        ff.calculate("flt_rocf.hours_total",    "flt_rocf.hours_straight + flt_rocf.hours_over + flt_rocf.hours_double");
        ff.calculate("flt_rocf.hours_diff",     "flt_rocf.hours_total    - flt_rocf.hours_est");

        // FLTSUP_UPDATE_RO_PARTS from FLTSUP.ABS
        sSqlStmt = "SELECT flt_ropt.part_id, flt_ropt.qty_actual, flt_ropt.ropt_id, " +
                   "flt_ropt.fo_id, flt_ropt.status, FROM flt_ropt, flt_order WHERE flt_order.status IN ('S', 'Can', 'Com') " +
                   "AND fo_type='RO' AND flt_ropt.debited <> 1";
        final Collection<Map> queryResults = checkedCollectionFromRaw(EventHandlerBase.retrieveDbRecords(context, sSqlStmt), Map.class);
        for(final Map<String, String> thisRecord : queryResults)
        {
            final String  sPartID      = thisRecord.get("flt_ropt.part_id");
            final Integer iPartsEst    = Integer.valueOf(thisRecord.get("flt_ropt.qty_actual"));
            final Integer iPartsActual = iPartsEst;
            final String  sStatus      = thisRecord.get("flt_ropt.status");
            final Integer iFOID        = Integer.valueOf(thisRecord.get("flt_ropt.fo_id"));
            final Integer iROPTID      = Integer.valueOf(thisRecord.get("flt_ropt.ropt_id"));
            // This is odd, since both SQL statements are identical
            // According to the ABS it seems it should be different if the part is reserved
            if(sStatus.equals("R"))
            {
                sSqlStmt = "UPDATE pt SET qty_on_hand=qty_on_hand-" + iPartsActual + " WHERE part_id=" + literal(context, sPartID);
            }
            else
            {
                sSqlStmt = "UPDATE pt SET qty_on_hand=qty_on_hand-" + iPartsActual + " WHERE part_id=" + literal(context, sPartID);
            }
            try
            {
                EventHandlerBase.executeDbSql(context, sSqlStmt, true);
            }
            catch( Throwable e )
            {
                this.log.error("closeFleetOrders: "+e);
            }

            sSqlStmt = "UPDATE flt_ropt SET status='C', debited='1'" +
                       " WHERE part_id=" + literal(context, sPartID) +
                       " AND fo_id=" + iFOID +
                       " AND ropt_id=" + iROPTID;
            try
            {
                EventHandlerBase.executeDbSql(context, sSqlStmt, true);
            }
            catch( Throwable e )
            {
                this.log.error("closeFleetOrders: "+e);
            }
        }

        ff.setAssigned("flt_ropt");
        ff.setStandard("pt");
        ff.setAssignedRestriction("EXISTS (SELECT flt_order.status FROM flt_order WHERE flt_order.fo_id=flt_ropt.fo_id AND flt_order.fo_type='RO' AND flt_order.status NOT IN ('Rej','Can'))");
        ff.calculate("flt_ropt.cost_estimated", "flt_ropt.qty_estimated*pt.cost_unit_std");
        ff.calculate("flt_ropt.cost_actual", "flt_ropt.qty_actual*pt.cost_unit_std");

        new FieldOperation("flt_order", "flt_rocf")
            .setAssignedRestriction("NOT EXISTS (SELECT fo_id FROM flt_rocf WHERE flt_order.fo_id = flt_rocf.fo_id) AND flt_order.fo_type = 'RO' AND flt_order.status NOT IN ('Rej','Can')")
            .addOperation("flt_order.cost_est_labor", "SUM", "flt_rocf.cost_estimated")
            .addOperation("flt_order.est_labor_hours", "SUM", "flt_rocf.hours_est")
            .calculate();

        new FieldOperation("flt_order", "flt_rocf")
            .setAssignedRestriction("flt_order.status NOT IN ('Rej','Can') AND flt_order.fo_type = 'RO'")
            .addOperation("flt_order.cost_labor", "SUM", "flt_rocf.cost_total")
            .addOperation("flt_order.act_labor_hours", "SUM", "flt_rocf.hours_total")
            .calculate();

        new FieldOperation("flt_order", "flt_rocf")
            .addOperation("flt_order.cost_parts", "SUM", "flt_ropt.cost_actual")
            .calculate();

        final String strTypeRest = " AND flt_order.fo_type IN ('DO','RO')";
        ff = new FieldFormula();
        ff.setAssigned("flt_order");
        ff.setAssignedRestriction("flt_order.status NOT IN ('Rej','Can')" + strTypeRest);
        ff.calculate("flt_order.cost_total", "flt_order.cost_labor + flt_order.cost_tools + flt_order.cost_parts + flt_order.cost_other");

        // FLTCLOSE_CLOSEOUTFO from FLTCLOSE.ABS
        String sqlString = "DELETE FROM flt_horder WHERE fo_id IN (SELECT fo_id FROM flt_order)";
        EventHandlerBase.executeDbSql(context, sqlString, true);

        final int daysOld = context.getInt("daysOld");

        final Vector<String> sqlStrings = new Vector<String>();

        sqlString = "UPDATE flt_order SET status = 'Clo'" +
            ", date_closed = "+formatSqlIsoToNativeDate(context, Utility.currentDate().toString()) +
            ", time_closed = "+formatSqlIsoToNativeTime(context, Utility.currentTime().toString()) +
            " WHERE flt_order.date_completed < " + EventHandlerBase.formatSqlAddDays(context, Utility.currentDate().toString(), Integer.toString(-daysOld)) +
            " AND status IN ('Com','S','Clo')";
        sqlStrings.add(sqlString);

        sqlString = "UPDATE flt_order SET" +
            " date_closed = "+formatSqlIsoToNativeDate(context, Utility.currentDate().toString()) +
            ", time_closed = "+formatSqlIsoToNativeTime(context, Utility.currentTime().toString()) +
            " WHERE flt_order.date_completed < " + EventHandlerBase.formatSqlAddDays(context, Utility.currentDate().toString(), Integer.toString(-daysOld)) +
            " AND status = 'Can'";
        sqlStrings.add(sqlString);

        sqlString = "INSERT INTO flt_horder " +
            "(" + getAllTableFields(context, "flt_horder") + ") " +
            "(SELECT " +
            getAllTableFields(context, "flt_horder") + " " +
            "FROM flt_order " +
            "WHERE " +
            "status IN ('Can', 'Clo', 'Com', 'S') " +
            "AND date_closed IS NOT NULL)";
        sqlStrings.add(sqlString);

        sqlString = "INSERT INTO flt_hdoem " +
            "(" + getAllTableFields(context, "flt_hdoem") + ") " +
            "(SELECT " +
            getAllTableFields(context, "flt_hdoem") + " " +
            "FROM flt_doem " +
            "WHERE " +
            "fo_id IN (SELECT fo_id FROM flt_horder))";
        sqlStrings.add(sqlString);

        sqlString = "INSERT INTO flt_hrocf " +
            "(" + getAllTableFields(context, "flt_hrocf") + ") " +
            "(SELECT " +
            getAllTableFields(context, "flt_hrocf") + " " +
            "FROM flt_rocf " +
            "WHERE " +
            "fo_id IN (SELECT fo_id FROM flt_horder))";
        sqlStrings.add(sqlString);

        sqlString = "INSERT INTO flt_hropt " +
            "(" + getAllTableFields(context, "flt_hropt") + ") " +
            "(SELECT " +
            getAllTableFields(context, "flt_hropt") + " " +
            "FROM flt_ropt " +
            "WHERE " +
            "fo_id IN (SELECT fo_id FROM flt_horder))";
        sqlStrings.add(sqlString);

        sqlString = "INSERT INTO flt_hpmtask " +
            "(" + getAllTableFields(context, "flt_hpmtask") + ") " +
            "(SELECT " +
            getAllTableFields(context, "flt_hpmtask") + " " +
            "FROM flt_pmtask " +
            "WHERE " +
            "fo_id IN (SELECT fo_id FROM flt_horder))";
        sqlStrings.add(sqlString);

        sqlString = "INSERT INTO flt_hrotask " +
            "(" + getAllTableFields(context, "flt_hrotask") + ") " +
            "(SELECT " +
            getAllTableFields(context, "flt_hrotask") + " " +
            "FROM flt_rotask " +
            "WHERE " +
            "fo_id IN (SELECT fo_id FROM flt_horder))";
        sqlStrings.add(sqlString);

        EventHandlerBase.executeDbSqlCommands(context, sqlStrings, true);

        sqlStrings.clear();

        sqlString = "DELETE FROM flt_pmtask WHERE fo_id IN (SELECT fo_id FROM flt_horder)";
        sqlStrings.add(sqlString);

        sqlString = "DELETE FROM flt_rotask WHERE fo_id IN (SELECT fo_id FROM flt_horder)";
        sqlStrings.add(sqlString);

        sqlString = "DELETE FROM flt_doem WHERE fo_id IN (SELECT fo_id FROM flt_horder)";
        sqlStrings.add(sqlString);

        sqlString = "DELETE FROM flt_rocf WHERE fo_id IN (SELECT fo_id FROM flt_horder)";
        sqlStrings.add(sqlString);

        sqlString = "DELETE FROM flt_ropt WHERE fo_id IN (SELECT fo_id FROM flt_horder)";
        sqlStrings.add(sqlString);

        sqlString = "DELETE FROM flt_order WHERE fo_id IN (SELECT fo_id FROM flt_horder)";
        sqlStrings.add(sqlString);

        EventHandlerBase.executeDbSqlCommands(context, sqlStrings, true);
    }
}
