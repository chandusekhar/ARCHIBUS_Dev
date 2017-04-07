package com.archibus.app.common.connectors.translation.common.outbound;

import java.util.Map;

import com.archibus.app.common.connectors.translation.exception.TranslationException;

/**
 * A RequestDef defines methods for creating a request to a foreign system.
 *
 * @author cole
 */
public interface IRequestDef {
    /**
     * Create a request to a foreign system using a request template and database parameters.
     *
     * @param requestTemplate the format of the request.
     * @param databaseParameters the content for the request, in database format.
     * @param <RequestType> the type of request to be created by the template.
     * @return a request for a foreign system based on this template and provided parameters.
     * @throws TranslationException if one or more of the fields cannot be converted in to a foreign
     *             value.
     */
    <RequestType> RequestType createRequest(final IRequestTemplate<RequestType> requestTemplate,
            final Map<String, Object> databaseParameters) throws TranslationException;
    
    /**
     * @param request the request to be considered.
     * @return the reason the request should be skipped, or null otherwise.
     */
    String shouldSkip(final Map<String, Object> request);
}
