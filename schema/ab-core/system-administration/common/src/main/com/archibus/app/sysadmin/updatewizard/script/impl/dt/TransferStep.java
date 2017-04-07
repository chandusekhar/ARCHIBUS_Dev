package com.archibus.app.sysadmin.updatewizard.script.impl.dt;

import com.archibus.app.sysadmin.updatewizard.script.AbstractStep;
import com.archibus.app.sysadmin.updatewizard.script.impl.ResponseMessage;
import com.archibus.utility.ExceptionBase;

/**
 *
 * Data Transfer step object.
 * <p>
 *
 * @author Catalin Purice
 * @since 22.1
 *
 */
public class TransferStep extends AbstractStep<ResponseMessage> {
    /**
     * Data Transfer object.
     */
    private final IDataTransfer<ResponseMessage> transferObject;

    /**
     *
     * Constructor.
     *
     * @param name name of the step
     * @param transferType transfer type
     */
    public TransferStep(final String name, final IDataTransfer<ResponseMessage> transferType) {
        super(name);
        this.transferObject = transferType;
    }
    
    @Override
    public ResponseMessage execute() throws ExceptionBase {
        this.transferObject.transfer();
        return this.transferObject.getResultMessage();
    }
}
