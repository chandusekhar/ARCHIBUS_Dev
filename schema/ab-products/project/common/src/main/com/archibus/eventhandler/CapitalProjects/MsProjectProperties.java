package com.archibus.eventhandler.CapitalProjects;

import java.util.HashMap;

import java_cup.version;

import com.archibus.eventhandler.CapitalProjects.MsProjectConstants.MsProjectVersion;
import com.archibus.utility.FileUtil;

public class MsProjectProperties {

    private String projectId;

    private String workPackageId;

    private boolean hasWorkpackage;

    private String serverFileName;
    
    private MsProjectVersion version = MsProjectVersion.V2010;

    public MsProjectProperties(final String projectId, final String workPackageId) {
        this.projectId = projectId;
        this.workPackageId = workPackageId;
        
        if (this.workPackageId.equals("")) {
            this.hasWorkpackage = false;
            this.serverFileName = this.projectId + ".mpp";
        } else {
            this.hasWorkpackage = true;
            this.serverFileName = this.projectId + "-" + this.workPackageId + ".mpp";
        }
        
        this.serverFileName = FileUtil.returnValidFileName(this.serverFileName);
    }

    public String getProjectName() {
        String projectName = this.projectId;
        if (this.hasWorkpackage) {
            projectName += "|" + this.workPackageId;
        }
        return projectName;
    }

    // this map contains a map of project field name and its corresponding fieldId in Ms Project's
    // extended attribute.
    HashMap<String, String> extendedAttributeFieldMap = new HashMap<String, String>();

    // this map contains a map of task's activity_log id and its uid pair.
    HashMap<String, Integer> uidMap = new HashMap<String, Integer>();

    // this map contains a map of task uid and its predecessor's activity_log_id value pair.
    HashMap<Integer, String> predecessorMap = new HashMap<Integer, String>();

    // this map contains a map of task uid and its percent completed value pair.
    HashMap<Integer, Integer> percentCompleteMap = new HashMap<Integer, Integer>();

    /**
     * Getter for the hasWorkpackage property.
     *
     * @see hasWorkpackage
     * @return the hasWorkpackage property.
     */
    public boolean isHasWorkpackage() {
        return this.hasWorkpackage;
    }
    
    /**
     * Setter for the hasWorkpackage property.
     *
     * @see hasWorkpackage
     * @param hasWorkpackage the hasWorkpackage to set
     */

    public void setHasWorkpackage(final boolean hasWorkpackage) {
        this.hasWorkpackage = hasWorkpackage;
    }
    
    /**
     * Getter for the serverFileName property.
     *
     * @see serverFileName
     * @return the serverFileName property.
     */
    public String getServerFileName() {
        return this.serverFileName;
    }
    
    /**
     * Setter for the serverFileName property.
     *
     * @see serverFileName
     * @param serverFileName the serverFileName to set
     */

    public void setServerFileName(final String serverFileName) {
        this.serverFileName = serverFileName;
    }
    
    /**
     * Getter for the extendedAttributeFieldMap property.
     *
     * @see extendedAttributeFieldMap
     * @return the extendedAttributeFieldMap property.
     */
    public HashMap<String, String> getExtendedAttributeFieldMap() {
        return this.extendedAttributeFieldMap;
    }
    
    /**
     * Setter for the extendedAttributeFieldMap property.
     *
     * @see extendedAttributeFieldMap
     * @param extendedAttributeFieldMap the extendedAttributeFieldMap to set
     */

    public void setExtendedAttributeFieldMap(final HashMap<String, String> extendedAttributeFieldMap) {
        this.extendedAttributeFieldMap = extendedAttributeFieldMap;
    }
    
    /**
     * Getter for the uidMap property.
     *
     * @see uidMap
     * @return the uidMap property.
     */
    public HashMap<String, Integer> getUidMap() {
        return this.uidMap;
    }
    
    /**
     * Setter for the uidMap property.
     *
     * @see uidMap
     * @param uidMap the uidMap to set
     */

    public void setUidMap(final HashMap<String, Integer> uidMap) {
        this.uidMap = uidMap;
    }
    
    /**
     * Getter for the predecessorMap property.
     *
     * @see predecessorMap
     * @return the predecessorMap property.
     */
    public HashMap<Integer, String> getPredecessorMap() {
        return this.predecessorMap;
    }
    
    /**
     * Setter for the predecessorMap property.
     *
     * @see predecessorMap
     * @param predecessorMap the predecessorMap to set
     */

    public void setPredecessorMap(final HashMap<Integer, String> predecessorMap) {
        this.predecessorMap = predecessorMap;
    }
    
    /**
     * Getter for the percentCompleteMap property.
     *
     * @see percentCompleteMap
     * @return the percentCompleteMap property.
     */
    public HashMap<Integer, Integer> getPercentCompleteMap() {
        return this.percentCompleteMap;
    }
    
    /**
     * Setter for the percentCompleteMap property.
     *
     * @see percentCompleteMap
     * @param percentCompleteMap the percentCompleteMap to set
     */

    public void setPercentCompleteMap(final HashMap<Integer, Integer> percentCompleteMap) {
        this.percentCompleteMap = percentCompleteMap;
    }

    /**
     * Getter for the projectId property.
     *
     * @see projectId
     * @return the projectId property.
     */
    public String getProjectId() {
        return this.projectId;
    }
    
    /**
     * Getter for the workPackageId property.
     *
     * @see workPackageId
     * @return the workPackageId property.
     */
    public String getWorkPackageId() {
        return this.workPackageId;
    }
    
    /**
     * Setter for the projectId property.
     *
     * @see projectId
     * @param projectId the projectId to set
     */
    
    public void setProjectId(final String projectId) {
        this.projectId = projectId;
    }

    /**
     * Setter for the workPackageId property.
     *
     * @see workPackageId
     * @param workPackageId the workPackageId to set
     */
    
    public void setWorkPackageId(final String workPackageId) {
        this.workPackageId = workPackageId;
    }
    
    /**
     * Getter for the version property.
     *
     * @see version
     * @return the version property.
     */
    public MsProjectVersion getVersion() {
        return this.version;
    }

    /**
     * Setter for the version property.
     *
     * @see version
     * @param version the version to set
     */

    public void setVersion(final MsProjectVersion version) {
        this.version = version;
    }

}
