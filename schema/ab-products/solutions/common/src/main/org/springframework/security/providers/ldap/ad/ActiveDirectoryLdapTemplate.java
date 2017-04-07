/*
 * Copyright 2004, 2005, 2006 Acegi Technology Pty Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing permissions and limitations under
 * the License.
 */
package org.springframework.security.providers.ldap.ad;

import java.util.*;

import javax.naming.NamingEnumeration;
import javax.naming.directory.*;

import org.apache.commons.logging.*;
import org.springframework.ldap.NamingException;
import org.springframework.ldap.core.*;
import org.springframework.security.ldap.SpringSecurityLdapTemplate;

/**
 * ActiveDirectory equivalent of the SpringSecurityLdapTemplate class.
 * <p>
 * Simplifies ActiveDirectory access within Spring Security's ActiveDirectory-related services.
 *
 * @author Valery Tydykov
 *
 */
public class ActiveDirectoryLdapTemplate extends SpringSecurityLdapTemplate {
    /**
     * Null-op DirContextProcessor.
     */
    static class NullDirContextProcessor implements DirContextProcessor {
        @Override
        public void postProcess(final DirContext ctx) throws NamingException {
            // Do nothing
        }

        @Override
        public void preProcess(final DirContext ctx) throws NamingException {
            // Do nothing
        }
    }

    /**
     * Logger for this class and subclasses.
     */
    protected final Log logger = LogFactory.getLog(this.getClass());

    /**
     * Property: Default search controls.
     */
    private final SearchControls searchControls = new SearchControls();

    /**
     * Constructor specifying contextSource.
     *
     * @param contextSource supplies contexts used to searches.
     */
    public ActiveDirectoryLdapTemplate(final ContextSource contextSource) {
        super(contextSource);

        this.searchControls.setSearchScope(SearchControls.SUBTREE_SCOPE);
    }

    /**
     * Performs a search using the supplied filter and returns the union of the values of the named
     * attribute found in all entries matched by the search. Note that one directory entry may have
     * several values for the attribute. Intended for role searches and similar scenarios.
     *
     * @param base the DN to search in.
     * @param filter search filter to use.
     * @param params parameters to substitute in the search filter.
     * @param controls controls specified for the attribute.
     * @param mapper mapper that performs actual values extraction.
     * @return set of String values for the attribute as a union of the values found in all the
     *         matching entries.
     */
    public List<Object> search(final String base, final String filter, final Object[] params,
            final SearchControls controls, final ContextMapper<Object> mapper) {
        return search(base, filter, params, controls, mapper, new NullDirContextProcessor());
    }

    /**
     * Performs a search using the supplied filter and returns the union of the values of the named
     * attribute found in all entries matched by the search. Note that one directory entry may have
     * several values for the attribute. Intended for role searches and similar scenarios.
     *
     * @param base the DN to search in.
     * @param filter search filter to use.
     * @param params parameters to substitute in the search filter.
     * @param controls controls specified for the attribute.
     * @param mapper mapper that performs actual values extraction.
     * @param processor DirContextProcessor for custom pre- and post-processing.
     * @return set of String values for the attribute as a union of the values found in all the
     *         matching entries.
     */
    public List<Object> search(final String base, final String filter, final Object[] params,
            final SearchControls controls, final ContextMapper<Object> mapper,
            final DirContextProcessor processor) {
        final ContextMapperCallbackHandler<Object> handler =
                new ContextMapperCallbackHandler<Object>(mapper);
        search(base, filter, params, controls, handler, processor);

        return handler.getList();
    }

    /**
     * Performs a search using the supplied filter and returns the union of the values of the named
     * attribute found in all entries matched by the search. Note that one directory entry may have
     * several values for the attribute. Intended for role searches and similar scenarios.
     *
     * @param base the DN to search in.
     * @param filter search filter to use.
     * @param params parameters to substitute in the search filter.
     * @param controls controls specified for the attribute.
     * @param handler the NameClassPairCallbackHandler to which each found entry will be passed.
     * @param processor DirContextProcessor for custom pre- and post-processing.
     */
    public void search(final String base, final String filter, final Object[] params,
            final SearchControls controls, final NameClassPairCallbackHandler handler,
            final DirContextProcessor processor) {

        // Create a SearchExecutor to perform the search.
        final SearchExecutor executor = new SearchExecutor() {
            @Override
            public NamingEnumeration<SearchResult> executeSearch(final DirContext ctx)
                    throws javax.naming.NamingException {
                return ctx.search(base, filter, params, controls);
            }
        };

        search(executor, handler, processor);
    }

    @Override
    public Set<String> searchForSingleAttributeValues(final String base, final String filter,
            final Object[] params, final String attributeName) {
        final Set<String> result = new HashSet<String>();

        final ContextMapper<Object> mapper = new ContextMapper<Object>() {
            @Override
            public Object mapFromContext(final Object ctx) {
                final DirContextAdapter adapter = (DirContextAdapter) ctx;
                // Get all values for attributeName
                final String[] values = adapter.getStringAttributes(attributeName);
                if (values == null || values.length == 0) {
                    if (ActiveDirectoryLdapTemplate.this.logger.isDebugEnabled()) {
                        ActiveDirectoryLdapTemplate.this.logger
                            .debug("No attribute value found for '" + attributeName + "'");
                    }
                } else {
                    // return all values for attributeName
                    result.addAll(Arrays.asList(values));
                }

                return null;
            }
        };

        final SearchControls controls = new SearchControls();
        controls.setSearchScope(this.searchControls.getSearchScope());
        controls.setReturningAttributes(new String[] { attributeName });
        // ActiveDirectory - specific
        controls.setReturningObjFlag(true);

        // ActiveDirectory - specific
        search(base, filter, params, controls, mapper);

        return result;
    }
}
