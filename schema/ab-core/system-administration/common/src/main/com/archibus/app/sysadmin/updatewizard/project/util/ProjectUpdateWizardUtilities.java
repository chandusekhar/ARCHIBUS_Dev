package com.archibus.app.sysadmin.updatewizard.project.util;

import java.util.*;

import com.archibus.app.sysadmin.updatewizard.project.loader.TableProperties;
import com.archibus.app.sysadmin.updatewizard.schema.compare.CompareFieldDef;
import com.archibus.app.sysadmin.updatewizard.schema.dbschema.DatabaseSchemaUtilities;
import com.archibus.app.sysadmin.updatewizard.schema.output.JDBCUtil;
import com.archibus.app.sysadmin.updatewizard.schema.util.SchemaUpdateWizardConstants;
import com.archibus.config.Project;
import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.*;
import com.archibus.datasource.restriction.Restrictions.Restriction;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.schema.TableDef;
import com.archibus.utility.*;

/**
 * Utility class.
 *
 * @author Catalin Purice
 *
 *         This is a helper class that contains trivial methods.
 */
@SuppressWarnings("PMD.AvoidUsingSql")
public final class ProjectUpdateWizardUtilities {

    /**
     * constant.
     */
    public static final String TABLE_NAME = "table_name";

    /**
     * constant.
     */
    public static final String FIELD_NAME = "field_name";

    /**
     * constant.
     */
    public static final String IS_SQL_VIEW = "is_sql_view";

    /**
     * constant.
     */
    public static final String A_F_T_TABLE_NAME = "afm_flds_trans.table_name";

    /**
     * constant.
     */
    public static final String A_F_T_FIELD_NAME = "afm_flds_trans.field_name";

    /**
     * constant.
     */
    private static final String AUTONUMBERED_ID = "autonumbered_id";

    /**
     * constant.
     */
    private static final String COUNT = "COUNT";

    /**
     * constant.
     */
    private static final String PROCESSING_ORDER = "processing_order";

    /**
     * constant.
     */
    private static final String STATUS = "status";

    /**
     * constant.
     */
    private static final String A_T_S_TABLE_NAME = "afm_transfer_set.table_name";
    
    /**
     * SQL insert template to be used multiple times.
     */
    private static final String INSERT_INTO_AFM_TRANSFER_SET_TEMPLATE =
            "INSERT INTO afm_flds_trans(table_name, field_name, sql_table_diffs) VALUES (?, ?, ?)";

    /**
     * Constructor.
     */
    private ProjectUpdateWizardUtilities() {

    }

    /**
     * @param tableName table name.
     * @return DataSource for table name
     */
    public static DataSource createDataSourceForTable(final String tableName) {
        final Project.Immutable project = ContextStore.get().getProject();
        final TableDef.Immutable tableDefn = project.loadTableDef(tableName);
        final ListWrapper.Immutable<String> fieldNames = tableDefn.getFieldNames();
        final String[] arrFields = new String[fieldNames.size()];
        int pos = 0;
        for (final String fieldName : fieldNames) {
            arrFields[pos] = fieldName;
            pos++;
        }
        return DataSourceFactory.createDataSourceForFields(tableName, arrFields);
    }

    /**
     * Delete all fields from table. This method is called before every invocation of Transfer
     * in/out/compare operation.
     *
     * @param tableName table name from which to delete records
     */
    public static void deleteFromTable(final String tableName) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        EventHandlerBase.executeDbSql(context, "TRUNCATE TABLE " + tableName, false);
    }

    /**
     * Gets the no of tables that are not UPDATED. This is used for Resume Job operation
     *
     * @return no of tables updated
     */
    public static int getNoOfTablesUpdated() {
        final Restriction restriction = Restrictions.sql("status = 'UPDATED'");
        return DataStatistics.getInt(ProjectUpdateWizardConstants.AFM_TRANSFER_SET,
            AUTONUMBERED_ID, COUNT, restriction);
    }

    /**
     * Gets table names from afm_transfer_set with process = 'PENDING'.
     *
     * @return no of tables in pending
     */
    public static List<String> getTablesNamesInPending() {
        final String[] fields = { TABLE_NAME };
        final DataSource tableNamesDS =
                DataSourceFactory.createDataSourceForFields(
                    ProjectUpdateWizardConstants.AFM_TRANSFER_SET, fields);
        tableNamesDS.addRestriction(Restrictions.eq(ProjectUpdateWizardConstants.AFM_TRANSFER_SET,
            STATUS, ProjectUpdateWizardConstants.PENDING));
        tableNamesDS.addSort(PROCESSING_ORDER);
        tableNamesDS.addSort(TABLE_NAME);

        final List<DataRecord> records = tableNamesDS.getAllRecords();
        final List<String> tableNameList = new ArrayList<String>();
        for (int i = 0; i < records.size(); i++) {
            final DataRecord record = records.get(i);
            final String tableName = (String) record.getValue(A_T_S_TABLE_NAME);
            tableNameList.add(tableName);
        }

        return tableNameList;
    }

    /**
     * Inserts record into afm_transfer_set.
     *
     * @param compareFieldDef CompareFieldDef object
     * @param checkPK check also PK
     * @param checkFK check also FK
     */
    public static void insertIntoAfmFldsTrans(final CompareFieldDef compareFieldDef,
            final boolean checkPK, final boolean checkFK) {

        final List<String> sqlDiffMessages = new ArrayList<String>();

        if (checkPK) {
            sqlDiffMessages.add("Primary Key changed.");
        }

        if (checkFK) {
            sqlDiffMessages.add("Foreign Key changed.");
        }

        if (compareFieldDef.isNew()) {
            final String message = compareFieldDef.getFieldName() + ". Field is New.";
            sqlDiffMessages.add(message);
        }

        if (!checkPK && !checkFK) {
            sqlDiffMessages.addAll(compareFieldDef.getChangeMessages());
        }

        // insert one record per difference
        for (final String diffMessage : sqlDiffMessages) {
            JDBCUtil.executeUpdate(
                INSERT_INTO_AFM_TRANSFER_SET_TEMPLATE,
                Arrays.asList(compareFieldDef.getArchTableDef().getName(),
                    compareFieldDef.getFieldName(), diffMessage));
            SqlUtils.commit();
        }
    }

    /**
     *
     * @param tableP TableProperties object
     * @param isRecreateTable true if the table is to be recreated
     */
    public static void insertIntoAfmFldsTransWhenRecreate(final TableProperties tableP,
            final boolean isRecreateTable) {
        
        JDBCUtil.executeUpdate(INSERT_INTO_AFM_TRANSFER_SET_TEMPLATE, Arrays.asList(tableP
            .getName(), tableP.getName(), isRecreateTable ? "Table to be recreated."
                    : "Foreign keys to be recreated."));
        SqlUtils.commit();
    }

    /**
     * Inserts record into afm_transfer_set.
     *
     * @param tableProp TableProperties object
     * @param isTransferIn if the operation true else false
     */
    public static void insertIntoAfmTransferSet(final TableProperties tableProp,
            final boolean isTransferIn) {

        JDBCUtil
        .executeUpdate(
            "INSERT INTO afm_transfer_set(table_name, table_type, set_name, status, nrecords_dest, nrecords_source) VALUES (?, ?, ?, ?, ?, ?)",
                Arrays.asList(tableProp.getName(), tableProp.getType(), tableProp.getSetName(),
                ProjectUpdateWizardConstants.PENDING, isTransferIn ? tableProp.getNoOfRecords()
                        : 0,
                        isTransferIn ? tableProp.getNoCsvRecords() : tableProp.getNoOfRecords()));

        // fixing for SQL Server to work.
        tableProp.setTableInSql(DatabaseSchemaUtilities.isTableInSql(tableProp.getName()));

        if (!tableProp.isTableInSql()) {

            JDBCUtil.executeUpdate(INSERT_INTO_AFM_TRANSFER_SET_TEMPLATE, Arrays.asList(
                tableProp.getName(), tableProp.getName(), "Table doesn't exist in SQL."));
        }
        
        SqlUtils.commit();
    }

    /**
     *
     * @param tableName table name
     * @param fieldName field name
     * @return true if field exist in ARCHIBUS data dictionary
     */
    public static boolean isFieldInArchibus(final String tableName, final String fieldName) {
        return !JDBCUtil.executeQuery(
            "SELECT 1 FROM afm_flds WHERE table_name = ? AND field_name = ?",
            Arrays.asList(tableName, fieldName)).isEmpty();
    }

    /**
     *
     * @return list of table names defined in ARCHIBUS data dictionary
     */
    public static List<String> getProjectTableNames() {
        final DataSource tableDS =
                DataSourceFactory
                .createDataSource()
                .addTable(ProjectUpdateWizardConstants.AFM_TBLS)
                .addField(ProjectUpdateWizardConstants.AFM_TBLS, TABLE_NAME)
                .addRestriction(
                    Restrictions.eq(ProjectUpdateWizardConstants.AFM_TBLS, IS_SQL_VIEW, 0));
        final List<DataRecord> records = tableDS.getRecords();
        final List<String> tableNames = new ArrayList<String>();
        for (final DataRecord record : records) {
            tableNames.add(record.getValue("afm_tbls.table_name").toString());
        }
        return tableNames;
    }

    /**
     * returns true is the table exists in afm_tbls and false otherwise.
     *
     * @param tableName table name
     * @return true if table exist in ARCHIBUS data dictionary
     */
    public static boolean isTableInArchibus(final String tableName) {
        return !JDBCUtil.executeQuery(
            "SELECT 1 FROM afm_tbls WHERE is_sql_view = 0 AND table_name = ?",
            Arrays.asList(tableName)).isEmpty();
    }

    /**
     *
     * @param tableName table name
     * @param status status
     */
    public static void updateTableStatus(final String tableName, final String status) {
        JDBCUtil.executeUpdate("UPDATE afm_transfer_set SET status = ? WHERE table_name = ?",
            Arrays.asList(status, tableName));
        SqlUtils.commit();
    }

    /**
     * Returns the list of fields from ARCHIBUS data dictionary for specified table.
     *
     * @param tableName table name
     * @return list of fields
     */
    public static List<String> getProjFldNamesForTable(final String tableName) {
        final DataSource fieldsDS =
                DataSourceFactory
                .createDataSource()
                .addTable(ProjectUpdateWizardConstants.AFM_FLDS)
                .addField(ProjectUpdateWizardConstants.AFM_FLDS, FIELD_NAME)
                .addRestriction(
                    Restrictions.eq(ProjectUpdateWizardConstants.AFM_FLDS, TABLE_NAME,
                        tableName));
        final List<DataRecord> records = fieldsDS.getRecords();
        final List<String> fieldNames = new ArrayList<String>();
        for (final DataRecord record : records) {
            fieldNames.add(record.getValue("afm_flds.field_name").toString());
        }
        return fieldNames;
    }

    /**
     * get no of records from db.
     *
     * @param tableName table name
     * @return no of records Justification: The table cannot exist in ARCHIBUS Dictionary.
     */
    // TODO: (VT): Justification does not reference a particular case from the Wiki.
    public static int getNoOfRecordsFromDB(final String tableName) {
        final DataSource dsNoOfRec = DataSourceFactory.createDataSource();
        dsNoOfRec.addTable(ProjectUpdateWizardConstants.AFM_TBLS, DataSource.ROLE_MAIN);
        final String query = "SELECT COUNT(*) ${sql.as} numberOfRecords FROM " + tableName;
        dsNoOfRec.addVirtualField(ProjectUpdateWizardConstants.AFM_TBLS, "numberOfRecords",
            DataSource.DATA_TYPE_INTEGER);
        dsNoOfRec.addQuery(query);
        final DataRecord record = dsNoOfRec.getRecord();
        return record.getInt(ProjectUpdateWizardConstants.AFM_TBLS + ".numberOfRecords");
    }

    /**
     * Inserts data into afm_flds_trans.
     *
     * @param tableName table name
     * @param fieldName fieldName
     */
    public static void insertIntoAfmFldsTransWhenDrop(final String tableName, final String fieldName) {
        JDBCUtil.executeUpdate(INSERT_INTO_AFM_TRANSFER_SET_TEMPLATE, Arrays.asList(tableName,
            fieldName, "*all*".equals(fieldName) ? "Table is in SQL only." : fieldName
                    + ". Field is in SQL only."));
        SqlUtils.commit();
    }

    /**
     * Inserts data into afm_flds_trans.
     *
     * @param tableName table name
     */
    public static void insertIntoAfmTransferSetWhenDrop(final String tableName) {
        JDBCUtil
        .executeUpdate(
            "INSERT INTO afm_transfer_set(table_name, set_name, status, nrecords_source) VALUES (?, ?, ?, ?)",
            Arrays.asList(tableName, ProjectUpdateWizardConstants.PROJUPWIZ,
                ProjectUpdateWizardConstants.PENDING, getNoOfRecordsFromDB(tableName)));
        SqlUtils.commit();
    }

    /**
     *
     * @param tableName table name
     * @param fieldName field name
     * @return distinct values
     */
    public static List<String> getDistinctSqlValues(final String tableName, final String fieldName) {
        final StringBuilder query = new StringBuilder("SELECT DISTINCT ");
        query.append(tableName);
        query.append(SchemaUpdateWizardConstants.DOT);
        query.append(fieldName);
        query.append(" FROM ");
        query.append(tableName);
        final DataSource getValueListDs = DataSourceFactory.createDataSource();
        getValueListDs.addTable(tableName);
        getValueListDs.addField(fieldName);
        getValueListDs.addQuery(query.toString());

        final List<String> distinctValues = new ArrayList<String>();
        final List<DataRecord> records = getValueListDs.getRecords();
        // get distinct values
        for (final DataRecord record : records) {
            final Object keyValue =
                    record.getValue(tableName + SchemaUpdateWizardConstants.DOT + fieldName);
            if (StringUtil.notNullOrEmpty(keyValue)) {
                distinctValues.add(keyValue.toString().trim());
            }
        }
        return distinctValues;
    }

    /**
     *
     * Updates field status (afm_flds.transfer_status) to 'NO ACTION'.
     *
     * @param tableName table name
     *            <p>
     *            Justification: Case #2.2: Statements with UPDATE ... WHERE pattern.
     */
    public static void setFieldsTransferStatusToNoAction(final String tableName) {
        JDBCUtil.executeUpdate("UPDATE afm_flds SET transfer_status = ? WHERE table_name = ?",
            Arrays.asList("NO ACTION", tableName));
    }
}
