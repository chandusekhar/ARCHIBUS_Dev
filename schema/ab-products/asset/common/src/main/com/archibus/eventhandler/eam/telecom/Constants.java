package com.archibus.eventhandler.eam.telecom;

/**
 * Constants for Telecom Service.
 * <p>
 *
 * @author Radu Bunea
 * @since 22.1
 *
 */
final class Constants {
    /**
     * Equipment type table.
     */
    static final String EQ_TYPE = "eq";

    /**
     * Equipment port type table.
     */
    static final String EQPORT_TYPE = "eqport";

    /**
     * Jack type table.
     */
    static final String JK_TYPE = "jk";

    /**
     * Faceplate type table.
     */
    static final String FP_TYPE = "fp";

    /**
     * Patch Panel type table.
     */
    static final String PN_TYPE = "pn";

    /**
     * Patch Panel POrt type table.
     */
    static final String PNPORT_TYPE = "pnport";

    /**
     * Constant.
     */
    static final String RM_TABLE = "rm";

    /**
     * Constant.
     */
    static final String PORT_ID = "port_id";

    /**
     * Constant.
     */
    static final String BL_ID = "bl_id";

    /**
     * Constant.
     */
    static final String FL_ID = "fl_id";

    /**
     * Constant.
     */
    static final String RM_ID = "rm_id";

    /**
     * Constant.
     */
    static final String FP_ID = "fp_id";

    /**
     * Constant.
     */
    static final String TELECOM_PREFIX = "tc_";

    /**
     * Constant.
     */
    static final String STD = "_std";

    /**
     * Constant.
     */
    static final String PORT_KEY = "port";

    /**
     * Constant.
     */
    static final String TABLE = "table";

    /**
     * Constant.
     */
    static final String LOCALIZED_ASSET = "localizedAsset";

    /**
     * Constant.
     */
    static final String UNDERSCORE_ID = "_id";

    /**
     * Constant.
     */
    static final String CONNECTIONS = "connections";

    /**
     * Constant.
     */
    static final String CONNECT_ASSET_TYPE = "conn_asset_type";

    /**
     * Constant.
     */
    static final String CONNECT_ASSET_CODE = "conn_asset_code";

    /**
     * Constant.
     */
    static final String CONNECT_ASSET_PORT = "conn_asset_port";

    /**
     * Constant.
     */
    static final String IS_MULTIPLEXING = "is_multiplexing";

    /**
     * Constant used in SQL statements to restrict multiplexing condition.
     * <p>
     * Suppress PMD warning "AvoidUsingSql" in this class.
     * <p>
     * Justification: statements with SELECT WHERE EXISTS ... pattern
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    static final String IS_MULTIPLEXING_RESTRICTION =
            "eq.is_multiplexing = 1 OR (EXISTS (SELECT 1 FROM eqstd WHERE eqstd.eq_std=eq.eq_std AND eqstd.is_multiplexing=1))";

    /**
     * Constant.
     */
    static final String PORT_TITLE = "portTitle";

    /**
     * Constant.
     */
    static final String ASSET_TYPE = "assetType";

    /**
     * Constant.
     */
    static final String ASSET_ID = "assetId";

    /**
     * Constant.
     */
    static final String ASSET_PORT = "assetPort";

    /**
     * Constant.
     */
    static final String ASSET_STD = "assetStd";

    /**
     * Constant.
     */
    static final String TOWARD_CLIENT_CONNECTIONS = "towardClientConnections";

    /**
     * Constant.
     */
    static final String TOWARD_SERVER_CONNECTIONS = "towardServerConnections";

    /**
     * Constant.
     */
    static final String MULTIPLEXING_CONNECTIONS = "multiplexingConnections";

    /**
     * Constant.
     */
    static final String IS_SELECTED = "isSelected";

    /**
     * Constant.
     */
    static final String SQLCASE = "(CASE ";

    /**
     * Constant.
     */
    static final String UNION = " UNION ";

    /**
     * Constant.
     */
    static final String DOT = ".";

    /**
     * Constant.
     */
    static final String AND = " AND ";

    /**
     * Constant.
     */
    static final String EQUAL = "=";

    /**
     *
     * default constructor: utility class is non-instantiable.
     */
    private Constants() {

    }
}
