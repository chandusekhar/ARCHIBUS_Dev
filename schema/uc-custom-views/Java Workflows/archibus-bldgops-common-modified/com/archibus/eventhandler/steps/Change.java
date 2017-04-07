package com.archibus.eventhandler.steps;

import com.archibus.jobmanager.EventHandlerContext;

/**
 *
 * Change Step.
 */
public class Change extends StepImpl {

    /**
     * Constructor setting step information.
     *
     * @param context Workflow rule execution context
     * @param activityId Activity id
     * @param id Primary key value
     * @param comments comments
     */
    public Change(final EventHandlerContext context, final String activityId, final int id,
            final String comments) {
        super(context, activityId, id, "change", "Change");
        this.setComments(comments);
    }

    /**
     *
     * Change step ends directly after invoke.
     *
     * @return true
     */
    @Override
    public boolean hasEnded() {
        return true;
    }

    /**
     *
     * Change step is never in progress.
     *
     * @return false
     *
     */
    @Override
    public boolean inProgress() {
        return false;
    }

    /**
     *
     * Invoke this step.
     *
     */
    @Override
    public void invoke() {
        setStepEnded(true);
        // than log to database
        this.stepCode = logStep();
    }

}
