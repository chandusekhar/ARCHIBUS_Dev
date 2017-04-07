package com.archibus.app.common.connectors;

import java.util.Map;

import com.archibus.app.common.connectors.exception.StepException;

/**
 * A phase in the data migration process of a Connector.
 * 
 * @param <ResultType> the type of the result of executing the step (Void if no result expected).
 * 
 * @author cole
 */
public interface IStep<ResultType> {
    /**
     * A step in a connector's workflow.
     * 
     * @param previousResults results of previous steps by step name.
     * @return the result of execution, or null if there is no result.
     * @throws StepException thrown when any error occurs during the execution of this step.
     */
    ResultType execute(final Map<String, Object> previousResults) throws StepException;
    
    /**
     * @return a descriptive name for this step.
     */
    String getName();
}
