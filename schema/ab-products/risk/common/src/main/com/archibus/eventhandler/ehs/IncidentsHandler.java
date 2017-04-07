package com.archibus.eventhandler.ehs;

import java.util.*;

import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.*;
import com.archibus.datasource.restriction.Restrictions.Restriction.Clause;
import com.archibus.utility.StringUtil;

/**
 * Environmental Health & Safety Incidents handler.
 * 
 * @author Ioan Draghici
 * @since 20.1
 * 
 */
public class IncidentsHandler {
    
    /**
     * " = ".
     */
    private static final String EQUAL_SIGN = " = ";
    
    /**
     * Table name.
     */
    private static final String AFM_DOCVERS_TABLE = "afm_docvers";
    
    /**
     * Field name.
     */
    private static final String AFM_DOCVERS_VERSION = "afm_docvers.version";
    
    /**
     * Constant.
     */
    private static final String DASH = "-";
    
    /**
     * Field name.
     */
    private static final String DATE_DOC = "date_doc";
    
    /**
     * Field name.
     */
    private static final String DESCRIPTION = "description";
    
    /**
     * Field name.
     */
    private static final String DOC = "doc";
    
    /**
     * Field name.
     */
    private static final String DOC_AUTHOR = "doc_author";
    
    /**
     * Field name.
     */
    private static final String DOC_ID = "doc_id";
    
    /**
     * Field name.
     */
    private static final String DOCS_ASSIGNED_DATE_DOC = "docs_assigned.date_doc";
    
    /**
     * Field name.
     */
    private static final String DOCS_ASSIGNED_DESCRIPTION = "docs_assigned.description";
    
    /**
     * Field name.
     */
    private static final String DOCS_ASSIGNED_DOC = "docs_assigned.doc";
    
    /**
     * Field name.
     */
    private static final String DOCS_ASSIGNED_DOC_AUTHOR = "docs_assigned.doc_author";
    
    /**
     * Field name.
     */
    private static final String DOCS_ASSIGNED_DOC_ID = "docs_assigned.doc_id";
    
    /**
     * Field name.
     */
    private static final String DOCS_ASSIGNED_INCIDENT_ID = "docs_assigned.incident_id";
    
    /**
     * Field name.
     */
    private static final String DOCS_ASSIGNED_NAME = "docs_assigned.name";
    
    /**
     * Table name.
     */
    private static final String DOCS_ASSIGNED_TABLE = "docs_assigned";
    
    /**
     * Table name.
     */
    private static final String EHS_INCIDENTS_TABLE = "ehs_incidents";
    
    /**
     * Field name.
     */
    private static final String INCIDENT_ID = "incident_id";
    
    /**
     * Field name.
     */
    private static final String DATE_INCIDENT = "date_incident";
    
    /**
     * Field name.
     */
    private static final String NAME = "name";
    
    /**
     * Field name.
     */
    private static final String PARENT_INCIDENT_ID = "parent_incident_id";
    
    /**
     * Field name.
     */
    private static final String PKEY_VALUE = "pkey_value";
    
    /**
     * Field name.
     */
    private static final String TABLE_NAME = "table_name";
    
    /**
     * Field name.
     */
    private static final String VERSION = "version";
    
    /**
     * Field name "bl_id".
     */
    private static final String BL_ID = "bl_id";
    
    /**
     * Table name "bl".
     */
    private static final String BL_TABLE = "bl";
    
    /**
     * Constant ".".
     */
    private static final String DOT = ".";
    
    /**
     * Field name.
     */
    private static final String EM_ID = "em_id";
    
    /**
     * Field name "pr_id".
     */
    private static final String PR_ID = "pr_id";
    
    /**
     * Field name "safety_officer".
     */
    private static final String SAFETY_OFFICER = "safety_officer";
    
    /**
     * Work role name "SAFETY OFFICER".
     */
    private static final String SAFETY_OFFICER_VALUE = "SAFETY OFFICER";
    
    /**
     * Field name "site_id".
     */
    private static final String SITE_ID = "site_id";
    
    /**
     * Field name "vf_max_incident_id".
     */
    private static final String VF_MAX_INCIDENT_ID = "vf_max_incident_id";
    
    /**
     * Table name "work_roles_location".
     */
    private static final String WORK_ROLES_LOCATION = "work_roles_location";
    
    /**
     * Afm doc vers fields list.
     */
    private final String[] afmDocversFields = { TABLE_NAME, PKEY_VALUE, VERSION };
    
    /**
     * Docs Assigned fields list.
     */
    private final String[] docsAssignedFields = { DOC, DOC_ID, NAME, DESCRIPTION, INCIDENT_ID,
            DATE_DOC, DOC_AUTHOR };
    
    /**
     * 
     * Copies the incident document.
     * 
     * @param srcIncidentId incident ID to copy the document from
     * @param destIncidentId incident ID to copy the document to
     * @param destFileName destination file name (ehs_incidents.cause_doc field)
     */
    public void copyDocument(final int srcIncidentId, final int destIncidentId,
            final String destFileName) {
        
        final Map<String, String> srcKeys = new HashMap<String, String>();
        srcKeys.put(INCIDENT_ID, String.valueOf(srcIncidentId));
        
        final Map<String, String> targetKeys = new HashMap<String, String>();
        targetKeys.put(INCIDENT_ID, String.valueOf(destIncidentId));
        
        EhsDocumentHelper.copyDocuments(srcKeys, targetKeys, destFileName, EHS_INCIDENTS_TABLE,
            "cause_doc");
        
    }
    
    /**
     * Get list with redline location documents. Used for notifications attachment.
     * 
     * @param incidentId incident code
     * @return file name
     */
    public String getRedlineDoc(final int incidentId) {
        String fileName = "";
        final String documentName = getRedlineFileName(incidentId);
        final DataRecord docAssigned = getRedlineDocument(incidentId, documentName);
        
        if (StringUtil.notNullOrEmpty(docAssigned)) {
            final int docId = docAssigned.getInt(DOCS_ASSIGNED_DOC_ID);
            final int versionNo = getDocumentVersion(DOCS_ASSIGNED_TABLE, Integer.toString(docId));
            
            final Map<String, String> keys = new HashMap<String, String>();
            keys.put(DOC_ID, Integer.toString(docId));
            
            fileName =
                    EhsDocumentHelper.checkOutFile(documentName, versionNo, keys,
                        DOCS_ASSIGNED_TABLE, DOC);
        }
        return fileName;
    }
    
    /**
     * Gets the list of safety officers (em_id) to send the incident notification to.
     * 
     * @param values incident location values
     * @return employee id list
     */
    public List<String> getSafetyOfficers(final Map<String, Object> values) {
        final List<String> emIdsArray = new ArrayList<String>();
        
        final String tableName = WORK_ROLES_LOCATION;
        final String[] fieldNames = { EM_ID };
        
        final List<Clause> clauses = new ArrayList<Clause>();
        
        // get the safety officers of the site
        if (StringUtil.notNullOrEmpty(values.get(SITE_ID))) {
            clauses.add(Restrictions.eq(tableName, SITE_ID, values.get(SITE_ID)));
        }
        
        // get the safety officers of the property
        if (StringUtil.notNullOrEmpty(values.get(PR_ID))) {
            clauses.add(Restrictions.eq(tableName, PR_ID, values.get(PR_ID)));
        }
        
        // get the safety officers of the building OR of the site of the building
        if (StringUtil.notNullOrEmpty(values.get(BL_ID))) {
            clauses.add(Restrictions.eq(tableName, BL_ID, values.get(BL_ID)));
            
            // get the safety officers of the site of the building
            final DataSource dataSourceBl =
                    DataSourceFactory.createDataSourceForFields(BL_TABLE, new String[] { SITE_ID });
            dataSourceBl.addRestriction(Restrictions.eq(BL_TABLE, BL_ID, values.get(BL_ID)));
            final String siteBlId = dataSourceBl.getRecord().getString(BL_TABLE + DOT + SITE_ID);
            
            clauses.add(Restrictions.eq(tableName, SITE_ID, siteBlId));
        }
        
        // get the safety officer entered in the incident record
        if (StringUtil.notNullOrEmpty(values.get(SAFETY_OFFICER))) {
            emIdsArray.add((String) values.get(SAFETY_OFFICER));
        }
        
        final Clause safetyOfficerClause =
                Restrictions.eq(tableName, "work_role_name", SAFETY_OFFICER_VALUE);
        final DataSource dataSource =
                DataSourceFactory.createDataSourceForFields(tableName, fieldNames);
        dataSource.setDistinct(true);
        dataSource.addTable(BL_TABLE, DataSource.ROLE_STANDARD);
        dataSource.addRestriction(safetyOfficerClause);
        dataSource.addRestriction(Restrictions.or(clauses.toArray(new Clause[clauses.size()])));
        final List<DataRecord> records = dataSource.getRecords();
        for (final DataRecord record : records) {
            emIdsArray.add(record.getString(tableName + DOT + EM_ID));
        }
        
        return emIdsArray;
    }
    
    /**
     * 
     * Saves Incident record, including updating the incident date of the child incidents with the
     * parent incident's date.
     * 
     * @param record the record to be saved
     * @param viewName the view name containing the dataSource to use
     * @param dataSourceId the dataSource to use for saving the record
     * @return The saved record
     */
    public DataRecord saveIncident(final DataRecord record, final String viewName,
            final String dataSourceId) {
        // save the value of newRecord, BEFORE saving the record
        final boolean isNewIncident = record.isNew();
        
        // save the record
        final DataSource dataSource =
                DataSourceFactory.loadDataSourceFromFile(viewName, dataSourceId);
        dataSource.saveRecord(record);
        
        // get the incident id of the last saved record
        final DataSource simpleDataSource =
                DataSourceFactory.createDataSourceForFields(EHS_INCIDENTS_TABLE, new String[] {
                        INCIDENT_ID, PARENT_INCIDENT_ID });
        int incidentId = record.getInt(EHS_INCIDENTS_TABLE + DOT + INCIDENT_ID);
        
        // for new incident, get its id
        if (isNewIncident) {
            final DataSourceGroupingImpl groupingDataSource = new DataSourceGroupingImpl();
            groupingDataSource.addTable(EHS_INCIDENTS_TABLE);
            
            final VirtualFieldDef maxIncidentId =
                    new VirtualFieldDef(EHS_INCIDENTS_TABLE, VF_MAX_INCIDENT_ID,
                        DataSource.DATA_TYPE_INTEGER, 6, 0, "max", EHS_INCIDENTS_TABLE + DOT
                                + INCIDENT_ID);
            groupingDataSource.addCalculatedField(maxIncidentId);
            
            final DataRecord maxIncidentIdRecord = groupingDataSource.getRecord();
            incidentId = maxIncidentIdRecord.getInt(EHS_INCIDENTS_TABLE + DOT + VF_MAX_INCIDENT_ID);
        }
        simpleDataSource.addRestriction(Restrictions.eq(EHS_INCIDENTS_TABLE, INCIDENT_ID,
            incidentId));
        final DataRecord savedRecord = simpleDataSource.getRecord();
        
        if (!StringUtil.isNullOrEmpty(savedRecord)) {
            final int parentIncidentId =
                    savedRecord.getInt(EHS_INCIDENTS_TABLE + DOT + PARENT_INCIDENT_ID);
            
            /*
             * if parent_incident_id = 0, must update the record to set parent_incident_id =
             * incident_id
             */
            if (parentIncidentId == 0) {
                savedRecord.setValue(EHS_INCIDENTS_TABLE + DOT + PARENT_INCIDENT_ID, incidentId);
                simpleDataSource.saveRecord(savedRecord);
            }
            
            // update the incident date of the child incidents with the parent incident's date
            if (!isNewIncident && parentIncidentId == incidentId) {
                final Date incidentDate = record.getDate(EHS_INCIDENTS_TABLE + DOT + DATE_INCIDENT);
                this.updateChildIncidentsDate(parentIncidentId, incidentDate);
            }
        }
        
        // return the record
        dataSource.addRestriction(Restrictions.eq(EHS_INCIDENTS_TABLE, INCIDENT_ID, incidentId));
        return dataSource.getRecord();
    }
    
    /**
     * 
     * Updates child incident records with the incident date of the given incident.
     * 
     * <p>
     * Suppress PMD warning "AvoidUsingSql" in this method.
     * <p>
     * Justification: bulk update.
     * 
     * @param parentIncidentId parent incident id
     * @param incidentDate parent incident date
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    // TODO: (VT): Justification does not reference a particular case from the Wiki.
    private void updateChildIncidentsDate(final Integer parentIncidentId, final Date incidentDate) {
        final String sqlQuery =
                "UPDATE " + EHS_INCIDENTS_TABLE + " SET " + DATE_INCIDENT + EQUAL_SIGN
                        + SqlUtils.formatValueForSql(incidentDate) + " WHERE " + PARENT_INCIDENT_ID
                        + EQUAL_SIGN + SqlUtils.formatValueForSql(parentIncidentId);
        
        SqlUtils.executeUpdate(EHS_INCIDENTS_TABLE, sqlQuery);
        
        SqlUtils.commit();
    }
    
    /**
     * Submit redline document to incident.
     * 
     * @param incidentId incident id
     * @param name document name
     * @param description document description
     * @param data image content
     * @param docAuthor document author; logged employee code
     * @param docDate document date
     * 
     */
    public void submitRedline(final int incidentId, final String name, final String description,
            final String data, final String docAuthor, final Date docDate) {
        
        final String fileName = getRedlineFileName(incidentId);
        DataRecord redlineDoc = getRedlineDocument(incidentId, fileName);
        if (StringUtil.isNullOrEmpty(redlineDoc)) {
            // add new doc assigned record
            redlineDoc =
                    addRedlineDocument(incidentId, fileName, name, description, docAuthor, docDate);
        }
        
        final int docId = redlineDoc.getInt(DOCS_ASSIGNED_DOC_ID);
        final int versionNo = getDocumentVersion(DOCS_ASSIGNED_TABLE, Integer.toString(docId));
        
        final Map<String, String> keys = new HashMap<String, String>();
        keys.put(DOC_ID, Integer.toString(docId));
        
        EhsDocumentHelper
            .checkInDocument(fileName, versionNo, keys, DOCS_ASSIGNED_TABLE, DOC, data);
        
    }
    
    /**
     * Add docs assigned record and return saved record.
     * 
     * @param incidentId incident code
     * @param fileName file name
     * @param name document name
     * @param description document description
     * @param docAuthor document author
     * @param docDate document date
     * @return saved data record
     */
    private DataRecord addRedlineDocument(final int incidentId, final String fileName,
            final String name, final String description, final String docAuthor, final Date docDate) {
        final DataSource dataSource =
                DataSourceFactory.createDataSourceForFields(DOCS_ASSIGNED_TABLE,
                    this.docsAssignedFields);
        final DataRecord record = dataSource.createNewRecord();
        
        record.setValue(DOCS_ASSIGNED_INCIDENT_ID, incidentId);
        record.setValue(DOCS_ASSIGNED_DOC, fileName);
        record.setValue(DOCS_ASSIGNED_NAME, name);
        record.setValue(DOCS_ASSIGNED_DESCRIPTION, description);
        record.setValue(DOCS_ASSIGNED_DATE_DOC, docDate);
        record.setValue(DOCS_ASSIGNED_DOC_AUTHOR, docAuthor);
        
        return dataSource.saveRecord(record);
    }
    
    /**
     * Get document version number.
     * 
     * @param tableName table name
     * @param pkValue primary key value
     * @return version number
     */
    private int getDocumentVersion(final String tableName, final String pkValue) {
        int version = 0;
        final DataSource dataSource =
                DataSourceFactory.createDataSourceForFields(AFM_DOCVERS_TABLE,
                    this.afmDocversFields);
        dataSource.addRestriction(Restrictions.and(
            Restrictions.eq(AFM_DOCVERS_TABLE, TABLE_NAME, tableName),
            Restrictions.eq(AFM_DOCVERS_TABLE, PKEY_VALUE, pkValue)));
        dataSource.addSort(AFM_DOCVERS_TABLE, VERSION, DataSource.SORT_DESC);
        final DataRecord record = dataSource.getRecord();
        if (StringUtil.notNullOrEmpty(record)) {
            version = record.getInt(AFM_DOCVERS_VERSION);
        }
        return version;
    }
    
    /**
     * Get redline document record.
     * 
     * @param incidentId incident id
     * @param fileName file name
     * @return docs assigned record or null
     */
    private DataRecord getRedlineDocument(final int incidentId, final String fileName) {
        final DataSource dataSource =
                DataSourceFactory.createDataSourceForFields(DOCS_ASSIGNED_TABLE,
                    this.docsAssignedFields);
        dataSource.addRestriction(Restrictions.and(
            Restrictions.eq(DOCS_ASSIGNED_TABLE, DOC, fileName),
            Restrictions.eq(DOCS_ASSIGNED_TABLE, INCIDENT_ID, incidentId)));
        return dataSource.getRecord();
    }
    
    /**
     * Get redline file name.
     * 
     * @param incidentId incident id
     * @return file name
     */
    private String getRedlineFileName(final int incidentId) {
        return EHS_INCIDENTS_TABLE + DASH + incidentId + DASH + "redline.png";
    }
}
