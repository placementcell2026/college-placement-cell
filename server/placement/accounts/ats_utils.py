import docx
import spacy
from pdfminer.high_level import extract_text
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Load Spacy model
try:
    nlp = spacy.load("en_core_web_sm")
except:
    # Fallback if model not found (though we just installed it)
    nlp = None

# Branch-wise Skill Database
BRANCH_SKILLS = {
    # Computer Technology
    "CT": [
        "python", "django", "flask", "fastapi", "java", "c++", "c", "sql", "mongodb",
        "postgresql", "html", "css", "javascript", "react", "nodejs", "git", "linux",
        "docker", "aws", "rest api", "machine learning", "deep learning",
        "tensorflow", "pytorch", "scikit-learn", "nlp", "bootstrap",
        "material ui", "material-ui", "sqlite", "postman", "visual studio",
        "mongodb compass", "tailwind", "vite", "github", "render", "vercel"
    ],
    # Computer Engineering
    "CM": [
        "python", "java", "c++", "c", "data structures", "algorithms", "operating system",
        "computer networks", "database management system", "sql", "mongodb",
        "html", "css", "javascript", "react", "nodejs", "git", "linux",
        "docker", "aws", "rest api", "system design"
    ],
    # Electronics
    "EL": [
        "analog electronics", "digital electronics", "microcontrollers",
        "embedded systems", "arduino", "raspberry pi", "pcb design",
        "c programming", "verilog", "vhdl", "signal processing",
        "multisim", "proteus", "matlab", "communication systems"
    ],
    # Electrical Engineering
    "EEE": [
        "power systems", "electrical machines", "control systems",
        "power electronics", "matlab", "simulink", "plc", "scada",
        "circuit analysis", "renewable energy", "smart grid",
        "transformers", "generators", "motors", "electrical safety"
    ],
    # Biomedical Engineering
    "BME": [
        "biomedical instrumentation", "medical imaging", "biomaterials",
        "signal processing", "matlab", "python", "medical devices",
        "biosensors", "image processing", "healthcare data analysis",
        "machine learning", "deep learning", "wearable devices",
        "bioinformatics"
    ],
    # Robotics & Process Automation
    "RPA": [
        "robotics", "automation", "plc", "scada", "arduino", "raspberry pi",
        "embedded systems", "python", "c++", "robot operating system",
        "ros", "machine vision", "computer vision", "opencv",
        "industrial automation", "sensor integration", "control systems"
    ]
}

SECTION_KEYWORDS = {
    "education": ["education", "academic", "university", "college", "school", "diploma", "degree", "qualification"],
    "skills": ["skills", "technical proficiencies", "competencies", "technologies", "expertise"],
    "experience": ["experience", "work history", "professional background", "training", "internship", "employment"],
    "projects": ["projects", "personal work", "portfolio", "development"],
    "certifications": ["certifications", "licenses", "awards", "achievement"],
    "contact": ["contact", "phone", "mobile", "email", "address", "linkedin", "location"],
    "summary": ["summary", "objective", "profile", "about me", "professional bio"]
}

# Branch-Specific Default Job Descriptions
DEFAULT_JD = {
    "CT": """
    Software engineer with experience in Python, Django, React, and SQL.
    Knowledge of REST APIs, Git, Linux and cloud platforms like AWS.
    """,
    "CM": """
    Computer engineer with strong knowledge in data structures,
    algorithms, operating systems, computer networks and programming
    languages like Java, Python and C++.
    """,
    "EL": """
    Electronics engineer with knowledge in analog and digital circuits,
    microcontrollers, embedded systems, PCB design and signal processing.
    """,
    "EEE": """
    Electrical engineer with experience in power systems,
    control systems, electrical machines and power electronics.
    """,
    "BME": """
    Biomedical engineer with knowledge of biomedical instrumentation,
    medical imaging, biosensors, healthcare devices and signal processing.
    """,
    "RPA": """
    Robotics engineer with experience in automation, PLC, embedded systems,
    robotics programming, sensors and machine vision.
    """
}

def get_branch_code(dept_name):
    if not dept_name:
        return "CT"
    
    dept_name = dept_name.upper().strip()
    
    # Direct match
    if dept_name in BRANCH_SKILLS:
        return dept_name
        
    # Semantic match
    mappings = {
        "SOFTWARE": "CT",
        "ELECTRONICS": "EL",
        "ELECTRICAL": "EEE",
        "BIOMEDICAL": "BME",
        "ROBOTICS": "RPA",
        "AUTOMATION": "RPA",
        "COMPUTER": "CM" # Fallback CM for engineering
    }
    
    for key, code in mappings.items():
        if key in dept_name:
            return code
            
    return "CT" # Default

def normalize_text(text):
    if not text:
        return ""
    if not isinstance(text, str):
        text = str(text)
    # Standardize whitespace and remove weird character artifacts
    import re
    text = re.sub(r'\s+', ' ', text)
    return text.strip().lower()

def extract_resume_text(file):
    try:
        # Ensure we are at the start of the file if it's a file-like object
        if hasattr(file, 'seek'):
            file.seek(0)
            
        text = ""
        filename = getattr(file, 'name', 'resume.pdf').lower()
        
        if filename.endswith(".pdf"):
            import io
            # For some file-like objects, pdfminer needs a stream
            if hasattr(file, 'read'):
                stream = io.BytesIO(file.read())
                text = extract_text(stream)
            else:
                text = extract_text(file)
        elif filename.endswith(".docx"):
            doc = docx.Document(file)
            text = "\n".join([p.text for p in doc.paragraphs])
        elif filename.endswith(".txt"):
            if hasattr(file, 'read'):
                content = file.read()
                if isinstance(content, bytes):
                    text = content.decode('utf-8', errors='ignore')
                else:
                    text = content
            
        # If extraction is weirdly formatted (extra spaces between chars), try to heal it
        if text and len(text) > 10:
            import re
            # Check for excessive spacing (e.g., "P y t h o n")
            cleaned = re.sub(r'(\w)\s(?=\w)', r'\1', text)
            if len(cleaned) < len(text) * 0.7: # Only if significant reduction
                 text = cleaned
                 
        if not text:
             print(f"ATS Warning: No text extracted from {filename}")
                 
        return text
    except Exception as e:
        import traceback
        print(f"Extraction error for {getattr(file, 'name', 'unknown')}: {e}")
        traceback.print_exc()
    return ""

def calculate_ats_score(resume_text, job_description=None, branch="CT"):
    if not resume_text or len(resume_text.strip()) < 20:
        print("ATS Debug: Resume text too short or empty, returning 0.0 score.")
        return 0.0

    print(f"ATS Debug: Extracted resume text length: {len(resume_text)} characters.")

    # Map branch name to code
    branch = get_branch_code(branch)

    # Fallback to branch-specific DEFAULT_JD if none provided
    if job_description is None or isinstance(job_description, dict):
        # If a dict was passed (common error), pick the branch from it
        if isinstance(job_description, dict):
             job_description = job_description.get(branch, job_description.get("CT", ""))
        else:
             job_description = DEFAULT_JD.get(branch, DEFAULT_JD["CT"])

    resume_text = normalize_text(resume_text)
    job_description = normalize_text(job_description)

    # 1. Skill Match Score (50% Weight) - Critical for technical roles
    res_skills = set(extract_skills(resume_text, branch))
    jd_skills = set(extract_skills(job_description, branch))
    
    print(f"ATS Debug ({branch}): Resume skills found: {res_skills}")
    print(f"ATS Debug ({branch}): Job skills found: {jd_skills}")

    skill_match_score = 0
    if jd_skills:
        common_skills = res_skills.intersection(jd_skills)
        skill_match_score = (len(common_skills) / len(jd_skills)) * 100
        print(f"ATS Debug: Skill match score: {skill_match_score}% ({len(common_skills)}/{len(jd_skills)})")
    else:
        skill_match_score = 50 # Default if JD has no detectable skills

    # 2. Key Term Overlap (Spacy) (30% Weight)
    spacy_score = 0
    if nlp:
        res_doc = nlp(resume_text)
        jd_doc = nlp(job_description)
        
        # Filter for nouns and adjectives to catch meaningful terms
        res_tokens = set([token.text for token in res_doc if token.pos_ in ["NOUN", "PROPN", "ADJ"] and not token.is_stop])
        jd_tokens = set([token.text for token in jd_doc if token.pos_ in ["NOUN", "PROPN", "ADJ"] and not token.is_stop])
        
        if jd_tokens:
            common = res_tokens.intersection(jd_tokens)
            spacy_score = (len(common) / len(jd_tokens)) * 100
    
    # 3. Content Similarity (TF-IDF) (20% Weight)
    docs = [resume_text, job_description]
    try:
        vectorizer = TfidfVectorizer(stop_words='english', ngram_range=(1, 2))
        tfidf = vectorizer.fit_transform(docs)
        similarity = cosine_similarity(tfidf[0:1], tfidf[1:2])[0][0] * 100
    except:
        similarity = spacy_score # Fallback

    # Calculate Weighted Base Score
    base_score = (skill_match_score * 0.5) + (spacy_score * 0.3) + (similarity * 0.2)
    
    # 4. Section Presence (Bonus/Penalty)
    present, missing = check_resume_sections(resume_text)
    # Penalty: only -2% per missing section, capped at 10%
    section_penalty = min(len(missing) * 2, 10)
    
    # Boost for specific key matches
    boost = 0
    if "django" in resume_text and "django" in job_description: boost += 2
    if "react" in resume_text and "react" in job_description: boost += 2
    if "python" in resume_text and "python" in job_description: boost += 2

    final_result = base_score - section_penalty + boost
    
    # Ensure a non-zero score if there are ANY skill matches
    if len(res_skills.intersection(jd_skills)) > 0:
        final_result = max(final_result, 15.0)

    return max(0, min(100, round(final_result, 2)))

def extract_skills(text, branch="CT"):
    text = normalize_text(text)
    branch = get_branch_code(branch)
    
    skills_db = BRANCH_SKILLS.get(branch, [])
    found = []
    
    # Simple keyword match
    for skill in skills_db:
        if skill in text:
            found.append(skill)
            
    # Spacy entity extraction for potentially new skills (always helpful)
    if nlp:
        doc = nlp(text)
        for ent in doc.ents:
            if ent.label_ in ["ORG", "PRODUCT"] and ent.text.lower() not in found:
                # Add if it looks like a tech term (very basic heuristic)
                if len(ent.text) < 20:
                    found.append(ent.text.lower())

    return list(set(found))

def find_missing_skills(resume_skills, job_description, branch="CT"):
    job_description = job_description.lower()
    
    if branch not in BRANCH_SKILLS:
        branch = "CT"
        
    skills_db = BRANCH_SKILLS.get(branch, [])
    required = []

    for skill in skills_db:
        if skill in job_description:
            required.append(skill)

    missing = []
    for skill in required:
        if skill not in resume_skills:
            missing.append(skill)

    return missing

def check_resume_sections(text):
    text = text.lower()
    present = []
    missing = []

    for section, keywords in SECTION_KEYWORDS.items():
        if any(kw in text for kw in keywords):
            present.append(section)
    return present, missing

def get_missing_skills(resume_text, job):
    resume_words = resume_text.lower()
    required_skills = job.skills_required.lower().split(",")
    missing = []
    for skill in required_skills:
        skill_clean = skill.strip()
        if skill_clean and skill_clean not in resume_words:
            missing.append(skill_clean)
    return missing

def check_sections(resume_text):
    text_lower = resume_text.lower()
    sections = {
        "projects": "project" in text_lower,
        "internship": "intern" in text_lower or "internship" in text_lower,
        "summary": "summary" in text_lower or "objective" in text_lower,
        "skills": "skills" in text_lower,
    }
    return sections

def generate_recommendations(student, resume_text, job):
    suggestions = []
    # Skill gap
    missing_skills = get_missing_skills(resume_text, job)
    if missing_skills:
        suggestions.append(f"Add missing skills: {', '.join(missing_skills)}")

    # Sections
    sections = check_sections(resume_text)
    if not sections["projects"]:
        suggestions.append("Add at least 2 academic or personal projects")
    if not sections["internship"]:
        suggestions.append("Include internship or practical experience")
    if not sections["summary"]:
        suggestions.append("Add a professional summary at the top")
    
    # Missing basic sections formatting
    if not sections["projects"] and not sections["skills"]:
        suggestions.append("Fix formatting (use bullet points for skills and projects)")

    # CGPA logic
    try:
        if float(student.overall_cgpa) < 7:
            suggestions.append("Highlight skills and projects instead of CGPA")
    except:
        pass

    # Backlogs
    try:
        if int(student.total_backlogs) > 0:
            suggestions.append("Add certifications to strengthen profile")
    except:
        pass

    return suggestions

def ai_recommendation(resume_text):
    try:
        import os
        from huggingface_hub import InferenceClient
        hf_key = os.environ.get("HUGGINGFACE_API_KEY", "")
        # Dummy AI suggestion if no keys
        prompt = f"Analyze this resume and suggest improvements to make it ATS friendly:\n\n{resume_text[:2000]}"
        if hf_key:
            client = InferenceClient(api_key=hf_key)
            response = client.text_generation(
                model="google/flan-t5-large",
                inputs=prompt
            )
            return response
        else:
            return "Make sure to improve resume summary, add measurable achievements, and use bullet points for clarity."
    except Exception as e:
        print(f"AI Recommendation Error: {e}")
        return "Ensure clear formatting, quantifiable achievements, and concise bullet points."

def final_recommendation(student, resume_text, job):
    rule_based = generate_recommendations(student, resume_text, job)
    ai_based = ai_recommendation(resume_text)
    return {
        "rule_suggestions": rule_based,
        "ai_suggestions": ai_based
    }