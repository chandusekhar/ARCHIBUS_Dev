package com.archibus.app.sysadmin.updatewizard.script.parser;

import java.util.*;

import com.archibus.app.common.connectors.translation.common.inbound.IRecordHandler;
import com.archibus.app.sysadmin.updatewizard.script.IStep;
import com.archibus.app.sysadmin.updatewizard.script.impl.ResponseMessage;
import com.archibus.app.sysadmin.updatewizard.script.impl.dt.TransferStep;
import com.archibus.app.sysadmin.updatewizard.script.impl.sql.SqlCommandStep;
import com.archibus.app.sysadmin.updatewizard.script.service.*;
import com.archibus.jobmanager.*;
import com.archibus.jobmanager.JobStatus.JobResult;

/**
 *
 * Command handler.
 * <p>
 *
 *
 * @author Catalin Purice
 * @since 22.1
 *
 */
public class CommandHandler implements IRecordHandler<List<String>, Void> {
    
    /**
     * New line.
     */
    private static final String NEW_LINE = System.getProperty("line.separator");
    
    /**
     * Job status.
     */
    private final JobStatus status;
    
    /**
     * DUW command to be executed.
     */
    private final StringBuilder duwCommand;

    /**
     * Current line number.
     */
    private long currentLineNo;
    
    /**
     * SQL commands counter success.
     */
    private long countSqlCommandsSuccess;
    
    /**
     * Imported files counter success.
     */
    private long countImportedFileSuccess;

    /**
     * SQL commands counter failed.
     */
    private long countSqlCommandsFailed;
    
    /**
     * Imported files counter failed.
     */
    private long countImportedFileFailed;

    /**
     * Constructor.
     *
     * @param status job status
     */
    public CommandHandler(final JobStatus status) {
        super();
        this.status = status;
        this.duwCommand = new StringBuilder();
    }

    @Override
    public Void handleRecord(final List<String> lines) {

        if (this.status.isStopRequested()) {
            this.status.setCode(JobStatus.JOB_STOPPED);
        } else {
            this.currentLineNo++;
            if (!lines.get(0).trim().isEmpty()) {
                handleCommand(lines.get(0).trim());
            }
        }
        return null;
    }
    
    /**
     *
     * Handle Command.
     *
     * @param line read line from file
     */
    private void handleCommand(final String line) {
        
        final IStep<ResponseMessage> step =
                CommandRequestsType.getInstance(MacroType.getMacroType(line), this.status);
        
        /**
         * Handle multi-lines SQL command.
         */
        if (step instanceof com.archibus.app.sysadmin.updatewizard.script.impl.sql.SqlCommandStep) {
            
            this.duwCommand.append(line);

            if (isSqlCommandComplete()) {

                ((com.archibus.app.sysadmin.updatewizard.script.impl.sql.SqlCommandStep) step)
                .setCommand(this.duwCommand.toString());

                runCommand(step);
                
                this.duwCommand.setLength(0);
                
            } else {
                this.duwCommand.append(NEW_LINE);
            }
        } else {
            runCommand(step);
        }
    }
    
    /**
     *
     * Runs the command.
     *
     * @param step the step
     */
    private void runCommand(final IStep<ResponseMessage> step) {
        if (this.status.getCurrentNumber() == this.status.getTotalNumber()) {
            this.status.incrementTotalNumber(1);
        }
        
        final ResponseMessage resultMessage = step.execute();
        
        updateCounters(step, resultMessage);

        this.status.addPartialResult(new JobResult(String.valueOf(this.status.getCurrentNumber()),
            ResponseMessage.Level.ERROR == resultMessage.getType() ? resultMessage.getFullMessage()
                    + ". Error at Line: " + this.currentLineNo : resultMessage.getFullMessage(),
                    resultMessage.getType().name()));
        
        this.status.incrementCurrentNumber();
    }

    /**
     * Update the counters.
     *
     * @param step step type
     * @param response response message
     */
    private void updateCounters(final IStep<ResponseMessage> step, final ResponseMessage response) {
        if (step instanceof SqlCommandStep) {
            switch (response.getType()) {
                case INFO:
                    this.countSqlCommandsSuccess++;
                    break;
                case ERROR:
                case WARN:
                    this.countSqlCommandsFailed++;
                    break;
                default:
                    break;
            }
        } else if (step instanceof TransferStep) {
            switch (response.getType()) {
                case INFO:
                    this.countImportedFileSuccess++;
                    break;
                case ERROR:
                case WARN:
                    this.countImportedFileFailed++;
                    break;
                default:
                    break;
            }
        }
    }

    /**
     *
     * Used to handle multiple lines commands. This applies to SQL commands only.
     *
     * @return true if the command is complete
     */
    private boolean isSqlCommandComplete() {
        return ';' == this.duwCommand.toString().charAt(this.duwCommand.toString().length() - 1);
    }

    /**
     *
     * Generates a statistic message after the file execution completes.
     *
     * @return the message
     */
    public String generateStatisticMessage() {
        final List<String> messages = new ArrayList<String>();
        if (this.countImportedFileSuccess > 0) {
            messages
                .add(String.format(TextUtil.TRANSFER_IN_SUCCESS, this.countImportedFileSuccess));
        }
        if (this.countImportedFileFailed > 0) {
            messages.add(String.format(TextUtil.TRANSFER_IN_ERROR, this.countImportedFileFailed));
        }
        if (this.countSqlCommandsSuccess > 0) {
            messages.add(String.format(TextUtil.SQL_SUCCESS, this.countSqlCommandsSuccess));
        }
        if (this.countSqlCommandsFailed > 0) {
            messages.add(String.format(TextUtil.SQL_ERROR, this.countSqlCommandsFailed));
        }
        return TextUtil.join(messages, ", ");
    }
    
}
