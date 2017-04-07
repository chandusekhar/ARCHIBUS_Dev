package com.archibus.service.common;

import java.text.ParseException;
import java.util.*;

import org.json.JSONArray;

import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.ExceptionBase;

public class ActionService extends EventHandlerBase {

    /**
     * enable db exceptions for testing.
     */
    final static boolean THROWEXCEPTION = false;

    /**
     * Updates the date_scheduled_end, from the date_scheduled and duration for a selected
     * activity_log record.
     *
     * @param context Description of the Parameter
     *
     */
    public void calcActivityLogDateSchedEndForActivity(final EventHandlerContext context) {

        final String activity_log_id = (String) context.getParameter("activity_log_id");

        if (this.log.isDebugEnabled()) {
            this.log.debug("CalcActivityLogDateSchedEndForActivity");
        }

        String days = " (SELECT days_per_week FROM work_pkgs WHERE work_pkgs.project_id = activity_log.project_id AND work_pkgs.work_pkg_id = activity_log.work_pkg_id )";
        String updateSQL = updateDateStatement(context, days, false);
        // UPDATE statement for activity_logs WITH work_pkgs
        String where = " WHERE activity_log_id = " + activity_log_id;

        executeDbSql(context, updateSQL + where, THROWEXCEPTION);

        days = " (SELECT days_per_week FROM project WHERE project.project_id = activity_log.project_id )";
        updateSQL = updateDateStatement(context, days, false);
        // UPDATE statement for activity_logs WITHOUT work_pkgs
        where = " WHERE activity_log_id  = " + activity_log_id + " AND work_pkg_id IS NULL ";

        executeDbSql(context, updateSQL + where, THROWEXCEPTION);

    }

    /**
     * CalcActivityLogDateSchedEndForWorkPkg rule Updates the date_scheduled_end, from the
     * date_scheduled and duration for all activity_log records for a work_pkg.
     *
     * @param context Description of the Parameter
     * @param response Description of the Parameter
     *
     */
    public void calcActivityLogDateSchedEndForWorkPkg(final EventHandlerContext context) {

        final String project_id = (String) context.getParameter("project_id");
        final String work_pkg_id = (String) context.getParameter("work_pkg_id");

        final Integer days_per_week = (Integer) selectDbValue(context, "work_pkgs",
            "days_per_week", "project_id =" + literal(context, project_id) + " AND work_pkg_id = "
                    + literal(context, work_pkg_id));

        if (days_per_week != null) {
            final String days = days_per_week.toString();
            final String updateSQL = updateDateStatement(context, days, false);
            // UPDATE statement for activity_logs WITH work_pkgs
            final String where = " WHERE project_id = " + literal(context, project_id)
                    + " AND work_pkg_id = " + literal(context, work_pkg_id);

            executeDbSql(context, updateSQL + where, THROWEXCEPTION);
        }
    }

    /**
     * calcActivityLogDateSchedEndForProject rule Updates the date_scheduled_end, from the
     * date_scheduled and duration for all activity_log records for a Project.
     *
     * @param context Description of the Parameter
     * @param response Description of the Parameter
     * @throws ParseException json parse exception
     * @throws ExceptionBase exception
     *
     */
    public void calcActivityLogDateSchedEndForProject(final EventHandlerContext context)
            throws ExceptionBase, ParseException {

        /*
         * CalcActivityLogDateSchedEndForProject: Purpose: Called From: Passed Parameters:
         * {project_id} Test Data: {project_id} = BUILD-HQ-NEW SQL Statements: // Get all work_pkgs
         * for a project: rs.work_pkgs = SELECT project_id, work_pkg_id FROM work_pkgs WHERE
         * project_id = {project_id}
         *
         * // Loop over each record in the above record set and call
         * CalcActivityLogDateSchedEndForWorkPkg() For each {work_pkg_id}
         * CalcActivityLogDateSchedEndForWorkPkg( {project_id}, ) Next work_pkg_id
         */
        
        String project_id_value = (String) context.getParameter("project_id");
        // allow for no specified project_id
        project_id_value = "%" + project_id_value + "%";
        project_id_value = literal(context, project_id_value);

        //KB3049056
        boolean isMultipleValues = false;
        if (context.parameterExists("isMultiple")) {
            isMultipleValues =  Boolean.valueOf((String) context.getParameter("isMultiple"));
        }
        if (isMultipleValues) {
            final JSONArray projectIds = new JSONArray((String) context.getParameter("project_id"));
            project_id_value = projectIds.join("','");
        }

        
        List<Object[]> records = new ArrayList<Object[]>();
        if(isMultipleValues) {
            records = selectDbRecords(context, "work_pkgs", new String[] { "project_id", "work_pkg_id" },
                "project_id IN ('" + project_id_value + "')");
        }else {
            records = selectDbRecords(context, "work_pkgs", new String[] { "project_id",
                            "work_pkg_id" }, "project_id lIKE " + project_id_value);
        }

        for (final Object[] name : records) {
            final Object[] record = name;
            final String project_id = (String) record[0];
            final String work_pkg_id = (String) record[1];
            {
                // final String days_per_week = "5";
                final Integer days_per_week = (Integer) selectDbValue(context, "work_pkgs",
                    "days_per_week", "project_id =" + literal(context, project_id)
                    + " AND work_pkg_id = " + literal(context, work_pkg_id));

                final String days = days_per_week.toString();
                final String updateSQL = updateDateStatement(context, days, false);
                // UPDATE statement for activity_logs WITH work_pkgs
                final String where = " WHERE project_id = " + literal(context, project_id)
                        + " AND work_pkg_id = " + literal(context, work_pkg_id);

                executeDbSql(context, updateSQL + where, THROWEXCEPTION);
            }
        }

        final String days = " (SELECT days_per_week FROM project WHERE project.project_id = activity_log.project_id )";
        final String updateSQL = updateDateStatement(context, days, false);
        // UPDATE statement for activity_logs WITHOUT work_pkgs
        final String where = isMultipleValues? " WHERE project_id IN ('" + project_id_value + "') AND work_pkg_id IS NULL ": " WHERE project_id LIKE " + project_id_value + " AND work_pkg_id IS NULL ";

        executeDbSql(context, updateSQL + where, THROWEXCEPTION);
    }

    /**
     * CalcActivityLogDatePlannedEndForActivity Updates the date_scheduled_end, from the
     * date_scheduled and duration for a selected activity_log record
     *
     * @param context Description of the Parameter
     * @param response Description of the Parameter
     *
     */
    public void calcActivityLogDatePlannedEndForActivity(final EventHandlerContext context) {

        final String activity_log_id = (String) context.getParameter("activity_log_id");

        if (this.log.isDebugEnabled()) {
            this.log.debug("CalcActivityLogDatePlannedEndForActivity");
        }

        String days = "(SELECT days_per_week FROM work_pkgs WHERE work_pkgs.work_pkg_id = activity_log.work_pkg_id )";
        String updateSQL = updateDateStatement(context, days, true);
        // UPDATE statement for activity_logs WITH work_pkgs
        String where = " WHERE activity_log_id = " + activity_log_id;

        executeDbSql(context, updateSQL + where, THROWEXCEPTION);

        days = "(SELECT days_per_week FROM project WHERE project.project_id = activity_log.project_id )";
        updateSQL = updateDateStatement(context, days, true);
        // UPDATE statement for activity_logs WITHOUT work_pkgs
        where = " WHERE activity_log_id = " + activity_log_id + " AND work_pkg_id IS NULL ";

        executeDbSql(context, updateSQL + where, THROWEXCEPTION);

    }

    /**
     * CalcActivityLogDatePlannedEndForWorkPkg rule Updates the date_scheduled_end, from the
     * date_scheduled and duration for all activity_log records for a work_pkg.
     *
     * @param context Description of the Parameter
     *
     */
    public void calcActivityLogDatePlannedEndForWorkPkg(final EventHandlerContext context) {

        /*
         * {days_per_week} = SELECT days_per_week FROM work_pkgs WHERE project_id = {project_id} AND
         * work_pkg_id = {work_pkg_id}
         */
        
        final String project_id = (String) context.getParameter("project_id");
        final String work_pkg_id = (String) context.getParameter("work_pkg_id");

        final Integer days_per_week = (Integer) selectDbValue(context, "work_pkgs",
            "days_per_week", "project_id =" + literal(context, project_id) + " AND work_pkg_id = "
                    + literal(context, work_pkg_id));

        final String days = days_per_week.toString();
        final String updateSQL = updateDateStatement(context, days, true);
        // UPDATE statement for activity_logs WITH work_pkgs
        final String where = " WHERE project_id = " + literal(context, project_id)
                + " AND work_pkg_id = " + literal(context, work_pkg_id);

        executeDbSql(context, updateSQL + where, THROWEXCEPTION);

    }

    /**
     * CalcActivityLogDatePlannedEndForProject rule Updates the date_scheduled_end, from the
     * date_scheduled and duration for all activity_log records for a Project.
     *
     * @param context Description of the Parameter
     * @param response Description of the Parameter
     *
     */
    public void calcActivityLogDatePlannedEndForProject(final EventHandlerContext context) {

        String project_id_value = (String) context.getParameter("project_id");
        // allow for no specified project_id
        project_id_value = "%" + project_id_value + "%";
        project_id_value = literal(context, project_id_value);

        final List<Object[]> records =
                selectDbRecords(context, "work_pkgs", new String[] { "project_id", "work_pkg_id" },
                    "project_id LIKE " + project_id_value);

        for (final Object[] name : records) {
            final Object[] record = name;
            final String project_id = (String) record[0];
            final String work_pkg_id = (String) record[1];
            {
                // final String days_per_week = "5";
                final Integer days_per_week = (Integer) selectDbValue(context, "work_pkgs",
                    "days_per_week", "project_id =" + literal(context, project_id)
                    + " AND work_pkg_id = " + literal(context, work_pkg_id));

                final String days = days_per_week.toString();
                final String updateSQL = updateDateStatement(context, days, true);
                // UPDATE statement for activity_logs WITH work_pkgs
                final String where = " WHERE project_id = " + literal(context, project_id)
                        + " AND work_pkg_id = " + literal(context, work_pkg_id);

                executeDbSql(context, updateSQL + where, THROWEXCEPTION);
            }
        }

        final String days = "(SELECT days_per_week FROM project WHERE project.project_id = activity_log.project_id )";
        final String updateSQL = updateDateStatement(context, days, true);
        // UPDATE statement for activity_logs WITHOUT work_pkgs
        final String where = " WHERE project_id LIKE " + project_id_value + " AND work_pkg_id IS NULL ";

        executeDbSql(context, updateSQL + where, THROWEXCEPTION);

    }

    /**
     * updateDateStatement rule
     *
     * @param context Description of the Parameter
     * @param days Sub-query to get number of days or number
     * @param planned Planned or scheduled
     *
     */
    public String updateDateStatement(final EventHandlerContext context, final String days, final boolean planned) {

        if (this.log.isDebugEnabled()) {
            this.log.debug("updateDateStatement");
        }

        String update = "";

        // ////////////////////////////////////////////////////////
        // ////// SYBASE ////////////////////////////////////
        // ////////////////////////////////////////////////////////

        if (isSybase(context)) {

            if (planned) {
                update = " UPDATE activity_log " + " SET  date_planned_end = "
                        + "(CASE	WHEN DATEPART(WEEKDAY, date_planned_for) = 1 AND  "
                        + days
                        + "  <> 7 "
                        + " THEN "
                        + "(CASE  WHEN 	MOD( (CASE duration_est_baseline WHEN 0 THEN 1 ELSE duration_est_baseline END),  "
                        + days
                        + " ) = 0 "
                        + " THEN 	date_planned_for + 1 + (CASE duration_est_baseline WHEN 0 THEN 1 ELSE duration_est_baseline END) + ((((CASE duration_est_baseline WHEN 0 THEN 1 ELSE duration_est_baseline END) /  "
                        + days
                        + " ) - 1) * (7 -  "
                        + days
                        + " )) - 1 "
                        + " ELSE 	date_planned_for + 1 + (CASE duration_est_baseline WHEN 0 THEN 1 ELSE duration_est_baseline END) + (((CASE duration_est_baseline WHEN 0 THEN 1 ELSE duration_est_baseline END) /  "
                        + days
                        + " ) * (7 -  "
                        + days
                        + " )) - 1 "
                        + " END) "
                        + " ELSE "
                        + " (CASE 	WHEN 	MOD( (CASE duration_est_baseline WHEN 0 THEN 1 ELSE duration_est_baseline END),  "
                        + days
                        + " ) = 0 "
                        + " THEN "
                        + "  (CASE 	WHEN 	(DATEPART(WEEKDAY, (date_planned_for +  "
                        + days
                        + "  - 1)) > ( "
                        + days
                        + "  + 1)  OR "
                        + "  DATEPART(WEEKDAY, (date_planned_for +  "
                        + days
                        + "  - 1)) < DATEPART(WEEKDAY, date_planned_for)) "
                        + "  THEN date_planned_for + (CASE duration_est_baseline WHEN 0 THEN 1 ELSE duration_est_baseline END) + ((((CASE duration_est_baseline WHEN 0 THEN 1 ELSE duration_est_baseline END) /  "
                        + days
                        + " ) - 1) * (7 -  "
                        + days
                        + " )) + (7- "
                        + days
                        + " ) - 1 "
                        + "   ELSE date_planned_for + (CASE duration_est_baseline WHEN 0 THEN 1 ELSE duration_est_baseline END) + ((((CASE duration_est_baseline WHEN 0 THEN 1 ELSE duration_est_baseline END) /  "
                        + days
                        + " ) - 1) * (7 -  "
                        + days
                        + " )) - 1 "
                        + "   END) "
                        + "   ELSE "
                        + "  (CASE 	WHEN 	(DATEPART(WEEKDAY, (date_planned_for + MOD( (CASE duration_est_baseline WHEN 0 THEN 1 ELSE duration_est_baseline END),  "
                        + days
                        + " ) - 1)) > ( "
                        + days
                        + "  + 1)  OR "
                        + "  DATEPART(WEEKDAY, (date_planned_for + MOD( (CASE duration_est_baseline WHEN 0 THEN 1 ELSE duration_est_baseline END),  "
                        + days
                        + " ) - 1)) < DATEPART(WEEKDAY,  date_planned_for)) "
                        + "  THEN date_planned_for + (CASE duration_est_baseline WHEN 0 THEN 1 ELSE duration_est_baseline END) + (((CASE duration_est_baseline WHEN 0 THEN 1 ELSE duration_est_baseline END) /  "
                        + days
                        + " ) * (7 -  "
                        + days
                        + " )) + (7- "
                        + days
                        + " ) - 1 "
                        + "  ELSE date_planned_for + (CASE duration_est_baseline WHEN 0 THEN 1 ELSE duration_est_baseline END) + (((CASE duration_est_baseline WHEN 0 THEN 1 ELSE duration_est_baseline END) /  "
                        + days
                        + " ) * (7 -  "
                        + days
                        + " )) - 1 "
                        + "  END) "
                        + "  END) "
                        + "  END)";
            } else {
                update = " UPDATE activity_log " + " SET  date_scheduled_end = "
                        + "(CASE	WHEN DATEPART(WEEKDAY, date_scheduled) = 1 AND "
                        + days
                        + " <> 7 "
                        + " THEN "
                        + "(CASE 	WHEN 	MOD( (CASE duration WHEN 0 THEN 1 ELSE duration END), "
                        + days
                        + ") = 0 "
                        + " THEN 	date_scheduled + 1 + (CASE duration WHEN 0 THEN 1 ELSE duration END) + ((((CASE duration WHEN 0 THEN 1 ELSE duration END) / "
                        + days
                        + ") - 1) * (7 - "
                        + days
                        + ")) - 1 "
                        + " ELSE 	date_scheduled + 1 + (CASE duration WHEN 0 THEN 1 ELSE duration END) + (((CASE duration WHEN 0 THEN 1 ELSE duration END) / "
                        + days
                        + ") * (7 - "
                        + days
                        + ")) - 1 "
                        + " END) "
                        + " ELSE "
                        + " (CASE 	WHEN 	MOD( (CASE duration WHEN 0 THEN 1 ELSE duration END), "
                        + days
                        + ") = 0 "
                        + " THEN "
                        + "  (CASE 	WHEN 	(DATEPART(WEEKDAY, (date_scheduled + "
                        + days
                        + " - 1)) > ("
                        + days
                        + " + 1)  OR "
                        + "  DATEPART(WEEKDAY, (date_scheduled + "
                        + days
                        + " - 1)) < DATEPART(WEEKDAY, date_scheduled)) "
                        + "  THEN date_scheduled + (CASE duration WHEN 0 THEN 1 ELSE duration END) + ((((CASE duration WHEN 0 THEN 1 ELSE duration END) / "
                        + days
                        + ") - 1) * (7 - "
                        + days
                        + ")) + (7-"
                        + days
                        + ") - 1 "
                        + "   ELSE date_scheduled + (CASE duration WHEN 0 THEN 1 ELSE duration END) + ((((CASE duration WHEN 0 THEN 1 ELSE duration END) / "
                        + days
                        + ") - 1) * (7 - "
                        + days
                        + ")) - 1 "
                        + "   END) "
                        + "   ELSE "
                        + "  (CASE 	WHEN 	(DATEPART(WEEKDAY, (date_scheduled + MOD( (CASE duration WHEN 0 THEN 1 ELSE duration END), "
                        + days
                        + ") - 1)) > ("
                        + days
                        + " + 1)  OR "
                        + "  DATEPART(WEEKDAY, (date_scheduled + MOD( (CASE duration WHEN 0 THEN 1 ELSE duration END), "
                        + days
                        + ") - 1)) < DATEPART(WEEKDAY,  date_scheduled)) "
                        + "  THEN date_scheduled + (CASE duration WHEN 0 THEN 1 ELSE duration END) + (((CASE duration WHEN 0 THEN 1 ELSE duration END) / "
                        + days
                        + ") * (7 - "
                        + days
                        + ")) + (7-"
                        + days
                        + ") - 1 "
                        + "  ELSE date_scheduled + (CASE duration WHEN 0 THEN 1 ELSE duration END) + (((CASE duration WHEN 0 THEN 1 ELSE duration END) / "
                        + days
                        + ") * (7 - "
                        + days + ")) - 1 " + "  END) " + "  END) " + "  END)";
            }
        }

        // ////////////////////////////////////////////////////////
        // ////// ORACLE ////////////////////////////////////
        // ////////////////////////////////////////////////////////

        if (isOracle(context)) {

            if (planned) {
                update = " UPDATE activity_log " + " SET  date_planned_end = "
                        + "(CASE	WHEN TO_CHAR(date_planned_for, 'D') = 1 AND  "
                        + days
                        + "  <> 7 "
                        + " THEN "
                        + "(CASE 	WHEN 	MOD( (CASE duration_est_baseline WHEN 0 THEN 1 ELSE duration_est_baseline END),"
                        + days
                        + " ) = 0 "
                        + " THEN 	date_planned_for + 1 + (CASE duration_est_baseline WHEN 0 THEN 1 ELSE duration_est_baseline END) + ((FLOOR((CASE duration_est_baseline WHEN 0 THEN 1 ELSE duration_est_baseline END) /  "
                        + days
                        + " ) - 1) * (7 -  "
                        + days
                        + " )) - 1 "
                        + " ELSE 	date_planned_for + 1 + (CASE duration_est_baseline WHEN 0 THEN 1 ELSE duration_est_baseline END) + (FLOOR((CASE duration_est_baseline WHEN 0 THEN 1 ELSE duration_est_baseline END) /  "
                        + days
                        + " ) * (7 -  "
                        + days
                        + " )) - 1 "
                        + " END) "
                        + " ELSE "
                        + " (CASE 	WHEN 	MOD( (CASE duration_est_baseline WHEN 0 THEN 1 ELSE duration_est_baseline END),  "
                        + days
                        + " ) = 0 "
                        + " THEN "
                        + "  (CASE 	WHEN 	(TO_CHAR((date_planned_for +  "
                        + days
                        + "  - 1), 'D') > ( "
                        + days
                        + "  + 1)  OR "
                        + "  TO_CHAR((date_planned_for +  "
                        + days
                        + " - 1), 'D') < TO_CHAR(date_planned_for, 'D')) "
                        + "  THEN date_planned_for + (CASE duration_est_baseline WHEN 0 THEN 1 ELSE duration_est_baseline END) + ((FLOOR((CASE duration_est_baseline WHEN 0 THEN 1 ELSE duration_est_baseline END) /  "
                        + days
                        + " ) - 1) * (7 -  "
                        + days
                        + " )) + (7- "
                        + days
                        + " ) - 1 "
                        + "   ELSE date_planned_for + (CASE duration_est_baseline WHEN 0 THEN 1 ELSE duration_est_baseline END) + ((FLOOR((CASE duration_est_baseline WHEN 0 THEN 1 ELSE duration_est_baseline END) /  "
                        + days
                        + " ) - 1) * (7 -  "
                        + days
                        + " )) - 1 "
                        + "   END) "
                        + "   ELSE "
                        + "  (CASE 	WHEN ( TO_CHAR((date_planned_for + MOD( (CASE duration_est_baseline WHEN 0 THEN 1 ELSE duration_est_baseline END),  "
                        + days
                        + " ) - 1), 'D') > ( "
                        + days
                        + "  + 1)  OR "
                        + "  TO_CHAR((date_planned_for + MOD( (CASE duration_est_baseline WHEN 0 THEN 1 ELSE duration_est_baseline END),  "
                        + days
                        + " ) - 1), 'D') < TO_CHAR(date_planned_for, 'D')) "
                        + "  THEN date_planned_for + (CASE duration_est_baseline WHEN 0 THEN 1 ELSE duration_est_baseline END) + (FLOOR((CASE duration_est_baseline WHEN 0 THEN 1 ELSE duration_est_baseline END) /  "
                        + days
                        + " ) * (7 -  "
                        + days
                        + " )) + (7 - "
                        + days
                        + " ) - 1 "
                        + "  ELSE date_planned_for + (CASE duration_est_baseline WHEN 0 THEN 1 ELSE duration_est_baseline END) + (FLOOR((CASE duration_est_baseline WHEN 0 THEN 1 ELSE duration_est_baseline END) /  "
                        + days
                        + " ) * (7 -  "
                        + days
                        + " )) - 1 "
                        + "  END) "
                        + "  END) "
                        + "  END)";
            } else {
                update = " UPDATE activity_log " + " SET  date_scheduled_end = "
                        + "(CASE	WHEN TO_CHAR(date_scheduled, 'D') = 1 AND "
                        + days
                        + " <> 7 "
                        + " THEN "
                        + "(CASE 	WHEN 	MOD( (CASE duration WHEN 0 THEN 1 ELSE duration END), "
                        + days
                        + ") = 0 "
                        + " THEN 	date_scheduled + 1 + (CASE duration WHEN 0 THEN 1 ELSE duration END) + ((FLOOR((CASE duration WHEN 0 THEN 1 ELSE duration END) / "
                        + days
                        + ") - 1) * (7 - "
                        + days
                        + ")) - 1 "
                        + " ELSE 	date_scheduled + 1 + (CASE duration WHEN 0 THEN 1 ELSE duration END) + (FLOOR((CASE duration WHEN 0 THEN 1 ELSE duration END) / "
                        + days
                        + ") * (7 - "
                        + days
                        + ")) - 1 "
                        + " END) "
                        + " ELSE "
                        + " (CASE 	WHEN 	MOD( (CASE duration WHEN 0 THEN 1 ELSE duration END), "
                        + days
                        + ") = 0 "
                        + " THEN "
                        + "  (CASE 	WHEN 	(TO_CHAR((date_scheduled + "
                        + days
                        + " - 1), 'D') > ("
                        + days
                        + " + 1)  OR "
                        + "  TO_CHAR((date_scheduled + "
                        + days
                        + " - 1), 'D') < TO_CHAR(date_scheduled, 'D')) "
                        + "  THEN date_scheduled + (CASE duration WHEN 0 THEN 1 ELSE duration END) + ((FLOOR((CASE duration WHEN 0 THEN 1 ELSE duration END) / "
                        + days
                        + ") - 1) * (7 - "
                        + days
                        + ")) + (7 - "
                        + days
                        + ") - 1 "
                        + "   ELSE date_scheduled + (CASE duration WHEN 0 THEN 1 ELSE duration END) + ((FLOOR((CASE duration WHEN 0 THEN 1 ELSE duration END) / "
                        + days
                        + ") - 1) * (7 - "
                        + days
                        + ")) - 1 "
                        + "   END) "
                        + "   ELSE "
                        + "  (CASE 	WHEN 	(TO_CHAR((date_scheduled + MOD( (CASE duration WHEN 0 THEN 1 ELSE duration END), "
                        + days
                        + ") - 1), 'D') > ("
                        + days
                        + " + 1)  OR "
                        + "  TO_CHAR((date_scheduled + MOD( (CASE duration WHEN 0 THEN 1 ELSE duration END), "
                        + days
                        + ") - 1), 'D') < TO_CHAR(date_scheduled, 'D')) "
                        + "  THEN date_scheduled + (CASE duration WHEN 0 THEN 1 ELSE duration END) + (FLOOR((CASE duration WHEN 0 THEN 1 ELSE duration END) / "
                        + days
                        + ") * (7 - "
                        + days
                        + ")) + (7-"
                        + days
                        + ") - 1 "
                        + "  ELSE date_scheduled + (CASE duration WHEN 0 THEN 1 ELSE duration END) + (FLOOR((CASE duration WHEN 0 THEN 1 ELSE duration END) / "
                        + days
                        + ") * (7 - " + days + ")) - 1 " + "  END) " + "  END) " + "  END)";
            }
        }

        // ////////////////////////////////////////////////////////////////////////////
        // ////////MS SQL /////////////////////////////////////////////////////////////
        // ///////////////////////////////////////////////////////////////////////////
        if (isSqlServer(context)) {

            if (planned) {

                update = " UPDATE activity_log " + " SET  date_planned_end = "
                        + "(CASE	WHEN DATEPART(WEEKDAY, date_planned_for) = 1 AND  "
                        + days
                        + "  <> 7 "
                        + " THEN "
                        + "(CASE 	WHEN 	(CASE duration_est_baseline WHEN 0 THEN 1 ELSE duration_est_baseline END) %  "
                        + days
                        + " = 0 "
                        + " THEN 	date_planned_for + 1 + (CASE duration_est_baseline WHEN 0 THEN 1 ELSE duration_est_baseline END) + ((((CASE duration_est_baseline WHEN 0 THEN 1 ELSE duration_est_baseline END) /  "
                        + days
                        + " ) - 1) * (7 -  "
                        + days
                        + " )) - 1 "
                        + " ELSE 	date_planned_for + 1 + (CASE duration_est_baseline WHEN 0 THEN 1 ELSE duration_est_baseline END) + (((CASE duration_est_baseline WHEN 0 THEN 1 ELSE duration_est_baseline END) /  "
                        + days
                        + " ) * (7 -  "
                        + days
                        + " )) - 1 "
                        + " END) "
                        + " ELSE "
                        + " (CASE 	WHEN 	(CASE duration_est_baseline WHEN 0 THEN 1 ELSE duration_est_baseline END) %  "
                        + days
                        + "  = 0 "
                        + " THEN "
                        + "  (CASE 	WHEN 	(DATEPART(WEEKDAY, (date_planned_for +  "
                        + days
                        + "  - 1)) > ( "
                        + days
                        + "  + 1)  OR "
                        + "  DATEPART(WEEKDAY, (date_planned_for +  "
                        + days
                        + "  - 1)) < DATEPART(WEEKDAY, date_planned_for)) "
                        + "  THEN date_planned_for + (CASE duration_est_baseline WHEN 0 THEN 1 ELSE duration_est_baseline END) + ((((CASE duration_est_baseline WHEN 0 THEN 1 ELSE duration_est_baseline END) /  "
                        + days
                        + " ) - 1) * (7 -  "
                        + days
                        + " )) + (7 - "
                        + days
                        + " ) - 1 "
                        + "   ELSE date_planned_for + (CASE duration_est_baseline WHEN 0 THEN 1 ELSE duration_est_baseline END) + ((((CASE duration_est_baseline WHEN 0 THEN 1 ELSE duration_est_baseline END) /  "
                        + days
                        + " ) - 1) * (7 -  "
                        + days
                        + " )) - 1 "
                        + "   END) "
                        + "   ELSE "
                        + "  (CASE 	WHEN 	(DATEPART(WEEKDAY, (date_planned_for +  (CASE duration_est_baseline WHEN 0 THEN 1 ELSE duration_est_baseline END) % "
                        + days
                        + "  - 1)) > ( "
                        + days
                        + "  + 1)  OR "
                        + "  DATEPART(WEEKDAY, (date_planned_for +  (CASE duration_est_baseline WHEN 0 THEN 1 ELSE duration_est_baseline END) %  "
                        + days
                        + "  - 1)) < DATEPART(WEEKDAY,  date_planned_for)) "
                        + "  THEN date_planned_for + (CASE duration_est_baseline WHEN 0 THEN 1 ELSE duration_est_baseline END) + (((CASE duration_est_baseline WHEN 0 THEN 1 ELSE duration_est_baseline END) /  "
                        + days
                        + " ) * (7 -  "
                        + days
                        + " )) + (7- "
                        + days
                        + " ) - 1 "
                        + "  ELSE date_planned_for + (CASE duration_est_baseline WHEN 0 THEN 1 ELSE duration_est_baseline END) + (((CASE duration_est_baseline WHEN 0 THEN 1 ELSE duration_est_baseline END) /  "
                        + days
                        + " ) * (7 -  "
                        + days
                        + " )) - 1 "
                        + "  END) "
                        + "  END) "
                        + "  END)";

            } else {
                update = " UPDATE activity_log " + " SET  date_scheduled_end = "
                        + "(CASE	WHEN DATEPART(WEEKDAY, date_scheduled) = 1 AND "
                        + days
                        + " <> 7 "
                        + " THEN "
                        + "(CASE 	WHEN  (CASE duration WHEN 0 THEN 1 ELSE duration END) % "
                        + days
                        + " = 0 "
                        + " THEN 	date_scheduled + 1 + (CASE duration WHEN 0 THEN 1 ELSE duration END) + ((((CASE duration WHEN 0 THEN 1 ELSE duration END) / "
                        + days
                        + ") - 1) * (7 - "
                        + days
                        + ")) - 1 "
                        + " ELSE 	date_scheduled + 1 + (CASE duration WHEN 0 THEN 1 ELSE duration END) + (((CASE duration WHEN 0 THEN 1 ELSE duration END) / "
                        + days
                        + ") * (7 - "
                        + days
                        + ")) - 1 "
                        + " END) "
                        + " ELSE "
                        + " (CASE 	WHEN 	(CASE duration WHEN 0 THEN 1 ELSE duration END) % "
                        + days
                        + " = 0 "
                        + " THEN "
                        + "  (CASE 	WHEN 	(DATEPART(WEEKDAY, (date_scheduled + "
                        + days
                        + " - 1)) > ("
                        + days
                        + " + 1)  OR "
                        + "  DATEPART(WEEKDAY, (date_scheduled + "
                        + days
                        + " - 1)) < DATEPART(WEEKDAY, date_scheduled)) "
                        + "  THEN date_scheduled + (CASE duration WHEN 0 THEN 1 ELSE duration END) + ((((CASE duration WHEN 0 THEN 1 ELSE duration END) / "
                        + days
                        + ") - 1) * (7 - "
                        + days
                        + ")) + (7-"
                        + days
                        + ") - 1 "
                        + "   ELSE date_scheduled + (CASE duration WHEN 0 THEN 1 ELSE duration END) + ((((CASE duration WHEN 0 THEN 1 ELSE duration END) / "
                        + days
                        + ") - 1) * (7 - "
                        + days
                        + ")) - 1 "
                        + "   END) "
                        + "   ELSE "
                        + "  (CASE 	WHEN 	(DATEPART(WEEKDAY, (date_scheduled + (CASE duration WHEN 0 THEN 1 ELSE duration END) % "
                        + days
                        + " - 1)) > ("
                        + days
                        + " + 1)  OR "
                        + "  DATEPART(WEEKDAY, (date_scheduled +  (CASE duration WHEN 0 THEN 1 ELSE duration END) % "
                        + days
                        + " - 1)) < DATEPART(WEEKDAY,  date_scheduled)) "
                        + "  THEN date_scheduled + (CASE duration WHEN 0 THEN 1 ELSE duration END) + (((CASE duration WHEN 0 THEN 1 ELSE duration END) / "
                        + days
                        + ") * (7 - "
                        + days
                        + ")) + (7 - "
                        + days
                        + ") - 1 "
                        + "  ELSE date_scheduled + (CASE duration WHEN 0 THEN 1 ELSE duration END) + (((CASE duration WHEN 0 THEN 1 ELSE duration END) / "
                        + days
                        + ") * (7 - "
                        + days + ")) - 1 " + "  END) " + "  END) " + "  END)";
            }
        }
        return update;
    }
}
