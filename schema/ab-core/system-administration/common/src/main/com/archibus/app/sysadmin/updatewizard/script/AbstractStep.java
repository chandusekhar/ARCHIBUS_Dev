package com.archibus.app.sysadmin.updatewizard.script;


/**
 *
 * Abstract Step interface.
 * <p>
 *
 * @author Catalin Purice
 * @since 22.1
 *
 * @param <ResultType>
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
    @Override
    public String getName() {
        return this.name;
    }
}
