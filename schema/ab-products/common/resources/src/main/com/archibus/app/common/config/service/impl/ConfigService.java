package com.archibus.app.common.config.service.impl;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.util.Assert;

import com.archibus.app.common.config.service.IConfigService;
import com.archibus.config.*;

/**
 * <p>
 * Implementation of <code>IConfigService</code>.
 * <p>
 * This is a singleton bean managed by Spring, configured in
 * /schema/ab-products/common/resources/src/main/com/archibus/app/common/config/services.xml.
 * <p>
 * Exposed to mobile client as RESTful service using CXF, configured in services.xml.
 *
 * @author Valery Tydykov
 * @since 21.3
 *
 */
public class ConfigService implements IConfigService, InitializingBean {
    /**
     * Logger for this class and subclasses.
     */
    protected final Logger logger = Logger.getLogger(this.getClass());

    /**
     * Property: current project.
     */
    private Project.Immutable project;

    /**
     * Property: configManager. Required.
     */
    private ConfigManager.Immutable configManager;

    /**
     * Property: version of cordova library. Required.
     */
    private String cordovaVersion;

    /** {@inheritDoc} */
    @Override
    public String getCordovaVersion() {
        return this.cordovaVersion;
    }

    /**
     * Setter for the cordovaVersion property.
     *
     * @see cordovaVersion
     * @param cordovaVersion the cordovaVersion to set.
     */
    public void setCordovaVersion(final String cordovaVersion) {
        this.cordovaVersion = cordovaVersion;
    }

    /**
     * {@inheritDoc}
     * <p>
     * Suppress Warning "PMD.SignatureDeclareThrowsException"
     * <p>
     * Justification: This method implements Spring interface.
     */
    @Override
    @SuppressWarnings({ "PMD.SignatureDeclareThrowsException" })
    public void afterPropertiesSet() throws Exception {
        Assert.notNull(this.configManager, "configManager must be supplied");
        Assert.hasLength(this.cordovaVersion, "cordovaVersion must be supplied");
    }

    /** {@inheritDoc} */
    @Override
    public int getVersion() {
        return this.configManager.getVersion();
    }

    /** {@inheritDoc} */
    @Override
    public int getRevision() {
        return this.configManager.getRevision();
    }

    /** {@inheritDoc} */
    @Override
    public int getSchemaVersion() {
        Assert.notNull(this.project, "project must be supplied");

        return this.project.getSchemaVersion();
    }

    /**
     * Getter for the project property.
     *
     * @see project
     * @return the project property.
     */
    public Project.Immutable getProject() {
        return this.project;
    }

    /**
     * Setter for the project property.
     *
     * @see project
     * @param project the project to set
     */
    public void setProject(final Project.Immutable project) {
        this.project = project;
    }

    /**
     * Getter for the configManager property.
     *
     * @see configManager
     * @return the configManager property.
     */
    public ConfigManager.Immutable getConfigManager() {
        return this.configManager;
    }

    /**
     * Setter for the configManager property.
     *
     * @see configManager
     * @param configManager the configManager to set
     */
    public void setConfigManager(final ConfigManager.Immutable configManager) {
        this.configManager = configManager;
    }
}