package com.archibus.app.sysadmin.updatewizard.schema.sqlgenerator;

import java.util.*;

import com.archibus.app.sysadmin.updatewizard.project.compare.CompareFieldUtilities;
import com.archibus.datasource.SqlUtils;

/**
 * Describes database types for Oracle, SqlServe and Sybase.
 * 
 * @author Catalin Purice
 * 
 */
public class SqlTypes {
    
    /**
     * The Map representing the data types of each db type.
     * <p>
     * Suppress PMD warning "AvoidStaticFields".
     * <p>
     * Justification: False positive: this is a map of constants.
     */
    @SuppressWarnings("PMD.AvoidStaticFields")
    public static final Map<Integer, SqlTypes> DATATYPE = new HashMap<Integer, SqlTypes>();
    
    /**
     * Constant. Represents the CHAR data type for afm_flds.data_type.
     */
    public static final int SQL_CHAR = 1;
    
    /**
     * Constant. Represents the DATE data type for afm_flds.data_type.
     */
    public static final int SQL_DATE = 9;
    
    /**
     * Constant. Represents the DECIMAL data type for afm_flds.data_type.
     */
    public static final int SQL_DECIMAL = 3;
    
    /**
     * Constant. Represents the DOUBLE data type for afm_flds.data_type.
     */
    public static final int SQL_DOUBLE = 8;
    
    /**
     * Constant. Represents the FLOAT data type for afm_flds.data_type.
     */
    public static final int SQL_FLOAT = 6;
    
    /**
     * Constant. Represents the INTEGER data type for afm_flds.data_type.
     */
    public static final int SQL_INTEGER = 4;
    
    /**
     * Constant. Represents the LONGVARBINARY data type for afm_flds.data_type.
     */
    public static final int SQL_LONGVARBINARY = 14;
    
    /**
     * Constant. Represents the LONGVARCHAR data type for afm_flds.data_type.
     */
    public static final int SQL_LONGVARCHAR = 13;
    
    /**
     * Constant. Represents the NUMERIC data type for afm_flds.data_type.
     */
    public static final int SQL_NUMERIC = 2;
    
    /**
     * Constant. Represents the REAL data type for afm_flds.data_type.
     */
    public static final int SQL_REAL = 7;
    
    /**
     * Constant. Represents the SMALLINT data type for afm_flds.data_type.
     */
    public static final int SQL_SMALLINT = 5;
    
    /**
     * Constant. Represents the TIME data type for afm_flds.data_type.
     */
    public static final int SQL_TIME = 10;
    
    /**
     * Constant. Represents the TIMESTAMP data type for afm_flds.data_type.
     */
    public static final int SQL_TIMESTAMP = 11;
    
    /**
     * Constant. Represents the VARCHAR data type for afm_flds.data_type.
     */
    public static final int SQL_VARCHAR = 12;
    
    /**
     * Constant.
     */
    private static final String CHAR = "CHAR(%d%s)";
    
    /**
     * Constant.
     */
    private static final String DATE = "DATE";
    
    /**
     * Constant.
     */
    private static final String DATETIME = "DATETIME";
    
    /**
     * Constant.
     */
    private static final String FLOAT = "FLOAT";
    
    /**
     * Constant.
     */
    private static final String FLOAT_53 = "FLOAT(53)";
    
    /**
     * Constant.
     */
    private static final String IMAGE = "IMAGE";
    
    /**
     * Constant.
     */
    private static final String INTEGER = "INTEGER";
    
    /**
     * Constant.
     */
    private static final String NUMBER = "NUMBER(*,0)";
    
    /**
     * Constant.
     */
    private static final String NUMBER_D_D = "NUMBER(%d, %d)";
    
    /**
     * Constant.
     */
    private static final String NUMERIC = "NUMERIC(%d,%d)";
    
    /**
     * Constant.
     */
    private static final String SMALLINT = "SMALLINT";
    
    /**
     * Constant.
     */
    private static final String VARCHAR = "VARCHAR(%d)";
    
    /**
     * Constant.
     */
    private static final String VARCHAR2 = "VARCHAR2(%d%s)";
    
    /**
     * Constant.
     */
    private static final CharSequence OPEN_BRAKET = "(";
    
    /**
     * static initialization.
     */
    static {
        DATATYPE.put(SQL_CHAR, new SqlTypes(CHAR, VARCHAR2, CHAR, true, false, SQL_CHAR,
            SQL_VARCHAR, SQL_CHAR));
        DATATYPE.put(SQL_NUMERIC, new SqlTypes(NUMERIC, NUMBER_D_D, NUMERIC, true, true,
            SQL_NUMERIC, SQL_NUMERIC, SQL_NUMERIC));
        DATATYPE.put(SQL_DECIMAL, new SqlTypes(NUMERIC, NUMBER_D_D, NUMERIC, true, true,
            SQL_NUMERIC, SQL_NUMERIC, SQL_NUMERIC));
        DATATYPE.put(SQL_INTEGER, new SqlTypes(INTEGER, NUMBER, INTEGER, false, false, SQL_INTEGER,
            SQL_NUMERIC, SQL_INTEGER));
        DATATYPE.put(SQL_SMALLINT, new SqlTypes(SMALLINT, NUMBER, SMALLINT, false, false,
            SQL_SMALLINT, SQL_NUMERIC, SQL_SMALLINT));
        DATATYPE.put(SQL_FLOAT, new SqlTypes(FLOAT, FLOAT, FLOAT_53, false, false, SQL_FLOAT,
            SQL_FLOAT, SQL_FLOAT));
        DATATYPE.put(SQL_REAL, new SqlTypes("REAL", FLOAT, FLOAT_53, false, false, SQL_REAL,
            SQL_FLOAT, SQL_FLOAT));
        DATATYPE.put(SQL_DOUBLE, new SqlTypes("DOUBLE", NUMBER_D_D, FLOAT_53, false, false,
            SQL_DOUBLE, SQL_NUMERIC, SQL_FLOAT));
        DATATYPE.put(SQL_DATE, new SqlTypes(DATE, DATE, DATETIME, false, false, SQL_DATE, SQL_DATE,
            SQL_DATE));
        DATATYPE.put(SQL_TIME, new SqlTypes("TIME", DATE, DATETIME, false, false, SQL_TIME,
            SQL_DATE, SQL_DATE));
        DATATYPE.put(SQL_TIMESTAMP, new SqlTypes(DATE, DATE, DATETIME, false, false, SQL_DATE,
            SQL_DATE, SQL_DATE));
        DATATYPE.put(SQL_VARCHAR, new SqlTypes(VARCHAR, VARCHAR2, VARCHAR, true, false,
            SQL_VARCHAR, SQL_VARCHAR, SQL_VARCHAR));
        DATATYPE.put(SQL_LONGVARCHAR, new SqlTypes(VARCHAR, VARCHAR2, VARCHAR, true, false,
            SQL_VARCHAR, SQL_VARCHAR, SQL_VARCHAR));
        DATATYPE.put(SQL_LONGVARBINARY, new SqlTypes(IMAGE, "BLOB", IMAGE, false, false,
            SQL_LONGVARBINARY, SQL_LONGVARBINARY, SQL_LONGVARBINARY));
        
    }
    
    /**
     * true if the decimals are take into consideration for the data type.
     */
    private final transient boolean decimalsMatters;
    
    /**
     * Sql Server group type. TODO what is group type?
     */
    private final transient int msSqlGroupType;
    
    /**
     * Oracle group type.
     */
    private final transient int oracleGroupType;
    
    /**
     * Oracle type. What "type" means?
     */
    private final transient String oracleType;
    
    /**
     * true if the size is take into consideration for the data type.
     */
    private final transient boolean sizeMatters;
    
    /**
     * Sql Server type.
     */
    private final transient String sqlServerType;
    
    /**
     * Sybase group type.
     */
    private final transient int sybaseGroupType;
    
    /**
     * Sybase type.
     */
    private final transient String sybaseType;
    
    /**
     * Constructor.
     * 
     * @param sqlType the sql type as appears in ARCHIBUS data dictionary
     */
    public SqlTypes(final int sqlType) {
        final SqlTypes myType = DATATYPE.get(sqlType);
        this.sybaseType = myType.sybaseType;
        this.oracleType = myType.oracleType;
        this.sqlServerType = myType.sqlServerType;
        this.sizeMatters = myType.sizeMatters;
        this.decimalsMatters = myType.decimalsMatters;
        this.sybaseGroupType = myType.sybaseGroupType;
        this.oracleGroupType = myType.oracleGroupType;
        this.msSqlGroupType = myType.msSqlGroupType;
    }
    
    /**
     * Constructor.
     * 
     * @param sybaseType Sybase type
     * @param oracleType Oracle Type
     * @param sqlserverType Sql Server type
     * @param sizeMatters true is the size will be take into consideration
     * @param decimalsMatters true is the decimals will be take into consideration
     * @param sybaseGroupType group of Sybase data type
     * @param oracleGroupType group of Oracle data type
     * @param msSqlGroupType group of Sql Server data type
     * 
     */
    // CHECKSTYLE:OFF Justification: TODO Fix this warnings later. The parameters should be grouped
    // into classes by the database type.
    // TODO: (VT): I disagree with the justification. The warning should be fixed.
    private SqlTypes(final String sybaseType, final String oracleType, final String sqlserverType,
            final boolean sizeMatters, final boolean decimalsMatters, final int sybaseGroupType,
            final int oracleGroupType, final int msSqlGroupType) {
        // CHECKSTYLE:ON
        this.sybaseType = sybaseType;
        this.oracleType = oracleType;
        this.sqlServerType = sqlserverType;
        this.sizeMatters = sizeMatters;
        this.decimalsMatters = decimalsMatters;
        this.sybaseGroupType = sybaseGroupType;
        this.oracleGroupType = oracleGroupType;
        this.msSqlGroupType = msSqlGroupType;
    }
    
    /**
     * @return group type
     */
    public int getGroupType() {
        int gType = SQL_CHAR;
        // TODO dependency on SqlUtils (which depends on Context) is not a best practice
        if (SqlUtils.isSybase()) {
            gType = getSybaseGroupType();
        } else if (SqlUtils.isOracle()) {
            gType = getOracleGroupType();
        } else {
            gType = getMsSqlGroupType();
        }
        return gType;
    }
    
    /**
     * @return the decimalsMatters
     */
    public boolean isDecimalsMatters() {
        return this.decimalsMatters;
    }
    
    /**
     * @return the oracleType
     */
    public String isOracle() {
        return this.oracleType;
    }
    
    /**
     * @return the sizeMatters
     */
    public boolean isSizeMatters() {
        return this.sizeMatters;
    }
    
    /**
     * @return the sqlServerType
     */
    public String isSqlServer() {
        return this.sqlServerType;
    }
    
    /**
     * @return the sybaseType
     */
    public String isSybase() {
        return this.sybaseType;
    }
    
    /**
     * @return the msSqlGroupType
     */
    private int getMsSqlGroupType() {
        return this.msSqlGroupType;
    }
    
    /**
     * @return the oracleGroupType
     */
    private int getOracleGroupType() {
        return this.oracleGroupType;
    }
    
    /**
     * @return the sybaseGroupType
     */
    private int getSybaseGroupType() {
        return this.sybaseGroupType;
    }
    
    /**
     * Converts data type from String to (CHAR->1).
     * 
     * @param dataType data type
     * @return data type as integer
     */
    public static String getGroupTypeByType(final String dataType) {
        String archibusType = String.valueOf(SQL_CHAR);
        // TODO dependency on SqlUtils (which depends on Context) is not a best practice
        if (SqlUtils.isSybase()) {
            archibusType = dataType;
        } else {
            final Set<Map.Entry<Integer, SqlTypes>> set = DATATYPE.entrySet();
            final Iterator<Map.Entry<Integer, SqlTypes>> iter = set.iterator();
            while (iter.hasNext()) {
                final Map.Entry<Integer, SqlTypes> object = iter.next();
                String charType = object.getValue().sqlServerType;
                if (SqlUtils.isOracle()) {
                    charType = object.getValue().oracleType;
                }
                if (charType.contains(OPEN_BRAKET)) {
                    charType = charType.substring(0, charType.indexOf('('));
                }
                if (dataType.equalsIgnoreCase(charType)) {
                    archibusType = String.valueOf(object.getValue().getGroupType());
                    break;
                }
            }
        }
        return archibusType;
    }
    
    /**
     * 
     * @param dataType data type as integer
     * @return data type as literal (CHAR, NUMBER ...)
     */
    public static String dataTypeToLiteral(final int dataType) {
        String dataTypeToChar = "";
        // TODO dependency on SqlUtils (which depends on Context) is not a best practice
        if (SqlUtils.isOracle()) {
            dataTypeToChar = SqlTypes.DATATYPE.get(dataType).oracleType;
        } else if (SqlUtils.isSqlServer()) {
            dataTypeToChar = SqlTypes.DATATYPE.get(dataType).sqlServerType;
        } else {
            dataTypeToChar = SqlTypes.DATATYPE.get(dataType).sybaseType;
        }
        int endIndex = dataTypeToChar.length();
        if (dataTypeToChar.contains(OPEN_BRAKET)) {
            endIndex = dataTypeToChar.indexOf('(');
        }
        return dataTypeToChar.substring(0, endIndex);
    }
    
    /**
     * 
     * @param sqlDataType sql data type
     * @param afmDataType ARCHIBUS data type
     * @param groupType group data type
     * @return sql type difference
     */
    public static String checkGroupType(final String sqlDataType, final String afmDataType,
            final String groupType) {
        String sqlDiff = "";
        if (!sqlDataType.equalsIgnoreCase(String.valueOf(groupType))) {
            sqlDiff =
                    String.format(CompareFieldUtilities.OLD_AND_NEW_VAL_MESS,
                        SqlTypes.dataTypeToLiteral(Integer.parseInt(afmDataType)),
                        SqlTypes.dataTypeToLiteral(Integer.parseInt(sqlDataType)));
        }
        return sqlDiff;
    }
    
    /**
     * 
     * @param afmDataType data type from ARCHIBUS Schema
     * @param csvDataType data type from CSV file
     * @return true if the data type is different
     */
    public static boolean isDataTypeDifferent(final String afmDataType, final String csvDataType) {
        
        boolean isDifferent =
                csvDataType.equalsIgnoreCase(String.valueOf(afmDataType)) ? false : true;
        
        final boolean isAfmCharType =
                String.valueOf(SqlTypes.SQL_CHAR).equals(afmDataType)
                        || String.valueOf(SqlTypes.SQL_VARCHAR).equals(afmDataType);
        final boolean isCsvCharType =
                String.valueOf(SqlTypes.SQL_CHAR).equals(csvDataType)
                        || String.valueOf(SqlTypes.SQL_VARCHAR).equals(csvDataType);
        
        if (SqlUtils.isOracle() && isAfmCharType && isCsvCharType) {
            isDifferent = false;
        }
        return isDifferent;
    }
    
    /**
     * 
     * @param dataType1 first data type
     * @param dataType2 second data type
     * @return true if different
     */
    public static boolean compareArchibusDataType(final int dataType1, final int dataType2) {
        boolean isDifferent = false;
        if (dataType1 != dataType2) {
            // compare group types.
            final int groupType1 = new SqlTypes(dataType1).getGroupType();
            final int groupType2 = new SqlTypes(dataType2).getGroupType();
            if (groupType1 != groupType2) {
                isDifferent = true;
            }
        }
        return isDifferent;
    }
}
