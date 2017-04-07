package com.archibus.app.common.connectors;

import java.util.*;

import com.archibus.app.common.connectors.exception.StepException;
import com.archibus.app.common.connectors.logging.IUserLog;
import com.archibus.jobmanager.JobStatus;

/**
 * A series of steps required to migrating data between a foreign system and ARCHIBUS.
 *
 * @author cole
 *
 */
public class Connector {
    /**
     * Message indicating that a connector has begun to execute it's steps.
     */
    private static final String CONNECTOR_STARTED = "Connector ${id} started.";

    /**
     * Message indicating that a connector has finished to executing it's steps.
     */
    private static final String CONNECTOR_COMPLETE = "Connector ${id} complete.";

    /**
     * Placeholder for a connector's identifier.
     */
    private static final String CONNECTOR_ID = "${id}";

    /**
     * The identifier for the connector configuration in the database.
     */
    private final String id;

    /**
     * A log to which to write progress messages.
     */
    private final IUserLog userLog;

    /**
     * The status of the current job.
     */
    private final JobStatus jobStatus;

    /**
     * The steps to execute for this Connector, in the order they are to be executed.
     */
    private final List<IStep<?>> steps;

    /**
     * The number of work units for each step.
     */
    private final long unitsPerStep;

    /**
     * The parameters to provide to the first parameterized step.
     */
    private final Map<String, Object> initialParameters;

    /**
     * Create a linear workflow for the migration of data between a foreign system and ARCHIBUS.
     *
     * @param id the identifier for the connector configuration in the database.
     * @param userLog a log to which to write progress messages.
     * @param jobStatus the status of the current job.
     * @param steps the steps this connector should execute.
     * @param unitsPerStep the number of units of work performed by each step.
     */
    public Connector(final String id, final IUserLog userLog, final JobStatus jobStatus,
            final List<IStep<?>> steps, final long unitsPerStep) {
        this.id = id;
        this.userLog = userLog;
        this.jobStatus = jobStatus;
        this.steps = Collections.unmodifiableList(new ArrayList<IStep<?>>(steps));
        this.unitsPerStep = unitsPerStep;
        this.initialParameters = new HashMap<String, Object>();
    }

    /**
     * Create a linear workflow for the migration of data between a foreign system and ARCHIBUS.
     *
     * @param id the identifier for the connector configuration in the database.
     * @param userLog a log to which to write progress messages.
     * @param jobStatus the status of the current job.
     * @param steps the steps this connector should execute.
     * @param unitsPerStep the number of units of work performed by each step.
     * @param initialParameters the parameters to provide to the first parameterized step.
     */
    public Connector(final String id, final IUserLog userLog, final JobStatus jobStatus,
            final List<IStep<?>> steps, final long unitsPerStep,
            final Map<String, Object> initialParameters) {
        this.id = id;
        this.userLog = userLog;
        this.jobStatus = jobStatus;
        this.steps = Collections.unmodifiableList(new ArrayList<IStep<?>>(steps));
        this.unitsPerStep = unitsPerStep;
        this.initialParameters = initialParameters;
    }

    /**
     * Execute the steps that define by this Connector.
     *
     * @throws StepException thrown if any errors occur during preparation or execution of the
     *             Connector's steps.
     */
    public void execute() throws StepException {
        /*
         * Log that the connector has started executing it's workflow.
         */
        this.userLog.writeMessage(CONNECTOR_STARTED.replace(CONNECTOR_ID, this.id));
        this.jobStatus.setTotalNumber(this.steps.size() * this.unitsPerStep);
        /*
         * Execute each step.
         */
        int completedSteps = 0;
        final Map<String, Object> previousResults =
                new HashMap<String, Object>(this.initialParameters);
        for (final IStep<?> step : this.steps) {
            this.userLog.writeMessage("Started " + step.getName());
            previousResults.put(step.getName(), step.execute(previousResults));
            this.userLog.writeMessage("Completed " + step.getName());
            completedSteps++;
            this.jobStatus.setCurrentNumber(completedSteps * this.unitsPerStep);
        }
        /*
         * When finished, log that the connector is complete.
         */
        this.userLog.writeMessage(CONNECTOR_COMPLETE.replace(CONNECTOR_ID, this.id));
    }
}
