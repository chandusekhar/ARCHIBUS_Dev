package com.archibus.app.common.connectors.transfer.ldap;

import java.io.IOException;
import java.util.*;

import javax.naming.*;
import javax.naming.directory.SearchResult;
import javax.naming.ldap.*;

import com.archibus.app.common.connectors.transfer.AdaptorResponse;
import com.archibus.app.common.connectors.transfer.exception.AdaptorException;

/**
 * An adaptor for retrieving data from an LDAP server in bursts.
 *
 * @author cole
 *
 */
public class InboundPagingLdapAdaptor extends AbstractLdapAdaptor {
    
    /**
     * How requests should be returned.
     */
    private final Control[] controls;
    
    /**
     * The number of transactions to be retrieved at a time.
     */
    private final Integer pageSize;

    /**
     * Contains the last cookie for a request handle.
     */
    private final Map<String, byte[]> cookies;
    
    /*
     * Active Directory
     */
    /**
     * @param userContextParams parameters for constructing an LDAP context.
     * @param useStartTls whether to use STARTTLS.
     * @param useTlsOnly whether to only support TLS.
     * @param requestControls how requests should be returned.
     * @param pageSize the number of transactions to be retrieved at a time.
     */
    public InboundPagingLdapAdaptor(final Map<LdapContextAttribute, ?> userContextParams,
            final boolean useStartTls, final boolean useTlsOnly, final Control[] requestControls,
            final int pageSize) {
        super(userContextParams, useStartTls, useTlsOnly);
        if (requestControls == null) {
            this.controls = new Control[0];
        } else {
            this.controls = new Control[requestControls.length];
            System.arraycopy(requestControls, 0, this.controls, 0, this.controls.length);
        }
        this.pageSize = pageSize;
        this.cookies = new HashMap<String, byte[]>();
    }

    @Override
    public AdaptorResponse<NamingEnumeration<SearchResult>> makeRequest(
            final LdapRequestInstance ldapRequestInstance, final String requestHandle)
            throws AdaptorException {
        AdaptorResponse<NamingEnumeration<SearchResult>> response = null;
        if (this.pageSize == null) {
            /*
             * We are not paging.
             */
            response = makeRequestInternal(ldapRequestInstance, requestHandle);
        } else if (this.cookies.containsKey(requestHandle)) {
            /*
             * We are paging and this is not the first.
             */
            updateCookie(ldapRequestInstance.getContext(), requestHandle);
            if (this.cookies.containsKey(requestHandle) && this.cookies.get(requestHandle) != null) {
                response = makeRequestInternal(ldapRequestInstance, requestHandle);
            } else {
                this.cookies.remove(requestHandle);
            }
        } else {
            /*
             * We are paging and this is the first.
             */
            this.cookies.put(requestHandle, null);
            response = makeRequestInternal(ldapRequestInstance, requestHandle);
        }
        return response;
    }

    /**
     * @param ldapRequestInstance the request to repeat.
     * @param requestHandle the handle for the request to repeat.
     * @return the response from making that request.
     * @throws AdaptorException if the request cannot be made.
     */
    private AdaptorResponse<NamingEnumeration<SearchResult>> makeRequestInternal(
            final LdapRequestInstance ldapRequestInstance, final String requestHandle)
            throws AdaptorException {
        super.requests.get(requestHandle).add(ldapRequestInstance);
        return super.makeRequest(ldapRequestInstance, requestHandle);
    }
    
    /**
     * Updates the cookie in cookies for this request, indicating whether there are more results.
     *
     * @param context LDAP context.
     * @param requestHandle to update the cookie for.
     * @throws AdaptorException if the cookie cannot be updated.
     */
    private void updateCookie(final InitialLdapContext context, final String requestHandle)
            throws AdaptorException {
        Control[] responseControls = null;
        try {
            responseControls = context.getResponseControls();
        } catch (final NamingException e) {
            throw new AdaptorException("Unable to acquire response controls from LDAP", e);
        }
        byte[] cookie = this.cookies.get(requestHandle);
        if (responseControls != null) {
            for (final Control control : responseControls) {
                if (control instanceof PagedResultsResponseControl) {
                    final PagedResultsResponseControl prrc = (PagedResultsResponseControl) control;
                    cookie = prrc.getCookie();
                    this.cookies.put(requestHandle, cookie);
                }
            }
        }
        // Re-activate paged results
        try {
            context.setRequestControls(new Control[] { new PagedResultsControl(this.pageSize,
                cookie, Control.CRITICAL) });
        } catch (final NamingException e) {
            throw new AdaptorException("Unable to set request controls for LDAP", e);
        } catch (final IOException e) {
            throw new AdaptorException("Unable to communicate request controls to LDAP", e);
        }
    }

    @Override
    protected LdapContext createContext() {
        LdapContext context;
        try {
            context =
                    new LdapContext(this.contextParams, this.controls, this.useStartTls,
                        this.useTlsOnly);
            context.setRequestControls(new Control[] { new PagedResultsControl(this.pageSize,
                Control.CRITICAL) });
        } catch (final NamingException e) {
            throw new AdaptorException("Error intializing LDAP context.\n"
                    + e.getLocalizedMessage(), e);
        } catch (final IOException e) {
            throw new AdaptorException("Error configuring paging.\n" + e.getLocalizedMessage(), e);
        }
        return context;
    }
    
    @Override
    public void stopRecieving(final String requestHandle) {
        super.stopRecieving(requestHandle);
        this.cookies.remove(requestHandle);
    }

    @Override
    public void close() throws AdaptorException {
        super.close();
        this.cookies.clear();
    }
}
