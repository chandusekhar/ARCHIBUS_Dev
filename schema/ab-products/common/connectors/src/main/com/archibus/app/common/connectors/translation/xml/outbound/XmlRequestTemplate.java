package com.archibus.app.common.connectors.translation.xml.outbound;

import java.io.*;
import java.util.Map;

import javax.xml.stream.*;
import javax.xml.stream.events.XMLEvent;

import org.dom4j.*;

import com.archibus.app.common.connectors.exception.ConfigurationException;
import com.archibus.app.common.connectors.translation.common.inbound.IPredicate;
import com.archibus.app.common.connectors.translation.common.outbound.IWrappedRequestTemplate;
import com.archibus.app.common.connectors.translation.common.outbound.impl.*;
import com.archibus.app.common.connectors.translation.exception.TranslationException;
import com.archibus.app.common.connectors.translation.xml.XmlUtil;

/*
 * TODO threading of XML generation
 */
/**
 * A template for generating a list of delimited text fields.
 * 
 * @author cole
 * 
 */
public class XmlRequestTemplate extends AbstractDataSourceRequestTemplate<InputStream> implements
        IWrappedRequestTemplate<InputStream> {
    
    /**
     * The initial record buffer size (based on ByteArrayOutputStream's default size).
     */
    private static final int INITIAL_RECORD_BUFFER_SIZE = 32;
    
    /**
     * The largest record size so far, for buffering purposes.
     */
    private int largestRecordSize;
    
    /**
     * Factory for creating readers for StaX events.
     */
    private final XMLInputFactory xmlInputFactory;
    
    /**
     * Writer for XML output.
     */
    private final XMLEventWriter xmlWriter;
    
    /**
     * Stream for XML output to writer.
     */
    private final PiecewiseOutputStream xmlStream;
    
    /**
     * A test to determine if a StAX event is an element to be replaced by records.
     */
    private final IPredicate<XMLEvent> recordElementFinder;
    
    /**
     * An XML template for a record with all attributes and elements present.
     */
    private final String recordTemplate;
    
    /**
     * A template for the whole of the XML to be written, and a means for reading it.
     */
    private final XMLEventReader templateReader;
    
    /**
     * Create a template for generating an XML node from fields.
     * 
     * @param dataSourceFieldName the field name referring to a DataSource object in template
     *            parameters.
     * @param recordsTemplate XML that should contain records with a placeholder for records.
     * @param recordTemplate XML for a record with all attributes/elements present.
     * @param recordElementFinder Logic for recognizing the placeholder for records to be replaced.
     *            May assume events occur in the order they appear in the records template as
     *            specified by StAX. Should return true if any event indicates it is part of the
     *            placeholder.
     * @throws ConfigurationException if the template cannot be parsed.
     */
    public XmlRequestTemplate(final String dataSourceFieldName, final String recordsTemplate,
            final String recordTemplate, final IPredicate<XMLEvent> recordElementFinder)
            throws ConfigurationException {
        super(dataSourceFieldName);
        final XMLOutputFactory xmlOutputFactory = XMLOutputFactory.newInstance();
        this.recordElementFinder = recordElementFinder;
        this.recordTemplate = recordTemplate;
        
        this.xmlInputFactory = XMLInputFactory.newInstance();
        try {
            this.templateReader =
                    this.xmlInputFactory.createXMLEventReader(new StringReader(recordsTemplate));
        } catch (final XMLStreamException e) {
            throw new ConfigurationException("Unable to parse template", e);
        }
        this.xmlStream = new PiecewiseOutputStream(null);
        try {
            this.xmlWriter = xmlOutputFactory.createXMLEventWriter(this.xmlStream);
        } catch (final XMLStreamException e) {
            throw new ConfigurationException("Unable to create XML stream writer.", e);
        }
        this.largestRecordSize = INITIAL_RECORD_BUFFER_SIZE;
    }
    
    /*
     * TODO use template parameters as xPath -> value map.
     */
    /**
     * Generate beginning of XML for wrapping a series of records.
     * 
     * @param templateParameters presently ignored.
     * @return InputStream with XML element for beginning of records wrapper.
     * @throws TranslationException If there's an error when generating the request.
     */
    public InputStream generateStart(final Map<String, Object> templateParameters)
            throws TranslationException {
        final ByteArrayOutputStream xmlOutput = new ByteArrayOutputStream(this.largestRecordSize);
        this.xmlStream.setWrappedStream(xmlOutput);
        try {
            while (this.templateReader.hasNext()) {
                final XMLEvent event = this.templateReader.nextEvent();
                this.xmlWriter.add(event);
                if (this.recordElementFinder.evaluate(event)) {
                    break;
                }
            }
            xmlOutput.flush();
            xmlOutput.close();
            final byte[] result = xmlOutput.toByteArray();
            if (this.largestRecordSize < result.length) {
                this.largestRecordSize = result.length;
            }
            return new ByteArrayInputStream(result);
        } catch (final XMLStreamException e) {
            throw new TranslationException("Unable to create pre-record XML content to write.", e);
        } catch (final IOException e) {
            throw new TranslationException("Unable to write pre-record XML content to stream.", e);
        }
    }
    
    /**
     * Generate XML for a record.
     * 
     * @param requestParameters a map of xPath to a value for an element or attribute referenced by
     *            that xPath.
     * @return InputStream with XML element for record.
     * @throws TranslationException If there's an error when generating the request.
     */
    public InputStream generateRequest(final Map<String, Object> requestParameters)
            throws TranslationException {
        Document recordXml;
        final ByteArrayOutputStream xmlOutput = new ByteArrayOutputStream();
        this.xmlStream.setWrappedStream(xmlOutput);
        try {
            recordXml = DocumentHelper.parseText(this.recordTemplate);
            for (final String xPath : requestParameters.keySet()) {
                final Node node = recordXml.selectSingleNode(xPath);
                final Object value = requestParameters.get(xPath);
                if (xPath.contains("@")) {
                    /*
                     * Attribute
                     */
                    final Attribute attribute = (Attribute) node;
                    attribute.setText(value == null ? null : value.toString());
                } else {
                    /*
                     * Element
                     */
                    node.setText(value == null ? null : value.toString());
                }
            }
            /*
             * dom4j to string
             */
            XmlUtil.writeDom4jToStax(this.xmlInputFactory, this.xmlWriter, recordXml);
            xmlOutput.flush();
            xmlOutput.close();
            return new ByteArrayInputStream(xmlOutput.toByteArray());
        } catch (final DocumentException e) {
            throw new TranslationException("Unable to create record XML", e);
        } catch (final IOException e) {
            throw new TranslationException("Unable to write record XML to stream.", e);
        }
    }
    
    /*
     * TODO use template parameters as xPath -> value map.
     */
    /**
     * Generate ending of XML for wrapping a series of records.
     * 
     * @param templateParameters presently ignored.
     * @return InputStream with XML element for ending of records wrapper.
     * @throws TranslationException If there's an error when generating the request.
     */
    public InputStream generateEnd(final Map<String, Object> templateParameters)
            throws TranslationException {
        final ByteArrayOutputStream xmlOutput = new ByteArrayOutputStream();
        this.xmlStream.setWrappedStream(xmlOutput);
        try {
            while (this.templateReader.hasNext()) {
                if (!this.recordElementFinder.evaluate(this.templateReader.nextEvent())) {
                    this.xmlWriter.add(this.templateReader.nextEvent());
                }
            }
            this.xmlWriter.close();
            xmlOutput.flush();
            xmlOutput.close();
            return new ByteArrayInputStream(xmlOutput.toByteArray());
        } catch (final XMLStreamException e) {
            throw new TranslationException("Unable to create post-record XML to write.", e);
        } catch (final IOException e) {
            throw new TranslationException("Unable to write post-record XML to stream.", e);
        }
    }
}
