import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

// GET - Buscar configurações públicas
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const identificador = searchParams.get("id");

    // Cache headers
    const headers = {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    };

    if (identificador) {
      // Buscar configuração específica por ID
      const { data, error } = await supabase
        .from("configuracoes")
        .select("*")
        .eq("identificador", identificador)
        .eq("ativo", true)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return NextResponse.json(
            { error: "Configuração não encontrada" },
            { status: 404 }
          );
        }
        throw error;
      }

      return NextResponse.json({ configuracao: data }, { headers });
    } else {
      // Buscar todas as configurações ativas
      const { data, error } = await supabase
        .from("configuracoes")
        .select("*")
        .eq("ativo", true)
        .order("ordem", { ascending: true });

      if (error) throw error;

      return NextResponse.json({ configuracoes: data || [] }, { headers });
    }
  } catch (error) {
    console.error("Erro na API configuracoes:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// POST - Criar nova configuração (admin apenas)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      identificador,
      titulo,
      texto,
      descricao,
      tipo,
      categoria,
      ativo = true,
      ordem = 0,
    } = body;

    // Validações
    if (!identificador || !titulo) {
      return NextResponse.json(
        { error: "Identificador e título são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se identificador já existe
    const { data: existente } = await supabase
      .from("configuracoes")
      .select("id")
      .eq("identificador", identificador)
      .single();

    if (existente) {
      return NextResponse.json(
        { error: "Já existe uma configuração com este identificador" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("configuracoes")
      .insert([
        {
          identificador: identificador
            .toLowerCase()
            .replace(/[^a-z0-9_-]/g, ""),
          titulo,
          texto: texto || null,
          descricao: descricao || null,
          tipo: tipo || "texto",
          categoria: categoria || "geral",
          ativo,
          ordem,
        },
      ])
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Identificador já existe" },
          { status: 400 }
        );
      }
      throw error;
    }

    return NextResponse.json(
      { message: "Configuração criada com sucesso", configuracao: data },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao criar configuração:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar configuração (admin apenas)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, titulo, texto, descricao, tipo, categoria, ativo, ordem } =
      body;

    if (!id) {
      return NextResponse.json(
        { error: "ID da configuração é obrigatório" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("configuracoes")
      .update({
        titulo,
        texto: texto || null,
        descricao: descricao || null,
        tipo: tipo || "texto",
        categoria: categoria || "geral",
        ativo,
        ordem,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Configuração não encontrada" },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json({
      message: "Configuração atualizada com sucesso",
      configuracao: data,
    });
  } catch (error) {
    console.error("Erro ao atualizar configuração:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// DELETE - Deletar configuração (admin apenas)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID da configuração é obrigatório" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("configuracoes")
      .delete()
      .eq("id", id);

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Configuração não encontrada" },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json({
      message: "Configuração deletada com sucesso",
    });
  } catch (error) {
    console.error("Erro ao deletar configuração:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
