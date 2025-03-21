import os
import re
import json
import hashlib
import datetime
import requests
from bs4 import BeautifulSoup
import textract
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import logging
from typing import List, Dict, Any, Optional
import google.generativeai as genai
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, Flowable, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import red, grey, lightgrey, white, black, blue, darkblue, lightblue, green
from reportlab.graphics.shapes import Drawing
from reportlab.graphics.charts.piecharts import Pie

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

load_dotenv()

# Configure API keys
GOOGLE_API_KEY = os.environ.get("GOOGLE_API_KEY")
SERPER_API_KEY = os.environ.get("SERPER_API_KEY")

try:
    genai.configure(api_key=GOOGLE_API_KEY)
    logger.info("Google Gemini API configured successfully")
except Exception as e:
    logger.error(f"Error configuring Gemini AI: {e}")

# Helper classes and functions
class HorizontalLineFlowable(Flowable):
    """A flowable that draws a horizontal line."""
    
    def __init__(self, width, thickness=1, color=grey):
        Flowable.__init__(self)
        self.width = width
        self.thickness = thickness
        self.color = color
        
    def draw(self):
        self.canv.setStrokeColor(self.color)
        self.canv.setLineWidth(self.thickness)
        self.canv.line(0, 0, self.width, 0)

def extract_text_from_file(file_path):
    """Extract text from various file formats."""
    try:
        text = textract.process(file_path).decode('utf-8')
        # Clean up the text
        text = re.sub(r'\n+', '\n', text)  # Replace multiple newlines with single
        text = re.sub(r'\t', ' ', text)    # Replace tabs with spaces
        return text
    except Exception as e:
        logger.error(f"Error extracting text from {file_path}: {e}")
        return ""

def create_pie_chart(data_dict, width=400, height=200):
    """Create a pie chart Drawing object."""
    drawing = Drawing(width, height)
    
    # Define the pie chart
    pie = Pie()
    pie.x = width // 2
    pie.y = height // 2
    pie.width = width * 0.7
    pie.height = height * 0.7
    
    # Data and labels
    pie.data = list(data_dict.values())
    pie.labels = list(data_dict.keys())
    
    # Set colors for similar and different content
    pie_colors = [darkblue, lightblue]
    
    pie.slices.strokeWidth = 0.5
    pie.slices[0].fillColor = pie_colors[0]
    pie.slices[1].fillColor = pie_colors[1]
    
    drawing.add(pie)
    return drawing

def extract_significant_sentences(assignment_text: str, num_sentences: int = 3) -> List[str]:
    """Extract significant sentences for web search queries."""
    sentences = re.split(r'[.!?]', assignment_text)
    significant_sentences = [s.strip() for s in sentences if len(s.split()) > 5]
    
    if not significant_sentences:
        return [assignment_text[:100]]
    
    # Take sentences from beginning, middle and end
    queries = []
    if len(significant_sentences) >= num_sentences:
        queries = [
            significant_sentences[0],
            significant_sentences[len(significant_sentences)//2],
            significant_sentences[-1]
        ]
    else:
        queries = significant_sentences
    
    return queries

# Simple function-based tools instead of BaseTool classes
def search_web(query: str) -> List[Dict[str, str]]:
    """Search the web for content similar to the query."""
    try:
        api_key = SERPER_API_KEY
        if not api_key:
            logger.error("Serper API key is missing")
            return [{"title": "Error", "link": "", "snippet": "API key is missing"}]
            
        # Serper API request
        url = "https://google.serper.dev/search"
        headers = {
            'X-API-KEY': api_key,
            'Content-Type': 'application/json'
        }
        payload = {
            'q': query,
            'num': 5  # Get top 5 results
        }
        
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        results = response.json()
        
        # Extract and format the results
        formatted_results = []
        for result in results.get("organic", [])[:5]:
            formatted_results.append({
                "title": result.get("title", ""),
                "link": result.get("link", ""),
                "snippet": result.get("snippet", "")
            })
        
        logger.info(f"Found {len(formatted_results)} search results for query")
        return formatted_results
    except Exception as e:
        logger.error(f"Error searching web: {e}")
        return []

def fetch_web_content(url: str) -> str:
    """Fetch content from a web page."""
    try:
        # Fetch web page content
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        # Parse HTML and extract text
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Remove script and style elements
        for script in soup(["script", "style"]):
            script.extract()
            
        # Get text
        text = soup.get_text()
        
        # Clean text
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        text = '\n'.join(chunk for chunk in chunks if chunk)
        
        logger.info(f"Successfully fetched content from {url[:50]}...")
        return text
    except Exception as e:
        logger.error(f"Error fetching content from {url}: {e}")
        return ""

def calculate_similarity(text1: str, text2: str) -> float:
    """Calculate similarity between two texts."""
    try:
        if not text1 or not text2:
            logger.warning("Empty text provided for similarity calculation")
            return 0.0
            
        vectorizer = TfidfVectorizer()
        tfidf_matrix = vectorizer.fit_transform([text1, text2])
        similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
        result = round(similarity * 100, 2)
        
        logger.info(f"Calculated similarity: {result}%")
        return result
    except Exception as e:
        logger.error(f"Error calculating TF-IDF similarity: {e}")
        return 0.0

def analyze_with_gemini(assignment_text: str, web_sources: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Use Google Gemini to analyze similarity between assignment and web sources.
    """
    try:
        # Create a model instance
        model = genai.GenerativeModel('gemini-1.5-pro')
        
        # Create prompt for Gemini
        prompt = f"""
        I need to analyze potential similarity between a student assignment and web content.
        
        ASSIGNMENT TEXT:
        ```
        {assignment_text[:3000]}  # Limit text to avoid token limits
        ```
        
        WEB CONTENT SOURCES:
        """
        
        for i, source in enumerate(web_sources):
            prompt += f"""
            SOURCE {i+1} - {source['url']}:
            ```
            {source['content'][:1000]}  # Limit content to avoid token limits
            ```
            """
        
        prompt += """
        Please analyze and provide the following:
        1. Overall similarity assessment (percentage and description)
        2. Identify specific phrases or sections in the assignment that match web content
        3. For each match, specify which web source it matches with
        4. Provide a nuanced assessment considering academic context
        5. Distinguish between potential plagiarism and common knowledge/phrases
        
        Format your response as a structured JSON with these keys:
        - overall_similarity_score: a number from 0-100
        - similarity_assessment: text description of overall similarity
        - detailed_matches: array of matches with the structure:
          - assignment_text: the matching text from the assignment
          - source_url: the web source URL
          - source_text: the matching text from the source
          - similarity: a number from 0-100 indicating match strength
          - match_type: either "Exact Match", "Similar Content", or "Common Knowledge"
        - conclusion: overall assessment about potential plagiarism vs. original work
        """
        
        # Generate response from Gemini
        response = model.generate_content(prompt)
        
        # Parse response
        try:
            # Try to extract JSON from the response
            json_str = re.search(r'```json\s*(.*?)\s*```', response.text, re.DOTALL)
            if json_str:
                analysis = json.loads(json_str.group(1))
            else:
                # If no JSON found, try to parse the whole response
                analysis = json.loads(response.text)
        except (json.JSONDecodeError, AttributeError):
            # If JSON parsing fails, create a structured response from the text
            logger.warning("Failed to parse JSON from Gemini response. Creating structured response.")
            analysis = {
                "overall_similarity_score": 50,  # Default moderate similarity
                "similarity_assessment": response.text[:500],
                "detailed_matches": [],
                "conclusion": response.text[-500:]
            }
        
        return analysis
    except Exception as e:
        logger.error(f"Error analyzing with Gemini: {e}")
        return {
            "error": str(e),
            "similarity_assessment": "Error performing analysis with Gemini API.",
            "overall_similarity_score": 0,
            "detailed_matches": [],
            "conclusion": "Analysis failed due to an error."
        }

def generate_report_with_highlighting(analysis_results: Dict[str, Any], output_path: str) -> str:
    """
    Generate a PDF report for the web similarity analysis with the entire assignment text
    and highlighted plagiarism.
    
    Args:
        analysis_results (dict): Analysis results
        output_path (str): Path to save the PDF report
    Returns:
        str: Path to the generated report
    """
    # Generate PDF report
    doc = SimpleDocTemplate(output_path, pagesize=A4, 
                          rightMargin=36, leftMargin=36, 
                          topMargin=50, bottomMargin=18)
    styles = getSampleStyleSheet()
    elements = []
    
    # Custom styles
    title_style = ParagraphStyle(
        "ReportTitle",
        parent=styles["Heading1"],
        fontSize=24,
        alignment=1,  # Center aligned
        spaceAfter=12,
        textColor=darkblue
    )
    
    subtitle_style = ParagraphStyle(
        "Subtitle",
        parent=styles["Heading2"],
        fontSize=18,
        alignment=1,  # Center aligned
        spaceAfter=12,
        textColor=blue
    )
    
    heading_style = ParagraphStyle(
        "CustomHeading",
        parent=styles["Heading2"],
        fontSize=16,
        spaceAfter=6,
        textColor=darkblue
    )
    
    subheading_style = ParagraphStyle(
        "CustomSubheading",
        parent=styles["Heading3"],
        fontSize=14,
        spaceAfter=6,
        textColor=blue
    )
    
    normal_style = ParagraphStyle(
        "CustomNormal",
        parent=styles["Normal"],
        fontSize=10,
        leading=12,
        spaceAfter=4
    )
    
    match_style = ParagraphStyle(
        "MatchStyle",
        parent=styles["Normal"],
        fontSize=9,
        leading=11,
        leftIndent=20,
        spaceAfter=2
    )
    
    plagiarism_style = ParagraphStyle(
        "PlagiarismStyle",
        parent=styles["Normal"],
        fontSize=10,
        leading=12,
        spaceAfter=4,
        backColor=colors.yellow,
        textColor=colors.red
    )
    
    # Title and header
    elements.append(Paragraph("Assignment Web Similarity Analysis", title_style))
    elements.append(Paragraph(f"Generated on {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", subtitle_style))
    elements.append(HorizontalLineFlowable(450, thickness=2, color=darkblue))
    elements.append(Spacer(1, 20))
    
    # Executive Summary
    elements.append(Paragraph("Executive Summary", heading_style))
    elements.append(Spacer(1, 6))
    
    similarity_percent = analysis_results.get("overall_similarity_score", 0)
    
    # Color code based on similarity percentage
    score_color = "green"
    if similarity_percent > 30:
        score_color = "orange"
    if similarity_percent > 60:
        score_color = "red"
        
    elements.append(Paragraph(f"<b>Overall Web Similarity Score:</b> <font color='{score_color}'>{similarity_percent}%</font>", normal_style))
    
    # Similarity assessment
    assessment = analysis_results.get("similarity_assessment", "No assessment available")
    elements.append(Paragraph(f"<b>Assessment:</b> {assessment}", normal_style))
    
    # Conclusion
    conclusion = analysis_results.get("conclusion", "No conclusion available")
    elements.append(Paragraph(f"<b>Conclusion:</b> {conclusion}", normal_style))
    elements.append(Spacer(1, 12))
    
    # Web Sources Analyzed
    elements.append(Paragraph("Web Sources Analyzed", heading_style))
    elements.append(Spacer(1, 6))
    
    web_sources = analysis_results.get("web_sources", [])
    
    if web_sources:
        # Create a table for web sources
        web_data = [["Source URL", "Similarity Score"]]
        
        for source in web_sources:
            url = source.get("url", "")
            similarity = source.get("similarity", 0)
            
            color = "green"
            if similarity > 30:
                color = "orange"
            if similarity > 60:
                color = "red"
            
            web_data.append([
                url,
                f"<font color='{color}'>{similarity}%</font>"
            ])
        
        web_table = Table(web_data, colWidths=[350, 100])
        web_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.lightblue),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('PADDING', (0, 0), (-1, -1), 6),
        ]))
        
        elements.append(web_table)
    else:
        elements.append(Paragraph("No web sources found for analysis.", normal_style))
    
    elements.append(Spacer(1, 20))
    
    # Detailed Matches
    elements.append(Paragraph("Detailed Content Matches", heading_style))
    elements.append(Spacer(1, 6))
    
    detailed_matches = analysis_results.get("detailed_matches", [])
    
    if detailed_matches:
        for i, match in enumerate(detailed_matches):
            # Match header
            match_type = match.get("match_type", "Match")
            similarity = match.get("similarity", 0)
            type_color = "blue"
            if match_type == "Exact Match" or similarity > 60:
                type_color = "red"
            elif match_type == "Similar Content" or similarity > 30:
                type_color = "orange"
            
            elements.append(Paragraph(f"<b>Match {i+1}</b> - <font color='{type_color}'>{match_type} ({similarity}%)</font>", subheading_style))
            
            # Match content
            elements.append(Paragraph(f"<b>Assignment:</b> {match.get('assignment_text', 'N/A')}", match_style))
            elements.append(Paragraph(f"<b>Source:</b> {match.get('source_url', 'N/A')}", match_style))
            elements.append(Paragraph(f"<b>Source Text:</b> {match.get('source_text', 'N/A')}", match_style))
            
            # Add separator
            elements.append(Spacer(1, 5))
            elements.append(HorizontalLineFlowable(400, thickness=0.5, color=lightgrey))
            elements.append(Spacer(1, 5))
    else:
        elements.append(Paragraph("No specific content matches were identified.", normal_style))
    
    # Add page break before full assignment with highlighting
    elements.append(PageBreak())
    
    # Full Assignment with Highlighted Plagiarism
    elements.append(Paragraph("Full Assignment with Highlighted Plagiarism", heading_style))
    elements.append(Spacer(1, 10))
    
    elements.append(Paragraph("<i>Sections highlighted in yellow with red text indicate potential plagiarism.</i>", styles["Italic"]))
    elements.append(Spacer(1, 10))
    
    # Get the complete assignment text
    assignment_text = analysis_results.get("assignment_text", "")
    
    # Create a dictionary of plagiarized sections to highlight
    plagiarized_sections = {}
    for match in detailed_matches:
        if match.get("similarity", 0) > 60:  # Only highlight sections with high similarity
            plagiarized_text = match.get("assignment_text", "")
            if plagiarized_text:
                plagiarized_sections[plagiarized_text] = match.get("source_url", "")
    
    # Split the assignment text into paragraphs
    paragraphs = assignment_text.split('\n')
    
    # Process each paragraph to highlight plagiarism
    for paragraph in paragraphs:
        if not paragraph.strip():
            elements.append(Spacer(1, 6))
            continue
        
        # Check if the paragraph contains any plagiarized sections
        plagiarized = False
        for plagiarized_text, source_url in plagiarized_sections.items():
            if plagiarized_text in paragraph:
                # Highlight the plagiarized text
                highlighted_paragraph = paragraph.replace(
                    plagiarized_text, 
                    f'<font color="red" backcolor="yellow">{plagiarized_text}</font>'
                )
                elements.append(Paragraph(highlighted_paragraph, normal_style))
                elements.append(Paragraph(f"<i><font size='8'>Source: {source_url}</font></i>", styles["Italic"]))
                plagiarized = True
                break
        
        # If no plagiarism found in this paragraph, add it normally
        if not plagiarized:
            elements.append(Paragraph(paragraph, normal_style))
    
    # Analysis methodology section
    elements.append(PageBreak())
    elements.append(Paragraph("Analysis Methodology", heading_style))
    elements.append(HorizontalLineFlowable(450, thickness=1, color=grey))
    elements.append(Spacer(1, 10))
    
    elements.append(Paragraph("<b>Web Similarity Analysis Method:</b> This report analyzes the similarity between a student assignment and web content using multiple approaches:", normal_style))
    elements.append(Spacer(1, 6))
    
    elements.append(Paragraph("1. <b>Basic similarity analysis</b> using TF-IDF vectorization and cosine similarity metrics to calculate statistical similarity between texts.", normal_style))
    elements.append(Paragraph("2. <b>Advanced semantic analysis</b> using Google's Gemini AI to identify conceptual similarities, common phrases, and potential plagiarism patterns.", normal_style))
    elements.append(Paragraph("3. <b>Source verification</b> by analyzing multiple sources to distinguish between common knowledge and unique content.", normal_style))
    elements.append(Spacer(1, 10))
    
    elements.append(Paragraph("<b>Interpretation Guide:</b>", normal_style))
    elements.append(Paragraph("• 0-15%: Very low similarity - Likely original content", normal_style))
    elements.append(Paragraph("• 16-30%: Low similarity - Contains common phrases but largely original", normal_style))
    elements.append(Paragraph("• 31-50%: Moderate similarity - May contain some paraphrased content", normal_style))
    elements.append(Paragraph("• 51-70%: High similarity - Contains substantial similar content", normal_style))
    elements.append(Paragraph("• 71-100%: Very high similarity - Significant portions may be unoriginal", normal_style))
    
    # Disclaimer
    elements.append(Spacer(1, 20))
    elements.append(HorizontalLineFlowable(450, thickness=1, color=grey))
    elements.append(Spacer(1, 6))
    elements.append(Paragraph("<i>Disclaimer: This automated similarity analysis provides an approximation of content similarity against web sources. Results should be interpreted by a human reviewer for context-appropriate assessment. Common knowledge, standard phrases, and coincidental matches may be flagged and require human judgment.</i>", styles["Italic"]))
    
    # Generate the PDF
    doc.build(elements)
    return output_path


def get_web_similarity_report_filename(assignment_path):
    """Generate a unique filename for the web similarity report."""
    base_name = os.path.basename(assignment_path)
    timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
    hash_str = hashlib.md5(f"{base_name}_{timestamp}".encode()).hexdigest()[:8]
    
    return f"web_similarity_report_{hash_str}.pdf"

def analyze_assignment_web_similarity(assignment_path, output_dir):
    """
    Analyze an assignment for web similarity using Google Gemini.
    This version includes the full assignment text with highlighted plagiarism in the report.
    
    Args:
        assignment_path (str): Path to the assignment file
        output_dir (str): Directory to save the report
        
    Returns:
        dict: Result information including report path and similarity score
    """
    # Ensure output directory exists
    os.makedirs(output_dir, exist_ok=True)
    
    try:
        logger.info(f"Starting web similarity analysis for: {assignment_path}")
        
        # Extract assignment text
        assignment_text = extract_text_from_file(assignment_path)
        if not assignment_text:
            return {
                'web_similarity_score': 0,
                'error': "Failed to extract text from assignment file",
                'report_path': None,
                'report_filename': None
            }
        
        # Get significant sentences for search queries
        search_queries = extract_significant_sentences(assignment_text)
        
        # Search web for similar content
        web_results = []
        for query in search_queries:
            results = search_web(query)
            web_results.extend(results)
        
        # Remove duplicates by URL
        unique_results = {}
        for result in web_results:
            url = result['link']
            if url not in unique_results:
                unique_results[url] = result
        
        web_results = list(unique_results.values())
        
        # Fetch content from each web source
        web_sources = []
        for result in web_results[:5]:  # Limit to top 5 results
            url = result['link']
            title = result['title']
            content = fetch_web_content(url)
            
            if content:
                # Calculate basic similarity
                similarity = calculate_similarity(assignment_text, content)
                
                web_sources.append({
                    'url': url,
                    'title': title,
                    'content': content,
                    'similarity': similarity
                })
        
        # Use Gemini for in-depth analysis
        gemini_analysis = analyze_with_gemini(assignment_text, web_sources)
        
        # Generate report filename
        report_filename = get_web_similarity_report_filename(assignment_path)
        report_path = os.path.join(output_dir, report_filename)
        
        # Combine all results for report generation
        analysis_results = {
            "assignment_text": assignment_text,
            "overall_similarity_score": gemini_analysis.get("overall_similarity_score", 0),
            "web_sources": web_sources,
            "detailed_matches": gemini_analysis.get("detailed_matches", []),
            "similarity_assessment": gemini_analysis.get("similarity_assessment", ""),
            "conclusion": gemini_analysis.get("conclusion", "")
        }
        
        # Generate the enhanced report with highlighted plagiarism
        logger.info(f"Generating report with highlighting: {report_path}")
        generate_report_with_highlighting(analysis_results, report_path)
        
        return {
            'web_similarity_score': analysis_results["overall_similarity_score"],
            'report_path': report_path,
            'report_filename': report_filename,
            'analysis_summary': analysis_results["similarity_assessment"]
        }
    except Exception as e:
        logger.error(f"Error in web similarity analysis: {e}", exc_info=True)
        return {
            'web_similarity_score': 0,
            'error': str(e),
            'report_path': None,
            'report_filename': None
        }