import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Shield, ShieldCheck, ShieldAlert, Mail, Smartphone, AlertTriangle, AlertOctagon,
  CheckCircle2, XCircle, Paperclip, Clock, Flag, Send, Eye, ChevronDown, Download,
  ExternalLink, Award, Crosshair, Terminal, QrCode, Users, Building2, Phone,
  HelpCircle, Menu, X, ArrowRight, TrendingUp, Activity, FileText, Server, Globe,
  KeyRound, RefreshCw, Printer, ClipboardCheck, MousePointerClick, ScanLine,
  Package, Target, Layers, BookOpen,
} from "lucide-react";


const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');
  .font-display { font-family: 'Space Grotesk', sans-serif; }
  .font-mono { font-family: 'JetBrains Mono', monospace; }
  @media print {
    body * { visibility: hidden; }
    .printable, .printable * { visibility: visible; }
    .printable { position: fixed; top: 0; left: 0; width: 100%; padding: 32px; }
  }
`;



const NAV_ITEMS = [
  { id: "hero", label: "Dashboard", icon: Activity },
  { id: "simulator", label: "Threat Simulator", icon: Crosshair },
  { id: "playbook", label: "Response Playbook", icon: ClipboardCheck },
  { id: "quiz", label: "Assessment", icon: Award },
  { id: "taxonomy", label: "Attack Taxonomy", icon: Layers },
  { id: "resources", label: "Resource Hub", icon: BookOpen },
];

const METRICS = [
  { label: "Phishing Emails Blocked", value: 48213, suffix: "", icon: ShieldCheck, accent: "emerald", note: "Last 30 days" },
  { label: "Avg. Training Completion Time", value: 4, suffix: " min", icon: Clock, accent: "cyan", note: "Detect to report" },
  { label: "Awareness Readiness Score", value: 92, suffix: "%", icon: Activity, accent: "emerald", note: "Org-wide average" },
  { label: "Active Threats Today", value: 7, suffix: "", icon: AlertTriangle, accent: "amber", note: "Under review" },
];

const QUICK_ACTIONS = [
  { label: "Take 5-Min Quiz", desc: "Test your instincts against 6 real attack scenarios", icon: Award, target: "quiz", accent: "cyan" },
  { label: "Interactive Threat Simulator", desc: "Inspect a live phishing email, SMS, and CEO-fraud attempt", icon: Crosshair, target: "simulator", accent: "rose" },
  { label: "Download SOP & Cheat Sheet", desc: "Grab printable references for your desk", icon: FileText, target: "resources", accent: "emerald" },
  { label: "Report a Suspicious Email", desc: "Open the live reporting terminal", icon: Flag, target: "resources", accent: "amber" },
];

const EMAIL_HOTSPOTS = {
  domain: {
    label: "Spoofed Sender Domain",
    severity: "high",
    why: "The display name reads \u201cIT Support,\u201d but the actual sending domain swaps a zero for the letter O and isn't a domain your company owns. Authentication checks confirm it: SPF FAIL, DKIM FAIL, DMARC FAIL \u2014 this message did not come from a server your real IT provider authorizes.",
    stat: "Lookalike and spoofed domains remain one of the most common entry points for credential-harvesting campaigns, which is why authentication checks like SPF, DKIM, and DMARC matter more than the display name.",
    tip: "Always check the actual sending domain, not the display name \u2014 and treat a failed authentication check as a hard stop.",
  },
  link: {
    label: "Mismatched Link Target",
    severity: "high",
    why: "The button text says \u201cVerify My Account Now,\u201d but the real destination underneath is a domain that has nothing to do with your company's actual login page.",
    stat: "Hover-to-preview is one of the fastest checks available \u2014 the underlying URL rarely lies, even when the button text does.",
    tip: "Hover over any link before clicking. If the real URL and the link text don't match, don't click \u2014 report it instead.",
  },
  attachment: {
    label: "Double File Extension",
    severity: "high",
    why: "The attachment is named \u201cSecurity_Update_Instructions.pdf.exe.\u201d The .pdf is cosmetic \u2014 the real, executable extension is .exe, which can run code the moment it's opened.",
    stat: "Double extensions are a classic disguise technique, since many file explorers hide the true extension by default.",
    tip: "Turn on file extension visibility on your device, and never open an attachment with a stacked or unexpected extension.",
  },
  urgency: {
    label: "Manufactured Urgency",
    severity: "medium",
    why: "Phrases like \u201c24 hours\u201d and \u201cpermanent account suspension\u201d are designed to trigger a fast, fearful reaction so you act before you think to verify.",
    stat: "Urgency and fear are two of the most common psychological levers used across phishing campaigns, because they short-circuit careful reading.",
    tip: "Treat any deadline-driven security email as a reason to slow down, not speed up. Verify through a separate, known channel.",
  },
};

const SMS_HOTSPOTS = {
  sender: {
    label: "Spoofed Sender ID",
    severity: "high",
    why: "The message appears to come from \u201cUSPS,\u201d but carriers let the sender-name field be set to almost anything. A real shipment update also shows up in the carrier's official tracking app, not just a text.",
    stat: "SMS sender names can be freely set by the originator, making them one of the easiest fields to spoof in a smishing campaign.",
    tip: "Never trust a text sender name alone. Check tracking status directly through the carrier's official app or website.",
  },
  link: {
    label: "Shortened / Obscured Link",
    severity: "high",
    why: "The link uses a shortener, hiding the real destination domain until after you tap it. Legitimate delivery notices link directly to the carrier's own domain.",
    stat: "Link shorteners get heavy use in smishing because they hide lookalike or newly registered domains from a quick glance.",
    tip: "Don't tap shortened links in unsolicited texts. Go to the shipping carrier's app directly to check status.",
  },
  urgency: {
    label: "Payment Pressure",
    severity: "medium",
    why: "A small \u201credelivery fee\u201d request paired with a tight deadline is designed to get a fast tap and a fast card entry before doubt sets in.",
    stat: "Small-dollar payment requests are common in smishing because they feel low-risk enough that people don't stop to question them.",
    tip: "Legitimate carriers don't request card details by text to release a package. Treat any such request as a red flag.",
  },
};

const SPEAR_HOTSPOTS = {
  replyTo: {
    label: "Reply-To Mismatch",
    severity: "high",
    why: "The display name reads as the CEO, but the reply-to address routes to a free webmail account with no connection to the company domain.",
    stat: "Executive impersonation typically relies on a display-name mismatch rather than a compromised real account, since that's far easier for an attacker to set up.",
    tip: "Check the actual reply-to and sending address on any executive request \u2014 not just the name shown in your inbox.",
  },
  secrecy: {
    label: "Isolation Request",
    severity: "high",
    why: "Asking you not to \u201cdiscuss this with anyone else on the team yet\u201d is a deliberate move to stop you from getting a second opinion before acting.",
    stat: "Requests for secrecy are one of the strongest indicators of business email compromise, since legitimate financial requests almost never require silence.",
    tip: "Any request to keep a financial action secret from colleagues or finance controls should be treated as an immediate red flag.",
  },
  unavailability: {
    label: "Manufactured Unavailability",
    severity: "medium",
    why: "The message pre-empts a verification call by claiming the sender is unreachable \u2014 \u201cback-to-back board meetings\u201d \u2014 removing your easiest way to confirm the request.",
    stat: "Attackers often build a reason into the message itself for why you can't simply call to confirm, anticipating that exact step.",
    tip: "If a request claims the requester is unreachable, that's exactly when you should verify through an independent, known-good channel \u2014 not skip it.",
  },
  request: {
    label: "Unusual Payment Request",
    severity: "high",
    why: "A wire transfer for a \u201cconfidential acquisition\u201d bypasses your normal procurement and multi-approval process \u2014 a legitimate deal of that size would never move through a single unscheduled email.",
    stat: "Business email compromise has repeatedly ranked among the costliest categories of reported cybercrime, largely because a single approved wire transfer is hard to reverse.",
    tip: "Any request to bypass standard approval steps \u2014 regardless of who appears to be asking \u2014 should go straight to a verified, in-person or phone confirmation.",
  },
};

const PLAYBOOK_STEPS = [
  {
    n: 1, title: "Detect & Pause", icon: Eye,
    summary: "Identify suspicious indicators without clicking anything.",
    detail: "Scan the sender, subject, and any links before you interact with the message. If something feels off \u2014 urgency, an unexpected attachment, a request that bypasses normal process \u2014 stop there. Don't click, reply, or download.",
  },
  {
    n: 2, title: "Use the One-Click Phish Reporter", icon: Flag,
    summary: "Report it straight from your inbox toolbar.",
    detail: "Your email client has a Report Phishing add-in in the toolbar. One click quarantines the message and forwards a copy \u2014 with full headers intact \u2014 to the security team automatically.",
    demo: true,
  },
  {
    n: 3, title: "Manual Forwarding Protocol", icon: Send,
    summary: "No add-in available? Forward it as an attachment with headers intact.",
    detail: "Use \u201cForward as attachment\u201d (not a regular forward) so the original headers are preserved, and send it to security@example.com. On desktop clients you can also export the message as a raw .eml file and attach that.",
    code: "Outlook: More actions \u2192 Advanced actions \u2192 Forward as attachment\nGmail: More (\u22ee) \u2192 Show original \u2192 Download original \u2192 attach the .eml file",
  },
  {
    n: 4, title: "Containment Protocol", icon: ShieldAlert,
    summary: "If a link was clicked or credentials were entered \u2014 act immediately.",
    detail: "Change the affected password right away from a separate, trusted device. Notify security immediately so the account can be monitored or locked down. If a file was downloaded and run, disconnect the device from the network and contact IT before doing anything else.",
  },
  {
    n: 5, title: "Post-Incident Debrief", icon: RefreshCw,
    summary: "Security follows up with what happened and what it means.",
    detail: "The security team reviews what the message was designed to do and whether it reached anyone else, then shares a short debrief so the whole team learns the pattern \u2014 no blame, just the lesson.",
  },
];

const QUIZ_QUESTIONS = [
  {
    id: 1, category: "Executive Spear Phishing", icon: Crosshair,
    scenario: "An email from \u201cCFO \u2014 Jordan Reyes\u201d lands in your Accounts Payable inbox. It asks you to process a same-day wire transfer for a vendor payment and says to reply directly to this email once it's sent \u2014 Jordan is \u201cunreachable by phone for the rest of the day.\u201d",
    question: "What's the correct first move?",
    options: [
      "Process the transfer \u2014 it came from the CFO and sounds urgent",
      "Reply asking for more details before sending the money",
      "Verify the request through a separate, known-good channel (e.g. call the CFO's verified extension) before taking any action",
      "Forward it to a coworker to see what they think",
    ],
    correct: 2,
    breakdown: "This combines three classic BEC levers: authority (CFO), urgency (same-day), and manufactured unavailability (can't be reached by phone). Replying to the email only confirms the request with whoever sent it, not necessarily the real CFO. Independent verification through a channel you already know is real is the only step that actually confirms legitimacy.",
  },
  {
    id: 2, category: "Fake MFA / OAuth Consent", icon: KeyRound,
    scenario: "You get an unexpected MFA push notification, and moments later, a message with a link asking you to \u201capprove access\u201d for a third-party app requesting full access to your mailbox and calendar \u2014 even though you weren't trying to log in to anything.",
    question: "What should you do?",
    options: [
      "Approve it \u2014 IT might be testing something",
      "Deny the prompt and report the unexpected push/OAuth request to security",
      "Approve it once, then change your password afterward",
      "Ignore it \u2014 it will expire on its own eventually",
    ],
    correct: 1,
    breakdown: "An MFA push you didn't trigger is a sign someone already has your password and is trying to complete the login (an \u201cMFA fatigue\u201d or push-bombing attack). An OAuth consent screen requesting broad mailbox access is a related but separate tactic \u2014 approving it can hand over access without ever stealing your password. Deny and report both immediately.",
  },
  {
    id: 3, category: "Urgent HR Policy Link", icon: Users,
    scenario: "\u201cHR Department\u201d emails the whole company: \u201cMandatory salary review \u2014 confirm your details by end of day or your record will be flagged for audit.\u201d The link goes to a login page styled like your company's single sign-on portal.",
    question: "Which detail should concern you most?",
    options: [
      "The email uses a generic greeting instead of your name",
      "The urgency and the fact the link leads to a login page outside your actual SSO domain",
      "The email was sent to the whole company at once",
      "HR emails are usually shorter than this",
    ],
    correct: 1,
    breakdown: "A generic greeting and a mass send are common but weaker signals on their own. The decisive red flag is a login page mimicking your real SSO outside your actual domain \u2014 that's a credential-harvesting setup. Always check the domain in the address bar before entering credentials anywhere.",
  },
  {
    id: 4, category: "Cloud Storage Credential Harvest", icon: Server,
    scenario: "A \u201cshared document\u201d notification claims a colleague shared a file via Google Drive. Clicking it opens a Google-styled login page asking you to re-enter your full email and password \u2014 even though you're already signed in to Google on that device.",
    question: "What's the giveaway here?",
    options: [
      "Being asked to re-enter your password when you're already signed in, on a page that isn't the real accounts.google.com domain",
      "The document notification arrived by email at all",
      "The file wasn't opened in a new tab",
      "The colleague's name was spelled correctly",
    ],
    correct: 0,
    breakdown: "If you're already authenticated on a device, a legitimate Google or Microsoft link will not ask you to type your password into a page again \u2014 it uses your existing session or a real SSO redirect. A password re-entry prompt on an unfamiliar domain is a credential-harvesting page mimicking the real login screen.",
  },
  {
    id: 5, category: "Smishing Delivery Scam", icon: Package,
    scenario: "A text claims your package is \u201cheld at the depot\u201d and asks you to tap a shortened link and pay a small redelivery fee to release it, within a few hours.",
    question: "What should you do?",
    options: [
      "Pay the small fee \u2014 it's not much money either way",
      "Tap the link to see if it looks legitimate first",
      "Ignore the link, check tracking directly through the carrier's official app or site, and report the text",
      "Reply STOP to the number to unsubscribe",
    ],
    correct: 2,
    breakdown: "Carriers don't collect redelivery fees by text, and shortened links hide the real destination domain. The safest verification path never touches the message itself \u2014 go directly to the carrier's official app or website using a source you already trust.",
  },
  {
    id: 6, category: "Typosquatted Domain Detection", icon: Globe,
    scenario: "You need to log in to your company's benefits provider. Three links are floating around in old emails and bookmarks.",
    question: "Which domain is most likely the legitimate one?",
    options: [
      "benefits-portal-login.net",
      "yourbenefitsprovider.com",
      "yourbenefitspr0vider-secure.com",
      "benefits.yourbenefitsprovider.com.verify-access.net",
    ],
    correct: 1,
    breakdown: "The real domain is short, matches the company's known root domain exactly, and has no extra words, swapped characters, or trailing subdomains bolted onto an unrelated domain. Options with an extra \u201c-secure,\u201d a swapped zero for an \u201co,\u201d or a real-looking name stuffed in front of a completely different domain are all typosquatting patterns.",
  },
];

const TAXONOMY = [
  {
    id: "spear", name: "Spear Phishing & Whaling", icon: Crosshair, tags: ["Email", "Advanced"],
    desc: "Highly targeted attacks built around research on a specific person or role \u2014 whaling narrows that further to executives and finance leaders.",
    flags: ["Personal or role-specific details woven into the message", "Requests tied to that person's real responsibilities", "Pressure to act outside normal process"],
    tips: ["Verify unusual requests through a second, known channel", "Be mindful of how much role and org detail is publicly visible"],
  },
  {
    id: "smishvish", name: "Smishing & Vishing", icon: Smartphone, tags: ["Mobile"],
    desc: "Phishing delivered by text message (smishing) or phone call (vishing), often impersonating delivery services, banks, or internal IT.",
    flags: ["Shortened or obscured links in texts", "Caller creates urgency and asks for codes or passwords", "Spoofed caller ID or sender name"],
    tips: ["Never read a one-time code to anyone who calls you", "Verify by calling the organization back on a number you look up yourself"],
  },
  {
    id: "quishing", name: "Quishing (QR Phishing)", icon: QrCode, tags: ["Mobile", "Advanced"],
    desc: "Malicious QR codes \u2014 on flyers, parking meters, or stickered over real ones \u2014 that route your phone to a credential-harvesting page.",
    flags: ["QR code placed somewhere unexpected or slightly misaligned", "Preview URL looks unrelated to the context", "Prompts for login immediately after scanning"],
    tips: ["Preview the URL before opening it \u2014 most camera apps show it first", "Be extra cautious with QR codes in public, unattended locations"],
  },
  {
    id: "bec", name: "Business Email Compromise (BEC)", icon: Building2, tags: ["Email", "Advanced"],
    desc: "Impersonation of an executive, vendor, or partner to redirect a payment, gift card purchase, or sensitive data \u2014 often with no malware or link at all.",
    flags: ["Display-name impersonation with a mismatched real address", "Requests to bypass normal approval steps", "Pressure to keep the request confidential"],
    tips: ["Confirm any payment or banking-detail change by phone, on a known number", "Enforce dual-approval on wire transfers regardless of who's asking"],
  },
  {
    id: "aitm", name: "Session Hijacking & AitM", icon: Server, tags: ["Advanced"],
    desc: "Adversary-in-the-Middle attacks use a fake login proxy to capture your password and session token in real time \u2014 defeating some MFA methods.",
    flags: ["Login page that proxies a real site but sits on an unfamiliar domain", "MFA prompt succeeds but the site behaves oddly afterward", "Unexpected \u201cnew device\u201d or session alerts after logging in"],
    tips: ["Prefer phishing-resistant MFA (security keys / passkeys) where available", "Check the domain in the address bar before entering credentials, every time"],
  },
];

const DOWNLOAD_CENTER = [
  {
    id: "sop", name: "Phishing Response SOP", icon: FileText,
    desc: "The full standard operating procedure for detecting, reporting, and containing phishing attempts.",
    body: [
      "Scope: all employees and contractors with company email or messaging access.",
      "Step 1 \u2014 Detect & Pause: do not click, reply, or forward.",
      "Step 2 \u2014 Report: use the inbox Report Phishing button, or forward as attachment to security@example.com.",
      "Step 3 \u2014 Contain: if credentials were entered, change them immediately from a separate device and notify security.",
      "Step 4 \u2014 Review: security confirms scope and shares findings back to the team.",
      "This procedure is non-punitive \u2014 fast, honest reporting is always the right call.",
    ],
  },
  {
    id: "poster", name: "\u201cSpot the Phish\u201d Wall Poster", icon: Flag,
    desc: "A printable poster with the five most common red flags, sized for breakroom or desk display.",
    body: [
      "MISMATCHED SENDER \u2014 display name and real domain don't match.",
      "UNEXPECTED URGENCY \u2014 deadlines and threats designed to rush you.",
      "SUSPICIOUS LINKS \u2014 hover before you click, check the real destination.",
      "ODD ATTACHMENTS \u2014 double extensions, unexpected file types.",
      "UNUSUAL REQUESTS \u2014 payments, credentials, or secrecy outside normal process.",
      "When in doubt: pause, verify, report.",
    ],
  },
  {
    id: "template", name: "Security Team Email Templates", icon: Mail,
    desc: "Ready-to-send templates for acknowledging reports and communicating confirmed incidents company-wide.",
    body: [
      "Template 1 \u2014 Report Acknowledgment: \u201cThanks for the report \u2014 we've received it and are reviewing now. You did the right thing by flagging this.\u201d",
      "Template 2 \u2014 Confirmed Threat Notice: \u201cA phishing message matching this pattern was reported and blocked. If you received it and clicked or entered credentials, contact security immediately \u2014 no action needed otherwise.\u201d",
      "Template 3 \u2014 All-Clear Follow-up: \u201cThis issue has been contained. Thank you to everyone who reported it quickly.\u201d",
    ],
  },
];

const FAQS = [
  { q: "What happens after I hit report?", a: "The message is quarantined from your inbox and a copy \u2014 with full headers \u2014 goes to the security team. Most reports get an initial triage response within minutes, and you'll hear back if it turns out to be a confirmed threat or if we need anything else from you." },
  { q: "How do I spot fake internal emails?", a: "Check the actual sending domain, not just the display name. Be wary of any internal-looking request that pressures speed or secrecy, and verify unusual asks \u2014 especially around payments or credentials \u2014 through a channel outside the email itself." },
  { q: "Will I get in trouble if I accidentally click a phishing link?", a: "No. Our policy is blameless \u2014 the fastest path to reducing risk is you telling us right away, without hesitation. Reporting quickly is always treated as the right call, even if you already clicked or entered something." },
  { q: "What's the difference between spam and phishing?", a: "Spam is unwanted but not necessarily malicious \u2014 usually marketing you didn't ask for. Phishing is a deliberate attempt to steal credentials, money, or data, often through impersonation. When in doubt, report it as phishing and let security make the call." },
  { q: "Who do I contact if I think I've been compromised?", a: "Use the Report Phish button, email security@example.com, or call the IT helpdesk directly \u2014 see the emergency contacts in the footer below. Don't wait for a convenient time; contact us immediately." },
  { q: "How often should I run this training?", a: "This portal is built for a quick pass each quarter, with the threat simulator and quiz useful anytime you want a refresher before a high-risk period, like tax season or major company announcements." },
];




function useCountUp(target, duration = 1400) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let startTime = null;
    let raf;
    const step = (t) => {
      if (startTime === null) startTime = t;
      const progress = Math.min((t - startTime) / duration, 1);
      setValue(Math.floor(progress * target));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

const ACCENT_BORDER = {
  cyan: "border-cyan-400/60",
  emerald: "border-emerald-400/60",
  rose: "border-rose-400/60",
  amber: "border-amber-400/60",
};

function Panel({ children, className = "", accent = "cyan" }) {
  const c = ACCENT_BORDER[accent] || ACCENT_BORDER.cyan;
  return (
    <div className={`relative ${className}`}>
      <span className={`pointer-events-none absolute -top-px -left-px h-3 w-3 border-t-2 border-l-2 ${c}`} />
      <span className={`pointer-events-none absolute -top-px -right-px h-3 w-3 border-t-2 border-r-2 ${c}`} />
      <span className={`pointer-events-none absolute -bottom-px -left-px h-3 w-3 border-b-2 border-l-2 ${c}`} />
      <span className={`pointer-events-none absolute -bottom-px -right-px h-3 w-3 border-b-2 border-r-2 ${c}`} />
      {children}
    </div>
  );
}

const HEADING_ACCENT = {
  cyan: "text-cyan-400",
  rose: "text-rose-400",
  emerald: "text-emerald-400",
  amber: "text-amber-400",
};

function SectionHeading({ eyebrow, icon: Icon, title, desc, accent = "cyan" }) {
  return (
    <div>
      <div className={`flex items-center gap-2 font-mono text-xs uppercase tracking-widest ${HEADING_ACCENT[accent]}`}>
        <Icon className="h-3.5 w-3.5" />{eyebrow}
      </div>
      <h2 className="font-display mt-2 text-3xl font-bold text-slate-50 sm:text-4xl">{title}</h2>
      {desc && <p className="mt-3 max-w-2xl text-slate-400">{desc}</p>}
    </div>
  );
}

function Spot({ id, active, onSelect, severity, children }) {
  const isActive = active === id;
  const colors = severity === "high"
    ? "decoration-rose-400 text-rose-300 bg-rose-500/10 hover:bg-rose-500/20"
    : "decoration-amber-400 text-amber-300 bg-amber-500/10 hover:bg-amber-500/20";
  return (
    <button
      onClick={() => onSelect(id)}
      className={`mx-0.5 rounded px-1 underline decoration-2 decoration-dotted underline-offset-4 transition-colors ${colors} ${isActive ? "ring-2 ring-cyan-400" : ""}`}
    >
      {children}
    </button>
  );
}

function DetailPanel({ detail }) {
  if (!detail) {
    return (
      <Panel accent="cyan" className="flex h-full min-h-[280px] flex-col items-center justify-center rounded-lg border border-dashed border-slate-700 bg-slate-900/40 p-8 text-center">
        <MousePointerClick className="h-8 w-8 text-slate-600" />
        <p className="font-mono mt-3 text-sm text-slate-500">Click a highlighted element to inspect it</p>
      </Panel>
    );
  }
  const high = detail.severity === "high";
  const border = high ? "border-rose-500/40" : "border-amber-500/40";
  const bg = high ? "bg-rose-500/5" : "bg-amber-500/5";
  const text = high ? "text-rose-300" : "text-amber-300";
  const accent = high ? "rose" : "amber";
  return (
    <Panel accent={accent} className={`rounded-lg border ${border} ${bg} p-5`}>
      <div className={`inline-flex items-center gap-1.5 rounded-full border ${border} px-2 py-0.5 font-mono text-[10px] font-bold ${text}`}>
        <AlertOctagon className="h-3 w-3" />{high ? "HIGH RISK" : "CAUTION"}
      </div>
      <h4 className="font-display mt-3 text-lg font-semibold text-slate-100">{detail.label}</h4>
      <p className="mt-2 text-sm leading-relaxed text-slate-400">{detail.why}</p>
      {detail.stat && (
        <div className="mt-3 flex items-start gap-2 rounded-md bg-slate-950/60 p-3">
          <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
          <p className="font-mono text-xs text-slate-400">{detail.stat}</p>
        </div>
      )}
      <div className="mt-3 flex items-start gap-2">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
        <p className="text-sm text-emerald-300/90">{detail.tip}</p>
      </div>
    </Panel>
  );
}



function ProgressBar({ progress }) {
  return (
    <div className="fixed left-0 right-0 top-0 z-[60] h-1 bg-slate-900">
      <div className="h-full bg-gradient-to-r from-cyan-400 via-cyan-300 to-emerald-400" style={{ width: `${progress}%` }} />
    </div>
  );
}

function NavBar({ active, onNav, open, setOpen }) {
  return (
    <header className="sticky top-1 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          <button onClick={() => onNav("hero")} className="font-display flex items-center gap-2 font-semibold text-slate-100">
            <Shield className="h-5 w-5 text-cyan-400" strokeWidth={2.5} />
            <span>Phish<span className="text-cyan-400">Defense</span></span>
          </button>
          <nav className="hidden items-center gap-1 lg:flex">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => onNav(item.id)}
                className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${active === item.id ? "bg-slate-800 text-cyan-300" : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"}`}
              >
                <item.icon className="h-4 w-4" />{item.label}
              </button>
            ))}
          </nav>
          <button onClick={() => onNav("resources")} className="hidden items-center gap-1.5 rounded-md border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm font-medium text-rose-300 hover:bg-rose-500/20 lg:flex">
            <Flag className="h-4 w-4" />Report Phish
          </button>
          <button onClick={() => setOpen(!open)} className="text-slate-300 lg:hidden">
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-slate-800 bg-slate-950 px-4 py-2 lg:hidden">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => onNav(item.id)}
              className={`flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium ${active === item.id ? "bg-slate-800 text-cyan-300" : "text-slate-400"}`}
            >
              <item.icon className="h-4 w-4" />{item.label}
            </button>
          ))}
          <button onClick={() => onNav("resources")} className="mt-1 flex w-full items-center gap-2 rounded-md border border-rose-500/40 bg-rose-500/10 px-3 py-2.5 text-sm font-medium text-rose-300">
            <Flag className="h-4 w-4" />Report Phish
          </button>
        </div>
      )}
    </header>
  );
}




const METRIC_TEXT = {
  emerald: "text-emerald-400",
  cyan: "text-cyan-400",
  amber: "text-amber-400",
  rose: "text-rose-400",
};

function MetricCard({ label, value, suffix, icon: Icon, accent, note }) {
  const n = useCountUp(value);
  return (
    <Panel accent={accent} className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
      <Icon className={`h-4 w-4 ${METRIC_TEXT[accent]}`} />
      <div className={`font-display mt-2 text-2xl font-bold sm:text-3xl ${METRIC_TEXT[accent]}`}>{n.toLocaleString()}{suffix}</div>
      <div className="mt-1 text-xs text-slate-400">{label}</div>
      <div className="font-mono mt-0.5 text-[10px] text-slate-600">{note}</div>
    </Panel>
  );
}

const ACTION_STYLES = {
  cyan: "text-cyan-400 border-cyan-500/30 hover:border-cyan-400/60",
  rose: "text-rose-400 border-rose-500/30 hover:border-rose-400/60",
  emerald: "text-emerald-400 border-emerald-500/30 hover:border-emerald-400/60",
  amber: "text-amber-400 border-amber-500/30 hover:border-amber-400/60",
};

function ActionCard({ label, desc, icon: Icon, target, accent, onNav }) {
  return (
    <button onClick={() => onNav(target)} className={`group flex flex-col items-start rounded-lg border bg-slate-900/60 p-5 text-left transition-colors ${ACTION_STYLES[accent]}`}>
      <Icon className="h-6 w-6" />
      <div className="font-display mt-3 font-semibold text-slate-100">{label}</div>
      <div className="mt-1 text-sm text-slate-500">{desc}</div>
      <div className="mt-3 flex items-center gap-1 text-xs font-medium">
        Open <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </div>
    </button>
  );
}

function Hero({ onNav }) {
  return (
    <section className="relative overflow-hidden border-b border-slate-800 px-4 pb-20 pt-16 sm:px-6">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #38bdf8 1px, transparent 0)", backgroundSize: "32px 32px" }}
      />
      <div className="pointer-events-none absolute -top-40 right-0 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="relative mx-auto max-w-7xl">
        <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-cyan-400">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />Security Awareness \ Live Console
        </div>
        <h1 className="font-display mt-4 max-w-3xl text-4xl font-bold leading-tight text-slate-50 sm:text-5xl lg:text-6xl">
          Defend Your Inbox: <span className="text-cyan-400">The Interactive Phishing Awareness Kit</span>
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-slate-400">
          Six modules designed to help individuals explore real attack scenarios, practice incident reporting, and demonstrate the ability to identify phishing attempts before they lead to serious security risks.
        </p>
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {METRICS.map((m) => <MetricCard key={m.label} {...m} />)}
        </div>
        <p className="font-mono mt-2 text-[11px] text-slate-600">Sample metrics for this training environment \u2014 not live production data.</p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_ACTIONS.map((a) => <ActionCard key={a.label} {...a} onNav={onNav} />)}
        </div>
      </div>
    </section>
  );
}



function EmailMock({ activeSpot, setActiveSpot }) {
  return (
    <Panel accent="rose" className="overflow-hidden rounded-lg border border-slate-800 bg-slate-900">
      <div className="flex items-center gap-2 border-b border-slate-800 bg-slate-950/60 px-4 py-2.5">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-500/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
        </div>
        <span className="font-mono text-xs text-slate-500">Inbox \u2014 Preview</span>
      </div>
      <div className="space-y-3 p-5 text-sm">
        <div className="space-y-1 border-b border-slate-800 pb-3">
          <div className="text-slate-500">
            From: "IT Support" &lt;<Spot id="domain" active={activeSpot} onSelect={setActiveSpot} severity="high">it-support@0ffice365-secure.com</Spot>&gt;
          </div>
          <div className="text-slate-500">To: you@yourcompany.com</div>
          <div className="font-medium text-slate-200">Subject: \u26a0\ufe0f Action Required: Your Password Expires in 24 Hours</div>
        </div>
        <p className="text-slate-300">Dear Employee,</p>
        <p className="text-slate-300">Our records indicate your password will expire today. To avoid losing access to your account, please verify your identity immediately by clicking the secure link below.</p>
        <p className="text-slate-300">
          <Spot id="urgency" active={activeSpot} onSelect={setActiveSpot} severity="medium">Failure to act within 24 hours will result in permanent account suspension.</Spot>
        </p>
        <div>
          <Spot id="link" active={activeSpot} onSelect={setActiveSpot} severity="high">
            <span className="inline-flex items-center gap-1 rounded bg-cyan-600/80 px-3 py-1.5 font-medium text-white">
              Verify My Account Now <ExternalLink className="h-3 w-3" />
            </span>
          </Spot>
          <div className="font-mono mt-1 text-[11px] text-slate-600">hover target: hxxp://0ffice365-secure.com/verify-login</div>
        </div>
        <div className="flex items-center gap-2 rounded-md border border-slate-800 bg-slate-950/60 p-2.5">
          <Paperclip className="h-4 w-4 text-slate-500" />
          <Spot id="attachment" active={activeSpot} onSelect={setActiveSpot} severity="high">
            <span className="font-mono text-xs">Security_Update_Instructions.pdf.exe</span>
          </Spot>
        </div>
        <p className="text-slate-500">Thank you,<br />IT Support Team</p>
      </div>
    </Panel>
  );
}

function SmsMock({ activeSpot, setActiveSpot }) {
  return (
    <div className="mx-auto max-w-xs">
      <Panel accent="rose" className="rounded-[2rem] border-4 border-slate-800 bg-slate-900 p-3">
        <div className="mb-2 flex justify-center">
          <div className="h-1.5 w-16 rounded-full bg-slate-800" />
        </div>
        <div className="rounded-2xl bg-slate-950 p-4">
          <div className="mb-3 flex items-center gap-2 border-b border-slate-800 pb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-slate-400">US</div>
            <Spot id="sender" active={activeSpot} onSelect={setActiveSpot} severity="high"><span className="text-sm font-medium">USPS</span></Spot>
          </div>
          <div className="space-y-2">
            <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-slate-800 p-3 text-sm text-slate-200">
              Your package is on hold due to an unpaid redelivery fee.{" "}
              <Spot id="urgency" active={activeSpot} onSelect={setActiveSpot} severity="medium">Resolve within 12 hours to avoid return to sender.</Spot>
            </div>
            <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-slate-800 p-3 text-sm">
              <Spot id="link" active={activeSpot} onSelect={setActiveSpot} severity="high">
                <span className="text-cyan-400 underline">hxxp://usps-track.info/x7Yq</span>
              </Spot>
            </div>
          </div>
        </div>
      </Panel>
    </div>
  );
}

function SpearMock({ activeSpot, setActiveSpot }) {
  return (
    <Panel accent="rose" className="overflow-hidden rounded-lg border border-slate-800 bg-slate-900">
      <div className="flex items-center gap-2 border-b border-slate-800 bg-slate-950/60 px-4 py-2.5">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-500/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
        </div>
        <span className="font-mono text-xs text-slate-500">Inbox \u2014 Preview</span>
      </div>
      <div className="space-y-3 p-5 text-sm">
        <div className="space-y-1 border-b border-slate-800 pb-3">
          <div className="text-slate-500">From: "Alex Whitfield \u00b7 CEO" &lt;a.whitfield@yourcompany.com&gt;</div>
          <div className="text-slate-500">
            Reply-To: <Spot id="replyTo" active={activeSpot} onSelect={setActiveSpot} severity="high">alexwhitfield1979@freemail-inbox.com</Spot>
          </div>
          <div className="font-medium text-slate-200">Subject: Confidential \u2014 need this handled today</div>
        </div>
        <p className="text-slate-300">
          Hi \u2014 I need you to process an urgent wire transfer for a confidential acquisition we're finalizing.{" "}
          <Spot id="request" active={activeSpot} onSelect={setActiveSpot} severity="high">Send funds to the account details I'll provide once you confirm you can action this today.</Spot>
        </p>
        <p className="text-slate-300">
          <Spot id="secrecy" active={activeSpot} onSelect={setActiveSpot} severity="high">Please don't discuss this with anyone else on the team yet \u2014 I want to keep this tight until it's signed.</Spot>
        </p>
        <p className="text-slate-300">
          <Spot id="unavailability" active={activeSpot} onSelect={setActiveSpot} severity="medium">I'm in back-to-back board meetings today so email is easiest \u2014 can't jump on a call.</Spot>
        </p>
        <p className="text-slate-500">Thanks,<br />Alex</p>
      </div>
    </Panel>
  );
}

function Simulator() {
  const [tab, setTab] = useState("email");
  const [activeSpot, setActiveSpot] = useState(null);

  const tabs = [
    { id: "email", label: "Email Phishing", icon: Mail },
    { id: "sms", label: "Smishing (SMS)", icon: Smartphone },
    { id: "spear", label: "Spear Phishing (CEO Fraud)", icon: Crosshair },
  ];

  const detailMap = { email: EMAIL_HOTSPOTS, sms: SMS_HOTSPOTS, spear: SPEAR_HOTSPOTS };
  const detail = activeSpot ? detailMap[tab][activeSpot] : null;

  const switchTab = (id) => { setTab(id); setActiveSpot(null); };

  return (
    <section className="border-b border-slate-800 bg-slate-950 px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <SectionHeading eyebrow="Module 02" icon={Crosshair} accent="rose" title="Interactive Threat Simulator & Red Flag Lab" desc="Click any highlighted element inside a live attack mockup to see exactly why it's dangerous." />
        <div className="mt-8 flex flex-wrap gap-2 border-b border-slate-800 pb-3">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => switchTab(t.id)}
              className={`flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors ${tab === t.id ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-300" : "border-transparent text-slate-400 hover:text-slate-200"}`}
            >
              <t.icon className="h-4 w-4" />{t.label}
            </button>
          ))}
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            {tab === "email" && <EmailMock activeSpot={activeSpot} setActiveSpot={setActiveSpot} />}
            {tab === "sms" && <SmsMock activeSpot={activeSpot} setActiveSpot={setActiveSpot} />}
            {tab === "spear" && <SpearMock activeSpot={activeSpot} setActiveSpot={setActiveSpot} />}
          </div>
          <div className="lg:col-span-2">
            <DetailPanel detail={detail} />
          </div>
        </div>
      </div>
    </section>
  );
}



function Playbook() {
  const [open, setOpen] = useState(1);
  const [reported, setReported] = useState(false);

  return (
    <section className="border-b border-slate-800 bg-slate-900/30 px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <SectionHeading eyebrow="Module 03" icon={ClipboardCheck} accent="emerald" title="The 5-Step Incident Response & Reporting Playbook" desc="The exact workflow to follow the moment something looks like a phish." />
        <div className="mt-10 space-y-4">
          {PLAYBOOK_STEPS.map((step) => {
            const isOpen = open === step.n;
            return (
              <div key={step.n} className="rounded-lg border border-slate-800 bg-slate-900/60">
                <button onClick={() => setOpen(isOpen ? null : step.n)} className="flex w-full items-center gap-4 p-5 text-left">
                  <span className="font-mono flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-500/10 text-sm font-bold text-emerald-300">{step.n}</span>
                  <step.icon className="h-5 w-5 shrink-0 text-slate-500" />
                  <div className="min-w-0 flex-1">
                    <div className="font-display font-semibold text-slate-100">{step.title}</div>
                    <div className="truncate text-sm text-slate-500">{step.summary}</div>
                  </div>
                  <ChevronDown className={`h-5 w-5 shrink-0 text-slate-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && (
                  <div className="border-t border-slate-800 px-5 pb-5 pt-4">
                    <p className="text-sm leading-relaxed text-slate-400">{step.detail}</p>
                    {step.code && (
                      <pre className="font-mono mt-3 whitespace-pre-wrap rounded-md bg-slate-950 p-3 text-xs text-slate-400">{step.code}</pre>
                    )}
                    {step.demo && (
                      <div className="mt-4 flex flex-wrap items-center gap-3 rounded-md border border-slate-800 bg-slate-950/60 p-4">
                        <span className="flex items-center gap-1.5 rounded bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300">
                          <Mail className="h-3.5 w-3.5" />Inbox Toolbar
                        </span>
                        <button
                          onClick={() => setReported(true)}
                          disabled={reported}
                          className="flex items-center gap-1.5 rounded-md bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-400 disabled:opacity-60"
                        >
                          <Flag className="h-4 w-4" />{reported ? "Reported" : "Report Phishing"}
                        </button>
                        {reported && (
                          <span className="font-mono flex items-center gap-1.5 text-xs text-emerald-400">
                            <CheckCircle2 className="h-4 w-4" />Quarantined \u00b7 Ticket #INC-48213 sent to SOC
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <Panel accent="emerald" className="mt-10 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-6">
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-emerald-400">
            <ShieldCheck className="h-4 w-4" />Blameless Security Culture
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            Reporting a mistake fast is always the right call \u2014 including your own. Our policy is non-punitive: the moment you flag something, the priority is containing risk to the company, not assigning blame. Teams that report quickly and often are the reason threats get caught before they spread.
          </p>
        </Panel>
      </div>
    </section>
  );
}




function CertificateCard({ name, pct }) {
  return (
    <div className="text-center text-slate-900">
      <Award className="mx-auto h-8 w-8 text-emerald-600" />
      <div className="font-display mt-2 text-xs uppercase tracking-widest text-slate-500">Certificate of Completion</div>
      <div className="font-display mt-3 text-2xl font-bold">Phishing Defense Awareness</div>
      <div className="font-display mt-4 border-b border-slate-300 pb-2 text-lg text-slate-800">{name || "Your Name"}</div>
      <p className="mt-3 text-sm text-slate-600">
        has demonstrated the ability to identify and report phishing, smishing, and executive-fraud attempts, scoring {pct}% on the enterprise assessment.
      </p>
      <p className="font-mono mt-4 text-xs text-slate-400">
        Issued {new Date().toLocaleDateString()} \u00b7 Cert No. PDA-{pct}{QUIZ_QUESTIONS.length}{new Date().getFullYear()}
      </p>
    </div>
  );
}

function Quiz({ openModal }) {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [name, setName] = useState("");
  const done = step >= QUIZ_QUESTIONS.length;
  const q = !done ? QUIZ_QUESTIONS[step] : null;

  const submit = (i) => {
    if (answered) return;
    setSelected(i);
    setAnswered(true);
    if (i === q.correct) setScore((s) => s + 1);
  };

  const next = () => {
    setSelected(null);
    setAnswered(false);
    setStep((s) => s + 1);
  };

  const restart = () => {
    setStep(0); setSelected(null); setAnswered(false); setScore(0);
  };

  const pct = Math.round((score / QUIZ_QUESTIONS.length) * 100);
  const passed = pct >= 80;

  return (
    <section className="border-b border-slate-800 bg-slate-950 px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <SectionHeading eyebrow="Module 04" icon={Award} accent="cyan" title="Interactive Assessment & Phishing Quiz" desc="Six real-world scenarios. Score 80% or higher to earn your certificate." />
        {!done ? (
          <div className="mt-8">
            <div className="font-mono mb-4 flex items-center justify-between text-xs text-slate-500">
              <span>Question {step + 1} of {QUIZ_QUESTIONS.length}</span>
              <span>Score: {score}/{step}</span>
            </div>
            <div className="mb-6 h-1.5 w-full rounded-full bg-slate-800">
              <div className="h-full rounded-full bg-cyan-400 transition-all" style={{ width: `${(step / QUIZ_QUESTIONS.length) * 100}%` }} />
            </div>
            <Panel accent="cyan" className="rounded-lg border border-slate-800 bg-slate-900/60 p-6">
              <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-cyan-400">
                <q.icon className="h-3.5 w-3.5" />{q.category}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">{q.scenario}</p>
              <p className="font-display mt-4 font-semibold text-slate-100">{q.question}</p>
              <div className="mt-4 space-y-2">
                {q.options.map((opt, i) => {
                  let style = "border-slate-700 hover:border-slate-500";
                  if (answered) {
                    if (i === q.correct) style = "border-emerald-500 bg-emerald-500/10";
                    else if (i === selected) style = "border-rose-500 bg-rose-500/10";
                    else style = "border-slate-800 opacity-50";
                  }
                  return (
                    <button key={i} onClick={() => submit(i)} disabled={answered} className={`flex w-full items-center justify-between gap-3 rounded-md border p-3.5 text-left text-sm text-slate-200 transition-colors ${style}`}>
                      <span>{opt}</span>
                      {answered && i === q.correct && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />}
                      {answered && i === selected && i !== q.correct && <XCircle className="h-4 w-4 shrink-0 text-rose-400" />}
                    </button>
                  );
                })}
              </div>
              {answered && (
                <div className="mt-5 rounded-md border border-slate-800 bg-slate-950/60 p-4">
                  <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-wide text-cyan-400">
                    <Target className="h-3.5 w-3.5" />Tactic Breakdown
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{q.breakdown}</p>
                  <button onClick={next} className="mt-4 flex items-center gap-1.5 rounded-md bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400">
                    {step === QUIZ_QUESTIONS.length - 1 ? "See Results" : "Next Question"} <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </Panel>
          </div>
        ) : (
          <div className="mt-8 text-center">
            <Panel accent={passed ? "emerald" : "amber"} className={`rounded-lg border p-8 ${passed ? "border-emerald-500/40 bg-emerald-500/5" : "border-amber-500/40 bg-amber-500/5"}`}>
              {passed ? <ShieldCheck className="mx-auto h-12 w-12 text-emerald-400" /> : <ShieldAlert className="mx-auto h-12 w-12 text-amber-400" />}
              <div className="font-display mt-4 text-4xl font-bold text-slate-50">{pct}%</div>
              <p className="mt-1 text-slate-400">{score} of {QUIZ_QUESTIONS.length} correct</p>
              <p className="mx-auto mt-3 max-w-sm text-sm text-slate-400">
                {passed ? "Great work \u2014 you're ready to download your certificate below." : "You need 80% to earn the certificate. Review the tactic breakdowns and try again."}
              </p>
              <button onClick={restart} className="mt-5 inline-flex items-center gap-1.5 rounded-md border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800">
                <RefreshCw className="h-4 w-4" />Retake Quiz
              </button>
            </Panel>
            {passed && (
              <div className="mt-8 text-left">
                <label className="font-mono mb-2 block text-center text-xs uppercase tracking-widest text-slate-500">Certificate Preview</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Type your name"
                  className="mx-auto mb-4 block w-full max-w-sm rounded-md border border-slate-700 bg-slate-900 px-4 py-2.5 text-center text-slate-200 outline-none placeholder:text-slate-600 focus:border-cyan-400"
                />
                <div className="mx-auto max-w-md rounded-lg bg-white p-8">
                  <CertificateCard name={name} pct={pct} />
                </div>
                <div className="mt-4 text-center">
                  <button onClick={() => openModal({ type: "certificate", name, pct })} className="inline-flex items-center gap-2 rounded-md bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400">
                    <Download className="h-4 w-4" />Download Certificate
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}



function CheatSheetCard({ item }) {
  const Icon = item.icon;
  return (
    <div className="text-slate-900">
      <div className="flex items-center gap-2 text-rose-600">
        <Icon className="h-6 w-6" />
        <span className="font-mono text-xs uppercase tracking-widest">Cheat Sheet</span>
      </div>
      <h3 className="font-display mt-2 text-2xl font-bold">{item.name}</h3>
      <p className="mt-2 text-sm text-slate-600">{item.desc}</p>
      <div className="mt-4">
        <div className="font-display text-sm font-semibold text-slate-800">Red Flags</div>
        <ul className="mt-2 space-y-1.5">
          {item.flags.map((f, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />{f}
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-4">
        <div className="font-display text-sm font-semibold text-slate-800">Prevention Tips</div>
        <ul className="mt-2 space-y-1.5">
          {item.tips.map((t, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />{t}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Taxonomy({ openModal }) {
  const [filter, setFilter] = useState("All");
  const filters = ["All", "Email", "Mobile", "Advanced"];
  const visible = filter === "All" ? TAXONOMY : TAXONOMY.filter((t) => t.tags.includes(filter));

  return (
    <section className="border-b border-slate-800 bg-slate-900/30 px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <SectionHeading eyebrow="Module 05" icon={Layers} accent="rose" title="Phishing Taxonomy & Attack Tactics" desc="The modern attack surface, broken down by vector." />
        <div className="mt-6 flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${filter === f ? "border-rose-500/50 bg-rose-500/10 text-rose-300" : "border-slate-700 text-slate-400 hover:text-slate-200"}`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((item) => (
            <Panel key={item.id} accent="rose" className="flex flex-col rounded-lg border border-slate-800 bg-slate-900/60 p-5">
              <item.icon className="h-6 w-6 text-rose-400" />
              <h3 className="font-display mt-3 font-semibold text-slate-100">{item.name}</h3>
              <p className="mt-2 flex-1 text-sm text-slate-400">{item.desc}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {item.tags.map((tag) => (
                  <span key={tag} className="font-mono rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400">{tag}</span>
                ))}
              </div>
              <button
                onClick={() => openModal({ type: "cheatsheet", item })}
                className="mt-4 flex items-center justify-center gap-1.5 rounded-md border border-slate-700 py-2 text-sm text-slate-300 hover:border-rose-400/50 hover:text-rose-300"
              >
                <Download className="h-3.5 w-3.5" />Cheat Sheet
              </button>
            </Panel>
          ))}
        </div>
      </div>
    </section>
  );
}




function ResourceDocCard({ item }) {
  const Icon = item.icon;
  return (
    <div className="text-slate-900">
      <div className="flex items-center gap-2 text-cyan-700">
        <Icon className="h-6 w-6" />
        <span className="font-mono text-xs uppercase tracking-widest">Reference Document</span>
      </div>
      <h3 className="font-display mt-2 text-2xl font-bold">{item.name}</h3>
      <p className="mt-2 text-sm text-slate-600">{item.desc}</p>
      <ul className="mt-4 space-y-2">
        {item.body.map((b, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
            <span className="font-mono mt-0.5 text-xs text-slate-400">{String(i + 1).padStart(2, "0")}</span>{b}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ReporterTerminal() {
  const [input, setInput] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);

  const EXAMPLES = {
    suspicious: "From: accounts-verify@paypa1-secure.info\nSubject: Your account has been limited \u2014 verify now\nLink: hxxp://185.23.44.12/paypa1/login.php?ref=1",
    safe: "From: notifications@github.com\nSubject: [yourorg/repo] New pull request opened\nLink: https://github.com/yourorg/repo/pull/482",
  };

  const runScan = (text) => {
    setInput(text);
    if (!text) return;
    setScanning(true);
    setResult(null);
    setTimeout(() => {
      const flags = [];
      const t = text.toLowerCase();
      if (/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(text)) flags.push("Raw IP address used instead of a domain name");
      if (/(bit\.ly|tinyurl|t\.co|goo\.gl|is\.gd)/.test(t)) flags.push("Link shortener detected \u2014 real destination is hidden");
      if (/\.(xyz|top|zip|click|info|support|gq|work)\b/.test(t)) flags.push("Uncommon top-level domain often used in disposable phishing infrastructure");
      if (/hxxp:\/\//.test(t) && !/https:\/\//.test(t)) flags.push("No HTTPS in the link \u2014 unencrypted destination");
      if (/[0o]ffice|paypa1|g00gle|micros0ft|secur[e3]-?login/.test(t)) flags.push("Character substitution suggests a lookalike or typosquatted domain");
      if (/(verify|confirm|suspend|urgent|immediately|24 hours|act now|limited)/.test(t)) flags.push("Urgency or threat language commonly used to rush a decision");
      if (/@.*@/.test(text)) flags.push("Multiple \u201c@\u201d symbols \u2014 possible URL obfuscation trick");
      const score = Math.min(100, flags.length * 22 + (flags.length ? 10 : 0));
      const verdict = score >= 60 ? "high" : score >= 25 ? "medium" : "low";
      setResult({ flags, score, verdict });
      setScanning(false);
    }, 1100);
  };

  const verdictStyle = {
    high: { text: "text-rose-300", bg: "bg-rose-500/10", border: "border-rose-500/40", label: "High Risk \u2014 Do Not Interact" },
    medium: { text: "text-amber-300", bg: "bg-amber-500/10", border: "border-amber-500/40", label: "Caution \u2014 Verify Independently" },
    low: { text: "text-emerald-300", bg: "bg-emerald-500/10", border: "border-emerald-500/40", label: "No Strong Indicators Found" },
  };

  return (
    <Panel accent="cyan" className="rounded-lg border border-slate-800 bg-slate-950">
      <div className="flex items-center gap-2 border-b border-slate-800 px-5 py-3">
        <Terminal className="h-4 w-4 text-cyan-400" />
        <span className="font-mono text-xs text-slate-400">security-scan.sh \u2014 training simulation</span>
      </div>
      <div className="p-5">
        <p className="font-mono text-[11px] leading-relaxed text-amber-400/90">
          \u26a0 SIMULATED ANALYSIS \u2014 for training purposes only. This runs simple local pattern checks; it is not a real threat-intel lookup. Never paste real passwords or one-time codes here.
        </p>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste a suspicious email header, sender, or URL to scan..."
          rows={4}
          className="font-mono mt-3 w-full rounded-md border border-slate-800 bg-slate-900 p-3 text-xs text-slate-300 outline-none focus:border-cyan-500/50"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <button onClick={() => runScan(input)} disabled={!input || scanning} className="flex items-center gap-1.5 rounded-md bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-50">
            <ScanLine className="h-4 w-4" />{scanning ? "Scanning\u2026" : "Run Scan"}
          </button>
          <button onClick={() => runScan(EXAMPLES.suspicious)} className="rounded-md border border-slate-700 px-3 py-2 text-xs text-slate-400 hover:text-slate-200">Try suspicious example</button>
          <button onClick={() => runScan(EXAMPLES.safe)} className="rounded-md border border-slate-700 px-3 py-2 text-xs text-slate-400 hover:text-slate-200">Try safe example</button>
        </div>
        {scanning && (
          <div className="font-mono mt-4 flex items-center gap-2 text-xs text-cyan-400">
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />Checking domain patterns, link structure, and language cues\u2026
          </div>
        )}
        {result && !scanning && (
          <div className={`mt-4 rounded-md border p-4 ${verdictStyle[result.verdict].border} ${verdictStyle[result.verdict].bg}`}>
            <div className="flex items-center justify-between">
              <span className={`font-mono text-xs font-bold ${verdictStyle[result.verdict].text}`}>{verdictStyle[result.verdict].label}</span>
              <span className={`font-mono text-xs ${verdictStyle[result.verdict].text}`}>{result.score}/100</span>
            </div>
            {result.flags.length > 0 ? (
              <ul className="mt-3 space-y-1.5">
                {result.flags.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />{f}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-xs text-slate-400">No pattern-based indicators matched. That doesn't guarantee safety \u2014 when in doubt, report it and let the security team take a look.</p>
            )}
            <p className="mt-3 text-xs text-slate-500">Not sure? Forward it to the security team using the Report Phish button above \u2014 that's always the safe default.</p>
          </div>
        )}
      </div>
    </Panel>
  );
}

function Faq() {
  const [open, setOpen] = useState(null);
  return (
    <div className="space-y-2">
      {FAQS.map((f, i) => (
        <div key={i} className="rounded-lg border border-slate-800 bg-slate-900/60">
          <button onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between gap-3 p-4 text-left">
            <span className="flex items-center gap-2 text-sm font-medium text-slate-200">
              <HelpCircle className="h-4 w-4 shrink-0 text-cyan-400" />{f.q}
            </span>
            <ChevronDown className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${open === i ? "rotate-180" : ""}`} />
          </button>
          {open === i && <p className="px-4 pb-4 text-sm leading-relaxed text-slate-400">{f.a}</p>}
        </div>
      ))}
    </div>
  );
}

function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-800 pt-10">
      <div className="grid gap-8 sm:grid-cols-3">
        <div>
          <div className="font-display flex items-center gap-2 font-semibold text-slate-200">
            <Shield className="h-4 w-4 text-cyan-400" />PhishDefense
          </div>
          <p className="mt-2 text-xs leading-relaxed text-slate-500">
            This portal is a cybersecurity awareness training simulation. All phishing examples, names, and organizations presented are fictional and created solely for educational and learning purposes.
          </p>
        </div>
        <div>
          <div className="font-mono text-xs uppercase tracking-widest text-slate-500">Emergency Contacts</div>
          <ul className="mt-2 space-y-1.5 text-sm text-slate-400">
            <li className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-rose-400" />Training Support Desk — ext. 4357 (HELP)</li>
            <li className="flex items-center gap-2"><ShieldAlert className="h-3.5 w-3.5 text-rose-400" />Security Reporting — Use the provided reporting form</li>
            <li className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-rose-400" />security@example.com</li>
          </ul>
        </div>
        <div>
          <div className="font-mono text-xs uppercase tracking-widest text-slate-500">Quick Links</div>
          <ul className="mt-2 space-y-1.5 text-sm text-slate-400">
            {NAV_ITEMS.map((n) => <li key={n.id}>{n.label}</li>)}
          </ul>
        </div>
      </div>
      <p className="mt-8 border-t border-slate-800 pt-6 text-xs text-slate-600">
        @ {new Date().getFullYear()} Phishing Awareness & Training Simulation — Educational use only. All content is fictional and created for cybersecurity learning and demonstration purposes.
      </p>
    </footer>
  );
}

function Resources({ openModal }) {
  return (
    <section className="bg-slate-950 px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <SectionHeading eyebrow="Module 06" icon={BookOpen} accent="emerald" title="Resource Hub, Templates & Reporting Terminal" desc="Everything you need to reference later, plus a live scan for anything suspicious right now." />
        <div className="mt-8 grid gap-8 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-2">
            <h3 className="font-display font-semibold text-slate-200">Download Center</h3>
            {DOWNLOAD_CENTER.map((item) => (
              <Panel key={item.id} accent="emerald" className="flex items-center gap-4 rounded-lg border border-slate-800 bg-slate-900/60 p-4">
                <item.icon className="h-8 w-8 shrink-0 text-emerald-400" />
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-slate-200">{item.name}</div>
                  <div className="line-clamp-2 text-xs text-slate-500">{item.desc}</div>
                </div>
                <button
                  onClick={() => openModal({ type: "resource", item })}
                  className="flex shrink-0 items-center gap-1 rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:border-emerald-400/50 hover:text-emerald-300"
                >
                  <Download className="h-3.5 w-3.5" />Get
                </button>
              </Panel>
            ))}
          </div>
          <div className="lg:col-span-3">
            <h3 className="font-display mb-4 font-semibold text-slate-200">Live Phishing Reporter Terminal</h3>
            <ReporterTerminal />
          </div>
        </div>
        <div className="mt-16">
          <h3 className="font-display mb-4 font-semibold text-slate-200">Frequently Asked Questions</h3>
          <Faq />
        </div>
      </div>
      <div className="mx-auto max-w-7xl">
        <Footer />
      </div>
    </section>
  );
}





function PrintableModal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-sm sm:items-center sm:p-8">
      <div className="relative w-full max-w-lg rounded-xl border border-slate-700 bg-slate-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-3">
          <span className="font-mono text-xs uppercase tracking-widest text-slate-500">Preview</span>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-200">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="printable rounded-b-xl bg-white p-6 sm:p-8">
          {children}
        </div>
        <div className="flex gap-3 border-t border-slate-800 p-5">
          <button onClick={() => window.print()} className="flex items-center gap-2 rounded-md bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400">
            <Printer className="h-4 w-4" />Print / Save as PDF
          </button>
          <button onClick={onClose} className="rounded-md border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800">Close</button>
        </div>
      </div>
    </div>
  );
}




export default function App() {
  const scrollRef = useRef(null);
  const heroRef = useRef(null);
  const simRef = useRef(null);
  const playbookRef = useRef(null);
  const quizRef = useRef(null);
  const taxonomyRef = useRef(null);
  const resourcesRef = useRef(null);

  const sectionRefs = {
    hero: heroRef,
    simulator: simRef,
    playbook: playbookRef,
    quiz: quizRef,
    taxonomy: taxonomyRef,
    resources: resourcesRef,
  };

  const [active, setActive] = useState("hero");
  const [progress, setProgress] = useState(0);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [modal, setModal] = useState(null);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    setProgress(scrollHeight > clientHeight ? (scrollTop / (scrollHeight - clientHeight)) * 100 : 0);
    const elTop = el.getBoundingClientRect().top;
    let current = null;
    let minDist = Infinity;
    Object.entries(sectionRefs).forEach(([id, ref]) => {
      if (ref.current) {
        const dist = Math.abs(ref.current.getBoundingClientRect().top - elTop - 90);
        if (dist < minDist) { minDist = dist; current = id; }
      }
    });
    if (current) setActive(current)
  }, []);

  const scrollToSection = (id) => {
    const ref = sectionRefs[id];
    if (ref && ref.current) ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    setMobileNavOpen(false);
  };




