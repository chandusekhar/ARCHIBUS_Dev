package com.archibus.app.sysadmin.updatewizard.script.impl;

import com.archibus.app.sysadmin.updatewizard.script.AbstractStep;
import com.archibus.utility.ExceptionBase;

/**
 *
 * Unsupported step.
 * <p>
 *
 *
 * @author Catalin Purice
 * @since 22.1
 *
 */
public class Unsupported extends AbstractStep<ResponseMessage> {
    
    /**
     *
     * Constructor.
     *
     * @param name name of the step
     */
    public Unsupported(final String name) {
        super(name);
    }
    
    @Override
    public ResponseMessage execute() throws ExceptionBase {
        return new ResponseMessage("Unsupported command.", ResponseMessage.Level.INFO);
    }
    
}
