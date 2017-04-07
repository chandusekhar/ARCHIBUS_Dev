<?xml version="1.0" encoding="UTF-8"?>
<!-- top xsl called by Java to handle Navigator XML data-->
<!-- javascript variables or functions used here are in common.js  -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<!-- importing constants.xsl which contains constant XSLT variables -->
	<xsl:import href="../../../ab-system/xsl/constants.xsl" />
	<!-- specified XSLT variables for this XSLT file -->
	
	<xsl:output method="html" indent="no" />
	<xsl:template match="/">
		<html>
		<title>
			<xsl:value-of select="/*/title"/><xsl:value-of select="$whiteSpace"/>
		</title>
		<head>
			<!-- css and javascript files  -->
			<!-- linking path must be related to the folder in which xml is being processed -->
			<xsl:call-template name="LinkingCSS"/>
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/common.js"><xsl:value-of select="$whiteSpace"/></script>  
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/ab-navigator-all-levels.js"><xsl:value-of select="$whiteSpace"/></script>
		</head>
		<body class="body" leftmargin="0" rightmargin="0" topmargin="0" bottomMargin ="0">
			<xsl:call-template name="table-group-title">
				<xsl:with-param name="title" select="/*/afmTableGroup/title"/>
			</xsl:call-template>	
			<!-- overwrite javascript variable values -->
			<script language="javascript">
				abSchemaSystemGraphicsFolder='<xsl:value-of select="$abSchemaSystemGraphicsFolder"/>';
			</script>
			
			<!-- going through each afmTableGroup -->
			<xsl:for-each select="/*/afmTableGroup">
					<xsl:call-template name="detailedContent">
						<xsl:with-param name="afmTableGroupPath" select="."/>
						<xsl:with-param name="margin-left" select="0"/>
						<xsl:with-param name="hasChildren" select="'false'"/>
						<xsl:with-param name="nodeID" select="generate-id()"/>
					</xsl:call-template>
			</xsl:for-each>
			<!-- if tree view has attr isTreeExpanded='false' or hasn't such attr -->
			<!-- the tree will dafultly be expanded -->
			<xsl:if test="//@isTreeExpanded='false'">
				<script language="javascript">
					ShrinkAllParentNodes();
				</script>
			</xsl:if>
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

	<!-- xsl template: detailedContent -->
	<xsl:template name="detailedContent">
	<xsl:param name="afmTableGroupPath"/>
	<xsl:param name="hasChildren"/>
	<xsl:param name="margin-left"/>
	<xsl:param name="nodeID"/>

		<table nowrap="1" style='margin-left:{$margin-left*10}pt;'>
			<xsl:for-each select="$afmTableGroupPath/dataSource/data/records/record">
				<xsl:variable name="afmAction" select="afmAction[@type='select']"/>
				<tr nowrap="1">
					<xsl:choose>
						<xsl:when test="count($afmAction)>0">
							<xsl:variable name="ID" select="concat($nodeID,'_',position())"/>
							<td nowrap="1">
								<img src="{$abSchemaSystemGraphicsFolder}/ab-icon-tree-task.gif" alt="-" BORDER="0" ID="IMG_{concat($nodeID,'_',position())}" />
							</td>
									<xsl:variable name="URLTitile">
										<xsl:for-each select="@*">
											<xsl:if test="position() = 3 and string-length()>0">, </xsl:if>
											<xsl:value-of select="."/>
											<xsl:if test="position() = 1"> - </xsl:if>
										</xsl:for-each>
									</xsl:variable>
									<td nowrap="1"  class="treeLeafNodeTitles">
										<a href="#"  onclick='ChangeItToActiveItem("{$ID}","","{$afmAction/@serialized}","{$afmAction/@frame}");return false;'>
											<xsl:value-of select="$URLTitile"/>
										</a>
									</td>
						</xsl:when>
					</xsl:choose>
				</tr>
			</xsl:for-each>
		</table>
	</xsl:template>
	<!-- including template model XSLT files called in XSLT -->
	<xsl:include href="../../../ab-system/xsl/common.xsl" />
</xsl:stylesheet>


