package com.archibus.app.space.mobile.service.impl;

import static com.archibus.app.common.mobile.space.DataSourceUtilities.importFieldValue;
import static com.archibus.app.common.mobile.util.FieldNameConstantsCommon.*;
import static com.archibus.app.common.mobile.util.TableNameConstants.*;

import java.util.List;

import com.archibus.app.common.mobile.space.RestrictionUtilities;
import com.archibus.app.common.mobile.util.DocumentsUtilities;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.model.view.datasource.ParsedRestrictionDef;

/**
 * Utility class. Provides methods related with data sources for space book mobile services.
 *
 * @author Ying Qin
 * @since 21.1
 *
 */
final class DataSourceUtilities {
    
    /**
     * Hide default constructor - should never be instantiated.
     */
    private DataSourceUtilities() {
    }
    
    /**
     * Copies rooms sync records to room table.
     *
     * For each record in the surveyrm_sync table that is assigned to surveymob_sync.survey_id
     * value: If the record exists in the rm table, update it by updating the non-pkey fields listed
     * above. Otherwise insert it. If the update or insert succeeds, delete the record from the
     * surveyrm_sync table.
     *
     * @param roomSyncDatasource the room sync data source to copy from
     * @param roomSyncRecords the room sync records to copy
     */
    static void copySyncRecordToRoomTable(final DataSource roomSyncDatasource,
            final List<DataRecord> roomSyncRecords) {
        final String[] pkFields = { BL_ID, FL_ID, RM_ID };
        final String[] nonPkFields =
                { DV_ID, DP_ID, PRORATE, RM_CAT, RM_TYPE, RM_STD, NAME, RM_USE, TRANSFER_STATUS,
                        SURVEY_COMMENTS_RM };
        final DataSource roomDatasource =
                DataSourceFactory.createDataSourceForFields(RM_TABLE, SPACE_BOOK_ROOM_FIELDS);
        // loop through all the room sync records
        for (final DataRecord roomSyncRecord : roomSyncRecords) {
            final ParsedRestrictionDef roomRestriction =
                    RestrictionUtilities.obtainRoomRecordRestriction(SURVEY_RM_SYNC_TABLE,
                        roomSyncRecord);
            
            final List<DataRecord> roomRecords = roomDatasource.getRecords(roomRestriction);
            DataRecord roomRecord;
            // If the record does not exist in the rm table, create a new record with the
            // specified pks.
            if (roomRecords.isEmpty()) {
                // new record, does not exist in the room table
                roomRecord = roomDatasource.createNewRecord();
                for (final String fieldName : pkFields) {
                    importFieldValue(SURVEY_RM_SYNC_TABLE, roomSyncRecord, RM_TABLE, roomRecord,
                        fieldName);
                }
            } else {
                roomRecord = roomRecords.get(0);
            }
            // set all non-pk fields values
            for (final String fieldName : nonPkFields) {
                importFieldValue(SURVEY_RM_SYNC_TABLE, roomSyncRecord, RM_TABLE, roomRecord,
                    fieldName);
            }
            
            // save the record
            roomDatasource.saveRecord(roomRecord);
            roomDatasource.commit();
            
            // If the update or insert succeeds, delete the record from the surveyrm_sync table
            roomSyncDatasource.deleteRecord(roomSyncRecord);
            roomSyncDatasource.commit();
            
            DocumentsUtilities.copyDocuments(new String[] { SURVEY_PHOTO, SURVEY_REDLINE_RM },
                roomSyncRecord, roomRecord);
            
        }
    }
}
