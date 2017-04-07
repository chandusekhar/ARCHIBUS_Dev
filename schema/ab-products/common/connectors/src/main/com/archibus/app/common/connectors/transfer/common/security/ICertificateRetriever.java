package com.archibus.app.common.connectors.transfer.common.security;

import javax.net.ssl.SSLContext;

import com.archibus.app.common.connectors.exception.ConfigurationException;

/**
 * Interface for classes using CertificateInstaller, to provide a method to retrieve the
 * certificate.
 *
 * @author cole
 * @since 22.1
 *
 */
public interface ICertificateRetriever {
    /**
     * @param context the SSL context to use when retrieving the certificate.
     * @throws ConfigurationException if the configuration prevents the certificate from being
     *             retrieved.
     */
    void retrieveCertificate(final SSLContext context) throws ConfigurationException;
}
