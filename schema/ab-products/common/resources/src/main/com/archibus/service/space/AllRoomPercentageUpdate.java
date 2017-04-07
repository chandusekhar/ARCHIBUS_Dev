package com.archibus.service.space;

import java.text.DecimalFormat;
import java.util.*;

import com.archibus.config.Project;
import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.jobmanager.*;
import com.archibus.jobmanager.JobStatus.JobResult;
import com.archibus.model.view.datasource.ClauseDef.Operation;
import com.archibus.model.view.datasource.ClauseDef.RelativeOperation;
import com.archibus.model.view.datasource.*;
import com.archibus.schema.TableDef.ThreadSafe;
import com.archibus.utility.*;

/**
 * All Room Area Update calculations.
 * 
 * <p>
 * History:
 * <li>Web Central 18.1: Initial implementation, ported from aruppct.abs.
 * 
 * @author Sergey Kuramshin
 */
public class AllRoomPercentageUpdate {
    
    // ---------------------------------------------------------------------------------------------
    // BEGIN updatePercentageOfSpace WFR
    // ---------------------------------------------------------------------------------------------
    /**
     * update space percentage by occupation .
     * 
     * @param requestDate request date
     * @param blId building code
     * @param flId floor code
     * @param rmId room code
     */
    public static void updatePercentageOfSpace(final Date requestDate, final String blId,
            final String flId, final String rmId) {
        
        // if bl_id,fl_id,rm_id all null or "", do nothing return.
        if (blId == null || flId == null || rmId == null || "".equals(blId) || "".equals(flId)
                || "".equals(rmId)) {
            return;
        }
        // Initial datasource
        final DataSource dsRmpct =
                DataSourceFactory.createDataSourceForFields("rmpct", getAllFieldsForTable("rmpct"));
        
        dsRmpct.setApplyVpaRestrictions(false);
        
        final ParsedRestrictionDef rmpctResDef = new ParsedRestrictionDef();
        rmpctResDef.addClause("rmpct", "bl_id", blId, Operation.EQUALS);
        rmpctResDef.addClause("rmpct", "fl_id", flId, Operation.EQUALS);
        rmpctResDef.addClause("rmpct", "rm_id", rmId, Operation.EQUALS);
        rmpctResDef.addClause("rmpct", "status", 1, Operation.EQUALS);
        rmpctResDef.addClause("rmpct", "date_start", requestDate, Operation.LTE,
            RelativeOperation.AND_BRACKET);
        rmpctResDef.addClause("rmpct", "date_start", null, Operation.IS_NULL, RelativeOperation.OR);
        
        rmpctResDef.addClause("rmpct", "date_end", requestDate, Operation.GTE,
            RelativeOperation.AND_BRACKET);
        rmpctResDef.addClause("rmpct", "date_end", null, Operation.IS_NULL, RelativeOperation.OR);
        
        rmpctResDef.addClause("rmpct", "day_part", 0, Operation.EQUALS,
            RelativeOperation.AND_BRACKET);
        rmpctResDef.addClause("rmpct", "day_part", 1, Operation.EQUALS, RelativeOperation.OR);
        
        final List<DataRecord> rmpctRecord = dsRmpct.getRecords(rmpctResDef);
        
        if (!rmpctRecord.isEmpty()) {
            final double newPctSpace = 100.0 / rmpctRecord.size();
            for (final DataRecord record : rmpctRecord) {
                final double oldPctSpace = record.getDouble("rmpct.pct_space");
                if (Math.abs(oldPctSpace - newPctSpace) > 0.01) {
                    DataRecord newRecord = dsRmpct.createNewRecord();
                    newRecord.setFieldValues(record.getFieldValues());
                    newRecord.setValue("rmpct.pct_id", null);
                    newRecord.setValue("rmpct.date_start", requestDate);
                    newRecord.setValue("rmpct.date_end", null);
                    newRecord.setValue("rmpct.pct_space", newPctSpace);
                    
                    if (record.getDate("rmpct.date_start") != null
                            && record.getDate("rmpct.date_start").after(
                                DateTime.addDays(requestDate, -1))) {
                        dsRmpct.deleteRecord(record);
                    } else {
                        record.setValue("rmpct.date_end", DateTime.addDays(requestDate, -1));
                        dsRmpct.saveRecord(record);
                        // fix KB3034010
                        newRecord.setValue("rmpct.activity_log_id", "");
                        // kb 3037358 if the original rmpct record is not deleted, then we don't
                        // copy from location
                        // to the new created rmpct record for pct_space adjust.
                        newRecord.setValue("rmpct.from_bl_id", "");
                        newRecord.setValue("rmpct.from_fl_id", "");
                        newRecord.setValue("rmpct.from_rm_id", "");
                    }
                    
                    // fix KB3033937
                    mergeRmpctRecord(dsRmpct, newRecord);
                    
                    newRecord = dsRmpct.saveRecord(newRecord);
                }
            }
        }
    }
    
    public static void updateSpace(final JobStatus status) {
        status.setResult(new JobResult("Update Area Totals - Space"));
        status.setTotalNumber(100);
        // Calculate RMPCT AREA_RM
        SqlUtils
            .executeUpdate(
                "rmpct",
                "UPDATE rmpct SET area_rm = ( pct_space / 100 )"
                        + " * ( SELECT ${sql.isNull('area',0.0)} FROM rm"
                        + " WHERE rm.bl_id = rmpct.bl_id"
                        + " AND rm.fl_id = rmpct.fl_id"
                        + " AND rm.rm_id = rmpct.rm_id )  WHERE rmpct.bl_id is not null AND rmpct.fl_id is not null AND rmpct.rm_id is not null");
        status.setCurrentNumber(50);
        
        // Perform remainder of AREA UPDATE CALCULATIONS
        calculate();
        status.setCurrentNumber(100);
    }
    
    public static void updateSpaceTime(final Date dateFrom, final Date dateTo,
            final JobStatus status) {
        
        status.setTotalNumber(100);
        
        final String table = "rmpct";
        final String[] fields =
                { "pct_id", "date_start", "date_end", "pct_time", "pct_space", "day_part", "status" };
        final DataSource ds = DataSourceFactory.createDataSourceForFields(table, fields);
        final List<DataRecord> records = ds.getAllRecords();
        
        for (final DataRecord record : records) {
            // make pct_time = 0 for records where status = 0
            if (record.getInt("rmpct.status") == 0) {
                record.setValue("rmpct.pct_time", 0.0);
                
            } else {
                updateSpaceTimeToRmpctHrmpctRecord(dateFrom, dateTo, record, "rmpct");
            }
            // KB#3026127, remove all above ds.saveRecord() lines and add the only one below.
            ds.saveRecord(record);
        }
        status.setCurrentNumber(50);
        
        // Calculate Percentage of Room Area
        SqlUtils
            .executeUpdate(
                "rmpct",
                "UPDATE rmpct SET area_rm = (pct_space / 100) * (pct_time / 100) "
                        + " * (SELECT ${sql.isNull('area',0.0)} FROM rm"
                        + " WHERE rm.bl_id = rmpct.bl_id"
                        + " AND rm.fl_id = rmpct.fl_id"
                        + " AND rm.rm_id = rmpct.rm_id )  WHERE rmpct.bl_id is not null AND rmpct.fl_id is not null AND rmpct.rm_id is not null");
        status.setCurrentNumber(75);
        
        // Perform remainder of AREA UPDATE CALCULATIONS
        calculate();
        
        AllRoomAreaUpdate.calculateGroups();
        
        status.setCurrentNumber(100);
    }
    
    public static void updateSpaceTimeToRmpctHrmpctRecord(Date dateFrom, Date dateTo,
            final DataRecord record, final String tableName) {
        
        // Calculate Total Days in Report Span --,
        // For kb 3023983, elapsed days should be calculated INCLUSIVE between two date values.
        
        if (dateFrom == null && dateTo == null) {
            dateFrom = Utility.currentDate();
            dateTo = Utility.currentDate();
        }
        final int totalDays = DateTime.getElapsedDays(dateFrom, dateTo) + 1;
        
        Date dateStart = record.getDate(tableName + ".date_start");
        Date dateEnd = record.getDate(tableName + ".date_end");
        double percentTime = record.getDouble(tableName + ".pct_time");
        final int dayPart = record.getInt(tableName + ".day_part");
        
        // kb#3022830
        if (dateStart == null || dateEnd == null) {
            // If all date values are blank then percent record is in use 100% of time
            if (dateStart == null && dateEnd == null) {
                if (percentTime == 0) {
                    percentTime = 100.0;
                    record.setValue(tableName + ".pct_time", percentTime);
                }
            } else if (dateStart == null) {
                // If end date is out of range, do not process record
                if (dateEnd.before(dateFrom)) {
                    percentTime = 0.0;
                    record.setValue(tableName + ".pct_time", percentTime);
                } else {
                    dateStart = dateFrom;
                    // If end date greater than report end, use the report end date
                    if (dateEnd.after(dateTo)) {
                        dateEnd = dateTo;
                    }
                    
                    // Calculate Number of Days for Current Record
                    // For kb 3023983,add 1 to result.
                    final int days = DateTime.getElapsedDays(dateEnd, dateStart) + 1;
                    
                    // Calculate Time Percentage of Current Record
                    percentTime = 100.0 * days / totalDays;
                    record.setValue(tableName + ".pct_time", percentTime);
                }
            } else {
                // If start date is out of range, do not process record
                if (dateStart.after(dateTo)) {
                    percentTime = 0.0;
                    record.setValue(tableName + ".pct_time", percentTime);
                } else {
                    dateEnd = dateTo;
                    // If start date less then report start date, use the report start
                    if (dateStart.before(dateFrom)) {
                        dateStart = dateFrom;
                    }
                    
                    // For kb 3023983,add 1 to result.
                    final int days = DateTime.getElapsedDays(dateEnd, dateStart) + 1;
                    percentTime = 100.0 * days / totalDays;
                    record.setValue(tableName + ".pct_time", percentTime);
                }
            }
        } else {
            // If start or end date is out of range, do not process record
            if (dateStart.after(dateTo) || dateEnd.before(dateFrom)) {
                percentTime = 0.0;
                record.setValue(tableName + ".pct_time", percentTime);
            } else {
                if (dateStart.before(dateFrom)) {
                    dateStart = dateFrom;
                }
                
                if (dateEnd.after(dateTo)) {
                    dateEnd = dateTo;
                }
                
                // For kb 3023983,add 1 to result.
                final int days = DateTime.getElapsedDays(dateEnd, dateStart) + 1;
                percentTime = 100.0 * days / totalDays;
                record.setValue(tableName + ".pct_time", percentTime);
            }
        }
        
        // KB3038837- since new records have a default value of 100.00 (not NULL),so remove these
        // three lines and allow 0.0 values to remain 0.0
        
        // If space percentage empty, than record uses 100% of the space
        // if (percentSpace == 0.0) {
        // percentSpace = 100.0;
        // record.setValue(tableName + ".pct_space", percentSpace);
        // }
        
        // If dayPart <> 0, than record uses 50% of the most recently calculated pct_time
        if (dayPart != 0) {
            percentTime = percentTime / 2;
            record.setValue(tableName + ".pct_time", percentTime);
        }
    }
    
    private static void calculate() {
        // Sum AREA from RMPCT to RM
        
        new FieldOperation("rm", "rmpct").calculate("rm.area_alloc", "SUM", "rmpct.area_rm");
        
        // Calculate UNALLOCATED ROOM AREA
        
        new FieldFormula("rm").calculate("rm.area_unalloc", "rm.area - rm.area_alloc");
        
        // Sum TOTAL ROOM AREA from RM to FL
        
        new FieldOperation("fl", "rm")
            .setAssignedRestriction(
                "EXISTS (SELECT 1 FROM rmcat WHERE rmcat.rm_cat = rm.rm_cat AND rmcat.used_in_calcs IN 			('all_totals', 'rm_totals') ) OR rm.rm_cat IS NULL")
            .calculate("fl.area_rm", "SUM", "rm.area");
        
        // Calculate FLOOR REMAINING AREA
        // comment out below code, because the fl.area_remain will be calculated in
        // AllRoomAreaUpdate.calculateGroups();
        // new FieldFormula("fl").calculate("fl.area_remain",
        // "fl.area_gross_int - fl.area_rm - fl.area_gp");
        
        // Sum areas from RMPCT to FL
        
        new FieldOperation("fl", "rmpct", "rmcat")
            .setAssignedRestriction("rmcat.supercat = 'VERT'").calculate("fl.area_vert_pen", "SUM",
                "rmpct.area_rm");
        
        new FieldOperation("fl", "rmpct", "rmcat")
            .setAssignedRestriction("rmcat.supercat = 'SERV'").calculate("fl.area_serv", "SUM",
                "rmpct.area_rm");
        
        new FieldOperation("fl", "rmpct", "rmcat")
            .setAssignedRestriction(
                "rmcat.occupiable = 0 AND rmcat.used_in_calcs IN ('all_totals', 'dp_comn_ocup_totals')")
            .calculate("fl.area_nocup", "SUM", "rmpct.area_rm");
        
        new FieldOperation("fl", "rmpct", "rmcat")
            .setAssignedRestriction(
                "rmcat.occupiable = 0 and rmpct.dp_id IS NOT NULL AND rmcat.used_in_calcs IN ('all_totals', 'dp_comn_ocup_totals')")
            .calculate("fl.area_nocup_dp", "SUM", "rmpct.area_rm");
        
        new FieldOperation("fl", "rmpct", "rmcat")
            .setAssignedRestriction(
                "rmcat.occupiable = 0 and rmpct.prorate<>'NONE' AND rmcat.used_in_calcs IN ('all_totals', 'dp_comn_ocup_totals')")
            .calculate("fl.area_nocup_comn", "SUM", "rmpct.area_rm");
        
        new FieldOperation("fl", "rmpct", "rmcat")
            .setAssignedRestriction(
                "rmcat.occupiable = 1 AND rmcat.used_in_calcs IN ('all_totals', 'dp_comn_ocup_totals')")
            .calculate("fl.area_ocup", "SUM", "rmpct.area_rm");
        
        new FieldOperation("fl", "rmpct", "rmcat")
            .setAssignedRestriction(
                "rmcat.occupiable = 1 and rmpct.dp_id IS NOT NULL AND rmcat.used_in_calcs IN ('all_totals', 'dp_comn_ocup_totals')")
            .calculate("fl.area_ocup_dp", "SUM", "rmpct.area_rm");
        
        new FieldOperation("fl", "rmpct", "rmcat")
            .setAssignedRestriction(
                "rmcat.occupiable = 1 and rmpct.prorate<>'NONE' AND rmcat.used_in_calcs IN ('all_totals', 'dp_comn_ocup_totals')")
            .calculate("fl.area_ocup_comn", "SUM", "rmpct.area_rm");
        
        // Calculate RENTABLE and USABLE area in FL
        
        new FieldFormula("fl")
            .addFormula("fl.area_rentable", "fl.area_gross_int - fl.area_vert_pen")
            .addFormula("fl.area_usable", "fl.area_rentable - fl.area_serv").calculate();
        
        // Calculate area_rm_dp and area_rm_comn area in FL
        new FieldOperation("fl", "rmpct")
            .setAssignedRestriction(
                "rmpct.dp_id IS NOT NULL AND (EXISTS (SELECT 1 FROM rmcat WHERE rmcat.rm_cat = rmpct.rm_cat AND rmcat.used_in_calcs IN ('all_totals', 'dp_comn_ocup_totals')) OR rmpct.rm_cat IS NULL)")
            .calculate("fl.area_rm_dp", "SUM", "rmpct.area_rm");
        
        new FieldOperation("fl", "rmpct")
            .setAssignedRestriction(
                "rmpct.prorate <> 'NONE' AND (EXISTS (SELECT 1 FROM rmcat WHERE rmcat.rm_cat = rmpct.rm_cat AND rmcat.used_in_calcs IN ('all_totals', 'dp_comn_ocup_totals')) OR rmpct.rm_cat IS NULL)")
            .calculate("fl.area_rm_comn", "SUM", "rmpct.area_rm");
        
        // Sum area from FL to BL
        
        new FieldOperation("bl", "fl").addOperation("bl.area_rm", "SUM", "fl.area_rm")
            .addOperation("bl.area_ocup", "SUM", "fl.area_ocup")
            .addOperation("bl.area_ocup_dp", "SUM", "fl.area_ocup_dp")
            .addOperation("bl.area_ocup_comn", "SUM", "fl.area_ocup_comn")
            .addOperation("bl.area_nocup", "SUM", "fl.area_nocup")
            .addOperation("bl.area_nocup_dp", "SUM", "fl.area_nocup_dp")
            .addOperation("bl.area_nocup_comn", "SUM", "fl.area_nocup_comn")
            .addOperation("bl.area_vert_pen", "SUM", "fl.area_vert_pen")
            .addOperation("bl.area_rentable", "SUM", "fl.area_rentable")
            .addOperation("bl.area_serv", "SUM", "fl.area_serv")
            .addOperation("bl.area_usable", "SUM", "fl.area_usable")
            .addOperation("bl.area_rm_dp", "SUM", "fl.area_rm_dp")
            .addOperation("bl.area_rm_comn", "SUM", "fl.area_rm_comn").calculate();
        
        // Sum area from BL to SITE
        
        new FieldOperation("site", "bl").addOperation("site.area_rm", "SUM", "bl.area_rm")
            .addOperation("site.area_ocup", "SUM", "bl.area_ocup")
            .addOperation("site.area_ocup_dp", "SUM", "bl.area_ocup_dp")
            .addOperation("site.area_ocup_comn", "SUM", "bl.area_ocup_comn")
            .addOperation("site.area_nocup", "SUM", "bl.area_nocup")
            .addOperation("site.area_nocup_dp", "SUM", "bl.area_nocup_dp")
            .addOperation("site.area_nocup_comn", "SUM", "bl.area_nocup_comn")
            .addOperation("site.area_vert_pen", "SUM", "bl.area_vert_pen")
            .addOperation("site.area_rentable", "SUM", "bl.area_rentable")
            .addOperation("site.area_serv", "SUM", "bl.area_serv")
            .addOperation("site.area_usable", "SUM", "bl.area_usable")
            .addOperation("site.area_rm_dp", "SUM", "bl.area_rm_dp")
            .addOperation("site.area_rm_comn", "SUM", "bl.area_rm_comn").calculate();
        
        // Calculate FL R/U ratio, and U/R ratio
        
        new FieldFormula("fl")
            .addFormula(
                "fl.ratio_ru",
                "CASE WHEN (fl.area_rentable /"
                        + SqlUtils.formatSqlReplace0WithHuge("fl.area_usable")
                        + " )>999 THEN 999 ELSE fl.area_rentable /"
                        + SqlUtils.formatSqlReplace0WithHuge("fl.area_usable") + " END ")
            .addFormula(
                "fl.ratio_ur",
                "CASE WHEN (100 * fl.area_usable /"
                        + SqlUtils.formatSqlReplace0WithHuge("fl.area_rentable")
                        + " )>999 THEN 999 ELSE 100 * fl.area_usable /"
                        + SqlUtils.formatSqlReplace0WithHuge("fl.area_rentable") + " END ")
            .calculate();
        
        // Calculate BL R/U ratio, and U/R ratio
        
        new FieldFormula("bl")
            .addFormula(
                "bl.ratio_ru",
                "CASE WHEN (bl.area_rentable /"
                        + SqlUtils.formatSqlReplace0WithHuge("bl.area_usable")
                        + " )>999 THEN 999 ELSE bl.area_rentable /"
                        + SqlUtils.formatSqlReplace0WithHuge("bl.area_usable") + " END ")
            .addFormula(
                "bl.ratio_ur",
                "CASE WHEN (100 * bl.area_usable /"
                        + SqlUtils.formatSqlReplace0WithHuge("bl.area_rentable")
                        + " )>999 THEN 999 ELSE 100*bl.area_usable /"
                        + SqlUtils.formatSqlReplace0WithHuge("bl.area_rentable") + " END ")
            .calculate();
        
        // Calculate SITE R/U ratio, and U/R ratio
        
        new FieldFormula("site")
            .addFormula(
                "site.ratio_ru",
                "CASE WHEN (site.area_rentable /"
                        + SqlUtils.formatSqlReplace0WithHuge("site.area_usable")
                        + " )>999 THEN 999 ELSE site.area_rentable /"
                        + SqlUtils.formatSqlReplace0WithHuge("site.area_usable") + " END ")
            .addFormula(
                "site.ratio_ur",
                "CASE WHEN (100 * site.area_usable /"
                        + SqlUtils.formatSqlReplace0WithHuge("site.area_rentable")
                        + " )>999 THEN 999 ELSE 100*site.area_usable /"
                        + SqlUtils.formatSqlReplace0WithHuge("site.area_rentable") + " END ")
            .calculate();
        
        // Sum area from RMPCT to DP
        
        new FieldOperation("dp", "rmpct")
            .setAssignedRestriction(
                "EXISTS (SELECT 1 FROM rmcat WHERE rmcat.rm_cat = rmpct.rm_cat AND rmcat.used_in_calcs IN ('all_totals', 'dp_comn_ocup_totals') ) OR rmpct.rm_cat IS NULL")
            .calculate("dp.area_rm", "SUM", "rmpct.area_rm");
        
        new FieldOperation("dp", "rmpct", "rmcat")
            .setAssignedRestriction(
                "rmcat.occupiable = 0 AND rmcat.used_in_calcs IN ('all_totals', 'dp_comn_ocup_totals')")
            .calculate("dp.area_nocup", "SUM", "rmpct.area_rm");
        
        new FieldOperation("dp", "rmpct", "rmcat")
            .setAssignedRestriction(
                "rmcat.occupiable = 1 AND rmcat.used_in_calcs IN ('all_totals', 'dp_comn_ocup_totals')")
            .calculate("dp.area_ocup", "SUM", "rmpct.area_rm");
        
        // Sum RMPCT AREA from DP to DV
        
        new FieldOperation("dv", "dp").addOperation("dv.area_rm", "SUM", "dp.area_rm")
            .addOperation("dv.area_nocup", "SUM", "dp.area_nocup")
            .addOperation("dv.area_ocup", "SUM", "dp.area_ocup").calculate();
        
        // Sum RMPCT AREA from DV to BU
        
        new FieldOperation("bu", "dv").addOperation("bu.area_rm", "SUM", "dv.area_rm")
            .addOperation("bu.area_nocup", "SUM", "dv.area_nocup")
            .addOperation("bu.area_ocup", "SUM", "dv.area_ocup").calculate();
        
        // Calculate RMSTD AREA and COUNT
        
        new FieldOperation("rmstd", "rm").addOperation("rmstd.area", "SUM", "rm.area")
            .addOperation("rmstd.tot_count", "COUNT", "rm.area").calculate();
        
        // Calculate RMTYPE AREA & COUNT
        
        new FieldOperation("rmtype", "rmpct").addOperation("rmtype.area", "SUM", "rmpct.area_rm")
            .calculate();
        // kb#3035059: modify sql to calculate the tot_count of rmtype
        new FieldFormula("rmtype").addFormula("rmtype.tot_count", "0").calculate();
        SqlUtils
            .executeUpdate(
                "rmtype",
                "  update rmtype set rmtype.tot_count = "
                        + "   ( select count( distinct (rmpct.bl_id${sql.concat}rmpct.fl_id${sql.concat}rmpct.rm_id) ) from rmpct where rmpct.rm_cat=rmtype.rm_cat and rmpct.rm_type=rmtype.rm_type and rmpct.area_rm > 0  )");
        
        // SUM AREA and COUNT from RMPCT to RMCAT
        
        new FieldOperation("rmcat", "rmpct").addOperation("rmcat.area", "SUM", "rmpct.area_rm")
            .calculate();
        // kb#3035059: modify sql to calculate the tot_count of rmtype
        new FieldFormula("rmcat").addFormula("rmcat.tot_count", "0").calculate();
        SqlUtils
            .executeUpdate(
                "rmcat",
                "  update rmcat set rmcat.tot_count = "
                        + "   ( select count( distinct (rmpct.bl_id${sql.concat}rmpct.fl_id${sql.concat}rmpct.rm_id) ) from rmpct where rmpct.rm_cat=rmcat.rm_cat and rmpct.area_rm > 0  )");
        
        // Calculate RMSTD AVERAGE AREA
        new FieldFormula("rmstd").calculate("rmstd.area_avg",
            "rmstd.area  /" + SqlUtils.formatSqlReplace0WithHuge("rmstd.tot_count"));
        
        // Calculate RMCAT AVG AREA
        
        new FieldFormula("rmcat").calculate("rmcat.area_avg",
            "rmcat.area  /" + SqlUtils.formatSqlReplace0WithHuge("rmcat.tot_count"));
        
        // Calculate RMTYPE AVG AREA
        
        new FieldFormula("rmtype").calculate("rmtype.area_avg",
            "rmtype.area  /" + SqlUtils.formatSqlReplace0WithHuge("rmtype.tot_count"));
        
        // for fixing kb3034179: since status 'obselete' is not useful, remove status=3. - by ZY
        // calculations for location-based occupancy counts
        SqlUtils
            .executeUpdate(
                "rmpct",
                "UPDATE rm SET count_em = ${sql.isNull('(SELECT 1.00* SUM(rmpct.pct_time)/100 FROM rmpct "
                        + " WHERE rmpct.bl_id = rm.bl_id AND rmpct.fl_id = rm.fl_id AND rmpct.rm_id = rm.rm_id AND rmpct.em_id IS NOT NULL AND rmpct.status=1 )', 0)}");
        
        new FieldOperation("fl", "rm").calculate("fl.count_em", "SUM", "rm.count_em");
        
        new FieldOperation("bl", "fl").calculate("bl.count_em", "SUM", "fl.count_em");
        
        new FieldOperation("site", "bl").calculate("site.count_em", "SUM", "bl.count_em");
        
        new FieldOperation("rmcat", "rm").calculate("rmcat.count_em", "SUM", "rm.count_em");
        
        new FieldOperation("rmtype", "rm").calculate("rmtype.count_em", "SUM", "rm.count_em");
        
        AllRoomAreaUpdate.calculateGros();
        
    }
    
    private static String[] getAllFieldsForTable(final String tableName) {
        // get all fields for specified table
        final Project.Immutable project = ContextStore.get().getProject();
        final ThreadSafe tableDefn = project.loadTableDef(tableName);
        final ListWrapper.Immutable<String> fieldNames = tableDefn.getFieldNames();
        final String[] fields = new String[fieldNames.size()];
        int pos = 0;
        for (final String fieldName : fieldNames) {
            fields[pos] = fieldName;
            pos++;
        }
        return fields;
    }
    
    private static void mergeRmpctRecord(final DataSource dsRmpct, final DataRecord newRecord) {
        final ParsedRestrictionDef rmpctResDef = new ParsedRestrictionDef();
        rmpctResDef.addClause("rmpct", "date_end",
            DateTime.addDays(newRecord.getDate("rmpct.date_start"), -1), Operation.EQUALS);
        if (newRecord.valueExists("rmpct.em_id")) {
            rmpctResDef.addClause("rmpct", "em_id", newRecord.getValue("rmpct.em_id"),
                Operation.EQUALS);
        } else {
            rmpctResDef.addClause("rmpct", "em_id", null, Operation.IS_NULL);
        }
        if (newRecord.valueExists("rmpct.bl_id")) {
            rmpctResDef.addClause("rmpct", "bl_id", newRecord.getValue("rmpct.bl_id"),
                Operation.EQUALS);
        } else {
            rmpctResDef.addClause("rmpct", "bl_id", null, Operation.IS_NULL);
        }
        if (newRecord.valueExists("rmpct.fl_id")) {
            rmpctResDef.addClause("rmpct", "fl_id", newRecord.getValue("rmpct.fl_id"),
                Operation.EQUALS);
        } else {
            rmpctResDef.addClause("rmpct", "fl_id", null, Operation.IS_NULL);
        }
        if (newRecord.valueExists("rmpct.rm_id")) {
            rmpctResDef.addClause("rmpct", "rm_id", newRecord.getValue("rmpct.rm_id"),
                Operation.EQUALS);
        } else {
            rmpctResDef.addClause("rmpct", "rm_id", null, Operation.IS_NULL);
        }
        if (newRecord.valueExists("rmpct.dv_id")) {
            rmpctResDef.addClause("rmpct", "dv_id", newRecord.getValue("rmpct.dv_id"),
                Operation.EQUALS);
        } else {
            rmpctResDef.addClause("rmpct", "dv_id", null, Operation.IS_NULL);
        }
        if (newRecord.valueExists("rmpct.dp_id")) {
            rmpctResDef.addClause("rmpct", "dp_id", newRecord.getValue("rmpct.dp_id"),
                Operation.EQUALS);
        } else {
            rmpctResDef.addClause("rmpct", "dp_id", null, Operation.IS_NULL);
        }
        if (newRecord.valueExists("rmpct.rm_cat")) {
            rmpctResDef.addClause("rmpct", "rm_cat", newRecord.getValue("rmpct.rm_cat"),
                Operation.EQUALS);
        } else {
            rmpctResDef.addClause("rmpct", "rm_cat", null, Operation.IS_NULL);
        }
        if (newRecord.valueExists("rmpct.rm_type")) {
            rmpctResDef.addClause("rmpct", "rm_type", newRecord.getValue("rmpct.rm_type"),
                Operation.EQUALS);
        } else {
            rmpctResDef.addClause("rmpct", "rm_type", null, Operation.IS_NULL);
        }
        if (newRecord.valueExists("rmpct.prorate")) {
            rmpctResDef.addClause("rmpct", "prorate", newRecord.getValue("rmpct.prorate"),
                Operation.EQUALS);
        } else {
            rmpctResDef.addClause("rmpct", "prorate", null, Operation.IS_NULL);
        }
        if (newRecord.valueExists("rmpct.pct_space")) {
            
            final DecimalFormat decimalFormat = new DecimalFormat("0.00");
            final String pct_space = decimalFormat.format(newRecord.getValue("rmpct.pct_space"));
            rmpctResDef.addClause("rmpct", "pct_space", pct_space, Operation.EQUALS);
        } else {
            rmpctResDef.addClause("rmpct", "pct_space", null, Operation.IS_NULL);
        }
        
        final List<DataRecord> records = dsRmpct.getRecords(rmpctResDef);
        if (records.size() > 0) {
            newRecord.setValue("rmpct.date_start", records.get(0).getDate("rmpct.date_start"));
            newRecord.setValue("rmpct.activity_log_id",
                records.get(0).getValue("rmpct.activity_log_id"));
            newRecord.setValue("rmpct.from_bl_id", records.get(0).getString("rmpct.from_bl_id"));
            newRecord.setValue("rmpct.from_fl_id", records.get(0).getString("rmpct.from_fl_id"));
            newRecord.setValue("rmpct.from_rm_id", records.get(0).getString("rmpct.from_rm_id"));
            dsRmpct.deleteRecord(records.get(0));
        }
    }
    
    /**
     * synchronize Room Percentages
     */
    public static void synchronizeRoomPercentages() {
        
        // Keep rmpct in sync with rm table;
        // Remove records whose associated rooms don't exist in the rm table.
        String sql =
                "DELETE FROM rmpct WHERE NOT EXISTS "
                        + "(SELECT 1 FROM rm WHERE rm.bl_id = rmpct.bl_id AND rm.fl_id = rmpct.fl_id AND rm.rm_id = rmpct.rm_id)";
        SqlUtils.executeUpdate("rmpct", sql);
        
        sql =
                "INSERT INTO rmpct"
                        + " (bl_id,fl_id,rm_id,rm_cat,rm_type, dv_id,dp_id,area_rm,prorate,pct_space,pct_time)"
                        + " SELECT bl_id,fl_id,rm_id,rm_cat,rm_type, dv_id,dp_id,area,prorate,100.0,100.0"
                        + " FROM rm"
                        + " WHERE NOT EXISTS (SELECT 1 FROM rmpct"
                        + " WHERE rm.bl_id = rmpct.bl_id AND rm.fl_id = rmpct.fl_id AND rm.rm_id = rmpct.rm_id)";
        SqlUtils.executeUpdate("rmpct", sql);
        
        // For single percentage records match the percentage records to the room records.
        // Need different statements for Oracle because of different support for correlated
        // subqueries.
        if (SqlUtils.isOracle()) {
            sql =
                    "UPDATE rmpct" + " SET (rmpct.dv_id, rmpct.dp_id,"
                            + " rmpct.rm_cat, rmpct.rm_type," + " rmpct.area_rm, rmpct.prorate) = "
                            + "(SELECT rm.dv_id, rm.dp_id," + " rm.rm_cat, rm.rm_type,"
                            + " rm.area, rm.prorate " + " FROM rm"
                            + " WHERE rm.bl_id = rmpct.bl_id" + " AND rm.fl_id = rmpct.fl_id"
                            + " AND rm.rm_id = rmpct.rm_id)"
                            + " WHERE 1 = (SELECT COUNT(*) FROM rmpct a_inner"
                            + " WHERE a_inner.bl_id = rmpct.bl_id"
                            + " AND a_inner.fl_id = rmpct.fl_id"
                            + " AND a_inner.rm_id = rmpct.rm_id)";
        } else {
            sql = "UPDATE rmpct";
            
            if (SqlUtils.isSybase()) {
                sql = sql + ", rm";
            }
            
            sql =
                    sql + " SET rmpct.dv_id = rm.dv_id," + " rmpct.dp_id = rm.dp_id,"
                            + " rmpct.rm_cat = rm.rm_cat," + " rmpct.rm_type = rm.rm_type,"
                            + " rmpct.area_rm = rm.area," + " rmpct.prorate = rm.prorate";
            
            if (SqlUtils.isSqlServer()) {
                sql = sql + " FROM rm";
            }
            
            sql =
                    sql + " WHERE rm.bl_id = rmpct.bl_id" + " AND rm.fl_id = rmpct.fl_id"
                            + " AND rm.rm_id = rmpct.rm_id"
                            + " AND 1 = (SELECT COUNT(*) FROM rmpct"
                            + " WHERE rmpct.bl_id = rm.bl_id" + " AND rmpct.fl_id = rm.fl_id"
                            + " AND rmpct.rm_id = rm.rm_id)";
        }
        SqlUtils.executeUpdate("rmpct", sql);
    }
    
    // ---------------------------------------------------------------------------------------------
    // END updatePercentageOfSpace WFR
    // ---------------------------------------------------------------------------------------------
}
