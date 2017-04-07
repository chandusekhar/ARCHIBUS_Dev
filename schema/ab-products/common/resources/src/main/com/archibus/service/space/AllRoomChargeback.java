package com.archibus.service.space;

import com.archibus.datasource.*;

/**
 * All Room Chargeback calculations.
 * 
 * <p>
 * History:
 * <li>Web Central 18.1: Initial implementation, ported from arcb.abs.
 * 
 * @author Sergey Kuramshin
 */
public class AllRoomChargeback {

    public static void performChargeback() {
        // Initialize certain room fields to 0

        new FieldFormula("rm").addFormula("rm.cost", "0.0").addFormula("rm.area_chargable", "0.0")
            .addFormula("rm.area_comn", "0.0").addFormula("rm.area_comn_ocup", "0.0").addFormula(
                "rm.area_comn_nocup", "0.0").calculate();

        // Sum TOTAL and DEPT OCUP room area from RM to FL

        new FieldOperation("fl", "rm")
            .setAssignedRestriction(
                "EXISTS (SELECT 1 FROM rmcat WHERE rmcat.rm_cat = rm.rm_cat AND rmcat.used_in_calcs IN 			('all_totals', 'rm_totals') ) OR rm.rm_cat IS NULL")
            .calculate("fl.area_rm", "SUM", "rm.area");

        new FieldOperation("fl", "rm", "rmcat")
            .setAssignedRestriction(
                "rmcat.occupiable = 1 and rm.dp_id IS NOT NULL AND rmcat.used_in_calcs IN ('all_totals', 'dp_comn_ocup_totals')")
            .calculate("fl.area_ocup_dp", "SUM", "rm.area");

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

        // Sum DEPT OCUP area from FL to BL

        new FieldOperation("bl", "fl").calculate("bl.area_ocup_dp", "SUM", "fl.area_ocup_dp");

        // Sum DEPT OCUP area from BL to SITE

        new FieldOperation("site", "bl").calculate("site.area_ocup_dp", "SUM", "bl.area_ocup_dp");

        // Sum NON-OCUP FLOOR COMMON area from RM to FL

        new FieldOperation("fl", "rm", "rmcat")
            .setAssignedRestriction(
                "rm.prorate='FLOOR' AND rmcat.occupiable=0 AND rmcat.used_in_calcs IN ('all_totals', 'dp_comn_ocup_totals')")
            .calculate("fl.area_fl_comn_nocup", "SUM", "rm.area");

        // Sum NON-OCUP BLDG. COMMON area from RM to BL

        new FieldOperation("bl", "rm", "rmcat")
            .setAssignedRestriction(
                "rm.prorate='BUILDING' AND rmcat.occupiable=0 AND rmcat.used_in_calcs IN ('all_totals', 'dp_comn_ocup_totals')")
            .calculate("bl.area_bl_comn_nocup", "SUM", "rm.area");

        // Sum NON-OCUP SITE COMMON area from RM to SITE

        String sql = "UPDATE site SET area_st_comn_nocup ="
                + " (SELECT ${sql.isNull('SUM(rm.area)', 0)}" + " FROM bl,rm,rmcat "
                + " WHERE site.site_id = bl.site_id " + " AND bl.bl_id = rm.bl_id "
                + " AND rm.rm_cat = rmcat.rm_cat " + " AND rmcat.occupiable = 0 "
                + " AND rmcat.used_in_calcs IN ('all_totals', 'dp_comn_ocup_totals') "
                + " AND rm.prorate = 'SITE')";
        SqlUtils.executeUpdate("site", sql);

        // Sum OCUP FLOOR COMMON area from RM to FL

        new FieldOperation("fl", "rm", "rmcat")
            .setAssignedRestriction(
                "rm.prorate='FLOOR' AND rmcat.occupiable=1 AND rmcat.used_in_calcs IN ('all_totals', 'dp_comn_ocup_totals')")
            .calculate("fl.area_fl_comn_ocup", "SUM", "rm.area");

        // Add OCUP FLOOR COMMON and REMAINING AREA

        new FieldFormula("fl").setAssignedRestriction("fl.prorate_remain='FLOOR'").calculate(
            "fl.area_fl_comn_ocup", "fl.area_remain + fl.area_fl_comn_ocup");

        // Sum OCUP BUILDING COMMON (+REMAIN) from RM to BL

        sql = "UPDATE bl SET area_bl_comn_ocup =" + " (SELECT ${sql.isNull('SUM(rm.area)',0)}"
                + " FROM rm,rmcat" + " WHERE bl.bl_id = rm.bl_id" + " AND rm.rm_cat = rmcat.rm_cat"
                + " AND rm.prorate = 'BUILDING'"
                + " AND rmcat.used_in_calcs IN ('all_totals', 'dp_comn_ocup_totals')"
                + " AND rmcat.occupiable = 1)";
        SqlUtils.executeUpdate("bl", sql);

        sql = "UPDATE bl SET area_bl_comn_ocup ="
                + " (SELECT bl.area_bl_comn_ocup + ${sql.isNull('SUM(fl.area_remain)', 0.0)}"
                + " FROM fl" + " WHERE bl.bl_id = fl.bl_id"
                + " AND fl.prorate_remain = 'BUILDING')";
        SqlUtils.executeUpdate("bl", sql);

        // Sum OCUP SITE COMMON (+REMAIN) from RM to SITE

        sql = "UPDATE site SET area_st_comn_ocup =" + " (SELECT ${sql.isNull('SUM(rm.area)',0)}"
                + " FROM bl,rm,rmcat" + " WHERE site.site_id = bl.site_id"
                + " AND bl.bl_id = rm.bl_id" + " AND rm.rm_cat = rmcat.rm_cat"
                + " AND rm.prorate = 'SITE'"
                + " AND rmcat.used_in_calcs IN ('all_totals', 'dp_comn_ocup_totals')"
                + " AND rmcat.occupiable = 1)";
        SqlUtils.executeUpdate("site", sql);

        sql = "UPDATE site SET area_st_comn_ocup ="
                + " (SELECT site.area_st_comn_ocup + ${sql.isNull('SUM(fl.area_remain)', 0.0)}"
                + " FROM bl,fl" + " WHERE site.site_id = bl.site_id" + " AND bl.bl_id = fl.bl_id"
                + " AND fl.prorate_remain = 'SITE')";
        SqlUtils.executeUpdate("site", sql);

        // PRORATE COMMON AREA
        // Only update ocupiable dept. rooms
        // See SPSUP.ABS for definition of sql view: alrmc

        sql = "UPDATE rm SET" + " area_comn_ocup = "
                + "(SELECT ${sql.isNull('(flcomocup + blcomocup + stcomocup)',0.0)}"
                + " FROM alrmc" + " WHERE alrmc.rm_id = rm.rm_id" + " AND alrmc.fl_id = rm.fl_id"
                + " AND alrmc.bl_id = rm.bl_id)," + " area_comn_nocup = "
                + "(SELECT ${sql.isNull('(flcomnocup + blcomnocup + stcomnocup)',0.0)}"
                + " FROM alrmc" + " WHERE alrmc.rm_id = rm.rm_id" + " AND alrmc.fl_id = rm.fl_id"
                + " AND alrmc.bl_id = rm.bl_id)" + " WHERE rm.dp_id IS NOT NULL"
                + " AND EXISTS (SELECT 1 FROM rmcat" + " WHERE rm.rm_cat = rmcat.rm_cat"
                + " AND rmcat.occupiable = 1"
                + " AND rmcat.used_in_calcs IN ('all_totals', 'dp_comn_ocup_totals') )";
        SqlUtils.executeUpdate("rm", sql);

        // Calcuate TOTAL COMMON & CHARGEABLE area
        // Only update dept. rooms

        new FieldFormula("rm").setAssignedRestriction("rm.dp_id IS NOT NULL").addFormula(
            "rm.area_comn", "rm.area_comn_ocup + rm.area_comn_nocup").addFormula(
            "rm.area_chargable", "rm.area + rm.area_comn").calculate();

        // Calculate COST
        // Only update department rooms

        new FieldFormula("bl", "rm", "fl").setAssignedRestriction("rm.dp_id IS NOT NULL")
            .calculate(
                "rm.cost",
                "CASE " + "WHEN rm.cost_sqft <> 0 THEN rm.area_chargable * rm.cost_sqft "
                        + "WHEN fl.cost_sqft <> 0 THEN rm.area_chargable * fl.cost_sqft "
                        + "ELSE rm.area_chargable * bl.cost_sqft " + "END");

        new FieldFormula("rm").setStandard("rmcat").setAssignedRestriction(
            "rm.dp_id IS NOT NULL AND rm.rm_cat IS NOT NULL").calculate(
            "rm.cost",
            "CASE " + "WHEN rm.cost_sqft <> 0 THEN rm.area_chargable * rm.cost_sqft "
                    + "WHEN rmcat.cost_sqft <> 0 THEN rm.area_chargable * rmcat.cost_sqft "
                    + "ELSE rm.cost " + "END");

        // Sum COST, CHARGABLE area, COMMON area, and ROOM AREA, from RM to DP

        new FieldOperation("dp", "rm")
            .setAssignedRestriction(
                "EXISTS (SELECT 1 FROM rmcat WHERE rmcat.rm_cat = rm.rm_cat AND rmcat.used_in_calcs IN ('all_totals', 'dp_comn_ocup_totals') ) OR rm.rm_cat IS NULL")
            .addOperation("dp.cost", "SUM", "rm.cost").addOperation("dp.area_chargable", "SUM",
                "rm.area_chargable").addOperation("dp.area_rm", "SUM", "rm.area").addOperation(
                "dp.area_comn", "SUM", "rm.area_comn").addOperation("dp.area_comn_ocup", "SUM",
                "rm.area_comn_ocup")
            .addOperation("dp.area_comn_nocup", "SUM", "rm.area_comn_nocup").calculate();

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
    }
}
