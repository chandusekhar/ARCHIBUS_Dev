package com.archibus.app.sysadmin.updatewizard.script.service;

import java.io.*;
import java.nio.charset.Charset;
import java.util.concurrent.TimeUnit;

import org.apache.log4j.Logger;

import com.archibus.app.sysadmin.updatewizard.script.impl.ResponseMessage;
import com.archibus.app.sysadmin.updatewizard.script.parser.*;
import com.archibus.jobmanager.*;
import com.archibus.jobmanager.JobStatus.JobResult;
import com.archibus.utility.ExceptionBase;

/**
 *
 * Batch file job runner.
 * <p>
 *
 * @author Catalin Purice
 * @since 22.1
 *
 */
public class BatchFileJob extends JobBase {

    /**
     * UTF 8 char-set.
     */
    public static final String UTF_8 = "UTF-8";

    /**
     * Version information for run DUW script file.
     */
    public static final String VERSION_INFO =
            "ARCHIBUS Inc., DUW file Runner Version [22.1] - 04.15.2015";

    /**
     * Copyright message for run DUW script file.
     */
    public static final String COPYRIGHT =
            "(C) 1976-2015 ARCHIBUS, Inc. All rights reserved. Confidential Material.";

    /**
     * A textual log of events during connector execution.
     */
    private final Logger eventLog = Logger.getLogger(BatchFileJob.class);

    /**
     * File path.
     */
    private final InputStream inputStream;

    /**
     * Constructor.
     *
     * @param file the file to execute.
     * @throws IOException throws exception if the file is not found or no permission.
     */
    public BatchFileJob(final String file) throws IOException {
        super();
        this.inputStream = new ByteArrayInputStream(file.getBytes(Charset.forName(UTF_8)));
    }

    /**
     * Constructor.
     *
     * @param inputStream the input stream of the file to execute.
     * @throws IOException throws exception if the file is not found or no permission.
     */
    public BatchFileJob(final FileInputStream inputStream) throws IOException {
        super();
        this.inputStream = inputStream;
    }

    /**
     * Execute a DUW file.
     */
    @Override
    public void run() {
        this.status.setCode(JobStatus.JOB_STARTED);

        /**
         * Log beginning.
         */
        this.eventLog.info(VERSION_INFO);
        this.eventLog.info(COPYRIGHT);

        Throwable exception = null;
        String exceptionMessage = null;

        this.status.setCurrentNumber(0);

        try {

            final ElapsedTime mainElapsedTime = ElapsedTime.start();

            this.status
                .addPartialResult(new JobResult(String.valueOf(this.status.getCurrentNumber()),
                    new ResponseMessage("Start executing script...", ResponseMessage.Level.INFO)
                        .getFullMessage(),
                    ResponseMessage.Level.INFO.name()));

            this.status.incrementTotalNumber(1);
            this.status.incrementCurrentNumber();

            final DelimitedTextLineParser parser = new DelimitedTextLineParser(
                new ScriptFileCharSequenceSet(), Charset.forName(UTF_8));
            final CommandHandler cHandler = new CommandHandler(this.status);
            parser.parse(this.inputStream, cHandler);

            this.status.incrementTotalNumber(1);
            this.status.incrementCurrentNumber();

            this.status
                .addPartialResult(new JobResult(String.valueOf(this.status.getCurrentNumber()),
                    new ResponseMessage("Script executed in ", ResponseMessage.Level.INFO)
                        .getFullMessage() + mainElapsedTime.time(TimeUnit.SECONDS) + " seconds. "
                        + cHandler.generateStatisticMessage(),
                    ResponseMessage.Level.INFO.name()));

            this.status.setCode(JobStatus.JOB_COMPLETE);
            this.status.setMessage("Success");

        } catch (final ExceptionBase t) {
            exception = t;
            exceptionMessage = "Error: " + t.toStringForLogging();
        }
        if (exception != null) {
            /**
             * Log exceptions and consider the job a failure.
             */
            this.status.setCode(JobStatus.JOB_FAILED);
            this.status.setMessage(exceptionMessage);
            this.eventLog.error(exceptionMessage);
            throw new ExceptionBase(exceptionMessage, exception);
        }
    }
}
