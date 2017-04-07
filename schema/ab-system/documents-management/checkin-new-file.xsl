<?xml version="1.0" encoding="UTF-8"?>
<!-- Yong Shao -->
<!-- 2005-01-27 -->
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

                        <script language="JavaScript" src="#Attribute%//@relativeFileDirectory%/checkin-new-file.js"><xsl:value-of select="$whiteSpace"/></script>

                        <script language="JavaScript">
                                docmanager_tableName='<xsl:value-of select="//afmTableGroup/records/record/@tableName"/>';
                                docmanager_fieldName='<xsl:value-of select="//afmTableGroup/records/record/@fieldName"/>';
                                docmanager_autoNamedFile='<xsl:value-of select="//afmTableGroup/records/record/@autoNamedFile"/>';
                                docmanager_locked='<xsl:value-of select="//afmTableGroup/records/record/@locked"/>';
                                <xsl:for-each select="//afmTableGroup/records/record/pkeys/@*">
                                        docmanager_pkeys_values['<xsl:value-of select="name(.)"/>']="<xsl:value-of select='.'/>";
                                </xsl:for-each>
                                <xsl:for-each select="//preferences/documentManagement/fileTypes/fileType[@extension!='']">
                                      docmanager_allowedDocTypes['<xsl:value-of select="@extension"/>']='<xsl:value-of select="@extension"/>';
                                </xsl:for-each>
                        </script>
                        <span style="display:none" id="invalid_file_type_message"  translatable="true">Files with [{0}] extension are not allowed for check-in.</span>
                </head>

                <body onload="setUpForm()" cclass="body" leftmargin="0" rightmargin="0" topmargin="0">
                        <!-- calling template table-group-title which is in common.xsl to set up tgrp's title in the top of html page -->
                        <xsl:call-template name="table-group-title">
                                <xsl:with-param name="title" select="/*/afmTableGroup/title"/>
                        </xsl:call-template>
                        <table  width="100%" valign="top" align="center">
                                <form name="afmDocManagerInputsForm" method="post" enctype="multipart/form-data">
                                <tr>
                                        <td class="inputFieldLabel" align="left" nowrap="1">
                                                <xsl:value-of select="//message[@name='doc_name']"/>
                                        </td>
                                </tr>

                                <tr >
                                        <td>
                                                <input type="file" onkeydown="return false;" onkeypress="return false;" name="browse" value="" size="50" onchange="processingFileNameMessage(this)"/>

                                                <br/>
                                                <span class="instruction" name="autoFileName" id="autoFileName" translatable="true" style="display:none">The system will store this file under the name:</span>
                                        </td>
                                </tr>
                                <tr>
                                        <td class="inputFieldLabel" align="left" nowrap="1">
                                                <xsl:value-of select="//message[@name='description']"/>
                                        </td>
                                </tr>

                                <tr>
                                        <td>
                                                <textarea class="textareaABData" name="description" cols="65" rows="6" wrap="PHYSICAL">
                                                        <xsl:value-of select="$whiteSpace"/>
                                                </textarea>
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
                                <tr align="center">
                                        <td colspan="2" align="center">
                                                <table class="bottomActionsTable">
                                                         <tr><td>
                                                                <xsl:variable name="OK" select="//afmAction[@eventName='AbCommonResources-checkinNewFile']"/>
                                                                <input name="okButton" id="okButton" disabled="1" class="AbActionButtonFormStdWidth" type="button" value="{$OK/title}" title="{$OK/title}" onclick='onOK("{$OK/@serialized}");'/>
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
