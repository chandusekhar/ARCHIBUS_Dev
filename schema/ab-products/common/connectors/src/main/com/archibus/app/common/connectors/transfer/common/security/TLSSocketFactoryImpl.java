package com.archibus.app.common.connectors.transfer.common.security;

import java.io.IOException;
import java.net.*;
import java.util.*;

import javax.net.ssl.*;

/**
 * Provides an SSL Socket Factory that supports only TLS.
 *
 * @author cole
 * @since 22.1
 *
 */
public final class TLSSocketFactoryImpl extends javax.net.ssl.SSLSocketFactory implements
        Comparator<String> {

    /**
     * The SSL Socket Factory being proxied.
     */
    private final SSLSocketFactory wrappedFactory;

    /*
     * JUSTIFICATION: Super constructor is private. SSLSocketFactory is being used as an interface.
     */
    /**
     * Default TLSSocketFactory constructor specifying baseFactory as SSLSocketFactory.getDefault().
     */
    @SuppressWarnings("PMD.CallSuperInConstructor")
    public TLSSocketFactoryImpl() {
        this((SSLSocketFactory) SSLSocketFactory.getDefault());
    }

    /*
     * JUSTIFICATION: Super constructor is private. SSLSocketFactory is being used as an interface.
     */
    /**
     * @param baseFactory the SSL Socket Factory to delegate to.
     */
    @SuppressWarnings("PMD.CallSuperInConstructor")
    public TLSSocketFactoryImpl(final SSLSocketFactory baseFactory) {
        this.wrappedFactory = baseFactory;
    }

    /**
     * @return the singleton instance.
     */
    public static TLSSocketFactoryImpl getDefault() {
        return new TLSSocketFactoryImpl();
    }

    /**
     * Set supported protocols to only known TLS protocols.
     *
     * @param socket being created.
     * @return socket that will only support known TLS protocols.
     */
    private Socket enableOnlyTLS(final Socket socket) {
        if (socket instanceof SSLSocket) {
            final SSLSocket sslSocket = (SSLSocket) socket;
            final List<String> protocols = new ArrayList<String>();
            for (final String s : sslSocket.getEnabledProtocols()) {
                if ("TLSv1".equals(s) || "TLSv1.1".equals(s) || "TLSv1.2".equals(s)) {
                    protocols.add(s);
                }
            }
            sslSocket.setEnabledProtocols(protocols.toArray(new String[protocols.size()]));
        }
        return socket;
    }

    @Override
    public String[] getDefaultCipherSuites() {
        return this.wrappedFactory.getDefaultCipherSuites();
    }

    @Override
    public String[] getSupportedCipherSuites() {
        return this.wrappedFactory.getSupportedCipherSuites();
    }

    @Override
    public Socket createSocket(final Socket socket, final String host, final int port,
            final boolean autoClose) throws IOException {
        return enableOnlyTLS(this.wrappedFactory.createSocket(socket, host, port, autoClose));
    }

    @Override
    public Socket createSocket() throws IOException {
        return enableOnlyTLS(this.wrappedFactory.createSocket());
    }
    
    @Override
    // CHECKSTYLE:OFF Wrapped non-ARCHIBUS API throws multiple exceptions.
    public Socket createSocket(final String host, final int port) throws IOException,
            UnknownHostException {
        // CHECKSTYLE:ON
        return enableOnlyTLS(this.wrappedFactory.createSocket(host, port));
    }

    @Override
    // CHECKSTYLE:OFF Wrapped non-ARCHIBUS API throws multiple exceptions.
    public Socket createSocket(final String host, final int port, final InetAddress localAddress,
            final int localPort) throws IOException, UnknownHostException {
        // CHECKSTYLE:ON
        return enableOnlyTLS(this.wrappedFactory.createSocket(host, port, localAddress, localPort));
    }

    @Override
    public Socket createSocket(final InetAddress address, final int port) throws IOException {
        return enableOnlyTLS(this.wrappedFactory.createSocket(address, port));
    }

    @Override
    public Socket createSocket(final InetAddress address, final int port,
            final InetAddress localAddress, final int localPort) throws IOException {
        return enableOnlyTLS(this.wrappedFactory.createSocket(address, port, localAddress,
            localPort));
    }

    @Override
    public int compare(final String lhs, final String rhs) {
        return lhs.compareTo(rhs);
    }
}