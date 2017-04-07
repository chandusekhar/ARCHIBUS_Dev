package com.archibus.app.common.fileaccess;

import java.io.*;

import com.archibus.utility.ExceptionBase;
import com.enterprisedt.net.ftp.FTPException;
import com.enterprisedt.net.ftp.ssh.*;

/**
 * Helper class that simplifies code which uses SSHFTPClient.
 * <p>
 * SSHFTPClient-specific exceptions are mapped to ExceptionBase.
 *
 * @author George B. Cole
 * @since 21.4
 *
 */
public class SftpTemplate extends AbstractFtpTemplate<SSHFTPClient> {
    /**
     * Client Private Key.
     */
    private final String clientPrivateKey;
    
    /**
     * @param address the address of the FTP server including user credentials.
     * @param clientPrivateKey the location of the client's private key.
     */
    public SftpTemplate(final FtpServerConnectionParameters address, final String clientPrivateKey) {
        super(address);
        this.clientPrivateKey = clientPrivateKey;
    }

    /**
     * @param host the host name or IP for the FTP server.
     * @param port the port for the FTP server.
     * @param password the password for authentication to the FTP server.
     * @param username the user name for authentication to the FTP server.
     * @param clientPrivateKey the location of the client's private key.
     */
    public SftpTemplate(final String host, final int port, final String password,
            final String username, final String clientPrivateKey) {
        super(host, port, password, username);
        this.clientPrivateKey = clientPrivateKey;
    }
    
    @Override
    public void afterConnect() throws ExceptionBase {
        /*
         * Do nothing.
         */
    }

    @Override
    public void beforeConnect() throws ExceptionBase {
        final FtpServerConnectionParameters address = getAddress();
        final SSHFTPClient client = getClient();
        try {
            client.setAuthentication(this.getClientPrivateKey(), address.getUserName(),
                address.getPassword());
            client.getValidator().setHostValidationEnabled(false);
            super.beforeConnect();
        } catch (final IOException e) {
            // @non-translatable
            throw new ExceptionBase("I/O error: loading client or server certificate: "
                    + this.getAddress(), e);
        } catch (final FTPException e) {
            // @non-translatable
            throw new ExceptionBase(
                "FTP error: creating FTPS client or loading client or server certificate: "
                        + this.getAddress(), e);
        }
    }
    
    @Override
    public InputStream createInputStream(final String filePath) throws ExceptionBase {
        try {
            return new SSHFTPInputStream(getClient(), filePath);
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
            return new SSHFTPOutputStream(getClient(), filePath, appendFirstWrite);
        } catch (final IOException e) {
            throw new ExceptionBase(getErrorMessage(IO_ERROR_TYPE, filePath), e);
        } catch (final FTPException e) {
            throw new ExceptionBase(getErrorMessage(FTP_ERROR_TYPE, filePath), e);
        }
    }

    /**
     * @return the location of the client's private key.
     */
    public String getClientPrivateKey() {
        return this.clientPrivateKey;
    }

    @Override
    protected SSHFTPClient createClient() throws ExceptionBase {
        return new SSHFTPClient();
    }
}
