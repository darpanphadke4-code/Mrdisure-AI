// src/pages/LandingPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { formatCurrency } from '../utils/formatters';
import {
  Shield,
  Bot,
  Calculator,
  FileCheck2,
  FileText,
  Download,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Clock,
  Layers,
  HelpCircle,
  HeartPulse,
} from 'lucide-react';

export const LandingPage = () => {
  const navigate = useNavigate();
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const features = [
    {
      icon: FileCheck2,
      title: "AI Policy Analysis",
      description: "Extract complex medical clauses, daily room rent limits, ICU capping, and sub-limits in seconds from standard insurance PDFs.",
    },
    {
      icon: Bot,
      title: "Intelligent Insurance Assistant",
      description: "Ask policy-specific questions with exact page citations and confidence scores, instead of parsing confusing 40-page schedules.",
    },
    {
      icon: Calculator,
      title: "Out-of-Pocket Cost Estimation",
      description: "Simulate hospital bills before planned admissions to calculate exact patient share, room deductions, and deductibles.",
    },
    {
      icon: AlertCircle,
      title: "Coverage & Exclusion Detection",
      description: "Identify hidden restrictions like 24-month specific ailment waiting periods and non-payable consumable exclusions.",
    },
    {
      icon: Layers,
      title: "Personalized Expense Analysis",
      description: "Tailor simulations by patient age, pre-existing conditions, room tier, and hospital procedures with waterfall visual breakdowns.",
    },
    {
      icon: Download,
      title: "Downloadable Audit Reports",
      description: "Generate clean printable PDF audit reports to cross-examine hospital discharge settlements and TPA cashless claims.",
    },
  ];

  const steps = [
    {
      step: "01",
      title: "Upload Your Insurance Policy",
      description: "Upload any health insurance PDF schedule. Our layout-aware engine extracts policy rules, deductibles, and room capping.",
    },
    {
      step: "02",
      title: "Let AI Analyze Your Coverage",
      description: "Review structured clauses, waiting periods, sub-limits, and exclusions with direct links back to original PDF pages.",
    },
    {
      step: "03",
      title: "Ask Questions & Estimate Expenses",
      description: "Chat with the AI assistant or enter planned medical bills into the estimator to calculate your exact out-of-pocket costs.",
    },
  ];

  const faqs = [
    {
      q: "How does MediSure AI calculate out-of-pocket hospital expenses?",
      a: "MediSure AI applies standardized insurance underwriting logic. It calculates non-payable medical consumables (gloves, PPE, admin charges), applies proportionate room rent deductions if you exceed your daily boarding cap, deducts annual deductibles, and computes co-payments before estimating the net insurer payment.",
    },
    {
      q: "Does this replace my insurance company's official claim approval?",
      a: "No. MediSure AI provides educational analysis and mathematical estimation to help policyholders understand clauses and prevent surprise bills. Formal cashless pre-authorization and claim settlement are determined exclusively by your insurance underwriter and TPA upon review of original medical records.",
    },
    {
      q: "What is proportionate room rent deduction?",
      a: "If your policy caps room rent at 1% of Sum Insured (e.g. ₹5,000/day) and you choose a room costing ₹8,000/day, insurers proportionally deduct not only the excess room charge, but also associated medical charges like doctor consultation, surgeon fees, and nursing charges by the same ratio.",
    },
    {
      q: "Are medical consumables covered by standard health insurance?",
      a: "Under standard IRDAI guidelines, over 68 items (gloves, syringes, sanitizers, surgical gowns, admission files) are classified as non-medical expenses and deducted from claim payouts. They are only covered if your policy includes an active Consumables / Care Shield rider.",
    },
    {
      q: "Is my medical data kept private in this prototype?",
      a: "Yes. In this frontend prototype, all uploaded policies, simulated bills, and chat sessions are processed locally within your browser session state and localStorage. No sensitive documents are uploaded to public external servers.",
    },
  ];

  return (
    <div className="min-h-screen bg-warmWhite text-charcoal flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section id="hero" className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 overflow-hidden">
        {/* Subtle background ambient circles */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-forest-100/40 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Column */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-forest-50 border border-forest-200 text-forest-800 text-xs font-semibold shadow-subtle">
                <Shield className="w-3.5 h-3.5 text-forest-700" />
                <span>Modern Healthcare-Fintech Insurance Intelligence</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-forest-900 tracking-tight font-heading leading-[1.12]">
                Understand Your Insurance.{' '}
                <span className="text-forest-600">Take Control</span> of Your Healthcare Costs.
              </h1>

              <p className="text-base sm:text-lg text-charcoal-600 leading-relaxed max-w-2xl">
                Upload your medical insurance policy, understand your coverage, and estimate your out-of-pocket expenses with an AI-powered insurance assistant.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  rightIcon={ArrowRight}
                  onClick={() => navigate('/app/dashboard')}
                >
                  Analyze My Policy
                </Button>
                <a href="#features">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Explore Features
                  </Button>
                </a>
              </div>

              {/* Trust Supporting Row */}
              <div className="pt-4 border-t border-borderGray/80 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-charcoal-500">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  No unexpected hospital surprises
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Exact room rent limit math
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Clause-backed citations
                </span>
              </div>
            </div>

            {/* Right Hero Product Preview Card */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="bg-white rounded-3xl border border-borderGray shadow-elevated p-6 space-y-5">
                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-borderGray">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-forest-700 text-white flex items-center justify-center font-bold">
                        <HeartPulse className="w-5 h-5 text-softTeal" />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-forest-700">
                          Active Policy Sample
                        </span>
                        <h4 className="text-xs font-bold text-charcoal-900 font-heading">
                          Care Supreme Platinum
                        </h4>
                      </div>
                    </div>
                    <Badge variant="verified" dot size="xs">
                      Analyzed
                    </Badge>
                  </div>

                  {/* Summary Metric Strip */}
                  <div className="grid grid-cols-2 gap-3 p-3 bg-warmWhite rounded-xl border border-borderGray text-xs">
                    <div>
                      <span className="text-charcoal-400 block text-[10px] uppercase font-bold">Sum Insured</span>
                      <span className="text-forest-900 font-bold text-base font-mono">₹10,00,000</span>
                    </div>
                    <div>
                      <span className="text-charcoal-400 block text-[10px] uppercase font-bold">Room Rent Limit</span>
                      <span className="text-charcoal-800 font-semibold text-sm">₹5,000 / day</span>
                    </div>
                  </div>

                  {/* Extracted Clause Preview */}
                  <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1 text-xs">
                    <div className="flex items-center justify-between text-amber-900 font-bold">
                      <span className="flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                        <span>Clause 3.1: Room Rent Cap Alert</span>
                      </span>
                      <span className="text-[10px] text-amber-700 font-mono">Page 2</span>
                    </div>
                    <p className="text-[11px] text-charcoal-700 leading-relaxed">
                      Staying in a ₹8,000 Deluxe room triggers proportionate deductions on doctor rounds and surgical fees.
                    </p>
                  </div>

                  {/* Bill Simulation Preview */}
                  <div className="space-y-2 pt-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-charcoal-500">Sample Gallbladder Surgery:</span>
                      <span className="font-mono font-bold text-charcoal-900">₹2,85,000</span>
                    </div>
                    <div className="w-full bg-forest-100 rounded-full h-2.5 overflow-hidden flex">
                      <div className="bg-forest-700 h-full w-[82%]" title="Insurer: ₹2,33,500" />
                      <div className="bg-rose-500 h-full w-[18%]" title="Patient: ₹51,500" />
                    </div>
                    <div className="flex justify-between text-[11px] text-charcoal-600 pt-0.5">
                      <span className="text-forest-800 font-semibold">Insurer Share: ₹2,33,500</span>
                      <span className="text-rose-600 font-semibold">Patient: ₹51,500</span>
                    </div>
                  </div>

                  {/* Demo Interactive Button */}
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => navigate('/app/calculator')}
                  >
                    Simulate Live in Cost Estimator
                  </Button>
                </div>

                {/* Decorative floating trust pill */}
                <div className="absolute -bottom-4 -left-4 bg-forest-900 text-white px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-elevated flex items-center gap-2 hidden sm:flex">
                  <Sparkles className="w-3.5 h-3.5 text-softTeal" />
                  <span>Real-time Clause Verification</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section id="features" className="py-20 bg-white border-y border-borderGray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-forest-700 font-heading">
              Comprehensive Medical Insurance Intelligence
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-forest-900 font-heading tracking-tight">
              Designed for Patients and Families, Not Just Underwriters
            </h2>
            <p className="text-sm sm:text-base text-charcoal-500 leading-relaxed">
              Medical insurance policies are filled with complex legal clauses and hidden fine print. MediSure AI turns them into crystal-clear financial clarity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-warmWhite/70 border border-borderGray hover:border-forest-400 hover:shadow-card transition-all duration-200 group flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-white border border-borderGray flex items-center justify-center text-forest-700 mb-5 group-hover:bg-forest-50 group-hover:border-forest-200 transition-colors shadow-subtle">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-forest-900 font-heading mb-2">
                      {feat.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-charcoal-500 leading-relaxed">
                      {feat.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-warmWhite">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-forest-700 font-heading">
              Step-by-Step Transparency
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-forest-900 font-heading tracking-tight">
              How MediSure AI Works
            </h2>
            <p className="text-sm text-charcoal-500">
              Three simple steps from policy PDF to exact hospital out-of-pocket estimations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((st, i) => (
              <div
                key={st.step}
                className="bg-white p-7 rounded-2xl border border-borderGray shadow-subtle relative flex flex-col justify-between"
              >
                <div>
                  <span className="font-heading font-extrabold text-3xl text-forest-200 block mb-4">
                    {st.step}
                  </span>
                  <h3 className="text-base font-bold text-forest-900 font-heading mb-2">
                    {st.title}
                  </h3>
                  <p className="text-xs text-charcoal-500 leading-relaxed">
                    {st.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button
              variant="primary"
              size="lg"
              rightIcon={ArrowRight}
              onClick={() => navigate('/app/dashboard')}
            >
              Start Exploring With Demo Data
            </Button>
          </div>
        </div>
      </section>

      {/* Product Preview Section */}
      <section id="preview" className="py-20 bg-white border-y border-borderGray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5 space-y-5">
              <span className="text-xs font-bold uppercase tracking-wider text-forest-700 font-heading">
                Interactive Research Assistant
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-forest-900 font-heading tracking-tight">
                Ask Questions, Receive Verified Policy Answers
              </h2>
              <p className="text-sm text-charcoal-600 leading-relaxed">
                Rather than guessing whether your procedure is covered or which room category is safe to choose, ask MediSure AI. Every answer references exact policy sections, clauses, and document pages.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-charcoal-900">Direct Clause Cross-Referencing</h5>
                    <p className="text-xs text-charcoal-500">Jump right into the document page with highlighted snippets.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-charcoal-900">One-Click Transfer to Estimator</h5>
                    <p className="text-xs text-charcoal-500">Turn conversational answers directly into hospital bill line items.</p>
                  </div>
                </div>
              </div>

              <div className="pt-3">
                <Button
                  variant="primary"
                  size="md"
                  rightIcon={Bot}
                  onClick={() => navigate('/app/assistant')}
                >
                  Test AI Assistant Demo
                </Button>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="bg-forest-900 p-6 sm:p-8 rounded-3xl text-white shadow-elevated border border-forest-800 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-forest-800">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-softTeal" />
                    <span className="text-xs font-bold text-softTeal">MediSure Policy Research Engine</span>
                  </div>
                  <span className="text-[10px] text-sage-300">Policy: Care Supreme Platinum</span>
                </div>

                <div className="p-3.5 bg-forest-800/80 rounded-2xl text-xs space-y-1">
                  <span className="text-[10px] text-sage-300 uppercase font-bold block">User Inquiry</span>
                  <p className="text-white font-medium">&ldquo;Does my policy cover laparoscopic surgery, and can I take a Deluxe Room?&rdquo;</p>
                </div>

                <div className="p-4 bg-white rounded-2xl text-charcoal-900 text-xs space-y-2 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-forest-800">Assistant Response</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                      Direct Clause Match
                    </span>
                  </div>
                  <p className="text-charcoal-700 leading-relaxed">
                    Yes, laparoscopic surgery is covered under Section 3.3. However, your policy specifies a room rent limit of ₹5,000/day (1% of Sum Insured). Opting for a Deluxe Room (₹8,000/day) will trigger proportionate deductions across doctor and surgeon charges.
                  </p>
                  <div className="p-2.5 bg-warmWhite rounded-xl border border-borderGray flex items-center justify-between text-[11px] text-charcoal-600">
                    <span className="font-semibold text-forest-900">Clause 3.1: Room Rent Proportionate Cut</span>
                    <span className="font-mono text-charcoal-400">Page 2</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section id="faqs" className="py-20 bg-warmWhite">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-forest-700 font-heading">
              Frequently Asked Questions
            </span>
            <h2 className="text-3xl font-extrabold text-forest-900 font-heading tracking-tight">
              Insurance Literacy & Platform Details
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl border border-borderGray overflow-hidden transition-all shadow-subtle"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? -1 : index)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-forest-50/40 transition-colors"
                  >
                    <span className="text-sm font-bold text-forest-900 font-heading">
                      {faq.q}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-forest-700 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-charcoal-400 shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="p-5 pt-0 border-t border-borderGray/60 text-xs sm:text-sm text-charcoal-600 leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 sm:py-20 bg-forest-900 text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <span className="text-xs font-bold uppercase tracking-widest text-softTeal font-heading">
            Get Ready Before Your Next Hospital Visit
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold font-heading tracking-tight">
            Stop Guessing Your Hospital Bills.
          </h2>
          <p className="text-sm sm:text-base text-sage-200 max-w-2xl mx-auto leading-relaxed">
            Experience the complete frontend prototype of MediSure AI today. Simulate complex claims, ask the AI assistant, and inspect verified policy clauses.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              variant="secondary"
              size="lg"
              rightIcon={ArrowRight}
              onClick={() => navigate('/app/dashboard')}
            >
              Launch Interactive Demo
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="bg-transparent border-sage-300 text-white hover:bg-forest-800"
              onClick={() => navigate('/app/calculator')}
            >
              Try Out-of-Pocket Estimator
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
