package com.archibus.app.common.connectors.transfer.ldap;

import javax.naming.Context;

/**
 * An enumeration for values in javax.naming.Context that are valid for an LDAP context. Javadoc
 * taken from the same.
 *
 * @author cole
 *
 */
public enum LdapContextAttribute {
    /**
     * Constant that holds the name of the environment property for specifying an applet for the
     * initial context constructor to use when searching for other properties.
     */
    APPLET(Context.APPLET), AUTHORITATIVE(Context.AUTHORITATIVE), BATCHSIZE(Context.BATCHSIZE), DNS_URL(
            Context.DNS_URL),
    /**
     * Constant that holds the name of the environment property for specifying the authoritativeness
     * of the service requested.
     */
    INITIAL_CONTEXT_FACTORY(Context.INITIAL_CONTEXT_FACTORY),
    /**
     * Constant that holds the name of the environment property for specifying the preferred
     * language to use with the service.
     */
    LANGUAGE(Context.LANGUAGE),
    /**
     * Constant that holds the name of the environment property for specifying the list of object
     * factories to use.
     */
    OBJECT_FACTORIES(Context.OBJECT_FACTORIES),
    /**
     * Constant that holds the name of the environment property for specifying configuration
     * information for the service provider to use.
     */
    PROVIDER_URL(Context.PROVIDER_URL),
    /**
     * Constant that holds the name of the environment property for specifying how referrals
     * encountered by the service provider are to be processed.
     */
    REFERRAL(Context.REFERRAL),
    /**
     * Constant that holds the name of the environment property for specifying the security level to
     * use.
     */
    SECURITY_AUTHENTICATION(Context.SECURITY_AUTHENTICATION),
    /**
     * Constant that holds the name of the environment property for specifying the credentials of
     * the principal for authenticating the caller to the service.
     */
    SECURITY_CREDENTIALS(Context.SECURITY_CREDENTIALS),
    /**
     * Constant that holds the name of the environment property for specifying the identity of the
     * principal for authenticating the caller to the service.
     */
    SECURITY_PRINCIPAL(Context.SECURITY_PRINCIPAL),
    /**
     * Constant that holds the name of the environment property for specifying the security protocol
     * to use.
     */
    SECURITY_PROTOCOL(Context.SECURITY_PROTOCOL),
    /**
     * Constant that holds the name of the environment property for specifying the list of state
     * factories to use.
     */
    STATE_FACTORIES(Context.STATE_FACTORIES),
    /**
     * Constant that holds the name of the environment property for specifying the list of package
     * prefixes to use when loading in URL context factories.
     */
    URL_PKG_PREFIXES(Context.URL_PKG_PREFIXES);
    
    /**
     * The value of the constant in javax.naming.Context.
     */
    private final String parameterKey;
    
    /**
     * @param parameterKey the value of the constant in javax.naming.Context.
     */
    private LdapContextAttribute(final String parameterKey) {
        this.parameterKey = parameterKey;
    }
    
    /**
     * @return the value of the constant in javax.naming.Context.
     */
    public String getParameterKey() {
        return this.parameterKey;
    }
}
