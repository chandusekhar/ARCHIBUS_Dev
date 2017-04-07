package com.archibus.eventhandler.eam.telecom;

import java.util.*;

import org.json.JSONObject;

import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.utility.StringUtil;

/**
 *
 * Version 22.1 Enterprise Asset Management - Telecom Service Helper.
 * <p>
 * Common methods used by Telecom Service.
 *
 * @author Radu Bunea
 * @since 22.1
 */
final class TelecomHelper {
    /**
     * Hide default constructor.
     */
    private TelecomHelper() {
    }

    /**
     *
     * Get toward the server connection.
     *
     * @param assetType asset type
     * @param assetId asset id
     * @param assetPort asset port
     * @return JSONObject {conn_asset_type:
     *         conn_asset_type,conn_asset_code:conn_asset_code,conn_asset_port:conn_asset_port }
     */
    static JSONObject getTowardServerConnection(final String assetType, final String assetId,
            final String assetPort) {
        String connectAsset = assetType;
        final String restriction = createRestriction(assetType, assetId, assetPort);
        final DataRecord record = getTowardServerConnectionRecord(assetType, restriction);

        if (Constants.FP_TYPE.equals(assetType)) {
            connectAsset = Constants.JK_TYPE;
        }

        JSONObject connection = null;
        if (record != null) {
            final String connectedToAsset = (String) record
                .getValue(connectAsset + Constants.DOT + Constants.CONNECT_ASSET_TYPE);
            final String connectedToAssetId = (String) record
                .getValue(connectAsset + Constants.DOT + Constants.CONNECT_ASSET_CODE);
            final String connectedToAssetPort = (String) record
                .getValue(connectAsset + Constants.DOT + Constants.CONNECT_ASSET_PORT);
            if (StringUtil.notNullOrEmpty(connectedToAsset)) {
                connection = new JSONObject();
                connection.put(Constants.CONNECT_ASSET_TYPE, connectedToAsset);
                connection.put(Constants.CONNECT_ASSET_CODE, connectedToAssetId);
                connection.put(Constants.CONNECT_ASSET_PORT, connectedToAssetPort);
            }
        }
        return connection;
    }

    /**
     *
     * Get toward the client connection.
     *
     * @param assetType asset type
     * @param assetId asset id
     * @param assetPort asset port
     * @return JSONObject {conn_asset_type:
     *         conn_asset_type,conn_asset_code:conn_asset_code,conn_asset_port:conn_asset_port }
     */
    static JSONObject getTowardClientConnection(final String assetType, final String assetId,
            final String assetPort) {
        String connectAsset = assetType;
        if (Constants.FP_TYPE.equals(assetType)) {
            connectAsset = Constants.JK_TYPE;
        }
        final DataRecord record = getTowardClientConnectionRecord(assetType, assetId, assetPort);

        JSONObject connection = null;
        if (record != null) {
            final String connectedFromAssetType = (String) record
                .getValue(connectAsset + Constants.DOT + Constants.CONNECT_ASSET_TYPE);
            final String connectedFromAssetCode = (String) record
                .getValue(connectAsset + Constants.DOT + Constants.CONNECT_ASSET_CODE);
            final String connectedFromAssetPort = (String) record
                .getValue(connectAsset + Constants.DOT + Constants.CONNECT_ASSET_PORT);
            if (StringUtil.notNullOrEmpty(connectedFromAssetType)) {
                connection = new JSONObject();
                connection.put(Constants.CONNECT_ASSET_TYPE, connectedFromAssetType);
                connection.put(Constants.CONNECT_ASSET_CODE, connectedFromAssetCode);
                connection.put(Constants.CONNECT_ASSET_PORT, connectedFromAssetPort);
            }
        }
        return connection;
    }

    /**
     *
     * Get toward the client connection data record.
     *
     * @param assetType asset type
     * @param assetId asset id
     * @param assetPort asset port
     * @return DataRecord connection
     */
    static DataRecord getTowardClientConnectionRecord(final String assetType, final String assetId,
            final String assetPort) {
        String connectToTable = assetType;
        String assetTypeId = assetId;
        String assetTypePortId = assetPort;
        if (Constants.FP_TYPE.equals(connectToTable)) {
            connectToTable = Constants.JK_TYPE;
            assetTypeId = assetPort;
            assetTypePortId = "";
        }
        final String pkFieldName = TelecomHelper.getPrimaryFieldName(connectToTable);
        final String fieldTypeName = Constants.TELECOM_PREFIX + pkFieldName;
        final String fieldTypePortName =
                Constants.TELECOM_PREFIX + connectToTable + Constants.UNDERSCORE_ID;
        final String sql = composeConnectionsSQL(connectToTable, fieldTypeName, fieldTypePortName,
            assetTypeId, assetTypePortId);

        final DataSource dataSource = DataSourceFactory.createDataSource();
        dataSource.addTable(connectToTable);
        dataSource.addVirtualField(connectToTable, Constants.RM_ID, DataSource.DATA_TYPE_TEXT);
        dataSource.addVirtualField(connectToTable, Constants.CONNECT_ASSET_TYPE,
            DataSource.DATA_TYPE_TEXT);
        dataSource.addVirtualField(connectToTable, Constants.CONNECT_ASSET_CODE,
            DataSource.DATA_TYPE_TEXT);
        dataSource.addVirtualField(connectToTable, Constants.CONNECT_ASSET_PORT,
            DataSource.DATA_TYPE_TEXT);
        dataSource.addQuery(sql, SqlExpressions.DIALECT_GENERIC);
        return dataSource.getRecord();
    }

    /**
     *
     * Create restriction on connection table. If has port, then the restriction is append with that
     * port.
     *
     * @param assetType asset type
     * @param assetCode asset code
     * @param assetPort asset port
     * @return SQL restriction
     */
    static String createRestriction(final String assetType, final String assetCode,
            final String assetPort) {
        final String pkFieldName = getPrimaryFieldName(assetType);
        String restriction = "";
        if (Constants.FP_TYPE.equals(assetType)) {
            final String table = Constants.JK_TYPE;
            restriction = table + Constants.DOT + pkFieldName + Constants.EQUAL
                    + SqlUtils.formatValueForSql(assetCode);
            restriction += Constants.AND + table + Constants.DOT + Constants.JK_TYPE
                    + Constants.UNDERSCORE_ID + Constants.EQUAL
                    + SqlUtils.formatValueForSql(assetPort);
        } else {

            restriction = assetType + Constants.DOT + pkFieldName + Constants.EQUAL
                    + SqlUtils.formatValueForSql(assetCode);
            if (StringUtil.notNullOrEmpty(assetPort)) {
                restriction += Constants.AND + assetType + Constants.DOT + Constants.PORT_ID
                        + Constants.EQUAL + SqlUtils.formatValueForSql(assetPort);
            }
        }

        return restriction;
    }

    /**
     * Check equipment is multiplexing.
     *
     * @param assetId equipment id
     * @return is multiplexing
     */
    static boolean isMultiplexingEquipment(final String assetId) {
        final DataSource dataSource = DataSourceFactory.createDataSource();
        dataSource.addTable(Constants.EQ_TYPE);
        dataSource.addField(Constants.EQ_TYPE, Constants.EQ_TYPE + Constants.UNDERSCORE_ID);
        dataSource.addRestriction(Restrictions.eq(Constants.EQ_TYPE,
            Constants.EQ_TYPE + Constants.UNDERSCORE_ID, assetId));
        dataSource.addRestriction(Restrictions.sql(Constants.IS_MULTIPLEXING_RESTRICTION));
        final DataRecord record = dataSource.getRecord();
        return record != null;
    }

    /**
     * Get equipment multiplexing ports toward the server. Check if equipment is multiplexing or
     * equipment standard is multiplexing
     *
     * @param assetId Asset id
     * @return list of up-link ports for multiplexing equipment
     */
    static List<String> getMultiplexingPortsTowardTheServer(final String assetId) {
        final List<String> portIds = new ArrayList<String>();
        final DataSource dataSource = DataSourceFactory.createDataSource();
        dataSource.addTable(Constants.EQPORT_TYPE, DataSource.ROLE_MAIN);
        dataSource.addTable(Constants.EQ_TYPE, DataSource.ROLE_STANDARD);
        dataSource.addField(Constants.EQ_TYPE, Constants.EQ_TYPE + Constants.UNDERSCORE_ID);
        dataSource.addField(Constants.EQPORT_TYPE, Constants.PORT_ID);
        dataSource.addRestriction(Restrictions.eq(Constants.EQ_TYPE,
            Constants.EQ_TYPE + Constants.UNDERSCORE_ID, assetId));
        dataSource.addRestriction(Restrictions.sql(Constants.IS_MULTIPLEXING_RESTRICTION));
        dataSource.addRestriction(Restrictions.or(new Restrictions.Restriction.Clause[] {
                Restrictions.isNotNull(Constants.EQPORT_TYPE, "tc_eq_id"),
                Restrictions.isNotNull(Constants.EQPORT_TYPE, "tc_eqport_id"),
                Restrictions.isNotNull(Constants.EQPORT_TYPE, "tc_pnport_id") }));
        final List<DataRecord> records = dataSource.getRecords();
        for (final DataRecord record : records) {
            final String portId =
                    record.getString(Constants.EQPORT_TYPE + Constants.DOT + Constants.PORT_ID);
            portIds.add(portId);
        }
        return portIds;
    }

    /**
     *
     * Get equipment multiplexing records toward the client.
     *
     * @param assetId Asset id
     * @return list of down-link records for multiplexing equipment
     *         <p>
     *         Suppress PMD warning "AvoidUsingSql" in this class.
     *         <p>
     *         Justification: statements with sub-queries with conditional logic.
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    static List<DataRecord> getMultiplexingRecordsTowardTheClient(final String assetId) {
        String sql =
                "SELECT eqport.eq_id ${sql.as} conn_asset_code, eqport.port_id ${sql.as} conn_asset_port, 'eqport' ${sql.as} conn_asset_type FROM eqport INNER JOIN eq ON eqport.eq_id=eq.eq_id AND (eq.is_multiplexing = 1 OR (EXISTS (SELECT 1 FROM eqstd WHERE eqstd.eq_std=eq.eq_std AND eqstd.is_multiplexing=1))) AND eqport.tc_eqport_id IS NOT NULL AND eqport.tc_eq_id"
                        + Constants.EQUAL + SqlUtils.formatValueForSql(assetId);
        sql += Constants.UNION;
        sql += "SELECT pnport.pn_id ${sql.as} conn_asset_code, pnport.port_id ${sql.as} conn_asset_port, 'pnport' ${sql.as} conn_asset_type FROM pnport INNER JOIN eq ON pnport.tc_eq_id=eq.eq_id AND (eq.is_multiplexing = 1 OR (EXISTS (SELECT 1 FROM eqstd WHERE eqstd.eq_std=eq.eq_std AND eqstd.is_multiplexing=1))) AND pnport.tc_eqport_id IS NOT NULL AND pnport.tc_eq_id"
                + Constants.EQUAL + SqlUtils.formatValueForSql(assetId);
        sql += Constants.UNION;
        sql += "SELECT jk.jk_id ${sql.as} conn_asset_code, '' ${sql.as} conn_asset_port, 'jk' ${sql.as} conn_asset_type FROM jk INNER JOIN eq ON jk.tc_eq_id=eq.eq_id AND (eq.is_multiplexing = 1 OR (EXISTS (SELECT 1 FROM eqstd WHERE eqstd.eq_std=eq.eq_std AND eqstd.is_multiplexing=1))) AND jk.tc_eqport_id IS NOT NULL AND jk.tc_eq_id"
                + Constants.EQUAL + SqlUtils.formatValueForSql(assetId);
        sql += Constants.UNION;
        sql += "SELECT eq.eq_id ${sql.as} conn_asset_code, '' ${sql.as} conn_asset_port, 'eq' ${sql.as} conn_asset_type FROM eq WHERE (eq.is_multiplexing = 1 OR (EXISTS (SELECT 1 FROM eqstd WHERE eqstd.eq_std=eq.eq_std AND eqstd.is_multiplexing=1))) AND eq.tc_eqport_id IS NOT NULL AND eq.tc_eq_id"
                + Constants.EQUAL + SqlUtils.formatValueForSql(assetId);

        final DataSource dataSource = DataSourceFactory.createDataSource();
        dataSource.addTable(Constants.EQPORT_TYPE);
        dataSource.addVirtualField(Constants.EQPORT_TYPE, Constants.CONNECT_ASSET_CODE,
            DataSource.DATA_TYPE_TEXT);
        dataSource.addVirtualField(Constants.EQPORT_TYPE, Constants.CONNECT_ASSET_PORT,
            DataSource.DATA_TYPE_TEXT);
        dataSource.addVirtualField(Constants.EQPORT_TYPE, Constants.CONNECT_ASSET_TYPE,
            DataSource.DATA_TYPE_TEXT);
        dataSource.addQuery(sql, SqlExpressions.DIALECT_GENERIC);
        return dataSource.getRecords();
    }

    /**
     *
     * Get connection location.
     *
     * @param assetType asset type
     * @param assetId asset id
     * @return JSONObject data {blId: buildingId, flId: floorId, rmId:roomId}
     */
    static JSONObject getConnectionLocation(final String assetType, final String assetId) {
        final JSONObject location = new JSONObject();
        final String tableName = TelecomHelper.getTableName(assetType);
        final DataSource dataSource =
                DataSourceFactory
                    .createDataSourceForFields(tableName,
                        new String[] { Constants.BL_ID, Constants.FL_ID, Constants.RM_ID })
                    .addRestriction(
                        Restrictions.eq(tableName, tableName + Constants.UNDERSCORE_ID, assetId));
        final DataRecord record = dataSource.getRecord();
        if (record != null) {
            final String blId = record.getString(tableName + Constants.DOT + Constants.BL_ID);
            final String flId = record.getString(tableName + Constants.DOT + Constants.FL_ID);
            final String rmId = record.getString(tableName + Constants.DOT + Constants.RM_ID);
            location.put("blId", blId);
            location.put("flId", flId);
            location.put("rmId", rmId);
        }
        return location;
    }

    /**
     *
     * Get faceplate by jack.
     *
     * @param assetType asset type
     * @param assetId asset id
     * @return faceplate id
     */
    static String getFaceplateByJack(final String assetType, final String assetId) {
        String fpId = "";
        if (Constants.JK_TYPE.equals(assetType)) {
            final DataSource dataSource = DataSourceFactory.createDataSource().addTable(assetType)
                .addField(assetType, new String[] { Constants.FP_ID }).addRestriction(
                    Restrictions.eq(assetType, assetType + Constants.UNDERSCORE_ID, assetId));
            final DataRecord record = dataSource.getRecord();
            if (record != null) {
                fpId = record.getString(assetType + Constants.DOT + Constants.FP_ID);
            }
        }
        return fpId;
    }

    /**
     *
     * Get port id by element type.
     *
     * @param assetType asset type
     * @param assetId asset id
     * @return port id
     */
    static String getAssetPortByAssetType(final String assetType, final String assetId) {
        String portId = "";
        final String portTableName = assetType + Constants.PORT_KEY;
        final String fielNameId = assetType + Constants.UNDERSCORE_ID;
        final DataSource eqPortDataSource = DataSourceFactory
            .createDataSourceForFields(portTableName,
                new String[] { fielNameId, Constants.PORT_ID })
            .addRestriction(Restrictions.eq(portTableName, fielNameId, assetId));
        final DataRecord record = eqPortDataSource.getRecord();

        if (record != null) {
            portId = record.getString(portTableName + Constants.DOT + Constants.PORT_ID);
        }
        return portId;
    }

    /**
     *
     * Get standard by table or by port table.
     *
     * @param assetType asset type
     * @param assetId asset id
     * @param assetPort asset port
     * @return standard
     */
    static String getAssetStandard(final String assetType, final String assetId,
            final String assetPort) {
        String standard = "";
        if (Constants.EQPORT_TYPE.equals(assetType)) {
            standard = getAssetStandardByPort(assetType, Constants.EQ_TYPE, assetId, assetPort);
        } else if (Constants.PNPORT_TYPE.equals(assetType)) {
            standard = getAssetStandardByPort(assetType, Constants.PN_TYPE, assetId, assetPort);
        } else {
            standard = getAssetStandardByTable(assetType, assetId);
        }
        return standard;
    }

    /**
     *
     * Get toward the server connection data record.
     *
     * @param assetType asset type
     * @param restriction primary key restriction for each asset type
     * @return DataRecord connection *
     *         <p>
     *         Suppress PMD warning "AvoidUsingSql" in this class.
     *         <p>
     *         Justification: statements with sub-queries with conditional logic.
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    private static DataRecord getTowardServerConnectionRecord(final String assetType,
            final String restriction) {
        String tableName = assetType;
        if (Constants.FP_TYPE.equals(assetType)) {
            tableName = Constants.JK_TYPE;
        }
        String sql = "SELECT ";
        sql += Constants.SQLCASE;
        if (Constants.EQ_TYPE.equals(tableName)) {
            sql += "WHEN tc_jk_id IS NOT NULL THEN 'jk' ";
        }
        sql += "WHEN tc_pnport_id IS NOT NULL THEN  'pnport' ";
        sql += "WHEN tc_pn_id IS NOT NULL THEN 'pn' ";
        sql += "WHEN tc_eqport_id IS NOT NULL THEN 'eqport' ";
        sql += "WHEN tc_eq_id IS NOT NULL THEN  'eq' ";
        sql += "ELSE '' END) ${sql.as} conn_asset_type,";
        sql += Constants.SQLCASE;
        if (Constants.EQ_TYPE.equals(tableName)) {
            sql += "WHEN tc_jk_id IS NOT NULL THEN tc_jk_id ";
        }
        sql += "WHEN tc_pn_id IS NOT NULL THEN  tc_pn_id ";
        sql += "WHEN tc_eq_id IS NOT NULL THEN  tc_eq_id ";
        sql += "ELSE '' END) ${sql.as} conn_asset_code, ";
        sql += Constants.SQLCASE;
        sql += "WHEN tc_pn_id IS NOT NULL AND tc_pnport_id IS NOT NULL THEN  tc_pnport_id ";
        sql += "WHEN tc_eq_id IS NOT NULL AND tc_eqport_id IS NOT NULL THEN  tc_eqport_id ";
        sql += "ELSE '' END) ${sql.as} conn_asset_port ";
        sql += " " + "FROM " + tableName + " WHERE ";
        sql += restriction;
        final DataSource dataSource = DataSourceFactory.createDataSource();
        dataSource.addTable(tableName);
        dataSource.addVirtualField(tableName, Constants.CONNECT_ASSET_TYPE,
            DataSource.DATA_TYPE_TEXT);
        dataSource.addVirtualField(tableName, Constants.CONNECT_ASSET_CODE,
            DataSource.DATA_TYPE_TEXT);
        dataSource.addVirtualField(tableName, Constants.CONNECT_ASSET_PORT,
            DataSource.DATA_TYPE_TEXT);
        dataSource.addQuery(sql, SqlExpressions.DIALECT_GENERIC);
        return dataSource.getRecord();
    }

    /**
     *
     * Compose Connections SQL.
     *
     * @param connectToTable connectToTable
     * @param fieldTypeName fieldTypeName
     * @param fieldTypePortName fieldTypePortName
     * @param assetTypeId assetTypeId
     * @param assetTypePortId assetTypePortId
     * @return SQL statement
     *         <p>
     *         Suppress PMD warning "AvoidUsingSql" in this class.
     *         <p>
     *         Justification: statements with sub-queries with conditional logic.
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    private static String composeConnectionsSQL(final String connectToTable,
            final String fieldTypeName, final String fieldTypePortName, final String assetTypeId,
            final String assetTypePortId) {
        String sql =
                "SELECT eq.rm_id ${sql.as} rm_id, eq_id ${sql.as} conn_asset_code, '' ${sql.as} conn_asset_port, 'eq' ${sql.as} conn_asset_type FROM eq WHERE eq."
                        + fieldTypeName + Constants.EQUAL + SqlUtils.formatValueForSql(assetTypeId);
        if (StringUtil.notNullOrEmpty(assetTypePortId)) {
            sql += " AND eq." + fieldTypePortName + Constants.EQUAL
                    + SqlUtils.formatValueForSql(assetTypePortId);
        }
        if (StringUtil.notNullOrEmpty(assetTypePortId)) {
            sql += Constants.UNION;
            sql += "SELECT eq.rm_id ${sql.as} rm_id, eqport.eq_id ${sql.as} conn_asset_code, eqport.port_id ${sql.as} conn_asset_port,'eqport' ${sql.as} conn_asset_type FROM eqport, eq WHERE eq.eq_id=eqport.eq_id AND eqport."
                    + fieldTypeName + Constants.EQUAL + SqlUtils.formatValueForSql(assetTypeId)
                    + " AND eqport." + fieldTypePortName + Constants.EQUAL
                    + SqlUtils.formatValueForSql(assetTypePortId);

            sql += Constants.UNION;
            sql += "SELECT pn.rm_id ${sql.as} rm_id, pnport.pn_id ${sql.as} conn_asset_code, pnport.port_id ${sql.as} conn_asset_port,'pnport' ${sql.as} conn_asset_type FROM pnport, pn WHERE pn.pn_id=pnport.pn_id AND pnport."
                    + fieldTypeName + Constants.EQUAL + SqlUtils.formatValueForSql(assetTypeId)
                    + " AND pnport." + fieldTypePortName + Constants.EQUAL
                    + SqlUtils.formatValueForSql(assetTypePortId);
            sql += Constants.UNION;
            sql += "SELECT fp.rm_id ${sql.as} rm_id, fp.fp_id ${sql.as} conn_asset_code, jk.jk_id ${sql.as} conn_asset_port,'fp' ${sql.as} conn_asset_type FROM fp, jk WHERE fp.fp_id=jk.fp_id AND jk."
                    + fieldTypeName + Constants.EQUAL + SqlUtils.formatValueForSql(assetTypeId)
                    + " AND jk." + fieldTypePortName + Constants.EQUAL
                    + SqlUtils.formatValueForSql(assetTypePortId);
        }
        if (!Constants.JK_TYPE.equals(connectToTable)) {
            sql += Constants.UNION;
            sql += "SELECT jk.rm_id ${sql.as} rm_id, "
                    + "(CASE WHEN jk.fp_id IS NOT NULL THEN jk.fp_id ELSE jk.jk_id END) ${sql.as} conn_asset_code, "
                    + "(CASE WHEN jk.fp_id IS NOT NULL THEN jk.jk_id ELSE '' END) ${sql.as} conn_asset_port,"
                    + "(CASE WHEN jk.fp_id IS NOT NULL THEN 'fp' ELSE 'jk' END) ${sql.as} conn_asset_type FROM jk WHERE jk."
                    + fieldTypeName + Constants.EQUAL + SqlUtils.formatValueForSql(assetTypeId);
            if (StringUtil.notNullOrEmpty(assetTypePortId)) {
                sql += "AND jk." + fieldTypePortName + Constants.EQUAL
                        + SqlUtils.formatValueForSql(assetTypePortId);
            }
        }
        if (Constants.EQ_TYPE.equals(connectToTable) && StringUtil.isNullOrEmpty(assetTypePortId)) {
            sql += Constants.UNION;
            sql += " SELECT eq.rm_id ${sql.as} rm_id, eqport.eq_id ${sql.as} conn_asset_code, eqport.port_id ${sql.as} conn_asset_port,'eqport' ${sql.as} conn_asset_type FROM eqport, eq WHERE eq.eq_id=eqport.eq_id AND eqport."
                    + fieldTypeName + Constants.EQUAL + SqlUtils.formatValueForSql(assetTypeId);
        }
        return sql;
    }

    /**
     *
     * Get standard by table.
     *
     * @param tableName table name
     * @param pkValue primary key
     * @return standard table + '_std' field
     */
    private static String getAssetStandardByTable(final String tableName, final String pkValue) {
        String standard = "";
        final String stdFieldName = tableName + Constants.STD;
        final DataSource dataSource = DataSourceFactory.createDataSource().addTable(tableName)
            .addField(tableName, new String[] { stdFieldName }).addRestriction(
                Restrictions.eq(tableName, tableName + Constants.UNDERSCORE_ID, pkValue));
        final DataRecord record = dataSource.getRecord();
        if (record != null) {
            standard = record.getString(tableName + Constants.DOT + stdFieldName);
        }
        return standard;
    }

    /**
     *
     * Get standard by port table.
     *
     * @param assetTable asset table
     * @param assetPortTable table to join for finding the port
     * @param assetId assetId to set restriction on main table
     * @param assetPort asset port
     * @return standard table + '_std' field
     */
    private static String getAssetStandardByPort(final String assetTable,
            final String assetPortTable, final String assetId, final String assetPort) {
        String standard = "";
        final DataSource dataSource = DataSourceFactory.createDataSource();
        dataSource.addTable(assetTable, DataSource.ROLE_MAIN);
        dataSource.addTable(assetPortTable, DataSource.ROLE_STANDARD);
        dataSource.addField(assetTable,
            new String[] { assetPortTable + Constants.UNDERSCORE_ID, Constants.PORT_ID });
        dataSource.addField(assetPortTable, new String[] { assetPortTable + Constants.STD });
        dataSource.addRestriction(
            Restrictions.eq(assetTable, assetPortTable + Constants.UNDERSCORE_ID, assetId));
        if (StringUtil.notNullOrEmpty(assetPort)) {
            dataSource.addRestriction(Restrictions.eq(assetTable, Constants.PORT_ID, assetPort));
        }
        final DataRecord record = dataSource.getRecord();
        if (record != null) {
            standard = record
                .getString(assetPortTable + Constants.DOT + assetPortTable + Constants.STD);
        }
        return standard;
    }

    /**
     *
     * Get primary field name by element type.
     *
     * @param type type
     * @return type + '_id'
     */
    private static String getPrimaryFieldName(final String type) {
        return getTableName(type) + Constants.UNDERSCORE_ID;
    }

    /**
     *
     * Get table name by element type.
     *
     * @param type type
     * @return table name
     */
    private static String getTableName(final String type) {
        String returnType = type;
        if (Constants.PNPORT_TYPE.equals(type)) {
            returnType = Constants.PN_TYPE;
        } else if (Constants.EQPORT_TYPE.equals(type)) {
            returnType = Constants.EQ_TYPE;
        }
        return returnType;
    }
}
