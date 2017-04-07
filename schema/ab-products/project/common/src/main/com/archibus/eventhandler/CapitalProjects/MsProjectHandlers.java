package com.archibus.eventhandler.CapitalProjects;

import java.io.*;
import java.util.*;

import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.eventhandler.CapitalProjects.MsProjectConstants.MsProjectVersion;
import com.archibus.jobmanager.*;
import com.archibus.utility.*;
import com.aspose.tasks.Project;

/**
 * This event handler implements business logic related to Export/Import to MS Project. Copyright
 * (c) 2005, ARCHIBUS, Inc.
 *
 * @author Ying Qin
 * @since July 28, 2005
 * @version 1.0
 */

public class MsProjectHandlers extends EventHandlerBase {

    static private boolean licenseLoaded = false;

    /**
     * Description of the Method
     *
     * @param context Description of the Parameter
     * @exception ExceptionBase Description of the Exception
     */
    public final void exportToMsProject(final EventHandlerContext context) throws ExceptionBase {

        if (!licenseLoaded) {
            licenseLoaded = MsProjectUtility.loadTasksLibraryLicense();
        }
        
        final MsProjectProperties properties =
                new MsProjectProperties(StringUtil.toString(context.getParameter("project_id")),
                    StringUtil.toString(context.getParameter("work_pkg_id")));
        
        final String version = StringUtil.toString(context.getParameter("version"));
        properties.setVersion(MsProjectVersion.fromString(version));
        final MsProjectPersistenceImpl persistence = new MsProjectPersistenceImpl();
        final MsProjectExporter projectExporter =
                new MsProjectExporter(properties, persistence.retrieveMaxUid().toString());
        
        final ByteArrayOutputStream outStream = projectExporter.exportFromDb();

        final MppDocument mppDoc = new MppDocument(outStream);
        mppDoc.upload(properties, persistence);

        context.addResponseParameter("inputStream", mppDoc.getInputStream());
        context.addResponseParameter("rendered", "true");
        context.addResponseParameter("fileName", properties.getServerFileName());
        context.addResponseParameter("contentType", "application/msproject");
        context.addResponseParameter("contentDisposition", "attachment; filename=");
        
    }
    
    public void importFromMsProject(final EventHandlerContext context) throws ExceptionBase,
            IOException {

        if (!licenseLoaded) {
            licenseLoaded = MsProjectUtility.loadTasksLibraryLicense();
        }

        final MsProjectProperties properties =
                new MsProjectProperties(StringUtil.toString(context.getParameter("project_id")),
                    StringUtil.toString(context.getParameter("work_pkg_id")));

        final MppDocument mppDoc = new MppDocument(null);

        final MsProjectPersistenceImpl persistence = new MsProjectPersistenceImpl();
        final Project project = mppDoc.download(properties, persistence);

        final MsProjectImporter projectImporter = new MsProjectImporter(project, properties);
        
        final Integer projectUID = projectImporter.importIntoDb(persistence);

        context.addResponseParameter("project_uid", projectUID);
    }
    
    public void importClearTransactions(final EventHandlerContext context) throws ExceptionBase,
    IOException {

        if (!licenseLoaded) {
            licenseLoaded = MsProjectUtility.loadTasksLibraryLicense();
        }

        final MsProjectProperties properties = getMsProjectProperties(context);
        
        final MppDocument mppDoc = new MppDocument(null);
        final Project project = mppDoc.download(properties, null);
        
        final String uid = project.getSubject();

        // clear the acticity_log_trans record for uid (project unique id)
        clearActLogTransRecord(context, uid);
        
    }

    public void importPostTransactions(final EventHandlerContext context) throws ExceptionBase,
            IOException {
        
        if (!licenseLoaded) {
            licenseLoaded = MsProjectUtility.loadTasksLibraryLicense();
        }

        final MsProjectProperties properties = getMsProjectProperties(context);
        
        final MsProjectPersistenceImpl persistence = new MsProjectPersistenceImpl();
        
        final MppDocument mppDoc = new MppDocument(null);
        final Project project = mppDoc.download(properties, persistence);
        
        final String uid = project.getSubject();
        final MsProjectImporter projectImporter = new MsProjectImporter(project, properties);
        final String activityIds = projectImporter.importPostTrans(uid, persistence);

        updateActLogsPredecessors(context, projectImporter.getTaskAndActLogIdMap(), activityIds);

        // recalculate activity_date_scheduled_end
        reCalcActLogDateSchedEnd(context, properties);
        
    }
    
    private MsProjectProperties getMsProjectProperties(final EventHandlerContext context)
            throws ExceptionBase {
        final String project_work_pkg_id = (String) context.getParameter("project_work_pkg_id");
        
        final Map<String, String> map = MsProjectUtility.splitContent(project_work_pkg_id);
        final String projectId = map.get(MsProjectConstants.ContentKey.FIRST.toString());
        final String workPkgId = map.get(MsProjectConstants.ContentKey.SECOND.toString());
        final MsProjectProperties properties = new MsProjectProperties(projectId, workPkgId);
        return properties;
    }
    
    /**
     * Updates the activity_log table's predecessors field for the new records
     *
     * @param context - Event Handler Context
     * @param taskAndActLogIdMap - the map of task's UID and the activity_log id.
     * @param activityLogIds - the newly inserted activity logs
     */
    private void updateActLogsPredecessors(final EventHandlerContext context,
            final HashMap<String, String> taskAndActLogIdMap, final String activityLogIds) {
        final Iterator<Map.Entry<String, String>> it2 = taskAndActLogIdMap.entrySet().iterator();
        while (it2.hasNext()) {
            final Map.Entry<String, String> pairs = it2.next();
            final String value = pairs.getValue();
            final String key = pairs.getKey();

            String sql =
                    "UPDATE " + MsProjectConstants.ACTIVITY_LOG_TBL + " SET predecessors = '"
                            + value + "' WHERE predecessors ='" + key
                            + "' AND activity_log_id IN (" + activityLogIds + ")";
            executeDbSql(context, sql, false);

            // The following three SQL is the fixes for KB# 3037151 - When importing a project with
            // tasks with multiple predecessors only one predecessor is imported
            // first element
            sql =
                    "UPDATE " + MsProjectConstants.ACTIVITY_LOG_TBL
                    + " SET predecessors = REPLACE(predecessors,'" + key + ",','" + value
                            + ",')" + " WHERE predecessors LIKE '" + key + ",%"
                    + "' AND activity_log_id IN (" + activityLogIds + ")";
            executeDbSql(context, sql, false);

            // last element
            sql =
                    "UPDATE " + MsProjectConstants.ACTIVITY_LOG_TBL
                    + " SET predecessors = REPLACE(predecessors,'," + key + "','," + value
                    + "')" + " WHERE predecessors LIKE '%," + key + "'"
                    + " AND activity_log_id IN (" + activityLogIds + ")";
            executeDbSql(context, sql, false);

            // middle element
            sql =
                    "UPDATE " + MsProjectConstants.ACTIVITY_LOG_TBL
                    + " SET predecessors = REPLACE(predecessors,'," + key + ",','," + value
                    + ",')" + " WHERE predecessors LIKE '%," + key + ",%'"
                            + " AND activity_log_id IN (" + activityLogIds + ")";
            executeDbSql(context, sql, false);

            it2.remove(); // avoids a ConcurrentModificationException
        }
    }
    
    @SuppressWarnings("deprecation")
    private void reCalcActLogDateSchedEnd(final EventHandlerContext context,
            final MsProjectProperties properties) {
        
        context.addResponseParameter("project_id", properties.getProjectId());
        context.addResponseParameter("work_pkg_id", properties.getWorkPackageId());

        final WorkflowRulesContainer.Immutable container =
                EventHandlerBase.getWorkflowRulesContainer(context);
        final WorkflowRule.Immutable workflowRule =
                container.getWorkflowRule("AbCommonResources-ActionService");
        
        if (StringUtil.notNullOrEmpty(properties.getWorkPackageId())) {
            container.runRule(workflowRule, "calcActivityLogDateSchedEndForWorkPkg", context);
        } else {
            container.runRule(workflowRule, "calcActivityLogDateSchedEndForProject", context);
        }
    }

    private void clearActLogTransRecord(final EventHandlerContext context, final String uid) {
        
        String sql =
                "DELETE FROM " + MsProjectConstants.ACTIVITY_LOG_TRANS_TBL + " WHERE "
                        + MsProjectConstants.ACTIVITY_LOG_TRANS_FLDS.UID_MS_PROJECT.toString();
        
        if (uid != null) {
            sql = sql + "=" + uid;
        } else {
            sql = sql + " IS NULL";
        }
        
        executeDbSql(context, sql, false);
        
    }
}
