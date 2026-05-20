# Bolão da Copa 2026

App web pronto para subir gratuitamente na Vercel.

## Como rodar localmente

```bash
npm install
npm run dev
```

## Como publicar na Vercel

1. Crie uma conta no GitHub.
2. Crie um repositório novo.
3. Envie todos os arquivos deste projeto para o repositório.
4. Acesse vercel.com e clique em **Add New Project**.
5. Conecte o repositório.
6. Clique em **Deploy**.

## Ajustes importantes antes de publicar

No arquivo `src/main.jsx`, troque:

- `PIX_KEY` pela sua chave Pix real.
- `ADMIN_PASSWORD` por uma senha sua.

## Atenção

Esta versão salva os dados no navegador de cada pessoa usando LocalStorage.
Para todos acessarem e verem o mesmo ranking em tempo real, conecte Firebase/Firestore.
