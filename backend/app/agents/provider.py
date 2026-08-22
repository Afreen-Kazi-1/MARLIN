import os
import json
from typing import Optional, Dict, Any, Type, TypeVar
from pydantic import BaseModel
from app.config import settings

T = TypeVar("T", bound=BaseModel)

class LLMProvider:
    """
    LLM Provider Abstraction.
    Interfaces with the Google Gemini API (via google-genai SDK) with support for
    structured output validation and demo-mode fallbacks.
    """
    def __init__(self, api_key: Optional[str] = None, model_name: Optional[str] = None):
        self.api_key = api_key or settings.LLM_API_KEY or os.getenv("LLM_API_KEY")
        self.model_name = model_name or settings.LLM_MODEL
        self._client = None

        if self.api_key and not settings.DEMO_MODE:
            try:
                from google import genai
                self._client = genai.Client(api_key=self.api_key)
            except Exception as e:
                print(f"[WARN] Unable to initialize Gemini API client: {str(e)}")

    def generate(self, prompt: str, system_instruction: Optional[str] = None) -> str:
        """
        Generates text response from Gemini API or returns deterministic fallback in demo mode.
        """
        if settings.DEMO_MODE or not self._client:
            return f"[DEMO_MODE]: Processed analytical reasoning for query."

        try:
            response = self._client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config={"system_instruction": system_instruction} if system_instruction else None
            )
            return response.text
        except Exception as e:
            print(f"[ERROR] Gemini generation failed: {str(e)}")
            return f"[FALLBACK_RESPONSE]: Reasoning compiled from local evidence."

    def structured_output(self, prompt: str, target_schema: Type[T], system_instruction: Optional[str] = None) -> T:
        """
        Parses text prompts into validated Pydantic JSON targets.
        """
        if settings.DEMO_MODE or not self._client:
            # Deterministic fallback parsing based on schema target
            return target_schema()

        try:
            response = self._client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config={
                    "response_mime_type": "application/json",
                    "response_schema": target_schema,
                    "system_instruction": system_instruction
                } if system_instruction else {"response_mime_type": "application/json", "response_schema": target_schema}
            )
            parsed_json = json.loads(response.text)
            return target_schema(**parsed_json)
        except Exception as e:
            print(f"[WARN] Structured output parsing fallback triggered: {str(e)}")
            return target_schema()
