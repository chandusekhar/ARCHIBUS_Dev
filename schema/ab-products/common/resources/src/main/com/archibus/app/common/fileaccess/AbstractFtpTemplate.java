package com.archibus.app.common.fileaccess;

import java.io.*;

import com.archibus.utility.ExceptionBase;
import com.enterprisedt.net.ftp.*;

/**
 * Basis for classes that simplify code which uses file transfer clients.
 *
 * @author George B. Cole
 * @author Valery Tydykov (refactored from FtpTemplate)
 * @author Yong Shao (refactored from FtpTemplate)
 * @since 21.4
 *
 * @param <FtpClientType> the type of file transfer client used.
 */
public abstract class AbstractFtpTemplate<FtpClientType extends FTPClientInterface> {
    
    /**
     * Callback interface to be used with FtpTemplate.
     *
     * @author Valery Tydykov
     *
     */
    interface Callback {
        /**
         * Execute callback logic.
         *
         * @param ftpClient the client for connecting to the FTP server.
         * @return the result of execution.
         * @throws IOException if thrown by the client.
         * @throws FTPException if thrown by the client.
         */
        Object doWith(FTPClientInterface ftpClient) throws IOException, FTPException;
    }
    
    /**
     * An error message for when an stream cannot be created.
     */
    // @non-translatable
    protected static final String FTP_ERROR_MSG =
            "%s error creating stream to file over FTP: %s to path %s";
    
    /**
     * Type of error message: FTP exception.
     */
    protected static final String FTP_ERROR_TYPE = "FTP";
    
    /**
     * Type of error message: I/O exception.
     */
    protected static final String IO_ERROR_TYPE = "IO";
    
    /**
     * Address for file transfer server requiring user authentication.
     */
    private final FtpServerConnectionParameters address;
    
    /**
     * File transfer client.
     */
    private final FtpClientType client;
    
    /**
     * @param address the address of the FTP server including user credentials.
     */
    public AbstractFtpTemplate(final FtpServerConnectionParameters address) {
        com.enterprisedt.util.license.License
            .setLicenseDetails("ARCHIBUSInc", "382-5943-6920-1248");
        this.address = address;
        this.client = this.createClient();
    }
    
    /**
     * @param host the host name or IP for the FTP server.
     * @param port the port for the FTP server.
     * @param password the password for authentication to the FTP server.
     * @param username the user name for authentication to the FTP server.
     */
    public AbstractFtpTemplate(final String host, final int port, final String password,
            final String username) {
        this(new FtpServerConnectionParameters(host, port, username, password));
    }
    
    /**
     * Operations to perform after a connection is established, generally to negotiate configuration
     * with the server.
     *
     * @throws IOException if such an error is thrown during negotiation.
     * @throws FTPException if such an error is thrown during negotiation.
     */
    public void afterConnect() throws IOException, FTPException {
        getClient().setType(com.enterprisedt.net.ftp.FTPTransferType.BINARY);
    }
    
    /**
     * Operations to perform after the client is created and before a connection is established,
     * generally to configure the client.
     *
     * @throws IOException if such an error is thrown during configuration.
     * @throws FTPException if such an error is thrown during configuration.
     */
    public void beforeConnect() throws IOException, FTPException {
        getClient().setRemoteHost(getAddress().getHost());
        getClient().setRemotePort(getAddress().getPort());
    }
    
    /**
     * @param filePath a path to the file on the server.
     * @return an InputStream to read content directly from the file on the server.
     * @throws ExceptionBase if an error occurs accessing the file.
     */
    public abstract InputStream createInputStream(final String filePath) throws ExceptionBase;
    
    /**
     * @param filePath a path to the file on the server.
     * @param appendFirstWrite if the file should be appended to.
     * @return an OutputStream to write content directly to the file on the server.
     * @throws ExceptionBase if an error occurs accessing the file.
     */
    public abstract OutputStream createOutputStream(final String filePath,
            final boolean appendFirstWrite) throws ExceptionBase;
    
    /**
     * Execute some logic defined by the callback and using the ftp client.
     *
     * @param callback the logic to perform using the client.
     * @return the result of the logic defined by callback.
     * @throws ExceptionBase if an error occurs while performing the operation.
     */
    public Object doOperation(final Callback callback) throws ExceptionBase {
        Object result = null;
        try {
            beforeConnect();
            
            // TODO establishing connection might be an expensive operation (like database
            // connection)
            getClient().connect();
            
            afterConnect();
            
            // perform the actual operation with the ftpClient
            result = callback.doWith(getClient());
        } catch (final FTPException ex) {
            // @non-translatable
            throw new ExceptionBase(null,
                "Operation with FTP server failed due to protocol issues.", ex);
        } catch (final IOException ex) {
            // @non-translatable
            throw new ExceptionBase(null,
                "Operation with FTP server failed due to connection issues.", ex);
        } finally {
            cleanUp();
        }
        
        return result;
    }
    
    /**
     * @return address for file transfer server requiring user authentication.
     */
    public FtpServerConnectionParameters getAddress() {
        return this.address;
    }
    
    /**
     * @return the file transfer client.
     */
    public FtpClientType getClient() {
        return this.client;
    }
    
    /**
     * @return a new file transfer client.
     * @throws ExceptionBase if there is any error when creating the client.
     */
    protected abstract FtpClientType createClient() throws ExceptionBase;
    
    /**
     * @param errorType FTP or IO.
     * @param filePath the path to the file requested of the FTP server.
     * @return a generic error message for this facade.
     */
    protected String getErrorMessage(final String errorType, final String filePath) {
        return String.format(FTP_ERROR_MSG, FTP_ERROR_TYPE, this.getAddress(), filePath);
    }
    
    /**
     * Close any open connections to the server.
     */
    private void cleanUp() {
        try {
            getClient().quit();
        } catch (final IOException ex) {
            // @non-translatable
            throw new ExceptionBase(null, "Could not quit FtpClient due to connection issues", ex);
        } catch (final FTPException ex) {
            // @non-translatable
            throw new ExceptionBase(null, "Could not quit FtpClient due to protocol issues", ex);
        }
    }
}
