from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import textract
import re
from difflib import SequenceMatcher
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import red, grey
import os

def preprocess_text(text):
    # Convert to lowercase and remove special characters
    text = re.sub(r'[^\w\s]', '', text.lower())
    return text

def extract_text_from_file(file_path):
    try:
        # Extract text from various file formats
        text = textract.process(file_path).decode('utf-8')
        return text
    except Exception as e:
        print(f"Error extracting text: {e}")
        return ""
    
def find_similar_phrases(text1, text2, min_length=4):
    words1 = text1.split()
    words2 = text2.split()
    similar_phrases = []

    for i in range(len(words1)):
        for j in range(len(words2)):
            phrase_length = 0
            while (i + phrase_length < len(words1) and
                   j + phrase_length < len(words2) and
                   words1[i + phrase_length].lower() == words2[j + phrase_length].lower()
                   ):
                phrase_length += 1

            if phrase_length >= min_length:
                phrase1 = "".join(words1[i:i + phrase_length])
                phrase2 = "".join(words2[j:j + phrase_length])
                similar_phrases.append({
                    "text1_phrase" : phrase1,
                    "text2_phrase" : phrase2,
                    "length" : phrase_length
                })
                i += phrase_length - 1
                break
    
    return similar_phrases

def generate_similarity_report(file1_path, file2_path, output_path):
    # Extract original phase
    text1 = extract_text_from_file(file1_path)
    text2 = extract_text_from_file(file2_path)

    # calculate similarity score
    preprocessed_text1 = preprocess_text(text1)
    preprocessed_text2 = preprocess_text(text2)

    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform([preprocessed_text1, preprocessed_text2])
    similarity_score = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
    similarity_percentage = round(similarity_score * 100,2)

    # find the similarity phases
    similar_phrases = find_similar_phrases(text1, text2)

    #Generate PDF report
    doc = SimpleDocTemplate(output_path, pagesize = letter)
    styles = getSampleStyleSheet()
    elements = []

    # Title
    title_style = ParagraphStyle(
        "CustomTitle",
        parent = styles["Heading1"],
        fontSize= 16,
        spaceAfter = 30
    )
    elements.append(Paragraph("Similarity Analysis Report", title_style))
    elements.append(Spacer(1, 12))

    # Similarity score
    elements.append(Paragraph(f"Overall Similarity Score: {similarity_percentage}%", styles['Heading2']))
    elements.append(Spacer(1, 12))

    # File Compared
    elements.append(Paragraph("Files Compared: ", styles["Heading3"]))
    elements.append(Paragraph(f"1. {os.path.basename(file1_path)}", styles['Normal']))
    elements.append(Paragraph(f"2. {os.path.basename(file2_path)}", styles['Normal']))
    elements.append(Spacer(1, 20))

    # Similar Phrases
    if similar_phrases:
        elements.append(Paragraph("Similar Phrases Found:", styles['Heading3']))
        elements.append(Spacer(1, 12))

        # Create table for similar phrases
        table_data = [['Document 1 Phrase', 'Document 2 Phrase', 'Length']]
        for phrase in similar_phrases:
            table_data.append([
                phrase['text1_phrase'],
                phrase['text2_phrase'],
                str(phrase['length'])
            ])
        
        table = Table(table_data, colWidths=[200, 200, 50])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 14),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        elements.append(table)
    else:
        elements.append(Paragraph("No significant similar phrases found.", styles['Normal']))
    
    # Generate the PDF
    doc.build(elements)
    return output_path

def calculate_similarity(file1_path, file2_path):
     # Calculate basic similarity score
    text1 = extract_text_from_file(file1_path)
    text2 = extract_text_from_file(file2_path)
    
    # Generate unique output path
    output_path = f'similarity_reports/report_{os.path.basename(file1_path)}_{os.path.basename(file2_path)}.pdf'
    os.makedirs('similarity_reports', exist_ok=True)
    
    # Generate report
    report_path = generate_similarity_report(file1_path, file2_path, output_path)
    
    # Calculate similarity score
    preprocessed_text1 = preprocess_text(text1)
    preprocessed_text2 = preprocess_text(text2)
    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform([preprocessed_text1, preprocessed_text2])
    similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
    
    return {
        'similarity_score': round(similarity * 100, 2),
        'report_path': report_path
    }