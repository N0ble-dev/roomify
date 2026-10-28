# Roomify

**From 2D floor plans to photorealistic 3D interiors.**

Roomify is an interior design SaaS project focused on turning flat floor plans into compelling visualizations of finished spaces. Its goal is to help interior designers, architects, real estate professionals, and homeowners communicate design ideas and explore how a space could look before bringing it to life.

The planned rendering pipeline uses serverless workers to process generation tasks independently of the web application.

> **Project status:** Early development. This repository currently contains the React application foundation, shared UI components, styling, and Docker configuration. Floor plan uploads, photorealistic rendering, and serverless worker integration are planned capabilities.

## Product Vision

- **2D-to-3D visualization** — Transform floor plans into three-dimensional interior imagery that makes layouts easier to understand.
- **Photorealistic rendering** — Generate interior visuals that convey materials, lighting, and the atmosphere of a space.
- **Serverless processing** — Run rendering jobs in background workers so the application can stay responsive during generation.
- **A guided design workflow** — Bring plan submission, generation progress, and result review into one experience.

These capabilities describe the intended product; the end-to-end workflow is not yet implemented.

## Planned Workflow

1. **Submit a floor plan.** Provide a 2D layout as the starting point for a visualization.
2. **Request a render.** Send the plan to the processing pipeline.
3. **Generate the visualization.** A serverless worker handles the rendering task in the background.
4. **Review the result.** View the generated interior visualization in the application.

The intended processing flow is:

```text
2D Floor Plan
      |
      v
Roomify Web App
      |
      v
Render Job Submission
      |
      v
Serverless Worker --> Rendering Service
      |
      v
Generated Image Storage
      |
      v
Result Preview
```

The worker runtime, rendering provider, job coordination, and storage integration have not yet been configured in this repository.

## Technology Stack

| Layer | Technology |
| --- | --- |
| User interface | React 19 |
| Application framework | React Router 8 with server-side rendering enabled |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| Development and builds | Vite 8 |
| Icons | Lucide React |
| Application runtime | Node.js |
| Containerization | Docker with a multi-stage Node.js 24 Alpine build |
| Background rendering | Planned serverless workers |

## Getting Started

### Prerequisites

- Node.js 24, matching the included Docker image.
- npm.

### Install and Run

From the project directory, install the locked dependencies:

```bash
npm ci
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). If that port is occupied, use the address printed in the terminal.

The current home route is a placeholder and renders an empty page. Running the application starts the frontend foundation; the design workflow will become available as its features are implemented.

### Configuration

The current application does not require environment variables. Rendering credentials and worker endpoints will need to be documented when those integrations are added.

## Available Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server with hot module replacement. |
| `npm run build` | Create the production client and server bundles. |
| `npm start` | Serve the production build. Requires a successful build first. |
| `npm run typecheck` | Generate React Router types and run the TypeScript compiler. |

## Project Structure

```text
roomify/
|-- app/
|   |-- routes/
|   |   `-- home.tsx          # Home route placeholder
|   |-- app.css              # Theme, global styles, and component styles
|   |-- root.tsx             # Document layout and route error boundary
|   `-- routes.ts            # Route definitions
|-- components/
|   |-- ui/
|   |   `-- Button.tsx       # Shared button component
|   `-- Navbar.tsx           # Navigation component with authentication hooks
|-- public/                  # Static assets
|-- Dockerfile               # Multi-stage application image
|-- package.json             # Dependencies and npm scripts
|-- react-router.config.ts   # Framework configuration
|-- tsconfig.json            # TypeScript configuration
`-- vite.config.ts           # Build and styling plugins
```

## Production Deployment

### Node.js

Build the application, then start the production server:

```bash
npm run build
npm start
```

The build produces static assets in `build/client` and server code in `build/server`. The start script serves the application using `build/server/index.js`.

### Docker

Build the included application image:

```bash
docker build -t roomify .
```

Run the container:

```bash
docker run --rm -p 3000:3000 roomify
```

Open [http://localhost:3000](http://localhost:3000).

This image packages the web application. Serverless rendering workers will require their own deployment configuration when implemented.

## Roadmap

- [ ] Build the landing page and floor plan upload experience.
- [ ] Complete authentication and connect it to the application.
- [ ] Integrate a rendering provider for 2D-to-3D interior visualization.
- [ ] Implement serverless workers for background rendering jobs.
- [ ] Add job status updates and generation error handling.
- [ ] Store source plans and generated visualizations.
- [ ] Build a result preview and project history experience.
