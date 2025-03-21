import os
import re
import hashlib
import datetime
import nltk
from nltk.tokenize import sent_tokenize
from difflib import SequenceMatcher
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import textract

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, 
    Image, Flowable, PageBreak, ListItem, ListFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import red, grey, lightgrey, white, black, blue, darkblue, lightblue
from reportlab.graphics.shapes import Drawing, Line, Rect
from reportlab.graphics.charts.piecharts import Pie
from reportlab.lib.units import inch, cm

# Download necessary NLTK data (run once)
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

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

def preprocess_text(text):
    """
    Preprocess the text by removing special characters and converting to lowercase.
    """
    # Convert to lowercase and remove special characters
    text = re.sub(r'[^\w\s]', '', text.lower())
    # Remove extra whitespaces
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def extract_text_from_file(file_path):
    """
    Extract text from various file formats using textract.
    Returns the extracted text as a string.
    """
    try:
        # Extract text from various file formats
        text = textract.process(file_path).decode('utf-8')
        # Clean up the text
        text = re.sub(r'\n+', '\n', text)  # Replace multiple newlines with single
        text = re.sub(r'\t', ' ', text)    # Replace tabs with spaces
        return text
    except Exception as e:
        print(f"Error extracting text: {e}")
        return ""

def get_report_filename(file1_path, file2_path):
    """
    Generate a unique report filename based on the input file names and a timestamp.
    """
    file1_name = os.path.basename(file1_path)
    file2_name = os.path.basename(file2_path)
    
    # Create a hash of the filenames to ensure uniqueness
    hash_str = hashlib.md5(f"{file1_name}_{file2_name}_{datetime.datetime.now()}".encode()).hexdigest()[:8]
    
    return f"similarity_report_{hash_str}.pdf"

def find_similar_sentences(text1, text2, threshold=0.6):
    """
    Find similar sentences between two texts using sequence matching.
    Handles text extraction issues by cleaning and normalizing the text.
    Uses a lower threshold to capture more matches for complete analysis.
    
    Args:
        text1 (str): Text from first document
        text2 (str): Text from second document
        threshold (float): Similarity threshold (0.0-1.0), lower values find more matches
        
    Returns:
        list: List of dictionaries containing similar sentence pairs
    """
    # Clean and normalize text to improve sentence tokenization
    def clean_text(text):
        # Replace multiple spaces with single space
        text = re.sub(r'\s+', ' ', text)
        # Replace multiple newlines with single newline
        text = re.sub(r'\n+', '\n', text)
        # Remove special characters that might interfere with tokenization
        text = re.sub(r'[^\w\s\.\,\!\?\;\:\"\'\/\(\)\[\]\{\}\-\_\+\=\<\>\@\#\$\%\&\*]', ' ', text)
        return text.strip()
    
    # Clean the texts
    clean_text1 = clean_text(text1)
    clean_text2 = clean_text(text2)
    
    # Try different methods to split into sentences
    def get_sentences(text):
        try:
            # First try NLTK sentence tokenization
            return sent_tokenize(text)
        except Exception:
            try:
                # Fall back to regex-based sentence splitting
                return re.split(r'(?<=[.!?])\s+', text)
            except Exception:
                # Ultimate fallback - split by newlines and periods
                sentences = []
                for line in text.split('\n'):
                    if line.strip():
                        # If line contains multiple sentences, split them
                        if re.search(r'[.!?]', line):
                            sentences.extend([s.strip() + "." for s in re.split(r'(?<=[.!?])\s+', line) if s.strip()])
                        else:
                            sentences.append(line.strip())
                return sentences
    
    # Get sentences using the robust method
    sentences1 = get_sentences(clean_text1)
    sentences2 = get_sentences(clean_text2)
    
    # Remove very short or empty sentences
    sentences1 = [s for s in sentences1 if s and len(s.split()) >= 3]
    sentences2 = [s for s in sentences2 if s and len(s.split()) >= 3]
    
    similar_sentences = []
    
    # Find similar sentence pairs
    for i, s1 in enumerate(sentences1):
        for j, s2 in enumerate(sentences2):
            # Calculate similarity using SequenceMatcher
            similarity = SequenceMatcher(None, s1, s2).ratio()
            
            if similarity >= threshold:
                similar_sentences.append({
                    "text1_idx": i,
                    "text1_sentence": s1,
                    "text2_idx": j,
                    "text2_sentence": s2,
                    "similarity": round(similarity * 100, 2)
                })
    
    # Sort by similarity score (highest first)
    return sorted(similar_sentences, key=lambda x: x['similarity'], reverse=True)

def create_pie_chart(data_dict, width=400, height=200):
    """
    Create a pie chart Drawing object.
    """
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
    if "Similar Content" in data_dict:
        pie_colors = [red, lightgrey]
        if data_dict["Similar Content"] > 50:
            pie_colors = [darkblue, lightblue]
    else:
        pie_colors = [darkblue, lightblue]
    
    pie.slices.strokeWidth = 0.5
    pie.slices[0].fillColor = pie_colors[0]
    pie.slices[1].fillColor = pie_colors[1]
    
    drawing.add(pie)
    return drawing

def generate_similarity_report(file1_path, file2_path, output_path):
    """
    Generate a comprehensive similarity report in PDF format comparing two documents.
    Uses a list-based approach rather than tables for displaying similar content to avoid overlap issues.
    Shows ALL similar sentences/phrases found, not just the top ones.
    """
    # Extract text from files
    text1 = extract_text_from_file(file1_path)
    text2 = extract_text_from_file(file2_path)
    
    # Calculate similarity score
    preprocessed_text1 = preprocess_text(text1)
    preprocessed_text2 = preprocess_text(text2)
    
    # Skip empty documents
    if not preprocessed_text1 or not preprocessed_text2:
        raise ValueError("One or both documents appear to be empty or couldn't be processed")
    
    # Calculate similarity using TF-IDF vectorization and cosine similarity
    vectorizer = TfidfVectorizer()
    try:
        tfidf_matrix = vectorizer.fit_transform([preprocessed_text1, preprocessed_text2])
        similarity_score = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
    except Exception as e:
        print(f"Error during vectorization: {e}")
        similarity_score = 0
    
    similarity_percentage = round(similarity_score * 100, 2)
    
    # Find similar sentences - use a slightly lower threshold to catch more matches
    similar_sentences = find_similar_sentences(text1, text2, threshold=0.6)
    
    # Calculate word count statistics
    words1 = len(preprocessed_text1.split())
    words2 = len(preprocessed_text2.split())
    
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
    
    # Title and header
    elements.append(Paragraph("Document Similarity Analysis Report", title_style))
    elements.append(Paragraph(f"Generated on {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", subtitle_style))
    elements.append(HorizontalLineFlowable(450, thickness=2, color=darkblue))
    elements.append(Spacer(1, 20))
    
    # Summary section
    elements.append(Paragraph("Executive Summary", heading_style))
    elements.append(Spacer(1, 6))
    
    # Similarity score with color-coding
    score_color = "red" if similarity_percentage > 50 else "black"
    elements.append(Paragraph(f"<b>Overall Similarity Score:</b> <font color='{score_color}'>{similarity_percentage}%</font>", normal_style))
    
    # Interpretation of similarity score
    interpretation = ""
    if similarity_percentage < 20:
        interpretation = "The documents show minimal similarity. This suggests mostly original content."
    elif similarity_percentage < 40:
        interpretation = "The documents have some similar elements, but are largely different."
    elif similarity_percentage < 60:
        interpretation = "The documents have moderate similarity, with significant shared content."
    elif similarity_percentage < 80:
        interpretation = "The documents are highly similar, with substantial shared content."
    else:
        interpretation = "The documents are extremely similar or potentially identical in content."
    
    elements.append(Paragraph(f"<b>Interpretation:</b> {interpretation}", normal_style))
    elements.append(Spacer(1, 12))
    
    # Pie chart of similar vs. different content
    elements.append(Paragraph("Similarity Visualization", subheading_style))
    elements.append(Spacer(1, 6))
    
    pie_data = {
        "Similar Content": similarity_percentage,
        "Different Content": 100 - similarity_percentage
    }
    pie_chart = create_pie_chart(pie_data)
    elements.append(pie_chart)
    elements.append(Spacer(1, 12))
    
    # File information
    elements.append(Paragraph("Documents Compared", heading_style))
    elements.append(Spacer(1, 6))
    
    # Create a table for file information
    file_data = [
        ["Property", "Document 1", "Document 2"],
        ["Filename", os.path.basename(file1_path), os.path.basename(file2_path)],
        ["Word Count", str(words1), str(words2)],
    ]
    
    file_table = Table(file_data, colWidths=[100, 200, 200])
    file_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.lightblue),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
        ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BACKGROUND', (0, 1), (0, -1), colors.lightgrey),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('PADDING', (0, 0), (-1, -1), 6),
    ]))
    
    elements.append(file_table)
    elements.append(Spacer(1, 20))
    
    # Similar content section - display ALL similar phrases found
    if similar_sentences:
        elements.append(Paragraph("Similar Content Analysis", heading_style))
        elements.append(Spacer(1, 6))
        
        elements.append(Paragraph(f"All similar phrases found ({len(similar_sentences)} total):", normal_style))
        elements.append(Spacer(1, 10))
        
        # Create small groups for pairs of similar phrases for better organization
        # Creates a new page after every 10 matches to avoid PDF length issues
        total_matches = len(similar_sentences)
        matches_per_page = 10
        current_match = 0
        
        # Loop through all similar sentences
        for i, match in enumerate(similar_sentences):
            # Insert page break after every matches_per_page items (except the first page)
            if i > 0 and i % matches_per_page == 0:
                elements.append(PageBreak())
                elements.append(Paragraph(f"Similar Content Analysis (continued)", heading_style))
                elements.append(Spacer(1, 10))
            
            # Create a match header with match number and similarity score
            current_match += 1
            match_num = Paragraph(f"<b>Match {current_match}/{total_matches}</b> <font color='blue'>({match['similarity']}% similarity)</font>", normal_style)
            elements.append(match_num)
            
            # Truncate long text to avoid overflow but show more content
            max_display_chars = 100
            
            # Document 1 content
            doc1_text = match['text1_sentence']
            if len(doc1_text) > max_display_chars:
                doc1_text = doc1_text[:max_display_chars] + "..."
            
            # Document 2 content
            doc2_text = match['text2_sentence']
            if len(doc2_text) > max_display_chars:
                doc2_text = doc2_text[:max_display_chars] + "..."
            
            # Add content as indented paragraphs
            elements.append(Paragraph(f"<b>Document 1:</b> {doc1_text}", match_style))
            elements.append(Paragraph(f"<b>Document 2:</b> {doc2_text}", match_style))
            
            # Add a separator line between matches
            elements.append(Spacer(1, 5))
            elements.append(HorizontalLineFlowable(400, thickness=0.5, color=lightgrey))
            elements.append(Spacer(1, 5))
    else:
        elements.append(Paragraph("No significant similar sentences found between the documents.", normal_style))
    
    # Footer with report details
    elements.append(PageBreak())
    elements.append(Paragraph("Report Details", heading_style))
    elements.append(HorizontalLineFlowable(450, thickness=1, color=grey))
    elements.append(Spacer(1, 10))
    
    elements.append(Paragraph("<b>Analysis Method:</b> This report uses TF-IDF (Term Frequency-Inverse Document Frequency) vectorization and cosine similarity metrics to analyze document similarity. Additionally, sentence-level comparison is performed using sequence matching algorithms.", normal_style))
    elements.append(Spacer(1, 6))
    
    elements.append(Paragraph("<b>Interpretation Guide:</b>", normal_style))
    elements.append(Paragraph("• 0-20%: Very low similarity", normal_style))
    elements.append(Paragraph("• 21-40%: Low similarity", normal_style))
    elements.append(Paragraph("• 41-60%: Moderate similarity", normal_style))
    elements.append(Paragraph("• 61-80%: High similarity", normal_style))
    elements.append(Paragraph("• 81-100%: Very high similarity", normal_style))
    
    # Disclaimer
    elements.append(Spacer(1, 20))
    elements.append(HorizontalLineFlowable(450, thickness=1, color=grey))
    elements.append(Spacer(1, 6))
    elements.append(Paragraph("<i>Disclaimer: This automated similarity analysis provides an approximation of content similarity. The results should be interpreted by a human reviewer for context-appropriate assessment.</i>", styles["Italic"]))
    
    # Generate the PDF
    doc.build(elements)
    return output_path

def calculate_similarity(file1_path, file2_path):
    """
    Calculate the similarity between two files and generate a detailed report.
    Returns a dictionary with similarity score and report path.
    """
    # Ensure the output directory exists
    reports_dir = os.path.join('media', 'similarity_reports')
    os.makedirs(reports_dir, exist_ok=True)
    
    # Generate a unique filename for the report
    report_filename = get_report_filename(file1_path, file2_path)
    output_path = os.path.join(reports_dir, report_filename)
    
    # Generate the report
    try:
        report_path = generate_similarity_report(file1_path, file2_path, output_path)
        
        # Extract text from files for basic similarity score
        text1 = extract_text_from_file(file1_path)
        text2 = extract_text_from_file(file2_path)
        
        # Calculate similarity score
        preprocessed_text1 = preprocess_text(text1)
        preprocessed_text2 = preprocess_text(text2)
        
        vectorizer = TfidfVectorizer()
        tfidf_matrix = vectorizer.fit_transform([preprocessed_text1, preprocessed_text2])
        similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
        
        return {
            'similarity_score': round(similarity * 100, 2),
            'report_path': report_path,
            'report_filename': report_filename
        }
    except Exception as e:
        print(f"Error generating similarity report: {e}")
        return {
            'similarity_score': 0,
            'error': str(e),
            'report_path': None,
            'report_filename': None
        }