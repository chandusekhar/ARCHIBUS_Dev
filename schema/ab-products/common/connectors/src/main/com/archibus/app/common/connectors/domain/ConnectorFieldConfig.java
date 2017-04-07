package com.archibus.app.common.connectors.domain;

import com.archibus.app.common.connectors.dao.IConnectorDao;
import com.archibus.app.common.connectors.dao.datasource.*;

/**
 * The configuration for processing a field in a transaction between ARCHIBUS and a foreign system.
 *
 * @author cole
 *
 */
public class ConnectorFieldConfig {
    /**
     * Data source for connector configuration.
     */
    private final IConnectorDao connectorDao = new ConnectorDataSource();

    /**
     * Whether the connector is to cache data from a referenced table.
     */
    private Boolean cache;

    /**
     * A unique identifier for a connector that processes this field.
     */
    private String connectorId;

    /**
     * The field in the ARCHIBUS database table that the field should be written to.
     */
    private String destinationFld;

    /**
     * A unique identifier for the source field for this connector (inbound = foreign, outbound =
     * ARCHIBUS).
     */
    private String fieldId;

    /**
     * Parameters to various connector rules.
     */
    private String parameter;

    /**
     * The absolute position of a field for an adaptor where fields are not named, and the order in
     * which transaction level rules are applied.
     */
    private Integer position;

    /**
     * The minimum length to pad a field to in a text connector.
     */
    private String result;

    /**
     * Logic used to perform a function (usually translation) when a record is exchanged with an
     * ARCHIBUS table.
     */
    private String ruleId;

    /**
     * The configuration for the connector rule that applies to this field.
     */
    private ConnectorRuleConfig rule;

    /**
     * The configuration for the connector this field is defined on.
     */
    private ConnectorConfig connector;

    /**
     * The configuration for the connector the field id refers to.
     */
    private ConnectorConfig connectorForFieldId;

    /**
     * Overrides ref_table when using rules that apply to a referenced table.
     */
    private String validateTbl;

    /**
     * Whether to update fields with null values.
     */
    private Boolean ignoreNulls;
    
    /**
     * Whether this connector field is a field in the ARCHIBUS database.
     */
    private Boolean isSchemaField;

    /**
     * @return whether to process data received immediately, or to cache it and continue receiving.
     */
    public Boolean getCache() {
        return this.cache;
    }

    /**
     * @param cache whether to process data received immediately, or to cache it and continue
     *            receiving.
     */
    public void setCache(final Boolean cache) {
        this.cache = cache;
    }

    /**
     * @return a unique identifier for a connector that processes this field.
     */
    public String getConnectorId() {
        return this.connectorId;
    }

    /**
     * @param connectorId a unique identifier for a connector that processes this field.
     */
    public void setConnectorId(final String connectorId) {
        this.connectorId = connectorId;
    }

    /**
     * @return the field in the ARCHIBUS database table that the field should be written to.
     */
    public String getDestinationFld() {
        return this.destinationFld;
    }

    /**
     * @param destinationFld the field in the ARCHIBUS database table that the field should be
     *            written to.
     */
    public void setDestinationFld(final String destinationFld) {
        this.destinationFld = destinationFld;
    }

    /**
     * @return a unique identifier for the source field for this connector (inbound = foreign,
     *         outbound = ARCHIBUS)
     */
    public String getFieldId() {
        return this.fieldId;
    }

    /**
     * @param fieldId a unique identifier for the source field for this connector (inbound =
     *            foreign, outbound = ARCHIBUS)
     */
    public void setFieldId(final String fieldId) {
        this.fieldId = fieldId;
    }

    /**
     * @return whether to update fields with null values.
     */
    public Boolean getIgnoreNulls() {
        return this.ignoreNulls;
    }

    /**
     * @param ignoreNulls Whether to update fields with null values.
     */
    public void setIgnoreNulls(final Boolean ignoreNulls) {
        this.ignoreNulls = ignoreNulls;
    }

    /**
     * @return whether this connector field is a field in the ARCHIBUS database.
     */
    public Boolean getIsSchemaField() {
        return this.isSchemaField;
    }

    /**
     * @param isSchemaField whether this connector field is a field in the ARCHIBUS database.
     */
    public void setIsSchemaField(final Boolean isSchemaField) {
        this.isSchemaField = isSchemaField;
    }

    /**
     * @return parameters to various connector rules.
     */
    public String getParameter() {
        return this.parameter;
    }

    /**
     * @param parameter parameters to various connector rules.
     */
    public void setParameter(final String parameter) {
        this.parameter = parameter;
    }

    /**
     * @return the absolute position of a field for an adaptor where fields are not named, and the
     *         order in which transaction level rules are applied.
     */
    public Integer getPosition() {
        return this.position;
    }

    /**
     * @param position the absolute position of a field for an adaptor where fields are not named,
     *            and the order in which transaction level rules are applied.
     */
    public void setPosition(final Integer position) {
        this.position = position;
    }

    /**
     * @return the minimum length to pad a field to in a text connector.
     */
    public String getResult() {
        return this.result;
    }

    /**
     * @param result the minimum length to pad a field to in a text connector.
     */
    public void setResult(final String result) {
        this.result = result;
    }

    /**
     * @return identifier for logic used to perform a function (usually translation) when a record
     *         is exchanged with an ARCHIBUS table.
     */
    public String getRuleId() {
        return this.ruleId;
    }

    /**
     * @param ruleId identifier for logic used to perform a function (usually translation) when a
     *            record is exchanged with an ARCHIBUS table.
     */
    public void setRuleId(final String ruleId) {
        this.ruleId = ruleId;
    }

    /**
     * @return table that overrides ref_table when using rules that apply to a referenced table.
     */
    public String getValidateTbl() {
        return this.validateTbl;
    }

    /**
     * @param validateTbl table that overrides ref_table when using rules that apply to a referenced
     *            table.
     */
    public void setValidateTbl(final String validateTbl) {
        this.validateTbl = validateTbl;
    }

    /**
     * @return 1 if the connector is to cache data from a referenced table, 0 if it should not.
     */
    public Integer getCacheDb() {
        return this.cache == null ? null : (this.cache ? 1 : 0);
    }

    /**
     * @param cacheDb 1 if the connector is to cache data from a referenced table, 0 if it should
     *            not.
     */
    public void setCacheDb(final Integer cacheDb) {
        this.cache = cacheDb == null ? null : cacheDb.intValue() != 0;
    }

    /**
     * @return 1 if the field is in the ARCHIBUS database, 0 if it is not.
     */
    public Integer getIsSchemaFieldDb() {
        return this.isSchemaField == null ? null : (this.isSchemaField ? 1 : 0);
    }

    /**
     * @param isSchemaFieldDb 1 if the field is in the ARCHIBUS database, 0 if it is not.
     */
    public void setIsSchemaFieldDb(final Integer isSchemaFieldDb) {
        this.isSchemaField = isSchemaFieldDb == null ? null : isSchemaFieldDb.intValue() != 0;
    }

    /**
     * @return 1 if the connector is not to update fields with null values, 0 if it is.
     */
    public Integer getIgnoreNullsDb() {
        return this.ignoreNulls == null ? null : (this.ignoreNulls ? 1 : 0);
    }

    /**
     * @param ignoreNullsDb 1 if the connector is not to update fields with null values, 0 if it is.
     */
    public void setIgnoreNullsDb(final Integer ignoreNullsDb) {
        this.ignoreNulls = ignoreNullsDb == null ? null : ignoreNullsDb.intValue() != 0;
    }

    /**
     * @param connector the configuration for the connector this field is defined on.
     */
    public void setConnector(final ConnectorConfig connector) {
        this.connector = connector;
    }

    /**
     * @return the configuration for the connector this field is defined on.
     */
    public ConnectorConfig getConnector() {
        if (this.connector == null) {
            this.connector = this.connectorDao.get(getConnectorId());
        }
        return this.connector;
    }

    /**
     * @return the configuration for the connector this field is defined on.
     */
    public ConnectorConfig getConnectorForFieldId() {
        if (this.connectorForFieldId == null) {
            this.connectorForFieldId = this.connectorDao.get(getFieldId());
        }
        return this.connectorForFieldId;
    }

    /**
     * @return the configuration for the connector the field id refers to.
     */
    public ConnectorRuleConfig getRule() {
        if (this.rule == null) {
            final ConnectorRuleDataSource ruleDao = new ConnectorRuleDataSource();
            this.rule = ruleDao.get(getRuleId());
        }
        return this.rule;
    }

    /**
     * @return the field name for the field on the ARCHIBUS table.
     */
    public String getArchibusField() {
        return getConnector().getExport() ? getFieldId() : getDestinationFld();
    }

    /**
     * @return the path to the field for the field in the foreign system.
     */
    public String getForeignFieldPath() {
        String foreignFieldPath = getConnector().getExport() ? getDestinationFld() : getFieldId();
        if (foreignFieldPath == null) {
            foreignFieldPath = String.valueOf(getPosition());
        }
        return foreignFieldPath;
    }
}
