import { driveStatus, windowAround, istDate } from "../lib/status.js";

// The public board: a hundred fictional walk-ins. Everything except the dates and hours
// comes from a fixed-seed generator, so the API and a static build produce the same ids,
// companies and copy.

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const pick = (r, list) => list[Math.floor(r() * list.length)];
const between = (r, lo, hi) => lo + Math.floor(r() * (hi - lo + 1));

export const ROLE_TYPES = [
  "Customer support", "Sales", "Banking and finance", "Retail and store", "Logistics and delivery",
  "Tech support and IT", "Healthcare", "Back office", "Hospitality", "Manufacturing",
];

const DOC = {
  resume: "Updated resume (print + PDF)",
  photos: "Passport-size photographs (2)",
  pan: "PAN card",
  edu: "Educational certificates",
  exp: "Experience / relieving letters",
  payslips: "Last three payslips",
  licence: "Driving licence",
  rc: "Two-wheeler RC",
  marksheet: "12th or degree marksheet",
  nursing: "Nursing council registration",
  pharma: "D.Pharm or B.Pharm certificate",
  iti: "ITI certificate",
  laptop: "Your own laptop, charged",
  portfolio: "Two work samples",
  pen: "A pen for the written test",
};

// Role templates. pay is ₹ thousands per month, exp is years.
const ROLES = {
  csVoice: { title: "Customer Support Executive (Voice)", type: "Customer support", pay: [16, 24], exp: [0, 2], docs: ["resume", "photos", "pan", "edu"], rounds: ["HR screening", "Voice and accent", "Ops round"],
    duties: ["Take inbound calls about orders, refunds and delivery status, and close each one in the system before the next.", "Handle calls from customers who are stuck on a booking or a payment, and log every case with a clear note.", "Answer billing and plan questions over the phone and escalate the few you can’t close to a team lead."] },
  csChat: { title: "Chat Support Associate", type: "Customer support", pay: [15, 21], exp: [0, 2], docs: ["resume", "pan", "marksheet"], rounds: ["Typing test", "HR round", "Ops round"],
    duties: ["Work two or three chats at once on our support widget, with saved replies for the common questions.", "Reply to customers over chat and email, tag each conversation and hand refunds to the finance desk.", "Resolve order and account issues over chat. You will need about 30 words a minute with few typos."] },
  csInt: { title: "International Voice Process Associate", type: "Customer support", pay: [24, 34], exp: [0, 3], docs: ["resume", "photos", "pan", "edu"], rounds: ["HR screening", "Versant test", "Client round"],
    duties: ["Take calls from US customers about their accounts and service plans on a fixed night shift.", "Speak with UK customers about deliveries and returns. Neutral accent matters more than experience.", "Handle Australian customers’ billing questions on a morning-to-afternoon shift with two fixed offs."] },
  bankRo: { title: "Relationship Officer", type: "Banking and finance", pay: [20, 30], exp: [1, 4], docs: ["resume", "photos", "pan", "edu", "payslips"], rounds: ["HR screening", "Branch manager", "Area head"],
    duties: ["Open savings and current accounts for walk-in and referred customers, and cross-sell insurance and deposits.", "Build a book of small-business customers around your branch and meet a monthly target for accounts and loans.", "Look after existing account holders, handle their service requests and pitch fixed deposits and cards."] },
  collections: { title: "Collections Officer", type: "Banking and finance", pay: [18, 26], exp: [0, 3], docs: ["resume", "pan", "edu", "licence"], rounds: ["HR round", "Collections manager"],
    duties: ["Visit customers with overdue two-wheeler and personal loans and agree a repayment plan with each.", "Call and meet customers on early-stage overdue accounts. Fuel is paid on actuals.", "Recover dues on a portfolio of small consumer loans in your area, with a daily route planned by the team."] },
  insurance: { title: "Insurance Sales Advisor", type: "Sales", pay: [18, 28], exp: [0, 3], docs: ["resume", "photos", "pan", "marksheet"], rounds: ["HR screening", "Sales role-play", "Manager round"],
    duties: ["Call warm leads who asked for a health or term plan quote, explain the options and close on the call.", "Sell motor and health insurance to customers who come in through partner dealerships.", "Meet families at home or in the branch and explain term and savings plans in plain language."] },
  retailSales: { title: "Sales Associate", type: "Retail and store", pay: [14, 20], exp: [0, 2], docs: ["resume", "photos", "pan"], rounds: ["HR round", "Store manager"],
    duties: ["Help customers on the floor pick phones, TVs and appliances, and bill the sale at the counter.", "Run a section of the store, keep displays stocked and answer questions about sizes and returns.", "Greet walk-in customers, demo products and earn incentives on every bill above the store target."] },
  storeOps: { title: "Store Operations Executive", type: "Retail and store", pay: [18, 25], exp: [1, 4], docs: ["resume", "photos", "pan", "exp"], rounds: ["HR round", "Cluster manager", "Ops head"],
    duties: ["Own opening and closing, stock counts and the daily sales report for one store.", "Manage inward stock, shrinkage and staff rosters for a store of eight to twelve people.", "Run the back room: receiving, stock checks, expiry dates and the weekly audit."] },
  cashier: { title: "Cashier", type: "Retail and store", pay: [13, 17], exp: [0, 1], docs: ["resume", "photos", "marksheet"], rounds: ["Numeracy test", "Store manager"],
    duties: ["Bill customers quickly and accurately at a busy counter, and close the till at the end of the shift.", "Handle cash, card and UPI payments and keep the counter area stocked and tidy."] },
  warehouse: { title: "Warehouse Associate", type: "Logistics and delivery", pay: [14, 19], exp: [0, 2], docs: ["resume", "photos", "pan"], rounds: ["HR round", "Shift supervisor"],
    duties: ["Pick, pack and scan orders on a handheld device in a fulfilment centre. Training takes three days.", "Unload inbound trucks, check quantities against the invoice and put stock away by bin.", "Sort parcels by route on the sortation line and load them onto the right outbound vehicle."] },
  delivery: { title: "Delivery Partner", type: "Logistics and delivery", pay: [18, 28], exp: [0, 5], docs: ["resume", "pan", "licence", "rc"], rounds: ["Document check", "Hub manager"],
    duties: ["Deliver 30 to 45 parcels a day inside a fixed area. Payouts are weekly, with fuel on actuals.", "Deliver groceries within a 3 km radius of one dark store in short, fixed shifts.", "Pick up and drop documents and parcels for business customers across the city."] },
  fleet: { title: "Fleet Supervisor", type: "Logistics and delivery", pay: [25, 35], exp: [2, 6], docs: ["resume", "photos", "pan", "exp", "licence"], rounds: ["HR round", "Regional ops", "City head"],
    duties: ["Manage a team of 40 riders: shift plans, attendance, delivery targets and daily payouts.", "Run one delivery hub end to end, from morning dispatch to returns and cash reconciliation."] },
  techL1: { title: "Technical Support Associate (L1)", type: "Tech support and IT", pay: [20, 28], exp: [0, 2], docs: ["resume", "pan", "edu"], rounds: ["Aptitude test", "Technical round", "HR round"],
    duties: ["Troubleshoot Windows laptops, Outlook and VPN issues for employees of a global client over phone and chat.", "Reset passwords, fix printer and network issues and raise tickets for anything that needs an engineer.", "Support users of a payroll and HR app, log every issue in the ticketing tool and follow it to closure."] },
  desktop: { title: "Desktop Support Engineer", type: "Tech support and IT", pay: [22, 32], exp: [1, 4], docs: ["resume", "pan", "edu", "exp"], rounds: ["Technical round", "Manager round"],
    duties: ["Set up and repair laptops, desktops and printers on site for a campus of about 1,500 users.", "Handle hardware tickets, imaging and asset tagging, and look after the conference room systems."] },
  qa: { title: "Junior QA Tester", type: "Tech support and IT", pay: [25, 38], exp: [0, 2], docs: ["resume", "edu", "laptop"], rounds: ["Written test", "Technical round", "HR round"],
    duties: ["Test our web and Android apps before each release, write clear bug reports and re-test fixes.", "Run manual regression suites on a banking app and learn basic Selenium with the team."] },
  devJr: { title: "Associate Software Engineer", type: "Tech support and IT", pay: [35, 55], exp: [0, 2], docs: ["resume", "edu", "laptop", "portfolio"], rounds: ["Coding test", "Technical interview", "HR round"],
    duties: ["Build and maintain features in a React and Node codebase with a senior engineer reviewing your work.", "Work on Java services behind our lending platform. Bring a laptop for the live coding round."] },
  dataEntry: { title: "Data Entry Operator", type: "Back office", pay: [13, 17], exp: [0, 2], docs: ["resume", "photos", "marksheet"], rounds: ["Typing test", "HR round"],
    duties: ["Enter invoice and order details from scanned documents into our system, with a daily accuracy check.", "Update product listings and prices in bulk from supplier sheets. Day shift, Monday to Saturday."] },
  kyc: { title: "KYC Verification Executive", type: "Back office", pay: [16, 22], exp: [0, 2], docs: ["resume", "pan", "edu"], rounds: ["Written test", "HR round", "Team lead"],
    duties: ["Check customer documents and selfies for a payments app, approve or reject each and note the reason.", "Verify address and income proofs for loan applications against the lender’s checklist."] },
  accounts: { title: "Accounts Executive", type: "Banking and finance", pay: [22, 32], exp: [1, 4], docs: ["resume", "pan", "edu", "exp"], rounds: ["Tally and Excel test", "Finance manager"],
    duties: ["Handle vendor payments, bank reconciliation and GST filings in Tally for a mid-size business.", "Post daily entries, chase receivables and prepare the month-end reports for the finance head."] },
  nurse: { title: "Staff Nurse", type: "Healthcare", pay: [22, 34], exp: [0, 4], docs: ["resume", "photos", "edu", "nursing"], rounds: ["Nursing superintendent", "Clinical round", "HR round"],
    duties: ["Work in general and surgical wards on rotating shifts, with a structured two-week induction.", "Join the ICU and step-down team. Freshers with a GNM or B.Sc Nursing are welcome to apply."] },
  pharmacist: { title: "Pharmacist", type: "Healthcare", pay: [18, 26], exp: [0, 3], docs: ["resume", "photos", "pharma", "edu"], rounds: ["Technical round", "Store manager"],
    duties: ["Dispense prescriptions at a neighbourhood pharmacy and advise customers on dosage and substitutes.", "Run the pharmacy counter at a diagnostics centre, including stock, expiry checks and billing."] },
  labTech: { title: "Lab Technician", type: "Healthcare", pay: [17, 24], exp: [0, 3], docs: ["resume", "photos", "edu"], rounds: ["Practical test", "Lab head"],
    duties: ["Collect samples, run routine blood tests and record results in the lab system.", "Work the home-collection shift in the mornings and process samples at the lab in the afternoon."] },
  frontOffice: { title: "Front Office Associate", type: "Hospitality", pay: [16, 23], exp: [0, 3], docs: ["resume", "photos", "edu"], rounds: ["HR round", "Front office manager"],
    duties: ["Check guests in and out, handle room changes and keep the lobby running on your shift.", "Run the front desk of a business hotel, including bookings, billing and guest requests."] },
  steward: { title: "F&B Steward", type: "Hospitality", pay: [14, 19], exp: [0, 2], docs: ["resume", "photos"], rounds: ["Grooming check", "Restaurant manager"],
    duties: ["Serve guests in an all-day restaurant, take orders on a tablet and set up for banquets.", "Work in the coffee shop and room service team. Meals on duty and a uniform are provided."] },
  crew: { title: "Restaurant Crew Member", type: "Hospitality", pay: [13, 17], exp: [0, 1], docs: ["resume", "photos"], rounds: ["Manager round"],
    duties: ["Take orders at the counter, prepare food on the line and keep the dining area clean.", "Work the drive-through and counter at a quick-service restaurant in fixed five-hour shifts."] },
  assembly: { title: "Assembly Line Operator", type: "Manufacturing", pay: [14, 19], exp: [0, 3], docs: ["resume", "photos", "iti"], rounds: ["Practical test", "Plant HR"],
    duties: ["Assemble and test small electronic parts on a line. Transport and a subsidised canteen are provided.", "Run a machine station on the line, record output and flag quality issues to the supervisor."] },
  qc: { title: "Quality Inspector", type: "Manufacturing", pay: [17, 24], exp: [1, 3], docs: ["resume", "photos", "iti", "exp"], rounds: ["Practical test", "Quality manager"],
    duties: ["Inspect incoming parts and finished goods against drawings using gauges and a vernier.", "Check each batch on the line, record defects and stop the line if a batch fails."] },
  bdeEdu: { title: "Admissions Counsellor", type: "Sales", pay: [22, 35], exp: [0, 3], docs: ["resume", "photos", "edu"], rounds: ["HR screening", "Sales role-play", "Manager round"],
    duties: ["Call students who asked about our courses, understand their goals and help them enrol.", "Counsel parents and students on degree programmes, mostly on phone and video calls."] },
  fieldSales: { title: "Field Sales Executive", type: "Sales", pay: [18, 27], exp: [0, 3], docs: ["resume", "photos", "pan", "licence"], rounds: ["HR round", "Sales manager"],
    duties: ["Sign up shops and small businesses in your area and show them how to use what they bought.", "Visit retailers on a fixed daily beat, take orders and follow up on payments due."] },
  travel: { title: "Travel Consultant", type: "Sales", pay: [20, 30], exp: [1, 3], docs: ["resume", "pan", "exp"], rounds: ["HR round", "Product test", "Team lead"],
    duties: ["Plan and sell domestic holiday packages to callers, and handle changes after booking.", "Book flights and hotels for corporate travellers and manage last-minute changes."] },
};

const COMPANIES = [
  { id: "northwind", name: "Northwind Care Services", short: "Northwind", color: "#0E7C66", roles: ["csVoice", "csInt", "csChat"], about: ["Northwind runs customer care for healthcare and insurance brands from five centres.", "Northwind Care Services answers calls and chats for health insurers and hospital chains."] },
  { id: "brightpath", name: "Brightpath Retail", short: "Brightpath", color: "#D9480F", roles: ["retailSales", "storeOps", "cashier"], about: ["Brightpath runs 140 fashion and home stores in malls and high streets.", "Brightpath Retail is a family-clothing chain opening twenty new stores this year."] },
  { id: "kestrel", name: "Kestrel Logistics", short: "Kestrel", color: "#1F4E9E", roles: ["warehouse", "delivery", "fleet"], about: ["Kestrel moves parcels for online sellers from 60 hubs.", "Kestrel Logistics runs fulfilment centres and last-mile delivery for e-commerce brands."] },
  { id: "meridian", name: "Meridian Finserv", short: "Meridian", color: "#5F3DC4", roles: ["bankRo", "collections", "accounts"], about: ["Meridian is a lending and deposits company with branches in 90 towns.", "Meridian Finserv gives small-business and two-wheeler loans across South and West India."] },
  { id: "anchorpoint", name: "Anchorpoint Tech Services", short: "Anchorpoint", color: "#0B7285", roles: ["techL1", "desktop", "qa"], about: ["Anchorpoint runs IT helpdesks for banks and manufacturers.", "Anchorpoint Tech Services looks after laptops, networks and apps for 40,000 users at client companies."] },
  { id: "saffron", name: "Saffron Table Foods", short: "Saffron", color: "#E8590C", roles: ["crew", "steward", "storeOps"], about: ["Saffron Table runs 80 quick-service biryani and dosa outlets.", "Saffron Table Foods operates restaurants in food courts, airports and high streets."] },
  { id: "lotus", name: "Lotus Diagnostics", short: "Lotus", color: "#C2255C", roles: ["labTech", "pharmacist", "csVoice"], about: ["Lotus runs diagnostic labs and home sample collection.", "Lotus Diagnostics has 70 collection centres and three reference labs."] },
  { id: "bluebay", name: "Bluebay Telecom Services", short: "Bluebay", color: "#1971C2", roles: ["csVoice", "fieldSales", "techL1"], about: ["Bluebay handles broadband and DTH customers for regional operators.", "Bluebay Telecom Services supports home broadband users, from new connections to repairs."] },
  { id: "everline", name: "Everline Insurance Brokers", short: "Everline", color: "#2B8A3E", roles: ["insurance", "csChat", "kyc"], about: ["Everline compares and sells health, motor and term insurance online and by phone.", "Everline Insurance Brokers works with 25 insurers and sells to families and small businesses."] },
  { id: "tandem", name: "Tandem Staffing", short: "Tandem", color: "#862E9C", roles: ["warehouse", "retailSales", "dataEntry", "assembly"], about: ["Tandem is a staffing company that hires onto its payroll for retail, warehousing and factory clients.", "Tandem Staffing places people with its client companies and pays salaries from its own payroll."] },
  { id: "crestline", name: "Crestline Software", short: "Crestline", color: "#364FC7", roles: ["devJr", "qa", "techL1"], about: ["Crestline builds lending and payments software for banks.", "Crestline Software is a product company of about 600 people building banking platforms."] },
  { id: "tidewater", name: "Tidewater Cargo", short: "Tidewater", color: "#087F5B", roles: ["warehouse", "fleet", "dataEntry"], about: ["Tidewater handles freight forwarding and bonded warehousing near ports and airports.", "Tidewater Cargo moves import and export shipments for manufacturers."] },
  { id: "monsoon", name: "Monsoon Hotels", short: "Monsoon", color: "#A61E4D", roles: ["frontOffice", "steward", "crew"], about: ["Monsoon runs 22 business and resort hotels.", "Monsoon Hotels operates mid-size business hotels near airports and tech parks."] },
  { id: "arcadia", name: "Arcadia Electronics", short: "Arcadia", color: "#F08C00", roles: ["retailSales", "cashier", "storeOps"], about: ["Arcadia sells phones, laptops and appliances from 200 stores.", "Arcadia Electronics is a consumer-electronics chain with large-format stores in every metro."] },
  { id: "pinecrest", name: "Pinecrest Pharma Distribution", short: "Pinecrest", color: "#2F9E44", roles: ["pharmacist", "warehouse", "accounts"], about: ["Pinecrest distributes medicines to 12,000 pharmacies and hospitals.", "Pinecrest Pharma Distribution runs cold-chain warehouses and a pharmacy network."] },
  { id: "quillon", name: "Quillon Data Services", short: "Quillon", color: "#495057", roles: ["dataEntry", "kyc", "csChat"], about: ["Quillon processes documents and data for lenders and marketplaces.", "Quillon Data Services runs back-office work for banks, insurers and online sellers."] },
  { id: "riverstone", name: "Riverstone Motors", short: "Riverstone", color: "#C92A2A", roles: ["fieldSales", "accounts", "csVoice"], about: ["Riverstone is a car and two-wheeler dealership group with 35 showrooms.", "Riverstone Motors sells and services cars and bikes across nine cities."] },
  { id: "sunfield", name: "Sunfield Microfinance", short: "Sunfield", color: "#E67700", roles: ["collections", "fieldSales", "bankRo"], about: ["Sunfield gives small loans to women-led households and shops.", "Sunfield Microfinance lends to small businesses in towns and city outskirts."] },
  { id: "vantage", name: "Vantage Learning", short: "Vantage", color: "#3B5BDB", roles: ["bdeEdu", "csChat", "dataEntry"], about: ["Vantage runs online degree and certificate programmes with partner universities.", "Vantage Learning is an online education company with 90,000 learners."] },
  { id: "zephyr", name: "Zephyr Travel Desk", short: "Zephyr", color: "#0C8599", roles: ["travel", "csVoice", "csInt"], about: ["Zephyr books holidays and business travel for families and companies.", "Zephyr Travel Desk sells domestic holidays and manages travel for 300 corporate clients."] },
  { id: "orbit", name: "Orbit Payments", short: "Orbit", color: "#5C7CFA", roles: ["kyc", "fieldSales", "techL1", "devJr"], about: ["Orbit makes payment devices and QR codes for shops.", "Orbit Payments serves 400,000 merchants with card machines and UPI."] },
  { id: "greenleaf", name: "Greenleaf Grocers", short: "Greenleaf", color: "#37B24D", roles: ["cashier", "retailSales", "delivery", "storeOps"], about: ["Greenleaf runs neighbourhood supermarkets and a 20-minute delivery app.", "Greenleaf Grocers has 110 supermarkets and dark stores."] },
  { id: "nimbus", name: "Nimbus Cloud Support", short: "Nimbus", color: "#1864AB", roles: ["techL1", "desktop", "csInt"], about: ["Nimbus supports software users at global SaaS companies.", "Nimbus Cloud Support runs 24x7 technical support for cloud software firms."] },
  { id: "copperline", name: "Copperline Components", short: "Copperline", color: "#A0522D", roles: ["assembly", "qc", "warehouse"], about: ["Copperline makes wiring harnesses and switches for carmakers.", "Copperline Components runs two plants making electrical parts for automobiles."] },
];

const CITY_WEIGHTS = [
  ["Hyderabad", 18], ["Bengaluru", 18], ["Pune", 14], ["Mumbai", 14], ["Chennai", 9], ["Delhi", 7],
  ["Noida", 4], ["Gurgaon", 4], ["Kolkata", 3], ["Ahmedabad", 3], ["Kochi", 2], ["Jaipur", 2], ["Coimbatore", 1], ["Indore", 1],
];

const LANG = {
  Hyderabad: "Telugu or Hindi", Bengaluru: "Kannada, Tamil or Hindi", Pune: "Marathi or Hindi", Mumbai: "Hindi or Marathi",
  Chennai: "Tamil", Delhi: "Hindi", Noida: "Hindi", Gurgaon: "Hindi", Kolkata: "Bengali or Hindi", Ahmedabad: "Gujarati or Hindi",
  Kochi: "Malayalam", Jaipur: "Hindi", Coimbatore: "Tamil", Indore: "Hindi",
};

const VENUES = {
  Hyderabad: [
    { area: "HITEC City", venue: "Ground floor, Orion Towers, Block B", landmark: "Next to HITEC City metro station, exit 2" },
    { area: "Madhapur", venue: "3rd floor, Skyline Business Centre", landmark: "Opposite Inorbit Mall service road" },
    { area: "Kondapur", venue: "Level 2, Parkside Plaza", landmark: "Behind the Botanical Garden bus stop" },
    { area: "Begumpet", venue: "1st floor, Greenlands Chambers", landmark: "Near Begumpet metro station" },
    { area: "Uppal", venue: "Training centre, Riverfront IT Park", landmark: "Two minutes from Uppal metro station" },
    { area: "Ameerpet", venue: "4th floor, Sai Krupa Complex", landmark: "Above the Ameerpet metro interchange" },
  ],
  Bengaluru: [
    { area: "Whitefield", venue: "Tower C, Lakeview Tech Park", landmark: "Near Kadugodi Tree Park metro station" },
    { area: "Koramangala", venue: "2nd floor, Forum Lane Offices", landmark: "Behind Sony World signal" },
    { area: "Electronic City", venue: "Phase 1, Unit 12, Nova Business Park", landmark: "Next to the Infosys gate 1 bus stop" },
    { area: "Marathahalli", venue: "5th floor, Ring Road Commercial", landmark: "Above the Marathahalli bridge" },
    { area: "Jayanagar", venue: "1st floor, 4th Block Complex", landmark: "Opposite Jayanagar shopping complex" },
    { area: "Hebbal", venue: "Block A, Northgate Tech Campus", landmark: "Near Hebbal flyover, service road" },
  ],
  Pune: [
    { area: "Hinjawadi", venue: "Phase 1, Building 4, Silverline Park", landmark: "Near Wipro circle" },
    { area: "Kharadi", venue: "Tower 2, Riverbend IT Park", landmark: "Opposite the Kharadi bypass" },
    { area: "Viman Nagar", venue: "3rd floor, Skybay Plaza", landmark: "Near Phoenix Marketcity" },
    { area: "Magarpatta", venue: "Cybercity, Tower 6", landmark: "Gate 3, Magarpatta City" },
    { area: "Shivajinagar", venue: "2nd floor, Deccan Corner", landmark: "Five minutes from Shivajinagar railway station" },
  ],
  Mumbai: [
    { area: "Andheri East", venue: "Unit 301, Chakala Business Centre", landmark: "Near Chakala metro station" },
    { area: "Powai", venue: "Level 4, Lakeside Towers", landmark: "Behind Hiranandani Galleria" },
    { area: "Lower Parel", venue: "7th floor, Mill Compound Offices", landmark: "Near Lower Parel station, west exit" },
    { area: "Thane", venue: "Wagle Estate, Plot 22, Crescent House", landmark: "Opposite the Wagle Estate bus depot" },
    { area: "Vashi", venue: "Sector 30A, Harbour Point", landmark: "Five minutes from Vashi station" },
    { area: "Malad West", venue: "2nd floor, Mindspace Link", landmark: "Near Inorbit Mall, Malad" },
  ],
  Chennai: [
    { area: "OMR, Thoraipakkam", venue: "Block B, Seaview Tech Park", landmark: "Near the Thoraipakkam signal" },
    { area: "Guindy", venue: "3rd floor, Estate Road Complex", landmark: "Two minutes from Guindy metro" },
    { area: "T Nagar", venue: "1st floor, Usman Road Chambers", landmark: "Near Panagal Park" },
    { area: "Ambattur", venue: "Industrial Estate, Unit 14", landmark: "Opposite the Ambattur OT bus stand" },
  ],
  Delhi: [
    { area: "Nehru Place", venue: "Office 610, Eros Corporate Tower", landmark: "Near Nehru Place metro, gate 1" },
    { area: "Rajouri Garden", venue: "2nd floor, J Block Market", landmark: "Opposite Rajouri Garden metro" },
    { area: "Okhla Phase 2", venue: "Plot 41, Okhla Industrial Area", landmark: "Near the Crown Plaza turn" },
  ],
  Noida: [
    { area: "Sector 62", venue: "Tower B, Sector 62 Tech Zone", landmark: "Near Noida Electronic City metro" },
    { area: "Sector 125", venue: "3rd floor, Expressway Plaza", landmark: "Opposite Amity University gate" },
  ],
  Gurgaon: [
    { area: "Cyber City", venue: "Building 9, DLF Cyber City", landmark: "Next to Cyber City rapid metro" },
    { area: "Udyog Vihar", venue: "Phase 4, Plot 211", landmark: "Near the Udyog Vihar bus stop" },
  ],
  Kolkata: [
    { area: "Salt Lake Sector V", venue: "Godrej Waterside, Tower 1", landmark: "Near College More" },
    { area: "Park Street", venue: "4th floor, Apeejay Court", landmark: "Near Park Street metro" },
  ],
  Ahmedabad: [
    { area: "SG Highway", venue: "8th floor, Titanium Square", landmark: "Near Thaltej cross roads" },
    { area: "Navrangpura", venue: "2nd floor, Commerce House", landmark: "Opposite Navrangpura bus stand" },
  ],
  Kochi: [
    { area: "Kakkanad", venue: "Infopark Phase 1, Athulya block", landmark: "Main gate, Infopark" },
    { area: "Edappally", venue: "1st floor, Lulu Link Road Complex", landmark: "Near Edappally metro" },
  ],
  Jaipur: [
    { area: "Malviya Nagar", venue: "3rd floor, Gaurav Tower", landmark: "Near World Trade Park" },
    { area: "Sitapura", venue: "RIICO Industrial Area, Plot 18", landmark: "Opposite the Sitapura fire station" },
  ],
  Coimbatore: [{ area: "Avinashi Road", venue: "2nd floor, Tidel Park", landmark: "Near the Hope College signal" }],
  Indore: [{ area: "Vijay Nagar", venue: "4th floor, Apollo Square", landmark: "Near C21 Mall" }],
};

const SHIFT_LINES = {
  desk: [
    "Day shift, six days a week, with a rotating weekly off.",
    "Fixed day shift, Monday to Saturday.",
    "Five-day week with alternate Saturdays off.",
    "Shifts are set a week ahead, so you can plan around classes.",
  ],
  support: [
    "Rotational shifts with two fixed days off each week.",
    "Night shift with cab drop for women after 9 pm.",
    "Rotational shifts, and cab pick-up and drop inside city limits.",
    "Fixed shift for the first three months, then rotational.",
  ],
  field: [
    "Field role in your own area. You start each day at the branch at 9:30 am.",
    "Most of the day is on the move, so a two-wheeler helps. Fuel is paid on actuals.",
    "Six days a week in the field, with a Sunday off.",
  ],
  floor: [
    "Store hours run 10 am to 10 pm in two shifts.",
    "Morning shift from 7 am, done by 4 pm.",
    "Weekends are working days, with a weekday off in their place.",
  ],
  plant: [
    "Three shifts, with company transport on all routes.",
    "General shift, 8 am to 5 pm, six days a week.",
    "Rotating shifts every two weeks. Canteen and transport are provided.",
  ],
};
const SHIFT_BY_TYPE = {
  "Customer support": "support", "Tech support and IT": "support", Sales: "field", "Banking and finance": "desk",
  "Retail and store": "floor", "Logistics and delivery": "plant", Healthcare: "floor", "Back office": "desk",
  Hospitality: "floor", Manufacturing: "plant",
};
const PERK_LINES = [
  "PF, ESI and medical insurance from day one.",
  "Joining within a week gets a ₹2,000 bonus after 60 days.",
  "Monthly incentives are paid on top of the fixed salary.",
  "Free meals on shift and a monthly attendance bonus.",
  "Paid training for the first two weeks.",
  "Salary is credited on the 1st, and incentives by the 10th.",
  "Two weeks of paid leave in the first year, plus festival holidays.",
  "Group health cover for you and your parents.",
];
const DAY_LINES = [
  (r, n) => `All rounds happen on the day: ${r}. Most people are done within ${n} hours.`,
  (r) => `Expect ${r}. Results for the first round are shared before you leave.`,
  (r, n, count) => `The interview day runs in ${["one", "two", "three", "four"][count - 1]} step${count > 1 ? "s" : ""} (${r}), usually in under ${n} hours.`,
  (r) => `Selection is in this order: ${r}. Offers are sent by email within three working days.`,
];
const LANG_LINES = [
  (l) => `Comfortable speaking English and ${l}.`,
  (l) => `You should be able to talk to customers in ${l} as well as English.`,
  (l) => `English plus ${l} is needed for this role.`,
];

function joinList(list) {
  if (list.length <= 1) return list.join("");
  return `${list.slice(0, -1).join(", ")} and ${list[list.length - 1]}`;
}

function expBands(min, max) {
  const out = [];
  if (min === 0) out.push("Fresher", "0–1 yr");
  if (max >= 1 && min <= 3) out.push("1–3 yrs");
  if (max >= 3 && min <= 5) out.push("3–5 yrs");
  if (max >= 5) out.push("5+ yrs");
  return out.length ? out : ["Fresher"];
}

function roundPhrase(name) {
  const full = /round|test|check|interview|screening/i.test(name) ? name : `${name} round`;
  return /^(Tally|Versant)/.test(full) ? `a ${full}` : `a ${full.replace(/^[A-Z](?=[a-z])/, (c) => c.toLowerCase())}`.replace(/^a (?=[aeiouAEIOU]|HR)/, "an ");
}

function describe(r, company, role, city, i) {
  const about = company.about[i % 2];
  const duty = role.duties[i % role.duties.length];
  const shifts = SHIFT_LINES[role.title.includes("Collections") || role.title.includes("Delivery") ? "field" : SHIFT_BY_TYPE[role.type] || "desk"];
  const shift = shifts[Math.floor(r() * shifts.length)];
  const perk = PERK_LINES[Math.floor(r() * PERK_LINES.length)];
  const lang = LANG_LINES[i % LANG_LINES.length](LANG[city] || "Hindi");
  const day = DAY_LINES[i % DAY_LINES.length](joinList(role.rounds.map(roundPhrase)), 2 + (i % 2), role.rounds.length);
  const shapes = [
    [about, duty, lang, shift, perk, day],
    [duty, about, shift, lang, perk, day],
    [about, duty, perk, shift, lang, day],
    [duty, lang, shift, about, perk, day],
  ];
  return shapes[i % shapes.length].join(" ");
}

function payFor(r, role, city) {
  const metro = ["Mumbai", "Bengaluru", "Gurgaon", "Delhi"].includes(city) ? 1.08 : ["Hyderabad", "Pune", "Chennai", "Noida"].includes(city) ? 1 : 0.9;
  const lo = Math.round((role.pay[0] * metro + (r() * 3 - 1)) * 2) / 2;
  const hi = Math.max(lo + 2, Math.round((role.pay[1] * metro + (r() * 4 - 1)) * 2) / 2);
  return { payMin: lo * 1000, payMax: hi * 1000 };
}

const FIRST = ["Aarav", "Ananya", "Rohan", "Sneha", "Vikram", "Priya", "Karthik", "Divya", "Imran", "Neha", "Arjun", "Pooja", "Siddharth", "Fatima", "Rahul", "Meera", "Nikhil", "Kavya", "Farhan", "Lakshmi", "Varun", "Shreya", "Aditya", "Zoya", "Manoj", "Asha", "Tarun", "Ritu", "Harsh", "Swathi"];
const LAST = ["Sharma", "Reddy", "Iyer", "Khan", "Patil", "Nair", "Gupta", "Das", "Menon", "Joshi", "Rao", "Singh", "Kulkarni", "Pillai", "Sheikh", "Verma", "Bose", "Shetty", "Yadav", "Mehta"];

function syntheticQueue(r, rounds, rooms, now, sizes) {
  const MIN = 60000;
  const { done, inRound, waiting } = sizes;
  const out = [];
  let n = 0;
  const person = (state, extra) => {
    n += 1;
    const name = `${pick(r, FIRST)} ${pick(r, LAST)}`;
    const token = `W-${String(n).padStart(3, "0")}`;
    out.push({
      id: token, token, name, phone: `9${String(Math.floor(r() * 1e9)).padStart(9, "0")}`, email: "", exp: "", expBand: pick(r, ["Fresher", "0–1 yr", "1–3 yrs"]),
      linkedin: "", resume: null, state, at: 0, pinged: true, calledAt: null, decidedAt: null, roundIdx: 0, roundAssigned: false,
      notes: {}, room: null, skipped: 0, checkedIn: true, synthetic: true, ...extra,
    });
  };
  const total = done + inRound + waiting;
  let t = now - (total * 4 + 10) * MIN;
  for (let i = 0; i < done; i++) {
    t += between(r, 2, 5) * MIN;
    const dur = between(r, 6, 13);
    const verdict = pick(r, ["selected", "rejected", "rejected", "onhold", "selected"]);
    person(verdict, { at: t, calledAt: t + 3 * MIN, decidedAt: t + (3 + dur) * MIN, roundIdx: rounds.length - 1, roundAssigned: true });
  }
  for (let i = 0; i < inRound; i++) {
    t += between(r, 2, 4) * MIN;
    const room = rooms[i % rooms.length];
    person("interviewing", { at: t, calledAt: now - between(r, 2, 8) * MIN, room: { ...room }, roundAssigned: true });
  }
  for (let i = 0; i < waiting; i++) {
    t = Math.min(now - 60000, t + between(r, 1, 3) * MIN);
    person("wait", { at: t, checkedIn: r() > 0.3 });
  }
  return out;
}

function dateOffsets(r) {
  // 30 today, 14 tomorrow, 26 later this week, 18 further out, 12 recently ended.
  const list = [
    ...Array(30).fill(0), ...Array(14).fill(1),
    ...Array.from({ length: 26 }, (_, i) => 2 + (i % 5)),
    ...Array.from({ length: 18 }, (_, i) => 7 + (i % 14)),
    ...Array.from({ length: 12 }, (_, i) => -1 - (i % 4)),
  ];
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

export function boardOrgs() {
  return COMPANIES.map((c) => ({
    id: `org_${c.id}`, name: c.name, short: c.short, kind: c.id === "tandem" ? "agency" : "captive", logo: "letter",
    color: c.color, wash: "#F6F5F1", email: `hiring@${c.id}.example`, plan: "company", board: true,
    clients: [], branches: [], members: [{ email: `hiring@${c.id}.example`, role: "recruiter", name: `${c.short} hiring` }],
  }));
}

const HOURS = [["09:00", "13:00"], ["09:30", "16:00"], ["10:00", "17:00"], ["10:00", "14:00"], ["10:30", "18:00"], ["11:00", "16:30"], ["09:00", "17:30"], ["08:30", "12:30"]];

/** A hundred public walk-ins. `now` places today’s hours so some are always live. */
export function seedBoardDrives(now = Date.now()) {
  const r = rng(20260929);
  const cities = CITY_WEIGHTS.flatMap(([c, n]) => Array(n).fill(c));
  for (let i = cities.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [cities[i], cities[j]] = [cities[j], cities[i]];
  }
  const offsets = dateOffsets(r);
  let todayIdx = 0;
  return cities.map((city, i) => {
    const company = COMPANIES[(i * 7 + Math.floor(i / 24)) % COMPANIES.length];
    const role = ROLES[company.roles[(i + Math.floor(i / COMPANIES.length)) % company.roles.length]];
    const venues = VENUES[city];
    const place = venues[(i + company.id.length) % venues.length];
    const { payMin, payMax } = payFor(r, role, city);
    const expMin = role.exp[0];
    const expMax = Math.max(expMin, role.exp[1] + (r() > 0.7 ? 1 : 0));
    const docs = role.docs.map((d) => DOC[d]).concat(r() > 0.75 ? [DOC.pen] : []);
    const rounds = role.rounds.map((name, k) => ({ id: `r${k + 1}`, name }));
    const letters = ["A", "B", "C", "D"];
    const roomCount = Math.min(4, rounds.length + 1);
    // The first round sees everyone, so it gets the extra room.
    const roundOf = (k) => rounds[Math.max(0, Math.min(k - (roomCount > rounds.length ? 1 : 0), rounds.length - 1))].id;
    const rooms = Array.from({ length: roomCount }, (_, k) => ({ id: `rm${k + 1}`, name: `Room ${letters[k]}`, interviewer: pick(r, FIRST), roundId: roundOf(k) }));
    const off = offsets[i];
    let when;
    if (off === 0) {
      const live = todayIdx < 18;
      when = live
        ? windowAround(now, -between(r, 2, 9) * 30, between(r, 12, 18) * 30)
        : windowAround(now, between(r, 2, 9) * 30, between(r, 8, 14) * 30);
      todayIdx += 1;
    } else {
      const [startTime, endTime] = HOURS[Math.floor(r() * HOURS.length)];
      const span = r() > 0.85 ? between(r, 1, 2) : 0;
      when = { date: istDate(off, now), endDate: istDate(off + span, now), startTime, endTime };
    }
    const sizes = { done: between(r, 2, 14), inRound: Math.min(roomCount, between(r, 1, 3)), waiting: between(r, 3, 28) };
    const queueSeed = Math.floor(r() * 1e9);
    const liveNow = driveStatus({ role: role.title, ...when }, now) === "live";
    const candidates = liveNow ? syntheticQueue(rng(queueSeed), rounds, rooms, now, sizes) : [];
    const id = `d_board_${String(i + 1).padStart(3, "0")}`;
    return {
      id, orgId: `org_${company.id}`, host: `HOST-B${String(i + 1).padStart(3, "0")}X`, gate: `GATE-B${String(i + 1).padStart(3, "0")}X`, desk: "",
      visibility: "public", board: true,
      city, area: place.area, venue: place.venue, landmark: place.landmark, branch: place.area,
      ...when,
      company: company.name, role: role.title, roleType: role.type,
      payMin, payMax, expMin, expMax, expNeeded: expBands(expMin, expMax),
      openings: between(r, 2, 30) * 5,
      jd: describe(r, company, role, city, i),
      docs, rounds, rooms,
      brand: { name: company.short, color: company.color, logo: "letter" },
      clientId: "", clientName: "", branchId: "",
      candidates, msgs: [], seq: candidates.length,
    };
  });
}
