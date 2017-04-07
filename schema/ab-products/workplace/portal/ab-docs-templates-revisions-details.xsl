<?xml version="1.0" encoding="UTF-8"?>
<!-- Author KE -->
<!-- 2006-11-10 -->
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
                        <script language="JavaScript" src="#Attribute%//@relativeFileDirectory%/ab-docs-templates-revisions-details.js"><xsl:value-of select="$whiteSpace"/></script>
                        <script language="JavaScript">        
                        	function showButton(strSerialized, fileName, tableName, fieldName, fileVersion, templateId) { 
                        		docmanager_fileName = fileName;                 
                                docmanager_tableName = tableName;
                                docmanager_fieldName = fieldName;
                                docmanager_fileVersion = fileVersion;
                                docmanager_templateId = templateId;  
                                onDocOK(strSerialized);
                            }                      
                        </script>
                </head>

                <body class="body">	
                        <!-- calling template table-group-title which is in common.xsl to set up tgrp's title in the top of html page -->
                        <xsl:call-template name="table-group-title">
                                <xsl:with-param name="title" select="/*/afmTableGroup/title"/>
                        </xsl:call-template>
                        
               <table cellspacing="0" border="1" class="AbDataTable">
                <form name="afmDocManagerInputsForm" method="post">
				<tr class="AbHeaderRecord">
					<xsl:for-each select="/*/afmTableGroup/dataSource/data/fields/field">
							<xsl:if test="@hidden='false'">
								<td>
									<xsl:value-of select="@singleLineHeading"/><br />
								</td>
							</xsl:if>							
					</xsl:for-each>
				</tr>
				<xsl:for-each select="/*/afmTableGroup/dataSource/data/records/record">
						<xsl:variable name="doc_file">
							<xsl:value-of select="@afm_docvers.doc_file"/>
						</xsl:variable>
						<xsl:variable name="table_name">
							<xsl:value-of select="@afm_docvers.table_name"/>
						</xsl:variable>
						<xsl:variable name="field_name">
							<xsl:value-of select="@afm_docvers.field_name"/>
						</xsl:variable>
						<xsl:variable name="version">
							<xsl:value-of select="@afm_docvers.version"/>
						</xsl:variable>
						<xsl:variable name="template_id">
							<xsl:value-of select="@afm_docvers.pkey_value"/>
						</xsl:variable>
					<tr class="AbDataRecord">						
						<xsl:variable name="Autocolor">
							<xsl:if test="position() mod 2 = 0">AbDataTableAutocolor</xsl:if>
						</xsl:variable>
						<td class="{$Autocolor}" nowrap="1">								
							<xsl:value-of select="@afm_docvers.version"/><br/>
						</td>
						<td class="{$Autocolor}" nowrap="1">								
							<xsl:value-of select="@afm_docvers.author"/><br/>
						</td>
						<td class="{$Autocolor}" nowrap="1">
							<xsl:variable name="showButton" select="//afmAction[@eventName='AbCommonResources-showDocument']"/>
							<a href="#" title="{$showButton/title}" onclick='showButton("{$showButton/@serialized}","{$doc_file}","{$table_name}","{$field_name}","{$version}","{$template_id}");'>
								<xsl:value-of select="@afm_docvers.doc_file"/><br/>
							</a>																
						</td>
						<td class="{$Autocolor}" nowrap="1">								
							<xsl:value-of select="@afm_docvers.doc_size"/><br/>
						</td>
						<td class="{$Autocolor}" nowrap="1">								
							<xsl:value-of select="@afm_docvers.checkin_date"/><br/>
						</td>
						<td class="{$Autocolor}" nowrap="1">								
							<xsl:value-of select="@afm_docvers.checkin_time"/><br/>
						</td>
						<td class="{$Autocolor}" nowrap="1">								
							<xsl:value-of select="@afm_docvers.comments"/><br/>
						</td>
					</tr>
				</xsl:for-each>
				<tr>
					<td align="left" nowrap="1">
                          <input name="xml" type="hidden" value=""/>
                    </td>
                </tr>
			</form></table>

			<!-- calling common.xsl -->
			<xsl:call-template name="common">
				<xsl:with-param name="title" select="/*/title"/>
				<xsl:with-param name="debug" select="//@debug"/>
				<xsl:with-param name="afmHiddenForm" select="$afmHiddenForm"/>
				<xsl:with-param name="xml" select="$xml"/>
			</xsl:call-template>
			
        </body>
        </html>
        </xsl:template>


        <!-- including template model XSLT files called in XSLT -->
        <xsl:include href="../xsl/common.xsl" />
</xsl:stylesheet>
