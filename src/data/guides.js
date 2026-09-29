export const GUIDES = [
  {
    slug: "what-to-carry",
    audience: "Candidates",
    title: "What to carry to a walk-in",
    dek: "A printed resume, a PAN card and a couple of photographs cover most drives.",
    minutes: 3,
    body: [
      ["", "A walk-in moves faster when people arrive with the papers the recruiter actually needs. Most roles ask for an updated resume, a PAN card and passport-size photographs. Some ask for education certificates or experience letters."],
      ["Check the listing first", "Every drive on TokenHire lists its documents. Carry those. If the listing names nothing, a resume and a PAN card are enough to start."],
      ["Bring the resume twice", "Carry a printout and keep the file on your phone. The recruiter may want paper in the room, and the file is what they see on their screen when they call your token."],
      ["What not to bring", "A bank passbook or a cancelled cheque is never needed for an interview. If a listing asks for either, treat it as a mistake."],
    ],
  },
  {
    slug: "how-tokens-work",
    audience: "Candidates",
    title: "How your token works",
    dek: "Your number, how many people are ahead of you, and when to start walking.",
    minutes: 3,
    body: [
      ["", "When you tap Get my token, you get a number like #042. That number is your place in the queue for that drive, and it is tied to your phone number, so there is one token per person."],
      ["Wait anywhere", "Your token page shows how many people are ahead of you and an estimated wait. It updates on its own. When five or fewer people are ahead, the ticket starts to glow, which is a good time to head in."],
      ["Check in at the door", "When you arrive, scan the lobby display. That marks you as present, so the recruiter knows you are in the building when your number comes up."],
      ["When you are called", "The token page and the lobby display both show your room. Walk in, and the recruiter already has your resume open."],
    ],
  },
  {
    slug: "cant-make-it",
    audience: "Candidates",
    title: "If you can’t make it",
    dek: "Release your token so the queue moves for everyone else.",
    minutes: 2,
    body: [
      ["", "Plans change. If you can’t reach the venue, open your token page and tap I can’t make it. Your place is released and the people behind you move up."],
      ["Running late", "You don’t need to release your token just because you are late. If the recruiter calls you before you arrive, they can skip you and bring you back when you check in."],
      ["Coming back later", "A released token can’t be restored, but if the drive is still open you can get a new one from the same listing."],
    ],
  },
  {
    slug: "one-list",
    audience: "Companies",
    title: "One queue for every room",
    dek: "When each interviewer keeps a separate sheet, the same person gets called twice.",
    minutes: 4,
    body: [
      ["", "Drive day fills a lobby. If each interviewer keeps a separate notebook, nobody can see who is already in a round, who was skipped and who has been waiting since the doors opened."],
      ["One board", "TokenHire keeps a single queue: Waiting, In round and Done. Every interviewer calls the next token from that same board into their own room, with the N key or one tap."],
      ["Rounds follow the person", "Pass someone and they wait for the next round automatically. The next free room for that round calls them, so nobody has to walk a file down the corridor."],
      ["The lobby shows the rest", "The lobby display shows the token and room being called. Phone numbers and resumes stay with the signed-in team."],
    ],
  },
  {
    slug: "desk-pin",
    audience: "Companies",
    title: "Run the front desk with a Desk PIN",
    dek: "Give desk staff the queue without giving them an account.",
    minutes: 3,
    body: [
      ["", "Every drive has a Desk PIN. Anyone at the front desk can open the desk view with that PIN, no login needed, and see the live queue for that drive only."],
      ["What the desk can do", "Mark people as arrived, call the next token, skip someone who stepped out and mark no-shows. That covers most of what happens at the door."],
      ["What the desk can’t see", "Resumes, interview notes and round decisions stay with recruiters. The desk sees names and tokens, which is all a check-in needs."],
    ],
  },
  {
    slug: "the-report",
    audience: "Companies",
    title: "From drive report to your ATS",
    dek: "Names, notes and every round’s result, in a file your ATS can import.",
    minutes: 4,
    body: [
      ["", "The interview happens in the room. The offer still goes out from the system your company already uses. What drive day has to produce is a clean record."],
      ["The funnel", "The Report tab shows how many people registered, checked in, were interviewed and were shortlisted, with the average wait and time per round."],
      ["Export for ATS", "Download a CSV or XLSX. The standard format uses plain column names, and there are ready-made layouts for Workday, Greenhouse, Lever, Darwinbox and Keka Hire."],
      ["After the import", "Shortlisted stays shortlisted. Offers and joining are handled in your ATS, not in TokenHire."],
    ],
  },
];

export const guideBySlug = (slug) => GUIDES.find((g) => g.slug === slug) || null;
