# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Development
- `npm run dev` - Start development server (runs both client and server)
- `npm run typecheck` - Run TypeScript type checking
- `npm run typecheck:server` - Run TypeScript type checking for server only
- `npm run check` - Run TypeScript compiler check

### Build & Deploy
- `npm run build` - Build complete application (client + server)
- `npm run build:client` - Build client only with Vite
- `npm run build:server` - Build server only with esbuild
- `npm run start` - Start production server
- `npm run postinstall` - Automatically runs build after install

### Database
- `npm run db:push` - Push database schema with Drizzle Kit

## Architecture Overview

### Project Structure
This is a full-stack React application with Express backend for Chef Amélie Dupont's recipe quiz and sales funnel:

- **Client**: React + TypeScript frontend built with Vite
- **Server**: Express + TypeScript backend with visitor tracking and Hotmart integration
- **Shared**: Common schemas and types using Zod
- **Database**: Uses Drizzle ORM with PostgreSQL (Neon)

### Key Components

#### Frontend (`/client`)
- **React Router**: Using Wouter for client-side routing
- **UI Components**: Extensive use of Radix UI components with custom styling
- **Visitor Tracking**: React hook-based tracking system with Facebook Pixel integration
- **Quiz System**: Multi-step quiz with progress tracking and personalized results

#### Backend (`/server`)
- **Express API**: RESTful endpoints for visitor tracking and Hotmart integration
- **Webhook System**: Processes Hotmart purchase webhooks for sales matching
- **Data Matching**: Sophisticated algorithm to match visitors with sales using location, timing, and device data
- **CAPI Integration**: Facebook Conversions API for improved tracking accuracy

### Special Features

#### Visitor Tracking System
- Uses IP geolocation APIs (apiip.net) for location data
- Collects UTM parameters, device info, and user behavior
- Stores data temporarily in memory for matching with sales
- Implements fallback mechanisms for API failures

#### Hotmart Integration
- Webhook endpoint for real-time sales notifications
- Advanced matching algorithm using multiple data points (location, timing, device)
- Automatic conversion tracking via Facebook CAPI
- Debug endpoints for monitoring matches and system health

#### File Organization
- **Components**: Organized by domain (quiz, recipe, layout, ui, debug)
- **Hooks**: Custom React hooks for business logic
- **Types**: TypeScript definitions for type safety
- **Assets**: Images organized by category (chef, recipes, testimonials, etc.)

### Configuration Files
- **vite.config.ts**: Vite configuration with React plugin
- **tailwind.config.ts**: Tailwind CSS configuration
- **tsconfig.json**: TypeScript configuration with path aliases
- **drizzle.config.ts**: Database configuration
- **components.json**: shadcn/ui component configuration

### Path Aliases
- `@/*` maps to `./client/src/*`
- `@shared/*` maps to `./shared/*`

### Development Notes
- Uses Node.js 18.x
- Hot reload available in development mode
- Comprehensive TypeScript coverage
- Extensive logging for debugging webhooks and data matching
- Memory-based storage for visitor data (should be replaced with database in production)

### Important Files to Review
- `server/routes.ts` - All API endpoints and webhook handlers
- `server/config/hotmart.ts` - Hotmart API integration and matching logic
- `client/src/hooks/useVisitorTracking.ts` - Main visitor tracking hook
- `client/src/contexts/VisitorTrackingContext.tsx` - Global tracking context
- `client/src/components/quiz/QuizApp.tsx` - Main quiz component