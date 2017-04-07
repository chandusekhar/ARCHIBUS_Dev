package com.archibus.eventhandler.msds.mobile.impl;

import static com.archibus.app.common.mobile.util.FieldNameConstantsCommon.*;
import static com.archibus.app.common.mobile.util.ServiceConstants.*;
import static com.archibus.app.common.mobile.util.TableNameConstants.*;

import java.util.*;

import org.apache.directory.shared.ldap.util.ArrayUtils;

import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.model.view.datasource.ClauseDef.Operation;
import com.archibus.model.view.datasource.*;
import com.archibus.utility.StringUtil;

/**
 * Utility class. Provides data sources related methods for MSDS mobile services.
 *
 * <p>
 * Suppress PMD warning "AvoidUsingSql" in this method.
 * <p>
 * Justification: Case #2.3. Statements with DELETE FROM ... pattern
 *
 * @author Ana Paduraru
 * @since 22.1
 */
@SuppressWarnings("PMD.AvoidUsingSql")
public final class DataSourceUtilities {
    /**
     * Records added with the mobile app have location_auto_number like 'MID-%'.
     */
    private static final String NEW_LOCATION_PATTERN = "MID-%";

    /**
     * Insert operation string.
     */
    private static final String INSERT = "INSERT";

    /**
     * Update operation string.
     */
    private static final String UPDATE = "UPDATE";
    
    /**
     * Hide default constructor - should never be instantiated.
     */
    private DataSourceUtilities() {
    }
    
    /**
     * Remove the material location sync records from msds_location_sync table for specified site.
     *
     * @param userName the mobile user name validated from afm_users.user_name table
     * @param siteId site code
     */
    static void removeMaterialLocationSyncRecords(final String userName, final String siteId) {
        final String sql =
                String.format(
                    "DELETE FROM msds_location_sync WHERE site_id=%s AND mob_locked_by=%s",
                    SqlUtils.formatValueForSql(siteId), SqlUtils.formatValueForSql(userName));

        SqlUtils.executeUpdate(MSDS_LOCATION_SYNC_TABLE, sql);
    }

    /**
     * Copy records from msds_location table to the msds_location_sync table for specified site.
     * TODO copyMaterilaLocationToSyncTable.
     *
     * @param userName the mobile user name validated from afm_users.user_name table
     * @param siteId site code
     */
    static void copyMaterialLocationRecordsToSyncTable(final String userName, final String siteId) {
        final String[] insertFields =
                (String[]) ArrayUtils.removeElement(MSDS_LOCATION_FIELDS, AUTO_NUMBER);
        final int numberOfFields = insertFields.length;
        final String[] tableFields = new String[numberOfFields];

        for (int i = 0; i < numberOfFields; i++) {
            tableFields[i] = MSDS_LOCATION_TABLE + SQL_DOT + insertFields[i];
        }

        String tableFieldList = Arrays.toString(tableFields);
        tableFieldList = tableFieldList.replace(START_BRACKET, "").replace(END_BRACKET, "");
        
        String fieldList = Arrays.toString(insertFields);
        fieldList = fieldList.replace(START_BRACKET, "").replace(END_BRACKET, "");

        final String sql =
                String
                    .format(
                        "INSERT INTO msds_location_sync(%s, location_auto_number, mob_locked_by, tier2)"
                                + "SELECT %s, msds_location.auto_number, %s, "
                                
                                + "(CASE WHEN EXISTS(SELECT 1 FROM msds_location loc LEFT JOIN msds_constituent ON msds_constituent.msds_id = loc.msds_id LEFT JOIN msds_chemical ON msds_chemical.chemical_id = msds_constituent.chemical_id WHERE msds_location.bl_id=loc.bl_id AND ((msds_location.fl_id IS NULL AND loc.fl_id IS NULL) OR msds_location.fl_id=loc.fl_id) AND ((msds_location.rm_id IS NULL AND loc.rm_id IS NULL) OR msds_location.rm_id=loc.rm_id) AND msds_location.msds_id=loc.msds_id AND msds_chemical.tier2 = 'Extremely Hazardous') "
                                + "THEN 'Extremely Hazardous' "
                                
                                + "WHEN EXISTS(SELECT 1 FROM msds_location loc LEFT JOIN msds_constituent ON msds_constituent.msds_id = loc.msds_id LEFT JOIN msds_chemical ON msds_chemical.chemical_id = msds_constituent.chemical_id WHERE msds_location.bl_id=loc.bl_id AND ((msds_location.fl_id IS NULL AND loc.fl_id IS NULL) OR msds_location.fl_id=loc.fl_id) AND ((msds_location.rm_id IS NULL AND loc.rm_id IS NULL) OR msds_location.rm_id=loc.rm_id) AND msds_location.msds_id=loc.msds_id AND msds_chemical.tier2 = 'Hazardous') "
                                + "THEN 'Hazardous' "
                                
                                + "WHEN EXISTS(SELECT 1 FROM msds_location loc LEFT JOIN msds_constituent ON msds_constituent.msds_id = loc.msds_id LEFT JOIN msds_chemical ON msds_chemical.chemical_id = msds_constituent.chemical_id WHERE msds_location.bl_id=loc.bl_id AND ((msds_location.fl_id IS NULL AND loc.fl_id IS NULL) OR msds_location.fl_id=loc.fl_id) AND ((msds_location.rm_id IS NULL AND loc.rm_id IS NULL) OR msds_location.rm_id=loc.rm_id) AND msds_location.msds_id=loc.msds_id AND (msds_constituent.msds_id IS NULL OR msds_chemical.tier2 = 'Unknown')) "
                                + "THEN 'Unknown' "
                                
                                + "WHEN EXISTS(SELECT 1 FROM msds_location loc LEFT JOIN msds_constituent ON msds_constituent.msds_id = loc.msds_id LEFT JOIN msds_chemical ON msds_chemical.chemical_id = msds_constituent.chemical_id WHERE msds_location.bl_id=loc.bl_id AND ((msds_location.fl_id IS NULL AND loc.fl_id IS NULL) OR msds_location.fl_id=loc.fl_id) AND ((msds_location.rm_id IS NULL AND loc.rm_id IS NULL) OR msds_location.rm_id=loc.rm_id) AND msds_location.msds_id=loc.msds_id AND msds_chemical.tier2 = 'Not Listed') "
                                + "THEN 'Not Listed' ELSE 'Unknown' END ) AS tier2 "
                                + "FROM msds_location where site_id=%s ", fieldList,
                                tableFieldList, SqlUtils.formatValueForSql(userName),
                                SqlUtils.formatValueForSql(siteId));

        SqlUtils.executeUpdate(MSDS_LOCATION_SYNC_TABLE, sql);
        
    }

    /**
     * Update msds_location table based on msds_location_sync records by adding new records and
     * updating existing records.
     *
     * @param userName the mobile user name validated from afm_users.user_name table
     * @param siteId site code
     */
    static void updateMaterialLocationFromSyncTable(final String userName, final String siteId) {
        // update existing records
        insertUpdateMaterialLocations(userName, siteId, INSERT);

        // insert new records
        insertUpdateMaterialLocations(userName, siteId, UPDATE);
    }
    
    /**
     * Update or insert existing msds_location records based on msds_location_sync records.
     * Update/insert record by record to trigger MsdsDataEventListener that updates table
     * msds_location_h.
     *
     * @param userName the mobile user name validated from afm_users.user_name table
     * @param siteId site code
     * @param operation Valid values are "INSERT" and "UDPATE"
     */
    static void insertUpdateMaterialLocations(final String userName, final String siteId,
            final String operation) {
        final DataSource materialLocationSyncDatasource =
                DataSourceFactory.createDataSourceForFields(MSDS_LOCATION_SYNC_TABLE,
                    MSDS_LOCATION_SYNC_FIELDS);
        materialLocationSyncDatasource.setContext();
        materialLocationSyncDatasource.setMaxRecords(0);
        
        final DataSource materialLocationDatasource =
                DataSourceFactory.createDataSourceForFields(MSDS_LOCATION_TABLE,
                    MSDS_LOCATION_FIELDS);
        DataRecord materialLocationRecord = null;
        
        final ParsedRestrictionDef materialLocationSyncRestriction = new ParsedRestrictionDef();
        materialLocationSyncRestriction.addClause(MSDS_LOCATION_SYNC_TABLE, MOB_LOCKED_BY,
            userName, Operation.EQUALS);
        materialLocationSyncRestriction.addClause(MSDS_LOCATION_SYNC_TABLE, SITE_ID, siteId,
            Operation.EQUALS);
        
        if (INSERT.equals(operation)) {
            materialLocationSyncRestriction.addClause(MSDS_LOCATION_SYNC_TABLE,
                LOCATION_AUTO_NUMBER, NEW_LOCATION_PATTERN, Operation.LIKE);
        } else if (UPDATE.equals(operation)) {
            materialLocationSyncRestriction.addClause(MSDS_LOCATION_SYNC_TABLE,
                LOCATION_AUTO_NUMBER, NEW_LOCATION_PATTERN, Operation.NOT_LIKE);
            materialLocationSyncRestriction.addClause(MSDS_LOCATION_SYNC_TABLE, MOB_IS_CHANGED, 1,
                Operation.EQUALS);
        }
        
        final List<DataRecord> materialLocationSyncRecords =
                materialLocationSyncDatasource.getRecords(materialLocationSyncRestriction);

        // loop through all the sync records
        for (final DataRecord materialLocationSyncRecord : materialLocationSyncRecords) {
            if (INSERT.equals(operation)) {
                materialLocationRecord = materialLocationDatasource.createNewRecord();
            } else if (UPDATE.equals(operation)) {
                materialLocationRecord =
                        getRecordForUpdate(materialLocationDatasource, materialLocationSyncRecord);
            }
            
            if (materialLocationRecord != null) {
                for (final String fieldName : MSDS_LOCATION_FIELDS) {
                    if (!AUTO_NUMBER.equals(fieldName)) {
                        importFieldValue(MSDS_LOCATION_SYNC_TABLE, materialLocationSyncRecord,
                            MSDS_LOCATION_TABLE, materialLocationRecord, fieldName);
                    }
                }
                
                // save the record
                final DataRecord newMaterialLocationRecord =
                        materialLocationDatasource.saveRecord(materialLocationRecord);

                // When the app syncs data to the server, it should first save the record with
                // status=Disposed, then delete the record from the msds_location table. The record
                // should appear in the msds_h_locations table and via the Inventory Exception
                // Report.
                handleDisposedMaterialRecords(operation, materialLocationDatasource,
                    materialLocationRecord, newMaterialLocationRecord);
            }
        }
    }
    
    /**
     * Delete materials with container_status "DISPOSED" from msds_location table.
     *
     * @param operation Valid values are "INSERT" and "UDPATE"
     * @param materialLocationDatasource datasource for msds_location table
     * @param materialLocationRecord msds_location
     * @param newMaterialLocationRecord the new msds_location record created when operation is
     *            "INSERT" which contans the value for primary key field: auto_number
     */
    private static void handleDisposedMaterialRecords(final String operation,
            final DataSource materialLocationDatasource, final DataRecord materialLocationRecord,
            final DataRecord newMaterialLocationRecord) {
        if ("DISPOSED".equalsIgnoreCase(materialLocationRecord.getString(MSDS_LOCATION_TABLE
                + SQL_DOT + CONTAINER_STATUS))) {
            if (INSERT.equals(operation)) {
                materialLocationDatasource.deleteRecord(newMaterialLocationRecord);
            } else {
                materialLocationDatasource.deleteRecord(materialLocationRecord);
            }
        }
    }

    /**
     * Get the material_location record corresponding to material_location_sync record.
     *
     * @param materialLocationDatasource material_location datasource
     * @param materialLocationSyncRecord material_location_sync record
     * @return material_location record
     */
    private static DataRecord getRecordForUpdate(final DataSource materialLocationDatasource,
            final DataRecord materialLocationSyncRecord) {
        DataRecord materialLocationRecord = null;
        ParsedRestrictionDef materialLocationRestriction;
        materialLocationRestriction = new ParsedRestrictionDef();
        final String autoNumberString =
                materialLocationSyncRecord.getString(MSDS_LOCATION_SYNC_TABLE + SQL_DOT
                    + LOCATION_AUTO_NUMBER);

        // For update operation the autoNumber is numeric, it has its value copied from
        // msds_location.auto_number field.
        final int autoNumber = Integer.parseInt(autoNumberString);
        materialLocationRestriction.addClause(MSDS_LOCATION_TABLE, AUTO_NUMBER, autoNumber,
            Operation.EQUALS);
        final List<DataRecord> materialLocationRecords =
                materialLocationDatasource.getRecords(materialLocationRestriction);
        if (!materialLocationRecords.isEmpty()) {
            materialLocationRecord = materialLocationRecords.get(0);
        }
        return materialLocationRecord;
    }
    
    /**
     * Copy the field value from one table to another.
     *
     * @param fromTable source table name
     * @param fromRecord source record
     * @param toTable destination table name
     * @param toRecord destination record
     * @param field the field to copy
     */
    static void importFieldValue(final String fromTable, final DataRecord fromRecord,
            final String toTable, final DataRecord toRecord, final String field) {
        final String fromField = fromTable + SQL_DOT + field;
        final Object fromValue = fromRecord.getValue(fromField);
        final String toField = toTable + SQL_DOT + field;
        final Object toValue = toRecord.getValue(toField);
        
        if (StringUtil.notNullOrEmpty(fromValue)) {
            toRecord.setValue(toField, fromValue);
        } else {
            if (StringUtil.notNullOrEmpty(toValue)) {
                if (toValue instanceof String) {
                    toRecord.setValue(toField, "");
                } else {
                    toRecord.setValue(toField, null);
                }
            }
        }
    }
}
