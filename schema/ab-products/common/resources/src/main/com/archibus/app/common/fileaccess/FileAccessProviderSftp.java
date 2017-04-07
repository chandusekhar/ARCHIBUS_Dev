/**
 *
 */
package com.archibus.app.common.fileaccess;

import com.archibus.utility.ExceptionBase;

/**
 * Provides read/write access to a file, using SFTP protocol.
 *
 * http://tools.ietf.org/html/draft-ietf-secsh-filexfer-13
 *
 * @author George B. Cole
 * @since 21.4
 *
 */
// TODO unit test
public class FileAccessProviderSftp extends AbstractFileAccessProviderFtp {
    
    /**
     * the path to the client's private key.
     */
    private String clientPrivateKey;
    
    /**
     * @return the path to the client's private key.
     */
    public String getClientPrivateKey() {
        return this.clientPrivateKey;
    }
    
    /**
     * @param host the host name for the SFTP server.
     * @param port the port number for the SFTP server.
     * @return a template for accessing an SFTP server.
     * @throws ExceptionBase if there is an issue creating an SFTP client.
     */
    @Override
    protected SftpTemplate createTemplate(final String host, final int port) throws ExceptionBase {
        final SftpTemplate ftp =
                new SftpTemplate(host, port, this.getPassword(), this.getUsername(),
                    this.clientPrivateKey);
        
        return ftp;
    }
    
    /**
     * @param clientPrivateKey the path to the client's private key to use.
     */
    void setClientPrivateKey(final String clientPrivateKey) {
        this.clientPrivateKey = clientPrivateKey;
    }
}
