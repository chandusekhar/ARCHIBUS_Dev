package com.archibus.app.sysadmin.updatewizard.script.service;

import java.util.*;

import org.apache.commons.lang.StringUtils;

/**
 *
 * Defines supported macros for DUW files.
 * <p>
 *
 * @author Catalin Purice
 * @since 22.1
 *
 */
public enum MacroType {

    /**
     * Comment type 1.
     */
    COMMENT_1("//", ""),
    /**
     * Comment type 2.
     */
    COMMENT_2("--", ""),
    /**
     * Comment type 2.
     */
    COMMENT_3("REM", ""),
    /**
     * Comment type 3.
     */
    COMMENT_4("/*", "*/"),
    /**
     * Import file using Data Transfer.
     */
    DATA_TRANSFER_IMPORT("${import.file('", MacroConstants.END_MACRO),
    /**
     * Export into file using Data Transfer. Not supported yet.
     */
    DATA_TRANSFER_EXPORT("${export.table('", MacroConstants.END_MACRO),
    /**
     * Runs schema update for tables.
     */
    SCHEMA_UPDATE_ALTER("${alter.table('", MacroConstants.END_MACRO),
    /**
     * Runs schema update for tables.
     */
    SCHEMA_UPDATE_RECREATE("${recreate.table('", MacroConstants.END_MACRO),
    /**
     * Refresh data dictionary.
     */
    REFRESH_DATA_DICTIONARY("${refresh.data.dictionary}", ""),
    /**
     * Reload WFR.
     */
    RELOAD_WORKFLOW_RULES("${reload.workflow.rules}", ""),
    /**
     * Runs SQL file.
     */
    NESTED_FILE("${run.script('", "'" + MacroConstants.END_MACRO),
    /**
     * Runs SQL Command.
     */
    SQL_COMMAND("", "");

    /**
     * The start with expression.
     */
    private final String startWith;
    
    /**
     * The end with expression.
     */
    private final String endWith;
    
    /**
     * @param startWith the start with template for the command.
     * @param endWith the end with template for the command.
     */
    private MacroType(final String startWith, final String endWith) {
        this.startWith = startWith;
        this.endWith = endWith;
    }

    /**
     * Getter for the startWith property.
     *
     * @see startWith
     * @return the startWith property.
     */
    public String getStartWith() {
        return this.startWith;
    }
    
    /**
     * Getter for the endWith property.
     *
     * @see endWith
     * @return the endWith property.
     */
    public String getEndWith() {
        return this.endWith;
    }
    
    /**
     *
     * Returns the macro type for the command.
     *
     * @param command command to be executed
     * @return Macrotype
     */
    public static Map<MacroType, String[]> getMacroType(final String command) {
        MacroType type = SQL_COMMAND;
        final Map<MacroType, String[]> macros = new HashMap<MacroType, String[]>();
        macros.put(type, new String[] { command });
        for (final MacroType currType : values()) {
            if (currType == SQL_COMMAND) {
                continue;
            }
            if (matchMacroType(command, currType)) {
                type = currType;
                macros.clear();
                macros.put(type, getParameters(command));
                break;
            }
        }
        return macros;
    }

    /**
     *
     * Seek for matched macro type.
     *
     * @param command extracted command
     * @param currType current type
     * @return true if matched
     */
    private static boolean matchMacroType(final String command, final MacroType currType) {
        final String extractedCommand = prepareCommand(command);
        return extractedCommand.startsWith(currType.getStartWith())
                && extractedCommand.endsWith(currType.getEndWith());
    }
    
    /**
     * Prepare command.
     * 
     * @param command the command
     * @return the command to be used
     */
    private static String prepareCommand(final String command) {
        String extractedCommand = command.trim();
        /**
         * Eliminate trails chars.
         */
        extractedCommand = extractedCommand.replaceAll("\r", "");
        extractedCommand = extractedCommand.replaceAll("\n", "");
        extractedCommand = extractedCommand.replaceAll("\t", "");
        if (extractedCommand.endsWith(";")) {
            extractedCommand = extractedCommand.substring(0, extractedCommand.length() - 1);
        }
        /**
         * Eliminate inner comments.
         */
        extractedCommand = extractedCommand.replaceAll("(\\/\\*).*?(\\*\\/)", "");
        
        return extractedCommand;
    }
    
    /**
     *
     * Return the expression parameters.
     *
     * @param command the command
     * @return parameters
     */
    private static String[] getParameters(final String command) {
        String[] parameters = { command };
        final String values =
                StringUtils.substringBetween(command, MacroConstants.START_MACRO,
                    MacroConstants.END_MACRO);
        if (values != null) {
            parameters = values.split(",");
        }
        return parameters;
    }
}
