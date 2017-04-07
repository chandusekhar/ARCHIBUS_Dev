package com.archibus.app.common.drawing.bim.service.impl.cloud;

/**
 *
 * Status communicating with Autodesk BIM Cloud Server.
 *
 * @author Yong Shao
 * @since 21.4
 *
 */
public class Status {
    
    /**
     * urn.
     *
     */
    private String urn;
    
    /**
     * name.
     */
    private String name;
    
    /**
     * progress.
     */
    private String progress;
    
    /**
     * status.
     */
    private String state;

    /**
     *
     * TODO getUrn.
     *
     * @return urn.
     */
    public String getUrn() {
        return this.urn;
    }
    
    /**
     *
     * TODO setUrn.
     *
     * @param urn String.
     */
    public void setUrn(final String urn) {
        this.urn = urn;
    }
    
    // CHECKSTYLE:OFF Justification: Suppress "Strict duplicate code"
    /**
     *
     * TODO getName.
     *
     * @return name.
     */
    public String getName() {
        return this.name;
    }
    
    /**
     *
     * TODO setName.
     *
     * @param name String.
     */
    public void setName(final String name) {
        this.name = name;
    }
    
    /**
     *
     * TODO getProgress.
     *
     * @return progress.
     */
    public String getProgress() {
        return this.progress;
    }
    
    /**
     *
     * TODO setProgress.
     *
     * @param progress String.
     */
    public void setProgress(final String progress) {
        this.progress = progress;
    }
    
    /**
     *
     * TODO getStatus.
     *
     * @return state.
     */
    public String getState() {
        return this.state;
    }
    
    /**
     *
     * TODO setstate.
     *
     * @param state String.
     */
    public void setState(final String state) {
        this.state = state;
    }

}
