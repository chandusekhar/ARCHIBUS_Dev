package com.archibus.app.space.mobile.service.impl;

import static com.archibus.app.common.mobile.space.DataSourceUtilities.*;
import static com.archibus.app.common.mobile.util.FieldNameConstantsCommon.*;
import static com.archibus.app.common.mobile.util.TableNameConstants.*;

import java.util.List;

import org.json.JSONObject;

import com.archibus.app.space.mobile.service.ISpaceMobileService;
import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.model.view.datasource.ClauseDef.Operation;
import com.archibus.model.view.datasource.*;
import com.archibus.security.UserAccount;
import com.archibus.utility.StringUtil;

/**
 * Implementation of the Space Room Inventory Mobile Management Workflow Rule Service for space book
 * mobile application.
 * <p>
 * Registered in the ARCHIBUS Workflow Rules table as 'AbSpaceRoomInventoryBAR-SpaceMobileService'.
 * <p>
 * Provides methods for synchronize and close space book survey and business logic for space book
 * survey.
 * <p>
 * Invoked by web or mobile client.
 *
 * @author Ying Qin
 * @since 21.1
 *
 */
public class SpaceMobileService implements ISpaceMobileService {
    
    /**
     * Constant: allowed security group.
     */
    static final String SECURITY_GROUP_SPAC_SURVEY_POST = "SPAC-SURVEY-POST";
    
    /**
     * Constant: error message when the user does not belong t the allowed security group.
     */
    static final String SECURITY_GROUP_MESSAGE =
            "Your account does not belong to the security group required to run this rule: [AbSpaceRoomInventoryBAR-SpaceMobileService-copyRoomsToSyncTable].";
    
    /**
     * Constant: the number of failed records.
     */
    private static final String NUMBER_OF_FAILED_RECORDS = "numberOfFailedRecords";
    
    /**
     * Constant: the "errorMessage" parameter returned to client.
     */
    private static final String ERROR_MESSAGE = "errorMessage";
    
    /** {@inheritDoc} */
    public void copyRoomsToSyncTable(final String surveyId, final String userName,
            final String buildingId, final String floorId) {
        
        // check if there is any existing record in surveymob_sync table
        final DataSource surveySyncDataSource =
                DataSourceFactory.createDataSourceForFields(SURVEY_MOB_SYNC_TABLE,
                    SURVEY_SYNC_FIELDS);
        final ParsedRestrictionDef restriction = new ParsedRestrictionDef();
        restriction.addClause(SURVEY_MOB_SYNC_TABLE, SURVEY_ID, surveyId, Operation.EQUALS);
        final List<DataRecord> roomMobileRecords = surveySyncDataSource.getRecords(restriction);
        
        // if there are records exists in surveymob_sync table
        if (StringUtil.notNullOrEmpty(surveyId) && roomMobileRecords != null
                && !roomMobileRecords.isEmpty()) {
            
            // remove the room sync records from surveyrm_sync table
            clearRoomSyncRecords(surveyId, buildingId, floorId);
            
            // copy the record from room table to the room sync (surveyrm_sync) table
            copyRoomsToSyncTableForFields(SPACE_BOOK_ROOM_FIELDS, surveyId, userName, buildingId,
                floorId);
        }
    }
    
    /** {@inheritDoc} */
    // TODO avoid using JSON in business logic
    public JSONObject closeSurveyTable(final String surveyId) {
        
        final JSONObject result = new JSONObject();
        
        // check if the rule specifies the security group, and the user is a member of this group
        final UserAccount.Immutable userAccount =
                ContextStore.get().getUserSession().getUserAccount();
        
        // returns an error if the current user is not a member of the SPAC-SURVEY-POST Security
        // Group.
        if (userAccount.isMemberOfGroup(SECURITY_GROUP_SPAC_SURVEY_POST)) {
            // search for the records in the surveyrm_sync table that is assigned to
            // surveymob_sync.survey_id value.
            final DataSource roomSyncDatasource =
                    DataSourceFactory.createDataSourceForFields(SURVEY_RM_SYNC_TABLE,
                        SPACE_BOOK_ROOM_SURVEY_SYNC_FIELDS);
            roomSyncDatasource.setContext();
            roomSyncDatasource.setMaxRecords(0);
            
            final ParsedRestrictionDef roomSyncRestriction = new ParsedRestrictionDef();
            roomSyncRestriction.addClause(SURVEY_RM_SYNC_TABLE, SURVEY_ID, surveyId,
                Operation.EQUALS);
            List<DataRecord> roomSyncRecords = roomSyncDatasource.getRecords(roomSyncRestriction);
            
            DataSourceUtilities.copySyncRecordToRoomTable(roomSyncDatasource, roomSyncRecords);
            
            // try to get the room sync records in database again
            roomSyncRecords = roomSyncDatasource.getRecords(roomSyncRestriction);
            
            // transfer from rm sync table to room table is successful
            if (roomSyncRecords == null || roomSyncRecords.isEmpty()) {
                // delete the room mobile sync record.
                removeSurveyMobSync(surveyId);
                result.put(NUMBER_OF_FAILED_RECORDS, 0);
            } else {
                // Marks the surveymob_sync.status as Completed
                updateSurveyMobSyncStatus(surveyId);
                result.put(NUMBER_OF_FAILED_RECORDS, roomSyncRecords.size());
            }
        } else {
            result.put(NUMBER_OF_FAILED_RECORDS, "-1");
            result.put(ERROR_MESSAGE, SECURITY_GROUP_MESSAGE);
        }
        
        return result;
    }
    
    /** {@inheritDoc} */
    public void deleteSurvey(final String surveyId) {
        
        final DataSource roomSyncDatasource =
                DataSourceFactory.createDataSourceForFields(SURVEY_RM_SYNC_TABLE,
                    SPACE_BOOK_ROOM_SURVEY_SYNC_FIELDS);
        roomSyncDatasource.setContext();
        roomSyncDatasource.setMaxRecords(0);
        
        // delete the room mobile sync record.
        clearRoomSyncRecords(surveyId, "", "");
        
        final ParsedRestrictionDef roomSyncRestriction = new ParsedRestrictionDef();
        roomSyncRestriction.addClause(SURVEY_RM_SYNC_TABLE, SURVEY_ID, surveyId, Operation.EQUALS);
        
        final List<DataRecord> roomSyncRecords = roomSyncDatasource.getRecords(roomSyncRestriction);
        if (roomSyncRecords == null || roomSyncRecords.isEmpty()) {
            removeSurveyMobSync(surveyId);
        }
    }
    
}
