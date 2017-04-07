package com.archibus.app.common.connectors.domain;

import com.archibus.app.common.connectors.exception.*;
import com.archibus.app.common.connectors.impl.archibus.translation.IConnectorRule;

/**
 * Configuration for something to be done with a transaction before it is transfered between
 * systems.
 *
 * @author cole
 *
 */
public class ConnectorRuleConfig {
    /**
     * The fully qualified name of the class implementing the rule.
     */
    private String className;
    
    /**
     * A unique identifier for the rule.
     */
    private String ruleId;
    
    /**
     *
     */
    private IConnectorRule instance;
    
    /**
     * The rule's Java class.
     */
    private Class<?> ruleClass;
    
    /**
     * @return the fully qualified name of the class implementing the rule.
     */
    public String getClassName() {
        return this.className;
    }
    
    /**
     * @param className the fully qualified name of the class implementing the rule.
     */
    public void setClassName(final String className) {
        this.className = className;
    }
    
    /**
     * @return a unique identifier for the rule.
     */
    public String getRuleId() {
        return this.ruleId;
    }
    
    /**
     * @param ruleId a unique identifier for the rule.
     */
    public void setRuleId(final String ruleId) {
        this.ruleId = ruleId;
    }
    
    /**
     * This should not be used for translation, only for querying the rule.
     *
     * @return an existing instance of this class if possible.
     * @throws ConfigurationException if the class doesn't exist or isn't a valid connector rule.
     */
    public IConnectorRule getInstance() throws ConfigurationException {
        if (this.instance == null) {
            this.instance = getNewInstance();
        }
        return this.instance;
    }
    
    /**
     * @return a new instance of the rule's class.
     * @throws ConfigurationException if the class doesn't exist or isn't a valid connector rule.
     */
    public IConnectorRule getNewInstance() throws ConfigurationException {
        try {
            final Class<?> connectorRuleClass = getRuleClass();
            return (IConnectorRule) connectorRuleClass.newInstance();
        } catch (final InstantiationException e) {
            throw new ConfigurationException("Unable to instantiate rule class " + this.className,
                e);
        } catch (final IllegalAccessException e) {
            throw new ConnectorInstantiationException("Unable to access rule class "
                    + this.className, e);
        }
    }
    
    /**
     * @return the connector rule's class.
     * @throws ConfigurationException if the class does not exist.
     */
    public Class<?> getRuleClass() throws ConfigurationException {
        if (this.ruleClass == null) {
            try {
                this.ruleClass = Class.forName(this.className);
            } catch (final ClassNotFoundException e) {
                throw new ConfigurationException("Unable to find rule class " + this.className, e);
            }
        }
        return this.ruleClass;
    }
}
