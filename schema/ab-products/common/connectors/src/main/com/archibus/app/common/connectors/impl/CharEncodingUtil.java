package com.archibus.app.common.connectors.impl;

import java.nio.charset.Charset;

import com.archibus.app.common.connectors.domain.ConnectorConfig;

/**
 * Utility class. Provides methods to manage character encoding in the connectors.impl package.
 *
 * @author cole
 * @since 21.4
 *
 */
public final class CharEncodingUtil {
    /**
     * The connector parameter for the character set to use for decoding strings.
     */
    private static final String CHAR_SET_CONN_PARAM = "CharacterEncoding";

    /**
     * Utility class, do not call.
     */
    private CharEncodingUtil() {
    }
    
    /**
     * @param connector the afm_connector record to use as configuration.
     * @return the character set to use to decode strings.
     */
    public static Charset getCharacterEncoding(final ConnectorConfig connector) {
        Charset characterEncoding;
        if (connector.getConnParams().has(CHAR_SET_CONN_PARAM)) {
            characterEncoding =
                    Charset.forName(connector.getConnParams().getString(CHAR_SET_CONN_PARAM));
        } else {
            characterEncoding = Charset.defaultCharset();
        }
        return characterEncoding;
    }
}
