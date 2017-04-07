package com.archibus.app.sysadmin.updatewizard.script.impl.dt;


/**
 *
 *
 * Interface to be implemented by classes TransferIn and TransferOut.
 * <p>
 *
 * @author Catalin Purice
 * @since 22.1
 *
 *
 * @param <ResponseType> message response type
 */
public interface IDataTransfer<ResponseType> {
    
    /**
     * Transfer action.
     */
    void transfer();
    
    /**
     * Results of a transfer action.
     *
     * @return result message
     */
    ResponseType getResultMessage();
    
}
