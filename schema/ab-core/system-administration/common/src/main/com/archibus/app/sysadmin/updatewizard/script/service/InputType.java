package com.archibus.app.sysadmin.updatewizard.script.service;

/**
 *
 * The type of system data is exchanged with.
 * <p>
 *
 * @author Catalin Purice
 * @since 22.1
 *
 */
public enum InputType {
    /**
     * File System.
     */
    FILE("File"),
    /**
     * Database Management Server.
     */
    SQL("SQL command"),
    /**
     * Update Schema.
     */
    METHOD_CALL("Update Schema"),
    /**
     * Lines to ignore.
     */
    IGNORE("Ignore line");

    /**
     * A short descriptive name for this type of system.
     */
    private final String name;
    
    /**
     * @param name a short descriptive name for this type of system.
     */
    private InputType(final String name) {
        this.name = name;
    }
    
    /**
     * @return a short descriptive name for this type of system.
     */
    public String getName() {
        return this.name;
    }
}
