package com.archibus.eventhandler.CapitalProjects;

import java.util.*;

import com.archibus.db.RestrictionSqlBase.Immutable;
import com.archibus.eventhandler.CapitalProjects.MsProjectConstants.TransStatus;
import com.archibus.schema.Record;
import com.archibus.utility.*;
import com.aspose.tasks.*;

public class MsProjectImporter extends MsProjectImportExportBase {
    
    public MsProjectImporter(final Project project, final MsProjectProperties properties) {
        super(project);
        
        this.properties = properties;
    }

    Integer importIntoDb(final MsProjectPersistenceImpl persistence) {
        Integer projUid = null;
        
        try {
            final ChildTasksCollector collector = new ChildTasksCollector();

            // Collect all the tasks from RootTask using TaskUtils
            TaskUtils.apply(this.project.getRootTask(), collector, 0);

            final List<Task> tasks = collector.getTasks();

            // array to hold the list of updated items
            final List<String> actLogIds = new ArrayList<String>();
            
            this.project.setName(this.properties.getProjectName());
            
            // loop through tasks (skip the task id = 0 since it is reserv3ed
            for (int i = 1; i < tasks.size(); i++) {
                final Task task = tasks.get(i);
                
                // parental task contains the project name and the total duration for the children
                // tasks
                if (!task.getChildren().isEmpty()) {
                    this.properties.setWorkPackageId(task.getName());
                    continue;
                }

                this.storeProjWorkpkgsIntoMap(this.properties.getProjectId(),
                    this.properties.getWorkPackageId());

                this.storeExtendedAttributeIntoMap(task);

                this.storeDurationIntoMap(task);
                
                // get task name (action_title|activity_log_id)
                String activityLogId = this.storeActivityIdIntoMap(task);
                final TransStatus status = persistence.getActLogTransStatus(this.actMap);

                this.storeTasksIntoMap(task, status);

                if (StringUtil.notNullOrEmpty(activityLogId)) {
                    activityLogId = activityLogId.trim();
                    actLogIds.add(activityLogId);
                }

                // add the record into activity_log_trans table
                persistence.addOrUpdateRecord(this.map, MsProjectConstants.ACTIVITY_LOG_TRANS_TBL,
                    false);
                
                projUid =
                        (Integer) this.map
                        .get(MsProjectConstants.ACTIVITY_LOG_TRANS_FLDS.UID_MS_PROJECT
                            .toString());

                this.map.clear();
                this.actMap.clear();
            }

            // add deleted records to activity_log_trans table
            persistence.addDeletedActRecordsToTrans(this.properties, projUid);

            // prepare restriction to restrict on project_id
            final Vector<Immutable> restrictions =
                    persistence.prepareRestrictionsForLogTransTable(projUid);

            final com.archibus.db.RetrievedRecords.Immutable retrievedLogTransRecords =
                    persistence.retrieveRecordsForTable(MsProjectConstants.ACTIVITY_LOG_TRANS_TBL,
                        restrictions);
            for (final Object element : retrievedLogTransRecords.getRecordset().getRecords()) {
                final Record.Immutable record = (Record.Immutable) element;
                final Integer actLogId =
                        (Integer) record.findFieldValue(MsProjectConstants.ACTIVITY_LOG_TRANS_TBL
                            + "."
                            + MsProjectConstants.ACTIVITY_LOG_TRANS_FLDS.ACTIVITY_LOG_ID
                            .toString());
                final String status =
                        (String) record.findFieldValue(MsProjectConstants.ACTIVITY_LOG_TRANS_TBL
                                + "."
                                + MsProjectConstants.ACTIVITY_LOG_TRANS_FLDS.STATUS.toString());
                if (status.compareToIgnoreCase(TransStatus.NEW.toString()) != 0
                        && (actLogIds.size() == 0 || !actLogIds.contains(actLogId.toString()))) {
                    final HashMap<String, Object> actMap1 = new HashMap<String, Object>();
                    actMap1.put(
                        MsProjectConstants.ACTIVITY_LOG_TRANS_FLDS.ACTIVITY_LOG_ID.toString(),
                        actLogId);
                    actMap1.put(MsProjectConstants.ACTIVITY_LOG_TRANS_FLDS.STATUS.toString(),
                        TransStatus.DELETED.toString());
                    persistence.addOrUpdateRecord(actMap1,
                        MsProjectConstants.ACTIVITY_LOG_TRANS_TBL, true);
                }
            }
            
        } catch (final ExceptionBase ex) {
            final ExceptionBase exception = new ExceptionBase();
            exception.setPattern(ex.getPattern());
            exception.setArgs(ex.getArgs());
            exception.setTranslatable(true);
            throw exception;
        }
        return projUid;
    }

    /**
     * Description of the Method
     *
     * @param project Description of the Parameter
     */
    public void storeProjWorkpkgsIntoMap(final String projectId, final String workPackageId) {

        final String projectIdTrimmed = StringUtil.notNull(projectId).trim();
        final String workPackageIdTrimmed = StringUtil.notNull(workPackageId).trim();
        
        this.map.put(MsProjectConstants.ACTIVITY_LOG_TRANS_FLDS.PROJECT_ID.toString(),
            projectIdTrimmed);

        this.map.put(MsProjectConstants.ACTIVITY_LOG_TRANS_FLDS.WORK_PKG_ID.toString(),
            workPackageIdTrimmed);
        
        // set the project is field for activity_log_trans table
        if (this.properties.isHasWorkpackage()) {
            this.map.put(MsProjectConstants.ACTIVITY_LOG_TRANS_FLDS.PROJECT_WORK_PKG_ID.toString(),
                projectIdTrimmed + "|" + workPackageIdTrimmed);
        } else {
            this.map.put(MsProjectConstants.ACTIVITY_LOG_TRANS_FLDS.PROJECT_WORK_PKG_ID.toString(),
                projectIdTrimmed);
        }
        
        final String uid = this.project.getSubject();
        if (uid != null) {
            this.map.put(MsProjectConstants.ACTIVITY_LOG_TRANS_FLDS.UID_MS_PROJECT.toString(),
                Integer.valueOf(uid));
        }

        // set the project_id and work_package_id fields for activity_Log table
        this.actMap.put(MsProjectConstants.ACTIVITY_LOG_FLDS.PROJECT_ID.toString(),
            projectIdTrimmed);
        this.actMap.put(MsProjectConstants.ACTIVITY_LOG_FLDS.WORK_PKG_ID.toString(),
            workPackageIdTrimmed);

    }
    
    public void storeExtendedAttributeIntoMap(final Task task) {
        
        final List<ExtendedAttribute> extendedAttribute = task.getExtendedAttribute();
        
        // loop through each attribute
        for (final Object element : extendedAttribute) {
            final ExtendedAttribute attribute = (ExtendedAttribute) element;
            final String attributeName = attribute.getAttributeDefinition().getAlias();
            final String attributeValue = StringUtil.notNull(attribute.getValue()).trim();

            if (attributeName.compareToIgnoreCase(MsProjectConstants.ACTIVITY_LOG_FLDS.ASSIGNED_TO
                .toString()) == 0) {
                // store the assigned_to and comments fields to mapszz
                this.map.put(MsProjectConstants.ACTIVITY_LOG_TRANS_FLDS.ASSIGNED_TO.toString(),
                    attributeValue);

                // store the assigned_to fields to activity maps
                this.actMap.put(MsProjectConstants.ACTIVITY_LOG_FLDS.ASSIGNED_TO.toString(),
                    attributeValue);
            } else if (attributeName
                .compareToIgnoreCase(MsProjectConstants.ACTIVITY_LOG_FLDS.COMMENTS.toString()) == 0) {
                // store the assigned_to and comments fields to mapszz
                this.map.put(MsProjectConstants.ACTIVITY_LOG_TRANS_FLDS.COMMENTS.toString(),
                    attributeValue);
                // store the comments fields to activity maps
                this.actMap.put(MsProjectConstants.ACTIVITY_LOG_FLDS.COMMENTS.toString(),
                    attributeValue);
            } else if (attributeName
                .compareToIgnoreCase(MsProjectConstants.ACTIVITY_LOG_FLDS.ACTIVITY_TYPE.toString()) == 0) {
                // store the activity_type fields to activity maps
                this.actMap.put(MsProjectConstants.ACTIVITY_LOG_FLDS.ACTIVITY_TYPE.toString(),
                    attributeValue);
            }
        }

    }

    public String importPostTrans(final String uid, MsProjectPersistenceImpl persistence) {

        if (persistence == null) {
            persistence = new MsProjectPersistenceImpl();
        }

        // Collect all the tasks from RootTask using TaskUtils
        final ChildTasksCollector collector = new ChildTasksCollector();
        TaskUtils.apply(this.project.getRootTask(), collector, 0);
        final List<Task> tasks = collector.getTasks();

        // array to hold the list of updated items
        String activityLogIds = "";
        
        this.project.setName(this.properties.getProjectId());
        
        // loop through tasks
        for (int i = 0; i < tasks.size(); i++) {
            final Task task = tasks.get(i);

            // parental task contains the project name and the total duration for the children
            // tasks
            if (!task.getChildren().isEmpty()) {
                this.properties.setWorkPackageId(task.getName());
                continue;
            }

            this.storeProjWorkpkgsIntoMap(this.properties.getProjectId(),
                this.properties.getWorkPackageId());

            this.storeExtendedAttributeIntoMap(task);

            this.storeDurationIntoMap(task);

            persistence.getActLogTransStatus(this.actMap);
            
            this.storeTasksIntoActMap(task);
            
            // add the record into activity_log_trans table
            final Integer activityLogId = persistence.addActLogRecord(this.map, this.actMap);
            if (activityLogId != null) {
                this.taskAndActLogIdMap.put(StringUtil.toString(task.getUid()),
                    activityLogId.toString());
                if (activityLogIds.length() > 0) {
                    activityLogIds += ",'" + activityLogId + "'";
                } else {
                    activityLogIds = "'" + activityLogId + "'";
                }
            }
            
            this.map.clear();
            this.actMap.clear();
        }

        persistence.setActLogsStatus(uid);

        return activityLogIds;
    }

}