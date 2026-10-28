import Navbar from "../../components/Navbar";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Roomify | From Floor Plan to Photorealistic Interior" },
    {
      name: "description",
      content:
        "Explore Roomify, an interior design platform for transforming 2D floor plans into photorealistic 3D visualizations.",
    },
  ];
}

export default function Home() {
  return (<div className="home">
    <Navbar/>
  </div>);
}
