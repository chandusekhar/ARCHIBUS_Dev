package com.archibus.app.common.connectors.service;

import java.util.*;

import com.archibus.app.common.connectors.*;
import com.archibus.app.common.connectors.domain.ConnectorConfig;
import com.archibus.app.common.connectors.exception.ConfigurationException;
import com.archibus.app.common.connectors.impl.ICustomConnector;
import com.archibus.app.common.connectors.impl.method.MethodStep;
import com.archibus.app.common.connectors.logging.IUserLog;
import com.archibus.jobmanager.JobStatus;
import com.archibus.utility.StringUtil;

/**
 * A connector configured from the ARCHIBUS database.
 *
 * @author cole
 * @since 22.1
 *
 */
public final class DatabaseConfiguredConnector extends Connector {

    /**
     * The name of the connection string parameter to be passed to the pre-process methods.
     */
    public static final String PRE_PROCESS_METHOD_PARAMETERS = "preProcessMethodParameters";

    /**
     * The name of the connection string parameter to be passed to the post-process methods.
     */
    public static final String POST_PROCESS_METHOD_PARAMETERS = "postProcessMethodParameters";

    /**
     * afm_connectors.parameter json key indicating that pre process step should be passed a
     * ConnectorConfig instead of the 2.0 style connection string.
     */
    public static final String USE_CONFIG_IN_PRE_PROCESS = "useConfigInPreProcess";

    /**
     * afm_connectors.parameter json key indicating that post process step should be passed a
     * ConnectorConfig instead of the 2.0 style connection string.
     */
    public static final String USE_CONFIG_IN_POST_PROCESS = "useConfigInPostProcess";
    
    /**
     * afm_connectors.parameter json key for custom connector class.
     */
    private static final String CUSTOM_CONNECTOR_CLASS_PARAM = "customConnectorClass";

    /**
     * The delimiter between a class and a method in connector configuration.
     */
    private static final String CLASS_METHOD_DELIMITER = "\\|";
    
    /**
     * @param id the identifier for the connector configuration in the database.
     * @param userLog a log to which to write progress messages.
     * @param jobStatus the status of the current job.
     * @param connectorConfig configuration for data exchange.
     * @param unitsPerStep the number of units of work performed by each step.
     * @throws ConfigurationException if there is a configuration issue preventing the instantiation
     *             of the connector.
     */
    public DatabaseConfiguredConnector(final String id, final IUserLog userLog,
            final JobStatus jobStatus, final ConnectorConfig connectorConfig,
            final long unitsPerStep) throws ConfigurationException {
        super(id, userLog, jobStatus, buildSteps(connectorConfig, userLog), unitsPerStep,
            createInitialParams(connectorConfig));
    }

    /**
     * @param connectorConfig configuration for data exchange.
     * @return initial parameters for the first step.
     */
    private static Map<String, Object> createInitialParams(final ConnectorConfig connectorConfig) {
        final Map<String, Object> initialParameters = new HashMap<String, Object>();
        initialParameters
            .put(
                DatabaseConfiguredConnector.PRE_PROCESS_METHOD_PARAMETERS,
                new Object[] { connectorConfig.getConnParams().has(USE_CONFIG_IN_PRE_PROCESS) ? connectorConfig
                        : connectorConfig.getConnString() });
        initialParameters
            .put(
                DatabaseConfiguredConnector.POST_PROCESS_METHOD_PARAMETERS,
                new Object[] { connectorConfig.getConnParams().has(USE_CONFIG_IN_POST_PROCESS) ? connectorConfig
                        : connectorConfig.getConnString() });
        return initialParameters;
    }
    
    /**
     * @param connectorConfig configuration for data exchange.
     * @param log a log for status of data exchange.
     * @return a connector around the transfer step.
     * @throws ConfigurationException if there is a configuration issue preventing instantiation of
     *             a step.
     */
    private static List<IStep<?>> buildSteps(final ConnectorConfig connectorConfig,
            final IUserLog log) throws ConfigurationException {
        /*
         * Initialize data transfer mechanisms.
         */
        final ConnectorRequestsType requestsType =
                ConnectorRequestsType.valueOf(connectorConfig.getType());
        IStep<?> transferStep;
        if (requestsType == ConnectorRequestsType.UNSUPPORTED) {
            transferStep = createCustomTransferStep(connectorConfig);
        } else {
            transferStep = requestsType.getInstance(connectorConfig, log);
        }
        if (transferStep == null) {
            throw new ConfigurationException("Connector type not currently supported: "
                    + connectorConfig.getType(), null);
        }
        final List<IStep<?>> steps = new ArrayList<IStep<?>>();
        if (!StringUtil.isNullOrEmpty(connectorConfig.getPreProcess())) {
            steps.add(createMethodStep("Pre-process Method", connectorConfig.getPreProcess(),
                connectorConfig.getConnParams().has(USE_CONFIG_IN_PRE_PROCESS),
                PRE_PROCESS_METHOD_PARAMETERS));
        }
        steps.add(transferStep);
        if (!StringUtil.isNullOrEmpty(connectorConfig.getPostProcess())) {
            steps.add(createMethodStep("Post-process Method", connectorConfig.getPostProcess(),
                connectorConfig.getConnParams().has(USE_CONFIG_IN_POST_PROCESS),
                POST_PROCESS_METHOD_PARAMETERS));
        }
        return steps;
    }

    /**
     * @param name Name of the step.
     * @param methodDescriptor class|method
     * @param useConfig whether to pass the connector configuration as opposed to the 2.0 style
     *            connection string.
     * @param methodParameterName the name of the step parameter containing method parameters.
     * @return a connector step that executes the specified method.
     * @throws ConfigurationException if for some reason the method cannot be found or accessed.
     */
    private static MethodStep createMethodStep(final String name, final String methodDescriptor,
            final boolean useConfig, final String methodParameterName)
            throws ConfigurationException {
        final String[] methodQualifiers = methodDescriptor.split(CLASS_METHOD_DELIMITER);
        return new MethodStep(name, methodQualifiers[0], methodQualifiers[1],
            new Class[] { useConfig ? ConnectorConfig.class : String.class }, methodParameterName);
    }

    /**
     * @param connectorBean the configuration for the connector defining the step to be created.
     *
     * @return the transfer step, for exchanging data with a foreign system.
     * @throws ConfigurationException if anything goes wrong when constructing the request step.
     */
    private static IStep<?> createCustomTransferStep(final ConnectorConfig connectorBean)
            throws ConfigurationException {
        try {
            final String customConnectorClassName =
                    connectorBean.getConnParams().getString(CUSTOM_CONNECTOR_CLASS_PARAM);
            final ICustomConnector<?> customConnector =
                    (ICustomConnector<?>) Class.forName(customConnectorClassName).newInstance();
            customConnector.init(connectorBean);
            return customConnector;
        } catch (final InstantiationException e) {
            throw new ConfigurationException(
                "Custom connector class must have default constructor.", e);
        } catch (final IllegalAccessException e) {
            throw new ConfigurationException(
                "Custom connector class must have public constructor.", e);
        } catch (final NoSuchElementException e) {
            throw new ConfigurationException("Custom connector must specify "
                    + CUSTOM_CONNECTOR_CLASS_PARAM + " parameter", null);
        } catch (final ClassNotFoundException e) {
            throw new ConfigurationException("Custom connector class must exist on classpath.", e);
        }
    }
}
