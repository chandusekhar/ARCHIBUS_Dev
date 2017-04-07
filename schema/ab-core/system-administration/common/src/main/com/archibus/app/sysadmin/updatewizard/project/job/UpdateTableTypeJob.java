package com.archibus.app.sysadmin.updatewizard.project.job;

import java.util.*;

import com.archibus.app.sysadmin.updatewizard.project.util.*;
import com.archibus.app.sysadmin.updatewizard.schema.output.*;
import com.archibus.datasource.*;
import com.archibus.datasource.data.*;
import com.archibus.jobmanager.*;

/**
 * Gets table_type and default_view from the db and updates the database. Applies to old DB only.
 * 
 * @author Catalin Purice
 * 
 */
public class UpdateTableTypeJob extends JobBase {
    
    /**
     * Constant.
     */
    private static final String FILE_NAME = "afm_tbls_table_types";
    
    /**
     * Constant.
     */
    private static final String AFM_TBLS_TABLE_TYPE = "afm_tbls.table_type";
    
    /**
     * Constant.
     */
    private static final String AFM_TBLS_TABLE_NAME = "afm_tbls.table_name";
    
    /**
     * Constant.
     */
    private static final String TABLE_TYPE = "table_type";
    
    /**
     * Output.
     */
    private SqlCommandOutput output;
    
    /**
     * Load the afm_tbls_table_types.csv table data.
     * 
     * @return List<Map<String, Object>>
     */
    private List<Map<String, Object>> loadTablesTypes() {
        return CsvUtilities.getMapsFromFile(FILE_NAME);
    }
    
    /**
     * Updates afm_tbls.table_type with the values from afm_tbls_table_types.csv.
     */
    public void updateTablesTypes() {
        
        final String[] fields = { "table_name", TABLE_TYPE };
        final DataSource afmTblsDs =
                DataSourceFactory.createDataSourceForFields(ProjectUpdateWizardConstants.AFM_TBLS,
                    fields);
        final List<DataRecord> records = afmTblsDs.getRecords();
        final List<Map<String, Object>> afmTblsFromFile = loadTablesTypes();
        if (!afmTblsFromFile.isEmpty()) {
            this.status.setTotalNumber(records.size());
            this.status.setCurrentNumber(0);
            for (final DataRecord record : records) {
                final String tableName = record.getString(AFM_TBLS_TABLE_NAME);
                final Map<String, Object> tableMap =
                        CsvUtilities.getTableMap(tableName, afmTblsFromFile);
                if (!tableMap.isEmpty()) {
                    record.setValue(AFM_TBLS_TABLE_TYPE, tableMap.get(TABLE_TYPE).toString());
                    saveRecord(afmTblsDs, record);
                }
                this.status.incrementCurrentNumber();
            }
        }
    }
    
    /**
     * 
     * Save record to DB.
     * 
     * @param dataSource data source
     * @param record record
     *            <p>
     *            Suppress PMD warning "AvoidUsingSql" in this method.
     *            <p>
     *            Justification: Case #5 - Logging SQL statements.
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    private void saveRecord(final DataSource dataSource, final DataRecord record) {
        
        dataSource.saveRecord(record);
        
        if (hasRecordChanged(record)) {
            this.output.runCommand(
                "UPDATE afm_tbls SET table_type = "
                        + SqlUtils.formatValueForSql(record.getString(AFM_TBLS_TABLE_TYPE))
                        + " WHERE table_name = "
                        + SqlUtils.formatValueForSql(record.getString(AFM_TBLS_TABLE_NAME)),
                DataSource.ROLE_STANDARD);
        }
    }
    
    /**
     * Returns true if any of the field values in the updatedRecord have changed.
     * 
     * @param updatedRecord the record to check.
     * @return true if any of the field values in the updatedRecord have changed.
     */
    private boolean hasRecordChanged(final DataRecord updatedRecord) {
        boolean hasRecordChanged = false;
        final List<DataValue> fields = updatedRecord.getFields();
        for (final DataValue field : fields) {
            final Object value = field.getValue();
            final Object oldValue = field.getOldValue();
            if (value == null) {
                if (oldValue == null) {
                    // value did not change, skip field
                    continue;
                }
            } else {
                if (value.equals(oldValue)) {
                    // value did not change, skip field
                    continue;
                }
            }
            
            hasRecordChanged = true;
            break;
        }
        
        return hasRecordChanged;
    }
    
    @Override
    public void run() {
        this.output = new LogCommand(ProjectUpdateWizardConstants.BOOTSTRAP_FILE_DUW, true);
        updateTablesTypes();
        this.status.setCode(JobStatus.JOB_COMPLETE);
    }
}
