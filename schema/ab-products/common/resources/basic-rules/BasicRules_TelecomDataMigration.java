import java.util.*;

import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.eventhandler.BasicRuleBase;
import com.archibus.jobmanager.JobStatus;
import com.archibus.utility.ExceptionBase;

/**
 *
 * The class will be used for telecom data migration to migrate the Network Devices Standards,
 * Network Devices, Network Device Ports, Cards Standards, Cards, Card Ports, Punch Block Standards,
 * Punch Blocks, Punch Block Ports from the Archibus Windows Client/Server application. After
 * migration, an update for the connections will be launched, to update the corresponding fields for
 * the tables: eq --tc_eq_id, eqport -- tc_eq_id, tc_eqport_id, jk -- tc_jk_id, pnport --tc_pn_id,
 * tc_pnport_id. The class will run as a job in Basic Rule Wizard.
 *
 * @author Valentina Sandu
 *
 */
public class BasicRules_TelecomDataMigration extends BasicRuleBase {

    /**
     * Telecom area field.
     */
    public static final String TC_AREA_LEVEL = "tc_area_level";

    /**
     * Equipment table.
     */
    public static final String EQ_TABLE = "eq";

    /**
     * Equipment standards table.
     */
    public static final String EQSTD_TABLE = "eqstd";

    /**
     * Equipment ports table.
     */
    public static final String EQPORT_TABLE = "eqport";

    /**
     * Network Devices table.
     */
    public static final String NETDEV_TABLE = "netdev";

    /**
     * Network Device Standards table.
     */
    public static final String NETDEVSTD_TABLE = "netdevstd";

    /**
     * Network Devices ports table.
     */
    public static final String NDPORT_TABLE = "ndport";

    /**
     * Punch Blocks table.
     */
    public static final String PB_TABLE = "pb";

    /**
     * Patch Panels table.
     */
    public static final String PN_TABLE = "pn";

    /**
     * Punch Block Standards table.
     */
    public static final String PBSTD_TABLE = "pbstd";

    /**
     * Patch Panels Standards table.
     */
    public static final String PNSTD_TABLE = "pnstd";

    /**
     * Patch Panels Ports table.
     */
    public static final String PNPORT_TABLE = "pnport";

    /**
     * Connection table from Windows Client/Server table.
     */
    public static final String AFM_TCCN_TABLE = "afm_tccn";

    /**
     * Cards table.
     */
    public static final String CARD_TABLE = "card";

    /**
     * Card Standards table.
     */
    public static final String CARDSTD_TABLE = "cardstd";

    /**
     * Card Ports table.
     */
    public static final String CDPORT_TABLE = "cdport";

    /**
     * Jacks table.
     */
    public static final String JK_TABLE = "jk";

    /**
     * Jacks id field.
     */
    public static final String JK_ID_FLD = "jk_id";

    /**
     * Equipment id field.
     */
    public static final String EQ_ID_FLD = "eq_id";

    /**
     * Equipment standard field.
     */
    public static final String EQ_STD_FLD = "eq_std";

    /**
     * Port id field.
     */
    public static final String PORT_ID_FLD = "port_id";

    /**
     * Network Devices id field.
     */
    public static final String NETDEV_ID_FLD = "netdev_id";

    /**
     * Network Devices standard field.
     */
    public static final String NETDEV_STD_FLD = "netdev_std";

    /**
     * Port configuration table.
     */
    public static final String PORT_CFG_TABLE = "portcfg";

    /**
     * Punch Blocks id field.
     */
    public static final String PB_ID_FLD = "pb_id";

    /**
     * Punch Blocks standard field.
     */
    public static final String PB_STD_FLD = "pb_std";

    /**
     * Patch Panel id field.
     */
    public static final String PN_ID_FLD = "pn_id";

    /**
     * Patch Panel standard field.
     */
    public static final String PN_STD_FLD = "pn_std";

    /**
     * Card id field.
     */
    public static final String CARD_ID_FLD = "card_id";

    /**
     * Card standard field.
     */
    public static final String CARD_STD_FLD = "card_std";

    /**
     * downhill_table field from afm_tccn (connections table).
     */
    public static final String DOWNHILL_TABLE_FLD = "downhill_table";

    /**
     * downhill_position field from afm_tccn (connections table).
     */
    public static final String DOWNHILL_POSITION_FLD = "downhill_position";

    /**
     * downhill_key field from afm_tccn (connections table).
     */
    public static final String DOWNHILL_KEY_FLD = "downhill_key";

    /**
     * uphill_table field from afm_tccn (connections table).
     */
    public static final String UPHILL_TABLE_FLD = "uphill_table";

    /**
     * upill_position field from afm_tccn (connections table).
     */
    public static final String UPHILL_POSITION_FLD = "uphill_position";

    /**
     * uphill_table field from afm_tccn (connections table).
     */
    public static final String UPHILL_KEY_FLD = "uphill_key";

    /**
     * windows new line separator.
     */
    public static final String NEW_LINE = "line.separator";

    /**
     * Ids and Ports separator.
     */
    public static final String SPLIT_PATTERN = "\\|";

    /**
     * SQL quote for varchars.
     */
    public static final String SQL_QUOTE = "'";

    /**
     * NOT IN operator sql.
     */
    public static final String NOT_IN = " NOT IN ";

    /**
     * IN operator sql.
     */
    public static final String IN_SQL = " IN ";

    /**
     * Open parenthesis sql.
     */
    public static final String OPEN_PARENTHESIS = "(";

    /**
     * Closed parenthesis sql.
     */
    public static final String CLOSED_PARENTHESIS = ")";

    /**
     * INSERT INTO sql.
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    public static final String INSERT_INTO = "INSERT INTO ";

    /**
     * SELECT sql.
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    public static final String SELECT = "SELECT ";

    /**
     * OR sql.
     */
    public static final String OR_SQL = " OR ";

    /**
     * LIKE sql.
     */
    public static final String LIKE = " LIKE ";

    /**
     * FROM sql.
     */
    public static final String FROM = " FROM ";

    /**
     * WHERE sql.
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    public static final String WHERE = " WHERE ";

    /**
     * UNION sql.
     */
    public static final String UNION = " UNION ";

    /**
     * Comma field separator sql.
     */
    public static final String FIELD_SEPARATOR = ",";

    /**
     * Equals sql.
     */
    public static final String EQUALS = "=";

    /**
     * Not equal sql.
     */
    public static final String NOT_EQUAL = "<>";

    /**
     * AND sql.
     */
    public static final String AND = " AND ";

    /**
     * GROUP BY sql.
     */
    public static final String GROUP_BY = " GROUP BY ";

    /**
     * HAVING sql.
     */
    public static final String HAVING = " HAVING ";

    /**
     * numberOfRecords alias for count(*) sql.
     */
    public static final String COUNT_FLD_NAME = "numberOfRecords";

    /**
     * Suffix for Network devices ids.
     */
    public static final String SUFFIX_NETDEV = "-NETDEV";

    /**
     * Suffix for Card ids.
     */
    public static final String SUFFIX_CARD = "-CARD";

    /**
     * Suffix for Patch Panel ids.
     */
    public static final String SUFFIX_PATCH_PANEL = "-PB";

    /**
     * COUNT sql.
     */
    public static final String COUNT_ALL = " count(*) ";

    /**
     * generic ALIAS sql.
     */
    public static final String ALIAS = " ${sql.as} ";

    /**
     * IS NOT NULL sql.
     */
    public static final String NOT_NULL = " IS NOT NULL ";

    /**
     * GRATER THAN 0 sql.
     */
    public static final String GRATER_THAN_ZERO = " > 0 ";

    /**
     * DOT separator sql.
     */
    public static final String DOT_CHAR = ".";

    /**
     * Concatenate sql.
     */
    public static final String CONCATENATE = " ${sql.concat} ";

    /**
     * Maximum field length for Patch Panel sql.
     */
    public static final int MAX_NO_CHARS_PATCH_PANEL = 16;

    /**
     * Maximum field length for Equipments sql.
     */
    public static final int MAX_NO_CHARS_EQUIPM = 32;

    /**
     * UPDATE sql.
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    public static final String UPDATE = "UPDATE ";

    /**
     * SET sql.
     */
    public static final String SET = " SET ";

    /**
     * CASE WHEN sql.
     */
    public static final String CASE_WHEN = "CASE WHEN ";

    /**
     * THEN sql.
     */
    public static final String THEN = " THEN ";

    /**
     * ELSE sql.
     */
    public static final String ELSE = " ELSE ";

    /**
     * END sql.
     */
    public static final String END = " END ";

    /**
     * downhill_value is an alias for the result returned based on downhill_key and
     * downhill_position sql.
     */
    public static final String DOWNHILL_VALUE = "downhill_value";

    /**
     * uphill_value is an alias for the result returned based on uphill_key and uphill_position sql.
     */
    public static final String UPHILL_VALUE = "uphill_value";

    /**
     * list of tables that will be excluded from the update.
     */
    public static final String TABLES_NOT_MIGRATED = "'ca','cp','port'";

    /**
     * tc_eq_id field.
     */
    public static final String TC_EQ_ID = "tc_eq_id";

    /**
     * tc_eqport_id field.
     */
    public static final String TC_EQPORT_ID = "tc_eqport_id";

    /**
     * tc_pn_id field.
     */
    public static final String TC_PN_ID = "tc_pn_id";

    /**
     * tc_pnport_id field.
     */
    public static final String TC_PNPORT_ID = "tc_pnport_id";

    /**
     * tc_jk_id field.
     */
    public static final String TC_JK_ID = "tc_jk_id";

    /**
     * Needed for SQL Server.
     */
    public static final String LTRIM_RTRIM = "LTRIM(RTRIM(";

    /**
     * Needed for SQL Server .
     */
    public static final String END_LTRIM_RTRIM = "))";

    /**
     * List of fields from eq table needed for insertion.
     */
    public static final String FIELDS_EQUIPMENT_NETDEV =
            "eq_id, eq_std, bl_id, description, dwgname, ehandle, fl_id, hardware_address, is_multiplexing, net_address,net_address_ip,net_card_type,net_id,net_sub_mask,num_serial,rack_id,rm_id,tc_level";

    /**
     * List of fields from netdev table needed for insertion.
     */
    public static final String FIELDS_NETWORK_DEVICES =
            "ltrim(rtrim(netdev_id)), ltrim(rtrim(netdev_std)), bl_id, description, dwgname, ehandle, fl_id, hardware_address, is_multiplexing, net_address,net_address_ip,net_card_type,net_id,net_sub_mask,num_serial,rack_id,rm_id,tc_level";

    /**
     * List of fields from netdev table needed for insertion with suffix.
     */
    public static final String FIELDS_NETWORK_DEVICES_SUFFIX = LTRIM_RTRIM + NETDEV_ID_FLD
            + END_LTRIM_RTRIM + CONCATENATE + SQL_QUOTE + SUFFIX_NETDEV + SQL_QUOTE
            + ", ltrim(rtrim(netdev_std)), bl_id, description, dwgname, ehandle, fl_id, hardware_address, is_multiplexing, net_address,net_address_ip,net_card_type,net_id,net_sub_mask,num_serial,rack_id,rm_id,tc_level";

    /**
     * List of fields from eqstd table needed for insertion.
     */
    private static final String FIELDS_EQUIPMENT_STD_FOR_NETWORK_DEVICES =
            "eq_std, price, description, image_file, is_multiplexing, category, symbol, tc_contained_tbls,tc_level,tc_npositions";

    /**
     * List of fields from netdevstd table needed for insertion.
     */
    private static final String FIELDS_NETWORK_DEVICES_STD =
            "ltrim(rtrim(netdev_std)), cost_purchase, description, image_file, is_multiplexing, netdev_type, symbol, tc_contained_tbls,tc_level,tc_npositions";

    /**
     * List of fields from eqport table needed for insertion.
     */
    private static final String FIELDS_EQPORT =
            "eq_id, port_id, description, hardware_address, net_address, port_std, segment, tc_level,tc_use_status";

    /**
     * List of fields from ndport table needed for insertion.
     */
    private static final String FIELDS_NDPORT =
            "ltrim(rtrim(netdev_id)), ltrim(rtrim(port_id)), description, hardware_address, net_address, port_std, segment, tc_level,tc_use_status";

    /**
     * List of fields from ndport table needed for insertion with suffix.
     */
    private static final String FIELDS_NDPORT_SUFFIX = LTRIM_RTRIM + NETDEV_ID_FLD + END_LTRIM_RTRIM
            + CONCATENATE + SQL_QUOTE + SUFFIX_NETDEV + SQL_QUOTE
            + ", port_id, description, hardware_address, net_address, port_std, segment, tc_level,tc_use_status";

    /**
     * List of fields from eqstd table needed for insertion.
     */
    private static final String FIELDS_EQ_STD =
            "eq_std, category, description, is_multiplexing, tc_contained_tbls, tc_level, tc_npositions";

    /**
     * List of fields from eq table needed for insertion.
     */
    private static final String FIELDS_CARD_STD =
            "ltrim(rtrim(card_std)), netdev_type, description, is_multiplexing, tc_contained_tbls, tc_level, tc_npositions";

    /**
     * List of fields from eq table needed for insertion.
     */
    private static final String FIELDS_EQUIPMENT_CARD =
            "eq_id, eq_std, description, hardware_address, is_multiplexing, net_address, net_id, tc_level";

    /**
     * List of fields from card table needed for insertion.
     */
    private static final String FIELDS_CARD =
            "ltrim(rtrim(card_id)), ltrim(rtrim(card_std)), description, hardware_address, is_multiplexing, net_address, net_id, tc_level";

    /**
     * List of fields from card table needed for insertion with suffix.
     */
    private static final String FIELDS_CARD_SUFFIX = LTRIM_RTRIM + CARD_ID_FLD + END_LTRIM_RTRIM
            + CONCATENATE + SQL_QUOTE + SUFFIX_CARD + SQL_QUOTE
            + ", card_std, description, hardware_address, is_multiplexing, net_address, net_id, tc_level";

    /**
     * List of fields from eqport table needed for insertion.
     */
    private static final String FIELDS_EQPORT_FOR_CARDS =
            "eq_id, port_id, description, hardware_address, net_address, port_std,tc_level,tc_use_status";

    /**
     * List of fields from cdport table needed for insertion.
     */
    private static final String FIELDS_CARD_PORTS =
            "ltrim(rtrim(card_id)), ltrim(rtrim(port_id)), description, hardware_address, net_address, port_std,tc_level,tc_use_status";

    /**
     * List of fields from cdport table needed for insertion with suffix.
     */
    private static final String FIELDS_CARD_PORTS_SUFFIX = LTRIM_RTRIM + CARD_ID_FLD
            + END_LTRIM_RTRIM + CONCATENATE + SQL_QUOTE + SUFFIX_CARD + SQL_QUOTE
            + ", port_id, description, hardware_address, net_address, port_std,tc_level,tc_use_status";

    /**
     * List of fields from pnstd table needed for insertion.
     */
    private static final String FIELDS_PN_STD =
            "pn_std, description, doc_image, image_file, symbol, tc_contained_tbls, tc_level, tc_npositions, vn_id";

    /**
     * List of fields from pbstd table needed for insertion.
     */
    private static final String FIELDS_PB_STD =
            "ltrim(rtrim(pb_std)), description, doc_image, image_file, symbol, tc_contained_tbls, tc_level, tc_npositions, vn_id";

    /**
     * List of fields from pn table needed for insertion.
     */
    private static final String FIELDS_PATCH_PANEL =
            "pn_id, pn_std, bl_id, cross_connect_level, description, detail_dwg, dwgname, ehandle, fl_id, rack_id, rm_id, shelf_id, tc_level, tc_service";

    /**
     * List of fields from pb table needed for insertion.
     */
    private static final String FIELDS_PUNCH_BLOCKS =
            "ltrim(rtrim(pb_id)), ltrim(rtrim(pb_std)), bl_id, cross_connect_level, description, detail_dwg, dwgname, ehandle, fl_id, rack_id, rm_id, shelf_id, tc_level, tc_service";

    /**
     * List of fields from eq table needed for insertion.
     */
    private static final String FIELDS_PATCH_PANEL_SUFFIX = LTRIM_RTRIM + PB_ID_FLD
            + END_LTRIM_RTRIM + CONCATENATE + SQL_QUOTE + SUFFIX_PATCH_PANEL + SQL_QUOTE
            + ", ltrim(rtrim(pb_std)), bl_id, cross_connect_level, description, detail_dwg, dwgname, ehandle, fl_id, rack_id, rm_id, shelf_id, tc_level, tc_service";

    /**
     * List of fields from pn_id, port_id fields needed for insertion.
     */
    private static final String FIELD_PN_PORT = PN_ID_FLD + FIELD_SEPARATOR + PORT_ID_FLD;

    /**
     * List of fields from pn_id, port_id fields needed for insertion.
     */
    private static final String FIELD_PB_PORT = LTRIM_RTRIM + PN_ID_FLD + END_LTRIM_RTRIM
            + FIELD_SEPARATOR + LTRIM_RTRIM + PORT_ID_FLD + END_LTRIM_RTRIM;

    /**
     * List of fields from pn_id with suffix, port_id fields needed for insertion.
     */
    private static final String FIELD_PB_PORT_SUFFIX =
            LTRIM_RTRIM + PN_ID_FLD + END_LTRIM_RTRIM + CONCATENATE + SQL_QUOTE + SUFFIX_PATCH_PANEL
                    + SQL_QUOTE + FIELD_SEPARATOR + PORT_ID_FLD;

    /**
     * Alias table name tblPort for ports taken from afm_tccn.
     */
    private static final String ALIAS_TABLE_NAME_PORT = " tblPort";

    /**
     * The message used for log duplicate keys.
     */
    private static final String DUPLICATE_MESSAGE = "The list of duplicate keys found  ";

    /**
     * Insert statement message.
     */
    private static final String INSERT_STATEMENT_MESSAGE = "The insert statement ";

    /**
     * Update statement message.
     */
    private static final String UPDATE_STATEMENT_MESSAGE = "The update statement ";

    /**
     * Select statement message.
     */
    private static final String SELECT_STATEMENT_MESSAGE = "The select Query ";

    /**
     *
     * The method returns the number of duplicate keys found in the target table based on the
     * selection made on the source table.
     *
     * @param tableNameTarget is the name of the table where the data will be transfered and before
     *            inserting the data from the source table is checked for duplicate keys in the
     *            target table.
     * @param fieldNameTarget is the primary key by which the search will be done.
     * @param tableNameSource is the table from which the data will be extracted and will be checked
     *            against the target table.
     * @param fieldNameSource is the primary key of the table from which the data will be extracted
     * @return a list of data records resulting from executing the query for retrieving the
     *         duplicate keys found in the target table based on the source table
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    public List<DataRecord> getDuplicateKeys(final String tableNameTarget,
            final String fieldNameTarget, final String tableNameSource,
            final String fieldNameSource) {
        final DataSource dataSourceRecordsCount = DataSourceFactory.createDataSource();

        final String query = SELECT + LTRIM_RTRIM + fieldNameTarget + END_LTRIM_RTRIM + ALIAS
                + fieldNameTarget + FIELD_SEPARATOR + COUNT_ALL + ALIAS + COUNT_FLD_NAME + FROM
                + tableNameTarget + WHERE + LTRIM_RTRIM + fieldNameTarget + END_LTRIM_RTRIM + IN_SQL
                + OPEN_PARENTHESIS + SELECT + LTRIM_RTRIM + fieldNameSource + END_LTRIM_RTRIM + FROM
                + tableNameSource + CLOSED_PARENTHESIS + GROUP_BY + fieldNameTarget + HAVING
                + COUNT_ALL + GRATER_THAN_ZERO;
        this.log.info(SELECT_STATEMENT_MESSAGE + " for duplicate keys: " + query);
        dataSourceRecordsCount.addTable(tableNameTarget);

        dataSourceRecordsCount.addVirtualField(tableNameTarget, fieldNameTarget,
            DataSource.DATA_TYPE_TEXT);
        dataSourceRecordsCount.addVirtualField(tableNameTarget, COUNT_FLD_NAME,
            DataSource.DATA_TYPE_INTEGER);
        dataSourceRecordsCount.setApplyVpaRestrictions(false);
        dataSourceRecordsCount.setMaxRecords(0);
        dataSourceRecordsCount.addQuery(query, SqlExpressions.DIALECT_GENERIC);

        return dataSourceRecordsCount.getRecords();
    }

    /**
     *
     * getDuplicateKeysWithDoublePK - used to retrieve the duplicate keys found in the target table
     * before insertion.
     *
     * @param tableNameTarget is the name of the table where the data will be transfered and before
     *            inserting the data from the source table is checked for duplicate keys in the
     *            target table.
     * @param fieldNameTarget1 is the first primary key by which the search will be done
     * @param fieldNameTarget2 is the second primary key by which the search will be done
     * @param tableNameSource is the table from which the data will be extracted and will be checked
     *            against the target table.
     * @param fieldNameSource1 is the first primary key of the table from which the data will be
     *            extracted
     * @param fieldNameSource2 is the second primary key of the table from which the data will be
     *            extracted
     * @param fieldValue is the value of the first primary key.
     * @return a list of data records resulting from executing the query for retrieving the
     *         duplicate keys found in the target table based on the source table
     */

    public List<DataRecord> getDuplicateKeysWithDoublePK(final String tableNameTarget,
            final String fieldNameTarget1, final String fieldNameTarget2,
            final String tableNameSource, final String fieldNameSource1,
            final String fieldNameSource2, final String fieldValue) {

        final DataSource dataSourceRecordsCount = DataSourceFactory.createDataSource();

        // SELECT eq_id, port_id, count(*) as numberOfRecords
        // FROM eqport WHERE eq_id IN (SELECT netdev_id from ndport)
        // AND port_id in (select port_id from ndport)
        // and eq_id = 'HUB17A'
        // group by eq_id, port_id
        // having count(*) > 0

        final String query = SELECT + LTRIM_RTRIM + fieldNameTarget1 + END_LTRIM_RTRIM + ALIAS
                + fieldNameTarget1 + FIELD_SEPARATOR + fieldNameTarget2 + FIELD_SEPARATOR
                + COUNT_ALL + ALIAS + COUNT_FLD_NAME + FROM + tableNameTarget + WHERE + LTRIM_RTRIM
                + fieldNameTarget1 + END_LTRIM_RTRIM + IN_SQL + OPEN_PARENTHESIS + SELECT
                + LTRIM_RTRIM + fieldNameSource1 + END_LTRIM_RTRIM + FROM + tableNameSource
                + CLOSED_PARENTHESIS + AND + LTRIM_RTRIM + fieldNameTarget2 + END_LTRIM_RTRIM
                + IN_SQL + OPEN_PARENTHESIS + SELECT + LTRIM_RTRIM + fieldNameSource2
                + END_LTRIM_RTRIM + FROM + tableNameSource + CLOSED_PARENTHESIS + AND + LTRIM_RTRIM
                + fieldNameTarget1 + END_LTRIM_RTRIM + EQUALS + LTRIM_RTRIM + SQL_QUOTE + fieldValue
                + SQL_QUOTE + END_LTRIM_RTRIM + GROUP_BY + fieldNameTarget1 + FIELD_SEPARATOR
                + fieldNameTarget2 + HAVING + COUNT_ALL + GRATER_THAN_ZERO;
        this.log.info(SELECT_STATEMENT_MESSAGE + " for duplicate double PKs: " + query);
        dataSourceRecordsCount.addTable(tableNameTarget);
        dataSourceRecordsCount.addVirtualField(tableNameTarget, COUNT_FLD_NAME,
            DataSource.DATA_TYPE_INTEGER);

        dataSourceRecordsCount.setApplyVpaRestrictions(false);
        dataSourceRecordsCount.setMaxRecords(0);

        dataSourceRecordsCount.addQuery(query);

        return dataSourceRecordsCount.getRecords();
    }

    /**
     *
     * getDuplicateKeysForPatchPanelPorts - used to retrieve the duplicate keys for ports found in
     * the target table before insertion.
     *
     * @param tableNameTarget is the name of the table where the data will be transfered and before
     *            inserting the data from the source table is checked for duplicate keys in the
     *            target table.
     * @param fieldNameTarget1 is the first primary key by which the search will be done
     * @param fieldNameTarget2 is the second primary key by which the search will be done
     * @param fieldNameSource1 is the first primary key of the table from which the data will be
     *            extracted
     * @param fieldNameSource2 is the second primary key of the table from which the data will be
     *            extracted
     * @param fieldValue is the value of the first primary key.
     * @return a list of data records resulting from executing the query for retrieving the
     *         duplicate keys found in the target table based on the source table
     */
    public List<DataRecord> getDuplicateKeysForPatchPanelPorts(final String tableNameTarget,
            final String fieldNameTarget1, final String fieldNameTarget2,
            final String fieldNameSource1, final String fieldNameSource2, final String fieldValue) {
        final DataSource dataSourceRecordsCount = DataSourceFactory.createDataSource();

        // SELECT pn_id,port_id, COUNT(*) numberOfRecords
        // FROM pnport
        // WHERE pn_id in (select tbl.pn_id from

        // (select uphill_key as pn_id, uphill_position as port_id
        // from afm_tccn where uphill_table = 'pb'
        // Union
        // select downhill_key as pn_id, downhill_position as port_id
        // from afm_tccn where downhill_table = 'pb' ) tbl)
        // AND port_id in (select tbl.position from

        // (select uphill_key as pn_id, uphill_position as port_id
        // from afm_tccn where uphill_table = 'pb'
        // Union
        // select downhill_key as pn_id, downhill_position as port_id
        // from afm_tccn where downhill_table = 'pb' ) tbl)
        // AND pn_id = 'PB17H'
        // GROUP BY pn_id, port_id
        // HAVING count(*) > 0

        final String sqlForConnections = SELECT + LTRIM_RTRIM + UPHILL_KEY_FLD + END_LTRIM_RTRIM
                + ALIAS + PN_ID_FLD + FIELD_SEPARATOR + LTRIM_RTRIM + UPHILL_POSITION_FLD
                + END_LTRIM_RTRIM + ALIAS + PORT_ID_FLD + FROM + AFM_TCCN_TABLE + WHERE
                + LTRIM_RTRIM + UPHILL_TABLE_FLD + END_LTRIM_RTRIM + EQUALS + SQL_QUOTE + PB_TABLE
                + SQL_QUOTE + AND + LTRIM_RTRIM + UPHILL_KEY_FLD + END_LTRIM_RTRIM + NOT_NULL + AND
                + LTRIM_RTRIM + UPHILL_POSITION_FLD + END_LTRIM_RTRIM + NOT_NULL + UNION + SELECT
                + LTRIM_RTRIM + DOWNHILL_KEY_FLD + END_LTRIM_RTRIM + ALIAS + PN_ID_FLD
                + FIELD_SEPARATOR + LTRIM_RTRIM + DOWNHILL_POSITION_FLD + END_LTRIM_RTRIM + ALIAS
                + PORT_ID_FLD + FROM + AFM_TCCN_TABLE + WHERE + LTRIM_RTRIM + DOWNHILL_TABLE_FLD
                + END_LTRIM_RTRIM + EQUALS + SQL_QUOTE + PB_TABLE + SQL_QUOTE + AND + LTRIM_RTRIM
                + DOWNHILL_KEY_FLD + END_LTRIM_RTRIM + NOT_NULL + AND + LTRIM_RTRIM
                + DOWNHILL_POSITION_FLD + END_LTRIM_RTRIM + NOT_NULL;

        this.log.info(
            SELECT_STATEMENT_MESSAGE + " for duplicate patch panel ports: " + sqlForConnections);

        final String query = SELECT + LTRIM_RTRIM + fieldNameTarget1 + END_LTRIM_RTRIM + ALIAS
                + fieldNameTarget1 + FIELD_SEPARATOR + LTRIM_RTRIM + fieldNameTarget2
                + END_LTRIM_RTRIM + ALIAS + fieldNameTarget2 + FIELD_SEPARATOR + COUNT_ALL + ALIAS
                + COUNT_FLD_NAME + FROM + tableNameTarget + WHERE + LTRIM_RTRIM + fieldNameTarget1
                + END_LTRIM_RTRIM + IN_SQL + OPEN_PARENTHESIS + SELECT + ALIAS_TABLE_NAME_PORT
                + DOT_CHAR + fieldNameSource1 + FROM + OPEN_PARENTHESIS + sqlForConnections
                + CLOSED_PARENTHESIS + ALIAS_TABLE_NAME_PORT + CLOSED_PARENTHESIS + AND
                + LTRIM_RTRIM + fieldNameTarget2 + END_LTRIM_RTRIM + IN_SQL + OPEN_PARENTHESIS
                + SELECT + ALIAS_TABLE_NAME_PORT + DOT_CHAR + fieldNameSource2 + FROM
                + OPEN_PARENTHESIS + sqlForConnections + CLOSED_PARENTHESIS + ALIAS_TABLE_NAME_PORT
                + CLOSED_PARENTHESIS + AND + LTRIM_RTRIM + fieldNameTarget1 + END_LTRIM_RTRIM
                + EQUALS + LTRIM_RTRIM + SQL_QUOTE + fieldValue + SQL_QUOTE + END_LTRIM_RTRIM
                + GROUP_BY + fieldNameTarget1 + FIELD_SEPARATOR + fieldNameTarget2 + HAVING
                + COUNT_ALL + GRATER_THAN_ZERO;

        this.log.info(SELECT_STATEMENT_MESSAGE + query);

        dataSourceRecordsCount.addTable(tableNameTarget);
        dataSourceRecordsCount.addVirtualField(tableNameTarget, COUNT_FLD_NAME,
            DataSource.DATA_TYPE_INTEGER);
        dataSourceRecordsCount.setApplyVpaRestrictions(false);
        dataSourceRecordsCount.setMaxRecords(0);
        dataSourceRecordsCount.addQuery(query);

        return dataSourceRecordsCount.getRecords();
    }

    /**
     *
     * TODO buildInsertStatement.
     *
     * @param tableNameTo target table where the data will be added
     * @param fieldNamesTo fields list needed for the insert into the target table
     * @param tableNameFrom source table from which the data will be taken
     * @param fieldNamesFrom are the fields from the source table from which data will be extracted
     * @return statement that will be executed
     */
    private StringBuilder buildInsertStatement(final String tableNameTo, final String fieldNamesTo,
            final String tableNameFrom, final String fieldNamesFrom) {

        final StringBuilder insertStatement = new StringBuilder();

        insertStatement.append(INSERT_INTO);
        insertStatement.append(tableNameTo);
        insertStatement.append(OPEN_PARENTHESIS);
        insertStatement.append(fieldNamesTo);
        insertStatement.append(CLOSED_PARENTHESIS);
        insertStatement.append(System.getProperty(NEW_LINE));
        insertStatement.append(SELECT);
        insertStatement.append(fieldNamesFrom);
        insertStatement.append(FROM);
        insertStatement.append(tableNameFrom);

        return insertStatement;
    }

    /**
     *
     * Update Port configuration for network devices standards.
     *
     * @param netdevStdValue value of network device std
     */
    public void updatePortConfigurationForNetdevStd(final String netdevStdValue) {
        try {
            final String updateNetdevPortCfg = UPDATE + PORT_CFG_TABLE + SET + EQ_STD_FLD + EQUALS
                    + LTRIM_RTRIM + NETDEV_STD_FLD + END_LTRIM_RTRIM + WHERE + LTRIM_RTRIM
                    + NETDEV_STD_FLD + END_LTRIM_RTRIM + EQUALS + LTRIM_RTRIM + SQL_QUOTE
                    + netdevStdValue + SQL_QUOTE + END_LTRIM_RTRIM;

            this.log.info(
                UPDATE_STATEMENT_MESSAGE + " for Port Configuration - Network Devices Standards: "
                        + updateNetdevPortCfg);

            SqlUtils.executeUpdate(PORT_CFG_TABLE, updateNetdevPortCfg);
            SqlUtils.commit();
        } catch (final ExceptionBase e) {
            // @non-translatable
            final String errorMessage = String.format(
                "Exception when updating configuration ports for Network devices standards");
            throw new ExceptionBase(errorMessage);
        }

    }

    /**
     *
     * Update port configuration for card standards.
     *
     * @param cardStdValue value of card std
     */
    public void updatePortConfigurationForCardStd(final String cardStdValue) {
        try {
            final String updateCardPortCfg = UPDATE + PORT_CFG_TABLE + SET + EQ_STD_FLD + EQUALS
                    + LTRIM_RTRIM + CARD_STD_FLD + END_LTRIM_RTRIM + WHERE + LTRIM_RTRIM
                    + CARD_STD_FLD + END_LTRIM_RTRIM + EQUALS + LTRIM_RTRIM + SQL_QUOTE
                    + cardStdValue + SQL_QUOTE + END_LTRIM_RTRIM;

            this.log.info(UPDATE_STATEMENT_MESSAGE + " for Port Configuration - Card Standards: "
                    + updateCardPortCfg);
            SqlUtils.executeUpdate(PORT_CFG_TABLE, updateCardPortCfg);
            SqlUtils.commit();
        } catch (final ExceptionBase e) {
            // @non-translatable
            final String errorMessage =
                    String.format("Exception when updating configuration ports for Card Standards");
            throw new ExceptionBase(errorMessage);
        }
    }

    /**
     *
     * Select port configuration for Cards.
     *
     * @return list of records
     */
    public List<DataRecord> selectPortConfigurationForCards() {

        // select p.eq_std, p.card_std from portcfg p, cardstd n
        // where p.card_std = n.card_std

        final String portCfgAlias = "p";
        final String cardAlias = "c";

        final String cardPortCfgSql = SELECT + LTRIM_RTRIM + portCfgAlias + DOT_CHAR + EQ_STD_FLD
                + END_LTRIM_RTRIM + ALIAS + EQ_STD_FLD + FIELD_SEPARATOR + LTRIM_RTRIM
                + portCfgAlias + DOT_CHAR + CARD_STD_FLD + END_LTRIM_RTRIM + ALIAS + CARD_STD_FLD
                + FROM + PORT_CFG_TABLE + ALIAS + portCfgAlias + FIELD_SEPARATOR + CARDSTD_TABLE
                + ALIAS + cardAlias + WHERE + LTRIM_RTRIM + portCfgAlias + DOT_CHAR + CARD_STD_FLD
                + END_LTRIM_RTRIM + EQUALS + LTRIM_RTRIM + cardAlias + DOT_CHAR + CARD_STD_FLD
                + END_LTRIM_RTRIM;

        this.log
            .info(SELECT_STATEMENT_MESSAGE + " for port configuration Cards: " + cardPortCfgSql);

        final DataSource dsPnPort = DataSourceFactory.createDataSource();

        dsPnPort.addTable(PORT_CFG_TABLE);
        dsPnPort.addVirtualField(PORT_CFG_TABLE, EQ_STD_FLD, DataSource.DATA_TYPE_TEXT);
        dsPnPort.addVirtualField(PORT_CFG_TABLE, CARD_STD_FLD, DataSource.DATA_TYPE_TEXT);
        dsPnPort.setApplyVpaRestrictions(false);
        dsPnPort.setMaxRecords(0);
        dsPnPort.addQuery(cardPortCfgSql);

        return dsPnPort.getRecords();
    }

    /**
     *
     * Select port configuration for Netdev.
     *
     * @return list of records
     */
    public List<DataRecord> selectPortConfigurationForNetdev() {
        // select p.eq_std, p.netdev_std from portcfg p, netdevstd n
        // where p.netdev_std = n.netdev_std

        final String portCfgAlias = "p";
        final String netdevAlias = "n";

        final String netdevPortCfgSql = SELECT + portCfgAlias + DOT_CHAR + EQ_STD_FLD
                + FIELD_SEPARATOR + portCfgAlias + DOT_CHAR + NETDEV_STD_FLD + FROM + PORT_CFG_TABLE
                + ALIAS + portCfgAlias + FIELD_SEPARATOR + NETDEVSTD_TABLE + ALIAS + netdevAlias
                + WHERE + portCfgAlias + DOT_CHAR + NETDEV_STD_FLD + EQUALS + netdevAlias + DOT_CHAR
                + NETDEV_STD_FLD;

        this.log.info(SELECT_STATEMENT_MESSAGE + " for Port configuration Network Devices : "
                + netdevPortCfgSql);

        final DataSource dsPnPort = DataSourceFactory.createDataSource();

        dsPnPort.addTable(PORT_CFG_TABLE);
        dsPnPort.addVirtualField(PORT_CFG_TABLE, EQ_STD_FLD, DataSource.DATA_TYPE_TEXT);
        dsPnPort.addVirtualField(PORT_CFG_TABLE, NETDEV_STD_FLD, DataSource.DATA_TYPE_TEXT);
        dsPnPort.setApplyVpaRestrictions(false);
        dsPnPort.setMaxRecords(0);
        dsPnPort.addQuery(netdevPortCfgSql);

        return dsPnPort.getRecords();
    }

    /**
     *
     * TODO insertNeworkDeviceStandardsToEquipmentStandards.
     */

    public void insertNeworkDeviceStandardsToEquipmentStandards() {
        // check each table for duplicate keys
        final List<DataRecord> numberOfRecordsStds =
                getDuplicateKeys(EQSTD_TABLE, EQ_STD_FLD, NETDEVSTD_TABLE, NETDEV_STD_FLD);

        final StringBuilder insertStmt = buildInsertStatement(EQSTD_TABLE,
            FIELDS_EQUIPMENT_STD_FOR_NETWORK_DEVICES, NETDEVSTD_TABLE, FIELDS_NETWORK_DEVICES_STD);

        try {
            if (!numberOfRecordsStds.isEmpty()) {
                final String fields = getListOfIds(numberOfRecordsStds);

                this.log.info(DUPLICATE_MESSAGE + fields);

                insertStmt.append(WHERE + LTRIM_RTRIM + NETDEV_STD_FLD + END_LTRIM_RTRIM + NOT_IN
                        + OPEN_PARENTHESIS + fields + CLOSED_PARENTHESIS);
                this.log.info(INSERT_STATEMENT_MESSAGE
                        + " for Network Devices Standards to Equipment Standards: " + insertStmt);

            }

            SqlUtils.executeUpdate(EQSTD_TABLE, insertStmt.toString());
            SqlUtils.commit();

            final List<DataRecord> sqlPortcfgRecords = selectPortConfigurationForNetdev();

            if (!sqlPortcfgRecords.isEmpty()) {
                for (final DataRecord record : sqlPortcfgRecords) {
                    final String netdevStd =
                            record.getValue(PORT_CFG_TABLE + DOT_CHAR + NETDEV_STD_FLD).toString();
                    updatePortConfigurationForNetdevStd(netdevStd);
                }
            }

        } catch (final ExceptionBase e) {
            // @non-translatable
            final String errorMessage = String.format(
                "Exception when inserting Network Devices Standards to Equipment Standards");
            throw new ExceptionBase(errorMessage);
        }

    }

    /**
     *
     * The method checks if there is already a record having a suffix.
     *
     * @param firstField - first field selected
     * @param secondField - second field selected
     * @param fieldIdValue - value for the primary key e.g. eq_id
     * @param tableName - table name from which the selection is done
     * @param suffix - the suffix after which the search is done, depending on the table selection
     * @return - true if the id with that suffix is found, false otherwise
     */
    public boolean checkSuffix(final String firstField, final String secondField,
            final String fieldIdValue, final String tableName, final String suffix) {
        boolean hasSuffix = false;

        final String suffixSql = SELECT + LTRIM_RTRIM + firstField + END_LTRIM_RTRIM + ALIAS
                + firstField + FIELD_SEPARATOR + LTRIM_RTRIM + secondField + END_LTRIM_RTRIM + ALIAS
                + secondField + FROM + tableName + WHERE + LTRIM_RTRIM + firstField
                + END_LTRIM_RTRIM + EQUALS + LTRIM_RTRIM + SQL_QUOTE + fieldIdValue + SQL_QUOTE
                + CONCATENATE + SQL_QUOTE + suffix + SQL_QUOTE + END_LTRIM_RTRIM;

        this.log.info("SQL for suffix check: " + suffixSql);
        final DataSource dataSource = DataSourceFactory.createDataSource();
        dataSource.addTable(tableName);
        dataSource.addVirtualField(tableName, firstField, DataSource.DATA_TYPE_TEXT);
        dataSource.addVirtualField(tableName, secondField, DataSource.DATA_TYPE_TEXT);
        dataSource.setApplyVpaRestrictions(false);
        dataSource.setMaxRecords(0);
        dataSource.addQuery(suffixSql);

        final List<DataRecord> records = dataSource.getRecords();
        if (!records.isEmpty()) {
            hasSuffix = true;
        } else {
            hasSuffix = false;
        }

        return hasSuffix;
    }

    /**
     *
     * Retrieve duplicate keys having different standards.
     *
     * @return the list of records, having different standards
     */
    public List<DataRecord> getDifferentStandardsForNetworkDevices() {
        // select eq_id, eq_std from eq e, netdev n where e.eq_id = n.netdev_id AND e.eq_std <>
        // n.eq_std
        // Create data source to extract the list of eq_ids available in netdev table, having the
        // standards different
        // If the list is not empty, then there are eq_ids in netdev and eq that have different
        // standards--for these a suffix will be added

        final String aliasEq = " e";
        final String aliasNetdev = " n";
        final DataSource dataSource = DataSourceFactory.createDataSource();
        final String queryNetdev = SELECT + LTRIM_RTRIM + aliasEq + DOT_CHAR + EQ_ID_FLD
                + END_LTRIM_RTRIM + ALIAS + EQ_ID_FLD + FIELD_SEPARATOR + LTRIM_RTRIM + aliasEq
                + DOT_CHAR + EQ_STD_FLD + END_LTRIM_RTRIM + ALIAS + EQ_STD_FLD + FROM + EQ_TABLE
                + ALIAS + aliasEq + FIELD_SEPARATOR + NETDEV_TABLE + ALIAS + aliasNetdev + WHERE
                + LTRIM_RTRIM + aliasEq + DOT_CHAR + EQ_ID_FLD + END_LTRIM_RTRIM + EQUALS
                + LTRIM_RTRIM + aliasNetdev + DOT_CHAR + NETDEV_ID_FLD + END_LTRIM_RTRIM + AND
                + LTRIM_RTRIM + aliasEq + DOT_CHAR + EQ_STD_FLD + END_LTRIM_RTRIM + NOT_EQUAL
                + LTRIM_RTRIM + aliasNetdev + DOT_CHAR + NETDEV_STD_FLD + END_LTRIM_RTRIM;
        this.log.info(SELECT_STATEMENT_MESSAGE + " for network devices with different standards: "
                + queryNetdev);

        dataSource.addTable(EQ_TABLE);
        dataSource.addVirtualField(EQ_TABLE, EQ_ID_FLD, DataSource.DATA_TYPE_TEXT);
        dataSource.addVirtualField(EQ_TABLE, EQ_STD_FLD, DataSource.DATA_TYPE_TEXT);
        dataSource.setApplyVpaRestrictions(false);
        dataSource.setMaxRecords(0);
        dataSource.addQuery(queryNetdev);

        return dataSource.getRecords();
    }

    /**
     *
     * Retrieve duplicate keys having different standards for patch panels. If the list is not
     * empty, then there are eq_ids in netdev and eq that have different standards--for these a
     * suffix will be added
     *
     * @return list of records having different standards for patch panels
     */
    public List<DataRecord> getDifferentStandardsForPatchPanel() {
        // select p.pn_id, p.pn_std
        // from pn p, pb b
        // where p.pn_id = b.pb_id
        // and p.pn_std <> b.pb_std

        final String aliasPn = " p";
        final String aliasPb = " b";
        final DataSource dataSource = DataSourceFactory.createDataSource();
        final String queryPn = SELECT + LTRIM_RTRIM + aliasPn + DOT_CHAR + PN_ID_FLD
                + END_LTRIM_RTRIM + ALIAS + PN_ID_FLD + FIELD_SEPARATOR + LTRIM_RTRIM + aliasPn
                + DOT_CHAR + PN_STD_FLD + END_LTRIM_RTRIM + ALIAS + PN_STD_FLD + FROM + PN_TABLE
                + ALIAS + aliasPn + FIELD_SEPARATOR + PB_TABLE + ALIAS + aliasPb + WHERE
                + LTRIM_RTRIM + aliasPn + DOT_CHAR + PN_ID_FLD + END_LTRIM_RTRIM + EQUALS
                + LTRIM_RTRIM + aliasPb + DOT_CHAR + PB_ID_FLD + END_LTRIM_RTRIM + AND + LTRIM_RTRIM
                + aliasPn + DOT_CHAR + PN_STD_FLD + END_LTRIM_RTRIM + NOT_EQUAL + LTRIM_RTRIM
                + aliasPb + DOT_CHAR + PB_STD_FLD + END_LTRIM_RTRIM;
        this.log.info(
            SELECT_STATEMENT_MESSAGE + " for Patch Panels with different Standards: " + queryPn);

        dataSource.addTable(PN_TABLE);
        dataSource.addVirtualField(PN_TABLE, PN_ID_FLD, DataSource.DATA_TYPE_TEXT);
        dataSource.addVirtualField(PN_TABLE, PN_STD_FLD, DataSource.DATA_TYPE_TEXT);
        dataSource.setApplyVpaRestrictions(false);
        dataSource.setMaxRecords(0);
        dataSource.addQuery(queryPn);

        return dataSource.getRecords();
    }

    /**
     *
     * Method used to retrieve duplicate keys with different standards.
     *
     * @return list of duplicate keys having different standards
     */
    public List<DataRecord> getDifferentStandardsForCards() {
        // select e.eq_id, e.eq_std
        // from eq e, card c
        // where e.eq_id = c.card_id
        // and e.eq_std <> c.card_std
        final String aliasEq = " e";
        final String aliasCard = " c";
        final DataSource dataSource = DataSourceFactory.createDataSource();
        final String queryCards = SELECT + LTRIM_RTRIM + aliasEq + DOT_CHAR + EQ_ID_FLD
                + END_LTRIM_RTRIM + ALIAS + EQ_ID_FLD + FIELD_SEPARATOR + LTRIM_RTRIM + aliasEq
                + DOT_CHAR + EQ_STD_FLD + END_LTRIM_RTRIM + ALIAS + EQ_STD_FLD + FROM + EQ_TABLE
                + ALIAS + aliasEq + FIELD_SEPARATOR + CARD_TABLE + ALIAS + aliasCard + WHERE
                + LTRIM_RTRIM + aliasEq + DOT_CHAR + EQ_ID_FLD + END_LTRIM_RTRIM + EQUALS
                + LTRIM_RTRIM + aliasCard + DOT_CHAR + CARD_ID_FLD + END_LTRIM_RTRIM + AND
                + LTRIM_RTRIM + aliasEq + DOT_CHAR + EQ_STD_FLD + END_LTRIM_RTRIM + NOT_EQUAL
                + LTRIM_RTRIM + aliasCard + DOT_CHAR + CARD_STD_FLD + END_LTRIM_RTRIM;
        this.log
            .info(SELECT_STATEMENT_MESSAGE + " for cards with different standards: " + queryCards);

        dataSource.addTable(EQ_TABLE);
        dataSource.addVirtualField(EQ_TABLE, EQ_ID_FLD, DataSource.DATA_TYPE_TEXT);
        dataSource.addVirtualField(EQ_TABLE, EQ_STD_FLD, DataSource.DATA_TYPE_TEXT);
        dataSource.setApplyVpaRestrictions(false);
        dataSource.setMaxRecords(0);
        dataSource.addQuery(queryCards);

        return dataSource.getRecords();
    }

    /**
     *
     * Retrieves the list of primary keys used for selecting remaining ids from the source table.
     *
     * @param numberOfRecords list of records used for retrieving the remaining records to migrate
     * @return stringBuilder
     */
    public String getListOfIds(final List<DataRecord> numberOfRecords) {
        final StringBuilder fields = new StringBuilder();
        if (!numberOfRecords.isEmpty()) {
            for (int i = 0; i < numberOfRecords.size(); i++) {
                final String recordValue =
                        numberOfRecords.get(i).getFieldValues().get(0).getValue().toString();
                fields.append(LTRIM_RTRIM + SQL_QUOTE + recordValue + SQL_QUOTE + END_LTRIM_RTRIM);
                if (i != numberOfRecords.size() - 1) {
                    fields.append(FIELD_SEPARATOR);
                }
            }
            this.log.info("List of ids: " + fields);
        }

        return fields.toString();
    }

    /**
     *
     * Used for inserting ports, checks if there are ports corresponding to pnport table --the same
     * as in the connection table, based on uphill and downhill positions --needed to check if the
     * ports were migrated or not.
     *
     * @return list of records
     */
    public List<DataRecord> getPunchBlocksIds() {
        final String sqlForPorts = selectPunchBlockIdsAndPorts();

        final DataSource dataSourcePnIdsPorts = DataSourceFactory.createDataSource();

        final String queryRemainingPbIdsPorts = SELECT + LTRIM_RTRIM + PN_ID_FLD + END_LTRIM_RTRIM
                + ALIAS + PN_ID_FLD + FIELD_SEPARATOR + LTRIM_RTRIM + PORT_ID_FLD + END_LTRIM_RTRIM
                + ALIAS + PORT_ID_FLD + FROM + PNPORT_TABLE + WHERE + LTRIM_RTRIM + PN_ID_FLD
                + END_LTRIM_RTRIM + IN_SQL + OPEN_PARENTHESIS + SELECT + LTRIM_RTRIM
                + ALIAS_TABLE_NAME_PORT + DOT_CHAR + PN_ID_FLD + END_LTRIM_RTRIM + FROM
                + OPEN_PARENTHESIS + sqlForPorts + CLOSED_PARENTHESIS + ALIAS_TABLE_NAME_PORT
                + CLOSED_PARENTHESIS + AND + LTRIM_RTRIM + PORT_ID_FLD + END_LTRIM_RTRIM + IN_SQL
                + OPEN_PARENTHESIS + SELECT + LTRIM_RTRIM + ALIAS_TABLE_NAME_PORT + DOT_CHAR
                + PORT_ID_FLD + END_LTRIM_RTRIM + FROM + OPEN_PARENTHESIS + sqlForPorts
                + CLOSED_PARENTHESIS + ALIAS_TABLE_NAME_PORT + CLOSED_PARENTHESIS;

        this.log.info(
            SELECT_STATEMENT_MESSAGE + " for punch block port ids: " + queryRemainingPbIdsPorts);

        dataSourcePnIdsPorts.addTable(AFM_TCCN_TABLE);
        dataSourcePnIdsPorts.addVirtualField(AFM_TCCN_TABLE, PN_ID_FLD, DataSource.DATA_TYPE_TEXT);
        dataSourcePnIdsPorts.addVirtualField(AFM_TCCN_TABLE, PORT_ID_FLD,
            DataSource.DATA_TYPE_TEXT);
        dataSourcePnIdsPorts.setApplyVpaRestrictions(false);
        dataSourcePnIdsPorts.setMaxRecords(0);
        dataSourcePnIdsPorts.addQuery(queryRemainingPbIdsPorts);

        return dataSourcePnIdsPorts.getRecords();
    }

    /**
     *
     * Used for inserting ports, checks if there are ports corresponding to eqport table --the same
     * as in ndport --needed to check if the ports were migrated or not.
     *
     * @return list of records
     */
    public List<DataRecord> getNetworkDeviceIds() {

        // select eq_id, port_id from eqport where eq_id in (select netdev_id from ndport)
        // and port_id in (select port_id from ndport)

        final DataSource dataSourceNetdevIdsPorts = DataSourceFactory.createDataSource();
        final String queryRemainingNetdevIdsPorts = SELECT + LTRIM_RTRIM + EQ_ID_FLD
                + END_LTRIM_RTRIM + ALIAS + EQ_ID_FLD + FIELD_SEPARATOR + LTRIM_RTRIM + PORT_ID_FLD
                + END_LTRIM_RTRIM + ALIAS + PORT_ID_FLD + FROM + EQPORT_TABLE + WHERE + LTRIM_RTRIM
                + EQ_ID_FLD + END_LTRIM_RTRIM + IN_SQL + OPEN_PARENTHESIS + SELECT + LTRIM_RTRIM
                + NETDEV_ID_FLD + END_LTRIM_RTRIM + FROM + NDPORT_TABLE + CLOSED_PARENTHESIS + AND
                + LTRIM_RTRIM + PORT_ID_FLD + END_LTRIM_RTRIM + IN_SQL + OPEN_PARENTHESIS + SELECT
                + LTRIM_RTRIM + PORT_ID_FLD + END_LTRIM_RTRIM + FROM + NDPORT_TABLE
                + CLOSED_PARENTHESIS;

        this.log.info(SELECT_STATEMENT_MESSAGE + " for network devices IDs from ports: "
                + queryRemainingNetdevIdsPorts);

        dataSourceNetdevIdsPorts.addTable(EQPORT_TABLE);
        dataSourceNetdevIdsPorts.addVirtualField(EQPORT_TABLE, EQ_ID_FLD,
            DataSource.DATA_TYPE_TEXT);
        dataSourceNetdevIdsPorts.addVirtualField(EQPORT_TABLE, PORT_ID_FLD,
            DataSource.DATA_TYPE_TEXT);
        dataSourceNetdevIdsPorts.setApplyVpaRestrictions(false);
        dataSourceNetdevIdsPorts.setMaxRecords(0);
        dataSourceNetdevIdsPorts.addQuery(queryRemainingNetdevIdsPorts);

        return dataSourceNetdevIdsPorts.getRecords();
    }

    /**
     *
     * Used for inserting ports, checks if there are ports corresponding to eqport table --the same
     * as in cdport --needed to check if the ports were migrated or not.
     *
     * @return list of records
     */
    public List<DataRecord> getCardIds() {

        // select eq_id, port_id from eqport where eq_id in (select card_id from cdport)
        // and port_id in (select port_id from cdport)

        final DataSource dataSourceCardIdsPorts = DataSourceFactory.createDataSource();
        final String queryRemainingCardIdsPorts = SELECT + LTRIM_RTRIM + EQ_ID_FLD + END_LTRIM_RTRIM
                + ALIAS + EQ_ID_FLD + FIELD_SEPARATOR + LTRIM_RTRIM + PORT_ID_FLD + END_LTRIM_RTRIM
                + ALIAS + PORT_ID_FLD + FROM + EQPORT_TABLE + WHERE + LTRIM_RTRIM + EQ_ID_FLD
                + END_LTRIM_RTRIM + IN_SQL + OPEN_PARENTHESIS + SELECT + LTRIM_RTRIM + CARD_ID_FLD
                + END_LTRIM_RTRIM + ALIAS + CARD_ID_FLD + FROM + CDPORT_TABLE + CLOSED_PARENTHESIS
                + AND + LTRIM_RTRIM + PORT_ID_FLD + END_LTRIM_RTRIM + IN_SQL + OPEN_PARENTHESIS
                + SELECT + LTRIM_RTRIM + PORT_ID_FLD + END_LTRIM_RTRIM + ALIAS + PORT_ID_FLD + FROM
                + CDPORT_TABLE + CLOSED_PARENTHESIS;

        this.log.info(SELECT_STATEMENT_MESSAGE + "for CARD_ID: " + queryRemainingCardIdsPorts);

        dataSourceCardIdsPorts.addTable(EQPORT_TABLE);
        dataSourceCardIdsPorts.addVirtualField(EQPORT_TABLE, EQ_ID_FLD, DataSource.DATA_TYPE_TEXT);
        dataSourceCardIdsPorts.addVirtualField(EQPORT_TABLE, PORT_ID_FLD,
            DataSource.DATA_TYPE_TEXT);
        dataSourceCardIdsPorts.setApplyVpaRestrictions(false);
        dataSourceCardIdsPorts.setMaxRecords(0);
        dataSourceCardIdsPorts.addQuery(queryRemainingCardIdsPorts);

        return dataSourceCardIdsPorts.getRecords();
    }

    /**
     *
     * Retrieves the list of records that were not migrated yet for Punch Blocks.
     *
     * @param fields list of records
     * @return list of data records
     */
    public List<DataRecord> getRemainingPunchBlocksIds(final String fields) {

        final String sqlForPorts = selectPunchBlockIdsAndPorts();

        final DataSource dataSourcePnIds = DataSourceFactory.createDataSource();
        final String queryRemainingPbIds = SELECT + LTRIM_RTRIM + ALIAS_TABLE_NAME_PORT + DOT_CHAR
                + PN_ID_FLD + END_LTRIM_RTRIM + ALIAS + PN_ID_FLD + FROM + OPEN_PARENTHESIS
                + sqlForPorts + CLOSED_PARENTHESIS + ALIAS_TABLE_NAME_PORT + WHERE + LTRIM_RTRIM
                + ALIAS_TABLE_NAME_PORT + DOT_CHAR + PN_ID_FLD + END_LTRIM_RTRIM + NOT_IN
                + OPEN_PARENTHESIS + fields + CLOSED_PARENTHESIS;

        this.log.info("Remaining patch panel ids from pnport that were not migrated yet: "
                + queryRemainingPbIds);

        dataSourcePnIds.addTable(AFM_TCCN_TABLE);
        dataSourcePnIds.addVirtualField(AFM_TCCN_TABLE, PN_ID_FLD, DataSource.DATA_TYPE_TEXT);
        dataSourcePnIds.setApplyVpaRestrictions(false);
        dataSourcePnIds.setMaxRecords(0);
        dataSourcePnIds.addQuery(queryRemainingPbIds);

        return dataSourcePnIds.getRecords();
    }

    /**
     *
     * Retrieves the list of records that were not migrated yet for card ports.
     *
     * @param fields list of records
     * @return list of data records
     */
    public List<DataRecord> getRemainingCardsIdsForPorts(final String fields) {
        // decomment for ports
        final DataSource dataSourceEqs = DataSourceFactory.createDataSource();
        final String queryRemainingCardIds = SELECT + LTRIM_RTRIM + CARD_ID_FLD + END_LTRIM_RTRIM
                + ALIAS + CARD_ID_FLD + FROM + CDPORT_TABLE + WHERE + LTRIM_RTRIM + CARD_ID_FLD
                + END_LTRIM_RTRIM + NOT_IN + OPEN_PARENTHESIS + fields + CLOSED_PARENTHESIS;

        this.log.info("Remaining Card ids from cdport table that were not migrated yet : "
                + queryRemainingCardIds);

        dataSourceEqs.addTable(CARD_TABLE);
        dataSourceEqs.addVirtualField(CARD_TABLE, CARD_ID_FLD, DataSource.DATA_TYPE_TEXT);
        dataSourceEqs.setApplyVpaRestrictions(false);
        dataSourceEqs.setMaxRecords(0);
        dataSourceEqs.addQuery(queryRemainingCardIds);

        return dataSourceEqs.getRecords();
    }

    /**
     *
     * Retrieves the list of port_id keys used for selecting remaining ids from the source table.
     *
     * @param numberOfRecords list of records used for retrieving the remaining records to migrate
     * @return stringBuilder
     */

    public String getListOfPorts(final List<DataRecord> numberOfRecords) {
        final StringBuilder fields = new StringBuilder();
        if (!numberOfRecords.isEmpty()) {
            for (int i = 0; i < numberOfRecords.size(); i++) {
                final String recordValue =
                        numberOfRecords.get(i).getFieldValues().get(1).getValue().toString();

                fields.append(LTRIM_RTRIM + SQL_QUOTE + recordValue + SQL_QUOTE + END_LTRIM_RTRIM);
                if (i != numberOfRecords.size() - 1) {
                    fields.append(FIELD_SEPARATOR);
                }
            }
            this.log.info("List of port ids: " + fields);
        }
        return fields.toString();
    }

    /**
     *
     * Retrieves the list of records that were not migrated yet for network devices .
     *
     * @param fields list of records
     * @return list of data records
     */
    public List<DataRecord> getRemainingNetworkDevicesIds(final String fields) {

        final DataSource dataSourceEqs = DataSourceFactory.createDataSource();
        final String queryRemainingEqIds = SELECT + LTRIM_RTRIM + NETDEV_ID_FLD + END_LTRIM_RTRIM
                + ALIAS + NETDEV_ID_FLD + FROM + NDPORT_TABLE + WHERE + LTRIM_RTRIM + NETDEV_ID_FLD
                + END_LTRIM_RTRIM + NOT_IN + OPEN_PARENTHESIS + fields + CLOSED_PARENTHESIS;

        this.log
            .info("Remaining Netdev_id records that were not migrated yet: " + queryRemainingEqIds);

        dataSourceEqs.addTable(NDPORT_TABLE);
        dataSourceEqs.addVirtualField(NDPORT_TABLE, NETDEV_ID_FLD, DataSource.DATA_TYPE_TEXT);
        dataSourceEqs.setApplyVpaRestrictions(false);
        dataSourceEqs.setMaxRecords(0);
        dataSourceEqs.addQuery(queryRemainingEqIds);

        final List<DataRecord> resultData = dataSourceEqs.getRecords();

        return resultData;
    }

    /**
     *
     * Insert network devices to equipment.
     */
    public void insertNeworkDevicesToEquipment() {

        final List<DataRecord> numberOfRecordsEq =
                getDuplicateKeys(EQ_TABLE, EQ_ID_FLD, NETDEV_TABLE, NETDEV_ID_FLD);

        final String fields = getListOfIds(numberOfRecordsEq);

        final StringBuilder insertStatementForEq = buildInsertStatement(EQ_TABLE,
            FIELDS_EQUIPMENT_NETDEV, NETDEV_TABLE, FIELDS_NETWORK_DEVICES);

        final List<DataRecord> recordsStds = getDifferentStandardsForNetworkDevices();

        // if there are duplicate eq_ids in eq (selected from netdev) but the standards are the same
        // (recordsStds list is empty)
        // the insert will be done only on the remaining records
        // on else if duplicate eq_ids are found and recordsStds list is not empty --than migrate
        // the records as they are
        // and create theinsert for the rest
        try {
            if (!numberOfRecordsEq.isEmpty() && recordsStds.isEmpty()) {
                insertStatementForEq.append(WHERE + LTRIM_RTRIM + NETDEV_ID_FLD + END_LTRIM_RTRIM
                        + NOT_IN + OPEN_PARENTHESIS + fields + CLOSED_PARENTHESIS);
                this.log.info(INSERT_STATEMENT_MESSAGE
                        + " for Network Devices to Equipment, duplicates found: "
                        + insertStatementForEq);
                SqlUtils.executeUpdate(EQ_TABLE, insertStatementForEq.toString());
                SqlUtils.commit();

                final List<DataRecord> resultDataAll = getNetworkDeviceIds();

                final List<DataRecord> resultDataRemainings = getRemainingNetworkDevicesIds(fields);

                if (resultDataAll.isEmpty()) {
                    insertNetworkDevicePortsToEquipmentPort(null, false);
                } else {
                    if (!resultDataRemainings.isEmpty()) {
                        for (final DataRecord record : resultDataRemainings) {
                            final String recordValueEqId = record
                                .getValue(NDPORT_TABLE + DOT_CHAR + NETDEV_ID_FLD).toString();
                            insertNetworkDevicePortsToEquipmentPort(recordValueEqId, false);
                        }
                    }
                }

            } else if (!numberOfRecordsEq.isEmpty() && !recordsStds.isEmpty()) {

                // suffix -NETDEV
                // final List<DataRecord> numberOfRecords =
                // getDuplicateKeys(EQ_TABLE, EQ_ID_FLD, NETDEV_TABLE, NETDEV_ID_FLD);
                for (final DataRecord record : recordsStds) {
                    final String recordValueId =
                            record.getValue(EQ_TABLE + DOT_CHAR + EQ_ID_FLD).toString();
                    final boolean suffixExistsForEq = checkSuffix(EQ_ID_FLD, EQ_STD_FLD,
                        recordValueId, EQ_TABLE, SUFFIX_NETDEV);
                    final String recordWithSuffix =
                            recordValueId + SQL_QUOTE + SUFFIX_NETDEV + SQL_QUOTE;

                    // check if the records are already migrated with a suffix
                    if (!suffixExistsForEq && recordWithSuffix.length() <= MAX_NO_CHARS_EQUIPM) {
                        final StringBuilder insertStmtForDuplicateWithSuffix =
                                buildInsertStatement(EQ_TABLE, FIELDS_EQUIPMENT_NETDEV,
                                    NETDEV_TABLE, FIELDS_NETWORK_DEVICES_SUFFIX);

                        insertStmtForDuplicateWithSuffix.append(WHERE + LTRIM_RTRIM + NETDEV_ID_FLD
                                + END_LTRIM_RTRIM + EQUALS + SQL_QUOTE + recordValueId + SQL_QUOTE);

                        this.log.info(INSERT_STATEMENT_MESSAGE
                                + " for Network Devices to Equipment with suffix: "
                                + insertStmtForDuplicateWithSuffix);
                        SqlUtils.executeUpdate(EQ_TABLE,
                            insertStmtForDuplicateWithSuffix.toString());
                        SqlUtils.commit();

                        insertNetworkDevicePortsToEquipmentPort(recordValueId, true);
                    } else if (suffixExistsForEq
                            && recordWithSuffix.length() <= MAX_NO_CHARS_EQUIPM) {
                        insertNetworkDevicePortsToEquipmentPort(recordValueId, true);
                    }
                }

                insertStatementForEq.append(WHERE + LTRIM_RTRIM + NETDEV_ID_FLD + END_LTRIM_RTRIM
                        + NOT_IN + OPEN_PARENTHESIS + fields + CLOSED_PARENTHESIS);
                this.log.info(
                    INSERT_STATEMENT_MESSAGE + " for Network Devices to Equipment remaining ids: "
                            + insertStatementForEq);
                SqlUtils.executeUpdate(EQ_TABLE, insertStatementForEq.toString());
                SqlUtils.commit();

                final List<DataRecord> resultDataAll = getNetworkDeviceIds();

                final List<DataRecord> resultDataRemainings = getRemainingNetworkDevicesIds(fields);

                if (resultDataAll.isEmpty()) {
                    insertNetworkDevicePortsToEquipmentPort(null, false);
                } else {
                    if (!resultDataRemainings.isEmpty()) {
                        for (final DataRecord record : resultDataRemainings) {
                            final String recordValueEqId = record
                                .getValue(NDPORT_TABLE + DOT_CHAR + NETDEV_ID_FLD).toString();
                            insertNetworkDevicePortsToEquipmentPort(recordValueEqId, false);
                        }
                    }
                }

            } else if (numberOfRecordsEq.isEmpty()) {
                this.log.info(INSERT_STATEMENT_MESSAGE + " for Network Devices to Equipment: "
                        + insertStatementForEq);
                SqlUtils.executeUpdate(EQ_TABLE, insertStatementForEq.toString());
                SqlUtils.commit();

                insertNetworkDevicePortsToEquipmentPort(null, false);
            }
        } catch (final ExceptionBase e) {
            // @non-translatable
            final String errorMessage =
                    String.format("Exception when inserting Network Devices to Equipment");
            throw new ExceptionBase(errorMessage);
        }

    }

    /**
     *
     * The method inserts devices ports into equipment ports.
     *
     * @param eqIdValue primary key eq_id
     * @param withSuffix in case network devices has a duplicate eq_id with different standard, the
     *            value of withSuffix is true, otherwise it will be false
     */
    public void insertNetworkDevicePortsToEquipmentPort(final String eqIdValue,
            final boolean withSuffix) {
        final List<DataRecord> numberOfRecordsEqPort = getDuplicateKeysWithDoublePK(EQPORT_TABLE,
            EQ_ID_FLD, PORT_ID_FLD, NDPORT_TABLE, NETDEV_ID_FLD, PORT_ID_FLD, eqIdValue);
        this.log.info("List of duplicate records: " + numberOfRecordsEqPort);

        final StringBuilder insertStatementForEqPort =
                buildInsertStatement(EQPORT_TABLE, FIELDS_EQPORT, NDPORT_TABLE, FIELDS_NDPORT);

        final boolean suffixExistsEqport =
                checkSuffix(EQ_ID_FLD, PORT_ID_FLD, eqIdValue, EQPORT_TABLE, SUFFIX_NETDEV);

        // check the list of all eq_ids and check if there are differences in eq standard table.
        // if there are eq_ids duplicate in eq table AND if the standards is empty(all have the same
        // standsrd), this means no migration is needed for that eq_id
        // the migration will check the remaining records
        // eq table for that record
        try {
            if (!suffixExistsEqport && withSuffix) {

                final StringBuilder insertStatementForEqPortWithSuffix = buildInsertStatement(
                    EQPORT_TABLE, FIELDS_EQPORT, NDPORT_TABLE, FIELDS_NDPORT_SUFFIX);
                insertStatementForEqPortWithSuffix
                    .append(WHERE + LTRIM_RTRIM + NETDEV_ID_FLD + END_LTRIM_RTRIM + EQUALS
                            + SQL_QUOTE + eqIdValue + SQL_QUOTE)
                    .append(AND + LTRIM_RTRIM + PORT_ID_FLD + END_LTRIM_RTRIM + NOT_NULL);

                this.log.info(INSERT_STATEMENT_MESSAGE
                        + " for Network Devices Ports to Equipment port with suffix: "
                        + insertStatementForEqPortWithSuffix);

                SqlUtils.executeUpdate(EQPORT_TABLE, insertStatementForEqPortWithSuffix.toString());
                SqlUtils.commit();
            } else if (!numberOfRecordsEqPort.isEmpty() && eqIdValue != null && !withSuffix) {
                final String fields = getListOfPorts(numberOfRecordsEqPort);

                insertStatementForEqPort
                    .append(WHERE + LTRIM_RTRIM + NETDEV_ID_FLD + END_LTRIM_RTRIM + EQUALS
                            + SQL_QUOTE + eqIdValue + SQL_QUOTE)
                    .append(AND + LTRIM_RTRIM + PORT_ID_FLD + END_LTRIM_RTRIM + NOT_IN
                            + OPEN_PARENTHESIS + fields + CLOSED_PARENTHESIS)
                    .append(AND + PORT_ID_FLD + NOT_NULL);
                this.log.info(INSERT_STATEMENT_MESSAGE
                        + " for Network Devices Ports to Equipment port, duplicates found: "
                        + insertStatementForEqPort);
                SqlUtils.executeUpdate(EQPORT_TABLE, insertStatementForEqPort.toString());
                SqlUtils.commit();

            } else if (numberOfRecordsEqPort.isEmpty() && eqIdValue != null) {

                insertStatementForEqPort
                    .append(WHERE + LTRIM_RTRIM + NETDEV_ID_FLD + END_LTRIM_RTRIM + EQUALS
                            + SQL_QUOTE + eqIdValue + SQL_QUOTE)
                    .append(AND + LTRIM_RTRIM + PORT_ID_FLD + END_LTRIM_RTRIM + NOT_NULL);

                this.log.info(INSERT_STATEMENT_MESSAGE
                        + " for Network Devices Ports to Equipment port, eq_id not null: "
                        + insertStatementForEqPort);
                SqlUtils.executeUpdate(EQPORT_TABLE, insertStatementForEqPort.toString());
                SqlUtils.commit();
            } else if (numberOfRecordsEqPort.isEmpty()) {

                insertStatementForEqPort
                    .append(WHERE + LTRIM_RTRIM + PORT_ID_FLD + END_LTRIM_RTRIM + NOT_NULL);
                this.log.info(
                    INSERT_STATEMENT_MESSAGE + " for Network Devices Ports to Equipment port: "
                            + insertStatementForEqPort);
                SqlUtils.executeUpdate(EQPORT_TABLE, insertStatementForEqPort.toString());
                SqlUtils.commit();
            }
        } catch (final ExceptionBase e) {
            // @non-translatable
            final String errorMessage = String
                .format("Exception when inserting Network Devices Ports to Equipment Ports");
            throw new ExceptionBase(errorMessage);
        }

    }

    /**
     *
     * Defines the sub-select used when retrieving ports.
     *
     * @return the sql query used in method buildVirtualTablePbPorts and getRemainingPunchBlocksIds
     */
    private String selectPunchBlockIdsAndPorts() {

        /*
         * SELECT + UPHILL_KEY_FLD + ALIAS + PN_ID_FLD + FIELD_SEPARATOR + UPHILL_POSITION_FLD +
         * ALIAS + PORT_ID_FLD + FROM + AFM_TCCN_TABLE + WHERE + UPHILL_TABLE_FLD + EQUALS +
         * SQL_QUOTE + PB_TABLE + SQL_QUOTE + UNION + SELECT + DOWNHILL_KEY_FLD + ALIAS + PN_ID_FLD
         * + FIELD_SEPARATOR + DOWNHILL_POSITION_FLD + ALIAS + PORT_ID_FLD + FROM + AFM_TCCN_TABLE +
         * WHERE + DOWNHILL_TABLE_FLD + EQUALS + SQL_QUOTE + PB_TABLE + SQL_QUOTE
         */

        final String sqlForPorts = SELECT + LTRIM_RTRIM + UPHILL_KEY_FLD + END_LTRIM_RTRIM + ALIAS
                + PN_ID_FLD + FIELD_SEPARATOR + LTRIM_RTRIM + UPHILL_POSITION_FLD + END_LTRIM_RTRIM
                + ALIAS + PORT_ID_FLD + FROM + AFM_TCCN_TABLE + WHERE + LTRIM_RTRIM
                + UPHILL_TABLE_FLD + END_LTRIM_RTRIM + EQUALS + SQL_QUOTE + PB_TABLE + SQL_QUOTE
                + AND + LTRIM_RTRIM + UPHILL_KEY_FLD + END_LTRIM_RTRIM + NOT_NULL + AND
                + LTRIM_RTRIM + UPHILL_POSITION_FLD + END_LTRIM_RTRIM + NOT_NULL + UNION + SELECT
                + LTRIM_RTRIM + DOWNHILL_KEY_FLD + END_LTRIM_RTRIM + ALIAS + PN_ID_FLD
                + FIELD_SEPARATOR + LTRIM_RTRIM + DOWNHILL_POSITION_FLD + END_LTRIM_RTRIM + ALIAS
                + PORT_ID_FLD + FROM + AFM_TCCN_TABLE + WHERE + LTRIM_RTRIM + DOWNHILL_TABLE_FLD
                + END_LTRIM_RTRIM + EQUALS + SQL_QUOTE + PB_TABLE + SQL_QUOTE + AND + LTRIM_RTRIM
                + DOWNHILL_KEY_FLD + END_LTRIM_RTRIM + NOT_NULL + AND + LTRIM_RTRIM
                + DOWNHILL_POSITION_FLD + END_LTRIM_RTRIM + NOT_NULL;

        return sqlForPorts;
    }

    /**
     *
     * Insert Punch Blocks to Patch Panels.
     */
    public void insertPunchBlocksToPatchPanels() {
        final List<DataRecord> numberOfRecordsPn =
                getDuplicateKeys(PN_TABLE, PN_ID_FLD, PB_TABLE, PB_ID_FLD);

        final StringBuilder insertStatementForPn =
                buildInsertStatement(PN_TABLE, FIELDS_PATCH_PANEL, PB_TABLE, FIELDS_PUNCH_BLOCKS);

        // select eq_id, eq_std from eq e, netdev n where e.eq_id = n.netdev_id AND e.eq_std <>
        // n.eq_std
        // Create data source to extract the list of eq_ids available in netdev table, having the
        // standards different
        // If the list is not empty, then there are eq_ids in netdev and eq that have different
        // standards--for these a suffix will be added

        final List<DataRecord> recordsStds = getDifferentStandardsForPatchPanel();

        // if there are duplicate eq_ids in eq (selected from netdev) but the standards are the same
        // (recordsStds list is empty)
        // the insert will be done only on the remaining records
        // on else if duplicate eq_ids are found and recordsStds list is not empty --than migrate
        // the records as they are
        // and create the insert for the rest
        try {
            if (!numberOfRecordsPn.isEmpty() && recordsStds.isEmpty()) {
                final String fields = getListOfIds(numberOfRecordsPn);

                insertStatementForPn.append(WHERE + LTRIM_RTRIM + PB_ID_FLD + END_LTRIM_RTRIM
                        + NOT_IN + OPEN_PARENTHESIS + fields + CLOSED_PARENTHESIS);
                this.log.info(
                    INSERT_STATEMENT_MESSAGE + " for Punch Block to Patch Panel, with duplicates : "
                            + insertStatementForPn);
                SqlUtils.executeUpdate(PN_TABLE, insertStatementForPn.toString());
                SqlUtils.commit();

                // decomment for ports

                final List<DataRecord> resultDataAll = getPunchBlocksIds();

                final List<DataRecord> resultDataRemainings = getRemainingPunchBlocksIds(fields);

                if (resultDataAll.isEmpty()) {
                    insertPunchBlockPositionsToPatchPanelPorts(null, false);
                } else {
                    if (!resultDataRemainings.isEmpty()) {
                        for (final DataRecord record : resultDataRemainings) {
                            final String recordValuePnId = record
                                .getValue(AFM_TCCN_TABLE + DOT_CHAR + PN_ID_FLD).toString();
                            insertPunchBlockPositionsToPatchPanelPorts(recordValuePnId, false);
                        }
                    }
                }

            } else if (!numberOfRecordsPn.isEmpty() && !recordsStds.isEmpty()) {

                for (final DataRecord record : recordsStds) {
                    final String recordValueId =
                            record.getValue(PN_TABLE + DOT_CHAR + PN_ID_FLD).toString();

                    final boolean suffixExistsForPn = checkSuffix(PN_ID_FLD, PN_STD_FLD,
                        recordValueId, PN_TABLE, SUFFIX_PATCH_PANEL);

                    final String recordWithSuffix =
                            recordValueId + SQL_QUOTE + SUFFIX_PATCH_PANEL + SQL_QUOTE;

                    // check if the records are already migrated with a suffix
                    if (!suffixExistsForPn
                            && recordWithSuffix.length() <= MAX_NO_CHARS_PATCH_PANEL) {

                        final StringBuilder insertStmtForDuplicateWithSuffix = buildInsertStatement(
                            PN_TABLE, FIELDS_PATCH_PANEL, PB_TABLE, FIELDS_PATCH_PANEL_SUFFIX);

                        insertStmtForDuplicateWithSuffix.append(WHERE + LTRIM_RTRIM + PB_ID_FLD
                                + END_LTRIM_RTRIM + EQUALS + SQL_QUOTE + recordValueId + SQL_QUOTE);
                        this.log.info(INSERT_STATEMENT_MESSAGE
                                + " for Punch Block to Patch Panel, with suffix : "
                                + insertStmtForDuplicateWithSuffix);
                        SqlUtils.executeUpdate(PN_TABLE,
                            insertStmtForDuplicateWithSuffix.toString());
                        SqlUtils.commit();

                        insertPunchBlockPositionsToPatchPanelPorts(recordValueId, true);

                    } else if (suffixExistsForPn
                            && recordWithSuffix.length() <= MAX_NO_CHARS_PATCH_PANEL) {
                        insertPunchBlockPositionsToPatchPanelPorts(recordValueId, true);
                    }

                }

                final String fields = getListOfIds(numberOfRecordsPn);

                insertStatementForPn.append(WHERE + LTRIM_RTRIM + PB_ID_FLD + END_LTRIM_RTRIM
                        + NOT_IN + OPEN_PARENTHESIS + fields + CLOSED_PARENTHESIS);
                this.log.info(
                    INSERT_STATEMENT_MESSAGE + " for Punch Block to Patch Panel, remaining ids: "
                            + insertStatementForPn);
                SqlUtils.executeUpdate(PN_TABLE, insertStatementForPn.toString());
                SqlUtils.commit();

                final List<DataRecord> resultDataAll = getPunchBlocksIds();

                final List<DataRecord> resultDataRemainings = getRemainingPunchBlocksIds(fields);

                if (resultDataAll.isEmpty()) {
                    insertPunchBlockPositionsToPatchPanelPorts(null, false);
                } else {
                    if (!resultDataRemainings.isEmpty()) {
                        for (final DataRecord record : resultDataRemainings) {
                            final String recordValuePnId = record
                                .getValue(AFM_TCCN_TABLE + DOT_CHAR + PN_ID_FLD).toString();
                            insertPunchBlockPositionsToPatchPanelPorts(recordValuePnId, false);
                        }
                    }
                }

                // port insertion

            } else if (numberOfRecordsPn.isEmpty()) {
                this.log.info(INSERT_STATEMENT_MESSAGE + " for Punch Block to Patch Panel: "
                        + insertStatementForPn);
                SqlUtils.executeUpdate(PN_TABLE, insertStatementForPn.toString());
                SqlUtils.commit();

                insertPunchBlockPositionsToPatchPanelPorts(null, false);
            }
        } catch (final ExceptionBase e) {
            // @non-translatable
            final String errorMessage =
                    String.format("Exception when inserting Punch Block to Patch Panels");
            throw new ExceptionBase(errorMessage);
        }

    }

    /**
     *
     * TODO insertPunchBlockStandardsToPatchPanelStandards.
     */
    public void insertPunchBlockStandardsToPatchPanelStandards() {

        // check each table for duplicate keys
        final List<DataRecord> numberOfRecordsStds =
                getDuplicateKeys(PNSTD_TABLE, PN_STD_FLD, PBSTD_TABLE, PB_STD_FLD);

        final StringBuilder insertStmt =
                buildInsertStatement(PNSTD_TABLE, FIELDS_PN_STD, PBSTD_TABLE, FIELDS_PB_STD);
        try {
            if (!numberOfRecordsStds.isEmpty()) {
                final String fields = getListOfIds(numberOfRecordsStds);
                this.log.info(PNSTD_TABLE + FIELD_SEPARATOR + DUPLICATE_MESSAGE + fields);

                insertStmt.append(WHERE + LTRIM_RTRIM + PB_STD_FLD + END_LTRIM_RTRIM + NOT_IN
                        + OPEN_PARENTHESIS + fields + CLOSED_PARENTHESIS);
                this.log.info(INSERT_STATEMENT_MESSAGE
                        + " for Punch Block Standards to Patch Panel Standards: " + insertStmt);

            }
            SqlUtils.executeUpdate(PNSTD_TABLE, insertStmt.toString());
            SqlUtils.commit();
        } catch (final ExceptionBase e) {
            // @non-translatable
            final String errorMessage = String
                .format("Exception when inserting Punch Block Standards to Patch Panel Standards");
            throw new ExceptionBase(errorMessage);
        }

    }

    /**
     *
     * Method used for .
     *
     * @return the query for connections tables used for inserting ports
     */
    private String buildVirtualTablePbPorts() {
        // select pn_id, port_id from
        // (
        // SELECT UPHILL_KEY as pn_id ,UPHILL_POSITION as port_id
        // FROM AFM_TCCN
        // WHERE UPHILL_TABLE = 'pb'
        // AND UPHILL_KEY IS NOT NULL
        // AND UPHILL_POSITION IS NOT NULL

        // UNION

        // SELECT DOWNHILL_KEY as pn_id, DOWNHILL_POSITION as port_id
        // FROM AFM_TCCN
        // WHERE DOWNHILL_TABLE = 'pb'
        // AND DOWNHILL_KEY IS NOT NULL
        // AND DOWNHILL_POSITION IS NOT NULL
        // ) tblPort

        final String sqlForPorts = selectPunchBlockIdsAndPorts();

        final String queryPortRecords =
                OPEN_PARENTHESIS + sqlForPorts + CLOSED_PARENTHESIS + ALIAS_TABLE_NAME_PORT;

        return queryPortRecords;
    }

    /**
     *
     * TODO insertPunchBlockPositionsToPatchPanelPorts.
     *
     * @param pbIdValue value of pb_id primary key
     * @param withSuffix true if suffix is needed, false otherwise
     */
    public void insertPunchBlockPositionsToPatchPanelPorts(final String pbIdValue,
            final boolean withSuffix) {

        // check for any null values

        /*
         * INSERT INTO pnport (pn_id,port_id) SELECT DISTINCT 'PB19H',position FROM ((SELECT
         * DISTINCT downhill_position AS position FROM afm_tccn WHERE downhill_key='PB19H') UNION
         * (SELECT DISTINCT uphill_position AS position FROM afm_tccn WHERE uphill_key='PB19H')) AS
         * pnport order by position
         */

        final List<DataRecord> numberOfRecordsPnPort = getDuplicateKeysForPatchPanelPorts(
            PNPORT_TABLE, PN_ID_FLD, PORT_ID_FLD, PN_ID_FLD, PORT_ID_FLD, pbIdValue);
        this.log.info(DUPLICATE_MESSAGE + numberOfRecordsPnPort);

        final String queryPortRecords = buildVirtualTablePbPorts();

        final StringBuilder insertStatementForPnPort =
                buildInsertStatement(PNPORT_TABLE, FIELD_PN_PORT, queryPortRecords, FIELD_PB_PORT);

        final boolean suffixExistsPnport =
                checkSuffix(PN_ID_FLD, PORT_ID_FLD, pbIdValue, PNPORT_TABLE, SUFFIX_PATCH_PANEL);

        // check the list of all eq_ids and check if there are differences in eq standard table.
        // if there are eq_ids duplicate in eq table AND if the standards is empty(all have the same
        // standsrd), this means no migration is needed for that eq_id
        // the migration will check the remaining records
        // eq table for that record
        try {
            if (!suffixExistsPnport && withSuffix) {

                final StringBuilder insertStatementForPnPortWithSuffix = buildInsertStatement(
                    PNPORT_TABLE, FIELD_PN_PORT, queryPortRecords, FIELD_PB_PORT_SUFFIX);
                insertStatementForPnPortWithSuffix.append(WHERE + LTRIM_RTRIM + PN_ID_FLD
                        + END_LTRIM_RTRIM + EQUALS + SQL_QUOTE + pbIdValue + SQL_QUOTE);

                this.log.info(INSERT_STATEMENT_MESSAGE
                        + " for Punch Block Positions to Patch Panel ports, with suffix: "
                        + insertStatementForPnPortWithSuffix);

                SqlUtils.executeUpdate(PNPORT_TABLE, insertStatementForPnPortWithSuffix.toString());
                SqlUtils.commit();
            } else if (!numberOfRecordsPnPort.isEmpty() && pbIdValue != null && !withSuffix) {
                final String fields = getListOfPorts(numberOfRecordsPnPort);

                insertStatementForPnPort
                    .append(WHERE + LTRIM_RTRIM + PN_ID_FLD + END_LTRIM_RTRIM + EQUALS + SQL_QUOTE
                            + pbIdValue + SQL_QUOTE)
                    .append(AND + LTRIM_RTRIM + PORT_ID_FLD + END_LTRIM_RTRIM + NOT_IN
                            + OPEN_PARENTHESIS + fields + CLOSED_PARENTHESIS);

                this.log.info(INSERT_STATEMENT_MESSAGE
                        + " for Punch Block Positions to Patch Panel ports, for duplicates: "
                        + insertStatementForPnPort);

                SqlUtils.executeUpdate(PNPORT_TABLE, insertStatementForPnPort.toString());
                SqlUtils.commit();

            } else if (numberOfRecordsPnPort.isEmpty() && pbIdValue != null) {

                insertStatementForPnPort.append(WHERE + LTRIM_RTRIM + PN_ID_FLD + END_LTRIM_RTRIM
                        + EQUALS + SQL_QUOTE + pbIdValue + SQL_QUOTE);
                this.log.info(INSERT_STATEMENT_MESSAGE
                        + " for Punch Block Positions to Patch Panel ports, positions not null: "
                        + insertStatementForPnPort);
                SqlUtils.executeUpdate(PNPORT_TABLE, insertStatementForPnPort.toString());
                SqlUtils.commit();
            } else if (numberOfRecordsPnPort.isEmpty()) {
                this.log.info(
                    INSERT_STATEMENT_MESSAGE + " for Punch Block Positions to Patch Panel ports: "
                            + insertStatementForPnPort);
                SqlUtils.executeUpdate(PNPORT_TABLE, insertStatementForPnPort.toString());
                SqlUtils.commit();
            }
        } catch (final ExceptionBase e) {
            // @non-translatable
            final String errorMessage = String
                .format("Exception when inserting Punch Block Positions to Patch Panel Ports");
            throw new ExceptionBase(errorMessage);
        }

    }

    /**
     * The method will insert cards to equipment.
     */
    public void insertCardsToEquipment() {

        final List<DataRecord> numberOfRecordsEq =
                getDuplicateKeys(EQ_TABLE, EQ_ID_FLD, CARD_TABLE, CARD_ID_FLD);

        final StringBuilder insertStatementForEq =
                buildInsertStatement(EQ_TABLE, FIELDS_EQUIPMENT_CARD, CARD_TABLE, FIELDS_CARD);

        // if there are duplicate eq_ids in eq (selected from netdev) but the standards are the same
        // (recordsStds list is empty)
        // the insert will be done only on the remaining records
        // on else if duplicate eq_ids are found and recordsStds list is not empty --than migrate
        // the records as they are
        // and create theinsert for the rest

        final List<DataRecord> recordsStds = getDifferentStandardsForCards();
        try {
            if (!numberOfRecordsEq.isEmpty() && recordsStds.isEmpty()) {

                final String fields = getListOfIds(numberOfRecordsEq);

                insertStatementForEq.append(WHERE + LTRIM_RTRIM + CARD_ID_FLD + END_LTRIM_RTRIM
                        + NOT_IN + OPEN_PARENTHESIS + fields + CLOSED_PARENTHESIS);
                this.log.info(
                    INSERT_STATEMENT_MESSAGE + " for Card to Equipment: " + insertStatementForEq);
                SqlUtils.executeUpdate(EQ_TABLE, insertStatementForEq.toString());
                SqlUtils.commit();

                // decomment for ports

                final List<DataRecord> resultDataAll = getCardIds();

                final List<DataRecord> resultDataRemainings = getRemainingCardsIdsForPorts(fields);

                if (resultDataAll.isEmpty()) {
                    insertCardPortsToEquipmentPorts(null, false);
                } else {
                    if (!resultDataRemainings.isEmpty()) {
                        for (final DataRecord record : resultDataRemainings) {
                            final String recordValueEqId = record
                                .getValue(CDPORT_TABLE + DOT_CHAR + CARD_ID_FLD).toString();
                            insertCardPortsToEquipmentPorts(recordValueEqId, false);
                        }
                    }
                }

            } else if (!numberOfRecordsEq.isEmpty() && !recordsStds.isEmpty()) {

                // suffix -NETDEV
                for (final DataRecord record : recordsStds) {
                    final String recordValueId =
                            record.getValue(EQ_TABLE + DOT_CHAR + EQ_ID_FLD).toString();
                    this.log
                        .info("numberOfRecords not empty, recordsStds not empty: " + recordValueId);

                    final boolean suffixExistsForEq = checkSuffix(EQ_ID_FLD, EQ_STD_FLD,
                        recordValueId, EQ_TABLE, SUFFIX_CARD);

                    final String recordWithSuffix =
                            recordValueId + SQL_QUOTE + SUFFIX_CARD + SQL_QUOTE;
                    // check if the records are already migrated with a suffix
                    if (!suffixExistsForEq && recordWithSuffix.length() <= MAX_NO_CHARS_EQUIPM) {

                        final StringBuilder insertStmtForDuplicateWithSuffix = buildInsertStatement(
                            EQ_TABLE, FIELDS_EQUIPMENT_CARD, CARD_TABLE, FIELDS_CARD_SUFFIX);

                        insertStmtForDuplicateWithSuffix.append(WHERE + LTRIM_RTRIM + CARD_ID_FLD
                                + END_LTRIM_RTRIM + EQUALS + SQL_QUOTE + recordValueId + SQL_QUOTE);
                        this.log
                            .info(INSERT_STATEMENT_MESSAGE + " for Card to Equipment with suffix: "
                                    + insertStmtForDuplicateWithSuffix);
                        SqlUtils.executeUpdate(EQ_TABLE,
                            insertStmtForDuplicateWithSuffix.toString());
                        SqlUtils.commit();

                        insertCardPortsToEquipmentPorts(recordValueId, true);
                    } else if (suffixExistsForEq
                            && recordWithSuffix.length() <= MAX_NO_CHARS_EQUIPM) {
                        insertCardPortsToEquipmentPorts(recordValueId, true);
                    }

                }

                final String fields = getListOfIds(numberOfRecordsEq);

                insertStatementForEq.append(WHERE + LTRIM_RTRIM + CARD_ID_FLD + END_LTRIM_RTRIM
                        + NOT_IN + OPEN_PARENTHESIS + fields + CLOSED_PARENTHESIS);
                this.log.info(INSERT_STATEMENT_MESSAGE + " for Card to Equipment remainings: "
                        + insertStatementForEq);
                SqlUtils.executeUpdate(EQ_TABLE, insertStatementForEq.toString());
                SqlUtils.commit();

                // decomment for ports

                final List<DataRecord> resultDataAll = getCardIds();

                final List<DataRecord> resultDataRemainings = getRemainingCardsIdsForPorts(fields);

                if (resultDataAll.isEmpty()) {
                    insertCardPortsToEquipmentPorts(null, false);
                } else {
                    if (!resultDataRemainings.isEmpty()) {
                        for (final DataRecord record : resultDataRemainings) {
                            final String recordValueEqId = record
                                .getValue(CDPORT_TABLE + DOT_CHAR + CARD_ID_FLD).toString();
                            insertCardPortsToEquipmentPorts(recordValueEqId, false);
                        }
                    }
                }

            } else if (numberOfRecordsEq.isEmpty()) {
                this.log.info(
                    INSERT_STATEMENT_MESSAGE + " for Card to Equipment: " + insertStatementForEq);
                SqlUtils.executeUpdate(EQ_TABLE, insertStatementForEq.toString());
                SqlUtils.commit();

                insertCardPortsToEquipmentPorts(null, false);
            }
        } catch (final ExceptionBase e) {
            // @non-translatable
            final String errorMessage =
                    String.format("Exception when inserting Cards to Equipment");
            throw new ExceptionBase(errorMessage);
        }

    }

    /**
     *
     * TODO insertCardStandardsToEquipmentStandards.
     */
    public void insertCardStandardsToEquipmentStandards() {

        final List<DataRecord> numberOfRecordsStds =
                getDuplicateKeys(EQSTD_TABLE, EQ_STD_FLD, CARDSTD_TABLE, CARD_STD_FLD);

        final StringBuilder insertStmt =
                buildInsertStatement(EQSTD_TABLE, FIELDS_EQ_STD, CARDSTD_TABLE, FIELDS_CARD_STD);
        try {
            if (!numberOfRecordsStds.isEmpty()) {
                final String fields = getListOfIds(numberOfRecordsStds);

                insertStmt.append(WHERE + LTRIM_RTRIM + CARD_STD_FLD + END_LTRIM_RTRIM + NOT_IN
                        + OPEN_PARENTHESIS + fields + CLOSED_PARENTHESIS);
                this.log.info(INSERT_STATEMENT_MESSAGE
                        + " for Card Standards to Equipment Standards: " + insertStmt);

            }
            SqlUtils.executeUpdate(EQSTD_TABLE, insertStmt.toString());
            SqlUtils.commit();

            final List<DataRecord> sqlPortcfgRecords = selectPortConfigurationForCards();

            if (!sqlPortcfgRecords.isEmpty()) {
                for (final DataRecord record : sqlPortcfgRecords) {
                    final String cardStdValue =
                            record.getValue(PORT_CFG_TABLE + DOT_CHAR + CARD_STD_FLD).toString();
                    updatePortConfigurationForCardStd(cardStdValue);
                }
            }

        } catch (final ExceptionBase e) {
            // @non-translatable
            final String errorMessage =
                    String.format("Exception when inserting Card Standards to Equipment Standards");
            throw new ExceptionBase(errorMessage);
        }
    }

    /**
     *
     * TODO insertCardPortsToEquipmentPorts.
     *
     * @param eqIdValue
     * @param withSuffix
     */
    public void insertCardPortsToEquipmentPorts(final String eqIdValue, final boolean withSuffix) {
        final List<DataRecord> numberOfRecordsEqPort = getDuplicateKeysWithDoublePK(EQPORT_TABLE,
            EQ_ID_FLD, PORT_ID_FLD, CDPORT_TABLE, CARD_ID_FLD, PORT_ID_FLD, eqIdValue);
        this.log.info(DUPLICATE_MESSAGE + numberOfRecordsEqPort);

        final StringBuilder insertStatementForEqPort = buildInsertStatement(EQPORT_TABLE,
            FIELDS_EQPORT_FOR_CARDS, CDPORT_TABLE, FIELDS_CARD_PORTS);

        final boolean suffixExistsEqport =
                checkSuffix(EQ_ID_FLD, PORT_ID_FLD, eqIdValue, EQPORT_TABLE, SUFFIX_CARD);

        // check the list of all eq_ids and check if there are differences in eq standard table.
        // if there are eq_ids duplicate in eq table AND if the standards is empty(all have the same
        // standsrd), this means no migration is needed for that eq_id
        // the migration will check the remaining records
        // eq table for that record
        try {
            if (!suffixExistsEqport && withSuffix) {

                final StringBuilder insertStatementForEqPortWithSuffix = buildInsertStatement(
                    EQPORT_TABLE, FIELDS_EQPORT_FOR_CARDS, CDPORT_TABLE, FIELDS_CARD_PORTS_SUFFIX);
                insertStatementForEqPortWithSuffix.append(WHERE + LTRIM_RTRIM + CARD_ID_FLD
                        + END_LTRIM_RTRIM + EQUALS + SQL_QUOTE + eqIdValue + SQL_QUOTE)
                    .append(AND + PORT_ID_FLD + NOT_NULL);

                this.log.info(
                    INSERT_STATEMENT_MESSAGE + " for Card Ports to equipment ports with suffix: "
                            + insertStatementForEqPortWithSuffix);

                SqlUtils.executeUpdate(EQPORT_TABLE, insertStatementForEqPortWithSuffix.toString());
                SqlUtils.commit();
            } else if (!numberOfRecordsEqPort.isEmpty() && eqIdValue != null && !withSuffix) {
                final String fields = getListOfPorts(numberOfRecordsEqPort);

                insertStatementForEqPort
                    .append(WHERE + LTRIM_RTRIM + CARD_ID_FLD + END_LTRIM_RTRIM + EQUALS + SQL_QUOTE
                            + eqIdValue + SQL_QUOTE)
                    .append(AND + LTRIM_RTRIM + PORT_ID_FLD + END_LTRIM_RTRIM + NOT_IN
                            + OPEN_PARENTHESIS + fields + CLOSED_PARENTHESIS)
                    .append(AND + LTRIM_RTRIM + PORT_ID_FLD + END_LTRIM_RTRIM + NOT_NULL);
                this.log.info(INSERT_STATEMENT_MESSAGE
                        + "for Card Ports to equipment ports when duplicates are found: "
                        + insertStatementForEqPort);
                SqlUtils.executeUpdate(EQPORT_TABLE, insertStatementForEqPort.toString());
                SqlUtils.commit();

            } else if (numberOfRecordsEqPort.isEmpty() && eqIdValue != null) {

                insertStatementForEqPort.append(WHERE + LTRIM_RTRIM + CARD_ID_FLD + END_LTRIM_RTRIM
                        + EQUALS + SQL_QUOTE + eqIdValue + SQL_QUOTE)
                    .append(AND + PORT_ID_FLD + NOT_NULL);
                this.log.info(
                    INSERT_STATEMENT_MESSAGE + " for Card Ports to Equipment, eq_id not null: "
                            + insertStatementForEqPort);
                SqlUtils.executeUpdate(EQPORT_TABLE, insertStatementForEqPort.toString());
                SqlUtils.commit();
            } else if (numberOfRecordsEqPort.isEmpty()) {
                insertStatementForEqPort
                    .append(WHERE + LTRIM_RTRIM + PORT_ID_FLD + END_LTRIM_RTRIM + NOT_NULL);
                this.log.info(INSERT_STATEMENT_MESSAGE
                        + " for Card Ports to Equipment, bulk insert: " + insertStatementForEqPort);

                SqlUtils.executeUpdate(EQPORT_TABLE, insertStatementForEqPort.toString());
                SqlUtils.commit();

            }
        } catch (final ExceptionBase e) {
            // @non-translatable
            final String errorMessage = String
                .format("Exception when inserting Card ports to Equipment Ports " + e.getMessage());
            throw new ExceptionBase(errorMessage);
        }
    }

    /**
     *
     * SQL for updating eq table, records extracted from afm_tccn table - connections.
     *
     * @return list of records
     */
    public List<DataRecord> getSqlForUpdateEquipment() {

        // SELECT DOWNHILL_TABLE, DOWNHILL_KEY,CASE WHEN DOWNHILL_TABLE='pb' THEN DOWNHILL_POSITION
        // ELSE DOWNHILL_KEY END as DOWNHILL_VALUE,
        // UPHILL_TABLE, UPHILL_KEY, CASE WHEN UPHILL_TABLE='pb' THEN UPHILL_POSITION ELSE
        // UPHILL_KEY END as UPHILL_VALUE
        // FROM AFM_TCCN WHERE
        // UPHILL_TABLE NOT IN ('ca','cp','port')
        // AND DOWNHILL_TABLE IN ('netdev', 'eq', 'card')
        final String eqUpdateSql = SELECT + LTRIM_RTRIM + DOWNHILL_TABLE_FLD + END_LTRIM_RTRIM
                + ALIAS + DOWNHILL_TABLE_FLD + FIELD_SEPARATOR + LTRIM_RTRIM + DOWNHILL_KEY_FLD
                + END_LTRIM_RTRIM + ALIAS + DOWNHILL_KEY_FLD + FIELD_SEPARATOR + CASE_WHEN
                + LTRIM_RTRIM + DOWNHILL_TABLE_FLD + END_LTRIM_RTRIM + EQUALS + SQL_QUOTE + PB_TABLE
                + SQL_QUOTE + THEN + LTRIM_RTRIM + DOWNHILL_POSITION_FLD + END_LTRIM_RTRIM + ELSE
                + LTRIM_RTRIM + DOWNHILL_KEY_FLD + END_LTRIM_RTRIM + END + ALIAS + DOWNHILL_VALUE
                + FIELD_SEPARATOR + LTRIM_RTRIM + UPHILL_TABLE_FLD + END_LTRIM_RTRIM + ALIAS
                + UPHILL_TABLE_FLD + FIELD_SEPARATOR + LTRIM_RTRIM + UPHILL_KEY_FLD
                + END_LTRIM_RTRIM + ALIAS + UPHILL_KEY_FLD + FIELD_SEPARATOR + CASE_WHEN
                + LTRIM_RTRIM + UPHILL_TABLE_FLD + END_LTRIM_RTRIM + EQUALS + SQL_QUOTE + PB_TABLE
                + SQL_QUOTE + THEN + LTRIM_RTRIM + UPHILL_POSITION_FLD + END_LTRIM_RTRIM + ELSE
                + LTRIM_RTRIM + UPHILL_KEY_FLD + END_LTRIM_RTRIM + END + ALIAS + UPHILL_VALUE + FROM
                + AFM_TCCN_TABLE + WHERE + LTRIM_RTRIM + UPHILL_TABLE_FLD + END_LTRIM_RTRIM + NOT_IN
                + OPEN_PARENTHESIS + TABLES_NOT_MIGRATED + CLOSED_PARENTHESIS + AND + LTRIM_RTRIM
                + DOWNHILL_TABLE_FLD + END_LTRIM_RTRIM + IN_SQL + OPEN_PARENTHESIS + SQL_QUOTE
                + NETDEV_TABLE + SQL_QUOTE + FIELD_SEPARATOR + SQL_QUOTE + EQ_TABLE + SQL_QUOTE
                + FIELD_SEPARATOR + SQL_QUOTE + CARD_TABLE + SQL_QUOTE + CLOSED_PARENTHESIS;

        this.log
            .info(SELECT_STATEMENT_MESSAGE + " for updating Equipment connections: " + eqUpdateSql);

        final DataSource dsEquipment = DataSourceFactory.createDataSource();

        dsEquipment.addTable(AFM_TCCN_TABLE);
        dsEquipment.addVirtualField(AFM_TCCN_TABLE, DOWNHILL_TABLE_FLD, DataSource.DATA_TYPE_TEXT);
        dsEquipment.addVirtualField(AFM_TCCN_TABLE, DOWNHILL_KEY_FLD, DataSource.DATA_TYPE_TEXT);
        dsEquipment.addVirtualField(AFM_TCCN_TABLE, DOWNHILL_VALUE, DataSource.DATA_TYPE_TEXT);
        dsEquipment.addVirtualField(AFM_TCCN_TABLE, UPHILL_TABLE_FLD, DataSource.DATA_TYPE_TEXT);
        dsEquipment.addVirtualField(AFM_TCCN_TABLE, UPHILL_KEY_FLD, DataSource.DATA_TYPE_TEXT);
        dsEquipment.addVirtualField(AFM_TCCN_TABLE, UPHILL_VALUE, DataSource.DATA_TYPE_TEXT);

        dsEquipment.setApplyVpaRestrictions(false);
        dsEquipment.setMaxRecords(0);
        dsEquipment.addQuery(eqUpdateSql);

        return dsEquipment.getRecords();
    }

    /**
     *
     * SQL for updating eqport table, records extracted from afm_tccn table - connections.
     *
     * @return list of records
     */
    public List<DataRecord> getSqlForUpdateEquipmentPort() {

        // SELECT DOWNHILL_TABLE, DOWNHILL_KEY,CASE WHEN DOWNHILL_TABLE='pb' THEN DOWNHILL_POSITION
        // ELSE DOWNHILL_KEY END as DOWNHILL_VALUE,
        // UPHILL_TABLE, UPHILL_KEY, CASE WHEN UPHILL_TABLE='pb' THEN UPHILL_POSITION ELSE
        // UPHILL_KEY END as UPHILL_VALUE
        // FROM AFM_TCCN WHERE
        // UPHILL_TABLE NOT IN ('ca','cp','port')
        // AND DOWNHILL_TABLE IN ('ndport', 'eqport', 'cdport')

        final String eqPortUpdateSql = SELECT + LTRIM_RTRIM + DOWNHILL_TABLE_FLD + END_LTRIM_RTRIM
                + ALIAS + DOWNHILL_TABLE_FLD + FIELD_SEPARATOR + LTRIM_RTRIM + DOWNHILL_KEY_FLD
                + END_LTRIM_RTRIM + ALIAS + DOWNHILL_KEY_FLD + FIELD_SEPARATOR + CASE_WHEN
                + LTRIM_RTRIM + DOWNHILL_TABLE_FLD + END_LTRIM_RTRIM + EQUALS + SQL_QUOTE + PB_TABLE
                + SQL_QUOTE + THEN + LTRIM_RTRIM + DOWNHILL_POSITION_FLD + END_LTRIM_RTRIM + ELSE
                + LTRIM_RTRIM + DOWNHILL_KEY_FLD + END_LTRIM_RTRIM + END + ALIAS + DOWNHILL_VALUE
                + FIELD_SEPARATOR + LTRIM_RTRIM + UPHILL_TABLE_FLD + END_LTRIM_RTRIM + ALIAS
                + UPHILL_TABLE_FLD + FIELD_SEPARATOR + LTRIM_RTRIM + UPHILL_KEY_FLD
                + END_LTRIM_RTRIM + ALIAS + UPHILL_KEY_FLD + FIELD_SEPARATOR + CASE_WHEN
                + LTRIM_RTRIM + UPHILL_TABLE_FLD + END_LTRIM_RTRIM + EQUALS + SQL_QUOTE + PB_TABLE
                + SQL_QUOTE + THEN + LTRIM_RTRIM + UPHILL_POSITION_FLD + END_LTRIM_RTRIM + ELSE
                + LTRIM_RTRIM + UPHILL_KEY_FLD + END_LTRIM_RTRIM + END + ALIAS + UPHILL_VALUE + FROM
                + AFM_TCCN_TABLE + WHERE + LTRIM_RTRIM + UPHILL_TABLE_FLD + END_LTRIM_RTRIM + NOT_IN
                + OPEN_PARENTHESIS + TABLES_NOT_MIGRATED + CLOSED_PARENTHESIS + AND + LTRIM_RTRIM
                + DOWNHILL_TABLE_FLD + END_LTRIM_RTRIM + IN_SQL + OPEN_PARENTHESIS + SQL_QUOTE
                + NDPORT_TABLE + SQL_QUOTE + FIELD_SEPARATOR + SQL_QUOTE + EQPORT_TABLE + SQL_QUOTE
                + FIELD_SEPARATOR + SQL_QUOTE + CDPORT_TABLE + SQL_QUOTE + CLOSED_PARENTHESIS;

        this.log.info(SELECT_STATEMENT_MESSAGE + " for updating Equipment Ports Connections: "
                + eqPortUpdateSql);

        final DataSource dsEquipmentPort = DataSourceFactory.createDataSource();

        dsEquipmentPort.addTable(AFM_TCCN_TABLE);
        dsEquipmentPort.addVirtualField(AFM_TCCN_TABLE, DOWNHILL_TABLE_FLD,
            DataSource.DATA_TYPE_TEXT);
        dsEquipmentPort.addVirtualField(AFM_TCCN_TABLE, DOWNHILL_KEY_FLD,
            DataSource.DATA_TYPE_TEXT);
        dsEquipmentPort.addVirtualField(AFM_TCCN_TABLE, DOWNHILL_VALUE, DataSource.DATA_TYPE_TEXT);
        dsEquipmentPort.addVirtualField(AFM_TCCN_TABLE, UPHILL_TABLE_FLD,
            DataSource.DATA_TYPE_TEXT);
        dsEquipmentPort.addVirtualField(AFM_TCCN_TABLE, UPHILL_KEY_FLD, DataSource.DATA_TYPE_TEXT);
        dsEquipmentPort.addVirtualField(AFM_TCCN_TABLE, UPHILL_VALUE, DataSource.DATA_TYPE_TEXT);
        dsEquipmentPort.setApplyVpaRestrictions(false);
        dsEquipmentPort.setMaxRecords(0);
        dsEquipmentPort.addQuery(eqPortUpdateSql);

        this.log.info("Equipment PORT query: " + eqPortUpdateSql);

        return dsEquipmentPort.getRecords();
    }

    /**
     *
     * SQL for updating jk table, records extracted from afm_tccn table - connections.
     *
     * @return list of records
     */
    public List<DataRecord> getSqlForUpdateJacks() {

        // SELECT DOWNHILL_TABLE, DOWNHILL_KEY,CASE WHEN DOWNHILL_TABLE='pb' THEN DOWNHILL_POSITION
        // ELSE DOWNHILL_KEY END as DOWNHILL_VALUE,
        // UPHILL_TABLE, UPHILL_KEY, CASE WHEN UPHILL_TABLE='pb' THEN UPHILL_POSITION ELSE
        // UPHILL_KEY END as UPHILL_VALUE
        // FROM AFM_TCCN WHERE
        // UPHILL_TABLE NOT IN ('ca','cp','port')
        // AND DOWNHILL_TABLE = 'jk'
        final DataSource dsJacks = DataSourceFactory.createDataSource();

        final String jkTableSql = SELECT + LTRIM_RTRIM + DOWNHILL_TABLE_FLD + END_LTRIM_RTRIM
                + ALIAS + DOWNHILL_TABLE_FLD + FIELD_SEPARATOR + LTRIM_RTRIM + DOWNHILL_KEY_FLD
                + END_LTRIM_RTRIM + ALIAS + DOWNHILL_KEY_FLD + FIELD_SEPARATOR + CASE_WHEN
                + LTRIM_RTRIM + DOWNHILL_TABLE_FLD + END_LTRIM_RTRIM + EQUALS + SQL_QUOTE + PB_TABLE
                + SQL_QUOTE + THEN + LTRIM_RTRIM + DOWNHILL_POSITION_FLD + END_LTRIM_RTRIM + ELSE
                + LTRIM_RTRIM + DOWNHILL_KEY_FLD + END_LTRIM_RTRIM + END + ALIAS + DOWNHILL_VALUE
                + FIELD_SEPARATOR + LTRIM_RTRIM + UPHILL_TABLE_FLD + END_LTRIM_RTRIM + ALIAS
                + UPHILL_TABLE_FLD + FIELD_SEPARATOR + LTRIM_RTRIM + UPHILL_KEY_FLD
                + END_LTRIM_RTRIM + ALIAS + UPHILL_KEY_FLD + FIELD_SEPARATOR + CASE_WHEN
                + LTRIM_RTRIM + UPHILL_TABLE_FLD + END_LTRIM_RTRIM + EQUALS + SQL_QUOTE + PB_TABLE
                + SQL_QUOTE + THEN + LTRIM_RTRIM + UPHILL_POSITION_FLD + END_LTRIM_RTRIM + ELSE
                + LTRIM_RTRIM + UPHILL_KEY_FLD + END_LTRIM_RTRIM + END + ALIAS + UPHILL_VALUE + FROM
                + AFM_TCCN_TABLE + WHERE + LTRIM_RTRIM + UPHILL_TABLE_FLD + END_LTRIM_RTRIM + NOT_IN
                + OPEN_PARENTHESIS + TABLES_NOT_MIGRATED + CLOSED_PARENTHESIS + AND + LTRIM_RTRIM
                + DOWNHILL_TABLE_FLD + END_LTRIM_RTRIM + EQUALS + SQL_QUOTE + JK_TABLE + SQL_QUOTE;

        this.log.info(SELECT_STATEMENT_MESSAGE + " for updating Jacks connections: " + jkTableSql);

        dsJacks.addTable(AFM_TCCN_TABLE);
        dsJacks.addVirtualField(AFM_TCCN_TABLE, DOWNHILL_TABLE_FLD, DataSource.DATA_TYPE_TEXT);
        dsJacks.addVirtualField(AFM_TCCN_TABLE, DOWNHILL_KEY_FLD, DataSource.DATA_TYPE_TEXT);
        dsJacks.addVirtualField(AFM_TCCN_TABLE, DOWNHILL_VALUE, DataSource.DATA_TYPE_TEXT);
        dsJacks.addVirtualField(AFM_TCCN_TABLE, UPHILL_TABLE_FLD, DataSource.DATA_TYPE_TEXT);
        dsJacks.addVirtualField(AFM_TCCN_TABLE, UPHILL_KEY_FLD, DataSource.DATA_TYPE_TEXT);
        dsJacks.addVirtualField(AFM_TCCN_TABLE, UPHILL_VALUE, DataSource.DATA_TYPE_TEXT);
        dsJacks.setApplyVpaRestrictions(false);
        dsJacks.setMaxRecords(0);
        dsJacks.addQuery(jkTableSql);

        return dsJacks.getRecords();
    }

    /**
     *
     * SQL for updating pnport table, records extracted from afm_tccn table - connections.
     *
     * @return list of records
     */
    public List<DataRecord> getSqlForUpdatePatchPanelPorts() {

        // SELECT DOWNHILL_TABLE, DOWNHILL_KEY,CASE WHEN DOWNHILL_TABLE='pb' THEN DOWNHILL_POSITION
        // ELSE DOWNHILL_KEY END as DOWNHILL_VALUE,
        // UPHILL_TABLE, UPHILL_KEY, CASE WHEN UPHILL_TABLE='pb' THEN UPHILL_POSITION ELSE
        // UPHILL_KEY END as UPHILL_VALUE
        // FROM AFM_TCCN WHERE
        // UPHILL_TABLE NOT IN ('ca','cp','port')
        // AND DOWNHILL_TABLE = 'pnport'

        final String eqPortUpdateSql = SELECT + LTRIM_RTRIM + DOWNHILL_TABLE_FLD + END_LTRIM_RTRIM
                + ALIAS + DOWNHILL_TABLE_FLD + FIELD_SEPARATOR + LTRIM_RTRIM + DOWNHILL_KEY_FLD
                + END_LTRIM_RTRIM + ALIAS + DOWNHILL_KEY_FLD + FIELD_SEPARATOR + CASE_WHEN
                + LTRIM_RTRIM + DOWNHILL_TABLE_FLD + END_LTRIM_RTRIM + EQUALS + SQL_QUOTE + PB_TABLE
                + SQL_QUOTE + THEN + LTRIM_RTRIM + DOWNHILL_POSITION_FLD + END_LTRIM_RTRIM + ELSE
                + LTRIM_RTRIM + DOWNHILL_KEY_FLD + END_LTRIM_RTRIM + END + ALIAS + DOWNHILL_VALUE
                + FIELD_SEPARATOR + LTRIM_RTRIM + UPHILL_TABLE_FLD + END_LTRIM_RTRIM + ALIAS
                + UPHILL_TABLE_FLD + FIELD_SEPARATOR + LTRIM_RTRIM + UPHILL_KEY_FLD
                + END_LTRIM_RTRIM + ALIAS + UPHILL_KEY_FLD + FIELD_SEPARATOR + CASE_WHEN
                + LTRIM_RTRIM + UPHILL_TABLE_FLD + END_LTRIM_RTRIM + EQUALS + SQL_QUOTE + PB_TABLE
                + SQL_QUOTE + THEN + LTRIM_RTRIM + UPHILL_POSITION_FLD + END_LTRIM_RTRIM + ELSE
                + LTRIM_RTRIM + UPHILL_KEY_FLD + END_LTRIM_RTRIM + END + ALIAS + UPHILL_VALUE + FROM
                + AFM_TCCN_TABLE + WHERE + LTRIM_RTRIM + UPHILL_TABLE_FLD + END_LTRIM_RTRIM + NOT_IN
                + OPEN_PARENTHESIS + TABLES_NOT_MIGRATED + CLOSED_PARENTHESIS + AND + LTRIM_RTRIM
                + DOWNHILL_TABLE_FLD + END_LTRIM_RTRIM + EQUALS + SQL_QUOTE + PNPORT_TABLE
                + SQL_QUOTE;

        this.log.info(SELECT_STATEMENT_MESSAGE + " for updating Patch Panel Port Connections: "
                + eqPortUpdateSql);

        final DataSource dsPnPort = DataSourceFactory.createDataSource();

        dsPnPort.addTable(AFM_TCCN_TABLE);
        dsPnPort.addVirtualField(AFM_TCCN_TABLE, DOWNHILL_TABLE_FLD, DataSource.DATA_TYPE_TEXT);
        dsPnPort.addVirtualField(AFM_TCCN_TABLE, DOWNHILL_KEY_FLD, DataSource.DATA_TYPE_TEXT);
        dsPnPort.addVirtualField(AFM_TCCN_TABLE, DOWNHILL_VALUE, DataSource.DATA_TYPE_TEXT);
        dsPnPort.addVirtualField(AFM_TCCN_TABLE, UPHILL_TABLE_FLD, DataSource.DATA_TYPE_TEXT);
        dsPnPort.addVirtualField(AFM_TCCN_TABLE, UPHILL_KEY_FLD, DataSource.DATA_TYPE_TEXT);
        dsPnPort.addVirtualField(AFM_TCCN_TABLE, UPHILL_VALUE, DataSource.DATA_TYPE_TEXT);
        dsPnPort.setApplyVpaRestrictions(false);
        dsPnPort.setMaxRecords(0);
        dsPnPort.addQuery(eqPortUpdateSql);

        return dsPnPort.getRecords();
    }

    /**
     *
     * Retrieve all migrated network devices and issue an update on tc_area_level field with 'TA'
     * value.
     *
     * @return list of records
     */
    public List<DataRecord> getAllNetworkDevicesAndCardsInEquipment() {
        final DataSource dataSourceEqs = DataSourceFactory.createDataSource();
        final String percentSign = "%";

        // select eq_id, tc_area_level from eq
        // where eq_id in (select netdev_id from netdev)
        // OR eq_id like '%_NETDEV'
        // OR eq_id in (select card_id from card)
        // OR eq_id like '%_CARD'

        final String queryAllNetworkDev = SELECT + LTRIM_RTRIM + EQ_ID_FLD + END_LTRIM_RTRIM + ALIAS
                + EQ_ID_FLD + FIELD_SEPARATOR + LTRIM_RTRIM + TC_AREA_LEVEL + END_LTRIM_RTRIM
                + ALIAS + TC_AREA_LEVEL + FROM + EQ_TABLE + WHERE + LTRIM_RTRIM + EQ_ID_FLD
                + END_LTRIM_RTRIM + IN_SQL + OPEN_PARENTHESIS + SELECT + LTRIM_RTRIM + NETDEV_ID_FLD
                + END_LTRIM_RTRIM + FROM + NETDEV_TABLE + CLOSED_PARENTHESIS + OR_SQL + LTRIM_RTRIM
                + EQ_ID_FLD + END_LTRIM_RTRIM + LIKE + SQL_QUOTE + percentSign + SUFFIX_NETDEV
                + SQL_QUOTE + OR_SQL + LTRIM_RTRIM + EQ_ID_FLD + END_LTRIM_RTRIM + IN_SQL
                + OPEN_PARENTHESIS + SELECT + LTRIM_RTRIM + CARD_ID_FLD + END_LTRIM_RTRIM + FROM
                + CARD_TABLE + CLOSED_PARENTHESIS + OR_SQL + LTRIM_RTRIM + EQ_ID_FLD
                + END_LTRIM_RTRIM + LIKE + SQL_QUOTE + percentSign + SUFFIX_CARD + SQL_QUOTE;

        this.log.info(
            SELECT_STATEMENT_MESSAGE + " for Network devices Telecom Area: " + queryAllNetworkDev);

        dataSourceEqs.addTable(EQ_TABLE);
        dataSourceEqs.addVirtualField(EQ_TABLE, EQ_ID_FLD, DataSource.DATA_TYPE_TEXT);
        dataSourceEqs.addVirtualField(EQ_TABLE, TC_AREA_LEVEL, DataSource.DATA_TYPE_TEXT);
        dataSourceEqs.setApplyVpaRestrictions(false);
        dataSourceEqs.setMaxRecords(0);
        dataSourceEqs.addQuery(queryAllNetworkDev);

        return dataSourceEqs.getRecords();
    }

    /**
     *
     * Get all network devices and card standards to update the telecom area field.
     *
     * @return list of records
     */
    public List<DataRecord> getAllNetdevAndCardsStandards() {

        // select eq_std, tc_area_level from eqstd
        // where eq_std in (select netdev_std from netdevstd)
        // OR eq_std in (select card_std from cardstd)

        final DataSource dataSource = DataSourceFactory.createDataSource();

        final String queryNetdevCardStd = SELECT + LTRIM_RTRIM + EQ_STD_FLD + END_LTRIM_RTRIM
                + ALIAS + EQ_STD_FLD + FIELD_SEPARATOR + LTRIM_RTRIM + TC_AREA_LEVEL
                + END_LTRIM_RTRIM + ALIAS + TC_AREA_LEVEL + FROM + EQSTD_TABLE + WHERE + LTRIM_RTRIM
                + EQ_STD_FLD + END_LTRIM_RTRIM + IN_SQL + OPEN_PARENTHESIS + SELECT + NETDEV_STD_FLD
                + FROM + NETDEVSTD_TABLE + CLOSED_PARENTHESIS + OR_SQL + LTRIM_RTRIM + EQ_STD_FLD
                + END_LTRIM_RTRIM + IN_SQL + OPEN_PARENTHESIS + SELECT + CARD_STD_FLD + FROM
                + CARDSTD_TABLE + CLOSED_PARENTHESIS;

        this.log.info(SELECT_STATEMENT_MESSAGE
                + " for all network devices and card standards for Telecom Area: "
                + queryNetdevCardStd);

        dataSource.addTable(EQSTD_TABLE);
        dataSource.addVirtualField(EQSTD_TABLE, EQ_STD_FLD, DataSource.DATA_TYPE_TEXT);
        dataSource.addVirtualField(EQSTD_TABLE, TC_AREA_LEVEL, DataSource.DATA_TYPE_TEXT);
        dataSource.setApplyVpaRestrictions(false);
        dataSource.setMaxRecords(0);
        dataSource.addQuery(queryNetdevCardStd);

        return dataSource.getRecords();

    }

    /**
     *
     * Update field tc_area_level for equipment table.
     */
    public void updateTelecomArea() {
        final String telecomAreaValue = "TA";

        final List<DataRecord> recordsStd = getAllNetdevAndCardsStandards();

        for (final DataRecord recordStd : recordsStd) {
            final String eqStd = recordStd.getValue(EQSTD_TABLE + DOT_CHAR + EQ_STD_FLD).toString();

            final String updateStatementStd = UPDATE + EQSTD_TABLE + SET + TC_AREA_LEVEL + EQUALS
                    + SQL_QUOTE + telecomAreaValue + SQL_QUOTE + WHERE + LTRIM_RTRIM + EQ_STD_FLD
                    + END_LTRIM_RTRIM + EQUALS + SQL_QUOTE + eqStd + SQL_QUOTE;

            this.log.info(UPDATE_STATEMENT_MESSAGE
                    + " for Equipment standards, Telecom Area - tc_area_level: "
                    + updateStatementStd);

            SqlUtils.executeUpdate(EQ_TABLE, updateStatementStd);
            SqlUtils.commit();
        }

        final List<DataRecord> recordsEq = getAllNetworkDevicesAndCardsInEquipment();

        for (final DataRecord record : recordsEq) {
            final String eqIdValue = record.getValue(EQ_TABLE + DOT_CHAR + EQ_ID_FLD).toString();

            final String updateStatement = UPDATE + EQ_TABLE + SET + TC_AREA_LEVEL + EQUALS
                    + SQL_QUOTE + telecomAreaValue + SQL_QUOTE + WHERE + LTRIM_RTRIM + EQ_ID_FLD
                    + END_LTRIM_RTRIM + EQUALS + SQL_QUOTE + eqIdValue + SQL_QUOTE;

            this.log.info(UPDATE_STATEMENT_MESSAGE
                    + " for Equipment, Telecom Area - tc_area_level: " + updateStatement);

            SqlUtils.executeUpdate(EQ_TABLE, updateStatement);
            SqlUtils.commit();
        }

    }

    /**
     *
     * Update equipment with values taken from connections table.
     */
    public void updateConnectionsForEquipment() {

        // select downhill_table, downhill_key, case when downhill_table = 'pb' then
        // downhill_position else downhill_key end AS downhill_value,
        // uphill_table, uphill_key, case when uphill_table = 'pb' then uphill_position else
        // uphill_key end AS uphill_value
        // FROM afm_tccn
        // WHERE uphill_table NOT IN ('ca','cp','port')
        // and downhill_table in ('netdev','eq', 'card')

        final List<DataRecord> records = getSqlForUpdateEquipment();
        try {
            if (!records.isEmpty()) {
                for (final DataRecord record : records) {

                    final String downhillKey = record
                        .getValue(AFM_TCCN_TABLE + DOT_CHAR + DOWNHILL_KEY_FLD).toString();

                    final String uphillTable = record
                        .getValue(AFM_TCCN_TABLE + DOT_CHAR + UPHILL_TABLE_FLD).toString();
                    final String uphillKey =
                            record.getValue(AFM_TCCN_TABLE + DOT_CHAR + UPHILL_KEY_FLD).toString();
                    final String uphillValue =
                            record.getValue(AFM_TCCN_TABLE + DOT_CHAR + UPHILL_VALUE).toString();

                    if (uphillTable.equals(JK_TABLE)) {
                        // UPDATE eq (uphill_table) SET tc_eq_id = ‘PN19’ (downhill_key)
                        // WHERE jk_id = ‘HQ-19-115B-D’ (uphill_key)

                        final String updateEquipment = UPDATE + EQ_TABLE + SET + TC_JK_ID + EQUALS
                                + LTRIM_RTRIM + SQL_QUOTE + uphillKey + SQL_QUOTE + END_LTRIM_RTRIM
                                + WHERE + LTRIM_RTRIM + EQ_ID_FLD + END_LTRIM_RTRIM + EQUALS
                                + LTRIM_RTRIM + SQL_QUOTE + downhillKey + SQL_QUOTE
                                + END_LTRIM_RTRIM;

                        this.log.info(UPDATE_STATEMENT_MESSAGE + " for Equipment, update tc_jk_id:"
                                + updateEquipment);

                        SqlUtils.executeUpdate(EQ_TABLE, updateEquipment);
                        SqlUtils.commit();

                    } else if (uphillTable.equals(EQ_TABLE) || uphillTable.equals(NETDEV_TABLE)
                            || uphillTable.equals(CARD_TABLE)) {

                        // UPDATE eq (uphill_table) SET tc_eq_id = ‘PN19’ (downhill_key)
                        // WHERE jk_id = ‘HQ-19-115B-D’ (uphill_key)

                        final String updateEquipment = UPDATE + EQ_TABLE + SET + TC_EQ_ID + EQUALS
                                + LTRIM_RTRIM + SQL_QUOTE + uphillKey + SQL_QUOTE + END_LTRIM_RTRIM
                                + WHERE + LTRIM_RTRIM + EQ_ID_FLD + END_LTRIM_RTRIM + EQUALS
                                + LTRIM_RTRIM + SQL_QUOTE + downhillKey + SQL_QUOTE
                                + END_LTRIM_RTRIM;

                        this.log.info(UPDATE_STATEMENT_MESSAGE + " for Equipment, update tc_eq_id:"
                                + updateEquipment);

                        SqlUtils.executeUpdate(EQ_TABLE, updateEquipment);
                        SqlUtils.commit();

                    } else if (uphillTable.equals(EQPORT_TABLE) || uphillTable.equals(NDPORT_TABLE)
                            || uphillTable.equals(CDPORT_TABLE)) {

                        // UPDATE eq (downhill_table) SET tc_eq_id = ‘PN19’ (first part of
                        // uphill_key),
                        // tc_eqport_id=’19’ (second part of uphill key)
                        // WHERE eq_id = ‘HQ-19-115B-D’ (downhill_key)

                        final List<String> listPortsUphill =
                                Arrays.asList(uphillKey.split(SPLIT_PATTERN));
                        final List<String> listPortsDownhill =
                                Arrays.asList(uphillKey.split(SPLIT_PATTERN));

                        final String updateEquipment = UPDATE + EQ_TABLE + SET + TC_EQ_ID + EQUALS
                                + LTRIM_RTRIM + SQL_QUOTE + listPortsUphill.get(0).toString()
                                + SQL_QUOTE + END_LTRIM_RTRIM + FIELD_SEPARATOR + TC_EQPORT_ID
                                + EQUALS + LTRIM_RTRIM + SQL_QUOTE
                                + listPortsUphill.get(1).toString() + SQL_QUOTE + END_LTRIM_RTRIM
                                + WHERE + LTRIM_RTRIM + EQ_ID_FLD + END_LTRIM_RTRIM + EQUALS
                                + LTRIM_RTRIM + SQL_QUOTE + listPortsDownhill.get(0).toString()
                                + SQL_QUOTE + END_LTRIM_RTRIM + AND + LTRIM_RTRIM + PORT_ID_FLD
                                + END_LTRIM_RTRIM + EQUALS + LTRIM_RTRIM + SQL_QUOTE
                                + listPortsDownhill.get(1).toString() + SQL_QUOTE + END_LTRIM_RTRIM;

                        this.log.info(UPDATE_STATEMENT_MESSAGE
                                + " for Equipment, update tc_eq_id, tc_eqport_id:"
                                + updateEquipment);

                        SqlUtils.executeUpdate(EQ_TABLE, updateEquipment);
                        SqlUtils.commit();

                    } else if (uphillTable.equals(PNPORT_TABLE)) {

                        // UPDATE jk (uphill_table) SET tc_pn_id = ‘PN19’ (first part of
                        // downhill_key),
                        // tc_pnport_id=’19’ (second part of downhill key)
                        // WHERE jk_id = ‘HQ-19-115B-D’ (uphill_key)

                        final List<String> listPortsUphill =
                                Arrays.asList(uphillKey.split(SPLIT_PATTERN));
                        final List<String> listPortsDownhill =
                                Arrays.asList(uphillKey.split(SPLIT_PATTERN));

                        final String updateEquipment = UPDATE + EQ_TABLE + SET + TC_PN_ID + EQUALS
                                + LTRIM_RTRIM + SQL_QUOTE + listPortsUphill.get(0).toString()
                                + SQL_QUOTE + END_LTRIM_RTRIM + FIELD_SEPARATOR + TC_PNPORT_ID
                                + EQUALS + LTRIM_RTRIM + SQL_QUOTE
                                + listPortsUphill.get(1).toString() + SQL_QUOTE + END_LTRIM_RTRIM
                                + WHERE + LTRIM_RTRIM + EQ_ID_FLD + END_LTRIM_RTRIM + EQUALS
                                + LTRIM_RTRIM + SQL_QUOTE + listPortsDownhill.get(0).toString()
                                + SQL_QUOTE + END_LTRIM_RTRIM + AND + LTRIM_RTRIM + PORT_ID_FLD
                                + END_LTRIM_RTRIM + EQUALS + LTRIM_RTRIM + SQL_QUOTE
                                + listPortsDownhill.get(1).toString() + SQL_QUOTE + END_LTRIM_RTRIM;

                        this.log.info(UPDATE_STATEMENT_MESSAGE
                                + " for Equipment, update tc_pn_id, tc_pnport_id, case uphill table is pnport:"
                                + updateEquipment);

                        SqlUtils.executeUpdate(EQ_TABLE, updateEquipment);
                        SqlUtils.commit();
                    } else if (uphillTable.equals(PB_TABLE) && uphillValue != null) {
                        // UPDATE jk (uphill_table) SET tc_pn_id = ‘PN19’ (first part of
                        // downhill_key),
                        // tc_pnport_id=’19’ (second part of downhill key)
                        // WHERE jk_id = ‘HQ-19-115B-D’ (uphill_key)

                        final List<String> listPortsDownhill =
                                Arrays.asList(uphillKey.split(SPLIT_PATTERN));

                        final String updateEquipment = UPDATE + EQ_TABLE + SET + TC_PN_ID + EQUALS
                                + LTRIM_RTRIM + SQL_QUOTE + uphillKey + SQL_QUOTE + END_LTRIM_RTRIM
                                + FIELD_SEPARATOR + TC_PNPORT_ID + EQUALS + LTRIM_RTRIM + SQL_QUOTE
                                + uphillValue + SQL_QUOTE + END_LTRIM_RTRIM + WHERE + LTRIM_RTRIM
                                + EQ_ID_FLD + END_LTRIM_RTRIM + EQUALS + LTRIM_RTRIM + SQL_QUOTE
                                + listPortsDownhill.get(0).toString() + SQL_QUOTE + END_LTRIM_RTRIM
                                + AND + LTRIM_RTRIM + PORT_ID_FLD + END_LTRIM_RTRIM + EQUALS
                                + LTRIM_RTRIM + SQL_QUOTE + listPortsDownhill.get(1).toString()
                                + SQL_QUOTE + END_LTRIM_RTRIM;

                        this.log.info(UPDATE_STATEMENT_MESSAGE
                                + " for Equipment, update tc_pn_id, tc_pnport_id, case uphill table is pb:"
                                + updateEquipment);

                        SqlUtils.executeUpdate(EQ_TABLE, updateEquipment);
                        SqlUtils.commit();

                    }

                }
            }
        } catch (final ExceptionBase e) {
            // @non-translatable
            final String errorMessage =
                    String.format("Exception when updating connections for Equipment");
            throw new ExceptionBase(errorMessage);
        }
    }

    /**
     *
     * Update equipment ports with values taken from connections table.
     */
    public void updateConnectionsForEquipmentPort() {

        // select downhill_table, downhill_key, case when downhill_table = 'pb' then
        // downhill_position else downhill_key end AS downhill_value,
        // uphill_table, uphill_key, case when uphill_table = 'pb' then uphill_position else
        // uphill_key end AS uphill_value
        // FROM afm_tccn
        // WHERE uphill_table NOT IN ('ca','cp','port')
        // and downhill_table in ('ndport','eqport' , 'cdport')

        final List<DataRecord> records = getSqlForUpdateEquipmentPort();
        try {
            if (!records.isEmpty()) {
                for (final DataRecord record : records) {

                    record.getValue(AFM_TCCN_TABLE + DOT_CHAR + DOWNHILL_TABLE_FLD).toString();

                    final String downhillKey = record
                        .getValue(AFM_TCCN_TABLE + DOT_CHAR + DOWNHILL_KEY_FLD).toString();

                    final String uphillTable = record
                        .getValue(AFM_TCCN_TABLE + DOT_CHAR + UPHILL_TABLE_FLD).toString();
                    final String uphillKey =
                            record.getValue(AFM_TCCN_TABLE + DOT_CHAR + UPHILL_KEY_FLD).toString();
                    final String uphillValue =
                            record.getValue(AFM_TCCN_TABLE + DOT_CHAR + UPHILL_VALUE).toString();

                    if (uphillTable.equals(EQ_TABLE) || uphillTable.equals(NETDEV_TABLE)
                            || uphillTable.equals(CARD_TABLE)) {

                        // UPDATE eqport (uphill_table) SET tc_eq_id = ‘PN19’ (downhill_key)
                        // WHERE pn_id = ‘HQ-19-115B-D’ (uphill_key)

                        final List<String> listPortsDownhill =
                                Arrays.asList(downhillKey.split(SPLIT_PATTERN));

                        final String updateEquipmentPort = UPDATE + EQPORT_TABLE + SET + TC_EQ_ID
                                + EQUALS + LTRIM_RTRIM + SQL_QUOTE + uphillKey + SQL_QUOTE
                                + END_LTRIM_RTRIM + WHERE + LTRIM_RTRIM + EQ_ID_FLD
                                + END_LTRIM_RTRIM + EQUALS + LTRIM_RTRIM + SQL_QUOTE
                                + listPortsDownhill.get(0).toString() + SQL_QUOTE + END_LTRIM_RTRIM
                                + AND + LTRIM_RTRIM + PORT_ID_FLD + END_LTRIM_RTRIM + EQUALS
                                + LTRIM_RTRIM + SQL_QUOTE + listPortsDownhill.get(1).toString()
                                + SQL_QUOTE + END_LTRIM_RTRIM;

                        this.log.info(UPDATE_STATEMENT_MESSAGE
                                + " for Equipment Port, update tc_eq_id:" + updateEquipmentPort);

                        SqlUtils.executeUpdate(EQPORT_TABLE, updateEquipmentPort);
                        SqlUtils.commit();

                    } else if (uphillTable.equals(EQPORT_TABLE) || uphillTable.equals(NDPORT_TABLE)
                            || uphillTable.equals(CDPORT_TABLE)) {

                        // UPDATE eq (downhill_table) SET tc_eq_id = ‘PN19’ (first part of
                        // uphill_key),
                        // tc_eqport_id=’19’ (second part of uphill key)
                        // WHERE eq_id = ‘HUB19C’ (first part of downhill_key)
                        // AND port_id = 'AUI1'

                        final List<String> listPortsUhill =
                                Arrays.asList(uphillKey.split(SPLIT_PATTERN));
                        final List<String> listPortsDownhill =
                                Arrays.asList(downhillKey.split(SPLIT_PATTERN));

                        final String updateEquipmentPort = UPDATE + EQPORT_TABLE + SET + TC_EQ_ID
                                + EQUALS + LTRIM_RTRIM + SQL_QUOTE
                                + listPortsUhill.get(0).toString() + SQL_QUOTE + END_LTRIM_RTRIM
                                + FIELD_SEPARATOR + TC_EQPORT_ID + EQUALS + LTRIM_RTRIM + SQL_QUOTE
                                + listPortsUhill.get(1).toString() + SQL_QUOTE + END_LTRIM_RTRIM
                                + WHERE + LTRIM_RTRIM + EQ_ID_FLD + END_LTRIM_RTRIM + EQUALS
                                + LTRIM_RTRIM + SQL_QUOTE + listPortsDownhill.get(0).toString()
                                + SQL_QUOTE + END_LTRIM_RTRIM + AND + LTRIM_RTRIM + PORT_ID_FLD
                                + END_LTRIM_RTRIM + EQUALS + LTRIM_RTRIM + SQL_QUOTE
                                + listPortsDownhill.get(1).toString() + SQL_QUOTE + END_LTRIM_RTRIM;

                        this.log.info(UPDATE_STATEMENT_MESSAGE
                                + " for Equipment Port, update tc_eq_id, tc_eqport_id:"
                                + updateEquipmentPort);

                        SqlUtils.executeUpdate(EQPORT_TABLE, updateEquipmentPort);
                        SqlUtils.commit();

                    } else if (uphillTable.equals(PNPORT_TABLE)) {

                        // UPDATE jk (uphill_table) SET tc_pn_id = ‘PN19’ (first part of
                        // downhill_key),
                        // tc_pnport_id=’19’ (second part of downhill key)
                        // WHERE jk_id = ‘HQ-19-115B-D’ (uphill_key)

                        final List<String> listPortsUphill =
                                Arrays.asList(uphillKey.split(SPLIT_PATTERN));
                        final List<String> listPortsDownhill =
                                Arrays.asList(downhillKey.split(SPLIT_PATTERN));

                        final String updateEquipmentPort = UPDATE + EQPORT_TABLE + SET + TC_PN_ID
                                + EQUALS + LTRIM_RTRIM + SQL_QUOTE
                                + listPortsUphill.get(0).toString() + SQL_QUOTE + END_LTRIM_RTRIM
                                + FIELD_SEPARATOR + TC_PNPORT_ID + EQUALS + LTRIM_RTRIM + SQL_QUOTE
                                + listPortsUphill.get(1).toString() + SQL_QUOTE + END_LTRIM_RTRIM
                                + WHERE + LTRIM_RTRIM + EQ_ID_FLD + END_LTRIM_RTRIM + EQUALS
                                + LTRIM_RTRIM + SQL_QUOTE + listPortsDownhill.get(0).toString()
                                + SQL_QUOTE + END_LTRIM_RTRIM + AND + LTRIM_RTRIM + PORT_ID_FLD
                                + END_LTRIM_RTRIM + EQUALS + LTRIM_RTRIM + SQL_QUOTE
                                + listPortsDownhill.get(1).toString() + SQL_QUOTE + END_LTRIM_RTRIM;

                        this.log.info(UPDATE_STATEMENT_MESSAGE
                                + " for Equipment Port, update tc_pn_id, tc_pnport_id, case uphill_table = pnport:"
                                + updateEquipmentPort);

                        SqlUtils.executeUpdate(EQPORT_TABLE, updateEquipmentPort);
                        SqlUtils.commit();
                    } else if (uphillTable.equals(PB_TABLE) && uphillValue != null) {
                        final List<String> listPortsDownhill =
                                Arrays.asList(downhillKey.split(SPLIT_PATTERN));

                        final String updateEquipmentPort = UPDATE + EQPORT_TABLE + SET + TC_PN_ID
                                + EQUALS + LTRIM_RTRIM + SQL_QUOTE + uphillKey + SQL_QUOTE
                                + END_LTRIM_RTRIM + FIELD_SEPARATOR + TC_PNPORT_ID + EQUALS
                                + LTRIM_RTRIM + SQL_QUOTE + uphillValue + SQL_QUOTE
                                + END_LTRIM_RTRIM + WHERE + LTRIM_RTRIM + EQ_ID_FLD
                                + END_LTRIM_RTRIM + EQUALS + LTRIM_RTRIM + SQL_QUOTE
                                + listPortsDownhill.get(0).toString() + SQL_QUOTE + LTRIM_RTRIM
                                + AND + LTRIM_RTRIM + PORT_ID_FLD + END_LTRIM_RTRIM + EQUALS
                                + LTRIM_RTRIM + SQL_QUOTE + listPortsDownhill.get(1).toString()
                                + SQL_QUOTE + END_LTRIM_RTRIM;

                        this.log.info(UPDATE_STATEMENT_MESSAGE
                                + " for Equipment Port, update tc_pn_id, tc_pnport_id, case uphill_table = pb:"
                                + updateEquipmentPort);

                        SqlUtils.executeUpdate(EQPORT_TABLE, updateEquipmentPort);
                        SqlUtils.commit();
                    }

                }
            }
        } catch (final ExceptionBase e) {
            // @non-translatable
            final String errorMessage =
                    String.format("Exception when updating connections for Equipment Ports");
            throw new ExceptionBase(errorMessage);
        }
    }

    /**
     *
     * Update patch panel ports with records from afm_tccn table.
     */
    public void updateConnectionsForPatchPanelPorts() {

        // select downhill_table, downhill_key, case when downhill_table = 'pb' then
        // downhill_position else downhill_key end AS downhill_value,
        // uphill_table, uphill_key, case when uphill_table = 'pb' then uphill_position else
        // uphill_key end AS uphill_value
        // FROM afm_tccn
        // WHERE uphill_table NOT IN ('ca','cp','port')
        // and downhill_table = 'pnport'

        final List<DataRecord> records = getSqlForUpdatePatchPanelPorts();
        try {
            if (!records.isEmpty()) {
                for (final DataRecord record : records) {

                    final String downhillKey = record
                        .getValue(AFM_TCCN_TABLE + DOT_CHAR + DOWNHILL_KEY_FLD).toString();

                    final String uphillTable = record
                        .getValue(AFM_TCCN_TABLE + DOT_CHAR + UPHILL_TABLE_FLD).toString();
                    final String uphillKey =
                            record.getValue(AFM_TCCN_TABLE + DOT_CHAR + UPHILL_KEY_FLD).toString();
                    final String uphillValue =
                            record.getValue(AFM_TCCN_TABLE + DOT_CHAR + UPHILL_VALUE).toString();

                    if (uphillTable.equals(EQ_TABLE) || uphillTable.equals(NETDEV_TABLE)
                            || uphillTable.equals(CARD_TABLE)) {

                        // UPDATE pnport (uphill_table) SET tc_eq_id = ‘PN19’ (downhill_key)
                        // WHERE pn_id = ‘HQ-19-115B-D’ (uphill_key)

                        final List<String> listPortsDownhill =
                                Arrays.asList(downhillKey.split(SPLIT_PATTERN));

                        final String updatePnPort = UPDATE + PNPORT_TABLE + SET + TC_EQ_ID + EQUALS
                                + LTRIM_RTRIM + SQL_QUOTE + uphillKey + SQL_QUOTE + END_LTRIM_RTRIM
                                + WHERE + LTRIM_RTRIM + PN_ID_FLD + END_LTRIM_RTRIM + EQUALS
                                + LTRIM_RTRIM + SQL_QUOTE + listPortsDownhill.get(0).toString()
                                + SQL_QUOTE + END_LTRIM_RTRIM + AND + LTRIM_RTRIM + PORT_ID_FLD
                                + END_LTRIM_RTRIM + EQUALS + LTRIM_RTRIM + SQL_QUOTE
                                + listPortsDownhill.get(1).toString() + SQL_QUOTE + END_LTRIM_RTRIM;

                        this.log.info(UPDATE_STATEMENT_MESSAGE
                                + " for Patch Panel Ports, update tc_eq_id: " + updatePnPort);

                        SqlUtils.executeUpdate(PNPORT_TABLE, updatePnPort);
                        SqlUtils.commit();

                    } else if (uphillTable.equals(EQPORT_TABLE) || uphillTable.equals(NDPORT_TABLE)
                            || uphillTable.equals(CDPORT_TABLE)) {

                        // UPDATE pnport (downhill_table) SET tc_eq_id = ‘PN19’ (first part of
                        // uphill_key),
                        // tc_eqport_id=’19’ (second part of uphill key)
                        // WHERE pn_id = ‘HUB19C’ (first part of downhill_key)
                        // AND port_id = 'AUI1'

                        final List<String> listPortsUhill =
                                Arrays.asList(uphillKey.split(SPLIT_PATTERN));
                        final List<String> listPortsDownhill =
                                Arrays.asList(downhillKey.split(SPLIT_PATTERN));

                        final String updatePnPort = UPDATE + PNPORT_TABLE + SET + TC_EQ_ID + EQUALS
                                + LTRIM_RTRIM + SQL_QUOTE + listPortsUhill.get(0).toString()
                                + SQL_QUOTE + END_LTRIM_RTRIM + FIELD_SEPARATOR + TC_EQPORT_ID
                                + EQUALS + LTRIM_RTRIM + SQL_QUOTE
                                + listPortsUhill.get(1).toString() + SQL_QUOTE + END_LTRIM_RTRIM
                                + WHERE + LTRIM_RTRIM + PN_ID_FLD + END_LTRIM_RTRIM + EQUALS
                                + LTRIM_RTRIM + SQL_QUOTE + listPortsDownhill.get(0).toString()
                                + SQL_QUOTE + END_LTRIM_RTRIM + AND + LTRIM_RTRIM + PORT_ID_FLD
                                + END_LTRIM_RTRIM + EQUALS + LTRIM_RTRIM + SQL_QUOTE
                                + listPortsDownhill.get(1).toString() + SQL_QUOTE + END_LTRIM_RTRIM;

                        this.log.info(UPDATE_STATEMENT_MESSAGE
                                + " for Patch Panel Ports, update tc_eq_id, tc_eqport_id: "
                                + updatePnPort);

                        SqlUtils.executeUpdate(PNPORT_TABLE, updatePnPort);
                        SqlUtils.commit();

                    } else if (uphillTable.equals(PNPORT_TABLE)) {

                        // UPDATE pnport (uphill_table) SET tc_pn_id = ‘PN19’ (first part of
                        // downhill_key),
                        // tc_pnport_id=’19’ (second part of downhill key)
                        // WHERE pn_id = ‘PN18’ (first part of uphill_key)
                        // AND port_id = '25' (second part of uphill key)

                        final List<String> listPortsUphill =
                                Arrays.asList(uphillKey.split(SPLIT_PATTERN));
                        final List<String> listPortsDownhill =
                                Arrays.asList(downhillKey.split(SPLIT_PATTERN));

                        final String updatePnPort = UPDATE + PNPORT_TABLE + SET + TC_PN_ID + EQUALS
                                + LTRIM_RTRIM + SQL_QUOTE + listPortsUphill.get(0).toString()
                                + SQL_QUOTE + END_LTRIM_RTRIM + FIELD_SEPARATOR + TC_PNPORT_ID
                                + EQUALS + LTRIM_RTRIM + SQL_QUOTE
                                + listPortsUphill.get(1).toString() + SQL_QUOTE + END_LTRIM_RTRIM
                                + WHERE + LTRIM_RTRIM + PN_ID_FLD + END_LTRIM_RTRIM + EQUALS
                                + LTRIM_RTRIM + SQL_QUOTE + listPortsDownhill.get(0).toString()
                                + SQL_QUOTE + END_LTRIM_RTRIM + AND + LTRIM_RTRIM + PORT_ID_FLD
                                + END_LTRIM_RTRIM + EQUALS + LTRIM_RTRIM + SQL_QUOTE
                                + listPortsDownhill.get(1).toString() + SQL_QUOTE + END_LTRIM_RTRIM;

                        this.log.info(UPDATE_STATEMENT_MESSAGE
                                + " for Patch Panel Ports, update tc_pn_id, tc_pnport_id, case uphill_table = pnport: "
                                + updatePnPort);

                        SqlUtils.executeUpdate(PNPORT_TABLE, updatePnPort);
                        SqlUtils.commit();
                    } else if (uphillTable.equals(PB_TABLE) && uphillValue != null) {
                        final List<String> listPortsDownhill =
                                Arrays.asList(downhillKey.split(SPLIT_PATTERN));

                        final String updatePnPort = UPDATE + PNPORT_TABLE + SET + TC_PN_ID + EQUALS
                                + LTRIM_RTRIM + SQL_QUOTE + uphillKey + SQL_QUOTE + END_LTRIM_RTRIM
                                + FIELD_SEPARATOR + TC_PNPORT_ID + EQUALS + LTRIM_RTRIM + SQL_QUOTE
                                + uphillValue + SQL_QUOTE + END_LTRIM_RTRIM + WHERE + LTRIM_RTRIM
                                + EQ_ID_FLD + END_LTRIM_RTRIM + EQUALS + LTRIM_RTRIM + SQL_QUOTE
                                + listPortsDownhill.get(0).toString() + SQL_QUOTE + END_LTRIM_RTRIM
                                + AND + LTRIM_RTRIM + PORT_ID_FLD + END_LTRIM_RTRIM + EQUALS
                                + LTRIM_RTRIM + SQL_QUOTE + listPortsDownhill.get(1).toString()
                                + SQL_QUOTE + END_LTRIM_RTRIM;

                        this.log.info(UPDATE_STATEMENT_MESSAGE
                                + " for Patch Panel Ports, update tc_pn_id, tc_pnport_id, case uphill_table = pb: "
                                + updatePnPort);

                        SqlUtils.executeUpdate(PNPORT_TABLE, updatePnPort);
                        SqlUtils.commit();
                    }

                }
            }
        } catch (final ExceptionBase e) {
            // @non-translatable
            final String errorMessage =
                    String.format("Exception when updating connections for Patch Panel Ports");
            throw new ExceptionBase(errorMessage);
        }
    }

    /**
     *
     * Update jacks with values taken from connections table.
     */
    public void updateConnectionsForJacks() {

        // select downhill_table, downhill_key, case when downhill_table = 'pb' then
        // downhill_position else downhill_key end AS downhill_value,
        // uphill_table, uphill_key, case when uphill_table = 'pb' then uphill_position else
        // uphill_key end AS uphill_value
        // FROM afm_tccn
        // WHERE uphill_table NOT IN ('ca','cp','port')
        // and downhill_table = 'jk'

        final List<DataRecord> records = getSqlForUpdateJacks();
        try {
            if (!records.isEmpty()) {
                for (final DataRecord record : records) {

                    final String downhillKey = record
                        .getValue(AFM_TCCN_TABLE + DOT_CHAR + DOWNHILL_KEY_FLD).toString();

                    final String uphillTable = record
                        .getValue(AFM_TCCN_TABLE + DOT_CHAR + UPHILL_TABLE_FLD).toString();
                    final String uphillKey =
                            record.getValue(AFM_TCCN_TABLE + DOT_CHAR + UPHILL_KEY_FLD).toString();
                    final String uphillValue =
                            record.getValue(AFM_TCCN_TABLE + DOT_CHAR + UPHILL_VALUE).toString();

                    if (uphillTable.equals(EQ_TABLE) || uphillTable.equals(NETDEV_TABLE)
                            || uphillTable.equals(CARD_TABLE)) {

                        // UPDATE jk (uphill_table) SET tc_eq_id = ‘PN19’ (downhill_key)
                        // WHERE jk_id = ‘HQ-19-115B-D’ (uphill_key)

                        final String updateJacks = UPDATE + JK_TABLE + SET + TC_EQ_ID + EQUALS
                                + LTRIM_RTRIM + SQL_QUOTE + uphillKey + SQL_QUOTE + END_LTRIM_RTRIM
                                + WHERE + LTRIM_RTRIM + JK_ID_FLD + END_LTRIM_RTRIM + EQUALS
                                + LTRIM_RTRIM + SQL_QUOTE + downhillKey + SQL_QUOTE
                                + END_LTRIM_RTRIM;
                        this.log.info(
                            UPDATE_STATEMENT_MESSAGE + " for Jacks, update tc_eq_id" + updateJacks);

                        SqlUtils.executeUpdate(JK_TABLE, updateJacks);
                        SqlUtils.commit();

                    } else if (uphillTable.equals(EQPORT_TABLE) || uphillTable.equals(NDPORT_TABLE)
                            || uphillTable.equals(CDPORT_TABLE)) {

                        // UPDATE jk (uphill_table) SET tc_eq_id = ‘PN19’ (first part of
                        // downhill_key),
                        // tc_eqport_id=’19’ (second part of downhill key)
                        // WHERE jk_id = ‘HQ-19-115B-D’ (uphill_key)

                        final List<String> listPortsUphill =
                                Arrays.asList(uphillKey.split(SPLIT_PATTERN));

                        final String updateJacks = UPDATE + JK_TABLE + SET + TC_EQ_ID + EQUALS
                                + LTRIM_RTRIM + SQL_QUOTE + listPortsUphill.get(0).toString()
                                + SQL_QUOTE + END_LTRIM_RTRIM + FIELD_SEPARATOR + TC_EQPORT_ID
                                + EQUALS + LTRIM_RTRIM + SQL_QUOTE
                                + listPortsUphill.get(1).toString() + SQL_QUOTE + END_LTRIM_RTRIM
                                + WHERE + LTRIM_RTRIM + JK_ID_FLD + END_LTRIM_RTRIM + EQUALS
                                + LTRIM_RTRIM + SQL_QUOTE + downhillKey + SQL_QUOTE
                                + END_LTRIM_RTRIM;

                        this.log.info(UPDATE_STATEMENT_MESSAGE
                                + " for Jacks, update tc_eq_id, tc_eqport_id" + updateJacks);

                        SqlUtils.executeUpdate(JK_TABLE, updateJacks);
                        SqlUtils.commit();

                    } else if (uphillTable.equals(PNPORT_TABLE)) {

                        // UPDATE jk (uphill_table) SET tc_pn_id = ‘PN19’ (first part of
                        // downhill_key),
                        // tc_pnport_id=’19’ (second part of downhill key)
                        // WHERE jk_id = ‘HQ-19-115B-D’ (uphill_key)

                        final List<String> listPorts =
                                Arrays.asList(uphillKey.split(SPLIT_PATTERN));

                        final String updateJacks = UPDATE + JK_TABLE + SET + TC_PN_ID + EQUALS
                                + LTRIM_RTRIM + SQL_QUOTE + listPorts.get(0).toString() + SQL_QUOTE
                                + END_LTRIM_RTRIM + FIELD_SEPARATOR + TC_PNPORT_ID + EQUALS
                                + LTRIM_RTRIM + SQL_QUOTE + listPorts.get(1).toString() + SQL_QUOTE
                                + END_LTRIM_RTRIM + WHERE + LTRIM_RTRIM + JK_ID_FLD
                                + END_LTRIM_RTRIM + EQUALS + LTRIM_RTRIM + SQL_QUOTE + downhillKey
                                + SQL_QUOTE + END_LTRIM_RTRIM;

                        this.log.info(UPDATE_STATEMENT_MESSAGE
                                + " for Jacks, update tc_pn_id, tc_pnport_id, case uphill_table = pnport: "
                                + updateJacks);

                        SqlUtils.executeUpdate(JK_TABLE, updateJacks);
                        SqlUtils.commit();

                    } else if (uphillTable.equals(PB_TABLE) && uphillValue != null) {
                        // UPDATE jk (uphill_table) SET tc_pn_id = ‘PN19’ (first part of
                        // downhill_key),
                        // tc_pnport_id=’19’ (second part of downhill key)
                        // WHERE jk_id = ‘HQ-19-115B-D’ (uphill_key)

                        final String updateJacks = UPDATE + JK_TABLE + SET + TC_PN_ID + EQUALS
                                + LTRIM_RTRIM + SQL_QUOTE + uphillKey + SQL_QUOTE + END_LTRIM_RTRIM
                                + FIELD_SEPARATOR + TC_PNPORT_ID + EQUALS + LTRIM_RTRIM + SQL_QUOTE
                                + uphillValue + SQL_QUOTE + END_LTRIM_RTRIM + WHERE + LTRIM_RTRIM
                                + JK_ID_FLD + END_LTRIM_RTRIM + EQUALS + LTRIM_RTRIM + SQL_QUOTE
                                + downhillKey + SQL_QUOTE + END_LTRIM_RTRIM;

                        this.log.info(UPDATE_STATEMENT_MESSAGE
                                + " for Jacks, update tc_pn_id, tc_pnport_id, case uphill_table = pb: "
                                + updateJacks);

                        SqlUtils.executeUpdate(JK_TABLE, updateJacks);
                        SqlUtils.commit();
                    }

                }
            }
        } catch (final ExceptionBase e) {
            // @non-translatable
            final String errorMessage =
                    String.format("Exception when updating connections for Jacks");
            throw new ExceptionBase(errorMessage);
        }

    }

    /**
     *
     * Calls all methods for insert.
     */
    private void insertAllTelecomData() {

        insertNeworkDeviceStandardsToEquipmentStandards();
        insertNeworkDevicesToEquipment();

        insertCardStandardsToEquipmentStandards();
        insertCardsToEquipment();

        insertPunchBlockStandardsToPatchPanelStandards();
        insertPunchBlocksToPatchPanels();
    }

    /**
     *
     * Calls all methods to update connections.
     */
    private void updateAllTelecomConnections() {
        updateTelecomArea();
        updateConnectionsForEquipment();
        updateConnectionsForEquipmentPort();
        updateConnectionsForPatchPanelPorts();
        updateConnectionsForJacks();
    }

    /**
     *
     * Entry point method for handling the migration.
     */
    public void handle() {
        final int maxProgressValue = 100;
        final int minProgressValue = 0;
        final int halfProgressValue = 50;

        this.status.setTotalNumber(maxProgressValue);
        this.status.setCurrentNumber(minProgressValue);
        this.status.setMessage("Starting telecom data migration");

        insertAllTelecomData();
        this.status.setCurrentNumber(halfProgressValue);
        this.status.setMessage("Processing...");

        updateAllTelecomConnections();

        this.status.setCurrentNumber(maxProgressValue);
        this.status.setMessage("Finished");
        this.status.setCode(JobStatus.JOB_COMPLETE);
    }
}