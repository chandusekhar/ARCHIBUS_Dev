package com.archibus.eventhandler.documentarchive;

import java.util.*;

import com.archibus.context.ContextStore;
import com.archibus.context.utility.EventHandlerContextTemplate;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.jobmanager.*;
import com.archibus.schema.*;
import com.archibus.utility.*;
import com.ibm.icu.text.SimpleDateFormat;

/**
 * Based on AFM WINDOWS ArchiveDocs.abs, archive or un-archive document records. It issues a few of
 * SQL statements to update a large number of records at once. The nested SQL statements like
 * "INSERT...SELECT" and "DELET...SELECT" can not be easily converted to DataSource parameters to
 * comply with the best practice "Avoid using SQL statements".
 * 
 * @author Yong Shao.
 * 
 *         Justification: Case #2: Statement with INSERT ... SELECT pattern.
 */
@SuppressWarnings("PMD.AvoidUsingSql")
public class DocumentArchive extends JobBase {
    /**
     * A name for table "afm_docvers".
     */
    private static final String AFM_DOCVERS = "afm_docvers";
    
    /**
     * A name for table "afm_docversarch".
     */
    private static final String AFM_DOCVERSARCH = "afm_docversarch";
    
    /**
     * A name for table "afm_docs".
     */
    private static final String AFM_DOCS = "afm_docs";
    
    /**
     * A name for field "table_name".
     */
    private static final String TABLE_NAME = "table_name";
    
    /**
     * A name for field "checkin_date".
     */
    private static final String CHECKIN_DATE = "checkin_date";
    
    /**
     * A name for field "pkey_value".
     */
    private static final String PKEY_VALUE = "pkey_value";
    
    /**
     * A name for field "field_name".
     */
    private static final String FIELD_NAME = "field_name";
    
    /**
     * Move records from afm_docvers into afm_docversarch.
     * 
     * @param tableName table name.
     * @param endDate end date.
     * @throws ExceptionBase if there is a database error.
     */
    public void archive(final String tableName, final java.util.Date endDate) throws ExceptionBase {
        // records in the inventory table
        final List<DataRecord> records = getRecordsWithArchive(tableName);
        
        final SimpleDateFormat dateFormat = new SimpleDateFormat();
        dateFormat.applyPattern("yyyy-MM-dd");
        
        // Check existence of any record in the inventory table
        for (DataRecord record : records) {
            archiveRecord(dateFormat.format(endDate), record.getString("afm_docvers.table_name"));
        }
        
    }
    
    /**
     * Get all records for potential archiving.
     * 
     * @param tableName table name.
     * @return List<DataRecord>.
     */
    private List<DataRecord> getRecordsWithArchive(final String tableName) {
        final DataSource dataSource = getDataSource(AFM_DOCVERS, new String[] { TABLE_NAME,
                CHECKIN_DATE, PKEY_VALUE });
        
        if (StringUtil.notNullOrEmpty(tableName)) {
            dataSource.addRestriction(new Restrictions.Restriction.Clause(AFM_DOCVERS, TABLE_NAME,
                tableName, Restrictions.OP_EQUALS));
        }
        
        return dataSource.getAllRecords();
    }
    
    /**
     * Get dataSource object with fully-set context object.
     * 
     * @param tableName table name.
     * @param fieldNames field names.
     * @return DataSource.
     */
    private DataSource getDataSource(final String tableName, final String[] fieldNames) {
        final DataSource dataSource = DataSourceFactory.createDataSourceForFields(tableName,
            fieldNames);
        
        // it's critical here to set EventHandlerContext into dataSource
        final EventHandlerContext context = EventHandlerContextTemplate
            .prepareEventHandlerContext();
        dataSource.setContext(context);
        
        return dataSource;
    }
    
    /**
     * Archive Record.
     * 
     * @param endDate end date.
     * @param table table name.
     */
    private void archiveRecord(final String endDate, final String table) {
        // XXX: Literal before using it in sql statements
        final String tableName = SqlUtils.makeLiteralOrBlank(table);
        
        final StringBuffer commonWhere = new StringBuffer(250);
        // Assemble Where clauses which would be used in a nested SQL statement like INSERT…SELECT.
        // No way to use parsed restriction with dataSource APIs!
        commonWhere.append(" WHERE checkin_date <= '");
        commonWhere.append(endDate);
        commonWhere
            .append("' AND version <> (SELECT MAX(version) FROM afm_docvers AS afm_docvers_inner "
                    + "WHERE afm_docvers.table_name = '");
        commonWhere.append(tableName);
        commonWhere.append("' AND afm_docvers.field_name = afm_docvers_inner.field_name "
                + "AND afm_docvers.pkey_value = afm_docvers_inner.pkey_value)");
        
        final StringBuffer specialWhere = new StringBuffer(250);
        
        // Assemble Where clauses which would be used in a nested SQL statement like INSERT…SELECT.
        // No way to use parsed restriction with dataSource APIs!
        specialWhere.append(" WHERE afm_docversarch.table_name = '");
        specialWhere.append(tableName);
        specialWhere.append("' AND afm_docversarch.field_name = afm_docvers.field_name "
                + "AND afm_docversarch.pkey_value = afm_docvers.pkey_value)");
        
        // Copy each record from table afm_docvers into table afm_docversarch
        copyArchivedRecords(commonWhere, specialWhere);
        
        // Delete the records from afm_docvers table that are copied to the afm_docversarch
        // table
        deleteArchivedRecords(commonWhere, specialWhere);
    }
    
    /**
     * Copy archived records from afm_docvers into afm_docversarch.
     * 
     * @param commonWhere common part of where restriction.
     * @param specialWhere special part of where restriction.
     */
    private void copyArchivedRecords(final StringBuffer commonWhere, final StringBuffer specialWhere) {
        final StringBuffer sql = new StringBuffer(250);
        // The following SQL statement can not be easily converted to DataSource parameters: it
        // contains nested SQL statements: INSERT…SELECT.
        sql.append("INSERT INTO afm_docversarch (" + getFieldNames(AFM_DOCVERSARCH) + ")"
                + " SELECT " + getFieldNames(AFM_DOCVERS) + " FROM afm_docvers "
                + commonWhere.toString() + " AND NOT EXISTS (SELECT 1 FROM afm_docversarch "
                + specialWhere.toString());
        
        final DataSource dataSource = DataSourceFactory.createDataSource()
            .addTable(AFM_DOCVERSARCH).addQuery(sql.toString());
        dataSource.executeUpdate();
        dataSource.commit();
    }
    
    /**
     * Delete archived records from afm_docvers.
     * 
     * @param commonWhere common part of where restriction.
     * @param specialWhere special part of where restriction
     */
    private void deleteArchivedRecords(final StringBuffer commonWhere,
            final StringBuffer specialWhere) {
        // The following SQL statement can not be easily converted to DataSource parameters: it
        // contains nested SQL statements: DELET…SELECT.
        final String sql = "DELETE FROM afm_docvers " + commonWhere.toString()
                + " AND EXISTS (SELECT 1 FROM afm_docversarch " + specialWhere.toString();
        
        final DataSource dataSource = DataSourceFactory.createDataSource().addTable(AFM_DOCVERS)
            .addQuery(sql);
        dataSource.executeUpdate();
        dataSource.commit();
    }
    
    /**
     * Get Field Names.
     * 
     * @param tableName table name.
     * @return field names.
     */
    private String getFieldNames(final String tableName) {
        final TableDef.ThreadSafe tableDef = ContextStore.get().getProject()
            .loadTableDef(tableName);
        final List<String> fieldNames = new ArrayList<String>();
        for (ArchibusFieldDefBase.Immutable fieldDef : tableDef.getFieldsList()) {
            fieldNames.add(fieldDef.getName());
        }
        
        return Utility.arrayToString(fieldNames.toArray(new String[fieldNames.size()]), ",");
    }
    
    /**
     * Move records from afm_docversarch into afm_docvers and clear them from afm_docversarch.
     * 
     * @param tableName table name.
     * @param fieldName field name.
     * @param keyValue key value.
     * @throws ExceptionBase if there is a database error.
     */
    public void unArchive(final String tableName, final String fieldName, final String keyValue)
            throws ExceptionBase {
        // the record does not exist in the afm_docs table for the chosen record then create it
        addRecordIfNotExisting(tableName, fieldName, keyValue);
        
        // move record from afm_docversarch to afm_docvers
        copyUnArchivedRecords(tableName, fieldName, keyValue);
        
        // DELETE FROM afm_docversarch with the same WHERE as above
        deleteUnArchivedRecords(tableName, fieldName, keyValue);
    }
    
    /**
     * If un-archived record doesn't exist in table afm_docs, create a new record.
     * 
     * @param tableName table name.
     * @param fieldName field name.
     * @param keyValue key value.
     */
    private void addRecordIfNotExisting(final String tableName, final String fieldName,
            final String keyValue) {
        final DataSource dataSource = getDataSource(AFM_DOCS, new String[] { TABLE_NAME,
                FIELD_NAME, PKEY_VALUE });
        
        // add parsed restrictions to dataSource
        addParsedRestrictions(dataSource, AFM_DOCS, tableName, fieldName, keyValue);
        final DataRecord record = dataSource.getRecord();
        if (record == null) {
            dataSource.clearRestrictions();
            // create a new record
            final DataRecord newRecord = dataSource.createNewRecord();
            newRecord.setValue("afm_docs.table_name", tableName);
            newRecord.setValue("afm_docs.field_name", fieldName);
            newRecord.setValue("afm_docs.pkey_value", keyValue);
            dataSource.saveRecord(newRecord);
        }
    }
    
    /**
     * Add parsed restrictions to dataSource.
     * 
     * @param dataSource data Source.
     * @param mainTable main table name.
     * @param tableName table name.
     * @param fieldName field name.
     * @param keyValue key value.
     */
    private static void addParsedRestrictions(final DataSource dataSource, final String mainTable,
            final String tableName, final String fieldName, final String keyValue) {
        dataSource.addRestriction(new Restrictions.Restriction.Clause(mainTable, TABLE_NAME,
            tableName, Restrictions.OP_EQUALS));
        dataSource.addRestriction(new Restrictions.Restriction.Clause(mainTable, FIELD_NAME,
            fieldName, Restrictions.OP_EQUALS));
        dataSource.addRestriction(new Restrictions.Restriction.Clause(mainTable, PKEY_VALUE,
            keyValue, Restrictions.OP_EQUALS));
    }
    
    /**
     * Copy un-archived record from afm_docversarch to afm_docvers.
     * 
     * @param tableName table name.
     * @param fieldName field name.
     * @param keyValue key value.
     */
    private void copyUnArchivedRecords(final String tableName, final String fieldName,
            final String keyValue) {
        final StringBuffer sql = new StringBuffer(250);
        // The following SQL statement can not be easily converted to DataSource parameters: it
        // contains nested SQL statements: INSERT…SELECT.
        sql.append("INSERT INTO afm_docvers (");
        sql.append(getFieldNames(AFM_DOCVERS));
        sql.append(") SELECT " + getFieldNames(AFM_DOCVERSARCH)
                + " FROM afm_docversarch WHERE afm_docversarch.table_name = '"
                + SqlUtils.makeLiteralOrBlank(tableName) + "' AND afm_docversarch.field_name = '"
                + SqlUtils.makeLiteralOrBlank(fieldName) + "' AND afm_docversarch.pkey_value = '"
                + SqlUtils.makeLiteralOrBlank(keyValue) + "'");
        
        final DataSource dataSource = DataSourceFactory.createDataSource().addTable(AFM_DOCVERS)
            .addQuery(sql.toString());
        dataSource.executeUpdate();
        dataSource.commit();
    }
    
    /**
     * Delete un-archived records from afm_docversarch.
     * 
     * @param tableName table name.
     * @param fieldName field name.
     * @param keyValue key value.
     */
    private void deleteUnArchivedRecords(final String tableName, final String fieldName,
            final String keyValue) {
        final DataSource dataSource = getDataSource(AFM_DOCVERSARCH, new String[] { TABLE_NAME,
                FIELD_NAME, PKEY_VALUE });
        
        // add parsed restrictions to dataSource
        addParsedRestrictions(dataSource, AFM_DOCVERSARCH, tableName, fieldName, keyValue);
        
        final List<DataRecord> records = dataSource.getRecords();
        if (records != null) {
            for (DataRecord record : records) {
                dataSource.deleteRecord(record);
            }
        }
    }
    
}
