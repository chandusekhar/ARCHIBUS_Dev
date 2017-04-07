package com.archibus.eventhandler.CapitalProjects;

import java.util.Map;

import com.archibus.utility.*;

public class MsTaskProperties {
    
    private String taskName;

    private java.sql.Date taskStartDate;

    private Integer duration;

    private Integer pctComplete;

    private String predecessors;

    private Integer daysPerWeek;

    private final String assignedTo;

    private final String comments;

    private final String activityType;

    private final String wbsId;

    public MsTaskProperties(final Map<String, Object> map) {
        super();

        this.taskName = this.getTaskName(map);

        this.taskStartDate =
                (java.sql.Date) map.get(MsProjectConstants.ACTIVITY_LOG_FLDS.DATE_SCHEDULED
                    .toString());
        this.duration = (Integer) map.get(MsProjectConstants.ACTIVITY_LOG_FLDS.DURATION.toString());

        this.pctComplete =
                (Integer) map.get(MsProjectConstants.ACTIVITY_LOG_FLDS.PCT_COMPLETE.toString());
        this.predecessors =
                (String) map.get(MsProjectConstants.ACTIVITY_LOG_FLDS.PREDECESSORS.toString());
        this.daysPerWeek =
                (Integer) map.get(MsProjectConstants.WORK_PKGS_FLDS.DAYS_PER_WEEK.toString());
        this.assignedTo =
                StringUtil.notNull(map.get(MsProjectConstants.ACTIVITY_LOG_FLDS.ASSIGNED_TO
                    .toString()));

        this.comments =
                StringUtil
                .notNull(map.get(MsProjectConstants.ACTIVITY_LOG_FLDS.COMMENTS.toString()));
        
        this.activityType =
                StringUtil.notNull(map.get(MsProjectConstants.ACTIVITY_LOG_FLDS.ACTIVITY_TYPE
                    .toString()));
        this.wbsId =
                StringUtil.notNull(map.get(MsProjectConstants.ACTIVITY_LOG_FLDS.WBS_ID.toString()));
        
    }
    
    public void validate(final String activityLogId) {
        final ExceptionBase exception = new ExceptionBase();
        exception.setTranslatable(true);
        
        if (this.daysPerWeek < 0 || this.daysPerWeek > 7) {
            final String errorMsg =
                    "Export Failed: The value [{0}] of field [Days Per Week] for Action Item ID [{1}] has to be an integer between 0 and 7. Please modify the value in the database and try to export again.";
            exception.setPattern(errorMsg);
            exception.setArgs(new Object[] { this.daysPerWeek, activityLogId });
            throw exception;

        }

        if (this.taskStartDate == null) {
            final String errorMsg =
                    "Export Failed: The value [{0}] of field [Start Date] for Action Item ID [{1}] can not be null. Please modify the value in the database and try to export again.";
            exception.setPattern(errorMsg);
            exception
                .setArgs(new Object[] { StringUtil.notNull(this.taskStartDate), activityLogId });
            throw exception;
            
        }

        // For MS project, duration will be calculate by assignemnet's work by hours*units/8
        // (assumne 8 is standard working days)
        if (this.duration == null || this.duration.intValue() < 0) {
            // @translatable
            final String errorMsg =
                    "Export Failed: The value [{0}] of field [Duration - Est. Design (Days)] for Action Item ID [{1}] cannot be NULL or a negative number. Please modify the value in the database and try to export again.";
            exception.setPattern(errorMsg);
            exception.setArgs(new Object[] { this.duration, activityLogId });
            throw exception;
        }
    }
    
    /**
     * Getter for the taskName property.
     *
     * @see taskName
     * @return the taskName property.
     */
    public String getTaskName() {
        return this.taskName;
    }
    
    /**
     * Setter for the taskName property.
     *
     * @see taskName
     * @param taskName the taskName to set
     */

    public void setTaskName(final String taskName) {
        this.taskName = taskName;
    }
    
    /**
     * Getter for the taskStartDate property.
     *
     * @see taskStartDate
     * @return the taskStartDate property.
     */
    public java.sql.Date getTaskStartDate() {
        return this.taskStartDate;
    }
    
    /**
     * Setter for the taskStartDate property.
     *
     * @see taskStartDate
     * @param taskStartDate the taskStartDate to set
     */

    public void setTaskStartDate(final java.sql.Date taskStartDate) {
        this.taskStartDate = taskStartDate;
    }
    
    /**
     * Getter for the durations property.
     *
     * @see durations
     * @return the durations property.
     */
    public Integer getDuration() {
        return this.duration;
    }
    
    /**
     * Setter for the durations property.
     *
     * @see durations
     * @param durations the durations to set
     */

    public void setDuration(final Integer duration) {
        this.duration = duration;
    }
    
    /**
     * Getter for the pctComplete property.
     *
     * @see pctComplete
     * @return the pctComplete property.
     */
    public Integer getPctComplete() {
        return this.pctComplete;
    }
    
    /**
     * Setter for the pctComplete property.
     *
     * @see pctComplete
     * @param pctComplete the pctComplete to set
     */

    public void setPctComplete(final Integer pctComplete) {
        this.pctComplete = pctComplete;
    }
    
    /**
     * Getter for the predecessors property.
     *
     * @see predecessors
     * @return the predecessors property.
     */
    public String getPredecessors() {
        return this.predecessors;
    }
    
    /**
     * Setter for the predecessors property.
     *
     * @see predecessors
     * @param predecessors the predecessors to set
     */

    public void setPredecessors(final String predecessors) {
        this.predecessors = predecessors;
    }
    
    /**
     * Getter for the daysPerWeek property.
     *
     * @see daysPerWeek
     * @return the daysPerWeek property.
     */
    public Integer getDaysPerWeek() {
        return this.daysPerWeek;
    }
    
    /**
     * Setter for the daysPerWeek property.
     *
     * @see daysPerWeek
     * @param daysPerWeek the daysPerWeek to set
     */

    public void setDaysPerWeek(final Integer daysPerWeek) {
        this.daysPerWeek = daysPerWeek;
    }
    
    private String getTaskName(final Map<String, Object> map) {
        String taskName = "";
        if (map.get(MsProjectConstants.ACTIVITY_LOG_FLDS.ACTION_TITLE.toString()) != null
                && map.get(MsProjectConstants.ACTIVITY_LOG_FLDS.ACTIVITY_LOG_ID.toString()) != null) {
            taskName =
                    map.get(MsProjectConstants.ACTIVITY_LOG_FLDS.ACTION_TITLE.toString())
                    .toString()
                    + "|"
                    + map.get(
                        MsProjectConstants.ACTIVITY_LOG_FLDS.ACTIVITY_LOG_ID.toString())
                        .toString();
        } else if (map.get(MsProjectConstants.ACTIVITY_LOG_FLDS.ACTIVITY_LOG_ID.toString()) != null) {
            taskName =
                    "|"
                            + map.get(
                                MsProjectConstants.ACTIVITY_LOG_FLDS.ACTIVITY_LOG_ID.toString())
                                .toString();
        } else if (map.get(MsProjectConstants.ACTIVITY_LOG_FLDS.ACTION_TITLE.toString()) != null) {
            taskName =
                    map.get(MsProjectConstants.ACTIVITY_LOG_FLDS.ACTION_TITLE.toString())
                    .toString() + "|";
        }
        return taskName;
    }

    public String getAssignedTo() {
        return this.assignedTo;
    }

    public String getComments() {
        return this.comments;
    }

    public String getActivityType() {
        return this.activityType;
    }
    
    public String getWbsId() {
        return this.wbsId;
    }
}
