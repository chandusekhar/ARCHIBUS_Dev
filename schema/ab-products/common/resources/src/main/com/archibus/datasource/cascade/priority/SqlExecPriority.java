package com.archibus.datasource.cascade.priority;

import java.util.List;

/**
 * 
 * Interface to be implemented by SqlExecPriorityDeleteImpl and SqlExecPriorityUpdateImpl.
 * <p>
 * 
 * @author Catalin Purice
 * 
 */
public interface SqlExecPriority {
    
    /**
     * Prioritize SQL commands by dependancy.
     */
    void prioritize();
    
    /**
     * Returns SQL commands.
     * 
     * @return List<String>
     */
    List<String> getSqlCommands();
    
    /**
     * Returns SQL commands for document tables sync only.
     * 
     * @return List<String>
     */
    List<String> getDocumentSqlCommands();
    
}
