package com.archibus.datasource.cascade;

import com.archibus.utility.ExceptionBase;

/**
 * Interface to be implemented by CascadeDeleteImpl, CascadeUpdateImpl.
 * <p>
 * 
 * @author Catalin Purice
 */
public interface CascadeRecord {
    
    /**
     * Cascade delete or update.
     * 
     * @throws ExceptionBase ExceptionBase
     */
    void cascade() throws ExceptionBase;
    
    /**
     * Cascade documents.
     * 
     * @throws ExceptionBase ExceptionBase
     */
    void cascadeDocsOnly() throws ExceptionBase;
}
