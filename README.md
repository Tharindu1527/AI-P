# AI Plagiarism Detector

An intelligent plagiarism detection system that checks similarities between assignments and implements web content comparison using LLM models. The system is built with React for the frontend, Django for the backend, and SQLite for the database.

## Features

### Completed
- **Assignment-to-Assignment Comparison**
  - Implements cosine similarity algorithm for detecting similarities between student assignments
  - Provides detailed similarity reports and matches
  - Efficient processing of multiple document formats

### In Progress
- **Assignment-to-Web Comparison**
  - Integration with pre-trained LLM models (GPT, Gemini, etc.)
  - Web content similarity detection
  - Smart plagiarism detection using AI/ML techniques

## Technology Stack

- **Frontend:** React
- **Backend:** Django
- **Database:** SQLite
- **AI/ML:** 
  - Cosine Similarity Algorithm
  - Pre-trained LLM Models (in progress)

## Installation

1. Clone the repository
```bash
git clone https://github.com/Tharindu1527/AI-P.git
cd AI-P
```

2. Set up the backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

3. Set up the frontend
```bash
cd frontend
npm install
npm start
```

## Project Structure

```
ai-plagiarism-detector/
├── frontend/           # React frontend application
├── backend/           # Django backend server
```

## Contributing

This project is being developed by:
- Tharindu Dhanushka - Project Manager/Backend
- Thikshana Omanthi - Backend
- Janani Baalasooriya - Frontend
- Tharushi Imasha - Frontend

We welcome contributions! Please feel free to submit pull requests.

## Future Enhancements

- Integration with more LLM models
- Support for additional file formats
- Enhanced reporting features
- Real-time plagiarism checking
- API documentation
- Performance optimization
