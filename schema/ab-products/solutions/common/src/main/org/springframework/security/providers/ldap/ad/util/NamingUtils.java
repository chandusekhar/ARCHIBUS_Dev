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
package org.springframework.security.providers.ldap.ad.util;

import java.util.List;

import org.springframework.security.util.StringUtils;
import org.springframework.util.Assert;

/**
 * Utilities that prepare LDAP/Active Directory - specific strings such as principal DN, domain
 * controllers string.
 *
 * @author Valery Tydykov
 *
 */
public final class NamingUtils {
    /**
     * Utility class should not be instantiated.
     *
     * @throws InstantiationException always, since this constructor should never be called.
     */
    private NamingUtils() throws InstantiationException {
    }

    /**
     * Extracts DCs from LDAP root parameter and prepares string: "dc1.dc2".
     *
     * @param rootDn root DN. Example: "DC=dc1,DC=dc2".
     * @return generated domain controllers string in Active Directory format.
     */
    public static String prepareDomainControllers(final String rootDn) {
        final List<String> namesValues = StringUtils.tokenizeString(rootDn, ",");

        String result = "";
        for (int i = 0; i < namesValues.size(); i++) {
            if (i > 0) {
                result += ".";
            }

            final List<String> dcNameValue = StringUtils.tokenizeString(namesValues.get(i), "=");
            if (dcNameValue.size() == 2) {
                result += dcNameValue.get(1);
            }
        }

        Assert.hasLength(result, "domainControllers must not be empty");

        return result;
    }

    /**
     * Prepare principal DN in the form required by Active Directory: <code>username@dc1.dc2</code>.
     *
     * @param username username for which to generate the principalDn.
     * @param rootDn root DN. Example: "DC=dc1,DC=dc2".
     * @return generated principal DN.
     */
    public static String preparePrincipalDn(final String username, final String rootDn) {
        final String principalDn = username + "@" + prepareDomainControllers(rootDn);

        return principalDn;
    }
}
