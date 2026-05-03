# Use Policy Agent for approvals

Source: https://support.ramp.com/hc/en-us/articles/47618318137875-Use-Policy-Agent-for-approvals

Once your agent-facing policy is published, Policy Agent can do more than recommend actions—it can also automatically approve clearly in-policy expenses. This article explains how recommendations work, how to add Policy Agent into approval workflows, how card-specific rules are enforced, and how existing flags interact with the agent.

Policy Agent starts in **review-only** mode. You decide when (and where) to turn on automations.

---

**Jump to:**

* [How recommendations work](#how-recommendations-work)
* [Add Policy Agent to approval workflows](#add-policy-agent-to-approval-workflows)
* [Configure auto-approval conditions](#configure-auto-approval-conditions)
* [Card-specific purchase requirements](#card-specific-purchase-requirements)
* [How reviewers interact with Policy Agent](#how-reviewers-interact-with-policy-agent)
* [Visibility settings](#visibility-settings)
* [Exclude Policy Agent from specific spend](#exclude-policy-agent-from-specific-spend)
* [How flags interact with Policy Agent](#flags-and-overrides)
* [Best practices for enabling approvals](#testing-before-full-rollout)

---

## How recommendations work

By default, Policy Agent **only recommends** actions. It does not auto-approve expenses until you explicitly add it to approval workflows.

Policy Agent produces three recommendation types:

1. **Approval recommended** – The expense clearly complies with your policy.
2. **Requires review** – The agent is uncertain, missing context, or your policy explicitly requires human review.
3. **Rejection recommended** – The agent identifies a clear policy violation.

In the UI (e.g., your homepage or review queues), expenses appear in two buckets:

* **Approval recommended**
* **Review recommended**

The **“Review recommended”** bucket includes both **Requires review** and **Rejection recommended** decisions so reviewers see everything needing attention in one place.

![Three expense entries showing statuses: approval recommended for U-Haul, requires review for La Peccora Bianca, and reject...](/hc/article_attachments/47618321661203)

Policy Agent uses full transaction context for these recommendations, including:

* Your agent-facing policy
* Merchant and transaction data
* Receipt OCR, memos, attendees, and trip details
* Custom fields (e.g., department, role, entity, office)
* **Card details** (card last 4, physical vs virtual, Spend Program)

When policy language is ambiguous, the agent leans **conservative** and surfaces more decisions as **Requires review** rather than risking an incorrect automatic approval.

---

## Add Policy Agent to approval workflows

To enable approvals (instead of just recommendations):

1. Go to **Policy → Expense reviews**
2. Select an existing approval workflow or create a new one
3. Add **Policy Agent** as a step in the workflow
4. Configure when the agent can auto-approve vs. when it should pass decisions to human reviewers

You can place Policy Agent at any step, including:

* As an early filter before managers review
* Between approvers in a multi-step chain
* As a final check to catch violations missed earlier

![Workflow settings on the Expense approvals page, configuring conditions for auto-approval based on expense type and amount.](/hc/article_attachments/47618321661843)

FAQ – How does Policy Agent fit into multi-layered or threshold-based workflows? You can add Policy Agent at any step in your approval workflow. It works with simple or complex chains, including threshold-based and department/entity-based approvals.

---

## Configure auto-approval conditions

You control exactly when Policy Agent is allowed to automatically approve expenses.

Common configurations in **Policy → Expense reviews** include:

* Auto-approve expenses **below a certain amount** (e.g., <$1,000)
* Auto-approve expenses for **specific Spend Programs**
* Auto-approve for certain **departments**, **roles**, or **entities**
* Auto-approve specific **merchants** or **categories** that are low risk
* Require human review for all **Requires review** or **Rejection recommended** decisions

Any expenses that do not meet your auto-approval conditions:

* Follow the rest of your configured workflow, or
* Go straight to human reviewers, depending on how you structure the steps

FAQ – Can Policy Agent be set to only recommend (not approve) in certain scenarios? Yes. By default, Policy Agent only suggests actions and does not auto-approve. You decide where (if at all) in your workflows it is allowed to approve versus only recommend.

---

## Card-specific purchase requirements

You can write rules that restrict certain purchases to **specific cards or Spend Programs**, and Policy Agent will enforce them based on card context.

### How to express card-specific rules

Write the rule in **plain English** and reference the **exact name** of the card or program as it appears in Ramp.

Examples:

* “Laptop accessories must be purchased on the `IT Procurement` virtual card. Purchases of laptop accessories on any other card are out-of-policy.”
* “Travel bookings must be made on cards in the `Travel` program. Personal cards or general corporate cards are not allowed.”

You can include entity or department exceptions within the same section, for example:

**Note:** “For the UK Entity, travel may also be booked on Travel Europe cards.”

### How the agent enforces these rules

To enforce these rules, Policy Agent evaluates:

* **Card last 4 digits**
* **Physical vs virtual card**
* **Associated Spend Program**

If your policy states that a purchase type **must** be made on specific cards or programs, and an expense is made on a different card:

* The agent will mark the expense as **Rejection recommended** or **Requires review**, depending on context and how clearly the policy is written.

FAQ – Will the agent flag a purchase made on the wrong card? Yes. If your policy specifies that a purchase type must be made on particular cards or programs, Policy Agent will flag purchases made on other cards as out-of-policy.

FAQ – Do I need workflows or flags to enforce card-specific rules? For assessments, policy text is sufficient. For automatic outcomes, pair your policy with workflows (and, if needed, a small number of deterministic flags) to ensure the right routing.

---

## How reviewers interact with Policy Agent

Even when Policy Agent is enabled for approvals, reviewers always have final authority.

Reviewers can:

* Approve or reject expenses, regardless of the agent’s recommendation
* Override incorrect approvals or rejections
* Request changes or repayment
* Provide thumbs up/down feedback on each agent decision

Each expense has an **activity feed** that shows:

* Policy Agent’s recommendation (Approval / Requires review / Rejection)
* The agent’s **rationale** and cited policy text
* Updated assessments after new information is added (e.g., receipt, memo)
* Reviewer overrides
* Thumbs up/down feedback
* Removed assessments
* The **policy version** used
* Exception decisions

![Activity feed displaying expense approvals, transaction updates, and policy recommendations in the Ramp platform.](/hc/article_attachments/47618318132243)

Feedback and overrides appear in the audit log and inform improvements in the system and insights in the policy editor.

---

## Visibility settings

Visibility controls who can see Policy Agent’s assessments—not whether they are generated.

In **Policy → Expense reviews**, you can configure visibility to:

* **Admins only** – Recommended during initial testing and rollout
* **All reviewers** – Recommended once you’re comfortable with the configuration (often within about a week)

FAQ – Can employees see Policy Agent’s assessments? No. Employees cannot see Policy Agent’s assessments. Only admins and reviewers can view them.

![Expenses page showing policy settings and options for manager review and policy agent suggestions.](/hc/article_attachments/47618318133779)

---

## Exclude Policy Agent from specific spend

In some cases, you may want to **exclude** certain spend from Policy Agent entirely—especially where strict policy enforcement isn’t needed.

### When to exclude

Exclusions are useful for:

* P-cards or non–T&E spend where strict enforcement may generate noise
* Intentionally flexible or low-risk programs where agent assessments are not necessary

### Levels of exclusion

You can exclude Policy Agent at three levels:

1. **Expense level**
   * Remove the agent’s assessment for a single expense
   * The agent will not reassess that expense
   * The expense is treated as if policy does not apply
2. **Spend Program level**
   * Configure certain Spend Programs so the agent does not assess expenses on those programs
3. **Fund / card level**
   * Exclude specific funds or cards from Policy Agent assessments

![Advanced settings for expense approval, including memo options and exemption from policy agent suggestions.](/hc/article_attachments/47618318134547)

These controls help you keep Policy Agent focused on the spend where enforcement and guidance matter most.

---

## Flags and overrides

Policy Agent works alongside your existing Ramp settings.

### Flags as hard overrides

* **Flags** (policy rules) are deterministic rules that can trigger notifications and be used to filter transactions.
* Today, **flags act as hard overrides** to Policy Agent:
  + If there is a conflict between a flag and the written policy, the **flag supersedes** the agent’s recommendation.

Recommended pattern:

* Move most policy logic into your **written policy document**, where Policy Agent can interpret nuance.
* Keep a **small set of receipt-related flags**, such as:
  + Duplicate receipt
  + AI-generated receipt
  + Receipt previously used

For other settings (e.g., spend controls, submission requirements), the main action is to ensure your **written policy matches your Ramp configuration**, so the agent and deterministic rules are aligned.

![Suggested flags section displaying ](/hc/article_attachments/47618321663507)

---

## Testing before full rollout

Policy Agent runs **only in production**, but you can test safely before rolling out to all reviewers or enabling auto-approvals.

Recommended testing workflow:

1. **Publish** your agent-facing policy
2. Set visibility to **Admins only** in **Policy → Expense reviews**
3. Let Policy Agent evaluate real expenses in review-only mode
4. Check assessments, citations, and reviewer alignment in:
   * The activity feed on expenses
   * The **Policy** overview page
   * The **Policy** report under **Insights → Reports → Policy**
5. Adjust policy language or workflows if needed
6. Expand visibility to **All reviewers**
7. Finally, add Policy Agent to workflows where you want it to auto-approve clearly in-policy spend

FAQ – Is there a way to test Policy Agent with real or sample transactions before going live? Policy Agent only runs in production. To test safely, keep visibility set to Admins only while you validate behavior and iterate on your policy.