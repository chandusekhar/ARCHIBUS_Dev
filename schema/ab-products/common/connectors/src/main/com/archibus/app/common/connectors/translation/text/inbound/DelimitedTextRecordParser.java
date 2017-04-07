package com.archibus.app.common.connectors.translation.text.inbound;

import java.io.*;
import java.nio.charset.Charset;
import java.util.*;

import com.archibus.app.common.connectors.exception.StepException;
import com.archibus.app.common.connectors.transfer.exception.AdaptorException;
import com.archibus.app.common.connectors.translation.common.inbound.IRecordHandler;
import com.archibus.app.common.connectors.translation.exception.TranslationException;
import com.archibus.app.common.connectors.translation.text.*;

/**
 * A parser for an input stream that is expected to produce delimited text.
 *
 * @author cole
 *
 */
public class DelimitedTextRecordParser extends AbstractTextParser {
    /**
     * Whether to ignore an empty record at the end of the file (caused by a record terminator as
     * opposed to a record delimiter).
     */
    private final boolean ignoreLastRecordIfEmpty;
    
    /**
     * Create a parser for an input stream that is expected to produce delimited text. Parameters
     * will be searched for exclusively, so if one is a prefix of another the former will exclude
     * the latter from being found. The two exceptions are end quotes and the unescaped escape
     * sequence.
     *
     * @param charSequences sequences of characters (such as delimiters, quotations, escape
     *            characters) to interpret while parsing the stream.
     * @param characterEncoding the encoding for characters from a text stream.
     * @param ignoreLastRecordIfEmpty if true, and there is a trailing record delimiter, the record
     *            following it will be ignored.
     */
    public DelimitedTextRecordParser(final List<CharSequenceSet> charSequences,
            final Charset characterEncoding, final boolean ignoreLastRecordIfEmpty) {
        super(charSequences, characterEncoding);
        this.ignoreLastRecordIfEmpty = ignoreLastRecordIfEmpty;
    }
    
    /**
     * Parses a character stream into records and fields separated by a delimiters (e.g. '\r\n' or
     * ',') . This also supports an escaped version of the delimiters (e.g. '\\\r\n' or '\,') that
     * should be interpreted as the literal delimiter, and an escaped version of the escape syntax
     * (e.g. '\\\\') that should be interpreted as the literal escape character. The end of the
     * stream is implicitly interpreted as a record delimiter with no succeeding record.
     *
     * Characters will be matched from the beginning of the stream with the following precedence:
     * <ol>
     * <li>
     * Escaped escape character
     * <li>
     * Escaped record or field delimiter
     * <li>
     * Field or record delimiter
     * </ol>
     *
     * @param stream the character stream to be parsed.
     * @param handler the operation to be performed on records after they are parsed.
     * @throws StepException AdaptorException when an error occurs while attempting to read the
     *             stream, or a TranslationException for unbalanced quotes.
     */
    @Override
    public void parse(final InputStream stream, final IRecordHandler<List<String>, ?> handler)
            throws StepException {
        AdaptorException adaptorException = null;
        try {
            final ParsingContext context = new ParsingContext();
            parseStream(stream, handler, context);
            if (context.isInQuotedSection()) {
                throw new TranslationException("Unbalanced quotes", null);
            }
        } catch (final AdaptorException e) {
            adaptorException = new AdaptorException("Unable to continue reading stream.", e);
        } finally {
            /*
             * Note: this will happen even if the catch block throws it's exception.
             */
            try {
                stream.close();
            } catch (final IOException e) {
                if (adaptorException != null) {
                    adaptorException = new AdaptorException("Unable to close stream.", e);
                }
            }
        }
        if (adaptorException != null) {
            throw adaptorException;
        }
    }
    
    /**
     * Essentially this is parseRecords, except it throws an IOException instead of an
     * AdaptorException and doesn't close the stream. parseRecords is primarily responsible for
     * managing the exceptions and closing the stream.
     *
     * @param stream the character stream to be parsed.
     * @param handler the operation to be performed on records after they are parsed.
     * @param context the state of parsing, may change during execution.
     * @throws StepException when an error occurs from InputStream.read()
     */
    private void parseStream(final InputStream stream,
            final IRecordHandler<List<String>, ?> handler, final ParsingContext context)
            throws StepException {
        /*
         * Create finders and find a record delimiter.
         */
        final List<CharSequenceFinder> finders = createFinders();

        final InputStreamReader reader = getReader(stream);
        
        int code = readChar(reader);
        while (code != -1) {
            final char character = (char) code;
            /*
             * Append the character.
             */
            context.getCurrentField().append(character);
            /*
             * Update how much of delimiter and escapes were matched.
             */
            for (final CharSequenceFinder finder : finders) {
                finder.update(character);
            }
            /*
             * If any were matched, handle them.
             */
            handleControlSequences(context, finders, handler);
            code = readChar(reader);
        }
        if (!(this.ignoreLastRecordIfEmpty && context.getCurrentRecord().isEmpty())) {
            /*
             * Treat the end of a file as an empty record delimiter.
             */
            handleUnquotedSequence(context, handler, new CharSequenceSet(
                CharSequenceFunction.RECORD_DELIMITER, "", ""), false);
        }
    }
    
    /**
     * Process any control sequences that were just parsed.
     *
     * @param context the state of parsing, may change during execution.
     * @param finders control sequence finders.
     * @param handler the operation to be performed on records after they are parsed.
     * @throws StepException if there is an error handling a parsed record.
     */
    private void handleControlSequences(final ParsingContext context,
            final List<CharSequenceFinder> finders, final IRecordHandler<List<String>, ?> handler)
            throws StepException {
        boolean handled = false;
        for (final CharSequenceFinder finder : finders) {
            if (finder.isMatched() || finder.isEscaped()) {
                if (context.isInQuotedSection()) {
                    handled =
                            handleQuotedSequence(context, finder.getSearchSet(), finder.isEscaped());
                } else {
                    handled =
                            handleUnquotedSequence(context, handler, finder.getSearchSet(),
                                finder.isEscaped());
                }
                if (handled) {
                    resetFinders(context, finders);
                    break;
                }
            }
        }
    }
    
    /**
     * Reset the finders to start looking for control sequences from the beginning (except close
     * quote, in case it is escaped by itself).
     *
     * @param context the state of parsing, may change during execution.
     * @param finders control sequence finders.
     */
    private void resetFinders(final ParsingContext context, final List<CharSequenceFinder> finders) {
        if (context.isInQuotedSection()) {
            super.resetFinders(finders);
        } else {
            for (final CharSequenceFinder finderToReset : finders) {
                if (finderToReset.getSearchSet().getFunction() != CharSequenceFunction.CLOSE_QUOTE) {
                    finderToReset.reset();
                }
            }
        }
        
    }
    
    /**
     * Perform any required operations when a literal character sequence is found.
     *
     * @param context current state of parsing, including current record and field.
     * @param searchSet sequences of characters matched.
     * @param escaped whether the sequence found was escaped.
     * @return whether the sequence was recognized in this context
     */
    private boolean handleQuotedSequence(final ParsingContext context,
            final CharSequenceSet searchSet, final boolean escaped) {
        boolean handled = true;
        final StringBuilder field = context.getCurrentField();
        switch (searchSet.getFunction()) {
            case ESCAPE_INSIDE_QUOTE:
                if (escaped) {
                    removeSequence(field, searchSet.getEscaped());
                    field.append(searchSet.getUnescaped());
                }
                break;
            case CLOSE_QUOTE:
                if (escaped) {
                    removeSequence(field, searchSet.getEscaped());
                    field.append(searchSet.getUnescaped());
                } else {
                    removeSequence(field, searchSet.getUnescaped());
                    context.setInQuotedSection(false);
                }
                break;
            default:
                handled = false;
                break;
        }
        return handled;
    }
    
    /**
     * Perform any required operations when a controlled character sequence is found.
     *
     * @param context current state of parsing, including current record and field.
     * @param handler handler, to be called should a record be completed
     * @param searchSet sequences of characters matched.
     * @param escaped whether the sequence found was escaped.
     * @return whether the sequence was recognized in this context
     * @throws StepException if the handler is unable to handle the transaction.
     */
    private boolean handleUnquotedSequence(final ParsingContext context,
            final IRecordHandler<List<String>, ?> handler, final CharSequenceSet searchSet,
            final boolean escaped) throws StepException {
        boolean handled = true;
        final StringBuilder field = context.getCurrentField();
        final List<String> record = context.getCurrentRecord();
        if (escaped) {
            if (searchSet.getFunction() == CharSequenceFunction.CLOSE_QUOTE) {
                /*
                 * escaped closed quote, where closed quote is beginning of escaped closed quote.
                 */
                field.setLength(field.length() - searchSet.getEscaped().length()
                        + searchSet.getUnescaped().length());
                field.append(searchSet.getUnescaped());
                context.setInQuotedSection(true);
            } else {
                removeSequence(field, searchSet.getEscaped());
                field.append(searchSet.getUnescaped());
            }
        } else {
            switch (searchSet.getFunction()) {
                case OPEN_QUOTE:
                    removeSequence(field, searchSet.getUnescaped());
                    context.setInQuotedSection(true);
                    break;
                case FIELD_DELIMITER:
                case RECORD_DELIMITER:
                    removeSequence(field, searchSet.getUnescaped());
                    /*
                     * interpret the delimiter as a the end of a field.
                     */
                    record.add(field.toString());
                    /*
                     * reset the field.
                     * 
                     * Note: the underlying StringBuilder's array would need to be reallocated if a
                     * new one were created, and fields are likely to be similar length so this is
                     * an optimization.
                     */
                    field.setLength(0);
                    if (searchSet.getFunction() == CharSequenceFunction.RECORD_DELIMITER) {
                        /*
                         * interpret the delimiter as the end of a record.
                         */
                        handler.handleRecord(new ArrayList<String>(record));
                        /*
                         * reset the record.
                         * 
                         * Note: consecutive records usually have a similar number of fields, so
                         * this should be fast.
                         */
                        record.clear();
                    }
                    break;
                default:
                    handled = false;
                    break;
            }
        }
        return handled;
    }
    
    /**
     * Remove a sequence of characters from the end of a field.
     *
     * @param field field from which to remove characters.
     * @param sequence sequence to be removed from the field.
     */
    private void removeSequence(final StringBuilder field, final CharSequence sequence) {
        field.setLength(field.length() - sequence.length());
    }
}
