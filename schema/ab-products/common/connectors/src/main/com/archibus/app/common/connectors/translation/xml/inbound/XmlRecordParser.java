package com.archibus.app.common.connectors.translation.xml.inbound;

import java.io.*;
import java.util.List;

import org.dom4j.*;
import org.dom4j.io.SAXReader;

import com.archibus.app.common.connectors.exception.StepException;
import com.archibus.app.common.connectors.transfer.exception.AdaptorException;
import com.archibus.app.common.connectors.translation.common.inbound.*;
import com.archibus.app.common.connectors.translation.exception.TranslationException;

/**
 * A parser that extracts nodes from XML in an input stream.
 *
 * @author cole
 *
 */
public class XmlRecordParser implements IRecordParser<InputStream, Node> {
    /**
     * The xPath to find the elements.
     */
    private final List<String> elementsXpaths;

    /**
     * Create a class for parsing an XML document from a stream and extracting nodes matched by the
     * given xPath.
     *
     * @param elementsXpaths the xPaths to find transactions in the XML.
     */
    public XmlRecordParser(final List<String> elementsXpaths) {
        this.elementsXpaths = elementsXpaths;
    }

    /**
     * Parse an XML document from a stream and return nodes matched by the given xPath.
     *
     * @param xmlInputStream the source of XML.
     * @param handler for whatever needs to be done with the record.
     * @throws StepException If an error occurs in the handler.
     */
    @Override
    public void parse(final InputStream xmlInputStream, final IRecordHandler<Node, ?> handler)
            throws StepException {
        AdaptorException closeXmlStreamException = null;
        try {
            parse(getXMLDocument(xmlInputStream), 0, handler);
        } finally {
            try {
                xmlInputStream.close();
            } catch (final IOException e) {
                if (closeXmlStreamException == null) {
                    closeXmlStreamException =
                            new AdaptorException("Unable to close XML stream.", e);
                }
            }
        }
        if (closeXmlStreamException != null) {
            throw closeXmlStreamException;
        }
    }

    /**
     * Parse nested XML nodes from an XML node and handle them as records.
     *
     * @param parentNode the node containing the XML nodes to be parsed out.
     * @param elementsXpathIndex the index into elementsXpaths for xPath relative to the parentNode.
     * @param handler for whatever needs to be done with the records.
     * @throws StepException if a parsed record couldn't be handled.
     */
    private void parse(final Node parentNode, final int elementsXpathIndex,
            final IRecordHandler<Node, ?> handler) throws StepException {
        if (elementsXpathIndex < this.elementsXpaths.size()) {
            for (final Object record : parentNode.selectNodes(this.elementsXpaths
                .get(elementsXpathIndex))) {
                final Node node = (Node) record;
                handler.handleRecord(node);
                parse(node, elementsXpathIndex + 1, handler);
            }
        }
    }

    /**
     * This method is used to load the XML file to a document and return it.
     *
     * @param xmlInputStream is the XML stream to be loaded.
     * @return Document the dom4j representation of the XML document parsed from the stream.
     * @throws TranslationException when reader.read throws a DocumentException.
     */
    private static Document getXMLDocument(final InputStream xmlInputStream)
            throws TranslationException {
        Document document = null;
        final SAXReader reader = new SAXReader();
        try {
            document = reader.read(xmlInputStream);
        } catch (final DocumentException e) {
            throw new TranslationException("Unable to parse XML content", e);
        }
        return document;
    }
}
