package com.archibus.datasource.cascade.loader;

import java.util.List;

import com.archibus.context.ContextStore;
import com.archibus.datasource.CascadeHandlerImpl;
import com.archibus.datasource.cascade.CascadeHandler;
import com.archibus.datasource.cascade.loader.tabletree.*;
import com.archibus.datasource.cascade.sqlbuilder.*;
import com.archibus.schema.ArchibusFieldDefBase;
import com.archibus.schema.FieldDefBase.Immutable;
import com.archibus.utility.StringUtil;

/**
 * 
 * Provides methods to load the cascade tables for delete cascade. It will also generate the SQL
 * commands.
 * <p>
 * 
 * @author Catalin Purice
 * @since 20.1
 * 
 */
public class TablesLoaderDeleteImpl extends AbstractTablesLoader implements TablesLoader {
    
    /**
     * Constructor.
     * 
     * @param cascadeMan Cascade Manager
     */
    public TablesLoaderDeleteImpl(final CascadeHandler cascadeMan) {
        super(cascadeMan);
    }
    
    /**
     * {@inheritDoc}
     */
    @Override
    public void processCascadeTables() {
        
        if (this.log.isDebugEnabled()) {
            this.log.debug("Cascade Delete: TablesLoaderDeleteImpl.loadChildren(CascadeTableDef) "
                    + "--> Loading tables");
        }
        
        loadChildren(getRootTable());
        
        if (this.log.isDebugEnabled()) {
            this.log.debug("Cascade Delete: TablesLoaderDeleteImpl.loadChildren(CascadeTableDef)"
                    + " --> Tables loaded successfully.");
            this.log
                .debug("Cascade Delete: TablesLoaderDeleteImpl.buildSqlCommands(CascadeTableDef) "
                        + "--> Sql commands loaded successfully.");
        }
        
        buildSqlCommands(getRootTable());
    }
    
    @Override
    boolean hasDependentChildren(final CascadeTableDef cascadeTableDef) {
        boolean hasChildren = false;
        if (cascadeTableDef.hasPrimaryKeyReference()) {
            hasChildren = true;
        } else {
            for (final ForeignKeyRestriction fKey : cascadeTableDef.getForeignKeys()) {
                final ArchibusFieldDefBase.Immutable fieldDef =
                        cascadeTableDef.getTableDef().getFieldDef(fKey.getForeignKey().getName());
                if (!fieldDef.getAllowNull()) {
                    hasChildren = true;
                    break;
                }
            }
        }
        return hasChildren;
    }
    
    /**
    *
    * Returns the allow null value for the field. If the value is overwritten in core-optional.xml
    * cascadeHandler bean, then this value is returned.
    *
    * @param fieldDef field definition
    * @return allow null value
    */
   public static boolean getAllowNull(final Immutable fieldDef) {
       boolean allowNull = fieldDef.getAllowNull();
       final List<String> doNotAllowNullFieldsNames =
               ((CascadeHandlerImpl) ContextStore.get().getBean("cascadeHandler"))
                   .getCascadeDeleteDoNotAllowNullFieldsNames();
       if (StringUtil.notNullOrEmpty(doNotAllowNullFieldsNames)
               && doNotAllowNullFieldsNames.contains(fieldDef.fullName())) {
           allowNull = false;
       }
       return allowNull;
   }

   @Override
    void saveSqlCommands(final CascadeTableDef cascadeTable,
            final SqlCommandsBuilder sqlCommandsObject) {
        
        cascadeTable.setSqlCommand(((CascadeDeleteCommandsImpl) sqlCommandsObject)
            .getSqlStatements());
    }
    
    @Override
    SqlCommandsBuilder createCommandsBuilder(final CascadeTableDef childTable,
            final SqlRestriction sqlRestriction) {
        return new CascadeDeleteCommandsImpl(childTable, sqlRestriction);
    }
}
