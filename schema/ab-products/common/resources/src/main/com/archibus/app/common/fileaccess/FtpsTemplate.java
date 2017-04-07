package com.archibus.app.common.fileaccess;

import java.io.*;

import com.archibus.utility.ExceptionBase;
import com.enterprisedt.net.ftp.*;
import com.enterprisedt.net.ftp.ssl.*;

/**
 * Helper class that simplifies code which uses SSLFTPClient.
 * <p>
 * SSLFTPClient-specific exceptions are mapped to ExceptionBase.
 *
 * @author Valery Tydykov
 * @author Yong Shao
 *
 */
public class FtpsTemplate extends AbstractFtpTemplate<SSLFTPClient> {
    
    /**
     * Property: File path of the client certificate. TODO absolute path?
     */
    private final String clientCertificateFilePath;
    
    /**
     * Property: Pass-phrase for accessing the key.
     */
    private final String clientKeyPassphrase;
    
    /**
     * Property: File path of the server certificate. TODO absolute path?
     */
    private final String serverCertificateFilePath;
    
    /**
     * Creates FtpsTemplate with the following parameters.
     *
     * @param connectionParameters the address of the FTP server including user credentials.
     * @param serverCertificateFilePath File path of the server certificate.
     * @param clientCertificateFilePath File path of the client certificate.
     * @param clientKeyPassphrase pass-phrase for accessing the key.
     */
    public FtpsTemplate(final FtpServerConnectionParameters connectionParameters,
            final String serverCertificateFilePath, final String clientCertificateFilePath,
            final String clientKeyPassphrase) {
        super(connectionParameters);
        this.serverCertificateFilePath = serverCertificateFilePath;
        this.clientCertificateFilePath = clientCertificateFilePath;
        this.clientKeyPassphrase = clientKeyPassphrase;
    }
    
    /**
     * Creates FtpsTemplate with the following parameters.
     *
     * @param host the host name or IP for the FTP server.
     * @param port the port for the FTP server.
     * @param password the password for authentication to the FTP server.
     * @param username the user name for authentication to the FTP server.
     * @param serverCertificateFilePath File path of the server certificate.
     * @param clientCertificateFilePath File path of the client certificate.
     * @param clientKeyPassphrase Pass-phrase for accessing the key.
     */
    public FtpsTemplate(final String host, final int port, final String password,
            final String username, final String serverCertificateFilePath,
            final String clientCertificateFilePath, final String clientKeyPassphrase) {
        super(host, port, password, username);
        this.serverCertificateFilePath = serverCertificateFilePath;
        this.clientCertificateFilePath = clientCertificateFilePath;
        this.clientKeyPassphrase = clientKeyPassphrase;
    }
    
    @Override
    public void afterConnect() throws IOException, FTPException {
        // TODO ??? switch to SSL on control channel
        this.getClient().auth(SSLFTPClient.AUTH_TLS);
        getClient().login(getAddress().getUserName(), getAddress().getPassword());
        
        super.afterConnect();
    }
    
    @Override
    public void beforeConnect() throws IOException, FTPException {
        super.beforeConnect();
        
        doValidation();
    }
    
    @Override
    public InputStream createInputStream(final String filePath) throws ExceptionBase {
        try {
            return new FTPInputStream(getClient(), filePath);
        } catch (final IOException e) {
            throw new ExceptionBase(getErrorMessage(IO_ERROR_TYPE, filePath), e);
        } catch (final FTPException e) {
            throw new ExceptionBase(getErrorMessage(FTP_ERROR_TYPE, filePath), e);
        }
    }
    
    @Override
    public OutputStream createOutputStream(final String filePath, final boolean appendFirstWrite)
            throws ExceptionBase {
        try {
            return new FTPOutputStream(getClient(), filePath, appendFirstWrite);
        } catch (final IOException e) {
            throw new ExceptionBase(getErrorMessage(IO_ERROR_TYPE, filePath), e);
        } catch (final FTPException e) {
            throw new ExceptionBase(getErrorMessage(FTP_ERROR_TYPE, filePath), e);
        }
    }

    @Override
    protected SSLFTPClient createClient() throws ExceptionBase {
        try {
            return new SSLFTPClient();
        } catch (final FTPException e) {
            // should not happen
            // @non-translatable
            throw new ExceptionBase(null, "Could not create SSLFTPClient", e);
        }
    }
    
    /**
     * Loads and validates server and client certificates.
     *
     * @throws FileNotFoundException if certificate file is not found.
     * @throws IOException if there was an error reading the certificates.
     * @throws SSLFTPCertificateException if there was a problem accessing the key or the private
     *             key.
     * @throws FTPException if FTP specific exception was thrown.
     */
    protected void doValidation() throws FileNotFoundException, IOException,
    SSLFTPCertificateException, FTPException {
        // TODO server validation?
        this.getClient().getRootCertificateStore().importPEMFile(this.serverCertificateFilePath);
        // TODO client validation?
        this.getClient().loadClientCertificate(this.clientCertificateFilePath,
            this.clientKeyPassphrase);
    }
}
