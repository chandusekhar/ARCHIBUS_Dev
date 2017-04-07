/**
 * PreventiveMaintenanceCommonHandler - contains WFR methods for Preventive Maintenance Release 1
 * and Release 2.
 *
 * <p>
 * History:
 * <li>Initial implementation for PM release 1.
 * <Li>Modified for PM Release 2.
 *
 * @author Zhang Yi
 */

package com.archibus.eventhandler.prevmaint;

import java.io.*;
import java.text.*;
import java.util.*;

import org.directwebremoting.io.*;
import org.dom4j.*;
import org.dom4j.io.SAXReader;
import org.json.*;

import com.archibus.app.bldgops.partinv.BldgopsPartInventorySupplyRequisition;
import com.archibus.context.ContextStore;
import com.archibus.dao.DocumentDao;
import com.archibus.dao.jdbc.DocumentDaoImpl;
import com.archibus.datasource.*;
import com.archibus.datasource.data.*;
import com.archibus.eventhandler.*;
import com.archibus.ext.report.*;
import com.archibus.jobmanager.*;
import com.archibus.jobmanager.JobStatus.JobResult;
import com.archibus.service.Period;
import com.archibus.utility.*;

/**
 * Event handler class that implements a few WFR that converted from ABS for report.
 */
public class PreventiveMaintenanceCommonHandler extends EventHandlerBase {

    // ----------------------- constants ----------------------------------------------------------
    private static final String ACTIVITY_ID = "AbBldgOpsPM";

    // Constants that indicates two PM types.
    public static final String PMTYPE_EQ = "EQ";

    // Constants that indicates two PM types.
    public static final String PMTYPE_HK = "HK";

    /**
     * This method served as a workflow rule to calculate below values from historical work request
     * table (hwr) and equipment table (eq) for equipments within given date range: o total number
     * failures of equipment o average downtime o sum of downtime o quantity hours run for one day o
     * run days in the given period. Besides, the result will also contain other fields from table
     * eq and eqStd.
     *
     * Input Parameters from Context: dateFrom and dateTo, construct a date range to restrict the
     * records of hwr that will be calculated.
     *
     * By Zhang Yi
     *
     * @param JSONObject totalRow: Selected form record Object .
     */
    public void getMultiPMSRecords(final JSONObject totalRow) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final JSONArray pmsJSONArray = new JSONArray();
        final JSONArray j = totalRow.names();
        String weekormonth = "";
        int dateSelected = -1;
        java.sql.Date dateFrom = null;
        String pmpTrid = "";
        final StringBuffer insql = new StringBuffer();
        for (int i = 0; i < j.length(); i++) {
            final String key = j.get(i).toString();
            final String value = totalRow.get(j.get(i).toString()).toString();

            // kb#3044088: should not add restriction clauses for null field value
            if ("null".equalsIgnoreCase(value)) {
                continue;
            }

            if (key.equals("pmsd.date_todo")) {
                dateSelected = getIntegerValue(context, value).intValue();
            } else if (key.equals("pmressum.date_todo.from")) {
                dateFrom = getDateValue(context, totalRow.get(j.get(i).toString()));
                // SimpleDateFormat dateFormat = new SimpleDateFormat();

            } else if (key.equals("pmressum.date_todo.to")) {
                getDateValue(context, totalRow.get(j.get(i).toString()));
            } else if (key.equals("weekormonth")) {
                weekormonth = value;
            } else if (key.endsWith("pms.site_id")) {

                // insql.append(" AND " + key + "='" + value + "' ");
                insql.append(
                    " AND EXISTS (SELECT 1 FROM pms  AS  pms1 LEFT JOIN pmp ON pms1.pmp_id = pmp.pmp_id LEFT OUTER JOIN eq ON pms1.eq_id = eq.eq_id WHERE pms1.pms_id = pms.pms_id AND ((pmp.pmp_type = 'EQ' AND eq.site_id =  '"
                            + value + "') OR ( pmp.pmp_type = 'HK' AND pms.site_id= '" + value
                            + "')))");

            } else if (key.endsWith("pms.bl_id")) {
                insql.append(
                    " AND EXISTS (SELECT 1 FROM pms  AS  pms1 LEFT JOIN pmp ON pms1.pmp_id = pmp.pmp_id LEFT OUTER JOIN eq ON pms1.eq_id = eq.eq_id WHERE pms1.pms_id = pms.pms_id AND ((pmp.pmp_type = 'EQ' AND eq.bl_id =  '"
                            + value + "') OR ( pmp.pmp_type = 'HK' AND pms.bl_id= '" + value
                            + "')))");

            } else if (key.endsWith("pms.fl_id")) {
                insql.append(
                    " AND EXISTS (SELECT 1 FROM pms  AS  pms1 LEFT JOIN pmp ON pms1.pmp_id = pmp.pmp_id LEFT OUTER JOIN eq ON pms1.eq_id = eq.eq_id WHERE pms1.pms_id = pms.pms_id AND ((pmp.pmp_type = 'EQ' AND eq.fl_id =  '"
                            + value + "') OR ( pmp.pmp_type = 'HK' AND pms.fl_id= '" + value
                            + "')))");
            } else if (key.endsWith("pms.pm_group")) {
                insql.append(" AND pms.pm_group ='" + value + "' ");
            } else if (key.endsWith("pmp.tr_id")) {
                insql.append(
                    " AND EXISTS (SELECT 1 FROM pmp WHERE pmp.pmp_id = pms.pmp_id AND pmp.tr_id ='"
                            + value + "')");
                pmpTrid = value;
            } else if (key.endsWith("pmpstr.tr_id")) {
                if (StringUtil.notNullOrEmpty(pmpTrid)) {
                    insql.append(
                        " AND pms.pmp_id IN (select pmpstr.pmp_id from pmp,pmpstr where pmp.pmp_id=pmpstr.pmp_id and pmp.tr_id='"
                                + pmpTrid + "' and pmpstr.tr_id='" + value + "')");
                } else {
                    insql.append(" AND  pmpstr.tr_id='" + value + "'");
                }
                // select pmpstr.tr_id from pmp,pmpstr where pmp.pmp_id=pmpstr.pmp_id and
                // pmp.tr_id='MECHANIC'and pmpstr.tr_id='MULTI-TRADE II'
            } else {
            }
        }
        String monthsBetweenSqlStr = "", weeksBetweenSqlStr = "";
        if (isOracle(context)) {
            weeksBetweenSqlStr = " TRUNC (date_todo - TO_DATE('" + notNull(dateFrom.toString())
                    + "', 'YYYY-MM-DD'))";

            monthsBetweenSqlStr = " TRUNC(MONTHS_BETWEEN(date_todo,TO_DATE('"
                    + notNull(dateFrom.toString()) + "', 'YYYY-MM-DD')))";

        } else {

            monthsBetweenSqlStr = formatSqlMonthsBetween(context, dateFrom.toString(), "date_todo");

            weeksBetweenSqlStr = formatSqlWeeksBetween(context, dateFrom.toString(), "date_todo")
                .replaceAll("wk", "day");

            monthsBetweenSqlStr = monthsBetweenSqlStr.replaceAll("'date_todo'", "date_todo");
            weeksBetweenSqlStr = weeksBetweenSqlStr.replaceAll("'date_todo'", "date_todo");

        }
        final StringBuffer insqlStr = new StringBuffer();
        if (weekormonth.equals("week")) {
            insqlStr.append(weeksBetweenSqlStr + ">=" + dateSelected * 7);
            insqlStr.append(" AND " + weeksBetweenSqlStr + "<" + (dateSelected + 1) * 7);
        } else {

            insqlStr.append(monthsBetweenSqlStr + " =" + dateSelected);
        }

        String pmsSql = "SELECT  distinct pms.pms_id FROM pmsd,pms,pmp,pmps,pmpstr "
                + "WHERE pms.pms_id = pmsd.pms_id " + "  AND pmp.pmp_id =pms.pmp_id"
                + "  AND pmp.pmp_id=pmps.pmp_id " + "  AND pmpstr.pmp_id=pmps.pmp_id "
                + "  AND  pmpstr.pmps_id=pmps.pmps_id AND   ";

        pmsSql = pmsSql + insqlStr.toString() + insql.toString();

        final List pmsid = selectDbRecords(context, pmsSql);
        for (int i = 0; i < pmsid.size(); i++) {
            final Object[] record = (Object[]) pmsid.get(i);
            final Integer pmsidint = getIntegerValue(context, record[0]);
            pmsJSONArray.put(pmsidint.intValue());

        }

        context.addResponseParameter("jsonExpression", pmsJSONArray.toString());

    }

    /**
     * get the begin date and enddate of your click distinct
     *
     * @param String weekormonth: By week or month
     * @param int dateSelected: Selected date
     * @param java.sql.Date dateFrom : Begin date that calcuted
     * @param java.sql.Date dateTo: End date that calcuted
     *
     */
    public java.sql.Date[] calcuteBeginAndEndDateForWeekAndMonth(final String weekormonth,
            final int dateSelected, java.sql.Date dateFrom, final java.sql.Date dateTo) {
        java.sql.Date varFrom = dateFrom;
        java.sql.Date varTo;
        java.sql.Date dateBegin;
        java.sql.Date dateEnd = dateTo;
        final java.sql.Date[] beginAndEnd = new java.sql.Date[2];

        final Calendar rightNowFrom = Calendar.getInstance();
        final Calendar rightNowTo = Calendar.getInstance();
        final java.util.Date dateFromUtil = new java.sql.Date(dateFrom.getTime());

        final java.util.Date dateToUtil = new java.sql.Date(dateFrom.getTime());

        rightNowFrom.setTime(dateFromUtil);
        rightNowTo.setTime(dateToUtil);
        if (weekormonth.equals("week")) {

            rightNowFrom.add(Calendar.DATE, dateSelected * 7);
            rightNowTo.add(Calendar.DATE, (dateSelected + 1) * 7);

        } else {
            rightNowFrom.add(Calendar.MONTH, dateSelected);
            rightNowTo.add(Calendar.MONTH, dateSelected + 1);

        }
        dateFrom = new java.sql.Date((rightNowFrom.getTime()).getTime());
        varTo = new java.sql.Date(rightNowTo.getTime().getTime());

        varFrom = dateFrom;
        dateBegin = varFrom;
        if (varTo.compareTo(dateTo) <= 0) {
            dateEnd = varTo;
        }

        beginAndEnd[0] = dateBegin;
        beginAndEnd[1] = dateEnd;

        return beginAndEnd;

    }

    /**
     * Calcute eq failure analysis
     *
     * @param dateFrom1: From date value in string format
     * @param dateTo1: To date value in string format
     */
    public void calcuteEqFailureAnalysis(final String dateFrom1, final String dateTo1) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        context.addResponseParameter("dateFrom", dateFrom1);
        context.addResponseParameter("dateTo", dateTo1);
        final String dateFrom = notNull(dateFrom1);
        final String dateTo = notNull(dateTo1);
        String dateRangeCondition = "";
        if (dateFrom.length() > 0) {
            // If the date range is not valid, return.
            if (!isDateRangeParameterValid(context)) {
                handlerDateRangeError(context);
            }
            // Construct a date range condition string of sql indicates that completed date of hwr
            // must within the dateFrom and dateTo.
            dateRangeCondition = " hwr.date_completed>="
                    + formatSqlIsoToNativeDate(context, dateFrom) + " AND hwr.date_completed<="
                    + formatSqlIsoToNativeDate(context, dateTo) + " ";
        } else {

            // Construce a date range condition string of sql indicates that completed date of hwr
            // must earlier than dateTo
            dateRangeCondition =
                    " hwr.date_completed<=" + formatSqlIsoToNativeDate(context, dateTo) + " ";
        }

        if (this.log.isDebugEnabled()) {
            this.log.debug(MessageFormat.format(
                "Start to calculate failures of equipments from [{0}]to [{1}].",
                new Object[] { dateFrom, dateTo }));
        }

        // Create a datasource by calling createEqFailureAnalysisDataSource with data range
        // parameters and one date range restriction sql string.
        final DataSource ds =
                createEqFailureAnalysisDataSource(context, dateFrom, dateTo, dateRangeCondition);

        // Construct the result returned to JS CLIENT.
        final DataSetList dataSet = new DataSetList();
        dataSet.addRecords(ds.getRecords());
        dataSet.setHasMoreRecords(ds.hasMoreRecords());
        context.setResponse(dataSet);
        // Update MTBF field value
        this.updateMTBF(context, dateFrom, dateTo, dateRangeCondition);
    }

    /**
     * This method handler date range error: set error message picked form database, then throw
     * exception.
     *
     * By Zhang Yi
     *
     * @param context Event handler context.
     */
    private void handlerDateRangeError(final EventHandlerContext context) {
        final String errMessage = localizeMessage(context, ACTIVITY_ID,
            "PreventiveMaintenanceCommonHandler", "NullDateRange", null);
        context.addResponseParameter("message", errMessage);
        final IllegalArgumentException originalException = new IllegalArgumentException();
        final ExceptionBase customException =
                new ExceptionBase(null, errMessage, originalException);
        customException.setLocalizedMessage(errMessage);
        throw customException;
    }

    /**
     * This method validate the date range parameters, only take EventHandlerContext as parameter.
     * In this method, the dateFrom and dateTo value come from context. If dateFrom or dateTo is
     * null, or date value is not valid(by calling isDateRangeValid), return false and set error
     * message in response of context.
     *
     * By Zhang Yi
     *
     * @param context Event handler context.
     * @return
     */
    private boolean isDateRangeParameterValid(final EventHandlerContext context) {
        boolean isValid = false;

        if (context.parameterExists("dateFrom") && context.parameterExists("dateTo")) {
            final String dateFrom = notNull(context.getParameter("dateFrom"));
            final String dateTo = notNull(context.getParameter("dateTo"));
            if (isDateRangeValid(context, dateFrom, dateTo)) {
                isValid = true;
            }
        }
        return isValid;
    }

    /**
     * This method validate date range parameters, take both EventHandlerContext and JSONObject as
     * parameter. In this method, the dateFrom and dateTo value come from a JSON object.
     *
     * By Zhang Yi
     *
     * @param context: Event handler context.
     * @param jsonFieldValues: A JSONObject that contains dateFrom and dateTo.
     * @return
     *
     */
    private boolean isDateRangeParameterValid(final EventHandlerContext context,
            final JSONObject jsonFieldValues) {

        boolean isValid = false;

        try {

            final String dateFrom = jsonFieldValues.getString("resavail.date_assigned.from");
            final String dateTo = jsonFieldValues.getString("resavail.date_assigned.to");

            if (dateFrom.trim().length() != 0 && dateTo.trim().length() != 0) {
                if (isDateRangeValid(context, dateFrom, dateTo)) {
                    isValid = true;
                }
            }
        } catch (final Throwable e) {
            isValid = false;
        }
        return isValid;
    }

    /**
     * This method validate date range values itself, take EventHandlerContext , dateFrom value and
     * dateTo value as parameters. Here assume date's format from JS CLIENT is "yyyy-MM-dd". If both
     * date values is valid and dateFrom before dateTo, return true; else return false.
     *
     * By Zhang Yi
     *
     * @param context: Event handler context.
     * @param dateFrom: From date value in string format
     * @param dateTo: To date value in string format
     * @return
     *
     */
    private boolean isDateRangeValid(final EventHandlerContext context, final String dateFrom,
            final String dateTo) {
        final Calendar cFrom = Calendar.getInstance();
        final SimpleDateFormat dateFormat = new SimpleDateFormat();
        dateFormat.applyPattern("yyyy-MM-dd");
        Date from = null, to = null;
        try {
            from = dateFormat.parse(dateFrom);
        } catch (final ParseException e) {
            e.printStackTrace();
            return false;
        }
        cFrom.setTime(from);
        final Calendar cTo = Calendar.getInstance();
        try {
            to = dateFormat.parse(dateTo);
        } catch (final ParseException e) {
            e.printStackTrace();
            return false;
        }
        cTo.setTime(to);
        if (cTo.before(cFrom)) {
            return false;
        }
        return true;
    }

    /**
     * This method construct a customized SQL query date source. Join sqls that separately query
     * calculate results from table hwr and select some fileds from eq and eqStd.
     *
     * By Zhang Yi
     *
     * @param context: Event handler context.
     * @param dateFrom: From date value in string format
     * @param dateTo: To date value in string format
     * @param dateRangeCondition: A restriction sql string that restrict the completed date field
     *            value of hwr table when select records.
     * @return
     *
     */
    private DataSource createEqFailureAnalysisDataSource(final EventHandlerContext context,
            String dateFrom, final String dateTo, final String dateRangeCondition) {

        if (dateFrom == null || dateFrom.length() == 0) {
            final Date minCompleteDate = DataSourceFactory.createDataSource().addTable("hwr")
                .addQuery("SELECT MIN(hwr.date_completed) AS min_date FROM hwr ")
                .addVirtualField("hwr", "min_date", DataSource.DATA_TYPE_DATE).getRecord()
                .getDate("hwr.min_date");
            dateFrom = new SimpleDateFormat("yyyy-MM-dd")
                .format(minCompleteDate != null ? minCompleteDate : new Date());
        }

        // Construct sub sql for virtual field vf_num_failures
        // which indicates the number of work requests in hwr table for given equipment and date
        // range.
        final String subSqlNumFails = " ( SELECT  ${sql.isNull('COUNT(*)',0)}"
                + " FROM  hwr b WHERE b.eq_id=a.eq_id " + " AND b.pms_id IS NULL AND "
                + dateRangeCondition.replaceAll("hwr", "b") + ")";

        // Construct sub sql for virtual field vf_avg_downtime
        // which indicates the average down time of work requests in hwr table for given equipment
        // and date range.
        final String subSqlAvgDown = " ( SELECT ${sql.isNull('AVG(down_time)',0)}"
                + " FROM hwr c WHERE c.eq_id=a.eq_id  AND "
                + dateRangeCondition.replaceAll("hwr", "c") + ")";

        // Construct sub sql for virtual field vf_sum_downtime
        // which indicates the sum down time of work requests in hwr table for given equipment and
        // date range.
        final String subSqlSumDown = " ( SELECT ${sql.isNull('SUM(down_time)',0)}"
                + " FROM hwr d WHERE d.eq_id=a.eq_id  AND "
                + dateRangeCondition.replaceAll("hwr", "d") + ")";

        // Construct Left Join clause which make a junction between the table eq and eqstd.
        final String leftOutJoinClause =
                " LEFT OUTER JOIN eq ON a.eq_id = eq.eq_id LEFT OUTER JOIN eqstd ON eq.eq_std=eqstd.eq_std ";

        // Connect above sub SQLs that query virtual fields and add other selected fields
        String sqlCalculateHwr = "(SELECT DISTINCT " + "a.eq_id ${sql.as} vf_distinct_eqId, "
                + subSqlNumFails + " ${sql.as} vf_num_failures, " + subSqlAvgDown
                + " ${sql.as} vf_avg_downtime, " + subSqlSumDown + " ${sql.as} vf_tot_downtime, "
                + formatSqlDaysBetween(context, dateFrom, dateTo) + " ${sql.as} vf_days_in_period, "
                + "(" + formatSqlDaysBetween(context, dateFrom, dateTo)
                + ") * eq.qty_hrs_run_day ${sql.as} vf_tot_uptime ";

        // Guo added 2008-12-23, for three different databases,
        // calculate the down time percent for given equipment and date range as a virtual field.
        if (isSqlServer(context)) {
            sqlCalculateHwr += " , LEFT( '% 0' + CONVERT(CHAR,"
                    + formatSqlIsNull(context,
                        " (" + subSqlSumDown + "/" + "("
                                + formatSqlReplace0WithHuge(context,
                                    "(" + formatSqlDaysBetween(context, dateFrom, dateTo)
                                            + ") * eq.qty_hrs_run_day")
                                + ")*100),0")
                    + "), 8) ${sql.as} vf_downtime_percent";
        }
        if (isOracle(context)) {
            sqlCalculateHwr += " , SUBSTR(CONCAT('% 0',"
                    + formatSqlIsNull(context,
                        " (" + subSqlSumDown + "/" + "("
                                + formatSqlReplace0WithHuge(context,
                                    "(" + formatSqlDaysBetween(context, dateFrom, dateTo)
                                            + ") * eq.qty_hrs_run_day")
                                + ")*100),0")
                    + "), 0,8) ${sql.as} vf_downtime_percent";
        }
        if (isSybase(context)) {
            sqlCalculateHwr += " , LEFT(STRING('% 0',"
                    + formatSqlIsNull(context,
                        " (" + subSqlSumDown + "/" + "("
                                + formatSqlReplace0WithHuge(context,
                                    "(" + formatSqlDaysBetween(context, dateFrom, dateTo)
                                            + ") * eq.qty_hrs_run_day")
                                + ")*100),0")
                    + "), 8) ${sql.as} vf_downtime_percent";
        }

        // Construct a total sql string
        sqlCalculateHwr = sqlCalculateHwr
                // Left Join table hwr and eq,eqstd.
                + " FROM hwr a " + leftOutJoinClause
                // Restrict date range and equipment of hwr table.
                + " WHERE " + dateRangeCondition.replaceAll("hwr", "a")
                + " AND a.eq_id IS NOT NULL AND " + subSqlNumFails + " >0) ";

        final DataSource ds = DataSourceFactory.createDataSource();

        ds.addTable("hwr").addField("eq_id");

        ds.addQuery(sqlCalculateHwr, SqlExpressions.DIALECT_GENERIC);

        // Specify the virtual fields that generated from sub sqls.
        ds.addVirtualField("hwr", "vf_distinct_eqId", DataSource.DATA_TYPE_TEXT);
        ds.addVirtualField("hwr", "vf_num_failures", DataSource.DATA_TYPE_NUMBER);
        ds.addVirtualField("hwr", "vf_avg_downtime", DataSource.DATA_TYPE_NUMBER);
        ds.addVirtualField("hwr", "vf_tot_downtime", DataSource.DATA_TYPE_NUMBER);
        ds.addVirtualField("hwr", "vf_tot_uptime", DataSource.DATA_TYPE_NUMBER);
        ds.addVirtualField("hwr", "vf_days_in_period", DataSource.DATA_TYPE_NUMBER);
        ds.addVirtualField("hwr", "vf_downtime_percent", DataSource.DATA_TYPE_TEXT);
        ds.addSort("hwr", "vf_distinct_eqId");

        return ds;
    }

    /**
     * This method update values of fields MTBF and MTTR of eq table by calculate value from hwr
     * table for given equipment and date range
     *
     * By Zhang Yi
     *
     * @param context: Event handler context.
     * @param dateFrom: From date value in string format
     * @param dateTo: To date value in string format
     * @param dateRangeCondition: date range value in string format
     */
    private void updateMTBF(final EventHandlerContext context, String dateFrom, final String dateTo,
            final String dateRangeCondition) {

        if (dateFrom == null || dateFrom.length() == 0) {
            dateFrom = "1899-12-30";
        }
        final String updateMTTR = "UPDATE eq SET " + "qty_MTBF = (SELECT "
                + formatSqlIsNull(context,
                    "(" + formatSqlDaysBetween(context, dateFrom, dateTo) + ")" + " / "
                            + MTBF_Greatest(context, "(COUNT(*) - 1 )") + ",0.0")
                + " FROM hwr" + " WHERE hwr.eq_id = eq.eq_id AND " + dateRangeCondition
                + " AND hwr.pms_id IS NULL ), " + "qty_MTTR = (SELECT "
                + formatSqlIsNull(context,
                    "AVG( " + formatSqlHoursBetweenForFields(context, "date_requested",
                        "time_requested", "date_completed", "time_completed") + "),0.0")
                + " FROM hwr" + " WHERE hwr.eq_id = eq.eq_id AND " + dateRangeCondition
                + " AND hwr.pms_id IS NULL )";

        final DataSource ds = DataSourceFactory.createDataSource();

        ds.addTable("eq").addField("eq_id");

        ds.addQuery(updateMTTR, SqlExpressions.DIALECT_GENERIC).executeUpdate();

    }

    /**
     * This method construct and return sql string of use greatest sql function in three different
     * databases.
     *
     * By Zhang Yi
     *
     * @param context: Event handler context.
     * @param fName: related field name that needed in GREATEST calculation function
     * @return
     *
     */
    private String MTBF_Greatest(final EventHandlerContext context, final String fName) {
        return " ( CASE " + fName + " WHEN 0 THEN 1 " + " ELSE " + fName + " END ) ";
    }

    /**
     * This method construct and return sql string for calculating between hours in three different
     * databases.
     *
     * By Zhang Yi
     *
     * @param context: Event handler context.
     * @param fromDateField: From date value in string format
     * @param fromTimeField: From time value in string format
     * @param toDateField: To date value in string format
     * @param toTimeField: To time value in string format
     * @return
     *
     */
    private String formatSqlHoursBetweenForFields(final EventHandlerContext context,
            final String fromDateField, final String fromTimeField, final String toDateField,
            final String toTimeField) {

        if (isOracle(context)) {
            return " (TO_DATE(TO_CHAR(" + toDateField + ",'YYYY-MM-DD ') || " + "TO_CHAR("
                    + toTimeField + ",'HH24:MI:SS'), " + "'YYYY-MM-DD HH24:MI:SS')"
                    + "- TO_DATE(TO_CHAR(" + fromDateField + ",'YYYY-MM-DD ') || " + "TO_CHAR("
                    + fromTimeField + ",'HH24:MI:SS')," + "'YYYY-MM-DD HH24:MI:SS'))" + " * 24";
        }
        if (isSqlServer(context)) {
            return " DATEDIFF( HOUR, " + "CONVERT( DATETIME, CONVERT(CHAR," + fromDateField
                    + ",102)" + " + ' ' + CONVERT(CHAR," + fromTimeField + ",108), 120),"
                    + "CONVERT( DATETIME, CONVERT(CHAR," + toDateField + ",102)"
                    + " + ' ' + CONVERT(CHAR," + toTimeField + ",108), 120))";
        }
        if (isSybase(context)) {
            return " HOURS(" + "STRING(" + fromDateField + ",' '," + fromTimeField + "),"
                    + "STRING(" + toDateField + ",' '," + toTimeField + "))";
        }
        return "";
    }

    // ---------------------------------------------------------------------------------------------
    // END calcuteEqFailureAnalysis WFR
    // ---------------------------------------------------------------------------------------------

    // ---------------------------------------------------------------------------------------------
    // BEGIN createResAvailRecords WFR
    // ---------------------------------------------------------------------------------------------

    // ----------------------- constants ----------------------------------------------------------

    // Two view names that could be used to determine the resource type when call WFR
    // createResAvailRecords.
    private static final String TradeAvailReportViewName = "ab-pm-rpt-tr-avail";

    private static final String CraftpersonAvailReportViewName = "ab-pm-rpt-cf-avail";

    // Constants that indicates four different resource types.
    private static final String RESOURCE_TRADE = "TR";

    private static final String RESOURCE_CRAFTPERSON = "CF";

    private static final String RESOURCE_TOOLTYPE = "TT";

    private static final String RESOURCE_TOOL = "TL";

    /**
     * This method serve as a workflow rule to calculate and create records represent availability
     * within given date range for the specified resource types include trade, craftperson, tool
     * type and parts. The calculated results include: (1) Total hours available: directly pick from
     * the field std_hours_avail of corresponding resource table. (2) On Demand hours committed :
     * sum all hours from Work Request table wr, where pms_id is null (3) PM hours committed: sum
     * all hours from Work Request table wr, where pms_id is not null (4) Total hours committed : On
     * Demand hours committed plus PM hours committed: (5) Available hours remaining : Total hours
     * available minus Total hours committed This workflow rule support two kind of calls from
     * client: by command in axvw directly and by JS code attaching parameters.
     *
     * By Zhang Yi
     *
     * @param String resourceType1: Resource type :trade|craftperson|tool|type|tool.
     * @param String dateFrom1: From date value in string format
     * @param String dateTo1: To date value in string format
     */
    public void createResAvailRecords(final String resourceType1, final String dateFrom1,
            final String dateTo1) {

        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        // Variables used to construct SQL
        String resourceType = ""; // Resource type: trade, craftperson, tool type, tool.
        String resourceIdField = "", joinIdField = ""; // Fields name needed in following SQL.
        String dateFrom = "", dateTo = ""; // Date range
        context.addResponseParameter("dateFrom", dateFrom1);
        context.addResponseParameter("dateTo", dateTo1);
        context.addResponseParameter("resourceType", resourceType1);
        // If context contains parameters, means this WFR is called from JS code.
        if (context.parameterExists("resourceType")) {

            if (!isDateRangeParameterValid(context)) {
                handlerDateRangeError(context);
            }
            resourceType = notNull(context.getParameter("resourceType"));
            dateFrom = notNull(context.getParameter("dateFrom"));
            dateTo = notNull(context.getParameter("dateTo"));

        } else {
            // If this WFR is called by specifying command in axvw file,pick up date range values
            // from internal FIELD VALUES.
            final JSONObject jsonFieldValues =
                    context.getJSONObject(ViewHandlers.INPUT_FIELD_VALUES);
            // Detect validation of date range
            if (!isDateRangeParameterValid(context, jsonFieldValues)) {
                handlerDateRangeError(context);
            }

            dateFrom = jsonFieldValues.getString("resavail.date_assigned.from");
            dateTo = jsonFieldValues.getString("resavail.date_assigned.to");

            // Set resourceType by designating view names from request.
            final String viewName = context.getString("viewName");
            if (TradeAvailReportViewName.equalsIgnoreCase(viewName)) {
                resourceType = "tr";
            } else if (CraftpersonAvailReportViewName.equalsIgnoreCase(viewName)) {
                resourceType = "cf";
            }
        }

        // For different resource type, set corresponding field name of resource id and related id.
        if (resourceType.equalsIgnoreCase(RESOURCE_TRADE)) {
            resourceIdField = "tr_id";
            joinIdField = "";
        }
        ;

        if (resourceType.equalsIgnoreCase(RESOURCE_CRAFTPERSON)) {
            resourceIdField = "cf_id";
            joinIdField = ",tr_id";
        }
        ;

        if (resourceType.equalsIgnoreCase(RESOURCE_TOOLTYPE)) {
            resourceIdField = "tool_type";
            joinIdField = "";
        }
        ;

        if (resourceType.equalsIgnoreCase(RESOURCE_TOOL)) {
            resourceIdField = "tool_id";
            joinIdField = ",tool_type";
        }
        ;

        if (this.log.isDebugEnabled()) {
            this.log.debug("Deleting old records from  resavail ...");
        }

        // Before create new records, delete all old records.
        executeDbSql(context, "DELETE FROM resavail", false);
        // executeDbCommit(context);

        // Construct a date range condition string
        final String dateRangeCondition = " hwr.date_completed>="
                + formatSqlIsoToNativeDate(context, dateFrom) + " AND hwr.date_completed<="
                + formatSqlIsoToNativeDate(context, dateTo) + " ";

        // Get data source used to insert new records in table resavail.
        final DataSource insertDS = DataSourceFactory.createDataSource();
        insertDS.addTable("resavail");

        // Get days count among date range.
        final Calendar cFrom = Calendar.getInstance();
        final SimpleDateFormat dateFormat = new SimpleDateFormat();
        dateFormat.applyPattern("yyyy-MM-dd");
        Date d1 = null;
        try {
            d1 = dateFormat.parse(dateFrom);
        } catch (final ParseException e) {
            e.printStackTrace();
        }
        cFrom.setTime(d1);
        cFrom.add(Calendar.DAY_OF_YEAR, -1);
        final Calendar cTo = Calendar.getInstance();
        try {
            d1 = dateFormat.parse(dateTo);
        } catch (final ParseException e) {
            e.printStackTrace();
        }
        cTo.setTime(d1);

        if (this.log.isDebugEnabled()) {
            this.log.debug(MessageFormat.format(
                "Start to calculate failures of equipments from [{0}]to [{1}].",
                new Object[] { dateFrom, dateTo }));
        }

        if (this.log.isDebugEnabled()) {
            this.log.debug(MessageFormat.format(
                "Start to create resource available records for resource [{0}] , from  [{1}] to [{2}].",
                new Object[] { resourceType, dateFrom, dateTo }));
        }

        String cFormDateString = "";
        // For each date within date range, insert into a new record into resavail.
        while (cFrom.before(cTo)) {
            cFrom.add(Calendar.DATE, 1);

            final int year = cFrom.get(Calendar.YEAR);
            final int month = cFrom.get(Calendar.MONTH) + 1;
            if (month < 10) {
                cFormDateString = String.valueOf(year) + "-" + "0" + String.valueOf(month);
            } else {
                cFormDateString = String.valueOf(year) + "-" + String.valueOf(month);
            }

            final int day = cFrom.get(Calendar.DAY_OF_MONTH);
            if (day < 10) {
                cFormDateString = cFormDateString + "-" + "0" + String.valueOf(day);
            } else {
                cFormDateString = cFormDateString + "-" + String.valueOf(day);
            }

            if (isOracle(context)) {

                cFormDateString = " to_date('" + cFormDateString + "', 'yyyy-mm-dd')";

            } else {
                cFormDateString = formatSqlIsoToNativeDate(context, cFormDateString);
            }

            final String insertSql = "INSERT INTO resavail (date_assigned," + resourceIdField
                    + joinIdField + ",hours_avail_total) SELECT " + cFormDateString + ","
                    + resourceIdField + joinIdField + ",std_hours_avail FROM " + resourceType;
            insertDS.addQuery(insertSql, SqlExpressions.DIALECT_GENERIC);
            insertDS.executeUpdate();
        }
        // insertDS.commit();

        // After insert new records, then calculate and update od_hours_commited and
        // pm_hours_commited.
        final DataSource updateDS = createResAvailUpdateDataSource(context, dateFrom, dateTo,
            dateRangeCondition, resourceType, resourceIdField);
        updateDS.executeUpdate();

        if (this.log.isDebugEnabled()) {
            this.log.debug(MessageFormat.format(
                "Start to calculate and update hours for resource [{0}] , from  [{1}] to [{2}].",
                new Object[] { resourceType, dateFrom, dateTo }));
        }

        // Also need to calculate hours_commited_total and hours_remaining.
        executeDbSql(context,
            "UPDATE resavail " + " SET "
                    + " hours_commited_total = od_hours_commited + pm_hours_commited, "
                    + " hours_remaining = hours_avail_total -  od_hours_commited - pm_hours_commited",
            false);
        // executeDbCommit(context);
    }

    /**
     * This method construct a customized SQL query date source. The top level UPDATE SQL updates
     * field values of each records in table resavail; while among UPDATE SQL there are two sub SQLs
     * to calculate od_hours_commited and pm_hours_commited.
     *
     * By Zhang Yi
     *
     * @param context: Event handler context.
     * @param dateFrom: From date value in string format
     * @param dateTo: To date value in string format
     * @param dateRangeCondition: A restriction sql string that restrict the completed date field
     *            value of hwr table when select records.
     * @param resourceType: Specified resource type, should be one of trade, craftperson, tool type,
     *            tool which are defined as constants
     * @param resourceIdField: Specified field name that holds resource id
     * @return
     *
     */
    private DataSource createResAvailUpdateDataSource(final EventHandlerContext context,
            final String dateFrom, final String dateTo, final String dateRangeCondition,
            final String resourceType, final String resourceIdField) {

        // Based on parameter values, construct sub sql to calculate estimate hours needed for
        // specified resource and date. Support two different kind of work request: OnDemand and
        // PreventiveMaintenance.
        final String subSqlHoursCommited =
                " (SELECT " + formatSqlIsNull(context, "SUM(wr" + resourceType + ".hours_est),0 ")
                        + "FROM wr, wr" + resourceType + " WHERE wr.wr_id = wr" + resourceType
                        + ".wr_id " + "AND wr.status in ('A','AA','I','HP','HA','HL') "
                        + "AND wr.date_completed IS NULL " + "AND wr" + resourceType
                        + ".date_assigned=resavail.date_assigned " + "AND wr" + resourceType + "."
                        + resourceIdField + " = resavail." + resourceIdField;

        // Construct an UPDATE SQL merged two sub SQLs.
        final String updateSql = "UPDATE resavail SET " + "od_hours_commited = "
                + subSqlHoursCommited + " AND wr.pms_id IS NULL ), " + "pm_hours_commited = "
                + subSqlHoursCommited + " AND wr.pms_id IS NOT NULL )";

        final DataSource ds = DataSourceFactory.createDataSource();

        ds.addTable("resavail").addQuery(updateSql, SqlExpressions.DIALECT_GENERIC);

        return ds;
    }

    // ---------------------------------------------------------------------------------------------
    // END createResAvailRecords WFR
    // ---------------------------------------------------------------------------------------------

    // ---------------------------------------------------------------------------------------------
    // BEGIN forecastPMResources WFR
    // ---------------------------------------------------------------------------------------------

    /**
     * This method serve as a WFR to forecast one type of required resource of : trade, part, tools
     * or all three. Only for PM Schedules restricted by date range and other condition comes from
     * JS client.
     *
     * By Zhang Yi
     *
     * @param String dateFrom1: From date value in string format
     * @param String dateTo1: To date value in string format
     * @param String forecastResourceType: Forecast Resource Type
     * @param String forecastRestriction: Forecast Restriction
     */
    public void forecastPMResources(final String dateFrom1, final String dateTo1,
            final String forecastResourceType, final String forecastRestriction) {

        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        context.addResponseParameter("dateFrom", dateFrom1);
        context.addResponseParameter("dateTo", dateTo1);
        // If the date range is not valid, return.
        if (!isDateRangeParameterValid(context)) {
            handlerDateRangeError(context);
        }

        // Retrive the date range parameter
        final String dateFrom =
                formatSqlIsoToNativeDate(context, notNull(context.getParameter("dateFrom")));
        final String dateTo =
                formatSqlIsoToNativeDate(context, notNull(context.getParameter("dateTo")));
        // If the date range is not valid, return.

        if (this.log.isDebugEnabled()) {
            this.log.debug(MessageFormat.format(
                "Run forecastPMResources workflow rule for resource [{0}], from  [{1}] to [{2}].",
                new Object[] { forecastResourceType, dateFrom, dateTo }));
        }

        // Call ForecastDatesGenerator to create forecast records in database.
        final ForecastDatesGenerator forecastGenerator = new ForecastDatesGenerator(
            forecastResourceType, forecastRestriction, dateFrom, dateTo, null, null, null);

        startJob(context, forecastGenerator);
    }

    // ---------------------------------------------------------------------------------------------
    // END forecastPMResources WFR
    // ---------------------------------------------------------------------------------------------

    // ---------------------------------------------------------------------------------------------
    // BEGIN forecastPMResources WFR
    // ---------------------------------------------------------------------------------------------

    /**
     * This method serve as a WFR to do one of forecasts for: Procedure Weekly, Equipment Weekly,
     * Trade Weekly or Trade Monthly. Only for PM Schedules restricted by date range and other
     * condition comes from JS client.
     *
     * By Zhang Yi
     *
     * @param String dateFrom1: From date value in string format
     * @param String dateTo1: To date value in string format
     * @param String forecastResourceType: Forecast Resource Type
     * @param String forecastRestriction: Forecast Restriction
     */
    public void forecastPM52Week(final String dateFrom1, final String dateTo1,
            final String forecastResourceType, final String forecastRestriction) {

        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();

        context.addResponseParameter("dateFrom", dateFrom1);
        context.addResponseParameter("dateTo", dateTo1);
        // If the date range is not valid, return.
        if (!isDateRangeParameterValid(context)) {
            handlerDateRangeError(context);
        }

        // Retrive the date range parameter
        final String dateFrom =
                formatSqlIsoToNativeDate(context, notNull(context.getParameter("dateFrom")));
        final String dateTo =
                formatSqlIsoToNativeDate(context, notNull(context.getParameter("dateTo")));

        if (this.log.isDebugEnabled()) {
            this.log.debug(MessageFormat.format(
                "Run forecastPM52Week workflow rule for resource [{0}], from  [{1}] to [{2}].",
                new Object[] { forecastResourceType, dateFrom, dateTo }));
        }

        String monthsBetweenSqlStr = "", weeksBetweenSqlStr = "";
        // Construct week between and month between SQL strings for three different databases
        if (isOracle(context)) {
            weeksBetweenSqlStr = " TRUNC (date_todo - TO_DATE('"
                    + notNull(context.getParameter("dateFrom")) + "', 'YYYY-MM-DD'))";

            monthsBetweenSqlStr = " TRUNC(MONTHS_BETWEEN(date_todo,TO_DATE('"
                    + notNull(context.getParameter("dateFrom")) + "', 'YYYY-MM-DD')))";

        } else {
            monthsBetweenSqlStr = formatSqlMonthsBetween(context,
                (String) context.getParameter("dateFrom"), "date_todo");

            weeksBetweenSqlStr = formatSqlWeeksBetween(context,
                (String) context.getParameter("dateFrom"), "date_todo").replaceAll("wk", "day");

        }

        // Call ForecastDatesGenerator to create forecast records in database.
        final ForecastDatesGenerator forecastGenerator =
                new ForecastDatesGenerator(forecastResourceType, forecastRestriction, dateFrom,
                    dateTo, monthsBetweenSqlStr, weeksBetweenSqlStr, null);

        startJob(context, forecastGenerator);
    }

    // ---------------------------------------------------------------------------------------------
    // END forecastPMResources WFR
    // ---------------------------------------------------------------------------------------------

    // ---------------------------------------------------------------------------------------------
    // BEGIN PmScheduleGenerator WFR
    // ---------------------------------------------------------------------------------------------

    /**
     * This method serve as a WFR to call a long running job generating schedule dates for specified
     * date range and PM Schedules.
     *
     * By Zhang Yi
     *
     * @param String dateFrom1: From date value in string format
     * @param String dateTo1: To date value in string format
     * @param String pmsidRestriction: The restriction which contain pms code.
     * @param String createFutureDates1: Return a true or false string
     */
    public void PmScheduleGenerator(final String dateFrom1, final String dateTo1,
            final String pmsidRestriction, final String createFutureDates1)
                    throws ExceptionBase, ParseException {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        context.addResponseParameter("dateFrom", dateFrom1);
        context.addResponseParameter("dateTo", dateTo1);
        context.addResponseParameter("createFutureDates", createFutureDates1);
        if (!isDateRangeParameterValid(context)) {
            handlerDateRangeError(context);
        }

        // Retrieve parameters come from JS client
        boolean createFutureDates = true;
        final SimpleDateFormat dateFormat = new SimpleDateFormat();
        dateFormat.applyPattern("yyyy-MM-dd");
        final Date dateStart = dateFormat.parse((String) context.getParameter("dateFrom"));
        final Date dateEnd = dateFormat.parse((String) context.getParameter("dateTo"));

        if (context.parameterExistsNotEmpty("createFutureDates")) {
            createFutureDates = context.getBoolean("createFutureDates");
        }

        if (this.log.isDebugEnabled()) {
            this.log.debug(MessageFormat.format("Run PmScheduleGenerator between [{0}] to [{1}].",
                new Object[] { dateStart, dateEnd }));
        }

        // Call PmScheduleGenerator to create schedule date records in table pmsd.
        final PmScheduleGenerator generator =
                new PmScheduleGenerator(dateStart, dateEnd, pmsidRestriction, createFutureDates);

        final long t = System.currentTimeMillis();
        startJob(context, generator);

        if (this.log.isDebugEnabled()) {
            this.log.debug(
                MessageFormat.format("Total time for executing PmScheduleGenerator is [{0}].",
                    new Object[] { String.valueOf(System.currentTimeMillis() - t) }));
        }
    }

    // ---------------------------------------------------------------------------------------------
    // END PmScheduleGenerator WFR
    // ---------------------------------------------------------------------------------------------

    // ---------------------------------------------------------------------------------------------
    // BEGIN PmWorkOrderGenerator WFR
    // ---------------------------------------------------------------------------------------------

    /**
     * This method serve as a WFR to call a long running job generating work orders and work
     * requests for specified date range and other options.
     *
     * By Zhang Yi
     *
     * @param String dateFrom: From date value in string format
     * @param String dateTo: To date value in string format
     * @param String pmType: Pm type
     * @param String groupBy: Group by option
     * @param String generateNewDate: Return true or false string for decide whether generate new
     *            date.
     * @param String useGroupCode: Use group code
     * @param String pmsidRestriction
     */
    public void PmWorkOrderGenerator(final String dateFrom, final String dateTo,
            final String pmType, final String groupBy, final String generateNewDate,
            final String useGroupCode, final String pmsidRestriction)
                    throws ExceptionBase, ParseException {

        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        context.addResponseParameter("dateFrom", dateFrom);
        context.addResponseParameter("dateTo", dateTo);
        if (!isDateRangeParameterValid(context)) {
            handlerDateRangeError(context);
        }
        // Retrieve parameters come from JS client
        final SimpleDateFormat dateFormat = new SimpleDateFormat();
        dateFormat.applyPattern("yyyy-MM-dd");
        final Date dateStart = dateFormat.parse(dateFrom);
        final Date dateEnd = dateFormat.parse(dateTo);
        // Group by option
        final int groupOption = Integer.valueOf(groupBy).intValue();
        if (this.log.isDebugEnabled()) {
            this.log.debug(MessageFormat.format("Run PmWorkOrderGenerator between [{0}] to [{1}].",
                new Object[] { dateStart, dateEnd }));
        }

        boolean useGroupingCodes = false;
        if ("true".equalsIgnoreCase(useGroupCode)) {
            useGroupingCodes = true;
        }

        PmScheduleGenerator pmScheduleGenerator = null;

        if ("true".equalsIgnoreCase(generateNewDate)) {
            // If Generate New Date is set to true, then Call PmScheduleGenerator at first.
            pmScheduleGenerator =
                    new PmScheduleGenerator(dateStart, dateEnd, pmsidRestriction, true);
        }

        // Call PmWorkOrderGenerator.
        final PmWorkOrderGenerator generator = new PmWorkOrderGenerator(pmType, dateStart, dateEnd,
            groupOption, useGroupingCodes, pmsidRestriction, pmScheduleGenerator);

        final long t = System.currentTimeMillis();

        startJob(context, generator);

        if (this.log.isDebugEnabled()) {
            this.log.debug(
                MessageFormat.format("Total time for executing PmWorkOrderGenerator is [{0}].",
                    new Object[] { String.valueOf(System.currentTimeMillis() - t) }));
        }
        // ---------------------------------------------------------------------------------------------
        // END PmWorkOrderGenerator WFR
        // ---------------------------------------------------------------------------------------------

    }

    /**
     * This method start a job, set status to result
     *
     * By Zhang Yi
     *
     * @param context: Event handler context.
     * @param job: job object.
     *
     */
    private void startJob(final EventHandlerContext context, final Job job) {
        final JobManager.ThreadSafe jobManager = getJobManager(context);
        final String jobId = jobManager.startJob(job);

        // add the status to the response
        final JSONObject result = new JSONObject();
        result.put("jobId", jobId);

        // get the job status from the job id
        final JobStatus status = jobManager.getJobStatus(jobId);
        result.put("jobStatus", status.toString());

        context.addResponseParameter("jsonExpression", result.toString());
    }

    /**
     * This method served as a custom refresh WFR for Available Procedure Grid(pmp_list) to retrieve
     * available Procedures for multiple equipments.
     *
     * By Zhang Yi
     *
     * @param Map<String, Object> parameters
     *
     */
    public void getAvailableProceduresForEquipments(final Map<String, Object> parameters) {
        // ZY changed on 2010-12-07 for kb3024888
        // load the data source form the view
        final DataSource dataSource = DataSourceFactory.loadDataSourceFromFile(
            "ab-pm-asgn-procs-to-eq-hk.axvw", "ds_ab-pm-asgn-procs-to-eq-hk_show_pmp");

        // initialize the data source
        dataSource.setContext();

        // apply grid parameters to the data source
        if (parameters != null) {
            ReportUtility.handleParameters(dataSource, parameters);
        }

        // kb#3029684:take care sort arrow action
        final List<Map<String, Object>> sortValues = ReportUtility.getSortValues(parameters);
        String sortSql = "";
        for (int j = 0; j < sortValues.size(); j++) {
            final Map<String, Object> sort = sortValues.get(j);
            final int orderValue = (Integer) sort.get("sortOrder");
            if (orderValue != 0) {
                sortSql = "  order by  " + (String) sort.get("fieldName") + " ";
            }
            if (orderValue == -1) {
                sortSql = sortSql + " desc ";
            }
        }

        // retrieve filter values introduced in mini-console, and parse it to jsonarray
        final String ss = (String) parameters.get("filterValues");
        JSONArray filterValues = null;
        if (ss.length() > 2) {
            try {
                filterValues = new JSONArray(ss);
            } catch (final ParseException e) {
                // TODO Auto-generated catch block
                e.printStackTrace();
            }
        }

        // retrieve filter values of two fields: pmp.pmp_id and pmp.description
        String pmpId = null, pmpDescription = null;
        if (filterValues != null) {
            for (int i = 0; i < filterValues.length(); i++) {
                final JSONObject filterValue = filterValues.getJSONObject(i);
                if (filterValue.getString("fieldName").equals("pmp.pmp_id")) {
                    pmpId = filterValue.getString("filterValue");
                }
                if (filterValue.getString("fieldName").equals("pmp.description")) {
                    pmpDescription = filterValue.getString("filterValue");
                }
            }
        }

        // retrieve selected equipment codes array and equipment standards array from parameters
        final String restriction = (String) parameters.get("restriction");
        // In js side the equipment codes and equipment standards are connected by "&;plus&;plus",
        // so here need to split
        final String eqIds = restriction.split("&;plus&;")[0];
        final String eqStds = restriction.split("&;plus&;")[1];
        String[] equipments = {}, equipmentStds = {};
        if (eqIds.length() > 2) {
            final String eqs = eqIds.substring(1, eqIds.length() - 1);
            equipments = eqs.split(";");
        }
        if (eqStds.length() > 2) {
            final String stds = eqStds.substring(0, eqStds.length() - 2);
            equipmentStds = stds.split(";");
        }

        // retrieve available PM Procedures by given selected equipments array
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        // kb#3026576:Use SqlUtils.executeQuery() to replace datasource for fix MSSQL SERVER error
        // " [SQLServer]The ORDER BY clause is invalid in views, inline functions, derived tables,
        // subqueries, and common table expressions, unless TOP or FOR XML is also specified. "
        final String availablePmpSql = getSQLForRetrieveProcedures(false, PMTYPE_EQ,
            this.getRestrictionForProcedureFromEquipments(equipments), sortSql);
        final DataSetList dataSet = new DataSetList();
        final String[] flds = new String[] { "pmp_id", "description", "eq_std" };
        final List<DataRecord> pmpRecords = SqlUtils.executeQuery("pmp", flds, availablePmpSql);
        final List<DataRecord> availablePmpRecords = new ArrayList<DataRecord>();
        availablePmpRecords.addAll(pmpRecords);

        // Loop through the available PM Procedures to remove ones that have not consistent
        // equipment standards
        for (final DataRecord pmp : pmpRecords) {
            for (int i = 0; i < equipmentStds.length; i++) {
                if (StringUtil.notNullOrEmpty(pmp.getString("pmp.eq_std"))
                        && !pmp.getString("pmp.eq_std").equals(equipmentStds[i])) {
                    availablePmpRecords.remove(pmp);
                    break;
                }
            }

        }

        // Loop through the available PM Procedures to remove the one that does not match filter
        // values of mini-console
        if (StringUtil.notNullOrEmpty(pmpId)) {
            for (final DataRecord pmp : pmpRecords) {
                if (pmp.getString("pmp.pmp_id").toUpperCase().indexOf(pmpId.toUpperCase()) < 0) {
                    availablePmpRecords.remove(pmp);
                }
            }
        }
        if (StringUtil.notNullOrEmpty(pmpDescription)) {
            for (final DataRecord pmp : pmpRecords) {
                if (StringUtil.isNullOrEmpty(pmp.getString("pmp.description"))
                        || pmp.getString("pmp.description").toUpperCase()
                            .indexOf(pmpDescription.toUpperCase()) < 0) {
                    availablePmpRecords.remove(pmp);
                }
            }
        }

        // return dataSet to grid panel
        dataSet.addRecords(availablePmpRecords);
        context.setResponse(dataSet);
    }

    /**
     * This method serve as a WFR to retrieve attached PM Schedules for multiple equipments.
     *
     * By Zhang Yi
     *
     * @param String eqIds: Equipment id string
     *
     */

    public void getSchedulesForEquipments(final String eqIds) {
        // ZY changed on 2010-12-07 for kb3024888
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        // retrieve selected equipment codes array
        String[] equipments = {};
        if (eqIds.length() > 0) {
            final String eqs = eqIds.substring(0, eqIds.length() - 1);
            equipments = eqs.split(";");
        }
        // retrieve associated PM Procedures of given selected equipments
        // kb#3026576:Use SqlUtils.executeQuery() to replace datasource for fix MSSQL SERVER error
        // " [SQLServer]The ORDER BY clause is invalid in views, inline functions, derived tables,
        // subqueries, and common table expressions, unless TOP or FOR XML is also specified. "
        final String selectPMSDSsql = getSQLForRetrieveProcedures(true, PMTYPE_EQ,
            this.getRestrictionForProcedureFromEquipments(equipments), null);
        final String[] flds = new String[] { "pmp_id", "description", "eq_std" };
        final List<DataRecord> pmpRecords = SqlUtils.executeQuery("pmp", flds, selectPMSDSsql);
        final DataSetList dataSet = new DataSetList();
        // return dataSet to grid panel
        dataSet.addRecords(pmpRecords);
        context.setResponse(dataSet);
    }

    /**
     * This method execute a constructed SQL to retrieve PM Procedures assigned or not assigned to
     * given multiple equipments .
     *
     * By Zhang Yi
     *
     * @param boolean assigned: If assign procedures
     * @param String[] equipments: Equipment array
     * @return
     *
     */
    // kb#3026576:Use SqlUtils.executeQuery() to replace datasource for fix below MSSQL SERVER
    // error. Change the return type from datasource to string.
    // " [SQLServer]The ORDER BY clause is invalid in views, inline functions, derived tables,
    // subqueries, and common table expressions, unless TOP or FOR XML is also specified. "
    private String getSQLForRetrieveProcedures(final boolean assigned, final String pmpTye,
            final String restriction, final String sortSql) {
        // ZY changed on 2010-12-07 for kb3024888 change parameter type If select not assigned
        // procedures, use NOT EXISTS clause
        final StringBuilder sql = new StringBuilder();

        // If select assigned procedures, use EXISTS clause
        if (assigned) {
            sql.append("SELECT DISTINCT pmp_id,description,eq_std FROM pmp WHERE EXISTS (");
        } else {

            sql.append("SELECT DISTINCT pmp_id,description,eq_std FROM pmp WHERE NOT EXISTS (");
        }

        sql.append(restriction).append(")");
        sql.append(" AND pmp.PMP_TYPE='").append(pmpTye).append("'");
        sql.append(" AND ${sql.vpaRestriction} ");
        if (StringUtil.notNullOrEmpty(sortSql)) {
            sql.append(sortSql);
        }

        return sql.toString();
    }

    /**
     * This method execute a constructed SQL to retrieve PM Procedures assigned or not assigned to
     * given multiple equipments .
     *
     * By Zhang Yi
     *
     * @param boolean assigned: If assign procedures
     * @param String[] equipments: Equipment array
     * @return
     *
     */
    // kb#3026576:Use SqlUtils.executeQuery() to replace datasource for fix below MSSQL SERVER
    // error. Change the return type from datasource to string.
    // " [SQLServer]The ORDER BY clause is invalid in views, inline functions, derived tables,
    // subqueries, and common table expressions, unless TOP or FOR XML is also specified. "
    private String getRestrictionForProcedureFromEquipments(final String[] equipments) {// ZY

        final StringBuilder sql = new StringBuilder();

        // For each equipment, add a INTERSECT clause
        for (int i = 0; i < equipments.length; i++) {
            if (i > 0) {
                sql.append(" INTERSECT ");
            }
            sql.append(" SELECT 1 FROM pms WHERE pms.pmp_id = pmp.pmp_id AND pms.eq_id ='")
                .append(equipments[i]).append("'");
        }

        return sql.toString();
    }

    /**
     * This method served as a custom refresh WFR for Available Procedure Grid(pmp_list) to retrieve
     * available Procedures for multiple equipments.
     *
     * By Zhang Yi
     *
     * @param Map<String, Object> parameters
     *
     */
    public void getAvailableProceduresForLocations(final Map<String, Object> parameters) {
        // ZY changed on 2010-12-07 for kb3024888
        // load the data source form the view
        final DataSource dataSource = DataSourceFactory.loadDataSourceFromFile(
            "ab-pm-asgn-procs-to-eq-hk.axvw", "ds_ab-pm-asgn-procs-to-eq-hk_show_pmp");

        // initialize the data source
        dataSource.setContext();

        // apply grid parameters to the data source
        if (parameters != null) {
            ReportUtility.handleParameters(dataSource, parameters);
        }

        // kb#3029684:take care sort arrow action
        final List<Map<String, Object>> sortValues = ReportUtility.getSortValues(parameters);
        String sortSql = "";
        for (int j = 0; j < sortValues.size(); j++) {
            final Map<String, Object> sort = sortValues.get(j);
            final int orderValue = (Integer) sort.get("sortOrder");
            if (orderValue != 0) {
                sortSql = "  order by  " + (String) sort.get("fieldName") + " ";
            }
            if (orderValue == -1) {
                sortSql = sortSql + " desc ";
            }
        }

        // retrieve filter values introduced in mini-console, and parse it to jsonarray
        final String ss = (String) parameters.get("filterValues");
        JSONArray filterValues = null;
        if (ss.length() > 2) {
            try {
                filterValues = new JSONArray(ss);
            } catch (final ParseException e) {
                e.printStackTrace();
            }
        }

        // retrieve filter values of two fields: pmp.pmp_id and pmp.description
        String pmpId = null, pmpDescription = null;
        if (filterValues != null) {
            for (int i = 0; i < filterValues.length(); i++) {
                final JSONObject filterValue = filterValues.getJSONObject(i);
                if (filterValue.getString("fieldName").equals("pmp.pmp_id")) {
                    pmpId = filterValue.getString("filterValue");
                }
                if (filterValue.getString("fieldName").equals("pmp.description")) {
                    pmpDescription = filterValue.getString("filterValue");
                }
            }
        }

        // retrieve selected equipment codes array and equipment standards array from parameters
        JSONArray locs = null;
        try {
            locs = new JSONArray((String) parameters.get("restriction"));
        } catch (final ParseException e) {
            e.printStackTrace();
        }
        final List<DataRecord> locations = DataRecord.createRecordsFromJSON(locs);
        // In js side the equipment codes and equipment standards are connected by "&;plus&;plus",
        // so here need to split

        // kb#3026576:Use SqlUtils.executeQuery() to replace datasource for fix MSSQL SERVER error
        // " [SQLServer]The ORDER BY clause is invalid in views, inline functions, derived tables,
        // subqueries, and common table expressions, unless TOP or FOR XML is also specified. "
        final String availablePmpSql = getSQLForRetrieveProcedures(false, PMTYPE_HK,
            this.getRestrictionForProcedureFromLocations(locations), sortSql);

        final String[] flds = new String[] { "pmp_id", "description", "eq_std" };
        final List<DataRecord> pmpRecords = SqlUtils.executeQuery("pmp", flds, availablePmpSql);

        final List<DataRecord> availablePmpRecords = new ArrayList<DataRecord>();
        availablePmpRecords.addAll(pmpRecords);

        // Loop through the available PM Procedures to remove the one that does not match filter
        // values of mini-console
        if (StringUtil.notNullOrEmpty(pmpId)) {
            for (final DataRecord pmp : pmpRecords) {
                if (pmp.getString("pmp.pmp_id").toUpperCase().indexOf(pmpId.toUpperCase()) < 0) {
                    availablePmpRecords.remove(pmp);
                }
            }
        }
        if (StringUtil.notNullOrEmpty(pmpDescription)) {
            for (final DataRecord pmp : pmpRecords) {
                if (StringUtil.isNullOrEmpty(pmp.getString("pmp.description"))
                        || pmp.getString("pmp.description").toUpperCase()
                            .indexOf(pmpDescription.toUpperCase()) < 0) {
                    availablePmpRecords.remove(pmp);
                }
            }
        }

        // return dataSet to grid panel
        final DataSetList dataSet = new DataSetList();
        dataSet.addRecords(availablePmpRecords);
        // retrieve available PM Procedures by given selected equipments array
        ContextStore.get().getEventHandlerContext().setResponse(dataSet);
    }

    /**
     * This method serve as a WFR to retrieve attached PM Schedules for multiple equipments.
     *
     * By Zhang Yi
     *
     * @param String eqIds: Equipment id string
     *
     */

    public void getSchedulesForLocations(final JSONArray locations) {
        // ZY changed on 2010-12-07 for kb3024888

        // retrieve associated PM Procedures of given selected equipments
        // kb#3026576:Use SqlUtils.executeQuery() to replace datasource for fix MSSQL SERVER error
        // " [SQLServer]The ORDER BY clause is invalid in views, inline functions, derived tables,
        // subqueries, and common table expressions, unless TOP or FOR XML is also specified. "
        final String selectPMSDSsql = getSQLForRetrieveProcedures(true, PMTYPE_HK, this
            .getRestrictionForProcedureFromLocations(DataRecord.createRecordsFromJSON(locations)),
            null);
        final String[] flds = new String[] { "pmp_id", "description", "eq_std" };
        final List<DataRecord> pmpRecords = SqlUtils.executeQuery("pmp", flds, selectPMSDSsql);
        final DataSetList dataSet = new DataSetList();
        // return dataSet to grid panel
        dataSet.addRecords(pmpRecords);

        ContextStore.get().getEventHandlerContext().setResponse(dataSet);
    }

    /**
     * This method execute a constructed SQL to retrieve PM Procedures assigned or not assigned to
     * given multiple equipments .
     *
     * By Zhang Yi
     *
     * @param boolean assigned: If assign procedures
     * @param String[] equipments: Equipment array
     * @return
     *
     */
    // kb#3026576:Use SqlUtils.executeQuery() to replace datasource for fix below MSSQL SERVER
    // error. Change the return type from datasource to string.
    // " [SQLServer]The ORDER BY clause is invalid in views, inline functions, derived tables,
    // subqueries, and common table expressions, unless TOP or FOR XML is also specified. "
    private String getRestrictionForProcedureFromLocations(final List<DataRecord> locations) {// ZY

        final StringBuilder sql = new StringBuilder();
        int count = 0;
        for (final DataRecord loc : locations) {

            if (count++ > 0) {
                sql.append(" INTERSECT ");
            }

            sql.append(" SELECT 1 FROM pms WHERE pms.pmp_id = pmp.pmp_id ");

            final String blId = loc.getString("rm.bl_id");
            final String siteId = loc.getString("bl.site_id");
            final String flId = loc.getString("rm.fl_id");
            final String rmId = loc.getString("rm.rm_id");

            sql.append(" and pms.bl_id='").append(blId).append("' ");

            if (StringUtil.notNullOrEmpty(siteId)) {
                sql.append(" and pms.site_id='").append(siteId).append("' ");
            } else {
                sql.append(" and pms.site_id is null ");
            }

            if (StringUtil.notNullOrEmpty(flId)) {
                sql.append(" and pms.fl_id='").append(flId).append("' ");
            } else {
                sql.append(" and pms.fl_id is null ");
            }

            if (StringUtil.notNullOrEmpty(rmId)) {
                sql.append(" and pms.rm_id='").append(rmId).append("' ");
            } else {
                sql.append(" and pms.rm_id is null ");
            }
        }

        return sql.toString();
    }

    /**
     * This method serve as a WFR to delete PM Schedules for multiple equipments and procedures.
     *
     * By Zhang Yi
     *
     * @param JSONArray equipments: Equipment json array
     * @param JSONArray procs: Procure json array
     *
     */
    public void deleteEquipmentSchedules(final JSONArray equipments, final JSONArray procs) {

        final DataSource delePMSDS = DataSourceFactory.createDataSource().addTable("pms")
            .addField(new String[] { "eq_id", "pmp_id" });
        final DataSource eqDS = DataSourceFactory.createDataSourceForFields("eq",
            new String[] { "qty_pms", "eq_id" });

        // For each equipment, delete attached PMS and update pm schedule count value in eq table.
        for (int i = 0; i < equipments.length(); i++) {
            final JSONObject eq = equipments.getJSONObject(i);
            final String eq_id = eq.getString("eq.eq_id");

            // For current equipment and each procedure, delete attached PMS.
            for (int j = 0; j < procs.length(); j++) {
                final JSONObject proc = procs.getJSONObject(j);
                final String pmp_id = proc.getString("pmp.pmp_id");
                final List<DataRecord> records = delePMSDS
                    .getRecords(" eq_id ='" + eq_id + "' AND pmp_id ='" + pmp_id + "'");
                for (final DataRecord record : records) {
                    delePMSDS.deleteRecord(record);
                }
            }

            eqDS.addQuery("UPDATE eq SET qty_pms = (SELECT COUNT (1) FROM pms WHERE eq_id ='"
                    + eq_id + "')" + " WHERE eq_id='" + eq_id + "'")
                .executeUpdate();
        }

    }

    /**
     * This method serve as a WFR to delete PM Schedules for multiple equipments and procedures.
     *
     * By Zhang Yi
     *
     * @param JSONArray locs: Location json array
     * @param JSONArray procs: Procure json array
     *
     */
    public void deleteLocationSchedules(final JSONArray locs, final JSONArray procs) {

        final DataSource locPmsDS = DataSourceFactory.createDataSourceForFields("pms",
            new String[] { "pmp_id", "site_id", "bl_id", "fl_id", "rm_id" });

        final StringBuilder deleteSql = new StringBuilder();
        deleteSql.append("(");

        // For each equipment, add PM Schedule and update pm schedule count value in eq table.
        for (int i = 0; i < locs.length(); i++) {
            final DataRecord loc = DataRecord.createRecordFromJSON(locs.getJSONObject(i));
            final String site_id = loc.getString("bl.site_id");
            final String bl_id = loc.getString("rm.bl_id");
            final String fl_id = loc.getString("rm.fl_id");
            final String rm_id = loc.getString("rm.rm_id");

            if (i > 0) {
                deleteSql.append(" or ");
            }

            deleteSql.append(" bl_id='").append(bl_id).append("' ");

            if (StringUtil.notNullOrEmpty(site_id)) {
                deleteSql.append(" and site_id='").append(site_id).append("' ");
            } else {
                deleteSql.append(" and site_id is null ");
            }

            if (StringUtil.notNullOrEmpty(fl_id)) {
                deleteSql.append(" and fl_id='").append(fl_id).append("' ");
            } else {
                deleteSql.append(" and fl_id is null ");
            }

            if (StringUtil.notNullOrEmpty(rm_id)) {
                deleteSql.append(" and rm_id='").append(rm_id).append("' ");
            } else {
                deleteSql.append(" and rm_id is null ");
            }
        }

        deleteSql.append(") and (");
        // For current equipment and each procedure, create a new PMS.
        for (int j = 0; j < procs.length(); j++) {
            final DataRecord procedure = DataRecord.createRecordFromJSON(procs.getJSONObject(j));
            final String pmp_id = procedure.getString("pmp.pmp_id");

            if (j > 0) {
                deleteSql.append(" or ");
            }

            deleteSql.append(" pmp_id='").append(pmp_id).append("' ");
        }

        deleteSql.append(") ");

        final List<DataRecord> records = locPmsDS.getRecords(deleteSql.toString());
        for (final DataRecord record : records) {
            locPmsDS.deleteRecord(record);
        }

    }

    /**
     * This method serve as a WFR to add PM Schedules for multiple equipments and procedures.
     *
     * By Zhang Yi
     *
     * @param JSONArray equipments: Equipment json array
     * @param JSONArray procs: Procure json array
     */
    public void addSchedulesForProceduresAndEquipments(final JSONArray equipments,
            final JSONArray procs) {

        final DataSource insertPMSDS = DataSourceFactory.createDataSourceForFields("pms",
            new String[] { "pmp_id", "eq_id" });

        boolean nullPms = false;
        if (insertPMSDS.getRecord() == null) {
            nullPms = true;
        }

        final DataSource eqDS = DataSourceFactory.createDataSourceForFields("eq",
            new String[] { "qty_pms", "eq_id" });

        // Multiple storage location warehouse
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();

        // Check if upgrade to multiple warehouse. by Guoqiang Jia
        final String isUseMultipleWH = EventHandlerBase.getActivityParameterString(context,
            "AbBldgOpsOnDemandWork", "UseBldgOpsConsole");
        final String mainWarehouseCode =
                BldgopsPartInventorySupplyRequisition.getMainStorageLocation();
        // For each equipment, add PM Schedule and update pm schedule count value in eq table.
        for (int i = 0; i < equipments.length(); i++) {
            final JSONObject eq = equipments.getJSONObject(i);
            final String eq_id = eq.getString("eq.eq_id");

            // For current equipment and each procedure, create a new PMS.
            for (int j = 0; j < procs.length(); j++) {
                final JSONObject proc = procs.getJSONObject(j);
                final String pmp_id = proc.getString("pmp.pmp_id");
                if ("1".equals(isUseMultipleWH)) {
                    // upgrade to multiple warehouse, by Jia Guoqiang
                    if (!nullPms) {
                        insertPMSDS.addQuery("INSERT INTO pms (pt_store_loc_id,eq_id, pmp_id) "
                                + "SELECT DISTINCT '" + mainWarehouseCode + "','" + eq_id + "','"
                                + pmp_id + "' " + "FROM pms "
                                + "WHERE NOT EXISTS (SELECT 1 FROM pms WHERE eq_id ='" + eq_id
                                + "' AND pmp_id ='" + pmp_id + "' and pt_store_loc_id='"
                                + mainWarehouseCode + "')")
                            .executeUpdate();
                    } else {
                        insertPMSDS.addQuery(
                            "INSERT INTO pms (pt_store_loc_id,eq_id, pmp_id) " + "VALUES( '"
                                    + mainWarehouseCode + "','" + eq_id + "','" + pmp_id + "' )")
                            .executeUpdate();
                        nullPms = false;
                    }
                } else {
                    // modified for kb 3024355, by zhang yi
                    if (!nullPms) {
                        insertPMSDS.addQuery("INSERT INTO pms (eq_id, pmp_id) "
                                + "SELECT DISTINCT '" + eq_id + "','" + pmp_id + "' " + "FROM pms "
                                + "WHERE NOT EXISTS (SELECT 1 FROM pms WHERE eq_id ='" + eq_id
                                + "' AND pmp_id ='" + pmp_id + "')")
                            .executeUpdate();
                    } else {
                        insertPMSDS.addQuery("INSERT INTO pms (eq_id, pmp_id) " + "VALUES( '"
                                + eq_id + "','" + pmp_id + "' )")
                            .executeUpdate();
                        nullPms = false;
                    }
                }

                // kb#3034693: after insert new equipment pm schedule, also update equipment's
                // site_id, bl_id, fl_id and rm_id to the new pm schedule as well.
                insertPMSDS.addQuery(
                    "UPDATE pms SET site_id= ( select eq.site_id from eq where eq.eq_id=pms.eq_id ), "
                            + "     bl_id=( select eq.bl_id from eq where eq.eq_id=pms.eq_id), "
                            + "     fl_id=( select eq.fl_id from eq where eq.eq_id=pms.eq_id), "
                            + "     rm_id=( select eq.rm_id from eq where eq.eq_id=pms.eq_id) "
                            + " WHERE pms.eq_id ='" + eq_id + "' and pms.pmp_id='" + pmp_id + "'")
                    .executeUpdate();
            }

            eqDS.addQuery("UPDATE eq SET qty_pms = (SELECT COUNT (1) FROM pms WHERE eq_id ='"
                    + eq_id + "')" + " WHERE eq_id='" + eq_id + "'")
                .executeUpdate();
        }
    }

    /**
     * This method serve as a WFR to add PM Schedules for multiple equipments and procedures.
     *
     * By Zhang Yi
     *
     * @param JSONArray equipments: Equipment json array
     * @param JSONArray procs: Procure json array
     */
    public void addSchedulesForProceduresAndLoctions(final JSONArray locs, final JSONArray procs) {

        final DataSource insertPMSDS = DataSourceFactory.createDataSourceForFields("pms",
            new String[] { "pmp_id", "eq_id" });

        boolean nullPms = false;
        if (insertPMSDS.getRecord() == null) {
            nullPms = true;
        }

        // Multiple storage location warehouse
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        // Check if upgrade to multiple warehouse
        final String isUseMultipleWH = EventHandlerBase.getActivityParameterString(context,
            "AbBldgOpsOnDemandWork", "UseBldgOpsConsole");
        final String mainWarehouseCode =
                BldgopsPartInventorySupplyRequisition.getMainStorageLocation();

        // For each equipment, add PM Schedule and update pm schedule count value in eq table.
        for (int i = 0; i < locs.length(); i++) {
            final DataRecord loc = DataRecord.createRecordFromJSON(locs.getJSONObject(i));
            final String site_id = loc.getString("bl.site_id");
            final String bl_id = loc.getString("rm.bl_id");
            final String fl_id = loc.getString("rm.fl_id");
            final String rm_id = loc.getString("rm.rm_id");

            // For current equipment and each procedure, create a new PMS.
            for (int j = 0; j < procs.length(); j++) {
                final DataRecord procedure =
                        DataRecord.createRecordFromJSON(procs.getJSONObject(j));
                final String pmp_id = procedure.getString("pmp.pmp_id");

                final StringBuilder insertSql = new StringBuilder();
                final StringBuilder fields = new StringBuilder();
                final StringBuilder values = new StringBuilder();
                final StringBuilder restrictions = new StringBuilder();

                fields.append("pmp_id, bl_id ");
                values.append("'").append(pmp_id).append("','").append(bl_id).append("' ");
                restrictions.append("pmp_id='").append(pmp_id).append("' and bl_id='").append(bl_id)
                    .append("' ");

                if (StringUtil.notNullOrEmpty(site_id)) {
                    fields.append(", site_id ");
                    values.append(",'").append(site_id).append("'");
                    restrictions.append(" and site_id='").append(site_id).append("' ");
                } else {
                    restrictions.append(" and site_id is null ");
                }

                if (StringUtil.notNullOrEmpty(fl_id)) {
                    fields.append(", fl_id ");
                    values.append(",'").append(fl_id).append("'");
                    restrictions.append(" and fl_id='").append(fl_id).append("' ");
                } else {
                    restrictions.append(" and fl_id is null ");
                }

                if (StringUtil.notNullOrEmpty(rm_id)) {
                    fields.append(", rm_id ");
                    values.append(",'").append(rm_id).append("'");
                    restrictions.append(" and rm_id='").append(rm_id).append("' ");
                } else {

                    restrictions.append(" and rm_id is null ");
                }
                // if activity parameter value is '1', then upgrade to multiple warehouse
                if ("1".equals(isUseMultipleWH)) {
                    if (StringUtil.notNullOrEmpty(mainWarehouseCode)) {
                        fields.append(", pt_store_loc_id ");
                        values.append(",'").append(mainWarehouseCode).append("'");
                        restrictions.append(" and pt_store_loc_id='").append(mainWarehouseCode)
                            .append("' ");
                    }
                }

                insertSql.append("INSERT INTO pms (").append(fields).append(")");
                // modified for kb 3024355, by zhang yi
                if (!nullPms) {

                    insertSql.append(" SELECT DISTINCT ").append(values);
                    insertSql.append(" FROM pms WHERE NOT EXISTS (SELECT 1 FROM pms WHERE ");
                    insertSql.append(restrictions).append(")");

                } else {
                    insertSql.append(" VALUES( ").append(values).append(" ) ");
                    nullPms = false;
                }

                insertPMSDS.addQuery(insertSql.toString()).executeUpdate();
            }

        }
    }

    // ---------------------------------------------------------------------------------------------
    // BEGIN loadScheduleValuesForMultiplePMSRecords WFR
    /**
     * input Array of selected schedules - pms_id return JSONObject with a record
     *
     * this workflow is for compare the field value ,if it show the same value that each field of
     * all records ,return the value ,or show string "<varies>"
     *
     * @param JSONArray records: Selected pms json array
     */
    // ---------------------------------------------------------------------------------------------
    public void loadMultiPMSRecords(final JSONArray records) {

        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        if (records.length() > 0) {
            final StringBuffer in = new StringBuffer();
            for (int i = 0; i < records.length(); i++) {
                final JSONObject record = records.getJSONObject(i);
                final int pmsid = record.getInt("pms.pms_id");
                in.append("," + pmsid);
            }

            final String[] sqlfield = { "pms_id", "pmp_id", "eq_id", "dv_id", "dp_id", "pm_group",
                    "site_id", "bl_id", "fl_id", "rm_id", "date_first_todo", "date_last_completed",
                    "date_next_todo", "date_next_alt_todo", "hours_calc", "hours_est",
                    "interval_type", "fixed", "interval_freq", "interval_1", "interval_2",
                    "interval_3", "interval_4", "meter_last_pm", "nactive", "total_unit", "units",
                    "comments", "priority" };

            final String sql2 =
                    "pms_id,pmp_id,eq_id,dv_id,dp_id,pm_group,site_id,bl_id,fl_id,rm_id,date_first_todo,date_last_completed,date_next_todo,date_next_alt_todo,hours_calc,hours_est,interval_type,fixed,interval_freq,interval_1,interval_2,interval_3,interval_4,meter_last_pm,nactive,total_unit,units,comments,priority ";

            final String sql1 = "SELECT " + sql2 + " FROM  pms  WHERE pms_id IN ("
                    + in.substring(1).toString() + ")";

            final List recs = selectDbRecords(context, sql1);

            final Object[] recs0 = (Object[]) recs.get(0);
            final JSONObject stepMap = new JSONObject();
            for (int i = 0; i < sqlfield.length; i++) {
                final String recs1 = notNull(recs0[i]).trim();

                if (!isTrue(i, recs)) {
                    stepMap.put(sqlfield[i], "<varies>");

                } else {
                    stepMap.put(sqlfield[i], recs1);
                }
            }
            recs.clear();
            context.addResponseParameter("jsonExpression", stepMap.toString());

        }

    }

    /**
     * Return bool is Equals,
     *
     * @param a,int key
     * @param recs,list
     * @return
     */
    public boolean isTrue(final int a, final List recs) {

        boolean isEquals = true;
        final Object[] values0 = (Object[]) recs.get(0);
        final String value1 = notNull(values0[a]).trim();
        String valueTest = "";
        if (recs.size() > 0) {
            Object[] values = (Object[]) recs.get(0);
            for (int i = 0; i < recs.size(); i++) {
                values = (Object[]) recs.get(i);
                valueTest = notNull(values[a]).trim();
                if (!valueTest.equals(value1)) {
                    isEquals = false;
                    break;
                }
            }
        }
        return isEquals;
    }

    // ---------------------------------------------------------------------------------------------
    // END loadScheduleValuesForMultiplePMSRecords WFR
    //

    // ---------------------------------------------------------------------------------------------
    // BEGIN saveScheduleValuesForEquipmentPMSRecords WFR
    // ---------------------------------------------------------------------------------------------
    // ----------------------- constants ----------------------------------------------------------
    // ---------------------------------------------------------------------------------------------
    // END loadScheduleValuesForMultiplePMSRecords WFR
    //

    // ---------------------------------------------------------------------------------------------
    // BEGIN saveScheduleValuesForEquipmentPMSRecords WFR
    // ---------------------------------------------------------------------------------------------
    // ----------------------- constants ----------------------------------------------------------
    /**
     * Save multi pms records at one time ,when field value is <varies> ,we didn't save the original
     * value .
     *
     * @param JSONObject totalRow: The form key and value object after loading multi pms generate.
     * @param JSONArray records: The selected pms records
     */
    public void saveMultiPMSRecords(final JSONObject totalRow, final JSONArray records) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final JSONArray j = totalRow.names();

        final StringBuffer insql = new StringBuffer();
        for (int i = 0; i < j.length(); i++) {
            final String key = j.get(i).toString();

            final String value = totalRow.get(j.get(i).toString()).toString();
            // int valueint =totalRow.getInt(key);
            // for the value is ''

            if ((key.equals("pms.comments") || key.equals("pms.units")) && value.equals("")) {
                insql.append("," + key + "='" + value + "' ");
            }
            if ((key.equals("pms.pm_group") || key.equals("pms.date_next_alt_todo"))
                    && value.equals("")) {
                insql.append("," + key + "=" + null);
            }

            if (key.equals("pms.dv_id") && value.equals("")) {
                insql.append("," + key + "=" + null);
                insql.append("," + "pms.dp_id" + "=" + null);

            }
            if (!value.equals("<varies>") && value != "" && !value.equals("")) {
                if (key.equals("pms.pms_id") || key.equals("pms.interval_2")
                        || key.equals("pms.fixed") || key.equals("pms.interval_1")
                        || key.equals("pms.interval_3") || key.equals("pms.interval_4")
                        || key.equals("pms.interval_freq") || key.equals("pms.nactive")
                        || key.equals("pms.priority")) {
                    final int valueint = getIntegerValue(context, value).intValue();
                    insql.append("," + key + "=" + valueint);
                } else if (key.equals("pms.hours_est") || key.equals("pms.total_unit")) {
                    final Double valueDouble = Double.valueOf(value);
                    insql.append("," + key + "=" + valueDouble);
                } else if (key.equals("pms.date_first_todo")
                        || key.equals("pms.date_last_completed")
                        || key.equals("pms.date_next_alt_todo")
                        || key.equals("pms.date_next_todo")) {

                    insql.append("," + key + "=" + formatSqlDateTime(context,
                        totalRow.getString(j.get(i).toString()), ""));
                } else {
                    if (key.equals("pms.dp_id")) {
                        continue;
                    }
                    int a = 0;
                    if (key.equals("pms.dv_id")) {
                        a++;
                    }
                    if (a > 0) {
                        if (!totalRow.get("pms.dp_id").toString().equals("")) {
                            insql.append(
                                "," + "pms.dp_id='" + totalRow.get("pms.dp_id").toString() + "'");

                        } else {
                            insql.append("," + "pms.dp_id" + "=" + null);

                        }
                    }
                    insql.append("," + key + "='" + value + "' ");
                }
            }
        }

        if (insql.toString().length() <= 0) {
            return;
        }
        String sql = "";

        final StringBuffer in = new StringBuffer();
        if (records.length() > 0) {

            for (int i = 0; i < records.length(); i++) {
                final JSONObject record = records.getJSONObject(i);
                final int pmsid = record.getInt("pms.pms_id");
                in.append("," + pmsid);
            }
            final String sql1 = insql.substring(1).toString();
            sql = "UPDATE pms SET " + sql1 + " WHERE pms_id IN (" + in.substring(1).toString()
                    + ")";
        }

        executeDbSql(context, sql, true);
        // executeDbCommit(context);
        // select eq list
        final String sqlpmseq = "SELECT DISTINCT eq_id  FROM  pms  WHERE pms_id IN ("
                + in.substring(1).toString() + ")";
        final List eqlist = selectDbRecords(context, sqlpmseq);

        if (eqlist != null && eqlist.size() > 0) {

            String sqlupdateeq = "";
            final Collection c = new HashSet();
            for (int i = 0; i < eqlist.size(); i++) {
                final Object[] eqob = (Object[]) eqlist.get(i);
                if (eqob[0] != null) {
                    final String eqid = eqob[0].toString().trim();
                    c.add(eqid);
                }
            }
            final Iterator cit = c.iterator();
            for (; cit.hasNext();) {
                final String eqidc = ((String) cit.next()).trim();
                sqlupdateeq = "UPDATE eq SET qty_pms   = (SELECT COUNT (1) FROM pms WHERE eq_id = '"
                        + eqidc + "' ) WHERE eq_id = '" + eqidc + "' ";
                executeDbSql(context, sqlupdateeq, true);

            }

            // executeDbCommit(context);
        }

    }

    // ---------------------------------------------------------------------------------------------
    // END saveScheduleValuesForEquipmentPMSRecords WFR
    // ---------------------------------------------------------------------------------------------

    // ---------------------------------------------------------------------------------------------
    // BEGIN runPMGeneration WFR
    // ---------------------------------------------------------------------------------------------

    /**
     * This is a scheduled WFR to generate work order according to the record in the pmgen table.
     *
     * By Guo Jiang Tao
     *
     * @param context Event handler context
     */
    public void runPMGeneration(final EventHandlerContext context) {
        final DataSource ds = DataSourceFactory.createDataSourceForFields("pmgen",
            new String[] { "pmgen_id", "date_start", "recurring_rule", "pm_type", "gen_new_pmsd",
                    "use_pm_group", "group_param", "site_id", "bl_id", "fl_id", "pm_group",
                    "tr_id" });

        final List<DataRecord> pmgenRecordsds = ds.getRecords();
        Date currentDate = new Date();
        // Guo added 2009-09-14 to fix KB3024410
        final Calendar c = Calendar.getInstance();
        c.setTime(currentDate);
        c.set(Calendar.HOUR_OF_DAY, 0);
        c.set(Calendar.MINUTE, 0);
        c.set(Calendar.SECOND, 0);
        c.set(Calendar.MILLISECOND, 0);
        currentDate = c.getTime();
        for (int i = 0; i < pmgenRecordsds.size(); i++) {
            final DataRecord pmgenRecord = pmgenRecordsds.get(i);
            final Date dateStart = pmgenRecord.getDate("pmgen.date_start");
            final String recurringRule = pmgenRecord.getString("pmgen.recurring_rule");

            if (isDateMatchRecurringRule(recurringRule, dateStart, currentDate)) {
                final Date dateEnd = getDateEndByRule(recurringRule, currentDate);
                if (dateEnd != null) {
                    generateWoByRule(pmgenRecord, currentDate, dateEnd);
                }
            }
        }
        this.log.info("runPMGeneration rule called at " + new Date());
    }

    // ---------------------------------------------------------------------------------------------
    // END runPMGeneration WFR
    // ---------------------------------------------------------------------------------------------

    /**
     * To decide whether the testDate match the recurring rule from dateStart
     *
     * By Guo Jiang Tao
     *
     * @param recurringRule: Recurring rule
     * @param dateStart: Recurring rule date_start
     * @param testDate: Test date
     * @return
     */
    private boolean isDateMatchRecurringRule(final String recurringRule, Date dateStart,
            final Date testDate) {
        boolean isMatch = false;
        // if testDate is before the startDate, not matched
        if (!dateStart.after(testDate)) {
            try {
                // parse the xml format recurring rule
                final Document recordXmlDoc = new SAXReader().read(new StringReader(recurringRule));
                final Element rootElement = recordXmlDoc.getRootElement();
                final String recurringType = rootElement.attributeValue("type");
                final String value1 = rootElement.attributeValue("value1");
                final String value2 = rootElement.attributeValue("value2");
                final String[] arrayWeek = { "mon", "tue", "wed", "thu", "fri", "sat", "sun" };
                // get which day in the week: 0--mon, 1--tue, 2--wed,.... see String[] arrayWeekeek
                final int dayOfWeek = getDayOfWeek(testDate);

                // if the recurring type is 'day', add days by interval(define in value1) until
                // equals or after the test date
                // if equals, matched, else not matched
                if ("day".equals(recurringType)) {
                    final int interval = Integer.parseInt(value1);
                    final Calendar c = Calendar.getInstance();
                    c.setTime(dateStart);
                    c.set(Calendar.HOUR_OF_DAY, 23);
                    c.set(Calendar.MINUTE, 59);
                    c.set(Calendar.SECOND, 59);
                    c.set(Calendar.MILLISECOND, 999);
                    c.add(Calendar.DATE, -interval);
                    dateStart = Period.getDateAfter(c.getTime(), testDate, Period.CUSTOM, interval);

                    if (DateTime.sameDay(dateStart, testDate)) {
                        isMatch = true;
                    }
                }
                // if the recurring type is 'week',check whether the test day in the week is
                // selected (define in value1 like '0,1,1,0,0,0,0', 0--unselected, 1--selected )
                else if ("week".equals(recurringType)) {
                    final String[] tempArray = value1.split(",");
                    if ("1".equals(tempArray[dayOfWeek])) {
                        isMatch = true;
                    }
                }
                // if the recurring type is 'month'\'bimonth'\'trimonth' get the right date of test
                // month by recurring rule
                // (value1:'1st','2nd','3rd','4th','last' value2:'mon', 'tue'....)
                else if ("month".equals(recurringType)) {
                    if (arrayWeek[dayOfWeek].equals(value2)) {
                        final Date targetDate =
                                getDateOfMonth(dateStart, testDate, 1, value1, value2);
                        if (targetDate != null && DateTime.sameDay(targetDate, testDate)) {
                            isMatch = true;
                        }
                    }
                } else if ("bimonth".equals(recurringType)) {
                    if (arrayWeek[dayOfWeek].equals(value2)) {
                        final Date targetDate =
                                getDateOfMonth(dateStart, testDate, 2, value1, value2);
                        if (targetDate != null && DateTime.sameDay(targetDate, testDate)) {
                            isMatch = true;
                        }
                    }
                } else if ("trimonth".equals(recurringType)) {
                    if (arrayWeek[dayOfWeek].equals(value2)) {
                        final Date targetDate =
                                getDateOfMonth(dateStart, testDate, 3, value1, value2);
                        if (targetDate != null && DateTime.sameDay(targetDate, testDate)) {
                            isMatch = true;
                        }
                    }
                }
            } catch (final Throwable e) {
                isMatch = false;
            }
        }

        return isMatch;
    }

    /**
     * Get which day in the week: 0--mon, 1--tue, 2--wed, 3--thu,4--fri,5--sat,6--sun)
     *
     * By Guo Jiang Tao
     *
     * @param String recurringRule: Recurring rule:month|bimonth|trimonth
     * @param Date dateStart: Date_start
     * @return
     */
    private Date getDateEndByRule(final String recurringRule, final Date dateStart) {
        Date dateEnd = null;
        try {
            // parse the xml format recurring rule
            final Document recordXmlDoc = new SAXReader().read(new StringReader(recurringRule));
            final Element rootElement = recordXmlDoc.getRootElement();
            final String recurringType = rootElement.attributeValue("type");
            final String value1 = rootElement.attributeValue("value1");
            final String value2 = rootElement.attributeValue("value2");
            final Calendar c = Calendar.getInstance();
            c.setTime(dateStart);
            // if the recurring type is 'day', add interval days
            if ("day".equals(recurringType)) {
                final int interval = Integer.parseInt(value1);
                c.add(Calendar.DATE, interval);
                dateEnd = c.getTime();
            }
            // if the recurring type is 'week',add 6 days
            else if ("week".equals(recurringType)) {
                for (int i = 0; i < 7; i++) {
                    c.add(Calendar.DATE, 1);
                    if (isDateMatchRecurringRule(recurringRule, dateStart, c.getTime())) {
                        break;
                    }
                }
                dateEnd = c.getTime();
            }
            // if the recurring type is 'month'|'bimonth'|'trimonth' add 1|2|3 month and get the
            // right date in the month
            else if ("month".equals(recurringType)) {
                c.add(Calendar.MONTH, 1);
                dateEnd = getDateOfMonth(dateStart, c.getTime(), 1, value1, value2);
            } else if ("bimonth".equals(recurringType)) {
                c.add(Calendar.MONTH, 2);
                dateEnd = getDateOfMonth(dateStart, c.getTime(), 2, value1, value2);
            } else if ("trimonth".equals(recurringType)) {
                c.add(Calendar.MONTH, 3);
                dateEnd = getDateOfMonth(dateStart, c.getTime(), 3, value1, value2);
            }
            c.setTime(dateEnd);
            c.add(Calendar.DATE, -1);
            dateEnd = c.getTime();
        } catch (final Throwable e) {
            dateEnd = null;
        }

        return dateEnd;
    }

    /**
     * get which day in the week: 0--mon, 1--tue, 2--wed, 3--thu,4--fri,5--sat,6--sun)
     *
     * @param date: which day to test
     * @return
     */
    private int getDayOfWeek(final Date date) {
        final Calendar c = Calendar.getInstance();
        c.setTime(date);
        int dayOfWeek = c.get(Calendar.DAY_OF_WEEK);
        dayOfWeek -= 2;
        if (dayOfWeek < 0) {
            dayOfWeek += 7;
        }
        return dayOfWeek;
    }

    /**
     * Get the date in the test month(month of testDate) that match the recurring rule
     * type:"month","bimonth","trimonth"
     *
     * By Guo Jiang Tao
     *
     * @param dateStart recurring rule --date_star
     * @param testDate testDate's month is test month
     * @param monDiff month:1, bimonth:2,trimonth:3
     * @param weekIndex '1st' || '2nd' || '3rd' || '4th' || 'last'
     * @param week "mon" || "tue" || "wed" || "thu" || "fri" || "sat" || "sun"
     * @return
     */
    private Date getDateOfMonth(final Date dateStart, final Date testDate, final int monDiff,
            final String weekIndex, final String week) {
        Date targetDate = null;
        final String[] arrayWeek = { "mon", "tue", "wed", "thu", "fri", "sat", "sun" };
        final Calendar c = Calendar.getInstance();

        c.setTime(dateStart);
        final int startMonthIndex = c.get(Calendar.MONTH);

        c.setTime(testDate);
        final int testMonthIndex = c.get(Calendar.MONTH);
        final int testYearIndex = c.get(Calendar.YEAR);

        if ((testMonthIndex - startMonthIndex) % monDiff == 0) {
            c.set(Calendar.DATE, 1);
            // get which day in the week of the first day of month
            final int weekDayMonthOne = getDayOfWeek(c.getTime());
            int index = 0;
            while (index < 7) {
                if (arrayWeek[index].equals(week)) {
                    break;
                } else {
                    index++;
                }
            }

            int addDays = index - weekDayMonthOne;
            if (addDays < 0) {
                addDays += 7;
            }

            // get 1st date of parameter 'week'
            c.add(Calendar.DATE, addDays);
            final Date daymonth1st = c.getTime();

            // get 2nd date of parameter 'week'
            c.add(Calendar.DATE, 7);
            final Date daymonth2nd = c.getTime();

            // get 3rd date of parameter 'week'
            c.add(Calendar.DATE, 7);
            final Date daymonth3rd = c.getTime();

            // get 4th date of parameter 'week'
            c.add(Calendar.DATE, 7);
            final Date daymonth4th = c.getTime();

            // get last date of parameter 'week'
            c.add(Calendar.DATE, 7);
            Date daymonthlast = c.getTime();
            if (c.get(Calendar.YEAR) > testYearIndex || (c.get(Calendar.YEAR) == testYearIndex
                    && c.get(Calendar.MONTH) > testMonthIndex)) {
                daymonthlast = daymonth4th;
            }

            if ("1st".equals(weekIndex)) {
                targetDate = daymonth1st;
            } else if ("2nd".equals(weekIndex)) {
                targetDate = daymonth2nd;
            } else if ("3rd".equals(weekIndex)) {
                targetDate = daymonth3rd;
            } else if ("4th".equals(weekIndex)) {
                targetDate = daymonth4th;
            } else if ("last".equals(weekIndex)) {
                targetDate = daymonthlast;
            }
        }

        return targetDate;
    }

    /**
     * Generate work order by pmgen record
     *
     * By Guo Jiang Tao
     *
     * @param pmgenRecord pm generate record
     * @param dateStart: Generate work order from date
     * @param dateEnd: Generate work order to date
     */
    private void generateWoByRule(final DataRecord pmgenRecord, final Date dateStart,
            final Date dateEnd) {
        final String pmType = pmgenRecord.getString("pmgen.pm_type");
        final int generateNewDate = pmgenRecord.getInt("pmgen.gen_new_pmsd");
        final int usePmGroup = pmgenRecord.getInt("pmgen.use_pm_group");
        final String groupBy = pmgenRecord.getString("pmgen.group_param");

        final String[] groupByArray = { "one_pms", "site_id", "eq_id", "eq_subcomponent", "eq_std",
                "bl_id", "fl_id", "rm_id", "tr_id", "pmp_id" };
        int groupByIndex = 0;
        while (groupByIndex < groupByArray.length) {
            if (groupByArray[groupByIndex].equals(groupBy)) {
                break;
            } else {
                groupByIndex++;
            }
        }

        final String pmsidRestriction = getPmsIdRestriction(pmgenRecord);

        boolean useGroupingCodes = false;
        if (usePmGroup == 1) {
            useGroupingCodes = true;
        }
        if (generateNewDate == 1) {
            final PmScheduleGenerator pmsGenerator =
                    new PmScheduleGenerator(dateStart, dateEnd, pmsidRestriction, true);
            pmsGenerator.run();
        }

        final PmWorkOrderGenerator woGenerator = new PmWorkOrderGenerator(pmType, dateStart,
            dateEnd, groupByIndex, useGroupingCodes, pmsidRestriction, null);
        woGenerator.run();
    }

    /**
     * Get pms restriction from pmgen record
     *
     * By Guo Jiang Tao
     *
     * @param DataRecord pmgenRecord,pmgen table record
     * @return
     *
     */
    private String getPmsIdRestriction(final DataRecord pmgenRecord) {
        final String pmType = pmgenRecord.getString("pmgen.pm_type");
        final String siteId = pmgenRecord.getString("pmgen.site_id");
        final String blId = pmgenRecord.getString("pmgen.bl_id");
        final String flId = pmgenRecord.getString("pmgen.fl_id");
        final String pmGroup = pmgenRecord.getString("pmgen.pm_group");
        final String trId = pmgenRecord.getString("pmgen.tr_id");

        String pmpType = "EQ";
        if ("HSPM".equals(pmType)) {
            pmpType = "HK";
        }

        String pmsidRestriction =
                "EXISTS (SELECT 1 FROM pmp WHERE pmp.pmp_id = pms.pmp_id AND pmp.pmp_type = '"
                        + pmpType + "'" + ")";

        if (siteId != null) {
            pmsidRestriction +=
                    "AND EXISTS (SELECT 1 FROM pms ${sql.as} pms1 LEFT JOIN pmp ON pms1.pmp_id = pmp.pmp_id LEFT OUTER JOIN eq "
                            + " ON pms1.eq_id = eq.eq_id WHERE pms1.pms_id = pms.pms_id AND ((pmp.pmp_type = 'EQ' AND eq.site_id = '"
                            + siteId + "'" + ") OR (" + " pmp.pmp_type = 'HK' AND pms.site_id= '"
                            + siteId + "')))";
        }

        if (blId != null) {
            pmsidRestriction +=
                    " AND EXISTS (SELECT 1 FROM pms ${sql.as} pms2 LEFT JOIN pmp ON pms2.pmp_id = pmp.pmp_id LEFT OUTER JOIN eq "
                            + " ON pms2.eq_id = eq.eq_id WHERE pms2.pms_id = pms.pms_id AND ((pmp.pmp_type = 'EQ' AND eq.bl_id = '"
                            + blId + "'" + ") OR (" + " pmp.pmp_type = 'HK' AND pms.bl_id= '" + blId
                            + "')))";
        }

        if (flId != null) {
            pmsidRestriction +=
                    " AND EXISTS (SELECT 1 FROM pms ${sql.as} pms3 LEFT JOIN pmp ON pms3.pmp_id = pmp.pmp_id LEFT OUTER JOIN eq "
                            + " ON pms3.eq_id = eq.eq_id WHERE pms3.pms_id = pms.pms_id AND ((pmp.pmp_type = 'EQ' AND eq.fl_id = '"
                            + flId + "'" + ") OR (" + " pmp.pmp_type = 'HK' AND pms.fl_id= '" + flId
                            + "')))";
        }

        if (pmGroup != null) {
            pmsidRestriction += " AND pms.pm_group = '" + pmGroup + "'";
        }

        if (trId != null) {
            pmsidRestriction +=
                    " AND EXISTS (SELECT 1 FROM pmp WHERE pmp.pmp_id = pms.pmp_id AND pmp.tr_id = '"
                            + trId + "'" + ")";
        }

        return pmsidRestriction;
    }

    // ---------------------------------------------------------------------------------------------
    // BEGIN isDateStartMatchRule WFR
    // ---------------------------------------------------------------------------------------------

    /**
     * judge wheter the given start date match the given recurring rule.
     *
     * By Guo Jiang Tao
     *
     * @param recurringRule: Recurring rule
     * @param dateStart1: Start date
     */
    public void isDateStartMatchRule(final String recurringRule, final String dateStart1) {
        boolean isDateStartMatchRule = true;
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final SimpleDateFormat dateFormat = new SimpleDateFormat();
        dateFormat.applyPattern("yyyy-MM-dd");
        try {
            final Date dateStart = dateFormat.parse(dateStart1);
            isDateStartMatchRule = isDateMatchRecurringRule(recurringRule, dateStart, dateStart);
        } catch (final Throwable e) {
            isDateStartMatchRule = false;
        }

        context.addResponseParameter("jsonExpression", Boolean.toString(isDateStartMatchRule));
    }

    // ---------------------------------------------------------------------------------------------
    // END isDateStartMatchRule WFR
    // ---------------------------------------------------------------------------------------------

    // ---------------------------------------------------------------------------------------------
    // BEGIN openPrintWosPaginatedReport WFR
    // ---------------------------------------------------------------------------------------------

    /**
     * open print work orders paginated report--not consolidated.
     *
     * By Guo Jiang Tao
     *
     * @param woIdList: Workoder id JSONArray
     * @param viewName: View name
     */
    public void openPrintWosPaginatedReport(final JSONArray woIdList, final String viewName) {
        // convert workflow rule
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final PmPaginatedReportGenerator pmPaginatedReportGeneratornew =
                new PmPaginatedReportGenerator(viewName, woIdList);
        startJob(context, pmPaginatedReportGeneratornew);
    }

    // ---------------------------------------------------------------------------------------------
    // END openPrintWosPaginatedReport WFR
    // ---------------------------------------------------------------------------------------------

    // ---------------------------------------------------------------------------------------------
    // BEGIN generateScheduleDateAndForecastPM52Week WFR
    // ---------------------------------------------------------------------------------------------

    /**
     * This method serve as a WFR to do one of forecasts for: Procedure Weekly, Equipment Weekly,
     * Trade Weekly or Trade Monthly. Only for PM Schedules restricted by date range and other
     * condition comes from JS client.
     *
     * By GuoJiangtao
     *
     * @param String dateFrom: From date value in string format
     * @param String dateTo: To date value in string format
     * @param String pmsidRestriction: restriction passed from js client for pms table
     * @param String forecastResourceType: Forecast Resource Type
     */
    public void generateScheduleDateAndForecastPM52Week(final String dateFrom, final String dateTo,
            final String pmsidRestriction, final String forecastResourceType)
                    throws ExceptionBase, ParseException {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        context.addResponseParameter("dateFrom", dateFrom);
        context.addResponseParameter("dateTo", dateTo);
        if (!isDateRangeParameterValid(context)) {
            handlerDateRangeError(context);
        }
        // Retrieve parameters come from JS client
        final SimpleDateFormat dateFormat = new SimpleDateFormat();
        dateFormat.applyPattern("yyyy-MM-dd");
        final Date dateStart = dateFormat.parse(dateFrom);
        final Date dateEnd = dateFormat.parse(dateTo);

        if (this.log.isDebugEnabled()) {
            this.log.debug(MessageFormat.format(
                "Run forecastPM52Week workflow rule for resource [{0}], from  [{1}] to [{2}].",
                new Object[] { forecastResourceType, dateFrom, dateTo }));
        }

        final PmScheduleGenerator dateGenerator =
                new PmScheduleGenerator(dateStart, dateEnd, pmsidRestriction, true);

        String monthsBetweenSqlStr = "", weeksBetweenSqlStr = "";
        // Construct week between and month between SQL strings for three different databases
        if (isOracle(context)) {
            weeksBetweenSqlStr =
                    " TRUNC (date_todo - TO_DATE('" + notNull(dateFrom) + "', 'YYYY-MM-DD'))";

            monthsBetweenSqlStr = " TRUNC(MONTHS_BETWEEN(date_todo,TO_DATE('" + notNull(dateFrom)
                    + "', 'YYYY-MM-DD')))";

        } else {
            monthsBetweenSqlStr = formatSqlMonthsBetween(context, dateFrom, "date_todo");

            weeksBetweenSqlStr =
                    formatSqlWeeksBetween(context, dateFrom, "date_todo").replaceAll("wk", "day");

        }

        // Call ForecastDatesGenerator to create forecast records in database.
        final ForecastDatesGenerator forecastGenerator =
                new ForecastDatesGenerator(forecastResourceType, pmsidRestriction,
                    formatSqlIsoToNativeDate(context, notNull(dateFrom)),
                    formatSqlIsoToNativeDate(context, notNull(dateTo)), monthsBetweenSqlStr,
                    weeksBetweenSqlStr, dateGenerator);

        startJob(context, forecastGenerator);
        // ---------------------------------------------------------------------------------------------
        // END generateScheduleDateAndForecastPM52Week WFR
        // ---------------------------------------------------------------------------------------------

    }

    // ---------------------------------------------------------------------------------------------
    // BEGIN generateScheduleDateAndForecastPMResources WFR
    // ---------------------------------------------------------------------------------------------

    /**
     * This method serve as a WFR to forecast one type of required resource of : trade, part, tools
     * or all three. Only for PM Schedules restricted by date range and other condition comes from
     * JS client.
     *
     * By GuoJiangtao
     *
     * @param String dateFrom: From date value in string format
     * @param String dateTo: To date value in string format
     * @param String pmsidRestriction: restriction passed from js client for pms table
     * @param String forecastResourceType: Forecast Resource Type
     */
    public void generateScheduleDateAndForecastPMResources(final String dateFrom,
            final String dateTo, final String forecastResourceType, final String pmsidRestriction)
                    throws ExceptionBase, ParseException {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        context.addResponseParameter("dateFrom", dateFrom);
        context.addResponseParameter("dateTo", dateTo);
        if (!isDateRangeParameterValid(context)) {
            handlerDateRangeError(context);
        }
        // Retrieve parameters come from JS client
        final SimpleDateFormat dateFormat = new SimpleDateFormat();
        dateFormat.applyPattern("yyyy-MM-dd");
        final Date dateStart = dateFormat.parse(dateFrom);
        final Date dateEnd = dateFormat.parse(dateTo);

        if (this.log.isDebugEnabled()) {
            this.log.debug(MessageFormat.format(
                "Run forecastPM52Week workflow rule for resource [{0}], from  [{1}] to [{2}].",
                new Object[] { forecastResourceType, dateFrom, dateTo }));
        }

        final PmScheduleGenerator dateGenerator =
                new PmScheduleGenerator(dateStart, dateEnd, pmsidRestriction, true);

        // Retrive the date range parameter
        final String dateFromNative =
                formatSqlIsoToNativeDate(context, notNull(context.getParameter("dateFrom")));
        final String dateToNative =
                formatSqlIsoToNativeDate(context, notNull(context.getParameter("dateTo")));
        // If the date range is not valid, return.

        if (this.log.isDebugEnabled()) {
            this.log.debug(MessageFormat.format(
                "Run forecastPMResources workflow rule for resource [{0}], from  [{1}] to [{2}].",
                new Object[] { forecastResourceType, dateFromNative, dateToNative }));
        }

        // Call ForecastDatesGenerator to create forecast records in database.
        final ForecastDatesGenerator forecastGenerator =
                new ForecastDatesGenerator(forecastResourceType, pmsidRestriction, dateFromNative,
                    dateToNative, null, null, dateGenerator);

        startJob(context, forecastGenerator);

        // ---------------------------------------------------------------------------------------------
        // END generateScheduleDateAndForecastPMResources WFR
        // ---------------------------------------------------------------------------------------------

    }

    /**
     * Create multiple Procedures and Schedules for equipments.
     *
     * Added for 21.2 Easy PM By Zhang Yi
     *
     * @param String intervalType interval type
     * @param int interval1 interval
     * @param String dateFirstToDo Date First Todo
     * @param List eqIds equipment ids
     */
    public void createEquipmentSchedules(final String intervalType, final int interval1,
            final String dateFirstToDo, final List<String> eqIds) {

        final EasyPreventiveMaintenanceHandler easyPm = new EasyPreventiveMaintenanceHandler();
        easyPm.createEquipmentSchedules(intervalType, interval1, dateFirstToDo, eqIds);

    }

}

/**
 * Generate print work orders paginated report for existing format( not Consolidated Report Format).
 *
 * By Guo Jiang Tao
 */
class PmPaginatedReportGenerator extends JobBase {
    private final JSONArray woIdList;

    // GUO added 2009-09-15 to fix KB3024475
    private final String viewName;

    // @translatable
    private String DOC_TITLE = "Work Order";

    // @translatable
    private String JOB_TITLE = "Work Order Details";

    private DocumentDao documentDao;

    public PmPaginatedReportGenerator(final String viewName, final JSONArray woIdList) {
        this.viewName = viewName;
        this.woIdList = woIdList;

        // add to fix KB3028504
        this.DOC_TITLE = EventHandlerBase.localizeString(ContextStore.get().getCurrentContext(),
            this.DOC_TITLE,
            "com.archibus.eventhandler.prevmaint.PreventiveMaintenanceCommonHandler");

        this.JOB_TITLE = EventHandlerBase.localizeString(ContextStore.get().getCurrentContext(),
            this.JOB_TITLE,
            "com.archibus.eventhandler.prevmaint.PreventiveMaintenanceCommonHandler");
    }

    @Override
    public void run() {
        this.status.setTotalNumber(100);
        this.status.setCurrentNumber(20);
        this.status.setResult(new JobResult(this.JOB_TITLE));
        final PaginatedReportsBuilder builder = new PaginatedReportsBuilder();
        final List<String> files = new ArrayList<String>();
        final com.archibus.context.Context context = ContextStore.get();
        // generating files by woId
        if (this.woIdList != null) {
            // Guo added 2010-09-03 to fix KB3026844: Print attached documents when printing PM and
            // On Demand Work Requests
            // download all related '.doc' or '.docx' type document at one time
            downLoadRelatedProcedureDocument(this.woIdList);

            for (int i = 0; i < this.woIdList.length(); i++) {
                final String woId = this.woIdList.get(i).toString();
                final Map<String, Object> woResctriction = new HashMap<String, Object>();
                woResctriction.put("woWoId", woId);
                final com.archibus.ext.report.docx.Report report =
                        new com.archibus.ext.report.docx.Report();
                report.setTitle(this.DOC_TITLE + ": " + woId);
                report.setPatameters(woResctriction);
                builder.buildDocxFromView(context, report, this.viewName, null);
                files.add(report.getFileFullName());
                // Guo added 2010-09-03 to fix KB3026844: Print attached documents when printing PM
                // and On Demand Work Requests
                // merge the pre-download document to paginated reprot
                addProcedureDocument(files, woId);
                if (i == Math.rint(this.woIdList.length() / 3)) {
                    this.status.setCurrentNumber(40);
                }
                if (i == Math.rint(this.woIdList.length() * 2 / 3)) {
                    this.status.setCurrentNumber(60);
                }
            }

            this.status.setCurrentNumber(80);

            if (files.size() > 0) {
                // merge into one file per 100 partial files
                mergeFiles(files);
            }

            this.status.setCurrentNumber(100);
        }

        this.status.setCode(JobStatus.JOB_COMPLETE);
    }

    /**
     * merge to one file for per 100 work orders.
     *
     * By GuoJiangtao
     *
     * @param List<String> files
     */
    private void mergeFiles(final List<String> files) {
        final com.archibus.context.Context context = ContextStore.get();
        final Date currentDate = new Date();
        final SimpleDateFormat dateFormat = new SimpleDateFormat();
        dateFormat.applyPattern("yyyy-MM-dd");
        final String dateString = dateFormat.format(currentDate);
        if (files.size() <= 100) {
            final String fileName = "Work-Orders-" + dateString + ".docx";
            final String finalFileFullname =
                    ReportUtility.getReportFilesStorePath(context) + fileName;
            ReportUtility.appendDocxFiles(files, finalFileFullname);
            this.status.setResult(new JobResult(this.JOB_TITLE, fileName, context.getContextPath()
                    + ReportUtility.getPerUserReportFilesPath(context) + fileName));
        } else {
            final List<String> partialFiles = new ArrayList<String>();
            int index = 1;
            for (int i = 0; i < files.size(); i++) {
                if (partialFiles.size() == 100) {
                    final String fileName = "Work-Orders-" + dateString + "-part" + index + ".docx";
                    final String finalFileFullname =
                            ReportUtility.getReportFilesStorePath(context) + fileName;
                    ReportUtility.appendDocxFiles(partialFiles, finalFileFullname);
                    this.status
                        .addPartialResult(new JobResult("", fileName, context.getContextPath()
                                + ReportUtility.getPerUserReportFilesPath(context) + fileName));
                    partialFiles.clear();
                    index++;
                }

                partialFiles.add(files.get(i));
            }

            if (partialFiles.size() > 0) {
                final String fileName = "Work-Orders-" + dateString + "-part" + index + ".docx";
                final String finalFileFullname =
                        ReportUtility.getReportFilesStorePath(context) + fileName;
                ReportUtility.appendDocxFiles(partialFiles, finalFileFullname);
                this.status.addPartialResult(new JobResult("", fileName, context.getContextPath()
                        + ReportUtility.getPerUserReportFilesPath(context) + fileName));
            }
        }
    }

    /**
     * This method desingned to fix KB3026844: Print attached documents when printing PM and On
     * Demand Work Requests. download all procedure document which related the selected work orders
     * one time
     *
     * By GuoJiangtao
     *
     * @param JSONArray woIdList : the selected work orders list
     */
    private void downLoadRelatedProcedureDocument(final JSONArray woIdList) {
        // create woIdListString which like (7777,8888,9999)
        String woIdListString = "";
        for (int i = 0; i < woIdList.length(); i++) {
            woIdListString += "," + woIdList.get(i).toString();
        }
        woIdListString = "(" + woIdListString.substring(1) + ")";

        // get the matching procedure and document
        final String sql =
                "SELECT pmp_id , doc  FROM pmp WHERE pmp.doc IS NOT NULL AND EXISTS (SELECT 1 FROM wr WHERE wr.pmp_id= pmp.pmp_id AND wr.wo_id IN "
                        + woIdListString + ")";
        final List<DataRecord> records =
                SqlUtils.executeQuery("pmp", new String[] { "pmp_id", "doc" }, sql);

        for (final DataRecord record : records) {
            final String pmpId = record.getString("pmp.pmp_id");
            final String docName = record.getString("pmp.doc");
            // if the document's extension is '.doc' or '.docx', it will be download the reprot
            // files stored folder of the current user
            if (docName.indexOf(".doc") != -1) {
                byte[] buffer = null;

                // download the document
                final Map<String, String> keys = new HashMap<String, String>();
                keys.put("pmp_id", pmpId);
                final String fieldName = "doc";
                final String tableName = "pmp";
                final String newLockStatus = "0";
                final String version = getLastestDocumentVersion(tableName, fieldName, pmpId);
                buffer = checkOutDocument(docName, keys, fieldName, tableName, newLockStatus,
                    version);
                // save the document
                final String destinationFileWholeName =
                        ReportUtility.getReportFilesStorePath(ContextStore.get()) + docName;
                FileUtil.deleteFile(destinationFileWholeName);
                FileUtil.saveAs(buffer, destinationFileWholeName);
            }
        }

        // SqlUtils.commit();
    }

    /**
     * This method desingned to fix KB3026844: Print attached documents when printing PM and On
     * Demand Work Requests. Add related procedure document to work order printed document
     *
     * By GuoJiangtao
     *
     * @param List<String> files: the printed files list which will merge to one document
     * @param String woId: selected work order code
     */
    private void addProcedureDocument(final List<String> files, final String woId) {
        // get the matching procedure and document
        final String sql =
                "SELECT pmp_id , doc  FROM pmp WHERE pmp.doc IS NOT NULL AND EXISTS (SELECT 1 FROM wr WHERE wr.pmp_id= pmp.pmp_id AND wr.wo_id = "
                        + woId + ")";
        final List<DataRecord> records =
                SqlUtils.executeQuery("pmp", new String[] { "pmp_id", "doc" }, sql);

        String destinationFileWholeName = "";
        for (final DataRecord record : records) {
            record.getString("pmp.pmp_id");
            final String docName = record.getString("pmp.doc");
            // if the document's extension is '.doc' or '.docx', add the document to the paginated
            // report
            if (docName.indexOf(".doc") != -1) {
                destinationFileWholeName =
                        ReportUtility.getReportFilesStorePath(ContextStore.get()) + docName;
                files.add(destinationFileWholeName);
            }
        }
    }

    /**
     * get the latest version of the document.
     *
     * By GuoJiangtao
     *
     * @param String tableName.
     * @param String fieldName.
     * @param String pkey primary key.
     * @throws ExceptionBase If failed.
     */
    private String getLastestDocumentVersion(final String tableName, final String fieldName,
            final String pkey) throws ExceptionBase {
        String lastestVersion = "";

        try {
            String sql =
                    "SELECT MAX(version)  ${sql.as}  version FROM afm_docvers WHERE afm_docvers.table_name = '"
                            + tableName + "'";
            sql += " AND afm_docvers.field_name = '" + fieldName + "'";
            sql += " AND afm_docvers.pkey_value = '" + pkey + "'";
            final List<DataRecord> records =
                    SqlUtils.executeQuery("afm_docvers", new String[] { "version" }, sql);
            if (records.size() > 0) {
                lastestVersion = String.valueOf(records.get(0).getInt("afm_docvers.version"));
            }
        } catch (final Exception e) {
            throw new ExceptionBase(null, "Get lastest version of document error", e);
        }

        return lastestVersion;
    }

    /**
     * Checkout document from WebCentral document management repository.
     *
     * By GuoJiangtao
     *
     * @param fileName File name of the document.
     * @param keys Primary keys of the document in the inventory table.
     * @param fieldName Field name in the inventory table.
     * @param tableName Inventory table name.
     * @param newLockStatus New lock status, to be set after the checkout.
     * @param version Version of the document to checkout.
     * @return buffer with the document content.
     * @throws ExceptionBase If checkout failed.
     */
    private byte[] checkOutDocument(final String fileName, final Map<String, String> keys,
            final String fieldName, final String tableName, final String newLockStatus,
            final String version) throws ExceptionBase {
        final FileTransfer fileTransfer = this.getDocumentDao().checkOut(keys, tableName, fieldName,
            newLockStatus, false, fileName, version);
        final OutputStreamLoader outputStreamLoader = fileTransfer.getOutputStreamLoader();

        // read bytes from the input stream
        try {
            final ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            outputStreamLoader.load(outputStream);
            return outputStream.toByteArray();
        } catch (final IOException e) {
            throw new ExceptionBase(null, "Could not read InputStream", e);
        }
    }

    /**
     * get bean DocumentDao
     *
     * By GuoJiangtao
     *
     */
    private DocumentDao getDocumentDao() {

        if (this.documentDao == null) {
            this.documentDao = new DocumentDaoImpl();
        }

        return this.documentDao;
    }
}
