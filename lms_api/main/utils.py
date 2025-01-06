from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import textract
import re

def preprocess_text(text):
    # Convert to lowercase and remove special characters
    text = re.sub(r'[^\w\s]', '', text.lower())
    return text

def extract_text_from_file(file_path):
    try:
        # Extract text from various file formats
        text = textract.process(file_path).decode('utf-8')
        return preprocess_text(text)
    except Exception as e:
        print(f"Error extracting text: {e}")
        return ""

def calculate_similarity(file1_path, file2_path):
    # Extract text from both files
    text1 = extract_text_from_file(file1_path)
    text2 = extract_text_from_file(file2_path)
    
    # Calculate TF-IDF vectors
    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform([text1, text2])
    
    # Calculate cosine similarity
    similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
    return round(similarity * 100, 2)