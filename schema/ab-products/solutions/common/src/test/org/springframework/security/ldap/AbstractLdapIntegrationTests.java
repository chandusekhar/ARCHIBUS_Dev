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
package org.springframework.security.ldap;

import javax.naming.*;
import javax.naming.directory.DirContext;

import org.apache.directory.server.core.DirectoryService;
import org.apache.directory.server.protocol.shared.store.LdifFileLoader;
import org.springframework.context.support.ClassPathXmlApplicationContext;
import org.springframework.core.io.ClassPathResource;
import org.springframework.ldap.core.DistinguishedName;
import org.springframework.security.core.Authentication;

import junit.framework.TestCase;

/**
 * Based on class borrowed from Spring Ldap project.
 * <p>
 * This class uses embedded (if embeddedServer=true) or real LDAP server (if embeddedServer=false).
 * <p>
 * For the real LDAP server, enter url and root in realServerIntegrationTestContext.xml. Also, enter
 * username and password for the test LDAP account in realServerIntegrationTestContext.xml. Also,
 * enter the expected values in assertions.
 *
 * @author Luke Taylor
 * @author Valery Tydykov
 */
public abstract class AbstractLdapIntegrationTests extends TestCase {
    private static final String AUTHENTICATION_TOKEN_BEAN_ID = "authenticationToken";

    private boolean embeddedServer = true;

    @Override
    protected void setUp() throws Exception {
        loadContext();
    }

    @Override
    protected void tearDown() throws Exception {
        if (this.embeddedServer) {
            reloadServerDataIfDirty();
        }

        closeContext();
    }

    protected static ClassPathXmlApplicationContext appContext;

    public void loadContext() throws NamingException {
        shutdownRunningServers();

        String configLocation;
        if (this.embeddedServer) {
            configLocation = "/org/springframework/security/ldap/ldapIntegrationTestContext.xml";
        } else {
            configLocation =
                    "/org/springframework/security/ldap/realServerIntegrationTestContext.xml";
        }

        appContext = new ClassPathXmlApplicationContext(configLocation);

    }

    public void closeContext() throws Exception {
        if (appContext != null) {
            appContext.close();
        }

        shutdownRunningServers();
    }

    private void shutdownRunningServers() throws NamingException {
        if (this.embeddedServer) {
            final DirectoryService ds = DirectoryService.getInstance();

            if (ds.isStarted()) {
                System.out
                    .println("WARNING: Discovered running DirectoryService with configuration: "
                            + ds.getConfiguration().getStartupConfiguration().toString());
                System.out.println("Shutting it down...");
                ds.shutdown();
            }
        }
    }

    public final void reloadServerDataIfDirty() throws Exception {
        final ClassPathResource ldifs =
                new ClassPathResource("/org/springframework/security/ldap/test-server.ldif");

        if (!ldifs.getFile().exists()) {
            throw new IllegalStateException(
                "Ldif file not found: " + ldifs.getFile().getAbsolutePath());
        }

        final DirContext ctx = getContextSource().getReadWriteContext();

        // First of all, make sure the database is empty.
        final Name startingPoint = new DistinguishedName("dc=springframework,dc=org");

        try {
            clearSubContexts(ctx, startingPoint);
            final LdifFileLoader loader =
                    new LdifFileLoader(ctx, ldifs.getFile().getAbsolutePath());
            loader.execute();
        } finally {
            ctx.close();
        }
    }

    public DefaultSpringSecurityContextSource getContextSource() {
        return (DefaultSpringSecurityContextSource) appContext.getBean("_securityContextSource");
    }

    private void clearSubContexts(final DirContext ctx, final Name name) throws NamingException {

        NamingEnumeration enumeration = null;
        try {
            enumeration = ctx.listBindings(name);
            while (enumeration.hasMore()) {
                final Binding element = (Binding) enumeration.next();
                final DistinguishedName childName = new DistinguishedName(element.getName());
                childName.prepend((DistinguishedName) name);

                try {
                    ctx.destroySubcontext(childName);
                } catch (final ContextNotEmptyException e) {
                    clearSubContexts(ctx, childName);
                    ctx.destroySubcontext(childName);
                }
            }
        } catch (final NameNotFoundException ignored) {
        } catch (final NamingException e) {
            e.printStackTrace();
        } finally {
            try {
                enumeration.close();
            } catch (final Exception ignored) {
            }
        }
    }

    protected Authentication getUsernamePasswordAuthenticationToken() {
        return (Authentication) appContext.getBean(AUTHENTICATION_TOKEN_BEAN_ID);
    }

    public boolean isEmbeddedServer() {
        return this.embeddedServer;
    }

    public void setEmbeddedServer(final boolean embeddedServer) {
        this.embeddedServer = embeddedServer;
    }
}
