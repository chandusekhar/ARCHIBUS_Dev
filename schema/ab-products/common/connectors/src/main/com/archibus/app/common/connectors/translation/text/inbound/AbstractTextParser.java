package com.archibus.app.common.connectors.translation.text.inbound;

import java.io.*;
import java.nio.charset.Charset;
import java.util.*;

import com.archibus.app.common.connectors.transfer.exception.AdaptorException;
import com.archibus.app.common.connectors.translation.common.inbound.IRecordParser;
import com.archibus.app.common.connectors.translation.text.*;

/**
 * A parser for text data.
 *
 * @author cole
 *
 */
public abstract class AbstractTextParser implements IRecordParser<InputStream, List<String>> {
    /**
     * Control sequences.
     */
    private final List<CharSequenceSet> charSequences;

    /**
     * The encoding of characters in the text stream.
     */
    private final Charset characterEncoding;

    /**
     * @param charSequences control sequences in the text.
     * @param characterEncoding the encoding of characters in the text stream.
     */
    public AbstractTextParser(final List<CharSequenceSet> charSequences,
            final Charset characterEncoding) {
        this.charSequences = charSequences;
        Collections.sort(this.charSequences, new CharSequenceComparator(this.charSequences));
        this.characterEncoding = characterEncoding;
    }

    /**
     * @return finders for the character sequences that are non-empty.
     */
    protected List<CharSequenceFinder> createFinders() {
        final List<CharSequenceFinder> finders =
                new ArrayList<CharSequenceFinder>(this.charSequences.size());
        for (final CharSequenceSet charSequenceSet : this.charSequences) {
            if (charSequenceSet.getUnescaped().length() > 0) {
                finders.add(new CharSequenceFinder(charSequenceSet));
            }
        }
        return finders;
    }

    /**
     * Read a character from a stream and convert any IOException to an AdaptorException.
     *
     * @param reader the reader to read the character from.
     * @return the character.
     * @throws AdaptorException if an IOException was thrown.
     */
    protected static int readChar(final InputStreamReader reader) throws AdaptorException {
        try {
            return reader.read();
        } catch (final IOException e) {
            throw new AdaptorException("Error reading from delimited text stream.", e);
        }
    }

    /**
     * Reset the state of finders to start searching from the beginning of the string.
     *
     * @param finders character sequence finders to reset.
     */
    protected static void resetFinders(final Collection<CharSequenceFinder> finders) {
        for (final CharSequenceFinder finderToReset : finders) {
            finderToReset.reset();
        }
    }

    /**
     * @param stream the input stream to read from.
     * @return a reader for the stream for the specified character encoding.
     */
    protected InputStreamReader getReader(final InputStream stream) {
        return new InputStreamReader(stream, this.characterEncoding);
    }
}
