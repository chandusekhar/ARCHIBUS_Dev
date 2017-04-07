package com.archibus.app.common.connectors.translation.text.inbound;

import java.io.*;
import java.nio.charset.Charset;
import java.util.*;

import com.archibus.app.common.connectors.exception.StepException;
import com.archibus.app.common.connectors.transfer.exception.AdaptorException;
import com.archibus.app.common.connectors.translation.common.inbound.IRecordHandler;
import com.archibus.app.common.connectors.translation.text.*;

/**
 * A parser for fixed width fields.
 *
 * @author cole
 *
 */
public class FixedWidthTextParser extends AbstractTextParser {
    /**
     * Width of fields, in order.
     */
    private final List<Integer> fieldWidths;

    /**
     * @param fieldWidths width of fields, in order.
     * @param charSequences record delimiter character sequences.
     * @param characterEncoding the encoding of characters in the text stream.
     */
    public FixedWidthTextParser(final List<Integer> fieldWidths,
            final List<CharSequenceSet> charSequences, final Charset characterEncoding) {
        super(filterRecordDelimiters(charSequences), characterEncoding);
        this.fieldWidths = fieldWidths;
    }

    /**
     * @param originalCharSequences control sequences.
     * @return only record delimiter control sequences.
     */
    private static List<CharSequenceSet> filterRecordDelimiters(
            final List<CharSequenceSet> originalCharSequences) {
        final List<CharSequenceSet> charSequences = new ArrayList<CharSequenceSet>();
        for (final CharSequenceSet charSequence : originalCharSequences) {
            if (charSequence.getFunction() == CharSequenceFunction.RECORD_DELIMITER) {
                charSequences.add(charSequence);
            }
        }
        return charSequences;
    }

    /**
     * Parse a list of field from a stream based on their width.
     *
     * @param stream the data to be parsed.
     * @param handler the handler for parsed records.
     * @throws StepException if the handler can't handle a record.
     */
    @Override
    public void parse(final InputStream stream, final IRecordHandler<List<String>, ?> handler)
            throws StepException {
        final List<CharSequenceFinder> finders = createFinders();
        final InputStreamReader reader = getReader(stream);
        int code = readChar(reader);
        int fieldPosition = 0;
        int charactersWritten = 0;
        int fieldWidth = this.fieldWidths.get(0);
        List<String> record = new ArrayList<String>();
        final StringBuilder fieldBuilder = new StringBuilder();
        while (code != -1) {
            fieldBuilder.append((char) code);
            charactersWritten++;
            if (fieldWidth == charactersWritten) {
                record.add(fieldBuilder.toString());
                fieldBuilder.setLength(0);
                charactersWritten = 0;
                fieldPosition++;
                if (fieldPosition >= this.fieldWidths.size()) {
                    stripRecordDelimiter(reader, finders);
                    fieldPosition = 0;
                    handler.handleRecord(record);
                    record = new ArrayList<String>();
                }
                fieldWidth = this.fieldWidths.get(fieldPosition);
            }
            code = readChar(reader);
        }
    }

    /**
     * @param reader to strip delimiters from.
     * @param finders for record delimiters.
     * @throws AdaptorException if there is an IOException reading the next character.
     */
    private void stripRecordDelimiter(final InputStreamReader reader,
            final List<CharSequenceFinder> finders) throws AdaptorException {
        if (!finders.isEmpty()) {
            resetFinders(finders);
            boolean finderMatched = false;
            int code = 0;
            while (!finderMatched && code != -1) {
                code = readChar(reader);
                for (final CharSequenceFinder finder : finders) {
                    finder.update((char) code);
                    if (finder.isMatched()) {
                        finderMatched = true;
                        break;
                    }
                }
            }
        }
    }
}
