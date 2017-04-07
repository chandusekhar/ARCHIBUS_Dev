package com.archibus.app.common.connectors.translation.ldap.inbound;

import java.util.*;

import javax.naming.directory.SearchControls;
import javax.naming.ldap.LdapName;

import com.archibus.app.common.connectors.transfer.ldap.LdapRequest;
import com.archibus.app.common.connectors.translation.common.outbound.IRequestTemplate;

/**
 * Template for a request for data over LDAP.
 * 
 * @author cole
 * 
 */
public class LdapReadRequestTemplate implements IRequestTemplate<LdapRequest> {
    
    /**
     * Parameter for a URI for what is being requested.
     */
    private final String ldapNameParameter;
    
    /**
     * Parameter for a restriction on the data to be returned.
     */
    private final String ldapFilterParameter;
    
    /**
     * Parameter for how to return the data.
     */
    private final String ldapSourceControlsParameter;
    
    /**
     * @param ldapNameParameter parameter for a URI for what is being requested.
     * @param ldapFilterParameter parameter for a restriction on the data to be returned.
     * @param ldapSourceControlsParameter parameter for how to return the data.
     */
    public LdapReadRequestTemplate(final String ldapNameParameter,
            final String ldapFilterParameter, final String ldapSourceControlsParameter) {
        super();
        this.ldapNameParameter = ldapNameParameter;
        this.ldapFilterParameter = ldapFilterParameter;
        this.ldapSourceControlsParameter = ldapSourceControlsParameter;
    }
    
    /**
     * @param templateParameters parameters for creating an LDAP request.
     * @return a singleton set with the template parameters.
     */
    public Iterable<? extends Map<String, Object>> generateRequestParameters(
            final Map<String, Object> templateParameters) {
        return Collections.singleton(templateParameters);
    }
    
    /**
     * @param requestParameters parameters for creating an LDAP request.
     * @return an LdapRequest constructed using those parameters.
     */
    public LdapRequest generateRequest(final Map<String, Object> requestParameters) {
        return new LdapRequest((LdapName) requestParameters.get(this.ldapNameParameter),
            (String) requestParameters.get(this.ldapFilterParameter),
            (SearchControls) requestParameters.get(this.ldapSourceControlsParameter));
    }
    
}
