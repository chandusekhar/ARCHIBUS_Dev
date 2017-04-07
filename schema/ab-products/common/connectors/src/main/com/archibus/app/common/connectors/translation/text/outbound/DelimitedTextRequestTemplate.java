package com.archibus.app.common.connectors.translation.text.outbound;

import static com.archibus.app.common.connectors.translation.text.CharSequenceFunction.*;

import java.io.*;
import java.nio.charset.Charset;
import java.util.*;

import com.archibus.app.common.connectors.translation.common.outbound.impl.AbstractDataSourceRequestTemplate;
import com.archibus.app.common.connectors.translation.exception.TranslationException;
import com.archibus.app.common.connectors.translation.text.*;

/**
 * A template for generating a list of delimited text fields.
 *
 * @author cole
 *
 */
public class DelimitedTextRequestTemplate extends AbstractDataSourceRequestTemplate<InputStream> {

    /**
     * Whether a record has not yet been produced by this template. If it's the first record it
     * doesn't require a record delimiter.
     */
    private boolean isFirstRecord = true;

    /**
     * The fields in the order in which they should appear in the record.
     */
    private final List<DelimitedTextField> fields;

    /**
     * The character sequences field delimiter and optionally quotation marks.
     */
    private final List<CharSequenceSet> charSequences;

    /**
     * A map of the character sequences in the charSequences list, by function.
     */
    private final Map<CharSequenceFunction, CharSequenceSet> charSequenceMap;

    /**
     * When the template should decide to use quotation marks versus escaped text.
     */
    private final QuotationStrategy quotationStrategy;

    /**
     * The encoding for characters in text streams.
     */
    private final Charset characterEncoding;

    /**
     * Create a template for generating a list of delimited text fields.
     *
     * @param dataSourceFieldName the field name referring to a DataSource object in template
     *            parameters.
     * @param fields fields in the order in which they should appear in the record.
     * @param charSequences the character sequences field delimiter and optionally quotation marks.
     * @param quotationStrategy when the template should decide to use quotation marks versus
     *            escaped text.
     * @param characterEncoding the encoding for characters in text streams.
     */
    public DelimitedTextRequestTemplate(final String dataSourceFieldName,
            final List<DelimitedTextField> fields, final List<CharSequenceSet> charSequences,
            final QuotationStrategy quotationStrategy, final Charset characterEncoding) {
        super(dataSourceFieldName);
        this.fields = fields;
        this.charSequences = new ArrayList<CharSequenceSet>(charSequences);
        this.quotationStrategy = quotationStrategy;
        this.characterEncoding = characterEncoding;

        /*
         * Sort and map the character sequences.
         */
        Collections.sort(this.charSequences, new CharSequenceComparator(this.charSequences));
        this.charSequenceMap =
                new EnumMap<CharSequenceFunction, CharSequenceSet>(CharSequenceFunction.class);
        for (final CharSequenceSet charSequence : this.charSequences) {
            /*
             * In case of duplicates, the first listed took precedence, so don't replace it.
             */
            if (!this.charSequenceMap.containsKey(charSequence.getFunction())) {
                this.charSequenceMap.put(charSequence.getFunction(), charSequence);
            }
        }
    }

    /**
     * Create a String representation of a delimited list of text fields. The FIELD_DELIMITER from
     * the charSequences will be used to delimit the fields. The quotationStrategy will be used to
     * determine which fields to escape versus quote.
     *
     * @param requestParameters a map of field names to values, where the values are Strings.
     * @return a String representation of a delimited list of text fields provided in
     *         requestParameters in the order named in fieldNameOrder.
     * @throws TranslationException if a control sequence needs to be escaped that has no specified
     *             escape sequence or if the character encoding is invalid (should not happen, due
     *             to use of character set).
     */
    @Override
    public InputStream generateRequest(final Map<String, Object> requestParameters)
            throws TranslationException {
        /*
         * Create finders and find a record delimiter.
         */
        final List<CharSequenceFinder> finders =
                new ArrayList<CharSequenceFinder>(this.charSequences.size());
        CharSequence openQuote = "";
        CharSequence closeQuote = "";
        for (final CharSequenceSet charSequenceSet : this.charSequences) {
            if (charSequenceSet.getUnescaped().length() > 0) {
                finders.add(new CharSequenceFinder(charSequenceSet));
                switch (charSequenceSet.getFunction()) {
                    case OPEN_QUOTE:
                        openQuote = charSequenceSet.getUnescaped();
                        break;
                    case CLOSE_QUOTE:
                        closeQuote = charSequenceSet.getUnescaped();
                        break;
                    default:
                        break;
                }
            }
        }

        final StringBuilder recordBuilder =
                buildRecord(requestParameters, openQuote, closeQuote, finders);

        /*
         * If this is the first record produced by this template, prepend a record delimiter.
         */
        if (this.isFirstRecord) {
            this.isFirstRecord = false;
        } else {
            recordBuilder.insert(0, this.charSequenceMap.get(RECORD_DELIMITER).getUnescaped());
        }
        try {
            return new ByteArrayInputStream(
                recordBuilder.toString().getBytes(this.characterEncoding.name()));
        } catch (final UnsupportedEncodingException e) {
            throw new TranslationException("Invalid character encoding used to encode string: "
                    + this.characterEncoding.name(),
                null);
        }
    }

    /**
     * Build a record from request parameters.
     *
     * @param requestParameters a map of field names to values, where the values are Strings.
     * @param openQuote open quote for quoted fields.
     * @param closeQuote closed quote for quoted fields.
     * @param finders the detectors for control fields.
     * @return the delimited record.
     */
    private StringBuilder buildRecord(final Map<String, Object> requestParameters,
            final Object openQuote, final Object closeQuote,
            final List<CharSequenceFinder> finders) {
        final StringBuilder recordBuilder = new StringBuilder();
        /*
         * Add a field delimiter and field value to the record for each field in the order
         * specified.
         */
        for (final DelimitedTextField field : this.fields) {
            recordBuilder.append(this.charSequenceMap.get(FIELD_DELIMITER).getUnescaped());
            /*
             * Escape and append the field.
             */
            final Object fieldObject = requestParameters.get(field.getFieldName());
            final String fieldValue = String.valueOf(fieldObject);
            final StringBuilder fieldBuilder = new StringBuilder();
            resetFinders(finders);
            final boolean fieldRequiresQuotes = this.quotationStrategy == QuotationStrategy.ALL
                    || (this.quotationStrategy == QuotationStrategy.STRINGS
                            && fieldObject instanceof String)
                    || escapeField(fieldValue, finders, fieldBuilder, false);
            if (fieldRequiresQuotes) {
                fieldBuilder.setLength(0);
                escapeField(fieldValue, finders, fieldBuilder, true);
            }
            if (field.getPaddingRule() != null) {
                /*
                 * Fixed width.
                 */
                applyPaddingRule(field.getPaddingRule(), fieldBuilder);
            }
            if (fieldRequiresQuotes) {
                fieldBuilder.insert(0, openQuote);
                fieldBuilder.append(closeQuote);
            }
            recordBuilder.append(fieldBuilder.toString());
        }
        /*
         * Delete the first field delimiter, if there are any fields.
         */
        if (recordBuilder.length() > 0) {
            recordBuilder.delete(0,
                this.charSequenceMap.get(FIELD_DELIMITER).getUnescaped().length());
        }
        return recordBuilder;
    }

    /**
     * Pad or truncate as necessary to a specified size.
     *
     * @param paddingRule how to pad and to what end.
     * @param fieldBuilder the field value being built.
     */
    private void applyPaddingRule(final PaddingRule paddingRule, final StringBuilder fieldBuilder) {
        /*
         * Pad
         */
        while (fieldBuilder.length() < paddingRule.getExactLength()) {
            if (paddingRule.isPadLeft()) {
                fieldBuilder.insert(0, paddingRule.getPaddingChar());
            } else {
                fieldBuilder.append(paddingRule.getPaddingChar());
            }
        }
        if (fieldBuilder.length() > paddingRule.getExactLength()) {
            /*
             * Truncate
             */
            fieldBuilder.delete(paddingRule.getExactLength(), fieldBuilder.length());
        }
    }

    /**
     * Escape a field's value.
     *
     * @param fieldValue the value of the field.
     * @param finders the detectors for control fields.
     * @param fieldBuilder the field in it's current state.
     * @param fieldQuoted whether the field will be quoted.
     * @return whether the field requires quotes.
     */
    private boolean escapeField(final String fieldValue, final List<CharSequenceFinder> finders,
            final StringBuilder fieldBuilder, final boolean fieldQuoted) {
        boolean fieldRequiresQuotes = fieldQuoted;
        for (int charIndex = 0; charIndex < fieldValue.length(); charIndex++) {
            final char character = fieldValue.charAt(charIndex);
            fieldBuilder.append(character);
            fieldRequiresQuotes =
                    escapeControlSequences(finders, character, fieldBuilder, fieldQuoted);
            if (fieldRequiresQuotes != fieldQuoted) {
                /*
                 * Abort.
                 */
                break;
            }
        }
        return fieldRequiresQuotes;
    }

    /**
     * Replace control sequences if it is found at the end of the field with an escaped version.
     *
     * @param finders the detectors for control fields.
     * @param character the last character added to the field.
     * @param fieldBuilder the field in it's current state, including the character.
     * @param wasInQuotes whether the template is writing quoted text before the call to this
     *            method.
     * @return whether the template is writing quoted text after the call to this method.
     * @throws TranslationException if a control sequence needs to be escaped that has no specified
     *             escape sequence.
     */
    private boolean escapeControlSequences(final List<CharSequenceFinder> finders,
            final char character, final StringBuilder fieldBuilder, final boolean wasInQuotes)
                    throws TranslationException {
        boolean inQuotes = wasInQuotes;
        for (final CharSequenceFinder finder : finders) {
            finder.update(character);
            if (finder.isMatched()) {
                boolean finderApplies = false;
                switch (finder.getSearchSet().getFunction()) {
                    case CLOSE_QUOTE:
                    case ESCAPE_INSIDE_QUOTE:
                        finderApplies = inQuotes;
                        break;
                    default:
                        finderApplies = inQuotes ^ true;
                        break;
                }
                if (finderApplies) {
                    inQuotes = escapeControlSequence(finder, fieldBuilder, inQuotes);
                    resetFinders(finders);
                    break;
                }
            }
        }
        return inQuotes;
    }

    /**
     * Replace control sequence if it is found at the end of the field with an escaped version.
     *
     * @param finder the detectors for then control field.
     * @param fieldBuilder the field in it's current state, including the character.
     * @param wasInQuotes whether the template is writing quoted text before the call to this
     *            method.
     * @return whether the template is writing quoted text after the call to this method.
     */
    private boolean escapeControlSequence(final CharSequenceFinder finder,
            final StringBuilder fieldBuilder, final boolean wasInQuotes) {
        boolean inQuotes = wasInQuotes;
        switch (this.quotationStrategy) {
            case ALL:
                escapeQuoted(finder.getSearchSet(), fieldBuilder);
                inQuotes = true;
                break;
            case NONE:
                if (inQuotes || !escapeUnquoted(finder.getSearchSet(), fieldBuilder)) {
                    throw new TranslationException(
                        "Control sequence was encountered, quotation was disabled and no escape sequence was provided for: "
                                + finder.getSearchSet().getUnescaped(),
                        null);
                }
                inQuotes = false;
                break;
            case AS_NEEDED:
            default:
                if (inQuotes || !escapeUnquoted(finder.getSearchSet(), fieldBuilder)) {
                    inQuotes = true;
                    escapeQuoted(finder.getSearchSet(), fieldBuilder);
                }
                break;
        }
        return inQuotes;
    }

    /**
     * Escape a control sequence that occurs in a field value that is not to be wrapped in quotation
     * marks.
     *
     * @param controlSequence the control sequence to be escaped.
     * @param fieldBuffer the field that has been escaped so far, with this control sequence at the
     *            end.
     * @return whether the field value was successfully escaped. it can fail if there is no escape
     *         sequence for the controlSequence.
     */
    private boolean escapeUnquoted(final CharSequenceSet controlSequence,
            final StringBuilder fieldBuffer) {
        boolean succeeded = false;
        if (controlSequence.getEscaped() != null) {
            final int controlLength = controlSequence.getUnescaped().length();
            fieldBuffer.replace(fieldBuffer.length() - controlLength, fieldBuffer.length(),
                controlSequence.getEscaped().toString());
            succeeded = true;
        }
        return succeeded;
    }

    /**
     * Escape a control sequence that occurs in a field value that is to be wrapped in quotation
     * marks. This will only escape CLOSE_QUOTE and ESCAPE_INSIDE_QUOTE control sequences.
     *
     * @param controlSequence the control sequence to be escaped.
     * @param fieldBuffer the field that has been escaped so far, with this control sequence at the
     *            end.
     * @throws NullPointerException if CLOSE_QUOTE or ESCAPE_INSIDE_QUOTE cannot be escaped.
     */
    private void escapeQuoted(final CharSequenceSet controlSequence,
            final StringBuilder fieldBuffer) throws NullPointerException {
        switch (controlSequence.getFunction()) {
            case CLOSE_QUOTE:
            case ESCAPE_INSIDE_QUOTE:
                fieldBuffer.replace(fieldBuffer.length() - controlSequence.getUnescaped().length(),
                    fieldBuffer.length(), controlSequence.getEscaped().toString());
                break;
            default:
                break;
        }
    }

    /**
     * Reset all the finders to start looking from the beginning of the sequences.
     *
     * @param finders finders to reset.
     */
    private void resetFinders(final List<CharSequenceFinder> finders) {
        for (final CharSequenceFinder finderToReset : finders) {
            finderToReset.reset();
        }
    }
}
