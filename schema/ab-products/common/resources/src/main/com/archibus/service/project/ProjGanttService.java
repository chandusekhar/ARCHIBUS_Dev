package com.archibus.service.project;

import java.util.*;

import org.apache.log4j.Logger;

import com.archibus.datasource.*;
import com.archibus.datasource.DataSource.RecordHandler;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.utility.ExceptionBase;

public class ProjGanttService {

    private StringBuffer messageBuffer;

    private final ArrayList<String> dependencyList = new ArrayList<String>();

    private String dependencyLoopTasks = "";

    private static final String[] BASELINE_DATE_FIELDS = { "activity_log.date_planned_for",
            "activity_log.date_planned_end", "activity_log.duration_est_baseline" };

    private static final String[] DESIGN_DATE_FIELDS = { "activity_log.date_scheduled",
            "activity_log.date_scheduled_end", "activity_log.duration" };

    private final Logger log = Logger.getLogger(this.getClass());

    // getActivityParams

    public String cascadeAllTaskDependencies() throws ExceptionBase {

        if (this.log.isDebugEnabled()) {
            this.log.debug("BEGIN: Cascade All Task Dependencies");
        }

        this.messageBuffer = new StringBuffer("");

        DataSource ds = DataSourceFactory.createDataSourceForFields("activity_log",
            new String[] { "activity_log_id" }, false);
        ds.addRestriction(Restrictions.sql(" activity_log.predecessors IS NOT NULL "));

        ds.queryRecords(new RecordHandler() {

            public boolean handleRecord(DataRecord record) {
                clearDependencyList();
                int recordTaskId = record.getInt("activity_log.activity_log_id");
                if (adjustAllTaskDates(recordTaskId)) {
                    cascadeChanges(recordTaskId);
                }
                return true;
            }
        });
        if (this.dependencyLoopTasks != "") {
            this.messageBuffer
                .append("<br/>A dependency loop exists involving the following task id(s).  Please correct this issue before proceeding:<br/>"
                        + this.dependencyLoopTasks);
        }
        return this.messageBuffer.toString();
    }

    public String cascadeTaskDependencies(int activityLogId) throws ExceptionBase {

        if (this.log.isDebugEnabled()) {
            this.log.debug("BEGIN: Cascade Task Dependencies");
        }

        this.messageBuffer = new StringBuffer("");

        adjustAllTaskDates(activityLogId);
        cascadeChanges(activityLogId);

        if (this.dependencyLoopTasks != "") {
            this.messageBuffer
                .append("<br/>A dependency loop exists involving the following task id(s).  Please correct this issue before proceeding:"
                        + this.dependencyLoopTasks);
        }
        return this.messageBuffer.toString();
    }

    /**
     * Find out if this task id is in predecessor field of any other action and if so, call
     * adjustAllTaskDates for that action. If a start date is subsequently adjusted for that action,
     * call cascadeChanges for that action.
     */
    private void cascadeChanges(int activityLogId) {

        final int taskId = activityLogId;
        if (this.dependencyList.contains(taskId + "")) { // Check for dependency loops
            this.dependencyLoopTasks += "<br/>" + taskId;
            return;
        }
        this.dependencyList.add(taskId + "");

        DataSource ds = DataSourceFactory.createDataSourceForFields("activity_log", new String[] {
                "activity_log_id", "predecessors" }, false);
        ds.addRestriction(Restrictions.sql(" activity_log.predecessors LIKE '%" + taskId + "%' "));
        ds.queryRecords(new RecordHandler() {

            public boolean handleRecord(DataRecord record) {
                int recordTaskId = record.getInt("activity_log.activity_log_id");
                String predecessors = record.getString("activity_log.predecessors");
                StringTokenizer preds = new StringTokenizer(predecessors == null ? ""
                        : predecessors, ",");
                while (preds.hasMoreTokens()) {
                    String pred = preds.nextToken().trim();
                    if (pred.equals(taskId + "")) {
                        if (adjustAllTaskDates(recordTaskId)) {
                            cascadeChanges(recordTaskId);
                        }
                        break;
                    }
                }
                return true;
            }
        });
    }

    /**
     * Call adjustTaskDates for the baseline date fields and for the design date fields.
     * 
     * @return true if a start date was adjusted for this task.
     */
    private boolean adjustAllTaskDates(int activityLogId) {

        boolean adjusted = false;

        DataSource ds = DataSourceFactory.createDataSourceForFields("activity_log", new String[] {
                "activity_log_id", "action_title", "predecessors", "date_planned_for",
                "duration_est_baseline", "date_planned_end", "date_scheduled", "duration",
                "date_scheduled_end", "work_pkg_id", "project_id" }, false);
        ds.addRestriction(Restrictions.eq("activity_log", "activity_log_id", activityLogId));
        DataRecord record = ds.getRecord();

        adjusted = adjustTaskDates(ds, record, BASELINE_DATE_FIELDS);
        if (adjustTaskDates(ds, record, DESIGN_DATE_FIELDS)) {
            adjusted = true;
        }
        if (adjusted) {
            this.messageBuffer.append(activityLogId + ": "
                    + record.getString("activity_log.action_title"));
            this.messageBuffer.append("<br/>");
        }
        return adjusted;
    }

    /**
     * If the start date of this task is earlier than any predecessor's end date, edit this task's
     * start date to come after the end date of the predecessor. Calculate end date according to
     * adjusted start date and task duration.
     * 
     * @return true if the start date was adjusted for this task.
     */
    private boolean adjustTaskDates(DataSource ds, DataRecord record, String[] dateFields) {

        boolean adjusted = false;

        int days_per_week = getDaysPerWeek(record);

        String predecessors = record.getString("activity_log.predecessors");
        StringTokenizer preds = new StringTokenizer(predecessors == null ? "" : predecessors, ",");

        Calendar dateStart = Calendar.getInstance();
        dateStart.setTime(record.getDate(dateFields[0]));
        while (preds.hasMoreTokens()) {
            String pred = preds.nextToken().trim();
            Calendar predDateEnd = getFieldValueAsCal(pred, dateFields[1]);
            if (predDateEnd == null) {
                continue;
            }
            if (dateStart.before(predDateEnd)) {
                dateStart = (Calendar) predDateEnd.clone();
                dateStart.add(Calendar.DATE, 1);
                dateStart = adjustStartDateByDaysPerWeek(dateStart, days_per_week);
                adjusted = true;
            }
        }

        if (adjusted) {
            Calendar dateEnd = adjustDateEnd((Calendar) dateStart.clone(), record
                .getInt(dateFields[2]), days_per_week);

            record.setValue(dateFields[0], dateStart.getTime());
            record.setValue(dateFields[1], dateEnd.getTime());

            ds.saveRecord(record);
        }
        return adjusted;
    }

    private Calendar getFieldValueAsCal(String activityLogId, String dateField) {
        DataSource ds = DataSourceFactory.createDataSourceForFields("activity_log", new String[] {
                "activity_log_id", dateField }, false);
        ds.addRestriction(Restrictions.eq("activity_log", "activity_log_id", activityLogId));
        DataRecord record = ds.getRecord();
        if (record != null) {
            Calendar dateEnd = Calendar.getInstance();
            dateEnd.setTime(record.getDate(dateField));
            return dateEnd;
        } else {
            return null;
        }
    }

    private Calendar adjustDateEnd(Calendar dateEnd, int duration, int days_per_week) {
        if (duration == 0) {
            return dateEnd;
        }
        dateEnd.add(Calendar.DATE, -1);
        dateEnd = truncateEndDateByDaysPerWeek(dateEnd, days_per_week);
        int weeks = (int) Math.floor(duration / days_per_week);
        dateEnd.add(Calendar.DATE, weeks * 7);
        int durationRemain = duration % days_per_week;
        while (durationRemain > 0) {
            dateEnd.add(Calendar.DATE, 1);
            int day = dateEnd.get(Calendar.DAY_OF_WEEK) - 1; // (0 - 6) 0 = Sunday
            if (day == 0) {
                day = 7; // (1 - 7) 1 = Monday
            }
            if (day <= days_per_week) {
                durationRemain--; // check if day is a working day
            }
        }
        return dateEnd;
    }

    private Calendar truncateEndDateByDaysPerWeek(Calendar dateEnd, int days_per_week) {
        int day = dateEnd.get(Calendar.DAY_OF_WEEK) - 1; // (0 - 6) 0 = Sunday
        if (day == 0) {
            day = 7; // (1 - 7) 1 = Monday
        }
        if (day > days_per_week) {
            dateEnd.add(Calendar.DATE, days_per_week - day); // truncate non-working days
        }
        return dateEnd;
    }

    private Calendar adjustStartDateByDaysPerWeek(Calendar dateStart, int days_per_week) {
        int day = dateStart.get(Calendar.DAY_OF_WEEK) - 1; // (0 - 6) 0 = Sunday
        if (day == 0) {
            day = 7; // (1 - 7) 1 = Monday
        }
        if (day > days_per_week) {
            dateStart.add(Calendar.DATE, 8 - day); // adjust start date up to next working day
        }
        return dateStart;
    }

    private int getDaysPerWeek(DataRecord record) {
        String work_pkg_id = record.getString("activity_log.work_pkg_id");
        int days_per_week = 5;
        if (work_pkg_id != null) {
            DataSource workPkgDs = DataSourceFactory.createDataSourceForFields("work_pkgs",
                new String[] { "work_pkg_id", "days_per_week" }, false);
            workPkgDs.addRestriction(Restrictions.eq("work_pkgs", "work_pkg_id", work_pkg_id));
            DataRecord workPkgRecord = workPkgDs.getRecord();
            days_per_week = workPkgRecord.getInt("work_pkgs.days_per_week");
        } else {
            String project_id = record.getString("activity_log.project_id");
            DataSource projectDs = DataSourceFactory.createDataSourceForFields("project",
                new String[] { "project_id", "days_per_week" }, false);
            projectDs.addRestriction(Restrictions.eq("project", "project_id", project_id));
            DataRecord projRecord = projectDs.getRecord();
            days_per_week = projRecord.getInt("project.days_per_week");
        }
        return days_per_week;
    }

    private void clearDependencyList() {
        for (int i = 0; i < this.dependencyList.size(); i++) {
            this.dependencyList.remove(i);
        }
    }
}
