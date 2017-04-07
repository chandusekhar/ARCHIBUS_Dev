package com.archibus.app.common.connectors.transfer.ldap;

import java.util.*;

import javax.naming.*;
import javax.naming.directory.SearchResult;
import javax.naming.ldap.InitialLdapContext;

import com.archibus.app.common.connectors.transfer.AdaptorResponse;
import com.archibus.app.common.connectors.transfer.common.AbstractQueuedRequestAdaptor;
import com.archibus.app.common.connectors.transfer.exception.AdaptorException;
import com.archibus.app.common.connectors.transfer.ldap.AbstractLdapAdaptor.LdapRequestInstance;
import com.enterprisedt.util.debug.Logger;

/**
 * An adaptor for retrieving data from an LDAP server.
 *
 * @author cole
 *
 */
public abstract class AbstractLdapAdaptor extends AbstractQueuedRequestAdaptor<
// @formatter:off
        LdapRequest, LdapRequestInstance, NamingEnumeration<SearchResult>> {
    // @formatter:on

    /**
     * Parameters for creating an LDAP context.
     */
    protected final Map<LdapContextAttribute, ?> contextParams;

    /**
     * Whether to use STARTTLS.
     */
    protected final boolean useStartTls;

    /**
     * Whether to only support TLS.
     */
    protected final boolean useTlsOnly;

    /**
     * Contexts that may need to be closed.
     */
    private final Set<LdapContext> contexts;

    /**
     * An LDAP request coupled with a context for making it.
     *
     * @author cole
     *
     */
    protected static class LdapRequestInstance {
        /**
         * Request to be made.
         */
        private final LdapRequest request;

        /**
         * Adaptor's context in which to make the request.
         */
        private final InitialLdapContext context;

        /**
         * @param request request to be made.
         * @param context adaptor's context in which to make the request.
         */
        public LdapRequestInstance(final LdapRequest request, final InitialLdapContext context) {
            this.request = request;
            this.context = context;
        }

        /**
         * @return request request to be made.
         */
        public LdapRequest getRequest() {
            return this.request;
        }

        /**
         * @return context adaptor's context in which to make the request.
         */
        public InitialLdapContext getContext() {
            return this.context;
        }
    }
    
    /**
     * @param contextParams parameters for constructing an LDAP context.
     * @param useStartTls whether to use STARTTLS.
     * @param useTlsOnly whether to only support TLS.
     */
    public AbstractLdapAdaptor(final Map<LdapContextAttribute, ?> contextParams,
            final boolean useStartTls, final boolean useTlsOnly) {
        super();
        this.contextParams = contextParams;
        this.useStartTls = useStartTls;
        this.useTlsOnly = useTlsOnly;
        this.contexts = new HashSet<LdapContext>();
    }

    /**
     * @return LDAP Context.
     */
    protected abstract LdapContext createContext();

    @Override
    protected Collection<? extends LdapRequestInstance> getRequestInstances(
            final LdapRequest request, final String requestHandle) throws AdaptorException {
        /*
         * Need a context for each request.
         */
        final LdapContext context = createContext();
        this.contexts.add(context);
        /*
         * Not using singleton, as may need to add request instances later.
         */
        final Set<LdapRequestInstance> requests = new HashSet<LdapRequestInstance>();
        requests.add(new LdapRequestInstance(request, context));
        return requests;
    }

    /**
     * @param ldapRequestInstance a LDAP request and context for making it.
     * @param requestHandle the identifier for the request being made.
     * @return an adaptor response with a list of search results from LDAP.
     * @throws AdaptorException if a NamingException occurs when making the request.
     */
    @Override
    public AdaptorResponse<NamingEnumeration<SearchResult>> makeRequest(
            final LdapRequestInstance ldapRequestInstance, final String requestHandle)
            throws AdaptorException {
        AdaptorResponse<NamingEnumeration<SearchResult>> response;
        try {
            final LdapRequest ldapRequest = ldapRequestInstance.getRequest();
            response =
                    new AdaptorResponse<NamingEnumeration<SearchResult>>(ldapRequestInstance
                        .getContext().search(ldapRequest.getName(), ldapRequest.getFilter(),
                            ldapRequest.getSearchControls()));
        } catch (final NamingException e) {
            throw new AdaptorException("Error retrieving LDAP data: " + e.getLocalizedMessage(), e);
        }
        return response;
    }

    @Override
    public void close() throws AdaptorException {
        try {
            super.close();
        } finally {
            for (final LdapContext context : this.contexts) {
                try {
                    context.close();
                } catch (final NamingException e) {
                    Logger.getLogger(InboundLdapAdaptor.class).warn(
                        "Failed to close LDAP context.", e);
                }
            }
        }
    }
}
