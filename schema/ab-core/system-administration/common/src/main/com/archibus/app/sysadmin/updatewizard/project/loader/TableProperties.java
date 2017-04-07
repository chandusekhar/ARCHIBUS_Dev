package com.archibus.app.sysadmin.updatewizard.project.loader;

import java.util.List;

import com.archibus.app.sysadmin.updatewizard.project.transfer.in.TransferFileIn;
import com.archibus.app.sysadmin.updatewizard.project.util.*;

/**
 * Stores table properties like: name, records, exist.
 * 
 * @author Catalin Purice
 * 
 */
public class TableProperties {
    
    /**
     * Difference set as messages.
     */
    private List<String> changeMessages;
    
    /**
     * Name of the table.
     */
    private String name;
    
    /**
     * Number of records from table.
     */
    private int noOfRecords;
    
    /**
     * Number of records from CSV file.
     */
    private int noCsvRecords;
    
    /**
     * If table exist in SQL then this variable is true, and false otherwise.
     */
    private boolean existsTableInSql;
    
    /**
     * If table exist in ARCHIBUS data dictionary then this variable is true, and false otherwise.
     */
    private boolean existsTableInArchibus;
    
    /**
     * afm_transfer_set.set_name.
     */
    private String defaultSetName = ProjectUpdateWizardConstants.PROJUPWIZ;
    
    /**
     * Type of the table according to afm_tbls.table_type field.
     */
    private String type;
    
    /**
     * @return the changeMessages
     */
    public List<String> getChangeMessages() {
        return this.changeMessages;
    }
    
    /**
     * @return the name
     */
    public String getName() {
        return this.name;
    }
    
    /**
     * @return the noOfRecords
     */
    public int getNoOfRecords() {
        return this.noOfRecords;
    }
    
    /**
     * @return the noCsvRecords
     */
    public int getNoCsvRecords() {
        return this.noCsvRecords;
    }
    
    /**
     * @return the isTableInSql
     */
    public boolean isTableInSql() {
        return this.existsTableInSql;
    }
    
    /**
     * @param isTableInSql the isTableInSql to set
     */
    public void setTableInSql(final boolean isTableInSql) {
        this.existsTableInSql = isTableInSql;
    }
    
    /**
     * @param option the setName to set
     */
    public void setSetName(final String option) {
        this.defaultSetName = option;
    }
    
    /**
     * @return the seName
     */
    public String getSetName() {
        return this.defaultSetName;
    }
    
    /**
     * @return the isTableInArchibus
     */
    public boolean isTableInArchibus() {
        return this.existsTableInArchibus;
    }
    
    /**
     * @param isTableInArchibus the isTableInArchibus to set
     */
    public void setTableInArchibus(final boolean isTableInArchibus) {
        this.existsTableInArchibus = isTableInArchibus;
    }
    
    /**
     * Get number of record form DB.
     */
    public void getNoOfRecordsFromDB() {
        this.noOfRecords = ProjectUpdateWizardUtilities.getNoOfRecordsFromDB(this.name);
    }
    
    /**
     * Get number of records form CSV file.
     */
    public void countNoOfRecordsFromCsv() {
        final TransferFileIn fileToTable = new TransferFileIn();
        // check if file exists
        fileToTable.setTableName(this.name);
        if (fileToTable.fileExists()) {
            final int totalRecords = new DataSourceFile(this.name + ".csv").getNoOfRecords();
            this.noCsvRecords = totalRecords;
        } else {
            this.noCsvRecords = 0;
        }
    }
    
    /**
     * @return the type
     */
    public String getType() {
        return this.type;
    }
    
    /**
     * @param changeMessages the changeMessages to set
     */
    public void setChangeMessages(final List<String> changeMessages) {
        this.changeMessages = changeMessages;
    }
    
    /**
     * @param name the name to set
     */
    public void setName(final String name) {
        this.name = name;
    }
    
    /**
     * @param noOfRecords the noOfRecords to set
     */
    public void setNoOfRecords(final int noOfRecords) {
        this.noOfRecords = noOfRecords;
    }
    
    /**
     * @param type the type to set
     */
    public void setType(final String type) {
        this.type = type;
    }
}
