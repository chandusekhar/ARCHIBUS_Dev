package com.archibus.eventhandler.eam.requirements;

import java.util.*;

import com.archibus.app.common.metrics.SchemaUtilities;
import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.*;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.JobStatus;
import com.archibus.service.DocumentService;
import com.archibus.service.DocumentService.DocumentParameters;
import com.archibus.utility.*;

/**
 * Helper class for project requirement service.
 * <p>
 *
 *
 * @author Ioan Draghici
 * @since 22.1
 *
 */
public class ProjectRequirementHelper {
    /**
     * Constant.
     */
    // @translatable
    public static final String TXT_TITLE_COPY_SUFFIX = " - copy";

    /**
     * Copy work packages from project to project.
     *
     * @param srcProjectId source project id
     * @param destProjectId destination project id
     * @param workPckgIds work package id's
     */
    public void copyWorkPackagesToProject(final String srcProjectId, final String destProjectId,
            final List<String> workPckgIds) {
        final DataSource workPckDs = getDataSourceForTable(Constants.TABLE_WORK_PKGS);
        String inValue = "";
        for (final String workPkgId : workPckgIds) {
            inValue += workPkgId + Constants.COMMA;
        }
        inValue = inValue.substring(0, inValue.length() - 1);
        workPckDs.addRestriction(Restrictions.and(
            Restrictions.eq(Constants.TABLE_WORK_PKGS, Constants.PROJECT_ID, srcProjectId),
            Restrictions.in(Constants.TABLE_WORK_PKGS, Constants.WORK_PKG_ID, inValue)));
        final List<DataRecord> records = workPckDs.getRecords();
        for (final DataRecord record : records) {
            final DataRecord newRecord = record;
            final String workPckgId = record
                .getString(Constants.TABLE_WORK_PKGS + Constants.DOT + Constants.WORK_PKG_ID)
                    + getLocalizedMessage(TXT_TITLE_COPY_SUFFIX);
            newRecord.setValue(Constants.TABLE_WORK_PKGS + Constants.DOT + Constants.WORK_PKG_ID,
                workPckgId);
            newRecord.setValue(Constants.TABLE_WORK_PKGS + Constants.DOT + Constants.PROJECT_ID,
                destProjectId);
            newRecord.setNew(true);
            workPckDs.saveRecord(newRecord);

            final List<Integer> actionIds = getActionIds(srcProjectId, workPckgId);
            if (!actionIds.isEmpty()) {
                copyActionsToProjectAndWorkPackage(destProjectId, workPckgId, actionIds);
            }
        }
    }

    /**
     * Copy actions from project to project.
     *
     * @param destProjectId destination project
     * @param destWorkPkgId destination work package id
     * @param actionIds action id's list
     */
    public void copyActionsToProjectAndWorkPackage(final String destProjectId,
            final String destWorkPkgId, final List<Integer> actionIds) {
        final DataSource activityLogDs = getDataSourceForTable(Constants.TABLE_ACTIVITY_LOG);
        String inValue = "";
        for (final Integer actionId : actionIds) {
            inValue += actionId.toString() + Constants.COMMA;
        }
        inValue = inValue.substring(0, inValue.length() - 1);

        activityLogDs.addRestriction(
            Restrictions.in(Constants.TABLE_ACTIVITY_LOG, Constants.ACTIVITY_LOG_ID, inValue));

        final List<DataRecord> records = activityLogDs.getRecords();
        for (final DataRecord record : records) {
            final DataRecord newRecord = record;
            final String actionTitle = newRecord
                .getString(Constants.TABLE_ACTIVITY_LOG + Constants.DOT + Constants.ACTION_TITLE);
            newRecord.setValue(
                Constants.TABLE_ACTIVITY_LOG + Constants.DOT + Constants.ACTION_TITLE,
                actionTitle + getLocalizedMessage(TXT_TITLE_COPY_SUFFIX));
            newRecord.setValue(Constants.TABLE_ACTIVITY_LOG + Constants.DOT + Constants.PROJECT_ID,
                destProjectId);
            newRecord.setValue(Constants.TABLE_ACTIVITY_LOG + Constants.DOT + Constants.WORK_PKG_ID,
                destWorkPkgId);
            newRecord.setNew(true);
            newRecord.removeField(newRecord.findField(
                Constants.TABLE_ACTIVITY_LOG + Constants.DOT + Constants.ACTIVITY_LOG_ID));
            activityLogDs.saveRecord(newRecord);
        }
    }

    /**
     * Update selected actions.
     *
     * @param record data record
     * @param actionIds action id's list
     *
     *            <p>
     *            Suppress PMD warning "AvoidUsingSql" in this class.
     *            <p>
     *            Justification: Case #2.2. Statements with UPDATE ... WHERE pattern.
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    public void updateActions(final DataRecord record, final List<Integer> actionIds) {
        String updateStatement = "UPDATE activity_log  SET ";
        final List<DataValue> fields = record.getFields();
        for (final DataValue field : fields) {
            final String fieldName = field.getName();
            final Object fieldValue = field.getValue();
            if (StringUtil.notNullOrEmpty(fieldValue)) {
                updateStatement += fieldName + " =  " + SqlUtils.formatValueForSql(fieldValue)
                        + Constants.COMMA;
            }
        }
        // remove last comma
        updateStatement = updateStatement.substring(0, updateStatement.length() - 1);
        String inValue = "";
        for (final Integer actionId : actionIds) {
            inValue += actionId.toString() + Constants.COMMA;
        }
        inValue = inValue.substring(0, inValue.length() - 1);
        updateStatement += "WHERE activity_log.activity_log_id IN (" + inValue + ")";

        SqlUtils.executeUpdate(Constants.TABLE_ACTIVITY_LOG, updateStatement);
    }

    /**
     * Delete action from proposal console details view.
     *
     * @param type action type ('info' - reset information, 'action' - delete actions)
     * @param fields field names and values
     * @param projects selected projects
     *            <p>
     *            Suppress PMD warning "AvoidUsingSql" in this class.
     *            <p>
     *            Justification: Case #. Bulk update.Case #. Bulk delete.
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    public void deleteFromProjectDetails(final String type, final Map<String, String> fields,
            final List<String> projects) {
        String deleteStatement = "";
        String fieldUpdate = "";
        String fieldRestr = "";
        final Iterator<String> itKeys = fields.keySet().iterator();
        while (itKeys.hasNext()) {
            final String key = itKeys.next();
            final String value = fields.get(key);

            fieldUpdate += Constants.TABLE_ACTIVITY_LOG + Constants.DOT + key + " = NULL,";
            fieldRestr += "AND " + Constants.TABLE_ACTIVITY_LOG + Constants.DOT + key + " = "
                    + SqlUtils.formatValueForSql(value);
        }
        fieldUpdate = fieldUpdate.substring(0, fieldUpdate.length() - 1);

        if (Constants.ACTION_TYPE_LINK.equals(type)) {
            deleteStatement = "UPDATE activity_log SET " + fieldUpdate;

        } else if (Constants.ACTION_TYPE_ACTION.equals(type)) {
            deleteStatement = "DELETE FROM activity_log ";
        }

        String projectRestr = "";
        for (final String projectId : projects) {
            projectRestr += SqlUtils.formatValueForSql(projectId) + Constants.COMMA;
        }

        projectRestr = projectRestr.substring(0, projectRestr.length() - 1);
        deleteStatement += " WHERE activity_log.project_id IN (" + projectRestr + ") " + fieldRestr;

        SqlUtils.executeUpdate(Constants.TABLE_ACTIVITY_LOG, deleteStatement);

    }

    /**
     *
     * Get project data based on projectId.
     *
     * @param projectId projectId
     * @return project data record
     */
    public DataRecord getProjectData(final String projectId) {
        final DataSource projectDS = getDataSourceForTable(Constants.TABLE_PROJECT);
        projectDS.addRestriction(
            Restrictions.eq(Constants.TABLE_PROJECT, Constants.PROJECT_ID, projectId));
        return projectDS.getRecord();
    }

    /**
     *
     * Get work package data based on projectId.
     *
     * @param projectId projectId
     * @return list of work package data record
     */
    public List<DataRecord> getWorkPackageData(final String projectId) {
        final DataSource workPckDs = getDataSourceForTable(Constants.TABLE_WORK_PKGS);
        workPckDs.addRestriction(
            Restrictions.eq(Constants.TABLE_WORK_PKGS, Constants.PROJECT_ID, projectId));
        return workPckDs.getRecords();
    }

    /**
     *
     * Get actions based on projectId and work package id.
     *
     * @param projectId projectId
     * @param workPkgId workPkgId
     * @return list of action (activity_log) data record
     */
    public List<DataRecord> getActions(final String projectId, final String workPkgId) {
        final DataSource activityLogDs = getDataSourceForTable(Constants.TABLE_ACTIVITY_LOG);
        activityLogDs.addRestriction(Restrictions.and(
            Restrictions.eq(Constants.TABLE_ACTIVITY_LOG, Constants.PROJECT_ID, projectId),
            Restrictions.eq(Constants.TABLE_ACTIVITY_LOG, Constants.WORK_PKG_ID, workPkgId)));
        return activityLogDs.getRecords();

    }

    /**
     * Create datasource for specified table and all fields.
     *
     * @param tableName table name
     * @return DataSource object
     */
    private DataSource getDataSourceForTable(final String tableName) {
        final List<String> fieldsList = SchemaUtilities.getTableFields(tableName);
        final String[] fields = Utility.listToArray(fieldsList);
        return DataSourceFactory.createDataSourceForFields(tableName, fields);
    }

    /**
     * Get all action id's for project and work package.
     *
     * @param projectId project id
     * @param workPkgId work package id
     * @return List<Integer>
     */
    private List<Integer> getActionIds(final String projectId, final String workPkgId) {
        final DataSource activityLogDs = DataSourceFactory
            .createDataSourceForFields(Constants.TABLE_ACTIVITY_LOG, new String[] {
                    Constants.ACTIVITY_LOG_ID, Constants.PROJECT_ID, Constants.WORK_PKG_ID });
        activityLogDs.addRestriction(Restrictions.and(
            Restrictions.eq(Constants.TABLE_ACTIVITY_LOG, Constants.PROJECT_ID, projectId),
            Restrictions.eq(Constants.TABLE_ACTIVITY_LOG, Constants.WORK_PKG_ID, workPkgId)));
        final List<DataRecord> records = activityLogDs.getRecords();
        final List<Integer> activityLogIds = new ArrayList<Integer>();
        for (final DataRecord record : records) {
            activityLogIds.add(record
                .getInt(Constants.TABLE_ACTIVITY_LOG + Constants.DOT + Constants.ACTIVITY_LOG_ID));
        }
        return activityLogIds;
    }

    /**
     * Copy documents assigned to source record into the target record.
     *
     * @param sourceDocId source docs_assigned.doc_id
     * @param targetDocId target docs_assigned.doc_id
     */
    public void copyDocuments(final String sourceDocId, final String targetDocId) {
        final String docTable = Constants.DOCS_ASSIGNED;
        final String docField = Constants.DOC;
        final String[] docFields = { Constants.DOC_ID, Constants.DOC, Constants.DESCRIPTION };

        final DataSource docsAssignedDs =
                DataSourceFactory.createDataSourceForFields(docTable, docFields);
        docsAssignedDs.addRestriction(Restrictions.eq(docTable, Constants.DOC_ID, sourceDocId));
        final DataRecord sourceRecord = docsAssignedDs.getRecord();

        // get document service object
        final DocumentService documentService =
                (DocumentService) ContextStore.get().getBean("documentService");
        // document prop
        final String fileName =
                sourceRecord.getString(Constants.DOCS_ASSIGNED + Constants.DOT + Constants.DOC);
        final String fileDescription = sourceRecord
            .getString(Constants.DOCS_ASSIGNED + Constants.DOT + Constants.DESCRIPTION);

        // source doc parameters
        final Map<String, String> sourceKeys = new HashMap<String, String>();
        sourceKeys.put(Constants.DOC_ID, sourceDocId);
        final DocumentParameters sourceDocParam =
                new DocumentParameters(sourceKeys, docTable, docField, null, true);

        // target document parameters
        final Map<String, String> targetKeys = new HashMap<String, String>();
        targetKeys.put(Constants.DOC_ID, targetDocId);
        final DocumentParameters targetDocParam = new DocumentParameters(targetKeys, docTable,
            docField, fileName, fileDescription, "0");

        // copy document
        documentService.copyDocument(sourceDocParam, targetDocParam);
    }

    /**
     *
     * Generate Power Point Presentation based on selected <code>project</code>.
     *
     *
     * @param projectId projectId
     * @param jobStatus job status
     */
    public void generatePPTPresentation(final String projectId, final JobStatus jobStatus) {
        new ProjectPPTGenerate().generatePPT(projectId, jobStatus);
    }

    /**
     * Get baseline locations field value.
     *
     * @param bldgFloors selected floors
     * @return string
     */
    public String getBaselineLocations(final Map<String, List<String>> bldgFloors) {
        String result = "";
        final Iterator<String> keys = bldgFloors.keySet().iterator();
        while (keys.hasNext()) {
            final String blId = keys.next();
            final List<String> floors = bldgFloors.get(blId);
            for (int index = 0; index < floors.size(); index++) {
                final String flId = floors.get(index);
                result += Constants.SEMICOLON + blId + Constants.SEMICOLON + flId;
            }
        }
        if (result.length() > 0 && result.indexOf(Constants.SEMICOLON) == 0) {
            result = result.substring(Constants.SEMICOLON.length());
        }
        return result;
    }

    /**
     * Returns localized string.
     *
     * @param message message name
     * @return string
     */
    private String getLocalizedMessage(final String message) {
        return EventHandlerBase.localizeString(ContextStore.get().getEventHandlerContext(), message,
            "com.archibus.eventhandler.eam.requirements.ProjectRequirementHelper");
    }
}
