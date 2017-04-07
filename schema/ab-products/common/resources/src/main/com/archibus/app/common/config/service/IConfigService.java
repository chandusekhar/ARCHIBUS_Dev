package com.archibus.app.common.config.service;

import javax.ws.rs.*;

/**
 * API of the config service for mobile and other applications.
 * <p>
 * Non-authenticated users are allowed to invoke all methods in this service.
 * <p>
 * Exposed to mobile client as RESTful service using CXF, configured in services.xml.
 * 
 * @author Valery Tydykov
 * 
 * @since 21.3
 */
@Path("/configs")
public interface IConfigService {
    /**
     * Returns WebCentral version.
     * 
     * @return WebCentral version.
     */
    @GET
    @Path("/version")
    int getVersion();
    
    /**
     * Returns WebCentral revision.
     * 
     * @return WebCentral revision.
     */
    @GET
    @Path("/revision")
    int getRevision();
    
    /**
     * Returns WebCentral database schema version.
     * 
     * @return WebCentral database schema version.
     */
    @GET
    @Path("/schemaversion")
    int getSchemaVersion();
    
    /**
     * Returns WebCentral Cordova library version.
     * 
     * @return WebCentral Cordova library version.
     */
    @GET
    @Path("/cordovaversion")
    String getCordovaVersion();
}
