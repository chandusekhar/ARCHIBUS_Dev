package com.archibus.service.space;

import java.util.*;

import org.json.JSONObject;

import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.*;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.*;
import com.archibus.model.view.datasource.ClauseDef.Operation;
import com.archibus.model.view.datasource.ClauseDef.RelativeOperation;
import com.archibus.model.view.datasource.*;
import com.archibus.service.space.activity.SpaceTransactionSwitchActivity;
import com.archibus.service.space.helper.*;
import com.archibus.service.space.metrics.SpaceTrendMetricsCollector;
import com.archibus.service.space.report.SpaceTransactionReport;
import com.archibus.service.space.transaction.*;
import com.archibus.utility.*;

/**
 * <p>
 * Space Transaction Handler Class, Added by ASC-BJ, Zhang Yi for 20.1 Space.<br>
 * 
 * <p>
 * 
 * Justification: Please see particular case of justification in each method's comment.
 */
@SuppressWarnings("PMD.AvoidUsingSql")
public class SpaceTransactionHandler {
    
    // ---------------------------------------------------------------------------------------------
    // BEGIN archiveRmpctRecords WFR
    // ---------------------------------------------------------------------------------------------
    /**
     * This is a scheduled workflow rule that remove obsolete records from the rmpct table and
     * places them in the historical workspace transaction table, hrmpct.
     * 
     * Justification: Case #2.1 : Statement with INSERT ... SELECT pattern.
     * 
     * Justification: Case #2.2: Statement with UPDATE ... WHERE pattern.
     * 
     * Justification: Case #2.3: Statement with DELETE ... WHERE pattern.
     */
    public void archiveRmpctRecords() {
        
        // Since below sql is a batch update like insert(...) select (...) from ...; so suppress
        // PMD.AvoidUsingSql warning.
        
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        
        // Prepare needed activity parameters in below process
        final String archiveDaysAfterEndDate =
                EventHandlerBase.getActivityParameterString(context, SpaceConstants.SPACE_ACTIVITY,
                    "ArchiveDaysAfterEndDate");
        
        Date pastDate = null;
        if (!"NULL".equals(archiveDaysAfterEndDate)) {
            final int archiveDaysAfterEndDateInt = Integer.parseInt(archiveDaysAfterEndDate);
            final Calendar calendar = Calendar.getInstance();
            calendar.add(Calendar.DAY_OF_YEAR, -archiveDaysAfterEndDateInt);
            pastDate = calendar.getTime();
            
            final String[] fieldsList =
                    com.archibus.eventhandler.EventHandlerBase.getAllFieldNames(context, "rmpct");
            final StringBuffer fields = new StringBuffer();
            for (final String element : fieldsList) {
                if (fields.length() > 0) {
                    fields.append(SpaceConstants.COMMA);
                }
                fields.append(element);
                
            }
            // format insert query
            final DataSource hrmpctDS =
                    DataSourceFactory.createDataSourceForFields("hrmpct", fieldsList);
            
            final StringBuilder insertSQL = new StringBuilder();
            insertSQL.append("INSERT into hrmpct (");
            insertSQL.append(fields.toString());
            insertSQL.append(") (");
            insertSQL.append("SELECT ");
            insertSQL.append(fields.toString());
            // for fixing kb3034179: since status 'obselete' is not useful, change status=3 to
            // status=1. - by ZY
            insertSQL
                .append(" FROM  rmpct WHERE  rmpct.date_end<=${parameters['archiveDate']} AND rmpct.status = 1)");
            
            hrmpctDS.addQuery(insertSQL.toString());
            hrmpctDS.addParameter(SpaceConstants.ARCHIVE_DATE, null, DataSource.DATA_TYPE_DATE);
            hrmpctDS.setParameter(SpaceConstants.ARCHIVE_DATE, pastDate);
            hrmpctDS.executeUpdate();
            
            // Fix kb#3033986:set all archived hrmpct.area_rm, pct_time to 0.
            final StringBuilder updateSQL = new StringBuilder();
            updateSQL.append(" UPDATE hrmpct set area_rm=0, pct_time =0 ");
            updateSQL.append(" WHERE date_end<=${parameters['archiveDate']} ");
            hrmpctDS.addQuery(updateSQL.toString());
            hrmpctDS.addParameter(SpaceConstants.ARCHIVE_DATE, null, DataSource.DATA_TYPE_DATE);
            hrmpctDS.setParameter(SpaceConstants.ARCHIVE_DATE, pastDate);
            hrmpctDS.executeUpdate();
            
            final DataSource rmpctDS = SpaceTransactionUtil.getRmpctDataSource();
            rmpctDS
                .addQuery(" DELETE RMPCT WHERE  rmpct.date_end<=${parameters['archiveDate']} AND rmpct.status = 1");
            rmpctDS.addParameter(SpaceConstants.ARCHIVE_DATE, null, DataSource.DATA_TYPE_DATE);
            rmpctDS.setParameter(SpaceConstants.ARCHIVE_DATE, pastDate);
            rmpctDS.executeUpdate();
        }
    }
    
    // ---------------------------------------------------------------------------------------------
    // END updatePercentageOfSpace WFR
    // ---------------------------------------------------------------------------------------------
    
    // ---------------------------------------------------------------------------------------------
    // BEGIN Check Rmstd and Emstd WFR
    // ---------------------------------------------------------------------------------------------
    /**
     * This method serve as a WFR to check if scenario_em matches the room standard and employee
     * standard restriction based on rMstd_emstd table.
     * 
     * 
     * @param emId String em id
     * @param blId String building id
     * @param flId String floor id
     * @param rmId String room id
     * 
     *            Justification: Case #1: Statement with SELECT WHERE EXISTS ... pattern.
     */
    public void checkRmstdEmstd(final String emId, final String blId, final String flId,
            final String rmId) {
        // Since below sql is complicated and contains sub sqls so suppress
        // PMD.AvoidUsingSql warning.
        
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        
        final DataSource emDS = SpaceTransactionUtil.getEmDataSource();
        
        final JSONObject matchResult = new JSONObject();
        
        // Prepare checking SQL QUERY and DataSource
        final StringBuilder checkRmstdSQL = new StringBuilder();
        checkRmstdSQL
            .append(" SELECT bl_id, fl_id, rm_id, rm_std FROM rm ")
            .append(" WHERE ${sql.vpaRestriction} and  ")
            .append("(")
            .append(
                " rm.rm_std IN (SELECT rmstd_emstd.rm_std FROM rmstd_emstd "
                        + "                      WHERE rmstd_emstd.em_std =${parameters['emStd']}) ")
            .append(" OR rm.rm_std NOT IN ( SELECT rmstd_emstd.rm_std FROM rmstd_emstd )")
            .append(
                " OR ${parameters['emStd']} NOT IN ( SELECT rmstd_emstd.em_std FROM rmstd_emstd )")
            .append(")").append(" AND bl_id=${parameters['bl_id']}")
            .append(" AND fl_id=${parameters['fl_id']}")
            .append(" AND rm_id=${parameters['rm_id']}");
        final DataSource rmDS =
                DataSourceFactory
                    .createDataSourceForFields(
                        SpaceConstants.T_RM,
                        new String[] { SpaceConstants.BL_ID, SpaceConstants.FL_ID,
                                SpaceConstants.RM_ID, SpaceConstants.RM_STD })
                    .addQuery(checkRmstdSQL.toString())
                    .addParameter(SpaceConstants.P_EM_STD, "", DataSource.DATA_TYPE_TEXT)
                    .addParameter(SpaceConstants.BL_ID, "", DataSource.DATA_TYPE_TEXT)
                    .addParameter(SpaceConstants.FL_ID, "", DataSource.DATA_TYPE_TEXT)
                    .addParameter(SpaceConstants.RM_ID, "", DataSource.DATA_TYPE_TEXT);
        
        rmDS.setApplyVpaRestrictions(false);
        
        String emStd = "";
        if (StringUtil.notNullOrEmpty(emId)) {
            emStd =
                    SpaceTransactionCommon.getEmRecordById(emDS, emId).getString(
                        SpaceConstants.T_EM + SpaceConstants.DOT + SpaceConstants.EM_STD);
            if (StringUtil.notNullOrEmpty(emStd)) {
                final DataRecord rmRec =
                        rmDS.setParameter(SpaceConstants.P_EM_STD, emStd)
                            .setParameter(SpaceConstants.BL_ID, blId)
                            .setParameter(SpaceConstants.FL_ID, flId)
                            .setParameter(SpaceConstants.RM_ID, rmId).getRecord();
                SpaceTransactionCommon.setMatchResultByRm(matchResult, rmRec);
            } else {
                matchResult.put(SpaceConstants.IS_MATAHED, SpaceConstants.TRUE);
            }
        }
        context.addResponseParameter(SpaceConstants.JSON_EXPRESSION, matchResult.toString());
    }
    
    // ---------------------------------------------------------------------------------------------
    // END updateRmAndEmRecordsFromRmpct WFR
    
    /**
     * Collect calculation result for trend metrics of Space Transaction application defined in
     * table afm_metric_definitions and store the values to afm_metric_trend_values.
     * 
     * @param fromYear int start year for collection
     * @param toYear int end year for collection
     * 
     */
    public void collectAllMetrics(final String fromYear, final String toYear) {
        
        // Call ForecastDatesGenerator to create forecast records in database.
        final SpaceTrendMetricsCollector spaceTrendMetricsCollecter =
                new SpaceTrendMetricsCollector(fromYear, toYear);
        
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        
        final JobManager.ThreadSafe jobManager = EventHandlerBase.getJobManager(context);
        final String jobId = jobManager.startJob(spaceTrendMetricsCollecter);
        
        // add the status to the response
        final JSONObject result = new JSONObject();
        result.put("jobId", jobId);
        
        // get the job status from the job id
        final JobStatus status = jobManager.getJobStatus(jobId);
        result.put("jobStatus", status.toString());
        
        context.addResponseParameter(SpaceConstants.JSON_EXPRESSION, result.toString());
    }
    
    // ---------------------------------------------------------------------------------------------
    // END Check Rmstd and Emstd WFR
    // ---------------------------------------------------------------------------------------------
    
    /**
     * Scheduled workflow rule: Collect calculation results.
     */
    public void collectMetrics() {
        
        this.collectAllMetrics("0", "1");
    }
    
    // END archiveRmpctRecords WFR
    
    // ---------------------------------------------------------------------------------------------
    // BEGIN enableOrDisableRoomTransaction WFR
    // ---------------------------------------------------------------------------------------------
    /**
     * Enable workspace transaction process by view task.
     * 
     * @param enable boolean 'true' or 'false' to indicate enable or disable workspace transaction
     *            process.
     * 
     */
    public void enableOrDisableRoomTransaction(final boolean enable) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        
        // kb3035105: checking if the Move Management or Service Desk activities are enabled
        if (!enable
                || enable
                && (EventHandlerBase.isActivityLicenseEnabled(context, "AbMoveManagement") || EventHandlerBase
                    .isActivityLicenseEnabled(context, "AbBldgOpsHelpDesk"))) {
            
            // update value of activity parameter UseWorkspaceTransactions
            SpaceTransactionSwitchActivity.updateActivityParameterUseWorkspaceTransactions(enable);
            
            // update role process
            SpaceTransactionSwitchActivity.updateRoleProcs(enable);
            
            // kb#3044068: comment below line to prevent changing of activity parameter
            // 'RoomTransactionRecorderForDataChangeEvent' when enable/disable Workspace
            // Transaction.
            // SpaceTransactionSwitchActivity.updateAfmWfRule(enable);
        } else {
            
            context.addResponseParameter(SpaceConstants.JSON_EXPRESSION, "noLicense");
        }
    }
    
    // ---------------------------------------------------------------------------------------------
    // END enableOrDisableRoomTransaction WFR
    // ---------------------------------------------------------------------------------------------
    
    /**
     * 
     * This workflow rule get date_end for 'group move' and date_start for 'individual move' by
     * activity_log_id. status
     * 
     * @param activityLogId activity log id
     * 
     */
    public void getDateValByActivityLogId(final Integer activityLogId) {
        
        SpaceTransactionCommon.getDateValByActivityLogId(activityLogId);
    }
    
    /**
     * 
     * The purpose of this workflow rule is to set the activity parameter
     * ResyncWorkspaceTransactionsTable if there is data that is currently out-of-sync between the
     * Workspace Transactions table and the Rooms table, or between the Workspace Transactions table
     * and the Employees table.
     * 
     * Justification: Case #1: Statement with SELECT WHERE EXISTS ... pattern.
     * 
     */
    public void setResyncWorkspaceTransactionsTable() {
        
        // 1. IF activity parameter UseWorkspaceTransactions = 0 OR activity parameter
        // ResyncRoomTransactions Table = 1 THEN EXIT
        if (SpaceTransactionUtil
            .loadBooleanActivityParameter(SpaceConstants.USEWORKSPACETRANSACTIONS)
                && !SpaceTransactionUtil
                    .loadBooleanActivityParameter(SpaceConstants.RESYNC_WORKSPACE_TRANSACTIONS)) {
            
            // 2.Check for existence of rmpct records where there is no corresponding rm records
            final String sqlQuery1 =
                    " SELECT 1 ${sql.as} status FROM rmpct WHERE (date_start IS NULL OR date_start <= ${sql.currentDate} ) "
                            + " AND (date_end IS NULL OR date_end >= ${sql.currentDate}) AND status = 1 "
                            + " AND NOT EXISTS (SELECT 1 FROM rm WHERE rm.bl_id = rmpct.bl_id AND rm.fl_id = rmpct.fl_id AND rm.rm_id =rmpct.rm_id) ";
            
            // 3. Check for existence of rm records where there is no corresponding rmpct records
            final String sqlQuery2 =
                    " SELECT rm_id FROM rm WHERE NOT EXISTS "
                            + " (SELECT 1 FROM rmpct WHERE rm.bl_id =rmpct.bl_id AND rm.fl_id = rmpct.fl_id AND rm.rm_id = rmpct.rm_id "
                            + " AND (rmpct.date_start<= ${sql.currentDate} OR rmpct.date_start IS NULL) AND status = 1 "
                            + " AND (rmpct.date_end >=${sql.currentDate} OR rmpct.date_end IS NULL) )";
            
            // 4. Check for rmpct records that do not contain the same attribute values as their
            // corresponding rm records, even when their primary_rm flag is 1
            final String sqlQuery3 =
                    " SELECT 1 ${sql.as} status FROM rm, rmpct WHERE rm.bl_id = rmpct.bl_id AND rm.fl_id =rmpct.fl_id AND rm.rm_id = rmpct.rm_id "
                            + " AND rmpct.primary_rm = 1 AND rmpct.status = 1 "
                            + " AND ("
                            + SpaceTransactionUtil.getCompareNotEqualSqlOfStringField(
                                "rmpct.dv_id", "rm.dv_id")
                            + " or  "
                            + SpaceTransactionUtil.getCompareNotEqualSqlOfStringField(
                                "rmpct.dp_id", "rm.dp_id")
                            + "  or "
                            + SpaceTransactionUtil.getCompareNotEqualSqlOfStringField(
                                "rmpct.rm_cat", "rm.rm_cat")
                            + "   or "
                            + SpaceTransactionUtil.getCompareNotEqualSqlOfStringField(
                                "rmpct.rm_type", "rm.rm_type")
                            + ") AND (rmpct.date_start IS NULL OR rmpct.date_start <= ${sql.currentDate}) "
                            + " AND (rmpct.date_end IS NULL OR rmpct.date_end >= ${sql.currentDate}) ";
            
            // 5. Check for occupancy mismatches between rmpct and em
            final String sqlQuery4 =
                    " SELECT 1 ${sql.as} status FROM em, rmpct WHERE rmpct.status = 1 "
                            + " AND (rmpct.date_start IS NULL OR rmpct.date_start <= ${sql.currentDate} ) "
                            + " AND (rmpct.date_end IS NULL OR rmpct.date_end >= ${sql.currentDate} ) "
                            + " AND rmpct.primary_em = 1 AND rmpct.em_id = em.em_id "
                            + " AND ( "
                            + SpaceTransactionUtil.getCompareNotEqualSqlOfStringField(
                                "rmpct.bl_id", "em.bl_id")
                            + " or      "
                            + SpaceTransactionUtil.getCompareNotEqualSqlOfStringField(
                                "rmpct.fl_id", "em.fl_id")
                            + "  or     "
                            + SpaceTransactionUtil.getCompareNotEqualSqlOfStringField(
                                "rmpct.rm_id", "em.rm_id") + "  )";
            
            final String sqlQuery5 =
                    " SELECT 1 ${sql.as} status FROM rmpct WHERE "
                            + " rmpct.status = 1 AND rmpct.primary_em = 1 "
                            + " AND (rmpct.date_start IS NULL OR rmpct.date_start <=${sql.currentDate}) "
                            + " AND (rmpct.date_end IS NULL OR rmpct.date_end >= ${sql.currentDate})  "
                            + " AND NOT EXISTS ( SELECT 1 FROM em where rmpct.bl_id =em.bl_id AND rmpct.fl_id = em.fl_id AND rmpct.rm_id = em.rm_id "
                            + " AND rmpct.em_id=em.em_id) ";
            
            final DataSource rmpctDS =
                    DataSourceFactory.createDataSource().addTable(SpaceConstants.RMPCT)
                        .addField(SpaceConstants.STATUS);
            
            final DataSource rmDS =
                    DataSourceFactory.createDataSource().addTable(SpaceConstants.T_RM)
                        .addField(SpaceConstants.RM_ID);
            
            if (!SpaceTransactionUtil.checkQueryList(rmpctDS, sqlQuery1, 0)
                    && !SpaceTransactionUtil.checkQueryList(rmDS, sqlQuery2, 0)
                    && !SpaceTransactionUtil.checkQueryList(rmpctDS, sqlQuery3, 0)
                    && !SpaceTransactionUtil.checkQueryList(rmpctDS, sqlQuery4, 0)) {
                
                SpaceTransactionUtil.checkQueryList(rmpctDS, sqlQuery5, 0);
                
            }
        }
    }
    
    // ---------------------------------------------------------------------------------------------
    // BEGIN updatePercentageOfSpace WFR
    // ---------------------------------------------------------------------------------------------
    /**
     * update space percentage by occupation, and do not keep the workspace transaction histroy,
     * directlly change the percentage number.
     * 
     * @param requestDate request date
     * @param blId building code
     * @param flId floor code
     * @param rmId room code
     */
    public void updatePercentageOfSpaceWithoutHistory(final Date requestDate, final String blId,
            final String flId, final String rmId) {
        // Initial datasource
        final DataSource dsRmpct = SpaceTransactionUtil.getRmpctDataSource();
        
        final ParsedRestrictionDef rmpctResDef = new ParsedRestrictionDef();
        SpaceTransactionRestriction
            .addEqualClausesToToLocationFields(rmpctResDef, blId, flId, rmId);
        
        SpaceTransactionRestriction.addDateClausesToToLocationFields(rmpctResDef, requestDate);
        
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.STATUS, 1, Operation.EQUALS);
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.DAY_PART, 0, Operation.EQUALS,
            RelativeOperation.AND_BRACKET);
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.DAY_PART, 1, Operation.EQUALS,
            RelativeOperation.OR);
        
        final List<DataRecord> rmpctRecord = dsRmpct.getRecords(rmpctResDef);
        
        if (!rmpctRecord.isEmpty()) {
            final double pctSpace = SpaceConstants.ONE_HUNDRED / rmpctRecord.size();
            for (final DataRecord record : rmpctRecord) {
                record.setValue("rmpct.pct_space", pctSpace);
                dsRmpct.saveRecord(record);
            }
        }
    }
    
    /**
     * 
     * This is a scheduled workflow rule that executes changes to the snapshot tables of rm and em
     * to reflect the changes that come due and that are logged in the rmpct table. It also updates
     * that status of rmpct records that have a date_end in the past to Obsolete.
     * 
     * Justification: Case #2.2: Statement with UPDATE ... WHERE pattern.
     */
    public void updateRmAndEmRecordsFromRmpct() {
        // Since below sql is a batch update; so suppress PMD.AvoidUsingSql warning.
        
        // for fixing kb3034179: since status 'obselete' is not useful, comment below lines. - by ZY
        // 1.Set past rmpct records to Obsolete. Exclude those records that are move requests and
        // that are handled within Move Management
        /*
         * final DataSource updateRmpctDS = SpaceTransactionUtil.getRmpctDataSource();
         * updateRmpctDS.addQuery("UPDATE rmpct SET status = 3 where rmpct.date_end IS NOT NULL " +
         * " and rmpct.date_end<${parameters['dateEnd']} and rmpct.status = 1");
         * updateRmpctDS.addParameter(SpaceConstants.DATEEND, null, DataSource.DATA_TYPE_DATE);
         * updateRmpctDS.setParameter(SpaceConstants.DATEEND, Utility.currentDate());
         * updateRmpctDS.executeUpdate();
         */
        
        // kb#3035620: updateRmAndEmFromRmpct should only execute if UseWorkspaceTransactions is '1'
        if (SpaceTransactionUtil
            .loadBooleanActivityParameter(SpaceConstants.USEWORKSPACETRANSACTIONS)) {
            // 2.Update the rm table to set any changes to main room attributes
            SpaceTransactionUpdate.updateRmByRmpct();
            
            // 3.Update the em table to set any changes to main location
            SpaceTransactionUpdate.updateEmByRmpct();
            
            // 4.Update acivity_log items to 'COMPLETED'
            final DataSource updateActivityLogDS = SpaceTransactionUtil.getActivityDataSource();
            
            String reuestDate;
            reuestDate = "reuestDate";
            updateActivityLogDS
                .addQuery("UPDATE activity_log SET status = 'COMPLETED' "
                        + " where activity_type IN ('SERVICE DESK - INDIVIDUAL MOVE', "
                        + "                         'SERVICE DESK - GROUP MOVE', "
                        + "                         'SERVICE DESK - DEPARTMENT SPACE') "
                        + "     and activity_log.assigned_to <> 'AbMoveManagement' "
                        + "     AND activity_log_id IN"
                        + "         ( SELECT activity_log_id FROM rmpct  "
                        + "           WHERE activity_log_id IS NOT NULL "
                        + "           AND status = 1 "
                        + "           AND (rmpct.date_start IS NULL OR rmpct.date_start <= ${parameters['reuestDate']}) "
                        + "           AND (rmpct.date_end IS NULL OR rmpct.date_end >=${parameters['reuestDate']} ) "
                        + "           AND rmpct.bl_id IS NOT NULL AND rmpct.fl_id IS NOT NULL "
                        + "           AND rmpct.rm_id IS NOT NULL)");
            updateActivityLogDS.addParameter(reuestDate, null, DataSource.DATA_TYPE_DATE);
            updateActivityLogDS.setParameter(reuestDate, Utility.currentDate());
            updateActivityLogDS.executeUpdate();
        }
        
    }
    
    /**
     * Grid Refresh WFR for Occupancy Sumary grid in Space Planing Console view.
     * 
     * @param parameters WFR parameters
     * @return date list
     */
    public final DataSetList getOccupancySumaryGridRecordsForSpacePlaningConsole(
            final Map<String, Object> parameters) {
        
        return new SpaceTransactionReport()
            .getOccupancySumaryGridRecordsForSpacePlaningConsole(parameters);
    }
    
    /**
     * Update room table and employee table from rmpct and suspend any data event.
     * 
     * @param rmpctRecord rmpct record
     */
    public final void updateRmAndEmFromRmpctAndSuspendDataEvent(final DataRecord rmpctRecord) {
        Date dateStart =
                rmpctRecord.getDate(SpaceConstants.RMPCT + SpaceConstants.DOT
                        + SpaceConstants.DATE_START);
        Date dateEnd =
                rmpctRecord.getDate(SpaceConstants.RMPCT + SpaceConstants.DOT
                        + SpaceConstants.DATE_END);
        final Date currentDate = Utility.currentDate();
        if (dateStart == null) {
            dateStart = DateTime.addDays(currentDate, -1);
        }
        if (dateEnd == null) {
            dateEnd = DateTime.addDays(currentDate, 1);
        }
        
        // check current date is between date_start dand date_end
        if (!currentDate.before(dateStart) && !currentDate.after(dateEnd)) {
            // get value from rmpct record
            final int primaryRm =
                    rmpctRecord.getInt(SpaceConstants.RMPCT + SpaceConstants.DOT
                            + SpaceConstants.PRIMARY_RM);
            final int primaryEm =
                    rmpctRecord.getInt(SpaceConstants.RMPCT + SpaceConstants.DOT
                            + SpaceConstants.PRIMARY_EM);
            
            // if primaryRm is 1, update rm value from rmpct value
            if (primaryRm == 1) {
                SpaceTransactionSuspendDataEventUpdate
                    .updateRmFromRmpctAndSuspendDataEvent(rmpctRecord);
            }
            
            // if primaryEm is 1, update em value from rmpct value
            if (primaryEm == 1) {
                SpaceTransactionSuspendDataEventUpdate
                    .updateEmFromRmpctAndSuspendDataEvent(rmpctRecord);
            }
        }
        
    }
    
}