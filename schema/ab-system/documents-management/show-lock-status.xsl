<?xml version="1.0" encoding="UTF-8"?>
<!-- Yong Shao -->
<!-- 2005-02-7 -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
        <!-- importing xsl files -->
        <!-- constants.xsl which contains constant XSLT variables -->
        <xsl:import href="../xsl/constants.xsl" />

        <!-- top template  -->
        <xsl:template match="/">
                <html>
                <title>
                        <!-- since browser cannot handle <title />, using a XSL whitespace avoids XSL processor -->
                        <!-- to generate <title /> if there is no title in source XML -->
                        <xsl:value-of select="/*/title"/><xsl:value-of select="$whiteSpace"/>
                </title>
                <head>
                        <!-- template: Html-Head-Setting in common.xsl -->
                        <xsl:call-template name="Html-Head-Setting"/>
                        <!-- calling template LinkingCSS in common.xsl -->
                        <xsl:call-template name="LinkingCSS"/>
                        <script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/common.js"><xsl:value-of select="$whiteSpace"/></script>

                        <script language="JavaScript" src="#Attribute%//@relativeFileDirectory%/show-lock-status.js"><xsl:value-of select="$whiteSpace"/></script>

                        <script language="JavaScript">
                                docmanager_tableName='<xsl:value-of select="//afmTableGroup/records/record/@tableName"/>';
                                docmanager_fieldName='<xsl:value-of select="//afmTableGroup/records/record/@fieldName"/>';
                                docmanager_autoNamedFile='<xsl:value-of select="//afmTableGroup/records/record/@autoNamedFile"/>';
                                docmanager_locked='<xsl:value-of select="//afmTableGroup/records/record/@locked"/>';
                                docmanager_fileName='<xsl:value-of select="//afmTableGroup/records/record/@fileName"/>';

                                enableBreakExistingLock='<xsl:value-of select="//afmTableGroup/records/record/@enableBreakExistingLock"/>';;
                                <xsl:for-each select="//afmTableGroup/records/record/pkeys/@*">
                                        docmanager_pkeys_values['<xsl:value-of select="name(.)"/>']="<xsl:value-of select='.'/>";
                                </xsl:for-each>
                        </script>
                </head>

                <body onload="setUpForm()" cclass="body" leftmargin="0" rightmargin="0" topmargin="0">
                        <!-- calling template table-group-title which is in common.xsl to set up tgrp's title in the top of html page -->
                        <xsl:call-template name="table-group-title">
                                <xsl:with-param name="title" select="/*/afmTableGroup/title"/>
                        </xsl:call-template>
                        <table  width="100%" valign="top" align="center">
                                <form name="afmDocManagerInputsForm" method="post">
                                <tr>
                                        <td>
                                                <div id="breakExistingLockMessageArea" name="breakExistingLockMessageArea" style="display:none">
                                                        <table>
                                                                <tr>
                                                                        <td class="legendTitle" align="left" nowrap="1" translatable="true">Locked by:</td>
                                                                        <td class="inputFieldLabel" align="left" nowrap="1"><xsl:value-of select="//afmTableGroup/records/record/@lockedBy"/></td>
                                                                </tr>
                                                                <tr>
                                                                        <td class="legendTitle" align="left" nowrap="1" translatable="true">on:</td>
                                                                        <td class="inputFieldLabel" align="left" nowrap="1"><xsl:value-of select="//afmTableGroup/records/record/@lockedDate"/></td>
                                                                </tr>
                                                                <tr>
                                                                        <td class="legendTitle" align="left" nowrap="1" translatable="true">at:</td>
                                                                        <td class="inputFieldLabel" align="left" nowrap="1"><xsl:value-of select="//afmTableGroup/records/record/@lockedTime"/></td>
                                                                </tr>
                                                        </table>
                                                </div>
                                        </td>
                                </tr>
                                <tr>
                                        <td><hr /></td>
                                </tr>
                                <tr>
                                        <td class="inputFieldLabel" align="left" nowrap="1">
                                                <xsl:value-of select="//message[@name='lock']"/>
                                        </td>
                                </tr>
                                <tr>
                                        <td>
                                                <table>
                                                        <tr>
                                                                <td>
                                                                        <input id="locked" type="radio" name="lock" value="0" checked="1"/>
                                                                </td>
                                                                <td>
                                                                        <span class="legendTitle" translatable="true">Locked</span>
                                                                </td>
                                                                <td>
                                                                        <input id="unlocked" type="radio" name="lock" value="1"/>
                                                                </td>
                                                                <td>
                                                                        <span class="legendTitle" translatable="true">Unlocked</span>
                                                                </td>
                                                        </tr>
                                                </table>
                                        </td>
                                </tr>
                                <tr>

                                        <td align="left" nowrap="1">
                                                <div id="breakExistingLockArea" name="breakExistingLockArea" style="display:none">
                                                        <input name="break" type="checkbox"/><span class="legendTitle"><xsl:value-of select="//message[@name='break']"/></span>
                                                </div>
                                        </td>

                                </tr>
                                <tr align="center">
                                        <td colspan="2" align="center">
                                                <table class="bottomActionsTable">
                                                         <tr><td>
                                                                <xsl:variable name="OK" select="//afmAction[@eventName='AbCommonResources-changeLockStatus']"/>
                                                                <input class="AbActionButtonFormStdWidth" type="button" value="{$OK/title}" title="{$OK/title}" onclick='onOK("{$OK/@serialized}");'/>
                                                                <xsl:variable name="cancel_message" select="//message[@name='cancel']"/>
                                                                <input class="AbActionButtonFormStdWidth" type="button" value="{$cancel_message}" title="{$cancel_message}" onclick='window.top.close()'/>
                                                        </td></tr>
                                                </table>
                                        </td>
                                </tr>
                                <tr>
                                        <td align="left" nowrap="1">
                                                <input name="xml" type="hidden" value=""/>
                                        </td>
                                </tr>
                                </form>
                        </table>
                </body>
                </html>
        </xsl:template>


        <!-- including template model XSLT files called in XSLT -->
        <xsl:include href="../xsl/common.xsl" />
</xsl:stylesheet>
