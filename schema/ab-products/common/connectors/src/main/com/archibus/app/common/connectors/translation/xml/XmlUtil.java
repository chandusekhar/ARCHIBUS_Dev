package com.archibus.app.common.connectors.translation.xml;

import java.io.*;

import javax.xml.stream.*;
import javax.xml.stream.events.XMLEvent;

import org.dom4j.Document;
import org.dom4j.io.*;

import com.archibus.app.common.connectors.translation.exception.TranslationException;

/**
 * Utility methods for working with XML.
 * 
 * @author cole
 * 
 */
public final class XmlUtil {
    
    /**
     * Utility class, no not call.
     */
    private XmlUtil() {
        
    }
    
    /**
     * Takes a document in dom4j and writes it to a stax stream as a nested element.
     * 
     * @param xmlInputFactory factory for creating readers for StaX events.
     * @param xmlWriter writer for XML to be written to.
     * @param document document to be written.
     * @throws TranslationException if the document cannot be written for some reason (e.g. if stax
     *             and dom4j disagree on what valid XML is)
     */
    public static void writeDom4jToStax(final XMLInputFactory xmlInputFactory,
            final XMLEventWriter xmlWriter, final Document document) throws TranslationException {
        try {
            final StringWriter dom4jStringWriter = new StringWriter();
            final XMLWriter dom4jXmlWriter =
                    new XMLWriter(dom4jStringWriter, OutputFormat.createPrettyPrint());
            dom4jXmlWriter.write(document);
            final XMLEventReader staxReader =
                    xmlInputFactory.createXMLEventReader(new StringReader(dom4jStringWriter
                        .toString()));
            while (staxReader.hasNext()) {
                final XMLEvent event = staxReader.nextEvent();
                if (!event.isStartDocument() && !event.isEndDocument()) {
                    xmlWriter.add(event);
                }
            }
        } catch (final IOException e) {
            throw new TranslationException("Unable to write record document to string.", e);
        } catch (final XMLStreamException e) {
            throw new TranslationException("Unable to parse generated record XML", e);
        }
    }
}
