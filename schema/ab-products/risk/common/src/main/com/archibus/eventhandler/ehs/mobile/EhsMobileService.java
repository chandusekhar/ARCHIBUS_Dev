package com.archibus.eventhandler.ehs.mobile;

import static com.archibus.app.common.mobile.util.FieldNameConstantsCommon.*;
import static com.archibus.app.common.mobile.util.ServiceConstants.*;
import static com.archibus.app.common.mobile.util.TableNameConstants.*;

import java.util.List;

import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.model.view.datasource.ClauseDef.Operation;
import com.archibus.model.view.datasource.*;

/**
 * WorkflowRule Service for Incident Reporting mobile app.
 * 
 * Registered in the ARCHIBUS WorkflowRules table as 'AbRiskEHS-EhsMobileService'.
 * 
 * Provides methods for integrating incidents sync table with incidents table.
 * 
 * Invoked by mobile client.
 * 
 * @author Ana Paduraru
 * @since 21.2
 * 
 */
public class EhsMobileService {
    
    /**
     * Sync incidents reported from the mobile app.
     * 
     * @param user User name used in mob_locked_by column.
     */
    public void syncWorkData(final String user) {
        
        // Get new incidents reported from mobile
        syncFromMobileNewReportedIncident(user);
        
        // Delete all sync data
        deleteSyncWork(user);
        
    }
    
    /**
     * Adds new incidents.
     * 
     * @param user Mobile user identifier.
     */
    private void syncFromMobileNewReportedIncident(final String user) {
        
        final DataSource datasource =
                DataSourceFactory.createDataSourceForFields(INCIDENT_SYNC_TABLE,
                    INCIDENT_SYNC_FIELDS);
        datasource.setContext();
        datasource.setMaxRecords(0);
        
        final ParsedRestrictionDef restriction = new ParsedRestrictionDef();
        restriction.addClause(INCIDENT_SYNC_TABLE, MOB_LOCKED_BY, user, Operation.EQUALS);
        
        datasource.addSort(MOB_INCIDENT_ID);
        
        final List<DataRecord> records = datasource.getRecords(restriction);
        
        for (final DataRecord record : records) {
            
            final int id = EhsMobileIncidentUpdate.insertIncidentRecord(user, record);
            
            // updateChildRecords(user, mobId, id);
            
            final int mobId = record.getInt(INCIDENT_SYNC_TABLE + SQL_DOT + MOB_INCIDENT_ID);
            
            addWitnesses(user, mobId, id);
            
            EhsMobileDocumentUpdate.addDocuments(user, mobId, id);
            
        }
    }
    
    /**
     * Adds witnesses to incident.
     * 
     * @param user Mobile user identifier.
     * @param mobIncidentId Incident id from mobile device.
     * @param incidentId Incident id from ehs_incidents table.
     */
    private void addWitnesses(final String user, final int mobIncidentId, final int incidentId) {
        final DataSource datasource =
                DataSourceFactory.createDataSourceForFields(INCIDENT_WITNESS_SYNC_TABLE,
                    INCIDENT_WITNESS_SYNC_FIEDLS);
        datasource.setContext();
        datasource.setMaxRecords(0);
        
        final ParsedRestrictionDef restriction = new ParsedRestrictionDef();
        restriction.addClause(INCIDENT_WITNESS_SYNC_TABLE, MOB_LOCKED_BY, user, Operation.EQUALS);
        restriction.addClause(INCIDENT_WITNESS_SYNC_TABLE, MOB_INCIDENT_ID, mobIncidentId,
            Operation.EQUALS);
        
        final List<DataRecord> records = datasource.getRecords(restriction);
        
        for (final DataRecord record : records) {
            
            EhsMobileWitnessUpdate.insertIncidentWitnessRecord(record, incidentId);
            
        }
    }
    
    /**
     * 
     * Deletes all the sync records for the current user.
     * 
     * @param user User Name
     */
    @SuppressWarnings({ "PMD.AvoidUsingSql" })
    private void deleteSyncWork(final String user) {
        
        // Justification: Case #2.3: Statements with DELETE FROM ... pattern
        final String sqlStatement =
                "DELETE FROM [table_name] WHERE " + MOB_LOCKED_BY + EQUAL + QUOTE + user + QUOTE;
        
        final String incidentSql = sqlStatement.replace(TABLE_NAME_MARKER, INCIDENT_SYNC_TABLE);
        SqlUtils.executeUpdate(INCIDENT_SYNC_TABLE, incidentSql);
        
        final String witnessSql =
                sqlStatement.replace(TABLE_NAME_MARKER, INCIDENT_WITNESS_SYNC_TABLE);
        SqlUtils.executeUpdate(INCIDENT_WITNESS_SYNC_TABLE, witnessSql);
        
        EhsMobileDocumentUpdate.deleteSyncDocuments(user);
    }
}
