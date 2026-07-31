# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Portfolio/showcase website built with Next.js 16 (App Router), React 19, TypeScript, and Tailwind CSS v4. Content is in Spanish (lang="es").

## Commands

```bash
npm run dev    # Start dev server
npm run build  # Production build
npm run lint   # ESLint
npm start      # Start production server
```

No test framework is configured.

## Architecture

- **App Router** (`app/`): Pages and layouts using React Server Components by default
- **Components** (`components/ui/`): Reusable UI components, client components marked with `"use client"`
- **Lib** (`lib/utils.ts`): `cn()` utility combining `clsx` + `tailwind-merge` for class merging
- **Public** (`public/projects/`): Static assets (project thumbnails)

## UI & Styling

- **Tailwind CSS v4** with CSS variables (OKLCH color space, neutral base)
- **shadcn/ui** (new-york style) + **Aceternity UI** registry for components
- **motion** (Framer Motion v5+) for animations — uses `useScroll`, `useTransform`, `useSpring`
- **lucide-react** for icons
- Dark mode via `.dark` class; theme colors defined as CSS variables in `globals.css`

## Key Conventions

- Path alias: `@/*` maps to project root
- shadcn/ui aliases: `@/ui` → `components/ui`, `@/utils` → `lib/utils`, `@/hooks` → `hooks`
- Components export PascalCase, accept typed props
- Prefer Server Components; only use `"use client"` when interactivity requires it
- Product data shape: `{ title: string; link: string; thumbnail: string }`
