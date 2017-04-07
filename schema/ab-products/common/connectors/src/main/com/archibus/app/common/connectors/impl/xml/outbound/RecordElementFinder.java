package com.archibus.app.common.connectors.impl.xml.outbound;

import javax.xml.stream.events.XMLEvent;

import com.archibus.app.common.connectors.translation.common.inbound.IPredicate;

/**
 * A test to determine if a StAX event indicates the parser is parsing a record element.
 * 
 * @author cole
 * 
 */
public class RecordElementFinder implements IPredicate<XMLEvent> {
    /**
     * Current depth in XML hierarchy in terms of elements.
     */
    private int depth;
    
    /**
     * Depth of matched element. -1 if not parsing a matched element.
     */
    private int depthOfMatch;
    
    /**
     * The name of the element containing records.
     */
    private final String recordsContainerName;
    
    /**
     * Create a record element finder that can be used to test a series of StAX events to determine
     * if a record element was found.
     * 
     * @param recordsContainerName the name of the element containing records.
     */
    public RecordElementFinder(final String recordsContainerName) {
        this.recordsContainerName = recordsContainerName;
        this.depth = 0;
        this.depthOfMatch = -1;
    }
    
    /**
     * Return true if the event occurred within a record element. This method should be called with
     * events in the order they occur.
     * 
     * @param event the event to be tested.
     * @return true if the event tested indicates that a record is being parsed.
     */
    public boolean evaluate(final XMLEvent event) {
        if (event.isStartElement()) {
            this.depth++;
            if (this.recordsContainerName.equals(event.asStartElement().getName().getLocalPart())) {
                this.depthOfMatch = this.depth;
            }
        }
        if (event.isEndElement()) {
            if (this.recordsContainerName.equals(event.asEndElement().getName().getLocalPart())
                    && this.depth == this.depthOfMatch) {
                this.depthOfMatch = -1;
            }
            this.depth--;
        }
        return this.depthOfMatch > 0;
    }
}
