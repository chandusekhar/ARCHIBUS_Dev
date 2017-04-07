package com.archibus.eventhandler.ehs.mobile;

import static com.archibus.app.common.mobile.util.FieldNameConstantsCommon.*;
import static com.archibus.app.common.mobile.util.ServiceConstants.SQL_DOT;
import static com.archibus.app.common.mobile.util.TableNameConstants.*;

import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;

/**
 * Provides supporting methods related to synchronizing the data in the incident witnesses table.
 * Supports the EhsMobileService class.
 * 
 * @author Ana Paduraru
 * @since 21.2
 * 
 */
final class EhsMobileWitnessUpdate {
    
    /**
     * Hide default constructor.
     */
    private EhsMobileWitnessUpdate() {
    }
    
    /**
     * Insert a new ehs_incident_witness record from a ehs_incident_witness_sync record from the
     * mobile device.
     * 
     * @param record ehs_incident_witness_sync record
     * @param incidentId incident_id from ehs_incidents table
     */
    static void insertIncidentWitnessRecord(final DataRecord record, final int incidentId) {
        // Create the incident witness data source
        final DataSource datasource =
                DataSourceFactory.createDataSourceForFields(INCIDENT_WITNESS_TABLE,
                    INCIDENT_WITNESS_FIEDLS);
        
        // Open a new record to save the data for the new Witness
        final DataRecord newRecord = datasource.createNewRecord();
        
        newRecord.setValue(INCIDENT_WITNESS_TABLE + SQL_DOT + INCIDENT_ID, incidentId);
        
        final String[] textFields =
                { WITNESS_TYPE, EM_ID, CONTACT_ID, NON_EM_NAME, NON_EM_INFO, INFORMATION };
        for (final String fieldName : textFields) {
            newRecord.setValue(INCIDENT_WITNESS_TABLE + SQL_DOT + fieldName,
                record.getString(INCIDENT_WITNESS_SYNC_TABLE + SQL_DOT + fieldName));
        }
        
        datasource.saveRecord(newRecord);
        datasource.commit();
    }
    
}
