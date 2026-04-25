export type Provider = "MSCI" | "Sustainalytics" | "CDP" | "S&P CSA";

export interface ScoreRow {
  company: string;
  year: number;
  provider: Provider;
  raw_score: string;
  normalized_score: number;
  environment_score: number;
  social_score: number;
  governance_score: number;
  confidence: number;
  methodology_gap: string;
  data_gap: string;
  weighting_difference: string;
}

export interface MethodologyRow {
  provider: Provider;
  scale: string;
  risk_direction: string;
  key_lens: string;
  known_gaps: string;
  why_differ: string;
  typical_weighting: string;
}

export const PROVIDER_COLORS: Record<Provider, string> = {
  MSCI: "hsl(var(--provider-msci))",
  Sustainalytics: "hsl(var(--provider-sustainalytics))",
  CDP: "hsl(var(--provider-cdp))",
  "S&P CSA": "hsl(var(--provider-snp))",
};

export const PROVIDER_HEX: Record<Provider, string> = {
  MSCI: "#0972d8",
  Sustainalytics: "#f26a35",
  CDP: "#3dcd58",
  "S&P CSA": "#7849d4",
};

export const scores: ScoreRow[] = [
  { company: "Schneider Electric", year: 2020, provider: "MSCI", raw_score: "AA", normalized_score: 82, environment_score: 85, social_score: 78, governance_score: 83, confidence: 76, methodology_gap: "Controversy and industry risk lens can lift or cap the rating differently than disclosure-led frameworks", data_gap: "Public disclosures were strong but some supply-chain and product-impact indicators were estimated", weighting_difference: "Climate strategy and governance receive heavier materiality weight than questionnaire completeness" },
  { company: "Schneider Electric", year: 2020, provider: "Sustainalytics", raw_score: "17.4 Low Risk", normalized_score: 78, environment_score: 82, social_score: 72, governance_score: 79, confidence: 72, methodology_gap: "Lower raw ESG risk maps inversely to normalized performance and can penalize unmanaged exposure", data_gap: "Incident coverage and exposure estimates can shift risk score even when company disclosure is stable", weighting_difference: "Material financial risk and management gap are weighted above broad disclosure volume" },
  { company: "Schneider Electric", year: 2020, provider: "CDP", raw_score: "A-", normalized_score: 86, environment_score: 91, social_score: 74, governance_score: 76, confidence: 81, methodology_gap: "Climate questionnaire depth is rewarded more directly than cross-ESG governance coverage", data_gap: "Scope 3 and supplier data quality can create uncertainty across categories", weighting_difference: "Environmental disclosure and climate targets dominate the score" },
  { company: "Schneider Electric", year: 2020, provider: "S&P CSA", raw_score: "77", normalized_score: 77, environment_score: 80, social_score: 73, governance_score: 78, confidence: 74, methodology_gap: "CSA rewards detailed questionnaire evidence and industry-specific practices", data_gap: "Missing questionnaire fields can suppress otherwise strong public-reporting performance", weighting_difference: "Industry materiality weights may emphasize operational eco-efficiency and labor practices" },
  { company: "Schneider Electric", year: 2021, provider: "MSCI", raw_score: "AA", normalized_score: 84, environment_score: 87, social_score: 80, governance_score: 84, confidence: 78, methodology_gap: "MSCI-style industry risk controls may reward resilience in electrical equipment exposure", data_gap: "Some controversy and supply-chain inputs are inferred from public or third-party data", weighting_difference: "Governance and risk-management controls carry more weight than standalone disclosure" },
  { company: "Schneider Electric", year: 2021, provider: "Sustainalytics", raw_score: "16.1 Low Risk", normalized_score: 80, environment_score: 84, social_score: 74, governance_score: 80, confidence: 75, methodology_gap: "Risk score improves when unmanaged risk narrows even if absolute disclosures change modestly", data_gap: "Exposure estimates and incident screening remain a source of provider variance", weighting_difference: "Unmanaged risk reduction is weighted above breadth of reporting" },
  { company: "Schneider Electric", year: 2021, provider: "CDP", raw_score: "A", normalized_score: 91, environment_score: 95, social_score: 76, governance_score: 78, confidence: 84, methodology_gap: "CDP climate leadership can exceed broader ESG provider scores", data_gap: "Environmental data is robust while social and governance depth is outside the core climate grade", weighting_difference: "Climate disclosure and emissions-management weight is dominant" },
  { company: "Schneider Electric", year: 2021, provider: "S&P CSA", raw_score: "80", normalized_score: 80, environment_score: 83, social_score: 76, governance_score: 81, confidence: 77, methodology_gap: "CSA questionnaire evidence can produce a smoother year-over-year path", data_gap: "Self-reported survey completeness affects comparability with public-only providers", weighting_difference: "Environmental and social practices are balanced through sector-specific weights" },
  { company: "Schneider Electric", year: 2022, provider: "MSCI", raw_score: "AAA", normalized_score: 90, environment_score: 91, social_score: 83, governance_score: 88, confidence: 80, methodology_gap: "Top-tier rating can reflect relative peer strength as well as absolute controls", data_gap: "Third-party controversy screening can lag company reporting changes", weighting_difference: "Industry-adjusted risk management receives high weight" },
  { company: "Schneider Electric", year: 2022, provider: "Sustainalytics", raw_score: "15.2 Low Risk", normalized_score: 82, environment_score: 86, social_score: 76, governance_score: 82, confidence: 77, methodology_gap: "Low-risk category may still trail disclosure-led scores because residual exposure remains", data_gap: "Estimated exposure to product and supply-chain risks can create a ceiling", weighting_difference: "Financial materiality and unmanaged-risk weighting dampens climate leadership upside" },
  { company: "Schneider Electric", year: 2022, provider: "CDP", raw_score: "A", normalized_score: 92, environment_score: 96, social_score: 77, governance_score: 79, confidence: 85, methodology_gap: "Climate disclosure and target credibility remain primary drivers", data_gap: "Scope 3 boundary assumptions can affect confidence", weighting_difference: "Climate weighting is intentionally much higher than governance breadth" },
  { company: "Schneider Electric", year: 2022, provider: "S&P CSA", raw_score: "82", normalized_score: 82, environment_score: 85, social_score: 78, governance_score: 83, confidence: 79, methodology_gap: "Questionnaire-led CSA score may rise with evidence quality and detailed policy proof", data_gap: "Survey non-response or limited fields can hold down subtopic scores", weighting_difference: "Industry materiality distributes weight across environmental innovation and workforce topics" },
  { company: "Schneider Electric", year: 2023, provider: "MSCI", raw_score: "AAA", normalized_score: 91, environment_score: 92, social_score: 84, governance_score: 89, confidence: 82, methodology_gap: "Relative peer methodology can sustain high rating even when other frameworks identify gaps", data_gap: "Public and estimated data are mixed for some value-chain indicators", weighting_difference: "Governance controls and industry materiality carry strong influence" },
  { company: "Schneider Electric", year: 2023, provider: "Sustainalytics", raw_score: "14.7 Low Risk", normalized_score: 83, environment_score: 87, social_score: 77, governance_score: 83, confidence: 78, methodology_gap: "Residual unmanaged risk can keep the normalized score below disclosure-heavy ratings", data_gap: "Event monitoring and exposure models can shift independently of company submissions", weighting_difference: "Unmanaged risk and exposure are more important than total disclosure volume" },
  { company: "Schneider Electric", year: 2023, provider: "CDP", raw_score: "A", normalized_score: 93, environment_score: 97, social_score: 78, governance_score: 80, confidence: 86, methodology_gap: "Climate leadership methodology creates upside versus full ESG frameworks", data_gap: "Supplier and financed emissions estimates can leave uncertainty", weighting_difference: "Environmental transparency and transition planning dominate" },
  { company: "Schneider Electric", year: 2023, provider: "S&P CSA", raw_score: "84", normalized_score: 84, environment_score: 86, social_score: 80, governance_score: 84, confidence: 80, methodology_gap: "CSA captures detailed management practices that may not be visible in public-only ratings", data_gap: "Questionnaire coverage and verification depth affect confidence", weighting_difference: "Weights spread across climate, innovation, labor, and governance practices" },
  { company: "Schneider Electric", year: 2024, provider: "MSCI", raw_score: "AAA", normalized_score: 92, environment_score: 93, social_score: 85, governance_score: 90, confidence: 83, methodology_gap: "Relative peer leadership remains a core driver", data_gap: "Some indicators rely on third-party controversy and exposure datasets", weighting_difference: "Governance and risk controls continue to receive heavy materiality treatment" },
  { company: "Schneider Electric", year: 2024, provider: "Sustainalytics", raw_score: "13.9 Low Risk", normalized_score: 85, environment_score: 89, social_score: 79, governance_score: 84, confidence: 80, methodology_gap: "Risk methodology still reflects residual exposure despite strong management systems", data_gap: "Incident screening and value-chain exposure are less dependent on company questionnaire detail", weighting_difference: "Unmanaged risk decline lifts the score while exposure remains a constraint" },
  { company: "Schneider Electric", year: 2024, provider: "CDP", raw_score: "A", normalized_score: 94, environment_score: 98, social_score: 79, governance_score: 81, confidence: 88, methodology_gap: "Climate-first scoring outperforms broader ESG scores when disclosure is deep", data_gap: "Scope 3 and supplier assurance are still the main data constraints", weighting_difference: "Climate disclosure and emissions performance dominate the aggregate" },
  { company: "Schneider Electric", year: 2024, provider: "S&P CSA", raw_score: "86", normalized_score: 86, environment_score: 88, social_score: 82, governance_score: 86, confidence: 82, methodology_gap: "Questionnaire evidence and sector materiality support steady improvement", data_gap: "Assurance depth and survey completeness can influence topic-level results", weighting_difference: "Environmental innovation and workforce management are weighted alongside governance" },
  { company: "Schneider Electric", year: 2025, provider: "MSCI", raw_score: "AAA", normalized_score: 93, environment_score: 94, social_score: 86, governance_score: 91, confidence: 84, methodology_gap: "Peer-relative methodology and controversy screening can differ from absolute scorecards", data_gap: "Some supply-chain and product-use indicators remain model-estimated", weighting_difference: "Governance and sector risk management are weighted heavily" },
  { company: "Schneider Electric", year: 2025, provider: "Sustainalytics", raw_score: "13.2 Low Risk", normalized_score: 87, environment_score: 90, social_score: 80, governance_score: 85, confidence: 81, methodology_gap: "Low unmanaged risk translates to a strong but not maximum normalized score", data_gap: "Exposure assumptions and incident monitoring remain important variance sources", weighting_difference: "Financially material unmanaged risk receives more weight than disclosure breadth" },
  { company: "Schneider Electric", year: 2025, provider: "CDP", raw_score: "A", normalized_score: 95, environment_score: 99, social_score: 80, governance_score: 82, confidence: 89, methodology_gap: "Climate questionnaire methodology creates the highest normalized score", data_gap: "Value-chain emissions and supplier data are the main remaining uncertainty points", weighting_difference: "Environmental disclosure and transition execution carry dominant weight" },
  { company: "Schneider Electric", year: 2025, provider: "S&P CSA", raw_score: "88", normalized_score: 88, environment_score: 90, social_score: 83, governance_score: 88, confidence: 84, methodology_gap: "CSA rewards detailed practice evidence across ESG topics", data_gap: "Questionnaire completeness and evidence quality affect comparability", weighting_difference: "Weights are distributed across sector-specific climate, human capital, and governance topics" },
];

export const methodology: MethodologyRow[] = [
  { provider: "MSCI", scale: "CCC to AAA", risk_direction: "Higher is stronger", key_lens: "Industry-relative ESG risk exposure and management against financially material issues", known_gaps: "Peer-relative scoring can mask absolute performance gaps; proprietary controversy and exposure inputs affect repeatability", why_differ: "May rate a company highly when it manages sector-specific risks better than peers even if other providers see disclosure gaps", typical_weighting: "Governance controls, sector materiality, controversy management, climate risk exposure" },
  { provider: "Sustainalytics", scale: "0 to 100 ESG Risk Score", risk_direction: "Lower raw risk is stronger", key_lens: "Unmanaged financially material ESG risk after considering exposure and management", known_gaps: "Raw score direction is opposite most scorecards; exposure estimates can dominate company-level disclosure improvements", why_differ: "Can trail disclosure-led providers when residual risk exposure remains high despite strong policies", typical_weighting: "Exposure, management gap, event risk, financially material ESG issues" },
  { provider: "CDP", scale: "D- to A", risk_direction: "Higher is stronger", key_lens: "Climate, water, forests, and supply-chain disclosure quality and environmental performance", known_gaps: "Focus is narrower than broad ESG; non-environmental governance or social topics are secondary or absent", why_differ: "Can score higher than broad ESG frameworks for companies with mature climate disclosure and targets", typical_weighting: "Environmental disclosure depth, emissions management, targets, transition planning" },
  { provider: "S&P CSA", scale: "0 to 100", risk_direction: "Higher is stronger", key_lens: "Corporate Sustainability Assessment questionnaire with industry-specific ESG practices", known_gaps: "Scores depend on questionnaire evidence, documentation quality, and industry question set", why_differ: "Can diverge from public-data providers when survey responses reveal more detail than filings alone", typical_weighting: "Sector materiality, environmental practices, labor and human capital, governance, innovation" },
];
