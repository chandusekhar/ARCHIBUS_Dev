package com.archibus.app.sysadmin.updatewizard.project.transfer.mergeschema;

import java.util.List;

/**
 * 
 * Interface to be implemented by Executor.
 * <p>
 * 
 * @author Catalin Purice
 * @since 21.3
 * 
 */
public interface IExecutor {
    
    /**
     * 
     * Execute a specific command.
     */
    void execute();
    
    /**
     * 
     * getStatements.
     * 
     * @return statements
     */
    List<String> getStatements();
    
    /**
     * 
     * getRefStatements.
     * 
     * @return referenced tables statements
     */
    List<String> getRefStatements();
    
    /**
     * 
     * getPostponedStatements.
     * 
     * @return referenced tables statements
     */
    List<String> getPostponedStatements();
}
