package com.archibus.app.common.connectors.translation.common.inbound;

import com.archibus.app.common.connectors.exception.StepException;

/**
 * A parser that provides parsed elements to a handler as they become available.
 *
 * @author cole
 *
 * @param <MessageType> message type from foreign system.
 * @param <ParsedType> type of elements after parsing.
 */
public interface IRecordParser<MessageType, ParsedType> {
    /**
     * Provides parsed objects to a handler as they are parsed.
     *
     * @param message the message to be parsed.
     * @param handler the utility for handling parsed objects.
     * @throws StepException which will be an AdaptorException if an error occurs reading the
     *             message or a TranslationException if an error occurs parsing the data read.
     */
    void parse(final MessageType message, final IRecordHandler<ParsedType, ?> handler)
            throws StepException;
}
