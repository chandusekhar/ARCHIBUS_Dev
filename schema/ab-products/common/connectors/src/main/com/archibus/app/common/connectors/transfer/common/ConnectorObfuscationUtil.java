package com.archibus.app.common.connectors.transfer.common;

import org.jasypt.encryption.pbe.*;

import com.archibus.servletx.WebCentralConfigListener;

/**
 * A tool for obfuscating sensitive fields.
 *
 * @author cole
 *
 */
public final class ConnectorObfuscationUtil {
    /**
     * Prefix indicating the text is obfuscated.
     */
    private static final String PREFIX = "ENC(";

    /**
     * Prefix indicating the end of the obfuscated text.
     */
    private static final String SUFFIX = ")";

    /**
     * Do not construct.
     */
    private ConnectorObfuscationUtil() {

    }

    /**
     * @param parameter the text.
     * @return the obfuscated text.
     */
    public static String encodeParameter(final String parameter) {
        final PBEStringEncryptor stringEncryptor = new StandardPBEStringEncryptor();
        stringEncryptor.setPassword(WebCentralConfigListener.PASSWORD);
        String passwordEncrypted = parameter;

        if (!parameter.startsWith(PREFIX)) {
            passwordEncrypted = stringEncryptor.encrypt(parameter);
            passwordEncrypted = String.format(PREFIX + "%s" + SUFFIX, passwordEncrypted);
        }
        return passwordEncrypted;
    }

    /**
     * @param parameter the obfuscated text.
     * @return the unobfuscated text.
     */
    public static String decodeParameter(final String parameter) {
        final PBEStringEncryptor stringEncryptor = new StandardPBEStringEncryptor();
        stringEncryptor.setPassword(WebCentralConfigListener.PASSWORD);
        String passwordEncrypted = parameter;

        if (parameter != null && parameter.startsWith(PREFIX)) {
            passwordEncrypted =
                    stringEncryptor.decrypt(parameter.substring(PREFIX.length(), parameter.length()
                            - SUFFIX.length()));
        }
        return passwordEncrypted;
    }
}
