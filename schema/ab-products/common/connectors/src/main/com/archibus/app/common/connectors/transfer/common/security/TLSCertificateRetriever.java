package com.archibus.app.common.connectors.transfer.common.security;

import javax.net.ssl.*;

/**
 * Method for retrieving a certificate using TLS.
 *
 * @author cole
 * @since 22.1
 *
 */
public class TLSCertificateRetriever extends SSLCertificateRetriever {
    
    /**
     * @param host host name to retrieve the certificate from.
     * @param port port to retrieve the certificate from.
     */
    public TLSCertificateRetriever(final String host, final int port) {
        super(host, port);
    }

    @Override
    protected SSLSocketFactory getFactory(final SSLContext context) {
        return new TLSSocketFactoryImpl(context.getSocketFactory());
    }
}
