# Lead form field notes — Utah HVAC Connect

Brand: **Utah HVAC Connect**. Domain: **utahhvacconnect.com** (registered on Porkbun; live on GitHub Pages). Form lives in `quote.html` and persists leads to Supabase (`public.leads`) via the publishable anon key + REST insert.

Positioning: we are a **matchmaker** — we connect homeowners with licensed Utah HVAC shops. We do **not** give quotes or promise “compare quotes.” Pre-submit copy avoids “you’ll be called shortly”; post-submit success/thanks may say licensed pros in your area will reach out. TCPA call/text disclosure stays on the consent step only (explicit checkbox).

Adapted lightly from a Lendifi-style intake: enough for contractor matching and TCPA contact, without heavy PII.

---

## Fields we collect (by step)

### Step 1 — Service intent

| Field | Values | Why it exists |
|-------|--------|---------------|
| **Service type** (required) | repair / replace / install / tune-up / **unsure** (“I’m not sure”) | Primary routing signal. Contractors price and staff differently for emergency repair vs. full replace/install vs. maintenance. “Unsure” keeps fence-sitters in the funnel so shops can diagnose. |
| **Urgency** (required) | today / this week / planning | Separates hot leads from planners; supports exclusive/premium pricing later and sets contractor expectations. |

### Step 2 — Location & property context

| Field | Values | Why it exists |
|-------|--------|---------------|
| **ZIP** (required) | 5-digit | Match to contractor service areas; geo filter without collecting full street address upfront. |
| **City** (optional) | free text | Soft confirmation / display for contractors; ZIP remains the matching key. |
| **Homeowner?** (required) | Y / N | Landlords/tenants may not authorize work; shops prefer owner decisions. Still accept “No” so we can filter or price differently later. |
| **System age** (optional) | under 5 / 5–10 / 10–15 / 15+ / unsure | Helps replace vs. repair counseling; optional so we don’t block submitters who don’t know. |

### Step 3 — Contact (light PII)

| Field | Values | Why it exists |
|-------|--------|---------------|
| **First name** (required) | text | Personalize outreach. |
| **Last name** (required) | text | Identify the lead; pair with phone/email for dedupe later. |
| **Mobile** (required) | US phone | Primary TCPA channel (call/SMS). Validated client-side to 10 digits. |
| **Email** (required) | email | Backup channel + confirmation; useful if phone fails. |
| **Preferred contact window** (required) | morning / afternoon / evening | Respect homeowner schedule; reduces spammy feel; can be passed to contractors. |

### Step 4 — Consent

| Field | Values | Why it exists |
|-------|--------|---------------|
| **TCPA consent** (required checkbox) | soft but clear agree statement + link to privacy | Legal prerequisite for call/text by contractors. Explicit checkbox (not clickwrap-only). Softened wording; still states licensed contractors may call or text. “Consent is not a condition of purchase.” Msg/data rates notice included. |

---

## Deliberately omitted

We do **not** collect:

| Omitted | Reason |
|---------|--------|
| Date of birth | Irrelevant to HVAC matching; increases sensitivity / compliance burden. |
| Income / credit / employment | Not needed for contractor matching; looks like lending/insurance intake. |
| SSN / tax ID | Never appropriate for this product. |
| Payment / card / bank details | We don’t bill homeowners; no checkout on this funnel. |
| Utility account numbers | Unnecessary; feels invasive; some utilities treat as sensitive. |
| Full street address (at this stage) | ZIP is enough for draft matching; address can be collected by the contractor when scheduling. |
| Property value / square footage | Optional later if needed for install sizing — not required for lead handoff. |
| Number of stories / equipment brand | Nice-to-have enrichment; skip for conversion rate on v1. |

---

## Persistence (Supabase)

On submit, the page validates client-side, then `POST`s JSON to `${SUPABASE_URL}/rest/v1/leads` with the **anon** (publishable) key. RLS allows anon `INSERT` only when `tcpa_consent=true` (plus basic non-empty contact/ZIP checks).

| Form field | DB column | Notes |
|------------|-----------|-------|
| serviceType | service_type | repair \| replace \| install \| tune-up \| unsure |
| urgency | urgency | today \| this week \| planning |
| zip | zip | 5-digit |
| city | city | optional → null if blank |
| homeowner | homeowner | yes/no → boolean |
| systemAge | system_age | under 5 \| 5-10 \| 10-15 \| 15+ \| unsure \| null (en-dashes normalized to hyphens) |
| firstName / lastName | first_name / last_name | |
| mobile | mobile | normalized to 10-digit US |
| email | email | |
| contactWindow | contact_window | morning \| afternoon \| evening |
| tcpaConsent | tcpa_consent | must be true |
| (browser) | user_agent, referrer | optional |

On success: redirect to `thanks.html` (in-page success screen remains as fallback UI). On failure: show an error, keep form data, do not claim success. **Never** put a service_role key in the frontend.

---

## For Sam — field checklist (copy/paste)

1. Service type — repair | replace | install | tune-up | **unsure** (“I’m not sure”)  
2. Urgency — today | this week | planning  
3. ZIP (required)  
4. City (optional)  
5. Homeowner? — yes | no  
6. System age (optional) — under 5 | 5–10 | 10–15 | 15+ | unsure  
7. First name  
8. Last name  
9. Mobile  
10. Email  
11. Preferred contact window — morning | afternoon | evening  
12. TCPA consent checkbox (required; soft wording)

**Not on the form:** DOB, income, SSN, payment, utility account.
