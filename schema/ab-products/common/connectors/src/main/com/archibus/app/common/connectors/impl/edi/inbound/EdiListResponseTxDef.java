package com.archibus.app.common.connectors.impl.edi.inbound;

import java.util.*;

import com.archibus.app.common.connectors.domain.ConnectorFieldConfig;
import com.archibus.app.common.connectors.exception.ConfigurationException;
import com.archibus.app.common.connectors.impl.archibus.inbound.*;
import com.archibus.app.common.connectors.translation.common.inbound.impl.ArchibusDataTable;
import com.archibus.app.common.connectors.translation.text.inbound.AbstractTextParser;
import com.archibus.datasource.DataSourceFieldDefLoader;

/**
 * A record definition for records from a EDI source file that provides a list of fields based on a
 * configuration from the afm_connector table.
 *
 * @author CatalinP
 */
public class EdiListResponseTxDef extends ListResponseTxDef<String> {
    /**
     * The first field value, which identifies this type of record.
     */
    private final EdiTxRecordPart txPart;

    /**
     * The most recent version of each parent record.
     */
    private final Map<List<String>, List<String>> buffer;
    
    /**
     * Create record definition for records from a source that provides a list of fields based on a
     * configuration from the afm_connector table.
     *
     * @param txDefId a unique identifier for this transaction definition.
     * @param dataTable a method for accessing the data table.
     * @param parser method for parsing records from the file.
     * @param numberOfRecordsToSkip the number of records to ignore starting with the first.
     * @param txPart the definition of parts of the transaction produced from EDI records.
     * @throws ConfigurationException if a connector rule associated with a field of this record
     *             cannot be instantiated.
     */
    public EdiListResponseTxDef(final String txDefId, final ArchibusDataTable dataTable,
            final AbstractTextParser parser, final Integer numberOfRecordsToSkip,
            final EdiTxRecordPart txPart) throws ConfigurationException {
        super(txDefId, dataTable, parser, EdiListResponseTxDef.createFieldDefinitions(txPart),
            numberOfRecordsToSkip);
        this.txPart = txPart;
        this.buffer = new HashMap<List<String>, List<String>>();
    }

    /**
     * @param txPart the definitions of parts of the transaction produced from EDI records.
     * @return a list of field definitions corresponding to the connectorFields.
     * @throws ConfigurationException if a connector rule associated with a field of this record
     *             cannot be instantiated.
     */
    private static List<ListResponseFieldDefinition<String>> createFieldDefinitions(
            final EdiTxRecordPart txPart) throws ConfigurationException {
        final List<ListResponseFieldDefinition<String>> foreignFieldDefinitions =
                new ArrayList<ListResponseFieldDefinition<String>>();
        final DataSourceFieldDefLoader fieldDefLoader = new DataSourceFieldDefLoader();
        int fieldListIndex = 0;
        for (final ConnectorFieldConfig connectorField : txPart.getConnectorFields()) {
            foreignFieldDefinitions.add(new ListResponseFieldDefinition<String>(connectorField,
                fieldDefLoader, fieldListIndex));
            fieldListIndex++;
        }
        for (final EdiTxRecordPart txParentPart : txPart.getParents()) {
            for (final ConnectorFieldConfig connectorField : txParentPart.getConnectorFields()) {
                foreignFieldDefinitions.add(new ListResponseFieldDefinition<String>(connectorField,
                    fieldDefLoader, fieldListIndex));
                fieldListIndex++;
            }
        }
        return foreignFieldDefinitions;
    }

    @Override
    public boolean handles(final List<String> transaction) {
        boolean handles = false;
        if (!transaction.isEmpty()) {
            final List<String> prefixes = this.txPart.getPrefixes();
            if (hasPrefixes(prefixes, transaction)) {
                handles = true;
            } else {
                bufferIfParent(transaction);
            }
        }
        return handles;
    }

    /**
     * If the transaction is a parent of the transaction this defines, remember it.
     * 
     * @param transaction the transaction that may be a parent.
     */
    private void bufferIfParent(final List<String> transaction) {
        final List<String> matchedPrefixes =
                matchesPrefixes(this.txPart.getParentPrefixes(), transaction);
        if (matchedPrefixes != null) {
            this.buffer.put(matchedPrefixes, transaction);
        }
    }
    
    /**
     * @param prefixSet a set of lists of values to search for.
     * @param values a list of values to search.
     * @return true if and only if the prefixes are the first elements of the values, and in the
     *         same order.
     */
    private static List<String> matchesPrefixes(final Collection<List<String>> prefixSet,
            final List<String> values) {
        List<String> match = null;
        for (final List<String> prefixes : prefixSet) {
            if (hasPrefixes(prefixes, values)) {
                match = prefixes;
                break;
            }
        }
        return match;
    }
    
    /**
     * @param prefixes a list of values to search for.
     * @param values a list of values to search.
     * @return true if and only if the prefixes are the first elements of the values, and in the
     *         same order.
     */
    private static boolean hasPrefixes(final List<String> prefixes, final List<String> values) {
        return values.size() > prefixes.size()
                && values.subList(0, prefixes.size()).equals(prefixes);
    }

    @Override
    public List<String> preProcess(final List<String> transaction) {
        final List<String> contextualTx = new ArrayList<String>();
        contextualTx.addAll(super.preProcess(transaction));
        int expectedSize = this.txPart.getConnectorFields().size();
        padList(contextualTx, expectedSize);
        for (final EdiTxRecordPart parentTxPart : this.txPart.getParents()) {
            if (this.buffer.containsKey(parentTxPart.getPrefixes())) {
                contextualTx.addAll(this.buffer.get(parentTxPart.getPrefixes()));
            }
            expectedSize += parentTxPart.getConnectorFields().size();
            padList(contextualTx, expectedSize);
        }
        this.buffer.clear();
        return contextualTx;
    }
    
    /**
     * @param list list to be padded.
     * @param expectedSize size to be padded to.
     */
    private void padList(final List<String> list, final int expectedSize) {
        while (list.size() < expectedSize) {
            list.add(null);
        }
    }
}
