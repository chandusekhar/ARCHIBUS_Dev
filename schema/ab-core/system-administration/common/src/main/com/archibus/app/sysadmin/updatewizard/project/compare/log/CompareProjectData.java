package com.archibus.app.sysadmin.updatewizard.project.compare.log;

import java.util.*;

import com.archibus.app.sysadmin.updatewizard.project.util.*;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;

/**
 * 
 * Write no of records from project tables compared to CSV files into a RecCount.log file.
 * 
 * @author Catalin Purice
 * 
 */
public class CompareProjectData implements LogWriter {
    
    /**
     * constant.
     */
    private static final String NO_OF_TABLES = "Total number of tables[Project|CSV Files]: [%s|%s]";
    
    /**
     * constant.
     */
    private static final String TABLE_HEADLINE =
            "Table name | Records[Project|CSV Files] | Table out of Total";
    
    /**
     * constant.
     */
    private static final String LINE =
            "------------------------------------------------------------";
    
    /**
     * constant.
     */
    private static final String TABLE_BODY = "%s | [%s|%s] | [%s/%s]";
    
    /**
     * constant.
     */
    private static final String TOTAL_RECORDS = "Total records [Project|CSV Files]: [%s|%s]";
    
    /**
     * project data logger.
     */
    private final ProjectUpdateWizardLogger projectDataLog;
    
    /**
     * 
     */
    private String tableName;
    
    /**
     * 
     */
    private int totalTablesToCompare;
    
    /**
     * 
     */
    private int currTablePos;
    
    /**
     * 
     */
    private int totalRecordsInDb;
    
    /**
     * 
     */
    private int totalRecordsInCsv;
    
    /**
     * 
     */
    private final List<DataRecord> tableRecords;
    
    /**
     * Constructor.
     */
    public CompareProjectData() {
        super();
        this.currTablePos = 0;
        this.totalRecordsInDb = 0;
        this.totalRecordsInCsv = 0;
        this.tableRecords = new ArrayList<DataRecord>();
        this.projectDataLog = new ProjectUpdateWizardLogger("RecCount.log");
    }
    
    /**
     * @return the tableName
     */
    public String getTableName() {
        return this.tableName;
    }
    
    /**
     * @param tableName the tableName to set
     */
    public void setTableName(final String tableName) {
        this.tableName = tableName;
    }
    
    /**
     * @param totalRecordsInDb the totalRecordsInDb to set
     */
    public void setTotalRecordsInDb(final int totalRecordsInDb) {
        this.totalRecordsInDb = this.totalRecordsInDb + totalRecordsInDb;
    }
    
    /**
     * @param totalRecordsInCsv the totalRecordsInCsv to set
     */
    public void setTotalRecordsInCsv(final int totalRecordsInCsv) {
        this.totalRecordsInCsv = this.totalRecordsInCsv + totalRecordsInCsv;
    }
    
    /**
     * 
     * @param record record
     */
    public void writeEachTableDetail(final DataRecord record) {
        final String tblName = record.getString("afm_transfer_set.table_name");
        final int noOfRecordsInFile = record.getInt("afm_transfer_set.nrecords_source");
        final int noOfRecordsInTable = record.getInt("afm_transfer_set.nrecords_dest");
        setTableName(tblName);
        this.currTablePos++;
        this.projectDataLog.logMessage(String.format(TABLE_BODY, tblName, noOfRecordsInTable,
            noOfRecordsInFile, this.currTablePos, this.totalTablesToCompare));
        setTotalRecordsInDb(noOfRecordsInTable);
        setTotalRecordsInCsv(noOfRecordsInFile);
        if (this.currTablePos == this.totalTablesToCompare) {
            this.projectDataLog.logMessage(String.format(TOTAL_RECORDS, this.totalRecordsInDb,
                this.totalRecordsInCsv));
            this.projectDataLog.logMessage(LINE);
            this.projectDataLog.addNewLine();
        }
    }
    
    /**
     * log total no of tables.
     */
    private void writeTotalHeadTitle() {
        final int noOfProjectTables = ProjectUpdateWizardUtilities.getProjectTableNames().size();
        final List<Map<String, Object>> tablesFromFile =
                CsvUtilities.getMapsFromFile(ProjectUpdateWizardConstants.AFM_TBLS);
        final int noOfCsvFiles = CsvUtilities.getTableNamesOnly(tablesFromFile).size();
        this.projectDataLog.logMessage(LINE);
        this.projectDataLog.addNewLine();
        this.projectDataLog
            .logMessage(String.format(NO_OF_TABLES, noOfProjectTables, noOfCsvFiles));
    }
    
    /**
     * Writes to RecCount.log file.
     */
    public void writeToLogFile() {
        loadTablesInfoFromDatabase();
        writeTotalHeadTitle();
        this.projectDataLog.logMessage(TABLE_HEADLINE);
        this.projectDataLog.logMessage(LINE);
        this.projectDataLog.addNewLine();
        
        for (final DataRecord record : this.tableRecords) {
            writeEachTableDetail(record);
        }
    }
    
    /**
     * Loads table information from database.
     */
    private void loadTablesInfoFromDatabase() {
        final DataSource comparatorDs = DataSourceFactory.createDataSource();
        comparatorDs.addTable(ProjectUpdateWizardConstants.AFM_TRANSFER_SET);
        comparatorDs.addField("autonumbered_id");
        comparatorDs.addField("table_name");
        comparatorDs.addField("nrecords_dest");
        comparatorDs.addField("nrecords_source");
        comparatorDs.addField("nrecords_inserted");
        comparatorDs.addField("nrecords_missing");
        comparatorDs.addField("nrecords_updated");
        this.tableRecords.addAll(comparatorDs.getRecords());
        this.totalTablesToCompare = this.tableRecords.size();
    }
}
