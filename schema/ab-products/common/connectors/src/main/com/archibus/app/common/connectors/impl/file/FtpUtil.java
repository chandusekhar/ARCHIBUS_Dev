package com.archibus.app.common.connectors.impl.file;

import java.io.IOException;

import org.json.JSONObject;

import com.archibus.app.common.connectors.domain.ConnectorConfig;
import com.archibus.app.common.connectors.exception.ConfigurationException;
import com.archibus.app.common.connectors.transfer.common.ConnectorObfuscationUtil;
import com.archibus.app.common.fileaccess.*;
import com.archibus.utility.StringUtil;
import com.enterprisedt.net.ftp.FTPException;

/**
 * Utility methods for creating an FTP client from a connector configuration.
 *
 * @author cole
 *
 */
public final class FtpUtil {

    /**
     * A connector parameter for a server certificate if FTPS is to be used.
     */
    private static final String SERVER_CERT_PARAM = "serverCertificateFileName";

    /**
     * A connector parameter for a client certificate if FTPS is to be used, or a client key if SFTP
     * is to be used.
     */
    private static final String CLIENT_CERT_PARAM = "clientCertificateFileName";

    /**
     * A connector parameter for a passphrase for the client certificate if FTPS is to be used.
     */
    private static final String CLIENT_KEY_PASSPHRASE_PARAM = "clientKeyPassphrase";

    /**
     * A connector parameter to specify whether FTP or FTPS is to be used, when ftp_secure is not
     * set.
     */
    private static final String USE_FTP_OVER_SSL_PARAM = "useFtpOverSSL";

    /**
     * A connector parameter to specify whether FTP or FTPS is to be used, when ftp_secure is not
     * set.
     */
    private static final String USE_FTP_OVER_TLS_PARAM = "useFtpOverTLS";

    /**
     * Utility class, do not call.
     */
    private FtpUtil() {
        /*
         * Declared to hide the constructor.
         */
    }

    /**
     * Create a connection to an FTP server for these requests based on the connector configuration.
     *
     * @param connector the configuration for the adaptor.
     * @return an open connection to a file system or FTP server depending on the connector's
     *         configuration.
     * @throws ConfigurationException if a connection cannot be established.
     */
    public static AbstractFtpTemplate<?> createFtpClient(final ConnectorConfig connector)
            throws ConfigurationException {
        AbstractFtpTemplate<?> ftpClient;
        final JSONObject parameters = connector.getConnParams();
        final FtpServerConnectionParameters address =
                new FtpServerConnectionParameters(connector.getFtpString(), connector.getFtpPort(),
                    connector.getFtpUser(), ConnectorObfuscationUtil.decodeParameter(connector
                        .getFtpPassword()));
        if (connector.getFtpSecure()) {
            ftpClient = new SftpTemplate(address, parameters.getString(CLIENT_CERT_PARAM));
        } else {
            final boolean useFtpOverTLS = isUsingTls(parameters);
            if (useFtpOverTLS) {
                ftpClient =
                        new FtpsTemplate(address, parameters.getString(SERVER_CERT_PARAM),
                            parameters.getString(CLIENT_CERT_PARAM),
                            parameters.getString(CLIENT_KEY_PASSPHRASE_PARAM));
            } else {
                ftpClient = new FtpTemplate(address);
            }
        }
        try {
            ftpClient.beforeConnect();
            ftpClient.getClient().connect();
            ftpClient.afterConnect();
        } catch (final FTPException e) {
            throw new ConfigurationException("Protocol error connecting to FTP client", e);
        } catch (final IOException e) {
            throw new ConfigurationException("Connection error connecting to FTP client", e);
        }
        return ftpClient;
    }

    /**
     * @param parameters connector parameters.
     * @return whether the FTP connector is using TLS.
     */
    private static boolean isUsingTls(final JSONObject parameters) {
        boolean useTls = false;
        if (!StringUtil.isNullOrEmpty(parameters) && parameters.has(USE_FTP_OVER_SSL_PARAM)
                && !StringUtil.isNullOrEmpty(parameters.getString(USE_FTP_OVER_SSL_PARAM))) {
            useTls = Boolean.parseBoolean(parameters.getString(USE_FTP_OVER_SSL_PARAM));
        } else if (!StringUtil.isNullOrEmpty(parameters) && parameters.has(USE_FTP_OVER_TLS_PARAM)
                && !StringUtil.isNullOrEmpty(parameters.getString(USE_FTP_OVER_TLS_PARAM))) {
            useTls = Boolean.parseBoolean(parameters.getString(USE_FTP_OVER_TLS_PARAM));
        }
        return useTls;
    }
}
