package com.archibus.eventhandler.clean;

import java.sql.Date;
import java.util.*;

import com.archibus.config.Project;
import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.*;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.jobmanager.JobStatus;
import com.archibus.schema.TableDef.ThreadSafe;
import com.archibus.utility.*;

/**
 * Common methods for clean building.
 * 
 * <p>
 * Suppress PMD warning "AvoidUsingSql" in this method.
 * <p>
 * Justification: Case #2: Statement with INSERT ... SELECT pattern; or complex query, split in
 * logical pieces
 * 
 * @author Ioan Draghici
 * 
 */
@SuppressWarnings("PMD.AvoidUsingSql")
public class CommonsHandler {
    
    /**
     * lastAssessedQuery.
     */
    private static final String LAST_ASSESSED_QUERY = "lastAssessedQuery";
    
    /**
     * rmQuery.
     */
    private static final String RM_QUERY = "rmQuery";
    
    /**
     * flQuery.
     */
    private static final String FL_QUERY = "flQuery";
    
    /**
     * blQuery.
     */
    private static final String BL_QUERY = "blQuery";
    
    /**
     * {value}.
     */
    private static final String VALUE_IN_CURLY_BRACKETS = "{value}";
    
    /**
     * {field}.
     */
    private static final String FIELD_IN_CURLY_BRACKETS = "{field}";
    
    /**
     * _to.
     */
    private static final String UNDERLINE_TO = "_to";
    
    /**
     * _from.
     */
    private static final String UNDERLINE_FROM = "_from";
    
    /**
     * " AND {field} IN ('{value}') ".
     */
    private static final String AND_FIELD_IN_VALUE = " AND {field} IN ('{value}') ";
    
    /**
     * "probType".
     */
    private static final String CONFIG_PROB_TYPE = "probType";
    
    /**
     * "location".
     */
    private static final String CONFIG_LOCATION = "location";
    
    /**
     * "level".
     */
    private static final String CONFIG_LEVEL = "level";
    
    /**
     * Calculate number of new records.
     * 
     * @param type page mode type, valid values: "assessment", "action", "request"
     * @param config configuration values (project, problem type and level)
     * @param locations list of locations
     * @param recFilter filter values
     * @return number of new records
     */
    public int calculateRecordsNo(final String type, final Map<String, String> config,
            final List<String> locations, final Map<String, String> recFilter) {
        // dataSource
        final DataSource dsCount = DataSourceFactory.createDataSource();
        dsCount.addTable(Constants.BUILDING_TABLE, DataSource.ROLE_MAIN);
        dsCount.addVirtualField(Constants.BUILDING_TABLE, "numberOfRecords",
            DataSource.DATA_TYPE_INTEGER);
        final String level = config.get(CONFIG_LEVEL);
        final String countQuery = getCountQuery(level);
        final String restriction = getRestriction(level, recFilter, SqlUtils.isOracle());
        
        dsCount.addQuery(countQuery + restriction);
        final DataRecord recCount = dsCount.getRecord();
        int count = recCount.getInt("bl.numberOfRecords");
        // check if we have multiple locations
        if (!locations.isEmpty() && Constants.TYPE_ASSESSMENT_ITEM.equals(type)) {
            count = count * locations.size();
        }
        return count;
    }
    
    /**
     * Create copy of records specified by pKey.
     * 
     * @param tableName table name
     * @param pkField pkey field name
     * @param pkValue pkey value
     * @param fields fields to be copied
     * @param defaults specific values for some fields
     * @return copied record
     */
    public DataRecord copyRecord(final String tableName, final String pkField,
            final Object pkValue, final String[] fields, final Map<String, Object> defaults) {
        final DataSource dsCopy = DataSourceFactory.createDataSourceForFields(tableName, fields);
        dsCopy.addRestriction(Restrictions.eq(tableName, pkField, pkValue));
        // get source record
        final DataRecord source = dsCopy.getRecord();
        // get target report
        final DataRecord target = dsCopy.createNewRecord();
        // copy record values
        copyRecordValues(source, target);
        // set custom defaults
        for (final String field : defaults.keySet()) {
            final String fieldFullName = tableName + Constants.DOT + field;
            if (target.findField(fieldFullName) != null) {
                target.setValue(fieldFullName, defaults.get(field));
            }
        }
        // save new record and return
        return dsCopy.saveRecord(target);
    }
    
    /**
     * Generate records handler.
     * 
     * @param type page mode type, valid values: "assessment", "action", "request"
     * @param config configuration values (project, problem type and level)
     * @param locations list of locations
     * @param recFilter filter values
     * @param recDefaults default values record
     * @param totalNo records number
     * @param status job status
     */
    public void generateRecords(final String type, final Map<String, String> config,
            final List<String> locations, final Map<String, String> recFilter,
            final DataRecord recDefaults, final int totalNo, final JobStatus status) {
        
        status.setTotalNumber(totalNo);
        
        // get config parameters
        final String level = config.get(CONFIG_LEVEL);
        
        /*
         * When is assessment mode we must generate one item for each location type When is not
         * assessment mode we must generate only one item and save locations to cb_hcm_loc_typ_chk
         * table for this item
         */
        String[] locationTypes = null;
        String[] locationTypesChk = null;
        if (Constants.TYPE_ASSESSMENT_ITEM.equals(type)) {
            locationTypes = locations.toArray(new String[locations.size()]);
        } else {
            locationTypesChk = locations.toArray(new String[locations.size()]);
            locationTypes = String.valueOf("").split(",");
        }
        final String projectId = config.get("project");
        // we must get building, floor and rooms
        final List<DataRecord> recsLocation = getLocationRecords(level, recFilter);
        // create datasource for activity_log table
        final String[] fields =
                { "project_id", "prob_type", "activity_type", Constants.HCM_LOC_TYP_ID,
                        Constants.SITE_FLD_NAME, Constants.BUILDING_FLD_NAME,
                        Constants.FLOOR_FLD_NAME, Constants.ROOM_FLD_NAME, "action_title",
                        "assigned_to", "assessed_by", "hcm_abate_by", "date_required",
                        "description", "requestor", "phone_requestor", "priority", "cause_type",
                        "hcm_haz_status_id", "hcm_pending_act" };
        final DataSource dsActivityLog =
                DataSourceFactory.createDataSourceForFields(Constants.ACTIVITY_LOG_TABLE, fields);
        // add location to config object
        final String locationsList = concatenateLocations(locations);
        config.put(CONFIG_LOCATION, locationsList);
        int counter = 0;
        for (final DataRecord recLocation : recsLocation) {
            if (status.isStopRequested()) {
                status.setCurrentNumber(totalNo);
                status.setCode(JobStatus.JOB_STOP_REQUESTED);
                return;
            }
            // generate records for each location type only when is assessment mode
            for (final String locTypId : locationTypes) {
                final DataRecord recActivityLog = dsActivityLog.createNewRecord();
                // set record values
                setRecordValues(type, config, recDefaults, projectId, recLocation, locTypId,
                    recActivityLog);
                
                // save new record
                final DataRecord newRec = dsActivityLog.saveRecord(recActivityLog);
                final int newRecId = newRec.getInt("activity_log.activity_log_id");
                // we must perform some updated for new record
                if (Constants.TYPE_ASSESSMENT_ITEM.equals(type)) {
                    // we must update Constants.ASSESSMENT_ID field for new record
                    final String[] flds = { Constants.ACTIVITY_LOG_ID, Constants.ASSESSMENT_ID };
                    final DataSource dsUpdate =
                            DataSourceFactory.createDataSourceForFields(
                                Constants.ACTIVITY_LOG_TABLE, flds);
                    dsUpdate.addRestriction(Restrictions.eq(Constants.ACTIVITY_LOG_TABLE,
                        Constants.ACTIVITY_LOG_ID, newRecId));
                    final DataRecord recUpdate = dsUpdate.getRecord();
                    recUpdate.setValue("activity_log.assessment_id", newRecId);
                    dsUpdate.saveRecord(recUpdate);
                } else {
                    for (final String locationTypChk : locationTypesChk) {
                        // we must add locations to cb_hcm_loc_typ_chk table
                        if (StringUtil.notNullOrEmpty(locationTypChk)) {
                            final String[] flds =
                                    { Constants.ACTIVITY_LOG_ID, Constants.HCM_LOC_TYP_ID };
                            final DataSource dsLoc =
                                    DataSourceFactory.createDataSourceForFields(
                                        "cb_hcm_loc_typ_chk", flds);
                            final DataRecord recLoc = dsLoc.createNewRecord();
                            recLoc.setValue("cb_hcm_loc_typ_chk.activity_log_id", newRecId);
                            recLoc.setValue("cb_hcm_loc_typ_chk.hcm_loc_typ_id", locationTypChk);
                            dsLoc.saveRecord(recLoc);
                        }
                    }
                    // if is service request we need to submit to helpdesk
                    if (Constants.TYPE_SERVICE_REQUEST.equals(type)) {
                        final ServiceRequestHandler servReqHandler = new ServiceRequestHandler();
                        servReqHandler.submitServiceRequest(String.valueOf(newRecId));
                    }
                }
                status.setCurrentNumber(counter++);
            }
        }
        status.setCurrentNumber(totalNo);
        status.setCode(JobStatus.JOB_COMPLETE);
    }
    
    /**
     * 
     * Concatenate locations as a list to be used in the description field for example.
     * 
     * @param locations list of location types
     * @return list of locations concatenated by ','.
     */
    private String concatenateLocations(final List<String> locations) {
        String locationsList = "";
        final Iterator<String> iterateLocations = locations.iterator();
        while (iterateLocations.hasNext()) {
            if (StringUtil.notNullOrEmpty(locationsList)) {
                locationsList += ", " + iterateLocations.next();
            } else {
                locationsList = iterateLocations.next();
            }
        }
        return locationsList;
    }
    
    /**
     * Sets values to the activity_log record.
     * 
     * @param type activity_log type
     * @param config configuration
     * @param recDefaults record for default values
     * @param projectId project id
     * @param recLocation location record
     * @param locTypId location type id
     * @param recActivityLog the record to set values to
     */
    private void setRecordValues(final String type, final Map<String, String> config,
            final DataRecord recDefaults, final String projectId, final DataRecord recLocation,
            final String locTypId, final DataRecord recActivityLog) {
        recActivityLog.setValue("activity_log.project_id", projectId);
        recActivityLog.setValue("activity_log.hcm_loc_typ_id", locTypId);
        
        // set activity type for assessment and request
        if (Constants.TYPE_ASSESSMENT_ITEM.equals(type)) {
            recActivityLog.setValue(Constants.ACTIVITY_LOG_TABLE + Constants.DOT
                    + Constants.ACTIVITY_TYPE, Constants.ASSESSMENT_ACTIVITY_TYPE);
        } else if (Constants.TYPE_SERVICE_REQUEST.equals(type)) {
            recActivityLog.setValue(Constants.ACTIVITY_LOG_TABLE + Constants.DOT
                    + Constants.ACTIVITY_TYPE, Constants.REQUEST_ACTIVITY_TYPE);
        }
        
        // set location fields
        setLocationFields(recLocation, recActivityLog);
        
        if (Constants.TYPE_ASSESSMENT_ITEM.equals(type)) {
            // set problem type of assessment item to project problem type
            recActivityLog.setValue("activity_log.prob_type", config.get(CONFIG_PROB_TYPE));
        }
        
        // copy default values
        copyRecordValues(recDefaults, recActivityLog);
        
        // we must add some information to description field
        if (Constants.TYPE_ACTION_ITEM.equals(type) || Constants.TYPE_SERVICE_REQUEST.equals(type)) {
            final String description =
                    getActionItemOrServiceRequestDescription(config, recActivityLog);
            
            recActivityLog.setValue(Constants.ACTIVITY_LOG_TABLE + Constants.DOT
                    + Constants.DESCRIPTION_FLD_NAME, description);
        }
    }
    
    /**
     * Set location fields for a to-be-generated activity_log record.
     * 
     * @param recLocation location record
     * @param recActivityLog the activity_log record to generate
     */
    private void setLocationFields(final DataRecord recLocation, final DataRecord recActivityLog) {
        if (recLocation.valueExists(Constants.SITE_TABLE + Constants.DOT + Constants.SITE_FLD_NAME)) {
            recActivityLog.setValue(Constants.ACTIVITY_LOG_TABLE + Constants.DOT
                    + Constants.SITE_FLD_NAME, recLocation.getValue(Constants.SITE_TABLE
                    + Constants.DOT + Constants.SITE_FLD_NAME));
        }
        if (recLocation.valueExists(Constants.BUILDING_TABLE + Constants.DOT
                + Constants.BUILDING_FLD_NAME)) {
            recActivityLog.setValue(
                Constants.ACTIVITY_LOG_TABLE + Constants.DOT + Constants.BUILDING_FLD_NAME,
                recLocation.getValue(Constants.BUILDING_TABLE + Constants.DOT
                        + Constants.BUILDING_FLD_NAME));
        }
        if (recLocation.valueExists(Constants.FLOOR_TABLE + Constants.DOT
                + Constants.FLOOR_FLD_NAME)) {
            recActivityLog.setValue(
                Constants.ACTIVITY_LOG_TABLE + Constants.DOT + Constants.FLOOR_FLD_NAME,
                recLocation.getValue(Constants.FLOOR_TABLE + Constants.DOT
                        + Constants.FLOOR_FLD_NAME));
        }
        if (recLocation.valueExists(Constants.ROOM_TABLE + Constants.DOT + Constants.ROOM_FLD_NAME)) {
            recActivityLog.setValue(Constants.ACTIVITY_LOG_TABLE + Constants.DOT
                    + Constants.ROOM_FLD_NAME, recLocation.getValue(Constants.ROOM_TABLE
                    + Constants.DOT + Constants.ROOM_FLD_NAME));
        }
    }
    
    /**
     * Creates description field value.
     * 
     * @param config configuration object
     * @param recActivityLog action item or service request record
     * @return String containing the created description
     */
    private String getActionItemOrServiceRequestDescription(final Map<String, String> config,
            final DataRecord recActivityLog) {
        String hazInformation = Constants.NEW_LINE + Constants.INFO_MARKER_START;
        
        // problem type
        final String probType = config.get(CONFIG_PROB_TYPE);
        hazInformation +=
                Constants.NEW_LINE + Constants.DASH + Constants.DASH
                        + CleanBuildingMessages.MESSAGE_PROB_TYPE + probType;
        
        // location types
        final String locTypes = config.get(CONFIG_LOCATION);
        if (StringUtil.notNullOrEmpty(locTypes)) {
            hazInformation +=
                    Constants.NEW_LINE + Constants.DASH + Constants.DASH
                            + CleanBuildingMessages.MESSAGE_LOCATION_TYPES + locTypes;
        }
        
        hazInformation += Constants.NEW_LINE + Constants.INFO_MARKER_END;
        
        // add hazard info to description
        String description =
                recActivityLog.getString(Constants.ACTIVITY_LOG_TABLE + Constants.DOT
                        + Constants.DESCRIPTION_FLD_NAME);
        description += hazInformation;
        if (description.indexOf(Constants.INFO_MARKER_START) != -1) {
            description =
                    description.substring(0, description.indexOf(Constants.INFO_MARKER_START));
        }
        description += hazInformation;
        
        return description;
    }
    
    /**
     * Update activity log items. Used for update assessment, action items and for assign items.
     * 
     * @param pKeys list of items that will be updated
     * @param record new values
     */
    public void updateItems(final List<String> pKeys, final DataRecord record) {
        
        String pKeysVal = "";
        for (int i = 0; i < pKeys.size(); i++) {
            pKeysVal += (pKeysVal.length() == 0 ? "" : Constants.COMMA) + pKeys.get(i);
        }
        
        final List<DataValue> fields = record.getFields();
        String sqlValues = "";
        for (int i = 0; i < fields.size(); i++) {
            final DataValue field = fields.get(i);
            if (!field.isEmpty() && !field.getFieldDef().isPrimaryKey()
                    && StringUtil.notNullOrEmpty(field.getValue())) {
                sqlValues +=
                        field.getName() + " = " + SqlUtils.formatValueForSql(field.getValue())
                                + Constants.COMMA;
            }
        }
        if (StringUtil.notNullOrEmpty(sqlValues)) {
            sqlValues = sqlValues.substring(0, sqlValues.length() - 1);
            String sqlUpdate = "UPDATE activity_log SET ";
            sqlUpdate += sqlValues;
            sqlUpdate +=
                    "WHERE activity_log.activity_log_id IN (" + pKeysVal
                            + Constants.RIGHT_ROUND_BRACKET;
            SqlUtils.executeUpdate(Constants.ACTIVITY_LOG_TABLE, sqlUpdate);
        }
    }
    
    /**
     * Copy field values from source to target, except primary key's.
     * 
     * @param source source data record
     * @param target target data record
     */
    protected void copyRecordValues(final DataRecord source, final DataRecord target) {
        copyRecordValues(source, target, new HashSet<String>());
    }
    
    /**
     * Copy field values from source to target, except primary key's.
     * 
     * @param source source data record
     * @param target target data record
     * @param exceptFields list of fields that should not be copied
     */
    protected void copyRecordValues(final DataRecord source, final DataRecord target,
            final Set<String> exceptFields) {
        final List<DataValue> fields = target.getFields();
        for (final DataValue field : fields) {
            if (!field.getFieldDef().isPrimaryKey()) {
                final String fieldName = field.getName();
                if (!exceptFields.contains(fieldName) && source.findField(fieldName) != null
                        && !source.findField(fieldName).isEmpty()) {
                    target.setValue(fieldName, source.getValue(fieldName));
                }
            }
        }
    }
    
    /**
     * Get all fields for table.
     * 
     * @param tableName database table name
     * @return array with all table fields
     */
    protected String[] getAllFieldsForTable(final String tableName) {
        // get all fields for specified table
        final Project.Immutable project = ContextStore.get().getProject();
        final ThreadSafe tableDefn = project.loadTableDef(tableName);
        final ListWrapper.Immutable<String> fieldNames = tableDefn.getFieldNames();
        final String[] fields = new String[fieldNames.size()];
        int pos = 0;
        for (final String fieldName : fieldNames) {
            fields[pos] = fieldName;
            pos++;
        }
        return fields;
    }
    
    /**
     * Returns dataSource object for specified level restriction. Used for generate records and
     * generate survey items.
     * 
     * @param level level
     * @param siteId site code
     * @param blId building code
     * @param flId floor code
     * @param rmId room code
     * @return data source
     */
    protected DataSource getDataSourceForLevel(final String level, final String siteId,
            final String blId, final String flId, final String rmId) {
        final DataSource dataSource = DataSourceFactory.createDataSource();
        String dsLevel = level;
        // when is one to one we must check for hat level to create datasource
        if (Constants.ONE_TO_ONE.equals(level)) {
            if (StringUtil.notNullOrEmpty(blId)) {
                dsLevel = Constants.BUILDING_TABLE;
            }
            if (StringUtil.notNullOrEmpty(flId)) {
                dsLevel = Constants.FLOOR_TABLE;
            }
            if (StringUtil.notNullOrEmpty(rmId)) {
                dsLevel = Constants.ROOM_TABLE;
            }
        }
        
        // add datasource table and fields
        if (Constants.ONE_TO_ONE.equals(dsLevel)) {
            dataSource.addTable(Constants.SITE_TABLE, DataSource.ROLE_MAIN);
            dataSource.addField(Constants.SITE_TABLE, Constants.SITE_FLD_NAME);
        } else {
            dataSource.addTable(Constants.BUILDING_TABLE, DataSource.ROLE_MAIN);
            dataSource.addTable(Constants.SITE_TABLE, DataSource.ROLE_STANDARD);
            dataSource.addField(Constants.SITE_TABLE, Constants.SITE_FLD_NAME);
            dataSource.addField(Constants.BUILDING_TABLE, Constants.BUILDING_FLD_NAME);
            dataSource.addRestriction(Restrictions.sql("bl.site_id = site.site_id"));
        }
        
        if (Constants.FLOOR_TABLE.equals(dsLevel) || Constants.ROOM_TABLE.equals(dsLevel)) {
            dataSource.addTable(Constants.FLOOR_TABLE, DataSource.ROLE_STANDARD);
            dataSource.addField(Constants.FLOOR_TABLE, Constants.FLOOR_FLD_NAME);
            dataSource.addRestriction(Restrictions.sql("fl.bl_id = bl.bl_id"));
        }
        if (Constants.ROOM_TABLE.equals(dsLevel)) {
            dataSource.addTable(Constants.ROOM_TABLE, DataSource.ROLE_STANDARD);
            dataSource.addField(Constants.ROOM_TABLE, Constants.ROOM_FLD_NAME);
            dataSource.addRestriction(Restrictions
                .sql("fl.bl_id = bl.bl_id AND rm.fl_id = fl.fl_id AND rm.bl_id = fl.bl_id"));
        }
        
        // add restriction if defined
        addSiteBuildingFloorRoomRestrictions(siteId, blId, flId, rmId, dataSource, dsLevel);
        
        return dataSource;
    }
    
    /**
     * Adds restriction for site, building, floor, room.
     * 
     * @param siteId site code
     * @param blId building code
     * @param flId floor code
     * @param rmId room code
     * @param dataSource data source to add restriction to
     * @param dsLevel record generation level
     */
    private void addSiteBuildingFloorRoomRestrictions(final String siteId, final String blId,
            final String flId, final String rmId, final DataSource dataSource, final String dsLevel) {
        if (StringUtil.notNullOrEmpty(siteId)) {
            dataSource.addRestriction(Restrictions.eq(Constants.SITE_TABLE,
                Constants.SITE_FLD_NAME, siteId));
        }
        if (StringUtil.notNullOrEmpty(blId)) {
            dataSource.addRestriction(Restrictions.eq(Constants.BUILDING_TABLE,
                Constants.BUILDING_FLD_NAME, blId));
        }
        if (StringUtil.notNullOrEmpty(flId)
                && (Constants.FLOOR_TABLE.equals(dsLevel) || Constants.ROOM_TABLE.equals(dsLevel))) {
            dataSource.addRestriction(Restrictions.eq(Constants.FLOOR_TABLE,
                Constants.FLOOR_FLD_NAME, flId));
        }
        if (StringUtil.notNullOrEmpty(rmId) && Constants.ROOM_TABLE.equals(dsLevel)) {
            dataSource.addRestriction(Restrictions.eq(Constants.ROOM_TABLE,
                Constants.ROOM_FLD_NAME, rmId));
        }
    }
    
    /**
     * Get locations levels for current item.
     * 
     * @param parent parent record
     * @param level specified level
     * @return records list
     */
    protected List<DataRecord> getLocationsForItem(final DataRecord parent, final String level) {
        String siteId = "";
        if (parent.valueExists(Constants.ACTIVITY_LOG_TABLE + Constants.DOT
                + Constants.SITE_FLD_NAME)) {
            siteId =
                    parent.getString(Constants.ACTIVITY_LOG_TABLE + Constants.DOT
                            + Constants.SITE_FLD_NAME);
        }
        String blId = "";
        if (parent.valueExists(Constants.ACTIVITY_LOG_TABLE + Constants.DOT
                + Constants.BUILDING_FLD_NAME)) {
            blId =
                    parent.getString(Constants.ACTIVITY_LOG_TABLE + Constants.DOT
                            + Constants.BUILDING_FLD_NAME);
        }
        String flId = "";
        if (parent.valueExists(Constants.ACTIVITY_LOG_TABLE + Constants.DOT
                + Constants.FLOOR_FLD_NAME)) {
            flId =
                    parent.getString(Constants.ACTIVITY_LOG_TABLE + Constants.DOT
                            + Constants.FLOOR_FLD_NAME);
        }
        
        String rmId = "";
        if (parent.valueExists(Constants.ACTIVITY_LOG_TABLE + Constants.DOT
                + Constants.ROOM_FLD_NAME)) {
            rmId =
                    parent.getString(Constants.ACTIVITY_LOG_TABLE + Constants.DOT
                            + Constants.ROOM_FLD_NAME);
        }
        
        final DataSource dsLocal = getDataSourceForLevel(level, siteId, blId, flId, rmId);
        return dsLocal.getRecords();
    }
    
    /**
     * Get records from table for specified restriction.
     * 
     * @param tableName table name
     * @param fieldName restriction field
     * @param fieldValue restriction value
     * @return records list
     */
    protected List<DataRecord> getRecordsFromTable(final String tableName, final String fieldName,
            final Object fieldValue) {
        final String[] fields = getAllFieldsForTable(tableName);
        return getRecordsFromTable(tableName, fieldName, fieldValue, fields);
    }
    
    /**
     * Get records from table for specified restriction.
     * 
     * @param tableName table name
     * @param fieldName restriction field
     * @param fieldValue restriction value
     * @param fields fields to return
     * @return records list
     */
    protected List<DataRecord> getRecordsFromTable(final String tableName, final String fieldName,
            final Object fieldValue, final String[] fields) {
        final DataSource dsLocal = DataSourceFactory.createDataSourceForFields(tableName, fields);
        if (fieldValue != null) {
            dsLocal.addRestriction(Restrictions.eq(tableName, fieldName, fieldValue));
        }
        return dsLocal.getRecords();
    }
    
    /**
     * Convert record values to hash map.
     * 
     * @param record data record
     * @return hash map with record values
     */
    protected Map<String, Object> recordToMap(final DataRecord record) {
        final Map<String, Object> result = new HashMap<String, Object>();
        final List<DataValue> fields = record.getFields();
        for (final DataValue field : fields) {
            final String key = field.getName();
            final Object value = field.getValue();
            result.put(key, value);
        }
        return result;
    }
    
    /**
     * Copy communication log documents.
     * 
     * @param sourceLog source id
     * @param targetLog target id
     * @param fileName document file name
     * @param docTable document table name
     * @param docField document field name
     * @param pkField document parent id
     * 
     *            UNUSED METHOD private void copyDocument(final String sourceLog, final String
     *            targetLog, final String fileName, final String docTable, final String docField,
     *            final String pkField) { // get document service object final DocumentService
     *            documentService = (DocumentService) ContextStore.get().getBean("documentService");
     *            // source doc parameters final Map srcKeys = new HashMap(); srcKeys.put(pkField,
     *            String.valueOf(sourceLog)); final DocumentParameters srcDocParam = new
     *            DocumentParameters(srcKeys, docTable, docField, null, true); // target document
     *            parameters final Map targetKeys = new HashMap(); targetKeys.put(pkField,
     *            String.valueOf(targetLog)); final DocumentParameters targetDocParam = new
     *            DocumentParameters(targetKeys, docTable, docField, fileName, "", "0"); // copy
     *            document documentService.copyDocument(srcDocParam, targetDocParam); }
     */
    
    /**
     * Get sql query for records count.
     * 
     * @param level specified level.
     * @return sql statement
     */
    private String getCountQuery(final String level) {
        String query = "";
        if (Constants.BUILDING_TABLE.equals(level)) {
            query = "SELECT COUNT(bl.bl_id) ${sql.as} numberOfRecords FROM bl WHERE 1 = 1 ";
        } else if (Constants.FLOOR_TABLE.equals(level)) {
            query =
                    "SELECT COUNT(fl.fl_id) ${sql.as} numberOfRecords FROM bl, fl WHERE fl.bl_id = bl.bl_id ";
        } else if (Constants.ROOM_TABLE.equals(level)) {
            query =
                    "SELECT COUNT(rm.rm_id) ${sql.as} numberOfRecords FROM bl, fl, rm "
                            + "WHERE fl.bl_id = bl.bl_id AND rm.fl_id = fl.fl_id AND rm.bl_id = fl.bl_id ";
        }
        return query;
    }
    
    /**
     * Get last assessed restriction statement.
     * 
     * @param level on what level to generate record
     * @param isOracle database type
     * @param monthNo last assessed month no
     * @return sql statement
     */
    private String getLastAssessedRestriction(final String level, final boolean isOracle,
            final Integer monthNo) {
        String sqlStatement;
        sqlStatement =
                "EXISTS(SELECT 1 FROM activity_log WHERE "
                        + "activity_log.activity_type = 'ASSESSMENT - HAZMAT' ";
        if (Constants.BUILDING_TABLE.equals(level)) {
            sqlStatement += "AND activity_log.bl_id = bl.bl_id ";
        } else if (Constants.FLOOR_TABLE.equals(level)) {
            sqlStatement += "AND activity_log.bl_id = fl.bl_id AND activity_log.fl_id = fl.fl_id ";
        } else if (Constants.ROOM_TABLE.equals(level)) {
            sqlStatement +=
                    "AND activity_log.bl_id = rm.bl_id AND activity_log.fl_id = rm.fl_id "
                            + "AND activity_log.rm_id = rm.rm_id ";
        }
        if (isOracle) {
            sqlStatement +=
                    "AND MONTHS_BETWEEN(${sql.currentDate}, activity_log.date_assessed ) >= ";
        } else {
            sqlStatement +=
                    "AND DATEDIFF(month, activity_log.date_assessed, ${sql.currentDate}) >= ";
        }
        sqlStatement += monthNo + ") ";
        return sqlStatement;
    }
    
    /**
     * Get location records for generate records.
     * 
     * @param level records level
     * @param filter filter values
     * @return data records list
     */
    private List<DataRecord> getLocationRecords(final String level, final Map<String, String> filter) {
        final DataSource dsLocations = getDataSourceForLevel(level, null, null, null, null);
        final String restriction = getRestriction(level, filter, SqlUtils.isOracle());
        dsLocations.addRestriction(Restrictions.sql("1 = 1 " + restriction));
        return dsLocations.getRecords();
    }
    
    /**
     * Get filter restriction. Return filter restriction as SQL string
     * 
     * @param level on what level to generate
     * @param filter filter settings
     * @param isOracle boolean if is Oracle
     * @return string with filter restriction.
     */
    private String getRestriction(final String level, final Map<String, String> filter,
            final boolean isOracle) {
        final String pattern = AND_FIELD_IN_VALUE;
        final String fieldMarker = FIELD_IN_CURLY_BRACKETS;
        final String valueMarker = VALUE_IN_CURLY_BRACKETS;
        
        final Map<String, String> queries =
                getRestrictionsFromFilter(level, filter, isOracle, pattern, fieldMarker,
                    valueMarker);
        final String blQuery = queries.get(BL_QUERY);
        String flQuery = queries.get(FL_QUERY);
        String rmQuery = queries.get(RM_QUERY);
        final String lastAssessedQuery = queries.get(LAST_ASSESSED_QUERY);
        
        if (flQuery.length() > 0) {
            String custJoin = "";
            if (Constants.FLOOR_TABLE.equals(level) || Constants.ROOM_TABLE.equals(level)
                    || Constants.ONE_TO_ONE.equals(level)) {
                custJoin = " AND fl_int.fl_id = fl.fl_id ";
            }
            flQuery =
                    "EXISTS(SELECT 1 FROM fl ${sql.as} fl_int WHERE fl_int.bl_id = bl.bl_id "
                            + custJoin + flQuery + Constants.RIGHT_ROUND_BRACKET;
        }
        
        if (rmQuery.length() > 0) {
            // we must add here fl clause if exists
            String rmFlClause = "";
            final String flField = Constants.FLOOR_TABLE + Constants.DOT + Constants.FLOOR_FLD_NAME;
            if (filter.containsKey(flField)) {
                final String flValue = filter.get(flField);
                rmFlClause +=
                        pattern.replace(fieldMarker, "rm_int.fl_id").replace(valueMarker, flValue);
            }
            String custJoin = "";
            if (Constants.ROOM_TABLE.equals(level) || Constants.ONE_TO_ONE.equals(level)) {
                custJoin = " AND rm_int.fl_id = rm.fl_id AND rm_int.rm_id = rm.rm_id ";
            }
            rmQuery =
                    "EXISTS(SELECT 1 FROM rm ${sql.as} rm_int WHERE rm_int.bl_id = bl.bl_id "
                            + custJoin + rmFlClause + Constants.SPACE_CHARACTER + rmQuery
                            + Constants.RIGHT_ROUND_BRACKET;
        }
        
        return getRestrictionQuery(blQuery, flQuery, rmQuery, lastAssessedQuery);
    }
    
    /**
     * Sets the restriction query.
     * 
     * @param blQuery building query
     * @param flQuery floor query
     * @param rmQuery room query
     * @param lastAssessedQuery last assessed query
     * @return query
     */
    private String getRestrictionQuery(final String blQuery, final String flQuery,
            final String rmQuery, final String lastAssessedQuery) {
        String restrQuery = "";
        
        if (blQuery.length() > 0) {
            restrQuery += getAndIfQueryNotEmpty(restrQuery) + blQuery;
        }
        if (flQuery.length() > 0) {
            restrQuery += getAndIfQueryNotEmpty(restrQuery) + flQuery;
        }
        if (rmQuery.length() > 0) {
            restrQuery += getAndIfQueryNotEmpty(restrQuery) + rmQuery;
        }
        if (lastAssessedQuery.length() > 0) {
            restrQuery += getAndIfQueryNotEmpty(restrQuery) + lastAssessedQuery;
        }
        return restrQuery;
    }
    
    /**
     * Returns " AND " if the query is not empty, "" otherwise.
     * 
     * @param restrQuery restriction query
     * @return " AND" or empty string
     */
    private String getAndIfQueryNotEmpty(final String restrQuery) {
        return restrQuery.length() > 0 ? Constants.SPACE_CHARACTER + Constants.AND_STRING
                + Constants.SPACE_CHARACTER : "";
    }
    
    /**
     * Creates restrictions: building, floor, room, last assessed.
     * 
     * @param level level
     * @param filter filter
     * @param isOracle is Oracle?
     * @param pattern patters
     * @param fieldMarker field marker
     * @param valueMarker value marker
     * @return queries strings the queries
     */
    private Map<String, String> getRestrictionsFromFilter(final String level,
            final Map<String, String> filter, final boolean isOracle, final String pattern,
            final String fieldMarker, final String valueMarker) {
        final String fromMarker = UNDERLINE_FROM;
        final String toMarker = UNDERLINE_TO;
        String blQuery = "";
        String flQuery = "";
        String rmQuery = "";
        String lastAssessedQuery = "";
        
        for (final String key : filter.keySet()) {
            final String keyValue = filter.get(key);
            // we need to treat some keys in a different way
            if (key.indexOf(Constants.BUILDING_TABLE + Constants.DOT) == 0) {
                blQuery += pattern.replace(fieldMarker, key).replace(valueMarker, keyValue);
            } else if (key.indexOf(Constants.FLOOR_TABLE + Constants.DOT) == 0) {
                final String custKeyFl = "fl_int" + key.substring(key.indexOf(Constants.DOT));
                flQuery += pattern.replace(fieldMarker, custKeyFl).replace(valueMarker, keyValue);
            } else if (key.indexOf(Constants.ROOM_TABLE + Constants.DOT) == 0) {
                final String custKeyRm = "rm_int" + key.substring(key.indexOf(Constants.DOT));
                rmQuery += pattern.replace(fieldMarker, custKeyRm).replace(valueMarker, keyValue);
            } else if ("last_assessed".equals(key)) {
                lastAssessedQuery =
                        getLastAssessedRestriction(level, isOracle, Integer.valueOf(keyValue));
            } else {
                String dateField = "";
                String operator = "";
                if (key.indexOf(toMarker) > -1) {
                    dateField =
                            Constants.BUILDING_TABLE + Constants.DOT + key.replace(toMarker, "");
                    operator = "<=";
                } else if (key.indexOf(fromMarker) > -1) {
                    dateField =
                            Constants.BUILDING_TABLE + Constants.DOT + key.replace(fromMarker, "");
                    operator = ">=";
                }
                final Calendar calendar = Calendar.getInstance();
                calendar.setTime(Date.valueOf(keyValue));
                final int yearValue = calendar.get(Calendar.YEAR);
                blQuery +=
                        "AND ${sql.yearOf('" + dateField + "')} " + operator
                                + Constants.SPACE_CHARACTER + yearValue + Constants.SPACE_CHARACTER;
            }
        }
        
        final Map<String, String> queries = new HashMap<String, String>();
        queries.put(BL_QUERY, blQuery);
        queries.put(FL_QUERY, flQuery);
        queries.put(RM_QUERY, rmQuery);
        queries.put(LAST_ASSESSED_QUERY, lastAssessedQuery);
        
        return queries;
    }
}
