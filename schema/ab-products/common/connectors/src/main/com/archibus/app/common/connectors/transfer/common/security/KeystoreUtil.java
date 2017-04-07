package com.archibus.app.common.connectors.transfer.common.security;

import java.io.*;
import java.security.*;
import java.security.cert.CertificateException;

import com.archibus.app.common.connectors.exception.ConfigurationException;

/**
 * Utilities for managing the java keystore.
 *
 * @author cole
 *
 */
public final class KeystoreUtil {

    /**
     * Name of jsse ca certs certificate file.
     */
    private static final String JSEE_CA_CERTS_FILE_NAME = "jssecacerts";

    /**
     * Name of ca certs certificate file.
     */
    private static final String CA_CERTS_FILE_NAME = "cacerts";

    /**
     * Utility class, do not call.
     */
    private KeystoreUtil() {

    }

    /**
     * @param javaHome the location of the keystore file.
     * @param passphrase the passphrase for accessing the keystore.
     * @return the KeyStore from the java home.
     */
    public static KeyStore getKeyStore(final String javaHome, final char[] passphrase) {
        KeyStore javaKeyStore;
        final InputStream caCertInputStream = getCaCertInputStream(javaHome);
        try {
            javaKeyStore = KeyStore.getInstance(KeyStore.getDefaultType());
        } catch (final KeyStoreException e) {
            throw new ConfigurationException("Failed to obtain java.security.KeyStore instance.", e);
        }
        try {
            javaKeyStore.load(caCertInputStream, passphrase);
        } catch (final NoSuchAlgorithmException e) {
            throw new ConfigurationException(
                "Keystore integrity verification algorithm not found.", e);
        } catch (final CertificateException e) {
            throw new ConfigurationException("Certificates in the keystore could not be loaded.", e);
        } catch (final IOException e) {
            throw new ConfigurationException("Issue with keystore password or data.", e);
        }
        try {
            caCertInputStream.close();
        } catch (final IOException e) {
            throw new ConfigurationException("CA Certificates could not be closed.", e);
        }
        return javaKeyStore;
    }

    /**
     * @param javaHome the home for java certificates.
     * @return an input stream for certificates.
     */
    private static InputStream getCaCertInputStream(final String javaHome) {
        File file = new File(JSEE_CA_CERTS_FILE_NAME);
        if (!file.isFile()) {
            final File dir = new File(javaHome);
            file = new File(dir, JSEE_CA_CERTS_FILE_NAME);
            if (!file.isFile()) {
                file = new File(dir, CA_CERTS_FILE_NAME);
            }
        }

        InputStream caCertInputStream;
        try {
            caCertInputStream = new FileInputStream(file);
        } catch (final FileNotFoundException e) {
            throw new ConfigurationException("CA Certificates file not found." + file, e);
        }
        return caCertInputStream;
    }

    /**
     * @param javaHome the location of the keystore file.
     * @param passphrase the passphrase for the keystore.
     * @param javaKeyStore the keystore to update.
     */
    public static void updateKeystore(final String javaHome, final char[] passphrase,
            final KeyStore javaKeyStore) {
        OutputStream out;
        try {
            out = new FileOutputStream(javaHome + File.separatorChar + JSEE_CA_CERTS_FILE_NAME);
        } catch (final FileNotFoundException e) {
            throw new ConfigurationException(
                "CA Certificates file not found for writing. Does ARCHIBUS have permission to write to it?",
                e);
        }
        try {
            javaKeyStore.store(out, passphrase);
            out.close();
        } catch (final KeyStoreException e) {
            throw new ConfigurationException("Keystore has not been initialized.", e);
        } catch (final NoSuchAlgorithmException e) {
            throw new ConfigurationException("Certificate integrity algorithm could not be found.",
                e);
        } catch (final CertificateException e) {
            throw new ConfigurationException(
                "Certificates included in the keystore could not be stored.", e);
        } catch (final IOException e) {
            throw new ConfigurationException("Error writing keystore.", e);
        }
    }
}
