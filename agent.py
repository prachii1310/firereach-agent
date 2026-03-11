from tools import (
    tool_signal_harvester,
    tool_research_analyst,
    tool_outreach_automated_sender
)

def run_agent(icp, company, email):

    signals = tool_signal_harvester(company)

    research = tool_research_analyst(signals, icp)

    status = tool_outreach_automated_sender(research, email)

    return {
        "signals": signals,
        "research": research,
        "email_status": status
    }