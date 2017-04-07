package com.archibus.eventhandler.CapitalProjects;

import java.util.*;

import com.archibus.config.*;
import com.archibus.context.*;
import com.archibus.db.*;
import com.archibus.db.RestrictionSqlBase.Immutable;
import com.archibus.eventhandler.CapitalProjects.MsProjectConstants.*;
import com.archibus.schema.*;
import com.archibus.utility.ExceptionBase;

/**
 * <p>
 *
 * Title: WebCentral
 * </p>
 * <p>
 *
 * Description: WebCentral - Trinidad project
 * </p>
 * <p>
 *
 * Copyright: Copyright � 1984-2005 ARCHIBUS, Inc. All Rights Reserved.
 * </p>
 * <p>
 *
 * Company: ARCHIBUS, Inc.
 * </p>
 *
 * @author Ying Qin
 * @since August 3, 2005
 * @version 1.0
 */

public class MsProjectPersistenceImpl {

    UserSession.Immutable userSession = null;

    Database.Immutable database = null;

    Database.Immutable schema = null;

    /**
     * Default constructor.
     */
    public MsProjectPersistenceImpl() {
        super();

        this.userSession = ContextStore.get().getUserSession();

        this.database = this.userSession.findDatabase(DatabaseRole.DATA.toString());

        this.schema = this.userSession.findDatabase(DatabaseRole.SCHEMA.toString());

    }

    /**
     * Description of the Method
     *
     * @param context Description of the Parameter
     * @return Description of the Return Value
     * @exception ExceptionBase Description of the Exception
     */
    Integer retrieveMaxUid() throws ExceptionBase {

        // retrieve the last version number
        final Statistic.Immutable statistic = StatisticLoader.getInstance(this.database, null, true,
            false, "MAX", null, MsProjectConstants.ACTIVITY_LOG_TRANS_TBL,
            MsProjectConstants.ACTIVITY_LOG_TRANS_FLDS.UID_MS_PROJECT.toString());
        // statistic.
        final Double uid = statistic.retrieveValue(null);

        Integer result = Integer.valueOf(1);
        if (uid != null) {
            result = Integer.valueOf(uid.intValue() + 1);
        }

        return result;
    }

    public Map<String, Object> composeActivityLogMap(final Record.Immutable record) {
        final HashMap<String, Object> map = new HashMap<String, Object>();

        for (final ACTIVITY_LOG_FLDS fieldIndex : MsProjectConstants.ACTIVITY_LOG_FLDS.values()) {
            final String fieldName = fieldIndex.toString();
            map.put(fieldName,
                record.findFieldValue(MsProjectConstants.ACTIVITY_LOG_TBL + "." + fieldName));
        }

        map.put(MsProjectConstants.WORK_PKGS_FLDS.DAYS_PER_WEEK.toString(),
            record.findFieldValue(MsProjectConstants.WORK_PKGS_TBL + "."
                    + MsProjectConstants.WORK_PKGS_FLDS.DAYS_PER_WEEK.toString()));

        return map;
    }

    /**
     * Description of the Method
     *
     * @param context Description of the Parameter
     * @param actMap Description of the Parameter
     * @return Description of the Return Value
     * @exception ExceptionBase Description of the Exception
     */
    public Integer retrieveMaxActLogId(final HashMap<String, Object> actMap) throws ExceptionBase {

        // retrieve the last version number
        final Statistic.Immutable statistic = StatisticLoader.getInstance(this.database, null, true,
            false, "MAX", "", MsProjectConstants.ACTIVITY_LOG_TBL,
            MsProjectConstants.ACTIVITY_LOG_FLDS.ACTIVITY_LOG_ID.toString());

        final Vector<RestrictionSqlBaseImpl> restrictions = new Vector<RestrictionSqlBaseImpl>();
        @SuppressWarnings("deprecation")
        final RestrictionSqlBaseImpl restriction =
                (RestrictionSqlBaseImpl) RestrictionBaseImpl.getInstance("parsed");
        addRestrictionClause(restriction,
            MsProjectConstants.ACTIVITY_LOG_FLDS.ACTIVITY_TYPE.toString(), actMap);
        addRestrictionClause(restriction,
            MsProjectConstants.ACTIVITY_LOG_FLDS.ACTION_TITLE.toString(), actMap);
        addRestrictionClause(restriction,
            MsProjectConstants.ACTIVITY_LOG_FLDS.PROJECT_ID.toString(), actMap);
        addRestrictionClause(restriction,
            MsProjectConstants.ACTIVITY_LOG_FLDS.PCT_COMPLETE.toString(), actMap);
        addRestrictionClause(restriction, MsProjectConstants.ACTIVITY_LOG_FLDS.DURATION.toString(),
            actMap);
        restrictions.add(restriction);

        // statistic.
        final Double activityLog = statistic.retrieveValue(restrictions);

        Integer result = Integer.valueOf(1);
        if (activityLog != null) {
            result = Integer.valueOf(activityLog.intValue());
        }

        return result;
    }

    private static void addRestrictionClause(final RestrictionSqlBaseImpl restriction,
            final String fieldName, final HashMap<String, Object> values) {
        final String tableName = MsProjectConstants.ACTIVITY_LOG_TBL;
        final Object fieldValue = values.get(fieldName);
        if (fieldValue != null) {
            restriction.addClause(tableName, fieldName, fieldValue);
        }
    }

    /**
     * Description of the Method
     *
     * @param contextParent Description of the Parameter
     * @param act_workpkg_id
     * @param hasWorkpkg
     * @param act_project_id
     * @return Description of the Return Value
     * @exception ExceptionBase Description of the Exception
     */
    public com.archibus.db.RetrievedRecords.Immutable retrieveRecords(
            final MsProjectProperties properties) throws ExceptionBase {

        final Vector<com.archibus.db.RestrictionSqlBase.Immutable> restrictions =
                prepareRestrictions(properties);

        @SuppressWarnings("deprecation")
        final RecordsPersistenceImpl records = new RecordsPersistenceImpl();
        records.setDatabase(this.schema);

        final QueryDefJoinImpl joinQueryDef = createJoinQueryDef();

        records.setQueryDef(joinQueryDef);

        // retrive records
        final RetrievedRecords.Immutable retrievedRecords = records.searchAndRetrieve(false,
            new HashMap<String, Object>(), restrictions, this.userSession.getLocale());
        return retrievedRecords;
    }

    private QueryDefJoinImpl createJoinQueryDef() {
        final QueryDefJoinImpl joinQueryDef = new QueryDefJoinImpl(this.schema);
        joinQueryDef.setTableName(MsProjectConstants.ACTIVITY_LOG_TBL);

        final com.archibus.config.Project.Immutable project = this.userSession.findProject();

        final TableDef.ThreadSafe tableDef1 =
                project.loadTableDef(MsProjectConstants.ACTIVITY_LOG_TBL);
        for (final MsProjectConstants.ACTIVITY_LOG_FLDS fieldIndex : MsProjectConstants.ACTIVITY_LOG_FLDS
            .values()) {
            final ViewField.Immutable viewField =
                    ViewFieldLoader.getInstance(tableDef1.getFieldDef(fieldIndex.toString()),
                        this.userSession, true, true, true, null, false);
            joinQueryDef.addField(viewField);
        }

        final TableDef.ThreadSafe tableDef2 =
                project.loadTableDef(MsProjectConstants.WORK_PKGS_TBL);
        for (final MsProjectConstants.WORK_PKGS_FLDS fieldIndex : MsProjectConstants.WORK_PKGS_FLDS
            .values()) {
            final ViewField.Immutable viewField =
                    ViewFieldLoader.getInstance(tableDef2.getFieldDef(fieldIndex.toString()),
                        this.userSession, true, true, true, null, false);
            joinQueryDef.addField(viewField);
        }

        final SortImpl sort = new SortImpl();
        sort.getFields().add(new SortFieldImpl(MsProjectConstants.ACTIVITY_LOG_TBL,
            MsProjectConstants.ACTIVITY_LOG_FLDS.PROJECT_ID.toString()));
        sort.getFields().add(new SortFieldImpl(MsProjectConstants.WORK_PKGS_TBL,
            MsProjectConstants.WORK_PKGS_FLDS.WORK_PKG_ID.toString()));
        sort.getFields().add(new SortFieldImpl(MsProjectConstants.ACTIVITY_LOG_TBL,
            MsProjectConstants.ACTIVITY_LOG_FLDS.DATE_SCHEDULED.toString()));
        joinQueryDef.setSort(sort);

        return joinQueryDef;
    }

    /**
     * Description of the Method
     *
     * @param tableName Description of the Parameter
     * @param restrictions Description of the Parameter
     * @return Description of the Return Value
     * @exception ExceptionBase Description of the Exception
     */
    public com.archibus.db.RetrievedRecords.Immutable retrieveRecordsForTable(
            final String tableName, final Vector<RestrictionSqlBase.Immutable> restrictions)
                    throws ExceptionBase {

        @SuppressWarnings("deprecation")
        final RecordsPersistenceImpl persistence = new RecordsPersistenceImpl();
        persistence.setDatabase(this.schema);

        final QueryDefImpl queryDef = this.createQueryDef(tableName);

        persistence.setQueryDef(queryDef);

        // Retrieve records
        final RetrievedRecords.Immutable retrievedRecords = persistence.searchAndRetrieve(false,
            new HashMap<String, Object>(), restrictions, this.userSession.getLocale());

        return retrievedRecords;
    }

    public QueryDefImpl createQueryDef(final String tableName) {

        // prepare queryDef
        final QueryDefImpl queryDef = new QueryDefImpl(this.schema, tableName);
        final TableDef.ThreadSafe tableDef = this.database.findProject().loadTableDef(tableName);

        // use fieldDefs from the TableDef as quiery fields
        queryDef.setViewFields(new ArrayList<Object>(tableDef.getFields().values()));
        queryDef.setTableDef(tableDef);

        return queryDef;
    }

    /**
     * Description of the Method
     *
     * @param act_project_id
     * @param hasWorkpkg
     *
     * @param hasWorkpkg
     * @param act_workpkg_id
     * @return Description of the Return Value
     * @exception ExceptionBase Description of the Exception
     */
    @SuppressWarnings("deprecation")
    public static Vector<com.archibus.db.RestrictionSqlBase.Immutable> prepareRestrictions(
            final MsProjectProperties properties) throws ExceptionBase {
        final Vector<com.archibus.db.RestrictionSqlBase.Immutable> restrictions =
                new Vector<com.archibus.db.RestrictionSqlBase.Immutable>();
        {
            final RestrictionSqlBaseImpl restriction =
                    (RestrictionSqlBaseImpl) RestrictionBaseImpl.getInstance("parsed");
            restriction.addClause(MsProjectConstants.ACTIVITY_LOG_TBL,
                MsProjectConstants.ACTIVITY_LOG_FLDS.PROJECT_ID.toString(),
                properties.getProjectId());
            restrictions.add(restriction);
        }
        {
            final String strWhereClause =
                    "activity_log.status IN ('N/A', 'REQUESTED', 'PLANNED', 'SCHEDULED', 'IN PROGRESS')";
            final RestrictionSqlImpl restriction =
                    (RestrictionSqlImpl) RestrictionBaseImpl.getInstance("sql");
            restriction.setSql(strWhereClause);
            restrictions.add(restriction);
        }

        if (properties.isHasWorkpackage()) {
            final RestrictionSqlBaseImpl restriction =
                    (RestrictionSqlBaseImpl) RestrictionBaseImpl.getInstance("parsed");
            restriction.addClause(MsProjectConstants.ACTIVITY_LOG_TBL,
                MsProjectConstants.WORK_PKGS_FLDS.WORK_PKG_ID.toString(),
                properties.getWorkPackageId());
            restrictions.add(restriction);
        }

        return restrictions;
    }

    public Vector<Immutable> prepareRestrictionsForLogTransTable(final Integer projUid) {
        final Vector<Immutable> restrictions = new Vector<Immutable>();
        String strWhereClause = "uid_ms_proj IS NULL ";
        if (projUid != null) {
            strWhereClause = "uid_ms_proj = " + projUid.toString();
        }
        @SuppressWarnings("deprecation")
        final RestrictionSqlImpl restriction =
                (RestrictionSqlImpl) RestrictionBaseImpl.getInstance("sql");
        restriction.setSql(strWhereClause);
        restrictions.add(restriction);
        return restrictions;
    }

    /*
     * @param contextParent Description of the Parameter
     *
     * @return The actLogTransStatus value
     */
    public TransStatus getActLogTransStatus(final Map<String, Object> map) {
        final Integer activity_log_id =
                (Integer) map.get(MsProjectConstants.ACTIVITY_LOG_FLDS.ACTIVITY_LOG_ID.toString());

        if (activity_log_id == null) {
            return TransStatus.NEW;
        }

        final RecordPersistenceImpl recordImpl = preparePersistence(new HashMap<String, Object>(),
            MsProjectConstants.ACTIVITY_LOG_TBL, false);

        // retrieve and compare
        Record.Immutable record = recordImpl.retrieve(false, map);

        if (record == null) {
            final HashMap<String, Object> fieldValues = new HashMap<String, Object>();
            fieldValues.put(MsProjectConstants.ACTIVITY_LOG_FLDS.PROJECT_ID.toString(),
                map.get(MsProjectConstants.ACTIVITY_LOG_FLDS.PROJECT_ID.toString()));
            if (map.get(MsProjectConstants.ACTIVITY_LOG_FLDS.WORK_PKG_ID.toString()) != null) {
                fieldValues.put(MsProjectConstants.ACTIVITY_LOG_FLDS.WORK_PKG_ID.toString(),
                    map.get(MsProjectConstants.ACTIVITY_LOG_FLDS.WORK_PKG_ID.toString()));
            }
            fieldValues.put(MsProjectConstants.ACTIVITY_LOG_FLDS.ACTIVITY_LOG_ID.toString(),
                map.get(MsProjectConstants.ACTIVITY_LOG_FLDS.ACTIVITY_LOG_ID.toString()));

            record = recordImpl.retrieve(false, fieldValues);
            if (record == null) {
                fieldValues.clear();
                fieldValues.put(MsProjectConstants.ACTIVITY_LOG_FLDS.PROJECT_ID.toString(),
                    map.get(MsProjectConstants.ACTIVITY_LOG_FLDS.PROJECT_ID.toString()));
                if (map.get(MsProjectConstants.ACTIVITY_LOG_FLDS.WORK_PKG_ID.toString()) != null) {
                    fieldValues.put(MsProjectConstants.ACTIVITY_LOG_FLDS.WORK_PKG_ID.toString(),
                        map.get(MsProjectConstants.ACTIVITY_LOG_FLDS.WORK_PKG_ID.toString()));
                }
                record = recordImpl.retrieve(false, fieldValues);
                if (record != null) {
                    return TransStatus.DELETED;
                } else {
                    return TransStatus.NEW;
                }
            } else {
                return TransStatus.CHANGED;
            }
        } else {
            return TransStatus.UNCHANGED;
        }

    }

    /**
     * Description of the Method
     *
     * @param fieldValues Description of the Parameter
     * @param tableName Description of the Parameter
     * @param useSchemaDb
     * @param context Description of the Parameter
     * @return Description of the Return Value
     * @exception ExceptionBase Description of the Exception
     */
    public RecordPersistenceImpl preparePersistence(final HashMap<String, Object> fieldValues,
            final String tableName, final boolean useSchemaDb) throws ExceptionBase {

        final RecordPersistenceImpl persistence = new RecordPersistenceImpl();

        final Database.Immutable db = (useSchemaDb ? this.schema : this.database);

        persistence.setDatabase(db);

        final QueryDef.ThreadSafe queryDef = QueryDefLoader.getInstanceFromFields(this.userSession,
            db, fieldValues.keySet().iterator(), tableName, false);
        persistence.setQueryDef(queryDef);

        return persistence;
    }

    /**
     * Gets the actLogTransStatus attribute of the MsProjectHandlers object
     *
     * @param map Description of the Parameter
     *
     *
     *            /** add the record into activity_log_trans table
     *
     * @param context The feature to be added to the ActLogTransRecord attribute
     * @param contextParent The feature to be added to the ActLogTransRecord attribute
     * @param map The feature to be added to the ActLogTransRecord attribute
     * @param useSchemaDb
     */
    public void addOrUpdateRecord(final HashMap<String, Object> map, final String tableName,
            final boolean useSchemaDb) {
        final RecordPersistenceImpl persistence = preparePersistence(map, tableName, useSchemaDb);
        persistence.addOrUpdate(map);
    }

    /**
     * Adds a feature to the DeletedActRecordsToTrans attribute of the MsProjectHandlers object
     *
     * @param context The feature to be added to the DeletedActRecordsToTrans attribute
     * @param contextParent The feature to be added to the DeletedActRecordsToTrans attribute
     * @param projUid The feature to be added to the DeletedActRecordsToTrans attribute
     */
    public void addDeletedActRecordsToTrans(final MsProjectProperties properties,
            final Integer projUid) {

        final Vector<RestrictionSqlBase.Immutable> restrictions =
                composeLogTransRestrictions(properties);

        final com.archibus.db.RetrievedRecords.Immutable retrievedLogTransRecords =
                this.retrieveRecordsForTable(MsProjectConstants.ACTIVITY_LOG_TBL, restrictions);
        for (final Object element : retrievedLogTransRecords.getRecordset().getRecords()) {
            final Record.Immutable record = (Record.Immutable) element;
            final HashMap<String, Object> map =
                    composeActTransLogMap(properties, projUid, record, TransStatus.DELETED);

            addOrUpdateRecord(map, MsProjectConstants.ACTIVITY_LOG_TRANS_TBL, false);
        }
    }

    private static HashMap<String, Object> composeActTransLogMap(
            final MsProjectProperties properties, final Integer projUid,
            final Record.Immutable record, final TransStatus status) {
        final HashMap<String, Object> map = new HashMap<String, Object>();

        // loop through all activity_log_trans fields and copy the value from the activity log table
        for (final ACTIVITY_LOG_TRANS_FLDS fieldIndex : MsProjectConstants.ACTIVITY_LOG_TRANS_FLDS
            .values()) {
            final String fieldName = fieldIndex.toString();
            map.put(fieldName,
                record.findFieldValue(MsProjectConstants.ACTIVITY_LOG_TBL + "." + fieldName));
        }

        // set the project_id field for activity_log_trans table
        map.put(MsProjectConstants.ACTIVITY_LOG_FLDS.PROJECT_ID.toString(),
            properties.getProjectId());

        if (properties.isHasWorkpackage()) {
            map.put(MsProjectConstants.ACTIVITY_LOG_FLDS.WORK_PKG_ID.toString(),
                properties.getWorkPackageId());
        }

        map.put(MsProjectConstants.ACTIVITY_LOG_TRANS_FLDS.PROJECT_WORK_PKG_ID.toString(),
            properties.getProjectName());

        map.put(MsProjectConstants.ACTIVITY_LOG_TRANS_FLDS.UID_MS_PROJECT.toString(), projUid);

        map.put(MsProjectConstants.ACTIVITY_LOG_TRANS_FLDS.STATUS.toString(), status.toString());
        return map;
    }

    @SuppressWarnings("deprecation")
    private static Vector<RestrictionSqlBase.Immutable> composeLogTransRestrictions(
            final MsProjectProperties properties) {
        final Vector<RestrictionSqlBase.Immutable> restrictions =
                new Vector<RestrictionSqlBase.Immutable>();
        {
            final String strWhereClause =
                    "NOT EXISTS (SELECT activity_log_id FROM activity_log_trans WHERE activity_log.activity_log_id = activity_log_trans.activity_log_id) ";
            final RestrictionSqlImpl restriction =
                    (RestrictionSqlImpl) RestrictionBaseImpl.getInstance("sql");
            restriction.setSql(strWhereClause);
            restrictions.add(restriction);
        }
        {
            final String strWhereClause = "project_id ='" + properties.getProjectId() + "'";
            final RestrictionSqlImpl restriction =
                    (RestrictionSqlImpl) RestrictionBaseImpl.getInstance("sql");
            restriction.setSql(strWhereClause);
            restrictions.add(restriction);
        }

        String projectName = properties.getProjectId();
        if (properties.isHasWorkpackage()) {
            projectName = projectName + "|" + properties.getWorkPackageId();
            final String strWhereClause = "work_pkg_id ='" + properties.getWorkPackageId() + "'";
            final RestrictionSqlImpl restriction =
                    (RestrictionSqlImpl) RestrictionBaseImpl.getInstance("sql");
            restriction.setSql(strWhereClause);
            restrictions.add(restriction);
        }
        {
            final String strWhereClause =
                    "status IN ('N/A', 'REQUESTED', 'PLANNED', 'SCHEDULED', 'IN PROGRESS')";
            final RestrictionSqlImpl restriction =
                    (RestrictionSqlImpl) RestrictionBaseImpl.getInstance("sql");
            restriction.setSql(strWhereClause);
            restrictions.add(restriction);
        }
        return restrictions;
    }

    Integer addActLogRecord(final HashMap<String, Object> map,
            final HashMap<String, Object> actMap) {

        // add the status field to the view
        // if pct_complete = 100, then set status to 'Complete'
        final Integer pct_complete =
                (Integer) actMap.get(MsProjectConstants.ACTIVITY_LOG_FLDS.PCT_COMPLETE.toString());
        if (pct_complete.intValue() == 100) {
            actMap.put(MsProjectConstants.ACTIVITY_LOG_FLDS.STATUS.toString(),
                MsProjectConstants.ActLogStatus.COMPLETED);
        }
        final RecordPersistenceImpl record = new RecordPersistenceImpl();
        record.setDatabase(this.database);

        final QueryDef.ThreadSafe queryDef = QueryDefLoader.getInstanceFromFields(this.userSession,
            this.database, actMap.keySet().iterator(), MsProjectConstants.ACTIVITY_LOG_TBL, false);
        record.setQueryDef(queryDef);

        // remove the activity_log_id as this is auto numbered field.
        Integer activity_log_id = (Integer) actMap
            .get(MsProjectConstants.ACTIVITY_LOG_FLDS.ACTIVITY_LOG_ID.toString());

        // we update the activity_log id for existing action item
        boolean isMatch = false;
        final Integer actionItem = (Integer) map
            .get(MsProjectConstants.ACTIVITY_LOG_TRANS_FLDS.ACTIVITY_LOG_ID.toString());
        if (activity_log_id != null && actionItem != null
                && (activity_log_id.intValue() == actionItem.intValue())) {
            isMatch = true;
        }

        record.addOrUpdate(actMap);

        activity_log_id = this.retrieveMaxActLogId(actMap);
        if (activity_log_id != null && actionItem != null && !isMatch) {
            updateActLogTransPredecessors(map, activity_log_id.toString());
            return null;
        } else {
            return activity_log_id;
        }
    }

    void updateActLogTransPredecessors(final Map<String, Object> map,
            final String activity_log_ids) {

        final RecordPersistenceImpl record = new RecordPersistenceImpl();
        record.setDatabase(this.database);

        final QueryDef.ThreadSafe queryDef =
                QueryDefLoader.getInstanceFromFields(this.userSession, this.database,
                    map.keySet().iterator(), MsProjectConstants.ACTIVITY_LOG_TRANS_TBL, false);
        record.setQueryDef(queryDef);

        map.put(MsProjectConstants.ACTIVITY_LOG_TRANS_FLDS.PREDECESSORS.toString(),
            activity_log_ids);
        record.update(map);
    }

    public void setActLogsStatus(final String uid) {
        String strWhereClause = "uid_ms_proj IS NULL ";
        if (uid != null) {
            strWhereClause = "uid_ms_proj = " + uid.toString();
        }

        // prepare restriction to restrict on project_id
        final Vector<Immutable> restrictions = new Vector<Immutable>();

        @SuppressWarnings("deprecation")
        final RestrictionSqlImpl restriction =
                (RestrictionSqlImpl) RestrictionBaseImpl.getInstance("sql");
        restriction.setSql(strWhereClause);
        restrictions.add(restriction);
        final com.archibus.db.RetrievedRecords.Immutable retrievedLogTransRecords = this
            .retrieveRecordsForTable(MsProjectConstants.ACTIVITY_LOG_TRANS_TBL, restrictions);
        for (final Object element : retrievedLogTransRecords.getRecordset().getRecords()) {
            final Record.Immutable record = (Record.Immutable) element;
            final Integer activity_log_id = (Integer) record
                .findFieldValue(MsProjectConstants.ACTIVITY_LOG_TRANS_TBL + "."
                        + MsProjectConstants.ACTIVITY_LOG_TRANS_FLDS.ACTIVITY_LOG_ID.toString());

            if (activity_log_id != null) {
                setActivityLogStatus(activity_log_id.toString());
            }
        }
    }

    /**
     * Sets the activityLogStatus attribute of the MsProjectHandlers object
     *
     * @param contextParent The new activityLogStatus value
     * @param actLogId The new activityLogStatus value
     * @param MsProjectConstants.ACTIVITY_LOG_TBL
     * @param context The new activityLogStatus value
     */
    void setActivityLogStatus(final String actLogId) {
        String status = "";
        String actStatus = "";

        final Vector<Immutable> restrictions = new Vector<Immutable>();
        if (actLogId != null) {
            final String strWhereClause = "activity_log_id = " + actLogId;

            @SuppressWarnings("deprecation")
            final RestrictionSqlImpl restriction =
                    (RestrictionSqlImpl) RestrictionBaseImpl.getInstance("sql");
            restriction.setSql(strWhereClause);
            restrictions.add(restriction);
        }

        final com.archibus.db.RetrievedRecords.Immutable retrievedLogTransRecords = this
            .retrieveRecordsForTable(MsProjectConstants.ACTIVITY_LOG_TRANS_TBL, restrictions);
        for (final Object element : retrievedLogTransRecords.getRecordset().getRecords()) {
            final Record.Immutable record = (Record.Immutable) element;
            status = (String) record.findFieldValue(MsProjectConstants.ACTIVITY_LOG_TRANS_TBL + "."
                    + MsProjectConstants.ACTIVITY_LOG_TRANS_FLDS.STATUS.toString());
        }

        final com.archibus.db.RetrievedRecords.Immutable retrievedLogRecords =
                this.retrieveRecordsForTable(MsProjectConstants.ACTIVITY_LOG_TBL, restrictions);

        for (final Object element : retrievedLogRecords.getRecordset().getRecords()) {
            final Record.Immutable record = (Record.Immutable) element;
            actStatus = (String) record.findFieldValue(MsProjectConstants.ACTIVITY_LOG_TBL + "."
                    + MsProjectConstants.ACTIVITY_LOG_FLDS.STATUS.toString());

            if (actStatus.equalsIgnoreCase("")) {
                actStatus = ActLogStatus.NA.toString();
            }

            if (status.equalsIgnoreCase(TransStatus.DELETED.toString())) {
                if (actStatus.equalsIgnoreCase(ActLogStatus.NA.toString())
                        || actStatus.equalsIgnoreCase(ActLogStatus.REQUESTED.toString())
                        || actStatus.equalsIgnoreCase(ActLogStatus.PLANNED.toString())
                        || actStatus.equalsIgnoreCase(ActLogStatus.SCHEDULED.toString())) {
                    actStatus = ActLogStatus.CANCELLED.toString();
                }

                if (actStatus.equalsIgnoreCase(ActLogStatus.IN_PROGRESS.toString())) {
                    actStatus = ActLogStatus.STOPPED.toString();
                }
            }

            if (!status.equalsIgnoreCase(TransStatus.UNCHANGED.toString())) {
                final HashMap<String, Object> map = new HashMap<String, Object>();
                map.put(MsProjectConstants.ACTIVITY_LOG_FLDS.ACTIVITY_LOG_ID.toString(),
                    Integer.valueOf(actLogId));
                map.put(MsProjectConstants.ACTIVITY_LOG_FLDS.STATUS.toString(), actStatus);

                this.addOrUpdateRecord(map, MsProjectConstants.ACTIVITY_LOG_TBL, false);
            }
        }
    }

    /**
     * Getter for the userSession property.
     *
     * @see userSession
     * @return the userSession property.
     */
    public UserSession.Immutable getUserSession() {
        return this.userSession;
    }

    /**
     * Setter for the userSession property.
     *
     * @see userSession
     * @param userSession the userSession to set
     */

    public void setUserSession(final UserSession.Immutable userSession) {
        this.userSession = userSession;
    }

    /**
     * Getter for the database property.
     *
     * @see database
     * @return the database property.
     */
    public Database.Immutable getDatabase() {
        return this.database;
    }

    /**
     * Setter for the database property.
     *
     * @see database
     * @param database the database to set
     */

    public void setDatabase(final Database.Immutable database) {
        this.database = database;
    }

    /**
     * Getter for the schema property.
     *
     * @see schema
     * @return the schema property.
     */
    public Database.Immutable getSchema() {
        return this.schema;
    }

    /**
     * Setter for the schema property.
     *
     * @see schema
     * @param schema the schema to set
     */

    public void setSchema(final Database.Immutable schema) {
        this.schema = schema;
    }

}
