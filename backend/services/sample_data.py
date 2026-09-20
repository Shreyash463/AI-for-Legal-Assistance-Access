from typing import Dict, Any, List
from backend.models.schemas import (
    SimplifiedSection, RiskItem, ActionChecklist, DocumentMetadata, DocumentAnalysisResponse
)

def get_sample_lease_analysis(raw_text: str) -> DocumentAnalysisResponse:
    sections = [
        SimplifiedSection(
            id="sec-1",
            title="Section 1: Premises and Term",
            original_text="1.1 Premises: Landlord hereby leases to Tenant... 1.3 Automatic Renewal: UNLESS TENANT PROVIDES WRITTEN NOTICE OF NON-RENEWAL AT LEAST SIXTY (60) DAYS PRIOR TO THE EXPIRATION OF THE INITIAL TERM, THIS LEASE SHALL AUTOMATICALLY RENEW FOR AN ADDITIONAL TWELVE (12) MONTH TERM UNDER THE SAME CONDITIONS, EXCEPT THAT RENT SHALL AUTOMATICALLY INCREASE BY TEN PERCENT (10%). Failure to provide written notice via certified mail strictly within this window forfeits Tenant's right to vacate.",
            plain_english="You are renting Apt 4B for 12 months. WARNING: If you do not send written notice by certified mail at least 60 days before the lease ends, your lease automatically locks you in for another entire year, and your rent automatically jumps by 10%.",
            category="Term & Renewal",
            key_takeaways=[
                "12-month initial lease duration",
                "Trap: Mandatory 60-day written notice via certified mail required to move out",
                "Automatic 10% rent hike upon auto-renewal"
            ],
            reading_level="Standard Plain English"
        ),
        SimplifiedSection(
            id="sec-2",
            title="Section 2: Rent and Payment",
            original_text="2.1 Monthly Rent: $2,200.00... 2.2 Late Fees: If rent is not received by 11:59 PM on the 3rd, a late fee of $150.00 shall apply, plus $25.00 per day... 2.3 Payment Method: Landlord's designated electronic portal ($35.00 processing fee).",
            plain_english="Rent is $2,200/month due on the 1st. There is a very short grace period: late fees kick in on the 4th at $150 plus $25 every single day. Every online payment also forces you to pay an extra $35 processing fee.",
            category="Payment",
            key_takeaways=[
                "$2,200 monthly base rent",
                "Aggressive late fee ($150 + $25/day after day 3)",
                "Forced $35 monthly payment portal fee"
            ],
            reading_level="Standard Plain English"
        ),
        SimplifiedSection(
            id="sec-3",
            title="Section 3: Security Deposit",
            original_text="3.1 Deposit Amount: $4,400.00 (two months' rent)... 3.2 Deductions: Landlord shall have 90 days following surrender of possession to deliver an itemized statement... If Tenant terminates early, entire deposit is automatically forfeited as liquidated damages.",
            plain_english="Deposit is 2 months of rent ($4,400). The landlord gives themselves up to 90 days after you move out to return your deposit (much longer than standard 14-30 day legal caps in many jurisdictions). If you break the lease early, they confiscate your entire $4,400 deposit automatically.",
            category="Payment & Deposit",
            key_takeaways=[
                "$4,400 deposit (high upfront capital)",
                "90-day return window (potentially violating local tenant laws)",
                "Automatic total forfeiture if lease ends early"
            ],
            reading_level="Standard Plain English"
        ),
        SimplifiedSection(
            id="sec-4",
            title="Section 4: Termination and Early Cancellation",
            original_text="4.1 Early Termination: Tenant possesses no right to early termination... strictly liable for all rent through remainder of term plus Early Break Fee of $4,400.00... 4.2 Landlord's Immediate Right of Termination: Landlord may terminate upon 3 days' notice in Landlord's sole discretion.",
            plain_english="You have zero right to end the lease early. If you move out, you must pay all remaining months of the year PLUS a penalty of $4,400. Meanwhile, the landlord can kick you out on just 3 days' notice for any rule violation they choose.",
            category="Termination",
            key_takeaways=[
                "Extremely one-sided: No early exit rights for tenant",
                "Severe penalty: Remaining rent + 2 months fee ($4,400)",
                "Landlord can terminate on 3 days notice unilaterally"
            ],
            reading_level="Standard Plain English"
        ),
        SimplifiedSection(
            id="sec-5",
            title="Section 5: Maintenance, Repairs, and Entry",
            original_text="5.1 Maintenance: Tenant strictly liable for plumbing stoppage, window breakage, or repair under $300.00, regardless of cause or prior wear-and-tear... 5.2 Landlord Access: Enter anytime for emergencies or upon 4 hours' notice for inspections or showings.",
            plain_english="You are forced to pay for any repair under $300 even if the damage was caused by age, bad pipes, or previous tenants. The landlord can also enter your home on just 4 hours notice (standard law usually requires 24 hours).",
            category="Maintenance & Privacy",
            key_takeaways=[
                "Tenant pays first $300 of repairs regardless of fault",
                "Landlord invasive entry notice: only 4 hours"
            ],
            reading_level="Standard Plain English"
        ),
        SimplifiedSection(
            id="sec-6",
            title="Section 6: Restrictions and Conduct",
            original_text="6.1 Subletting and Guests: Subletting, Airbnb, or guests staying > 3 consecutive nights without written consent is an incurable breach... 6.2 Pets: $750 fee + $75 monthly rent.",
            plain_english="No subletting or Airbnb. Any guest staying more than 3 consecutive nights is considered a lease breach. Pets cost $750 upfront plus $75 each month.",
            category="Restrictions",
            key_takeaways=[
                "Guest limit: 3 consecutive nights max without written consent",
                "Strict pet fees: $750 non-refundable + $75/mo"
            ],
            reading_level="Standard Plain English"
        ),
        SimplifiedSection(
            id="sec-7",
            title="Section 7: Indemnification and Liability Waiver",
            original_text="7.1 Limitation of Liability: Landlord not liable for damage, loss, or injury resulting from fire, water, burst pipes, theft, mold, even if caused by ordinary negligence of Landlord... 7.2 Tenant Indemnity: Tenant agrees to defend, indemnify, and hold harmless Landlord...",
            plain_english="The landlord claims zero liability even if their own negligence causes a pipe to burst, mold to spread, or personal injury. You also agree to pay all legal fees if someone sues the landlord over your apartment.",
            category="Liability",
            key_takeaways=[
                "Full liability waiver shielding landlord even for landlord's negligence",
                "Tenant indemnifies landlord from third-party lawsuits"
            ],
            reading_level="Standard Plain English"
        ),
        SimplifiedSection(
            id="sec-8",
            title="Section 8: Dispute Resolution and Governing Law",
            original_text="8.1 Mandatory Binding Arbitration: Before single arbitrator selected solely by Landlord. Tenant waives jury trial... 8.2 Class Action Waiver... 8.3 Attorney Fees: Tenant shall reimburse Landlord for all attorney fees regardless of whether Landlord prevails.",
            plain_english="You give up your right to go to court or join a class action. Any dispute must go to an arbitrator chosen exclusively by the landlord. Shockingly, you agree to pay the landlord's attorney fees even if you WIN the dispute.",
            category="Dispute Resolution",
            key_takeaways=[
                "Mandatory arbitration with arbitrator handpicked by landlord",
                "Jury trial and class action waiver",
                "One-sided attorney fee clause (tenant pays even if landlord loses)"
            ],
            reading_level="Standard Plain English"
        )
    ]

    risks = [
        RiskItem(
            id="risk-1",
            clause_name="Automatic 12-Month Renewal with 10% Escalation",
            section_id="sec-1",
            severity="HIGH",
            original_quote="THIS LEASE SHALL AUTOMATICALLY RENEW FOR AN ADDITIONAL TWELVE (12) MONTH TERM... RENT SHALL AUTOMATICALLY INCREASE BY TEN PERCENT (10%)",
            why_it_matters="You could be accidentally trapped in another full year lease with higher rent if you miss the 60-day certified mail window.",
            potential_impact="Financial commitment of over $29,000 for an unwanted second year.",
            suggested_action="Request amending to month-to-month tenancy upon lease expiration, or standard 30-day email notice."
        ),
        RiskItem(
            id="risk-2",
            clause_name="Unilateral Landlord Attorney Fee Shifting",
            section_id="sec-8",
            severity="HIGH",
            original_quote="Tenant shall reimburse Landlord for all legal and attorney fees incurred by Landlord, regardless of whether Landlord prevails in the dispute.",
            why_it_matters="You are forced to pay the landlord's lawyers even if you win the case. Highly one-sided and punitive.",
            potential_impact="Severe financial exposure in any legitimate disagreement.",
            suggested_action="Insist on mutual prevailing-party fee clause ('the prevailing party shall recover reasonable fees') or deletion."
        ),
        RiskItem(
            id="risk-3",
            clause_name="Security Deposit Forfeiture & 90-Day Return",
            section_id="sec-3",
            severity="HIGH",
            original_quote="Landlord shall have ninety (90) days... If Tenant terminates early for any reason, the entire deposit is automatically forfeited as liquidated damages.",
            why_it_matters="90 days is double or triple statutory limits in most states; automatic total forfeiture is often legally unenforceable as an unlawful penalty.",
            potential_impact="Immediate loss of $4,400 security deposit.",
            suggested_action="Align return timeline with state statutory maximum (typically 21-30 days) and remove automatic total forfeiture."
        ),
        RiskItem(
            id="risk-4",
            clause_name="4-Hour Invasive Entry Notice",
            section_id="sec-5",
            severity="MEDIUM",
            original_quote="upon four (4) hours' verbal or electronic notice for inspections, appraisals, routine maintenance, or showings",
            why_it_matters="Compromises your privacy and quiet enjoyment of your home with virtually zero advance notice.",
            potential_impact="Disruptive surprise visits for routine showings.",
            suggested_action="Amend to standard 24-hour advance written notice except in true emergencies."
        ),
        RiskItem(
            id="risk-5",
            clause_name="Tenant Pays First $300 of All Repairs",
            section_id="sec-5",
            severity="MEDIUM",
            original_quote="Tenant is strictly liable for any plumbing stoppage, window breakage, or appliance repair cost under $300.00, regardless of cause or prior wear-and-tear.",
            why_it_matters="Shifts landlord's structural and appliance maintenance burden onto tenant.",
            potential_impact="Frequent out-of-pocket costs for pre-existing or mechanical failures.",
            suggested_action="Limit tenant repair liability solely to damage caused by tenant's willful negligence or misuse."
        ),
        RiskItem(
            id="risk-6",
            clause_name="Aggressive Late Penalty Structure",
            section_id="sec-2",
            severity="LOW",
            original_quote="late fee of $150.00 shall immediately apply, plus an additional daily penalty of $25.00 per day until paid in full",
            why_it_matters="Daily compounding late fees can escalate a small cash-flow delay into an insurmountable penalty.",
            potential_impact="Accumulation of hundreds of dollars in fees within days.",
            suggested_action="Request a flat 5% late fee cap with a 5-day grace period."
        )
    ]

    checklist = ActionChecklist(
        questions_for_lawyer=[
            "Is the 90-day deposit return window and total liquidated damages forfeiture enforceable under our state/local tenant laws?",
            "Can the landlord legally compel arbitration with an arbitrator chosen solely by themselves?",
            "Is the clause requiring tenant to pay landlord's legal fees even when tenant prevails void against public policy?",
            "Does our state statute mandate a minimum 24-hour notice before landlord entry for non-emergencies?"
        ],
        red_flags_to_clarify=[
            "60-day certified mail notice requirement for non-renewal (mark this deadline on calendar immediately)",
            "$300 repair deductible regardless of prior wear-and-tear",
            "$35 mandatory fee per monthly rent transaction portal",
            "Broad waiver of landlord liability for plumbing and mold damages"
        ],
        recommended_next_steps=[
            "Document existing apartment conditions with timestamped photos and video before moving in.",
            "Formally request a lease amendment to strike the 90-day deposit return and replace with statutory 21-30 days.",
            "Propose a mutual 24-hour entry notice clause and mutual prevailing-party attorney fee clause.",
            "Set a calendar reminder 75 days prior to lease end to deliver non-renewal notice if planning to move."
        ]
    )

    metadata = DocumentMetadata(
        filename="Residential_Lease_Agreement.txt",
        file_type="Residential Lease",
        word_count=len(raw_text.split()),
        character_count=len(raw_text),
        section_count=len(sections),
        overall_risk_score="Critical Risk",
        executive_summary=(
            "This residential lease contains multiple heavily one-sided terms that strongly favor the landlord. "
            "Key hazards include a 60-day auto-renewal trap with a 10% rent hike, a 90-day security deposit return period, "
            "an unprecedented clause requiring the tenant to pay the landlord's legal fees even if the tenant wins in arbitration, "
            "and a 4-hour landlord entry notice."
        )
    )

    return DocumentAnalysisResponse(
        document_id="doc-sample-lease",
        metadata=metadata,
        sections=sections,
        risks=risks,
        checklist=checklist,
        raw_text=raw_text
    )
