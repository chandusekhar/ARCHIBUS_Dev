package com.archibus.eventhandler.ConditionAssessment;

import java.util.*;

import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.jobmanager.*;
import com.archibus.service.*;
import com.archibus.service.DocumentService.DocumentParameters;

/**
 * Methods for Condition Assessment
 * 
 * @author draghici
 * 
 */
public class ConditionAssessmentService extends JobBase {
    private static String SQL_ASSESSMENT = "ASSESSMENT";
    
    private static String RECORDS_FOR_RM_AND_EQ = "RmEq";
    
    private static String RECORDS_FOR_RM = "Rm";
    
    private static String RECORDS_FOR_EQ = "Eq";
    
    /**
     * Generates assessment records for user selection
     * <p>
     * First, calculates the number of records to generate and sets it to
     * <code>status.totalNumber</code></>
     * 
     * @param projectId
     * @param siteId
     * @param buildingId
     * @param floorId
     * @param recordsFor: values in RmEq, Rm, Eq
     */
    public void generateAssessmentRecords(final String projectId, final String siteId,
            final String buildingId, final String floorId, final String activityType,
            final String recordsFor) {
        // total number of records to generate
        final int totalNum = getNumberOfRecordsToGenerate(siteId, buildingId, floorId, recordsFor);
        
        this.status.setTotalNumber(totalNum);
        
        if (totalNum > 0 && !this.status.isStopRequested()) {
            this.status.setCode(JobStatus.JOB_STARTED);
            
            if (recordsFor.equals(RECORDS_FOR_RM_AND_EQ) || recordsFor.equals(RECORDS_FOR_RM)) {
                generateRecordForRoom(projectId, siteId, buildingId, floorId, activityType);
            }
            if (recordsFor.equals(RECORDS_FOR_RM_AND_EQ) || recordsFor.equals(RECORDS_FOR_EQ)) {
                generateRecordForEquipment(projectId, siteId, buildingId, floorId, activityType);
            }
            
            this.status.setCurrentNumber(totalNum);
            this.status.setCode(JobStatus.JOB_COMPLETE);
        } else {
            this.status.setCurrentNumber(totalNum);
            this.status.setCode(JobStatus.JOB_STOPPED);
        }
    }
    
    /**
     * assign items to assessor
     * 
     * @param itemIds list of selected items ids
     * @param assessorId assessor id
     */
    public void assignItemsToAssessor(final List itemIds, final String assessorId) {
        String strIds = "";
        for (int i = 0; i < itemIds.size(); i++) {
            strIds += (strIds == "" ? "" : ",") + itemIds.get(i);
        }
        final String sqlStatement =
                "UPDATE activity_log SET assessed_by = '" + SqlUtils.makeLiteralOrBlank(assessorId)
                        + "' WHERE activity_log_id IN (" + strIds + ") ";
        SqlUtils.executeUpdate("invoice", sqlStatement);
    }
    
    /**
     * update selected assessment items
     * 
     * @param itemsIds list of selected item ids
     * @param fields fields to be updated (cond_priority, cond_value, rec_action, status,
     *            date_scheduled)
     * @param values values to be updated
     * @param types types of the fields ("", "text" or "date")
     */
    public void updateAssessmentItems(final List itemIds, final List fields, final List values,
            final List types) {
        String strIds = "";
        String sep_start = "";
        String sep_end = "";
        
        for (int i = 0; i < itemIds.size(); i++) {
            strIds += (strIds == "" ? "" : ",") + itemIds.get(i);
        }
        
        String sqlStatement = "UPDATE activity_log SET ";
        String sqlStatementFields = "";
        final String sqlStatementWhere = " WHERE activity_log_id IN (" + strIds + ") ";
        
        for (int i = 0; i < fields.size(); i++) {
            if (((String) types.get(i)).equalsIgnoreCase("text")) {
                sep_start = "'";
                sep_end = "'";
            } else if (((String) types.get(i)).equalsIgnoreCase("date")) {
                sep_start = "${sql.date('";
                sep_end = "')}";
            }
            sqlStatementFields +=
                    (i == 0 ? "" : ", ") + (String) fields.get(i) + " = " + sep_start
                            + SqlUtils.makeLiteralOrBlank((String) values.get(i)) + sep_end;
        }
        
        sqlStatement += sqlStatementFields + sqlStatementWhere;
        
        SqlUtils.executeUpdate("invoice", sqlStatement);
    }
    
    /**
     * assign documentation to selected item ids
     * 
     * @param itemsIds list of selected item ids
     * @param docActionId activity_log_id of document to assign
     */
    public void assignDocumentation(final List itemIds, final String docActionId,
            final String activityId) {
        String strIds = "";
        for (int i = 0; i < itemIds.size(); i++) {
            strIds += (strIds == "" ? "" : ",") + itemIds.get(i);
        }
        
        final String docTable = "activity_log";
        final String[] docFields =
                { "activity_log_id", "doc", "doc1", "doc2", "doc3", "doc4", "description" };
        
        final DataSource ds = DataSourceFactory.createDataSourceForFields(docTable, docFields);
        ds.addRestriction(Restrictions.in("activity_log", "activity_log_id", strIds));
        final List<DataRecord> selectedRecords = ds.getRecords();
        
        ds.clearRestrictions();
        ds.addRestriction(Restrictions.eq("activity_log", "activity_log_id", docActionId));
        final DataRecord srcDocRecord = ds.getRecord();
        
        int totalNum = selectedRecords.size();
        
        for (final DataRecord selectedRecord : selectedRecords) {
            final String targetDocField = getFirstEmptyDocField(selectedRecord);
            if (targetDocField == null) {
                totalNum = 0;
            }
        }
        
        this.status.setTotalNumber(totalNum);
        
        if (totalNum > 0 && !this.status.isStopRequested()) {
            this.status.setCode(JobStatus.JOB_STARTED);
            
            final DocumentService documentService =
                    (DocumentService) ContextStore.get().getBean("documentService");
            
            for (final DataRecord selectedRecord : selectedRecords) {
                final String srcDocField = "doc";
                final String targetDocField = getFirstEmptyDocField(selectedRecord);
                if (targetDocField == null) {
                    continue;
                }
                
                final String fileName = srcDocRecord.getString("activity_log.doc");
                final String fileDescription = srcDocRecord.getString("activity_log.description");
                final String srcDocId =
                        String.valueOf(srcDocRecord.getInt("activity_log.activity_log_id"));
                final String targetDocId =
                        String.valueOf(selectedRecord.getInt("activity_log.activity_log_id"));
                
                final Map srcKeys = new HashMap();
                srcKeys.put("activity_log_id", srcDocId);
                final DocumentParameters srcDocParam =
                        new DocumentParameters(srcKeys, docTable, srcDocField, null, true);
                final Map targetKeys = new HashMap();
                targetKeys.put("activity_log_id", targetDocId);
                final DocumentParameters targetDocParam =
                        new DocumentParameters(targetKeys, docTable, targetDocField, fileName,
                            fileDescription, "0");
                
                documentService.copyDocument(srcDocParam, targetDocParam);
            }
            
            this.status.setCurrentNumber(totalNum);
            this.status.setCode(JobStatus.JOB_COMPLETE);
        } else {
            this.status.setCurrentNumber(totalNum);
            this.status.setCode(JobStatus.JOB_STOPPED);
        }
        
    }
    
    /**
     * Return field name of first empty doc field for activity log item.
     * 
     * @param DataRecord record
     * @return String name of field (doc, doc1, doc2, doc3, doc4)
     */
    private String getFirstEmptyDocField(final DataRecord record) {
        String docField = "";
        String docValue = "";
        final String[] count = { "", "1", "2", "3", "4" };
        for (final String element : count) {
            docField = "doc" + element;
            docValue = record.getString("activity_log." + docField);
            if (docValue == null) {
                return docField;
            }
        }
        return null;
    }
    
    /**
     * Calculated the number of record that are going to be generated
     * 
     * @param siteId
     * @param buildingId
     * @param floorId
     * @param recordsFor
     * @return
     */
    private int getNumberOfRecordsToGenerate(final String siteId, final String buildingId,
            final String floorId, final String recordsFor) {
        int recForRoom = 0;
        int recForEq = 0;
        if (recordsFor.equals(RECORDS_FOR_RM) || recordsFor.equals(RECORDS_FOR_RM_AND_EQ)) {
            final String restriction = getRestriction(siteId, buildingId, floorId, "bl.");
            final DataSource ds = DataSourceFactory.createDataSource();
            ds.addTable("rm", DataSource.ROLE_MAIN);
            ds.addTable("bl", DataSource.ROLE_STANDARD);
            ds.addVirtualField("rm", "numberOfRecords", DataSource.DATA_TYPE_INTEGER);
            final String strQuery =
                    "SELECT COUNT(*) ${sql.as} numberOfRecords FROM rm, bl WHERE bl.bl_id = rm.bl_id "
                            + restriction;
            ds.addQuery(strQuery);
            ds.setApplyVpaRestrictions(false);
            final DataRecord record = ds.getRecord();
            recForRoom = record.getInt("rm.numberOfRecords");
        }
        if (recordsFor.equals(RECORDS_FOR_EQ) || recordsFor.equals(RECORDS_FOR_RM_AND_EQ)) {
            final String restriction = getRestriction(siteId, buildingId, floorId, "eq.");
            final DataSource ds = DataSourceFactory.createDataSource();
            ds.addTable("eq", DataSource.ROLE_MAIN);
            ds.addVirtualField("eq", "numberOfRecords", DataSource.DATA_TYPE_INTEGER);
            final String strQuery =
                    "SELECT COUNT(*) ${sql.as} numberOfRecords FROM eq LEFT OUTER JOIN bl ON eq.bl_id = bl.bl_id WHERE 1 = 1 "
                            + restriction;
            ds.addQuery(strQuery);
            ds.setApplyVpaRestrictions(false);
            final DataRecord record = ds.getRecord();
            recForEq = record.getInt("eq.numberOfRecords");
        }
        return (recForRoom + recForEq);
    }
    
    /**
     * generate assessment records for room
     * 
     * @param projectId
     * @param siteId
     * @param buildingId
     * @param floorId
     */
    private void generateRecordForRoom(final String projectId, final String siteId,
            final String buildingId, final String floorId, final String activityType) {
        final String restriction = getRestriction(siteId, buildingId, floorId, "bl.");
        final String sqlStatement =
                "INSERT INTO activity_log ( activity_type, project_id, site_id, bl_id, fl_id, rm_id ) "
                        + "SELECT '" + SqlUtils.makeLiteralOrBlank(activityType) + "', '"
                        + SqlUtils.makeLiteralOrBlank(projectId) + "',"
                        + " bl.site_id, rm.bl_id, fl_id, rm_id "
                        + " FROM rm, bl WHERE bl.bl_id = rm.bl_id " + restriction;
        SqlUtils.executeUpdate("activity_log", sqlStatement);
    }
    
    /**
     * generate assessment records for equipments
     * 
     * @param projectId
     * @param siteId
     * @param buildingId
     * @param floorId
     */
    private void generateRecordForEquipment(final String projectId, final String siteId,
            final String buildingId, final String floorId, final String activityType) {
        final String restriction = getRestriction(siteId, buildingId, floorId, "eq.");
        final String sqlStatement =
                "INSERT INTO activity_log ( activity_type, project_id, eq_id, site_id, bl_id, fl_id, rm_id, csi_id, questionnaire_id ) "
                        + "SELECT '"
                        + SqlUtils.makeLiteralOrBlank(activityType)
                        + "', '"
                        + SqlUtils.makeLiteralOrBlank(projectId)
                        + "',"
                        + " eq_id"
                        + ", (CASE WHEN (eq.site_id IS NOT NULL OR eq.bl_id IS NULL) THEN eq.site_id ELSE bl.site_id END)"
                        + ", eq.bl_id, fl_id, rm_id, csi_id, "
                        + " (SELECT questionnaire_map.questionnaire_id "
                        + "     FROM questionnaire_map WHERE questionnaire_map.eq_std = eq.eq_std "
                        + "         AND questionnaire_map.project_type = (SELECT project.project_type FROM project WHERE project.project_id = '"
                        + SqlUtils.makeLiteralOrBlank(projectId)
                        + "') )"
                        + " FROM eq LEFT OUTER JOIN bl ON eq.bl_id = bl.bl_id WHERE 1 = 1 "
                        + restriction;
        SqlUtils.executeUpdate("activity_log", sqlStatement);
    }
    
    /**
     * create sql restriction
     * 
     * @param siteId
     * @param buildingId
     * @param floorId
     * @return
     */
    private String getRestriction(final String siteId, final String buildingId,
            final String floorId, final String table) {
        String result = "";
        if (!siteId.equals("")) {
            result +=
                    " AND (" + table + "site_id = '" + SqlUtils.makeLiteralOrBlank(siteId)
                            + "' OR bl.site_id = '" + SqlUtils.makeLiteralOrBlank(siteId) + "')";
        }
        if (!buildingId.equals("")) {
            result += " AND " + table + "bl_id = '" + SqlUtils.makeLiteralOrBlank(buildingId) + "'";
        }
        if (!floorId.equals("")) {
            result += " AND fl_id = '" + SqlUtils.makeLiteralOrBlank(floorId) + "'";
        }
        return (result);
    }
}
