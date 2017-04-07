package com.archibus.datasource.cascade;

import java.util.List;

import com.archibus.app.common.util.*;
import com.archibus.context.*;
import com.archibus.core.event.data.IDataEventListener;
import com.archibus.datasource.cascade.common.ExecuteSql;
import com.archibus.datasource.cascade.loader.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.jobmanager.JobStatus;
import com.archibus.utility.ExceptionBase;

/**
 * 
 * Implements cascade update call.
 * 
 * @author Catalin Purice
 * 
 */
public class CascadeUpdateImpl extends CascadeHandler implements CascadeRecord {
    
    /**
     * Constructor.
     * 
     * @param updatedRecord record to be updated
     */
    public CascadeUpdateImpl(final DataRecord updatedRecord) {
        super(updatedRecord);
        setCascadeUpdate(true);
    }
    
    /**
     * {@inheritDoc}
     */
    public void cascade() throws ExceptionBase {
        
        final TablesLoader loader = new TablesLoaderUpdateImpl(this);
        
        loader.processCascadeTables();
        
        final List<String> updateCascadeSqlCommands = loader.getCascadeSqlCommands();
        
        if (isMergePrimaryKey()) {
            getJobStatus().setTotalNumber(updateCascadeSqlCommands.size());
        }
        
        if (this.log.isDebugEnabled()) {
            this.log.debug("Cascade Handler: START running cascade update.");
        }
        
        final SuspendDataEventsTemplate suspendDataEventsTemplate =
                new SuspendDataEventsTemplate(IDataEventListener.class);
        suspendDataEventsTemplate.doWithContext(new Callback() {
            public Object doWithContext(final Context context) throws ExceptionBase {
                for (final String sqlCommand : updateCascadeSqlCommands) {
                    ExecuteSql.runCommand(sqlCommand);
                    if (isMergePrimaryKey()) {
                        getJobStatus().incrementCurrentNumber();
                    }
                }
                return null;
            }
        });
        
        final List<String> recreateCircularFKeysCommands = loader.getPostponedCascadeSqlCommands();
        
        if (!recreateCircularFKeysCommands.isEmpty()) {
            ExecuteSql.runCommands(recreateCircularFKeysCommands);
            // re-load tables definitions to reflect circular ARCHIBUS foreign keys.
            ContextStore.get().getProject().clearCachedTableDefs();
        }
        
        if (this.log.isDebugEnabled()) {
            this.log.debug("Cascade Handler: END running cascade update.");
        }
        if (isMergePrimaryKey()) {
            getJobStatus().setCode(JobStatus.JOB_COMPLETE);
        }
    }
    
    /**
     * {@inheritDoc}
     */
    public void cascadeDocsOnly() throws ExceptionBase {
        final TablesLoader loader = new TablesLoaderUpdateImpl(this);
        
        ((TablesLoaderUpdateImpl) loader).setGenerateForDocOnly(true);
        
        loader.processCascadeTables();
        
        final List<String> updateCascadeDocTablesSqlCommands =
                loader.getCascadeDocTableSqlCommands();
        
        if (this.log.isDebugEnabled()) {
            this.log.debug("Cascade Handler: START running cascade document tables.");
        }
        
        final SuspendDataEventsTemplate suspendDataEventsTemplate =
                new SuspendDataEventsTemplate(IDataEventListener.class);
        suspendDataEventsTemplate.doWithContext(new Callback() {
            public Object doWithContext(final Context context) throws ExceptionBase {
                ExecuteSql.runCommands(updateCascadeDocTablesSqlCommands);
                return null;
            }
        });
        if (this.log.isDebugEnabled()) {
            this.log.debug("Cascade Handler: END running cascade update document tables.");
        }
    }
}
