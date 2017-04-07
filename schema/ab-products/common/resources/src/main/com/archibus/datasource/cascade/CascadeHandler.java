package com.archibus.datasource.cascade;

import org.apache.log4j.Logger;

import com.archibus.datasource.cascade.common.CascadeUtility;
import com.archibus.datasource.data.DataRecord;
import com.archibus.jobmanager.JobStatus;

/**
 * Common implementation for CascadeDeleteImpl and CascadeUpdateImpl.
 * 
 * @author Catalin Purice
 * 
 */
public class CascadeHandler {
    
    /**
     * Logger to write messages to archibus.log.
     */
    protected final Logger log = Logger.getLogger(this.getClass());
    
    /**
     * Is Cascade Delete.
     */
    private boolean isDelete;
    
    /**
     * Is Cascade Update.
     */
    private boolean isUpdate;
    
    /**
     * Is Cascade Merge Primary Keys.
     */
    private boolean isMergePK;
    
    /**
     * Table Name.
     */
    private final String parentTableName;
    
    /**
     * Record.
     */
    private final DataRecord cascadeRecord;
    
    /**
     * job status. Used for merge primary keys job.
     */
    private JobStatus jobStatus;
    
    /**
     * Constructor.
     * 
     * @param record record to be updated/deleted
     */
    public CascadeHandler(final DataRecord record) {
        super();
        this.cascadeRecord = record;
        this.parentTableName = CascadeUtility.getTableNameFromRecord(record);
    }
    
    /**
     * @return the cascadeRecord
     */
    public DataRecord getParentRecord() {
        return this.cascadeRecord;
    }
    
    /**
     * @return the parentTableName
     */
    public String getParentTableName() {
        return this.parentTableName;
    }
    
    /**
     * @return the isDelete
     */
    public boolean isCascadeDelete() {
        return this.isDelete;
    }
    
    /**
     * @return the isUpdate
     */
    public boolean isCascadeUpdate() {
        return this.isUpdate;
    }
    
    /**
     * Getter for the isMergPK property.
     * 
     * @see isMergPK
     * @return the isMergPK property.
     */
    public boolean isMergePrimaryKey() {
        return this.isMergePK;
    }
    
    /**
     * Setter for the isMergPK property.
     * 
     * @see isMergPK
     * @param isMergePKeys the isMergPK to set
     */
    
    public void setMergePrimaryKeys(final boolean isMergePKeys) {
        this.isMergePK = isMergePKeys;
    }
    
    /**
     * @param isCascadeDelete the isDelete to set
     */
    public void setCascadeDelete(final boolean isCascadeDelete) {
        this.isDelete = isCascadeDelete;
    }
    
    /**
     * @param isCascadeUpdate the isUpdate to set
     */
    public void setCascadeUpdate(final boolean isCascadeUpdate) {
        this.isUpdate = isCascadeUpdate;
    }
    
    /**
     * Getter for the jobStatus property.
     * 
     * @see jobStatus
     * @return the jobStatus property.
     */
    public JobStatus getJobStatus() {
        return this.jobStatus;
    }
    
    /**
     * Setter for the jobStatus property.
     * 
     * @see jobStatus
     * @param jobStatus the jobStatus to set
     */
    
    public void setJobStatus(final JobStatus jobStatus) {
        this.jobStatus = jobStatus;
    }
}
