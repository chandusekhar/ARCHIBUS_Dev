package com.archibus.app.common.fileaccess;

import java.io.*;
import java.util.Date;

import com.archibus.app.common.fileaccess.AbstractFtpTemplate.Callback;
import com.archibus.utility.ExceptionBase;
import com.enterprisedt.net.ftp.*;

/**
 * Provides functionality common to all classes implementing FileAccessProvider for FTP: FTP and
 * FTPS.
 *
 * @author Valery Tydykov
 * @author Yong Shao
 *
 */
public abstract class AbstractFileAccessProviderFtp extends AbstractFileAccessProvider {
    
    /**
     * Host of FTP server.
     */
    private String host;
    
    /**
     * Password for FTP server.
     */
    private String password;
    
    /**
     * Port of FTP server.
     */
    private int port;
    
    /**
     * Username for FTP server.
     */
    private String username;
    
    @Override
    public OutputStream createOutputStream(final String fileName, final boolean appendFirstWrite)
            throws ExceptionBase {
        super.createOutputStream(fileName, appendFirstWrite);
        
        final AbstractFtpTemplate<? extends FTPClientInterface> ftp =
                createTemplate(this.host, this.port);

        final String filePath = getFilePathAsString(fileName);

        final OutputStream outputStream = (OutputStream) ftp.doOperation(new Callback() {
            public Object doWith(final FTPClientInterface ftpClient) throws IOException,
            FTPException {
                return ftp.createOutputStream(filePath, appendFirstWrite);
            }
        });

        return outputStream;
    }
    
    /**
     * @return the host
     */
    public String getHost() {
        return this.host;
    }
    
    @Override
    public Date getLastModified(final String fileName) throws ExceptionBase {
        super.getLastModified(fileName);
        
        final AbstractFtpTemplate<? extends FTPClientInterface> ftp =
                createTemplate(this.host, this.port);
        
        final String filePath = getFilePathAsString(fileName);
        
        final Date lastModified = (Date) ftp.doOperation(new Callback() {
            public Object doWith(final FTPClientInterface ftpClient) throws IOException,
            FTPException {
                Date lastModified = null;
                if (ftpClient.exists(filePath)) {
                    lastModified = ftpClient.modtime(filePath);
                }
                
                return lastModified;
            }
        });
        
        return lastModified;
    }
    
    /**
     * @return the password
     */
    public String getPassword() {
        return this.password;
    }
    
    /**
     * @return the port
     */
    public int getPort() {
        return this.port;
    }
    
    @Override
    public long getSize(final String fileName) throws ExceptionBase {
        super.getSize(fileName);
        
        final AbstractFtpTemplate<? extends FTPClientInterface> ftp =
                createTemplate(this.host, this.port);
        
        final String filePath = getFilePathAsString(fileName);
        
        final Long size = (Long) ftp.doOperation(new Callback() {
            public Object doWith(final FTPClientInterface ftpClient) throws IOException,
            FTPException {
                long size = 0;
                if (ftpClient.exists(filePath)) {
                    size = ftpClient.size(filePath);
                }
                
                return Long.valueOf(size);
            }
        });
        
        return size;
    }

    /**
     * @return the username
     */
    public String getUsername() {
        return this.username;
    }
    
    @Override
    public InputStream readFile(final String fileName) throws ExceptionBase {
        super.readFile(fileName);
        
        final AbstractFtpTemplate<? extends FTPClientInterface> ftp =
                createTemplate(this.host, this.port);
        
        final String filePath = getFilePathAsString(fileName);
        
        final InputStream inputStream = (InputStream) ftp.doOperation(new Callback() {
            public Object doWith(final FTPClientInterface ftpClient) throws IOException,
            FTPException {
                InputStream inputStream = null;
                if (ftpClient.exists(filePath)) {
                    inputStream = ftp.createInputStream(filePath);
                }
                
                return inputStream;
            }
        });
        
        return inputStream;
    }
    
    /**
     * @param host the host to set
     */
    public void setHost(final String host) {
        this.host = host;
    }
    
    /**
     * @param password the password to set
     */
    public void setPassword(final String password) {
        this.password = password;
    }
    
    /**
     * @param port the port to set
     */
    public void setPort(final int port) {
        this.port = port;
    }
    
    /**
     * @param username the username to set
     */
    public void setUsername(final String username) {
        this.username = username;
    }
    
    @Override
    public void writeFile(final InputStream inputStream, final String fileName)
            throws ExceptionBase {
        super.writeFile(inputStream, fileName);
        
        final AbstractFtpTemplate<? extends FTPClientInterface> ftp =
                createTemplate(this.host, this.port);
        
        final String filePath = getFilePathAsString(fileName);
        
        ftp.doOperation(new Callback() {
            public Object doWith(final FTPClientInterface ftpClient) throws IOException,
            FTPException {
                return ftpClient.put(inputStream, filePath);
            }
        });
    }
    
    /**
     * Creates AbstractFtpTemplate.
     *
     * @param host of FTP server.
     * @param port of FTP server.
     * @return created template.
     * @throws ExceptionBase if creation fails.
     */
    protected abstract AbstractFtpTemplate<? extends FTPClientInterface> createTemplate(
        final String host, final int port) throws ExceptionBase;
}