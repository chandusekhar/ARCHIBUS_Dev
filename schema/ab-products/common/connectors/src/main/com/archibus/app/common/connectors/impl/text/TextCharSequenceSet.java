package com.archibus.app.common.connectors.impl.text;

import static com.archibus.app.common.connectors.translation.text.CharSequenceFunction.*;

import java.util.ArrayList;

import org.json.JSONObject;

import com.archibus.app.common.connectors.domain.*;
import com.archibus.app.common.connectors.domain.ConnectorTypes.TextQualifier;
import com.archibus.app.common.connectors.translation.text.CharSequenceSet;

/**
 * Control sequences supported by the afm_connector table and specified by the connector.
 *
 * @author cole
 *
 */
public class TextCharSequenceSet extends ArrayList<CharSequenceSet> {
    /**
     * A required serialVersionUID for identifying what version of this class was serialized.
     */
    private static final long serialVersionUID = -5752588453876255678L;

    /**
     * A parameter for a custom text qualifier.
     */
    private static final String CUSTOM_TEXT_QUALIFIER_PARAM = "overrideTextQualifier";

    /**
     * A parameter for a custom record delimiter.
     */
    private static final String CUSTOM_RECORD_DELIMITER_PARAM = "overrideRecordDelimiter";

    /**
     * A parameter for a custom delimiter.
     */
    private static final String CUSTOM_DELIMITER_PARAM = "overrideDelimiter";

    /**
     * Control sequences supported by the afm_connector table and specified by the connector.
     *
     * @param connector an import connector loaded from the afm_connector table whose type is TEXT.
     */
    public TextCharSequenceSet(final ConnectorConfig connector) {
        super();
        final JSONObject parameters = connector.getConnParams();
        final String textQualifier =
                parameters.optString(CUSTOM_TEXT_QUALIFIER_PARAM,
                    connector.getTextQualifier() == TextQualifier.NONE ? "\"" : connector
                        .getTextQualifier().getSequence());
        final String delimiter =
                parameters
                    .optString(CUSTOM_DELIMITER_PARAM, connector.getDelimeter().getSequence());
        add(new CharSequenceSet(FIELD_DELIMITER, null, delimiter));
        if (parameters.has(CUSTOM_RECORD_DELIMITER_PARAM)) {
            add(new CharSequenceSet(RECORD_DELIMITER, null,
                parameters.getString(CUSTOM_RECORD_DELIMITER_PARAM)));
        } else {
            add(new CharSequenceSet(RECORD_DELIMITER, null, "\r\n"));
            add(new CharSequenceSet(RECORD_DELIMITER, null, "\n"));
        }
        if (textQualifier != null) {
            final String escapedTextQualifier = textQualifier + textQualifier;
            add(new CharSequenceSet(OPEN_QUOTE, null, textQualifier));
            add(new CharSequenceSet(CLOSE_QUOTE, escapedTextQualifier, textQualifier));
            add(new CharSequenceSet(ESCAPE_INSIDE_QUOTE, escapedTextQualifier, textQualifier));
        }
    }
}
