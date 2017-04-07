<?xml version="1.0" encoding="UTF-8"?>

<xsl:stylesheet version="1.1" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:fo="http://www.w3.org/1999/XSL/Format" exclude-result-prefixes="fo">
	<xsl:output method="xml" version="1.0" omit-xml-declaration="no" indent="no"/>

	<xsl:template match="/">
	
	<xsl:processing-instruction name="cocoon-format">type="text/xslfo"</xsl:processing-instruction>
		<fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format">
			<!-- Page Master -->
			<fo:layout-master-set>
				<fo:simple-page-master margin="1cm" master-name="main-page" page-height="297mm" page-width="210mm">
 					<fo:region-before extent="1cm"/>
					<fo:region-after extent="1cm"/>
					<fo:region-body margin-top="2cm"  margin-bottom="1.5cm"/>
				</fo:simple-page-master>
			</fo:layout-master-set>
			<fo:page-sequence master-reference="main-page">
				<!-- Page Header-->
				<fo:static-content flow-name="xsl-region-before">
					<fo:block font-size="12pt"
							font-weight="bold"
							border-bottom-color="black"
							border-bottom-style="solid"
							border-bottom-width="5pt">
							ARCHIBUS/FM Work Order
					</fo:block>
				</fo:static-content>
				
				<!-- Page Footer -->
				<fo:static-content flow-name="xsl-region-after">
					<fo:block text-align="left"
							font-size="10pt"
							font-weight="bold"
							padding-top="3pt"
							border-top-style="solid"
							border-top-width="5pt"
							translatable="false">
							<fo:page-number/> of <fo:page-number-citation ref-id="EndOfDocument"/>
					</fo:block>
				</fo:static-content>
				
				<fo:flow flow-name="xsl-region-body">
				
				<!-- Workorder ID -->
				<fo:block	
					font-size="24pt"
				    text-align="center"
					space-before="30pt"
				    space-before.conditionality="retain"
					space-after="12pt"
				>	
				Work Order: <xsl:value-of select="/*/afmTableGroup[1]/dataSource/data/records/record[1]/@wo.wo_id" />
				</fo:block>
				
				<!-- Workorder Information -->		
				<fo:block
					font-weight="bold"
					font-size="8pt"
					color="black"
					border-color="black"
					background-color="#FFFFFF"
					border-style="solid"
					margin="4pt"
					padding="4pt"
					space-after="10pt"
				>

					<fo:table>
						<fo:table-column column-width="50mm"/>
						<fo:table-column column-width="5mm"/>
						<fo:table-column column-width="100mm"/>

						<fo:table-body>
							<fo:table-row>
								<fo:table-cell>
									<xsl:for-each select="/*/afmTableGroup[1]/dataSource/data/fields/field/">
										<fo:block text-align="end">
											<xsl:value-of select="@singleLineHeading"/>
										</fo:block>
									</xsl:for-each>
								</fo:table-cell>
								<fo:table-cell>
								</fo:table-cell>				
								<fo:table-cell>
									<xsl:for-each select="/*/afmTableGroup[1]/dataSource/data/records/record[1]/@*">
	                                       <fo:block white-space-collapse="false">
                                                        		<xsl:text> </xsl:text><xsl:value-of select="."/>
											</fo:block>
									</xsl:for-each>
								</fo:table-cell>
							</fo:table-row>
						</fo:table-body>
					</fo:table>
				</fo:block>
				
				<!-- WorkRequests -->
				<xsl:for-each select="/*/afmTableGroup[1]/afmTableGroup">
					<!-- New page for each WR -->
					<fo:block break-before="page" />
					
					<!-- Workrequest ID -->
					<fo:block
						font-weight="bold"
						font-size="18pt"
						color="navy"
						border-color="white"
						border-style="solid"
						margin="4pt"
						space-after="10pt"
					>
						Work Request: <xsl:value-of select="dataSource/data/records/record[1]/@wr.wr_id" />
					</fo:block>
					
					<!-- Workrequest Information -->						
					<!-- requestor, phone, location -->
					<fo:block
						font-weight="bold"
						font-size="8pt"
						color="black"
						border-color="black"
						background-color="#FFFFFF"
						border-style="solid"
						margin="4pt"
						padding="4pt"
						space-after="10pt"
					>
						<fo:table>
							<fo:table-column column-width="50mm"/>
							<fo:table-column column-width="3mm"/>
							<fo:table-column column-width="50mm"/>
							<fo:table-column column-width="5mm"/>
							<fo:table-column column-width="50mm"/>
							<fo:table-column column-width="3mm"/>
							<fo:table-column column-width="50mm"/>
								
							<fo:table-body>
								<fo:table-row>
									<fo:table-cell>
										<fo:block text-align="end">
											<xsl:value-of select="dataSource/data/fields/field[@name='requestor']/@singleLineHeading"/>
										</fo:block>
									</fo:table-cell>
									<fo:table-cell>
									</fo:table-cell>				
									<fo:table-cell>
										<fo:block>
											<xsl:value-of select="dataSource/data/records/record[1]/@wr.requestor"/>
										</fo:block>										
									</fo:table-cell>
									<fo:table-cell>
									</fo:table-cell>
									<fo:table-cell>
										<fo:block text-align="end">
											<xsl:value-of select="dataSource/data/fields/field[@name='phone']/@singleLineHeading"/>
										</fo:block>
									</fo:table-cell>
									<fo:table-cell>
									</fo:table-cell>				
									<fo:table-cell>
										<fo:block>
											<xsl:value-of select="dataSource/data/records/record[1]/@wr.phone"/>
										</fo:block>										
									</fo:table-cell>
								</fo:table-row>
								
								<!-- bl rm -->
								<fo:table-row>
									<fo:table-cell>
										<fo:block text-align="end">
											<xsl:value-of select="dataSource/data/fields/field[@name='bl_id']/@singleLineHeading"/>
										</fo:block>
									</fo:table-cell>
									<fo:table-cell>
									</fo:table-cell>				
									<fo:table-cell>
										<fo:block>
											<xsl:value-of select="dataSource/data/records/record[1]/@wr.bl_id"/>
										</fo:block>										
									</fo:table-cell>
									<fo:table-cell>
									</fo:table-cell>
									<fo:table-cell>
										<fo:block text-align="end">
											<xsl:value-of select="dataSource/data/fields/field[@name='fl_id']/@singleLineHeading"/>
										</fo:block>
									</fo:table-cell>
									<fo:table-cell>
									</fo:table-cell>				
									<fo:table-cell>
										<fo:block>
											<xsl:value-of select="dataSource/data/records/record[1]/@wr.fl_id"/>
										</fo:block>										
									</fo:table-cell>
								</fo:table-row>
								
								<!-- fl location -->
								<fo:table-row>
									<fo:table-cell>
										<fo:block text-align="end">
											<xsl:value-of select="dataSource/data/fields/field[@name='fl_id']/@singleLineHeading"/>
										</fo:block>
									</fo:table-cell>
									<fo:table-cell>
									</fo:table-cell>				
									<fo:table-cell>
										<fo:block>
											<xsl:value-of select="dataSource/data/records/record[1]/@wr.fl_id"/>
										</fo:block>										
									</fo:table-cell>
									<fo:table-cell>
									</fo:table-cell>
									<fo:table-cell>
										<fo:block text-align="end">
											<xsl:value-of select="dataSource/data/fields/field[@name='location']/@singleLineHeading"/>
										</fo:block>
									</fo:table-cell>
									<fo:table-cell>
									</fo:table-cell>				
									<fo:table-cell>
										<fo:block>
											<xsl:value-of select="dataSource/data/records/record[1]/@wr.location"/>
										</fo:block>										
									</fo:table-cell>
								</fo:table-row>
							</fo:table-body>
						</fo:table>
					</fo:block>
					
					<!-- Dates -->
					<fo:block
						font-weight="bold"
						font-size="8pt"
						color="black"
						border-color="black"
						background-color="#FFFFFF"
						border-style="solid"
						margin="4pt"
						padding="4pt"
						space-after="10pt"
					>
						<fo:table>
							<fo:table-column column-width="50mm"/>
							<fo:table-column column-width="3mm"/>
							<fo:table-column column-width="50mm"/>
							<fo:table-column column-width="5mm"/>
							<fo:table-column column-width="50mm"/>
							<fo:table-column column-width="3mm"/>
							<fo:table-column column-width="50mm"/>
							
							<fo:table-body>					
								<fo:table-row>
									<fo:table-cell>
										<fo:block text-align="end">
											<xsl:value-of select="dataSource/data/fields/field[@name='date_requested']/@singleLineHeading"/>
										</fo:block>
									</fo:table-cell>
									<fo:table-cell>
									</fo:table-cell>				
									<fo:table-cell>
										<fo:block>
											<xsl:value-of select="dataSource/data/records/record[1]/@wr.date_requested"/>
										</fo:block>										
									</fo:table-cell>
									<fo:table-cell>
									</fo:table-cell>
									<fo:table-cell>
										<fo:block text-align="end">
											<xsl:value-of select="dataSource/data/fields/field[@name='time_requested']/@singleLineHeading"/>
										</fo:block>
									</fo:table-cell>
									<fo:table-cell>
									</fo:table-cell>				
									<fo:table-cell>
										<fo:block>
											<xsl:value-of select="dataSource/data/records/record[1]/@wr.time_requested"/>
										</fo:block>										
									</fo:table-cell>
								</fo:table-row>
								<fo:table-row>
									<fo:table-cell>
										<fo:block text-align="end">
											<xsl:value-of select="dataSource/data/fields/field[@name='date_assigned']/@singleLineHeading"/>
										</fo:block>
									</fo:table-cell>
									<fo:table-cell>
									</fo:table-cell>				
									<fo:table-cell>
										<fo:block>
											<xsl:value-of select="dataSource/data/records/record[1]/@wr.date_assigned"/>
										</fo:block>										
									</fo:table-cell>
									<fo:table-cell>
									</fo:table-cell>
									<fo:table-cell>
										<fo:block text-align="end">
											<xsl:value-of select="dataSource/data/fields/field[@name='time_assigned']/@singleLineHeading"/>
										</fo:block>
									</fo:table-cell>
									<fo:table-cell>
									</fo:table-cell>				
									<fo:table-cell>
										<fo:block>
											<xsl:value-of select="dataSource/data/records/record[1]/@wr.time_assigned"/>
										</fo:block>										
									</fo:table-cell>
								</fo:table-row>
								<fo:table-row>
									<fo:table-cell>
										<fo:block text-align="end">
											<xsl:value-of select="dataSource/data/fields/field[@name='date_est_completion']/@singleLineHeading"/>
										</fo:block>
									</fo:table-cell>
									<fo:table-cell>
									</fo:table-cell>				
									<fo:table-cell>
										<fo:block>
											<xsl:value-of select="dataSource/data/records/record[1]/@wr.date_est_completion"/>
										</fo:block>										
									</fo:table-cell>
									<fo:table-cell>
									</fo:table-cell>
									<fo:table-cell>
									</fo:table-cell>
									<fo:table-cell>
									</fo:table-cell>
									<fo:table-cell>
									</fo:table-cell>
								</fo:table-row>
							</fo:table-body>		
						</fo:table>
					</fo:block>
					
					<!-- Costs -->
					<fo:block
						font-weight="bold"
						font-size="8pt"
						color="black"
						border-color="black"
						background-color="#FFFFFF"
						border-style="solid"
						margin="4pt"
						padding="4pt"
						space-after="10pt"
					>
						<fo:table>
							<fo:table-column column-width="50mm"/>
							<fo:table-column column-width="3mm"/>
							<fo:table-column column-width="50mm"/>
							<fo:table-column column-width="5mm"/>
							<fo:table-column column-width="50mm"/>
							<fo:table-column column-width="3mm"/>
							<fo:table-column column-width="50mm"/>
							
							<fo:table-body>
								<fo:table-row>
									<fo:table-cell>
										<fo:block text-align="end">
											<xsl:value-of select="dataSource/data/fields/field[@name='cost_est_labor']/@singleLineHeading"/>
										</fo:block>
									</fo:table-cell>
									<fo:table-cell>
									</fo:table-cell>				
									<fo:table-cell>
										<fo:block>
											<xsl:value-of select="dataSource/data/records/record[1]/@wr.cost_est_labor"/>
										</fo:block>										
									</fo:table-cell>
									<fo:table-cell>
									</fo:table-cell>
									<fo:table-cell>
										<fo:block text-align="end">
											<xsl:value-of select="dataSource/data/fields/field[@name='cost_est_parts']/@singleLineHeading"/>
										</fo:block>
									</fo:table-cell>
									<fo:table-cell>
									</fo:table-cell>				
									<fo:table-cell>
										<fo:block>
											<xsl:value-of select="dataSource/data/records/record[1]/@wr.cost_est_parts"/>
										</fo:block>										
									</fo:table-cell>
								</fo:table-row>								
	
								<fo:table-row>
									<fo:table-cell>
										<fo:block text-align="end">
											<xsl:value-of select="dataSource/data/fields/field[@name='cost_est_tools']/@singleLineHeading"/>
										</fo:block>
									</fo:table-cell>
									<fo:table-cell>
									</fo:table-cell>				
									<fo:table-cell>
										<fo:block>
											<xsl:value-of select="dataSource/data/records/record[1]/@wr.cost_est_tools"/>
										</fo:block>										
									</fo:table-cell>
									<fo:table-cell>
									</fo:table-cell>
									<fo:table-cell>
										<fo:block text-align="end">
											<xsl:value-of select="dataSource/data/fields/field[@name='cost_est_other']/@singleLineHeading"/>
										</fo:block>
									</fo:table-cell>
									<fo:table-cell>
									</fo:table-cell>				
									<fo:table-cell>
										<fo:block>
											<xsl:value-of select="dataSource/data/records/record[1]/@wr.cost_est_other"/>
										</fo:block>										
									</fo:table-cell>
								</fo:table-row>
								<fo:table-row>
									<fo:table-cell>
										<fo:block text-align="end">
											<xsl:value-of select="dataSource/data/fields/field[@name='cost_est_total']/@singleLineHeading"/>
										</fo:block>
									</fo:table-cell>
									<fo:table-cell>
									</fo:table-cell>				
									<fo:table-cell>
										<fo:block>
											<xsl:value-of select="dataSource/data/records/record[1]/@wr.cost_est_total"/>
										</fo:block>										
									</fo:table-cell>
									<fo:table-cell>
									</fo:table-cell>
									<fo:table-cell>
									</fo:table-cell>
									<fo:table-cell>
									</fo:table-cell>				
									<fo:table-cell>									
									</fo:table-cell>
								</fo:table-row>
							</fo:table-body>		
						</fo:table>
					</fo:block>
					
					<!-- eq tr dp dv priority ac prob_type status-->
					<fo:block
						font-weight="bold"
						font-size="8pt"
						color="black"
						border-color="black"
						background-color="#FFFFFF"
						border-style="solid"
						margin="4pt"
						padding="4pt"
						space-after="10pt"
					>
						<fo:table>
							<fo:table-column column-width="50mm"/>
							<fo:table-column column-width="3mm"/>
							<fo:table-column column-width="50mm"/>
							<fo:table-column column-width="5mm"/>
							<fo:table-column column-width="50mm"/>
							<fo:table-column column-width="3mm"/>
							<fo:table-column column-width="50mm"/>
							
							<fo:table-body>
								<fo:table-row>
									<fo:table-cell>
										<fo:block text-align="end">
											<xsl:value-of select="dataSource/data/fields/field[@name='eq_id']/@singleLineHeading"/>
										</fo:block>
									</fo:table-cell>
									<fo:table-cell>
									</fo:table-cell>				
									<fo:table-cell>
										<fo:block>
											<xsl:value-of select="dataSource/data/records/record[1]/@wr.eq_id"/>
										</fo:block>										
									</fo:table-cell>
									<fo:table-cell>
									</fo:table-cell>
									<fo:table-cell>
										<fo:block text-align="end">
											<xsl:value-of select="dataSource/data/fields/field[@name='tr_id']/@singleLineHeading"/>
										</fo:block>
									</fo:table-cell>
									<fo:table-cell>
									</fo:table-cell>				
									<fo:table-cell>
										<fo:block>
											<xsl:value-of select="dataSource/data/records/record[1]/@wr.tr_id"/>
										</fo:block>										
									</fo:table-cell>
								</fo:table-row>								
	
								<fo:table-row>
									<fo:table-cell>
										<fo:block text-align="end">
											<xsl:value-of select="dataSource/data/fields/field[@name='dv_id']/@singleLineHeading"/>
										</fo:block>
									</fo:table-cell>
									<fo:table-cell>
									</fo:table-cell>				
									<fo:table-cell>
										<fo:block>
											<xsl:value-of select="dataSource/data/records/record[1]/@wr.dv_id"/>
										</fo:block>										
									</fo:table-cell>
									<fo:table-cell>
									</fo:table-cell>
									<fo:table-cell>
										<fo:block text-align="end">
											<xsl:value-of select="dataSource/data/fields/field[@name='dp_id']/@singleLineHeading"/>
										</fo:block>
									</fo:table-cell>
									<fo:table-cell>
									</fo:table-cell>				
									<fo:table-cell>
										<fo:block>
											<xsl:value-of select="dataSource/data/records/record[1]/@wr.dp_id"/>
										</fo:block>										
									</fo:table-cell>
								</fo:table-row>
								<fo:table-row>
									<fo:table-cell>
										<fo:block text-align="end">
											<xsl:value-of select="dataSource/data/fields/field[@name='priority']/@singleLineHeading"/>
										</fo:block>
									</fo:table-cell>
									<fo:table-cell>
									</fo:table-cell>				
									<fo:table-cell>
										<fo:block>
											<xsl:value-of select="dataSource/data/records/record[1]/@wr.priority"/>
										</fo:block>										
									</fo:table-cell>
									<fo:table-cell>
									</fo:table-cell>
									<fo:table-cell>
										<fo:block text-align="end">
											<xsl:value-of select="dataSource/data/fields/field[@name='ac_id']/@singleLineHeading"/>
										</fo:block>
									</fo:table-cell>
									<fo:table-cell>
									</fo:table-cell>				
									<fo:table-cell>	
										<fo:block>
											<xsl:value-of select="dataSource/data/records/record[1]/@wr.ac_id"/>
										</fo:block>								
									</fo:table-cell>
								</fo:table-row>
								<fo:table-row>
									<fo:table-cell>
										<fo:block text-align="end">
											<xsl:value-of select="dataSource/data/fields/field[@name='prob_type']/@singleLineHeading"/>
										</fo:block>
									</fo:table-cell>
									<fo:table-cell>
									</fo:table-cell>				
									<fo:table-cell>
										<fo:block>
											<xsl:value-of select="dataSource/data/records/record[1]/@wr.prob_type"/>
										</fo:block>										
									</fo:table-cell>
									<fo:table-cell>
									</fo:table-cell>
									<fo:table-cell>
										<fo:block text-align="end">
											<xsl:value-of select="dataSource/data/fields/field[@name='status']/@singleLineHeading"/>
										</fo:block>
									</fo:table-cell>
									<fo:table-cell>
									</fo:table-cell>				
									<fo:table-cell>	
										<fo:block>
											<xsl:value-of select="dataSource/data/records/record[1]/@wr.status"/>
										</fo:block>								
									</fo:table-cell>
								</fo:table-row>
							</fo:table-body>		
						</fo:table>
					</fo:block>
					
					<fo:block
						font-weight="bold"
						font-size="8pt"
						color="black"
						border-color="black"
						background-color="#FFFFFF"
						border-style="solid"
						margin="4pt"
						padding="4pt"
						space-after="10pt"
					>
						<fo:table>
							<fo:table-column column-width="50mm"/>
							<fo:table-column column-width="5mm"/>
							<fo:table-column column-width="100mm"/>
							<fo:table-body>
								<fo:table-row>
									<fo:table-cell>
										<fo:block text-align="end">
											<xsl:value-of select="dataSource/data/fields/field[@name='description']/@singleLineHeading"/>
										</fo:block>
									</fo:table-cell>
									<fo:table-cell>
									</fo:table-cell>				
									<fo:table-cell>
										<fo:block>
											<xsl:value-of select="dataSource/data/records/record[1]/@wr.description"/>
										</fo:block>										
									</fo:table-cell>
								</fo:table-row>
								<fo:table-row>
									<fo:table-cell>
										<fo:block text-align="end">
											<xsl:value-of select="dataSource/data/fields/field[@name='cf_notes']/@singleLineHeading"/>
										</fo:block>
									</fo:table-cell>
									<fo:table-cell>
									</fo:table-cell>				
									<fo:table-cell padding="6pt" border="1pt dashed black" height= "60px" >
										<fo:block>
											<xsl:value-of select="dataSource/data/records/record[1]/@wr.cf_notes"/>
										</fo:block>										
									</fo:table-cell>
								</fo:table-row>
							</fo:table-body>
						</fo:table>
					</fo:block>
					
					<!-- Craftspersons -->
					<fo:block	
						font-weight="bold"
						font-size="18pt"
						color="navy"
						border-color="white"
						border-style="solid"
						margin="4pt"
						space-after="10pt"
					>	
						Craftspersons
					</fo:block>								
					<fo:block
						font-weight="bold"
						font-size="8pt"
						color="black"
						border-color="black"
						background-color="#FFFFFF"
						border-style="solid"
						margin="4pt"
						padding="4pt"
						space-after="10pt"
					>
	
						<fo:table>
							<fo:table-column column-width="30mm"/>
							<fo:table-column column-width="3mm"/>
							<fo:table-column column-width="30mm"/>
							<fo:table-column column-width="3mm"/>
							<fo:table-column column-width="30mm"/>
							<fo:table-column column-width="3mm"/>
							<fo:table-column column-width="30mm"/>
							<fo:table-column column-width="3mm"/>
							<fo:table-column column-width="30mm"/>
							<fo:table-column column-width="3mm"/>
							<fo:table-column column-width="30mm"/>
							
							<fo:table-header>
							  <fo:table-row>
							    <fo:table-cell>
								     <fo:block font-weight="bold">
										 <xsl:value-of select="dataSource/data/fields/field[@name='cf_id']/@singleLineHeading"/>
									 </fo:block>
							    </fo:table-cell>								
							    <fo:table-cell></fo:table-cell>
								<fo:table-cell>
								     <fo:block font-weight="bold">
										 <xsl:value-of select="dataSource/data/fields/field[@name='date_assigned']/@singleLineHeading"/>
									 </fo:block>
							    </fo:table-cell>								
							    <fo:table-cell></fo:table-cell>
								<fo:table-cell>
								     <fo:block font-weight="bold">
										 <xsl:value-of select="dataSource/data/fields/field[@name='work_type']/@singleLineHeading"/>
									 </fo:block>
							    </fo:table-cell>								
							    <fo:table-cell></fo:table-cell>
								<fo:table-cell>
								     <fo:block font-weight="bold">
										 <xsl:value-of select="dataSource/data/fields/field[@name='date_start']/@singleLineHeading"/>
									 </fo:block>
							    </fo:table-cell>								
							    <fo:table-cell></fo:table-cell>
								<fo:table-cell>
								     <fo:block font-weight="bold">
										 <xsl:value-of select="dataSource/data/fields/field[@name='time_start']/@singleLineHeading"/>
									 </fo:block>
							    </fo:table-cell>								
							    <fo:table-cell></fo:table-cell>
								<fo:table-cell>
								     <fo:block font-weight="bold">
										 <xsl:value-of select="dataSource/data/fields/field[@name='time_end']/@singleLineHeading"/>
									 </fo:block>
							    </fo:table-cell>								    
							  </fo:table-row>
							</fo:table-header>
							
							<fo:table-body>
								<xsl:for-each select="afmTableGroup[1]/dataSource/data/records/record">
									<fo:table-row>
										<fo:table-cell>
											<fo:block>
												<xsl:value-of select="@wrcf.cf_id"/>
											</fo:block>
										</fo:table-cell>
										<fo:table-cell></fo:table-cell>				
										<fo:table-cell>
											<fo:block>
												<xsl:value-of select="@wrcf.date_assigned"/>
											</fo:block>
										</fo:table-cell>
										<fo:table-cell></fo:table-cell>				
										<fo:table-cell>
											<fo:block>
												<xsl:value-of select="@wrcf.work_type"/>
											</fo:block>
										</fo:table-cell>
										<fo:table-cell></fo:table-cell>				
										<fo:table-cell>
											<fo:block>
												<xsl:value-of select="@wrcf.date_start"/>
											</fo:block>
										</fo:table-cell>
										<fo:table-cell></fo:table-cell>				
										<fo:table-cell>
											<fo:block>
												<xsl:value-of select="@wrcf.time_start"/>
											</fo:block>
										</fo:table-cell>
										<fo:table-cell></fo:table-cell>				
										<fo:table-cell>
											<fo:block>
												<xsl:value-of select="@wrcf.time_end"/>
											</fo:block>
										</fo:table-cell>
									</fo:table-row>
									<fo:table-row>
										<fo:table-cell>
											<fo:block font-weight="bold">
												 <xsl:value-of select="dataSource/data/fields/field[@name='comments']/@singleLineHeading"/>
											 </fo:block>
										</fo:table-cell>
										<fo:table-cell></fo:table-cell>
										<fo:table-cell number-columns-spanned='9'>
											<fo:block>
												<xsl:value-of select="@wrcf.comments"/>
											</fo:block>
										</fo:table-cell>
									</fo:table-row>
								</xsl:for-each>
							</fo:table-body>
						</fo:table>
					</fo:block>
					
					
					<!-- Parts -->
					<fo:block
						font-weight="bold"
						font-size="18pt"
						color="navy"
						border-color="white"
						border-style="solid"
						margin="4pt"
						space-after="10pt"
					>
						Parts
					</fo:block>
					<fo:block
						font-weight="bold"
						font-size="8pt"
						color="black"
						border-color="black"
						background-color="#FFFFFF"
						border-style="solid"
						margin="4pt"
						padding="4pt"
						space-after="10pt"
					>
	
						<fo:table>
							<fo:table-column column-width="40mm"/>
							<fo:table-column column-width="3mm"/>
							<fo:table-column column-width="40mm"/>
							<fo:table-column column-width="3mm"/>
							<fo:table-column column-width="40mm"/>
							<fo:table-column column-width="3mm"/>
							<fo:table-column column-width="80mm"/>
														
							<fo:table-header>
							  <fo:table-row>
							    <fo:table-cell>
								     <fo:block font-weight="bold">
										 <xsl:value-of select="dataSource/data/fields/field[@name='part_id']/@singleLineHeading"/>
									 </fo:block>
							    </fo:table-cell>								
							    <fo:table-cell></fo:table-cell>
								<fo:table-cell>
								     <fo:block font-weight="bold">
										 <xsl:value-of select="dataSource/data/fields/field[@name='date_assigned']/@singleLineHeading"/>
									 </fo:block>
							    </fo:table-cell>								
							    <fo:table-cell></fo:table-cell>
								<fo:table-cell>
								     <fo:block font-weight="bold">
										 <xsl:value-of select="dataSource/data/fields/field[@name='qty_estimated']/@singleLineHeading"/>
									 </fo:block>
							    </fo:table-cell>								
							    <fo:table-cell></fo:table-cell>
								<fo:table-cell>
								     <fo:block font-weight="bold">
										 <xsl:value-of select="dataSource/data/fields/field[@name='comments']/@singleLineHeading"/>
									 </fo:block>
							    </fo:table-cell>															    
							  </fo:table-row>
							</fo:table-header>
							
							<fo:table-body>
								<xsl:for-each select="afmTableGroup[2]/dataSource/data/records/record">
									<fo:table-row>
										<fo:table-cell>
											<fo:block>
												<xsl:value-of select="@wrpt.part_id"/>
											</fo:block>
										</fo:table-cell>
										<fo:table-cell></fo:table-cell>				
										<fo:table-cell>
											<fo:block>
												<xsl:value-of select="@wrpt.date_assigned"/>
											</fo:block>
										</fo:table-cell>
										<fo:table-cell></fo:table-cell>				
										<fo:table-cell>
											<fo:block>
												<xsl:value-of select="@wrpt.qty_estimated"/>
											</fo:block>
										</fo:table-cell>
										<fo:table-cell></fo:table-cell>				
										<fo:table-cell>
											<fo:block>
												<xsl:value-of select="@wrpt.comments"/>
											</fo:block>
										</fo:table-cell>
									</fo:table-row>
								</xsl:for-each>
							</fo:table-body>
						</fo:table>
					</fo:block>
					
					<!-- Tools -->
					<fo:block
						font-weight="bold"
						font-size="18pt"
						color="navy"
						border-color="white"
						border-style="solid"
						margin="4pt"
						space-after="10pt"
					>
						Tools
					</fo:block>
					<fo:block
						font-weight="bold"
						font-size="8pt"
						color="black"
						border-color="black"
						background-color="#FFFFFF"
						border-style="solid"
						margin="4pt"
						padding="4pt"
						space-after="10pt"
					>
	
						<fo:table>
							<fo:table-column column-width="40mm"/>
							<fo:table-column column-width="3mm"/>
							<fo:table-column column-width="40mm"/>
							<fo:table-column column-width="3mm"/>
							<fo:table-column column-width="40mm"/>
							<fo:table-column column-width="3mm"/>
							<fo:table-column column-width="40mm"/>				
							
							<fo:table-header>
							  <fo:table-row>
							    <fo:table-cell>
								     <fo:block font-weight="bold">
										 <xsl:value-of select="dataSource/data/fields/field[@name='tool_id']/@singleLineHeading"/>
									 </fo:block>
							    </fo:table-cell>																
							    <fo:table-cell></fo:table-cell>
								<fo:table-cell>
								     <fo:block font-weight="bold">
										 <xsl:value-of select="dataSource/data/fields/field[@name='date_start']/@singleLineHeading"/>
									 </fo:block>
							    </fo:table-cell>								
							    <fo:table-cell></fo:table-cell>
								<fo:table-cell>
								     <fo:block font-weight="bold">
										 <xsl:value-of select="dataSource/data/fields/field[@name='time_start']/@singleLineHeading"/>
									 </fo:block>
							    </fo:table-cell>
								<fo:table-cell></fo:table-cell>
								<fo:table-cell>
								     <fo:block font-weight="bold">
										 <xsl:value-of select="dataSource/data/fields/field[@name='time_end']/@singleLineHeading"/>
									 </fo:block>
							    </fo:table-cell>														    
							  </fo:table-row>
							</fo:table-header>
							
							<fo:table-body>
								<xsl:for-each select="afmTableGroup[3]/dataSource/data/records/record">
									<fo:table-row>
										<fo:table-cell>
											<fo:block>
												<xsl:value-of select="@wrtl.tool_id"/>
											</fo:block>
										</fo:table-cell>
										<fo:table-cell></fo:table-cell>				
										<fo:table-cell>
											<fo:block>
												<xsl:value-of select="@wrtl.date_start"/>
											</fo:block>
										</fo:table-cell>
										<fo:table-cell></fo:table-cell>				
										<fo:table-cell>
											<fo:block>
												<xsl:value-of select="@wrtl.time_start"/>
											</fo:block>
										</fo:table-cell>
										<fo:table-cell></fo:table-cell>				
										<fo:table-cell>
											<fo:block>
												<xsl:value-of select="@wrtl.time_end"/>
											</fo:block>
										</fo:table-cell>
									</fo:table-row>
									<fo:table-row>
										<fo:table-cell>
											<fo:block font-weight="bold">
												 <xsl:value-of select="dataSource/data/fields/field[@name='comments']/@singleLineHeading"/>
											 </fo:block>
										</fo:table-cell>
										<fo:table-cell></fo:table-cell>
										<fo:table-cell number-columns-spanned='5'>
											<fo:block>
												<xsl:value-of select="@wrtl.comments"/>
											</fo:block>
										</fo:table-cell>
									</fo:table-row>
								</xsl:for-each>
							</fo:table-body>
						</fo:table>
					</fo:block>
					
					<!-- Other -->
					<fo:block
						font-weight="bold"
						font-size="18pt"
						color="navy"
						border-color="white"
						border-style="solid"
						margin="4pt"
						space-after="10pt"
					>
						Other Resources
					</fo:block>
					
					<fo:block
						font-weight="bold"
						font-size="8pt"
						color="black"
						border-color="black"
						background-color="#FFFFFF"
						border-style="solid"
						margin="4pt"
						padding="4pt"
						space-after="10pt"
					>
	
						<fo:table>
							<fo:table-column column-width="50mm"/>
							<fo:table-column column-width="5mm"/>
							<fo:table-column column-width="120mm"/>
							
							<fo:table-header>
								<fo:table-row>
									<fo:table-cell>
										<fo:block font-weight="bold">
											<xsl:value-of select="dataSource/data/fields/field[@name='other_rs_type']/@singleLineHeading"/>
										 </fo:block>
									</fo:table-cell>
									<fo:table-cell>
										<fo:block font-weight="bold">
											<xsl:value-of select="dataSource/data/fields/field[@name='description']/@singleLineHeading"/>
										 </fo:block>
									</fo:table-cell>
								</fo:table-row>
							</fo:table-header>
							<fo:table-body>
								<xsl:for-each select="afmTableGroup[4]/dataSource/data/records/record">
									<fo:table-row>
										<fo:table-cell>
											<fo:block>
												<xsl:value-of select="@wr_other.other_rs_type"/>
											</fo:block>
										</fo:table-cell>
										<fo:table-cell></fo:table-cell>
										<fo:table-cell>
											<fo:block>
												<xsl:value-of select="@wr_other.description"/>
											</fo:block>
										</fo:table-cell>
									</fo:table-row>
								</xsl:for-each>
							</fo:table-body>
						</fo:table>
					</fo:block>
					
				</xsl:for-each>
					
				<fo:block id="EndOfDocument" text-align="center"/>
			</fo:flow>
		</fo:page-sequence>

		</fo:root>
	</xsl:template>			
</xsl:stylesheet>		