package com.archibus.app.sysadmin.updatewizard.script.parser;

import java.io.InputStream;
import java.nio.charset.Charset;
import java.util.List;

import com.archibus.app.common.connectors.translation.text.CharSequenceSet;
import com.archibus.app.common.connectors.translation.text.inbound.DelimitedTextRecordParser;
import com.archibus.jobmanager.JobStatus;

/**
 *
 * A parser for an input stream that is expected to produce text lines.
 * <p>
 *
 * @author Catalin Purice
 * @since 22.1
 *
 */
public class DelimitedTextLineParser extends DelimitedTextRecordParser {

    /**
     * Create a parser for an input stream that is expected to produce a list of commands as text
     * lines.
     *
     * @param charSequences sequences of characters (such as delimiters, quotations, escape
     *            characters) to interpret while parsing the stream.
     * @param characterEncoding the encoding for characters from a text stream.
     */
    public DelimitedTextLineParser(final List<CharSequenceSet> charSequences,
            final Charset characterEncoding) {
        super(charSequences, characterEncoding, false);
    }

    /**
     * Parses a character stream into lines separated by record_delimiter.
     *
     * @param stream the character stream to be parsed.
     * @param status job status
     */
    public void parse(final InputStream stream, final JobStatus status) {
        final CommandHandler commandHandler = new CommandHandler(status);
        this.parse(stream, commandHandler);
    }
}
