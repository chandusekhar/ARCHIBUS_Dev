package com.archibus.service.space;

import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.jobmanager.*;
import com.archibus.jobmanager.JobStatus.JobResult;

/**
 * All Room Area Update calculations.
 * 
 * <p>
 * History:
 * <li>Web Central 17.3: Initial implementation, ported from arup.abs. Does not include add_nocup().
 * <li>Web Central 18.1: Updated from arup181.abs.
 * 
 * @author Sergey Kuramshin
 */
public class AllRoomAreaUpdate {
    
    private static final String RMCAT_USED_IN_CALCS =
            "rmcat.used_in_calcs IN ('all_totals', 'dp_comn_ocup_totals')";
    
    public static void updateAreaTotals(JobStatus status) {
        status.setResult(new JobResult("Update Area Totals"));
        status.setTotalNumber(100);
        
        calculateGros();
        status.setCurrentNumber(25);
        
        calculateOccupiable();
        status.setCurrentNumber(50);
        
        calculateNonoccupiable();
        status.setCurrentNumber(75);
        
        calculateGroups();
        status.setCurrentNumber(100);
    }
    
    public static void calculateGros() {
        // Sum EXTERNAL and INTERNAL gross areas from GROS to FL
        // Fix KB3031942- change to calculate fl.area_gros_ext and fl.area_gros_int ONLY IF there
        // exists records in the gros table
        // for the corresponding building-floor.(Guo 2011/08/10)
        FieldOperation fo_ext = new FieldOperation();
        fo_ext.setOwner("fl");
        fo_ext.setAssigned("gros");
        fo_ext
            .setOwnerRestriction("EXISTS (SELECT 1 FROM gros WHERE gros.bl_id = fl.bl_id AND gros.fl_id = fl.fl_id AND gros.gros_type='EXT')");
        fo_ext.setAssignedRestriction("gros.gros_type='EXT'");
        fo_ext.addOperation("fl.area_gross_ext", "SUM", "gros.area");
        fo_ext.calculate();
        
        FieldOperation fo_int = new FieldOperation();
        fo_int.setOwner("fl");
        fo_int.setAssigned("gros");
        fo_int
            .setOwnerRestriction("EXISTS (SELECT 1 FROM gros WHERE gros.bl_id = fl.bl_id AND gros.fl_id = fl.fl_id AND gros.gros_type='INT')");
        fo_int.setAssignedRestriction("gros.gros_type='INT'");
        fo_int.addOperation("fl.area_gross_int", "SUM", "gros.area");
        fo_int.calculate();
        
        // Calculate EXTERIOR WALL area in FL
        new FieldFormula("fl").setAssignedRestriction("fl.area_gross_ext <> 0").calculate(
            "fl.area_ext_wall", "fl.area_gross_ext - fl.area_gross_int");
        new FieldFormula("fl").setAssignedRestriction("fl.area_gross_ext = 0").calculate(
            "fl.area_ext_wall", "0");
        
        // Sum EXTERNAL, INTERNAL, and EXT. WALL area from FL to BL
        new FieldOperation("bl", "fl")
            .addOperation("bl.area_gross_ext", "SUM", "fl.area_gross_ext")
            .addOperation("bl.area_gross_int", "SUM", "fl.area_gross_int")
            .addOperation("bl.area_ext_wall", "SUM", "fl.area_ext_wall").calculate();
        
        // Sum EXTERNAL, INTERNAL, and EXT. WALL area from BL to SITE
        new FieldOperation("site", "bl")
            .addOperation("site.area_gross_ext", "SUM", "bl.area_gross_ext")
            .addOperation("site.area_gross_int", "SUM", "bl.area_gross_int")
            .addOperation("site.area_ext_wall", "SUM", "bl.area_ext_wall").calculate();
    }
    
    public static void calculateNonoccupiable() {
        // Sum NON-OCUP:TOTAL,COMN,DP,VERT_PEN and SERV area from RM to FL
        new FieldOperation("fl", "rm")
            .setAssignedRestriction(
                "EXISTS (SELECT 1 FROM rmcat WHERE rmcat.rm_cat = rm.rm_cat AND rmcat.used_in_calcs IN 			('all_totals', 'rm_totals') ) OR rm.rm_cat IS NULL")
            .calculate("fl.area_rm", "SUM", "rm.area");
        
        new FieldOperation("fl", "rm", "rmcat").setAssignedRestriction(
            "rmcat.occupiable = 0 AND " + RMCAT_USED_IN_CALCS).calculate("fl.area_nocup", "SUM",
            "rm.area");
        
        new FieldOperation("fl", "rm", "rmcat").setAssignedRestriction(
            "rmcat.occupiable = 0 AND rm.dp_id IS NOT NULL AND " + RMCAT_USED_IN_CALCS).calculate(
            "fl.area_nocup_dp", "SUM", "rm.area");
        
        new FieldOperation("fl", "rm", "rmcat").setAssignedRestriction(
            "rmcat.occupiable = 0 AND rm.prorate<>'NONE' AND " + RMCAT_USED_IN_CALCS).calculate(
            "fl.area_nocup_comn", "SUM", "rm.area");
        
        new FieldOperation("fl", "rm", "rmcat").setAssignedRestriction("rmcat.supercat = 'VERT'")
            .calculate("fl.area_vert_pen", "SUM", "rm.area");
        
        new FieldOperation("fl", "rm", "rmcat").setAssignedRestriction("rmcat.supercat = 'SERV'")
            .calculate("fl.area_serv", "SUM", "rm.area");
        
        // Calculate RENTABLE and USABLE area in FL
        new FieldFormula("fl")
            .addFormula("fl.area_rentable", "fl.area_gross_int - fl.area_vert_pen")
            .addFormula("fl.area_usable", "fl.area_rentable - fl.area_serv").calculate();
        
        // Sum NON-OCUP:TOTAL,VERT_PEN,SERV&TOTAL:RM,RENT,USE area from FL to BL
        new FieldOperation("bl", "fl").addOperation("bl.area_rm", "SUM", "fl.area_rm")
            .addOperation("bl.area_nocup", "SUM", "fl.area_nocup")
            .addOperation("bl.area_nocup_dp", "SUM", "fl.area_nocup_dp")
            .addOperation("bl.area_nocup_comn", "SUM", "fl.area_nocup_comn")
            .addOperation("bl.area_vert_pen", "SUM", "fl.area_vert_pen")
            .addOperation("bl.area_rentable", "SUM", "fl.area_rentable")
            .addOperation("bl.area_serv", "SUM", "fl.area_serv")
            .addOperation("bl.area_usable", "SUM", "fl.area_usable").calculate();
        
        // Sum NON-OCUP:TOTAL,VERT_PEN,SERV&TOTAL:RM,RENT,USE area from BL to SITE
        new FieldOperation("site", "bl").addOperation("site.area_rm", "SUM", "bl.area_rm")
            .addOperation("site.area_nocup", "SUM", "bl.area_nocup")
            .addOperation("site.area_nocup_dp", "SUM", "bl.area_nocup_dp")
            .addOperation("site.area_nocup_comn", "SUM", "bl.area_nocup_comn")
            .addOperation("site.area_vert_pen", "SUM", "bl.area_vert_pen")
            .addOperation("site.area_rentable", "SUM", "bl.area_rentable")
            .addOperation("site.area_serv", "SUM", "bl.area_serv")
            .addOperation("site.area_usable", "SUM", "bl.area_usable").calculate();
        
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
        
        // Sum NON-OCUP, RM AREA from RM to DP
        new FieldOperation("dp", "rm")
            .setAssignedRestriction(
                "EXISTS (SELECT 1 FROM rmcat WHERE rmcat.rm_cat = rm.rm_cat AND rmcat.used_in_calcs IN ('all_totals', 'dp_comn_ocup_totals') ) OR rm.rm_cat IS NULL")
            .calculate("dp.area_rm", "SUM", "rm.area");
        
        new FieldOperation("dp", "rm", "rmcat").setAssignedRestriction(
            "rmcat.occupiable = 0 AND " + RMCAT_USED_IN_CALCS).calculate("dp.area_nocup", "SUM",
            "rm.area");
        
        // Sum RM & NONOCUP AREA from DP to DV
        new FieldOperation("dv", "dp").addOperation("dv.area_rm", "SUM", "dp.area_rm")
            .addOperation("dv.area_nocup", "SUM", "dp.area_nocup").calculate();
        
        // Sum RM & NONOCUP AREA from DV to BU
        new FieldOperation("bu", "dv").addOperation("bu.area_rm", "SUM", "dv.area_rm")
            .addOperation("bu.area_nocup", "SUM", "dv.area_nocup").calculate();
        
        // Calculate RMTYPE NON-OCUP AREA & COUNT
        new FieldOperation("rmtype", "rm").addOperation("rmtype.area", "SUM", "rm.area")
            .addOperation("rmtype.tot_count", "COUNT", "rm.area").calculate();
        
        // SUM AREA and COUNT from RMTYPE to RMCAT
        new FieldOperation("rmcat", "rm").addOperation("rmcat.area", "SUM", "rm.area")
            .addOperation("rmcat.tot_count", "COUNT", "rm.area").calculate();
        
        // Calculate RMCAT AVG AREA
        new FieldFormula("rmcat").calculate("rmcat.area_avg",
            "rmcat.area / " + SqlUtils.formatSqlReplace0WithHuge("rmcat.tot_count"));
        
        // Calculate RMTYPE AVG AREA
        new FieldFormula("rmtype").calculate("rmtype.area_avg",
            "rmtype.area / " + SqlUtils.formatSqlReplace0WithHuge("rmtype.tot_count"));
    }
    
    public static void calculateOccupiable() {
        // Sum OCUP: TOTAL,COMN,DP & TOTAL:RM,DEPT,COMN area from RM to FL
        new FieldOperation("fl", "rm", "rmcat").setAssignedRestriction(
            "rmcat.occupiable = 1 AND " + RMCAT_USED_IN_CALCS).calculate("fl.area_ocup", "SUM",
            "rm.area");
        
        new FieldOperation("fl", "rm", "rmcat").setAssignedRestriction(
            "rmcat.occupiable = 1 AND rm.dp_id IS NOT NULL AND " + RMCAT_USED_IN_CALCS).calculate(
            "fl.area_ocup_dp", "SUM", "rm.area");
        
        new FieldOperation("fl", "rm", "rmcat").setAssignedRestriction(
            "rmcat.occupiable = 1 AND rm.prorate <> 'NONE' AND " + RMCAT_USED_IN_CALCS).calculate(
            "fl.area_ocup_comn", "SUM", "rm.area");
        
        new FieldOperation("fl", "rm")
            .setAssignedRestriction(
                "rm.dp_id IS NOT NULL AND (EXISTS (SELECT 1 FROM rmcat WHERE rmcat.rm_cat = rm.rm_cat AND rmcat.used_in_calcs IN ('all_totals', 'dp_comn_ocup_totals')) OR rm.rm_cat IS NULL)")
            .calculate("fl.area_rm_dp", "SUM", "rm.area");
        
        new FieldOperation("fl", "rm")
            .setAssignedRestriction(
                "rm.prorate <> 'NONE' AND (EXISTS (SELECT 1 FROM rmcat WHERE rmcat.rm_cat = rm.rm_cat AND rmcat.used_in_calcs IN ('all_totals', 'dp_comn_ocup_totals')) OR rm.rm_cat IS NULL)")
            .calculate("fl.area_rm_comn", "SUM", "rm.area");
        
        // Calculate FLOOR REMAINING AREA
        new FieldFormula("fl").calculate("fl.area_remain", "fl.area_gross_int - fl.area_rm");
        
        // Sum REMAINING, OCUP:TOTAL,DP,COMN & TOTAL RM,DP,COMN area from FL to BL
        new FieldOperation("bl", "fl").addOperation("bl.area_rm", "SUM", "fl.area_rm")
            .addOperation("bl.area_ocup", "SUM", "fl.area_ocup")
            .addOperation("bl.area_ocup_dp", "SUM", "fl.area_ocup_dp")
            .addOperation("bl.area_ocup_comn", "SUM", "fl.area_ocup_comn")
            .addOperation("bl.area_rm_dp", "SUM", "fl.area_rm_dp")
            .addOperation("bl.area_rm_comn", "SUM", "fl.area_rm_comn")
            .addOperation("bl.area_remain", "SUM", "fl.area_remain").calculate();
        
        // Sum REMAINING, OCUP:TOTAL,DP,COMN & TOTAL RM,DP,COMN area from BL to SITE
        new FieldOperation("site", "bl").addOperation("site.area_rm", "SUM", "bl.area_rm")
            .addOperation("site.area_ocup", "SUM", "bl.area_ocup")
            .addOperation("site.area_ocup_dp", "SUM", "bl.area_ocup_dp")
            .addOperation("site.area_ocup_comn", "SUM", "bl.area_ocup_comn")
            .addOperation("site.area_rm_dp", "SUM", "bl.area_rm_dp")
            .addOperation("site.area_rm_comn", "SUM", "bl.area_rm_comn").calculate();
        
        // Sum OCUP, RM AREA from RM to DP
        new FieldOperation("dp", "rm", "rmcat").setAssignedRestriction(
            "rmcat.occupiable = 1 AND " + RMCAT_USED_IN_CALCS).calculate("dp.area_ocup", "SUM",
            "rm.area");
        
        // Sum RM & OCUP AREA from DP to DV
        new FieldOperation("dv", "dp").calculate("dv.area_ocup", "SUM", "dp.area_ocup");
        
        // Sum RM AREA from DV to BU
        new FieldOperation("bu", "dv").calculate("bu.area_ocup", "SUM", "dv.area_ocup");
        
        // Calculate RMSTD AREA and COUNT
        new FieldOperation("rmstd", "rm").addOperation("rmstd.area", "SUM", "rm.area")
            .addOperation("rmstd.tot_count", "COUNT", "rm.area").calculate();
        
        // Calculate RMSTD AVERAGE AREA
        new FieldFormula("rmstd").calculate("rmstd.area_avg",
            "rmstd.area / " + SqlUtils.formatSqlReplace0WithHuge("rmstd.tot_count"));
    }
    
    public static void calculateGroups() {
        // Sum TOTAL, DEPT, and COMN GROUP area from GP to FL
        new FieldOperation("fl", "gp").setAssignedRestriction("gp.portfolio_scenario_id IS NULL")
            .calculate("fl.area_gp", "SUM", "gp.area");
        
        new FieldOperation("fl", "gp").setAssignedRestriction(
            "gp.dp_id IS NOT NULL AND gp.portfolio_scenario_id IS NULL").calculate("fl.area_gp_dp",
            "SUM", "gp.area");
        
        new FieldOperation("fl", "gp").setAssignedRestriction(
            "gp.prorate <> 'NONE' AND gp.portfolio_scenario_id IS NULL").calculate(
            "fl.area_gp_comn", "SUM", "gp.area");
        
        // Calculate FLOOR REMAINING AREA
        boolean includeGroupsInUnifiedSpaceCalcs =
                Configuration.getActivityParameterBoolean("AbCommonResources",
                    Configuration.INCLUDE_GROUPS_IN_UNIFIED_SPACE_CALCS,
                    Configuration.INCLUDE_GROUPS_IN_UNIFIED_SPACE_CALCS_DEFAULT);
        if (includeGroupsInUnifiedSpaceCalcs) {
            new FieldFormula("fl").calculate("fl.area_remain",
                "fl.area_gross_int - fl.area_rm - fl.area_gp");
        } else {
            new FieldFormula("fl").calculate("fl.area_remain", "fl.area_gross_int - fl.area_rm");
        }
        
        // Sum REMAINING, TOTAL, DEPT, and COMN GROUP area from FL to BL
        new FieldOperation("bl", "fl").addOperation("bl.area_gp", "SUM", "fl.area_gp")
            .addOperation("bl.area_gp_dp", "SUM", "fl.area_gp_dp")
            .addOperation("bl.area_gp_comn", "SUM", "fl.area_gp_comn")
            .addOperation("bl.area_remain", "SUM", "fl.area_remain").calculate();
        
        // Sum TOTAL, DEPT, and COMN GROUP area from BL to SITE
        new FieldOperation("site", "bl").addOperation("site.area_gp", "SUM", "bl.area_gp")
            .addOperation("site.area_gp_dp", "SUM", "bl.area_gp_dp")
            .addOperation("site.area_gp_comn", "SUM", "bl.area_gp_comn").calculate();
        
        // Sum GROUP AREA from GP to DP
        new FieldOperation("dp", "gp").setAssignedRestriction("gp.portfolio_scenario_id IS NULL")
            .calculate("dp.area_gp", "SUM", "gp.area");
        
        // Sum GROUP AREA from DP to DV
        new FieldOperation("dv", "dp").calculate("dv.area_gp", "SUM", "dp.area_gp");
        
        // Sum GROUP AREA from DV to BU
        new FieldOperation("bu", "dv").calculate("bu.area_gp", "SUM", "dv.area_gp");
        
        // Calculate GPSTD AREA and COUNT
        new FieldOperation("gpstd", "gp").addOperation("gpstd.area", "SUM", "gp.area")
            .addOperation("gpstd.tot_count", "COUNT", "gp.area")
            .setAssignedRestriction("gp.portfolio_scenario_id IS NULL").calculate();
    }
    
    // NOTE: The following room types MUST be 10 characters or less!
    private static final String kVertRoomTypeMsg = "VERT";
    
    private static final String kElevRoomTypeMsg = "ELEV";
    
    private static final String kStairRoomTypeMsg = "STAIR";
    
    private static final String kShaftRoomTypeMsg = "SHAFT";
    
    private static final String kPipeRoomTypeMsg = "PIPE";
    
    private static final String kHallwayRoomTypeMsg = "HALLWAY";
    
    private static final String kCorridorRoomTypeMsg = "CORRIDOR";
    
    private static final String kTelecomRoomTypeMsg = "TELECOM";
    
    private static final String kJanitorRoomTypeMsg = "JANITOR";
    
    private static final String kLobbyRoomTypeMsg = "LOBBY";
    
    private static final String kMechRoomTypeMsg = "MECH";
    
    private static final String kMenRoomTypeMsg = "MEN";
    
    private static final String kPrimcircRoomTypeMsg = "PRIMCIRC";
    
    private static final String kServiceRoomTypeMsg = "SERVICE";
    
    private static final String kWomenRoomTypeMsg = "WOMEN";
    
    private static final String kVerticalPenetrationMsg = "Vertical Penetration";
    
    private static final String kElevatorMsg = "Elevator";
    
    private static final String kStairsMsg = "Stairs";
    
    private static final String kShaftDuctMsg = "Shaft, Duct";
    
    private static final String kPipesMsg = "Pipes";
    
    private static final String kServiceAreaRoomsMsg = "Service Area Rooms";
    
    private static final String kHallwayMsg = "Hallway";
    
    private static final String kCorridorMsg = "Corridor";
    
    private static final String kTelecomElectricalClosetMsg = "Telecom\\Electrical Closet";
    
    private static final String kJanitorCustodialClosetMsg = "Janitor\\Custodial Closet";
    
    private static final String kLobbyMsg = "Lobby";
    
    private static final String kMechanicalClosetRoomMsg = "Mechanical Closet\\Room";
    
    private static final String kMensRestroomMsg = "Mens Restroom";
    
    private static final String kPrimaryCirculationMsg = "Primary Circulation";
    
    private static final String kServiceAreaMsg = "Service Area";
    
    private static final String kWomensRestroomMsg = "Womens Restroom";
    
    private static final String RMCAT_VERT = "VERT";
    
    private static final String RMCAT_SERV = "SERV";
    
    /**
     * Add Non-Occupiable Room Categories and Types.
     */
    public static void addNonoccupiableRoomCategories(JobStatus status) {
        status.setResult(new JobResult("Add Non-Occupiable Room Categories"));
        status.setTotalNumber(100);
        
        DataSource rmcatDS =
                DataSourceFactory.createDataSourceForFields("rmcat", new String[] { "rm_cat",
                        "supercat", "description", "occupiable" });
        
        DataSource rmtypeDS =
                DataSourceFactory.createDataSourceForFields("rmtype", new String[] { "rm_cat",
                        "rm_type", "description" });
        
        int numberOfVerticalCategories =
                DataStatistics.getInt("rmcat", "rm_cat", "count",
                    Restrictions.sql("rmcat.supercat = '" + RMCAT_VERT + "'"));
        if (numberOfVerticalCategories == 0) {
            DataRecord record = rmcatDS.createNewRecord();
            record.setValue("rmcat.rm_cat", RMCAT_VERT);
            record.setValue("rmcat.supercat", RMCAT_VERT);
            record.setValue("rmcat.description", kVerticalPenetrationMsg);
            record.setValue("rmcat.occupiable", 0);
            rmcatDS.saveRecord(record);
            
            record = rmtypeDS.createNewRecord();
            record.setValue("rmtype.rm_cat", RMCAT_VERT);
            record.setValue("rmtype.rm_type", kVertRoomTypeMsg);
            record.setValue("rmtype.description", kVerticalPenetrationMsg);
            rmtypeDS.saveRecord(record);
            
            record.setValue("rmtype.rm_cat", RMCAT_VERT);
            record.setValue("rmtype.rm_type", kElevRoomTypeMsg);
            record.setValue("rmtype.description", kElevatorMsg);
            rmtypeDS.saveRecord(record);
            
            record.setValue("rmtype.rm_cat", RMCAT_VERT);
            record.setValue("rmtype.rm_type", kStairRoomTypeMsg);
            record.setValue("rmtype.description", kStairsMsg);
            rmtypeDS.saveRecord(record);
            
            record.setValue("rmtype.rm_cat", RMCAT_VERT);
            record.setValue("rmtype.rm_type", kShaftRoomTypeMsg);
            record.setValue("rmtype.description", kShaftDuctMsg);
            rmtypeDS.saveRecord(record);
            
            record.setValue("rmtype.rm_cat", RMCAT_VERT);
            record.setValue("rmtype.rm_type", kPipeRoomTypeMsg);
            record.setValue("rmtype.description", kPipesMsg);
            rmtypeDS.saveRecord(record);
        }
        status.setCurrentNumber(50);
        
        int numberOfServiceCategories =
                DataStatistics.getInt("rmcat", "rm_cat", "count",
                    Restrictions.sql("rmcat.supercat = '" + RMCAT_SERV + "'"));
        if (numberOfServiceCategories == 0) {
            DataRecord record = rmcatDS.createNewRecord();
            record.setValue("rmcat.rm_cat", RMCAT_SERV);
            record.setValue("rmcat.supercat", RMCAT_SERV);
            record.setValue("rmcat.description", kServiceAreaRoomsMsg);
            record.setValue("rmcat.occupiable", 0);
            rmcatDS.saveRecord(record);
            
            record = rmtypeDS.createNewRecord();
            record.setValue("rmtype.rm_cat", RMCAT_SERV);
            record.setValue("rmtype.rm_type", kHallwayRoomTypeMsg);
            record.setValue("rmtype.description", kHallwayMsg);
            rmtypeDS.saveRecord(record);
            
            record = rmtypeDS.createNewRecord();
            record.setValue("rmtype.rm_cat", RMCAT_SERV);
            record.setValue("rmtype.rm_type", kCorridorRoomTypeMsg);
            record.setValue("rmtype.description", kCorridorMsg);
            rmtypeDS.saveRecord(record);
            
            record = rmtypeDS.createNewRecord();
            record.setValue("rmtype.rm_cat", RMCAT_SERV);
            record.setValue("rmtype.rm_type", kTelecomRoomTypeMsg);
            record.setValue("rmtype.description", kTelecomElectricalClosetMsg);
            rmtypeDS.saveRecord(record);
            
            record = rmtypeDS.createNewRecord();
            record.setValue("rmtype.rm_cat", RMCAT_SERV);
            record.setValue("rmtype.rm_type", kJanitorRoomTypeMsg);
            record.setValue("rmtype.description", kJanitorCustodialClosetMsg);
            rmtypeDS.saveRecord(record);
            
            record = rmtypeDS.createNewRecord();
            record.setValue("rmtype.rm_cat", RMCAT_SERV);
            record.setValue("rmtype.rm_type", kLobbyRoomTypeMsg);
            record.setValue("rmtype.description", kLobbyMsg);
            rmtypeDS.saveRecord(record);
            
            record = rmtypeDS.createNewRecord();
            record.setValue("rmtype.rm_cat", RMCAT_SERV);
            record.setValue("rmtype.rm_type", kMechRoomTypeMsg);
            record.setValue("rmtype.description", kMechanicalClosetRoomMsg);
            rmtypeDS.saveRecord(record);
            
            record = rmtypeDS.createNewRecord();
            record.setValue("rmtype.rm_cat", RMCAT_SERV);
            record.setValue("rmtype.rm_type", kMenRoomTypeMsg);
            record.setValue("rmtype.description", kMensRestroomMsg);
            rmtypeDS.saveRecord(record);
            
            record = rmtypeDS.createNewRecord();
            record.setValue("rmtype.rm_cat", RMCAT_SERV);
            record.setValue("rmtype.rm_type", kPrimcircRoomTypeMsg);
            record.setValue("rmtype.description", kPrimaryCirculationMsg);
            rmtypeDS.saveRecord(record);
            
            record = rmtypeDS.createNewRecord();
            record.setValue("rmtype.rm_cat", RMCAT_SERV);
            record.setValue("rmtype.rm_type", kServiceRoomTypeMsg);
            record.setValue("rmtype.description", kServiceAreaMsg);
            rmtypeDS.saveRecord(record);
            
            record = rmtypeDS.createNewRecord();
            record.setValue("rmtype.rm_cat", RMCAT_SERV);
            record.setValue("rmtype.rm_type", kWomenRoomTypeMsg);
            record.setValue("rmtype.description", kWomensRestroomMsg);
            rmtypeDS.saveRecord(record);
        }
        status.setCurrentNumber(100);
    }
}
