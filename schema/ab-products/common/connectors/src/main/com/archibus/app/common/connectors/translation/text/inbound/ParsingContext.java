package com.archibus.app.common.connectors.translation.text.inbound;

import java.util.*;

/**
 * The current state of parsed characters.
 * 
 * @author cole
 */
public class ParsingContext {
    /**
     * The current record being built.
     */
    private final List<String> currentRecord;
    
    /**
     * The current field being built.
     */
    private final StringBuilder currentField;
    
    /**
     * Whether control characters (except end quote) are being interpreted literally.
     */
    private boolean inQuotedSection;
    
    /**
     * Create a context for parsing a stream.
     */
    public ParsingContext() {
        this.currentRecord = new ArrayList<String>();
        this.currentField = new StringBuilder();
        this.inQuotedSection = false;
    }
    
    /**
     * @return whether characters from the stream (except close or escaped close quote) should be
     *         interpreted literally.
     */
    public boolean isInQuotedSection() {
        return this.inQuotedSection;
    }
    
    /**
     * @param inQuotedSection whether characters from the stream (except close or escaped close
     *            quote) should be interpreted literally.
     */
    public void setInQuotedSection(final boolean inQuotedSection) {
        this.inQuotedSection = inQuotedSection;
    }
    
    /**
     * @return the current record being read.
     */
    public List<String> getCurrentRecord() {
        return this.currentRecord;
    }
    
    /**
     * @return the current field being read.
     */
    public StringBuilder getCurrentField() {
        return this.currentField;
    }
}