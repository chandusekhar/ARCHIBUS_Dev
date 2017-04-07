package com.archibus.app.common.connectors.transfer.ldap;

import javax.naming.directory.SearchControls;
import javax.naming.ldap.LdapName;

/**
 * The content for a request to an LDAP server.
 * 
 * @author cole
 * 
 */
public class LdapRequest {
    /**
     * A URI for what is being requested.
     */
    private final LdapName name;
    
    /**
     * A restriction on the data to be returned.
     */
    private final String filter;
    
    /**
     * How to return the data.
     */
    private final SearchControls searchControls;
    
    /**
     * @param name a URI for what is being requested.
     * @param filter a restriction on the data to be returned.
     * @param searchControls how to return the data.
     */
    public LdapRequest(final LdapName name, final String filter, final SearchControls searchControls) {
        this.name = name;
        this.filter = filter;
        this.searchControls = searchControls;
    }
    
    /**
     * @return a URI for what is being requested.
     */
    public LdapName getName() {
        return this.name;
    }
    
    /**
     * @return a restriction on the data to be returned.
     */
    public String getFilter() {
        return this.filter;
    }
    
    /**
     * @return how to return the data.
     */
    public SearchControls getSearchControls() {
        return this.searchControls;
    }
}
