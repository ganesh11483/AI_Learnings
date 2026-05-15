from openai import OpenAI
from typing import List, Dict, Optional
from app.core.config import settings
import json


class LLMService:
    """Service for LLM-based medical coding and analysis."""
    
    def __init__(self):
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY) if settings.OPENAI_API_KEY else None
        self.model = settings.OPENAI_MODEL
        self.embedding_model = settings.OPENAI_EMBEDDING_MODEL
    
    def extract_entities(self, text: str) -> Dict:
        """Extract medical entities from clinical text."""
        prompt = f"""
You are a medical coding expert. Extract medical entities from the following clinical documentation.

Clinical Text:
{text}

Extract and return a JSON object with the following structure:
{{
    "diagnoses": [
        {{"text": "diagnosis name", "context": "relevant context", "confidence": 0.95}}
    ],
    "procedures": [
        {{"text": "procedure name", "context": "relevant context", "confidence": 0.90}}
    ],
    "medications": [
        {{"text": "medication name", "context": "relevant context", "confidence": 0.95}}
    ],
    "lab_tests": [
        {{"text": "lab test name", "context": "relevant context", "confidence": 0.90}}
    ]
}}

Only include entities that are clearly mentioned in the text. Provide confidence scores between 0.0 and 1.0.
"""
        
        if not self.client:
            raise ValueError("OpenAI API key not configured")
        
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": "You are a medical coding expert specializing in ICD-10, CPT, and HCPCS coding."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            response_format={"type": "json_object"}
        )
        
        return json.loads(response.choices[0].message.content)
    
    def suggest_codes(self, entity_text: str, entity_type: str) -> List[Dict]:
        """Suggest medical codes for an entity."""
        code_system = "ICD-10" if entity_type in ["diagnosis", "symptom"] else "CPT"
        
        prompt = f"""
You are a medical coding expert. Suggest appropriate {code_system} codes for the following medical entity.

Entity: {entity_text}
Type: {entity_type}

Return a JSON object with the following structure:
{{
    "suggested_codes": [
        {{
            "code": "code value",
            "description": "code description",
            "confidence": 0.95,
            "rationale": "brief explanation for why this code fits"
        }}
    ]
}}

Provide 3-5 most relevant codes with confidence scores between 0.0 and 1.0.
"""
        
        if not self.client:
            raise ValueError("OpenAI API key not configured")
        
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": "You are a medical coding expert specializing in ICD-10, CPT, and HCPCS coding."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,
            response_format={"type": "json_object"}
        )
        
        result = json.loads(response.choices[0].message.content)
        return result.get("suggested_codes", [])
    
    def validate_claim(self, claim_data: Dict) -> Dict:
        """Validate a medical claim for errors and compliance issues."""
        prompt = f"""
You are a medical claims validation expert. Review the following claim data for errors, compliance issues, and potential denials.

Claim Data:
{json.dumps(claim_data, indent=2)}

Return a JSON object with the following structure:
{{
    "is_valid": true/false,
    "errors": [
        {{
            "type": "error type (e.g., coding, medical_necessity, documentation)",
            "severity": "error/warning/info",
            "message": "detailed error message",
            "suggestion": "how to fix the issue"
        }}
    ],
    "overall_score": 0.95,
    "summary": "brief summary of claim quality"
}}

Check for:
- Coding accuracy and specificity
- Medical necessity
- Documentation completeness
- Compliance with payer rules
- Common denial reasons
"""
        
        if not self.client:
            raise ValueError("OpenAI API key not configured")
        
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": "You are a medical claims validation expert."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            response_format={"type": "json_object"}
        )
        
        return json.loads(response.choices[0].message.content)
    
    def generate_embedding(self, text: str) -> List[float]:
        """Generate embedding vector for text."""
        if not self.client:
            raise ValueError("OpenAI API key not configured")
        
        response = self.client.embeddings.create(
            model=self.embedding_model,
            input=text
        )
        
        return response.data[0].embedding
    
    def explain_code(self, code: str, code_system: str) -> str:
        """Get detailed explanation of a medical code."""
        prompt = f"""
Provide a detailed explanation of the following {code_system} code: {code}

Include:
- Code description
- When to use this code
- Documentation requirements
- Common errors or misuse
- Related codes
"""
        
        if not self.client:
            raise ValueError("OpenAI API key not configured")
        
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": "You are a medical coding expert."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.5
        )
        
        return response.choices[0].message.content


# Global LLM service instance
llm_service = LLMService()
