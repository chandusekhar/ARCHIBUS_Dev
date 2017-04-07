package com.archibus.service.space;

import com.archibus.datasource.*;

/**
 * Property Area Calculations.
 * 
 * <p>
 * History:
 * <li>Web Central 17.3: Ported from proparea.abs.
 * <li>Web Central 19.2: KB 3029709 IOAN 01/05/2011 Exclude lease templates from calculation
 * 
 * @author Sergey Kuramshin
 */
public class PropertyAreaUpdate {

    public static void updateBuildingAndPropertyAreas() {
        // TODO:
        // not required for initial BRG implementation
        // runSpaceModCalculationsToUpdateBuildingAreas();

        updateBuildingAreasFromLeases();
        updatePropertyAreasFromBuildings();
        updatePropertyAreasFromLeases();
        updatePropertyAreasFromParcels();
        updatePropertyAreasFromRunOffAreas();
        updatePropertyAreasFromParking();
        updatePropertySuiteOccupancy();
    }

    private static void updateBuildingAreasFromLeases() {
        FieldOperation fo = new FieldOperation();
        fo.setOwner("bl");
        fo.setAssigned("ls");
        fo.setAssignedRestriction("ls.lease_sublease <> 'SUBLEASE' AND ls.use_as_template = 0");
        fo.calculate("bl.area_ls_negotiated", "SUM", "ls.area_negotiated");
    }

    private static void updatePropertyAreasFromBuildings() {
        FieldOperation fo = new FieldOperation();
        fo.setOwner("property");
        fo.setAssigned("bl");
        fo.addOperation("property.area_bl_gross_int", "SUM", "bl.area_gross_int");
        fo.addOperation("property.area_bl_rentable", "SUM", "bl.area_rentable");
        fo.addOperation("property.area_bl_usable", "SUM", "bl.area_usable");
        fo.addOperation("property.qty_headcount", "SUM", "bl.count_occup");
        fo.addOperation("property.qty_no_bldgs_calc", "COUNT", "*");
        fo.calculate();
    }

    private static void updatePropertyAreasFromLeases() {
        String fromLease = "FROM ls, bl WHERE ls.bl_id = bl.bl_id AND bl.pr_id = property.pr_id AND ls.lease_sublease <> 'SUBLEASE' AND ls.use_as_template = 0";

        String sql = "UPDATE property SET"
                + " area_lease_meas = (SELECT ${sql.isNull('SUM(ls.area_rentable)', 0)} "
                + fromLease + "),"
                + " area_lease_neg = (SELECT ${sql.isNull('SUM(ls.area_negotiated)', 0)} "
                + fromLease + ")";

        SqlUtils.executeUpdate("property", sql);
    }

    private static void updatePropertyAreasFromParcels() {
        FieldOperation fo = new FieldOperation();
        fo.setOwner("property");
        fo.setAssigned("parcel");
        fo.calculate("property.area_parcel", "SUM", "parcel.area_cad");
    }

    private static void updatePropertyAreasFromRunOffAreas() {
        FieldOperation fo = new FieldOperation();
        fo.setOwner("property");
        fo.setAssigned("runoffarea");
        fo.setStandard("runofftype");
        fo.setAssignedRestriction("runofftype.permiability = 'NON-PERMEABLE'");
        fo.calculate("property.area_non_permeable", "SUM", "runoffarea.area_cad");

        fo.setAssignedRestriction("runofftype.permiability <> 'NON-PERMEABLE'");
        fo.calculate("property.area_total_permeable", "SUM", "runoffarea.area_cad");

        fo.setAssignedRestriction("runofftype.runoff_class = 'PARKING'");
        fo.calculate("property.area_parking_total", "SUM", "runoffarea.area_cad");
    }

    private static void updatePropertyAreasFromParking() {
        FieldOperation fo = new FieldOperation();
        fo.setOwner("property");
        fo.setAssigned("parking");
        fo.calculate("property.qty_no_spaces_calc", "COUNT", "*");
    }

    private static void updatePropertySuiteOccupancy() {
        String fromSuite = "FROM su, bl WHERE su.bl_id = bl.bl_id AND bl.pr_id = property.pr_id";

        String sql = "UPDATE property SET"
                + " qty_su_occupancy = (SELECT ${sql.isNull('SUM(su.occupancy)', 0)} " + fromSuite
                + ")";

        SqlUtils.executeUpdate("property", sql);
    }
}
