package com.archibus.app.common.connectors.impl.archibus.outbound;

import java.util.*;

import com.archibus.app.common.connectors.exception.ConfigurationException;
import com.archibus.app.common.connectors.impl.archibus.translation.RuleManager;
import com.archibus.app.common.connectors.impl.archibus.translation.manager.*;
import com.archibus.app.common.connectors.translation.common.outbound.IRequestTemplate;
import com.archibus.app.common.connectors.translation.common.outbound.impl.DataSourceRequestTxDef;
import com.archibus.app.common.connectors.translation.exception.TranslationException;

/**
 * A request record definition created from an afm_connectors record.
 *
 * @author cole
 *
 */
public class ArchibusRequestRecordDef extends DataSourceRequestTxDef {
    /**
     * A manager for working with connector rules.
     */
    private final RuleManager ruleManager;
    
    /**
     * Create a record definition for fields from an ARCHIBUS database.
     *
     * @param fieldDefinitions the definitions for fields on this record.
     * @throws ConfigurationException if a connector rule cannot be instantiated due to
     *             configuration.
     */
    public ArchibusRequestRecordDef(
            final List<? extends ArchibusRequestFieldDefinition> fieldDefinitions)
            throws ConfigurationException {
        super(fieldDefinitions);
        this.ruleManager = new RuleManager();
        for (final ArchibusRequestFieldDefinition fieldDef : fieldDefinitions) {
            this.ruleManager.add(fieldDef.getConnectorField());
            fieldDef.setRuleManager(this.ruleManager);
        }
    }
    
    @Override
    public <RequestType> RequestType createRequest(
            final IRequestTemplate<RequestType> requestTemplate,
            final Map<String, Object> databaseParameters) throws TranslationException {
        return super
            .createRequest(
                requestTemplate,
                this.ruleManager.resolveManager(RecordTranslatorManager.class)
                // CHECKSTYLE:OFF checkstyle doesn't like method generics requiring a space after
                // the <>
                    .applyRule(databaseParameters,
                        Collections.<String, Map<String, Object>> emptyMap()));
        // CHECKSTYLE:ON
    }
    
    @Override
    public String shouldSkip(final Map<String, Object> request) {
        return this.ruleManager.resolveManager(SkipConditionManager.class).shouldSkip(request);
    }
}
