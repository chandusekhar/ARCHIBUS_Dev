package com.archibus.app.common.connectors.transfer.ldap;

import java.util.Map;

import javax.naming.NamingException;

import com.archibus.app.common.connectors.transfer.exception.AdaptorException;

/**
 * An adaptor for retrieving data from an LDAP server in a single request.
 *
 * @author cole
 *
 */
public class InboundLdapAdaptor extends AbstractLdapAdaptor {
    
    /*
     * LDAP
     */
    /**
     * @param userContextParams parameters for constructing an LDAP context.
     * @param useStartTls whether to use STARTTLS.
     * @param useTlsOnly whether to only support TLS.
     */
    public InboundLdapAdaptor(final Map<LdapContextAttribute, ?> userContextParams,
            final boolean useStartTls, final boolean useTlsOnly) {
        super(userContextParams, useStartTls, useTlsOnly);
    }
    
    /**
     * @return LDAP Context.
     */
    @Override
    protected LdapContext createContext() {
        LdapContext context;
        try {
            context = new LdapContext(this.contextParams, null, this.useStartTls, this.useTlsOnly);
        } catch (final NamingException e) {
            throw new AdaptorException("Error creating directory context: "
                    + e.getLocalizedMessage(), e);
        }
        return context;
    }
}
