package com.archibus.app.sysadmin.updatewizard.script.impl.comment;

import com.archibus.app.sysadmin.updatewizard.script.AbstractStep;
import com.archibus.app.sysadmin.updatewizard.script.impl.ResponseMessage;

/**
 *
 * Comment Step.
 * <p>
 *
 * @author Catalin Purice
 * @since 22.1
 *
 */
public class CommentStep extends AbstractStep<ResponseMessage> {
    
    /**
     * command to be ignored.
     */
    private final String command;
    
    /**
     *
     * Constructor.
     *
     * @param name step name
     * @param line line to be ignored
     */
    public CommentStep(final String name, final String line) {
        super(name);
        this.command = line;
    }
    
    @Override
    public ResponseMessage execute() {
        return new ResponseMessage("Skip comment: " + this.command, ResponseMessage.Level.INFO);
    }
}
