package com.archibus.app.sysadmin.updatewizard.script.impl.dt;


/**
 *
 * Common business logic for Dta Transfer Step.
 * <p>
 *
 * @author Catalin Purice
 * @since 22.1
 *
 * @param <TransferType>
 */
public abstract class AbstractDataTransfer<TransferType> {
    
    /**
     * data transfer in manager.
     */
    private final TransferType dtManager;

    /**
     * Constructor.
     *
     * @param dtManager data transfer manager
     */
    public AbstractDataTransfer(final TransferType dtManager) {
        super();
        this.dtManager = dtManager;
    }
    
    /**
     * Getter for the dtManager property.
     *
     * @see dtManager
     * @return the dtManager property.
     */
    protected TransferType getDtManager() {
        return this.dtManager;
    }
}
