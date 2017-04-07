package com.archibus.eventhandler.ehs.mobile;

import static com.archibus.app.common.mobile.util.FieldNameConstantsCommon.*;
import static com.archibus.app.common.mobile.util.ServiceConstants.SQL_DOT;
import static com.archibus.app.common.mobile.util.TableNameConstants.*;

import java.util.List;

import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.model.view.datasource.ClauseDef.Operation;
import com.archibus.model.view.datasource.*;

/**
 * Provides supporting methods related to synchronizing the data in the main incidents tables.
 * Supports the EhsMobileService class.
 * 
 * @author Ana Paduraru
 * @since 21.2
 * 
 */
final class EhsMobileIncidentUpdate {
    
    /**
     * Hide default constructor.
     */
    private EhsMobileIncidentUpdate() {
    }
    
    /**
     * Insert a new ehs_incidents record from a ehs_incidents_sync record from the mobile device.
     * 
     * @param user Mobile user identifier.
     * @param record ehs_incidens_sync record
     * @return incident id of the new inserted incident into the ehs_incidents table.
     */
    static int insertIncidentRecord(final String user, final DataRecord record) {
        // Create the incident data source
        final DataSource datasource =
                DataSourceFactory.createDataSourceForFields(INCIDENT_TABLE, INCIDENT_FIELDS);
        
        // Open a new record to save the data for the new incident
        final DataRecord newRecord = datasource.createNewRecord();
        
        final String[] textFields =
                { EM_ID_AFFECTED, INCIDENT_TYPE, REPORTED_BY, RECORDED_BY, CONTACT_ID, NON_EM_NAME,
                        NON_EM_INFO, SITE_ID, PR_ID, BL_ID, FL_ID, RM_ID, INJURY_CATEGORY_ID,
                        INJURY_AREA_ID, DESCRIPTION };
        for (final String fieldName : textFields) {
            newRecord.setValue(INCIDENT_TABLE + SQL_DOT + fieldName,
                record.getString(INCIDENT_SYNC_TABLE + SQL_DOT + fieldName));
        }
        
        final String[] dateFields = { DATE_INCIDENT, TIME_INCIDENT, DATE_DEATH };
        for (final String fieldName : dateFields) {
            newRecord.setValue(INCIDENT_TABLE + SQL_DOT + fieldName,
                record.getDate(INCIDENT_SYNC_TABLE + SQL_DOT + fieldName));
        }
        
        final String[] intFields = { EMERGENCY_RM_TREATMENT, IS_HOSPITALIZED };
        for (final String fieldName : intFields) {
            newRecord.setValue(INCIDENT_TABLE + SQL_DOT + fieldName,
                record.getInt(INCIDENT_SYNC_TABLE + SQL_DOT + fieldName));
        }
        
        // insertedRecord will contain only the primary key: incident_id
        DataRecord insertedRecord = datasource.saveRecord(newRecord);
        datasource.commit();
        
        final int newIncidentId = insertedRecord.getInt(INCIDENT_TABLE + SQL_DOT + INCIDENT_ID);
        
        final ParsedRestrictionDef incidentRestriction = new ParsedRestrictionDef();
        incidentRestriction.addClause(INCIDENT_TABLE, INCIDENT_ID, newIncidentId, Operation.EQUALS);
        final List<DataRecord> incidentRecords = datasource.getRecords(incidentRestriction);
        
        insertedRecord = incidentRecords.get(0);
        
        int parentIncidentId = newIncidentId;
        
        if (isParentRecord(record)) {
            updateSyncRecord(record, newIncidentId);
        } else {
            parentIncidentId = obtainParentNewId(user, record);
        }
        
        insertedRecord.setValue(INCIDENT_TABLE + SQL_DOT + PARENT_INCIDENT_ID, parentIncidentId);
        datasource.saveRecord(insertedRecord);
        datasource.commit();
        
        return newIncidentId;
    }
    
    /**
     * 
     * Verify if the record is a parent incident record.
     * 
     * @param record incident record
     * @return true if the record is a parent.
     */
    static boolean isParentRecord(final DataRecord record) {
        final int incidentId = record.getInt(INCIDENT_SYNC_TABLE + SQL_DOT + MOB_INCIDENT_ID);
        final int parentIncidentId =
                record.getInt(INCIDENT_SYNC_TABLE + SQL_DOT + PARENT_INCIDENT_ID);
        return parentIncidentId == 0 ? true : incidentId == parentIncidentId;
    }
    
    /**
     * Update parent sync record by setting the incident_id value to the new incident id.
     * 
     * @param record parent sync record
     * @param newIncidentId parent new incident id
     */
    static void updateSyncRecord(final DataRecord record, final int newIncidentId) {
        final DataSource datasource =
                DataSourceFactory.createDataSourceForFields(INCIDENT_SYNC_TABLE,
                    INCIDENT_SYNC_FIELDS);
        record.setValue(INCIDENT_SYNC_TABLE + SQL_DOT + INCIDENT_ID, newIncidentId);
        datasource.saveRecord(record);
        datasource.commit();
    }
    
    /**
     * 
     * Obtain the new id of the parent record.
     * 
     * @param record child sync record
     * @param user Mobile user identifier.
     * @return parent new id
     */
    static int obtainParentNewId(final String user, final DataRecord record) {
        final DataSource datasource =
                DataSourceFactory.createDataSourceForFields(INCIDENT_SYNC_TABLE,
                    INCIDENT_SYNC_FIELDS);
        
        final int parentIncidentId =
                record.getInt(INCIDENT_SYNC_TABLE + SQL_DOT + PARENT_INCIDENT_ID);
        
        final ParsedRestrictionDef restriction = new ParsedRestrictionDef();
        restriction.addClause(INCIDENT_SYNC_TABLE, MOB_LOCKED_BY, user, Operation.EQUALS);
        restriction.addClause(INCIDENT_SYNC_TABLE, MOB_INCIDENT_ID, parentIncidentId,
            Operation.EQUALS);
        
        final List<DataRecord> parentRecords = datasource.getRecords(restriction);
        final DataRecord parentRecord = parentRecords.get(0);
        return parentRecord.getInt(INCIDENT_SYNC_TABLE + SQL_DOT + INCIDENT_ID);
    }
    
}
