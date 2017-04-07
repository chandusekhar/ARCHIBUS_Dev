package com.archibus.eventhandler.CapitalProjects;

import java.util.*;

import com.archibus.eventhandler.CapitalProjects.MsProjectConstants.TransStatus;
import com.archibus.utility.StringUtil;
import com.aspose.tasks.*;

public class MsProjectImportExportBase {
    
    Project project = null;

    MsProjectProperties properties = null;

    // map for importing
    HashMap<String, Object> map = new HashMap<String, Object>();

    // activity log map for importing
    HashMap<String, Object> actMap = new HashMap<String, Object>();

    // map of task id and activity_log id map.
    HashMap<String, String> taskAndActLogIdMap = new HashMap<String, String>();

    public MsProjectImportExportBase(final MsProjectProperties properties) {
        this.properties = properties;
    }

    public MsProjectImportExportBase(final Project project) {
        
        this.project = project;
    }
    
    public void storeDurationIntoMap(final Task task) {

        final Double duration = task.getDuration(task.getDurationFormat());
        Integer dur = Integer.valueOf(0);
        
        if (duration > 0) {
            dur = Integer.valueOf(duration.intValue());
        }
        
        this.map.put(MsProjectConstants.ACTIVITY_LOG_TRANS_FLDS.DURATION.toString(), dur);
        this.actMap.put(MsProjectConstants.ACTIVITY_LOG_FLDS.DURATION.toString(), dur);
        
    }
    
    public void storeTasksIntoActMap(final Task task) throws NumberFormatException {

        // get task name (action_title|activity_log_id)
        final String taskName = task.getName();
        String activityLogId = "";

        if (taskName != null) {
            // find the value for action_title and activity_log_id
            final Map<String, String> content = MsProjectUtility.splitContent(taskName);
            final String action_title = content.get(MsProjectConstants.ContentKey.FIRST.toString());
            activityLogId = content.get(MsProjectConstants.ContentKey.SECOND.toString());

            // store activity_log_id into maps - Integer type
            if (!StringUtil.notNull(activityLogId).equals("")) {
                this.actMap.put(MsProjectConstants.ACTIVITY_LOG_FLDS.ACTIVITY_LOG_ID.toString(),
                    Integer.valueOf(activityLogId));
            }
            this.actMap.put(MsProjectConstants.ACTIVITY_LOG_FLDS.ACTION_TITLE.toString(),
                action_title);
        }

        // store date_scheduled into maps - Date type
        final java.util.Date utilStartDate = task.getStart();
        if (utilStartDate != null) {
            final java.sql.Date sqlStartDate = new java.sql.Date(utilStartDate.getTime());
            this.actMap.put(MsProjectConstants.ACTIVITY_LOG_FLDS.DATE_SCHEDULED.toString(),
                sqlStartDate);
        }
        
        // store predecessors into activity maps - String type
        if (activityLogId != null) {
            // existing records
            this.storePredecessorsIntoMap(task, false);
        } else {
            // new records
            this.storePredecessorsIntoMap(task, true);
        }
        
        // sore pct_complete into maps - Integer type
        this.actMap.put(MsProjectConstants.ACTIVITY_LOG_FLDS.PCT_COMPLETE.toString(),
            Integer.valueOf(task.getPercentComplete()));
        
        final String wbsId = task.getWbs();
        if (wbsId != null) {
            this.actMap.put(MsProjectConstants.ACTIVITY_LOG_FLDS.WBS_ID.toString(), wbsId);
        }

    }

    protected void storePredecessorsIntoMap(final Task task, final boolean newActLogRecord) {
        final String predecessors = retrievePredecessors(task, newActLogRecord);
        if (StringUtil.notNullOrEmpty(predecessors)) {
            this.map.put(MsProjectConstants.ACTIVITY_LOG_TRANS_FLDS.PREDECESSORS.toString(),
                predecessors);
            this.actMap.put(MsProjectConstants.ACTIVITY_LOG_FLDS.PREDECESSORS.toString(),
                predecessors);
        }
        
    }

    private String retrievePredecessors(final Task task, final boolean newActLogRecord) {

        final List<TaskLink> AllLinks = this.project.getTaskLinks();
        String predsContent = "";
        for (int i = 0; i < AllLinks.size(); i++) {

            final TaskLink tsklnk = AllLinks.get(i);

            if (task.getName().compareToIgnoreCase(tsklnk.getSuccTask().getName()) == 0) {
                if (newActLogRecord) {
                    // fixes for KB# 3037151 - When importing a project with tasks with
                    // multiple predecessors only one predecessor is imported
                    if (StringUtil.notNullOrEmpty(predsContent)) {
                        predsContent = predsContent + "," + tsklnk.getPredTask().getUid();
                    } else {
                        predsContent = String.valueOf(tsklnk.getPredTask().getUid());
                    }
                } else {
                    final String predecessorTaskName = tsklnk.getPredTask().getName().trim();
                    final Map<String, String> content =
                            MsProjectUtility.splitContent(predecessorTaskName);
                    if (StringUtil.notNullOrEmpty(predsContent)) {
                        predsContent =
                                predsContent
                                        + ","
                                        + content.get(MsProjectConstants.ContentKey.SECOND
                                            .toString());
                    } else {
                        predsContent = content.get(MsProjectConstants.ContentKey.SECOND.toString());
                    }
                }
            }
        }
        return predsContent;
    }

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

        final String wbsId = task.getWbs();
        if (wbsId != null) {
            this.map.put(MsProjectConstants.ACTIVITY_LOG_TRANS_FLDS.WBS_ID.toString(), wbsId);
        }
    }

    public String storeActivityIdIntoMap(final Task task) {
        final String taskName = task.getName();
        String activityLogId = "";

        if (taskName != null) {
            
            // find the value for action_title and activity_log_id
            final Map<String, String> content = MsProjectUtility.splitContent(taskName);
            String action_title = content.get(MsProjectConstants.ContentKey.FIRST.toString());
            activityLogId = content.get(MsProjectConstants.ContentKey.SECOND.toString());

            if (StringUtil.notNullOrEmpty(activityLogId)) {
                action_title = action_title.trim();
                activityLogId = activityLogId.trim();
            }
            
            // store activity_log_id into maps - Integer type
            if (StringUtil.notNullOrEmpty(activityLogId)) {
                this.map.put(MsProjectConstants.ACTIVITY_LOG_TRANS_FLDS.ACTIVITY_LOG_ID.toString(),
                    Integer.valueOf(activityLogId));
                this.actMap.put(
                    MsProjectConstants.ACTIVITY_LOG_TRANS_FLDS.ACTIVITY_LOG_ID.toString(),
                    Integer.valueOf(activityLogId));
                
            }
            this.map.put(MsProjectConstants.ACTIVITY_LOG_TRANS_FLDS.ACTION_TITLE.toString(),
                action_title);
        }
        return activityLogId;
    }

    /**
     * Getter for the map property.
     *
     * @see map
     * @return the map property.
     */
    public Map<String, Object> getMap() {
        return this.map;
    }

    /**
     * Setter for the map property.
     *
     * @see map
     * @param map the map to set
     */
    
    public void setMap(final HashMap<String, Object> map) {
        this.map = map;
    }

    /**
     * Getter for the actMap property.
     *
     * @see actMap
     * @return the actMap property.
     */
    public HashMap<String, Object> getActMap() {
        return this.actMap;
    }

    /**
     * Setter for the actMap property.
     *
     * @see actMap
     * @param actMap the actMap to set
     */
    
    public void setActMap(final HashMap<String, Object> actMap) {
        this.actMap = actMap;
    }

    /**
     * Getter for the taskAndActLogIdMap property.
     *
     * @see taskAndActLogIdMap
     * @return the taskAndActLogIdMap property.
     */
    public HashMap<String, String> getTaskAndActLogIdMap() {
        return this.taskAndActLogIdMap;
    }
    
    /**
     * Setter for the taskAndActLogIdMap property.
     *
     * @see taskAndActLogIdMap
     * @param taskAndActLogIdMap the taskAndActLogIdMap to set
     */

    public void setTaskAndActLogIdMap(final HashMap<String, String> taskAndActLogIdMap) {
        this.taskAndActLogIdMap = taskAndActLogIdMap;
    }
}
