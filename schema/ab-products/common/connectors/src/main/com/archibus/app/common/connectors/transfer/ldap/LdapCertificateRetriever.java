package com.archibus.app.common.connectors.transfer.ldap;

import java.io.IOException;
import java.util.Hashtable;

import javax.naming.*;
import javax.naming.ldap.*;
import javax.net.ssl.*;

import com.archibus.app.common.connectors.transfer.common.security.*;
import com.enterprisedt.util.debug.Logger;

/**
 * A method for retrieving an LDAP certificate.
 *
 * @author cole
 * @since 22.1
 *
 */
public class LdapCertificateRetriever implements ICertificateRetriever {
    
    /**
     * LDAP Socket timeout.
     */
    private static final int SO_TIMEOUT = 5000;
    
    /**
     * LDAP host name to retrieve the certificate from.
     */
    private final String host;
    
    /**
     * LDAP port to retrieve the certificatee from.
     */
    private final int port;
    
    /**
     * @param host LDAP host name to retrieve the certificate from.
     * @param port LDAP port to retrieve the certificate from.
     */
    public LdapCertificateRetriever(final String host, final int port) {
        this.host = host;
        this.port = port;
    }
    
    @Override
    public void retrieveCertificate(final SSLContext context)
            throws com.archibus.app.common.connectors.exception.ConfigurationException {
        /*
         * JUSTIFICATION: LDAP requires a Hashtable.
         */
        @SuppressWarnings("PMD.ReplaceHashtableWithMap")
        final Hashtable<String, String> env = new Hashtable<String, String>();
        env.put(Context.INITIAL_CONTEXT_FACTORY, "com.sun.jndi.ldap.LdapCtxFactory");
        env.put("com.sun.jndi.ldap.connect.timeout", Integer.toString(SO_TIMEOUT));
        env.put("com.sun.jndi.ldap.read.timeout", Integer.toString(SO_TIMEOUT));
        env.put(Context.PROVIDER_URL, "ldap://" + this.host + ":" + this.port + "/");
        
        InitialLdapContext ctx = null;
        StartTlsResponse tls = null;
        try {
            try {
                ctx = new InitialLdapContext(env, null);
                tls = (StartTlsResponse) ctx.extendedOperation(new StartTlsRequest());
            } catch (final NamingException e) {
                throw new com.archibus.app.common.connectors.exception.ConfigurationException(
                    "Error connecting using STARTTLS. \n" + e.getLocalizedMessage(), e);
            }
            
            try {
                tls.negotiate(new TLSSocketFactoryImpl(context.getSocketFactory()));
            } catch (final SSLHandshakeException e) {
                /*
                 * Expected case.
                 */
                Logger.getLogger(LdapCertificateRetriever.class).debug(
                    "Expected error with SSL handshake when retrieving certificate.", e);
            } catch (final IOException e) {
                throw new com.archibus.app.common.connectors.exception.ConfigurationException(
                    "Error negotiating STARTTLS to retrieve certificate. \n"
                            + e.getLocalizedMessage(), e);
            }
        } finally {
            // stop TLS
            if (tls != null) {
                try {
                    tls.close();
                } catch (final IOException e) {
                    Logger.getLogger(LdapCertificateRetriever.class).warn(
                        "Error closing TLS context", e);
                }
            }
            if (ctx != null) {
                try {
                    ctx.close();
                } catch (final NamingException e) {
                    Logger.getLogger(LdapCertificateRetriever.class).warn(
                        "Error closing LDAP context", e);
                }
            }
        }
    }
}
