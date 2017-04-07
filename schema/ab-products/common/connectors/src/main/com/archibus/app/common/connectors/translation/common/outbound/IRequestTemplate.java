package com.archibus.app.common.connectors.translation.common.outbound;

import java.util.Map;

import com.archibus.app.common.connectors.translation.exception.TranslationException;

/**
 * An IRequestTemplate defines the format of a request to a foreign system.
 *
 * @author cole
 *
 * @param <RequestType> the type of request produced by this template.
 */
public interface IRequestTemplate<RequestType> {
    /**
     * @param templateParameters parameters to use when generating requests.
     * @return request parameters for individual requests defined by this template.
     * @throws TranslationException if there is an error generating request parameters from template
     *             parameters.
     */
    Iterable<? extends Map<String, Object>> generateRequestParameters(
            final Map<String, Object> templateParameters) throws TranslationException;

    /**
     * @param requestParameters parameters for a specific request defined by this template.
     * @return request defined by this template.
     * @throws TranslationException if there is an error constructing the request from parameters.
     */
    RequestType generateRequest(final Map<String, Object> requestParameters) throws TranslationException;
}
