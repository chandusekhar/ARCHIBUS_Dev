package com.archibus.app.common.fileaccess;

/**
 * Represents configuration for connecting to an FTP server on an IP network.
 *
 * @author George B. Cole
 * @since 21.4
 *
 */
public class FtpServerConnectionParameters {
    /**
     * Host name for the server.
     */
    private final String host;
    
    /**
     * Password for user name for authenticating.
     */
    private final String password;
    
    /**
     * Port on which the server listens.
     */
    private final int port;
    
    /**
     * User name for authenticating.
     */
    private final String userName;
    
    /**
     * @param host host name for the server.
     * @param port port on which the server listens.
     * @param userName user name for authenticating.
     * @param password password for user name for authenticating.
     */
    public FtpServerConnectionParameters(final String host, final int port, final String userName,
            final String password) {
        super();
        this.host = host;
        this.port = port;
        this.userName = userName;
        this.password = password;
    }
    
    /**
     * @return host name for the server.
     */
    public String getHost() {
        return this.host;
    }
    
    /**
     * @return password for user name for authenticating.
     */
    public String getPassword() {
        return this.password;
    }
    
    /**
     * @return port on which the server listens.
     */
    public int getPort() {
        return this.port;
    }
    
    /**
     * @return user name for authenticating.
     */
    public String getUserName() {
        return this.userName;
    }
    
    @Override
    public String toString() {
        return this.userName + '@' + this.host + ':' + this.port;
    }
}
