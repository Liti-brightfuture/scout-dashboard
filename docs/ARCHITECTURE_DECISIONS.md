# Architecture Decisions

## Why Next.js-first

Scout ships as a single deployable application so the product story is easy to understand and the code remains navigable for recruiter review. Route handlers keep secrets server-side without introducing a second service too early.

## Why Zustand

The client only needs lightweight coordination for alerts, polling state, and a few UI concerns. Zustand keeps the mental model simple and avoids Redux boilerplate.

## Why Recharts

Recharts is sufficient for price and distribution dashboards with a smaller learning curve and bundle cost than more elaborate charting systems.

## Why react-force-graph-2d

The graph is a differentiator, but 3D does not add meaningful signal in the MVP. The 2D renderer keeps the experience interactive without the visual and bundle overhead of a 3D scene.

## Why no Birdeye

The free tier is too restrictive for the amount of live analysis Scout needs per token.

## Why no FastAPI in v1

The project needs one coherent story first. Heavy graph analytics or scheduled background processing can be extracted later if real usage justifies it.
