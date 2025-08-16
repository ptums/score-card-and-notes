# Upcoming Features

## Tech

### FE

- Putter feature third
- Rating forth - slider
- Selection screen
- **Lightweight PWA** - Core offline functionality only
- User management screen
- Speed Insights - https://vercel.com/docs/speed-insights/quickstart#add-the-speedinsights-component-to-your-app

### BE

- Online BE sync
- Setup https://render.com/

### Mobile

- Port over to React Native

## AI

- Once BE sync is live: creat an mcp that syncs with open ai

## Future

- Handicap calculator/send in to handicap service

## PWA Strategy

### Core Offline Features (Essential)

- ✅ Score Entry & Game Management - Users can continue scoring even offline
- ✅ Course Data - Basic course information cached
- ✅ Game History - View past games offline
- ✅ Basic UI - Core app interface works offline
- ✅ Lightweight caching - Only essential resources cached

### Online-Only Features (Keep as Web)

- 🔔 Push Notifications - Nice to have, but not critical
- 🔄 Data Sync - Future backend integration
- 📊 Advanced Analytics - Handicap calculations, etc.
- 🌐 Full offline mode - Not needed for core functionality

### Benefits of Lightweight Approach

- Faster app loading
- Smaller cache footprint
- Easier maintenance
- Better performance
- Focus on what users actually need offline

Contract-first APIs: OpenAPI + orval / tRPC + ts-proto → fewer mismatches, easier AI codegen.
