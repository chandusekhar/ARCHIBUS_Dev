package com.archibus.app.sysadmin.updatewizard.script.impl.sql;

import java.util.Arrays;

import com.archibus.app.sysadmin.updatewizard.schema.output.JDBCUtil;
import com.archibus.app.sysadmin.updatewizard.script.AbstractStep;
import com.archibus.app.sysadmin.updatewizard.script.impl.ResponseMessage;
import com.archibus.context.ContextStore;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.utility.ExceptionBase;

/**
 * Executes a SQL command.
 * <p>
 *
 * @author Catalin Purice
 * @since 22.1
 *
 */
public class SqlCommandStep extends AbstractStep<ResponseMessage> {
    
    /**
     * Defines SQL commands types.
     */
    private enum Type {

        /**
         * select command type.
         */
        SELECT,
        /**
         * insert command type.
         */
        INSERT,
        
        /**
         * update command type.
         */
        UPDATE,
        
        /**
         * delete command type.
         */
        DELETE,
        
        /**
         * other command type. Can be any DDL command.
         */
        OTHER
    }
    
    /**
     * SQL Command.
     */
    private String command;

    /**
     * @see Type
     */
    private final Type type;

    /**
     *
     * Command.
     *
     * @param name name
     * @param command command
     */
    public SqlCommandStep(final String name, final String command) {
        super(name);
        this.command = command.trim();
        this.type = getCommandType();
    }

    /**
     *
     * Get SQL command type.
     *
     * @return {@link Type}
     */
    private Type getCommandType() {
        Type commandType = Type.OTHER;
        if (this.command.toUpperCase().startsWith(Type.SELECT.name())) {
            commandType = Type.SELECT;
        } else if (this.command.toUpperCase().startsWith(Type.INSERT.name())) {
            commandType = Type.INSERT;
        } else if (this.command.toUpperCase().startsWith(Type.UPDATE.name())) {
            commandType = Type.UPDATE;
        } else if (this.command.toUpperCase().startsWith(Type.DELETE.name())) {
            commandType = Type.DELETE;
        }
        return commandType;
    }
    
    /**
     *
     * Format Sql Command to run it on the server.
     *
     * @return the new SQL command
     */
    private String formatSqlCommand() {
        String sqlCommand = this.command.trim();
        if (";".equals(sqlCommand.substring(sqlCommand.length() - 1))) {
            sqlCommand = sqlCommand.substring(0, sqlCommand.length() - 1);
        }
        return sqlCommand;
    }
    
    @Override
    public ResponseMessage execute() {
        ResponseMessage.Level responseType = ResponseMessage.Level.INFO;
        int affectedRows = 0;
        final String sqlCommand = formatSqlCommand();
        String resultMessage = responseMessageTemplate();
        try {
            switch (this.type) {
                case SELECT:
                    JDBCUtil.executeQuery(sqlCommand, Arrays.asList());
                    break;
                case INSERT:
                case UPDATE:
                case DELETE:
                    affectedRows = JDBCUtil.executeUpdate(sqlCommand, Arrays.asList());
                    break;
                default:
                    EventHandlerBase.executeDbSqlNoParameters(ContextStore.get()
                        .getEventHandlerContext(), sqlCommand, false);
                    break;
            
            }
        } catch (final ExceptionBase sqlException) {
            resultMessage = sqlException.getMessage();
            if (sqlException.getNested() != null) {
                resultMessage = sqlException.getNested().getCause().getMessage();
            } else if (sqlException.getCause() != null) {
                resultMessage = sqlException.getCause().getMessage();
            }
            responseType = ResponseMessage.Level.ERROR;
        }
        return new ResponseMessage(String.format(resultMessage, affectedRows), responseType);
    }
    
    /**
     *
     * Generates response message template.
     *
     * @return message template
     */
    private String responseMessageTemplate() {
        String resultMessage = null;
        switch (this.type) {
            case INSERT:
                resultMessage = "%d row(s) inserted.";
                break;
            case UPDATE:
                resultMessage = "%d row(s) updated.";
                break;
            case DELETE:
                resultMessage = "%d row(s) deleted.";
                break;
            default:
                resultMessage = "SQL command executed successfully.";
                break;
        }
        return resultMessage;
    }
    
    /**
     * Setter for the command property.
     *
     * @see command
     * @param command the command to set
     */

    public void setCommand(final String command) {
        this.command = command;
    }
}
