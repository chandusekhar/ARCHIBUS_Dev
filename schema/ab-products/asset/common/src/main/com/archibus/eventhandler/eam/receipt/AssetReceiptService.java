package com.archibus.eventhandler.eam.receipt;

import java.util.List;
import java.util.regex.*;

import org.apache.log4j.Logger;

import com.archibus.app.common.metrics.SchemaUtilities;
import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.*;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.jobmanager.*;
import com.archibus.utility.*;

/**
 *
 * Version 22.1 Enterprise Asset Management - Asset Receipt.
 * <p>
 * Registered in the ARCHIBUS Workflow Rules table as 'AbAssetEAM-AssetReceiptService'.
 * <p>
 * Provides methods to create single or multiple assets. Console
 * <p>
 * Invoked by web central.
 *
 * @author Radu Bunea
 * @since 22.1
 */
public class AssetReceiptService extends JobBase {

    /**
     * Types of assets.
     *
     */
    public enum AssetType {
        /**
         * building asset.
         */
        BUILDING {
            @Override
            public String toString() {
                return "bl";
            }
        },
        /**
         * equipment asset.
         */
        EQUIPMENT {
            @Override
            public String toString() {
                return "eq";
            }
        },
        /**
         * furniture asset.
         */
        FURNITURE {
            @Override
            public String toString() {
                return "ta";
            }
        },
        /**
         * property asset.
         */
        PROPERTY {
            @Override
            public String toString() {
                return "property";
            }
        };
    }

    /**
     * virtual field for asset prefixes.
     */
    private static final String PEREFIX_FIELD_NAME = "prefix";

    /**
     * Number reg ex.
     */
    private static final String NUMBER_REGEX_EXPRESSION = "[^0-9]*([0-9]+)$";

    /**
     * Property field length.
     */
    private static final int PROPERTY_LENGHT = 16;

    /**
     * Building field length.
     */
    private static final int BUILDING_LENGHT = 8;

    /**
     * Equipment field length.
     */
    private static final int EQUIPMENT_LENGHT = 12;

    /**
     * Max zero to add to the sequence.
     */
    private static final int MAX_ZERO_SEQUENCE = 5;

    /**
     * Constant: "WHEN" SQL clause.
     */
    private static final String QUERY_WHEN = " WHEN ";

    /**
     * Constant: "FROM" SQL clause.
     */
    private static final String QUERY_FROM = " FROM ";

    /**
     * Constant used in log message.
     */
    // @non-translatable
    private static final String LOGGER_MSG_CREATE = "Create multiple assets: %s";

    /**
     * Constant used in log message.
     */
    // @non-translatable
    private static final String LOGGER_MSG_DELETE = "Delete multiple assets: %s";

    /**
     * Constant used in log message.
     */
    private static final String OK_LOG_MSG = "OK";

    /**
     * Constant used in log message.
     */
    private static final String STARTED_LOG_MSG = "Started";

    /**
     * Constant used to sort alphanumeric values.
     */
    private static final String ASSET_NUMBER = "asset_number";

    /**
     * Constant used to sort alphanumeric values in MS-SQL and Sybase database.
     */
    private static final String NUMERIC_INDEX = "PatIndex('%[0-9]%'";

    /**
     * Constant DOT.
     */
    private static final String DOT = ".";

    /**
     * Constant COMMA.
     */
    private static final String COMMA = ",";

    /**
     * Logger for this class.
     */
    protected final Logger logger = Logger.getLogger(this.getClass());

    /**
     * Create multiple asset records (bl, eq, ta, property) based on common data.
     * <p>
     * next id will be based on prefix; if prefix is null then increment the pk by one
     *
     * @param assetType asset type selected
     * @param commonDataRecord common data for asset
     * @param noAssets number of assets to create
     * @param prefix prefix
     * @param startNextId next asset code to create
     */
    public void createMultipleAssets(final String assetType, final DataRecord commonDataRecord,
            final int noAssets, final String prefix, final String startNextId) {
        if (this.logger.isInfoEnabled()) {
            final String message = String.format(LOGGER_MSG_CREATE, STARTED_LOG_MSG);
            this.logger.info(message);
        }

        this.status.setTotalNumber(noAssets);
        final DataSource assetDataSource = getDataSourceForTable(assetType);
        final String pkFieldName = assetType + DOT + getPrimaryFieldName(assetType);

        final DataSetList resultDataSet = new DataSetList();
        final DataSource pkDataSource = DataSourceFactory.createDataSourceForFields(assetType,
            new String[] { pkFieldName });
        DataRecord returnRecord = null;

        String nextId = startNextId;
        if (StringUtil.isNullOrEmpty(prefix)) {
            nextId = addZeroSequence(assetType, nextId);
        }
        for (int i = 0; i < noAssets; i++) {
            commonDataRecord.setValue(pkFieldName, nextId);
            assetDataSource.saveRecord(commonDataRecord);

            returnRecord = pkDataSource.createNewRecord();
            returnRecord.setValue(pkFieldName, nextId);
            resultDataSet.addRecord(returnRecord);
            nextId = getNextId(assetType, nextId);

            if (this.status.isStopRequested()) {
                this.status.setCode(JobStatus.JOB_STOPPED);
                break;
            }
            this.status.incrementCurrentNumber();
        }
        this.status.setDataSet(resultDataSet);
        this.status.setResult(pkFieldName);

        if (this.logger.isInfoEnabled()) {
            final String message = String.format(LOGGER_MSG_CREATE, OK_LOG_MSG);
            this.logger.info(message);
        }
    }

    /**
     *
     * Delete multiple selected assets.
     *
     * @param assetType bl, eq, ta, property
     * @param pkName pkName of the table asset
     * @param selectedAssetIds selectedAssetIds
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    public void deleteMultipleAssets(final String assetType, final String pkName,
            final List<String> selectedAssetIds) {
        if (this.logger.isInfoEnabled()) {
            final String message = String.format(LOGGER_MSG_DELETE, STARTED_LOG_MSG);
            this.logger.info(message);
        }

        this.status.setTotalNumber(selectedAssetIds.size());
        for (int i = 0; i < selectedAssetIds.size(); i++) {
            final String sqlQuery = "DELETE FROM " + assetType + " WHERE " + pkName + "='"
                    + selectedAssetIds.get(i) + "'";
            SqlUtils.executeUpdate(assetType, sqlQuery);

            if (this.status.isStopRequested()) {
                this.status.setCode(JobStatus.JOB_STOPPED);
                break;
            }
            this.status.incrementCurrentNumber();
        }

        if (this.logger.isInfoEnabled()) {
            final String message = String.format(LOGGER_MSG_DELETE, OK_LOG_MSG);
            this.logger.info(message);
        }
    }

    /**
     * Determine if there is a prefix on assets pk(s) by searching for one of the following
     * characters "-", "_", "|", "\", "/", "." .
     *
     * <p>
     * Suppress PMD warning "AvoidUsingSql" in this class.
     * <p>
     * Justification: Case #1: Restriction with SELECT pattern .
     *
     * @param assetType type of asset
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    public void getAssetPrefixes(final String assetType) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final String pkFieldName = getPrimaryFieldName(assetType);
        String sql = "SELECT DISTINCT(";
        if (SqlUtils.isOracle()) {
            final String instr = "INSTR(" + pkFieldName + COMMA;
            final String substring = "(SUBSTR(" + pkFieldName;
            final String query = substring + COMMA + 0 + COMMA + instr;
            sql += "CASE WHEN " + instr + "'-')>0 THEN " + query + "'-')))";
            sql += QUERY_WHEN + instr + "'_')>0 THEN " + query + "'_')))";
            sql += QUERY_WHEN + instr + "'|')>0 THEN " + query + "'|')))";
            sql += QUERY_WHEN + instr + "'\\')>0 THEN " + query + "'\\')))";
            sql += QUERY_WHEN + instr + "'/')>0 THEN " + query + "'/')))";
            sql += QUERY_WHEN + instr + "'.')>0 THEN " + query + "'.')))";
        }
        if (SqlUtils.isSqlServer() || SqlUtils.isSybase()) {
            final String operation = pkFieldName + " )>0 THEN (LEFT(" + pkFieldName;
            final String fieldNameSql = pkFieldName + " )))";
            sql += "CASE WHEN CHARINDEX('-', " + operation + ", CHARINDEX('-', " + fieldNameSql;
            sql += "     WHEN CHARINDEX('_', " + operation + ", CHARINDEX('_', " + fieldNameSql;
            sql += "     WHEN CHARINDEX('|', " + operation + ", CHARINDEX('|', " + fieldNameSql;
            sql += "     WHEN CHARINDEX('\\', " + operation + ", CHARINDEX('\\', " + fieldNameSql;
            sql += "     WHEN CHARINDEX('/', " + operation + ", CHARINDEX('/', " + fieldNameSql;
            sql += "     WHEN CHARINDEX('.', " + operation + ", CHARINDEX('.', " + fieldNameSql;
        }
        sql += "    ELSE ''";
        sql += "END";
        sql += ") ${sql.as} " + PEREFIX_FIELD_NAME + QUERY_FROM + assetType;
        final DataSource dataSource = DataSourceFactory.createDataSource();

        dataSource.addTable(assetType);
        dataSource.addVirtualField(assetType, PEREFIX_FIELD_NAME, DataSource.DATA_TYPE_TEXT);
        dataSource.addSort(assetType, PEREFIX_FIELD_NAME);
        dataSource.addQuery(sql, SqlExpressions.DIALECT_GENERIC);

        final DataSetList dataSet = new DataSetList();
        dataSet.addRecords(dataSource.getRecords());
        dataSet.setHasMoreRecords(dataSource.hasMoreRecords());
        context.setResponse(dataSet);
    }

    /**
     *
     * Retrieve last alphanumeric id from asset table ordered by asset_number DESC and asset_id
     * DESC. The asset_number column is set like this
     * <p>
     * 1. get first numeric values from asset field until other non numeric characters are find
     * (e.g. AR-03-TG-64 returns 03)
     * <p>
     * 2. if non numeric values are present, get the asset field id (e.g. UPSGH returns UPSGH)
     * <p>
     * 3. cast asset_number to numeric value to sort by it
     *
     * @param assetType asset (e.g. bl,eq, ta, property)
     * @param prefix added by user or application
     * @return last id *
     *         <p>
     *         Suppress PMD warning "AvoidUsingSql" in this class.
     *         <p>
     *         Justification: Case #1: Restriction with SELECT pattern .
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    public String getLastId(final String assetType, final String prefix) {
        String lastId = "";
        final String pkFieldName = getPrimaryFieldName(assetType);
        String restriction = "1=1";
        if (StringUtil.notNullOrEmpty(prefix)) {
            restriction = pkFieldName + " LIKE '"
                    + prefix.replace("\\", "\\\\").replace("_", "\\_").toUpperCase()
                    + "%' ESCAPE '\\'";
        }
        final DataSource dataSource = DataSourceFactory.createDataSource();
        dataSource.setApplyVpaRestrictions(false);
        dataSource.addTable(assetType);
        dataSource.addField(pkFieldName);
        dataSource.addVirtualField(assetType, ASSET_NUMBER, DataSource.DATA_TYPE_TEXT);
        String assetNumber = pkFieldName;
        if (SqlUtils.isOracle()) {
            assetNumber = "TO_NUMBER( NVL(REGEXP_SUBSTR (" + pkFieldName
                    + ", '\\d+'),0) ) ${sql.as} asset_number ";
        }
        if (SqlUtils.isSqlServer() || SqlUtils.isSybase()) {
            assetNumber = "CAST(ISNULL(NULLIF(LEFT(SUBSTRING(" + pkFieldName + COMMA + NUMERIC_INDEX
                    + COMMA + pkFieldName + "), 50), ";
            assetNumber += "PatIndex('%[^0-9]%', SUBSTRING(" + pkFieldName + COMMA + NUMERIC_INDEX
                    + COMMA + pkFieldName
                    + "), 50) + 'X')-1),''),0) ${sql.as} NUMERIC(17,0)) ${sql.as} asset_number ";
        }
        final String sql = "SELECT %s, %s FROM %s WHERE %s";
        final String sqlFormat =
                String.format(sql, pkFieldName, assetNumber, assetType, restriction);

        dataSource.addQuery(sqlFormat);
        dataSource.addSort(assetType, ASSET_NUMBER, DataSource.SORT_DESC);
        dataSource.addSort(assetType, pkFieldName, DataSource.SORT_DESC);

        final List<DataRecord> records = dataSource.getRecords();
        if (!records.isEmpty()) {
            lastId = records.get(0).getString(assetType + DOT + pkFieldName);
        }
        return lastId;
    }

    /**
     *
     * Generate nextId.
     *
     * @param assetType assetType
     * @param lastId lastId
     * @return next id incremented or with trailing zeros
     */
    public String getNextId(final String assetType, final String lastId) {
        final Pattern regEx = Pattern.compile(NUMBER_REGEX_EXPRESSION);
        final Matcher matchFormula = regEx.matcher(lastId);
        String nextNumber = "";
        String prefix = "";
        String nextId = "";
        if (matchFormula.find()) {
            final String matchResult = matchFormula.group(1);
            nextNumber = String.valueOf(Integer.parseInt(matchResult) + 1);
            prefix = lastId.substring(0, lastId.length() - matchResult.length());
            if (StringUtil.isNullOrEmpty(prefix)) {
                prefix = lastId.substring(0, lastId.length() - matchResult.length());
            }
            // add leading zeros
            while (matchResult.length() > nextNumber.length()) {
                nextNumber = '0' + nextNumber;
            }
            nextId = prefix + nextNumber;
        } else {
            nextId = addZeroSequence(assetType, lastId);
        }
        return nextId;
    }

    /**
     *
     * Add zeros to the sequence.
     *
     * @param assetType assetType
     * @param lastId lastId
     * @return trailing zeros based on asset type length
     */
    public String addZeroSequence(final String assetType, final String lastId) {
        String value = lastId;
        final Pattern regEx = Pattern.compile(NUMBER_REGEX_EXPRESSION);
        final Matcher matchFormula = regEx.matcher(value);
        if (!matchFormula.find()) {
            int assetLength = EQUIPMENT_LENGHT;
            if (AssetType.PROPERTY.toString().equals(assetType)) {
                assetLength = PROPERTY_LENGHT;
            } else if (AssetType.BUILDING.toString().equals(assetType)) {
                assetLength = BUILDING_LENGHT;
            }
            if (lastId.length() < assetLength) {
                String zero = "";
                final int noZeros = getZeroSequence(assetLength, lastId);
                for (int i = 0; i < noZeros; i++) {
                    zero += '0';
                }
                value = lastId + zero + "1";
            }
        }
        return value;
    }

    /**
     *
     * verify entry exists with pk in an asset.
     *
     * @param assetType asset (e.g. bl,eq, ta, property)
     * @param pkValue entered by user or by system
     * @return if the record exists
     */
    public boolean verifyExistsAsset(final String assetType, final String pkValue) {
        final String pkFieldName = getPrimaryFieldName(assetType);
        final DataSource dataSource = getDataSourceForTable(assetType);
        dataSource.addRestriction(Restrictions.eq(assetType, pkFieldName, pkValue));
        return dataSource.getRecord() == null ? false : true;
    }

    /**
     * Create data source for specified table and all fields.
     *
     * @param tableName table name
     * @return DataSource object
     */
    private DataSource getDataSourceForTable(final String tableName) {
        final List<String> fieldsList = SchemaUtilities.getTableFields(tableName);
        final String[] fields = Utility.listToArray(fieldsList);
        return DataSourceFactory.createDataSourceForFields(tableName, fields);
    }

    /**
     * Determine zero sequence.
     *
     * @param assetLength assetLength
     * @param lastId lastId
     * @return no of zeros
     */
    private int getZeroSequence(final int assetLength, final String lastId) {
        int noZeros = assetLength - (lastId.length() + 1);
        if (noZeros > MAX_ZERO_SEQUENCE) {
            noZeros = MAX_ZERO_SEQUENCE;
        }
        return noZeros;
    }

    /**
     *
     * getPrimaryFieldName.
     *
     * @param assetType asset (e.g. bl,eq, ta, property)
     * @return pk field name
     */
    private String getPrimaryFieldName(final String assetType) {
        return AssetType.PROPERTY.toString().equals(assetType) ? "pr_id" : assetType + "_id";
    }
}
