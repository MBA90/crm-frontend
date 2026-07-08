import type { CrmState } from "@/types";

function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString();
}

export function buildSeed(): CrmState {
  const companies = [
    { id: "co_1", name: "Northwind Labs", industry: "Biotech", website: "northwindlabs.com", size: "51-200", location: "Boston, MA", createdAt: daysFromNow(-120) },
    { id: "co_2", name: "Helios Freight", industry: "Logistics", website: "heliosfreight.com", size: "201-500", location: "Rotterdam, NL", createdAt: daysFromNow(-96) },
    { id: "co_3", name: "Marlowe & Fisk", industry: "Legal", website: "marlowefisk.com", size: "11-50", location: "London, UK", createdAt: daysFromNow(-78) },
    { id: "co_4", name: "Cobalt Studios", industry: "Media", website: "cobaltstudios.io", size: "11-50", location: "Austin, TX", createdAt: daysFromNow(-64) },
    { id: "co_5", name: "Verdant Grocers", industry: "Retail", website: "verdant.co", size: "501-1000", location: "Lyon, FR", createdAt: daysFromNow(-52) },
    { id: "co_6", name: "Atlas Robotics", industry: "Manufacturing", website: "atlasrobotics.com", size: "201-500", location: "Nagoya, JP", createdAt: daysFromNow(-40) },
  ];

  const contacts = [
    { id: "ct_1", firstName: "Priya", lastName: "Nadkarni", email: "priya@northwindlabs.com", phone: "+1 617 555 0102", title: "VP Research", companyId: "co_1", status: "active" as const, tags: ["decision-maker", "champion"], notes: "Prefers async updates. Renewal in Q3.", createdAt: daysFromNow(-110) },
    { id: "ct_2", firstName: "Diederik", lastName: "Vos", email: "d.vos@heliosfreight.com", phone: "+31 10 555 0143", title: "Head of Ops", companyId: "co_2", status: "active" as const, tags: ["technical"], notes: "Wants an API integration demo.", createdAt: daysFromNow(-92) },
    { id: "ct_3", firstName: "Eleanor", lastName: "Fisk", email: "eleanor@marlowefisk.com", phone: "+44 20 5550 118", title: "Managing Partner", companyId: "co_3", status: "lead" as const, tags: ["exec"], notes: "Cold outreach — replied positively.", createdAt: daysFromNow(-70) },
    { id: "ct_4", firstName: "Marcus", lastName: "Bell", email: "marcus@cobaltstudios.io", phone: "+1 512 555 0177", title: "Creative Director", companyId: "co_4", status: "active" as const, tags: ["influencer"], notes: "", createdAt: daysFromNow(-60) },
    { id: "ct_5", firstName: "Camille", lastName: "Roux", email: "c.roux@verdant.co", phone: "+33 4 5555 0190", title: "Procurement Lead", companyId: "co_5", status: "lead" as const, tags: ["budget-holder"], notes: "Evaluating three vendors.", createdAt: daysFromNow(-48) },
    { id: "ct_6", firstName: "Kenji", lastName: "Sato", email: "k.sato@atlasrobotics.com", phone: "+81 52 555 0166", title: "CTO", companyId: "co_6", status: "active" as const, tags: ["technical", "decision-maker"], notes: "Very hands-on. Wants a POC.", createdAt: daysFromNow(-36) },
    { id: "ct_7", firstName: "Ana", lastName: "Herrera", email: "ana.h@heliosfreight.com", phone: "+31 10 555 0155", title: "CFO", companyId: "co_2", status: "inactive" as const, tags: ["budget-holder"], notes: "On parental leave until next quarter.", createdAt: daysFromNow(-30) },
    { id: "ct_8", firstName: "Tom", lastName: "Okafor", email: "tom@northwindlabs.com", phone: "+1 617 555 0188", title: "Lab Manager", companyId: "co_1", status: "active" as const, tags: ["user"], notes: "", createdAt: daysFromNow(-22) },
  ];

  const deals = [
    { id: "dl_1", title: "Northwind — Platform expansion", value: 84000, stage: "negotiation" as const, probability: 75, contactId: "ct_1", companyId: "co_1", ownerName: "You", closeDate: daysFromNow(12), createdAt: daysFromNow(-40) },
    { id: "dl_2", title: "Helios — API integration", value: 42000, stage: "proposal" as const, probability: 55, contactId: "ct_2", companyId: "co_2", ownerName: "You", closeDate: daysFromNow(20), createdAt: daysFromNow(-34) },
    { id: "dl_3", title: "Marlowe & Fisk — Pilot", value: 18000, stage: "qualified" as const, probability: 30, contactId: "ct_3", companyId: "co_3", ownerName: "Dana", closeDate: daysFromNow(35), createdAt: daysFromNow(-28) },
    { id: "dl_4", title: "Cobalt — Team seats", value: 12500, stage: "lead" as const, probability: 10, contactId: "ct_4", companyId: "co_4", ownerName: "You", closeDate: daysFromNow(48), createdAt: daysFromNow(-18) },
    { id: "dl_5", title: "Verdant — Procurement suite", value: 96000, stage: "qualified" as const, probability: 30, contactId: "ct_5", companyId: "co_5", ownerName: "Dana", closeDate: daysFromNow(40), createdAt: daysFromNow(-16) },
    { id: "dl_6", title: "Atlas — POC + rollout", value: 128000, stage: "proposal" as const, probability: 55, contactId: "ct_6", companyId: "co_6", ownerName: "You", closeDate: daysFromNow(25), createdAt: daysFromNow(-14) },
    { id: "dl_7", title: "Northwind — Add-on modules", value: 21000, stage: "won" as const, probability: 100, contactId: "ct_8", companyId: "co_1", ownerName: "You", closeDate: daysFromNow(-3), createdAt: daysFromNow(-58) },
    { id: "dl_8", title: "Helios — Regional upsell", value: 30000, stage: "lost" as const, probability: 0, contactId: "ct_7", companyId: "co_2", ownerName: "Dana", closeDate: daysFromNow(-9), createdAt: daysFromNow(-62) },
  ];

  const tasks = [
    { id: "tk_1", title: "Send revised proposal to Priya", type: "email" as const, priority: "high" as const, dueDate: daysFromNow(0), done: false, relatedContactId: "ct_1", createdAt: daysFromNow(-2) },
    { id: "tk_2", title: "Discovery call with Kenji", type: "call" as const, priority: "high" as const, dueDate: daysFromNow(1), done: false, relatedContactId: "ct_6", createdAt: daysFromNow(-1) },
    { id: "tk_3", title: "Follow up on pilot terms", type: "email" as const, priority: "medium" as const, dueDate: daysFromNow(2), done: false, relatedContactId: "ct_3", createdAt: daysFromNow(-1) },
    { id: "tk_4", title: "Demo prep for Verdant", type: "meeting" as const, priority: "medium" as const, dueDate: daysFromNow(3), done: false, relatedContactId: "ct_5", createdAt: daysFromNow(-1) },
    { id: "tk_5", title: "Update CRM notes after Cobalt sync", type: "todo" as const, priority: "low" as const, dueDate: daysFromNow(-1), done: false, relatedContactId: "ct_4", createdAt: daysFromNow(-4) },
    { id: "tk_6", title: "Quarterly check-in with Tom", type: "call" as const, priority: "low" as const, dueDate: daysFromNow(6), done: true, relatedContactId: "ct_8", createdAt: daysFromNow(-8) },
  ];

  const activities = [
    { id: "ac_1", message: "Won deal “Northwind — Add-on modules” ($21,000)", kind: "deal" as const, timestamp: daysFromNow(-3) },
    { id: "ac_2", message: "Added contact Kenji Sato at Atlas Robotics", kind: "contact" as const, timestamp: daysFromNow(-2) },
    { id: "ac_3", message: "Moved “Atlas — POC + rollout” to Proposal", kind: "deal" as const, timestamp: daysFromNow(-1) },
    { id: "ac_4", message: "Completed task “Quarterly check-in with Tom”", kind: "task" as const, timestamp: daysFromNow(-1) },
    { id: "ac_5", message: "New company Verdant Grocers created", kind: "company" as const, timestamp: daysFromNow(-1) },
  ];

  return { companies, contacts, deals, tasks, activities };
}
