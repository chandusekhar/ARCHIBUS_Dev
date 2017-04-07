package com.archibus.app.common.connectors.transfer.common.security;

/*
 * Copyright 2006 Sun Microsystems, Inc. All Rights Reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification, are permitted
 * provided that the following conditions are met:
 * 
 * - Redistributions of source code must retain the above copyright notice, this list of conditions
 * and the following disclaimer.
 * 
 * - Redistributions in binary form must reproduce the above copyright notice, this list of
 * conditions and the following disclaimer in the documentation and/or other materials provided with
 * the distribution.
 * 
 * - Neither the name of Sun Microsystems nor the names of its contributors may be used to endorse
 * or promote products derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
 * FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 * WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY
 * WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 * 
 * Modified by ARCHIBUS 2014: rename and refactor.
 * 
 * Modified by ARCHIBUS 2015: startls support.
 */
/**
 * http://blogs.sun.com/andreas/resource/InstallCert.java Use: java InstallCert hostname Example: %
 * java InstallCert ecc.fedora.redhat.com
 */

import java.io.File;
import java.security.*;
import java.security.cert.*;

import javax.net.ssl.*;

import com.archibus.app.common.connectors.exception.ConfigurationException;
import com.archibus.utility.StringUtil;

/**
 * Class used to add the server's certificate to the KeyStore with your trusted certificates.
 */
public final class CertificateInstaller {
    
    /**
     * Utility class, do not construct.
     */
    private CertificateInstaller() {
        /*
         * Do nothing.
         */
    }
    
    /**
     * @param suggestedJavaHome the java home the caller wants to use.
     * @return a java home for certificates.
     */
    private static String resolveJavaHome(final String suggestedJavaHome) {
        String javaHome = suggestedJavaHome;
        if (StringUtil.isNullOrEmpty(suggestedJavaHome)) {
            javaHome = System.getProperty("java.home");
        }
        final char fileSeparator = File.separatorChar;
        javaHome += fileSeparator + "lib" + fileSeparator + "security";
        return javaHome;
    }
    
    /**
     * Retrieve the trust manager for this server and keystore.
     *
     * @param javaKeyStore java's installed certificates.
     * @return a trust manager for validating certificates.
     */
    private static SavingTrustManager getTrustManager(final KeyStore javaKeyStore) {
        
        TrustManagerFactory tmf;
        try {
            tmf = TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm());
        } catch (final NoSuchAlgorithmException e) {
            throw new ConfigurationException(
                "Failed to obtain default javax.net.ssl.TrustManagerFactory.", e);
        }
        try {
            tmf.init(javaKeyStore);
        } catch (final KeyStoreException e) {
            throw new ConfigurationException(
                "Failed to initialize default javax.net.ssl.TrustManagerFactory.", e);
        }
        final X509TrustManager defaultTrustManager = (X509TrustManager) tmf.getTrustManagers()[0];
        
        return new SavingTrustManager(defaultTrustManager);
    }
    
    /**
     * Update message digests.
     *
     * @param trustManager the trust manager with the certificate chain to update.
     */
    private static void loadMessageDigests(final SavingTrustManager trustManager) {
        MessageDigest sha1;
        try {
            sha1 = MessageDigest.getInstance("SHA1");
        } catch (final NoSuchAlgorithmException e) {
            throw new ConfigurationException("Could not obtain SHA1 algorithm", e);
        }
        MessageDigest md5;
        try {
            md5 = MessageDigest.getInstance("MD5");
        } catch (final NoSuchAlgorithmException e) {
            throw new ConfigurationException("Could not obtain MD5 algorithm", e);
        }
        for (final X509Certificate cert : trustManager.chain) {
            try {
                sha1.update(cert.getEncoded());
            } catch (final CertificateEncodingException e) {
                throw new ConfigurationException("Error encoding certificate in chain using SHA1",
                    e);
            }
            try {
                md5.update(cert.getEncoded());
            } catch (final CertificateEncodingException e) {
                throw new ConfigurationException("Error encoding certificate in chain using MD5", e);
            }
        }
    }
    
    /**
     * Install a certificate for the given server.
     *
     * @param passPhraseAsString passphrase for keystore.
     * @param suggestedJavaHome java home, may be null and system property will be used.
     * @param retriever a method for retrieving a certificate from the host.
     * @param alias an identifier for the certificate in the keystore.
     * @throws ConfigurationException if for some reason the certificate cannot be installed.
     */
    public static void installCertificate(final String passPhraseAsString,
            final String suggestedJavaHome, final ICertificateRetriever retriever,
            final String alias) throws ConfigurationException {
        
        final String javaHome = resolveJavaHome(suggestedJavaHome);
        
        final char[] passphrase = passPhraseAsString.toCharArray();
        
        final KeyStore javaKeyStore = KeystoreUtil.getKeyStore(javaHome, passphrase);
        
        SSLContext context;
        try {
            context = SSLContext.getInstance("TLS");
        } catch (final NoSuchAlgorithmException e) {
            throw new ConfigurationException("Failed to obtain javax.net.ssl.SSLContext(TLS).", e);
        }
        
        final SavingTrustManager trustManager = getTrustManager(javaKeyStore);
        
        try {
            context.init(null, new TrustManager[] { trustManager }, null);
        } catch (final KeyManagementException e) {
            throw new ConfigurationException("Failed to initialize javax.net.ssl.SSLContext(TLS).",
                e);
        }
        
        retriever.retrieveCertificate(context);
        
        if (trustManager.chain == null) {
            throw new ConfigurationException("Could not obtain server certificate chain", null);
        }
        
        loadMessageDigests(trustManager);
        
        final X509Certificate cert = trustManager.chain[trustManager.chain.length - 1];
        try {
            javaKeyStore.setCertificateEntry(alias, cert);
        } catch (final KeyStoreException e) {
            throw new ConfigurationException("Existing and untrusted keystore alias: " + alias, e);
        }
        
        KeystoreUtil.updateKeystore(javaHome, passphrase, javaKeyStore);
    }
    
    /**
     * A trust manager that verifies trust using the given trust manager.
     *
     */
    private static final class SavingTrustManager implements X509TrustManager {
        
        /**
         * The trust manager used to verify certificates.
         */
        private final X509TrustManager trustManager;
        
        /**
         * The certificate chain to check.
         */
        private X509Certificate[] chain;
        
        /**
         * @param trustManager the trust manager used to verify certificates.
         */
        SavingTrustManager(final X509TrustManager trustManager) {
            this.trustManager = trustManager;
        }
        
        /**
         * @return nothing
         * @throws UnsupportedOperationException always.
         */
        @Override
        public X509Certificate[] getAcceptedIssuers() throws UnsupportedOperationException {
            throw new UnsupportedOperationException();
        }
        
        /**
         * @param chainToCheck ignored.
         * @param authType ignored.
         * @throws UnsupportedOperationException always.
         */
        @Override
        public void checkClientTrusted(final X509Certificate[] chainToCheck, final String authType)
                throws UnsupportedOperationException {
            throw new UnsupportedOperationException();
        }
        
        /**
         * @param chainToCheck certificate chain to test.
         * @param authType type of authentication to use to test.
         * @throws CertificateException if the certificate chain is untrusted.
         */
        @Override
        public void checkServerTrusted(final X509Certificate[] chainToCheck, final String authType)
                throws CertificateException {
            this.chain = new X509Certificate[chainToCheck.length];
            System.arraycopy(chainToCheck, 0, this.chain, 0, chainToCheck.length);
            this.trustManager.checkServerTrusted(this.chain, authType);
        }
    }
    
}
