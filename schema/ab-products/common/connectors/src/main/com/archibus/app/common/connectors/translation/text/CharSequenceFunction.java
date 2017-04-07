package com.archibus.app.common.connectors.translation.text;

/**
 * Character sequences the DelimitedTextRecordParser may search for in precedence order (first is
 * highest).
 *
 * @author cole
 *
 */
public enum CharSequenceFunction {
    /**
     * A character sequence that should be interpreted as the end of a literal section.
     */
    CLOSE_QUOTE,
    /**
     * A character sequence that should be interpreted as the beginning of a literal section.
     */
    OPEN_QUOTE,
    /**
     * A character sequence that should be interpreted as a field delimiter, indicating the end of
     * the current field's value.
     */
    FIELD_DELIMITER,
    /**
     * A character sequence that should be interpreted as a record delimiter, indicating the end of
     * the current record's value.
     */
    RECORD_DELIMITER,
    /**
     * An escape sequence in a literal section.
     */
    ESCAPE_INSIDE_QUOTE,
    /**
     * An escape sequence outside a literal section.
     */
    ESCAPE_OUTSIDE_QUOTE
}