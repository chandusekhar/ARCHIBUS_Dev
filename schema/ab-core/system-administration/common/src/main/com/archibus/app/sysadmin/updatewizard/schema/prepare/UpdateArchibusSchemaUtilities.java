package com.archibus.app.sysadmin.updatewizard.schema.prepare;

import com.archibus.context.ContextStore;

/**
 * Provides utilities for ARCHIBUS schema.
 * 
 * @author Catalin Purice
 * @since 20.1
 * 
 */
public class UpdateArchibusSchemaUtilities {
    
    /**
     * Reloads the ARCHIBUS Data Dictionary.
     * 
     * Added to avoid rebuilding database (KB 3031934).
     */
    public void refreshDataDictionary() {
        ContextStore.get().getProject().clearCachedTableDefs();
    }
}