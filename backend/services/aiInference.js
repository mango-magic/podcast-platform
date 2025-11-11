// AI-powered persona and vertical inference from LinkedIn profile data
// This service analyzes LinkedIn profile information to automatically determine
// the user's persona (role) and vertical (industry)

const axios = require('axios');

// Mapping keywords to personas
const PERSONA_KEYWORDS = {
  'CISO': ['ciso', 'chief information security', 'chief security', 'security officer', 'head of security', 'vp security', 'director security'],
  'CRO': ['cro', 'chief revenue', 'chief sales', 'head of revenue', 'vp revenue', 'vp sales', 'revenue officer', 'sales leader'],
  'CFO': ['cfo', 'chief financial', 'chief finance', 'head of finance', 'vp finance', 'financial officer', 'finance director'],
  'CHRO': ['chro', 'chief human resources', 'chief hr', 'head of hr', 'head of people', 'vp hr', 'vp people', 'hr director', 'people officer'],
  'COO': ['coo', 'chief operating', 'chief operations', 'head of operations', 'vp operations', 'operations director', 'operating officer'],
  'CMO': ['cmo', 'chief marketing', 'head of marketing', 'vp marketing', 'marketing director', 'marketing officer'],
  'CTO': ['cto', 'chief technology', 'chief technical', 'head of engineering', 'vp engineering', 'vp technology', 'technology officer', 'engineering director'],
  'VP Supply Chain': ['supply chain', 'vp supply', 'head of supply', 'supply chain director', 'logistics director', 'procurement director'],
  'CSO': ['cso', 'chief sustainability', 'head of sustainability', 'sustainability officer', 'esg director', 'sustainability director'],
  'General Counsel': ['general counsel', 'chief legal', 'head of legal', 'legal counsel', 'vp legal', 'legal director', 'chief compliance']
};

// Mapping keywords to verticals
const VERTICAL_KEYWORDS = {
  'SaaS': ['saas', 'software as a service', 'cloud software', 'software company', 'tech startup', 'software platform'],
  'Banking': ['bank', 'banking', 'financial services', 'credit union', 'fintech', 'financial institution'],
  'Insurance': ['insurance', 'insurer', 'underwriter', 'actuarial', 'claims', 'policy'],
  'Healthcare Providers': ['hospital', 'healthcare', 'health system', 'medical center', 'clinic', 'healthcare provider', 'healthcare system'],
  'Pharma': ['pharmaceutical', 'pharma', 'biotech', 'biopharma', 'drug', 'medicine', 'clinical trial'],
  'CPG': ['consumer goods', 'cpg', 'consumer packaged', 'retail brand', 'consumer products', 'fmcg'],
  'Automotive': ['automotive', 'auto', 'car', 'vehicle', 'automobile', 'tier 1', 'oem'],
  'eCommerce': ['ecommerce', 'e-commerce', 'online retail', 'marketplace', 'digital commerce', 'online store'],
  'Logistics': ['logistics', 'supply chain', 'shipping', 'freight', 'warehouse', 'distribution', '3pl'],
  'Renewables': ['renewable', 'solar', 'wind', 'energy', 'clean energy', 'sustainability', 'green energy']
};

// Company industry mapping (common company names/domains)
const COMPANY_INDUSTRY_MAPPING = {
  'SaaS': ['salesforce', 'hubspot', 'zendesk', 'slack', 'atlassian', 'shopify', 'stripe', 'twilio'],
  'Banking': ['chase', 'bank of america', 'wells fargo', 'citibank', 'goldman sachs', 'morgan stanley'],
  'Insurance': ['state farm', 'allstate', 'geico', 'progressive', 'aetna', 'unitedhealth', 'anthem'],
  'Healthcare Providers': ['mayo', 'cleveland clinic', 'kaiser', 'hca', 'tenet', 'community health'],
  'Pharma': ['pfizer', 'merck', 'johnson & johnson', 'novartis', 'roche', 'gsk', 'bristol-myers'],
  'CPG': ['procter & gamble', 'unilever', 'coca-cola', 'pepsico', 'nestle', 'kraft', 'general mills'],
  'Automotive': ['ford', 'gm', 'toyota', 'honda', 'tesla', 'bmw', 'mercedes', 'volkswagen'],
  'eCommerce': ['amazon', 'ebay', 'etsy', 'shopify', 'wayfair', 'alibaba'],
  'Logistics': ['ups', 'fedex', 'dhl', 'maersk', 'schneider', 'j.b. hunt'],
  'Renewables': ['first solar', 'vestas', 'sunnova', 'tesla energy', 'nextera']
};

/**
 * Infer persona from LinkedIn title/headline
 */
function inferPersona(title, headline) {
  if (!title && !headline) return null;
  
  const text = `${title || ''} ${headline || ''}`.toLowerCase();
  
  // Score each persona based on keyword matches
  const scores = {};
  
  for (const [persona, keywords] of Object.entries(PERSONA_KEYWORDS)) {
    scores[persona] = keywords.reduce((score, keyword) => {
      if (text.includes(keyword)) {
        return score + (keyword.length > 10 ? 2 : 1); // Longer keywords = more specific
      }
      return score;
    }, 0);
  }
  
  // Return persona with highest score, or null if no matches
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  return sorted[0][1] > 0 ? sorted[0][0] : null;
}

/**
 * Infer vertical from company name, industry, or title
 */
function inferVertical(companyName, industry, title, headline) {
  const text = `${companyName || ''} ${industry || ''} ${title || ''} ${headline || ''}`.toLowerCase();
  
  // Check company name mapping first (most reliable)
  if (companyName) {
    const companyLower = companyName.toLowerCase();
    for (const [vertical, companies] of Object.entries(COMPANY_INDUSTRY_MAPPING)) {
      if (companies.some(c => companyLower.includes(c))) {
        return vertical;
      }
    }
  }
  
  // Score each vertical based on keyword matches
  const scores = {};
  
  for (const [vertical, keywords] of Object.entries(VERTICAL_KEYWORDS)) {
    scores[vertical] = keywords.reduce((score, keyword) => {
      if (text.includes(keyword)) {
        return score + (keyword.length > 10 ? 2 : 1);
      }
      return score;
    }, 0);
  }
  
  // Return vertical with highest score, or null if no matches
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  return sorted[0][1] > 0 ? sorted[0][0] : null;
}

/**
 * Fetch LinkedIn profile details using access token
 * Note: LinkedIn API access may be limited. This function gracefully handles failures.
 */
async function fetchLinkedInProfile(accessToken) {
  if (!accessToken) {
    return null;
  }
  
  try {
    // Try LinkedIn API v2 endpoint for profile (OpenID Connect)
    const response = await axios.get('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      timeout: 5000 // 5 second timeout
    });
    
    return response.data;
  } catch (error) {
    // LinkedIn API may not be available or token may not have right scopes
    // This is non-blocking - we'll use the profile data from OAuth callback instead
    console.log('LinkedIn API call not available (this is OK):', error.message);
    return null;
  }
}

/**
 * Main function to infer persona and vertical from LinkedIn data
 */
async function inferDemographics(accessToken, existingProfile = {}) {
  let profileData = existingProfile;
  
  // Fetch fresh LinkedIn data if we have an access token
  if (accessToken) {
    const linkedInData = await fetchLinkedInProfile(accessToken);
    if (linkedInData) {
      profileData = { ...profileData, ...linkedInData };
    }
  }
  
  // Extract relevant fields
  const headline = profileData.headline || '';
  const title = profileData.title || profileData.position || '';
  const companyName = profileData.company || profileData.companyName || '';
  const industry = profileData.industry || '';
  
  // Infer persona and vertical
  const persona = inferPersona(title, headline);
  const vertical = inferVertical(companyName, industry, title, headline);
  
  return {
    persona,
    vertical,
    confidence: {
      persona: persona ? 'high' : 'low',
      vertical: vertical ? 'high' : 'low'
    },
    source: {
      title,
      headline,
      companyName,
      industry
    }
  };
}

module.exports = {
  inferDemographics,
  inferPersona,
  inferVertical,
  fetchLinkedInProfile
};

