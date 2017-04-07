<?xml version="1.0" encoding="UTF-8"?>
<!-- Ying Qin -->
<!-- 2007-02-02 -->
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
                        <script language="JavaScript" src="#Attribute%//@relativeFileDirectory%/setup-license-file.js"><xsl:value-of select="$whiteSpace"/></script>
                        <script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/common.js"><xsl:value-of select="$whiteSpace"/></script>
                </head>

                <body cclass="body" leftmargin="0" rightmargin="0" topmargin="0">
                      <!-- calling template table-group-title which is in common.xsl to set up tgrp's title in the top of html page -->
                      <xsl:call-template name="table-group-title">
                        <xsl:with-param name="title" select="/*/afmTableGroup/title"/>
                      </xsl:call-template>

                     <form name="afmHiddenForm" method="post">
                      <table  width="100%" valign="top">
                          <tr align="center">
                            <td class="inputFieldLabel" nowrap="1" align="center">
                              <xsl:value-of select="//message[@name='cluster_num_servers']"/>
                              <input class="inputField" maxlength="{/*/afmTableGroup/dataSource/data/fields/field[@name='cluster_num_servers']/@size}" type="text" style="text-align: right;" name="afm_scmpref.cluster_num_servers" value="{/*/afmTableGroup/dataSource/data/records/record/@afm_scmpref.cluster_num_servers}" onchange="return validateIntegerField('{/*/afmTableGroup/dataSource/data/records/record/@afm_scmpref.cluster_num_servers}');"/>
                            </td>
                          </tr>
                      </table>
                      <table class="bottomActionsTable">
                        <tr align="center">
                           <td>
                             <xsl:variable name="OK" select="//afmAction[@eventName='AbSystemAdministration-checkinLicense']"/>
                             <input name="okButton" id="okButton" style="width=70" type="button" value="{$OK/title}" title="{$OK/title}" onclick="return checkinLicense('{/*/afmTableGroup/dataSource/data/records/record/@afm_scmpref.cluster_num_servers}','{$OK/@serialized}');"/>
                             <xsl:variable name="cancel_message" select="//message[@name='cancel']"/>
                             <input style="width=70" type="button" value="{$cancel_message}" title="{$cancel_message}" onclick='window.location.reload();'/>
                           </td>
                         </tr>
                        </table>
                        <table>
                             <tr>
                               <td align="left" nowrap="1">
                                 <input name="xml" type="hidden" value=""/>
                               </td>
                             </tr>
                        </table>
                      </form>
                      <span style="display:none" id="general_invalid_input_warning_message_integer"  translatable="true">Invalid input! Please enter an integer.</span>
                    </body>
                </html>
        </xsl:template>


        <!-- including template model XSLT files called in XSLT -->
        <xsl:include href="../xsl/common.xsl" />
        <xsl:include href="../xsl/inputs-validation.xsl" />
</xsl:stylesheet>
