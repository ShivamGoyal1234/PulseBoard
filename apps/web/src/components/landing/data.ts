import type { LucideIcon } from 'lucide-react'
import {
  Activity,
  Clock,
  Database,
  Fingerprint,
  HardDrive,
  MessageSquare,
  Server,
  Share2,
  Shield,
  Sparkles,
  TrendingDown,
  Zap,
  Component as ComponentIcon,
} from 'lucide-react'

export const FEATURES: {
  icon: LucideIcon
  iconBg: string
  iconColor: string
  title: string
  desc: string
}[] = [
  {
    icon: Zap,
    iconBg: 'bg-brand-bg',
    iconColor: 'text-brand',
    title: 'Real-time analytics',
    desc: 'Watch responses come in live via WebSockets. Charts update instantly without a page refresh.',
  },
  {
    icon: Shield,
    iconBg: 'bg-success-bg',
    iconColor: 'text-success-text',
    title: 'Fraud-proof responses',
    desc: 'Browser fingerprinting detects duplicates even in anonymous mode — no login required.',
  },
  {
    icon: Sparkles,
    iconBg: 'bg-warning-bg',
    iconColor: 'text-warning-text',
    title: 'AI-powered insights',
    desc: 'GPT-4o-mini summarises response patterns and surfaces actionable findings automatically.',
  },
  {
    icon: TrendingDown,
    iconBg: 'bg-info-bg',
    iconColor: 'text-info-text',
    title: 'Drop-off detection',
    desc: 'See which question loses respondents. Fix your poll design with real data, not guesswork.',
  },
  {
    icon: Clock,
    iconBg: 'bg-danger-bg',
    iconColor: 'text-danger-text',
    title: 'Smart expiry system',
    desc: 'Set a deadline. PulseBoard closes the poll automatically and preserves all your data.',
  },
  {
    icon: Share2,
    iconBg: 'bg-success-bg',
    iconColor: 'text-success-text',
    title: 'One-click publishing',
    desc: 'Publish results publicly with one click. The same link now shows the final outcome.',
  },
]

export const STEPS = [
  {
    num: 1,
    title: 'Build your poll',
    desc: 'Add questions, mark required or optional, set expiry, choose anonymous or authenticated.',
  },
  {
    num: 2,
    title: 'Share the link',
    desc: 'Copy one URL and share it anywhere — email, Slack, social, or embed in your product.',
  },
  {
    num: 3,
    title: 'Watch live',
    desc: 'Your analytics dashboard updates in real time as each response arrives.',
  },
  {
    num: 4,
    title: 'Publish results',
    desc: 'When the poll closes, publish results. The same link shows the final outcome publicly.',
  },
]

export const DIFFS: {
  icon: LucideIcon
  iconBg: string
  iconColor: string
  title: string
  desc: string
  tag: string
  tagBg: string
  tagColor: string
}[] = [
  {
    icon: Fingerprint,
    iconBg: 'bg-brand-bg',
    iconColor: 'text-brand',
    title: 'Browser fingerprinting',
    desc: 'SHA-256 hash from canvas, timezone, screen and hardware — stops duplicate votes without any login friction for respondents.',
    tag: 'Zero friction for respondents',
    tagBg: 'bg-brand-bg',
    tagColor: 'text-brand-text',
  },
  {
    icon: Activity,
    iconBg: 'bg-success-bg',
    iconColor: 'text-success-text',
    title: 'Poll health score',
    desc: '0–100 score combining completion rate, unique respondent ratio and response velocity. Know if your poll is healthy instantly.',
    tag: 'Actionable, not decorative',
    tagBg: 'bg-success-bg',
    tagColor: 'text-success-text',
  },
  {
    icon: Database,
    iconBg: 'bg-warning-bg',
    iconColor: 'text-warning-text',
    title: 'Kafka event pipeline',
    desc: 'Every response flows through Kafka with dead letter queue and replay. No silent data loss, even under infrastructure failure.',
    tag: 'Enterprise-grade reliability',
    tagBg: 'bg-warning-bg',
    tagColor: 'text-warning-text',
  },
  {
    icon: Sparkles,
    iconBg: 'bg-info-bg',
    iconColor: 'text-info-text',
    title: 'GPT-4o-mini insights',
    desc: 'AI reads your aggregated data and writes a specific, actionable 2–3 sentence insight grounded in the actual numbers.',
    tag: 'Powered by OpenAI',
    tagBg: 'bg-info-bg',
    tagColor: 'text-info-text',
  },
]

export const TESTIMONIALS = [
  {
    quote:
      'The drop-off funnel showed us that question 4 was killing our response rate. We made it optional and completion jumped 34% overnight.',
    name: 'Arjun Kapoor',
    role: 'Product lead, Razorpay',
    initials: 'AK',
    avatarBg: 'bg-brand-bg',
    avatarColor: 'text-brand-text',
  },
  {
    quote:
      'The fingerprint fraud detection is brilliant. We had zero duplicate submissions — compared to 12% on our old tool.',
    name: 'Sneha Rao',
    role: 'UX researcher, CRED',
    initials: 'SR',
    avatarBg: 'bg-success-bg',
    avatarColor: 'text-success-text',
  },
  {
    quote:
      'Watching the analytics dashboard update live during our all-hands was genuinely exciting. The whole team was watching the numbers move.',
    name: 'Mihir Verma',
    role: 'Engineering manager, Zepto',
    initials: 'MV',
    avatarBg: 'bg-warning-bg',
    avatarColor: 'text-warning-text',
  },
]

export const TECHS = [
  { Icon: ComponentIcon, name: 'React 18', type: 'Frontend' },
  { Icon: Server, name: 'Node.js', type: 'Backend' },
  { Icon: Database, name: 'PostgreSQL', type: 'Database' },
  { Icon: HardDrive, name: 'Redis', type: 'Cache' },
  { Icon: MessageSquare, name: 'Kafka', type: 'Events' },
  { Icon: Zap, name: 'Socket.IO', type: 'Real-time' },
]

export const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    desc: 'Perfect for personal use and small teams just getting started.',
    features: [
      '3 active polls',
      '500 responses/month',
      'Basic analytics',
      'Anonymous mode',
    ],
    cta: 'Get started free',
    featured: false,
  },
  {
    name: 'Pro',
    price: '$12',
    period: '/month',
    desc: 'For teams who need real-time insights and advanced fraud protection.',
    features: [
      'Unlimited polls',
      '50,000 responses/month',
      'Live analytics dashboard',
      'AI-powered insights',
      'Fingerprint fraud detection',
      'Poll health score',
    ],
    cta: 'Start 14-day trial',
    featured: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    desc: 'For organisations with compliance, SLA and volume requirements.',
    features: [
      'Unlimited everything',
      'SSO / SAML',
      'Dedicated Kafka cluster',
      '99.99% SLA',
      'Priority support',
    ],
    cta: 'Contact sales',
    featured: false,
  },
]

export const FAQS = [
  {
    q: 'How does anonymous mode work?',
    a: "Respondents don't need to log in. We generate a browser fingerprint on their device to prevent duplicate submissions — without storing any personal data.",
  },
  {
    q: 'What happens when a poll expires?',
    a: 'The poll link automatically shows an expired state. No new responses are accepted. Your data is preserved and you can publish results at any time after expiry.',
  },
  {
    q: 'How real-time is "real-time"?',
    a: 'Responses flow through Kafka and reach your dashboard via WebSocket in under 50ms on average. Redis maintains live counters so high-volume polls stay snappy.',
  },
  {
    q: 'Can I use Google Sign-In?',
    a: 'Yes. PulseBoard supports both email/password and Google OAuth. We automatically link accounts if you switch methods on the same email address.',
  },
  {
    q: 'What is the poll health score?',
    a: 'A 0–100 score combining completion rate, unique respondent ratio (fingerprint-verified), and response velocity. Tells you instantly if your poll needs attention.',
  },
]

export const MOCK_POLLS = [
  {
    title: 'Product feedback Q2',
    pct: 68,
    status: 'Live',
    statusClass: 'text-success-text',
  },
  {
    title: 'Team NPS — May',
    pct: 91,
    status: 'Published',
    statusClass: 'text-info-text',
  },
  {
    title: 'Event planning survey',
    pct: 42,
    status: 'Expired',
    statusClass: 'text-danger-text',
  },
] as const
