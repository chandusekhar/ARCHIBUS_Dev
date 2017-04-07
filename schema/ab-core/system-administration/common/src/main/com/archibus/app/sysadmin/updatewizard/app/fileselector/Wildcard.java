package com.archibus.app.sysadmin.updatewizard.app.fileselector;

import com.archibus.app.sysadmin.updatewizard.app.packager.PackagerConstants;

/**
 * 
 * Provides methods that defines the WILDCARD state.
 * <p>
 * 
 * Used by {@link FileListFilter} to filter the files by WILDCARD.
 * 
 * @author Catalin Purice
 * @since 21.2
 * 
 */
public class Wildcard {
    
    /**
     * true if the WILDCARD has a start prefix.
     */
    private boolean isStartPrefix;
    
    /**
     * true if the WILDCARD has an end prefix.
     */
    private boolean isEndPrefix;
    
    /**
     * the start prefix.
     */
    private String startPrefix;
    
    /**
     * The end prefix.
     */
    private String endPrefix;
    
    /**
     * Represents the strings that should be included inside the name.
     */
    private final String[] matchers;
    
    /**
     * 
     * Constructor.
     * 
     * @param name wild card
     */
    public Wildcard(final String name) {
        
        final String localName = name.trim().toLowerCase();
        
        this.matchers = localName.split("\\*");
        
        if (!localName.startsWith(PackagerConstants.ALL_CHAR)) {
            this.isStartPrefix = true;
            this.startPrefix = this.matchers[0];
        }
        if (!localName.endsWith(PackagerConstants.ALL_CHAR)) {
            this.isEndPrefix = true;
            this.endPrefix = this.matchers[this.matchers.length - 1];
        }
    }
    
    /**
     * Getter for the startPrefix property.
     * 
     * @see startPrefix
     * @return the startPrefix property.
     */
    public String getStartPrefix() {
        return this.startPrefix;
    }
    
    /**
     * Getter for the endPrefix property.
     * 
     * @see endPrefix
     * @return the endPrefix property.
     */
    public String getEndPrefix() {
        return this.endPrefix;
    }
    
    /**
     * Getter for the isStartPrefix property.
     * 
     * @see isStartPrefix
     * @return the isStartPrefix property.
     */
    public boolean hasStartPrefix() {
        return this.isStartPrefix;
    }
    
    /**
     * Setter for the isStartPrefix property.
     * 
     * @see isStartPrefix
     * @param isStart the isStartPrefix to set
     */
    
    public void setStartPrefix(final boolean isStart) {
        this.isStartPrefix = isStart;
    }
    
    /**
     * Getter for the isEndPrefix property.
     * 
     * @see isEndPrefix
     * @return the isEndPrefix property.
     */
    public boolean hasEndPrefix() {
        return this.isEndPrefix;
    }
    
    /**
     * Setter for the isEndPrefix property.
     * 
     * @see isEndPrefix
     * @param isEnd the isEndPrefix to set
     */
    
    public void setEndPrefix(final boolean isEnd) {
        this.isEndPrefix = isEnd;
    }
    
    /**
     * Getter for the matchers property.
     * 
     * @see matchers
     * @return the matchers property.
     */
    public String[] getMatchers() {
        return this.matchers.clone();
    }
    
}
