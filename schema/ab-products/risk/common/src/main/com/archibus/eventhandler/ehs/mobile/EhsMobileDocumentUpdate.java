package com.archibus.eventhandler.ehs.mobile;

import static com.archibus.app.common.mobile.util.FieldNameConstantsCommon.*;
import static com.archibus.app.common.mobile.util.ServiceConstants.SQL_DOT;
import static com.archibus.app.common.mobile.util.TableNameConstants.*;

import java.util.List;

import com.archibus.app.common.mobile.util.DocumentsUtilities;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.model.view.datasource.ClauseDef.Operation;
import com.archibus.model.view.datasource.*;

/**
 * Provides supporting methods related to synchronizing documents in the docs_assigned tables used
 * by EHS applications to store documents. Supports the EhsMobileService class.
 * 
 * 
 * @author Ana Paduraru
 * @since 21.2
 * 
 */
final class EhsMobileDocumentUpdate {
    
    /**
     * Document field names for activity_log table.
     */
    public static final String[] DOCUMENT_FIELD_NAMES_DOCS_ASSIGNED = { DOC };
    
    /**
     * Hide default constructor.
     */
    private EhsMobileDocumentUpdate() {
    }
    
    /**
     * Adds documents to incident.
     * 
     * @param user Mobile user identifier.
     * @param mobIncidentId Incident id from mobile device.
     * @param incidentId Incident id from ehs_incidents table.
     */
    static void addDocuments(final String user, final int mobIncidentId, final int incidentId) {
        final DataSource datasource =
                DataSourceFactory.createDataSourceForFields(INCIDENT_DOCUMENTS_SYNC_TABLE,
                    INCIDENT_DOCUMENTS_SYNC_FIELDS);
        datasource.setContext();
        datasource.setMaxRecords(0);
        
        final ParsedRestrictionDef restriction = new ParsedRestrictionDef();
        restriction.addClause(INCIDENT_DOCUMENTS_SYNC_TABLE, MOB_LOCKED_BY, user, Operation.EQUALS);
        restriction.addClause(INCIDENT_DOCUMENTS_SYNC_TABLE, MOB_INCIDENT_ID, mobIncidentId,
            Operation.EQUALS);
        
        final List<DataRecord> records = datasource.getRecords(restriction);
        
        for (final DataRecord record : records) {
            
            // Open a new record to save the data for the new Document
            final DataRecord newRecord = insertIncidentDocumentRecord(record, incidentId);
            
            // copy the attached documents
            DocumentsUtilities.copyDocuments(DOCUMENT_FIELD_NAMES_DOCS_ASSIGNED, record, newRecord);
        }
    }
    
    /**
     * Deletes all sync documents (docs_assigned_sync table) of the user. Cascading deletion of
     * related afm_docs, afm_docvers, afm_docversarch records is ensured by DataSource class.
     * 
     * @param user Mobile user identifier.
     */
    static void deleteSyncDocuments(final String user) {
        final DataSource datasource =
                DataSourceFactory.createDataSourceForFields(INCIDENT_DOCUMENTS_SYNC_TABLE,
                    INCIDENT_DOCUMENTS_SYNC_FIELDS);
        datasource.setContext();
        datasource.setMaxRecords(0);
        
        datasource.addRestriction(Restrictions.eq(INCIDENT_DOCUMENTS_SYNC_TABLE, MOB_LOCKED_BY,
            user));
        
        final List<DataRecord> records = datasource.getRecords();
        
        for (final DataRecord record : records) {
            datasource.deleteRecord(record);
        }
    }
    
    /**
     * Insert a new docs_assigned record from a docs_assigned_sync record from the mobile device.
     * 
     * @param record docs_assigned_sync record
     * @param incidentId incident_id from ehs_incidents table
     * @return the new record
     */
    static DataRecord insertIncidentDocumentRecord(final DataRecord record, final int incidentId) {
        
        final DataSource incidentDocsDatasource =
                DataSourceFactory.createDataSourceForFields(INCIDENT_DOCUMENTS_TABLE,
                    INCIDENT_DOCUMENTS_FIELDS);
        
        // Open a new record to save the data for the new Document
        DataRecord newRecord = incidentDocsDatasource.createNewRecord();
        
        newRecord.setValue(INCIDENT_DOCUMENTS_TABLE + SQL_DOT + INCIDENT_ID, incidentId);
        
        newRecord.setValue(INCIDENT_DOCUMENTS_TABLE + SQL_DOT + DOC,
            record.getValue(INCIDENT_DOCUMENTS_SYNC_TABLE + SQL_DOT + DOC));
        
        final String[] textFields = { NAME, DESCRIPTION, DOC_AUTHOR };
        for (final String fieldName : textFields) {
            newRecord.setValue(INCIDENT_DOCUMENTS_TABLE + SQL_DOT + fieldName,
                record.getString(INCIDENT_DOCUMENTS_SYNC_TABLE + SQL_DOT + fieldName));
        }
        
        newRecord.setValue(INCIDENT_DOCUMENTS_TABLE + SQL_DOT + DATE_DOC,
            record.getDate(INCIDENT_DOCUMENTS_SYNC_TABLE + SQL_DOT + DATE_DOC));
        
        newRecord = incidentDocsDatasource.saveRecord(newRecord);
        incidentDocsDatasource.commit();
        
        return newRecord;
    }
}
