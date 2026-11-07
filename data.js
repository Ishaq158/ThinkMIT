/**
 * THINK MIT — data.js
 * ---------------------------------------------------------------------------
 * SINGLE SOURCE OF TRUTH for every piece of text, date, list, link and media
 * URL shown on the website, plus registration rules.
 *
 * HOW IT WORKS (see PRD.md §6):
 *  - The website renders ONLY from this object (merged with admin overrides
 *    stored in the database). Never hard-code event text in components.
 *  - Edit a value here -> save -> the site updates (instantly in dev; on the
 *    next deploy in production).
 *  - Edit a value in the Admin panel -> it is stored in the DB and overrides
 *    the value here immediately, with no redeploy. "Reset to default" in the
 *    admin panel removes the override and falls back to this file.
 *  - Any "TBA" / null value is a placeholder the organiser must fill in.
 *
 * RULES FOR EDITING
 *  - Keep the top-level keys and nesting. You can freely change values and
 *    add/remove items inside arrays.
 *  - Dates are ISO strings: "2026-12-05T17:00:00+05:30" or null.
 */

const siteData = {
  /* ───────────────────────────── 1. BRAND / SEO ───────────────────────────── */
  site: {
    name: "THINK MIT",
    tagline: "Your Idea. Our Campus.",
    subTagline: "From Pitch to Implementation.",
    heroHeadline: ["Your Idea.", "Our Campus."], // each item = one line of the big H1
    description:
      "THINK MIT is a college-level innovation pitchfest where students identify campus problems and pitch practical solutions — with a pathway to funding and implementation.",
    collegeShortName: "MITM",
    organisedBy: [
      "Institution's Innovation Council (IIC)",
      "Entrepreneurship Development Cell (EDC)",
    ],
    inAssociationWith: "Department of Computer Science and Engineering – Artificial Intelligence (CSE–AI)",
    logoUrl: null, // null = use the built-in 4-block SVG mark. Or paste an image URL.
    faviconEmoji: "💡",
    seoTitle: "THINK MIT — Your Idea. Our Campus.",
  },

  /* ─────────────────────────────── 2. NAVIGATION ──────────────────────────── */
  nav: {
    links: [
      { label: "About", href: "/#about" },
      { label: "Journey", href: "/#journey" },
      { label: "Guidelines", href: "/#guidelines" },
      { label: "Contact", href: "/#contact" },
    ],
    ctaLabel: "Register Team",
    ctaHref: "/register",
    mobileExtraLabel: "Register your team",
  },

  /* ───────────────────────────── 3. REGISTRATION RULES ─────────────────────── */
  registration: {
    isOpen: true, // master switch. false => form hidden, closedMessage shown
    opensOn: null, // ISO date or null
    deadline: null, // ISO date or null. After this, registration closes automatically
    closedMessage: "Registrations are closed. Thank you for your interest in THINK MIT!",
    notYetOpenMessage: "Registrations will open soon. Stay tuned!",
    teamSize: 3, // fixed by the event design; do not change without a DB migration
    maxTeams: null, // null = unlimited
    regIdPrefix: "TMIT", // generates TMIT-0001, TMIT-0002 ...
    successTitle: "You're in! Registration received.",
    successMessage:
      "Your team and idea have been submitted. Screening results will be announced later. Keep your Registration ID safe.",
    consentText:
      "I confirm that all details are accurate, the idea is original, and all three team members agree to follow the event guidelines.",
    validation: {
      // Change these without touching code. Applied on client AND server.
      usnRegex: "^[A-Za-z0-9]{10}$", // 10 alphanumeric chars (VTU style). Tighten later if needed
      phoneRegex: "^[6-9][0-9]{9}$", // Indian 10-digit mobile
      emailDomainAllowList: [], // e.g. ["mitmysore.in"] ; empty = any email
      teamNameMin: 3,
      teamNameMax: 40,
    },
    // Limits for the idea text areas (characters)
    ideaLimits: {
      titleMax: 80,
      problemMax: 800,
      solutionMax: 1200,
      uniquenessMax: 600,
      impactMax: 800,
    },
  },

  /* ─────────────────────── 4. FORM LABELS (what students see) ───────────────── */
  form: {
    steps: [
      { key: "team", title: "Team & Track" },
      { key: "members", title: "Team Members" },
      { key: "idea", title: "Your Idea" },
      { key: "review", title: "Review & Submit" },
    ],
    team: {
      teamName: { label: "Team Name", placeholder: "e.g. Campus Innovators", required: true },
      track: {
        label: "Track of Interest",
        help: "Choose the one track your idea fits best.",
        required: true,
      },
    },
    // Applies to Member 1 (Team Leader), Member 2 and Member 3
    member: {
      name: { label: "Full Name", placeholder: "As per college records", required: true },
      usn: { label: "USN", placeholder: "e.g. 4MH23CS001", required: true },
      email: { label: "Email ID", placeholder: "name@example.com", required: true },
      phone: { label: "Contact Number", placeholder: "10-digit mobile number", required: true },
      role: {
        label: "Training Stream",
        help: "Each member must pick a different stream. Defaults follow member order.",
        required: true,
      },
      // Extra fields not in the original list but useful for checking eligibility.
      // Set enabled:false to hide them (they are then stored as empty).
      programme: { enabled: true, label: "Programme", required: true },
      year: { enabled: true, label: "Year / Semester", placeholder: "e.g. 3rd Year", required: true },
      department: { enabled: true, label: "Department", placeholder: "e.g. CSE-AI", required: true },
    },
    memberTitles: ["Team Leader (Member 1)", "Member 2", "Member 3"],
    programmeOptions: ["UG – 2nd Year", "UG – 3rd Year", "UG – 4th Year", "MBA", "MCA"],
    idea: {
      title: { label: "Idea Title", placeholder: "A short, catchy name for your idea", required: true },
      problem: {
        label: "Problem Statement",
        placeholder: "What campus problem are you solving? Who faces it?",
        required: true,
      },
      solution: {
        label: "Proposed Solution",
        placeholder: "How will your idea solve it?",
        required: true,
      },
      uniqueness: {
        label: "Innovation & Uniqueness",
        placeholder: "What makes your idea different?",
        required: true,
      },
      impact: {
        label: "Expected Impact & Implementation",
        placeholder: "Who benefits, and how could it be implemented on campus?",
        required: true,
      },
      referenceLink: {
        label: "Supporting Link (optional)",
        placeholder: "Google Drive / Figma / YouTube link, if any",
        required: false,
      },
    },
  },

  /* ─────────────────────────── 5. THREE ROLES / STREAMS ─────────────────────── */
  // key is stored in the DB; label/description are display-only and editable.
  // NOTE: sources differ ("Innovation Lead" vs "Idea Defence Lead"). Confirm final name.
  roles: [
    {
      key: "business",
      label: "Business Lead",
      defaultMemberPosition: 1,
      summary: "Business feasibility, value and impact.",
      responsibilities: [
        "Explains the business value, feasibility and impact of the idea",
        "Covers cost, sustainability and value for the campus",
      ],
      training: "Business training stream — 1 hour per day for 3 days",
    },
    {
      key: "innovation",
      label: "Innovation Lead",
      defaultMemberPosition: 2,
      summary: "Problem identification, solution explanation and defending the idea.",
      responsibilities: [
        "Presents the idea and explains the problem",
        "Defends the proposed solution before the evaluators",
      ],
      training: "Innovation & idea-defence training stream — 1 hour per day for 3 days",
    },
    {
      key: "technical",
      label: "Technical Lead",
      defaultMemberPosition: 3,
      summary: "Technical feasibility and implementation.",
      responsibilities: [
        "Explains the technology and technical requirements",
        "Describes how the solution will be built and implemented",
      ],
      training: "Technical training stream — 1 hour per day for 3 days",
    },
  ],

  /* ─────────────────────────────── 6. THREE TRACKS ──────────────────────────── */
  // PLACEHOLDERS — organiser must replace names/descriptions/rooms.
  tracks: [
    { key: "track-1", name: "Track 1 (name TBA)", description: "Description to be announced.", room: "Room TBA" },
    { key: "track-2", name: "Track 2 (name TBA)", description: "Description to be announced.", room: "Room TBA" },
    { key: "track-3", name: "Track 3 (name TBA)", description: "Description to be announced.", room: "Room TBA" },
  ],
  tracksIntro:
    "Teams are divided into three tracks. Volunteers are assigned to each team and will guide you to your designated room.",

  /* ───────────────────────────────── 7. HERO ───────────────────────────────── */
  hero: {
    subtitle: "Pitch a campus problem. Build the solution. Get a shot at real funding.",
    primaryCta: { label: "Register Your Team", href: "/register" },
    secondaryCta: { label: "Read Guidelines", href: "/#guidelines" },
    // Glass "studio" panel (decorative live demo of a pitch)
    panel: {
      chatTitle: "Campus Pitch Preview",
      messages: [
        { type: "bubble", text: "Our canteen has huge queues during breaks. Can we fix that?" },
        {
          type: "ai",
          text:
            "Great problem to pick. Define who is affected, how your solution works, and what it would take to implement it on campus.",
        },
        { type: "bubble", text: "A pre-order app with timed pickup slots." },
        {
          type: "ai",
          text:
            "Strong start. Your Business, Innovation and Technical leads each shape one part of the pitch — that's how THINK MIT turns ideas into impact.",
        },
      ],
      blueprintLabel: "YOUR IDEA",
      blueprintTitle: "Smart Canteen Queue",
      sliderLabel: "Feasibility",
      sliderValue: 84, // percent
      rightTitle: "Pitch Preview",
      rightImageAlt: "A student presenting an idea",
    },
  },

  /* ───────────────────────────── 8. ABOUT (bento cards) ─────────────────────── */
  about: {
    eyebrow: "About THINK MIT",
    headingLine1: "Ideas Get Sharper with",
    headingLine2: "Training & Real Support",
    lead:
      "THINK MIT encourages students to identify problems within the college campus and develop practical, feasible solutions — from concept and presentation to potential funding and implementation.",
    vision:
      "To create a platform where students don't just think of solutions but get an opportunity to transform their ideas into reality within their own campus.",
    objectives: [
      "Promote innovation, entrepreneurship, teamwork and practical problem-solving.",
      "Build business, technical and idea-presentation skills through focused training.",
      "Identify promising solutions that can be supported for implementation within the college.",
    ],
    cards: {
      big: {
        title: "Your Idea.",
        titleSoft: "Our Campus.",
        desc: "Spot a real problem on campus, pitch your solution, and see it come to life.",
        footnote: "Organised by CSE–AI · IIC · EDC",
        ctaLabel: "Register now",
      },
      eligibility: {
        title: "Who Can Participate",
        text: "Students of 2nd, 3rd and 4th year UG programmes, plus MBA and MCA, at MITM. Teams of exactly three.",
      },
      training: {
        title: "Focused Training",
        text: "Selected teams get domain-specific training by resource persons.",
        count: 3, // big number in the gauge
        countSuffix: " days",
        endsLeft: "1 hr / day",
        endsRight: "3 streams",
      },
      roles: {
        title: "Three Roles, One Team",
        text: "Business, Innovation and Technical leads — each trained in their own stream.",
      },
      funding: {
        title: "Funding & Implementation",
        text: "Promising ideas may receive institutional funding and support, subject to review and approval.",
        chip: "Funding opportunity",
      },
    },
  },

  /* ───────────────────────────── 9. JOURNEY (timeline) ──────────────────────── */
  journey: {
    eyebrow: "The Journey",
    headingLine1: "From Registration to",
    headingLine2: "Real Implementation",
    lead: "Five clear stages take your idea from a form to the campus.",
    // Dates are shown when set; otherwise "Date TBA"
    stages: [
      { n: 1, title: "Online Registration", text: "Register your team of three and submit your campus problem statement and idea.", date: null },
      { n: 2, title: "Screening & Shortlisting", text: "Submitted ideas are reviewed and promising teams are shortlisted.", date: null },
      { n: 3, title: "Domain Training", text: "1 hour per day for 3 days — Business, Innovation and Technical streams.", date: null },
      { n: 4, title: "One-Day Pitchfest", text: "Present and defend your idea before the evaluation panel.", date: null },
      { n: 5, title: "Selection & Implementation", text: "Selected ideas may receive funding and campus implementation support.", date: null },
    ],
    centerImageAlt: "Students collaborating on an idea",
    funding: {
      heading: "What happens after selection?",
      subheading: "Your Idea. Our Support. Real Impact.",
      note: "Selection does not automatically guarantee funding or implementation.",
      steps: [
        { title: "Funding Support", text: "Institutional funding opportunities based on idea feasibility, requirements and approval." },
        { title: "Idea Development", text: "Transforming selected concepts into practical solutions through prototype development and refinement." },
        { title: "Mentorship & Guidance", text: "Expert and faculty guidance to strengthen ideas and overcome implementation challenges." },
        { title: "Implementation & Execution", text: "Turning approved ideas into reality through planning, development, testing and campus implementation." },
      ],
    },
  },

  /* ───────────────────────────────── 10. PROMO VIDEO ─────────────────────────── */
  promoVideo: {
    enabled: true, // false hides the whole section
    eyebrow: "Watch",
    heading: "THINK MIT in 60 seconds",
    caption: "Everything you need to know about the event.",
    comingSoonText: "Promo video coming soon",
    // HOW TO ADD THE VIDEO LATER (any one):
    //  1) Admin panel -> Promo Video -> upload an .mp4 / .webm  (stored in DB storage, URL filled automatically)
    //  2) Admin panel -> paste a YouTube / Vimeo / direct .mp4 link
    //  3) Edit here: set type + url
    type: "none", // "none" | "file" | "youtube" | "vimeo"
    url: "", // direct .mp4/.webm URL, or full YouTube/Vimeo link
    poster: "", // optional thumbnail image URL
  },

  /* ─────────────────────────────── 11. GUIDELINES ───────────────────────────── */
  // Rendered as an accordion on the home page. Section numbers are auto-generated from order.
  // "embed" inserts a ready-made block: "roles" | "tracks" | "evaluation" | "funding" | "contact"
  guidelines: {
    eyebrow: "Guidelines",
    heading: "Everything you need to know",
    lead: "Read these carefully before you register and before Pitchfest.",
    sections: [
      {
        key: "about",
        title: "About THINK MIT",
        subtitle: "Vision and objectives",
        blocks: [
          { heading: "Vision", items: ["To create a platform where students don't just think of solutions but get an opportunity to transform their ideas into reality within their own campus."] },
          {
            heading: "Objectives",
            items: [
              "Promote innovation, entrepreneurship, teamwork and practical problem-solving.",
              "Build business, technical and idea-presentation skills through focused training.",
              "Identify promising solutions that can be supported for implementation within the college.",
            ],
          },
        ],
      },
      {
        key: "participation",
        title: "Participation Guidelines",
        subtitle: "Eligibility and idea submission",
        blocks: [
          {
            heading: "Eligibility",
            items: [
              "Students currently studying in 2nd, 3rd and 4th year of undergraduate programmes at MITM are eligible.",
              "Students pursuing MBA and MCA programmes are also eligible.",
              "Participation must be in teams of three members.",
              "Each team must assign three distinct roles: Business Lead, Innovation Lead and Technical Lead.",
              "Students are encouraged to form multidisciplinary teams and bring diverse perspectives.",
            ],
          },
          {
            heading: "Idea Submission",
            items: [
              "Ideas should address a genuine problem, preferably related to campus needs or challenges.",
              "Solutions should be innovative, practical and focused on creating a meaningful impact.",
              "Clearly explain the problem you intend to solve and your proposed solution.",
              "Highlight the uniqueness and benefits of your idea.",
              "Explain how your idea can be implemented in a real-world setting.",
              "Avoid submitting copied ideas. Original thinking and creativity are encouraged.",
              "Provide accurate and complete information in the registration form.",
              "Be prepared to explain and defend your submitted idea during the Pitchfest.",
            ],
          },
          {
            heading: "Important Instructions",
            items: [
              "Each team must submit only one idea.",
              "All three team members must be actively involved in developing and presenting the idea.",
              "Incomplete or misleading submissions may not be considered.",
              "Shortlisted teams must follow the assigned track, training schedule and event instructions.",
            ],
          },
        ],
      },
      {
        key: "team",
        title: "Team Structure",
        subtitle: "Three roles and responsibilities",
        embed: "roles",
        blocks: [],
      },
      {
        key: "tracks-training",
        title: "Tracks, Training & Event Day",
        subtitle: "Track allocation, training schedule and event-day instructions",
        embed: "tracks",
        blocks: [
          {
            heading: "Training",
            items: [
              "Training is conducted for three days, one hour per day.",
              "Each member is trained in their own stream (Business, Innovation or Technical).",
              "Participants are expected to attend all sessions and clarify their doubts.",
              "Teams should incorporate their learnings into the final presentation.",
            ],
          },
          {
            heading: "Event-Day Instructions",
            items: [
              "Report at the designated venue on time.",
              "Coordinate with your assigned volunteers.",
              "Follow your respective track and room allocation.",
              "Keep presentations and supporting materials ready.",
              "Tea and biscuits will be provided as refreshments.",
              "Follow the instructions of the event coordinators.",
            ],
          },
        ],
      },
      {
        key: "pitch",
        title: "Pitching Guidelines",
        subtitle: "Presentation format and structure",
        blocks: [
          {
            heading: "Suggested Pitch Flow",
            items: [
              "Problem Statement",
              "Proposed Solution",
              "Innovation and Uniqueness",
              "Technical Approach",
              "Business Feasibility",
              "Implementation Plan",
              "Expected Impact",
            ],
          },
          {
            heading: "Format",
            items: [
              "All three team members must take part in the presentation.",
              "Presentation format, time limit and Q&A duration: to be announced to shortlisted teams.",
              "Supporting materials and demonstrations are welcome; rules will be shared with shortlisted teams.",
            ],
          },
        ],
      },
      {
        key: "evaluation",
        title: "Evaluation Criteria",
        subtitle: "Judging parameters",
        embed: "evaluation",
        blocks: [],
      },
      {
        key: "rules",
        title: "Rules & Regulations",
        subtitle: "Event rules and discipline",
        blocks: [
          {
            heading: "Rules",
            items: [
              "All team members must follow the event schedule.",
              "Teams must maintain discipline.",
              "Plagiarism and misrepresentation of ideas are not permitted.",
              "Respect other participants and evaluators.",
              "Teams must follow instructions provided by coordinators and volunteers.",
              "Decisions of the evaluation panel will be final.",
            ],
          },
        ],
      },
      {
        key: "funding",
        title: "Funding & Implementation",
        subtitle: "What happens after selection",
        embed: "funding",
        blocks: [],
      },
      {
        key: "contact",
        title: "Contact & Support",
        subtitle: "Support and coordination",
        embed: "contact",
        blocks: [],
      },
    ],
  },

  /* ────────────────────────────── 12. EVALUATION CRITERIA ───────────────────── */
  evaluation: {
    intro: "Teams are assessed on relevance to campus needs, feasibility, potential impact and implementation considerations.",
    criteria: [
      { name: "Innovation", description: "Originality and uniqueness" },
      { name: "Problem Relevance", description: "Importance of the problem addressed" },
      { name: "Feasibility", description: "Practical possibility of implementation" },
      { name: "Technical Strength", description: "Technical approach and reliability" },
      { name: "Business Value", description: "Cost, sustainability and value" },
      { name: "Presentation", description: "Clarity and confidence" },
      { name: "Impact", description: "Potential benefits to the campus" },
    ],
  },

  /* ──────────────────────────── 13. SELECTED TEAMS ANNOUNCEMENT ─────────────── */
  // Admin flips "published" to true to show the selected teams publicly. Hidden until then.
  announcements: {
    published: false,
    eyebrow: "Announcement",
    heading: "Selected Teams",
    intro: "Congratulations to the teams shortlisted for training and Pitchfest!",
    showIdeaTitle: true,
    showTrack: true,
  },

  /* ─────────────────────────────────── 14. CONTACT ──────────────────────────── */
  contact: {
    eyebrow: "Contact Us",
    heading: "Questions? Reach out.",
    intro: "For support, queries and event coordination, feel free to reach out to us.",
    coordinators: [
      { name: "Shreya M", role: "Event Coordinator", phone: "9480168828" },
      { name: "S. Aishwarya", role: "Event Coordinator", phone: "7795454354" },
    ],
    people: [
      { role: "HOD", name: "Dr. Hemanth S. R." },
      { role: "SWO", name: "Prof. Kishan" },
    ],
    email: null, // e.g. "thinkmit@college.edu"; null hides it
    department: "Department of CSE–AI",
  },

  /* ─────────────────────────────────── 15. CTA BAND ─────────────────────────── */
  cta: {
    headingLine1: "Pitch",
    headingLine2: "Your Idea",
    text: "Form a team of three, submit your campus idea, and take it from pitch to implementation.",
    buttonLabel: "Register Your Team",
    buttonHref: "/register",
  },

  /* ─────────────────────────────────── 16. FOOTER ───────────────────────────── */
  footer: {
    aboutText: "THINK MIT is an IIC and EDC initiative with the Department of CSE–AI.",
    columns: [
      {
        title: "Event",
        links: [
          { label: "About", href: "/#about" },
          { label: "Journey", href: "/#journey" },
          { label: "Guidelines", href: "/#guidelines" },
          { label: "Register", href: "/register" },
        ],
      },
      {
        title: "Organisers",
        links: [
          { label: "CSE–AI", href: "#" },
          { label: "IIC", href: "#" },
          { label: "EDC", href: "#" },
        ],
      },
      {
        title: "Help",
        links: [
          { label: "Contact", href: "/#contact" },
          { label: "Guidelines", href: "/#guidelines" },
        ],
      },
    ],
    socials: { facebook: "", x: "", youtube: "", instagram: "" }, // empty = icon hidden
    legalLeft: "Privacy notice",
    legalCenter: "© THINK MIT 2026",
    legalRight: "Usage policy",
  },

  /* ──────────────────────────────── 17. MEDIA ASSETS ────────────────────────── */
  // Defaults below are the design template's CloudFront placeholders. REPLACE with
  // your own event images/videos (paste URLs or upload via Admin -> Media).
  media: {
    heroVideo: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261022_054532_4648c53b-8840-4872-b054-016a86833f5c.mp4",
    heroPoster: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261021_093821_db49f268-cd69-4ac0-b92b-e0b8a7062322.png",
    heroPanelImage: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261021_093819_a1b44e43-e95a-41dd-85fb-8206e2bffc83.png",
    aboutVideo: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261022_054543_65a4e3d3-ce77-45a9-8917-60ce35999ea7.mp4",
    aboutPoster: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261021_093819_8ee49f04-c4b4-4be9-9788-e5f7030697ce.png",
    aboutBigCard: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261021_093820_27269365-10b0-493c-aaeb-f491968d728e.png",
    aboutCollageA: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261021_093821_f31363e6-8c86-4044-ae68-234c89bfd631.png",
    aboutCollageB: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261021_093820_271e56c9-4dd2-4893-ac2d-2ef620eb354e.png",
    aboutFundingImage: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261021_093819_a1b44e43-e95a-41dd-85fb-8206e2bffc83.png",
    journeyCenterImage: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261021_093819_09809dd7-6a23-494d-ba2d-1b3181a9dee0.png",
    journeySideImages: [
      "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261021_093820_27269365-10b0-493c-aaeb-f491968d728e.png",
      "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261021_093821_f31363e6-8c86-4044-ae68-234c89bfd631.png",
      "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261021_093820_271e56c9-4dd2-4893-ac2d-2ef620eb354e.png",
    ],
    ctaVideo: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261022_054543_cc94675a-b1cc-47a8-8843-c55665b0f33b.mp4",
    ctaPoster: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261021_093820_6e4510b1-3415-4522-80ef-8d3f9cebcfa5.png",
  },
};

export default siteData;
