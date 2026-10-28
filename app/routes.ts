import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("vizsualizer/:id", "routes/vizsualizer.$id.tsx"),
] satisfies RouteConfig;
