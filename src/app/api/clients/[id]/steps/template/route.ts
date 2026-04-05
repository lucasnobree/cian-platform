import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function cl(items: string[]) {
  return items.map((text, i) => ({ id: `item-${i}`, text, checked: false }));
}

const DEFAULT_STEPS = [
  {
    name: "Contrato",
    sortOrder: 0,
    checklist: cl(["Briefing", "Pagamento - 1ª parcela", "Pagamento - 2ª parcela", "Moodboard", "Paleta de cores", "Tipografia"]),
  },
  {
    name: "Briefing",
    sortOrder: 1,
    checklist: cl(["Questionário enviado", "Questionário respondido", "Referências visuais recebidas", "Reunião de alinhamento"]),
  },
  {
    name: "Tipografia + Paleta + Monograma + Ícone",
    sortOrder: 2,
    checklist: cl(["Tipografia", "Monograma", "Logotipo", "Paleta de cores", "Ícone", "Aprovação do casal"]),
  },
  {
    name: "Save the Date",
    sortOrder: 3,
    checklist: cl(["Criação", "Revisão", "Aprovação", "Envio"]),
  },
  {
    name: "Ilustração",
    sortOrder: 4,
    checklist: cl(["Rascunho", "Colorização", "Revisão", "Aprovação"]),
  },
  {
    name: "Site",
    sortOrder: 5,
    checklist: cl(["Layout", "Conteúdo", "RSVP configurado", "Lista de presentes", "Teste mobile", "Publicação"]),
  },
  {
    name: "Convite Digital",
    sortOrder: 6,
    requiresStepIndex: 2,
    checklist: cl(["Criação", "Revisão", "Aprovação", "Envio"]),
  },
  {
    name: "Papelaria",
    sortOrder: 7,
    requiresStepIndex: 2,
    checklist: cl(["Menu comida", "Menu drinks", "Lágrimas de alegria", "Placa de mesa", "Tag de bem-casado", "Aprovação gráfica"]),
  },
  {
    name: "Desdobramentos",
    sortOrder: 8,
    checklist: cl(["Artes para redes sociais", "Material para gráfica", "Entrega final"]),
  },
];

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const client = await prisma.client.findUnique({ where: { id }, select: { id: true } });
    if (!client) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
    }

    const existingCount = await prisma.projectStep.count({ where: { clientId: id } });
    if (existingCount > 0) {
      return NextResponse.json(
        { error: "Este cliente já possui etapas cadastradas" },
        { status: 409 }
      );
    }

    // Create steps
    const createdSteps = [];
    for (const step of DEFAULT_STEPS) {
      const created = await prisma.projectStep.create({
        data: {
          clientId: id,
          name: step.name,
          sortOrder: step.sortOrder,
          checklist: step.checklist,
        },
      });
      createdSteps.push(created);
    }

    // Set requiresStep references
    for (const step of DEFAULT_STEPS) {
      if (step.requiresStepIndex !== undefined) {
        const targetStep = createdSteps[step.requiresStepIndex];
        const currentStep = createdSteps[step.sortOrder];
        if (targetStep && currentStep) {
          await prisma.projectStep.update({
            where: { id: currentStep.id },
            data: { requiresStep: targetStep.id },
          });
          currentStep.requiresStep = targetStep.id;
        }
      }
    }

    return NextResponse.json(createdSteps, { status: 201 });
  } catch (error) {
    console.error("[POST /api/clients/[id]/steps/template]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
