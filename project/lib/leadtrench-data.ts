export interface LeadRecord {
  id: string
  company: string
  industry: string
  location: string
  phone: string | null
  website: string | null
  score: number
  tier: 'hot' | 'warm' | 'watch'
  status: 'open' | 'closed' | 'unknown'
  verified: boolean
  saved: boolean
  signalText: string
  signalDate: string | null
  executives: Executive[]
  snapshot: {
    employees: string
    founded: string
    revenue: string
    website: string
  }
  bottleneck: string
  opportunity: string
  outreachGuidance: { channel: string; advice: string }[]
  outreachMessage: string
}

export interface Executive {
  name: string
  title: string
  email: string | null
  phone: string | null
  verified: boolean
}

export interface SearchHistoryEntry {
  id: string
  query: string
  location: string
  industry: string
  resultCount: number
  searchedAt: string
}

export interface DashboardMetrics {
  conversionRate: number
  pipelineValue: number
  activeSequences: number
  tokensRemaining: number
  tokensTotal: number
  leadsToday: number
  leadsTotal: number
  hotLeads: number
}

export const mockMetrics: DashboardMetrics = {
  conversionRate: 14.2,
  pipelineValue: 2840000,
  activeSequences: 8,
  tokensRemaining: 187,
  tokensTotal: 200,
  leadsToday: 23,
  leadsTotal: 1247,
  hotLeads: 34,
}

export const mockLeads: LeadRecord[] = [
  {
    id: 'lead-001',
    company: 'Brightline Dental Group',
    industry: 'Healthcare',
    location: 'Austin, TX',
    phone: '(512) 555-0142',
    website: 'brightlinedental.com',
    score: 92,
    tier: 'hot',
    status: 'open',
    verified: true,
    saved: true,
    signalText: 'Recently expanded to 3 locations, hiring front office staff',
    signalDate: '2026-09-28',
    executives: [
      { name: 'Sarah Chen', title: 'CEO & Founder', email: 'sarah@brightlinedental.com', phone: '(512) 555-0143', verified: true },
      { name: 'Marcus Webb', title: 'COO', email: 'marcus@brightlinedental.com', phone: null, verified: true },
    ],
    snapshot: { employees: '45-50', founded: '2018', revenue: '$4.2M', website: 'brightlinedental.com' },
    bottleneck: 'No online booking system detected. Patients report long hold times for appointments.',
    opportunity: 'Deploy a scheduling automation layer and intake form optimization to reduce front-office overhead.',
    outreachGuidance: [
      { channel: 'Phone', advice: 'Call during morning hours before patient rush; ask for the office manager.' },
      { channel: 'Email', advice: 'Reference their recent expansion and offer a custom intake automation demo.' },
    ],
    outreachMessage: 'Hi Sarah,\n\nI noticed Brightline Dental recently expanded to three locations — congratulations on the growth. I work with multi-location dental practices on front-office automation, and I noticed you don\'t have an online booking system yet.\n\nWould you be open to a quick 15-minute call this week to see how we could reduce your appointment scheduling overhead by up to 40%?\n\nBest regards,\nThe LeadTrench Team',
  },
  {
    id: 'lead-002',
    company: 'Vertex Construction Services',
    industry: 'Construction',
    location: 'Denver, CO',
    phone: '(303) 555-0178',
    website: 'vertexconstruction.co',
    score: 84,
    tier: 'hot',
    status: 'open',
    verified: true,
    saved: false,
    signalText: 'Won $2.1M municipal contract, adding field supervisors',
    signalDate: '2026-09-30',
    executives: [
      { name: 'James Morrison', title: 'President', email: 'james@vertexconstruction.co', phone: '(303) 555-0179', verified: true },
      { name: 'Patricia Diaz', title: 'VP Operations', email: null, phone: null, verified: false },
    ],
    snapshot: { employees: '120-150', founded: '2011', revenue: '$18M', website: 'vertexconstruction.co' },
    bottleneck: 'Project management is spreadsheet-based; no dedicated field reporting tool detected.',
    opportunity: 'Introduce a construction-specific project tracking platform with mobile field reporting.',
    outreachGuidance: [
      { channel: 'Phone', advice: 'Ask for James Morrison directly; mention the municipal contract win.' },
      { channel: 'Email', advice: 'Attach a one-pager on field reporting ROI for mid-size contractors.' },
    ],
    outreachMessage: 'Hi James,\n\nCongratulations on the recent $2.1M municipal contract — that\'s a significant win for Vertex. I noticed your team is adding field supervisors, which often creates reporting bottlenecks when project management still runs on spreadsheets.\n\nWe help construction firms of your size implement mobile field reporting that cuts admin time by 30%. Would a brief call next week work?\n\nBest,\nThe LeadTrench Team',
  },
  {
    id: 'lead-003',
    company: 'Lumen Marketing Agency',
    industry: 'Marketing & Advertising',
    location: 'Brooklyn, NY',
    phone: '(718) 555-0199',
    website: 'lumenagency.nyc',
    score: 76,
    tier: 'warm',
    status: 'open',
    verified: true,
    saved: false,
    signalText: 'Posted 4 new job openings for content strategists',
    signalDate: '2026-10-01',
    executives: [
      { name: 'Aisha Roberts', title: 'Founder & Creative Director', email: 'aisha@lumenagency.nyc', phone: '(718) 555-0200', verified: true },
      { name: 'Tom Nakamura', title: 'Head of Strategy', email: 'tom@lumenagency.nyc', phone: null, verified: false },
    ],
    snapshot: { employees: '20-25', founded: '2019', revenue: '$2.8M', website: 'lumenagency.nyc' },
    bottleneck: 'Website lacks case studies section; no visible client portfolio beyond 3 logos.',
    opportunity: 'Offer a portfolio-building content package and case study automation to strengthen their pitch.',
    outreachGuidance: [
      { channel: 'Email', advice: 'Reference their hiring spree and offer a complimentary content audit.' },
      { channel: 'LinkedIn', advice: 'Connect with Aisha on LinkedIn first, then follow up with value-driven DM.' },
    ],
    outreachMessage: 'Hi Aisha,\n\nI saw Lumen is hiring four new content strategists — rapid growth is exciting but it often strains your existing content pipeline. We help agencies like Lumen automate case study production and client reporting.\n\nWould you be interested in a quick audit of your content workflow? I can share some actionable insights in 15 minutes.\n\nBest,\nThe LeadTrench Team',
  },
  {
    id: 'lead-004',
    company: 'Summit Fitness Collective',
    industry: 'Fitness',
    location: 'Portland, OR',
    phone: '(503) 555-0166',
    website: 'summitfitnesspdx.com',
    score: 68,
    tier: 'warm',
    status: 'open',
    verified: false,
    saved: false,
    signalText: 'Newly opened second location in Pearl District',
    signalDate: '2026-09-25',
    executives: [
      { name: 'Derek Foster', title: 'Owner', email: 'derek@summitfitnesspdx.com', phone: null, verified: false },
    ],
    snapshot: { employees: '15-20', founded: '2020', revenue: '$1.2M', website: 'summitfitnesspdx.com' },
    bottleneck: 'No member management software visible; scheduling appears manual via Instagram DMs.',
    opportunity: 'Provide an all-in-one gym management platform with class scheduling and automated reminders.',
    outreachGuidance: [
      { channel: 'In-Person', advice: 'Visit the Pearl District location during off-peak hours.' },
      { channel: 'Email', advice: 'Offer a free 30-day trial of the management platform.' },
    ],
    outreachMessage: 'Hi Derek,\n\nCongrats on the new Pearl District location! Growing to two locations usually means member management gets complicated fast. We help boutique gyms streamline class scheduling, automated reminders, and member retention.\n\nI\'d love to show you a quick demo — can we set up 15 minutes this week?\n\nBest,\nThe LeadTrench Team',
  },
  {
    id: 'lead-005',
    company: 'Hartwell Law Partners',
    industry: 'Legal Services',
    location: 'Chicago, IL',
    phone: '(312) 555-0123',
    website: 'hartwelllaw.com',
    score: 81,
    tier: 'hot',
    status: 'closed',
    verified: true,
    saved: true,
    signalText: 'Merged with boutique IP firm, expanding corporate practice',
    signalDate: '2026-09-29',
    executives: [
      { name: 'Eleanor Hartwell', title: 'Managing Partner', email: 'e.hartwell@hartwelllaw.com', phone: '(312) 555-0124', verified: true },
      { name: 'Victor Park', title: 'Partner, IP Practice', email: 'v.park@hartwelllaw.com', phone: null, verified: true },
    ],
    snapshot: { employees: '60-80', founded: '2005', revenue: '$12M', website: 'hartwelllaw.com' },
    bottleneck: 'Client intake still relies on PDF forms; no visible CRM or matter management system.',
    opportunity: 'Deploy a legal-specific intake automation and matter tracking solution post-merger.',
    outreachGuidance: [
      { channel: 'Phone', advice: 'Call the main line and ask for Eleanor Hartwell\'s assistant.' },
      { channel: 'Email', advice: 'Mention the IP merger and how it creates an opportunity to unify intake.' },
    ],
    outreachMessage: 'Dear Ms. Hartwell,\n\nI noticed Hartwell Law recently merged with a boutique IP firm — combining practices often surfaces intake and matter management gaps. We help law firms implement automated client intake and unified matter tracking.\n\nWould you be available for a brief conversation about streamlining your post-merger operations?\n\nRespectfully,\nThe LeadTrench Team',
  },
  {
    id: 'lead-006',
    company: 'Cedar & Sage Wellness Spa',
    industry: 'Beauty & Wellness',
    location: 'Seattle, WA',
    phone: '(206) 555-0188',
    website: 'cedarandsagespa.com',
    score: 55,
    tier: 'watch',
    status: 'open',
    verified: false,
    saved: false,
    signalText: 'Instagram follower growth spike, expanding service menu',
    signalDate: '2026-10-02',
    executives: [
      { name: 'Mia Thompson', title: 'Owner', email: null, phone: '(206) 555-0189', verified: false },
    ],
    snapshot: { employees: '8-12', founded: '2022', revenue: '$650K', website: 'cedarandsagespa.com' },
    bottleneck: 'Booking is entirely through Instagram; no online scheduling or payment system.',
    opportunity: 'Introduce an online booking platform with automated deposits and service menu management.',
    outreachGuidance: [
      { channel: 'Instagram DM', advice: 'DM Mia with a compliment on the new services and a soft offer.' },
      { channel: 'Phone', advice: 'Call mid-morning when spa traffic is typically low.' },
    ],
    outreachMessage: 'Hi Mia!\n\nYour Instagram growth has been amazing to watch, and the expanded service menu looks great. I noticed booking still goes through DMs — we help spas like Cedar & Sage set up online booking with automatic deposits.\n\nWould you like to see how it works? Happy to do a quick screen share anytime.\n\nWarmly,\nThe LeadTrench Team',
  },
  {
    id: 'lead-007',
    company: 'Ironclad Auto Repair',
    industry: 'Automotive',
    location: 'Phoenix, AZ',
    phone: '(602) 555-0155',
    website: 'ironcladautoaz.com',
    score: 63,
    tier: 'watch',
    status: 'open',
    verified: false,
    saved: false,
    signalText: 'Added EV repair certification, hiring EV technicians',
    signalDate: '2026-09-27',
    executives: [
      { name: 'Robert Gaines', title: 'Owner', email: 'rob@ironcladautoaz.com', phone: null, verified: false },
    ],
    snapshot: { employees: '12-15', founded: '2016', revenue: '$1.8M', website: 'ironcladautoaz.com' },
    bottleneck: 'No online appointment system; customer reviews mention long wait times for quotes.',
    opportunity: 'Offer a digital quote and appointment system tailored for auto repair shops.',
    outreachGuidance: [
      { channel: 'Phone', advice: 'Call during lunch hour when shop traffic dips.' },
      { channel: 'Email', advice: 'Mention the EV certification as a growth signal and offer a demo.' },
    ],
    outreachMessage: 'Hi Rob,\n\nSaw that Ironclad just added EV repair certification — smart move with the market shift. I noticed your online reviews mention wait times for quotes, which is common when shops grow. We help auto repair shops digitize quoting and appointments.\n\nWant a quick 10-minute demo this week?\n\nBest,\nThe LeadTrench Team',
  },
  {
    id: 'lead-008',
    company: 'Northstar Property Group',
    industry: 'Real Estate',
    location: 'Miami, FL',
    phone: '(305) 555-0177',
    website: 'northstarpropmiami.com',
    score: 79,
    tier: 'warm',
    status: 'open',
    verified: true,
    saved: false,
    signalText: 'Acquired 12 new rental properties, expanding management portfolio',
    signalDate: '2026-09-30',
    executives: [
      { name: 'Carlos Mendez', title: 'Broker & Founder', email: 'carlos@northstarpropmiami.com', phone: '(305) 555-0178', verified: true },
      { name: 'Lisa Chang', title: 'Director of Property Management', email: 'lisa@northstarpropmiami.com', phone: null, verified: false },
    ],
    snapshot: { employees: '30-40', founded: '2014', revenue: '$6.5M', website: 'northstarpropmiami.com' },
    bottleneck: 'Tenant communication scattered across email, text, and phone; no unified portal.',
    opportunity: 'Deploy a tenant management portal with maintenance requests and rent collection automation.',
    outreachGuidance: [
      { channel: 'Phone', advice: 'Ask for Lisa Chang, who likely manages day-to-day operations.' },
      { channel: 'Email', advice: 'Reference the 12 new acquisitions and the management strain it creates.' },
    ],
    outreachMessage: 'Hi Carlos,\n\nAcquiring 12 new rental properties is a strong move. That kind of portfolio growth usually strains tenant communication — we help property groups implement unified tenant portals with automated rent collection and maintenance requests.\n\nCan we set up a quick call to walk you through it?\n\nBest,\nThe LeadTrench Team',
  },
]

export const mockSearchHistory: SearchHistoryEntry[] = [
  { id: 'hist-001', query: 'Dental practices', location: 'Austin, TX', industry: 'Healthcare', resultCount: 47, searchedAt: '2026-10-02T14:30:00Z' },
  { id: 'hist-002', query: 'Construction companies', location: 'Denver, CO', industry: 'Construction', resultCount: 32, searchedAt: '2026-10-01T09:15:00Z' },
  { id: 'hist-003', query: 'Marketing agencies', location: 'Brooklyn, NY', industry: 'Marketing & Advertising', resultCount: 58, searchedAt: '2026-09-30T16:45:00Z' },
  { id: 'hist-004', query: 'Law firms', location: 'Chicago, IL', industry: 'Legal Services', resultCount: 24, searchedAt: '2026-09-29T11:20:00Z' },
  { id: 'hist-005', query: 'Real estate brokers', location: 'Miami, FL', industry: 'Real Estate', resultCount: 41, searchedAt: '2026-09-28T13:00:00Z' },
]

export const pipelineChartData = [
  { day: 'Mon', leads: 12, converted: 3 },
  { day: 'Tue', leads: 18, converted: 5 },
  { day: 'Wed', leads: 15, converted: 4 },
  { day: 'Thu', leads: 22, converted: 7 },
  { day: 'Fri', leads: 28, converted: 9 },
  { day: 'Sat', leads: 14, converted: 3 },
  { day: 'Sun', leads: 9, converted: 2 },
]

export const industryStreams = [
  'Healthcare', 'Construction', 'Marketing & Advertising', 'Legal Services',
  'Real Estate', 'Automotive', 'Beauty & Wellness', 'Fitness',
  'Technology', 'Finance', 'Education', 'Retail',
  'Hospitality', 'Food & Beverage', 'Insurance', 'Manufacturing',
  'Logistics', 'Architecture', 'Accounting', 'Consulting',
]

export const metroMarkets = [
  'Austin, TX', 'Denver, CO', 'Brooklyn, NY', 'Chicago, IL',
  'Miami, FL', 'Portland, OR', 'Seattle, WA', 'Phoenix, AZ',
  'Atlanta, GA', 'Nashville, TN', 'San Diego, CA', 'Boston, MA',
]
