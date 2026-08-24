import json
import os
import sys

# Add backend to path so we can import app
sys.path.append(os.path.join(os.path.dirname(__file__), '../backend'))

from fastapi.testclient import TestClient
from app.main import app

def run_evaluation():
    # Configure standard streams to support UTF-8 on Windows environments
    import sys
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
    if hasattr(sys.stderr, 'reconfigure'):
        sys.stderr.reconfigure(encoding='utf-8')

    client = TestClient(app)
    
    questions_path = os.path.join(os.path.dirname(__file__), '../evaluation/questions.json')
    if not os.path.exists(questions_path):
        print("questions.json not found.")
        return

    with open(questions_path, 'r', encoding='utf-8') as f:
        questions = json.load(f)

    total_claims = 0
    unsupported_claims = 0

    print(f"Starting evaluation of {len(questions)} benchmark questions...")
    print("-" * 50)

    for idx, q in enumerate(questions):
        print(f"[{idx+1}/{len(questions)}] Q: {q['question']}")

        try:
            import time
            time.sleep(3)

            res = client.post("/api/query", json={"question": q['question']})
            if res.status_code != 200:
                print(f"  -> ERROR: {res.status_code} - {res.text}")
                continue
                
            data = res.json()
            answer_text = data.get("answer", "No answer provided")
            claims = data.get("claims", [])
            
            q_total_claims = len(claims)
            q_unsupported = sum(1 for c in claims if c.get("status") in ("unsupported", "insufficient_evidence", "contradicted"))
            
            total_claims += q_total_claims
            unsupported_claims += q_unsupported
            
            print(f"  -> Answer: {answer_text}")
            print(f"  -> Generated {q_total_claims} claims. Unsupported: {q_unsupported}")
            
        except Exception as e:
            print(f"  -> FAILED: {str(e)}")

    print("-" * 50)
    print("EVALUATION RESULTS")
    print(f"Total Claims Generated: {total_claims}")
    print(f"Unsupported/Contradicted Claims: {unsupported_claims}")
    
    if total_claims > 0:
        unsupported_rate = (unsupported_claims / total_claims) * 100
        print(f"Unsupported Claim Rate: {unsupported_rate:.2f}%")
        if unsupported_rate < 15.0:
            print("[PASS] System meets the high-grounding requirement.")
        else:
            print("[WARN] Unsupported claim rate is high.")
    else:
        print("No claims generated.")

if __name__ == "__main__":
    run_evaluation()
