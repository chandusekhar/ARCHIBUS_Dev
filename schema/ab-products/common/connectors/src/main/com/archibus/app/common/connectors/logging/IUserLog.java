package com.archibus.app.common.connectors.logging;

/**
 * Used to log messages for Connectors. Created as Connectors may log to a table for ease of viewing
 * through Web Central.
 * 
 * @author cole
 * 
 */
public interface IUserLog {
    /**
     * Write a message to a log that can be viewed by users.
     * 
     * @param message the text to be written to the log.
     */
    void writeMessage(final String message);
}
