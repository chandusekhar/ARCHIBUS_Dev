package com.archibus.app.sysadmin.updatewizard.project.job;

import com.archibus.app.sysadmin.updatewizard.project.transfer.mergeschema.*;
import com.archibus.jobmanager.*;

/**
 * This job updates data dictionary from merge data dictionary tab.
 * 
 * @author Catalin Purice
 * 
 */
public class UpdateArchibusSchemaJob extends JobBase {
    
    /**
     * action type: Recommended or Chosen.
     */
    private final ActionType action;
    
    /**
     * true if the SQL commands will be executed directly on DB.
     */
    private final boolean isExecuteCommands;
    
    /**
     * true if the SQL commands will be logged into external file.
     */
    private final boolean isLogCommands;
    
    /**
     * Constructor.
     * 
     * @param chosenAction action
     * @param isExecute see this.isExecuteCommands
     * @param isLog log the SQL commands
     */
    public UpdateArchibusSchemaJob(final ActionType chosenAction, final boolean isExecute,
            final boolean isLog) {
        super();
        this.action = chosenAction;
        this.isLogCommands = isLog;
        this.isExecuteCommands = isExecute;
    }
    
    @Override
    public void run() {
        
        final IMergeSchema mergeDataDictionary =
                new MergeSchema(this.action, this.isExecuteCommands, this.isLogCommands);
        
        mergeDataDictionary.upgradeSchema(this.status);
        
        this.status.setCode(JobStatus.JOB_COMPLETE);
    }
}
