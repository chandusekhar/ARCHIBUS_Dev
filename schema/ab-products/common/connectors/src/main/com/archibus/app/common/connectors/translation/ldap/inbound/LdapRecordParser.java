package com.archibus.app.common.connectors.translation.ldap.inbound;

import javax.naming.*;
import javax.naming.directory.SearchResult;

import com.archibus.app.common.connectors.exception.StepException;
import com.archibus.app.common.connectors.transfer.exception.AdaptorException;
import com.archibus.app.common.connectors.translation.common.inbound.*;

/**
 * Parse SearchResults from a list of SearchResults.
 *
 * @author cole
 *
 */
public class LdapRecordParser implements
        IRecordParser<NamingEnumeration<SearchResult>, SearchResult> {
    /**
     * Call the given handler for each SearchResult in the message.
     *
     * @param message the search results.
     * @param handler the handler for the results.
     * @throws StepException if there is an error handling a search result.
     */
    @Override
    public void parse(final NamingEnumeration<SearchResult> message,
            final IRecordHandler<SearchResult, ?> handler) throws StepException {
        while (message != null && message.hasMoreElements()) {
            try {
                handler.handleRecord(message.next());
            } catch (final NamingException e) {
                throw new AdaptorException("Error receiving search results from Active Directory",
                    e);
            }
        }
    }
}
