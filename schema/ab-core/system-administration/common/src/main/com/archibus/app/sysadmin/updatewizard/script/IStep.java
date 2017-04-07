package com.archibus.app.sysadmin.updatewizard.script;


/**
 *
 * A line in the batch file script.
 *
 * @param <ResultType> the type of the result of executing the step (Void if no result expected).
 *
 * @author Catalin Purice
 * @since 22.1
 *
 * @param <ResultType>
 */
public interface IStep<ResultType> {
    /**
     * A step in a batch file workflow.
     *
     * @return the result of execution, or null if there is no result.
     */
    ResultType execute();

    /**
     * @return a descriptive name for this step.
     */
    String getName();
}
