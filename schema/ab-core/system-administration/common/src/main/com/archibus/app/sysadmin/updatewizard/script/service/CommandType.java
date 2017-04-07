package com.archibus.app.sysadmin.updatewizard.script.service;

/**
 *
 * Defines the supported command types.
 * <p>
 *
 * @author Catalin Purice
 * @since 22.1
 *
 */
public enum CommandType {

    /**
     * File System.
     */
    DATA_TRANSFER("Data Transfer file"),
    /**
     * Java method Call.
     */
    UPDATE_SCHEMA("Update Schema"),
    /**
     * Java method Call.
     */
    REFRESH_DATA_DICTIONARY("Refresh Data Dictionary"),
    /**
     * Java method Call.
     */
    RELOAD_WORKFLOW_RULES("Reload workflow rules."),
    /**
     * SQL Command.
     */
    EXECUTE_SQL_COMMAND("SQL Command"),
    /**
     * SQL Command.
     */
    EXECUTE_SQL_FILE("SQL File"),
    /**
     * DUW File.
     */
    NESTED_FILE("Nested DUW File"),
    /**
     * Comment.
     */
    COMMENT("Comment");
    
    /**
     * A short descriptive name for this type of system.
     */
    private final String name;

    /**
     * @param name a short descriptive name for this type of system.
     */
    private CommandType(final String name) {
        this.name = name;
    }

    /**
     * @return a short descriptive name for this type of system.
     */
    public String getName() {
        return this.name;
    }
}
