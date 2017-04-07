package com.archibus.app.sysadmin.updatewizard.project.transfer.mergeschema;

import java.util.*;

import com.archibus.app.sysadmin.updatewizard.project.loader.TablesLoader;
import com.archibus.app.sysadmin.updatewizard.schema.output.*;
import com.archibus.context.ContextStore;
import com.archibus.datasource.SqlUtils;
import com.archibus.datasource.data.DataRecord;
import com.archibus.jobmanager.JobStatus;

/**
 * 
 * Provides the main method of upgrading the schema based on CSV files.
 * <p>
 * 
 * @author Catalin Purice
 * @since 21.3
 * 
 */
public class MergeSchema implements IMergeSchema {
    
    /**
     * Action type.
     */
    private final ActionType actionType;
    
    /**
     * Output for data dictionary changes.
     */
    private final SqlCommandOutput dataDictionaryOutput;
    
    /**
     * Output for new group names.
     */
    private final SqlCommandOutput afmGroupsOutput;
    
    /**
     * Postponed statements.
     */
    private final List<String> postponedStatements;
    
    /**
     * 
     * Constructor.
     * 
     * @param aType action type
     * @param isExecuteCommands execute commands on database.
     * @param isLogCommands log the SQL commands.
     */
    public MergeSchema(final ActionType aType, final boolean isExecuteCommands,
            final boolean isLogCommands) {
        this.actionType = aType;
        // this.loader = new DataDictionaryChangesLoader(aType);
        this.dataDictionaryOutput =
                OutputBuilder.createDataDictionaryChangesOutput(isExecuteCommands, isLogCommands);
        this.afmGroupsOutput =
                OutputBuilder.createAfmGroupsChangesOutput(isExecuteCommands, isLogCommands);
        this.postponedStatements = new ArrayList<String>();
    }
    
    /**
     * Updates the data dictionary.
     * 
     * @param status job status
     */
    public void upgradeSchema(final JobStatus status) {
        
        final List<DataRecord> records = DataSourceBuilder.loadChanges(this.actionType);
        
        status.setTotalNumber(records.size());
        
        boolean existsRefChanges = false;
        boolean existsDataDictionaryChanges = false;
        boolean setDefineOff = false;
        
        for (final DataRecord record : records) {
            
            final DictionaryRecord dRecord = new DictionaryRecord(record, this.actionType);
            final IExecutor executor = new Executor(dRecord);
            
            executor.execute();
            
            if (!executor.getRefStatements().isEmpty()) {
                existsRefChanges = true;
                this.afmGroupsOutput.runCommands(executor.getRefStatements());
            }
            
            if (!executor.getStatements().isEmpty()) {
                existsDataDictionaryChanges = true;
                if (SqlUtils.isOracle() && !setDefineOff
                        && this.dataDictionaryOutput instanceof ExecuteAndLogSqlCommands) {
                    ((ExecuteAndLogSqlCommands) this.dataDictionaryOutput).getLogger()
                        .runCommandNoParams(Arrays.asList("SET DEFINE OFF;"));
                    setDefineOff = true;
                }
                this.dataDictionaryOutput.runCommands(executor.getStatements());
            }
            
            this.postponedStatements.addAll(executor.getPostponedStatements());
            
            status.incrementCurrentNumber();
            
        }
        
        this.dataDictionaryOutput.runCommands(this.postponedStatements);
        
        if (!existsRefChanges) {
            this.afmGroupsOutput.runCommandNoParams(Arrays.asList(LogCommand.BLANK_FILE_MESSAGE));
        }
        
        if (!existsDataDictionaryChanges) {
            this.dataDictionaryOutput.runCommandNoParams(Arrays
                .asList(LogCommand.BLANK_FILE_MESSAGE));
        }
        
        this.dataDictionaryOutput.close();
        this.afmGroupsOutput.close();
        
        setTablesChangesByDbUpWiz();
    }
    
    /**
     * 
     * Save changed tables into context attribute.
     */
    public void setTablesChangesByDbUpWiz() {
        final Set<String> tableNames = TablesLoader.getTablesNamesChangedByProjUpWiz();
        ContextStore.get().getHttpSession().getServletContext()
            .setAttribute("tablesChangedByDCW", tableNames);
    }
    
}
