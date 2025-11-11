// Utility to map demographics to podcast recommendations from Podcast_Name_Ideas.md

const PODCAST_RECOMMENDATIONS = {
  'CISO': {
    'SaaS': [
      { name: 'CloudSecure', hook: 'Every SaaS CISO faces evolving cloudsecure threats—discover proven frameworks from security leaders who\'ve prevented breaches and protected their organizations' },
      { name: 'The AI Sentry', hook: 'Harness AI for competitive advantage—join SaaS leaders sharing ai sentry strategies for implementing AI that drives real business value' },
      { name: 'VendorRisk', hook: 'Every SaaS CISO faces evolving vendorrisk threats—discover proven frameworks from security leaders who\'ve prevented breaches and protected their organizations' },
      { name: 'The AppSec Angle', hook: 'Master appsec angle in SaaS—join CISOs sharing proven strategies, frameworks, and real-world insights that drive results' },
      { name: 'Zero-Trust Journey', hook: 'Master zero trust journey in SaaS—join CISOs sharing proven strategies, frameworks, and real-world insights that drive results' }
    ],
    'Banking': [
      { name: 'FinCrime Fortress', hook: 'Every Banking CISO faces evolving fincrime fortress threats—discover proven frameworks from security leaders who\'ve prevented breaches and protected their organizations' },
      { name: 'RegTech Risk', hook: 'Every Banking CISO faces evolving regtech risk threats—discover proven frameworks from security leaders who\'ve prevented breaches and protected their organizations' },
      { name: 'The Quantum Shield', hook: 'Every Banking CISO faces evolving quantum shield threats—discover proven frameworks from security leaders who\'ve prevented breaches and protected their organizations' }
    ],
    'Insurance': [
      { name: 'InsurTrust', hook: 'Master insurtrust in Insurance—join CISOs sharing proven strategies, frameworks, and real-world insights that drive results' },
      { name: 'PolicyHolder Privacy', hook: 'Protect customer data and ensure privacy—join Insurance leaders discussing policyholder privacy strategies for data protection and compliance' },
      { name: 'The Actuarial Attack Surface', hook: 'Every Insurance CISO faces evolving actuarial attack surface threats—discover proven frameworks from security leaders who\'ve prevented breaches and protected their organizations' }
    ]
  },
  'CRO': {
    'SaaS': [
      { name: 'The PLG Engine', hook: 'Stop leaving revenue on the table—join SaaS CROs sharing plg engine strategies that consistently beat quota and drive sustainable growth' },
      { name: 'RevOps Unlocked', hook: 'Stop leaving revenue on the table—join SaaS CROs sharing revops unlocked strategies that consistently beat quota and drive sustainable growth' },
      { name: 'The PartnerTrek', hook: 'Unlock growth through partnerships—join SaaS leaders sharing partnertrek strategies that drive revenue through strategic alliances' },
      { name: 'Net-Revenue-Retention', hook: 'Stop leaving revenue on the table—join SaaS CROs sharing net revenue retention strategies that consistently beat quota and drive sustainable growth' }
    ],
    'Banking': [
      { name: 'The Commercial-Close', hook: 'Stop leaving revenue on the table—join Banking CROs sharing commercial close strategies that consistently beat quota and drive sustainable growth' },
      { name: 'Relationship-Revenue', hook: 'Stop leaving revenue on the table—join Banking CROs sharing relationship revenue strategies that consistently beat quota and drive sustainable growth' },
      { name: 'Cross-Sell-Capital', hook: 'Master cross sell capital financial strategies—join Banking CFOs sharing frameworks for capital allocation, FP&A, and driving profitable growth' }
    ],
    'eCommerce': [
      { name: 'Conversion-Rate-Command', hook: 'Master conversion rate command in eCommerce—join CROs sharing proven strategies, frameworks, and real-world insights that drive results' },
      { name: 'Average-Order-Value', hook: 'Master average order value in eCommerce—join CROs sharing proven strategies, frameworks, and real-world insights that drive results' },
      { name: 'The-Personalization-Pipeline', hook: 'Stop leaving revenue on the table—join eCommerce CROs sharing personalization pipeline strategies that consistently beat quota and drive sustainable growth' }
    ]
  },
  'CFO': {
    'SaaS': [
      { name: 'The-Rule-of-40', hook: 'Master rule of 40 in SaaS—join CFOs sharing proven strategies, frameworks, and real-world insights that drive results' },
      { name: 'ASC-606-In-Depth', hook: 'Master asc 606 in depth in SaaS—join CFOs sharing proven strategies, frameworks, and real-world insights that drive results' },
      { name: 'The-Burn-Rate', hook: 'Master burn rate financial strategies—join SaaS CFOs sharing frameworks for capital allocation, FP&A, and driving profitable growth' },
      { name: 'SaaS-Unit-Economics', hook: 'Master saas unit economics financial strategies—join SaaS CFOs sharing frameworks for capital allocation, FP&A, and driving profitable growth' }
    ],
    'Banking': [
      { name: 'ALM-Today', hook: 'Master alm today in Banking—join CFOs sharing proven strategies, frameworks, and real-world insights that drive results' },
      { name: 'The-Bank-Balance-Sheet', hook: 'Master bank balance sheet in Banking—join CFOs sharing proven strategies, frameworks, and real-world insights that drive results' },
      { name: 'Capital-Adequacy-Ratio', hook: 'Master capital adequacy ratio financial strategies—join Banking CFOs sharing frameworks for capital allocation, FP&A, and driving profitable growth' }
    ]
  },
  'CHRO': {
    'SaaS': [
      { name: 'The-Remote-Work-Debate', hook: 'Master remote work debate in SaaS—join CHROs sharing proven strategies, frameworks, and real-world insights that drive results' },
      { name: 'The-Equity-Equation', hook: 'Your SaaS workforce is your competitive advantage—discover how top CHROs are solving equity equation challenges to improve retention and culture' },
      { name: 'Scaling-Culture', hook: 'Your SaaS workforce is your competitive advantage—discover how top CHROs are solving scaling culture challenges to improve retention and culture' }
    ],
    'Healthcare': [
      { name: 'The-Nurse-Retention-Report', hook: 'Stop leaving revenue on the table—join Healthcare CROs sharing nurse retention report strategies that consistently beat quota and drive sustainable growth' },
      { name: 'Physician-Burnout', hook: 'Master physician burnout financial strategies—join Healthcare CFOs sharing frameworks for capital allocation, FP&A, and driving profitable growth' },
      { name: 'The-Travel-Nurse-Dilemma', hook: 'Master travel nurse dilemma in Healthcare—join CHROs sharing proven strategies, frameworks, and real-world insights that drive results' }
    ]
  },
  'COO': {
    'SaaS': [
      { name: 'The-Post-Sale-Process', hook: 'Scale SaaS operations without breaking—join COOs sharing post sale process frameworks that improve efficiency and reduce costs' },
      { name: 'The-Efficiency-Equation', hook: 'Scale SaaS operations without breaking—join COOs sharing efficiency equation frameworks that improve efficiency and reduce costs' },
      { name: 'Scaling-Support', hook: 'Master scaling support in SaaS—join COOs sharing proven strategies, frameworks, and real-world insights that drive results' }
    ],
    'eCommerce': [
      { name: 'The-Fulfillment-Engine', hook: 'Scale eCommerce operations without breaking—join COOs sharing fulfillment engine frameworks that improve efficiency and reduce costs' },
      { name: 'The-Last-Mile-Matrix', hook: 'Master last mile matrix in eCommerce—join COOs sharing proven strategies, frameworks, and real-world insights that drive results' },
      { name: 'The-Return-Reverse-Loop', hook: 'Master return reverse loop in eCommerce—join COOs sharing proven strategies, frameworks, and real-world insights that drive results' }
    ]
  },
  'CMO': {
    'SaaS': [
      { name: 'The-Demand-Gen-Engine', hook: 'Cut through the marketing noise—join SaaS CMOs revealing demand gen engine strategies that drive real results and prove ROI' },
      { name: 'The-PLG-Loop', hook: 'Stop leaving revenue on the table—join SaaS CROs sharing plg loop strategies that consistently beat quota and drive sustainable growth' },
      { name: 'ABM-in-Action', hook: 'Cut through the marketing noise—join SaaS CMOs revealing abm in action strategies that drive real results and prove ROI' }
    ],
    'eCommerce': [
      { name: 'The-Performance-Marketer', hook: 'Master performance marketer in eCommerce—join CMOs sharing proven strategies, frameworks, and real-world insights that drive results' },
      { name: 'The-ROAS-Report', hook: 'Master roas report in eCommerce—join CMOs sharing proven strategies, frameworks, and real-world insights that drive results' },
      { name: 'The-Personalization-Engine', hook: 'Master personalization engine in eCommerce—join CMOs sharing proven strategies, frameworks, and real-world insights that drive results' }
    ]
  },
  'CTO': {
    'SaaS': [
      { name: 'Platformed', hook: 'Build better systems—join SaaS CTOs discussing platformed architectures, engineering practices, and scaling strategies' },
      { name: 'The-Debt-Down', hook: 'Master debt down in SaaS—join CTOs sharing proven strategies, frameworks, and real-world insights that drive results' },
      { name: 'DevEx', hook: 'Master devex in SaaS—join CTOs sharing proven strategies, frameworks, and real-world insights that drive results' },
      { name: 'The-Microservice-Matrix', hook: 'Build better systems—join SaaS CTOs discussing microservice matrix architectures, engineering practices, and scaling strategies' }
    ],
    'Banking': [
      { name: 'The-Core-Modernization', hook: 'Master core modernization in Banking—join CTOs sharing proven strategies, frameworks, and real-world insights that drive results' },
      { name: 'The-FinTech-Integration', hook: 'Build better systems—join Banking CTOs discussing fintech integration architectures, engineering practices, and scaling strategies' },
      { name: 'The-Payment-Rail-Platform', hook: 'Build better systems—join Banking CTOs discussing payment rail platform architectures, engineering practices, and scaling strategies' }
    ]
  },
  'VP Supply Chain': {
    'CPG': [
      { name: 'The-S&OP-Sync', hook: 'Master s&op sync in CPG—join Supply Chains sharing proven strategies, frameworks, and real-world insights that drive results' },
      { name: 'The-Resilient-Route-to-Retail', hook: 'Harness AI for competitive advantage—join CPG leaders sharing resilient route to retail strategies for implementing AI that drives real business value' },
      { name: 'The-D2C-Fulfillment-Flow', hook: 'Scale CPG operations without breaking—join COOs sharing d2c fulfillment flow frameworks that improve efficiency and reduce costs' }
    ],
    'eCommerce': [
      { name: 'The-Fulfillment-Flow', hook: 'Scale eCommerce operations without breaking—join COOs sharing fulfillment flow frameworks that improve efficiency and reduce costs' },
      { name: 'The-Last-Mile-Matrix', hook: 'Master last mile matrix in eCommerce—join Supply Chains sharing proven strategies, frameworks, and real-world insights that drive results' },
      { name: 'The-Reverse-Logistics-Loop', hook: 'Resilient supply chains start here—join eCommerce supply chain VPs sharing reverse logistics loop strategies that reduce risk and improve efficiency' }
    ]
  },
  'CSO': {
    'SaaS': [
      { name: 'The-Green-Cloud', hook: 'Build better systems—join SaaS CTOs discussing green cloud architectures, engineering practices, and scaling strategies' },
      { name: 'The-Data-Center-Decarb', hook: 'Protect customer data and ensure privacy—join SaaS leaders discussing data center decarb strategies for data protection and compliance' },
      { name: 'The-ESG-Report', hook: 'Sustainability isn\'t optional—join SaaS CSOs sharing esg report strategies that drive real environmental impact and meet ESG goals' }
    ],
    'Renewables': [
      { name: 'The-Net-Positive-Project', hook: 'Master net positive project in Renewables—join CSOs sharing proven strategies, frameworks, and real-world insights that drive results' },
      { name: 'The-Circular-Turbine', hook: 'Master circular turbine in Renewables—join CSOs sharing proven strategies, frameworks, and real-world insights that drive results' },
      { name: 'The-ESG-Developer', hook: 'Sustainability isn\'t optional—join Renewables CSOs sharing esg developer strategies that drive real environmental impact and meet ESG goals' }
    ]
  },
  'General Counsel': {
    'SaaS': [
      { name: 'The-AI-Contract', hook: 'Stay ahead of regulatory changes—join SaaS GCs discussing ai contract legal strategies, compliance frameworks, and risk management' },
      { name: 'The-Data-Privacy-Docket', hook: 'Protect customer data and ensure privacy—join SaaS leaders discussing data privacy docket strategies for data protection and compliance' },
      { name: 'The-IP-Playbook', hook: 'Master ip playbook in SaaS—join GCs sharing proven strategies, frameworks, and real-world insights that drive results' }
    ],
    'Banking': [
      { name: 'The-Compliance-Counsel', hook: 'Stay ahead of regulatory changes—join Banking GCs discussing compliance counsel legal strategies, compliance frameworks, and risk management' },
      { name: 'The-Regulatory-Radar', hook: 'Cut through the marketing noise—join Banking CMOs revealing regulatory radar strategies that drive real results and prove ROI' },
      { name: 'The-AML-Law-Log', hook: 'Stay ahead of regulatory changes—join Banking GCs discussing aml law log legal strategies, compliance frameworks, and risk management' }
    ]
  }
};

// Normalize vertical names for matching
const normalizeVertical = (vertical) => {
  const mapping = {
    'Healthcare Providers': 'Healthcare',
    'Retail (eCommerce)': 'eCommerce',
    'Energy (Renewables)': 'Renewables',
    'Automotive Manufacturing': 'Automotive'
  };
  return mapping[vertical] || vertical;
};

// Get personalized podcast recommendations based on persona and vertical
const getPodcastRecommendations = (persona, vertical) => {
  if (!persona || !vertical) {
    return [];
  }
  
  const normalizedVertical = normalizeVertical(vertical);
  const recommendations = PODCAST_RECOMMENDATIONS[persona]?.[normalizedVertical] || [];
  
  // Return top 5 recommendations
  return recommendations.slice(0, 5);
};

// Get all available personas
const getPersonas = () => [
  'CISO', 'CRO', 'CFO', 'CHRO', 'COO', 'CMO', 'CTO', 
  'VP Supply Chain', 'CSO', 'General Counsel'
];

// Get all available verticals
const getVerticals = () => [
  'SaaS', 'Banking', 'Insurance', 'Healthcare Providers', 
  'Pharma', 'CPG', 'Automotive', 'eCommerce', 'Logistics', 'Renewables'
];

// Get demographic-specific welcome message
const getWelcomeMessage = (persona, vertical) => {
  const messages = {
    'CISO': {
      'SaaS': 'Protect your SaaS organization with proven security frameworks',
      'Banking': 'Secure financial systems and protect customer data',
      'Insurance': 'Build resilient security postures for insurance organizations'
    },
    'CRO': {
      'SaaS': 'Drive sustainable revenue growth and beat quota consistently',
      'Banking': 'Maximize relationship revenue and cross-sell opportunities',
      'eCommerce': 'Optimize conversion rates and maximize order value'
    },
    'CFO': {
      'SaaS': 'Master SaaS unit economics and financial metrics',
      'Banking': 'Navigate banking regulations and optimize capital allocation'
    },
    'CHRO': {
      'SaaS': 'Build winning cultures and retain top engineering talent',
      'Healthcare': 'Address workforce challenges in healthcare organizations'
    },
    'COO': {
      'SaaS': 'Scale operations efficiently without breaking',
      'eCommerce': 'Optimize fulfillment and last-mile delivery'
    },
    'CMO': {
      'SaaS': 'Cut through marketing noise and prove ROI',
      'eCommerce': 'Master performance marketing and personalization'
    },
    'CTO': {
      'SaaS': 'Build better systems and scale engineering teams',
      'Banking': 'Modernize core systems and integrate fintech solutions'
    },
    'VP Supply Chain': {
      'CPG': 'Build resilient supply chains and optimize fulfillment',
      'eCommerce': 'Master last-mile delivery and reverse logistics'
    },
    'CSO': {
      'SaaS': 'Drive sustainability and meet ESG goals',
      'Renewables': 'Lead the transition to renewable energy'
    },
    'General Counsel': {
      'SaaS': 'Navigate regulatory changes and manage legal risk',
      'Banking': 'Stay ahead of compliance and regulatory requirements'
    }
  };
  
  const normalizedVertical = normalizeVertical(vertical);
  return messages[persona]?.[normalizedVertical] || `Welcome, ${persona} in ${vertical}`;
};

// Get demographic-specific color theme
const getDemographicTheme = (persona, vertical) => {
  const themes = {
    'CISO': { primary: '#d32f2f', secondary: '#f44336' }, // Red for security
    'CRO': { primary: '#1976d2', secondary: '#42a5f5' }, // Blue for revenue
    'CFO': { primary: '#388e3c', secondary: '#66bb6a' }, // Green for finance
    'CHRO': { primary: '#f57c00', secondary: '#ff9800' }, // Orange for HR
    'COO': { primary: '#7b1fa2', secondary: '#9c27b0' }, // Purple for operations
    'CMO': { primary: '#c2185b', secondary: '#e91e63' }, // Pink for marketing
    'CTO': { primary: '#0288d1', secondary: '#03a9f4' }, // Cyan for tech
    'VP Supply Chain': { primary: '#5d4037', secondary: '#795548' }, // Brown for supply chain
    'CSO': { primary: '#00796b', secondary: '#009688' }, // Teal for sustainability
    'General Counsel': { primary: '#455a64', secondary: '#607d8b' } // Blue-grey for legal
  };
  
  return themes[persona] || { primary: '#1976d2', secondary: '#42a5f5' };
};

export {
  getPodcastRecommendations,
  getPersonas,
  getVerticals,
  getWelcomeMessage,
  getDemographicTheme
};

