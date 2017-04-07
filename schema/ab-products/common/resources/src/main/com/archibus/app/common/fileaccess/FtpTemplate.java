package com.archibus.app.common.fileaccess;

import java.io.*;

import com.archibus.utility.ExceptionBase;
import com.enterprisedt.net.ftp.*;

/**
 * Helper class that simplifies code which uses FTPClient.
 * <p>
 * FTPClient-specific exceptions are mapped to ExceptionBase.
 *
 * @author Valery Tydykov
 * @author Yong Shao
 *
 */
public class FtpTemplate extends AbstractFtpTemplate<FTPClient> {
    
    /**
     * @param address the address of the FTP server including user credentials.
     */
    public FtpTemplate(final FtpServerConnectionParameters address) {
        super(address);
    }
    
    /**
     * @param host the host name or IP for the FTP server.
     * @param port the port for the FTP server.
     * @param password the password for authentication to the FTP server.
     * @param username the user name for authentication to the FTP server.
     */
    public FtpTemplate(final String host, final int port, final String password,
            final String username) {
        super(host, port, username, password);
    }
    
    @Override
    public void afterConnect() throws IOException, FTPException {
        getClient().login(getAddress().getUserName(), getAddress().getPassword());
        super.afterConnect();
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

    /**
     * @return the ftpClient
     */
    public FTPClient getFtpClient() {
        return this.getClient();
    }

    @Override
    protected FTPClient createClient() throws ExceptionBase {
        return new FTPClient();
    }
}
