#!/bin/bash

echo "🔍 Testando diferentes formatos de host..."

# Teste 1: Com db.
echo "1. Testando: db.slrkerlrcvntxynfjbyh.supabase.co"
ping -c 1 db.slrkerlrcvntxynfjbyh.supabase.co 2>&1 | head -2

echo ""
echo "2. Testando: slrkerlrcvntxynfjbyh.supabase.co"
ping -c 1 slrkerlrcvntxynfjbyh.supabase.co 2>&1 | head -2

echo ""
echo "💡 Verifique no painel do Supabase qual é o host correto!"
echo "   Settings → Database → Host"

