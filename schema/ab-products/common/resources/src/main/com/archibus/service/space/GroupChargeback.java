package com.archibus.service.space;

import com.archibus.datasource.*;

/**
 * Group Chargeback calculations.
 * 
 * <p>
 * History:
 * <li>Web Central 18.1: Initial implementation, ported from cicbgp.abs.
 * 
 * @author Sergey Kuramshin
 */
public class GroupChargeback {

    public static void performChargeback() {
        // Initialize certain group fields to 0

        new FieldFormula("gp").addFormula("gp.cost", "0.0").addFormula("gp.area_chargable", "0.0")
            .addFormula("gp.area_comn", "0.0").addFormula("gp.area_comn_gp", "0.0").addFormula(
                "gp.area_comn_serv", "0.0").calculate();

        // Sum TOTAL and DEPARTMENT area from GP to FL

        new FieldOperation("fl", "gp").setAssignedRestriction("gp.portfolio_scenario_id IS NULL")
            .calculate("fl.area_gp", "SUM", "gp.area");
        new FieldOperation("fl", "gp").setAssignedRestriction(
            "gp.dp_id IS NOT NULL AND gp.portfolio_scenario_id IS NULL").calculate("fl.area_gp_dp",
            "SUM", "gp.area");

        // Sum DEPARTMENT area from FL to BL

        new FieldOperation("bl", "fl").calculate("bl.area_gp_dp", "SUM", "fl.area_gp_dp");

        // Sum DEPARTMENT area from BL to SITE

        new FieldOperation("site", "bl").calculate("site.area_gp_dp", "SUM", "bl.area_gp_dp");
        
        //Begin: Changed for 20.1 Space WFR: 10.13 GroupChargeback.performChargeback (existing), by Liu XianChao.
        final String useRoomTransactions = Configuration.getActivityParameterString(
            "AbSpaceRoomInventoryBAR", "UseWorkspaceTransactions");
        String sql = "";
        if ("0".equals(useRoomTransactions)) {
            
            // Sum SERVICE FLOOR COMMON area from SERV to FL
            
            new FieldOperation("fl", "rm", "rmcat").setAssignedRestriction(
                "rmcat.supercat = 'SERV' AND rm.prorate = 'FLOOR'").calculate(
                "fl.area_fl_comn_serv", "SUM", "rm.area");
            
            // Sum SERVICE BLDG. COMMON area from SERV to BL
            
            new FieldOperation("bl", "rm", "rmcat").setAssignedRestriction(
                "rmcat.supercat = 'SERV' AND rm.prorate = 'BUILDING'").calculate(
                "bl.area_bl_comn_serv", "SUM", "rm.area");
            
            // Sum SERVICE SITE COMMON area from SERV to SITE
            
            sql = "UPDATE site SET area_st_comn_serv = (SELECT ${sql.isNull('SUM(rm.area)', 0.0)}"
                    + " FROM bl, rm, rmcat" + " WHERE site.site_id = bl.site_id"
                    + " AND bl.bl_id = rm.bl_id" + " AND rmcat.rm_cat = rm.rm_cat"
                    + " AND rmcat.supercat = 'SERV'" + " AND rm.prorate = 'SITE')";
            SqlUtils.executeUpdate("site", sql);
        } else {
            // Sum SERVICE FLOOR COMMON area from SERV to FL
            
            new FieldOperation("fl", "rmpct", "rmcat").setAssignedRestriction(
                "rmcat.supercat = 'SERV' AND rmpct.prorate = 'FLOOR'").calculate(
                "fl.area_fl_comn_serv", "SUM", "rmpct.area_rm");
            
            // Sum SERVICE BLDG. COMMON area from SERV to BL
            
            new FieldOperation("bl", "rmpct", "rmcat").setAssignedRestriction(
                "rmcat.supercat = 'SERV' AND rmpct.prorate = 'BUILDING'").calculate(
                "bl.area_bl_comn_serv", "SUM", "rmpct.area_rm");
            
            // Sum SERVICE SITE COMMON area from SERV to SITE
            
            sql = "UPDATE site SET area_st_comn_serv = (SELECT ${sql.isNull('SUM(rmpct.area_rm)', 0.0)}"
                    + " FROM bl, rmpct, rmcat"
                    + " WHERE site.site_id = bl.site_id"
                    + " AND bl.bl_id = rmpct.bl_id"
                    + " AND rmcat.rm_cat = rmpct.rm_cat"
                    + " AND rmcat.supercat = 'SERV'" + " AND rmpct.prorate = 'SITE')";
            SqlUtils.executeUpdate("site", sql);
            
        }
        //End: Changed for 20.1 Space WFR: 10.13 GroupChargeback.performChargeback (existing), by Liu XianChao.

        // Sum FLOOR COMMON area from GP to FL

        new FieldOperation("fl", "gp").setAssignedRestriction(
            "gp.prorate='FLOOR' AND gp.portfolio_scenario_id IS NULL").calculate(
            "fl.area_fl_comn_gp", "SUM", "gp.area");

        // Calculate FLOOR COMMON and REMAINING AREA

        new FieldFormula("fl").setAssignedRestriction("fl.prorate_remain = 'FLOOR'").calculate(
            "fl.area_fl_comn_gp", "fl.area_remain + fl.area_fl_comn_gp");

        // Sum BUILDING COMMON AREA from FL REMAINING AREA

        new FieldOperation("bl", "gp").setAssignedRestriction(
            "gp.prorate='BUILDING' AND gp.portfolio_scenario_id IS NULL").calculate(
            "bl.area_bl_comn_gp", "SUM", "gp.area");

        // Have to add in fl.area_remain in separate statement because of Oracle
        sql = "UPDATE bl SET area_bl_comn_gp = "
                + "(SELECT bl.area_bl_comn_gp + ${sql.isNull('SUM(fl.area_remain)', 0.0)}"
                + " FROM fl " + " WHERE bl.bl_id = fl.bl_id"
                + " AND fl.prorate_remain = 'BUILDING')";
        SqlUtils.executeUpdate("bl", sql);

        // Sum SITE COMMON area from GP to SITE

        sql = "UPDATE site SET area_st_comn_gp = " + "(SELECT ${sql.isNull('SUM(gp.area)', 0.0)}"
                + " FROM bl, gp" + " WHERE site.site_id = bl.site_id" + " AND bl.bl_id = gp.bl_id"
                + " AND gp.prorate = 'SITE'" + " AND gp.portfolio_scenario_id IS NULL)";
        SqlUtils.executeUpdate("site", sql);

        // Have to add in fl.area_remain in separate statement because of Oracle
        sql = "UPDATE site SET area_st_comn_gp = "
                + "(SELECT site.area_st_comn_gp + ${sql.isNull('SUM(fl.area_remain)', 0.0)}"
                + " FROM bl, fl" + " WHERE site.site_id = bl.site_id" + " AND bl.bl_id = fl.bl_id"
                + " AND fl.prorate_remain = 'SITE')";
        SqlUtils.executeUpdate("site", sql);

        // PRORATE COMMON AREA
        // Only update dept. groups
        // See SPSUP.ABS for definition of sql view: gpc

        sql = "UPDATE gp SET" + " gp.area_comn_gp ="
                + " (SELECT (gpc.flcomgp + gpc.blcomgp + gpc.stcomgp)"
                + " FROM gpc WHERE gpc.gp_id = gp.gp_id)," + " gp.area_comn_serv ="
                + " (SELECT (gpc.flcomsrv + gpc.blcomsrv +gpc.stcomsrv)"
                + " FROM gpc WHERE gpc.gp_id = gp.gp_id)"
                + " WHERE gp.dp_id IS NOT NULL AND gp.portfolio_scenario_id IS NULL";
        SqlUtils.executeUpdate("gp", sql);

        // Calculate TOTAL COMMON & CHARGEABLE area
        // Only update dept. groups

        new FieldFormula("gp").setAssignedRestriction(
            "gp.dp_id IS NOT NULL AND gp.portfolio_scenario_id IS NULL").addFormula("gp.area_comn",
            "gp.area_comn_gp + gp.area_comn_serv").addFormula("gp.area_chargable",
            "gp.area + gp.area_comn").calculate();

        // Calculate COST
        // Only update department groups
        // Oracle has to be calculated differently due to its limitations

        /*****************************************************************************************
         * SERGEY - NOTE: the calcs below have a second case which uses a field formula for Sybase.
         * As in arcb.abs the Field Formula can probably be modified to use a CASE statement and
         * then that should work on all db servers. The non-Sybase calcs below can then be
         * eliminated.
         ******************************************************************************************/

        new FieldFormula("bl", "gp", "fl").setAssignedRestriction(
            "gp.dp_id IS NOT NULL AND gp.portfolio_scenario_id IS NULL").calculate(
            "gp.cost",
            "CASE" + " WHEN fl.cost_sqft <> 0 THEN gp.area_chargable * fl.cost_sqft"
                    + " ELSE gp.area_chargable * bl.cost_sqft" + " END");

        // Sum GROUP AREAs from GP to DP

        new FieldOperation("dp", "gp").setAssignedRestriction("gp.portfolio_scenario_id IS NULL")
            .addOperation("dp.area_gp", "SUM", "gp.area").addOperation("dp.area_comn_gp", "SUM",
                "gp.area_comn_gp").addOperation("dp.area_comn_serv", "SUM", "gp.area_comn_serv")
            .calculate();

        // Sum COST, CHARGABLE area, and COMMON area from GP to DP. We must add to existing values
        // because some departments may already have costs, common, and chargeable ares summed from
        // rooms also.
        boolean includeGroupsInUnifiedSpaceCalcs = Configuration.getActivityParameterBoolean(
            "AbCommonResources", Configuration.INCLUDE_GROUPS_IN_UNIFIED_SPACE_CALCS,
            Configuration.INCLUDE_GROUPS_IN_UNIFIED_SPACE_CALCS_DEFAULT);
        if (includeGroupsInUnifiedSpaceCalcs) {
            sql = "UPDATE dp SET "
                    + "dp.cost = dp.cost + "
                    + "( SELECT ${sql.isNull('SUM(gp.cost)', 0)} FROM gp"
                    + "  WHERE gp.dv_id = dp.dv_id AND gp.dp_id = dp.dp_id AND gp.portfolio_scenario_id IS NULL), "
                    + "dp.area_chargable = dp.area_chargable + "
                    + "( SELECT ${sql.isNull('SUM(gp.area_chargable)', 0)} FROM gp"
                    + "  WHERE gp.dv_id = dp.dv_id AND gp.dp_id = dp.dp_id AND gp.portfolio_scenario_id IS NULL), "
                    + "dp.area_comn = dp.area_comn + "
                    + "( SELECT ${sql.isNull('SUM(gp.area_comn)', 0)} FROM gp"
                    + "  WHERE gp.dv_id = dp.dv_id AND gp.dp_id = dp.dp_id AND gp.portfolio_scenario_id IS NULL)";
        }
        SqlUtils.executeUpdate("dp", sql);

        // Sum COST, CHARGABLE area, COMMON area, and GROUP AREA, from DP to DV

        new FieldOperation("dv", "dp").addOperation("dv.cost", "SUM", "dp.cost").addOperation(
            "dv.area_chargable", "SUM", "dp.area_chargable").addOperation("dv.area_gp", "SUM",
            "dp.area_gp").addOperation("dv.area_comn", "SUM", "dp.area_comn").addOperation(
            "dv.area_comn_gp", "SUM", "dp.area_comn_gp").addOperation("dv.area_comn_serv", "SUM",
            "dp.area_comn_serv").calculate();

        // Sum COST, CHARGABLE area, COMMON area, and GROUP AREA, from DV to BU

        new FieldOperation("bu", "dv").addOperation("bu.cost", "SUM", "dv.cost").addOperation(
            "bu.area_chargable", "SUM", "dv.area_chargable").addOperation("bu.area_gp", "SUM",
            "dv.area_gp").addOperation("bu.area_comn", "SUM", "dv.area_comn").addOperation(
            "bu.area_comn_gp", "SUM", "dv.area_comn_gp").addOperation("bu.area_comn_serv", "SUM",
            "dv.area_comn_serv").calculate();
    }
}
