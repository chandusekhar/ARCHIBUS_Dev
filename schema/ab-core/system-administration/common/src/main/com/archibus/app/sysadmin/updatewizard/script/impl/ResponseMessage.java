package com.archibus.app.sysadmin.updatewizard.script.impl;

import com.archibus.app.sysadmin.updatewizard.script.service.ElapsedTime;

/**
 *
 * Response Message.
 *
 * @author Catalin Purice
 * @since 22.1
 *
 */
public class ResponseMessage {
    
    /**
     *
     * Message error level.
     *
     */
    public enum Level {

        /**
         * ERROR message tag.
         */
        ERROR,
        /**
         * INFO message tag.
         */
        INFO,
        /**
         * WARNING message tag.
         */
        WARN
    }

    /**
     * MAX characters length for level.
     */
    private static final int MAX_LEVEL_LENGTH = 5;
    
    /**
     * Message as text.
     */
    private final String message;

    /**
     * Type of message.
     */
    private final Level type;

    /**
     * Execution time.
     */
    private final String executionTime;

    /**
     * Constructor.
     *
     * @param message message text.
     * @param type message type
     */
    public ResponseMessage(final String message, final Level type) {
        super();
        this.executionTime = ElapsedTime.getCurrentTimestamp();
        this.message = message;
        this.type = type;
    }
    
    /**
     * Getter for the message property.
     *
     * @see message
     * @return the message property.
     */
    public String getMessage() {
        return this.message;
    }
    
    /**
     * Getter for the type property.
     *
     * @see type
     * @return the type property.
     */
    public Level getType() {
        return this.type;
    }

    /**
     * Getter for the executionTime property.
     *
     * @see executionTime
     * @return the executionTime property.
     */
    public String getExecutionTime() {
        return this.executionTime;
    }

    /**
     *
     * This is the message that will be logged into Message Log.
     *
     * @return String
     */
    public String getFullMessage() {
        return formatType() + this.executionTime + this.message;
    }

    /**
     *
     * Format the type for message.
     *
     * @return formated type.
     */
    private String formatType() {
        final StringBuffer typeMsgFormat = new StringBuffer();
        typeMsgFormat.append('[');

        typeMsgFormat.append(this.type.name());

        final int difference = MAX_LEVEL_LENGTH - this.type.name().length();

        if (difference > 0) {
            for (int step = 0; step < difference; step++) {
                typeMsgFormat.append(' ');
            }
        }
        typeMsgFormat.append(']');

        return typeMsgFormat.toString();
    }

}
