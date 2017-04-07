package com.archibus.app.common.connectors.impl.text.outbound;

import java.util.*;

import org.json.JSONObject;

import com.archibus.app.common.connectors.domain.*;
import com.archibus.app.common.connectors.domain.ConnectorTypes.TextQualifier;
import com.archibus.app.common.connectors.exception.ConfigurationException;
import com.archibus.app.common.connectors.impl.CharEncodingUtil;
import com.archibus.app.common.connectors.impl.archibus.outbound.NullReplacementRequestRecordDef;
import com.archibus.app.common.connectors.impl.file.outbound.AbstractOutboundFileRequests;
import com.archibus.app.common.connectors.impl.text.TextCharSequenceSet;
import com.archibus.app.common.connectors.logging.IUserLog;
import com.archibus.app.common.connectors.translation.text.outbound.*;
import com.archibus.datasource.DataSourceFieldDefLoader;
import com.archibus.schema.*;
import com.archibus.schema.FieldDefBase.Immutable;
import com.archibus.utility.StringUtil;

/**
 * A series of requests to a file system to store records as delimited text.
 *
 * @author cole
 *
 */
public final class OutboundTextRequests extends AbstractOutboundFileRequests {
    
    /**
     * The value to write to a file in place of nulls.
     */
    private static final String NULL_VALUE = "";
    
    /**
     * Parameter for a custom quotation strategy.
     */
    private static final String CUSTOM_QUOTATION_STRATEGY_PARAM = "quotationStrategy";
    
    /**
     * Generate a series of requests to a file system to produce records from delimited text.
     *
     * @param stepName a descriptive name for this step.
     * @param connector the afm_connector record to use as configuration
     * @param log a place to write user friendly status messages
     * @throws ConfigurationException if a connector rule associated with these requests cannot be
     *             instantiated.
     */
    public OutboundTextRequests(final String stepName, final ConnectorConfig connector,
            final IUserLog log) throws ConfigurationException {
        /*
         * Create requests.
         */
        super(stepName, connector, new NullReplacementRequestRecordDef(connector, NULL_VALUE),
            new DelimitedTextRequestTemplate(DATA_SOURCE_PARAM,
                getDelimitedTextFields(connector.getConnectorFields()), new TextCharSequenceSet(
                    connector), getQuotationStrategy(connector),
                    CharEncodingUtil.getCharacterEncoding(connector)), log);
    }
    
    /**
     * @param connector the afm_connector record to use as configuration.
     * @return the strategy to use when quoting things.
     */
    private static QuotationStrategy getQuotationStrategy(final ConnectorConfig connector) {
        QuotationStrategy strategy =
                (connector.getTextQualifier() == TextQualifier.NONE) ? QuotationStrategy.AS_NEEDED
                        : QuotationStrategy.ALL;
        final JSONObject parameters = connector.getConnParams();
        if (parameters.has(CUSTOM_QUOTATION_STRATEGY_PARAM)) {
            strategy =
                    QuotationStrategy
                        .valueOf(parameters.getString(CUSTOM_QUOTATION_STRATEGY_PARAM));
        }
        return strategy;
    }
    
    /**
     * @param connectorFields the fields for the connector generating these requests.
     * @return the configuration for padding a delimited text field.
     */
    private static List<DelimitedTextField> getDelimitedTextFields(
        final List<ConnectorFieldConfig> connectorFields) {
        final List<DelimitedTextField> fields = new ArrayList<DelimitedTextField>();
        for (final ConnectorFieldConfig connectorField : connectorFields) {
            PaddingRule paddingRule = null;
            if (!StringUtil.isNullOrEmpty(connectorField.getResult())) {
                boolean padLeft = false;
                char paddingChar = ' ';
                if (connectorField.getIsSchemaField()) {
                    final Immutable fieldDef =
                            new DataSourceFieldDefLoader().loadFieldDef(connectorField
                                .getConnector().getArchibusTable(), connectorField
                                .getArchibusField());
                    final DataType fieldDataType = DataType.get(fieldDef.getSqlType());
                    switch (fieldDataType) {
                        case DOUBLE:
                        case FLOAT:
                        case INTEGER:
                        case NUMERIC:
                        case SMALLINT:
                            padLeft = true;
                            paddingChar = '0';
                            break;
                        default:
                            break;
                    }
                }
                paddingRule =
                        new PaddingRule(paddingChar, Integer.parseInt(connectorField.getResult()),
                            padLeft);
            }
            fields.add(new DelimitedTextField(connectorField.getForeignFieldPath(), paddingRule,
                connectorField.getPosition()));
        }
        return fields;
    }
}
