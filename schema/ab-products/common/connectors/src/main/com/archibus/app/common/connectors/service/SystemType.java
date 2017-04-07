package com.archibus.app.common.connectors.service;

/**
 * The type of system data is exchanged with.
 *
 * @author cole
 * @since 22.1
 *
 */
public enum SystemType {
    /**
     * File System.
     */
    FILE("File"),
    /**
     * Database Management Server.
     */
    DBMS("Database"),
    /**
     * Local Directory Access Protocol.
     */
    LDAP("LDAP"),
    /**
     * Active Directory.
     */
    ACTIVE_DIRECTORY("Active Directory");

    /**
     * A short descriptive name for this type of system.
     */
    private final String name;
    
    /**
     * @param name a short descriptive name for this type of system.
     */
    private SystemType(final String name) {
        this.name = name;
    }
    
    /**
     * @return a short descriptive name for this type of system.
     */
    public String getName() {
        return this.name;
    }
}
