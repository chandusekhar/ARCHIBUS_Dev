package com.archibus.eventhandler.eam.telecom;

import java.util.List;

import org.json.*;

import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.utility.StringUtil;

/**
 *
 * Version 22.1 Enterprise Asset Management - Telecom Create Ports. Provide methods from creating
 * ports for faceplates, panels and equipment.
 * <p>
 * Invoked by web central.
 *
 * @author Constantine Kriezis
 * @since 22.1
 *
 */

@SuppressWarnings({ "PMD.AvoidUsingSql" })
public class TelecomCreatePorts {

    /**
     * Constant.
     */
    private static final String COMMA = ",";

    /**
     * Constant.
     */
    private static final String DOT = ".";

    /**
     * Constant.
     */
    private static final String RIGHT_BRACKET = ")";

    /**
     * Constant.
     */
    private static final String COUNT = "count";

    /**
     * Constant.
     */
    private static final String CODE = "code";

    /**
     * Constant.
     */
    private static final String DIGITS = "d";

    /**
     * Constant.
     */
    private static final String PAD_DIGIT = "%0";

    /**
     * Constant.
     */
    private static final String FP_TABLE = "fp";

    /**
     * Constant.
     */
    private static final String JK_TABLE = "jk";

    /**
     * Constant.
     */
    private static final String PN_TABLE = "pn";

    /**
     * Constant.
     */
    private static final String EQ_TABLE = "eq";

    /**
     * Constant.
     */
    private static final String PNPORT_TABLE = "pnport";

    /**
     * Constant.
     */
    private static final String EQPORT_TABLE = "eqport";

    /**
     * Constant.
     */
    private static final String JKCFG_TABLE = "jkcfg";

    /**
     * Constant.
     */
    private static final String PORTCFG_TABLE = "portcfg";

    /**
     * Constant.
     */
    private static final String FP_ID = "fp_id";

    /**
     * Constant.
     */
    private static final String FP_STD = "fp_std";

    /**
     * Constant.
     */
    private static final String JK_STD = "jk_std";

    /**
     * Constant.
     */
    private static final String PN_ID = "pn_id";

    /**
     * Constant.
     */
    private static final String EQ_ID = "eq_id";

    /**
     * Constant.
     */
    private static final String EQ_STD = "eq_std";

    /**
     * Constant.
     */
    private static final String PN_STD = "pn_std";

    /**
     * Constant.
     */
    private static final String PORT_STD = "port_std";

    /**
     * Constant.
     */
    private static final String NUM_PORTS = "num_ports";

    /**
     * Constant.
     */
    private static final String PREFIX = "prefix";

    /**
     * Constant.
     */
    private static final String START_NUMBER = "start_number";

    /**
     * Array of fields for fp table.
     */
    private static final String[] FP_FIELDS = { FP_ID, FP_STD };

    /**
     * Array of fields for pn table.
     */
    private static final String[] PN_FIELDS = { PN_ID, PN_STD };

    /**
     * Array of fields for eq table.
     */
    private static final String[] EQ_FIELDS = { EQ_ID, EQ_STD };

    /**
     * Array of fields for jkcfg table.
     */
    private static final String[] JKCFG_FIELDS =
            { FP_STD, JK_STD, PREFIX, START_NUMBER, NUM_PORTS };

    /**
     * Array of fields for portcfg table.
     */
    private static final String[] PORTCFG_FIELDS =
            { EQ_STD, PN_STD, PORT_STD, PREFIX, START_NUMBER, NUM_PORTS };

    /**
     * Create jacks for faceplates.
     *
     * @return JSONArray with count of jacks created
     */
    public JSONArray createJacksForFaceplates() {
        final JSONArray jsonArray = new JSONArray();
        final DataSource datasource =
                DataSourceFactory.createDataSourceForFields(FP_TABLE, FP_FIELDS);

        // Get all faceplates that have no jacks and have a jack configuration based on their
        // standard
        final String sqlRestriction = " NOT EXISTS (SELECT 1 FROM jk WHERE jk.fp_id=fp.fp_id)"
                + " AND EXISTS (SELECT 1 FROM jkcfg WHERE jkcfg.fp_std=fp.fp_std)";

        datasource.addRestriction(Restrictions.sql(sqlRestriction));

        final List<DataRecord> records = datasource.getRecords();

        for (final DataRecord record : records) {
            final String fpId = record.getString(FP_TABLE + DOT + FP_ID);
            final String fpStd = record.getString(FP_TABLE + DOT + FP_STD);
            final int countCreatedJacks = createJacks(fpId, fpStd);
            final JSONObject jsonObject = new JSONObject();
            jsonObject.put(CODE, fpId);
            jsonObject.put(COUNT, countCreatedJacks);
            jsonArray.put(jsonObject);
        }
        return jsonArray;
    }

    /**
     * Create ports for panels.
     *
     * @return JSONArray with count of ports created
     */
    public JSONArray createPortsForPanels() {
        final JSONArray jsonArray = new JSONArray();
        final DataSource datasource =
                DataSourceFactory.createDataSourceForFields(PN_TABLE, PN_FIELDS);

        // Get all panels that have no ports and have a port configuration based on their
        // standard
        final String sqlRestriction =
                " NOT EXISTS (SELECT 1 FROM pnport WHERE pnport.pn_id=pn.pn_id)"
                        + " AND EXISTS (SELECT 1 FROM portcfg WHERE portcfg.pn_std=pn.pn_std)";

        datasource.addRestriction(Restrictions.sql(sqlRestriction));

        final List<DataRecord> records = datasource.getRecords();

        for (final DataRecord record : records) {
            final String pnId = record.getString(PN_TABLE + DOT + PN_ID);
            final String pnStd = record.getString(PN_TABLE + DOT + PN_STD);
            final int countPanelPorts = createPanelPorts(pnId, pnStd);
            final JSONObject jsonObject = new JSONObject();
            jsonObject.put(CODE, pnId);
            jsonObject.put(COUNT, countPanelPorts);
            jsonArray.put(jsonObject);
        }
        return jsonArray;
    }

    /**
     *
     * Create ports for equipment.
     *
     * @return JSONArray with count of ports created
     */
    public JSONArray createPortsForEquipment() {
        final JSONArray jsonArray = new JSONArray();
        final DataSource datasource =
                DataSourceFactory.createDataSourceForFields(EQ_TABLE, EQ_FIELDS);

        // Get all equipment that have no ports and have a port configuration based on their
        // standard
        final String sqlRestriction =
                " NOT EXISTS (SELECT 1 FROM eqport WHERE eqport.eq_id=eq.eq_id)"
                        + " AND EXISTS (SELECT 1 FROM portcfg WHERE portcfg.eq_std=eq.eq_std)";

        datasource.addRestriction(Restrictions.sql(sqlRestriction));

        final List<DataRecord> records = datasource.getRecords();

        for (final DataRecord record : records) {
            final String eqId = record.getString(EQ_TABLE + DOT + EQ_ID);
            final String eqStd = record.getString(EQ_TABLE + DOT + EQ_STD);

            final int countEqPorts = createEquipmentPorts(eqId, eqStd);
            final JSONObject jsonObject = new JSONObject();
            jsonObject.put(CODE, eqId);
            jsonObject.put(COUNT, countEqPorts);
            jsonArray.put(jsonObject);
        }
        return jsonArray;
    }

    /**
     * createJacks - Create jacks given a fp_id and a fp_std.
     *
     * @param fpId Faceplate Code
     * @param fpStd Faceplate Standard
     * @return no of created jacks
     */
    private int createJacks(final String fpId, final String fpStd) {
        final DataSource datasource =
                DataSourceFactory.createDataSourceForFields(JKCFG_TABLE, JKCFG_FIELDS);

        // Get jack configuration
        final String sqlRestriction = " fp_std = '" + fpStd + "'  ";
        datasource.addRestriction(Restrictions.sql(sqlRestriction));

        final List<DataRecord> records = datasource.getRecords();
        int countCreatedJacks = 0;
        for (final DataRecord record : records) {

            final String jkStd = StringUtil.notNull(record.getString(JKCFG_TABLE + DOT + JK_STD));
            final String prefix = StringUtil.notNull(record.getString(JKCFG_TABLE + DOT + PREFIX));
            final int startNumber = record.getInt(JKCFG_TABLE + DOT + START_NUMBER);
            final int numPorts = record.getInt(JKCFG_TABLE + DOT + NUM_PORTS);

            final int lastNumber = startNumber + (numPorts - 1);
            final int maxDigits = String.valueOf(lastNumber).length();

            // INSERT one or multiple jacks
            if ((startNumber >= 0) && (numPorts >= 1)) {
                String newJkId;
                for (int jkNumber = startNumber; jkNumber <= lastNumber; jkNumber++) {
                    if (maxDigits == 1) {
                        newJkId = fpId + prefix + jkNumber;
                    } else {
                        newJkId = fpId + prefix
                                + String.format(PAD_DIGIT + maxDigits + DIGITS, jkNumber);
                    }
                    insertJack(newJkId, jkStd, fpId);
                    countCreatedJacks++;
                }
            }
        }
        return countCreatedJacks;
    }

    /**
     * createPanelPorts - Create panel ports given a pn_id and a pn_std.
     *
     * @param pnId Panel Code
     * @param pnStd Panel Standard
     * @return no of created ports
     */
    private int createPanelPorts(final String pnId, final String pnStd) {
        final DataSource datasource =
                DataSourceFactory.createDataSourceForFields(PORTCFG_TABLE, PORTCFG_FIELDS);

        // Get panel port configuration
        final String sqlRestriction = " pn_std = " + SqlUtils.formatValueForSql(pnStd);
        datasource.addRestriction(Restrictions.sql(sqlRestriction));

        final List<DataRecord> records = datasource.getRecords();
        int countCreatedPorts = 0;
        for (final DataRecord record : records) {

            final String portStd = record.getString(PORTCFG_TABLE + DOT + PORT_STD);
            final String prefix =
                    StringUtil.notNull(record.getString(PORTCFG_TABLE + DOT + PREFIX));
            final int startNumber = record.getInt(PORTCFG_TABLE + DOT + START_NUMBER);
            final int numPorts = record.getInt(PORTCFG_TABLE + DOT + NUM_PORTS);

            final int lastNumber = startNumber + (numPorts - 1);
            final int maxDigits = String.valueOf(lastNumber).length();

            // INSERT one or multiple panel ports
            if ((startNumber >= 0) && (numPorts >= 1)) {
                String newPanelPortId;

                for (int newPortNumber =
                        startNumber; newPortNumber <= lastNumber; newPortNumber++) {
                    if (maxDigits == 1) {
                        newPanelPortId = prefix + newPortNumber;
                    } else {
                        newPanelPortId = prefix
                                + String.format(PAD_DIGIT + maxDigits + DIGITS, newPortNumber);
                    }
                    insertPanelPort(newPanelPortId, portStd, pnId);
                    countCreatedPorts++;
                }
            }
        }
        return countCreatedPorts;
    }

    /**
     *
     * createEquipmentPorts - Create equipment ports given an eq_id and an eq_std.
     *
     * @param eqId Equipment Code
     * @param eqStd Equipment Standard
     * @return no of created ports
     */
    private int createEquipmentPorts(final String eqId, final String eqStd) {
        final DataSource datasource =
                DataSourceFactory.createDataSourceForFields(PORTCFG_TABLE, PORTCFG_FIELDS);

        // Get equipment port configuration
        final String sqlRestriction = " eq_std = " + SqlUtils.formatValueForSql(eqStd);
        datasource.addRestriction(Restrictions.sql(sqlRestriction));
        final List<DataRecord> records = datasource.getRecords();
        int countCreatedPorts = 0;
        for (final DataRecord record : records) {

            final String portStd = record.getString(PORTCFG_TABLE + DOT + PORT_STD);
            final String prefix =
                    StringUtil.notNull(record.getString(PORTCFG_TABLE + DOT + PREFIX));
            final int startNumber = record.getInt(PORTCFG_TABLE + DOT + START_NUMBER);
            final int numPorts = record.getInt(PORTCFG_TABLE + DOT + NUM_PORTS);

            final int lastNumber = startNumber + (numPorts - 1);
            final int maxDigits = String.valueOf(lastNumber).length();

            // INSERT a single or multiple ports
            if ((startNumber >= 0) && (numPorts >= 1)) {
                String newPortId;

                for (int newPortNumber =
                        startNumber; newPortNumber <= lastNumber; newPortNumber++) {
                    if (maxDigits == 1) {
                        newPortId = prefix + newPortNumber;
                    } else {
                        newPortId = prefix
                                + String.format(PAD_DIGIT + maxDigits + DIGITS, newPortNumber);
                    }
                    insertEquipmentPort(newPortId, portStd, eqId);
                    countCreatedPorts++;
                }
            }
        }
        return countCreatedPorts;
    }

    /**
     * insertJackRecord - Insert a jack.
     *
     * @param jkId Jack Code
     * @param jkStd Jack Standard
     * @param fpId Faceplate Standard
     */
    private void insertJack(final String jkId, final String jkStd, final String fpId) {
        final String sqlStatement =
                "INSERT INTO jk (jk_id,jk_std,fp_id,bl_id,fl_id,rm_id,em_id) SELECT '" + jkId + "',"
                        + SqlUtils.formatValueForSql(jkStd)
                        + ",fp_id,bl_id,fl_id,rm_id,em_id FROM fp WHERE fp_id="
                        + SqlUtils.formatValueForSql(fpId);
        SqlUtils.executeUpdate(JK_TABLE, sqlStatement);
    }

    /**
     * insertPanelPort - Insert a panel port.
     *
     * @param panelPortId Port Code
     * @param portStd Port Standard
     * @param pnId Panel Code
     */
    private void insertPanelPort(final String panelPortId, final String portStd,
            final String pnId) {
        String sqlStatement;
        if (portStd == null) {
            sqlStatement =
                    "INSERT INTO pnport (pn_id,port_id) VALUES (" + SqlUtils.formatValueForSql(pnId)
                            + COMMA + SqlUtils.formatValueForSql(panelPortId) + RIGHT_BRACKET;
        } else {
            sqlStatement = "INSERT INTO pnport (pn_id,port_id,port_std) VALUES ("
                    + SqlUtils.formatValueForSql(pnId) + COMMA
                    + SqlUtils.formatValueForSql(panelPortId) + COMMA
                    + SqlUtils.formatValueForSql(portStd) + RIGHT_BRACKET;
        }
        SqlUtils.executeUpdate(PNPORT_TABLE, sqlStatement);
    }

    /**
     * insertEquipmentPort - Insert an equipment port.
     *
     * @param portId Port Code
     * @param portStd Port Standard
     * @param eqId Equipment Code
     */
    private void insertEquipmentPort(final String portId, final String portStd, final String eqId) {
        String sqlStatement;
        if (portStd == null) {
            sqlStatement =
                    "INSERT INTO eqport (eq_id,port_id) VALUES (" + SqlUtils.formatValueForSql(eqId)
                            + COMMA + SqlUtils.formatValueForSql(portId) + RIGHT_BRACKET;
        } else {
            sqlStatement = "INSERT INTO eqport (eq_id,port_id,port_std) VALUES ("
                    + SqlUtils.formatValueForSql(eqId) + COMMA + SqlUtils.formatValueForSql(portId)
                    + COMMA + SqlUtils.formatValueForSql(portStd) + RIGHT_BRACKET;

        }
        SqlUtils.executeUpdate(EQPORT_TABLE, sqlStatement);
    }
}
