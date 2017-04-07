package com.archibus.datasource.cascade.loader;

import com.archibus.datasource.cascade.CascadeHandler;
import com.archibus.datasource.cascade.loader.tabletree.CascadeTableDef;
import com.archibus.datasource.cascade.sqlbuilder.*;

/**
 * 
 * Provides methods to load the cascade tables for update cascade. It will also generate the SQL
 * commands.
 * 
 * 
 * @author Catalin Purice
 * @since 20.3
 * 
 */
public class TablesLoaderUpdateImpl extends AbstractTablesLoader implements TablesLoader {
    
    /**
     * Constructor.
     * 
     * @param cascadeMan Cascade Manager
     * @param
     */
    public TablesLoaderUpdateImpl(final CascadeHandler cascadeMan) {
        super(cascadeMan);
    }
    
    /**
     * {@inheritDoc}
     */
    public void processCascadeTables() {
        
        if (this.log.isDebugEnabled()) {
            this.log.debug("Cascade Handler: TablesLoaderDeleteImpl.loadChildren(CascadeTableDef) "
                    + "--> Loading tables");
        }
        
        loadChildren(getRootTable());
        
        if (this.log.isDebugEnabled()) {
            this.log.debug("Cascade Handler: TablesLoaderDeleteImpl.loadChildren(CascadeTableDef)"
                    + " --> Tables loaded successfully.");
            this.log
                .debug("Cascade Handler: TablesLoaderDeleteImpl.buildSqlCommands(CascadeTableDef) "
                        + "--> Sql commands loaded successfully.");
        }
        
        buildSqlCommands(getRootTable());
    }
    
    @Override
    boolean hasDependentChildren(final CascadeTableDef childTableDef) {
        return childTableDef.hasPrimaryKeyReference();
    }
    
    @Override
    void saveSqlCommands(final CascadeTableDef cascadeTable,
            final SqlCommandsBuilder sqlCommandsObject) {
        
        cascadeTable.setSqlCommand(((CascadeUpdateCommandsImpl) sqlCommandsObject)
            .getSqlStatements());
    }
    
    @Override
    SqlCommandsBuilder createCommandsBuilder(final CascadeTableDef childTable,
            final SqlRestriction sqlRestriction) {
        return new CascadeUpdateCommandsImpl(childTable, sqlRestriction, getCascManager()
            .isMergePrimaryKey());
    }
}
