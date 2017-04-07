package com.archibus.app.common.connectors.test.translation.text;

import static com.archibus.app.common.connectors.translation.text.CharSequenceFunction.*;

import java.io.*;
import java.nio.charset.Charset;
import java.util.*;

import junit.framework.TestCase;

import org.apache.commons.io.IOUtils;
import org.apache.commons.lang.StringUtils;

import com.archibus.app.common.connectors.exception.StepException;
import com.archibus.app.common.connectors.translation.common.inbound.*;
import com.archibus.app.common.connectors.translation.common.outbound.IRequestTemplate;
import com.archibus.app.common.connectors.translation.exception.TranslationException;
import com.archibus.app.common.connectors.translation.text.CharSequenceSet;
import com.archibus.app.common.connectors.translation.text.inbound.DelimitedTextRecordParser;
import com.archibus.app.common.connectors.translation.text.outbound.*;

/**
 * Test combinations of delimiters and text qualifiers for delimited text connectors.
 *
 * @author cole
 *
 */
public class TestDelimiterQualifierCombinations extends TestCase {
    /**
     * Default character set to test with.
     */
    private static final Charset CHAR_SET = Charset.forName("UTF-8");

    /**
     * How many characters of context to include on either end when reporting a difference between
     * expected and actual results.
     */
    private static final int DIFF_RANGE = 10;

    /**
     * A comma character.
     */
    private static final String COMMA = ",";

    /**
     * A tab character.
     */
    private static final String TAB = "\t";

    /**
     * A pipe character.
     */
    private static final String PIPE = "|";

    /**
     * A tilde character.
     */
    private static final String TILDE = "~";

    /**
     * A single quote character.
     */
    private static final String SINGLE_QUOTE = "'";

    /**
     * A double quote character.
     */
    private static final String DOUBLE_QUOTE = "\"";

    /**
     * A carriage return and line feed record delimiter.
     */
    private static final String FIRST_RECORD_DELIMITER = "\r\n";

    /**
     * A line feed only record delimiter.
     */
    private static final String SECOND_RECORD_DELIMITER = "\n";

    /**
     * A set of strings to use as generic data that doesn't conflict with control characters.
     */
    private static final String[] NORMAL_STRINGS = new String[] { "a", "b", "c" };

    /**
     * Test a delimited text file where fields are delimited by commas and text is qualified with
     * double quotes.
     *
     * @throws TranslationException if an error occurs in connectors.
     */
    public void testCommaDoubleQuotes() throws TranslationException {
        abstractDelimiterQualifierTest(COMMA, DOUBLE_QUOTE);
    }

    /**
     * Test a delimited text file where fields are delimited by commas and text is qualified with
     * single quotes.
     *
     * @throws TranslationException if an error occurs in connectors.
     */
    public void testCommaSingleQuotes() throws TranslationException {
        abstractDelimiterQualifierTest(COMMA, SINGLE_QUOTE);
    }

    /**
     * Test a delimited text file where fields are delimited by tabs and text is qualified with
     * double quotes.
     *
     * @throws TranslationException if an error occurs in connectors.
     */
    public void testTabDoubleQuotes() throws TranslationException {
        abstractDelimiterQualifierTest(TAB, DOUBLE_QUOTE);
    }

    /**
     * Test a delimited text file where fields are delimited by tabs and text is qualified with
     * single quotes.
     *
     * @throws TranslationException if an error occurs in connectors.
     */
    public void testTabSingleQuotes() throws TranslationException {
        abstractDelimiterQualifierTest(TAB, SINGLE_QUOTE);
    }

    /**
     * Test a delimited text file where fields are delimited by pipes and text is qualified with
     * double quotes.
     *
     * @throws TranslationException if an error occurs in connectors.
     */
    public void testPipeDoubleQuotes() throws TranslationException {
        abstractDelimiterQualifierTest(PIPE, DOUBLE_QUOTE);
    }

    /**
     * Test a delimited text file where fields are delimited by pipes and text is qualified with
     * single quotes.
     *
     * @throws TranslationException if an error occurs in connectors.
     */
    public void testPipeSingleQuotes() throws TranslationException {
        abstractDelimiterQualifierTest(PIPE, SINGLE_QUOTE);
    }

    /**
     * Test a delimited text file where fields are delimited by tildes and text is qualified with
     * double quotes.
     *
     * @throws TranslationException if an error occurs in connectors.
     */
    public void testTildeDoubleQuotes() throws TranslationException {
        abstractDelimiterQualifierTest(TILDE, DOUBLE_QUOTE);
    }

    /**
     * Test a delimited text file where fields are delimited by tildes and text is qualified with
     * single quotes.
     *
     * @throws TranslationException if an error occurs in connectors.
     */
    public void testTildeSingleQuotes() throws TranslationException {
        abstractDelimiterQualifierTest(TILDE, SINGLE_QUOTE);
    }

    /**
     * Run a test of the delimited text record parser and template for a connector-like
     * configuration.
     *
     * @param delimiter the field delimiter.
     * @param qualifier the text qualifier.
     * @throws TranslationException if an error occurs in connectors.
     */
    private void abstractDelimiterQualifierTest(final String delimiter, final String qualifier)
            throws TranslationException {
        final String escapedQualifier = qualifier + qualifier;
        final List<CharSequenceSet> controlSequences = new ArrayList<CharSequenceSet>();
        controlSequences.add(new CharSequenceSet(FIELD_DELIMITER, null, delimiter));
        controlSequences.add(new CharSequenceSet(RECORD_DELIMITER, null, FIRST_RECORD_DELIMITER));
        controlSequences.add(new CharSequenceSet(RECORD_DELIMITER, null, SECOND_RECORD_DELIMITER));
        controlSequences.add(new CharSequenceSet(OPEN_QUOTE, null, qualifier));
        controlSequences.add(new CharSequenceSet(CLOSE_QUOTE, escapedQualifier, qualifier));
        controlSequences.add(new CharSequenceSet(ESCAPE_INSIDE_QUOTE, escapedQualifier, qualifier));

        final List<DelimitedTextField> fields = new ArrayList<DelimitedTextField>();
        for (int fieldIndex = 0; fieldIndex < NORMAL_STRINGS.length; fieldIndex++) {
            fields.add(new DelimitedTextField(NORMAL_STRINGS[fieldIndex], null, fieldIndex));
        }

        /*
         * Build records.
         */
        final List<String> permutations =
                getPermutations(Arrays.asList(new String[] { NORMAL_STRINGS[0], delimiter,
                        qualifier, escapedQualifier, FIRST_RECORD_DELIMITER,
                        SECOND_RECORD_DELIMITER }));
        int permutationIndex = 0;
        final List<Map<String, Object>> valueSets = new ArrayList<Map<String, Object>>();
        Map<String, Object> transaction = new HashMap<String, Object>();
        for (final String permutation : permutations) {
            transaction.put(fields.get(permutationIndex % fields.size()).getFieldName(),
                permutation);
            if (permutationIndex % fields.size() == fields.size() - 1) {
                valueSets.add(transaction);
                transaction = new HashMap<String, Object>();
            }
            permutationIndex++;
        }

        /*
         * Build text.
         */
        final StringBuilder expectedResult = new StringBuilder();
        for (final Map<String, Object> valueSet : valueSets) {
            appendValue((String) valueSet.get(fields.get(0).getFieldName()), expectedResult,
                qualifier, escapedQualifier, delimiter);
            expectedResult.append(delimiter);
            appendValue((String) valueSet.get(fields.get(1).getFieldName()), expectedResult,
                qualifier, escapedQualifier, delimiter);
            expectedResult.append(delimiter);
            appendValue((String) valueSet.get(fields.get(2).getFieldName()), expectedResult,
                qualifier, escapedQualifier, delimiter);
            expectedResult.append(FIRST_RECORD_DELIMITER);
        }
        expectedResult.delete(expectedResult.length() - FIRST_RECORD_DELIMITER.length(),
            expectedResult.length());

        abstractTextTest(fields, valueSets, controlSequences, expectedResult.toString(),
            QuotationStrategy.AS_NEEDED);
    }

    /**
     * Append the given value to the expected result, using quotation marks where necessary.
     *
     * @param givenValue the value to append.
     * @param expectedResult the expected result to append it to.
     * @param qualifier the text qualifier.
     * @param escapedQualifier the escaped text qualifier.
     * @param delimiter the field delimiter.
     */
    private void appendValue(final String givenValue, final StringBuilder expectedResult,
            final String qualifier, final String escapedQualifier, final String delimiter) {
        boolean useQuotes = false;
        String value = givenValue;
        if (value.contains(qualifier)) {
            value = value.replaceAll("\\Q" + qualifier + "\\E", escapedQualifier);
            useQuotes = true;
        } else if (value.contains(delimiter) || value.contains(FIRST_RECORD_DELIMITER)
                || value.contains(SECOND_RECORD_DELIMITER)) {
            useQuotes = true;
        }
        if (useQuotes) {
            expectedResult.append(qualifier);
        }
        expectedResult.append(value);
        if (useQuotes) {
            expectedResult.append(qualifier);
        }
    }

    /**
     * @param pieces a set of values.
     * @return all permutations of those values, where the values are appended to each other in the
     *         order given by the permutation.
     */
    private List<String> getPermutations(final List<String> pieces) {
        List<String> permutations;
        if (pieces.size() == 1) {
            permutations = pieces;
        } else {
            permutations = new ArrayList<String>();
            for (int index = 0; index < pieces.size(); index++) {
                final List<String> subPieces = new ArrayList<String>(pieces);
                subPieces.remove(index);
                for (final String permutation : getPermutations(subPieces)) {
                    permutations.add(pieces.get(index) + permutation);
                    permutations.add(permutation);
                }
            }
        }
        return permutations;
    }

    /**
     * Run a test of the delimited text record parser and template.
     *
     * @param fields field configurations.
     * @param valueSets values to be written and the expected output from the parser.
     * @param controlSequences such as field delimiter, record delimiter, text qualifiers.
     * @param expectedResults the expected output from the template.
     * @param quotationStrategy when to quote a string.
     * @throws TranslationException if an error occurs in connectors.
     */
    private void abstractTextTest(final List<DelimitedTextField> fields,
            final List<Map<String, Object>> valueSets,
            final List<CharSequenceSet> controlSequences, final String expectedResults,
            final QuotationStrategy quotationStrategy) throws TranslationException {
        final IRequestTemplate<InputStream> template =
                new DelimitedTextRequestTemplate(null, fields, controlSequences, quotationStrategy,
                    CHAR_SET);
        final ByteArrayOutputStream stream = new ByteArrayOutputStream(expectedResults.length());
        for (final Map<String, Object> values : valueSets) {
            try {
                IOUtils.copy(template.generateRequest(values), stream);
            } catch (final IOException e) {
                fail("To write a generated request to a byte array output stream: "
                        + values.toString());
            }
        }
        final String output = stream.toString();
        final int indexOfDifference = StringUtils.indexOfDifference(output, expectedResults);
        final int minDiffRange = Math.max(indexOfDifference - DIFF_RANGE, 0);
        final int maxDiffRange =
                Math.min(Math.min(indexOfDifference + DIFF_RANGE, output.length()),
                    expectedResults.length());
        if (indexOfDifference > 0) {
            fail("Got:\n" + output.substring(minDiffRange, maxDiffRange) + "\nExpected:\n"
                    + expectedResults.substring(minDiffRange, maxDiffRange) + "\n at index: "
                    + indexOfDifference);
        }
        try {
            new DelimitedTextRecordParser(controlSequences, CHAR_SET, false).parse(
                new ByteArrayInputStream(output.getBytes(CHAR_SET)),
                new IRecordHandler<List<String>, ForeignTxRecord>() {
                    private int recordIndex;
                    
                    @Override
                    public ForeignTxRecord handleRecord(final List<String> record)
                            throws StepException {
                        valueSets.get(this.recordIndex);
                        if (record.size() != fields.size()) {
                            fail("Wrong number of fields: " + record.toString());
                        }
                        for (int fieldIndex = 0; fieldIndex < fields.size(); fieldIndex++) {
                            final String recordValue = record.get(fieldIndex);
                            final String expectedValue =
                                    (String) valueSets.get(this.recordIndex).get(
                                        fields.get(fieldIndex).getFieldName());
                            if (!expectedValue.equals(recordValue)) {
                                fail("Incorrect value on record " + this.recordIndex + ", "
                                        + fieldIndex + " got " + recordValue + " expected "
                                        + expectedValue);
                            }
                        }
                        this.recordIndex++;
                        return null;
                    }
                });
        } catch (final StepException e) {
            fail(e.getLocalizedMessage());
        }
    }
}
