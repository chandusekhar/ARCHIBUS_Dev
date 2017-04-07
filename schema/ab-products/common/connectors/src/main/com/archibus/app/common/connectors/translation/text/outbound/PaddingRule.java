package com.archibus.app.common.connectors.translation.text.outbound;

/**
 * A rule for padding or truncating a field.
 */
public class PaddingRule {
    /**
     * The character to pad with.
     */
    private final char paddingChar;
    
    /**
     * The length to pad/truncate to.
     */
    private final int exactLength;
    
    /**
     * Which side to pad.
     */
    private final boolean padLeft;
    
    /**
     * @param paddingChar the character to pad with.
     * @param exactLength the length to pad/truncate to.
     * @param padLeft which side to pad.
     */
    public PaddingRule(final char paddingChar, final int exactLength, final boolean padLeft) {
        this.paddingChar = paddingChar;
        this.exactLength = exactLength;
        this.padLeft = padLeft;
    }
    
    /**
     * @return the character to pad with.
     */
    public char getPaddingChar() {
        return this.paddingChar;
    }
    
    /**
     * @return the length to pad to.
     */
    public int getExactLength() {
        return this.exactLength;
    }
    
    /**
     * @return which side to pad.
     */
    public boolean isPadLeft() {
        return this.padLeft;
    }
}