package com.archibus.service.space;

import com.archibus.datasource.*;
import com.archibus.jobmanager.JobStatus;
import com.archibus.jobmanager.JobStatus.JobResult;

public class AllRoomPercentageChargeback {

    public static void performChargeback(JobStatus status) {
        status.setResult(new JobResult("Shared Workspace Charegback"));
        status.setTotalNumber(100);
        // Initialize certain pct fields to 0

        new FieldFormula("rmpct").addFormula("rmpct.cost", "0.0").addFormula(
            "rmpct.area_chargable", "0.0").addFormula("rmpct.area_comn", "0.0").addFormula(
            "rmpct.area_comn_nocup", "0.0").addFormula("rmpct.area_comn_ocup", "0.0").calculate();
        status.setCurrentNumber(5);

        // Sum TOTAL RM AREA from RM to FL

        new FieldOperation("fl", "rm")
            .setAssignedRestriction(
                "EXISTS (SELECT 1 FROM rmcat WHERE rmcat.rm_cat = rm.rm_cat AND rmcat.used_in_calcs IN 			('all_totals', 'rm_totals') ) OR rm.rm_cat IS NULL")
            .calculate("fl.area_rm", "SUM", "rm.area");
        status.setCurrentNumber(10);

        // Calculate FLOOR REMAINING AREA

        boolean includeGroupsInUnifiedSpaceCalcs = Configuration.getActivityParameterBoolean(
            "AbCommonResources", Configuration.INCLUDE_GROUPS_IN_UNIFIED_SPACE_CALCS,
            Configuration.INCLUDE_GROUPS_IN_UNIFIED_SPACE_CALCS_DEFAULT);
        if (includeGroupsInUnifiedSpaceCalcs) {
            new FieldFormula("fl").calculate("fl.area_remain",
                "fl.area_gross_int - fl.area_rm - fl.area_gp");
        } else {
            new FieldFormula("fl").calculate("fl.area_remain", "fl.area_gross_int - fl.area_rm");
        }
        status.setCurrentNumber(15);

        // Sum OCUP DEPARTMENT area from RMPCT to FL

        new FieldOperation("fl", "rmpct", "rmcat")
            .setAssignedRestriction(
                "rmcat.occupiable = 1 and rmpct.dp_id IS NOT NULL AND rmcat.used_in_calcs IN ('all_totals', 'dp_comn_ocup_totals')")
            .calculate("fl.area_ocup_dp", "SUM", "rmpct.area_rm");
        status.setCurrentNumber(20);

        // Sum OCUP DEPARTMENT area from FL to BL

        new FieldOperation("bl", "fl").calculate("bl.area_ocup_dp", "SUM", "fl.area_ocup_dp");

        // Sum OCUP DEPARTMENT area from BL to SITE

        new FieldOperation("site", "bl").calculate("site.area_ocup_dp", "SUM", "bl.area_ocup_dp");
        status.setCurrentNumber(25);

        // Sum NON-OCUP FLOOR COMMON from RMPCT to FL

        new FieldOperation("fl", "rmpct", "rmcat")
            .setAssignedRestriction(
                "rmpct.prorate='FLOOR' and rmcat.occupiable=0 AND rmcat.used_in_calcs IN ('all_totals', 'dp_comn_ocup_totals')")
            .calculate("fl.area_fl_comn_nocup", "SUM", "rmpct.area_rm");
        status.setCurrentNumber(30);

        // Sum NON-OCUP BLDG. COMMON from RMPCT to BL

        new FieldOperation("bl", "rmpct", "rmcat")
            .setAssignedRestriction(
                "rmpct.prorate='BUILDING' and rmcat.occupiable=0 AND rmcat.used_in_calcs IN ('all_totals', 'dp_comn_ocup_totals')")
            .calculate("bl.area_bl_comn_nocup", "SUM", "rmpct.area_rm");
        status.setCurrentNumber(35);

        // Sum NON-OCUP SITE COMMON area from RMPCT to SITE

        String sql = "UPDATE site SET area_st_comn_nocup ="
                + " (SELECT ${sql.isNull('SUM(rmpct.area_rm)', 0.0 )}" + " FROM bl, rmpct, rmcat"
                + " WHERE site.site_id = bl.site_id" + " AND bl.bl_id = rmpct.bl_id"
                + " AND rmpct.prorate = 'SITE'" + " AND rmpct.rm_cat = rmcat.rm_cat"
                + " AND rmcat.used_in_calcs IN ('all_totals', 'dp_comn_ocup_totals') "
                + " AND rmcat.occupiable = 0)";
        SqlUtils.executeUpdate("site", sql);
        status.setCurrentNumber(40);

        // Sum OCUP FLOOR COMMON area from RMPCT to FL

        new FieldOperation("fl", "rmpct", "rmcat")
            .setAssignedRestriction(
                "rmpct.prorate='FLOOR' and rmcat.occupiable = 1 AND rmcat.used_in_calcs IN ('all_totals', 'dp_comn_ocup_totals')")
            .calculate("fl.area_fl_comn_ocup", "SUM", "rmpct.area_rm");
        status.setCurrentNumber(45);

        // ADD REMAINING AREA to FLOOR COMMON

        new FieldFormula("fl").setAssignedRestriction("fl.prorate_remain = 'FLOOR'").calculate(
            "fl.area_fl_comn_ocup", "fl.area_remain + fl.area_fl_comn_ocup");
        status.setCurrentNumber(50);

        // Sum OCUP BLDG. COMMON (+REMAIN) area from RMPCT to BL

        sql = "UPDATE bl SET area_bl_comn_ocup ="
                + " (SELECT ${sql.isNull('SUM(rmpct.area_rm)', 0.0 )}" + " FROM rmpct, rmcat"
                + " WHERE bl.bl_id = rmpct.bl_id" + " AND rmpct.rm_cat = rmcat.rm_cat"
                + " AND rmpct.prorate = 'BUILDING'"
                + " AND rmcat.used_in_calcs IN ('all_totals', 'dp_comn_ocup_totals')"
                + " AND rmcat.occupiable = 1)";
        SqlUtils.executeUpdate("bl", sql);
        status.setCurrentNumber(55);

        sql = "UPDATE bl SET area_bl_comn_ocup ="
                + " (SELECT area_bl_comn_ocup + ${sql.isNull('SUM(fl.area_remain)', 0.0 )}"
                + " FROM fl" + " WHERE bl.bl_id = fl.bl_id"
                + " AND fl.prorate_remain = 'BUILDING' )";
        SqlUtils.executeUpdate("bl", sql);
        status.setCurrentNumber(60);

        // Sum OCUP SITE COMMON area (+REMAIN) from RMPCT to SITE

        sql = "UPDATE site SET area_st_comn_ocup ="
                + " (SELECT ${sql.isNull('SUM(rmpct.area_rm)', 0.0 )}" + " FROM bl, rmpct, rmcat"
                + " WHERE site.site_id = bl.site_id" + " AND bl.bl_id = rmpct.bl_id"
                + " AND rmpct.rm_cat = rmcat.rm_cat" + " AND rmpct.prorate = 'SITE'"
                + " AND rmcat.used_in_calcs IN ('all_totals', 'dp_comn_ocup_totals')"
                + " AND rmcat.occupiable = 1)";
        SqlUtils.executeUpdate("site", sql);
        status.setCurrentNumber(65);

        sql = "UPDATE site SET area_st_comn_ocup ="
                + " (SELECT area_st_comn_ocup + ${sql.isNull('SUM(fl.area_remain)', 0.0)}"
                + " FROM bl, fl" + " WHERE site.site_id = bl.site_id" + " AND bl.bl_id = fl.bl_id"
                + " AND fl.prorate_remain = 'SITE' )";
        SqlUtils.executeUpdate("site", sql);
        status.setCurrentNumber(70);

        // PRORATE COMMON AREA
        // Only update ocupiable dept. rooms
        // See SPSUP.ABS for definition of sql view: alrmpctc

        sql = "UPDATE rmpct SET" + " rmpct.area_comn_ocup ="
                + " (SELECT (flcomocup + blcomocup + stcomocup)" + " FROM alrmpctc"
                + " WHERE alrmpctc.pct_id = rmpct.pct_id)," + " rmpct.area_comn_nocup ="
                + " (SELECT (flcomnocup + blcomnocup + stcomnocup)" + " FROM alrmpctc"
                + " WHERE alrmpctc.pct_id = rmpct.pct_id)" + " WHERE rmpct.dp_id IS NOT NULL AND rmpct.bl_id IS NOT NULL AND rmpct.fl_id IS NOT NULL AND rmpct.rm_id IS NOT NULL"
                + " AND 1 = (SELECT rmcat.occupiable" + " FROM rmcat"
                + " WHERE rmcat.rm_cat = rmpct.rm_cat"
                + " AND rmcat.used_in_calcs IN ('all_totals', 'dp_comn_ocup_totals') )";
        SqlUtils.executeUpdate("rmpct", sql);
        status.setCurrentNumber(75);

        // Calcuate TOTAL COMMON & CHARGEABLE area
        // Only update dept. rooms

        new FieldFormula("rmpct").setAssignedRestriction("rmpct.dp_id IS NOT NULL").addFormula(
            "rmpct.area_comn", "rmpct.area_comn_ocup + rmpct.area_comn_nocup").addFormula(
            "rmpct.area_chargable", "rmpct.area_rm + rmpct.area_comn").calculate();
        status.setCurrentNumber(80);

        // Calculate COST
        // Only update dept. rooms

        new FieldFormula("bl", "rmpct", "fl").setAssignedRestriction("rmpct.dp_id IS NOT NULL AND rmpct.bl_id IS NOT NULL AND rmpct.fl_id IS NOT NULL AND rmpct.rm_id IS NOT NULL")
            .calculate(
                "rmpct.cost",
                "CASE " + "   WHEN fl.cost_sqft <> 0 THEN rmpct.area_chargable * fl.cost_sqft "
                        + "   WHEN bl.cost_sqft <> 0 THEN rmpct.area_chargable * bl.cost_sqft "
                        + "   ELSE 0 " + "END");
        status.setCurrentNumber(85);

        new FieldFormula("rm", "rmpct", "rmcat").setAssignedRestriction(
            "rmpct.dp_id IS NOT NULL AND rmpct.rm_cat IS NOT NULL AND rmpct.bl_id IS NOT NULL AND rmpct.fl_id IS NOT NULL AND rmpct.rm_id IS NOT NULL").calculate(
            "rmpct.cost",
            "CASE " + "   WHEN rmcat.cost_sqft <> 0 THEN rmpct.area_chargable * rmcat.cost_sqft "
                    + "   ELSE rmpct.cost " + "END");

        new FieldFormula("rm", "rmpct").setAssignedRestriction("rmpct.dp_id IS NOT NULL AND rmpct.bl_id IS NOT NULL AND rmpct.fl_id IS NOT NULL AND rmpct.rm_id IS NOT NULL")
            .calculate(
                "rmpct.cost",
                "CASE " + "   WHEN rm.cost_sqft <> 0 THEN rmpct.area_chargable * rm.cost_sqft "
                        + "   ELSE rmpct.cost " + "END");
        status.setCurrentNumber(90);

        // Sum COST, CHARGABLE area, COMMON area, and ROOM AREA, from RMPCT to DP

        new FieldOperation("dp", "rmpct")
            .setAssignedRestriction(
                "EXISTS (SELECT 1 FROM rmcat WHERE rmcat.rm_cat = rmpct.rm_cat AND rmcat.used_in_calcs IN ('all_totals', 'dp_comn_ocup_totals') ) OR rmpct.rm_cat IS NULL")
            .addOperation("dp.cost", "SUM", "rmpct.cost").addOperation("dp.area_chargable", "SUM",
                "rmpct.area_chargable").addOperation("dp.area_rm", "SUM", "rmpct.area_rm")
            .addOperation("dp.area_comn", "SUM", "rmpct.area_comn").addOperation(
                "dp.area_comn_ocup", "SUM", "rmpct.area_comn_ocup").addOperation(
                "dp.area_comn_nocup", "SUM", "rmpct.area_comn_nocup").calculate();
        status.setCurrentNumber(95);

        // Sum COST, CHARGABLE area, COMMON area, and ROOM AREA, from DP to DV

        new FieldOperation("dv", "dp").addOperation("dv.cost", "SUM", "dp.cost").addOperation(
            "dv.area_chargable", "SUM", "dp.area_chargable").addOperation("dv.area_rm", "SUM",
            "dp.area_rm").addOperation("dv.area_comn", "SUM", "dp.area_comn").addOperation(
            "dv.area_comn_ocup", "SUM", "dp.area_comn_ocup").addOperation("dv.area_comn_nocup",
            "SUM", "dp.area_comn_nocup").calculate();

        // Sum COST, CHARGABLE area, COMMON area, and ROOM AREA, from DV to BU

        new FieldOperation("bu", "dv").addOperation("bu.cost", "SUM", "dv.cost").addOperation(
            "bu.area_chargable", "SUM", "dv.area_chargable").addOperation("bu.area_rm", "SUM",
            "dv.area_rm").addOperation("bu.area_comn", "SUM", "dv.area_comn").addOperation(
            "bu.area_comn_ocup", "SUM", "dv.area_comn_ocup").addOperation("bu.area_comn_nocup",
            "SUM", "dv.area_comn_nocup").calculate();
        status.setCurrentNumber(100);
    }
}
