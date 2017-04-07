package com.archibus.app.common.connectors.impl.xls.outbound;

import java.util.*;

import com.archibus.app.common.connectors.domain.*;
import com.archibus.app.common.connectors.exception.ConfigurationException;
import com.archibus.app.common.connectors.impl.archibus.DataSourceUtil;
import com.archibus.app.common.connectors.impl.archibus.outbound.NullReplacementRequestRecordDef;
import com.archibus.app.common.connectors.impl.file.outbound.AbstractOutboundFileRequests;
import com.archibus.app.common.connectors.impl.xls.XlsUtil;
import com.archibus.app.common.connectors.logging.IUserLog;
import com.archibus.app.common.connectors.translation.xls.outbound.*;
import com.archibus.context.ContextStore;
import com.archibus.schema.ArchibusFieldDefBase.Immutable;
import com.archibus.schema.*;

/**
 *
 * A series of requests to a file system to store records as Excel file.
 *
 * @author Catalin Purice
 * @since 21.3
 *
 */
public class OutboundXlsRequests extends AbstractOutboundFileRequests {
    
    /**
     * The value to write to a file in place of nulls.
     */
    private static final String NULL_VALUE = "";
    
    /**
     *
     * Constructor.
     *
     * @param stepName a descriptive name for this step.
     * @param connector connector bean
     * @param log a place to write user friendly status messages
     * @throws ConfigurationException if a connector rule associated with these requests cannot be
     *             instantiated.
     */
    public OutboundXlsRequests(final String stepName, final ConnectorConfig connector,
            final IUserLog log) throws ConfigurationException {
        /**
         * Create requests.
         */
        super(stepName,
        /**
         * Connector.
         */
        connector,
        /**
         * XLS request.
         */
        new NullReplacementRequestRecordDef(connector, NULL_VALUE),
        /**
         * XLS Request template.
         */
        new XlsRequestTemplate(DATA_SOURCE_PARAM, getFieldDefOrder(connector.getArchibusTable(),
            connector.getConnectorFields()), connector.getForeignTxPath() == null ? "Sheet1"
                : connector.getForeignTxPath(), connector.getConnParams(), connector
            .getTextQualifier().getSequence(), XlsUtil.getFileType(connector.getConnString())), log);
    }
    
    /**
     * Create the order of field names from the afm_conn_flds records associated with the connector.
     *
     * @param sourceTable the ARCHIBUS table from which the fields originate.
     * @param connectorFields the fields to sort.
     * @return the names of the fields in sorted order.
     */
    private static List<XlsField> getFieldDefOrder(final String sourceTable,
            final List<ConnectorFieldConfig> connectorFields) {
        final List<XlsField> fieldDefOrder = new ArrayList<XlsField>();
        final TableDef.ThreadSafe tableDefinition =
                ContextStore.get().getProject().loadTableDef(sourceTable);
        int position = 0;
        for (final ConnectorFieldConfig connectorField : connectorFields) {
            connectorField.getRule();
            if (DataSourceUtil.isRequiredDsField(connectorField)) {
                final Immutable fieldDef =
                        tableDefinition.getFieldDef(connectorField.getArchibusField());
                fieldDefOrder.add(new XlsField(connectorField.getForeignFieldPath(), position,
                    DataType.get(fieldDef.getSqlType())));
            } else {
                fieldDefOrder.add(new XlsField(connectorField.getForeignFieldPath(), position,
                    DataType.CHAR));
            }
            position++;
        }
        return fieldDefOrder;
    }
    
}
