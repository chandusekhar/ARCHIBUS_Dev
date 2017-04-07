package com.archibus.eventhandler.CapitalProjects;

import java.io.ByteArrayOutputStream;
import java.util.*;
import java.util.Map.Entry;

import com.archibus.eventhandler.CapitalProjects.MsProjectConstants.TransStatus;
import com.archibus.schema.Record;
import com.archibus.utility.*;
import com.aspose.tasks.*;
import com.aspose.tasks.Calendar;
import com.aspose.tasks.StringBuilder;

public class MsProjectExporter extends MsProjectImportExportBase {

    public MsProjectExporter(final MsProjectProperties properties, final String subject) {

        super(properties);

        this.project = new Project(
            MsProjectUtility.getTemplateFilePath(properties.getVersion().toString()));
        this.project.setAuthor("ARCHIBUS, Inc.");
        this.project.setMinutesPerDay(60 * 8);

        final java.util.Calendar cal = java.util.Calendar.getInstance();
        cal.set(2100, 1, 1, 8, 0, 0);

        // Set project Start and Finish Date
        this.project.setStartDate(cal.getTime());

        cal.set(1900, 1, 1, 17, 0, 0);
        this.project.setFinishDate(cal.getTime());

        this.project.setName(properties.getProjectName());

        this.project.setSubject(subject);

        // set root task
        final Task root = new Task();
        this.project.setRootTask(root);

        this.project.setExtendedAttributes(new ArrayList<ExtendedAttributeDefinition>());

    }

    public ByteArrayOutputStream exportFromDb() throws ExceptionBase {

        MsProjectPersistenceImpl persistence = new MsProjectPersistenceImpl();
        final com.archibus.db.RetrievedRecords.Immutable retrievedRecords =
                persistence.retrieveRecords(this.properties);

        this.addExtendedAtrributes();

        int count = 1;
        Task parent = null;
        long parentDuration = 0L;

        persistence = new MsProjectPersistenceImpl();

        for (final Object recordObject : retrievedRecords.getRecordset().getRecords()) {
            final Record.Immutable record = (Record.Immutable) recordObject;

            final Map<String, Object> map = persistence.composeActivityLogMap(record);

            final String workPkgId =
                    (String) map.get(MsProjectConstants.WORK_PKGS_FLDS.WORK_PKG_ID.toString());
            if (parent == null
                    || workPkgId.compareToIgnoreCase(this.properties.getWorkPackageId()) != 0) {
                // set parent task's duration and reset it for the next parent task.
                if (parent != null) {
                    parent.setDurationFormat(TimeUnitType.Day);
                    parent.setDuration(parentDuration);
                    parentDuration = 0L;
                }
                parent = new Task(workPkgId);
                parent.setUid(count);
                this.properties.setWorkPackageId(workPkgId);
                this.project.getRootTask().getChildren().add(parent);
                count++;
            }

            // add Task element
            final MsTaskProperties taskProperties = new MsTaskProperties(map);

            final Integer activityLogId = (Integer) map
                .get(MsProjectConstants.ACTIVITY_LOG_FLDS.ACTIVITY_LOG_ID.toString());
            parentDuration += this.addTask(parent, taskProperties, activityLogId, count);

            map.clear();

            count++;
        }

        // set last parent's task duration
        if (parent != null) {
            parent.setDurationFormat(TimeUnitType.Day);
            parent.setDuration(parentDuration);
        }

        // We need to recalculate the IDs only as UIDs were set correctly.
        this.project.calcTaskIds();

        this.project.calcTaskUids();

        this.project.calcCalendarUids(1);

        this.project.updateReferences();

        // add predecessor links to the projects
        this.addPredecessorLinks();

        this.addPercentCompleteForTasks();

        final ByteArrayOutputStream outStream = new ByteArrayOutputStream();
        this.project.save(outStream, SaveFileFormat.MPP);

        return outStream;
    }

    /**
     * Adds a task
     *
     * @param map The feature to be added to the TaskElement attribute
     * @param project The feature to be added to the TaskElement attribute
     * @param count The feature to be added to the TaskElement attribute
     * @param count2
     * @param uidMap the activity_log_id and task's uid map
     * @param predecessorMap the task's uid and the predecessor's activity_log_id map
     * @param percentCompleteMap
     *
     * @exception ExceptionBase Description of the Exception
     */
    public long addTask(final Task parent, final MsTaskProperties taskProperties,
            final Integer activityLogId, final int count) throws ExceptionBase {

        final Calendar calendar = this.addCalendar(taskProperties.getDaysPerWeek());

        // call this to set the project start date before create the task, otherwise you will have
        // error calling new task constructor.
        final java.util.Date newTaskStartDate =
                this.getStartDate(taskProperties.getTaskStartDate());

        final Task task = new Task(taskProperties.getTaskName());

        task.setUid(count);

        task.setStart(newTaskStartDate);

        task.setDurationFormat(TimeUnitType.Day);

        final long duration =
                (long) taskProperties.getDuration().intValue() * 8 * MsProjectConstants.ONE_HOUR;
        task.setDuration(duration);

        if (task.getDuration() > MsProjectConstants.ONE_HOUR) {
            task.setFinish(calendar.getTaskFinishDateFromDuration(task,
                task.getDuration() - MsProjectConstants.ONE_HOUR));
        }

        task.setWbs(taskProperties.getWbsId());

        task.setCalendar(calendar);

        task.setExtendedAttribute(new ArrayList<ExtendedAttribute>());

        task.getExtendedAttribute()
            .add(this.createExtendAttribute(
                MsProjectConstants.ACTIVITY_LOG_FLDS.ASSIGNED_TO.toString(),
                taskProperties.getAssignedTo()));
        task.getExtendedAttribute().add(
            this.createExtendAttribute(MsProjectConstants.ACTIVITY_LOG_FLDS.COMMENTS.toString(),
                taskProperties.getComments()));
        task.getExtendedAttribute()
            .add(this.createExtendAttribute(
                MsProjectConstants.ACTIVITY_LOG_FLDS.ACTIVITY_TYPE.toString(),
                taskProperties.getActivityType()));

        parent.getChildren().add(task);

        if (StringUtil.notNullOrEmpty(activityLogId)) {
            this.properties.getUidMap().put(activityLogId.toString(), count);
        }

        if (taskProperties.getPctComplete() != null) {
            this.properties.getPercentCompleteMap().put(count, taskProperties.getPctComplete());
        }

        // add the predecessor uid as activity_log_id, this value will be linked later to the ms
        // project's task.
        if (taskProperties.getPredecessors() != null) {
            this.properties.getPredecessorMap().put(count, taskProperties.getPredecessors());
        }

        return duration;

    }

    private java.util.Date getStartDate(final java.sql.Date taskStartDate) {
        // move task start date to 9AM.
        final java.util.Date newTaskStartDate = MsProjectUtility.convertDate(taskStartDate, 9);
        if (newTaskStartDate != null) {
            final java.util.Date projectStartDate = this.project.getStartDate();
            if (projectStartDate == null || projectStartDate.after(newTaskStartDate)) {
                this.project.setStartDate(newTaskStartDate);
            }

        }
        return newTaskStartDate;
    }

    private Calendar addCalendar(final int daysPerWeek) {
        Calendar calendar = this.project.getCalendarByName("AbCalendar" + daysPerWeek);
        if (calendar == null) {
            calendar = this.addCalender(this.project.getCalendars().size(), daysPerWeek);
        }
        return calendar;
    }

    /**
     * Adds a feature to the CalenderElement attribute of the MsProjectHandlers object
     *
     * @param map The feature to be added to the CalenderElement attribute
     * @param project The feature to be added to the CalenderElement attribute
     * @param count The feature to be added to the CalenderElement attribute
     * @exception ExceptionBase Description of the Exception
     */
    private Calendar addCalender(final int uid, final int daysPerWeek) throws ExceptionBase {

        final Calendar calendar = new Calendar();
        calendar.setUid(uid);
        calendar.setName("AbCalendar" + daysPerWeek);

        this.project.getCalendars().add(calendar);

        this.project.calcCalendarUids(1);

        // Add working days Monday through Thursday with default timings
        switch (daysPerWeek) {
            case 0:
                calendar.getDays().add(new WeekDay(DayType.Monday));
                calendar.getDays().add(new WeekDay(DayType.Tuesday));
                calendar.getDays().add(new WeekDay(DayType.Wednesday));
                calendar.getDays().add(new WeekDay(DayType.Thursday));
                calendar.getDays().add(new WeekDay(DayType.Friday));
                calendar.getDays().add(new WeekDay(DayType.Saturday));
                calendar.getDays().add(new WeekDay(DayType.Sunday));
                break;
            case 1:
                calendar.getDays().add(WeekDay.createDefaultWorkingDay(DayType.Monday));
                calendar.getDays().add(new WeekDay(DayType.Tuesday));
                calendar.getDays().add(new WeekDay(DayType.Wednesday));
                calendar.getDays().add(new WeekDay(DayType.Thursday));
                calendar.getDays().add(new WeekDay(DayType.Friday));
                calendar.getDays().add(new WeekDay(DayType.Saturday));
                calendar.getDays().add(new WeekDay(DayType.Sunday));
                break;
            case 2:
                calendar.getDays().add(WeekDay.createDefaultWorkingDay(DayType.Monday));
                calendar.getDays().add(WeekDay.createDefaultWorkingDay(DayType.Tuesday));
                calendar.getDays().add(new WeekDay(DayType.Wednesday));
                calendar.getDays().add(new WeekDay(DayType.Thursday));
                calendar.getDays().add(new WeekDay(DayType.Friday));
                calendar.getDays().add(new WeekDay(DayType.Saturday));
                calendar.getDays().add(new WeekDay(DayType.Sunday));
                break;
            case 3:
                calendar.getDays().add(WeekDay.createDefaultWorkingDay(DayType.Monday));
                calendar.getDays().add(WeekDay.createDefaultWorkingDay(DayType.Tuesday));
                calendar.getDays().add(WeekDay.createDefaultWorkingDay(DayType.Wednesday));
                calendar.getDays().add(new WeekDay(DayType.Thursday));
                calendar.getDays().add(new WeekDay(DayType.Friday));
                calendar.getDays().add(new WeekDay(DayType.Saturday));
                calendar.getDays().add(new WeekDay(DayType.Sunday));
                break;
            case 4:
                calendar.getDays().add(WeekDay.createDefaultWorkingDay(DayType.Monday));
                calendar.getDays().add(WeekDay.createDefaultWorkingDay(DayType.Tuesday));
                calendar.getDays().add(WeekDay.createDefaultWorkingDay(DayType.Wednesday));
                calendar.getDays().add(WeekDay.createDefaultWorkingDay(DayType.Thursday));
                calendar.getDays().add(new WeekDay(DayType.Friday));
                calendar.getDays().add(new WeekDay(DayType.Saturday));
                calendar.getDays().add(new WeekDay(DayType.Sunday));
                break;
            case 6:
                calendar.getDays().add(WeekDay.createDefaultWorkingDay(DayType.Monday));
                calendar.getDays().add(WeekDay.createDefaultWorkingDay(DayType.Tuesday));
                calendar.getDays().add(WeekDay.createDefaultWorkingDay(DayType.Wednesday));
                calendar.getDays().add(WeekDay.createDefaultWorkingDay(DayType.Thursday));
                calendar.getDays().add(WeekDay.createDefaultWorkingDay(DayType.Friday));
                calendar.getDays().add(WeekDay.createDefaultWorkingDay(DayType.Saturday));
                calendar.getDays().add(new WeekDay(DayType.Sunday));
                break;
            case 7:
                calendar.getDays().add(WeekDay.createDefaultWorkingDay(DayType.Monday));
                calendar.getDays().add(WeekDay.createDefaultWorkingDay(DayType.Tuesday));
                calendar.getDays().add(WeekDay.createDefaultWorkingDay(DayType.Wednesday));
                calendar.getDays().add(WeekDay.createDefaultWorkingDay(DayType.Thursday));
                calendar.getDays().add(WeekDay.createDefaultWorkingDay(DayType.Friday));
                calendar.getDays().add(WeekDay.createDefaultWorkingDay(DayType.Saturday));
                calendar.getDays().add(WeekDay.createDefaultWorkingDay(DayType.Sunday));
                break;
            default:
                calendar.getDays().add(WeekDay.createDefaultWorkingDay(DayType.Monday));
                calendar.getDays().add(WeekDay.createDefaultWorkingDay(DayType.Tuesday));
                calendar.getDays().add(WeekDay.createDefaultWorkingDay(DayType.Wednesday));
                calendar.getDays().add(WeekDay.createDefaultWorkingDay(DayType.Thursday));
                calendar.getDays().add(WeekDay.createDefaultWorkingDay(DayType.Friday));
                calendar.getDays().add(new WeekDay(DayType.Saturday));
                calendar.getDays().add(new WeekDay(DayType.Sunday));
        }

        Calendar.makeStandardCalendar(calendar);
        return calendar;
    }

    public void addPercentCompleteForTasks() {
        final Iterator<Entry<Integer, Integer>> it =
                this.properties.getPercentCompleteMap().entrySet().iterator();
        while (it.hasNext()) {
            final Map.Entry<Integer, Integer> pairs = it.next();
            final Integer uid = pairs.getKey();
            final Integer percent = pairs.getValue();
            final Task task = this.project.getTaskByUid(uid);
            if (task != null) {
                task.setPercentComplete(percent);
            }
        }
    }

    public void addPredecessorLinks() {
        final HashMap<Integer, String> predecessors = this.properties.getPredecessorMap();
        final HashMap<String, Integer> uidMap = this.properties.getUidMap();
        final Iterator<Entry<Integer, String>> it = predecessors.entrySet().iterator();
        while (it.hasNext()) {
            final Map.Entry<Integer, String> pairs = it.next();
            final Integer uid = pairs.getKey();
            final String predecessorsValue = pairs.getValue();
            for (final String predecessor : predecessorsValue.split(",")) {
                if (uidMap.containsKey(predecessor)) {
                    final Integer predecessorUid = this.properties.getUidMap().get(predecessor);
                    final Task task = this.project.getTaskByUid(uid);
                    final Task taskPredecessor = this.project.getTaskByUid(predecessorUid);
                    final TaskLink link =
                            new TaskLink(taskPredecessor, task, TaskLinkType.FinishToStart);
                    this.project.addTaskLink(link);
                }
            }

            it.remove(); // avoids a ConcurrentModificationException
        }
    }

    @Override
    public void storeTasksIntoMap(final Task task, final TransStatus status) {

        // store date_scheduled into maps - Date type
        final java.util.Date utilStartDate = task.getStart();
        if (utilStartDate != null) {
            final java.sql.Date sqlStartDate = new java.sql.Date(utilStartDate.getTime());
            this.map.put(MsProjectConstants.ACTIVITY_LOG_TRANS_FLDS.DATE_SCHEDULED.toString(),
                sqlStartDate);
        }

        // store predecessors into maps - String type
        this.storePredecessorsIntoMap(task, (status == TransStatus.NEW));

        // sore pct_complete into maps - Integer type
        this.map.put(MsProjectConstants.ACTIVITY_LOG_TRANS_FLDS.PCT_COMPLETE.toString(),
            task.getPercentComplete());

        // based on map and actMap values, find out the status then store into activity_log_trans
        // table
        this.map.put(MsProjectConstants.ACTIVITY_LOG_TRANS_FLDS.STATUS.toString(),
            status.toString());

    }

    @Override
    public String storeActivityIdIntoMap(final Task task) {
        final String taskName = task.getName();
        String activityLogId = "";

        if (taskName != null) {

            // find the value for action_title and activity_log_id
            final Map<String, String> content = MsProjectUtility.splitContent(taskName);
            final String action_title = content.get(MsProjectConstants.ContentKey.FIRST.toString());
            activityLogId = content.get(MsProjectConstants.ContentKey.SECOND.toString());

            // store activity_log_id into maps - Integer type
            if (StringUtil.notNullOrEmpty(activityLogId)) {
                this.map.put(MsProjectConstants.ACTIVITY_LOG_TRANS_FLDS.ACTIVITY_LOG_ID.toString(),
                    Integer.valueOf(activityLogId));
                this.actMap.put(MsProjectConstants.ACTIVITY_LOG_FLDS.ACTIVITY_LOG_ID.toString(),
                    Integer.valueOf(activityLogId));

            }
            this.map.put(MsProjectConstants.ACTIVITY_LOG_TRANS_FLDS.ACTION_TITLE.toString(),
                action_title);
        }
        return activityLogId;
    }

    public void addExtendedAtrributes() {
        this.addExtendedAtrribute(MsProjectConstants.ACTIVITY_LOG_FLDS.ASSIGNED_TO.toString(),
            ExtendedAttributeTask.Text1);
        this.addExtendedAtrribute(MsProjectConstants.ACTIVITY_LOG_FLDS.COMMENTS.toString(),
            ExtendedAttributeTask.Text2);
        this.addExtendedAtrribute(MsProjectConstants.ACTIVITY_LOG_FLDS.ACTIVITY_TYPE.toString(),
            ExtendedAttributeTask.Text3);
    }

    private void addExtendedAtrribute(final String fieldName, final int type) {
        // add extended attribute definition
        final ExtendedAttributeDefinition ead = new ExtendedAttributeDefinition();
        ead.setFieldName(fieldName);
        ead.setAlias(fieldName);

        final StringBuilder sb = new StringBuilder();
        sb.append("");
        sb.append(type);
        final String strI = sb.toString();
        ead.setFieldId(strI);

        this.properties.getExtendedAttributeFieldMap().put(fieldName, strI);

        this.project.getExtendedAttributes().add(ead);
    }

    private ExtendedAttribute createExtendAttribute(final String fieldName,
            final String fieldValue) {
        final ExtendedAttribute ea = new ExtendedAttribute();
        final String fieldId = this.properties.getExtendedAttributeFieldMap().get(fieldName);
        ea.setFieldId(fieldId);
        ea.setValue(fieldValue);
        return ea;
    }

    /**
     * Getter for the project property.
     *
     * @see project
     * @return the project property.
     */
    public Project getProject() {
        return this.project;
    }
}