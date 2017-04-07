package com.archibus.app.common.connectors.translation.common.outbound;

import java.util.Map;

import com.archibus.app.common.connectors.translation.exception.TranslationException;

/**
 * A request template that requires data be sent before and after a sequence of requests.
 *
 * @author cole
 *
 * @param <RequestType>
 */
public interface IWrappedRequestTemplate<RequestType> extends IRequestTemplate<RequestType> {
    /**
     * Get data to be sent before the sequence requests.
     *
     * @param templateParameters the parameters for this template.
     * @return the request to send.
     * @throws TranslationException if the request cannot be created with the given parameters.
     */
    RequestType generateStart(final Map<String, Object> templateParameters) throws TranslationException;

    /**
     * Get data to be sent after the sequence requests.
     *
     * @param templateParameters the parameters for this template.
     * @return the request to send.
     * @throws TranslationException if the request cannot be created with the given parameters.
     */
    RequestType generateEnd(final Map<String, Object> templateParameters) throws TranslationException;
}
