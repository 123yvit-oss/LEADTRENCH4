'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import {
  Activity, ArrowRight, ArrowUpRight, BarChart3, Bell, Building2, Check,
  ChevronDown, ChevronRight, Copy, Crosshair, Download, Filter,
  History, LayoutDashboard, Mail, MapPin, Menu, MoreHorizontal, Search,
  Settings, ShieldCheck, Target, UsersRound, Volume2, X, Zap,
} from 'lucide-react'
import {
  mockMetrics, mockLeads, mockSearchHistory, pipelineChartData,
  industryStreams, metroMarkets, type LeadRecord,
} from '@/lib/leadtrench-data'
import {
  useVoiceSynthesis, buildDossierSummary, buildWelcomeMessage,
} from '@/lib/voice-synthesis'
import { UniversalTransmissionModal } from '@/components/universal-transmission-modal'
import { AdminUserManagement } from '@/components/admin-user-management'

const navItems = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'Pipeline', icon: Crosshair },
  { label: 'Saved leads', icon: Target },
  { label: 'Search History', icon: History },
]

function getInitials(name: string): string {
  return name.split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase()
}

function getMarkColor(tier: string): string {
  if (tier === 'hot') return 'cyan'
  if (tier === 'warm') return 'violet'
  return 'blue'
}

function PipelineChart({ data }: { data: typeof pipelineChartData }) {
  const maxLeads = Math.max(...data.map((d) => d.leads), 1)
  const chartHeight = 140
  const barWidth = 100 / data.length
  const gap = barWidth * 0.25
  const barInnerWidth = barWidth - gap

  return (
    <svg viewBox="0 0 100 60" preserveAspectRatio="none" className="w-full" style={{ height: chartHeight }}>
      <defs>
        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#00f0ff" stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id="convertedGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#62d4a5" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#62d4a5" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      {[0, 25, 50, 75, 100].map((y) => (
        <line key={y} x1="0" y1={y * 0.55} x2="100" y2={y * 0.55} stroke="#18212e" strokeWidth="0.15" />
      ))}
      {data.map((d, i) => {
        const x = i * barWidth + gap / 2
        const leadHeight = (d.leads / maxLeads) * 48
        const convertedHeight = (d.converted / maxLeads) * 48
        return (
          <g key={d.day}>
            <rect
              x={x} y={54 - leadHeight} width={barInnerWidth} height={leadHeight}
              fill="url(#barGradient)" rx="0.5"
            />
            <rect
              x={x + barInnerWidth * 0.35} y={54 - convertedHeight}
              width={barInnerWidth * 0.3} height={convertedHeight}
              fill="url(#convertedGradient)" rx="0.3"
            />
            <text x={x + barInnerWidth / 2} y={58.5} fontSize="2.2" fill="#778394" textAnchor="middle">
              {d.day}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

function Sparkline({ color }: { color: string }) {
  return (
    <span className={`sparkline sparkline-${color}`}>
      {[...Array(8)].map((_, i) => <i key={i} />)}
    </span>
  )
}

function StatusBadge({ tier }: { tier: 'hot' | 'warm' | 'watch' }) {
  const label = tier === 'hot' ? 'HOT' : tier === 'warm' ? 'WARM' : 'TO WATCH'
  return (
    <span className={`opportunity-status-badge status-glow status-glow-${tier}`}>
      <span className="status-glow-mark" aria-hidden="true" />
      {label}
    </span>
  )
}

function DossierDrawer({
  lead, onClose, onPlayDossier, isPlayingDossier,
}: {
  lead: LeadRecord
  onClose: () => void
  onPlayDossier: () => void
  isPlayingDossier: boolean
}) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const markColor = getMarkColor(lead.tier)

  return (
    <div className="drawer-layer">
      <button className="drawer-scrim" type="button" aria-label="Close dossier" onClick={onClose} />
      <section className="dossier-drawer" role="dialog" aria-modal="true" aria-labelledby="dossier-title">
        <div className="drawer-topline">
          <span><span className="live-dot" /> EXECUTIVE DOSSIER</span>
          <button className="icon-button" type="button" aria-label="Close dossier" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="drawer-scroll">
          <div className="dossier-company">
            <div style={{ display: 'flex', alignItems: 'center', gap: '13px' }}>
              <span className={`company-mark dossier-mark mark-${markColor}`}>
                {getInitials(lead.company)}
              </span>
              <div>
                <h2 id="dossier-title">{lead.company}</h2>
                <div className="dossier-location">
                  <MapPin size={12} /> {lead.location}
                  <span className="location-divider" />
                  {lead.industry}
                  <span className="location-divider" />
                  {lead.status === 'open' ? 'OPEN NOW' : lead.status === 'closed' ? 'CLOSED' : 'HOURS UNAVAILABLE'}
                </div>
              </div>
            </div>

            <div className="dossier-score-card">
              <div className={`score-ring tier-ring-${lead.tier}`}>
                <span>{lead.score}</span>
                <small>/ 100</small>
              </div>
              <div>
                <div className="score-label"><StatusBadge tier={lead.tier} /></div>
                <strong>{lead.signalText}</strong>
                {lead.signalDate && <small>Signal detected {lead.signalDate}</small>}
              </div>
            </div>
          </div>

          <div className="dossier-block">
            <div className="dossier-section-head">
              <span>01</span><h3>Executive contacts</h3>
            </div>
            <div className="executive-list">
              {lead.executives.map((exec) => (
                <div key={exec.name} className="executive-card">
                  <div className="executive-avatar">{getInitials(exec.name)}</div>
                  <div className="executive-copy">
                    <strong>{exec.name}</strong>
                    <span>{exec.title}</span>
                    {exec.email && (
                      <button className="contact-route-button" type="button">
                        <Mail size={11} /> {exec.email}
                      </button>
                    )}
                  </div>
                  {exec.verified && (
                    <span className="verified-badge"><ShieldCheck size={11} /> VERIFIED</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="dossier-block">
            <div className="dossier-section-head">
              <span>02</span><h3>Business snapshot</h3>
            </div>
            <div className="snapshot-grid">
              <div><span>EMPLOYEES</span><strong>{lead.snapshot.employees}</strong></div>
              <div><span>FOUNDED</span><strong>{lead.snapshot.founded}</strong></div>
              <div><span>REVENUE</span><strong>{lead.snapshot.revenue}</strong></div>
              <div><span>WEBSITE</span><a className="website-link" href={`https://${lead.snapshot.website}`} target="_blank" rel="noopener noreferrer">{lead.snapshot.website}</a></div>
            </div>
          </div>

          <div className="dossier-block">
            <div className="dossier-section-head">
              <span>03</span><h3>Bottleneck &amp; opportunity</h3>
            </div>
            <div className="bottleneck-block">
              <p>{lead.bottleneck}</p>
            </div>
            <div className="opportunity-block" style={{ marginTop: '10px' }}>
              <p>{lead.opportunity}</p>
            </div>
          </div>

          <div className="dossier-block">
            <div className="dossier-section-head">
              <span>04</span><h3>Outreach guidance</h3>
            </div>
            <div className="outreach-guidance">
              {lead.outreachGuidance.map((g) => (
                <div key={g.channel}>
                  <span>{g.channel.toUpperCase()}</span>
                  <p>{g.advice}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="outreach-block">
            <div className="outreach-title">
              <div className="outreach-icon"><Mail size={16} /></div>
              <div>
                <strong>Generated outreach message</strong>
                <small>Personalized for this lead</small>
              </div>
            </div>
            <div className="outreach-message">{lead.outreachMessage}</div>
            <button
              className="copy-button"
              type="button"
              onClick={() => navigator.clipboard?.writeText(lead.outreachMessage)}
            >
              <Copy size={14} /> Copy message
            </button>
          </div>
        </div>

        <div className="drawer-footer">
          <button
            className="primary-button drawer-print-button"
            type="button"
            onClick={onPlayDossier}
            disabled={isPlayingDossier}
          >
            {isPlayingDossier ? (
              <><Volume2 size={15} /> PLAYING DOSSIER AUDIO…</>
            ) : (
              <><Volume2 size={15} /> PLAY DOSSIER AUDIO</>
            )}
          </button>
          <button className="drawer-save-button" type="button">
            <Download size={15} /> Download / Print report
          </button>
        </div>
      </section>
    </div>
  )
}

export default function LeadtrenchDashboard() {
  const [activeNav, setActiveNav] = useState('Overview')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [selectedLead, setSelectedLead] = useState<LeadRecord | null>(null)
  const [savedLeadIds, setSavedLeadIds] = useState<Set<string>>(new Set(mockLeads.filter((l) => l.saved).map((l) => l.id)))
  const [searchQuery, setSearchQuery] = useState('')
  const [searchIndustry, setSearchIndustry] = useState('All industries')
  const [searchMetro, setSearchMetro] = useState('All metros')
  const [toast, setToast] = useState('')
  const [adminOpen, setAdminOpen] = useState(false)
  const [greetingPlayed, setGreetingPlayed] = useState(false)

  const voice = useVoiceSynthesis()

  const playWelcomeGreeting = useCallback(() => {
    if (greetingPlayed) return
    voice.speak(buildWelcomeMessage(), {
      onEnd: () => setGreetingPlayed(true),
    })
    setGreetingPlayed(true)
  }, [voice, greetingPlayed])

  useEffect(() => {
    if (voice.isReady && !greetingPlayed) {
      const timer = setTimeout(playWelcomeGreeting, 600)
      return () => clearTimeout(timer)
    }
  }, [voice.isReady, greetingPlayed, playWelcomeGreeting])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(''), 3000)
    return () => clearTimeout(t)
  }, [toast])

  useEffect(() => {
    if (!selectedLead && !adminOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedLead(null)
        setAdminOpen(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selectedLead, adminOpen])

  const visibleLeads = useMemo(() => {
    let filtered = mockLeads
    if (activeNav === 'Saved leads') {
      filtered = filtered.filter((l) => savedLeadIds.has(l.id))
    }
    if (searchIndustry !== 'All industries') {
      filtered = filtered.filter((l) => l.industry === searchIndustry)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter((l) =>
        l.company.toLowerCase().includes(q) ||
        l.industry.toLowerCase().includes(q) ||
        l.location.toLowerCase().includes(q) ||
        l.signalText.toLowerCase().includes(q),
      )
    }
    return filtered
  }, [activeNav, savedLeadIds, searchIndustry, searchQuery])

  function toggleSaved(id: string) {
    setSavedLeadIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function playDossier(lead: LeadRecord) {
    voice.speak(buildDossierSummary(lead))
    setToast('Playing dossier audio…')
  }

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <main className="dashboard-shell">
      <div className="background-mesh" aria-hidden="true" />

      {mobileNavOpen && (
        <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)} />
      )}

      <aside className={`sidebar ${mobileNavOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-top">
          <a className="brand-lockup sidebar-brand" href="#overview" onClick={() => { setActiveNav('Overview'); setMobileNavOpen(false) }}>
            <span className="brand-symbol"><Crosshair size={19} strokeWidth={1.7} /></span>
            <span>LEAD<span className="accent-text">TRENCH</span></span>
          </a>
          <div className="workspace-pill">
            <span className="workspace-avatar">C</span>
            <span className="workspace-name">Codey&apos;s workspace</span>
          </div>
          <div className="nav-label">WORKSPACE</div>
          <nav className="side-nav" aria-label="Main navigation">
            {navItems.map(({ label, icon: Icon }) => (
              <button
                key={label}
                className={`nav-item ${activeNav === label ? 'selected' : ''}`}
                onClick={() => { setActiveNav(label); setMobileNavOpen(false) }}
              >
                <Icon size={17} />
                <span>{label}</span>
                {label === 'Saved leads' && (
                  <span className="nav-count">{savedLeadIds.size}</span>
                )}
                {label === 'Pipeline' && (
                  <span className="nav-count">{mockLeads.length}</span>
                )}
                {label === 'Search History' && (
                  <span className="nav-count">{mockSearchHistory.length}</span>
                )}
              </button>
            ))}
          </nav>
          <div className="nav-label tools-label">INTELLIGENCE</div>
          <nav className="side-nav" aria-label="Intelligence navigation">
            <button className="nav-item" onClick={() => setToast('Signal monitoring is active for your workspace')}>
              <Activity size={17} />
              <span>Buying signals</span>
              <span className="nav-live">LIVE</span>
            </button>
            <button className="nav-item" onClick={() => setToast('Market insights are being prepared')}>
              <BarChart3 size={17} />
              <span>Market insights</span>
            </button>
            <button className="nav-item" onClick={() => { setAdminOpen(true); setMobileNavOpen(false) }}>
              <UsersRound size={17} />
              <span>Users &amp; access</span>
            </button>
          </nav>
        </div>
        <div className="sidebar-bottom">
          <button className="profile-card" onClick={() => setToast('Settings panel coming soon')} aria-label="Open profile settings">
            <span className="profile-avatar">CM</span>
            <span className="profile-copy">
              <strong>Codey</strong>
              <small>Master Admin</small>
            </span>
            <MoreHorizontal size={17} />
          </button>
          <button className="footer-action" onClick={() => setToast('Settings panel coming soon')}>
            <Settings size={16} />
            <span>Account settings</span>
          </button>
          <button className="footer-action" onClick={() => setToast('Signed out successfully')}>
            <Settings size={16} />
            <span>Sign out</span>
          </button>
          <div className="sidebar-credit">Platform Architecture by Codey</div>
        </div>
      </aside>

      <section className="main-column">
        <header className="topbar">
          <button className="mobile-menu-button icon-button" aria-label="Open navigation" onClick={() => setMobileNavOpen(true)}>
            <Menu size={19} />
          </button>
          <div className="breadcrumbs">
            <span>Workspace</span>
            <ChevronRight size={13} />
            <strong>{activeNav}</strong>
          </div>
          <div className="topbar-right">
            <div className="system-status">
              <span className="live-dot" /> SYSTEMS NOMINAL
            </div>
            <button className="icon-button notification-button" type="button" aria-label="Notifications" onClick={() => setToast('No new notifications')}>
              <Bell size={17} />
            </button>
            <span className="top-avatar">C</span>
          </div>
        </header>

        <div className="dashboard-content" style={{ color: '#e9eef5' }}>
          <div className="page-heading">
            <div>
              <div className="section-kicker">
                <span className="live-dot" /> YOUR SIGNAL ADVANTAGE
              </div>
              <h1>Hello, Codey<span className="greeting-period">!</span></h1>
              <p>Here&apos;s where opportunity is taking shape today.</p>
            </div>
            <div className="date-stamp">
              <span>{today.split(',')[0].toUpperCase()}</span>
              <strong>{today.split(',').slice(1).join(',').trim().toUpperCase()}</strong>
            </div>
          </div>

          <section className="metric-grid" aria-label="Pipeline metrics">
            <article className="metric-card">
              <div className="metric-heading">
                <span>CONVERSION RATE</span>
                <span className="metric-icon"><Target size={16} /></span>
              </div>
              <div className="metric-value">{mockMetrics.conversionRate}<span className="metric-unit">%</span></div>
              <div className="metric-foot">
                <span className="metric-change">+2.4% this week</span>
                <Sparkline color="cyan" />
              </div>
            </article>
            <article className="metric-card">
              <div className="metric-heading">
                <span>PIPELINE VALUE</span>
                <span className="metric-icon"><BarChart3 size={16} /></span>
              </div>
              <div className="metric-value">$2.84<span className="metric-unit">M</span></div>
              <div className="metric-foot">
                <span className="metric-change">+$340K</span>
                <Sparkline color="violet" />
              </div>
            </article>
            <article className="metric-card">
              <div className="metric-heading">
                <span>ACTIVE SEQUENCES</span>
                <span className="metric-icon"><Activity size={16} /></span>
              </div>
              <div className="metric-value">{mockMetrics.activeSequences}</div>
              <div className="metric-foot">
                <span>3 due today</span>
                <Sparkline color="blue" />
              </div>
            </article>
            <article className="metric-card">
              <div className="metric-heading">
                <span>PLACES TOKENS</span>
                <span className="metric-icon"><Zap size={16} /></span>
              </div>
              <div className="metric-value">{mockMetrics.tokensRemaining}<span className="metric-unit">/ {mockMetrics.tokensTotal}</span></div>
              <div className="metric-foot">
                <span>Resets at midnight UTC</span>
                <span className="coverage-dots">
                  <i /><i /><i /><i />
                </span>
              </div>
            </article>
          </section>

          {activeNav === 'Overview' && (
            <section className="search-panel" aria-labelledby="chart-heading" style={{ marginTop: '0', marginBottom: '17px' }}>
              <div className="panel-heading">
                <div>
                  <div className="panel-kicker"><BarChart3 size={14} /> PIPELINE ACTIVITY</div>
                  <h2 id="chart-heading">Daily lead generation &amp; conversions</h2>
                </div>
                <button className="text-button" onClick={() => setToast('Detailed analytics opening soon')}>
                  Full report <ArrowUpRight size={14} />
                </button>
              </div>
              <div style={{ marginTop: '15px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 300px', minWidth: 0 }}>
                  <PipelineChart data={pipelineChartData} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '140px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '10px', height: '10px', background: '#00f0ff', borderRadius: '2px' }} />
                    <span style={{ color: '#8995a4', fontSize: '9px', fontWeight: 600 }}>LEADS GENERATED</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '10px', height: '10px', background: '#62d4a5', borderRadius: '2px' }} />
                    <span style={{ color: '#8995a4', fontSize: '9px', fontWeight: 600 }}>CONVERTED</span>
                  </div>
                  <div style={{ marginTop: '8px', padding: '10px', border: '1px solid #1a222e', background: '#0b0f19' }}>
                    <span style={{ color: '#748294', fontSize: '7px', fontWeight: 700, letterSpacing: '0.08em' }}>TOTAL THIS WEEK</span>
                    <div style={{ color: '#edf3f9', fontSize: '20px', fontWeight: 600, marginTop: '4px' }}>
                      {pipelineChartData.reduce((s, d) => s + d.leads, 0)}
                      <span style={{ color: '#62d4a5', fontSize: '10px', marginLeft: '8px' }}>
                        {pipelineChartData.reduce((s, d) => s + d.converted, 0)} converted
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeNav !== 'Search History' && (
            <section className="search-panel" aria-labelledby="search-heading">
              <div className="panel-heading">
                <div>
                  <div className="panel-kicker"><Search size={14} /> OPPORTUNITY DISCOVERY</div>
                  <h2 id="search-heading">Search the signal.</h2>
                </div>
                <button className="text-button" onClick={() => { setSearchQuery(''); setSearchIndustry('All industries'); setSearchMetro('All metros') }}>
                  Reset search <ArrowUpRight size={14} />
                </button>
              </div>
              <form className="search-form" onSubmit={(e) => { e.preventDefault(); setActiveNav('Pipeline') }}>
                <label className="select-field">
                  <span>INDUSTRY TRACK</span>
                  <span className="select-wrap">
                    <Building2 size={16} />
                    <select value={searchIndustry} onChange={(e) => setSearchIndustry(e.target.value)}>
                      <option>All industries</option>
                      {industryStreams.map((i) => <option key={i}>{i}</option>)}
                    </select>
                    <ChevronDown size={15} />
                  </span>
                </label>
                <label className="select-field">
                  <span>METRO / REGION</span>
                  <span className="select-wrap">
                    <MapPin size={16} />
                    <select value={searchMetro} onChange={(e) => setSearchMetro(e.target.value)}>
                      <option>All metros</option>
                      {metroMarkets.map((m) => <option key={m}>{m}</option>)}
                    </select>
                    <ChevronDown size={15} />
                  </span>
                </label>
                <button type="submit" className="primary-button search-button">
                  <Search size={16} /> Find opportunities
                </button>
              </form>
              <div className="search-foot">
                <span><span className="search-foot-dot" /> {visibleLeads.length} businesses matched</span>
                <span>DAILY DIGGING: 13 / 200 USED</span>
              </div>
            </section>
          )}

          {activeNav === 'Search History' ? (
            <section className="search-history-section" aria-labelledby="search-history-heading">
              <div className="search-history-heading">
                <div>
                  <div className="panel-kicker"><History size={14} /> RECENT DISCOVERY SESSIONS</div>
                  <h2 id="search-history-heading">Search History</h2>
                  <p>Reopen results you have already revealed.</p>
                </div>
                <span className="history-retention"><span className="live-dot" /> USER-SCOPED</span>
              </div>
              <div className="search-history-list">
                {mockSearchHistory.map((item) => (
                  <button
                    key={item.id}
                    className="search-history-card"
                    type="button"
                    onClick={() => {
                      setSearchIndustry(item.industry)
                      setActiveNav('Pipeline')
                      setToast(`Reopened search: ${item.query} in ${item.location}`)
                    }}
                  >
                    <span className="history-card-icon"><Search size={16} /></span>
                    <span className="history-card-main">
                      <span className="history-card-title">
                        <strong>{item.query}</strong>
                        <time dateTime={item.searchedAt}>
                          {new Date(item.searchedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </time>
                      </span>
                      <span className="history-card-location">
                        <MapPin size={13} /> <span>{item.location}</span>
                      </span>
                    </span>
                    <span className="history-card-count">
                      <strong>{item.resultCount}</strong>
                      <span>RETURNED</span>
                    </span>
                    <span className="history-card-action">VIEW RESULTS <ArrowRight size={14} /></span>
                  </button>
                ))}
              </div>
            </section>
          ) : (
            <section className="pipeline-section" aria-labelledby="pipeline-heading">
              <div className="pipeline-heading">
                <div>
                  <div className="panel-kicker"><Crosshair size={14} /> BUSINESS LISTINGS · FIT-BASED PRIORITY</div>
                  <h2 id="pipeline-heading">
                    {activeNav === 'Saved leads' ? 'Your saved leads' : 'Business search results'}
                    <span className="result-count">{visibleLeads.length.toString().padStart(2, '0')}</span>
                  </h2>
                </div>
                <div className="pipeline-actions">
                  <button className="toolbar-button" onClick={() => setToast('Export feature coming soon')}>
                    <Download size={15} /> Export
                  </button>
                  <button className="toolbar-button" onClick={() => { setSearchQuery(''); setSearchIndustry('All industries') }}>
                    <Filter size={15} /> Reset
                  </button>
                </div>
              </div>
              <div className="lead-table-wrap">
                {visibleLeads.length > 0 && (
                  <div className="lead-table-head">
                    <span>BUSINESS NAME</span>
                    <span>INDUSTRY</span>
                    <span>LOCATION</span>
                    <span>FIT SCORE / PRIORITY</span>
                    <span>VERIFIED SIGNAL</span>
                    <span>OFFICE STATUS</span>
                    <span aria-label="Actions" />
                  </div>
                )}
                {visibleLeads.length === 0 ? (
                  <div className="empty-state">
                    <strong>No leads found</strong>
                    <p>Try adjusting your search filters.</p>
                  </div>
                ) : (
                  visibleLeads.map((lead) => {
                    const markColor = getMarkColor(lead.tier)
                    const isSaved = savedLeadIds.has(lead.id)
                    return (
                      <article
                        key={lead.id}
                        className="lead-row"
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedLead(lead)}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedLead(lead) } }}
                        aria-label={`Open dossier for ${lead.company}`}
                      >
                        <div className="company-cell">
                          <span className={`company-mark mark-${markColor}`}>{getInitials(lead.company)}</span>
                          <span className="company-copy">
                            <strong>{lead.company}</strong>
                            <small>
                              {lead.website && <><span className="result-phone">{lead.website}</span></>}
                              {lead.phone && <> · {lead.phone}</>}
                            </small>
                          </span>
                        </div>
                        <div className="industry-cell">{lead.industry}</div>
                        <div className="location-cell">
                          <MapPin size={12} />
                          <span className="address-text">{lead.location}</span>
                        </div>
                        <div className="score-cell">
                          <strong>{lead.score}</strong>
                          <StatusBadge tier={lead.tier} />
                        </div>
                        <div className={`signal-cell ${lead.verified ? '' : 'signal-unverified'}`}>
                          <i />
                          <span>{lead.signalText}</span>
                        </div>
                        <div className={`office-status ${lead.status === 'open' ? 'status-open' : lead.status === 'closed' ? 'status-closed' : ''}`}>
                          <i />
                          {lead.status === 'open' ? 'OPEN NOW' : lead.status === 'closed' ? 'CLOSED' : 'HOURS UNAVAILABLE'}
                        </div>
                        <button
                          className={`save-lead-button ${isSaved ? 'is-saved' : ''}`}
                          aria-label={isSaved ? `Remove ${lead.company} from saved` : `Save ${lead.company}`}
                          onClick={(e) => { e.stopPropagation(); toggleSaved(lead.id) }}
                        >
                          <Target size={14} fill={isSaved ? 'currentColor' : 'none'} />
                        </button>
                      </article>
                    )
                  })
                )}
              </div>
              {visibleLeads.length > 0 && (
                <div className="table-footer">
                  <span><strong>{visibleLeads.length}</strong> results · sorted by fit score</span>
                  <div className="pagination">
                    <button disabled>{'<'}</button>
                    <span>1</span>
                    <button disabled>{'>'}</button>
                  </div>
                </div>
              )}
            </section>
          )}

          <div className="main-footer">
            <span><i /> LEADTRENCH INTELLIGENCE · SYSTEMS NOMINAL</span>
            <span>BUILT FOR THE NEXT MOVE</span>
          </div>
        </div>
      </section>

      {selectedLead && (
        <DossierDrawer
          lead={selectedLead}
          onClose={() => { setSelectedLead(null); voice.stop() }}
          onPlayDossier={() => playDossier(selectedLead)}
          isPlayingDossier={voice.isSpeaking}
        />
      )}

      {adminOpen && (
        <AdminUserManagement onClose={() => setAdminOpen(false)} />
      )}

      <UniversalTransmissionModal onSuccess={(msg) => setToast(msg)} />

      {toast && (
        <div className="toast-message" role="status">
          <Check size={16} /> {toast}
        </div>
      )}
    </main>
  )
}
