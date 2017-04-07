package com.archibus.app.common.connectors.service;

import org.apache.log4j.Logger;

import com.archibus.app.common.connectors.dao.IConnectorDao;
import com.archibus.app.common.connectors.dao.datasource.ConnectorDataSource;
import com.archibus.app.common.connectors.domain.*;
import com.archibus.app.common.connectors.domain.ConnectorTypes.ExecFlag;
import com.archibus.app.common.connectors.exception.*;
import com.archibus.app.common.connectors.logging.common.ConnectorLogTableLogger;
import com.archibus.app.common.connectors.service.exception.ConnectorException;
import com.archibus.config.Version;
import com.archibus.jobmanager.*;
import com.archibus.utility.ExceptionBase;

/**
 * Workflow rules/jobs for managing connectors.
 *
 * @author cole
 */
public class ConnectorJob extends JobBase {
    
    /**
     * Version information for connectors.
     */
    public static final String VERSION_INFO =
            "Starting Connector Job using built-in Connectors.  Version: ["
                    + new Version().getVersion() + "]";

    /**
     * Prefix for logged error messages.
     */
    public static final String ERROR_PREFIX = "Error: ";
    
    /**
     * The package prefix for connectors.
     */
    public static final String PACKAGE_PREFIX = "com.archibus.app.common.connectors";
    
    /**
     * Number of units of progress to log for the job per step of the connector executed.
     */
    private static final int UNITS_PER_STEP = 100;
    
    /**
     * A textual log of events during connector execution.
     */
    private final Logger eventLog = Logger.getLogger(ConnectorJob.class);
    
    /**
     * The configuration for the connector to be executed by this job.
     */
    private ConnectorConfig connectorConfig;
    
    /**
     * A means for updating connector status using the connectorBean.
     */
    private IConnectorDao connectorDao;
    
    /**
     * To be used when constructed as a job.
     */
    public ConnectorJob() {
        /*
         * DAO and Bean to be set by executeConnector.
         */
        super();
    }
    
    /**
     * Create a connector with the connector configuration provided.
     *
     * @param connectorBean the connector configuration.
     * @param connectorDao a means for updating connector status using the connectorBean.
     */
    public ConnectorJob(final ConnectorConfig connectorBean, final IConnectorDao connectorDao) {
        super();
        this.connectorDao = connectorDao;
        this.connectorConfig = connectorBean;
    }
    
    /**
     * Create a connector with the connector configuration in the afm_connectors table.
     *
     * @param connectorId the identifier for the record in the afm_connectors table.
     */
    public ConnectorJob(final String connectorId) {
        super();
        this.connectorDao = new ConnectorDataSource();
        this.connectorConfig = this.connectorDao.get(connectorId);
    }
    
    /**
     * Execute a connector specified by the id and looked up from the afm_connector table.
     *
     * @param connectorId the id of the connector on the afm_connectors table.
     */
    public void executeConnector(final String connectorId) {
        this.connectorDao = new ConnectorDataSource();
        this.connectorConfig = this.connectorDao.get(connectorId);
        run();
    }
    
    /**
     * Execute a connector assigned to the connectorBean attribute of this class.
     */
    @Override
    public void run() {
        this.status.setCode(JobStatus.JOB_STARTED);
        final ConnectorLogTableLogger log =
                new ConnectorLogTableLogger(this.connectorConfig.getConnectorId());
        
        /*
         * Log beginning.
         */
        this.eventLog.info(VERSION_INFO);
        log.clear();
        log.writeMessage(VERSION_INFO);
        
        /*
         * Set status to running.
         */
        final ConnectorConfig unmodifiedConnectorBean =
                this.connectorDao.get(this.connectorConfig.getConnectorId());
        unmodifiedConnectorBean.setExecFlag(ExecFlag.RUNNING);
        this.connectorDao.update(unmodifiedConnectorBean);
        
        Throwable exception = null;
        String exceptionMessage = null;
        try {
            
            /*
             * Create the connector and execute it.
             */
            new DatabaseConfiguredConnector(this.connectorConfig.getConnectorId(), log,
                this.status, this.connectorConfig, UNITS_PER_STEP).execute();
            
            /*
             * Consider the job a success.
             */
            this.status.setCode(JobStatus.JOB_COMPLETE);
            this.status.setMessage("Success");
            ConnectorEmailHelper.sendConnectorEmailComplete(this.connectorConfig,
                log.getLogSummary());
            
        } catch (final StepException t) {
            exception = t;
            exceptionMessage =
                    new StringBuilder().append(ERROR_PREFIX)
                        .append(ExceptionUtil.getExceptionBaseMessage(t)).toString();
        } catch (final ExceptionBase t) {
            exception = t;
            exceptionMessage =
                    new StringBuilder().append(ERROR_PREFIX)
                        .append(ExceptionUtil.getExceptionBaseMessage(t))
                        .append(ExceptionUtil.getFilteredStackTrace(t, PACKAGE_PREFIX)).toString();
        } catch (final RuntimeException t) {
            /*
             * TODO the intention is to use standard job UI components to handle runtime exceptions
             * in the future, instead of catching them.
             */
            exception = t;
            final StringBuilder messageBuilder = new StringBuilder();
            messageBuilder.append(ERROR_PREFIX);
            messageBuilder.append(ExceptionUtil.getRuntimeExceptionMessage(t));
            messageBuilder.append(ExceptionUtil.getFilteredStackTrace(t, PACKAGE_PREFIX));
            exceptionMessage = messageBuilder.toString();
        } finally {
            /*
             * Reset execution status.
             */
            unmodifiedConnectorBean.setExecFlag(ExecFlag.READY);
            this.connectorDao.update(unmodifiedConnectorBean);
        }
        if (exception != null) {
            /*
             * Log exceptions and consider the job a failure.
             */
            log.writeMessage(exceptionMessage);
            this.status.setCode(JobStatus.JOB_FAILED);
            this.status.setMessage(exceptionMessage);
            log.writeMessage("Connector Failed");
            ConnectorEmailHelper.sendConnectorEmailError(this.connectorConfig, exceptionMessage);
            throw new ConnectorException(exceptionMessage, exception);
        }
    }
}
