package com.archibus.app.common.connectors.impl.ldap;

import static com.archibus.app.common.connectors.transfer.ldap.LdapContextAttribute.*;

import java.util.*;

import javax.naming.InvalidNameException;
import javax.naming.directory.SearchControls;
import javax.naming.ldap.LdapName;

import org.json.JSONObject;

import com.archibus.app.common.connectors.domain.*;
import com.archibus.app.common.connectors.domain.ConnectorTypes.ConnectorType;
import com.archibus.app.common.connectors.exception.ConfigurationException;
import com.archibus.app.common.connectors.transfer.common.ConnectorObfuscationUtil;
import com.archibus.app.common.connectors.transfer.common.security.*;
import com.archibus.app.common.connectors.transfer.ldap.*;
import com.archibus.utility.StringUtil;

/**
 * Utility methods for working with LDAP connectors.
 *
 * @author cole
 *
 */
public final class ConnectorLdapUtil {
    
    /**
     * Parameter for the LDAP authentication method to use.
     */
    private static final String SEC_AUTH_CONN_PARAM = "securityAuthentication";
    
    /**
     * The LDAP authentication method an third party for authenticating the client.
     */
    private static final String SEC_AUTH_EXTERNAL = "EXTERNAL";
    
    /**
     * Parameter for the protocol to be used when communicating with the LDAP server.
     */
    private static final String SEC_PROTOCOL_CONN_PARAM = "securityProtocol";
    
    /**
     * The plain text protocol.
     */
    private static final String SEC_PROTOCOL_NONE = "none";
    
    /**
     * The Secure Socket Layer protocol.
     */
    private static final String SEC_PROTOCOL_SSL = "ssl";
    
    /**
     * The Transport Layer Security protocol.
     */
    private static final String SEC_PROTOCOL_TLS = "tls";
    
    /**
     * The Transport Layer Security initiated from a plain connection.
     */
    private static final String SEC_PROTOCOL_STARTTLS = "starttls";
    
    /**
     * Parameter for an alias in LDAP.
     */
    private static final String REFERRAL_CONN_PARAM = "referral";
    
    /**
     * Parameter indicating whether a certificate should be installed for encrypting data to LDAP.
     */
    private static final String INSTALL_CERT_CONN_PARAM = "installCertificate";
    
    /**
     * Parameter for the DNS name of the LDAP server.
     */
    private static final String LDAP_HOST_CONN_PARAM = "ldapHost";
    
    /**
     * Parameter for the port on which the LDAP server listens.
     */
    private static final String LDAP_PORT_CONN_PARAM = "ldapPort";
    
    /**
     * Parameter for java home.
     */
    private static final String JAVA_PATH_CONN_PARAM = "javaPath";
    
    /**
     * The passphrase to access the java keystore.
     */
    private static final String KEYSTORE_PASSPHRASE_CONN_PARAM = "keyStorePassPhrase";
    
    /**
     * The default LDAP SSL port.
     */
    private static final int SSL_PORT = 636;
    
    /**
     * Utility class, do not call.
     */
    private ConnectorLdapUtil() {
    }
    
    /**
     * Build LDAP Search Controls.
     *
     * @param connector the configuration of an LDAP connector.
     * @return ldap name.
     * @throws ConfigurationException if the generated name is invalid.
     */
    public static LdapName buildLdapName(final ConnectorConfig connector)
            throws ConfigurationException {
        try {
            return new LdapName("");
        } catch (final InvalidNameException e) {
            throw new ConfigurationException("Improperly formatted name: \"\"", e);
        }
    }
    
    /**
     * Build LDAP Search Controls.
     *
     * @param connector the configuration of an LDAP connector.
     * @return controls for managing LDAP queries.
     */
    public static SearchControls buildSearchControls(final ConnectorConfig connector) {
        final SearchControls searchControls = new SearchControls();
        searchControls.setSearchScope(SearchControls.SUBTREE_SCOPE);
        if (connector.getType() == ConnectorType.LDAP) {
            final List<ConnectorFieldConfig> connectorFields = connector.getConnectorFields();
            final String[] ldapFields = new String[connectorFields.size()];
            int fieldIndex = 0;
            for (final ConnectorFieldConfig connectorField : connectorFields) {
                ldapFields[fieldIndex] = connectorField.getForeignFieldPath();
                fieldIndex++;
            }
            searchControls.setReturningAttributes(ldapFields);
        }
        return searchControls;
    }
    
    /**
     * Build LDAP context.
     *
     * @param connector the configuration of an LDAP connector.
     * @return context for use in creating an InitialDirContext
     */
    public static Map<LdapContextAttribute, Object> buildContext(final ConnectorConfig connector) {
        final JSONObject parameters = connector.getConnParams();
        final String securityAuthentication = parameters.optString(SEC_AUTH_CONN_PARAM, "");
        final String securityProtocol =
                parameters.optString(SEC_PROTOCOL_CONN_PARAM, SEC_PROTOCOL_NONE).toLowerCase();
        final String referral = parameters.optString(REFERRAL_CONN_PARAM, "follow");
        
        final boolean isSslProtocol =
                securityProtocol.equals(SEC_PROTOCOL_SSL)
                        || securityProtocol.equals(SEC_PROTOCOL_TLS)
                        || securityProtocol.equals(SEC_PROTOCOL_STARTTLS);
        if (isSslProtocol && parameters.optBoolean(INSTALL_CERT_CONN_PARAM, false)) {
            installCertificate(parameters, securityProtocol);
        }
        
        final String url = connector.getConnString().split("\\|")[0];
        
        final Map<LdapContextAttribute, Object> context =
                buildContext(url, securityAuthentication, securityProtocol, referral,
                    connector.getConnUser(), connector.getConnPassword());
        return context;
    }
    
    /**
     * @param connector the configuration of an LDAP connector.
     * @return whether the connector should use STARTTLS.
     */
    public static boolean useStartTls(final ConnectorConfig connector) {
        final JSONObject parameters = connector.getConnParams();
        // starttls
        return parameters != null && parameters.has(SEC_PROTOCOL_CONN_PARAM)
                && SEC_PROTOCOL_STARTTLS.equals(parameters.getString(SEC_PROTOCOL_CONN_PARAM));
    }

    /**
     * @param connector the configuration of an LDAP connector.
     * @return whether the connector should use TLS exclusively.
     */
    public static boolean useTlsOnly(final ConnectorConfig connector) {
        final JSONObject parameters = connector.getConnParams();
        // tls or starttls
        return parameters != null
                && parameters.has(SEC_PROTOCOL_CONN_PARAM)
                && (SEC_PROTOCOL_STARTTLS.equals(parameters.getString(SEC_PROTOCOL_CONN_PARAM)) || SEC_PROTOCOL_TLS
                    .equals(parameters.getString(SEC_PROTOCOL_CONN_PARAM)));
    }
    
    /**
     * Build LDAP context.
     *
     * @param url LDAP server/query URL
     * @param securityAuthentication e.g. EXTERNAL
     * @param securityProtocol e.g. ssl
     * @param referral e.g. follow
     * @param user user name for connection to the server.
     * @param encodedPassword encoded password for connecting to the server.
     * @return context for use in creating an InitialDirContext
     */
    private static Map<LdapContextAttribute, Object> buildContext(final String url,
            final String securityAuthentication, final String securityProtocol,
            final String referral, final String user, final String encodedPassword) {
        final Map<LdapContextAttribute, Object> context =
                new HashMap<LdapContextAttribute, Object>();

        context.put(INITIAL_CONTEXT_FACTORY, "com.sun.jndi.ldap.LdapCtxFactory");
        context.put(PROVIDER_URL, url);
        if (referral.length() > 0) {
            context.put(REFERRAL, referral);
        }

        if (!SEC_AUTH_EXTERNAL.equalsIgnoreCase(securityAuthentication)) {
            if (StringUtil.isNullOrEmpty(user) || StringUtil.isNullOrEmpty(encodedPassword)) {
                throw new ConfigurationException(
                    "External Authentication requires username and password", null);
            }
            context.put(SECURITY_PRINCIPAL, user);
            context.put(SECURITY_CREDENTIALS,
                ConnectorObfuscationUtil.decodeParameter(encodedPassword));
        }
        if (securityAuthentication.length() > 0) {
            context.put(SECURITY_AUTHENTICATION, securityAuthentication);
        }
        
        configureLdapSecurityProtocol(context, url, securityProtocol);

        return context;
    }
    
    /**
     * Configure the given LDAP context to use the specified protocol.
     *
     * @param context to configure
     * @param url for the LDAP server
     * @param securityProtocol specified protocol
     */
    private static void configureLdapSecurityProtocol(
            final Map<LdapContextAttribute, Object> context, final String url,
            final String securityProtocol) {
        String protocol = null;
        if (SEC_PROTOCOL_STARTTLS.equalsIgnoreCase(securityProtocol)) {
            protocol = SEC_PROTOCOL_NONE;
        } else if (SEC_PROTOCOL_TLS.equalsIgnoreCase(securityProtocol)) {
            protocol = SEC_PROTOCOL_SSL;
        } else if (url.contains(":" + SSL_PORT)
                || SEC_PROTOCOL_SSL.equalsIgnoreCase(securityProtocol)) {
            protocol = SEC_PROTOCOL_SSL;
        }
        if (protocol != null) {
            context.put(SECURITY_PROTOCOL, protocol);
            /*
             * TODO if tls or starttls, set socket factory to disable ssl3
             */
        }
    }
    
    /**
     * Install a certificate from a server in the java keystore.
     *
     * @param parameters parameters form the connector configuration.
     * @param protocol the protocol to use to retrieve the certificate.
     * @throws ConfigurationException if the certificate cannot be retrieved.
     */
    private static void installCertificate(final JSONObject parameters, final String protocol)
            throws ConfigurationException {
        String host = "";
        int port = SSL_PORT;
        String javaPath = "";
        String keyStorePassPhrase = "changeit";
        
        if (parameters.has(LDAP_HOST_CONN_PARAM)) {
            host = parameters.getString(LDAP_HOST_CONN_PARAM);
        }
        if (parameters.has(LDAP_PORT_CONN_PARAM)) {
            port = parameters.getInt(LDAP_PORT_CONN_PARAM);
        }
        if (parameters.has(JAVA_PATH_CONN_PARAM)) {
            javaPath = parameters.getString(JAVA_PATH_CONN_PARAM);
        }
        if (parameters.has(KEYSTORE_PASSPHRASE_CONN_PARAM)) {
            keyStorePassPhrase = parameters.getString(KEYSTORE_PASSPHRASE_CONN_PARAM);
        }
        
        ICertificateRetriever retriever;
        if (SEC_PROTOCOL_SSL.equals(protocol)) {
            retriever = new SSLCertificateRetriever(host, port);
        } else if (SEC_PROTOCOL_TLS.equals(protocol)) {
            retriever = new TLSCertificateRetriever(host, port);
        } else if (SEC_PROTOCOL_STARTTLS.equals(protocol)) {
            retriever = new LdapCertificateRetriever(host, port);
        } else {
            throw new ConfigurationException("Invalid securityProtocol: " + protocol, null);
        }
        CertificateInstaller.installCertificate(keyStorePassPhrase, javaPath, retriever, host
                + "-1");
    }
}
