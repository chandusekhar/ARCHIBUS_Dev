package com.archibus.app.common.connectors.impl.archibus.outbound;

import java.util.Map;

import com.archibus.app.common.connectors.logging.IUserLog;
import com.archibus.app.common.connectors.translation.common.outbound.*;
import com.archibus.app.common.connectors.translation.exception.TranslationException;

/**
 * A request definition that logs when a record is skipped.
 *
 * @author cole
 *
 */
public class OutboundRequestDefProxy implements IRequestDef {
    /**
     * The request definition being proxied.
     */
    private final IRequestDef originalRecordDef;
    
    /**
     * The log to log to when a record is to be skipped.
     */
    private final IUserLog log;
    
    /**
     * @param originalRecordDef the record definition being proxied.
     * @param log the log to log to when a record is to be skipped.
     */
    public OutboundRequestDefProxy(final IRequestDef originalRecordDef, final IUserLog log) {
        this.originalRecordDef = originalRecordDef;
        this.log = log;
    }
    
    /**
     * Create a request to a foreign system using a request template and database parameters using
     * the originalRecordDef.
     *
     * @param requestTemplate the format of the request.
     * @param databaseParameters the content for the request, in database format.
     * @param <RequestType> the type of request to be created by the template.
     * @return a request for a foreign system based on this template and provided parameters.
     * @throws TranslationException if one or more of the fields cannot be converted in to a foreign
     *             value.
     */
    public <RequestType> RequestType createRequest(
            final IRequestTemplate<RequestType> requestTemplate,
            final Map<String, Object> databaseParameters) throws TranslationException {
        return this.originalRecordDef.createRequest(requestTemplate, databaseParameters);
    }
    
    /**
     * @param request the request to be considered.
     * @return the reason the request should be skipped or null otherwise.
     */
    public String shouldSkip(final Map<String, Object> request) {
        final String reason = this.originalRecordDef.shouldSkip(request);
        if (reason != null) {
            this.log.writeMessage("Skipping request: " + reason);
        }
        return reason;
    }
}
