package com.archibus.app.sysadmin.updatewizard.script.service;

import java.util.*;
import java.util.Map.Entry;

import com.archibus.app.sysadmin.updatewizard.script.IStep;
import com.archibus.app.sysadmin.updatewizard.script.impl.ResponseMessage;
import com.archibus.jobmanager.JobStatus;

/**
 *
 * Defines type of requests supported by DUW files.
 * <p>
 *
 * @author Catalin Purice
 * @since 22.1
 *
 *        Justification for suppressing PMD.CyclomaticComplexity: Handle different types of
 *        commands.
 */
@SuppressWarnings("PMD.CyclomaticComplexity")
public enum CommandRequestsType {
    
    /**
     * SQL command.
     */
    SQL_COMMAND(InputType.SQL, CommandType.EXECUTE_SQL_COMMAND, EnumSet.of(MacroType.SQL_COMMAND)),

    /**
     * A Export Data Transfer command.
     */
    DATA_TRANSFER_IMPORT(InputType.FILE, CommandType.DATA_TRANSFER, EnumSet
        .of(MacroType.DATA_TRANSFER_IMPORT)),
    
    /**
     * A Export Data Transfer command.
     */
    DATA_TRANSFER_EXPORT(InputType.FILE, CommandType.DATA_TRANSFER, EnumSet
        .of(MacroType.DATA_TRANSFER_EXPORT)),
    /**
     * A Update Schema Alter command.
     */
    UPDATE_SCHEMA_ALTER(InputType.METHOD_CALL, CommandType.UPDATE_SCHEMA, EnumSet
        .of(MacroType.SCHEMA_UPDATE_ALTER)),
    
    /**
     * A Update Schema Re-create table command.
     */
    UPDATE_SCHEMA_RE_CREATE(InputType.METHOD_CALL, CommandType.UPDATE_SCHEMA, EnumSet
        .of(MacroType.SCHEMA_UPDATE_RECREATE)),
    /**
     * A Update Schema Re-create table command.
     */
    REFRESH_DATA_DICTIONARY(InputType.METHOD_CALL, CommandType.REFRESH_DATA_DICTIONARY, EnumSet
        .of(MacroType.REFRESH_DATA_DICTIONARY)),
    /**
     * Reloads workflow rules.
     */
    
    RELOAD_WORKFLOW_RULES(InputType.METHOD_CALL, CommandType.RELOAD_WORKFLOW_RULES, EnumSet
        .of(MacroType.RELOAD_WORKFLOW_RULES)),
    /**
     * Run SQL File.
     */
    RUN_SQL_FILE(InputType.METHOD_CALL, CommandType.EXECUTE_SQL_FILE, EnumSet
        .of(MacroType.NESTED_FILE)),
    
    /**
     * Run DUW File.
     */
    NESTED_FILE(InputType.FILE, CommandType.NESTED_FILE, EnumSet.of(MacroType.NESTED_FILE)),
    /**
     * A comment.
     */
    COMMENT(InputType.IGNORE, CommandType.COMMENT, EnumSet.of(MacroType.COMMENT_1,
        MacroType.COMMENT_2, MacroType.COMMENT_3)),
    /**
     * A placeholder indicating that the type is unsupported.
     */
    UNSUPPORTED(null, null, EnumSet.noneOf(MacroType.class));

    /**
     * The configured types that correspond to this type of request.
     */
    private final EnumSet<MacroType> configuredTypes;

    /**
     * Command type.
     */
    private CommandType commandType;

    /**
     * @param inputType type of the input. File, SQL command...
     * @param commandType the type of system data is exchanged with.
     * @param macroTypes type of supported macros
     */
    private CommandRequestsType(final InputType inputType, final CommandType commandType,
            final EnumSet<MacroType> macroTypes) {
        this.commandType = commandType;
        this.configuredTypes = macroTypes;
    }

    /**
     * @return the configured types that correspond to this type of request.
     */
    private EnumSet<MacroType> getConfiguredTypes() {
        return this.configuredTypes;
    }

    /**
     * @param macroType the configured type.
     * @return the type of requests supporting the configured type or UNSUPPORTED if there is none.
     */
    public static CommandRequestsType valueOf(final MacroType macroType) {
        CommandRequestsType type = UNSUPPORTED;
        for (final CommandRequestsType currType : values()) {
            if (currType.getConfiguredTypes().contains(macroType)) {
                type = currType;
                break;
            }
        }
        return type;
    }

    /**
     *
     * Get Command instance.
     *
     * @param macroParameters macro type parameters command parameters
     * @param status status
     * @return IStep step
     */
    public static IStep<ResponseMessage> getInstance(
            final Map<MacroType, String[]> macroParameters, final JobStatus status) {
        final Iterator<Entry<MacroType, String[]>> iter = macroParameters.entrySet().iterator();
        final Entry<MacroType, String[]> entry = iter.next();
        final MacroType macroType = entry.getKey();
        final Object[] parameters = entry.getValue();
        IStep<ResponseMessage> step;
        switch (macroType) {
            case COMMENT_1:
            case COMMENT_2:
            case COMMENT_3:
            case COMMENT_4:
                parameters[0] = parameters[0].toString().replaceFirst(macroType.getStartWith(), "");
                step = StepBuilder.buildStep(CommandRequestsType.COMMENT, parameters);
                break;
            case DATA_TRANSFER_EXPORT:
                step = StepBuilder.buildStep(CommandRequestsType.DATA_TRANSFER_EXPORT, parameters);
                break;
            case DATA_TRANSFER_IMPORT:
                step = StepBuilder.buildStep(CommandRequestsType.DATA_TRANSFER_IMPORT, parameters);
                break;
            case REFRESH_DATA_DICTIONARY:
                step =
                StepBuilder.buildStep(CommandRequestsType.REFRESH_DATA_DICTIONARY,
                    parameters);
                break;
            case RELOAD_WORKFLOW_RULES:
                step = StepBuilder.buildStep(CommandRequestsType.RELOAD_WORKFLOW_RULES, parameters);
                break;
            case SCHEMA_UPDATE_ALTER:
                step = StepBuilder.buildStep(CommandRequestsType.UPDATE_SCHEMA_ALTER, parameters);
                break;
            case SCHEMA_UPDATE_RECREATE:
                step =
                StepBuilder.buildStep(CommandRequestsType.UPDATE_SCHEMA_RE_CREATE,
                    parameters);
                break;
            case SQL_COMMAND:
                step = StepBuilder.buildStep(CommandRequestsType.SQL_COMMAND, parameters);
                break;
            case NESTED_FILE:
                step =
                StepBuilder.buildNestedFileStep(CommandRequestsType.NESTED_FILE,
                    parameters, status);
                break;
            default:
                step = StepBuilder.buildStep(CommandRequestsType.UNSUPPORTED, parameters);
        }
        return step;
        }

    /**
     * Getter for the commandType property.
     *
     * @see commandType
     * @return the commandType property.
     */
    public CommandType getCommandType() {
        return this.commandType;
    }

}
