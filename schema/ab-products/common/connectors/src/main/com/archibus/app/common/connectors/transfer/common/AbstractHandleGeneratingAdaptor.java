package com.archibus.app.common.connectors.transfer.common;

import java.util.*;

import com.archibus.app.common.connectors.transfer.*;
import com.archibus.app.common.connectors.transfer.exception.AdaptorException;

/**
 * An adaptor that generate's request handles.
 * 
 * @author cole
 * 
 * @param <RequestType>
 * @param <RequestInstancesType>
 * @param <ResponseMessageType>
 */
public abstract class AbstractHandleGeneratingAdaptor<RequestType, RequestInstancesType, ResponseMessageType>
        implements IAdaptor<RequestType, ResponseMessageType> {
    /**
     * A cache of requests made to this adaptor in terms of the request instances that are still to
     * be processed.
     */
    protected final Map<String, RequestInstancesType> requests;
    
    /**
     * Used to incrementally generate request handles.
     */
    private int lastHandle;
    
    /**
     * Create an adaptor that generate's request handles.
     */
    protected AbstractHandleGeneratingAdaptor() {
        this.lastHandle = 0;
        this.requests = new HashMap<String, RequestInstancesType>();
    }
    
    /**
     * @return the next generated handle.
     * @return
     */
    protected String getNextHandle() {
        return String.valueOf(this.lastHandle++);
    }
    
    /**
     * @param requestHandle a handle to an outstanding request
     * @return whether there are more request instances for the given request
     */
    public boolean expectsResponses(final String requestHandle) {
        /*
         * Check to see if there are request instances in queue.
         */
        synchronized (this.requests) {
            return this.requests.containsKey(requestHandle);
        }
    }
    
    /**
     * Eliminates one outstanding request, so that the next call to expectsResponses or receive will
     * return false or null respectively.
     * 
     * @param requestHandle the request to abort.
     */
    public void stopRecieving(final String requestHandle) {
        /*
         * Clearing requests means that any new attempts to retrieve request instances will return
         * that there are no more.
         */
        synchronized (this.requests) {
            if (this.requests.containsKey(requestHandle)) {
                this.requests.remove(requestHandle);
            }
        }
    }
    
    /**
     * Eliminates all outstanding requests, so that the next call to expectsResponses or receive
     * will return false or null respectively.
     * 
     * @throws AdaptorException if this adaptor's resources cannot be freed.
     */
    public void close() throws AdaptorException {
        /*
         * Clearing requests means that any new attempts to retrieve request instances will return
         * that there are no more.
         */
        synchronized (this.requests) {
            this.requests.clear();
        }
    }
}
