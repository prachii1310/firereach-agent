import os
import requests
from dotenv import load_dotenv
from tavily import TavilyClient
from groq import Groq

load_dotenv()

tavily = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))
groq = Groq(api_key=os.getenv("GROQ_API_KEY"))
RESEND_API_KEY = os.getenv("RESEND_API_KEY")


# TOOL 1
def tool_signal_harvester(company):
    result = tavily.search(f"{company} company growth news", max_results=3)
    signals = []
    for r in result["results"]:
        signals.append(r["title"])
    return signals


# TOOL 2
def tool_research_analyst(signals, icp):
    prompt = f"""You are a B2B sales research analyst. Write a structured account brief.

ICP (Ideal Customer Profile): {icp}

Recent Company Signals:
{chr(10).join(f"- {s}" for s in signals)}

Write a clear, structured account brief with the following format:

Company Overview:
[2-3 sentences summarizing the company's current growth trajectory based on the signals above.]

Why They Need Our Product:
[2-3 sentences explaining, based on the ICP and signals, why this company is a strong fit and what pain points our product addresses.]

Outreach Angle:
[1-2 sentences suggesting the best hook or angle for a personalized outreach message.]

Rules:
- Each heading must be followed by its content on the NEXT line.
- Do not put the heading and its text on the same line.
- Be specific and data-driven. Reference the actual signals.
- Keep the tone professional and concise.
- Do not add any extra commentary outside the three sections above.
"""

    completion = groq.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}]
    )

    return completion.choices[0].message.content


# TOOL 3
def tool_outreach_automated_sender(research, email):
    prompt = f"""You are a B2B sales copywriter. Write a short, personalized cold outreach email.

Account Research:
{research}

Rules:
- Keep it under 150 words.
- Open with a specific observation from the research (not a generic opener).
- One clear value proposition sentence.
- One soft call to action (e.g., "Would you be open to a quick 15-min call?").
- No subject line — just the email body.
- Professional but conversational tone.
"""

    completion = groq.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}]
    )

    email_text = completion.choices[0].message.content

    response = requests.post(
    "https://api.resend.com/emails",
    headers={
        "Authorization": f"Bearer {RESEND_API_KEY}",
        "Content-Type": "application/json"
    },
    json={
        "from": "FireReach <onboarding@resend.dev>",
        "to": [email],
        "subject": "Partnership Opportunity",
        "text": email_text
    }
)

    return "Email Sent"