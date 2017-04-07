package com.archibus.app.common.connectors.impl.edi.inbound;

import java.util.*;

import com.archibus.app.common.connectors.domain.*;

/**
 * Represents a part of an EDI transaction as read from an EDI file.
 *
 * @author cole
 * @since 21.4
 *
 */
public class EdiTxRecordPart {
    /**
     * Connector fields associated with this part in order of position.
     */
    private final List<ConnectorFieldConfig> connectorFields;

    /**
     * The prefix for this part.
     */
    private final List<String> prefixes;

    /**
     * A non-recursive list of parent parts.
     */
    private final List<EdiTxRecordPart> parents;
    
    /**
     * A list of prefixes for parent parts in the same order as parents.
     */
    private final List<List<String>> parentPrefixes;
    
    /**
     * @param connector the afm_connector record to use as configuration.
     * @param prefixes the prefixes for this part.
     * @param parents a non-recursive list of parent parts.
     * @param startPosition the position of the first connector field for this part.
     * @param endPosition the position of the last connector field for this part.
     */
    public EdiTxRecordPart(final ConnectorConfig connector, final List<String> prefixes,
            final List<EdiTxRecordPart> parents, final int startPosition, final int endPosition) {
        this.prefixes = Collections.unmodifiableList(prefixes);
        this.parents = Collections.unmodifiableList(new ArrayList<EdiTxRecordPart>(parents));

        final List<ConnectorFieldConfig> fields = new ArrayList<ConnectorFieldConfig>();
        for (final ConnectorFieldConfig connectorField : connector.getConnectorFields()) {
            if (connectorField.getPosition() >= startPosition
                    && connectorField.getPosition() <= endPosition) {
                fields.add(connectorField);
            }
        }
        this.connectorFields = Collections.unmodifiableList(fields);

        final List<List<String>> mutableParentPrefixes = new ArrayList<List<String>>();
        for (final EdiTxRecordPart parentTxPart : parents) {
            mutableParentPrefixes.add(parentTxPart.getPrefixes());
        }
        this.parentPrefixes = Collections.unmodifiableList(mutableParentPrefixes);
    }
    
    /**
     * @return connector fields associated with this part in order of position.
     */
    public List<ConnectorFieldConfig> getConnectorFields() {
        return this.connectorFields;
    }

    /**
     * @return a non-recursive list of parent parts.
     */
    public List<EdiTxRecordPart> getParents() {
        return this.parents;
    }

    /**
     * @return a list of prefixes for parent parts in the same order as getParents().
     */
    public List<List<String>> getParentPrefixes() {
        return this.parentPrefixes;
    }

    /**
     * @return the prefixes for this part.
     */
    public List<String> getPrefixes() {
        return this.prefixes;
    }
}
