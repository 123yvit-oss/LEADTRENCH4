export interface OpportunityAssessment {
  score: number
  tier: 'hot' | 'warm' | 'watch'
  bottleneck: string
  opportunity: string
  factors: { label: string; weight: number; score: number }[]
}

export function assessOpportunity(
  industry: string,
  signalCount: number,
  hasWebsite: boolean,
  hasVerifiedContacts: boolean,
  companySize: 'small' | 'mid' | 'large',
): OpportunityAssessment {
  const factors: { label: string; weight: number; score: number }[] = []

  const signalScore = Math.min(signalCount * 18, 40)
  factors.push({ label: 'Signal Strength', weight: 40, score: signalScore })

  const contactScore = hasVerifiedContacts ? 25 : hasWebsite ? 15 : 5
  factors.push({ label: 'Contact Verification', weight: 25, score: contactScore })

  const sizeScore = companySize === 'mid' ? 20 : companySize === 'small' ? 15 : 10
  factors.push({ label: 'Company Fit', weight: 20, score: sizeScore })

  const industryScore = ['Healthcare', 'Construction', 'Legal Services', 'Real Estate'].includes(industry) ? 15 : 8
  factors.push({ label: 'Industry Priority', weight: 15, score: industryScore })

  const total = factors.reduce((sum, f) => sum + f.score, 0)
  const tier: 'hot' | 'warm' | 'watch' = total >= 80 ? 'hot' : total >= 60 ? 'warm' : 'watch'

  const bottlenecks: Record<string, string> = {
    Healthcare: 'No online booking system detected. Patients report long hold times.',
    Construction: 'Project management is spreadsheet-based; no dedicated field reporting tool.',
    'Marketing & Advertising': 'Website lacks case studies; no visible client portfolio.',
    'Legal Services': 'Client intake relies on PDF forms; no visible CRM.',
    'Real Estate': 'Tenant communication scattered across channels; no unified portal.',
    Automotive: 'No online appointment system; reviews mention long quote wait times.',
    'Beauty & Wellness': 'Booking through social media DMs; no online scheduling.',
    Fitness: 'No member management software; scheduling appears manual.',
  }

  const opportunities: Record<string, string> = {
    Healthcare: 'Deploy scheduling automation and intake form optimization.',
    Construction: 'Introduce construction-specific project tracking with mobile field reporting.',
    'Marketing & Advertising': 'Offer a portfolio-building content package and case study automation.',
    'Legal Services': 'Deploy legal-specific intake automation and matter tracking.',
    'Real Estate': 'Deploy a tenant management portal with automated rent collection.',
    Automotive: 'Offer a digital quote and appointment system for auto repair.',
    'Beauty & Wellness': 'Introduce an online booking platform with automated deposits.',
    Fitness: 'Provide an all-in-one gym management platform with class scheduling.',
  }

  return {
    score: total,
    tier,
    bottleneck: bottlenecks[industry] ?? 'Manual processes detected with no automation layer.',
    opportunity: opportunities[industry] ?? 'Introduce a tailored automation solution.',
    factors,
  }
}
