package com.archibus.app.sysadmin.updatewizard.script.parser;

import static com.archibus.app.common.connectors.translation.text.CharSequenceFunction.RECORD_DELIMITER;

import java.util.ArrayList;

import com.archibus.app.common.connectors.translation.text.CharSequenceSet;

/**
 * Control sequences supported by DUW file parser. *
 * <p>
 *
 * @author Catalin Purice
 * @since 22.1
 *
 */
public class ScriptFileCharSequenceSet extends ArrayList<CharSequenceSet> {
    /**
     * A required serialVersionUID for identifying what version of this class was serialized.
     */
    private static final long serialVersionUID = -5752588453876255678L;

    /**
     * Control sequences supported by DUW file.
     *
     */
    public ScriptFileCharSequenceSet() {
        super();
        add(new CharSequenceSet(RECORD_DELIMITER, null, "\r\n"));
        add(new CharSequenceSet(RECORD_DELIMITER, null, "\n"));
        add(new CharSequenceSet(RECORD_DELIMITER, null, ";\r\n"));
        add(new CharSequenceSet(RECORD_DELIMITER, null, ";\n"));
    }
}
