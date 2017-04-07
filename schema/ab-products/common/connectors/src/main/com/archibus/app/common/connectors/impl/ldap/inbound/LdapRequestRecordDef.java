package com.archibus.app.common.connectors.impl.ldap.inbound;

import java.util.*;

import com.archibus.app.common.connectors.translation.common.outbound.impl.*;

/**
 * Defines a method for translating a record containing LDAP query parameters into a record
 * containing an LdapRequest that can be used by an LdapAdaptor.
 * 
 * @author cole
 */
public class LdapRequestRecordDef extends RequestDef<NoTranslationRequestFieldDef> {
    
    /**
     * Create a method for translating a record containing LDAP query parameters into a record
     * containing an LdapRequest that can be used by an LdapAdaptor.
     * 
     * @param ldapNameParameter parameter name for the name to use when searching LDAP.
     * @param ldapFilterParameter parameter name for the filter to use when searching LDAP.
     * @param ldapSourceControlsParameter parameter name for the source controls to use when
     *            searching LDAP.
     */
    public LdapRequestRecordDef(final String ldapNameParameter, final String ldapFilterParameter,
            final String ldapSourceControlsParameter) {
        super(createFieldDefinitions(ldapNameParameter, ldapFilterParameter,
            ldapSourceControlsParameter));
    }
    
    /**
     * @param ldapNameParameter parameter name for the name to use when searching LDAP.
     * @param ldapFilterParameter parameter name for the filter to use when searching LDAP.
     * @param ldapSourceControlsParameter parameter name for the source controls to use when
     *            searching LDAP.
     * @return a list of fields, one for each parameter.
     */
    private static List<NoTranslationRequestFieldDef> createFieldDefinitions(
            final String ldapNameParameter, final String ldapFilterParameter,
            final String ldapSourceControlsParameter) {
        final List<NoTranslationRequestFieldDef> fieldDefs =
                new ArrayList<NoTranslationRequestFieldDef>();
        fieldDefs.add(new NoTranslationRequestFieldDef(ldapNameParameter));
        fieldDefs.add(new NoTranslationRequestFieldDef(ldapFilterParameter));
        fieldDefs.add(new NoTranslationRequestFieldDef(ldapSourceControlsParameter));
        return fieldDefs;
    }
}
