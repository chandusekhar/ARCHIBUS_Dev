<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:fo="http://www.w3.org/1999/XSL/Format">
	<xsl:import href="constants.xsl"/>
	<xsl:output method="html" indent="yes"/>

	<!-- Match the root of the response; Create the HTML body. -->
	<xsl:template match="/">
		<html>
			<head>
				<title>
					<xsl:value-of select="/*/title"/>
					<xsl:value-of select="$whiteSpace"/>
				</title>
				<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/common.js">
					<xsl:value-of select="$whiteSpace"/>
				</script>
				<link rel="stylesheet" type="text/css" href="{$abSchemaSystemCSSFolder}/{$abCascadingStyleSheetFile}"/>
				<!-- <formatting> tags are nested in Tgrps, so calling LinkingCSS won't work -->
				<xsl:apply-templates select="//afmTableGroup/formatting/css"/>
			</head>
			<body class="iframes_body">
				<xsl:if test="count(/*/afmTableGroup/dataSource/data/records/record)=0">
					<div>
						<xsl:value-of select="//message[@name='no_ptasks']"/>
					</div>
				</xsl:if>
				<xsl:apply-templates select="/*/afmTableGroup"/>
			</body>
		</html>

	<!-- Render the 1, 2, or 3 columns by counting the ptasks in each column within the ptasks table group -->
	</xsl:template>
	<xsl:template match="afmTableGroup">
		<xsl:variable name="column1_node" select="./dataSource/data/records/record[starts-with(@display_order,'1')]"/>
		<xsl:variable name="column2_node" select="./dataSource/data/records/record[starts-with(@display_order,'2')]"/>
		<xsl:variable name="column3_node" select="./dataSource/data/records/record[starts-with(@display_order,'3')]"/>

	<style type="text/css">
			#iframes_wrapper {width: 100%; height: 816px; margin-top: -12px}
			<xsl:choose>
			<xsl:when test="count($column1_node)=0 and count($column3_node)=0">
				#column2 { width: 100%; }
			</xsl:when>
			<xsl:when test="count($column1_node)!=0 and count($column3_node)=0">
				#column1 { width: 30%; }
				#column2 { width: 70%; }
			</xsl:when>
			<xsl:when test="count($column1_node)=0">
				#column2 { width: 50%; }
				#column3 { width: 50%; }
			</xsl:when>
			<xsl:otherwise>
				#column1 { width: 28%; }
				#column2 { width: 36%; }
				#column3 { width: 36%; }
			</xsl:otherwise>
			</xsl:choose>
		</style>
	
		<!-- Render each column if it exists in this dashboard. -->
		<xsl:choose>
		<xsl:when test="count(/*/afmTableGroup/dataSource/data/records/record)=1">
			<table width="100%" height="100%" cellspacing="0" cellpadding="0">
			<tr><td id="column2">
					<xsl:apply-templates select="$column2_node"/>
					<xsl:value-of select="$whiteSpace"/>
				</td>
			</tr>
			</table>
		</xsl:when>
		<xsl:otherwise>
			<table id="iframes_wrapper" cellspacing="6" cellpadding="0">
			<tr><xsl:if test="count($column1_node)!=0">
					<td id="column1">
						<xsl:apply-templates select="$column1_node"/>
						<xsl:value-of select="$whiteSpace"/>
					</td>
				</xsl:if>
				<xsl:if test="count($column2_node)!=0">
					<td id="column2">
						<xsl:apply-templates select="$column2_node"/>
						<xsl:value-of select="$whiteSpace"/>
					</td>
				</xsl:if>
				<xsl:if test="count($column3_node)!=0">
					<td id="column3">
						<xsl:apply-templates select="$column3_node"/>
						<xsl:value-of select="$whiteSpace"/>
					</td>
				</xsl:if>
			</tr>
			</table>
		</xsl:otherwise>
		</xsl:choose>
	</xsl:template>

	<!-- For each ptask record, render its content within an iFrame. -->
	<xsl:template match="record">
		<!-- Divide the available height evenly over all frames in the column (810px - 6px top margin).
			 810 is evenly divisible by both 2 and 3. -->
		<xsl:variable name="defaultHeight" select="810 div last()"/>
		<xsl:variable name="frameID" select="position()" /> 

		<!-- Format the title bar for this iFrame -->
		<xsl:variable name="icon">
			<xsl:if test="@icon">
				<xsl:value-of select="concat($abSchemaSystemGraphicsFolder,'/',@icon)"/>
			</xsl:if>
		</xsl:variable>
		 
		<!-- Create the iframe.  Give it a unique name so that console views can target their own nested frames by name. 
		Without the name, views like the Employee Locator view do not work when used in the dashboard. -->
		<xsl:choose>
		<xsl:when test="count(/*/afmTableGroup/dataSource/data/records/record)=1">
			<iframe scrolling="no" width="100%" height="100%" frameborder="0" style="background-color: #FFFFFF" name="TARGET_{$frameID}">
				<xsl:choose>
					<!-- Use the Task Action as the url source parameter if it is specified. -->
					<xsl:when test="@task_action!=''">
						<xsl:attribute name="src"><xsl:value-of select="@task_action" /></xsl:attribute>
					</xsl:when>
					<!-- If url is an .htm file, load it relative to the application path. -->
					<xsl:when test="contains( @url, '.htm' )">
						<xsl:attribute name="src"><xsl:value-of select="concat( $absoluteAppPath, '/', @url)" /></xsl:attribute>
					</xsl:when>
					<!-- Otherwise use the url (the axvw name) as is. -->
					<xsl:otherwise>
						<xsl:attribute name="src"><xsl:value-of select="@url"/></xsl:attribute>
					</xsl:otherwise>
				</xsl:choose>
				<xsl:value-of select="//message[@name='iframes_not_supported']"/>
			</iframe>		
		</xsl:when>
		<xsl:otherwise>
			<iframe class="iframes_dashboard" scrolling="yes" frameborder="0" name="TARGET_{$frameID}">
				<!-- Use the ptasks's iframe_height override, if present.  Else use the default. -->
				<xsl:choose>
					<xsl:when test="@iframe_height!='0'">
						<xsl:attribute name="style"><xsl:value-of select="concat('height: ',((810 * @iframe_height) div 100) - 6,'px')"/></xsl:attribute>
					</xsl:when>
					<xsl:otherwise>
						<xsl:attribute name="style"><xsl:value-of select="concat('height: ',$defaultHeight - 6,'px')"/></xsl:attribute>				
					</xsl:otherwise>
				</xsl:choose>
	
				<!-- Use the ptasks's iframe_width override, if present.  Else use 100%. -->
				<xsl:choose>
					<xsl:when test="@iframe_width!='0'">
						<xsl:attribute name="style"><xsl:value-of select="concat('width: ',@iframe_width,'%')"/></xsl:attribute>
					</xsl:when>
					<xsl:otherwise>
						<xsl:attribute name="width">100%</xsl:attribute>				
					</xsl:otherwise>
				</xsl:choose>
	
				<xsl:choose>
					<!-- Use the Task Action as the url source parameter if it is specified. -->
					<xsl:when test="@task_action!=''">
						<xsl:attribute name="src"><xsl:value-of select="@task_action" /></xsl:attribute>
					</xsl:when>
					<!-- If url is an .htm file, load it relative to the application path. -->
					<xsl:when test="contains( @url, '.htm' )">
						<xsl:attribute name="src"><xsl:value-of select="concat( $absoluteAppPath, '/', @url)" /></xsl:attribute>
					</xsl:when>
					<!-- Otherwise use the url (the axvw name) as is. -->
					<xsl:otherwise>
						<xsl:attribute name="src"><xsl:value-of select="@url"/></xsl:attribute>
					</xsl:otherwise>
				</xsl:choose>
				<xsl:value-of select="//message[@name='iframes_not_supported']"/>
			</iframe>
		</xsl:otherwise>
		</xsl:choose>
	</xsl:template>
	 
	<xsl:include href="common.xsl"/>
</xsl:stylesheet>
