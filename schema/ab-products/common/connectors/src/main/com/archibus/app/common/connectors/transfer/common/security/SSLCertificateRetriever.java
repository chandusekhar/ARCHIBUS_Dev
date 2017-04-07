package com.archibus.app.common.connectors.transfer.common.security;

import java.io.IOException;
import java.net.*;

import javax.net.ssl.*;

import com.archibus.app.common.connectors.exception.ConfigurationException;

/**
 * Method for retrieving a certificate using TLS.
 *
 * @author cole
 * @since 22.1
 *
 */
public class SSLCertificateRetriever implements ICertificateRetriever {
    
    /**
     * SSL Socket timeout.
     */
    private static final int SO_TIMEOUT = 10000;
    
    /**
     * Host name to retrieve the certificate from.
     */
    private final String host;
    
    /**
     * Port to retrieve the certificatee from.
     */
    private final int port;
    
    /**
     * @param host host name to retrieve the certificate from.
     * @param port port to retrieve the certificate from.
     */
    public SSLCertificateRetriever(final String host, final int port) {
        this.host = host;
        this.port = port;
    }
    
    @Override
    public void retrieveCertificate(final SSLContext context) {
        final SSLSocketFactory factory = getFactory(context);

        SSLSocket socket;
        try {
            socket = (SSLSocket) factory.createSocket(this.host, this.port);
        } catch (final UnknownHostException e) {
            throw new ConfigurationException("Can't resolve host: " + this.host, e);
        } catch (final IOException e) {
            throw new ConfigurationException("Can't connect to host: " + this.host + ':'
                    + this.port, e);
        }
        try {
            socket.setSoTimeout(SO_TIMEOUT);
        } catch (final SocketException e) {
            throw new ConfigurationException("Error setting SSL Socket timeout (10 seconds)", e);
        }
        try {
            socket.startHandshake();
            socket.close();
        } catch (final SSLException e) {
            throw new ConfigurationException("Protocol error with SSL Handshake: "
                    + e.getLocalizedMessage(), e);
        } catch (final IOException e) {
            throw new ConfigurationException("Connection error with SSL Handshake: "
                    + e.getLocalizedMessage(), e);
        }
    }
    
    /**
     * @param context SSL context to use for connections.
     * @return a factory for connections.
     */
    protected SSLSocketFactory getFactory(final SSLContext context) {
        return context.getSocketFactory();
    }
}
