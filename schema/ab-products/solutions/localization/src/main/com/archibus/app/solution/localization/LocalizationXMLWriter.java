/**
 * This package contains localization kit utilities.
 **/
package com.archibus.app.solution.localization;

import java.io.*;
import java.util.regex.*;

import org.dom4j.*;
import org.dom4j.io.*;

import com.archibus.utility.text.StringHelper;

/**
 * XML writer for lang files. (See XmlViewConverterWriter.)
 *
 */
public class LocalizationXMLWriter extends XMLWriter {

    /**
     * Encoded apostrophe.
     */
    private static final String APOSTROPHE_ENCODED = "&apos;";

    /**
     * Decoded apostrophe.
     */
    private static final String APOSTROPHE_DECODED = "'";

    /**
     * OGLN Expression pattern.
     */
    private static final String OGLNEXPR = "(.*)(\\$\\{.*?\\})(.*)";

    /**
     * Constructor.
     *
     * @param writer Writer
     * @param format OutputFormat
     */
    public LocalizationXMLWriter(final Writer writer, final OutputFormat format) {
        super(writer, format);
    }

    /**
     * Writes the attributes of the given element.
     *
     * @param element Element
     * @throws IOException exception
     */
    @Override
    protected void writeAttributes(final Element element) throws IOException {

        // I do not yet handle the case where the same prefix maps to
        // two different URIs. For attributes on the same element
        // this is illegal; but as yet we don't throw an exception
        // if someone tries to do this
        final int size = element.attributeCount();
        for (int i = 0; i < size; i++) {
            final Attribute attribute = element.attribute(i);

            /*
             * final Namespace namespace = attribute.getNamespace(); if (namespace != null &&
             * namespace != Namespace.NO_NAMESPACE && namespace != Namespace.XML_NAMESPACE) {
             * namespace.getPrefix(); }
             */

            this.writer.write(" ");
            this.writer.write(attribute.getQualifiedName());
            this.writer.write("=\"");
            writeEscapeAttributeEntities(attribute.getQualifiedName(), attribute.getValue());
            this.writer.write("\"");
        }
    }

    /**
     * Write escape attribute entities.
     *
     * @param name String
     * @param text String
     * @throws IOException exception
     */
    protected void writeEscapeAttributeEntities(final String name, final String text)
            throws IOException {
        if (text != null) {
            final String escapedText = escapeAttributeEntities(name, text);
            this.writer.write(escapedText);
        }
    }

    /**
     * XMLWriter.escapeAttributeEntities() converts ' to &apos; Override and undo.
     *
     * @param name String
     * @param text String
     * @return String with replaced characters
     */
    protected String escapeAttributeEntities(final String name, final String text) {
        // replace characters good for XML to characters good for HTML
        // since browsers don't handle &apos;(XML actually handle single quote ' as &apos;),
        // convert it to ' before sending response string to browsers
        // XXX make all char conversions consistent for all layers (HTML-XML-SQL)

        String escapedText = super.escapeAttributeEntities(text);
        Boolean isValue;
        isValue = "value".equals(name);
        if ("key2".equals(name) || "key3".equals(name) || isValue) {
            escapedText = StringHelper.replaceAll(escapedText, "\\\\", "\\");
        }
        return isValue ? replaceXmlChars(escapedText) : escapedText;
    }

    /**
     * Replace xml characters.
     *
     * @param str Description of the Parameter
     * @return Description of the Return Value
     */
    public static String replaceXmlChars(final String str) {
        String tempStr = decodeChars(str);

        // Create a Pattern object
        final Pattern pattern = Pattern.compile(OGLNEXPR);

        // Now create matcher object.
        final Matcher matcher = pattern.matcher(str);
        if (matcher.find()) {
            final String group1 = encodeChars(matcher.group(1));
            final String group3 = encodeChars(matcher.group(3));
            tempStr = group1 + matcher.group(2) + group3;
        }

        return tempStr;
    }

    /**
     * Encode characters in string.
     *
     * @param str Original String.
     * @return newStr New String.
     */
    public static String encodeChars(final String str) {
        return StringHelper.replaceAll(str, APOSTROPHE_DECODED, APOSTROPHE_ENCODED);
    }

    /**
     * Decode characters in string.
     *
     * @param str Original String.
     * @return newStr New String.
     */
    public static String decodeChars(final String str) {
        return StringHelper.replaceAll(str, APOSTROPHE_ENCODED, APOSTROPHE_DECODED);
    }
}
