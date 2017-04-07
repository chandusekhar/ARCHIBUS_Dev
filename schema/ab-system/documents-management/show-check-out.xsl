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

                        <script language="JavaScript" src="#Attribute%//@relativeFileDirectory%/show-check-out.js"><xsl:value-of select="$whiteSpace"/></script>

                        <script language="JavaScript">
                                docmanager_tableName='<xsl:value-of select="//afmTableGroup/records/record/@tableName"/>';
                                docmanager_fieldName='<xsl:value-of select="//afmTableGroup/records/record/@fieldName"/>';
                                docmanager_autoNamedFile='<xsl:value-of select="//afmTableGroup/records/record/@autoNamedFile"/>';
                                docmanager_locked='<xsl:value-of select="//afmTableGroup/records/record/@locked"/>';
                                docmanager_pkey_value='<xsl:value-of select="//afmTableGroup/records/record/@pkey_value"/>';
                                <xsl:for-each select="//afmTableGroup/records/record/pkeys/@*">
                                        docmanager_pkeys_values['<xsl:value-of select="name(.)"/>']="<xsl:value-of select='.'/>";
                                </xsl:for-each>

                        </script>
                </head>

                <body onload="setDocUpForm()" class="body" leftmargin="0" rightmargin="0" topmargin="0">
                        <!-- calling template table-group-title which is in common.xsl to set up tgrp's title in the top of html page -->
                        <xsl:call-template name="table-group-title">
                                <xsl:with-param name="title" select="/*/afmTableGroup/title"/>
                        </xsl:call-template>
                        <table  width="100%" valign="top" align="center">
                                <form name="afmDocManagerInputsForm" method="post">
                                <tr>
                                        <td class="inputFieldLabel" align="left" nowrap="1">
                                                <xsl:value-of select="//message[@name='doc_name']"/>
                                        </td>
                                </tr>

                                <tr >
                                        <td>
                                                <xsl:variable name="fileName" select="//afmTableGroup/records/record/@fileName"/>
                                                <input type="text" onkeydown="return false;" onkeypress="return false;" name="afm_docvers.doc_file" id="afm_docvers.doc_file" value="{$fileName}" size="50"/>
                                        </td>
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
                                        <td class="inputFieldLabel" align="left" nowrap="1">
                                                <xsl:value-of select="//message[@name='version']"/>
                                        </td>
                                </tr>
                                <tr>
                                        <td>
                                                <xsl:variable name="afmAction" select="//afmAction[@type='selectValue']"/>
                                                <xsl:variable name="lastVersion" select="//afmTableGroup/records/record/@lastVersion"/>
                                                <input type="text" name="afm_docvers.version" id="afm_docvers.version" onkeydown="return false;" onkeypress="return false;"  value="{$lastVersion}" size="25"/>
                                                <input class="selectValue_AbActionButtonFormStdWidth" type="button" title="{$afmAction/tip}" value="{$afmAction/title}" onclick='onSelectV("{$afmAction/@serialized}","afm_docvers.version","afmDocManagerInputsForm"); selectedValueInputFormName="afmDocManagerInputsForm" ; selectValueInputFieldID="afm_docvers.version" ;'/>
                                        </td>
                                </tr>
                                <tr>
                                        <td class="inputFieldLabel" align="left" nowrap="1">
                                                <xsl:value-of select="//message[@name='doc_size']"/>
                                        </td>
                                </tr>
                                <tr>
                                        <td>
                                                <xsl:variable name="afmAction" select="//afmAction[@type='selectValue']"/>
                                                <xsl:variable name="docSize" select="//afmTableGroup/records/record/@lastVersionDocSize"/>
                                                <input type="text" name="afm_docvers.doc_size" id="afm_docvers.doc_size" onkeydown="return false;" onkeypress="return false;"  value="{$docSize}" size="25"/>
                                        </td>
                                </tr>
                                <tr align="center">
                                        <td colspan="2" align="center">
                                                <table class="bottomActionsTable">
                                                         <tr><td>
                                                                <xsl:variable name="OK" select="//afmAction[@eventName='AbCommonResources-checkOut']"/>
                                                                <input class="AbActionButtonFormStdWidth" type="button" value="{$OK/title}" title="{$OK/title}" onclick='onDocOK("{$OK/@serialized}");'/>
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
                                <!-- calling common.xsl -->
                                <xsl:call-template name="common">
                                        <xsl:with-param name="title" select="/*/title"/>
                                        <xsl:with-param name="debug" select="//@debug"/>
                                        <xsl:with-param name="afmHiddenForm" select="$afmHiddenForm"/>
                                        <xsl:with-param name="xml" select="$xml"/>
                                </xsl:call-template>
                        </table>
                </body>
                </html>
        </xsl:template>


        <!-- including template model XSLT files called in XSLT -->
        <xsl:include href="../xsl/common.xsl" />
</xsl:stylesheet>
