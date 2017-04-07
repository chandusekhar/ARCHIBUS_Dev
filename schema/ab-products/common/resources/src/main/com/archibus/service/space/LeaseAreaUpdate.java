package com.archibus.service.space;

import java.util.List;

import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;

/**
 * Lease Area Calculations.
 *
 * <p>
 * Calculates the measured lease areas (ls.area_usable and ls.area_rentable).
 *
 * <p>
 * Calculations are based on the Lease Area method specified in the Schema Preferences table
 * (afm_scmpref). Lease Area Methods are: Suite, Group, Room - Composite, and Room - All Room. If
 * measured areas are being used then one and only one of the above methods must be used to assign
 * physical floor areas to particular leases. Lease Negotiated areas can always be used to manually
 * enter negotiated lease area.
 *
 * <p>
 * ls.area_usable is calculated by summing the areas for those Suite, Groups, or rooms (depending on
 * the Lease Area method) assigned to a lease.
 *
 * <p>
 * To obtain the ls.area_rentable we automatically run the Space Module chargeback (proration)
 * calculations to prorate the common areas to Suites, Groups, or Rooms prior to summing the
 * chargeable areas to lease rentable. The chargeback calculation used also depend on the Lease Area
 * method. There are six chargeback methods:
 * <li>Suite
 * <li>Group - Group
 * <li>Group - Boma
 * <li>Group - Enhanced Boma
 * <li>Room - Composite
 * <li>Room - All Room
 *
 * <p>
 * If you are using the Group Lease Area Method then the chargeback calculations executed will
 * depend on the value entered in the Schema Preferences Table for: Group Area Prorate Method.
 *
 * <p>
 * The Suite chargeback method sums Suite usable areas to Floors, Buildings, and Sites and then
 * prorates Service common areas to suites.
 * <p>
 * The Group chargeback methods prorate Service and Group common areas to Groups. (see Space On-line
 * Help for details and differences between the Group, BOMA, and Enhanced BOMA methods.)
 * <p>
 * The Room - Composite chargeback method prorates Service and common area Rooms to Rooms. (see
 * Space On-line Help for details.)
 * <p>
 * The Room - All Room chargeback method prorates common area Rooms to Rooms which have an
 * occupiable room category. (see Space On-line Help for details.)
 *
 * <p>
 * Once the chargeble areas are determined for Suites, Groups, or Rooms they are then summed up to
 * the Lease rentable area.
 *
 * <p>
 * History:
 * <li>Web Central 17.3: Initial implementation, only supports the Room - All Room chargeback
 * method. Ported from lsarea.abs.
 * <li>Web Central 19.2: KB 3029709 IOAN 01/05/2011 Exclude lease templates from calculation
 *
 * @author Sergey Kuramshin
 */
public class LeaseAreaUpdate {

    // ----------------------- constants ---------------------------------------

    public static final String LEASE_AREA_METHOD_ROOM_SUITE = "su";

    public static final String LEASE_AREA_METHOD_ROOM_GROUP = "gp";

    public static final String LEASE_AREA_METHOD_ROOM_COMPOSITE = "cr";

    public static final String LEASE_AREA_METHOD_ROOM_ALLROOM = "ar";

    public static final String LEASE_PRORATION_METHOD_GENERAL = "G";

    public static final String LEASE_PRORATION_METHOD_BOMA = "B";

    public static final String LEASE_PRORATION_METHOD_BOMA_ENHANCED = "E";

    public static final String LEASE_PRORATION_METHOD_BOMA_96 = "9";

    // ----------------------- business methods --------------------------------

    public static String getLeaseAreaMethod() {
        final DataRecord record = getLeasePreferences();
        return record.getString("afm_scmpref.lease_area_type");
    }

    public static String getLeaseProrationMethod() {
        final DataRecord record = getLeasePreferences();
        return record.getString("afm_scmpref.lease_proration_method");
    }

    public static String getLeaseAreaTable() {
        String leaseAreaTable = "rm";
        final String leaseAreaMethod = getLeaseAreaMethod();
        if (leaseAreaMethod.equalsIgnoreCase(LEASE_AREA_METHOD_ROOM_SUITE)) {
            leaseAreaTable = "su";

        } else if (leaseAreaMethod.equalsIgnoreCase(LEASE_AREA_METHOD_ROOM_GROUP)) {
            leaseAreaTable = "gp";
        }
        return leaseAreaTable;
    }

    /**
     * <ul>
     * <li>1) Update Space Areas (Sites, Bldgs, Floors)
     * <li>2) Chargeback common areas to Suites, Groups, or Rooms
     * <li>3) Calculate ls.area_usable and ls.area_rentable
     */
    public static void updateLeaseAreas() {
        final String leaseAreaMethod = getLeaseAreaMethod();

        if (leaseAreaMethod.equalsIgnoreCase(LEASE_AREA_METHOD_ROOM_ALLROOM)) {
            setSuitLeaseAreaForRooms();
        }

        AllRoomAreaUpdate.calculateGros();
        AllRoomAreaUpdate.calculateOccupiable();
        AllRoomAreaUpdate.calculateNonoccupiable();

        if (leaseAreaMethod.equalsIgnoreCase(LEASE_AREA_METHOD_ROOM_SUITE)) {
            runSuiteAreaChargeback();

        } else { // LEASE_AREA_METHOD_ROOM_ALLROOM
            AllRoomAreaUpdate.calculateGroups();
            AllRoomChargeback.performChargeback();
        }

        calculateLeaseAreas(leaseAreaMethod);
    }

    // ----------------------- implementation ----------------------------------

    /**
     * Calculate ls.area_usable, ls.area_rentable, ls.qty_suite_occupancy once Area rollup and
     * chargeback has been run
     */
    private static void calculateLeaseAreas(final String leaseAreaMethod) {
        String areaTable;
        String areaUsableField;
        String areaRentableField;

        if (leaseAreaMethod.equalsIgnoreCase(LEASE_AREA_METHOD_ROOM_SUITE)) {
            areaTable = "su";
            areaUsableField = "area_usable";
            areaRentableField = "area_rentable";

        } else if (leaseAreaMethod.equalsIgnoreCase(LEASE_AREA_METHOD_ROOM_GROUP)) {
            areaTable = "gp";
            areaUsableField = "area";
            areaRentableField = "area_chargable";

        } else { // LEASE_AREA_METHOD_ROOM_ALLROOM or LEASE_AREA_METHOD_ROOM_COMPOSITE
            areaTable = "rm";
            areaUsableField = "area";
            areaRentableField = "area_chargable";
        }

        FieldOperation fo = new FieldOperation();
        fo.setOwner("ls");
        fo.setAssigned(areaTable);
        fo.setOwnerRestriction("ls.use_as_template = 0");
        fo.addOperation("ls.area_usable", "SUM", areaTable + "." + areaUsableField);
        fo.addOperation("ls.area_rentable", "SUM", areaTable + "." + areaRentableField);
        fo.addOperation("ls.area_common", "SUM", areaTable + ".area_comn");
        fo.calculate();

        fo = new FieldOperation();
        fo.setOwner("ls");
        fo.setAssigned("su");
        fo.setOwnerRestriction("ls.use_as_template = 0");
        fo.calculate("ls.qty_suite_occupancy", "SUM", "su.occupancy");
    }

    private static void runSuiteAreaChargeback() {
        // the next 3 calculations are EXACTLY the same as in GroupChargeback.java:

        // Sum SERVICE FLOOR COMMON area from SERV to FL

        new FieldOperation("fl", "rm", "rmcat")
            .setAssignedRestriction("rmcat.supercat = 'SERV' AND rm.prorate = 'FLOOR'")
            .calculate("fl.area_fl_comn_serv", "SUM", "rm.area");

        // Sum SERVICE BLDG. COMMON area from SERV to BL

        new FieldOperation("bl", "rm", "rmcat")
            .setAssignedRestriction("rmcat.supercat = 'SERV' AND rm.prorate = 'BUILDING'")
            .calculate("bl.area_bl_comn_serv", "SUM", "rm.area");

        // Sum SERVICE SITE COMMON area from SERV to SITE

        String sql =
                "UPDATE site SET area_st_comn_serv = (SELECT ${sql.isNull('SUM(rm.area)', 0.0)}"
                        + " FROM bl, rm, rmcat" + " WHERE site.site_id = bl.site_id"
                        + " AND bl.bl_id = rm.bl_id" + " AND rmcat.rm_cat = rm.rm_cat"
                        + " AND rmcat.supercat = 'SERV'" + " AND rm.prorate = 'SITE')";
        SqlUtils.executeUpdate("site", sql);

        new FieldOperation("fl", "su").calculate("fl.area_su", "SUM", "su.area_usable");

        new FieldOperation("bl", "fl").calculate("bl.area_su", "SUM", "fl.area_su");

        new FieldOperation("site", "bl").calculate("site.area_su", "SUM", "bl.area_su");

        sql = "UPDATE su SET area_comn =" + " ( SELECT ${sql.isNull"
                + "('fl.area_fl_comn_serv * su.area_usable / ("
                + SqlUtils.formatSqlReplace0WithHuge("fl.area_su") + ")', 0.0)}" + " + ${sql.isNull"
                + "('bl.area_bl_comn_serv * su.area_usable / ("
                + SqlUtils.formatSqlReplace0WithHuge("bl.area_su") + ")', 0.0)}" + " + ${sql.isNull"
                + "('site.area_st_comn_serv * su.area_usable / ("
                + SqlUtils.formatSqlReplace0WithHuge("site.area_su") + ")', 0.0)}";

        if (SqlUtils.isOracle()) {
            sql = sql + " FROM fl, bl, site";
        } else if (SqlUtils.isSybase()) {
            sql = sql + " FROM fl, bl KEY LEFT OUTER JOIN site";
        } else {
            sql = sql + " FROM fl, bl LEFT OUTER JOIN site ON site.site_id = bl.site_id";
        }

        sql = sql + " WHERE fl.bl_id = su.bl_id" + " AND fl.fl_id =su.fl_id"
                + " AND bl.bl_id = su.bl_id";

        if (SqlUtils.isOracle()) {
            sql = sql + " AND site.site_id (+) = bl.site_id)";
        } else {
            sql = sql + ")";
        }

        SqlUtils.executeUpdate("su", sql);

        sql = "UPDATE su SET area_rentable = ${sql.isNull('area_usable + area_comn', 0.0)}";
        SqlUtils.executeUpdate("su", sql);
    }

    /**
     *
     * Set suit lease area for rooms.
     */
    private static void setSuitLeaseAreaForRooms() {
        DataSource dataSource = DataSourceFactory.createDataSource().addTable("su");
        // 1. remove all records from su where name='AUTO-GEN'
        final String sql = "DELETE FROM su WHERE name='AUTO-GEN'";
        dataSource.addQuery(sql);
        dataSource.executeUpdate();

        // 2. create auto generated suite lease area for room leases
        dataSource = DataSourceFactory.createDataSource().addTable("rm");
        dataSource.addField("bl_id");
        dataSource.addField("fl_id");
        dataSource.addField("ls_id");
        dataSource.addRestriction(Restrictions.sql(
            "rm.ls_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM su WHERE su.bl_id = rm.bl_id AND su.fl_id = rm.fl_id AND su.ls_id = rm.ls_id)"));
        dataSource.setDistinct(true);
        final List<DataRecord> records = dataSource.getAllRecords();
        for (final DataRecord record : records) {
            final String blId = record.getString("rm.bl_id");
            final String flId = record.getString("rm.fl_id");
            final String lsId = record.getString("rm.ls_id");
            createAutoGeneratedSuitLeaseArea(blId, flId, lsId);
        }
    }

    /**
     *
     * Create auto generated suit lease area.
     *
     * @param blId Building id
     * @param flId Floor id
     * @param lsId Lease id
     */
    private static void createAutoGeneratedSuitLeaseArea(final String blId, final String flId,
            final String lsId) {
        final DataSource dataSource =
                DataSourceFactory.createDataSourceForFields("su", new String[] { "bl_id", "fl_id",
                        "su_id", "ls_id", "name", "occupancy", "area_manual" });
        dataSource.addRestriction(Restrictions.and(Restrictions.eq("su", "bl_id", blId),
            Restrictions.eq("su", "fl_id", flId)));
        dataSource.addSort("su", "su_id", DataSource.SORT_DESC);
        final List<DataRecord> suiteRecords = dataSource.getRecords();
        final String suCode = generateSuiteId(suiteRecords);

        final DataRecord autoGeneratedSuite = dataSource.createNewRecord();
        String query =
                "SELECT (SELECT COUNT(*) FROM em WHERE em.bl_id = rm.bl_id AND em.fl_id = rm.fl_id AND em.rm_id IN (SELECT rm_id FROM rm rm_inner WHERE rm_inner.bl_id = rm.bl_id AND rm_inner.fl_id = rm.fl_id AND rm_inner.ls_id = rm.ls_id )) ${sql.as} occupancy,";
        query += " SUM(rm.area) ${sql.as} area_manual ";
        query += " FROM rm ";
        query += " WHERE bl_id='" + blId + "' AND fl_id='" + flId + "' AND ls_id='" + lsId + "' ";
        query += " GROUP BY bl_id,fl_id,ls_id";
        query += " ORDER BY bl_id,fl_id,ls_id";

        final DataRecord record = DataSourceFactory.createDataSource().addTable("rm")
            .addVirtualField("rm", "occupancy", DataSource.DATA_TYPE_INTEGER)
            .addVirtualField("rm", "area_manual", DataSource.DATA_TYPE_DOUBLE).addQuery(query)
            .getRecord();

        final double areaManual = record.getDouble("rm.area_manual");
        final int occupancy = record.getInt("rm.occupancy");
        autoGeneratedSuite.setValue("su.bl_id", blId);
        autoGeneratedSuite.setValue("su.fl_id", flId);
        autoGeneratedSuite.setValue("su.su_id", suCode);
        autoGeneratedSuite.setValue("su.ls_id", lsId);
        autoGeneratedSuite.setValue("su.name", "AUTO-GEN");
        autoGeneratedSuite.setValue("su.occupancy", occupancy);
        autoGeneratedSuite.setValue("su.area_manual", areaManual);
        dataSource.saveRecord(autoGeneratedSuite);
    }

    /**
     *
     * Generate suite id based on existing suite records. If suite exists, get the next suite
     * incremented by 1. If not suite exists, default is 001.
     *
     * @param suiteRecords
     * @return generated suite id
     */
    private static String generateSuiteId(final List<DataRecord> suiteRecords) {
        String suId = "000";
        if (suiteRecords.isEmpty()) {
            suId = "001";
        } else {
            String code = suId;
            for (final DataRecord suiteRecord : suiteRecords) {
                String tmpCode = suiteRecord.getString("su.su_id");
                tmpCode = tmpCode.replaceAll("\\D+", "");
                if (tmpCode.length() == 0) {
                    tmpCode = "000";
                }
                if (Integer.parseInt(tmpCode) > Integer.valueOf(code)) {
                    code = tmpCode;
                }
            }
            code = String.valueOf(Integer.parseInt(code) + 1);
            if (code.length() == 1) {
                code = "00" + code;
            } else if (code.length() == 2) {
                code = "0" + code;
            }
            suId = code;
        }
        return suId;
    }

    /**
     * Returns data record containing lease calculation preferences.
     *
     * @return
     */
    private static DataRecord getLeasePreferences() {
        final String tableName = "afm_scmpref";
        final String[] fieldNames = { "lease_area_type", "lease_proration_method" };
        final DataSource ds = DataSourceFactory.createDataSourceForFields(tableName, fieldNames);
        return ds.getRecord();
    }
}
