package com.archibus.app.common.connectors.transfer.ldap;

import java.io.IOException;
import java.util.*;
import java.util.Map.Entry;

import javax.naming.NamingException;
import javax.naming.ldap.*;

import com.archibus.app.common.connectors.transfer.common.security.TLSSocketFactoryImpl;
import com.archibus.app.common.connectors.transfer.exception.AdaptorException;
import com.enterprisedt.util.debug.Logger;

/**
 * An InitialLdapContext that manages it's own STARTTLS context.
 *
 * @author cole
 * @since 20.1
 *
 */
public class LdapContext extends InitialLdapContext {
    
    /**
     * STARTTLS context.
     */
    private StartTlsResponse tls;
    
    /*
     * JUSTIFICATION: LDAP requires a Hashtable.
     */
    /**
     * @see InitialLdapContext
     * @param contextParams environment used to create the initial DirContext. Null indicates an
     *            empty environment.
     * @param controls connection request controls for the initial context. If null, no connection
     *            request controls are used.
     * @param useStartTls whether to use STARTTLS.
     * @param useTlsOnly whether to only support TLS.
     * @throws NamingException if a naming exception is encountered.
     */
    @SuppressWarnings("PMD.ReplaceHashtableWithMap")
    public LdapContext(final Map<LdapContextAttribute, ?> contextParams, final Control[] controls,
            final boolean useStartTls, final boolean useTlsOnly) throws NamingException {
        super(convertEnv(contextParams, useStartTls, useTlsOnly), controls);
        if (useStartTls) {
            this.startTls(useTlsOnly);
        }
    }
    
    /*
     * JUSTIFICATION: LDAP requires a Hashtable.
     */
    /**
     * @param userContextParams enumerated context.
     * @param useStartTls whether to use STARTTLS.
     * @param useTlsOnly whether to only support TLS.
     * @return equivalent LDAP hashtable.
     */
    @SuppressWarnings("PMD.ReplaceHashtableWithMap")
    private static Hashtable<?, ?> convertEnv(final Map<LdapContextAttribute, ?> userContextParams,
            final boolean useStartTls, final boolean useTlsOnly) {
        final Hashtable<String, Object> contextParams = new Hashtable<String, Object>();
        for (final Entry<LdapContextAttribute, ?> param : userContextParams.entrySet()) {
            contextParams.put(param.getKey().getParameterKey(), param.getValue());
        }
        if (!useStartTls && useTlsOnly) {
            contextParams.put("java.naming.ldap.factory.socket",
                TLSSocketFactoryImpl.class.getName());
        }
        return contextParams;
    }
    
    /**
     * Initialize the TLS context.
     *
     * @param tlsOnly whether to only support TLS (as opposed to SSL).
     * @throws AdaptorException if an error occurs establishing the TLS context.
     */
    private void startTls(final boolean tlsOnly) throws AdaptorException {
        try {
            this.tls = (StartTlsResponse) this.extendedOperation(new StartTlsRequest());
            if (tlsOnly) {
                this.tls.negotiate(new TLSSocketFactoryImpl());
            } else {
                this.tls.negotiate();
            }
        } catch (final IOException e) {
            throw new AdaptorException("Failed to negotiate TLS context.\n"
                    + e.getLocalizedMessage(), e);
        } catch (final NamingException e) {
            throw new AdaptorException("Failed to initialize StartTls extension.\n"
                    + e.getLocalizedMessage(), e);
        }
    }

    @Override
    public void close() throws NamingException {
        try {
            if (this.tls != null) {
                this.tls.close();
            }
        } catch (final IOException e) {
            Logger.getLogger(LdapContext.class).warn("Error closing TLS context", e);
        } finally {
            super.close();
        }
    }
}
