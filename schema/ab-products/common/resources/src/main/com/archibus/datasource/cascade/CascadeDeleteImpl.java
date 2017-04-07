package com.archibus.datasource.cascade;

import java.util.List;

import com.archibus.app.common.util.*;
import com.archibus.context.*;
import com.archibus.core.event.data.IDataEventListener;
import com.archibus.datasource.cascade.common.ExecuteSql;
import com.archibus.datasource.cascade.loader.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.utility.ExceptionBase;

/**
 * 
 * Implements cascade delete call.
 * 
 * @author Catalin Purice
 * 
 */
public class CascadeDeleteImpl extends CascadeHandler implements CascadeRecord {
    
    /**
     * Constructor.
     * 
     * @param deletedRecord record to be deleted
     */
    public CascadeDeleteImpl(final DataRecord deletedRecord) {
        super(deletedRecord);
        setCascadeDelete(true);
    }
    
    /**
     * {@inheritDoc}
     */
    public void cascade() throws ExceptionBase {
        final TablesLoader loader = new TablesLoaderDeleteImpl(this);
        
        loader.processCascadeTables();
        
        final List<String> deleteCascadeSqlCommands = loader.getCascadeSqlCommands();
        
        final List<String> recreateCircularFKeysCommands = loader.getPostponedCascadeSqlCommands();
        
        if (this.log.isDebugEnabled()) {
            this.log.debug("Cascade Handler: START running cascade update SQL commands.");
        }
        final SuspendDataEventsTemplate suspendDataEventsTemplate =
                new SuspendDataEventsTemplate(IDataEventListener.class);
        suspendDataEventsTemplate.doWithContext(new Callback() {
            public Object doWithContext(final Context context) throws ExceptionBase {
                ExecuteSql.runCommands(deleteCascadeSqlCommands);
                return null;
            }
        });
        
        if (!recreateCircularFKeysCommands.isEmpty()) {
            ExecuteSql.runCommands(recreateCircularFKeysCommands);
            // re-load tables definitions to reflect circular ARCHIBUS foreign keys.
            ContextStore.get().getProject().clearCachedTableDefs();
        }
        
        if (this.log.isDebugEnabled()) {
            this.log.debug("Cascade Handler: END running cascade delete.");
        }
    }
    
    /**
     * {@inheritDoc}
     */
    public void cascadeDocsOnly() throws ExceptionBase {
        final TablesLoader loader = new TablesLoaderDeleteImpl(this);
        
        ((TablesLoaderDeleteImpl) loader).setGenerateForDocOnly(true);
        
        loader.processCascadeTables();
        
        final List<String> deleteCascadeDocTablesSqlCommands =
                loader.getCascadeDocTableSqlCommands();
        
        if (this.log.isDebugEnabled()) {
            this.log.debug("Cascade Handler: START running cascade document tables.");
        }
        
        final SuspendDataEventsTemplate suspendDataEventsTemplate =
                new SuspendDataEventsTemplate(IDataEventListener.class);
        suspendDataEventsTemplate.doWithContext(new Callback() {
            public Object doWithContext(final Context context) throws ExceptionBase {
                ExecuteSql.runCommands(deleteCascadeDocTablesSqlCommands);
                return null;
            }
        });
        if (this.log.isDebugEnabled()) {
            this.log.debug("Cascade Handler: END running cascade delete for document tables.");
        }
    }
}