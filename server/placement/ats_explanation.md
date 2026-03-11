# How the ATS (Applicant Tracking System) Checker Works

This document provides a detailed explanation of the logic and code behind the ATS Checker implemented in `ats_utils.py`.

The system is designed to evaluate a candidate's resume against a job description, returning a match score from 0 to 100%. It leverages natural language processing (NLP) and machine learning techniques via libraries such as `spaCy` and `scikit-learn` (TF-IDF).

---

## 1. Document Parsing & Text Extraction

The first step is to extract text from the uploaded resume. The ATS supports PDF, DOCX, and TXT formats.

```python
def extract_resume_text(file):
    ...
    if filename.endswith(".pdf"):
        text = extract_text(stream) # Uses pdfminer.six
    elif filename.endswith(".docx"):
        doc = docx.Document(file)
        text = "\n".join([p.text for p in doc.paragraphs])
    ...
```

Once extracted, the text undergoes normalization to ensure consistent matching:
```python
def normalize_text(text):
    import re
    text = re.sub(r'\s+', ' ', text)
    return text.strip().lower()
```

---

## 2. Skill Databases & Job Descriptions

The system uses predefined dictionaries to assist with the evaluation:
- `BRANCH_SKILLS`: A database of technical skills categorized by engineering branches (e.g., Computer Technology, Electrical, Robotics).
- `DEFAULT_JD`: Default fallback job descriptions for each branch if a specific one isn't provided.
- `SECTION_KEYWORDS`: Keywords used to identify the presence of standard resume sections like "Education", "Experience", and "Contact".

---

## 3. The Core Scoring Algorithm

The `calculate_ats_score` function computes the final percentage match based on four distinct components.

### A. Skill Match Score (Weight: 50%)
The most critical part of the technical evaluation is identifying how many required skills the candidate possesses.

```python
# Extract skills for both resume and job description
res_skills = set(extract_skills(resume_text, branch))
jd_skills = set(extract_skills(job_description, branch))

# Calculate precision of skill matching
common_skills = res_skills.intersection(jd_skills)
skill_match_score = (len(common_skills) / len(jd_skills)) * 100
```
*Note: Skill extraction uses both predefined keyword matching (against `BRANCH_SKILLS`) and `spaCy` Named Entity Recognition (NER) to find new technical terms.*

### B. Key Term Overlap using spaCy (Weight: 30%)
Beyond predefined skills, the system uses NLP to extract and compare significant words (Nouns, Proper Nouns, Adjectives).

```python
# Filter for meaningful terms
res_tokens = set([token.text for token in res_doc if token.pos_ in ["NOUN", "PROPN", "ADJ"] and not token.is_stop])
jd_tokens = set([token.text for token in jd_doc if token.pos_ in ["NOUN", "PROPN", "ADJ"] and not token.is_stop])

# Calculate overlap
common = res_tokens.intersection(jd_tokens)
spacy_score = (len(common) / len(jd_tokens)) * 100
```

### C. Content Similarity using TF-IDF (Weight: 20%)
To assess the overall thematic context of the resume versus the job description, the system uses Term Frequency-Inverse Document Frequency (TF-IDF) combined with Cosine Similarity. 

```python
vectorizer = TfidfVectorizer(stop_words='english', ngram_range=(1, 2))
tfidf = vectorizer.fit_transform([resume_text, job_description])
similarity = cosine_similarity(tfidf[0:1], tfidf[1:2])[0][0] * 100
```

### D. Resume Structure Penalties & Boosts
A well-structured resume is rewarded, and critical skills can offer a direct score boost.
- **Missing Sections:** The system checks for standard sections (Education, Skills, etc.). It applies a **2% penalty per missing section** (capped at 10%).
- **Keyword Boosts:** Explicit boosts are awarded for highly desirable skills (e.g., +2% for Django, React, or Python).

```python
base_score = (skill_match_score * 0.5) + (spacy_score * 0.3) + (similarity * 0.2)

# Deduct penalties for missing sections (e.g. Contact Info, Education)
section_penalty = min(len(missing) * 2, 10)

# Add explicit boosts for in-demand keywords
boost = 0
if "django" in resume_text: boost += 2
...

final_result = base_score - section_penalty + boost
```

---

## Summary

The ATS Checker evaluates resumes holistically:
1. It validates exact **Skill Matches (50%)**.
2. It understands contextual alignment using **NLP Key Terms (30%)**.
3. It measures broad textual similarities using **Machine Learning TF-IDF (20%)**.
4. It enforces **Formatting Standards** by checking for structural completeness.

This results in a realistic and fair compatibility score ranging from 0 to 100%.
