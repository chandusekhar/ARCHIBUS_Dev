package com.archibus.datasource.cascade.loader;

import java.util.*;

import org.apache.log4j.Logger;

import com.archibus.context.ContextStore;
import com.archibus.datasource.cascade.common.CascadeConstants;
import com.archibus.datasource.cascade.referencekey.*;

/**
 * Provides methods that decide if we have an circular foreign key. It also provides methods for
 * dropping/creating circular foreign keys.
 * <p>
 * 
 * @author Catalin Purice
 * 
 */
public class HandleCircularReferences {
    
    /**
     * Logger to write messages to archibus.log.
     */
    private final Logger log = Logger.getLogger(this.getClass());
    
    /**
     * Current branch.
     */
    private final List<String> currentBranch = new ArrayList<String>();
    
    /**
     * Re-create FKeys statements.
     */
    private final List<String> postponedStmts = new ArrayList<String>();
    
    /**
     * True if the branch has circular reference.
     */
    private boolean circularRef;
    
    /**
     * 
     * Handle Circular References for table if found.
     * 
     * @param tableName table name
     */
    public void handleCircularReferenceIfAny(final String tableName) {
        
        if (this.currentBranch.contains(tableName)) {
            
            this.circularRef = true;
            
            final String refTableName = this.currentBranch.get(this.currentBranch.size() - 1);
            
            final ReferenceKey archibusCircularFKey = ReferenceBuilder.createNewArchibusReference();
            
            archibusCircularFKey.loadForeignKeys(tableName, refTableName);
            
            final ReferenceKey physicCircularFKey = ReferenceBuilder.createNewPhysicalReference();
            
            physicCircularFKey.loadForeignKeys(tableName, refTableName);
            
            if (this.log.isDebugEnabled()) {
                this.log.debug("Cascade Handler: Circular Foreign Key detected on " + tableName
                        + CascadeConstants.DOT + physicCircularFKey.getConstraintsNames().get(0));
                this.log.debug("Cascade Handler: Disable ARCHIBUS foreign key for " + tableName
                        + CascadeConstants.DOT + physicCircularFKey.getConstraintsNames().get(0));
            }
            
            // disable ARCHIBUS foreign key (set validate_data=0)
            archibusCircularFKey.disable();
            
            if (this.log.isDebugEnabled()) {
                this.log.debug("Cascade Handler: Drop physical foreign key from: " + tableName
                        + CascadeConstants.DOT + physicCircularFKey.getConstraintsNames().get(0));
            }
            
            physicCircularFKey.disable();
            
            if (this.log.isDebugEnabled()) {
                this.log.debug("Cascade Handler: Postpone DDLs: " + this.postponedStmts);
            }
            
            // postpone enable physical circular fKeys
            this.postponedStmts.addAll(physicCircularFKey.getEnableConstraintsStmts());
            
            // postpone enable ARCHIBUS circular fKeys
            this.postponedStmts.addAll(archibusCircularFKey.getEnableConstraintsStmts());
            
            // re-load tables definitions
            ContextStore.get().getProject().clearCachedTableDefs();
        }
    }
    
    /**
     * Getter for the hasCircularRef property.
     * 
     * @see hasCircularRef
     * @return the hasCircularRef property.
     */
    public boolean hasCircularRef() {
        return this.circularRef;
    }
    
    /**
     * Getter for the currentBranch property.
     * 
     * @see currentBranch
     * @return the currentBranch property.
     */
    public List<String> getCurrentBranch() {
        return this.currentBranch;
    }
    
    /**
     * Adds table to currentBranch.
     * 
     * @param tableName table name
     */
    public void addToCurrentBranch(final String tableName) {
        this.currentBranch.add(tableName);
    }
    
    /**
     * Removes last element from currentBranch.
     */
    public void removeFromCurrentBranch() {
        this.currentBranch.remove(this.currentBranch.size() - 1);
    }
    
    /**
     * Getter for the addDroppedForeignKeysStmts property.
     * 
     * @see addDroppedForeignKeysStmts
     * @return the addDroppedForeignKeysStmts property.
     */
    public List<String> getAddDroppedForeignKeysStmts() {
        return this.postponedStmts;
    }
    
    /**
     * Getter for the postponedStmts property.
     * 
     * @see postponedStmts
     * @return the postponedStmts property.
     */
    public List<String> getPostponedStmts() {
        return this.postponedStmts;
    }
}
