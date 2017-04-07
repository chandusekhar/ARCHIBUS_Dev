package com.archibus.datasource.cascade.jobs;

import com.archibus.context.ContextStore;
import com.archibus.core.event.data.*;
import com.archibus.core.event.data.DataEvent.BeforeOrAfter;
import com.archibus.datasource.SqlUtils;
import com.archibus.datasource.cascade.*;
import com.archibus.datasource.cascade.common.CascadeUtility;
import com.archibus.datasource.data.*;
import com.archibus.db.ViewField;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.JobBase;

/**
 * Implements the cascade delete job.
 * 
 * @author Catalin Purice
 * 
 */
public class CascadeDeleteJob extends JobBase {
    
    /**
     * Record to delete.
     */
    private final DataRecord recordToDelete;
    
    /**
     * Constructor.
     * 
     * @param deletedRecord record to be deleted
     */
    public CascadeDeleteJob(final DataRecord deletedRecord) {
        super();
        this.recordToDelete = deletedRecord;
    }
    
    @Override
    public void run() {
        final CascadeRecord deleteCascade = new CascadeDeleteImpl(this.recordToDelete);
        
        SqlUtils.checkEditPermission(CascadeUtility.getTableNameFromRecord(this.recordToDelete));
        
        /**
         * trigger "DELETE" DataEvent for the deletedRecord of the root table before actual changes.
         */
        CascadeUtility.triggerDataEvent(deleteCascade, this.recordToDelete, BeforeOrAfter.BEFORE,
            ChangeType.DELETE);
        
        if (SqlUtils.isSybase()) {
            
            final String deleteRecordStatement = buildDeleteStatement(this.recordToDelete);
            
            /*
             * delete from document tables final CascadeRecord syncDoc = new
             * CascadeDeleteImpl(record); syncDoc.cascadeDocsOnly();
             */
            EventHandlerBase.executeDbSql(ContextStore.get().getEventHandlerContext(),
                CascadeUtility.getTableNameFromRecord(this.recordToDelete), deleteRecordStatement,
                false);
            
        } else {
            
            deleteCascade.cascade();
            
        }
    }
    
    /**
     * 
     * Build delete statement from record.
     * 
     * @param record record
     * @return DELETE statement
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    private String buildDeleteStatement(final DataRecord record) {
        
        final StringBuffer sqlCommand = new StringBuffer("DELETE FROM ");
        
        sqlCommand.append(CascadeUtility.getTableNameFromRecord(record));
        
        // create a record with primary key fields only.
        final DataRecord recordWithPKOnly = new DataRecord();
        
        for (final DataValue fieldVal : record.getFields()) {
            // 3041435 - make sure the field value is not empty for hidden fields' primary keys,
            // usually defined in standard table.
            final ViewField.Immutable fieldDef = fieldVal.getFieldDef();
            final Object fieldValue = fieldVal.getValue();
            if (fieldDef.isPrimaryKey() && fieldValue != null) {
                recordWithPKOnly.addField(fieldDef);
                recordWithPKOnly.setValue(fieldDef.fullName(), fieldValue);
                recordWithPKOnly.setOldValue(fieldDef.fullName(), fieldValue);
            }
        }
        
        sqlCommand.append(CascadeUtility.buildPrimaryKeyRestriction(recordWithPKOnly, true));
        
        return sqlCommand.toString();
    }
    
}
