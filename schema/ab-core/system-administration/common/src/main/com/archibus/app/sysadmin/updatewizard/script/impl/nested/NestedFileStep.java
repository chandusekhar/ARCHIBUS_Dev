package com.archibus.app.sysadmin.updatewizard.script.impl.nested;

import java.io.*;
import java.nio.charset.Charset;
import java.util.concurrent.TimeUnit;

import com.archibus.app.sysadmin.updatewizard.script.AbstractStep;
import com.archibus.app.sysadmin.updatewizard.script.exception.StepException;
import com.archibus.app.sysadmin.updatewizard.script.file.InboundFileSystem;
import com.archibus.app.sysadmin.updatewizard.script.impl.ResponseMessage;
import com.archibus.app.sysadmin.updatewizard.script.parser.*;
import com.archibus.app.sysadmin.updatewizard.script.service.ElapsedTime;
import com.archibus.jobmanager.*;
import com.archibus.jobmanager.JobStatus.JobResult;

/**
 *
 * Defines Nested file step.
 * <p>
 *
 * @author Catalin Purice
 * @since 22.1
 *
 */
public class NestedFileStep extends AbstractStep<ResponseMessage> {

    /**
     * File name.
     */
    private final String fileName;

    /**
     * Main job status.
     */
    private final JobStatus status;

    /**
     *
     * Constructor.
     *
     * @param name step name
     * @param fileName nested field name
     * @param jobStatus job status
     */
    public NestedFileStep(final String name, final String fileName, final JobStatus jobStatus) {
        super(name);
        this.fileName = fileName;
        this.status = jobStatus;
    }

    @Override
    public ResponseMessage execute() {

        ResponseMessage response = null;
        final ElapsedTime mainElapsedTime = ElapsedTime.start();
        FileInputStream inboundFileSystem = null;
        
        try {
            response =
                    new ResponseMessage("Start executing nested file " + this.fileName + "...",
                        ResponseMessage.Level.INFO);
            
            this.status.addPartialResult(new JobResult(String.valueOf(this.status
                .getCurrentNumber()), response.getFullMessage(), response.getType().name()));

            this.status.incrementTotalNumber(1);
            this.status.incrementCurrentNumber();

            inboundFileSystem =
                    (FileInputStream) new InboundFileSystem(this.fileName).getInputStream();

            final DelimitedTextLineParser parser =
                    new DelimitedTextLineParser(new ScriptFileCharSequenceSet(),
                        Charset.forName("UTF-8"));
            final CommandHandler cHandler = new CommandHandler(this.status);
            parser.parse(inboundFileSystem, cHandler);

            response =
                    new ResponseMessage("Nested file: " + this.fileName + " executed in "
                            + mainElapsedTime.time(TimeUnit.SECONDS) + " seconds.",
                        ResponseMessage.Level.INFO);

        } catch (final StepException e) {
            response = new ResponseMessage(e.getMessage(), ResponseMessage.Level.ERROR);
        } finally {
            if (inboundFileSystem != null) {
                try {
                    inboundFileSystem.close();
                } catch (final IOException e) {
                    response =
                            new ResponseMessage("Unable to close stream: " + this.fileName,
                                ResponseMessage.Level.ERROR);
                }
            }
        }

        this.status.incrementTotalNumber(1);
        this.status.incrementCurrentNumber();
        
        return response;
    }
}
