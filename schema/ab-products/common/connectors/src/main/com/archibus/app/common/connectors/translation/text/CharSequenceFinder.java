package com.archibus.app.common.connectors.translation.text;

/*
 * TODO a character driven search tree would be more efficient than a set of finders.
 */
/**
 * A class used for tracking how much of a target character sequence has been found in text.
 * 
 * @author cole
 * 
 */
public class CharSequenceFinder {
    /**
     * A string being searched for.
     */
    private final CharSequenceSet searchSet;
    
    /**
     * How much of that string has currently been found.
     */
    private int matchedCount;
    
    /**
     * How much of that escaped string has currently been found.
     */
    private int escapedMatchedCount;
    
    /**
     * Start tracking how much of this string has been found.
     * 
     * @param searchSet the character sequence to be searched for and it's escaped counterpart.
     */
    public CharSequenceFinder(final CharSequenceSet searchSet) {
        this.searchSet = searchSet;
        this.matchedCount = 0;
        this.escapedMatchedCount = 0;
    }
    
    /**
     * Update the state depending on whether the character matches the next expected character or
     * not.
     * 
     * @param character the next character found in the text.
     */
    public void update(final char character) {
        final CharSequence escaped = this.searchSet.getEscaped();
        if (escaped != null && this.escapedMatchedCount < escaped.length()
                && character == escaped.charAt(this.escapedMatchedCount)) {
            this.escapedMatchedCount++;
        } else {
            this.escapedMatchedCount = 0;
        }
        final CharSequence unescaped = this.searchSet.getUnescaped();
        if (unescaped != null && this.matchedCount < unescaped.length()
                && character == unescaped.charAt(this.matchedCount)) {
            this.matchedCount++;
        } else {
            this.matchedCount = 0;
        }
    }
    
    /**
     * Start searching again from the first character.
     */
    public void reset() {
        this.matchedCount = 0;
        this.escapedMatchedCount = 0;
    }
    
    /**
     * @return true if and only if the entire unescaped string has been matched as of the last
     *         character update with the last character.
     */
    public boolean isMatched() {
        return this.matchedCount == this.searchSet.getUnescaped().length();
    }
    
    /**
     * @return true if and only if the entire escaped string has been matched as of the last
     *         character update with the last character.
     */
    public boolean isEscaped() {
        return this.searchSet.getEscaped() != null
                && this.escapedMatchedCount == this.searchSet.getEscaped().length();
    }
    
    /**
     * @return the sequences being searched for.
     */
    public CharSequenceSet getSearchSet() {
        return this.searchSet;
    }
}