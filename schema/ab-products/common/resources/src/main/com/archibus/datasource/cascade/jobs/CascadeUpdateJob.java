package com.archibus.datasource.cascade.jobs;

import java.util.Iterator;

import com.archibus.context.ContextStore;
import com.archibus.core.event.data.*;
import com.archibus.core.event.data.DataEvent.BeforeOrAfter;
import com.archibus.datasource.SqlUtils;
import com.archibus.datasource.cascade.*;
import com.archibus.datasource.cascade.common.CascadeUtility;
import com.archibus.datasource.data.*;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.JobBase;

/**
 * Implements the cascade update job.
 * 
 * @author Catalin Purice
 * 
 */
public class CascadeUpdateJob extends JobBase {
    
    /**
     * Records to update.
     */
    private final DataRecord recordToUpdate;
    
    /**
     * Constructor.
     * 
     * @param deletedRecord record to be deleted
     */
    public CascadeUpdateJob(final DataRecord deletedRecord) {
        super();
        this.recordToUpdate = deletedRecord;
    }
    
    @Override
    public void run() {
        
        final CascadeRecord updateCascade = new CascadeUpdateImpl(this.recordToUpdate);
        
        SqlUtils.checkEditPermission(CascadeUtility.getTableNameFromRecord(this.recordToUpdate));
        
        if (SqlUtils.isSybase()) {
            
            final String updatePkStatement = buildUpdateStatement(this.recordToUpdate);
            
            final CascadeRecord syncDoc = new CascadeUpdateImpl(this.recordToUpdate);
            syncDoc.cascadeDocsOnly();
            
            // update the primary key.
            EventHandlerBase.executeDbSql(ContextStore.get().getEventHandlerContext(),
                CascadeUtility.getTableNameFromRecord(this.recordToUpdate), updatePkStatement,
                false);
            
        } else {
            
            updateCascade.cascade();
            
        }
        
        /**
         * trigger "UPDATE" DataEvent for the updatedRecord of the root table after actual changes
         */
        CascadeUtility.triggerDataEvent(updateCascade, this.recordToUpdate, BeforeOrAfter.AFTER,
            ChangeType.UPDATE);
        
    }
    
    /**
     * 
     * Build update statement from record.
     * 
     * @param record record
     * @return UPDATE statement
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    private String buildUpdateStatement(final DataRecord record) {
        
        final StringBuffer sqlCommand = new StringBuffer("UPDATE ");
        
        sqlCommand.append(CascadeUtility.getTableNameFromRecord(record));
        
        sqlCommand.append(" SET ");
        
        final Iterator<DataValue> iter = record.getFields().iterator();
        
        int noOfFieldsToSet = 0;
        
        while (iter.hasNext()) {
            
            final DataValue elem = iter.next();
            final Object value = elem.getValue();
            final Object oldValue = elem.getOldValue();
            
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
            
            if (noOfFieldsToSet++ > 0) {
                sqlCommand.append(',');
            }
            
            sqlCommand.append(elem.getFieldDef().fullName());
            sqlCommand.append('=');
            sqlCommand.append(elem.getDbValue());
        }
        
        sqlCommand.append(CascadeUtility.buildPrimaryKeyRestriction(record, false));
        
        return sqlCommand.toString();
        
    }
    
}
