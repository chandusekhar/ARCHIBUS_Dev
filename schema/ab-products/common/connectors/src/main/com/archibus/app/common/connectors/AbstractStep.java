package com.archibus.app.common.connectors;

/**
 * A named step.
 * 
 * @param <ResultType> the type of the result of executing the step (Void if no result expected).
 * 
 * @author cole
 * 
 */
public abstract class AbstractStep<ResultType> implements IStep<ResultType> {
    /**
     * A descriptive name for this step.
     */
    private final String name;
    
    /**
     * Create this step.
     * 
     * @param name a descriptive name for this step
     */
    protected AbstractStep(final String name) {
        this.name = name;
    }
    
    /**
     * @return a descriptive name for this step.
     */
    public String getName() {
        return this.name;
    }
}
