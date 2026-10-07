# backend/generate_demo_policy.py
import os
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable, PageBreak, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
import fitz

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "demo_policies")
os.makedirs(OUTPUT_DIR, exist_ok=True)

def create_digital_demo_policy():
    """
    Creates a high-fidelity 4-page synthetic health insurance policy schedule with known values:
    - Provider: MediSure General Insurance
    - Policy Name: MediSure Shield Platinum Plan
    - Policy Number: MS/2026/889210P
    - Sum Insured: ₹10,00,000
    - Room Rent Limit: ₹5,000/day (1% of Sum Insured)
    - ICU Limit: Covered at actuals (No sub-limit)
    - Deductible: ₹20,000
    - Co-Payment: 10%
    - Initial Waiting Period: 30 days
    - Specific Illness Waiting: 24 months
    - Pre-Existing Diseases (PED) Waiting: 36 months
    - Consumables Rider: Active (Care Shield)
    """
    pdf_path = os.path.join(OUTPUT_DIR, "MediSure_Demo_Health_Policy.pdf")
    doc = SimpleDocTemplate(pdf_path, pagesize=letter, rightMargin=54, leftMargin=54, topMargin=54, bottomMargin=54)

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle('DocTitle', parent=styles['Heading1'], fontSize=18, textColor=colors.HexColor("#174C3C"), spaceAfter=6)
    sub_title = ParagraphStyle('SubTitle', parent=styles['Normal'], fontSize=10, textColor=colors.HexColor("#8AA99A"), spaceAfter=14)
    h2_style = ParagraphStyle('H2', parent=styles['Heading2'], fontSize=13, textColor=colors.HexColor("#174C3C"), spaceBefore=10, spaceAfter=6)
    body = ParagraphStyle('Body', parent=styles['Normal'], fontSize=9.5, leading=14, textColor=colors.HexColor("#202B27"), spaceAfter=8)
    disclaimer_style = ParagraphStyle('Discl', parent=styles['Normal'], fontSize=8.5, textColor=colors.HexColor("#B45309"), spaceAfter=10)

    story = []

    # PAGE 1: Schedule of Insurance
    story.append(Paragraph("DEMO POLICY — NOT A REAL INSURANCE CONTRACT", disclaimer_style))
    story.append(Paragraph("MediSure General Insurance", title_style))
    story.append(Paragraph("Policy Schedule & Certificate of Insurance", sub_title))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#174C3C"), spaceAfter=12))

    story.append(Paragraph("<b>Section 1: Policy Identification & Insured Persons</b>", h2_style))
    p1_data = [
        ["Policy Name:", "MediSure Shield Platinum Plan", "Policy Number:", "MS/2026/889210P"],
        ["Insurance Provider:", "MediSure General Insurance", "Policy Type:", "Family Floater Health Plan"],
        ["Base Sum Insured:", "INR 10,00,000 (Rupees Ten Lakhs)", "Policy Period:", "15-Apr-2026 to 14-Apr-2027"],
        ["Annual Deductible:", "INR 20,000", "Co-Payment:", "10% on admissible claims"]
    ]
    t1 = Table(p1_data, colWidths=[110, 150, 100, 140])
    t1.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F7F8F5")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E8ECE8")),
        ('FONTNAME', (0,0), (0,-1), 'Helvetica-Bold'),
        ('FONTNAME', (2,0), (2,-1), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 8.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('TOPPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t1)
    story.append(Spacer(1, 14))

    story.append(Paragraph("<b>1.2 Scope of Cover</b>", h2_style))
    story.append(Paragraph(
        "Subject to the terms, exclusions, and conditions contained herein, the Company agrees to indemnify the Insured up to the Base Sum Insured of INR 10,00,000 for reasonable and customary in-patient hospitalization expenses incurred during the policy period. An annual aggregate deductible of INR 20,000 shall apply across all cumulative eligible claims in the policy year before claim liability attaches.",
        body
    ))
    story.append(PageBreak())

    # PAGE 2: Room Rent and ICU Coverage
    story.append(Paragraph("DEMO POLICY — NOT A REAL INSURANCE CONTRACT", disclaimer_style))
    story.append(Paragraph("<b>Section 2: Hospitalization Benefits & Room Rent Limits</b>", title_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#174C3C"), spaceAfter=12))

    story.append(Paragraph("<b>2.1 Room Rent, Boarding and Nursing Expenses</b>", h2_style))
    story.append(Paragraph(
        "Room rent, boarding, and nursing charges are covered up to 1% of Sum Insured per day (INR 5,000 per day). If the insured person is admitted to a hospital room category higher than Single Private A/C Room, all associated medical expenses including doctor rounds and surgeon fees shall be subject to proportionate deduction.",
        body
    ))

    story.append(Paragraph("<b>2.2 Intensive Care Unit (ICU / ICCU)</b>", h2_style))
    story.append(Paragraph(
        "Intensive Care Unit (ICU) and Intensive Cardiac Care Unit (ICCU) room boarding charges are covered at actuals with no sub-limit or percentage capping, provided medically certified by the attending intensivist.",
        body
    ))

    story.append(Paragraph("<b>2.3 Day Care Procedures & Surgeries</b>", h2_style))
    story.append(Paragraph(
        "Coverage extends to over 540 listed Day Care treatments requiring less than 24 hours of hospital stay due to technological advances in surgical procedures.",
        body
    ))

    story.append(Paragraph("<b>2.4 Ambulance Charges</b>", h2_style))
    story.append(Paragraph(
        "Emergency road ambulance expenses are payable up to INR 3,000 per hospitalization for transportation to the nearest network hospital.",
        body
    ))
    story.append(PageBreak())

    # PAGE 3: Waiting Periods and Exclusions
    story.append(Paragraph("DEMO POLICY — NOT A REAL INSURANCE CONTRACT", disclaimer_style))
    story.append(Paragraph("<b>Section 3: Waiting Periods & General Exclusions</b>", title_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#174C3C"), spaceAfter=12))

    story.append(Paragraph("<b>3.1 Initial Waiting Period</b>", h2_style))
    story.append(Paragraph(
        "Expenses related to the treatment of any illness within 30 days initial waiting period from the first policy commencement date shall be excluded, except hospitalizations resulting directly from accidental injury.",
        body
    ))

    story.append(Paragraph("<b>3.2 Specific Illness Waiting Period</b>", h2_style))
    story.append(Paragraph(
        "A waiting period of 24 months shall apply for listed slow-developing ailments including cataract, hernia, hydrocele, gall stones, and joint replacement surgeries, regardless of pre-existence.",
        body
    ))

    story.append(Paragraph("<b>3.3 Pre-Existing Diseases (PED) Waiting Period</b>", h2_style))
    story.append(Paragraph(
        "Any condition diagnosed within 36 months prior to policy inception shall not be covered until 36 continuous months of coverage have elapsed without break.",
        body
    ))

    story.append(Paragraph("<b>3.4 Permanent Exclusions</b>", h2_style))
    story.append(Paragraph(
        "1. Cosmetic & Plastic Surgery: Expenses incurred on cosmetic or aesthetic surgeries are permanently excluded.<br/>"
        "2. Diagnostic Hospital Admission: Hospitalization purely for investigation or evaluation without active medical therapy is excluded.<br/>"
        "3. Unproven & Experimental Therapies: Any unproven or experimental treatments are explicitly non-payable.<br/>"
        "4. Maternity Expenses: Maternity, childbirth, and voluntary termination of pregnancy are not covered under this base plan tier.",
        body
    ))
    story.append(PageBreak())

    # PAGE 4: Riders and Modern Treatments
    story.append(Paragraph("DEMO POLICY — NOT A REAL INSURANCE CONTRACT", disclaimer_style))
    story.append(Paragraph("<b>Section 4: Optional Riders & Modern Medical Treatments</b>", title_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#174C3C"), spaceAfter=12))

    story.append(Paragraph("<b>4.1 Care Shield Consumables Protection Rider</b>", h2_style))
    story.append(Paragraph(
        "Under Active Endorsement CS-2026: Non-medical consumable items specified under IRDAI Annexure I (including surgical gloves, PPE kits, masks, and syringes) are indemnified up to 90% of billed charges.",
        body
    ))

    story.append(Paragraph("<b>4.2 Modern Robotic Surgery & Sub-Limits</b>", h2_style))
    story.append(Paragraph(
        "Modern treatments including Robotic Surgery, Stem cell therapy, and Immunotherapy are covered up to a sub-limit cap of 50% of the Base Sum Insured.",
        body
    ))

    story.append(Spacer(1, 20))
    story.append(Paragraph("Authorized Signatory: MediSure General Insurance Underwriting Board", body))

    doc.build(story)
    print(f"Generated digital demo policy: {pdf_path}")
    return pdf_path

def create_scanned_demo_policy(source_pdf: str):
    """
    Renders pages of the digital PDF into raster images and compiles them back into a PDF without text layers.
    This simulates a 100% scanned PDF to test scanned page detection and OCR handling.
    """
    scanned_path = os.path.join(OUTPUT_DIR, "MediSure_Scanned_Demo_Policy.pdf")
    src_doc = fitz.open(source_pdf)
    dst_doc = fitz.open()

    for page_idx in range(len(src_doc)):
        page = src_doc[page_idx]
        pix = page.get_pixmap(dpi=150)
        img_bytes = pix.tobytes("png")

        # Create new blank page in destination doc and insert image
        new_page = dst_doc.new_page(width=page.rect.width, height=page.rect.height)
        new_page.insert_image(new_page.rect, stream=img_bytes)

    dst_doc.save(scanned_path)
    src_doc.close()
    dst_doc.close()
    print(f"Generated scanned demo policy: {scanned_path}")
    return scanned_path

def create_missing_fields_policy():
    """
    Creates a policy with intentionally omitted deductible, copay, and ICU limits to test NOT_FOUND handling.
    """
    missing_path = os.path.join(OUTPUT_DIR, "MediSure_Missing_Fields_Policy.pdf")
    doc = SimpleDocTemplate(missing_path, pagesize=letter, rightMargin=54, leftMargin=54, topMargin=54, bottomMargin=54)

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle('DocTitle', parent=styles['Heading1'], fontSize=16, textColor=colors.HexColor("#174C3C"))
    body = ParagraphStyle('Body', parent=styles['Normal'], fontSize=10, leading=14, textColor=colors.HexColor("#202B27"))

    story = [
        Paragraph("DEMO POLICY — NOT A REAL INSURANCE CONTRACT", styles['Normal']),
        Paragraph("Basic Indemnity Hospitalization Certificate", title_style),
        Spacer(1, 12),
        Paragraph("Policyholder Name: Ramesh Gupta. Sum Insured: INR 5,00,000.", body),
        Paragraph("This minimal certificate provides basic inpatient protection without defining cost sharing conditions or medical boarding categories.", body),
    ]
    doc.build(story)
    print(f"Generated missing fields demo policy: {missing_path}")
    return missing_path

if __name__ == "__main__":
    p1 = create_digital_demo_policy()
    create_scanned_demo_policy(p1)
    create_missing_fields_policy()
