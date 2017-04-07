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
package org.springframework.security.userdetails.preauth;

import org.springframework.security.core.*;

/**
 * Interface to be implemented by classes that need Maps username (from primary user account
 * repository, e.g. LDAP) to username in secondary user account repository.
 *
 *
 * @author Valery Tydykov
 *
 */
public interface AccountMapper {
    /**
     * Maps username from authentication to username in secondary user account repository.
     *
     * @param authentication authentication with username from the primary user account repository.
     * @return username from secondary user account repository.
     * @throws AuthenticationException if username cannot be mapped.
     */
    String map(Authentication authentication) throws AuthenticationException;
}
