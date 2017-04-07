package com.archibus.app.common.connectors.translation.text.outbound;

/**
 * A strategy for quoting text in a delimited text file.
 * 
 * @author cole
 * 
 */
public enum QuotationStrategy {
    /**
     * Surround every field with quotation marks.
     */
    ALL,
    /**
     * Do not quote fields. Escape characters must be provided if they can occur. If not an
     * exception will be thrown.
     */
    NONE,
    /**
     * Quote only when necessary due to the absence of escape characters. This is the slowest
     * approach, and still requires the close quote and escape sequence to have an escape sequence
     * if they can occur.
     */
    AS_NEEDED,
    /**
     * Quote always when values provided are strings, and as needed otherwise.
     */
    STRINGS
}
