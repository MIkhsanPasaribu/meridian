import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main(): Promise<void> {
  console.log("🌱 Seeding database...")

  // Seed regulatory frameworks
  await prisma.regulatoryFramework.upsert({
    where: { code: "CSDDD" },
    update: {},
    create: {
      code: "CSDDD",
      name: "EU Corporate Sustainability Due Diligence Directive",
      jurisdiction: "European Union",
      appliesTo: "Companies with >500 employees and >150M EUR turnover",
      reportFormat: "EFRAG CSRD standard",
      requiredFields: [
        "adverse_impact_identification",
        "due_diligence_process",
        "remediation_plan",
        "grievance_mechanism",
      ],
    },
  })

  await prisma.regulatoryFramework.upsert({
    where: { code: "UFLPA" },
    update: {},
    create: {
      code: "UFLPA",
      name: "Uyghur Forced Labor Prevention Act",
      jurisdiction: "United States",
      appliesTo: "All imports into the US",
      reportFormat: "US CBP (Customs and Border Protection)",
      requiredFields: [
        "supply_chain_traceability",
        "due_diligence_evidence",
        "rebuttable_presumption_documentation",
      ],
    },
  })

  await prisma.regulatoryFramework.upsert({
    where: { code: "LkSG" },
    update: {},
    create: {
      code: "LkSG",
      name: "Lieferkettensorgfaltspflichtengesetz",
      jurisdiction: "Germany",
      appliesTo: "Companies with >1000 employees operating in Germany",
      reportFormat: "BAFA (Bundesamt fuer Wirtschaft und Ausfuhrkontrolle)",
      requiredFields: [
        "risk_management_process",
        "preventive_measures",
        "remediation_measures",
        "complaint_procedure",
      ],
    },
  })

  // Seed demo organization and user
  const passwordHash = await bcrypt.hash("Demo@1234", 12)

  const org = await prisma.organization.upsert({
    where: { slug: "demo-corp" },
    update: {},
    create: {
      name: "Demo Corporation",
      slug: "demo-corp",
      industry: "Manufacturing",
      size: "1000+",
      country: "US",
    },
  })

  const user = await prisma.user.upsert({
    where: { email: "demo@meridian.ai" },
    update: {},
    create: {
      email: "demo@meridian.ai",
      passwordHash,
      firstName: "Demo",
      lastName: "User",
      role: "ADMIN",
    },
  })

  await prisma.membership.upsert({
    where: { userId_organizationId: { userId: user.id, organizationId: org.id } },
    update: {},
    create: {
      userId: user.id,
      organizationId: org.id,
      role: "ADMIN",
    },
  })

  await prisma.organizationSettings.upsert({
    where: { organizationId: org.id },
    update: {},
    create: { organizationId: org.id },
  })

  // Seed demo suppliers
  const suppliers = [
    { name: "Shenzhen Electronics Co.", country: "CN", industry: "Electronics" },
    { name: "Vietnam Textile Group", country: "VN", industry: "Textiles" },
    { name: "Bangladesh Garments Ltd.", country: "BD", industry: "Apparel" },
    { name: "Indonesia Palm Oil Corp.", country: "ID", industry: "Agriculture" },
  ]

  for (const s of suppliers) {
    const supplier = await prisma.supplier.upsert({
      where: { id: `demo-${s.country.toLowerCase()}-${s.industry.toLowerCase().replace(/\s/g, "-")}` },
      update: {},
      create: {
        id: `demo-${s.country.toLowerCase()}-${s.industry.toLowerCase().replace(/\s/g, "-")}`,
        organizationId: org.id,
        name: s.name,
        country: s.country,
        industry: s.industry,
        tier: 1,
      },
    })

    await prisma.monitoringConfig.upsert({
      where: { supplierId: supplier.id },
      update: {},
      create: {
        supplierId: supplier.id,
        frequency: "daily",
        targetLanguages: ["en", "zh"],
        isActive: true,
      },
    })

    // Seed demo VVS readings
    const scores = [15, 18, 22, 28, 35, 42, 38, 45, 52, 48]
    for (let i = 0; i < scores.length; i++) {
      const score = scores[i]
      const stage = score <= 25 ? "MURMUR" : score <= 50 ? "RIPPLE" : score <= 75 ? "WAVE" : "SURGE"
      await prisma.vvsReading.create({
        data: {
          supplierId: supplier.id,
          score,
          stage: stage as "MURMUR" | "RIPPLE" | "WAVE" | "SURGE",
          delta: i > 0 ? score - scores[i - 1] : 0,
          signalCount: Math.floor(score / 5),
          recordedAt: new Date(Date.now() - (scores.length - i) * 24 * 60 * 60 * 1000),
        },
      })
    }
  }

  console.log("✅ Database seeded successfully")
  console.log("📧 Demo login: demo@meridian.ai / Demo@1234")
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
